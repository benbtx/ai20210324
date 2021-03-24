import request from '@/utils/request'

export function getNum(params) {
  return request({
    url: '/dashboards/totalByUser',
    method: 'Post'
  })
}
export function getWorkFiles(params) {
  return request({
    url: '/dashboards/recent_workfiles5',
    method: 'Post'
  })
}
export function getWorkSpace(params) {
  return request({
    url: '/dashboards/recent_workspace5',
    method: 'Post'
  })
}
export function getLine(params) {
  return request({
    url: '/dashboards/recent7DayIncr',
    method: 'Post'
  })
}

