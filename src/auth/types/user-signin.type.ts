import { Tokens } from './tokens.type'

export type UserSigninInfo = {
  tokens: Tokens
  privateKey: string
  user: {
    id: string
    nickname: string
  }
}
