import { Injectable, Logger } from '@nestjs/common'
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
    try {
      const [
        activity,
        issues,
        prs,
        codeChanges,
        contributors,
        openrank,
        attention,
      ] = await Promise.all([
        this.builderService.getActivity(platform, owner, repo),
        this.builderService.getIssueMetrics(platform, owner, repo),
        this.builderService.getPRMetrics(platform, owner, repo),
        this.builderService.getCodeChangeMetrics(platform, owner, repo),
        this.builderService.getContributorMetrics(platform, owner, repo),
        this.builderService.getOpenRankMetrics(platform, owner, repo),
        this.builderService.getAttentionMetrics(platform, owner, repo),
      ])

      await this.metricsModel.findOneAndUpdate(
        { platform, owner, repo },
        {
          $set: {
            activity: activity.data,
            issues,
            pullRequests: prs,
            codeChanges,
            contributors,
            openrank,
            attention,
            lastSyncTime: new Date(),
          },
        },
        { upsert: true },
      )

      this.logger.log(`仓库 ${owner}/${repo} 数据同步完成`)
    } catch (error) {
      this.logger.error(`仓库 ${owner}/${repo} 数据同步失败:`, error)
    }
  }
}
