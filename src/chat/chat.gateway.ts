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

@WebSocketGateway(5001, {
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private readonly chatService: ChatService) {}

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.id
    console.log(`INFO :: userId from handshake: ${userId}`)
    if (typeof userId === 'string' && userId !== 'null') {
      this.chatService.handleConnection(userId, socket.id)
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
