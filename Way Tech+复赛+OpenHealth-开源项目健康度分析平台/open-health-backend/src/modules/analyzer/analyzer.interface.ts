export interface TimeSeriesData {
  [key: string]: number
}

export interface IssueMetrics {
  new?: TimeSeriesData
  closed?: TimeSeriesData
  responseTime?: TimeSeriesData
  resolutionDuration?: TimeSeriesData
}

export interface PRMetrics {
  changeRequests?: TimeSeriesData
  accepted?: TimeSeriesData
  responseTime?: TimeSeriesData
  resolutionDuration?: TimeSeriesData
}

export interface ContributorMetrics {
  contributors?: TimeSeriesData
  newContributors?: TimeSeriesData
  inactiveContributors?: TimeSeriesData
  busFactor?: TimeSeriesData
}

export interface CodeQualityMetrics {
  codeChanges?: {
    additions?: TimeSeriesData
    deletions?: TimeSeriesData
    totalChanges?: TimeSeriesData
  }
  busFactor?: TimeSeriesData
  complexity?: TimeSeriesData
}

export interface CommunityVitalityMetrics {
  stars?: TimeSeriesData
  forks?: TimeSeriesData
  openrank?: TimeSeriesData
  newcomers?: TimeSeriesData
}

export interface AttentionMetrics {
  stars?: TimeSeriesData
  technicalFork?: TimeSeriesData
}

export interface ProjectMetrics {
  activity?: TimeSeriesData
  issues?: IssueMetrics
  pullRequests?: PRMetrics
  contributors?: ContributorMetrics
  codeQuality?: CodeQualityMetrics // 新增
  communityVitality?: CommunityVitalityMetrics // 新增
  attention?: AttentionMetrics // 新增
  openrank?: OpenrankMetrics // 新增
  codeChanges?: CodeChangesMetrics // 新增
}

export interface OpenrankMetrics {
  openrank?: TimeSeriesData
  communityOpenrank?: TimeSeriesData
}

export interface CodeChangesMetrics {
  addLines?: TimeSeriesData
  removeLines?: TimeSeriesData
  sumLines?: TimeSeriesData
}
