<template>
	<div>
		<el-card>
			<CategorySelector
				@changeCategory="changeCategory"
			></CategorySelector>
		</el-card>
		<el-card style="margin: 20px 0">
			<div v-show="isShowList">
				<el-button
					type="primary"
					icon="el-icon-plus"
					:disabled="!attrList.length"
					@click="showAdd"
					>添加属性</el-button
				>
				<el-table
					:data="attrList"
					border
					style="width: 100%; margin: 20px 0"
				>
					<el-table-column
						type="index"
						align="center"
						label="序号"
						width="80"
					>
					</el-table-column>
					<el-table-column
						prop="attrName"
						label="属性名称"
						width="200"
					>
					</el-table-column>
					<el-table-column label="属性值列表" width="width">
						<template slot-scope="{ row, $index }">
							<el-tag
								style="margin-right: 10px"
								type="success"
								v-for="(attrValue, index) in row.attrValueList"
								:key="attrValue.id"
								>{{ attrValue.valueName }}</el-tag
							>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="200">
						<template slot-scope="{ row, $index }">
							<HintButton
								type="warning"
								icon="el-icon-edit"
								title="修改"
								size="mini"
								@click="showUpdate(row)"
							></HintButton>
							<HintButton
								type="danger"
								icon="el-icon-delete"
								title="删除"
								size="mini"
							></HintButton>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div v-show="!isShowList">
				<el-form :inline="true" :model="attrForm">
					<el-form-item label="属性名称">
						<el-input
							v-model="attrForm.attrName"
							placeholder="请输入属性名"
						></el-input>
					</el-form-item>
				</el-form>
				<el-button
					type="primary"
					icon="el-icon-plus"
					@click="addAttrValue"
					>添加属性值</el-button
				>
				<el-button @click="isShowList = true">取消</el-button>
				<el-table
					:data="attrForm.attrValueList"
					border
					style="width: 100%; margin: 20px 0"
				>
					<el-table-column
						type="index"
						align="center"
						label="序号"
						width="80"
					>
					</el-table-column>
					<el-table-column label="属性值名称" width="width">
						<template slot-scope="{ row, $index }">
							<el-input
								v-model="row.valueName"
								placeholder="请输入属性值"
							></el-input>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="width">
					</el-table-column>
				</el-table>
				<el-button type="primary">保存</el-button>
				<el-button @click="isShowList = true">取消</el-button>
			</div>
		</el-card>
	</div>
</template>

<script>
	import CloneDeep from 'lodash/cloneDeep'

	export default {
		name: "AttrList",
		data() {
			return {
				//初始化 分类 id
				category1Id: "",
				category2Id: "",
				category3Id: "",
				//初始化属性列表
				attrList: [],
				//控制 显示 属性列表 还是显示 添加修改界面
				isShowList: true,
				//初始化用来收集 添加 / 修改 的数据 对象
				attrForm: {
					//添加 / 修改 的属性名
					attrName: "",
					//添加 / 修改的属性值数组
					attrValueList: [
						// {
						// 	attrId: 0, //属性值所属的属性 id
						// 	id: 0, //属性值的 id
						// 	valueName: "string",  //属性值
						// },
					],
					//
					categoryId: 0, //三级分类的 id
					categoryLevel: 3, //几级分类 ，写死为 3
				},
			};
		},
		methods: {
			//绑定给 三级联动 组件的回调，用来保存传递过来的分类 id，并根据分类 id 执行不同的逻辑
			changeCategory({ categoryId, level }) {
				if (level === 1) {
					//1 代表用户点击的是一级分类，保存一级分类 id，重置 2、3级分类 id 和 属性列表
					this.category1Id = categoryId;
					this.category2Id = this.category3Id = "";
					this.attrList = [];
				} else if (level === 2) {
					//2 代表用户点击的是二级分类，保存二级分类 id，重置 3级分类 id 和 属性列表
					this.category2Id = categoryId;
					this.category3Id = "";
					this.attrList = [];
				} else {
					//3 代表用户点击的是三级分类，保存三级分类 id，发送请求获取对应的属性列表数据
					this.category3Id = categoryId;
					this.getAttrList();
				}
			},

			//根据 1、2、3 级分类 id 获取属性列表的方法
			async getAttrList() {
				const { category1Id, category2Id, category3Id } = this;
				try {
					const result = await this.$API.attr.getAttrList(
						category1Id,
						category2Id,
						category3Id
					);
					if (result.code === 200 || result.code === 20000) {
						this.attrList = result.data;
					}
				} catch (error) {
					this.$message.error("获取属性列表失败");
				}
			},
			//点击添加属性隐藏属性列表显示添加 / 更新界面
			showAdd() {
				this.attrForm = {
					//添加 / 修改 的属性名
					attrName: "",
					//添加 / 修改的属性值数组
					attrValueList: [],
					categoryId: this.category3Id, //三级分类的 id
					categoryLevel: 3, //几级分类 ，写死为 3
				};
				this.isShowList = false;
			},
			showUpdate(row){
				this.attrForm = CloneDeep(row)
				this.isShowList = false
			},
			addAttrValue() {
				this.attrForm.attrValueList.push({
					attrId: this.attrForm.categoryId, //属性值所属的属性 id
					valueName: "", //属性值
				});
			},
		},
	};
</script>

<style>
</style>
