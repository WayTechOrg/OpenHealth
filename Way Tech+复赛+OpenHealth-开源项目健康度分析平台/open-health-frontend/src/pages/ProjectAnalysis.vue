<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import fetcher from '@/utils/fetcher'
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import MarkdownIt from 'markdown-it'
import { useRouter } from 'vue-router'

// 注册 ChartJS 组件
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

// markdown 解析器
const md = new MarkdownIt()

// 表单数据
const form = ref({
  platform: 'github',
  owner: '',
  repo: '',
})

// 表单规则
const rules = {
  platform: [{ required: true, message: '请选择平台' }],
  owner: [{ required: true, message: '请输入仓库所有者' }],
  repo: [{ required: true, message: '请输入仓库名称' }],
}

const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 分析结果
const analysisResult = ref<any>(null)

// 雷达图数据
const chartData = ref({
  labels: ['活跃度', '社区健康度', '代码质量', '文档完整度'],
  datasets: [
    {
      label: '健康度评分',
      data: [0, 0, 0, 0],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)',
      pointBackgroundColor: 'rgb(54, 162, 235)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(54, 162, 235)',
    },
  ],
})

// 图表配置
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      min: 0,
      max: 100,
      beginAtZero: true,
    },
  },
}

// 添加保存项目到本地存储的函数
const saveProjectToLocal = (projectData: any, aiAnalysis: any) => {
  try {
    const storedProjects = localStorage.getItem('projects') || '[]'
    const projects = JSON.parse(storedProjects)

    // 创建新的项目对象
    const newProject = {
      id: Date.now().toString(), // 使用时间戳作为临时ID
      platform: form.value.platform,
      owner: form.value.owner,
      repo: form.value.repo,
      healthScore: {
        activity: projectData.activityScore,
        community: projectData.communityScore,
        code: projectData.codeQualityScore,
        docs: projectData.documentationScore,
      },
      lastAnalyzed: new Date().toISOString(),
      aiAnalysis: aiAnalysis.analysis,
      aiScore: aiAnalysis.score,
    }

    // 添加到项目列表
    projects.push(newProject)
    localStorage.setItem('projects', JSON.stringify(projects))

    ElMessage.success('项目已保存到列表')
    // 分析完成后跳转到项目列表
    router.push('/projects')
  } catch (error) {
    console.error('保存项目失败:', error)
  }
}

// 提交分析
const handleAnalyze = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    loading.value = true
    const { platform, owner, repo } = form.value

    // 获取健康度数据
    const healthData = await fetcher.getProjectHealth(platform, owner, repo)
    const aiAnalysis = await fetcher.getProjectHealthAI(platform, owner, repo)

    if (aiAnalysis.score === 0) {
      ElMessage.warning('AI评分生成异常，请稍后重试')
    }

    // 保存项目到本地存储
    saveProjectToLocal(healthData, aiAnalysis)

    // 更新图表数据
    chartData.value.datasets[0].data = [
      healthData.activityScore,
      healthData.communityScore,
      healthData.codeQualityScore,
      healthData.documentationScore,
    ]

    analysisResult.value = {
      health: healthData,
      ai: aiAnalysis,
    }

    ElMessage.success('分析完成')
  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const parseRepoUrl = (url: string) => {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)

    if (urlObj.hostname === 'github.com' && pathParts.length >= 2) {
      form.value.platform = 'github'
      form.value.owner = pathParts[0]
      form.value.repo = pathParts[1]
      return true
    } else if (urlObj.hostname.includes('gitlab') && pathParts.length >= 2) {
      form.value.platform = 'gitlab'
      form.value.owner = pathParts[0]
      form.value.repo = pathParts[1]
      return true
    }

    ElMessage.warning('不支持的仓库链接格式')
    return false
  } catch (error) {
    ElMessage.error('无效的URL格式')
    return false
  }
}

const repoUrl = ref('')

const handleUrlParse = () => {
  if (!repoUrl.value) {
    ElMessage.warning('请输入仓库链接')
    return
  }
  parseRepoUrl(repoUrl.value)
}
</script>

