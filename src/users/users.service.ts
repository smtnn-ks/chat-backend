import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../dependencies/prisma/prisma.service'
import { UserInfo, UserInfoShort } from './types'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateUserNickname(id: string, nickname: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { nickname },
      select: { id: true, nickname: true },
    })
  }

  async getUserInfo(id: string): Promise<UserInfo> {
    const userInfo = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        publicKey: true,
      },
    })
    if (!userInfo) throw new BadRequestException('Пользователь не найден')
    return userInfo
  }

  async findUserByNickname(input: string): Promise<UserInfoShort[]> {
    return await this.prisma.user.findMany({
      where: { nickname: { contains: input } },
      select: { id: true, nickname: true },
    })
  }
}
