import request from '@/utils/request'

export function getDeptList(data) {
  return request({
    url: '/dept/list',
    method: 'post',
    data
  })
}
