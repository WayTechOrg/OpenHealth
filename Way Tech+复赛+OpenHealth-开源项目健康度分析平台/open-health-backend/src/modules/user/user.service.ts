import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'

import { nanoid } from '@openhealth/external'
import { ReturnModelType } from '@typegoose/typegoose'
import { compareSync } from 'bcryptjs'

import { BizException } from '~/common/exceptions/business.exception'
import { ErrorCodeEnum } from '~/constants/error-code.constant'
import { CacheService } from '~/processors/cache/cache.service'
import { InjectModel } from '~/transformers/model.transformer'

import { sleep } from '~/utils/tool.utils'
import { AuthService } from '../auth/auth.service'
import { UserDocument, UserModel } from './user.model'

@Injectable()
export class UserService {
  private Logger = new Logger(UserService.name)
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: ReturnModelType<typeof UserModel>,
    private readonly authService: AuthService,
    private readonly redis: CacheService,
  ) {}
  public get model() {
    return this.userModel
  }
  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ username }).select('+password')
    if (!user) {
      await sleep(3000)
      throw new ForbiddenException('用户名不正确')
    }
    if (!compareSync(password, user.password)) {
      await sleep(3000)
      throw new ForbiddenException('密码不正确')
    }

    return {
      id: user._id,
      username: user.username,
      role: user.role,
      name: user.name,
    }
  }

  async getUserInfo(userId: string, getLoginIp = false) {
    const user: UserModel | null = await this.userModel
      .findById(userId)
      .select(`-authCode${getLoginIp ? ' +lastLoginIp' : ''}`)
      .lean({ virtuals: true })
    if (!user) {
      throw new BadRequestException('用户不存在！')
    }

    return { ...user }
  }
  async hasMaster() {
    // return !!(await this.userModel.countDocuments())
    return !!(await this.userModel.findOne({ role: 'admin' }))
  }

  public async getMaster() {
    const master = await this.userModel.findOne({ role: 'admin' }).lean()
    if (!master) {
      throw new BadRequestException('我还没有管理员')
    }
    return master
  }

  /**
   * 创建用户账户（初次注册为管理员）
   *
   * @async
   * @param model - 用户模型数据
   * @param model.username - 用户名
   * @param model.name - 昵称
   * @param model.password - 密码
   * @param [model.introduce] - 个人介绍
   * @param [model.avatar] - 头像URL
   * @param [model.url] - 个人主页URL
   * @returns 返回token和用户信息
   */
  async createUser(
    model: Pick<UserModel, 'username' | 'name' | 'password'> &
      Partial<Pick<UserModel, 'introduce' | 'avatar' | 'url'>>,
  ) {
    const hasMaster = await this.hasMaster()
    // 禁止注册第二个管理员
    const authCode = nanoid.nanoid(10)
    // @ts-ignore
    const res = await this.userModel.create({
      ...model,
      authCode,
      role: hasMaster ? 'user' : 'admin',
    })
    const token = await this.authService.signToken(res.id)
    return { token, username: res.username, authCode: res.authCode }
  }

  /**
   * 修改密码
   *
   * @async
   * @param {DocumentType} user - 用户查询结果，已经挂载在 req.user
   * @param {Partial} data - 部分修改数据
   */
  async patchUserData(
    user: UserDocument,
    data: Partial<UserModel>,
  ): Promise<any> {
    const { password } = data
    const doc = { ...data }
    if (password !== undefined) {
      const { _id } = user
      const currentUser = await this.userModel
        .findById(_id)
        .select('+password +apiToken')

      if (!currentUser) {
        throw new BizException(ErrorCodeEnum.MasterLostError)
      }
      // 1. 验证新旧密码是否一致
      const isSamePassword = compareSync(password, currentUser.password)
      if (isSamePassword) {
        throw new UnprocessableEntityException('密码可不能和原来的一样哦')
      }

      // 2. 认证码重新生成
      const newCode = nanoid.nanoid(10)
      doc.authCode = newCode
    }
    return await this.userModel
      .updateOne({ _id: user._id }, doc)
      .setOptions({ omitUndefined: true })
  }

  /**
   * 记录登陆的足迹 (ip, 时间)
   *
   * @async
   * @param userId - 用户ID
   * @param ip - 用户IP
   * @return 返回上次足迹
   */
  async recordFootstep(
    userId: string,
    ip: string,
  ): Promise<Record<string, Date | string>> {
    const user = await this.userModel.findById(userId)
    if (!user) {
      throw new BizException(ErrorCodeEnum.UserNotFoundError)
    }
    const prevFootstep = {
      lastLoginTime: user.lastLoginTime || new Date(1586090559569),
      lastLoginIp: user.lastLoginIp || null,
    }
    await user.updateOne({
      lastLoginTime: new Date(),
      lastLoginIp: ip,
    })

    this.Logger.warn(`用户 ${user.username}(${user.role}) 已登录，IP: ${ip}`)
    return prevFootstep as any
  }
}
