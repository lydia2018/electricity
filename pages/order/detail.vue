<template>
	<view class="app">
		<view class="main-wrap" :class="{show: loaded}">
			<view class="state-wrap column">
				<view class="row" @click="showPopup('timelinePopup')">
					<text class="state">{{ data.statusText }}</text>
					<text v-if="data.timeline" class="mix-icon icon-you"></text>
				</view>
				<text v-if="data.status_tip" class="tip">{{ data.status_tip }}</text>
			</view>
			<!-- 物流信息 -->
			<view v-if="expressInfo.context && data.status===2" class="addr-sec wl" @click="navToExpress(data)">
				<text class="mix-icon icon-wuliuyunshu"></text>
				<view class="con column">
					<text class="context">{{ expressInfo.context }}</text>
					<text class="time">{{ expressInfo.ftime }}</text>
				</view>
				<text class="mix-icon icon-you"></text>
			</view>
			<!-- 地址 -->
			<view class="addr-sec">
				<text class="mix-icon icon-dizhi"></text>
				<view class="con column">
					<text class="addr">{{ addr.address.address }} {{ addr.address.room }}</text>
					<text class="name">{{ addr.name }} {{ addr.mobile }}</text>
				</view>
			</view>
			<!-- 商品 -->
			<view v-if="data.products.length > 0" class="goods-sec">
				<product-list :list="data.products"></product-list>
			</view>
			<!-- 价格信息 -->
			<view class="price-sec">
				<view class="cell row">
					<text class="tit fill">商品金额</text>
					<text>￥{{ data.price_data.goods_price || 0 }}</text>
				</view>
				<view class="cell row">
					<text class="tag">满</text>
					<text class="tit fill">订单满减</text>
					<text>-￥{{ data.price_data.full_reduction_money || 0 }}</text>
				</view>
				<view class="cell row">
					<text class="tag red">券</text>
					<text class="tit fill">优惠券</text>
					<text>-￥{{ data.price_data.coupon_money || 0 }}</text>
				</view>
				<view class="cell row">
					<text class="tit fill">配送费</text>
					<text>￥0</text>
				</view>
				<view class="total row b-t">
					<text class="price">￥{{ data.price_data.pay_price || 0 }}</text>
				</view>
			</view>
			<view class="board">
				<view class="cell">
					<text class="tit">订单编号：</text>
					<text class="text">{{ data.order_number || '' }}</text>
					<view class="copy-btn center round" @click="copy(data.order_number)">
						<text>复制</text>
					</view>
				</view>
				<view class="cell">
					<text class="tit">下单时间：</text>
					<text class="text">{{ data.add_time | date('Y-m-d H:i:s') }}</text>
				</view>
				<view v-if="data.pay_type" class="cell">
					<text class="tit">支付方式：</text>
					<text class="text">{{ data.pay_type==='wxpay'?'微信支付':data.pay_type==='alipay'?'支付宝支付':'余额支付' }}</text>
				</view>
				<view v-if="data.remarks" class="cell">
					<text class="tit">订单备注：</text>
					<text class="text">{{ data.remarks }}</text>
				</view>
				<view v-if="data.express_info && data.express_info.name && data.logistic_code" class="cell">
					<text class="tit">配送方式：</text>
					<text class="text">{{ data.express_info.name }}</text>
				</view>
				<view v-if="data.express_info && data.express_info.name && data.logistic_code" class="cell">
					<text class="tit">快递单号：</text>
					<text class="text">{{ data.logistic_code }}</text>
					<view class="copy-btn center round" @click="copy(data.logistic_code)">
						<text>复制</text>
					</view>
				</view>
			</view>
			
			<view class="bottom-fill-view"></view>
			<view class="page-bottom row">
				<view v-if="data.status===4 || data.status===10 || data.status===11" class="btn center round" @click="deleteOrder(data)">
					<text>删除订单</text>
				</view>
				<view v-if="data.status===0" class="btn center round" @click="cancelOrder(data)">
					<text>取消订单</text>
				</view>
				<!-- #ifdef MP -->
				<button type="default" open-type="contact">
					<view class="btn center round" @click="cancelOrder(item)">
						<text>联系客服</text>
					</view>
				</button>
				<!-- #endif -->
				<!-- #ifdef APP-PLUS -->
				<view class="btn center round" @click="openAppService">
					<text>联系客服</text>
				</view>
				<!-- #endif -->
				<view v-if="data.status===0" class="btn center" @click="pay(data)">
					<text>立即支付</text>
				</view>
				<!-- #ifndef H5 -->
				<view v-if="data.status===1" class="btn center round" @click="showRefundAction(data)">
					<text>申请退款</text>
				</view>
				<!-- #endif -->
				<view v-if="data.status===2" class="btn center round" @click="applyRefundProducts(data)">
					<text>申请退货</text>
				</view>
				<view v-if="data.status===2" class="btn center round" @click="navToExpress(data)">
					<text>查看物流</text>
				</view>
				<view v-if="data.status===2" class="btn center" @click="confirmReceipt(data)">
					<text>确认收货</text>
				</view>
				<view v-if="data.status===14" class="btn center" @click="editRefundExpress(data)">
					<text>填写快递信息</text>
				</view>
				<view v-if="data.status===3" class="btn center" @click="rate(data)">
					<text>立即评价</text>
				</view>
			</view>
		</view>
		
		<!-- 时间轴 -->
		<uni-popup v-if="data.timeline" ref="timelinePopup">
			<view class="timeline-content">
				<scroll-view class="timeline-scroll" scroll-y="true">
					<mix-timeline :list="data.timeline"></mix-timeline>
				</scroll-view>
				<text class="mix-icon icon-guanbi1" @click="hidePopup('timelinePopup')"></text>
			</view>
		</uni-popup>
		
		<mix-loading v-if="isLoading"></mix-loading>
		
		<mix-modal ref="mixModal" title="订单提示" :text="modalText" @onConfirm="onModalConfirm"></mix-modal>
		<mix-action-sheet ref="mixActionSheet" @onConfirm="refund"></mix-action-sheet>
	</view>
