<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import fetcher from '@/utils/fetcher'
import * as echarts from 'echarts'
import { useColorMode } from '@vueuse/core'
import MarkdownIt from 'markdown-it'

const mode = useColorMode()
const md = new MarkdownIt()

interface Project {
  platform: string
  owner: string
  repo: string
  healthScore?: {
    activity: number
    community: number
    code: number
    docs: number
  }
  aiAnalysis?: string
  aiScore?: number
}

// 项目列表
const projects = ref<Project[]>([])
const loading = ref(false)

// 表单数据
const form = ref({
  platform: 'github',
  owner: '',
  repo: '',
})

// 从localStorage获取已有项目列表
const existingProjects = ref<Project[]>([])

onMounted(() => {
  const storedProjects = localStorage.getItem('projects')
  if (storedProjects) {
    existingProjects.value = JSON.parse(storedProjects)
  }
})

// 自动完成选项
const autoCompleteOptions = computed(() => {
  return existingProjects.value.map((p) => ({
    value: `${p.platform}/${p.owner}/${p.repo}`,
    label: `${p.owner}/${p.repo}`,
    project: p,
  }))
})

// 添加 searchQuery ref
const searchQuery = ref('')

// 处理选择已有项目
const handleSelect = (item: any) => {
  if (item && item.project) {
    form.value.platform = item.project.platform
    form.value.owner = item.project.owner
    form.value.repo = item.project.repo
    // 清空搜索框
    searchQuery.value = ''
  }
}

// 搜索过滤
const filterProjects = (query: string, cb: (arg: any[]) => void) => {
  const results = query
    ? autoCompleteOptions.value.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase()),
      )
    : autoCompleteOptions.value

  // 调用回调函数返回结果
  cb(results)
}

// 添加项目
const addProject = async () => {
  if (!form.value.owner || !form.value.repo) {
    ElMessage.warning('请输入完整的项目信息')
    return
  }

  // 检查是否已添加到对比列表
  const exists = projects.value.some(
    (p) =>
      p.platform === form.value.platform &&
      p.owner === form.value.owner &&
      p.repo === form.value.repo,
  )

  if (exists) {
    ElMessage.warning('该项目已添加到对比列表')
    return
  }

  // 从 localStorage 中查找项目
  const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]')
  const storedProject = storedProjects.find(
    (p: any) =>
      p.platform === form.value.platform &&
      p.owner === form.value.owner &&
      p.repo === form.value.repo,
  )

  if (storedProject) {
    // 如果找到了,直接添加到对比列表
    projects.value.push(storedProject)
    // 清空表单
    form.value.owner = ''
    form.value.repo = ''
    // 更新图表
    updateCharts()
    ElMessage.success('已添加到对比列表')
  } else {
    ElMessage.warning('项目未找到,请先在项目分析页面添加该项目')
  }
}

// 添加更新项目数据的函数
const updateProject = async (project: Project) => {
  try {
    loading.value = true
    // 获取最新数据
    const healthData = (await fetcher.getProjectHealth(
      project.platform,
      project.owner,
      project.repo,
    )) as any
    const aiData = (await fetcher.getProjectHealthAI(
      project.platform,
      project.owner,
      project.repo,
    )) as any

    // 更新项目数据
    const index = projects.value.findIndex(
      (p) =>
        p.platform === project.platform &&
        p.owner === project.owner &&
        p.repo === project.repo,
    )
    if (index !== -1) {
      projects.value[index] = {
        ...project,
        healthScore: {
          activity: healthData.activityScore,
          community: healthData.communityScore,
          code: healthData.codeQualityScore,
          docs: healthData.documentationScore,
        },
        aiAnalysis: aiData.analysis,
        aiScore: aiData.score,
      }

      // 同时更新 localStorage 中的数据
      const storedProjects = JSON.parse(
        localStorage.getItem('projects') || '[]',
      )
      const storedIndex = storedProjects.findIndex(
        (p: any) =>
          p.platform === project.platform &&
          p.owner === project.owner &&
          p.repo === project.repo,
      )
      if (storedIndex !== -1) {
        storedProjects[storedIndex] = projects.value[index]
        localStorage.setItem('projects', JSON.stringify(storedProjects))
      }

      // 更新图表
      updateCharts()
      ElMessage.success('项目数据已更新')
    }
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    loading.value = false
  }
}

// 移除项目
const removeProject = (index: number) => {
  projects.value.splice(index, 1)
  updateCharts()
}

