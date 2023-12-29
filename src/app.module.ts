import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ChatModule } from './chat/chat.module'

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UsersModule, ChatModule],
})
export class AppModule {}
