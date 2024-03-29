import { Injectable } from '@nestjs/common'
import { CryptoService } from 'src/dependencies/crypto/crypto.service'
import { PrismaService } from 'src/dependencies/prisma/prisma.service'
import { CreateMessageDto } from './dto'
import { MessageToSend, SignedMessage } from './types'
import { Server } from 'socket.io'

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {}

  private userToSocket: Record<string, string> = {}

  handleConnection(userId: string, socketId: string) {
    this.userToSocket[userId] = socketId
  }

  handleDisconnect(socketId: string) {
    const index = Object.values(this.userToSocket).findIndex(
      (value) => value === socketId,
    )
    if (index !== -1) {
      const key = Object.keys(this.userToSocket)[index]
      delete this.userToSocket[key]
    }
  }

  async createMessage(
    createMessageDto: CreateMessageDto,
  ): Promise<MessageToSend | null> {
    const signature = this.crypto.signMessageSync(createMessageDto.content)
    const signedMessage: SignedMessage = { ...createMessageDto, signature }
    const socketId = this.userToSocket[createMessageDto.userId]

    if (socketId) return { signedMessage, socketId }

    this.prisma.pendingMessage.create({ data: signedMessage }).catch((e) => {
      throw e
    })
    return null
  }

  async getPendingMessage(userId: string) {
    const result = await this.prisma.pendingMessage.findMany({
      where: { userId },
    })
    this.prisma.pendingMessage.deleteMany({ where: { userId } }).catch((e) => {
      throw e
    })
    return result
  }

  initOnlineListEmitter(server: Server) {
    const getOnlineList = () => Object.keys(this.userToSocket)
    setInterval(() => server.emit('onlineList', getOnlineList()), 5_000)
  }
}
