import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../dependencies/prisma/prisma.service'
import { CryptoService } from '../dependencies/crypto/crypto.service'
import { JwtService } from '@nestjs/jwt'

describe('AuthService', () => {
  let service: AuthService
  let userId: string
  let userRefreshToken: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService, CryptoService, JwtService],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  afterAll(async () => {
    if (userId) await service.delete(userId)
    else console.error('userId is not specified')
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('signup', () => {
    it('ok', async () => {
      const result = await service.signup('test@mail.com', '12341234')
      userId = result.id
      expect(result).toEqual({
        id: expect.any(String),
      })
    })

    it('should not work twice: Email is taken', async () => {
      await expect(
        service.signup('test@mail.com', '12341234'),
      ).rejects.toBeInstanceOf(BadRequestException)
    })
  })

  describe('signin', () => {
    it('ok', async () => {
      const result = await service.signin('test@mail.com', '12341234')
      userRefreshToken = result.tokens.refreshToken
      expect(result).toEqual({
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
        keys: {
          publicKey: expect.any(String),
          privateKey: expect.any(String),
        },
      })
    })
    it('email is not registered', async () => {
      await expect(
        service.signin('wrong@mail.com', '12341234'),
      ).rejects.toBeInstanceOf(BadRequestException)
    })
    it('wrong password', async () => {
      await expect(
        service.signin('test@mail.com', '11111111'),
      ).rejects.toBeInstanceOf(BadRequestException)
    })
  })

  describe('refresh', () => {
    it('ok', async () => {
      const result = await service.refresh(userId, userRefreshToken)
      userRefreshToken = result.refreshToken
      expect(result).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
    })
    it('wrong id', async () => {
      await expect(
        service.refresh('1', userRefreshToken),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })
    it('wrong refresh token', async () => {
      await expect(
        service.refresh(userId, 'wrong-refresh-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })
  })

  describe('logout', () => {
    it('ok', async () => {
      await expect(service.logout(userId)).resolves.toEqual({
        id: userId,
        refreshToken: null,
      })
    })
    it('wrong id', async () => {
      await expect(service.logout('1')).rejects.toBeInstanceOf(
        BadRequestException,
      )
    })
  })
})
