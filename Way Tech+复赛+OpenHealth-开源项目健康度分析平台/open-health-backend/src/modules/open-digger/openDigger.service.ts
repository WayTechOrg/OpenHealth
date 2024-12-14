import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { DeleteResult } from 'mongoose'
import { InjectModel } from '~/transformers/model.transformer'
import { OpenDiggerBuilderService } from './openDigger.builder.service'
import { OpenDiggerMetricsModel } from './openDigger.model'
import { OpenDiggerSchedulerService } from './openDigger.scheduler.service'

@Injectable()
export class OpenDiggerService {
  constructor(
    @InjectModel(OpenDiggerMetricsModel)
    private readonly metricsModel: ReturnModelType<
      typeof OpenDiggerMetricsModel
    >,
    private readonly openDiggerBuilderService: OpenDiggerBuilderService,
    private readonly schedulerService: OpenDiggerSchedulerService,
  ) {}

  // 获取仓库的所有指标数据
  async getRepoMetrics(platform: string, owner: string, repo: string) {
    const metrics = await this.metricsModel.findOne({
      platform,
      owner,
      repo,
    })

    if (!metrics) {
      // 如果没有数据,则同步一次
      await this.schedulerService.syncRepoMetrics(platform, owner, repo)
      return await this.metricsModel.findOne({
        platform,
        owner,
        repo,
      })
    }

    return metrics
  }

  // 添加新的仓库监控
  async addRepo(platform: string, owner: string, repo: string) {
    const exists = await this.metricsModel.exists({ platform, owner, repo })
    if (exists) {
      return exists
    }

    // 创建新记录并立即同步数据
    await this.schedulerService.syncRepoMetrics(platform, owner, repo)
    return await this.metricsModel.findOne({ platform, owner, repo })
  }

  // 移除仓库监控
  async removeRepo(
    platform: string,
    owner: string,
    repo: string,
  ): Promise<DeleteResult> {
    return await this.metricsModel.deleteOne({ platform, owner, repo })
  }
}
