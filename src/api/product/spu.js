import request from '@/utils/request'

export default {
    // GET /admin/product/{page}/{limit}
    // index
    //获取 spu 列表
    getSpuList(page,limit,category3Id){
        return request.get(`/admin/product/${page}/${limit}`,{params:{category3Id}})
    }
}