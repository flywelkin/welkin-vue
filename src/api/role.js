import request from '@/utils/request'

export function getRoleList(data) {
  return request({
    url: '/role/list',
    method: 'post',
    data
  })
}

export function getById(id) {
  return request({
    url: `/role/${id}`,
    method: 'get'
  })
}

export function saveRole(data) {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/role',
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/role/${id}`,
    method: 'delete'
  })
}

export function getCurrentRoles() {
  return request({
    url: 'current/role/list',
    method: 'get'
  })
}
