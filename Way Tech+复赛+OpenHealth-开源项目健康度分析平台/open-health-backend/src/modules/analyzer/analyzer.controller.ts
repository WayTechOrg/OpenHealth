import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { ApiName } from '~/common/decorators/openapi.decorator'
import { OpenDiggerService } from '../open-digger/openDigger.service'
import { AIAnalyzerService } from './ai-analyzer.service'
import { ProjectMetrics } from './analyzer.interface'
import { AnalyzerService } from './analyzer.service'

@ApiName
@Controller('analyzer')
export class AnalyzerController {
  constructor(
    private readonly analyzerService: AnalyzerService,
    private readonly openDiggerService: OpenDiggerService,
    private readonly aiAnalyzerService: AIAnalyzerService,
  ) {}

  @Get(':platform/:owner/:repo/health')
  @ApiOperation({ summary: '获取项目健康度分析' })
  async getProjectHealth(
    @Param('platform') platform: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const metrics = await this.openDiggerService.getRepoMetrics(
      platform,
      owner,
      repo,
    )
    return await this.analyzerService.calculateProjectHealth(
      metrics as ProjectMetrics,
    )
  }

  @Get(':platform/:owner/:repo/health/ai')
  @ApiOperation({ summary: '获取项目健康度分析（AI）' })
  async getProjectHealthAI(
    @Param('platform') platform: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const metrics = await this.openDiggerService.getRepoMetrics(
      platform,
      owner,
      repo,
    )
    return await this.aiAnalyzerService.generateHealthReport(
      metrics as ProjectMetrics,
    )
  }
}
