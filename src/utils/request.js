import axios from 'axios'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { error } from '@/utils/global-message'
import { Loading } from 'element-ui'
// eslint-disable-next-line no-unused-vars
let loadingInstance = null

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  timeout: 5000 // request timeout
})

// 请求拦截，添加认证头信息
service.interceptors.request.use(
  config => {
    // 开始进度条
    loadingInstance = Loading.service({ fullscreen: true, background: 'rgba(0, 0, 0, 0.1)' })
    const token = getToken()
    if (token) {
      config.headers.user_token = `${token}`
    }
    return config
  },
  error => {
    if (loadingInstance) {
      loadingInstance.close()
    }
    console.log(error.message)
    return Promise.reject(error)
  }
)

// 响应拦截器，判断返回状态，提示错误返回结果
service.interceptors.response.use(
  response => {
    if (loadingInstance) {
      loadingInstance.close()
    }
    const { code, message } = response.data
    if (code !== 200) {
      error(message)
      // 非法令牌/令牌已过期
      if (code === 401) {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      }
      return Promise.reject(new Error(message || 'Error'))
    } else {
      return response.data
    }
  },
  error => {
    if (loadingInstance) {
      loadingInstance.close()
    }
    error(error.message)
    return Promise.reject(error)
  }
)

export default service
