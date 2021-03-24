import request from '@/utils/request'

export function getDatasets(params) {
  return request({
    url: '/datasets/root',
    method: 'get',
    params
  })
}
export function createF(data, id) {
  return request({
    url: '/datasets/' + id,
    method: 'post',
    data
  })
}
export function getChildren(id) {
  return request({
    url: '/datasets/' + id + '/children',
    method: 'get'
  })
}

export function deleteData(id) {
  return request({
    url: '/datasets/' + id,
    method: 'DELETE'
  })
}

export function rename(data, id) {
  return request({
    url: '/datasets/' + id + '/rename',
    method: 'put',
    data
  })
}

export function moveDir(id, moveTo) {
  return request({
    url: '/datasets/' + id + '/move/' + moveTo,
    method: 'put'
  })
}

export function dataShare(id, data) {
  return request({
    url: '/workspaces/' + id + '/datalinks',
    method: 'post',
    data
  })
}

export function getDataShare(id) {
  return request({
    url: '/datasets/' + id + '/workspaces',
    method: 'get'
  })
}

export function getView(id) {
  return request({
    url: '/datasets/' + id + '/view',
    method: 'get'
  })
}

export function search(params) {
  return request({
    url: '/search',
    method: 'get',
    params
  })
}

export function getWorkSpacesexcludeDataSet(params) {
  return request({
    url: '/workspaces/excludeDataSet',
    method: 'get',
    params
  })
}
export function destroyCheck(id) {
  return request({
    url: '/datasets/destroyCheck/'+id,
    method: 'get',
  })
}
export function destoryCheckMultiple(data) {
  return request({
    url: '/datasets/destoryCheckMultiple',
    method: 'POST',
    data
  })
}


