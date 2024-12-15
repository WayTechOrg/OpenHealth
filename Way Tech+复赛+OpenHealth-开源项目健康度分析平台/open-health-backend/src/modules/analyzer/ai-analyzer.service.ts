import { Injectable } from '@nestjs/common'
import { GroqAIService } from '../ai/groqai.service'
import { ProjectMetrics } from './analyzer.interface'
import { AnalyzerService } from './analyzer.service'

@Injectable()
export class AIAnalyzerService {
  constructor(
    private readonly GroqAIService: GroqAIService,
    private readonly analyzerService: AnalyzerService,
  ) {}

  async generateHealthReport(metrics: ProjectMetrics): Promise<{
    analysis: string
  }> {
    // 1. 获取基础健康度评分
    const healthScores =
      await this.analyzerService.calculateProjectHealth(metrics)

    // 2. 构建分析提示
    const prompt = this.buildAnalysisPrompt(metrics, healthScores)

    // 3. 调用大模型生成分析报告
    const analysis = await this.GroqAIService.analyze(prompt)

    return {
      analysis,
    }
  }

  private buildAnalysisPrompt(
    metrics: ProjectMetrics,
    healthScores: any,
  ): string {
    const scoringLogicExplanation = `
评分逻辑说明:

1. 活跃度评分(占总分30%):
- 代码提交频率(40%): 基于月均提交次数取对数计算，月均10次提交得75分，50次得95分
- Issue活跃度(30%): 
  * 新建Issue数量(30%): 月均数取对数 
  * 关闭Issue数量(30%): 月均数取对数
  * Issue响应时间(20%): 响应时间越短分数越高
  * Issue解决时间(20%): 解决时间越短分数越高
- PR活跃度(30%):
  * 新建PR数量(30%): 月均数取对数
  * 合并PR数量(30%): 月均数取对数
  * PR响应时间(20%): 响应时间越短分数越高
  * PR处理时间(20%): 处理时间越短分数越高

2. 社区健康度(占总分30%):
- 贡献者数量(40%): 月均活跃贡献者数取对数计算
- Issue响应速度(30%): 响应时间取对数，时间越短分数越高
- PR处理速度(30%): 处理周期取对数，时间越短分数越高

3. 代码质量(占总分20%):
- 暂定基准分70分

4. 文档完整性(占总分20%):
- 暂定基准分70分

注: 所有时间相关的评分都采用对数衰减模型，以平衡极端值的影响。
`

    // 1. 构建基础指标解释
    const baseMetricsExplanation = `
      项目健康度评分说明:
      - 活跃度得分(${healthScores.activityScore}/100): 
        * 代码提交频率: ${healthScores.details.activity.commitFrequency}/100 (月均提交次数的对数计算)
        
      - 社区健康度(${healthScores.communityScore}/100):
        * 贡献者数量得分: ${healthScores.details.community.contributorScore}/100 (月均活跃贡献者数)
    `

    // 2. 构建具体数据分析
    const detailedMetrics = `
      具体数据分析:
      1. 活跃度指标:
      - 近12个月每月提交次数: ${JSON.stringify(metrics.activity)}
      - Issue统计: 新建${Object.values(metrics.issues?.new || {}).reduce((a, b) => a + b, 0)}个, 
        关闭${Object.values(metrics.issues?.closed || {}).reduce((a, b) => a + b, 0)}个
      - PR统计: 提交${Object.values(metrics.pullRequests?.changeRequests || {}).reduce((a, b) => a + b, 0)}个, 
        合并${Object.values(metrics.pullRequests?.accepted || {}).reduce((a, b) => a + b, 0)}个
  
      2. 社区指标:
      - 月均活跃贡献者: ${Object.values(metrics.contributors?.contributors || {}).reduce((a, b) => a + Math.max(b, 0), 0) / 12}人
      - Issue响应时间: ${Object.values(metrics.issues?.responseTime || {})
        .slice(-3)
        .join(', ')} (最近3个月)
      - PR处理时间: ${Object.values(
        metrics.pullRequests?.resolutionDuration || {},
      )
        .slice(-3)
        .join(', ')} (最近3个月)
        3. 关注度指标:
        - Stars趋势: ${JSON.stringify(metrics.attention?.stars)}
        - 技术复用情况: ${JSON.stringify(metrics.attention?.technicalFork)}
        
        7. 代码变更规模:
        - 新增代码行数: ${JSON.stringify(metrics.codeChanges?.addLines)}
        - 删除代码行数: ${JSON.stringify(metrics.codeChanges?.removeLines)}
        - 总体变更规模: ${JSON.stringify(metrics.codeChanges?.sumLines)}
        
        8. 贡献者详情:
        - 新增贡献者趋势: ${JSON.stringify(metrics.contributors?.newContributors)}
        - 流失贡献者情况: ${JSON.stringify(metrics.contributors?.inactiveContributors)}
        - 项目巴士因子: ${JSON.stringify(metrics.contributors?.busFactor)}
    `

    // 3. 构建分析请求
    const analysisRequest = `
      基于以上数据,请从以下几个方面进行分析:
      
      1. 项目健康状况总结:
      - 总体健康度评价
      - 各维度表现分析
      - 突出的优势和问题
      
      2. 发展趋势分析:
      - 活跃度变化趋势
      - 社区增长情况
      - 未来发展预测
      
      3. 具体问题诊断:
      - 识别当前存在的主要问题
      - 分析问题产生的原因
      - 评估问题的严重程度
      
      4. 改进建议(请按优先级排序):
      - 短期改进建议(1-3个月)
      - 中期改进计划(3-6个月)
      - 长期发展建议(6个月以上)

      5. 影响力分析:
      - 项目在开源生态中的地位
      - 技术影响力变化趋势
      - 社区价值分布情况

      6. 可持续性评估:
      - 贡献者更替情况
      - 核心维护者依赖风险
      - 长期发展潜力预测
      
      对于每条建议,请详细地说明:
      - 预期改进效果
      - 所需资源投入
      - 实施难度评估
      - 具体执行步骤
      
      请用清晰的结构化格式输出分析结果。
    `

    return `${scoringLogicExplanation}\n${baseMetricsExplanation}\n${detailedMetrics}\n${analysisRequest}`
  }
}
