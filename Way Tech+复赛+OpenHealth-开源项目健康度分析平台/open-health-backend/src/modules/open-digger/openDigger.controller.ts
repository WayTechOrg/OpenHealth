import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DeleteResult } from 'mongoose'
import { Auth } from '~/common/decorators/auth.decorator'
import { ApiName } from '~/common/decorators/openapi.decorator'
import { OpenDiggerService } from './openDigger.service'

@ApiName
@Controller('open-digger')
export class OpenDiggerController {
  constructor(private readonly openDiggerService: OpenDiggerService) {}

  @Get(':platform/:owner/:repo')
  @ApiOperation({ summary: '获取仓库指标数据' })
  async getRepoMetrics(
    @Param('platform') platform: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return await this.openDiggerService.getRepoMetrics(platform, owner, repo)
  }

  @Post('repo')
  @Auth()
  @ApiOperation({ summary: '添加仓库监控' })
  async addRepo(
    @Body('platform') platform: string,
    @Body('owner') owner: string,
    @Body('repo') repo: string,
  ) {
    return await this.openDiggerService.addRepo(platform, owner, repo)
  }

  @Delete(':platform/:owner/:repo')
  @Auth()
  @ApiOperation({ summary: '移除仓库监控' })
  async removeRepo(
    @Param('platform') platform: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ): Promise<DeleteResult> {
    return await this.openDiggerService.removeRepo(platform, owner, repo)
  }
}
