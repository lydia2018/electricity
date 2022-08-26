/**
 * 具体配置请参考使用文档  https://www.kancloud.cn/ayinhun115/mix-mall-doc/2587956
 */

export default {
	appName: '创云商城演示',
	qqmapWxKey: '', //腾讯地图key，申请地址 https://lbs.qq.com/
	mpWxOrgId: '', //微信小程序原始id，用于App分享到微信小程序, 无App或无微信小程序不填
	//阿里云短信配置模板code，如果使用uniSms不需要配置
	aliSmsTemplateCode: { 
		register: '', //注册
		retrievePassword: '', //修改登录密码
		setPayPassword: ''//修改支付密码
	},
	//App端客服配置，微信客服和第三方客服二选一
	customerService: {
		//微信客服
		wxService: { 
			corpid: '', //企业id
			url: '' //企业客服链接
		},
		//第三方客服
		thirdService: { 
			url: ''
		}
	}
}