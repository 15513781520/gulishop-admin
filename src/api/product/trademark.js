import request from '@/utils/request'

export default {

    // DELETE /admin/product/baseTrademark/remove/{id}
    // 删除BaseTrademark
    delete(id){
        return request.delete(`/admin/product/baseTrademark/remove/${id}`)
    },

    // POST /admin/product/baseTrademark/save
    // 新增BaseTrademark
    add(trademark){
        return request.post('/admin/product/baseTrademark/save',trademark)
    },
    // PUT /admin/product/baseTrademark/update
    // 修改BaseTrademark
    update(trademark){
        return request.put('/admin/product/baseTrademark/update',trademark)
    },

    // GET /admin/product/baseTrademark/{page}/{limit}
    // 分页列表
    getList(page,limit){
        return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    }
}

// {
//     default:{}
// }