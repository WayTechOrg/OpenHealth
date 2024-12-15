import { Injectable } from '@nestjs/common'
import { OpenDiggerService } from '../open-digger/openDigger.service'
import {
  IssueMetrics,
  PRMetrics,
  ProjectMetrics,
  TimeSeriesData,
} from './analyzer.interface'

@Injectable()
export class AnalyzerService {
  constructor(private readonly openDiggerService: OpenDiggerService) {}

  // 计算提交频率分数 (0-100)
  async calculateCommitFrequencyScore(
    activity?: TimeSeriesData,
  ): Promise<number> {
    if (!activity) return 0

    const commitCounts = Object.values(activity)
    if (commitCounts.length === 0) return 0

    // 计算月平均提交数
    const avgCommits =
      commitCounts.reduce((a, b) => a + b, 0) / commitCounts.length

    // 使用对数函数将提交数映射到0-100分
    // 假设月均10次提交得75分,50次得95分
    return Math.min(100, Math.log10(avgCommits + 1) * 40)
  }

  // 计算Issue活跃度分数 (0-100)
  async calculateIssueActivityScore(issues?: IssueMetrics): Promise<number> {
    if (!issues) return 0

    const {
      new: newIssues,
      closed: closedIssues,
      responseTime,
      resolutionDuration,
    } = issues

    if (!newIssues && !closedIssues) return 0

    const newScore = newIssues
      ? Math.min(
          100,
          Math.log10(
            Object.values(newIssues).reduce((a, b) => a + b, 0) / 12 + 1,
          ) * 40,
        )
      : 0

    const closedScore = closedIssues
      ? Math.min(
          100,
          Math.log10(
            Object.values(closedIssues).reduce((a, b) => a + b, 0) / 12 + 1,
          ) * 40,
        )
      : 0

    const responseScore = responseTime
      ? Math.max(
          0,
          100 -
            Math.log2(
              Object.values(responseTime).reduce((a, b) => a + b, 0) /
                Object.keys(responseTime).length +
                1,
            ) *
              15,
        )
      : 50

    const resolutionScore = resolutionDuration
      ? Math.max(
          0,
          100 -
            Math.log2(
              Object.values(resolutionDuration).reduce((a, b) => a + b, 0) /
                Object.keys(resolutionDuration).length +
                1,
            ) *
              10,
        )
      : 50

    return (
      newScore * 0.3 +
      closedScore * 0.3 +
      responseScore * 0.2 +
      resolutionScore * 0.2
    )
  }

  // 计算PR活跃度分数 (0-100)
  async calculatePRActivityScore(prs?: PRMetrics): Promise<number> {
    if (!prs) return 0

    const {
      changeRequests: newPRs,
      accepted: mergedPRs,
      responseTime,
      resolutionDuration,
    } = prs

    if (!newPRs && !mergedPRs) return 0

    const newScore = newPRs
      ? Math.min(
          100,
          Math.log10(
            Object.values(newPRs).reduce((a, b) => a + b, 0) / 12 + 1,
          ) * 40,
        )
      : 0

    const mergedScore = mergedPRs
      ? Math.min(
          100,
          Math.log10(
            Object.values(mergedPRs).reduce((a, b) => a + b, 0) / 12 + 1,
          ) * 40,
        )
      : 0

    const responseScore = responseTime
      ? Math.max(
          0,
          100 -
            Math.log2(
              Object.values(responseTime).reduce((a, b) => a + b, 0) /
                Object.keys(responseTime).length +
                1,
            ) *
              15,
        )
      : 50

    const resolutionScore = resolutionDuration
      ? Math.max(
          0,
          100 -
            Math.log2(
              Object.values(resolutionDuration).reduce((a, b) => a + b, 0) /
                Object.keys(resolutionDuration).length +
                1,
            ) *
              10,
        )
      : 50

    return (
      newScore * 0.3 +
      mergedScore * 0.3 +
      responseScore * 0.2 +
      resolutionScore * 0.2
    )
  }

  // 计算项目总体健康度
  async calculateProjectHealth(metrics: ProjectMetrics): Promise<{
    overallScore: number
    activityScore: number
    communityScore: number
    codeQualityScore: number
    documentationScore: number
    details: any
  }> {
    // 1. 活跃度评分 (30%)
    const commitFrequency = await this.calculateCommitFrequencyScore(
      metrics.activity,
    )
    const issueActivity =
      (await this.calculateIssueActivityScore(metrics.issues)) || 0
    const prActivity =
      (await this.calculatePRActivityScore(metrics.pullRequests)) || 0

    const activityScore =
      (commitFrequency || 0) * 0.4 +
      (issueActivity || 0) * 0.3 +
      (prActivity || 0) * 0.3

    // 2. 社区健康度评分 (30%)
    const contributors = metrics.contributors?.contributors || {}
    const contributorCount =
      Object.values(contributors).reduce((a, b) => a + Math.max(b, 0), 0) / 12
    const contributorScore = Math.min(
      100,
      Math.log10(contributorCount + 1) * 40,
    )

    const issueResponseScore = metrics.issues?.responseTime
      ? Math.max(
          0,
          100 -
            Math.log2(
              Object.values(metrics.issues.responseTime).reduce(
                (a, b) => a + b,
                0,
              ) /
                Object.keys(metrics.issues.responseTime).length +
                1,
            ) *
              15,
        )
      : 50

    const prProcessingScore = metrics.pullRequests?.resolutionDuration
      ? Math.max(
          0,
          100 -
            Math.log2(
              Object.values(metrics.pullRequests.resolutionDuration).reduce(
                (a, b) => a + b,
                0,
              ) /
                Object.keys(metrics.pullRequests.resolutionDuration).length +
                1,
            ) *
              10,
        )
      : 50

    const communityScore =
      (contributorScore || 0) * 0.4 +
      (issueResponseScore || 50) * 0.3 +
      (prProcessingScore || 50) * 0.3

    // 3. 代码质量评分 (20%) - 暂时使用占位符
    const codeQualityScore = 70

    // 4. 文档完整性评分 (20%) - 暂时使用占位符
    const documentationScore = 70

    // 计算总分
    const overallScore =
      activityScore * 0.3 +
      communityScore * 0.3 +
      (codeQualityScore || 70) * 0.2 +
      (documentationScore || 70) * 0.2

    return {
      overallScore,
      activityScore,
      communityScore,
      codeQualityScore,
      documentationScore,
      details: {
        activity: {
          commitFrequency,
          issueActivity,
          prActivity,
        },
        community: {
          contributorScore,
          issueResponseScore,
          prProcessingScore,
        },
        codeQuality: {
          placeholder: true,
        },
        documentation: {
          placeholder: true,
        },
      },
    }
  }
}
