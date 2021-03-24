import request from '@/utils/request'

// export function fetchList(query) {
//   return request({
//     url: '/vue-element-admin/article/list',
//     method: 'get',
//     params: query,
//     // baseURL: 'xxxx' // 直接通过覆盖的方式
//   })
// }
export function getGZKJSearch(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/search',
    method: 'get',
    params: data
  })
}
export function getUserList(params) {
  return request({
    url: '/users/search',
    method: 'get',
    params
  })
}
export function getMembers(data) {
  return request({
    url: '/workspaces/' + data.id + '/members',
    method: 'get',
    params: data
  })
}
export function getMemberships(data) {
  return request({
    url: '/workspaces/' + data.id + '/memberships',
    method: 'get',
    params: data
  })
}

export function addMembers(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/members',
    method: 'post',
    data
  })
}

export function getActivities(data) {
  return request({
    // url: '/activities?entity_type=workspace',
    url: '/activities',
    method: 'get',
    params: data
  })
}
export function getGZKJList(data) {
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
export function addGZKJ(data) {
  return request({
    url: '/workspaces',
    method: 'post',
    data
  })
}
// export function updateGZKJ(data) {
//   return request({
//     url: '/workspaces/'+data.id,
//     method: 'put',
//     data
//   })
// }
export function updateGZKJ(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj,
    method: 'put',
    data
  })
}
export function deleteGZKJ(data) {
  return request({
    url: '/workspaces/' + data,
    method: 'delete'
    // data
  })
}
export function getGZKJUsers(data) {
  return request({
    url: '/users/email',
    method: 'get',
    params: data
  })
}

export function getDatasets(params) {
  return request({
    url: '/datasets/root',
    method: 'get',
    params
  })
}
export function getChildren(id) {
  return request({
    url: '/datasets/' + id + '/children',
    method: 'get'
  })
}
export function getChildrenExclude(id,data) {
  return request({
    url: '/datasets/' + id + '/childrenExclude',
    method: 'get',
    params: data
  })
}

export function getGZKJDatasetsList(data) {
  return request({
    // url: '/workspaces',
    // url: '/workspaces?page=0&per_page=12&type=all',
    // url: '/workspaces?type=all',
    // url: '/workspaces/18/datalinks',
    url: '/workspaces/' + data.id + '/datalinks',
    // url: '/workLine/getWorkLineByPage',
    // url: '/vue-element-admin/article/list',
    method: 'get',
    params: data
  })
}
export function deleteGZKJDatasets(gzkj, dataSetsid) {
  return request({
    url: '/workspaces/' + gzkj + '/datalinks/' + dataSetsid,
    method: 'delete'
    // data
  })
}
export function updateGZKJDatasets(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/datalinks',
    method: 'post',
    data
  })
}
export function getWorkFilesList(data) {
  return request({
    url: '/workspaces/' + data.id + '/workfiles?order=created_at',
    // url: '/workspaces/' + data.id + '/workfiles',
    method: 'get',
    params: data
  })
}
export function addWorkFiles(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/workfiles',
    method: 'post',
    data
  })
}
export function updateWorkFiles(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/workfiles/' + data.id,
    method: 'put',
    data
  })
}
export function deleteWorkFiles(gzkj, id) {
  return request({
    url: '/workspaces/' + gzkj + '/workfiles/' + id,
    method: 'delete',
    // params: data
  })
}
// 上传
export function uploadWorkFiles(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/workfiles/import',
    method: 'post',
    data
  })
}
// 下载
export function downloadWorkFiles(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/workfiles/export',
    method: 'get',
    params: data,
    responseType: 'blob'
  })
}
// 发布
export function publishWorkFiles(gzkj, workfilesid, data) {
  return request({
    url: '/workspaces/' + gzkj + '/models/workfiles/' + workfilesid + '/singleEngine/1/deploy',
    method: 'post',
    data
  })
}
export function getJobsList(data) {
  return request({
    url: '/workspaces/' + data.id + '/jobs',
    method: 'get',
    params: data
  })
}
export function addJobs(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/jobs',
    method: 'post',
    data
  })
}
export function updateJobs(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/jobs/' + data.id,
    method: 'put',
    data
  })
}
export function deleteJobs(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/jobs/' + data.id,
    method: 'delete'
    // params: data
  })
}
export function getJob(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/jobs/' + data.id,
    method: 'get'
    // params: data
  })
}
export function deleteJobWorkFileVersion(gzkj, jobid, data) {
  return request({
    url: '/workspaces/' + gzkj + '/jobs/' + jobid + '/jobWorkFileVersion',
    method: 'delete',
    data
  })
}
export function addJobWorkFileVersion(gzkj, jobid, data) {
  return request({
    url: '/workspaces/' + gzkj + '/jobs/' + jobid + '/jobWorkFileVersion',
    method: 'post',
    data
  })
}

