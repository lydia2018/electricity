/**
 * 分销
 * create by 尤涛 2021-12-25
 * qq 472045067
 */
'use strict';

const uniID = require('uni-id');

const db = uniCloud.database();
const dbCmd = db.command;
const $ = db.command.aggregate;
const userDb = db.collection('mix-uni-id-users');

const modal = {
	/**
	 * 获取统计面板数据
	 */
	async getStatistics(request, ext){
		const {commissionRate} = require('config');
		//直推人数
		const lv1Count = await userDb.where({
			'inviter_uid.0': ext.uid
		}).count();
		//间推人数
		const lv2Count = await userDb.where({
			'inviter_uid.1': ext.uid
		}).count();
		//今日收益
		const incomeToday = await db.collection('mix-money-log')
			.aggregate()
			.match({
				uid: ext.uid,
				type: 'commission',
				add_time: dbCmd.gte(new Date(new Date().toLocaleDateString()).getTime())
			})
			.group({
				_id: null,
				total: $.sum('$money')
			})
			.end()
		//付款订单数
		const payOrderCount = await db.collection('mix-order').where(dbCmd.and([
			{
				pay_status: 1
			},
			{
				add_time: dbCmd.gte(new Date(new Date().toLocaleDateString()).getTime())
			},
			dbCmd.or([{
				inviter_user_lv1: ext.uid
			}, {
				inviter_user_lv2: ext.uid
			}])
		])).count();
		//付款订单数
		const finshOrderCount = await db.collection('mix-order').where(dbCmd.and([
			{
				pay_status: 1
			},
			{
				add_time: dbCmd.gte(new Date(new Date().toLocaleDateString()).getTime())
			},
			{
				status: dbCmd.in([3,4]),
			},
			dbCmd.or([{
				inviter_user_lv1: ext.uid
			}, {
				inviter_user_lv2: ext.uid
			}])
		])).count();
		//推荐人
		let myInviteUser = {};
		if(ext.payload.userInfo.inviter_uid && ext.payload.userInfo.inviter_uid.length > 0){
			const iUser = await userDb.doc(ext.payload.userInfo.inviter_uid[0]).field({
				username: 1
			}).get();
			if(iUser.data.length === 1){
				myInviteUser = iUser.data[0];
			}
		}
		
		return {
			lv1Count: lv1Count.total,
			lv2Count: lv2Count.total,
			incomeToday: incomeToday.data.length > 0 ? incomeToday.data[0].total : 0,
			payOrderCount: payOrderCount.total,
			finshOrderCount: finshOrderCount.total,
			commissionRate,
			myInviteUser
		}
	},
	/**
	 * 获取分销订单
	 * @param {Object} request
	 * @param {Number} request.offset
	 * @param {Number} request.limit
	 */
	async getOrderList(request, ext){
		const res = await db.collection('mix-order')
			.where(dbCmd.or([{
				inviter_user_lv1: ext.uid
			},{
				inviter_user_lv2: ext.uid
			}]))
			.skip(request.offset)
			.limit(request.limit)
			.orderBy('add_time', 'desc')
			.get();
		return res;
	},
	/**
	 * 获取用户推荐列表
	 * @param {Object} request
	 * @param {String} request.level [1|2] 获取第几级邀请用户
	 * @param {String} request.uid 可选，默认当前登录用户
	 * @param {String} request.limit
	 * @param {String} request.offset
	 */
	async getTeamList(request, ext){
		const res = await uniID.getInvitedUser({
			uid: request.uid || ext.uid,
			level: request.level,
			limit: request.limit,
			offset: request.offset
		})
		return res.code === 0 ? {
			status: 1,
			data: res.invitedUser
		}: {
			status: 0,
			message: res.message
		}
	},
	/**
	 * 获取用户资金记录
	 * @param {Number} request.offset
	 * @param {Number} request.limit
	 */
	async getMoneyLog(request, ext){
		const res = await db.collection('mix-money-log')
			.skip(request.offset)
			.limit(request.limit)
			.where({
				uid: ext.uid,
				type: 'commission'
			})
			.orderBy('add_time', 'desc')
			.get()
		return res;
	},
}

module.exports = modal;