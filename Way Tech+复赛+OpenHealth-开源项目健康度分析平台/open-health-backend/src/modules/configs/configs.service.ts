import {
  BadRequestException,
  Injectable,
  Logger,
  ValidationPipe,
} from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { ClassConstructor, plainToInstance } from 'class-transformer'

import { validateSync, ValidatorOptions } from 'class-validator'
import { cloneDeep, mergeWith } from 'es-toolkit/compat'

import { RedisKeys } from '~/constants/cache.constant'
import { CacheService } from '~/processors/cache/cache.service'
import { InjectModel } from '~/transformers/model.transformer'
import { getRedisKey } from '~/utils/redis.util'
import { camelcaseKeys, sleep } from '~/utils/tool.utils'

import * as optionDtos from '../configs/configs.dto'
import { UserService } from '../user/user.service'
import { generateDefaultConfig } from './configs.default'
import { IConfig, IConfigKeys } from './configs.interface'
import { ConfigModel } from './configs.model'

const allOptionKeys: Set<IConfigKeys> = new Set()
const map: Record<string, any> = Object.entries(optionDtos).reduce(
  (obj, [key, value]) => {
    const optionKey = (key.charAt(0).toLowerCase() +
      key.slice(1).replace(/Dto$/, '')) as IConfigKeys
    allOptionKeys.add(optionKey)
    return {
      ...obj,
      [String(optionKey)]: value,
    }
  },
  {},
)

/*
 * NOTE:
 * 1. 读配置在 Redis 中，getConfig 为收口，获取配置都从 Redis 拿，初始化之后入到 Redis，
 * 2. 对于加密的字段，在 Redis 的缓存中应该也是加密的。
 * 3. 何时解密，在 Node 中消费时，即 getConfig 时统一解密。
 */
@Injectable()
export class ConfigsService {
  private logger: Logger
  constructor(
    @InjectModel(ConfigModel)
    private readonly optionModel: ReturnModelType<typeof ConfigModel>,
    private readonly userService: UserService,
    private readonly redis: CacheService,
  ) {
    this.configInit().then(() => {
      this.logger.log('Config 已经加载完毕！')
    })

    this.logger = new Logger(ConfigsService.name)
  }
  private configInitd = false

  /**
   * 将配置信息保存到Redis缓存中
   *
   * @param config 需要缓存的配置对象
   */
  private async setConfig(config: IConfig) {
    const redis = this.redis.getClient()
    await redis.set(getRedisKey(RedisKeys.ConfigCache), JSON.stringify(config))
  }

  /**
   * 等待配置初始化完成
   *
   * 该方法会在配置未初始化时进行重试,最多重试10次,每次间隔100ms
   * 如果重试次数达到上限仍未成功,则抛出异常
   *
   * @throws 当重试次数达到上限时抛出错误
   * @returns 返回完整的配置信息
   */
  public async waitForConfigReady() {
    if (this.configInitd) {
      return await this.getConfig()
    }

    const maxCount = 10
    let curCount = 0
    do {
      if (this.configInitd) {
        return await this.getConfig()
      }
      await sleep(100)
      curCount += 1
    } while (curCount < maxCount)

    throw `重试 ${curCount} 次获取配置失败, 请检查数据库连接`
  }

  /**
   * 获取默认配置
   *
   * @returns 返回系统默认配置对象
   */
  public get defaultConfig() {
    return generateDefaultConfig()
  }

  /**
   * 初始化配置信息
   *
   * 该方法会从数据库中读取配置记录,并与默认配置进行合并
   * 合并后的配置会被缓存到Redis中
   *
   * 初始化流程:
   * 1. 从数据库获取所有配置记录
   * 2. 生成默认配置作为基础
   * 3. 遍历数据库配置,将有效配置合并到默认配置中
   * 4. 将最终配置保存到Redis缓存
   * 5. 标记配置初始化完成
   */
  protected async configInit() {
    const configs = await this.optionModel.find().lean()
    const mergedConfig = generateDefaultConfig()
    configs.forEach((field) => {
      const name = field.name as keyof IConfig

      if (!allOptionKeys.has(name)) {
        return
      }

      const value = field.value
      mergedConfig[name] = { ...mergedConfig[name], ...value }
    })

    await this.setConfig(mergedConfig)
    this.configInitd = true
  }

  /**
   * 获取指定配置项的值
   *
   * 该方法会等待配置初始化完成后返回请求的配置项
   * 如果配置未初始化,会调用waitForConfigReady等待初始化完成
   *
   * @param key 配置项的键名
   * @returns 返回指定配置项的只读值
   */
  public get<T extends keyof IConfig>(key: T): Promise<Readonly<IConfig[T]>> {
    return new Promise((resolve, reject) => {
      this.waitForConfigReady()
        .then((config) => {
          resolve(config[key])
        })
        .catch(reject)
    })
  }

