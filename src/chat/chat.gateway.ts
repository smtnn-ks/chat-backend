import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { ChatService } from './chat.service'
import { Server, Socket } from 'socket.io'
import { CreateMessageDto } from './dto'
import { SignedMessage } from './types'

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private readonly chatService: ChatService) {}

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.id
    if (typeof userId === 'string' && userId !== 'null') {
      this.chatService.handleConnection(userId, socket.id)
      this.chatService.getPendingMessage(userId).then((result) => {
        if (result.length > 0) {
          // FIXME: This is ugly
          setTimeout(
            () => socket.emit('pending', result as SignedMessage[]),
            1000,
          )
        }
      })
    } else {
      console.warn(
        `WARN :: socket ${socket.id} is trying to connect without 'userId' provided`,
      )
      socket.disconnect()
    }
  }

  handleDisconnect(socket: Socket) {
    return this.chatService.handleDisconnect(socket.id)
  }

  @SubscribeMessage('createMessage')
  async createMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    const messageToSend = await this.chatService.createMessage(createMessageDto)
    if (messageToSend) {
      this.server
        .fetchSockets()
        .then((sockets) =>
          sockets.find((socket) => socket.id === messageToSend.socketId),
        )
        .then((socket) => socket.emit('message', messageToSend.signedMessage))
    }
  }
}
