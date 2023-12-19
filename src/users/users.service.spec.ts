import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { AuthService } from '../auth/auth.service'
import { PrismaService } from '../dependencies/prisma/prisma.service'
import { CryptoService } from '../dependencies/crypto/crypto.service'
import { JwtService } from '@nestjs/jwt'
import { BadRequestException } from '@nestjs/common'

describe('UsersService', () => {
  let service: UsersService
  let userId: string
  let authService: AuthService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        CryptoService,
        JwtService,
        UsersService,
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    userId = (await authService.signup('test-users@mail.com', '12341234'))['id']

    service = module.get<UsersService>(UsersService)
  })

  afterAll(async () => {
    if (userId) await authService.delete(userId)
    else console.error('userId is not specified')
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateUserNickname', () => {
    it('OK', async () => {
      await expect(
        service.updateUserNickname(userId, 'cool-nick'),
      ).resolves.toEqual({
        id: userId,
        nickname: 'cool-nick',
      })
    })
  })

  describe('getUserInfo', () => {
    it('OK', async () => {
      await expect(service.getUserInfo(userId)).resolves.toEqual({
        id: userId,
        nickname: 'cool-nick',
        publicKey: null,
      })
    })

    it('user not found', async () => {
      await expect(service.getUserInfo('1')).rejects.toBeInstanceOf(
        BadRequestException,
      )
    })
  })

  describe('findUserByNickname', () => {
    it('OK', async () => {
      await expect(service.findUserByNickname('cool')).resolves.toEqual([
        {
          id: userId,
          nickname: 'cool-nick',
        },
      ])
    })

    it('No match', async () => {
      await expect(service.findUserByNickname('no-match')).resolves.toEqual([])
    })
  })
})
