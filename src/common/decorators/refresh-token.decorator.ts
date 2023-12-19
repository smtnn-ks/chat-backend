import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const RefreshToken = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    return context.switchToHttp().getRequest().user.refreshToken
  },
)
