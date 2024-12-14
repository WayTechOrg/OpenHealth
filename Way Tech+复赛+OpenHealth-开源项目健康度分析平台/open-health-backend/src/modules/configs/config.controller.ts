import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { Auth } from '~/common/decorators/auth.decorator'
import { ApiName } from '~/common/decorators/openapi.decorator'
import { IConfig, IConfigKeys } from './configs.interface'
import { ConfigsService } from './configs.service'

@ApiName
@Controller('configs')
export class ConfigController {
  constructor(private readonly configsService: ConfigsService) {}

  @Get('')
  @Auth()
  @ApiOperation({ summary: '获取完整配置' })
  async getConfig() {
    return await this.configsService.getConfig()
  }

  @Get('default')
  @Auth()
  @ApiOperation({ summary: '获取默认配置' })
  async getDefaultConfig() {
    return this.configsService.defaultConfig
  }

  @Get(':key')
  @Auth()
  @ApiOperation({ summary: '获取配置项' })
  async getConfigItem(@Param('key') key: IConfigKeys) {
    return await this.configsService.get(key)
  }

  @Put(':key')
  @Auth()
  @ApiOperation({ summary: '更新配置项' })
  async updateConfigItem<T extends IConfigKeys>(
    @Param('key') key: T,
    @Body() body: IConfig[T],
  ) {
    return await this.configsService.patchAndValid(key, body)
  }
}
