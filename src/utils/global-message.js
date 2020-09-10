import { Notification, MessageBox } from 'element-ui'

export const success = message => {
  Notification({
    title: message != null ? message : '操作成功',
    type: 'success',
    showClose: true,
    duration: 5 * 1000
  })
}

export const warning = message => {
  Notification({
    title: message != null ? message : '操作失败',
    type: 'warning',
    showClose: true,
    duration: 5 * 1000
  })
}

export const error = message => {
  Notification({
    title: message != null ? message : '操作失败',
    type: 'error',
    showClose: true,
    duration: 5 * 1000
  })
}

export const messageBox = message => {
  return new Promise((resolve, reject) => {
    const showMessage = message && message !== '' ? message + ', 是否继续' : '是否继续'
    MessageBox.confirm(`${showMessage}`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      resolve(true)
    }).catch(() => {
      reject(false)
    })
  })
}

