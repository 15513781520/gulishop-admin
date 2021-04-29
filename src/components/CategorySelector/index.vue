<template>
	<div>
		<el-form :inline="true" :model="categoryForm" :disabled="disabled">
			<el-form-item label="一级分类">
				<el-select
					v-model="categoryForm.category1Id"
					placeholder="请选择"
					@change="handlecategory(1,$event)"
				>
					<el-option
						:label="c1.name"
						:value="c1.id"
						v-for="(c1, index) in category1List"
						:key="c1.id"
					></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="二级分类">
				<el-select
					v-model="categoryForm.category2Id"
					placeholder="请选择"
					@change="handlecategory(2,$event)"
				>
					<el-option
						:label="c2.name"
						:value="c2.id"
						v-for="(c2, index) in category2List"
						:key="c2.id"
					></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="三级分类">
				<el-select
					v-model="categoryForm.category3Id"
					placeholder="请选择"
					@change="getAttrList"
				>
					<el-option
						:label="c3.name"
						:value="c3.id"
						v-for="(c3, index) in category3List"
						:key="c3.id"
					></el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
	export default {
		name: "CategorySelector",
		props:['disabled'],
		data() {
			return {
				//初始化分类列表
				category1List: [],
				category2List: [],
				category3List: [],
				//初始化用来搜集数据的对象
				categoryForm: {
					category1Id: "",
					category2Id: "",
					category3Id: "",
				},
			};
		},
		methods: {
			//请求获取一级分类
			async getCategory1List() {
				try {
					const result = await this.$API.category.getCategory1();
					if (result.code === 200 || result.code === 20000) {
						this.category1List = result.data;
					}
				} catch (error) {
					this.$message.error("获取一级分类列表失败");
				}
			},
			//当一级分类 或 二级分类 被选中时，根据收集到的 一、二级分类id 请求获取二、三级分类数据
            //根据传递的标识判断是 c1 / c2
			async handlecategory(type,id) {
                //如果是 c1 的change事件，额外情况 c2 相关的数据
                if(type === 1){
                    this.categoryForm.category2Id = ''
                    this.category2List = []
                }
                //不管是 c1 或 c2 的change 事件都清空 c3 相关的数据
                this.categoryForm.category3Id = ''
                this.category3List = []
                //计算获取的目标分类级别标识
				const target = type + 1;
				try {
					const result = await this.$API.category[`getCategory${target}`](id);
					this.$emit('changeCategory',{categoryId:id,level:type})
					if (result.code === 200 || result.code === 20000) {
						this[`category${target}List`] = result.data;
					}
				} catch (error) {
					this.$message.error(
						`获取${target === 2 ? '二' : '三'}级分类列表失败`
					);
				}
			},
			getAttrList(id) {
                this.$emit('changeCategory',{categoryId:id,level:3})
            },
		},
		mounted() {
			this.getCategory1List();
		},
	};
</script>

<style>
</style>