// 更新图表
const updateCharts = () => {
  const radarChart = echarts.init(document.getElementById('radar-chart'))
  const barChart = echarts.init(document.getElementById('bar-chart'))
  const aiScoreChart = echarts.init(document.getElementById('ai-score-chart'))

  // 雷达图配置
  const radarOption = {
    title: {
      text: '项目健康度对比',
      textStyle: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
      top: 5,
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      data: projects.value.map((p) => `${p.owner}/${p.repo}`),
      textStyle: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
      bottom: 0,
      type: 'scroll',
    },
    radar: {
      indicator: [
        { name: '活跃度', max: 100 },
        { name: '社区健康度', max: 100 },
        { name: '代码质量', max: 100 },
        { name: '文档完整度', max: 100 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: projects.value.map((p) => ({
          name: `${p.owner}/${p.repo}`,
          value: [
            p.healthScore?.activity || 0,
            p.healthScore?.community || 0,
            p.healthScore?.code || 0,
            p.healthScore?.docs || 0,
          ],
        })),
      },
    ],
  }

  // 柱状图配置
  const barOption = {
    title: {
      text: '项目指标对比',
      textStyle: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
      top: 5,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['活跃度', '社区健康度', '���码质量', '文档完整度'],
      textStyle: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
      bottom: 0,
      type: 'scroll',
    },
    grid: {
      top: 60,
      bottom: 60,
      left: '3%',
      right: '4%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: projects.value.map((p) => `${p.owner}/${p.repo}`),
      axisLabel: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
    },
    series: [
      {
        name: '活跃度',
        type: 'bar',
        data: projects.value.map((p) => p.healthScore?.activity || 0),
      },
      {
        name: '社区健康度',
        type: 'bar',
        data: projects.value.map((p) => p.healthScore?.community || 0),
      },
      {
        name: '代码质量',
        type: 'bar',
        data: projects.value.map((p) => p.healthScore?.code || 0),
      },
      {
        name: '文档完整度',
        type: 'bar',
        data: projects.value.map((p) => p.healthScore?.docs || 0),
      },
    ],
  }

  // AI得分图表配置
  const aiScoreOption = {
    title: {
      text: 'AI 综合评分对比',
      textStyle: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
      top: 5,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}分',
    },
    grid: {
      top: 60,
      bottom: 30,
      left: '3%',
      right: '4%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: projects.value.map((p) => `${p.owner}/${p.repo}`),
      axisLabel: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        color: mode.value === 'dark' ? '#fff' : '#000',
        formatter: '{value}分',
      },
    },
    series: [
      {
        type: 'bar',
        data: projects.value.map((p) => p.aiScore || 0),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' },
          ]),
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' },
            ]),
          },
        },
      },
    ],
  }

  radarChart.setOption(radarOption)
  barChart.setOption(barOption)
  aiScoreChart.setOption(aiScoreOption)
}

// 生成分析报告
const generateReport = computed(() => {
  if (projects.value.length === 0) return ''

  const report = []
  const metrics = ['activity', 'community', 'code', 'docs']
  const metricNames = {
    activity: '活跃度',
    community: '社区健康度',
    code: '代码质量',
    docs: '文档完整度',
  } as any

  if (projects.value.length === 1) {
    // 单个项目的报告
    const project = projects.value[0]
    report.push(`### ${project.owner}/${project.repo} 项目分析\n`)
    metrics.forEach((metric) => {
      report.push(`
#### ${metricNames[metric]}
- 得分: ${project.healthScore?.[metric as keyof typeof project.healthScore] || 0}分
      `)
    })
  } else {
    // 多个项目的对比报告
    metrics.forEach((metric) => {
      const scores = projects.value.map(
        (p) => p.healthScore?.[metric as keyof typeof p.healthScore] || 0,
      )
      const max = Math.max(...scores)
      const min = Math.min(...scores)
      const bestProject = projects.value[scores.indexOf(max)]
      const worstProject = projects.value[scores.indexOf(min)]

      report.push(`
### ${metricNames[metric]}对比
- 最优项目: ${bestProject.owner}/${bestProject.repo} (${max}分)
- 最低项目: ${worstProject.owner}/${worstProject.repo} (${min}分)
- 差距: ${(max - min).toFixed(2)}分
      `)
    })
  }

  return report.join('\n')
})