</template>

<script>
	import OrderMixin from './mixin/order'
	import customServiceMixin from '@/common/mixin/customServiceMixin'
	import productList from './components/product-list'
	export default {
		components: {
			productList
		},
		mixins: [OrderMixin, customServiceMixin],
		data() {
			return {
				modalText: '', //确认对话框内容
				addr: {
					address: {}
				},
				data: {
					products: [],
					price_data: {}
				},
				expressInfo: {},//物流信息
			}
		},
		onLoad(options){
			this.id = options.id;
		},
		onShow() {
			setTimeout(()=>{
				this.loadData();
			}, 100)
		},
		methods: {
			async loadData(){
				const res = await this.$request('order', 'getDetail', {
					id: this.id
				}, {showLoading: true})
				if(res.status === 0){
					this.$util.msg('订单不存在');
					setTimeout(()=>{
						uni.navigateBack();
					}, 1000)
					return;
				}
				const data = res.data;
				
				if(data.express_info && data.express_info.data && data.express_info.data.length > 0){
					this.expressInfo = data.express_info.data[0];
				}
				this.data = data;
				this.addr = data.address;
				if(data.pay_status === 0 && data.status === 0){
					this.queryOrderPayStatus();
				}
			},
			//查询订单支付状态
			async queryOrderPayStatus(){
				const res = await this.$request('order', 'queryOrderPayStatus', {
					order_id: this.data._id
				})
				if(res.status === 1){
					this.loadData();
				}
			},
			applyRefundProducts(data){
				uni.setStorageSync('pageParam', data);
				this.navTo('refundProducts');
			},
			editRefundExpress(data){
				uni.setStorageSync('pageParam', data);
				this.navTo('refundExpress');
			},
			copy(str){
				uni.setClipboardData({
					data: str
				})
			}
		}
	}
</script>

<style>
	page{
		background-color: #f7f7f7;
	}
