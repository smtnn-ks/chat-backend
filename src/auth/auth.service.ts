import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '../dependencies/prisma/prisma.service'
import { CryptoService } from '../dependencies/crypto/crypto.service'
import { nanoid } from 'nanoid'
import { JwtService } from '@nestjs/jwt'
import { Tokens } from './types'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { async } from 'rxjs'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly jwt: JwtService,
  ) {}

  async signup(email: string, password: string) {
    const candidate = await this.prisma.user.findUnique({ where: { email } })
    if (candidate) throw new BadRequestException('Email занят')
    const hashPassword = this.crypto.hashSync(password)
    return await this.prisma.user.create({
      data: {
        id: nanoid(),
        email,
        password: hashPassword,
        nickname: email.split('@')[0],
      },
      select: {
        id: true,
      },
    })
  }

  async signin(email: string, password: string) {
    const candidate = await this.prisma.user.findUnique({ where: { email } })
    if (!candidate) throw new BadRequestException('Email не зарегистрирован')
    const verify = this.crypto.compareSync(password, candidate.password)
    if (!verify) throw new BadRequestException('Неверный пароль')

    const [tokens, keys] = await Promise.all([
      this.generateTokens(candidate.id),
      this.crypto.generateRsaKeyPair(),
    ])

    return { tokens, keys }
  }

  async refresh(id: string, refreshToken: string) {
    const candidate = await this.prisma.user.findUnique({ where: { id } })
    if (!candidate) throw new UnauthorizedException()
    const verify = this.crypto.compareSync(refreshToken, candidate.refreshToken)
    if (!verify) throw new UnauthorizedException('Невалидный токен обновления')
    const tokens = await this.generateTokens(candidate.id)
    const hashRefreshToken = this.crypto.hashSync(tokens.refreshToken)
    await this.prisma.user.update({
      where: { id: candidate.id },
      data: { refreshToken: hashRefreshToken },
    })
    return tokens
  }

  async logout(id: string) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { refreshToken: null },
        select: {
          id: true,
          refreshToken: true,
        },
      })
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new BadRequestException('Неверный ID')
      } else throw e
    }
  }

  // to clean after tests
  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } })
  }

  private async generateTokens(id: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: id },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '10m' },
      ),
      this.jwt.signAsync(
        { sub: id },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      ),
    ])
    this.crypto.hash(refreshToken).then(async (hashRefreshToken) => {
      await this.prisma.user.update({
        where: { id },
        data: { refreshToken: hashRefreshToken },
      })
    })
    return { accessToken, refreshToken }
  }
}
