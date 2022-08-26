<template>
	<view class="app">
		<mescroll-body
			ref="mescrollRef" 
			@init="mescrollInit" 
			:top="0" 
			@down="downCallback" 
			:up="upOption" 
			@up="loadList" 
		>
			<view class="item row b-b" v-for="(item, index) in list" :key="index">
				<view class="column fill">
					<text class="username">{{ item.username }}</text>
					<text class="time">邀请时间 {{ item.invite_time | date('Y-m-d H:i:s') }}</text>
				</view>
			</view>
		</mescroll-body>
		
		<mix-loading v-if="isLoading" :type="2"></mix-loading>
	</view>
</template>

<script>
	import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
	export default {
		mixins: [MescrollMixin], 
		data() {
			return {
				uid: '',
				list: [],
				upOption:{
					auto: false, // 不自动加载
					page: {
					 	num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
					 	size: 15 // 每页数据的数量
					},
					noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
				},
			}
		},
		onLoad(options) {
			this.uid = options.uid;
		},
		methods: {
			async loadList(e){
				const res = await this.$request('distribution', 'getTeamList', {
					level: 1,
					uid: this.uid,
					offset: (e.num - 1) * e.size,
					limit: e.size
				})
				const curList = res.data;
				if(e.num === 1){
					this.list = [];
				}
				this.list = this.list.concat(curList); //追加新数据
				this.mescroll.endSuccess(curList.length); //结束加载状态
			},
			mescrollInit(mescroll){
				this.isLoading = true;
				this.mescroll = mescroll;
				this.mescroll.resetUpScroll(false)
			}
		}
	}
</script>

<style scoped lang="scss">
	.item{
		padding: 30rpx;
		
		&:after{
			left: 30rpx;
			right: 30rpx;
		}
	}
	.username{
		margin-bottom: 24rpx;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
	.time{
		font-size: 24rpx;
		color: #999;
	}
	.icon-you{
		font-size: 24rpx;
		color: #555;
	}
</style>
