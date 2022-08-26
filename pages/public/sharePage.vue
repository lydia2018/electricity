<template>
	<view>
		
	</view>
</template>

<script>
	export default {
		onLoad(options) {
			uni.setStorageSync('inviteCode', options.inviteCode);
			uni.reLaunch({
				url: '/pages/tabbar/home'
			})
		}
	}
</script>

<style>

</style>
