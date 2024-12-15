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
          <div
            class="ai-analysis"
            v-html="md.render(analysisResult.ai.analysis)"
          ></div>
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
  padding: 20px;
  line-height: 1.6;
}

:deep(.ai-analysis h1, .ai-analysis h2, .ai-analysis h3) {
  margin: 16px 0;
}

:deep(.ai-analysis p) {
  margin: 12px 0;
}

:deep(.ai-analysis ul, .ai-analysis ol) {
  padding-left: 20px;
}
</style>
