import { User } from '@prisma/client'
export type UserInfoShort = Pick<User, 'id' | 'nickname'>
