import request from '@/utils/request'

export function getOperators() {
  return request({
    url: '/operators',
    method: 'get'
  })
}
export function getDatalinks(id) {
  return request({
    url: '/workspaces/' + id + '/datalinks',
    method: 'get',
    params: {
      page: 0,
      per_page: 1000
    }
  })
}
export function getModels(id) {
  return request({
    url: '/workspaces/' + id + '/models',
    method: 'get',
    params: {
      page: 0,
      size: 1000,
      sort: 'id'
    }
  })
}

// 获取最新
export function getWorkFlowLatest(gzkj, workfilesid) {
  return request({
    url: '/workspaces/' + gzkj + '/workfiles/' + workfilesid + '/versions/latest',
    method: 'get',
  })
}

// 保存
export function saveWorkFlow(gzkj, workfilesid, data) {
  return request({
    url: '/workspaces/' + gzkj + '/workfiles/' + workfilesid + '/versions/'+workfilesid,
    method: 'put',
    data
  })
}
// 运行
export function runWorkFlow(gzkj, workfilesid, engineId, data) {
  return request({
    url: '/workspaces/' + gzkj + '/workfiles/' + workfilesid + '/versions/'+workfilesid+"/run?singleEngineId="+engineId,
    method: 'POST',
    data
  })
}
//历史/workspaces/{wsId}/workfiles/{wfId}/versions/{versionId}/tasks
export function getHistory(gzkj, workfilesid, data) {
  return request({
    url: '/workspaces/' + gzkj + '/workfiles/' + workfilesid + '/versions/'+workfilesid+"/tasks",
    method: 'get',
    params:data
  })
}

