import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class OpenDiggerBuilderService {
  private readonly baseUrl = 'https://oss.open-digger.cn'

  constructor() {}

  // 获取基础URL
  private getBaseUrl(platform: string, owner: string, repo: string): string {
    return `${this.baseUrl}/${platform}/${owner}/${repo}`
  }

  // 1. 活跃度相关方法
  async getActivity(platform: string, owner: string, repo: string) {
    const url = `${this.getBaseUrl(platform, owner, repo)}/activity.json`
    return await axios.get(url)
  }

  // 2. Issue相关方法
  async getIssueMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      new: await axios.get(`${baseUrl}/issues_new.json`),
      closed: await axios.get(`${baseUrl}/issues_closed.json`),
      comments: await axios.get(`${baseUrl}/issue_comments.json`),
      age: await axios.get(`${baseUrl}/issue_age.json`),
      responseTime: await axios.get(`${baseUrl}/issue_response_time.json`),
      resolutionDuration: await axios.get(
        `${baseUrl}/issue_resolution_duration.json`,
      ),
    }
    return metrics
  }

  // 3. PR相关方法
  async getPRMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      changeRequests: await axios.get(`${baseUrl}/change_requests.json`),
      reviews: await axios.get(`${baseUrl}/change_request_reviews.json`),
      accepted: await axios.get(`${baseUrl}/change_requests_accepted.json`),
      age: await axios.get(`${baseUrl}/change_request_age.json`),
      responseTime: await axios.get(
        `${baseUrl}/change_request_response_time.json`,
      ),
      resolutionDuration: await axios.get(
        `${baseUrl}/change_requests_resolution_duration.json`,
      ),
    }
    return metrics
  }

  // 4. 代码变更相关方法
  async getCodeChangeMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      addLines: await axios.get(`${baseUrl}/code_change_lines_add.json`),
      removeLines: await axios.get(`${baseUrl}/code_change_lines_remove.json`),
      sumLines: await axios.get(`${baseUrl}/code_change_lines_sum.json`),
    }
    return metrics
  }

  // 5. 贡献者相关方法
  async getContributorMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      contributors: await axios.get(`${baseUrl}/contributors.json`),
      details: await axios.get(`${baseUrl}/contributors_detail.json`),
      newContributors: await axios.get(`${baseUrl}/new_contributors.json`),
      inactiveContributors: await axios.get(
        `${baseUrl}/inactive_contributors.json`,
      ),
      busFactor: await axios.get(`${baseUrl}/bus_factor.json`),
      absenceFactor: await axios.get(
        `${baseUrl}/contributor_absence_factor.json`,
      ),
    }
    return metrics
  }

  // 6. OpenRank相关方法
  async getOpenRankMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      openrank: await axios.get(`${baseUrl}/openrank.json`),
      details: await axios.get(`${baseUrl}/openrank_detail.json`),
      communityOpenrank: await axios.get(`${baseUrl}/community_openrank.json`),
      communityDetails: await axios.get(
        `${baseUrl}/community_openrank_detail.json`,
      ),
    }
    return metrics
  }

  // 7. 关注度相关方法
  async getAttentionMetrics(platform: string, owner: string, repo: string) {
    const baseUrl = this.getBaseUrl(platform, owner, repo)
    const metrics = {
      stars: await axios.get(`${baseUrl}/stars.json`),
      technicalFork: await axios.get(`${baseUrl}/technical_fork.json`),
    }
    return metrics
  }
}
