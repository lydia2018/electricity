export default {
	// #ifdef APP-PLUS
	methods: {
		/**
		 * 微信App登录
		 */
		loginByWxApp() {
			if (!this.agreement) {
				this.$util.msg('请阅读并同意用户服务及隐私协议');
				return;
			}
			this.$util.throttle(async () => {
				let wxCode = await this.getWeixinCode();
				const res = await this.$request('user', 'loginByWeixin', {
					code: wxCode,
				}, {
					showLoading: true
				});
				if(res.status === 1){
					this.loginSuccessCallBack({
						token: res.token,
						tokenExpired: res.tokenExpired
					});
				}else if(res.msg === '此微信账号尚未注册'){
					this.navTo('/pages/auth/register?userInfo='+JSON.stringify({
						type: 'app_weixin',
						nickName: res.userInfo.nickname,
						gender: res.userInfo.sex,
						avatarUrl: res.userInfo.headimgurl,
						openid: res.userInfo.openid,
						unionid: res.userInfo.unionid
					}))
				}else{
					this.$util.msg(res.msg);
				}
			})
		},
		getWeixinCode() {
			return new Promise((resolve, reject) => {
				plus.oauth.getServices((services) => {
					const weixinAuthService = services.find((service) => {
						return service.id === 'weixin'
					})
					weixinAuthService.authorize(function(res) {
						resolve(res.code)
					}, function(err) {
						console.log(err)
						reject(new Error('微信登录失败'))
					});
				});
			})
		},
	}
	// #endif
}
