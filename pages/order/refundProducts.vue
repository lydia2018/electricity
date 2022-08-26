<template>
	<view class="app">
		<view class="main-wrap show column">
			<!-- 商品 -->
			<view class="page-tip row">
				<text>退款商品</text>
			</view>
			<view v-if="data.products.length > 0" class="goods-sec">
				<product-list :list="data.products"></product-list>
			</view>
			<!-- 价格信息 -->
			<view class="price-sec">
				<view class="total row">
					<text class="price">￥{{ data.price_data.pay_price || 0 }}</text>
				</view>
			</view>
			<view class="page-tip row">
				<text>退款原因</text>
			</view>
			<view class="textarea-wrap">
				<textarea maxlength="300" v-model="refund_product_reason" placeholder="请详细描述退款原因和您遇到的问题 .." placeholder-style="color:#999" />
			</view>
			<view class="page-tip row">
				<text>上传凭证，最多上传4张</text>
			</view>
			<view class="upload-wrap">
				<mix-upload-image ref="mixUploadImage" :length="4"></mix-upload-image>
			</view>
			<mix-button ref="confirmBtn" text="提交退款申请" marginTop="60rpx" @onConfirm="confirm"></mix-button>
		</view>
	</view>
</template>

<script>
	import productList from './components/product-list'
	export default {
		components: {
			productList
		},
		data() {
			return {
				refund_product_reason: '',
				data: {
					products: [],
					price_data: {}
				},
			}
		},
		onLoad(options) {
			this.data = uni.getStorageSync('pageParam');
		},
		methods: {
			async confirm(){
				const {refund_product_reason, data} = this;
				if(!refund_product_reason){
					this.$util.msg('请输入退款原因');
					this.$refs.confirmBtn.stop();
					return;
				}
				const res = await this.$request('order', 'refundProduct', {
					id: data._id,
					refund_product_reason, 
					refund_product_images: this.$refs.mixUploadImage.imageList.map(item=> item.url)
				});
				this.$util.msg(res.msg);
				this.$refs.confirmBtn.stop();
				if(res.status == 1){
					setTimeout(()=>{
						uni.navigateBack();
					}, 1000)
				}
				
			}
		}
	}
</script>

<style>
	page{
		background-color: #f7f7f7;
	}
</style>
<style scoped lang="scss">
	.app{
		padding: 2rpx 0 40rpx;
	}
	.main-wrap{
		padding: 0 20rpx;
		opacity: 0;
		transition: .2s;
		
		&.show{
			opacity: 1;
		}
	}
	.page-tip{
		height: 92rpx;
		padding-top: 10rpx;
		font-size: 30rpx;
		color: #333;
		font-weight: bold;
	}
	.goods-sec{
		background-color: #fff;
		border-radius: 10rpx 10rpx 0 0;
		overflow: hidden;
		
		/deep/ .list .title{
			font-size: 28rpx;
		}
	}
	.textarea-wrap{
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		
		textarea{
			width: 100%;
			height: 200rpx;
			font-size: 28rpx;
			color: #333;
			line-height: 1.4;
		}
	}
	.price-sec{
		border-radius: 0 0 10rpx 10rpx;
		background-color: #fff;
		
		.cell{
			height: 68rpx;
			padding: 0 24rpx;
			font-size: 26rpx;
			color: #333;
		}
		.total{
			justify-content: flex-end;
			height: 88rpx;
			padding-right: 20rpx;
			font-size: 32rpx;
			color: $base-color;
			font-weight: 700;
			
			.price:before{
				content: '退款金额 ';
				position: relative;
				bottom: 2rpx;
				color: #333;
				font-size: 28rpx;
				font-weight: normal;
			}
		}
		.tag{
			padding: 6rpx 8rpx;
			margin-right: 8rpx;
			font-size: 20rpx;
			color: #fff;
			border-radius: 8rpx;
			background-color: orange;
			
			&.red{
				background-color: $base-color;
			}
		}
	}
	.upload-wrap{
		padding: 24rpx 0 0 16rpx;
		background-color: #fff;
		
		/deep/ {
			.upload-content{
				background-color: #fff;
			}
		}
	}
	.input-cell{
		padding: 0 30rpx;
		height: 88rpx;
		line-height: 88rpx;
		font-size:28rpx;
		color: #333;
		background-color: #f7f7f7;
		border-radius: 12rpx;
	}
</style>
