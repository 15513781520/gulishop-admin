<template>
	<div>
		<!-- 添加按钮 -->
		<el-button type="primary" icon="el-icon-plus" @click="showAdd"
			>添加</el-button
		>
		<!-- table表格 用来展示数据 -->
		<el-table
			:data="trademarkList"
			border
			style="width: 100%; margin: 20px 0"
		>
			<el-table-column
				prop="prop"
				label="序号"
				type="index"
				width="80"
				align="center"
			>
			</el-table-column>
			<el-table-column
				prop="tmName"
				label="品牌名称"
				width="width"
				align="center"
			>
			</el-table-column>
			<el-table-column
				prop="prop"
				label="品牌LOGO"
				width="width"
				align="center"
			>
				<template slot-scope="{ row, $index }">
					<img :src="row.logoUrl" style="width: 80px; height: 60px" />
				</template>
			</el-table-column>
			<el-table-column prop="prop" label="操作" width="width">
				<template slot-scope="{ row, $index }">
					<el-button
						type="warning"
						icon="el-icon-edit"
						size="mini"
						@click="showUpdate(row)"
						>修改</el-button
					>
					<el-button
						type="danger"
						icon="el-icon-delete"
						size="mini"
						@click="deleteTrademark(row)"
						>删除</el-button
					>
				</template>
			</el-table-column>
		</el-table>

		<!-- 分页器 -->
		<!--       @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
 -->
		<el-pagination
			background
			style="text-align: center"
			:current-page="page"
			:page-sizes="[3, 5, 7]"
			:page-size="limit"
			layout="prev, pager, next, jumper, sizes,total"
			:total="total"
			@size-change="handleSizeChange"
			@current-change="getList"
		>
		</el-pagination>

		<!-- dialog 呆郎葛 -->
		<el-dialog
			:title="tmForm.id ? '修改品牌' : '添加品牌'"
			:visible.sync="dialogFormVisible"
			width="30%"
		>
			<el-form :model="tmForm" :rules="rules" ref="tmForm">
				<el-form-item
					label="品牌名称"
					prop="tmName"
					label-width="100px"
				>
					<el-input
						v-model="tmForm.tmName"
						autocomplete="off"
						style="width: 80%"
					></el-input>
				</el-form-item>
				<el-form-item
					label="品牌LOGO"
					prop="logoUrl"
					label-width="100px"
				>
					<el-upload
						class="avatar-uploader"
						action="/dev-api/admin/product/fileUpload"
						:show-file-list="false"
						:on-success="handleAvatarSuccess"
						:before-upload="beforeAvatarUpload"
					>
						<img
							v-if="tmForm.logoUrl"
							:src="tmForm.logoUrl"
							class="avatar"
						/>
						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
						<div class="el-upload__tip" slot="tip">
							只能上传jpg文件，且不超过2Mb
						</div>
					</el-upload>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogFormVisible = false">取 消</el-button>
				<el-button type="primary" @click="addOrUpdate">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		name: "TrademarkList",
		data() {
			//自定义验证规则的函数
			const validateTmName = (rule, value, callback) => {
				if (value.length < 2 || value.length >10) {
					callback(new Error("品牌名称的长度应在 2 ~ 10 个字符之间"));
				} else {
					callback();
				}
			};
			return {
				//初始化请求参数
				page: 1,
				limit: 3,

				//初始化请求到的总数据数和数据列表
				total: 0,
				trademarkList: [],

				//控制 dialog 显示隐藏的数据
				dialogFormVisible: false,

				//收集到的表单数据
				tmForm: {
					tmName: "",
					logoUrl: "",
				},
				rules: {
					//表单验证规则对象
					//品牌名称验证规则，验证的是 tmForm 中的 tmName 字段 ， 需要和表单项中 prop 中的 属性值对应
					tmName: [
						{
							required: true, //必须填写
							message: "请输入品牌名称", //错误提示
							trigger: "blur", //失去焦点时触发验证
						},
						//使用自定义的验证规则，是一个函数
						{
							validator: validateTmName,
							trigger: "change",
						},
						// {
						// 	min: 2, //最小长度
						// 	max: 10, //最大长度
						// 	message: "长度在 2 到 10 个字符", //错误提示
						// 	trigger: "change", //内容发生改变时触发验证
						// },
					],
					//品牌LOGO 图片url验证规则，验证的是 tmForm 中的 logoUrl 字段 ， 需要和表单项中 prop 中的 属性值对应
					logoUrl: [
						{
							required: true, //必须上传
							message: "请上传品牌LOGO", //错误提示  uploda 无法触发验证，只能整体验证
						},
					],
				},
			};
		},
		methods: {
			//调用 api 发送请求获取品牌相关数据
			async getList(originPage = 1) {
				this.page = originPage;
				const { page, limit } = this;
				try {
					const result = await this.$API.trademark.getList(page, limit);
					if (result.code === 200 || result.code === 20000) {
						this.total = result.data.total;
						this.trademarkList = result.data.records;
					}
				} catch (error) {}
			},
			//每页条数改变的回调
			handleSizeChange(size) {
				this.limit = size;
				this.getList();
			},
			//上传成功的回调函数
			handleAvatarSuccess(res, file) {
				//将图片上传请求回来的图片路径更新到data中
				this.tmForm.logoUrl = res.data;
			},
			//上传之前的回调函数
			beforeAvatarUpload(file) {
				const isJPG = file.type === "image/jpeg";
				const isGIF = file.type === 'image/gif'
				const isLt2M = file.size / 1024 / 1024 < 2;
				if (!isJPG && !isGIF) {
					this.$message.error("上传头像图片只能是 JPG 格式!");
				}
				if (!isLt2M) {
					this.$message.error("上传头像图片大小不能超过 2MB!");
				}
				return isJPG || isGIF && isLt2M;
			},
			//添加按钮事件
			showAdd() {
				//初始化 tmForm 中的数据
				this.tmForm = {
					tmName: "",
					logoUrl: "",
				};
				//显示 dialog
				this.dialogFormVisible = true;
			},
			//修改按钮的事件
			showUpdate(row) {
				//将 要修改的 品牌对象拷贝给 tnFrom
				this.tmForm = { ...row };
				//显示 dialog
				this.dialogFormVisible = true;
			},
			//添加或修改
			addOrUpdate() {
				//真正发请求添加前先对表单进行整体验证
				this.$refs.tmForm.validate(async (valid) => {
					if (valid) {
						//验证通过发送请求添加或修改数据
						const { tmForm } = this;
						try {
							//判断 tmForm.id 是否存在，存在表示修改，不存在表示添加
							if (tmForm.id) await this.$API.trademark.update(tmForm);
							else await this.$API.trademark.add(tmForm);
							//请求成功，提示用户，重新获取数据，添加回到第一页，修改留在当前页,关闭 dialog
							this.$message.success(
								tmForm.id
									? `修改${tmForm.tmName}成功`
									: `添加${tmForm.tmName}成功`
							);
							this.getList(tmForm.id ? this.page : 1);
							this.dialogFormVisible = false;
						} catch (error) {
							//请求失败，提示用户
							this.$message.error(
								tmForm.id
									? `修改${tmForm.tmName}失败`
									: `添加${tmForm.tmName}失败`
							);
						}
					} else {
						this.$message.error("请检查内容是否正确！");
						console.log("error submit!!");
						return false;
					}
				});
			},
			//删除品牌
			deleteTrademark(row) {
				this.$confirm(`你确定删除 ${row.tmName} 吗？`)
					.then(async () => {
						try {
							await this.$API.trademark.delete(row.id);
							this.$message.success(`删除${row.tmName}成功`);
							this.getList(
								this.trademarkList.length > 1
									? this.page
									: this.page - 1
							);
						} catch (error) {
							this.$message.error(`删除${row.tmName}失败`);
						}
					})
					.catch(() => {
						this.$message({
							type: "info",
							message: "已取消删除",
						});
					});
			},
		},
		mounted() {
			this.getList();
		},
	};
</script>

<style>
	.avatar-uploader .el-upload {
		border: 1px dashed #d9d9d9;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}
	.avatar-uploader .el-upload:hover {
		border-color: #409eff;
	}
	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 178px;
		height: 178px;
		line-height: 178px;
		text-align: center;
	}
	.avatar {
		width: 178px;
		height: 178px;
		display: block;
	}
</style>
