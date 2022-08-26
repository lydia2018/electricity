<template>
	<view class="app">
		<view class="user-wrapper">
			<image class="avatar" :src="userInfo.avatar || '/static/icon/default-avatar.png'"></image>
			<view class="cen column">
				<text class="username f-m">{{ userInfo.nickname || userInfo.username }}</text>
				<text class="yqm">邀请码：{{ userInfo.my_invite_code }}</text>
				<text class="tjr">推荐人：{{ data.myInviteUser.username || '-' }}</text>
			</view>
		</view>
		<view class="wrap column">
			<text class="w-tit">分销概况</text>
			<view class="row">
				<view class="c-box column center">
					<text class="num">{{ userInfo.commission | price }}</text>
					<text>累计收入(元)</text>
				</view>
				<view class="c-box column center">
					<text class="num">{{ data.lv1Count || 0 }}</text>
					<text>直推(人)</text>
				</view>
				<view class="c-box column center">
					<text class="num">{{ data.lv2Count || 0 }}</text>
					<text>间推(人)</text>
				</view>
			</view>
		</view>
		<view class="wrap column">
			<text class="w-tit">今日收益</text>
			<view class="row">
				<view class="c-box column center">
					<text class="num">{{ data.incomeToday | price }}</text>
					<text>今日收入(元)</text>
				</view>
				<view class="c-box column center">
					<text class="num">{{ data.payOrderCount || 0 }}</text>
					<text>付款订单数</text>
				</view>
				<view class="c-box column center">
					<text class="num">{{ data.finshOrderCount || 0 }}</text>
					<text>完成订单数</text>
				</view>
			</view>
		</view>
		<view class="wrap op-wrap row">
			<view class="cell column center" @click="navTo('team?login=1')">
				<text class="mix-icon icon-tuanduiguanli"></text>
				<text>我的团队</text>
			</view>
			<view class="cell column center" @click="navTo('order?login=1')">
				<text class="mix-icon icon-complete-fill"></text>
				<text>分销订单</text>
			</view>
			<view class="cell column center" @click="navTo('moneyLog?login=1')">
				<text class="mix-icon icon-jine"></text>
				<text>佣金明细</text>
			</view>
			<!-- #ifdef MP-WEIXIN -->
			<button type="primary" open-type="share">
				<view class="cell column center">
					<text class="mix-icon icon-a-ziyuan103"></text>
					<text>邀请好友</text>
				</view>
			</button>
			<!-- #endif -->
			<!-- #ifdef APP-PLUS -->
			<view class="cell column center" @click="doAppShare">
				<text class="mix-icon icon-a-ziyuan103"></text>
				<text>邀请好友</text>
			</view>
			<!-- #endif -->
		</view>
		<view class="tip-wrap column">
			<text class="txt">1. 邀请用户注册，用户下单后即可获得佣金返现，佣金可直接在商城购买商品。</text>
			<text class="txt">2. 直推用户下单可获得订单金额{{ data.commissionRate.lv1 || 0 }}%的佣金，间推用户下单可获得{{ data.commissionRate.lv2 || 0 }}%的佣金。佣金根据用户实际支付金额计算，不包含优惠券、满减等促销活动减免金额。</text>
			<text class="txt">3. 佣金在用户确认收货后发放，用户支付订单后退款、退货不再发放佣金。</text>
		</view>
		
		<mix-loading v-if="isLoading"></mix-loading>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				data: {
					commissionRate: {},
					myInviteUser: {}
				}
			}
		},
		computed: {
			userInfo(){
				return this.$store.state.userInfo;
			}
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			async loadData(){
				const res = await this.$request('distribution', 'getStatistics', {
					showLoading: true
				})
				this.data = res;
			},
			// #ifdef APP-PLUS
			doAppShare(){
				this.$util.throttle(async ()=>{
					uni.share({
					    provider: "weixin",
					    scene: 'WXSceneSession',
					    type: 5,
						imageUrl: '/static/share-image.png',
						title: this.$config.appName,
						miniProgram: {
							id: this.$config.mpWxOrgId,
							path: '/pages/public/sharePage?inviteCode='+this.$store.state.userInfo.my_invite_code,
							type: 0,
							webUrl: 'http://uniapp.dcloud.io'
						}
					});
				})
			},
			// #endif
		}
	}
</script>

<style>
	page{
		background-color: #f7f7f7;
	}
</style>

<style scoped lang="scss">
	.user-wrapper{
		display:flex;
		flex-direction: column;
		flex-direction: row;
		align-items: center;
		position: relative;
		z-index: 5;
		padding: 30rpx 30rpx 10rpx;
		
		.avatar{
			flex-shrink: 0;
			width: 120rpx;
			height: 120rpx;
			border-radius: 100px;
			margin-right: 20rpx;
			border: 2rpx solid #e0e0e0;
		}
		.username{
			color: #333;
			font-weight: bold;
		}
		.yqm{
			margin: 16rpx 0 12rpx;
			font-size: 24rpx;
			color: #666;
		}
		.tjr{
			font-size: 24rpx;
			color: #666;
		}
	}
	.wrap{
		width: 690rpx;
		padding: 30rpx 0;
		margin-top: 24rpx;
		margin-left: 30rpx;
		background-color: #fff;
		border-radius: 16rpx;
	
		.w-tit{
			margin: 0 0 36rpx 30rpx;
			font-size: 30rpx;
			color: #333;
			font-weight: bold;
		}
		.c-box{
			flex: 1;
			font-size: 24rpx;
			color: #999;
		}
		.num{
			margin-bottom: 24rpx;
			font-size: 32rpx;
			color: #333;
			font-weight: bold;
		}
	}
	.op-wrap{
		flex-wrap: wrap;
		padding: 20rpx 0;
		
		.cell{
			flex-shrink: 0;
			width: 226rpx;
			padding: 24rpx 0;
			font-size: 24rpx;
			color: #333;
		}
		.mix-icon{
			width: 80rpx;
			height: 80rpx;
			margin-bottom: 20rpx;
			text-align: center;
			line-height: 80rpx;
			font-size: 48rpx;
			color: #fff;
			background: linear-gradient(to bottom, #ff9436, #fdc763);
			border-radius: 20rpx;
		}
		.icon-complete-fill{
			background: linear-gradient(to bottom, #6898ed, #79b1fb);
		}
		.icon-jine{
			background: linear-gradient(to bottom, #c654e0, #ec75b7);
		}
		.icon-a-ziyuan103{
			background: linear-gradient(to bottom, #fd8672, #fd7370);
		}
		/* background: linear-gradient(to bottom, #4ccccb, #3edede); */
	}
	.tip-wrap{
		padding: 30rpx 40rpx;
		
		.txt{
			margin-bottom: 12rpx;
			font-size: 24rpx;
			color: #999;
			line-height: 36rpx;
		}
	}

</style>
