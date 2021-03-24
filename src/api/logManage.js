import request from '@/utils/request'

export function getLogList(params) {
  return request({
    url: '/logSearch',
    method: 'get',
    params
  })
}
