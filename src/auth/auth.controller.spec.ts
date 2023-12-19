import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../dependencies/prisma/prisma.service'
import { CryptoService } from '../dependencies/crypto/crypto.service'
import { isGuarded } from '../common/test-utils/is-guarded.test-util'
import { SignDto } from './dto'
import { AuthGuard } from '@nestjs/passport'

const mockAuthService = {
  signin: jest.fn(),
  signup: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
}

const mockSignInput: SignDto = {
  email: 'test@mail.com',
  password: '12341234',
}

describe('AuthController', () => {
  let controller: AuthController

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [PrismaService, JwtService, CryptoService, AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('signin', () => {
    it('should call AuthService.signin', () => {
      controller.signin(mockSignInput)
      expect(mockAuthService.signin).toHaveBeenCalledWith(
        ...Object.values(mockSignInput),
      )
    })
  })

  describe('signup', () => {
    it('should call AuthService.signup', () => {
      controller.signup(mockSignInput)
      expect(mockAuthService.signup).toHaveBeenCalledWith(
        ...Object.values(mockSignInput),
      )
    })
  })

  describe('refresh', () => {
    it('should call AuthService.refresh', () => {
      controller.refresh('id', 'refreshToken')
      expect(mockAuthService.refresh).toHaveBeenCalledWith('id', 'refreshToken')
    })

    it("should be guarded with AuthGuard('refresh')", () => {
      expect(
        isGuarded(AuthController.prototype.refresh, AuthGuard('refresh')),
      ).toBe(true)
    })
  })

  describe('logout', () => {
    it('should call AuthService.logout', () => {
      controller.logout('id')
      expect(mockAuthService.logout).toHaveBeenCalledWith('id')
    })

    it("should be guarded with AuthGuard('access')", () => {
      expect(
        isGuarded(AuthController.prototype.logout, AuthGuard('access')),
      ).toBe(true)
    })
  })
})
