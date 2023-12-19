import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PrismaModule } from 'src/dependencies/prisma/prisma.module'
import { CryptoModule } from 'src/dependencies/crypto/crypto.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [PrismaModule, CryptoModule, JwtModule.register({})],
})
export class AuthModule {}
