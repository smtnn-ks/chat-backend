import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { isGuarded } from '../common/test-utils/is-guarded.test-util'
import { AuthGuard } from '@nestjs/passport'

const mockUsersService = {
  updateUserNickname: jest.fn(),
  getUserInfo: jest.fn(),
  findUserByNickname: jest.fn(),
}

describe('UsersController', () => {
  let controller: UsersController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile()

    controller = module.get<UsersController>(UsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('updateUserNickname', () => {
    it('should call UsersService.updateUserNickname', async () => {
      controller.updateUserNickname('1', { nickname: 'hello' })
      expect(mockUsersService.updateUserNickname).toHaveBeenCalledWith(
        '1',
        'hello',
      )
    })

    it('should be guarded with AuthGuard("access")', async () => {
      expect(
        isGuarded(
          UsersController.prototype.updateUserNickname,
          AuthGuard('access'),
        ),
      ).toBe(true)
    })
  })

  describe('getUserInfo', () => {
    it('should call UserService.getUserInfo', () => {
      controller.getUserInfo('1')
      expect(mockUsersService.getUserInfo).toHaveBeenCalledWith('1')
    })

    it('should be guarded with AuthGuard("access")', () => {
      expect(
        isGuarded(UsersController.prototype.getUserInfo, AuthGuard('access')),
      ).toBe(true)
    })
  })

  describe('findUserByNickname', () => {
    it('should call UsersService.findUserByNickname', () => {
      controller.findUserByNickname('cool')
      expect(mockUsersService.findUserByNickname).toHaveBeenCalledWith('cool')
    })

    it('should be guarded with AuthGuard("access")', () => {
      expect(
        isGuarded(
          UsersController.prototype.findUserByNickname,
          AuthGuard('access'),
        ),
      ).toBe(true)
    })
  })
})
