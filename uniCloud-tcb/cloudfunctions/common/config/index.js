'use strict';

const fs = require("fs");

module.exports = {
	openExamine: true, //小程序开启审核时隐藏部分模块使用, 提交审核设置为ture隐藏违规模块
	appName: '创云商城', //应用名称
	//微信小程序端对应的微信支付及登录配置配置
	wxConfigMp: {
		appId: '',
		secret: '',
		mchId: '',
		key: '',
		pfx: fs.readFileSync(__dirname + '/cert/apiclient_cert.p12')//api证书，请将证书改名为apiclient_cert.p12放在cert目录下,不替换则无法退款。
	},
	// App端对应的微信支付配置
	wxConfigApp: {
		appId: '',
		mchId: '',
		key: ''
	},
	// 支付宝小程序端对应的支付宝支付及登录配置
	aliConfigMp: {
		mchId: '',
		appId: '',
		alipayPublicKey: '',
		privateKey: ''
	},
	// App端对应的支付宝支付配置
	aliConfigApp: {
		mchId: '', //商户pid
		appId: '',
		alipayPublicKey: '',
		privateKey: '',
		keyType: 'PKCS1' //PKCS1 | PKCS8
	},
	/**
	 * 支付回调地址
	 * 在云函数列表中选择云函数payment-notify->点击详情->云函数URL化中点击复制路径，把复制的路径填在下方即可
	 * 如果您的用户量非常大请绑定自定义域名，具体请查看文档 https://uniapp.dcloud.io/uniCloud/http?id=%e9%80%9a%e8%bf%87-http-url-%e6%96%b9%e5%bc%8f%e8%ae%bf%e9%97%ae%e4%ba%91%e5%87%bd%e6%95%b0
	 */
	paymentNotifyUrl: '',
	//分销佣金设置
	commissionRate: {
		lv1: 5, //直推佣金比例，如设置10则直推获得10%订单金额的佣金
		lv2: 2 //间推佣金比例，如设置5则间推获得5%订单金额的佣金
	},
	//快递100 用于物流查询 配置参数 https://poll.kuaidi100.com/manager/page/document/synquery
	kuaidi100: {
		customer: '', 
		key: '', //快递100 授权KEY
	},
	/**
	 * uniCloud短信配置
	 * 推荐使用uni短信，资费更低、申请简单且无需额外配置
	 * uni短息介绍 https://ask.dcloud.net.cn/article/37534
	 * 和阿里云短信二选一，如果两项都配置，则优先使用uni短信，下发失败时再次尝试另一渠道下发
	 */
	masterSmsCode: [], //如设置为 ['888888'] 则表示验证码直接输入888888可以直接跳过在手机验证码验证，上线之前必须设为 []。
	uniSms: {
		smsKey: '',
		smsSecret: '',
		templateId: '',
		expiresTime: 5 ,//验证码有效时间(分钟)
	},
	/**
	 * 阿里云短信配置
	 * 阿里云templateCode需在根目录config.js中配置aliSmsTemplateCode
	 */
	aliSms: {
		accessKeyId: '',
		accessKeySecret: '',
		SignName: '',
		expiresTime: 5,//验证码有效时间(分钟)
	}
}
