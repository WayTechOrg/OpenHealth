import { Body, Controller, Get, Param, Post } from '@nestjs/common'

import { ApiController } from '~/common/decorators/api-controller.decorator'
import { Auth } from '~/common/decorators/auth.decorator'
import { ApiName } from '~/common/decorators/openapi.decorator'
import { AuthService } from '../auth/auth.service'
import { LoginDto } from './user.dto'
import { UserModel } from './user.model'
import { UserService } from './user.service'

@ApiName
@ApiController('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('/:id')
  async getUsers(@Param('id') id: string) {
    return await this.userService.getUserInfo(id)
  }

  @Post('/register')
  async register(
    @Body()
    body: Pick<UserModel, 'username' | 'name' | 'password'> &
      Partial<Pick<UserModel, 'introduce' | 'avatar' | 'url'>>,
  ) {
    return await this.userService.createUser(body)
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    const user = await this.userService.login(body.username, body.password)
    const token = await this.authService.signToken(user.id.toString())
    return {
      token,
      ...user,
    }
  }
}
