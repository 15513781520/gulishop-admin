<template>
	<div>
		<el-form label-width="100px" :model="spuForm">
			<el-form-item label="SPU名称">
				<el-input
					v-model="spuForm.spuName"
					placeholder="SPU名称"
				></el-input>
			</el-form-item>
			<el-form-item label="品牌">
				<el-select v-model="spuForm.tmId" placeholder="请选择">
					<el-option
						:label="tm.tmName"
						:value="tm.id"
						v-for="(tm, index) in tardemarkList"
						:key="tm.id"
					></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="SPU描述">
				<el-input
					v-model="spuForm.description"
					type="textarea"
					placeholder="SPU描述"
				></el-input>
			</el-form-item>
			<el-form-item label="SPU图片">
				<el-upload
					action="/dev-api/admin/product/fileUpload"
					list-type="picture-card"
					:file-list="spuImgList"
					:on-preview="handlePictureCardPreview"
					:on-remove="handleRemove"
					:on-success="handleSuccess"
				>
					<i class="el-icon-plus"></i>
				</el-upload>
				<el-dialog :visible.sync="dialogVisible">
					<img width="100%" :src="dialogImageUrl" alt="" />
				</el-dialog>
			</el-form-item>
			<el-form-item label="销售属性">
				<el-select
					v-model="saleAttrIdName"
					:placeholder="`还有${unUsedSaleAttrList.length}个未选择`"
				>
					<el-option
						:label="unUsedSaleAttr.name"
						:value="`${unUsedSaleAttr.id}:${unUsedSaleAttr.name}`"
						v-for="(unUsedSaleAttr, index) in unUsedSaleAttrList"
						:key="unUsedSaleAttr.id"
					>
					</el-option>
				</el-select>
				<el-button type="primary" style="margin-left: 10px" :disabled="!saleAttrIdName" @click="addsaleAttr"
					>添加销售属性</el-button
				>
				<el-table
					:data="spuForm.spuSaleAttrList"
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
						prop="saleAttrName"
						label="属性名"
						width="200"
					>
					</el-table-column>
					<el-table-column
						prop="prop"
						label="属性名列表"
						width="width"
					>
						<template slot-scope="{ row, $index }">
							<el-tag
								:key="tag.id"
								v-for="(tag,index) in row.spuSaleAttrValueList"
								closable
								:disable-transitions="false"
								@close="handleClose(row,index)"
							>
								{{ tag.saleAttrValueName }}
							</el-tag>
							<el-input
								class="input-new-tag"
								v-if="row.inputVisible"
								v-model="row.inputValue"
								ref="saveTagInput"
								size="small"
								@keyup.enter.native="handleInputConfirm(row)"
								@blur="handleInputConfirm(row)"
							>
							</el-input>
							<el-button
								v-else
								class="button-new-tag"
								size="small"
								@click="showInput(row)"
								>+ 添加</el-button
							>
						</template>
					</el-table-column>
					<el-table-column prop="prop" label="操作" width="200">
						<template slot-scope="{ row, $index }">
							<HintButton
								type="danger"
								icon="el-icon-delete"
								size="mini"
								title="删除当前销售属性"
								@click="removeSaleAttr($index)"
							></HintButton>
						</template>
					</el-table-column>
				</el-table>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="cancel">取消</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
	export default {
		name: "SpuForm",
		data() {
			return {
				dialogImageUrl: "",
				dialogVisible: false,
				category3Id: "",
				spuImgList: [],
				tardemarkList: [],
				saleAttrList: [],
				//添加时将数据收集到这里
				spuForm: {
					category3Id: "",
					description: "",
					spuName: "",
					tmId: "",
					spuImageList: [
						// {
						// 	id: 0,
						// 	imgName: "string",
						// 	imgUrl: "string",
						// 	spuId: 0,
						// },
					],
					spuSaleAttrList: [
						// {
						// 	baseSaleAttrId: 0,
						// 	saleAttrName: "string",
						// 	spuSaleAttrValueList: [
								// {
								// 	baseSaleAttrId: 0,
								// 	id: 0,
								// 	isChecked: "string",
								// 	saleAttrName: "string",
								// 	saleAttrValueName: "string",
								// 	spuId: 0,
								// },
						// 	],
						// },
					],
				},
				saleAttrIdName: "",
			};
		},
		computed: {
			//未选择的销售属性列表
			unUsedSaleAttrList() {
				return this.saleAttrList.filter((item) => {
					return this.spuForm.spuSaleAttrList.every((item1) => {
						return item1.saleAttrName !== item.name;
					});
				});
			},
		},
		methods: {
			//删除图片墙中文件
			handleRemove(file, fileList) {
				this.spuImgList = fileList;
			},
			//点击放大镜将弹出dialog放大图片
			handlePictureCardPreview(file, fileList) {
				this.dialogImageUrl = file.url;
				this.dialogVisible = true;
			},
			//文件上传成功的钩子
			handleSuccess(res, file, fileList) {
				this.spuImgList = fileList;
			},
			//取消按钮
			cancel() {
				this.$emit("update:visible", false);
				this.$emit('backFromCancel')
				this.resetData()
			},
			//点击修改SPU跳过来的方法
			async fromUpdate(row, category3Id) {
				this.category3Id = category3Id;
				const { id: spuId } = row;
				try {
					const result = await Promise.all([
						this.$API.spu.getSpuInfo(spuId),
						this.$API.spu.getSpuImageList(spuId),
						this.$API.spu.getTrademarkList(),
						this.$API.spu.getBaseSaleAttrList(),
					]);
					if (
						result.every(
							(item) => item.code === 200 || item.code === 20000
						)
					) {
						this.spuForm = result[0].data;
						let spuImgList = result[1].data;
						spuImgList.map((item) => {
							item.name = item.imgName;
							item.url = item.imgUrl;
						});
						this.spuImgList = spuImgList;
						this.tardemarkList = result[2].data;
						this.saleAttrList = result[3].data;
					} else {
						this.$message.info("获取SPU详情失败");
					}
				} catch (error) {
					this.$message.error("请求失败");
				}
			},
			//点击添加SPU跳过来的方法
			async fromAdd(category3Id) {
				this.category3Id = category3Id;
				try {
					const result = await Promise.all([
						this.$API.spu.getTrademarkList(),
						this.$API.spu.getBaseSaleAttrList(),
					]);
					if (
						result.every(
							(item) => item.code === 200 || item.code === 20000
						)
					) {
						this.tardemarkList = result[0].data;
						this.saleAttrList = result[1].data;
					} else {
						this.$message.info("获取品牌列表或销售属性列表失败");
					}
				} catch (error) {
					this.$message.error("请求失败");
				}
			},
			//删除属性值
			handleClose(row,index) {
				row.spuSaleAttrValueList.splice(index,1)
			},
			//点击添加按钮切换为 input 
			showInput(row) {
				this.$set(row,'inputVisible',true)
				this.$set(row,'inputValue','')
				this.$nextTick(() => {
					this.$refs.saveTagInput.focus()
				})
			},
			//input 失去焦点或回车事件的回调
			handleInputConfirm(row) {
				let {inputValue} = row
				//如果输入为空，清空 当前属性的 inputValue ，切换为按钮
				if(inputValue.trim() === ''){
					console.log(1);
					row.inputValue = ''
					row.inputVisible = false
					return
				}

				//如果输入的属性值和其他属性值重复，提示用户，清空输入框
				const isRepeat = row.spuSaleAttrValueList.some(item => {
					return item.saleAttrValueName === inputValue
				})
				if(isRepeat){
					this.$message.info('输入的属性值不能重复')
					row.inputValue = ''
					return
				}

				//如果不为空也不重复，形成对象添加到当前属性的属性值列表中
				let obj = {
					baseSaleAttrId:row.id,
					saleAttrValueName:inputValue
				}
				row.spuSaleAttrValueList.push(obj)
				row.inputValue = ''
				row.inputVisible = false
			},
			//删除销售属性
			removeSaleAttr(index) {
				this.spuForm.spuSaleAttrList.splice(index,1)
			},
			//添加销售属性
			addsaleAttr() {
				const [baseSaleAttrId, saleAttrName] = this.saleAttrIdName.split(
					":"
				);
				let obj = {
					baseSaleAttrId,
					saleAttrName,
					spuSaleAttrValueList: [],
				};
				this.spuForm.spuSaleAttrList.push(obj)
				this.saleAttrIdName = ''
			},
			//保存添加或修改
			async save(){
				//获取请求参数
				let {category3Id,spuImgList,spuForm} = this
				//整理请求参数
				spuForm.category3Id = category3Id

				//整理图片结构
				spuForm.spuImageList = spuImgList.map(item => {
					let obj = {
						imgName:item.imgName || item.name,
						imgUrl:item.imgUrl || item.response.data
					}
					return obj
				})

				//删除销售属性对象身上不需要的属性
				spuForm.spuSaleAttrList.forEach(item => {
					delete item.inputValue
					delete item.inputVisible
				})

				//发送请求
				try {
					const result = await this.$API.spu.addUpdate(spuForm)
					if(result.code === 200 || result.code === 20000){
						//成功
						//提示用户
						this.$message.success('保存成功')
						//清空
						this.resetData()
						//返回列表页
						this.$emit("update:visible", false);
						//通知父亲是通过什么方式返回的
						this.$emit('backFromAddUpdate')
					}else{
						this.$message.info('保存失败')
					}
				} catch (error) {
					//失败
					this.$message.error('请求保存失败')
				}

			},
			resetData(){
				Object.assign(this,this.$options.data())
			}
		},
	};
</script>
<style>
	.el-tag + .el-tag {
		margin-left: 10px;
	}
	.button-new-tag {
		margin-left: 10px;
		height: 32px;
		line-height: 30px;
		padding-top: 0;
		padding-bottom: 0;
	}
	.input-new-tag {
		width: 90px;
		margin-left: 10px;
		vertical-align: bottom;
	}
</style>