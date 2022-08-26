/**
 * 退货回邮地址
 */

'use strict';

const db = uniCloud.database();
const dbCmd = db.command;

const addrDb = db.collection('mix-refund-address');


const modal = {
	/**
	 * 获取列表
	 * @param {Object} request
	 * @param {Number} request.offset
	 * @param {Number} request.limit 
	 */
	async getList(request){
		const {offset, limit} = request;
		const res = await addrDb
			.skip(offset)
			.limit(limit)
			.orderBy('add_time', 'desc')
			.get()
		
		const countData = await addrDb.count();
		res.affectedDocs = countData.total;
		return res;
	},
	/**
	 * 新增
	 * @param {Object} request
	 */
	async add(request){
		const data = Object.assign({
			add_time: + new Date()
		}, request);
		const res= await addrDb.add(data);
		return res.id ? {
			status: 1,
			msg: '添加成功'
		}: {
			status: 0,
			msg: '服务器内部错误'
		}
	},
	/**
	 * 修改
	 * @param {Object} request
	 */
	async update(request){
		const data = Object.assign({}, request, {
			update_time: + new Date(),
		});
		const id = request._id;
		delete data._id;
		const res= await addrDb.doc(id).set(data);
		return res.updated === 1 ? {
			status: 1,
			msg: '修改成功'
		} : {
			status: 0,
			msg: '服务器内部错误'
		}
	},
	/**
	 * 删除
	 * @param {Object} request
	 * id
	 */
	async remove(request){
		const res= await addrDb.doc(request.id).remove();
		return res.deleted === 1 ? {
			status: 1
		}: {
			status: 0,
			msg: res.message || '服务器内部错误'
		}
	},
	/**
	 * 启用|禁用
	 * @param {Object} request
	 * id
	 * status 0|1
	 */
	async setStatus(request){
		const {
			id, 
			status
		} = request;
		await addrDb.where({
			status: 1
		}).update({
			status: 0
		})
		const res = await addrDb.doc(request.id).update({
			status: + request.status
		});
		return res;
	}
}

module.exports = modal;