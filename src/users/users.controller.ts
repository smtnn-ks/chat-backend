import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { NicknameDto } from './dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put(':id')
  @UseGuards(AuthGuard('access'))
  async updateUserNickname(
    @Param('id') id: string,
    @Body() { nickname }: NicknameDto,
  ) {
    return await this.usersService.updateUserNickname(id, nickname)
  }

  @Get(':id')
  @UseGuards(AuthGuard('access'))
  async getUserInfo(@Param('id') id: string) {
    return await this.usersService.getUserInfo(id)
  }

  @Get()
  @UseGuards(AuthGuard('access'))
  async findUserByNickname(@Query('input') input: string) {
    return await this.usersService.findUserByNickname(input)
  }
}
