//引入并暴露


//合并各个模块的 api 请求函数，一起暴露出去

//品牌管理相关 api 模块
export { default as trademark} from './product/trademark'

//三级分类联动相关 api 模块
export { default as category } from './product/category'

//属性管理相关 api 模块
export { default as attr } from './product/attr'


// {
//     trademark
// }