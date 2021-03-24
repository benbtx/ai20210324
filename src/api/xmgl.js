import request from '@/utils/request'

// export function fetchList(query) {
//   return request({
//     url: '/vue-element-admin/article/list',
//     method: 'get',
//     params: query,
//     // baseURL: 'xxxx' // 直接通过覆盖的方式
//   })
// }
export function getXMGLList(data) {
  return request({
    // url: '/workspaces',
    // url: '/workspaces?page=0&per_page=12&type=all',
    url: '/workspaces?type=all',

    // url: '/workLine/getWorkLineByPage',
    // url: '/vue-element-admin/article/list',
    method: 'get',
    params: data
  })
}
export function addXMGL(data) {
  return request({
    url: '/workspaces',
    method: 'post',
    data
  })
}
export function deleteXMGL(data) {
  return request({
    url: '/workspaces/' + data,
    method: 'delete'
    // data
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/vue-element-admin/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}
