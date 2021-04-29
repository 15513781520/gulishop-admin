<template>
	<div>
		<el-card>
			<CategorySelector
				@changeCategory="changeCategory"
				:disabled="!isShowList"
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
							<el-popconfirm
								:title="`确定删除${row.attrName}属性吗？`"
								@onConfirm="deleteAttr(row)"
							>
								<HintButton
									slot="reference"
									type="danger"
									icon="el-icon-delete"
									title="删除"
									size="mini"
								></HintButton>
							</el-popconfirm>
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
					:disabled="!attrForm.attrName"
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
								v-if="row.isEdit"
								v-model="row.valueName"
								placeholder="请输入属性值"
								size="mini"
								:ref="$index"
								@blur="toLook(row)"
								@keyup.enter.native="toLook(row)"
							></el-input>
							<span
								v-if="!row.isEdit"
								@click="toEdit(row, $index)"
								style="display: block"
								>{{ row.valueName }}</span
							>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="width">
						<template slot-scope="{ row, $index }">
							<el-popconfirm
								:title="`确定删除${row.valueName}吗？`"
								@onConfirm="
									attrForm.attrValueList.splice($index, 1)
								"
							>
								<HintButton
									slot="reference"
									type="danger"
									icon="el-icon-delete"
									size="mini"
									title="删除当前属性值"
								></HintButton>
							</el-popconfirm>
						</template>
					</el-table-column>
				</el-table>
				<el-button type="primary" @click="save" :disabled="attrForm.attrValueList.length === 0">保存</el-button>
				<el-button @click="isShowList = true">取消</el-button>
			</div>
		</el-card>
	</div>
</template>

<script>
	import CloneDeep from "lodash/cloneDeep";

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
			//点击修改按钮显示修改界面
			showUpdate(row) {
				this.attrForm = CloneDeep(row);
				this.isShowList = false;
				//在修改的时候，需要遍历当前修改的属性对象的属性值数组，
				//为这个属性中所有的属性值都添加一个标志位 isEdit 用来标识属性值的模式
				this.attrForm.attrValueList.forEach((item) => {
					//在点击修改按钮时，数据监视早已结束，新增的属性都不是响应式的
					//vm.$set 方法，可以给指定的响应式对象添加属性，并为这个属性设置响应式
					this.$set(item, "isEdit", false);
				});
			},
			//添加属性值按钮的事件
			addAttrValue() {
				this.attrForm.attrValueList.push({
					attrId: this.attrForm.categoryId, //属性值所属的属性 id
					valueName: "", //属性值
					//属性值有两种状态，一种是新加的，一种是已有的，对应两种模式，一种是编辑模式（新增），一种是查看模式（已有）
					//编辑模式的属性值对应的是 input ，查看模式的属性值是 span
					isEdit: true, //一个标志位，用来标识属性值是编辑模式还是查看模式
				});
				//新增属性值的时候也会创建一个编辑状态的 input ，这个input需要自动获取焦点
				//同样适用 nextTick 来保存能成功获取到 input
				this.$nextTick(() => {
					//新加的属性一定是数组中的最后一个元素，所以他的下标为 属性值数组长度减一
					this.$refs[this.attrForm.attrValueList.length - 1].focus();
				});
			},
			//点击处于查看模式属性值的事件
			toEdit(row, index) {
				//切换到编辑模式
				row.isEdit = true;
				//让切换为编辑模式的属性值输入框获取焦点
				//刚切换为编辑模式时立即去获取 input 元素，input可能还没创建完，此时拿到的是undefined
				//拿到 undefined 操作的时候就会报错，我们要使用 nextTick 保证input 创建完再去获取元素
				this.$nextTick(() => {
					this.$refs[index].focus();
				});
			},
			//点击处于编辑模式属性值的事件
			toLook(row) {
				//判断属性值输入是否为空，是空的清空当前属性值，终止函数调用，不让它切换为查看模式
				if (row.valueName.trim() === "") {
					row.valueName = "";
					return;
				}

				//判断属性值是否和其他属性值重复，重复则提示用户并清空属性值
				//终止函数调用不让它切换为查看模式
				const isRepeat = this.attrForm.attrValueList.some((item) => {
					if (item !== row) {
						return item.valueName === row.valueName;
					}
				});
				if (isRepeat) {
					this.$message.info("属性值不能重复，请检查");
					row.valueName = "";
					return;
				}

				//属性值不为空且不重复，切换到查看模式
				row.isEdit = false;
			},
			//点击保存按钮的事件
			async save() {
				//1.获取请求参数
				const attr = this.attrForm;
				//2.整理参数
				//1）属性值名称如果为空串，从属性值列表当中去除
				//2）删除属性值对象中的 isEdit 属性
				attr.attrValueList = attr.attrValueList.filter((item) => {
					delete item.isEdit;
					return item.valueName.trim() !== "";
				});
				//3）判断属性值数组是否为空，为空则不发送请求并提示用户
				if (attr.attrValueList.length === 0) {
					this.$message.error("属性的属性值不能为空");
					return;
				}
				//发送请求,添加成功提示用户，重新获取属性列表数据，关闭添加 / 修改界面，显示列表页
				try {
					const result = await this.$API.attr.addOrUpdate(attr);
					if (result.code === 200 || result.code === 20000) {
						//4.请求成功逻辑:添加成功提示用户，重新获取属性列表数据，关闭添加 / 修改界面，显示列表页
						this.$message.success(`保存${attr.attrName}属性成功`);
						this.getAttrList();
						this.isShowList = true;
					} else {
						this.$message.info(`保存${attr.attrName}属性失败`);
					}
				} catch (error) {
					//5.请求失败逻辑,提示用户请求失败
					this.$message.error(`请求保存${attr.attrName}属性失败`);
				}
			},
			//点击删除属性按钮的事件
			async deleteAttr(row){
				try {
					const result = await this.$API.attr.deleteAttr(row.id)
					if(result.code === 200 || result.code === 20000){
						this.$message.success(`删除${row.attrName}属性成功`)
						this.getAttrList()
					}else{
						this.$message.info(`删除${row.attrName}属性失败`)
					}
				} catch (error) {
					this.$message.error(`请求删除${row.attrName}属性失败`)
				}
			}
		},
	};
</script>

<style>
</style>
