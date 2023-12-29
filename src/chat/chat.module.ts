import { Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { PrismaModule } from 'src/dependencies/prisma/prisma.module'
import { CryptoModule } from 'src/dependencies/crypto/crypto.module'

@Module({
  providers: [ChatGateway, ChatService],
  imports: [PrismaModule, CryptoModule],
})
export class ChatModule {}
