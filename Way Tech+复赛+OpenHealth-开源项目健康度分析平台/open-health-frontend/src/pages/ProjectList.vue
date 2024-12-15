<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import fetcher from '@/utils/fetcher'
import MarkdownIt from 'markdown-it'

// markdown 解析器
const md = new MarkdownIt()

interface Project {
  id: string
  platform: string
  owner: string
  repo: string
  healthScore: {
    activity: number
    community: number
    code: number
    docs: number
  }
  lastAnalyzed: string
  aiAnalysis?: string
  aiScore?: number
}

const projects = ref<Project[]>([])
const loading = ref(false)
const loadingAI = ref<{ [key: string]: boolean }>({})

// 从 LocalStorage 获取项目列表
const fetchProjects = () => {
  try {
    const storedProjects = localStorage.getItem('projects')
    if (storedProjects) {
      projects.value = JSON.parse(storedProjects)
    }
  } catch (error) {
    ElMessage.error('获取项目列表失败')
  }
}

// 保存项目列表到 LocalStorage
const saveProjects = () => {
  try {
    localStorage.setItem('projects', JSON.stringify(projects.value))
  } catch (error) {
    ElMessage.error('保存项目列表失败')
  }
}

// 删除项目
const handleDelete = async (project: Project) => {
  try {
    // 调用后端 API 删除项目
    await fetcher.removeRepo(project.platform, project.owner, project.repo)
    // 从本地存储中删除
    projects.value = projects.value.filter((p) => p.id !== project.id)
    saveProjects()
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 分析项目
const handleAnalyze = async (project: Project) => {
  try {
    loading.value = true

    // 获取最新的健康度数据
    const healthData = await fetcher.getProjectHealth(
      project.platform,
      project.owner,
      project.repo,
    )

    // 更新项目数据
    const index = projects.value.findIndex((p) => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = {
        ...project,
        healthScore: {
          activity: healthData.activityScore,
          community: healthData.communityScore,
          code: healthData.codeQualityScore,
          docs: healthData.documentationScore,
        },
        lastAnalyzed: new Date().toISOString(),
      }
      saveProjects()
    }

    ElMessage.success('分析完成')
  } catch (error) {
    ElMessage.error('分析失败')
  } finally {
    loading.value = false
  }
}

// 获取 AI 分析建议
const fetchAIAnalysis = async (project: Project) => {
  try {
    loadingAI.value[project.id] = true
    const aiAnalysis = await fetcher.getProjectHealthAI(
      project.platform,
      project.owner,
      project.repo,
    )

    if (aiAnalysis.score === 0) {
      ElMessage.warning('AI评分生成异常，请稍后重试')
    }

    // 更新项目数据
    const index = projects.value.findIndex((p) => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = {
        ...project,
        aiAnalysis: aiAnalysis.analysis,
        aiScore: aiAnalysis.score,
      }
      saveProjects()
    }
    ElMessage.success('AI 分析完成')
  } catch (error) {
    ElMessage.error('获取 AI 分析建议失败')
  } finally {
    loadingAI.value[project.id] = false
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div class="project-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="$router.push('/analysis')">
              添加项目
            </el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="projects" style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="ai-analysis" v-loading="loadingAI[row.id]">
              <div v-if="row.aiAnalysis">
                <div class="ai-score-container" v-if="row.aiScore">
                  <el-tag type="success" size="large" effect="dark">
                    AI 综合评分：{{ row.aiScore }} 分
                  </el-tag>
                </div>
                <div v-html="md.render(row.aiAnalysis)" />
                <el-button
                  type="primary"
                  @click="fetchAIAnalysis(row)"
                  :loading="loadingAI[row.id]"
                  style="margin-top: 16px"
                >
                  重新生成分析
                </el-button>
              </div>
              <div v-else>
                <el-button
                  type="primary"
                  @click="fetchAIAnalysis(row)"
                  :loading="loadingAI[row.id]"
                >
                  获取 AI 分析建议
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="platform" label="平台" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.platform }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="owner" label="所有者" />
        <el-table-column prop="repo" label="仓库名" />

        <el-table-column label="AI 评分" width="120">
          <template #default="{ row }">
            <template v-if="row.aiScore">
              <el-tag type="success" effect="light">
                {{ row.aiScore }} 分
              </el-tag>
            </template>
            <el-tag v-else type="info" effect="plain"> 未分析 </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="健康度评分" width="400">
          <template #default="{ row }">
            <div class="scores">
              <el-tooltip content="活跃度">
                <div class="score-item">
                  <el-progress
                    type="circle"
                    :percentage="Math.round(row.healthScore.activity)"
                    :width="50"
                    :stroke-width="8"
                  />
                  <span class="score-label">活跃度</span>
                </div>
              </el-tooltip>
              <el-tooltip content="社区健康度">
                <div class="score-item">
                  <el-progress
                    type="circle"
                    :percentage="Math.round(row.healthScore.community)"
                    :width="50"
                    :stroke-width="8"
                  />
                  <span class="score-label">社区</span>
                </div>
              </el-tooltip>
              <el-tooltip content="代码质量">
                <div class="score-item">
                  <el-progress
                    type="circle"
                    :percentage="Math.round(row.healthScore.code)"
                    :width="50"
                    :stroke-width="8"
                  />
                  <span class="score-label">代码</span>
                </div>
              </el-tooltip>
              <el-tooltip content="文档完整性">
                <div class="score-item">
                  <el-progress
                    type="circle"
                    :percentage="Math.round(row.healthScore.docs)"
                    :width="50"
                    :stroke-width="8"
                  />
                  <span class="score-label">文档</span>
                </div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="lastAnalyzed" label="最后分析时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.lastAnalyzed).toLocaleString() }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                @click="handleAnalyze(row)"
                :loading="loading"
              >
                分析 (非 AI)
              </el-button>
              <el-button type="danger" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.project-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.scores {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

:deep(.el-progress__text) {
  font-size: 12px !important;
  min-width: 30px !important;
}

:deep(.el-progress-circle) {
  margin: 0 auto;
}

.ai-analysis {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
}

:deep(.ai-analysis h1) {
  font-size: 1.8em;
  margin-bottom: 20px;
  padding-bottom: 10px;
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
}

:deep(.ai-analysis a:hover) {
  text-decoration: underline;
}

.ai-score-container {
  margin-bottom: 20px;
  text-align: center;
  padding: 16px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
