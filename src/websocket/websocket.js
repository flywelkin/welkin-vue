import protoHelper from '@/websocket/ProtoHelper'
import { getToken } from '@/utils/auth'
import { success, warning } from '@/utils/global-message'
import { v4 as uuidv4 } from 'uuid'

export const websocket = {
  heart: null,
  ws: null, // 判断当前浏览器是否支持WebSocket
  lockReconnect: false, // 避免ws重复连接
  wsUrl: '', // 连接地址
  onMessage: function(e) { // 获取推送信息后的处理方法

  },
  /**
   * 创建websocket连接
   */
  createWebSocket: function() {
    try {
      if ('WebSocket' in window) {
        this.ws = new WebSocket(this.wsUrl)
        this.ws.binaryType = 'arraybuffer'
      } else {
        console.log('您的浏览器不支持websocket协议！')
      }
      this.initEventHandle()
    } catch (e) {
      this.reconnect(this.url)
      console.log(e)
    }
  },

  /**
   * 连接创建 后的初始化方法
   * 1.断开重试连接
   * 2.错误重试连接
   * 3.创建成功后重置心跳检测
   * 4.只收服务器推送后的处理发放
   * 5.浏览器关闭手动关闭连接
   */
  initEventHandle: function() {
    this.ws.onclose = () => {
      this.reconnect(this.wsUrl)
      console.log('连接关闭!')
    }
    this.ws.onerror = () => {
      this.reconnect(this.wsUrl)
      console.log('连接错误!')
    }
    this.ws.onopen = () => {
      // 首次连接发送个人信息
      this.ws.send(this.getLoginInfo())
      // 心跳检测重置
      this.heartCheckReset()
      console.log('连接成功!')
    }
    this.ws.onmessage = (e) => {
      // 心跳检测重置
      this.heartCheckReset()
      const message = protoHelper.Message.decode(new Uint8Array(e.data))
      console.log(message)
      if (message.type === protoHelper.HeadType.values.LOGIN_RESPONSE) {
        const loginResponse = message.loginResponse
        if (loginResponse.success) {
          // success('登录成功')
        } else {
          warning(loginResponse.info)
        }
      } else if (message.type === protoHelper.HeadType.values.KEEPALIVE_REQUEST) {
        // console.log('心跳返回')
      } if (message.type === protoHelper.HeadType.values.MESSAGE_REQUEST) {
        this.onMessage(message)
      }
    }
    // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = () => {
      this.ws.close()
    }
  },

  // 重试连接
  reconnect: function(url) {
    if (this.lockReconnect) return
    this.lockReconnect = true
    setTimeout(() => { // 没连接上会一直重连，设置延迟避免请求过多
      this.createWebSocket(url)
      this.lockReconnect = false
    }, 2000)
  },

  // 心跳检测
  timeout: 1000 * 50,
  timeoutObj: null,
  serverTimeoutObj: null,
  heartCheckReset: function() {
    clearTimeout(this.timeoutObj)
    clearTimeout(this.serverTimeoutObj)
    this.timeoutObj = setTimeout(() => {
      // 这里发送一个心跳，后端收到后，返回一个心跳消息，
      // onmessage拿到返回的心跳就说明连接正常,然后重置心跳检测
      this.ws.send(this.getHeartInfo())
      this.serverTimeoutObj = setTimeout(() => { // 如果超过一定时间还没重置，说明后端主动断开了
        this.ws.close() // 如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
      }, this.timeout)
    }, this.timeout)
  },
  getLoginInfo: function() {
    const loginRequest = protoHelper.LoginRequest.create({
      token: getToken()
    })
    const message = protoHelper.Message.create({
      id: uuidv4(),
      sessionId: '-1',
      type: protoHelper.HeadType.values.LOGIN_REQUEST,
      loginRequest: loginRequest
    })
    return protoHelper.Message.encode(message).finish()
  },
  getHeartInfo: function() {
    const messageHeartBeat = protoHelper.MessageHeartBeat.create({
      content: 'ping'
    })
    const message = protoHelper.Message.create({
      id: uuidv4(),
      sessionId: '-1',
      type: protoHelper.HeadType.values.KEEPALIVE_REQUEST,
      messageHeartBeat: messageHeartBeat
    })
    return protoHelper.Message.encode(message).finish()
  }
}