<template>
  <div class="project-analysis">
    <!-- 分析表单 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目分析</span>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="平台" prop="platform">
          <el-select v-model="form.platform">
            <el-option label="GitHub" value="github" />
            <el-option label="GitLab" value="gitlab" />
          </el-select>
        </el-form-item>

        <el-form-item label="仓库所有者" prop="owner">
          <el-input v-model="form.owner" />
        </el-form-item>

        <el-form-item label="仓库名称" prop="repo">
          <el-input v-model="form.repo" />
        </el-form-item>

        <el-form-item label="仓库链接">
          <el-input
            v-model="repoUrl"
            placeholder="例如: https://github.com/owner/repo"
            class="repo-url-input"
          >
            <template #append>
              <el-button @click="handleUrlParse">解析</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleAnalyze" :loading="loading">
            开始分析
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 分析结果 -->
    <el-card v-if="analysisResult" class="result-card">
      <template #header>
        <div class="card-header">
          <span>分析结果</span>
        </div>
      </template>

      <el-tabs>
        <el-tab-pane label="健康度评分">
          <div class="score-overview">
            <h3>
              总体评分: {{ analysisResult.health.overallScore.toFixed(2) }}
            </h3>
            <div class="chart-container">
              <Radar :data="chartData" :options="chartOptions" />
            </div>

            <div class="score-details">
              <h4>详细评分</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="提交频率">
                  {{ analysisResult.health.details.activity.commitFrequency }}
                </el-descriptions-item>
                <el-descriptions-item label="Issue 活跃度">
                  {{ analysisResult.health.details.activity.issueActivity }}
                </el-descriptions-item>
                <el-descriptions-item label="PR 活跃度">
                  {{ analysisResult.health.details.activity.prActivity }}
                </el-descriptions-item>
                <el-descriptions-item label="贡献者评分">
                  {{
                    analysisResult.health.details.community.contributorScore?.toFixed(
                      2,
                    ) || 'N/A'
                  }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="AI 分析建议">
          <div class="ai-analysis">
            <div class="ai-score" v-if="analysisResult.ai.score">
              <el-alert
                title="AI 综合评分"
                type="success"
                :description="`${analysisResult.ai.score} 分`"
                :closable="false"
                show-icon
              />
            </div>
            <div v-html="md.render(analysisResult.ai.analysis)"></div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.project-analysis {
  padding: 20px;
}

.result-card {
  margin-top: 20px;
}

.chart-container {
  height: 400px;
  margin: 20px 0;
}

.score-overview {
  text-align: center;
}

.score-details {
  margin-top: 20px;
  text-align: left;
}

.ai-analysis {
  padding: 24px;
  line-height: 1.8;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
}

.ai-score {
  margin-bottom: 24px;
}

:deep(.ai-analysis h1) {
  font-size: 1.8em;
  margin: 24px 0 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--el-border-color-light);
  color: var(--el-text-color-primary);
}

:deep(.ai-analysis h2) {
  font-size: 1.5em;
  margin: 24px 0 16px;
  color: var(--el-text-color-primary);
}

:deep(.ai-analysis h3) {
  font-size: 1.3em;
  margin: 20px 0 12px;
  color: var(--el-text-color-primary);
}

:deep(.ai-analysis p) {
  margin: 14px 0;
  line-height: 1.8;
  color: var(--el-text-color-regular);
}

:deep(.ai-analysis ul, .ai-analysis ol) {
  padding-left: 24px;
  margin: 14px 0;
}

:deep(.ai-analysis li) {
  margin: 10px 0;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  position: relative;
}

:deep(.ai-analysis code) {
  background-color: var(--el-bg-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
  color: var(--el-text-color-primary);
}

:deep(.ai-analysis pre) {
  background-color: var(--el-bg-color);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

:deep(.ai-analysis pre code) {
  background-color: transparent;
  padding: 0;
}

:deep(.ai-analysis blockquote) {
  border-left: 4px solid var(--el-border-color);
  margin: 16px 0;
  padding: 0 16px;
  color: var(--el-text-color-secondary);
}

:deep(.ai-analysis table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

:deep(.ai-analysis th, .ai-analysis td) {
  border: 1px solid var(--el-border-color-light);
  padding: 8px 12px;
}

:deep(.ai-analysis th) {
  background-color: var(--el-bg-color);
}

:deep(.ai-analysis a) {
  color: var(--el-color-primary);
  text-decoration: none;
  transition: all 0.3s ease;
}

:deep(.ai-analysis a:hover) {
  text-decoration: underline;
  opacity: 0.8;
}

:deep(.ai-analysis strong) {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

:deep(.ai-analysis em) {
  color: var(--el-text-color-secondary);
}

.repo-url-input {
  width: 100%;
}
</style>
