<template>
  <div class="chat">
    <div class="chat-content">
      <div class="chat-tools" />
      <div class="chat-user-list">
        <div class="search" />
        <div class="list user-list-overflow">
          <div v-for="(item, index) in this.$store.getters.chat.users" :key="index" class="user-item" @click="changeUser(item)">
            <img :src="item.avatar" class="avatar" alt="">
            <div class="name">
              <span>{{ item.nickName }}</span>
            </div>
            <div class="update-time">
              <span>{{ item.updateTime }}</span>
            </div>
          </div>
        </div>

      </div>
      <div class="chat-right">
        <div class="chat-right-top" />
        <div class="chat-right-content-show custom-overflow">
          <div v-for="(item, index) in messageList" :key="index" class="chat-right-content-message">
            <div :class="item.type+'-message-content'">
              <div :class="item.type+'-user-image'">
                <img :src="item.avatar" class="user-avatar" alt="">
              </div>
              <div :class="item.type+'-message'">
                <span>{{ item.message }}</span>
              </div>
            </div>
            <div class="clear" />
          </div>
        </div>
        <div class="chat-right-content-send">
          <textarea v-model="sendMessage" maxlength="1000" class="chat-right-content-textarea custom-overflow" />
        </div>
        <div class="chat-right-content-send-button">
          <el-button size="mini" @click="onSend()">发送</el-button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

import { v4 as uuidv4 } from 'uuid'
import { websocket } from '@/websocket/websocket'
import protoHelper from '@/websocket/ProtoHelper'
import { warning } from '@/utils/global-message'

export default {
  name: '',
  data() {
    return {
      sendMessage: '',
      messageList: [],
      websocket: null
    }
  },
  mounted() {
    this.initFriends()
    this.initWbeSocket()
  },
  methods: {
    async initFriends() {
      this.$store.dispatch('chat/initUsers').then(e => {
        this.messageList = this.$store.getters.chat.users.messages || []
      })
    },
    changeUser(item) {
      this.$store.dispatch('chat/changeUser', item)
      this.messageList = item.messages || []
    },
    initWbeSocket: function() {
      websocket.wsUrl = 'ws://localhost:44890/ws'
      websocket.onMessage = (e) => {
        console.log('回调', e)
        const currentUser = this.$store.getters.chat.currentUser
        if (e.messageRequest.from === currentUser.id) {
          const message = {
            type: 'accept',
            message: e.messageRequest.content,
            avatar: currentUser.avatar
          }
          this.messageList.push(message)
        }
        this.$store.dispatch('chat/commitMessage', e)
      }
      websocket.createWebSocket()
    },
    onSend() {
      if (this.sendMessage === '' || this.sendMessage.trim() === '') {
        warning('不能发送空白消息')
        this.sendMessage = ''
        return false
      }
      const messageId = uuidv4()
      const sendMessage = {
        id: messageId,
        type: 'send',
        message: this.sendMessage,
        avatar: this.$store.getters.user.avatar
      }
      this.messageList.push(sendMessage)
      const messageRequest = protoHelper.MessageRequest.create({
        from: this.$store.getters.user.id,
        to: this.$store.getters.chat.currentUser.id,
        time: new Date().getTime(),
        msgType: protoHelper.MessageType.TXT,
        content: this.sendMessage
      })
      const message = protoHelper.Message.create({
        id: uuidv4(),
        sessionId: '-1',
        type: protoHelper.HeadType.values.MESSAGE_REQUEST,
        messageRequest: messageRequest
      })
      console.log(protoHelper.Message.encode(message).finish())
      websocket.ws.send(protoHelper.Message.encode(message).finish())
      this.sendMessage = ''
    }
  }
}
</script>

