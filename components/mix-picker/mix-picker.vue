<template>
	<uni-popup ref="popup" type="bottom" :zIndex="102">
		<view class="content" @click.stop.prevent="stopPrevent">
			<view class="pop-header" v-if="!!title">
				<text class="h-btn cancel-btn" @click="close">{{ cancelText }}</text>
				<text class="h-title">{{ title }}</text>
				<text class="h-btn confirm-btn" @click="confirm">{{ confirmText }}</text>
			</view>
			<picker-view v-if="list && list.length > 0" :value="[value]" class="picker-view" indicator-class="indicator-class" @change="onChange">
				<picker-view-column class="picker-view-column">
					<view class="picker-view-item" v-for="(item,index) in list" :key="index">{{item.name}}</view>
				</picker-view-column>
			</picker-view>
		</view>	
	</uni-popup>
</template>

<script>
	export default {
		data() {
			return {
				value: 0,
				popClass: 'none'
			};
		},
		props: {
			defaultVal: {
				type: String,
				default: ''
			},
			list: {
				type: Array,
				default(){
					return [];
				}
			},
			title: {
				type: String,
				default: '请选择'
			},
			cancelText: {
				type: String,
				default: '取消'
			},
			confirmText: {
				type: String,
				default: '确定'
			},
			ext: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		methods: {
			confirm(){
				const {value, ext} = this;
				const data = {
					value: value || 0,
					ext,
					data: this.list[value],
				};
				this.$emit('onChange', data);
				this.close();
			},
			onChange(e){
				this.value = e.detail.value[0];
			},
			open(){
				if(!this.list || this.list.length === 0){
					this.$util.msg('请等待数据加载');
					return;
				}
				//设置默认
				if(this.defaultVal){
					this.value = this.list.findIndex(item=> item.val === this.defaultVal);
				}
				this.$refs.popup.open();
			},
			close(){
				this.$refs.popup.close();
			},
			stopPrevent(){}
		}
	}
</script>

<style scoped lang="scss">
	.content{
		width: 750rpx;
		background-color: #fff;
		border-radius: 16rpx 16rpx 0 0;
		overflow: hidden;
	}
	.pop-header{
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 100rpx;
		padding: 4rpx 0;
		border-bottom: 1px solid #f0f0f0;
		
		&:after{
			left: 0;
			right: 0;
		}
		.h-btn{
			display: flex;
			justify-content: center;
			align-items: center;
			height: 72rpx;
			padding: 0 30rpx;
			font-size: 28rpx;
			color: #999;
		}
		.confirm-btn{
			color: #007aff;
		}
		.h-title{
			font-size: 32rpx;
			color: #333;
			font-weight: 500;
		}
	}
	.picker-view{
		width: 100%;
		height: 460rpx;
		
		.picker-view-item{
			display: flex;
			align-items: center;
			justify-content: center;
			height: 84rpx;
			line-height: 84rpx;
			font-size: 30rpx;
			color: #333;
		}
	}
		
</style>
