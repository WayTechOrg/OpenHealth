import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from '~/transformers/model.transformer'
import { OpenDiggerBuilderService } from './openDigger.builder.service'
import { OpenDiggerMetricsModel } from './openDigger.model'

@Injectable()
export class OpenDiggerSchedulerService {
  private readonly logger = new Logger(OpenDiggerSchedulerService.name)

  constructor(
    @InjectModel(OpenDiggerMetricsModel)
    private readonly metricsModel: ReturnModelType<
      typeof OpenDiggerMetricsModel
    >,
    private readonly builderService: OpenDiggerBuilderService,
  ) {}

  // 过滤最近一年的数据
  private filterLastOneYearData(data: any) {
    if (!data) return data

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const cutoffDate = oneYearAgo.toISOString().slice(0, 7)

    // 如果数据是对象形式，过滤键值
    if (typeof data === 'object' && !Array.isArray(data)) {
      const filteredData = {}
      for (const [key, value] of Object.entries(data)) {
        if (key >= cutoffDate) {
          filteredData[key] = value
        }
      }
      return filteredData
    }

    return data
  }

  // 每天凌晨2点执行同步
  @Cron('0 0 2 * * *')
  async handleCron() {
    this.logger.log('开始同步 OpenDigger 数据...')
    await this.syncAllMetrics()
  }

  // 手动触发同步
  async syncAllMetrics() {
    try {
      const repos = await this.metricsModel.find()

      for (const repo of repos) {
        await this.syncRepoMetrics(repo.platform, repo.owner, repo.repo)
      }

      this.logger.log('OpenDigger 数据同步完成')
    } catch (error) {
      this.logger.error('OpenDigger 数据同步失败:', error)
    }
  }

  async syncRepoMetrics(platform: string, owner: string, repo: string) {
    const metricsMap = {
      activity: () => this.builderService.getActivity(platform, owner, repo),
      issues: () => this.builderService.getIssueMetrics(platform, owner, repo),
      pullRequests: () =>
        this.builderService.getPRMetrics(platform, owner, repo),
      codeChanges: () =>
        this.builderService.getCodeChangeMetrics(platform, owner, repo),
      contributors: () =>
        this.builderService.getContributorMetrics(platform, owner, repo),
      openrank: () =>
        this.builderService.getOpenRankMetrics(platform, owner, repo),
      attention: () =>
        this.builderService.getAttentionMetrics(platform, owner, repo),
    }

    try {
      const results: Record<string, any> = {}

      for (const [metricName, fetcher] of Object.entries(metricsMap)) {
        try {
          const data = await fetcher()
          // 对每个指标数据进行过滤
          results[metricName] = this.filterLastOneYearData(data)
        } catch (error) {
          throw new Error(`获取 ${metricName} 指标时失败: ${error.message}`)
        }
      }

      await this.metricsModel.findOneAndUpdate(
        { platform, owner, repo },
        {
          $set: {
            activity: results.activity,
            issues: results.issues,
            pullRequests: results.pullRequests,
            codeChanges: results.codeChanges,
            contributors: results.contributors,
            openrank: results.openrank,
            attention: results.attention,
            lastSyncTime: new Date(),
          },
        },
        { upsert: true },
      )

      this.logger.log(`仓库 ${owner}/${repo} 数据同步完成`)
      return true
    } catch (error) {
      this.logger.error(`仓库 ${owner}/${repo} 数据同步失败:`, error)
      throw new InternalServerErrorException(
        `仓库 ${owner}/${repo} 数据同步失败: ${error.message}`,
      )
    }
  }
}
