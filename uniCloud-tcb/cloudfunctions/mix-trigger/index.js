'use strict';
/**
 * 函数每10分钟自动执行一次
 */

const db = uniCloud.database();
const dbCmd = db.command;

/**
 * 批量处理库存
 * @param {Object} param 
 * @param {Array} param.products 处理产品数组
 *	_id
 *	sku_id
 * 	inc 负数时为减少
 * @return {Boolean} 处理结果
 */
const handleStock = async param=> {
	const products = JSON.parse(JSON.stringify(param.products));
	const curProduct = param.products[0];
	products.shift();

	//增加库存时，若商品或规格不存在直接跳过
	if (curProduct.inc > 0) {
		const proData = await db.collection('mix-product').doc(curProduct._id).get();
		const skuData = await db.collection('mix-sku').doc(curProduct.sku_id).get();
		if (proData.data.length === 0 || skuData.data.length === 0) {
			if (products.length > 0) {
				return await handleStock({
					products,
					constProducts: param.constProducts || param.products
				});
			}
			return true;
		}
	}
	const res = await db.collection('mix-product').doc(curProduct._id).update({
		stock: dbCmd.inc(curProduct.inc)
	})
	const res1 = await db.collection('mix-sku').doc(curProduct.sku_id).update({
		stock: dbCmd.inc(curProduct.inc)
	})
	if (res.updated === 0 || res1.updated === 0) {
		return false
	}

	if (products.length > 0) {
		return await handleStock({
			products,
			constProducts: param.constProducts || param.products
		});
	}
	return true;
}

/**
 * 更新商品销量
 * @param {Object} param 
 * @param {Array} param.ids 商品数组
 * @param {Number} param.number 更新量 若为负数则为减库存
 */
const handleSales = async param=> {
	const {ids, number} = param;
	const pid = ids[0];
	const productData = await db.collection('mix-product').doc(pid).get();
	if(productData.data.length === 1){
		const res = await db.collection('mix-product').doc(pid).update({
			sales: dbCmd.inc(number)
		})
		if(res.updated != 1){
			return false;
		}
	}
	ids.shift();
	if(ids.length > 0){
		return await handleSales({
			ids,
			number
		})
	}
	return true;
}

exports.main = async (event, context) => {
	/**
	 * 订单自动取消
	 * 30分钟未支付时自动取消订单
	 */
	const cancelOrders = await db.collection('mix-order').where({
			status: 0,
			pay_status: 0,
			add_time: dbCmd.lt(+ new Date - 30*60*1000)
		}).limit(200).get();
	
	for(let order of cancelOrders.data){
		if (order.status !== 0) continue;
		//返还商品库存
		let res = await handleStock({
			products: order.products.map(item => {
				return {
					_id: item.sku.product_id,
					sku_id: item.sku._id,
					inc: item.number
				}
			})
		});
		if(!res) continue;
		//返还优惠券
		if(order.price_data.coupon_id){
			res = await db.collection('mix-user-coupon').doc(order.price_data.coupon_id).update({
				is_use: 0
			})
		}
		let timeline = order.timeline;
		timeline.unshift({
			time: +new Date(),
			title: '订单已取消',
			tip: '用户未及时支付，订单自动取消',
			type: '取消订单'
		})
		await db.collection('mix-order')
			.doc(order._id)
			.update({
				status: 10,
				status_tip: '用户未及时支付，订单自动取消',
				timeline
			})
	}
	
	/**
	 * 订单自动确认收货
	 * 15天未确认收货时自动确认收货
	 */
	const confirmOrders = await db.collection('mix-order').where({
			status: 2,
			express_time: dbCmd.lt(+ new Date - 15*24*60*60*1000)
		}).limit(200).get();
	for(let order of confirmOrders.data){
		if (order.status !== 2) continue;
		let timeline = order.timeline;
		timeline.unshift({
			time: +new Date(),
			title: '已确认收货',
			tip: '用户未及时确认收货，系统自动确认',
			type: '确认收货'
		})
		let res = await db.collection('mix-order')
			.doc(order._id)
			.update({
				status: 3,
				status_tip: '宝贝用的怎么样，来评价一下吧~',
				timeline
			})
		if(res.updated !== 1) continue;
		//更新用户消费金额
		await db.collection('mix-uni-id-users').doc(order.uid).update({
			consumption: dbCmd.inc(order.price_data.pay_price)
		})
		//发放佣金
		let logArr = [];
		if(order.inviter_user_lv1){
			res = await db.collection('mix-uni-id-users').doc(order.inviter_user_lv1).update({
				money: db.command.inc(+order.commission_lv1),
				commission: db.command.inc(+order.commission_lv1)
			})
			logArr.push({
				uid: order.inviter_user_lv1,
				title: '直推佣金发放', 
				type: 'commission',
				add_time: + new Date,
				money: +order.commission_lv1,
				pay_type: 'system'
			})
		}
		if(order.inviter_user_lv2){
			await db.collection('mix-uni-id-users').doc(order.inviter_user_lv2).update({
				money: db.command.inc(+order.commission_lv2),
				commission: db.command.inc(+order.commission_lv2)
			})
			logArr.push({
				uid: order.inviter_user_lv2,
				title: '间推佣金发放', 
				type: 'commission',
				add_time: + new Date,
				money: +order.commission_lv2,
				pay_type: 'system'
			})
		}
		//记录佣金流水
		if(logArr.length > 0){
			await db.collection('mix-money-log').add(logArr);
		}
		//更新商品销量
		const ids = order.products.map(item=> item.sku.product_id);
		res = await handleSales({
			ids, //Array.from(new Set([...ids])) 这里不能去重，不同规格同商品需要多次更新，也可以检测有几个相同的直接更新几
			number: 1
		})
	}
	
	return event
};
