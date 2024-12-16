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
  private readonly MAX_SIZE = 2 * 1024 * 1024 // 2MB 的字节数

  constructor(
    @InjectModel(OpenDiggerMetricsModel)
    private readonly metricsModel: ReturnModelType<
      typeof OpenDiggerMetricsModel
    >,
    private readonly builderService: OpenDiggerBuilderService,
  ) {}

  private filterCommunityOpenrankData(data: any, targetSize: number): any {
    if (!data?.meta?.nodes) {
      return data
    }

    const originalNodes = data.meta.nodes
    let currentNodes = [...originalNodes]
    let step = 1000 // 每次减少1000个节点
    let currentSize

    this.logger.debug(
      `开始过滤 communityOpenrank 数据，原始节点数: ${originalNodes.length}`,
    )

    while (true) {
      const filteredData = {
        meta: {
          ...data.meta,
          nodes: currentNodes,
        },
      }

      currentSize = JSON.stringify(filteredData).length

      if (currentSize <= targetSize) {
        this.logger.debug(
          `找到合适的节点数: ${currentNodes.length}, ` +
            `数据大小: ${(currentSize / 1024 / 1024).toFixed(2)}MB`,
        )
        return filteredData
      }

      // 如果当前节点数小于步长，减小步长
      if (currentNodes.length <= step) {
        step = Math.max(100, Math.floor(step / 2))
        if (step < 100) {
          // 如果步长已经很小了，就返回当前结果
          return filteredData
        }
      }

      currentNodes = currentNodes.slice(0, currentNodes.length - step)
    }
  }

  private filterDataBySize(data: Record<string, any>) {
    const totalSize = JSON.stringify(data).length
    this.logger.debug(`原始数据大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)

    if (totalSize <= this.MAX_SIZE) {
      return data
    }

    const filteredData = { ...data }

    // 特殊处理 communityOpenrank，给它分配1.5MB的空间
    if (filteredData.openrank?.communityOpenrank) {
      const communityOpenrankSize = 1.5 * 1024 * 1024 // 1.5MB
      filteredData.openrank.communityOpenrank =
        this.filterCommunityOpenrankData(
          filteredData.openrank.communityOpenrank,
          communityOpenrankSize,
        )
    }

    // 剩余空间用于其他指标
    const remainingSize = this.MAX_SIZE - JSON.stringify(filteredData).length

    if (remainingSize > 0) {
      // 处理其他指标的时间维度数据
      // ... 其他指标的过滤逻辑 ...
    }

    const finalSize = JSON.stringify(filteredData).length
    this.logger.debug(
      `数据过滤完成，最终大小: ${(finalSize / 1024 / 1024).toFixed(2)}MB`,
    )

    return filteredData
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
          results[metricName] = data
          this.logger.debug(`${owner}/${repo} 的 ${metricName} 指标获取完成`)
        } catch (error) {
          throw new Error(`获取 ${metricName} 指标时失败: ${error.message}`)
        }
      }

      // 根据大小过滤数据
      const filteredResults = this.filterDataBySize(results)

      const finalSize = JSON.stringify(filteredResults).length
      this.logger.debug(
        `过滤后的数据大小: ${finalSize} bytes -> ${finalSize / 1024 / 1024} MB`,
      )

      // 更新数据库
      await this.metricsModel.findOneAndUpdate(
        { platform, owner, repo },
        {
          $set: {
            activity: filteredResults.activity,
            issues: filteredResults.issues,
            pullRequests: filteredResults.pullRequests,
            codeChanges: filteredResults.codeChanges,
            contributors: filteredResults.contributors,
            openrank: filteredResults.openrank,
            attention: filteredResults.attention,
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
