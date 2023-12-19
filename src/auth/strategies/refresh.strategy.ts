import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '../types'

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_KEY,
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req?.get('authorization')?.replace('Bearer', '').trim()
    return {
      ...payload,
      refreshToken,
    }
  }
}
