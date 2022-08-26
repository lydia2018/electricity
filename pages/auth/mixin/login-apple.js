export default{
	onLoad() {
		if(this.systemInfo.platform !== 'ios'){
			return;
		}
		const systemVersion = +this.systemInfo.system.split('.')[0];
		if(systemVersion >= 13){
			this.canUseAppleLogin = true;
		}
	},
	methods: {
		//苹果登录
		async loginByApple(){
			if(!this.agreement){
				this.$util.msg('请阅读并同意用户服务及隐私协议');
				this.$refs.confirmBtn.stop();
				return;
			}
			uni.login({  
			    provider: 'apple',  
			    success: loginRes=> {  
			        // 登录成功   
			        uni.getUserInfo({  
			            provider: 'apple',  
			            success: async userRes=> {
							const res = await this.$request('user', 'loginByApple', {
								identityToken: userRes.userInfo.identityToken
							}, {
								showLoading: true
							});
							//注销苹果登录
							this.appleLogout();
							if(res.status === 1){
								this.loginSuccessCallBack({
									token: res.token,
									tokenExpired: res.tokenExpired
								});
							}else if(res.code === 10704){
								this.navTo('/pages/auth/register?userInfo='+JSON.stringify({
									type: 'apple',
									apple_id: res.apple_id
								}))
							}else{
								this.$util.msg(res.msg);
							}
			            }  
			        })  
			    },  
			    fail: err=> {  
					console.log(err);
					this.$util.msg('登录失败');
					this.appleLogout();
			    }  
			})
		},
		appleLogout(){
			plus.oauth.getServices(oauthRes=>{
				const oIndex = oauthRes.findIndex(oItem=> oItem.id === 'apple');
				oauthRes[oIndex].logout(loRes => {
					console.log('appleLogout success=> ', loRes);
				}, loErr => {
					console.log('appleLogout error=> ', loErr);
				})
			})
		}
	}
}









