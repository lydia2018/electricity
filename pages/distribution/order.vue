<template>
	<view class="app">
		<mescroll-body
			ref="mescrollRef" 
			@init="mescrollInit" 
			:top="0" 
			@down="downCallback" 
			:up="upOption" 
			@up="loadData" 
		>
			<view class="item column" v-for="(item, index) in list" :key="index" @click="navTo('detail?id='+item._id)">
				<view class="i-header row b-b">
					<text class="time fill">{{ item.add_time | date('Y-m-d H:i') }}</text>
					<text class="state" :class="{
						gray:item.status_text==='已退货'||item.status_text==='已取消',
						suc:item.status_text==='已完成'
					}">{{ item.status_text }}</text>
				</view>
				<!-- 多商品 -->
				<scroll-view class="scroll-view" scroll-x>
					<view class="goods-list">
						<view v-for="(gItem, gIndex) in item.products" :key="gIndex" class="image-wrapper lazyload lazypic" :class="{loaded: item.loaded}">
							<image :src="gItem.image" mode="aspectFill" lazy-load="true" @load="imageOnLoad(item)" ></image>
						</view>
					</view>
				</scroll-view>
				<view class="price-wrap column b-t">
					<text>{{ userInfo._id === item.inviter_user_lv1 ? '直推' : '间推' }}用户：{{ item.username }}</text>
					<view class="p-bot">
						<text>订单总额：￥{{ item.price_data.pay_price }}， {{ item.status_text==='已完成' ? '佣金合计' : '预估佣金' }}：</text>
						<text class="price">￥{{ userInfo._id === item.inviter_user_lv1 ? item.commission_lv1 :  item.commission_lv2 }}</text>
					</view>
				</view>
			</view>
		</mescroll-body>
		
		<mix-loading v-if="isLoading" :mask="true"></mix-loading>
		
		<mix-modal ref="mixModal" title="订单提示" :text="modalText" @onConfirm="onModalConfirm"></mix-modal>
		<mix-action-sheet ref="mixActionSheet" @onConfirm="refund"></mix-action-sheet>
	</view>
</template>

<script>
	import MescrollBody from "@/components/mescroll-uni/mescroll-body.vue"
	import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
	export default {
		components: {
			MescrollBody
		},
		mixins: [MescrollMixin],
		data() {
			return {
				upOption:{
					page: {
					 	num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
					 	size: 10 // 每页数据的数量
					},
					noMoreSize: 3, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
				},
				modalText: '', //确认对话框内容
				list: [] //订单列表
			}
		},
		computed: {
			userInfo(){
				return this.$store.state.userInfo;
			}
		},
		onLoad(options) {
			this.navCurrent = +options.current;
		},
		onShow(){
			if(this.loaded){
				this.refreshList(false);
			}
		},
		methods: {
			async loadData(e){
				this.mescroll && this.mescroll.removeEmpty();
				const res = await this.$request('distribution', 'getOrderList', {
					offset: (e.num - 1) * e.size,
					limit: e.size,
				});
				res.data.forEach(item=> {
					if(item.status == 10 || item.status == 11){
						item.status_text = '已取消';
					}else if(item.pay_status != 1){
						item.status_text = '未支付';
					}else if(item.status == 15 || item.status == 16){
						item.status_text = '已退货';
					}else if(item.status == 3 || item.status == 4){
						item.status_text = '已完成';
					}else{
						item.status_text = '进行中';
					}
				});
				const curList = res.data;
				if(e.num === 1){
					//第一页清空数据重载
					this.list = [];
					this.loaded && curList.forEach(item=> {item.loaded = true})
					if(curList.length > 0){
						uni.pageScrollTo({
							scrollTop: 0,
							duration: 0
						})
					}
				} 
				this.list = this.list.concat(curList); //追加新数据
				this.mescroll.endSuccess(curList.length); //结束加载状态
			},
			//刷新列表
			refreshList(showLoading){
				this.mescroll && this.mescroll.resetUpScroll(false)
				if(showLoading !== false){
					this.isLoading = true;
				}
				this.$store.dispatch('getOrderCount');
			},
			mescrollInit(mescroll){
				this.mescroll = mescroll;
				setTimeout(()=>{
					this.refreshList();
				}, 10)
			},
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
		
	}
	.item{
		width: 710rpx;
		padding-bottom: 24rpx;
		margin-top: 20rpx;
		margin-left: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
	}
	.b-b:after{
		left: 4rpx;
		right: 4rpx;
		border-color: #e5e5e5;
	}
	.i-header{
		height: 80rpx;
		padding: 0 24rpx;
		margin-bottom: 24rpx;
		
		.time{
			font-size: 26rpx;
			color: #999;
		}
		.state{
			font-size: 30rpx;
			color: $base-color;
			
			&.gray{
				color: #999;
			}
			&.suc{
				color: #1dcf1d;
			}
		}
	}
	.scroll-view{
		width: 100%;
		height: 150rpx;
		
		.goods-list{
			display: flex;
			
			&::before, &::after{
				content: '';
				width: 20rpx;
				height: 130rpx;
				flex-shrink: 0;
			}
			&::after{
				width: 10rpx;
			}
			.image-wrapper{
				flex-shrink: 0;
				width: 130rpx;
				height: 130rpx;
				margin-right: 16rpx;
				border-radius: 4rpx;
				overflow: hidden;
			}
			image{
				width: 100%;
				height: 100%;
			}
		}
	}
	.goods-wrap{
		padding: 0 20rpx;
		
		.image-wrapper{
			width: 130rpx;
			height: 130rpx;
			border-radius: 4rpx;
			overflow: hidden;
			
			image{
				width: 100%;
				height: 100%;
			}
		}
		.right{
			flex: 1;
			padding-left: 20rpx;
			overflow: hidden;
		}
		.title{
			font-size: 28rpx;
			color: #333;
		}
		.attr{
			margin: 16rpx 0 20rpx;
			min-height: 30rpx;
			font-size: 24rpx;
			color: #999;
		}
		.r-b{
			display: flex;
			height: 30rpx;
		}
		.price{
			font-size: 28rpx;
			color: #333;
			font-weight: normal;
		}
		.number{
			margin-left: 16rpx;
			font-size: 26rpx;
			color: #999;
		}
	}
	.price-wrap{
		padding: 30rpx 24rpx 4rpx;
		margin-top: 12rpx;
		font-size: 26rpx;
		color: #333;
		
		.p-bot{
			display: flex;
			margin-top: 16rpx;
		}
		.price{
			font-size: 30rpx;
			font-weight: 700;
		}
	}
</style>
