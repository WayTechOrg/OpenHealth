import { JwtModule } from '@nestjs/jwt'
import { createE2EApp } from 'test/helper/create-e2e-app'
import { SECURITY } from '~/app.config'
import { AuthModule } from '~/modules/auth/auth.module'
import { AuthService } from '~/modules/auth/auth.service'
import { UserController } from '~/modules/user/user.controller'
import { UserModel } from '~/modules/user/user.model'
import { UserService } from '~/modules/user/user.service'

describe('UserController (e2e)', () => {
  const proxy = createE2EApp({
    imports: [
      JwtModule.register({
        secret: SECURITY.jwtSecret as string,
        signOptions: {
          expiresIn: '1d',
        },
      }),
    ],
    controllers: [UserController],
    providers: [UserService, AuthService],
    models: [UserModel],
    async pourData(modelMap) {
      const { model } = modelMap.get(UserModel)
      // 创建测试用户数据
      await model.create({
        username: 'test_user',
        password: '123456',
        name: '测试用户',
        role: 'user',
        authCode: 'test_auth_code',
      })

      return async () => {
        await model.deleteMany({})
      }
    },
  })

  describe('POST /users/login', () => {
    it('should login success with correct credentials', async () => {
      const app = proxy.app

      const response = await app.inject({
        method: 'POST',
        url: '/users/login',
        payload: {
          username: 'test_user',
          password: '123456',
        },
      })

      expect(response.statusCode).toBe(201)
      const result = response.json()

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('username', 'test_user')
      expect(result).toHaveProperty('role', 'user')
      expect(result).toHaveProperty('name', '测试用户')
    })

    it('should fail with wrong password', async () => {
      const app = proxy.app

      const response = await app.inject({
        method: 'POST',
        url: '/users/login',
        payload: {
          username: 'test_user',
          password: 'wrong_password',
        },
      })

      expect(response.statusCode).toBe(403)
      const result = response.json()
      expect(result.message).toBe('密码不正确')
    })

    it('should fail with non-existent username', async () => {
      const app = proxy.app

      const response = await app.inject({
        method: 'POST',
        url: '/users/login',
        payload: {
          username: 'non_existent_user',
          password: '123456',
        },
      })

      expect(response.statusCode).toBe(403)
      const result = response.json()
      expect(result.message).toBe('用户名不正确')
    })

    it('should validate request body', async () => {
      const app = proxy.app

      const response = await app.inject({
        method: 'POST',
        url: '/users/login',
        payload: {
          username: 'test_user',
        },
      })

      expect(response.statusCode).toBe(422)
    })
  })
})