</style>
<style scoped lang="scss">
	.app{
		padding-bottom: 24rpx;
	}
	.main-wrap{
		padding: 0 20rpx;
		opacity: 0;
		transition: .2s;
		
		&.show{
			opacity: 1;
		}
	}
	.state-wrap{
		padding: 30rpx 20rpx 30rpx;
		
		.state{
			font-size: 38rpx;
			color: #333;
			font-weight: 700;
		}
		.tip{
			margin-top: 20rpx;
			font-size: 26rpx;
			color: #666;
		}
		.icon-you{
			margin-left: 10rpx;
			font-size: 28rpx;
			color: #333;
		}
	}
	.addr-sec{
		display: flex;
		padding: 20rpx;
		margin-bottom: 16rpx;
		background-color: #fff;
		border-radius: 10rpx;
		position: relative;
		overflow: hidden;
		
		&.wl{
			align-items: center;
			
			.con{
				padding-right: 0;
				padding-left: 56rpx;
			}
			.icon-wuliuyunshu{
				position: absolute;
				top: 22rpx;
				font-size: 40rpx;
				color: #1d96ff;
			}
			.context{
				margin-bottom: 16rpx;
				font-size: 26rpx;
				color: #1d96ff;
				line-height: 1.4;
				word-break: break-all;
				text-indent: -10rpx;
			}
			.time{
				font-size: 24rpx;
				color: #999;
			}
			.icon-you{
				margin-left: 10rpx;
				font-size: 26rpx;
				color: #999;
			}
		}
		.icon-dizhi{
			transform: translateY(6rpx);
			width: 52rpx;
			font-size: 36rpx;
			color: $base-color;
		}
		.con{
			flex: 1;
			padding: 0 80rpx 10rpx 0;
		}
		.addr{
			margin-bottom: 16rpx;
			font-size: 30rpx;
			color: #333;
			line-height: 1.4;
		}
		.name{
			font-size: 28rpx;
			color: #999;
		}
	}
	.goods-sec{
		background-color: #fff;
		border-radius: 10rpx 10rpx 0 0;
		overflow: hidden;
		
		/deep/ .list .title{
			font-size: 28rpx;
		}
	}
	.price-sec{
		padding-top: 14rpx;
		border-radius: 0 0 10rpx 10rpx;
		background-color: #fff;
		
		.cell{
			height: 68rpx;
			padding: 0 24rpx;
			font-size: 26rpx;
			color: #333;
		}
		.total{
			justify-content: flex-end;
			height: 80rpx;
			padding-right: 20rpx;
			margin-top: 16rpx;
			font-size: 32rpx;
			color: $base-color;
			font-weight: 700;
			
			.price:before{
				content: '实付款 ';
				position: relative;
				bottom: 2rpx;
				color: #333;
				font-size: 28rpx;
				font-weight: normal;
			}
		}
		.tag{
			padding: 6rpx 8rpx;
			margin-right: 8rpx;
			font-size: 20rpx;
			color: #fff;
			border-radius: 8rpx;
			background-color: orange;
			
			&.red{
				background-color: $base-color;
			}
		}
	}
	.board{
		padding: 10rpx 20rpx;
		margin-top: 16rpx;
		border-radius: 10rpx;
		background-color: #fff;
		
		.cell{
			display: flex;
			min-height: 62rpx;
			padding: 12rpx 0;
			
			.tit{
				font-size: 26rpx;
				color: #666;
				line-height: 36rpx;
			}
			.text{
				flex: 1;
				font-size: 26rpx;
				color: #333;
				line-height: 36rpx;
			}
		}
		.copy-btn{
			padding: 8rpx 12rpx;
			font-size: 22rpx;
			color: #333;
			
			&:after{
				border-radius: 10rpx;
				border-color: #bbb;
			}
		}
	}

	.page-bottom{
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 90;
		justify-content: flex-end;
		width: 100%;
		height: 100rpx;
		box-sizing: content-box;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom); 
		background-color: #fff;
		box-shadow: 0 0 10rpx rgba(0,0,0,.1);
		
		.btn{
			min-width: 164rpx;
			height: 68rpx;
			margin-right: 16rpx;
			padding: 0 20rpx;
			font-size: 28rpx;
			color: #fff;
			background-color: $base-color;
			border-radius: 100rpx;
		}
		.round{
			background-color: #fff;
			color: #333;
		}
	}
	.bottom-fill-view{
		height: 100rpx;
		box-sizing: content-box;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom); 
	}
	.timeline-content{
		
	}
	.timeline-content{
		position: relative;
		padding-bottom: 30rpx;
		
		.timeline-scroll{
			width: 600rpx;
			height: 700rpx;
			margin-bottom: 16rpx;
			background-color: #fff;
			border-radius: 16rpx;
			
			/deep/ {
				.mix-timeline{
					padding: 40rpx 20rpx 10rpx;
				}
			}
		}
		.icon-guanbi1{
			position: absolute;
			left: 50%;
			bottom: -100rpx;
			padding: 20rpx;
			font-size: 40rpx;
			color: #fff;
			transform: translateX(-50%);
		}
	}
</style>
