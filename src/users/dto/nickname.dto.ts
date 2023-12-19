import { IsString, Length } from 'class-validator'

export class NicknameDto {
  @IsString()
  @Length(2, 50)
  nickname: string
}
