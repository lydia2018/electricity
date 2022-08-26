<template>
	<view class="app">
		<view class="cell row b-b" @click="showPopup('mixPikcer')">
			<text class="tit">快递公司</text>
			<text class="fill" :class="{placeholder: !curExp.name}">{{ curExp.name || '请选择快递公司' }}</text>
			<text class="mix-icon icon-you"></text>
		</view>
		<view class="cell row b-b">
			<text class="tit">快递公司</text>
			<input v-model="logistic_code" type="text" placeholder="请输入快递单号" placeholder-class="placeholder" />
		</view>
		<mix-button ref="confirmBtn" text="提交" marginTop="80rpx" @onConfirm="confirm"></mix-button>
		
		<view class="page-tip row" style="margin-top: 50rpx;">
			<text>* 请将商品寄回以下地址，并填写快递信息。</text>
		</view>
		<view class="addr-wrap">
			<view class="addr-cell row">
				<text class="tit">收件人</text>
				<text>{{ refundAddr.name }}</text>
			</view>
			<view class="addr-cell row">
				<text class="tit">联系方式</text>
				<text>{{ refundAddr.phone }}</text>
			</view>
			<view class="addr-cell row">
				<text class="tit">收件地址</text>
				<text>{{ refundAddr.address }}</text>
			</view>
		</view>
		
		<mix-picker ref="mixPikcer" :list="list" @onChange="onChange"></mix-picker>
	</view>
</template>

<script>
	import {checkStr} from '@/common/js/util'
	export default {
		data() {
			return {
				curExp: {},
				list: [],
				refundAddr: {},
				logistic_code: ''
			}
		},
		onLoad(options) {
			const data = uni.getStorageSync('pageParam');
			this.order_id = data._id;
			this.refundAddr = data.refundAddrData;
			this.loadExpList()
		},
		methods: {
			async confirm(){
				const {logistic_code, curExp, order_id} = this;
				if(!curExp._id){
					this.$util.msg('请选择快递公司');
					this.$refs.confirmBtn.stop();
					return;
				}
				if(!logistic_code){
					this.$util.msg('请输入快递单号');
					this.$refs.confirmBtn.stop();
					return;
				}
				const res = await this.$request('order', 'refundProductEditExpress', {
					order_id,
					refund_express_data: {
						logistic_code,
						shipper_code: curExp.code,
						shipper_name: curExp.name
					}
				})
				if(res.status == 1){
					this.$util.msg('提交成功');
					setTimeout(()=>{
						uni.navigateBack();
					}, 1000)
				}else{
					this.$util.msg(res.msg);
				}
			},
			onChange(e){
				this.curExp = e.data;
			},
			async loadExpList(){
				const res = await this.$request('express', 'getExpressComp');
				this.list = res.data.map((item, index)=> {
					item.checked = index === 0 ? true: false;
					return item;
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	.app{
		padding: 4rpx 30rpx;
	}
	.cell{
		height: 120rpx;
		padding: 0 10rpx;
		margin-top: 10rpx;
		font-size: 30rpx;
		color: #333;
		
		.tit{
			width: 150rpx;
		}
		.input{
			flex: 1;
			font-size: 30rpx;
			color: #333;
		}
		.icon-you{
			font-size: 24rpx;
			color: #999;
		}
	}
	.page-tip{
		padding: 6rpx 20rpx 20rpx 10rpx;
		font-size: 28rpx;
		color: #999;
		
		text{
			line-height: 1.5;
		}
	}
	.addr-wrap{
		padding: 16rpx 30rpx;
		background-color: #f7f7f7;
		border-radius: 20rpx;
		
		.addr-cell{
			height: 66rpx;
			font-size: 26rpx;
			color: #555;
		}
	}
</style>
