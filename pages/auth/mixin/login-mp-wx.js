export default{
	// #ifdef MP-WEIXIN
	methods: {
		//微信小程序登录
		mpWxGetUserInfo(){
			if(!this.agreement){
				this.$util.msg('请阅读并同意用户服务及隐私协议');
				return;
			}
			this.$util.throttle(()=>{
				uni.getUserProfile({
					desc: '用于展示您的头像及昵称',
					success: async profileRes=> {
						const wxCode = await this.$util.getMpCode('weixin');
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
								type: 'mp_weixin',
								nickName: profileRes.userInfo.nickName,
								gender: profileRes.userInfo.gender,
								avatarUrl: profileRes.userInfo.avatarUrl
							}))
						}else{
							this.$util.msg(res.msg);
						}
					}
				})
			})
		},
	}
	// #endif
}









