import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class OpenDiggerBuilderService {
  private readonly baseUrl = 'https://oss.x-lab.info/open_digger'
  private readonly logger = new Logger(OpenDiggerBuilderService.name)
  constructor() {}

  // 获取基础URL
  private getBaseUrl(platform: string, owner: string, repo: string): string {
    return `${this.baseUrl}/${platform}/${owner}/${repo}`
  }

  // 封装请求方法，添加错误处理
  // 修改 fetchData 方法
  private async fetchData(url: string, metricName: string) {
    this.logger.debug(`开始获取 ${metricName} 的数据...`)
    try {
      const response = await axios.get(url)
      // 如果数据为空对象或空数组，返回 null
      if (
        !response.data ||
        (typeof response.data === 'object' &&
          Object.keys(response.data).length === 0) ||
        (Array.isArray(response.data) && response.data.length === 0)
      ) {
        return null
      }
      return response.data
    } catch (error) {
      // 如果是 404 错误，返回 null
      if (error.response && error.response.status === 404) {
        return null
      }
      // 其他错误仍然抛出
      throw new Error(`请求 ${metricName} (${url}) 失败: ${error.message}`)
    }
  }

  // 1. 活跃度相关方法
  async getActivity(platform: string, owner: string, repo: string) {
    const url = `${this.getBaseUrl(platform, owner, repo)}/activity.json`
    return await this.fetchData(url, 'activity')
  }

  // 2. Issue相关方法
  async getIssueMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      new: await this.fetchData(`${baseUrl}/issues_new.json`, 'issues_new'),
      closed: await this.fetchData(
        `${baseUrl}/issues_closed.json`,
        'issues_closed',
      ),
      comments: await this.fetchData(
        `${baseUrl}/issue_comments.json`,
        'issue_comments',
      ),
      age: await this.fetchData(`${baseUrl}/issue_age.json`, 'issue_age'),
      responseTime: await this.fetchData(
        `${baseUrl}/issue_response_time.json`,
        'issue_response_time',
      ),
      resolutionDuration: await this.fetchData(
        `${baseUrl}/issue_resolution_duration.json`,
        'issue_resolution_duration',
      ),
    }
    return metrics
  }

  // 3. PR相关方法
  async getPRMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      changeRequests: await this.fetchData(
        `${baseUrl}/change_requests.json`,
        'change_requests',
      ),
      reviews: await this.fetchData(
        `${baseUrl}/change_requests_reviews.json`,
        'change_requests_reviews',
      ),
      accepted: await this.fetchData(
        `${baseUrl}/change_requests_accepted.json`,
        'change_requests_accepted',
      ),
      age: await this.fetchData(
        `${baseUrl}/change_request_age.json`,
        'change_request_age',
      ),
      responseTime: await this.fetchData(
        `${baseUrl}/change_request_response_time.json`,
        'change_request_response_time',
      ),
      resolutionDuration: await this.fetchData(
        `${baseUrl}/change_request_resolution_duration.json`,
        'change_request_resolution_duration',
      ),
    }
    return metrics
  }

  // 4. 代码变更相关方法
  async getCodeChangeMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      addLines: await this.fetchData(
        `${baseUrl}/code_change_lines_add.json`,
        'code_change_lines_add',
      ),
      removeLines: await this.fetchData(
        `${baseUrl}/code_change_lines_remove.json`,
        'code_change_lines_remove',
      ),
      sumLines: await this.fetchData(
        `${baseUrl}/code_change_lines_sum.json`,
        'code_change_lines_sum',
      ),
    }
    return metrics
  }

  // 5. 贡献者相关方法
  async getContributorMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      contributors: await this.fetchData(
        `${baseUrl}/contributors.json`,
        'contributors',
      ),
      details: await this.fetchData(
        `${baseUrl}/contributors_detail.json`,
        'contributors_detail',
      ),
      newContributors: await this.fetchData(
        `${baseUrl}/new_contributors.json`,
        'new_contributors',
      ),
      inactiveContributors: await this.fetchData(
        `${baseUrl}/inactive_contributors.json`,
        'inactive_contributors',
      ),
      busFactor: await this.fetchData(
        `${baseUrl}/bus_factor.json`,
        'bus_factor',
      ),
    }
    return metrics
  }

  // 6. OpenRank相关方法
  async getOpenRankMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      openrank: await this.fetchData(`${baseUrl}/openrank.json`, 'openrank'),
      communityOpenrank: await this.fetchData(
        `${baseUrl}/community_openrank.json`,
        'community_openrank',
      ),
    }
    return metrics
  }

  // 7. 关注度相关方法
  async getAttentionMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      stars: await this.fetchData(`${baseUrl}/stars.json`, 'stars'),
      technicalFork: await this.fetchData(
        `${baseUrl}/technical_fork.json`,
        'technical_fork',
      ),
    }
    return metrics
  }
}