// 添加重新生成 AI 分析的函数
const regenerateAI = async (project: Project) => {
  try {
    loading.value = true
    const aiData = (await fetcher.getProjectHealthAI(
      project.platform,
      project.owner,
      project.repo,
    )) as any

    // 更新项目的 AI 分析结果
    const index = projects.value.findIndex(
      (p) =>
        p.platform === project.platform &&
        p.owner === project.owner &&
        p.repo === project.repo,
    )
    if (index !== -1) {
      projects.value[index].aiAnalysis = aiData.analysis
      projects.value[index].aiScore = aiData.score
    }

    // 更新图表
    updateCharts()
    ElMessage.success('AI 分析已更新')
  } catch (error) {
    ElMessage.error('重新生成 AI 分析失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="project-compare">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目对比</span>
        </div>
      </template>

      <!-- 添加项目表单 -->
      <el-form :model="form" inline>
        <el-form-item label="选择项目">
          <el-autocomplete
            v-model="searchQuery"
            :fetch-suggestions="filterProjects"
            placeholder="搜索已有项目或输入新项目"
            @select="handleSelect"
            style="width: 300px"
          >
            <template #default="{ item }">
              <div class="suggestion-item">
                <el-tag size="small">{{ item.project.platform }}</el-tag>
                <span class="project-name">{{ item.label }}</span>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>

        <el-form-item label="或手动输入">
          <el-select v-model="form.platform" style="width: 120px">
            <el-option label="GitHub" value="github" />
            <el-option label="GitLab" value="gitlab" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="form.owner"
            placeholder="所有者"
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="form.repo"
            placeholder="仓库名"
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="addProject" :loading="loading">
            添加项目
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 项目列表 -->
      <div class="project-list" v-if="projects.length > 0">
        <el-table :data="projects">
          <el-table-column prop="platform" label="平台" width="100">
            <template #default="{ row }">
              <el-tag>{{ row.platform }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="所有者" />
          <el-table-column prop="repo" label="仓库名" />
          <el-table-column label="操作" width="200">
            <template #default="{ row, $index }">
              <el-button-group>
                <el-button
                  type="primary"
                  size="small"
                  :loading="loading"
                  @click="updateProject(row)"
                >
                  更新数据
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="removeProject($index)"
                >
                  移除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 对比图表 -->
      <div v-if="projects.length > 0" class="charts-container">
        <div id="radar-chart" class="chart"></div>
        <div id="bar-chart" class="chart"></div>
        <div id="ai-score-chart" class="chart"></div>
      </div>

      <!-- 分析报告 -->
      <div v-if="projects.length > 0" class="analysis-report">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>对比分析报告</span>
            </div>
          </template>
          <div v-html="md.render(generateReport)" class="report-content"></div>
        </el-card>
      </div>

      <!-- AI 分析结果对比 -->
      <div v-if="projects.length > 0" class="ai-analysis">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>AI 分析结果对比</span>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col
              :span="12"
              v-for="project in projects"
              :key="project.owner + project.repo"
            >
              <el-card class="ai-analysis-card" shadow="hover">
                <template #header>
                  <div class="ai-card-header">
                    <div class="ai-card-title">
                      <span>{{ project.owner }}/{{ project.repo }}</span>
                      <el-tag
                        type="success"
                        effect="dark"
                        v-if="project.aiScore"
                      >
                        {{ project.aiScore }}分
                      </el-tag>
                    </div>
                    <el-button
                      type="primary"
                      size="small"
                      :loading="loading"
                      @click="regenerateAI(project)"
                    >
                      重新生成
                    </el-button>
                  </div>
                </template>
                <div
                  v-html="md.render(project.aiAnalysis || '暂无AI分析')"
                  class="ai-content"
                ></div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.project-compare {
  padding: 20px;
}

.project-list {
  margin: 20px 0;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 20px 0;
}

.chart {
  height: 360px;
  background: var(--el-bg-color);
  border-radius: 4px;
  padding: 24px 16px;
}

.analysis-report {
  margin-top: 20px;
}

.report-content {
  line-height: 1.6;
}

:deep(.report-content h3) {
  color: var(--el-text-color-primary);
  margin: 16px 0;
}

:deep(.report-content ul) {
  padding-left: 20px;
}

:deep(.report-content li) {
  color: var(--el-text-color-regular);
  margin: 8px 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.project-name {
  color: var(--el-text-color-primary);
  font-size: 14px;
}

:deep(.el-autocomplete-suggestion__wrap) {
  padding: 8px;
}

:deep(.el-tag) {
  text-transform: uppercase;
}

.ai-analysis {
  margin-top: 20px;
}

.ai-analysis-card {
  margin-bottom: 20px;
}

.ai-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-content {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

:deep(.ai-content h1, .ai-content h2, .ai-content h3) {
  color: var(--el-text-color-primary);
  margin: 16px 0;
}

:deep(.ai-content p) {
  color: var(--el-text-color-regular);
  margin: 12px 0;
  line-height: 1.6;
}

:deep(.ai-content ul) {
  padding-left: 20px;
  margin: 12px 0;
}

:deep(.ai-content li) {
  color: var(--el-text-color-regular);
  margin: 8px 0;
}
</style>