export function updateJobWorkFileVersion(gzkj, jobid, jobwfv, data) {
  return request({
    url: '/workspaces/' + gzkj + '/jobs/' + jobid + '/jobWorkFileVersion/' + jobwfv,
    method: 'put',
    data
  })
}
export function runJobs(gzkj, jobid) {
  return request({
    url: '/workspaces/' + gzkj + '/jobs/' + jobid + '/run',
    method: 'post'
    // data
  })
}
export function stopJobs(gzkj, jobid) {
  return request({
    url: '/workspaces/' + gzkj + '/jobs/' + jobid + '/stop',
    method: 'post'
    // data
  })
}

export function getGZKJ_RW_LList(data) {
  return request({
    url: '/workspaces/' + data.id + '/jobs',
    method: 'get',
    params: data
  })
}
export function getGZKJ_MX_LList(data) {
  return request({
    url: '/workspaces/' + data.id + '/models',
    method: 'get',
    params: data
  })
}
export function getGZKJ_MXFW_LList(data) {
  return request({
    url: '/workspaces/' + data.id + '/model/servers',
    method: 'get',
    params: data
  })
}

export function getDataSetsRoot(data) {
  return request({
    url: '/datasets/root',
    method: 'get',
    params: data
  })
}
export function getDataSetsChildren(data) {
  return request({
    url: '/datasets/' + data.id + '/children',
    method: 'get',
    params: data
  })
}
export function deleteDataSets(data) {
  return request({
    url: '/workspaces/' + data.gzkjid + '/datalinks/' + data.id,
    method: 'delete'
    // data
  })
}
export function getModels(data) {
  return request({
    url: '/workspaces/' + data.id + '/models',
    method: 'get',
    params: data
  })
}
export function updateModels(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/models/' + data.id,
    method: 'put',
    data
  })
}
export function deleteModels(gzkj, id) {
  return request({
    url: '/workspaces/' + gzkj + '/models/' + id,
    method: 'delete'
    // params: data
  })
}
export function publishModels(gzkj, id) {
  return request({
    url: '/workspaces/' + gzkj + '/models/' + id +"/deploy",
    method: 'post'
    // params: data
  })
}

export function getServers(data) {
  return request({
    url: '/workspaces/' + data.id + '/model/servers',
    method: 'get',
    params: data
  })
}
export function addServers(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/model/servers',
    method: 'post',
    data
  })
}
export function updateServers(gzkj, data) {
  return request({
    url: '/workspaces/' + gzkj + '/model/servers/' + data.id,
    method: 'put',
    data
  })
}
export function deleteServers(gzkj, id) {
  return request({
    url: '/workspaces/' + gzkj + '/model/servers/' + id,
    method: 'delete'
    // params: data
  })
}
export function invokeServers(gzkj, id) {
  return request({
    url: '/workspaces/' + gzkj + '/model/servers/' + id+"/invoke",
    method: 'put'
    // params: data
  })
}

// export function excuteFlow(id) {
//   return request({
//     url: '/icu/execWorkflow/'+id,
//     method: 'post',
//   })
// }
export function excuteFlow(url, contentType, data) {
  return request({
    headers: {
      'Content-Type': contentType
    },
    url: url,
    method: 'post',
    data
  })
}
export function reportView(data) {
  return request({
    url: '/report/getPage',
    method: 'get',
    params: data
  })
}
export function getReportServerInfo(data) {
  return request({
    url: '/report/getReportServerInfo',
    method: 'get',
    params: data
  })
}
export function deleteReport(data) {
  return request({
    url: '/report/deleteById',
    method: 'get',
    params: data
  })
}
