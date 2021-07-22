import request from '@/utils/request'

export function getTasks(data) {
  return request({
    url: '/tasks',
    method: 'post',
    data
  })
}

export function addTask(data) {
  return request({
    url: '/task',
    method: 'post',
    data
  })
}

export function updateTask(data) {
  return request({
    url: '/task',
    method: 'put',
    data
  })
}

export function updateTaskStatus(data) {
  return request({
    url: '/task/status',
    method: 'put',
    data
  })
}

export function deleteTask(id) {
  return request({
    url: `/task/${id}`,
    method: 'delete'
  })
}

export function runJobNow(data) {
  return request({
    url: '/task/run',
    method: 'post',
    data
  })
}
