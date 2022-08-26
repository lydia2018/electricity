<template>
	<view class="app">
		<view class="input-wrap pwd-wrap row b-b">
			<text class="mix-icon icon-shoujihaoma"></text>
			<input class="input" v-model="mobile" type="number" maxlength="11" placeholder="请输入手机号码" placeholder-style="color:#999;font-size:30rpx" />
		</view>
		<view class="input-wrap row b-b">
			<text class="mix-icon icon-yanzhengma1"></text>
			<input class="input" v-model="code" type="number" maxlength="6" placeholder="请输入手机验证码" placeholder-style="color:#999;font-size:30rpx" />
			<mix-code :mobile="mobile" :templateCode="aliSmsTemplateCode.retrievePassword"></mix-code>
		</view>
		<view class="input-wrap pwd-wrap row b-b">
			<text class="mix-icon icon-mima"></text>
			<input class="input" v-model="pwd" :password="!showPwd" type="text" maxlength="18" placeholder="新密码，6-18位字母或数字" placeholder-style="color:#999;font-size:30rpx" />
			<text class="mix-icon icon-eye" :class="showPwd ? 'icon-yanjing': 'icon-biyan'" @click.stop.prevent="changePwdState"></text>
		</view>
		<mix-button ref="confirmBtn" text="修改密码" marginTop="80rpx" @onConfirm="confirm"></mix-button>
	</view>
</template>

<script>
	import {checkStr} from '@/common/js/util'
	export default {
		data() {
			return {
				mobile: '',//手机号
				code: '', //手机验证码
				pwd: '', //密码
				showPwd: false,
			}
		},
		computed: {
			aliSmsTemplateCode(){
				return this.$config.aliSmsTemplateCode;
			}
		},
		methods: {
			async confirm(){
				const {mobile, code, pwd} = this;
				if(!checkStr(mobile, 'mobile')){
					this.$util.msg('手机号码格式不正确');
					this.$refs.confirmBtn.stop();
					return;
				}
				if(!code){
					this.$util.msg('请输入验证码');
					this.$refs.confirmBtn.stop();
					return;
				}
				if(!checkStr(pwd, 'pwd')){
					this.$util.msg('密码必须位6-18字母或数字');
					this.$refs.confirmBtn.stop();
					return;
				}
				const res = await this.$request('user', 'retrievePassword', {
					mobile,
					code,
					pwd
				})
				this.$util.msg(res.msg);
				this.$refs.confirmBtn.stop();
				if(res.status === 1){
					setTimeout(()=>{
						uni.navigateBack();
					}, 1000)
				}
			},
			changePwdState(){
				this.showPwd = !this.showPwd;
			},
		}
	}
</script>

<style scoped lang="scss">
	.app{
		padding-top: 10rpx;
	}
	.page-tit{
		height: 80rpx;
		padding-left: 50rpx;
		font-size: 34rpx;
		color: #333;
		font-weight: 700;
	}
	.input-wrap{
		height: 110rpx;
		margin: 10rpx 60rpx 0;
		padding-right: 20rpx;
		
		&.pwd-wrap{
			position: relative;
			z-index: 100;
		}
		.input{
			flex: 1;
			font-size: 32rpx;
			color: #333;
		}
		.mix-icon{
			width: 60rpx;
			font-size: 40rpx;
			color: $base-color;
		}
		.icon-eye{
			width: auto;
			padding: 20rpx;
			font-size: 36rpx;
			color: #999;
			transform: translateX(14rpx);
		}
	}
</style>
