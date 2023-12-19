import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignDto } from './dto'
import { AuthGuard } from '@nestjs/passport'
import { RefreshToken, UserId } from '../common/decorators'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() { email, password }: SignDto) {
    return await this.authService.signup(email, password)
  }

  @Post('signin')
  async signin(@Body() { email, password }: SignDto) {
    return await this.authService.signin(email, password)
  }

  @Post('refresh')
  @UseGuards(AuthGuard('refresh'))
  async refresh(@UserId() id: string, @RefreshToken() refreshToken: string) {
    return await this.authService.refresh(id, refreshToken)
  }

  @Post('logout')
  @UseGuards(AuthGuard('access'))
  async logout(@UserId() id: string) {
    return await this.authService.logout(id)
  }
}