<style scoped>
  /*整体布局*/
  .chat {
    width: 100%;
    height: 100%;
    float: right;
    margin: 0 auto;
    background-color: #606266;
  }

  .chat-content {
    width: 1000px;
    height: 100%;
    margin: auto;
    text-align: center;
  }

  .chat-tools {
    float: left;
    width: 50px;
    height: 800px;
    background-color: #2A2E33;
  }

  .chat-user-list {
    float: left;
    width: 180px;
    height: 800px;
    background-color: #E4E1DF;
    overflow: hidden;
  }

  .chat-right {
    float: left;
    width: 770px;
    height: 800px;
    background-color: white;
    overflow: hidden;
  }

  .chat-right-top {
    width: 770px;
    height: 40px;
    background-color: #F5F5F5;
    border-bottom: #E7E7E7 1px solid;
  }

  .chat-right-content-show {
    width: 776px;
    height: 560px;
    background-color: #F5F5F5;
    overflow: scroll
  }

  .chat-right-content-show:hover {
    width: 770px;
  }

  .chat-right-content-send {
    width: 770px;
    height: 160px;
    background-color: #ffffff;
  }

  .chat-right-content-textarea {
    width: 750px;
    height: 150px;
    resize: none;
    border-style: none;
    outline: none;
    margin-top: 6px;
    margin-left: 10px;
    margin-right: 10px;
  }

  .chat-right-content-send-button {
    float: right;
    margin-top: 6px;
    margin-right: 20px;
    border-style: none;
  }

  /*搜索栏样式*/
  .chat-user-list .search {
    width: 180px;
    height: 40px;
    background-color: #EEEBE9;
    border-bottom: #E7E7E7 1px solid;
  }

  /*好友列表样式*/
  .chat-user-list .list {
    width: 186px;
    height: 780px;
    overflow: scroll;
  }

  .chat-user-list .list:hover {
    width: 180px;
  }

  .chat-user-list .user-item {
    width: 174px;
    height: 50px;
    background: #E4E1DF;
  }

  .chat-user-list .user-item:hover {
    background-color: #DFDDDB;
  }

  .chat-user-list .user-item .avatar {
    width: 38px;
    height: 38px;
    float: left;
    margin: 6px;
  }

  .chat-user-list .user-item .name {
    float: left;
    margin-top: 10px;
    margin-left: 4px;
    font-size: 10px;
  }

  .chat-user-list .user-item .update-time {
    float: right;
    margin-top: 10px;
    margin-right: 10px;
    font-size: 8px;
    color: #B9B9B9;
  }

  .user-list-overflow::-webkit-scrollbar {
    width: 6px;
    background-color: #E4E1DF;
  }

  .user-list-overflow::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px #CCC9C7;
    background-color: #E4E1DF;
  }

  .user-list-overflow::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px #E4E1DF;
    border-radius: 10px;
    background-color: #E4E1DF;
  }

  /*滚动条样式*/
  .custom-overflow::-webkit-scrollbar {
    width: 6px;
    background-color: #FFFFFF;
  }

  .custom-overflow::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgb(0 0 0 / 50%);
    background-color: #F5F5F5;
  }

  .custom-overflow::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px #FFFFFF;
    border-radius: 10px;
    background-color: #FFFFFF;
  }

  /*聊天内容显示样式*/
  .chat-right-content-message {
    margin: 0;
    padding-top: 16px;
    padding-bottom: 16px;
    width: 760px;
    /*min-height: 40px;
    text-align: center;
    line-height:60px*/
  }

  /* 清除空白盒子的所有浮动 */
  .clear {
    clear: both;
  }

  .accept-message-content {
    float: left;
    margin-left: 40px;
  }

  .accept-user-image {
    display: inline-block;
    float: left;
    width: 34px;
    height: 34px;
  }

  .accept-message {
    display: inline-block;
    float: left;
    max-width: 500px;
    word-break: break-all;
    padding: 6px 10px;
    margin-left: 10px;
    background: #FFFFFF;
    text-align: left;
  }

  .send-message-content {
    float: right;
    margin-right: 40px;
  }

  .send-user-image {
    display: inline-block;
    float: right;
    width: 34px;
    height: 34px;
  }

  .send-message {
    display: inline-block;
    float: right;
    max-width: 500px;
    word-break: break-all;
    padding: 6px 10px;
    margin-right: 10px;
    background-color: #FFFFFF;
    text-align: left;
  }

  .user-avatar {
    width: 38px;
    height: 38px;
  }
</style>
