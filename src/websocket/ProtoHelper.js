import dsprotoJson from '@/websocket/ProtoMsg.json'
import protobuf from 'protobufjs'

class ProtoHelper {
  constructor() {
    const root = protobuf.Root.fromJSON(dsprotoJson)
    this.HeadType = root.lookup('proto.HeadType')
    this.NotifyType = root.lookup('proto.NotifyType')
    this.MessageType = root.lookup('proto.MessageType')
    this.MessageHeartBeat = root.lookup('proto.MessageHeartBeat')
    this.MessageNotification = root.lookup('proto.MessageNotification')
    this.LoginRequest = root.lookup('proto.LoginRequest')
    this.LoginResponse = root.lookup('proto.LoginResponse')
    this.MessageRequest = root.lookup('proto.MessageRequest')
    this.MessageResponse = root.lookup('proto.MessageResponse')
    this.Message = root.lookup('proto.Message')
  }
}

export default new ProtoHelper()
