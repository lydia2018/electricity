<template>
	<view style="background-color: #0094ff;">
		<web-view :src="thirdService.url"></web-view>
	</view>
</template>

<script>
	export default {
		computed: {
			thirdService(){
				return this.$config.customerService.thirdService;
			}
		}
	}
</script>

