import request from '@/utils/request'
import qs from 'qs'

export function getUserInfo() {
  return request({
    url: '/auth/user/info',
    method: 'get'
  })
}
export function login(params) {
  const data = qs.stringify(params)
  return request({
    config: {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    },
    url: '/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

