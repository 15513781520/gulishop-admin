import request from '@/utils/request'

export default {
    // GET /admin/product/{page}/{limit}
    // index
    //获取 spu 列表
    getSpuList(page,limit,category3Id){
        return request.get(`/admin/product/${page}/${limit}`,{params:{category3Id}})
    },

    // GET /admin/product/baseSaleAttrList
    // getBaseSaleAttrList  获取所有的销售属性
    getBaseSaleAttrList(){
        return request.get('/admin/product/baseSaleAttrList')
    },

    // GET /admin/product/baseTrademark/getTrademarkList
    // getTrademarkList  获取所有品牌
    getTrademarkList(){
        return request.get('/admin/product/baseTrademark/getTrademarkList')
    },

    // GET /admin/product/getSpuById/{spuId}
    // 获取spu基本信息
    getSpuInfo(spuId){
        return request.get(`/admin/product/getSpuById/${spuId}`)
    },

    // GET /admin/product/spuImageList/{spuId}
    // getSpuImageList  获取spu的图片列表
    getSpuImageList(spuId){
        return request.get(`/admin/product/spuImageList/${spuId}`)
    },

    // POST /admin/product/saveSpuInfo
    // saveSpuInfo 保存spu
    // POST /admin/product/updateSpuInfo
    // 更改spu信息
    addUpdate(skuInfo){
        return request.post(`/admin/product/${skuInfo.id ? 'update' : 'save'}SpuInfo`,skuInfo)
    },

    // DELETE /admin/product/deleteSpu/{spuId}
    // deleteSpu  //根据 id 删除SPU
    removeSpu(spuId){
        return request.delete(`/admin/product/deleteSpu/${spuId}`)
    }
}