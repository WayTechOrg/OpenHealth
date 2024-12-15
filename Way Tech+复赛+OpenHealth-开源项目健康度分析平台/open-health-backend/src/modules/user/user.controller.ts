import { Body, Get, Param, Post } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
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

  @Auth()
  @ApiOperation({ summary: '检查用户是否登录' })
  @Get('/check')
  async check() {
    return true
  }

  @Auth()
  @ApiOperation({ summary: '获取用户信息' })
  @Get('/:id')
  async getUsers(@Param('id') id: string) {
    return await this.userService.getUserInfo(id)
  }

  @Post('/register')
  @ApiOperation({ summary: '注册用户' })
  async register(
    @Body()
    body: Pick<UserModel, 'username' | 'name' | 'password'> &
      Partial<Pick<UserModel, 'introduce' | 'avatar' | 'url'>>,
  ) {
    return await this.userService.createUser(body)
  }

  @Post('/login')
  @ApiOperation({ summary: '登录' })
  async login(@Body() body: LoginDto) {
    const user = await this.userService.login(body.username, body.password)
    const token = await this.authService.signToken(user.id.toString())
    return {
      token,
      ...user,
    }
  }
}
