import { applyDecorators, UseGuards } from '@nestjs/common'

import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { JWTAuthGuard } from '../guard/auth.guard'

export function Auth() {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    []

  decorators.push(
    UseGuards(JWTAuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  )
  return applyDecorators(...decorators)
}
