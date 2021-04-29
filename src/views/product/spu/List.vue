<template>
	<div>
		<el-card>
			<CategorySelector :disabled="selectorDisabled" @changeCategory="changeCategory" ></CategorySelector>
		</el-card>
		<el-card style="margin: 20px 0">
			<div  v-show="!isShowSkuForm && !isShowSpuForm">
				<el-button type="primary" icon="el-icon-plus" @click="showSpuForm">添加SUP</el-button>
				<el-table
					border
					:data="spuList"
					style="width: 100%;margin:20px 0">
					<el-table-column
						type="index"
						align="center"
						label="序号"
						width="80">
					</el-table-column>
					<el-table-column
						prop="spuName"
						label="SPU名称"
						width="width">
					</el-table-column>
					<el-table-column
						prop="description"
						label="SPU描述"
						width="width">
					</el-table-column>
					<el-table-column
						prop="prop"
						label="操作"
						width="width">
						<template slot-scope="{row,$index}">
							<HintButton type="success" icon="el-icon-plus" size="mini" title="添加sku" @click="showSkuForm(row)" ></HintButton>
							<HintButton type="warning" icon="el-icon-edit" size="mini" title="修改spu" ></HintButton>
							<HintButton type="info" icon="el-icon-info" size="mini" title="查看当前spu下的sku列表" ></HintButton>
							<HintButton type="danger" icon="el-icon-delete" size="mini" title="删除spu" ></HintButton>
						</template>
					</el-table-column>
				</el-table>
				<!-- @size-change="handleSizeChange"
					@current-change="handleCurrentChange" -->
				<el-pagination
					@size-change="handleSizeChange"
					@current-change="getSpuList"
					style="text-align:center"
					:current-page="page"
					:page-sizes="[3, 5, 7]"
					:page-size="limit"
					page-count="7"
					layout="prev, pager, next, jumper, sizes,total"
					:total="total">
				</el-pagination>
			</div>
			<SpuForm v-show="isShowSpuForm"></SpuForm>
			<SkuForm v-show="isShowSkuForm"></SkuForm>
		</el-card>
	</div>
</template>

<script>
	import SkuForm from './components/SkuForm'
	import SpuForm from './components/SpuForm'

	export default {
		name: "SpuList",
		components:{
			SkuForm,
			SpuForm
		},
		data(){
			return {
				//初始化控制三级联动可用性的属性
				selectorDisabled:false,
				//初始化 1、2、3 级分类的 id
				category1Id:'',
				category2Id:'',
				category3Id:'',
				//初始化 spu 列表
				spuList:[],
				//初始化获取spu列表请求参数
				page:1,
				limit:3,
				//初始化数据总条数
				total:0,
				isShowSkuForm:false,
				isShowSpuForm:false,
			}
		},
		methods:{
			//三级联动选中 1、2、3 分类的事件
			changeCategory({categoryId,level}){
				//将对应的分类id保存到data中对应的属性中
				this[`category${level}Id`] = categoryId
				//判断选中的是几级分类
				//选中一级需要重置 2、3 级分类 id 和 spu 列表数据
				//选中二级需要重置3 级分类 id 和 spu 列表数据
				//选中三级需要发送请求获取 spu 列表数据
				if(level === 1){
					this.category2Id = ''
					this.category3Id = ''
					this.spuList = []
				}else if(level === 2){
					this.category3Id = ''
					this.spuList = []
				}else{
					this.getSpuList()
				}
			},
			//请求获取 spu 列表数据
			async getSpuList(originPage = 1){
				this.page = originPage
				//获取请求参数
				const {page,limit,category3Id} = this
				//发送请求
				try {
					const result = await this.$API.spu.getSpuList(page,limit,category3Id)
					if(result.code === 200 || result.code === 20000){
						//请求成功
						this.spuList = result.data.records
						this.total = result.data.total
					}else{
						this.$message.info('获取spu列表失败')
					}
				} catch (error) {
					this.$message.error('获取spu列表失败')
				}
			},
			//分页器改变每页条数的事件
			handleSizeChange(size){
				this.limit = size
				this.getSpuList()
			},
			//点击添加 spu 按钮，显示 添加 / 修改 spu 界面
			showSpuForm(){
				this.isShowSpuForm = true
			},
			//点击添加sku按钮，显示添加 sku 界面
			showSkuForm(row){
				this.isShowSkuForm = true
			},
		}
	};
</script>

<style>
</style>
