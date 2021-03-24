import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

export function getUserListBySearch(params) {
  return request({
    url: '/admin/users/search',
    method: 'get',
    params
  })
}

export function addUser(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/admin/users/' + id,
    method: 'delete'
  })
}

export function validityUsers(data) {
  return request({
    url: '/admin/users/validity',
    method: 'put',
    data
  })
}

export function updateUsers(id, data) {
  return request({
    url: '/admin/users/' + id,
    method: 'put',
    data
  })
}
//管理权限修改密码
export function resetpwd(id, data) {
  return request({
    url: '/admin/users/' + id + '/resetpwd',
    method: 'put',
    data
  })
}
//
export function resetUserPwd(data) {
  return request({
    url: '/users/changepwd',
    method: 'put',
    data
  })
}