  /**
   * 获取完整的系统配置信息
   *
   * 该方法会首先尝试从Redis缓存中获取配置信息。如果缓存存在且有效,则直接返回缓存的配置。
   * 如果缓存不存在或无效,则会重新初始化配置并递归调用本方法重试获取。
   *
   * 配置获取流程:
   * 1. 从Redis获取缓存的配置
   * 2. 如果有缓存,尝试解析并转换为IConfig实例
   * 3. 如果解析失败,重新初始化配置后重试
   * 4. 如果没有缓存,初始化配置后重试
   *
   * @example
   * ```typescript
   * // 获取完整配置
   * const config = await getConfig()
   *
   * // 使用配置中的某个值
   * console.log(config.system.title)
   * ```
   *
   * @returns 返回只读的完整系统配置对象
   */
  // Config 在此收口
  public async getConfig(): Promise<Readonly<IConfig>> {
    const redis = this.redis.getClient()
    const configCache = await redis.get(getRedisKey(RedisKeys.ConfigCache))

    if (configCache) {
      try {
        const instanceConfigsValue = plainToInstance<IConfig, any>(
          IConfig as any,
          JSON.parse(configCache) as any,
        ) as any as IConfig

        return instanceConfigsValue
      } catch {
        await this.configInit()
        return await this.getConfig()
      }
    } else {
      await this.configInit()

      return await this.getConfig()
    }
  }

  /**
   * 更新指定配置项的值
   *
   * 该方法用于更新配置项,支持部分更新。更新时会遵循以下规则:
   * 1. 对于数组类型,会直接使用新值替换旧值
   * 2. 对于对象类型,会进行浅合并
   * 3. 对于其他类型,会直接使用新值
   *
   * @private
   * @param key - 要更新的配置项键名
   * @param data - 要更新的配置数据
   * @returns 返回更新后的配置项完整数据
   *
   * @example
   * ```typescript
   * // 更新系统配置中的标题
   * await patch('system', { title: 'New Title' })
   *
   * // 更新数组配置
   * await patch('someArray', { list: [1, 2, 3] })
   *
   * // 更新嵌套对象
   * await patch('nested', {
   *   obj: {
   *     field1: 'value1',
   *     field2: 'value2'
   *   }
   * })
   * ```
   */
  private async patch<T extends keyof IConfig>(
    key: T,
    data: Partial<IConfig[T]>,
  ): Promise<IConfig[T]> {
    const config = await this.getConfig()
    const updatedConfigRow = await this.optionModel
      .findOneAndUpdate(
        { name: key as string },
        {
          value: mergeWith(cloneDeep(config[key]), data, (old, newer) => {
            // 数组不合并
            if (Array.isArray(old)) {
              return newer
            }
            // 对象合并
            if (typeof old === 'object' && typeof newer === 'object') {
              return { ...old, ...newer }
            }
          }),
        },
        { upsert: true, new: true },
      )
      .lean()
    const newData = updatedConfigRow.value
    const mergedFullConfig = Object.assign({}, config, { [key]: newData })

    await this.setConfig(mergedFullConfig)

    return newData
  }

  /**
   * 验证选项配置
   * @private
   * @property {boolean} whitelist - 只允许DTO中定义的属性通过验证
   * @property {boolean} forbidNonWhitelisted - 当存在未在DTO中定义的属性时抛出异常
   */
  private validateOptions: ValidatorOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  }

  /**
   * 验证管道实例,用于处理验证错误
   * @private
   */
  private validate = new ValidationPipe(this.validateOptions)

  /**
   * 更新并验证配置项
   *
   * 该方法用于更新指定配置项的值,并在更新前进行数据验证
   *
   * @template T - 配置项的键类型,必须是IConfig的键
   * @param {T} key - 要更新的配置项键名
   * @param {Partial<IConfig[T]>} value - 要更新的配置值,可以是部分更新
   * @returns {Promise<IConfig[T]>} 返回更新后的配置项完整值
   * @throws {BadRequestException} 当配置项不存在时抛出异常
   *
   * @example
   * ```typescript
   * // 更新系统配置
   * await patchAndValid('system', { title: 'New Title' })
   *
   * // 更新邮件配置
   * await patchAndValid('mail', { host: 'smtp.example.com' })
   * ```
   */
  async patchAndValid<T extends keyof IConfig>(
    key: T,
    value: Partial<IConfig[T]>,
  ) {
    // 将所有键转换为驼峰命名
    value = camelcaseKeys(value) as any

    // 获取对应的DTO类
    const dto = map[key]
    if (!dto) {
      throw new BadRequestException('设置不存在')
    }

    // 验证并转换值
    const instanceValue = this.validWithDto(dto, value)

    // 根据不同的配置类型执行相应的更新逻辑
    switch (key) {
      default: {
        return this.patch(key, instanceValue)
      }
    }
  }

  /**
   * 验证并转换DTO对象
   *
   * 该方法用于验证输入的值是否符合DTO定义的规则,并将普通对象转换为DTO实例
   *
   * @template T - DTO类型,必须是对象类型
   * @param dto - DTO类的构造函数
   * @param value - 需要验证和转换的值
   * @returns 验证并转换后的DTO实例
   *
   * @throws 当验证失败时抛出异常,包含具体的验证错误信息
   *
   * @example
   * ```typescript
   * class UserDto {
   *   @IsString()
   *   name: string;
   * }
   *
   * const value = { name: 'test' };
   * const result = this.validWithDto(UserDto, value);
   * // result 是经过验证的 UserDto 实例
   * ```
   */
  private validWithDto<T extends object>(dto: ClassConstructor<T>, value: any) {
    // 将普通对象转换为DTO实例
    const validModel = plainToInstance(dto, value)

    // 根据validModel是否为数组执行不同的验证逻辑
    const errors = Array.isArray(validModel)
      ? (validModel as Array<any>).reduce(
          (acc, item) => acc.concat(validateSync(item, this.validateOptions)),
          [],
        )
      : validateSync(validModel, this.validateOptions)

    // 如果存在验证错误,创建并抛出异常
    if (errors.length > 0) {
      const error = this.validate.createExceptionFactory()(errors as any[])
      throw error
    }

    return validModel
  }
}
