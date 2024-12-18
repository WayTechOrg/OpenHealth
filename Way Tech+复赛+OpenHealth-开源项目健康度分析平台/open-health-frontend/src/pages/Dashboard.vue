<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { useColorMode } from '@vueuse/core'

const router = useRouter()
const mode = useColorMode()

// 从 localStorage 获取项目数据
const projects = computed(() => {
  const storedProjects = localStorage.getItem('projects')
  return storedProjects ? JSON.parse(storedProjects) : []
})

// 计算统计数据
const stats = computed(() => {
  const total = projects.value.length
  const avgScores: { [key: string]: number } = {
    activity: 0,
    community: 0,
    code: 0,
    docs: 0,
  }

  if (total > 0) {
    projects.value.forEach((project: any) => {
      avgScores.activity += project.healthScore.activity
      avgScores.community += project.healthScore.community
      avgScores.code += project.healthScore.code
      avgScores.docs += project.healthScore.docs
    })

    Object.keys(avgScores).forEach((key: any) => {
      avgScores[key] = Math.round(avgScores[key] / total)
    })
  }

  return {
    total,
    avgScores,
  }
})

// 初始趋势图
onMounted(() => {
  if (projects.value.length === 0) return

  const trendChart = echarts.init(document.getElementById('trend-chart'))
  const healthChart = echarts.init(
    document.getElementById('health-distribution'),
  )

  // 趋势图配置
  const trendOption: any = {
    textStyle: {
      color: mode.value === 'dark' ? '#fff' : '#000',
    },
    title: {
      text: '项目健康度趋势',
      left: 'center',
      textStyle: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['活跃度', '社区健康度', '代码质量', '文档完整度'],
      bottom: 0,
      textStyle: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: projects.value.map((p: any) =>
        new Date(p.lastAnalyzed).toLocaleDateString(),
      ),
      axisLabel: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
      axisLine: {
        lineStyle: {
          color: mode.value === 'dark' ? '#555' : '#ccc',
        },
      },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
      axisLine: {
        lineStyle: {
          color: mode.value === 'dark' ? '#555' : '#ccc',
        },
      },
      splitLine: {
        lineStyle: {
          color: mode.value === 'dark' ? '#333' : '#eee',
        },
      },
    },
    series: [
      {
        name: '活跃度',
        type: 'line',
        data: projects.value.map((p: any) => p.healthScore.activity),
        smooth: true,
      },
      {
        name: '社区健康度',
        type: 'line',
        data: projects.value.map((p: any) => p.healthScore.community),
        smooth: true,
      },
      {
        name: '代码质量',
        type: 'line',
        data: projects.value.map((p: any) => p.healthScore.code),
        smooth: true,
      },
      {
        name: '文档完整度',
        type: 'line',
        data: projects.value.map((p: any) => p.healthScore.docs),
        smooth: true,
      },
    ],
  }

  // 健康度分布图配置
  const healthOption: any = {
    textStyle: {
      color: mode.value === 'dark' ? '#fff' : '#000',
    },
    title: {
      text: '健康度分布',
      left: 'center',
      textStyle: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: 0,
      textStyle: {
        color: mode.value === 'dark' ? '#fff' : '#000',
      },
    },
    series: [
      {
        name: '健康度分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: mode.value === 'dark' ? '#333' : '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
          color: mode.value === 'dark' ? '#fff' : '#000',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
            color: mode.value === 'dark' ? '#fff' : '#000',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: stats.value.avgScores.activity, name: '活跃度' },
          { value: stats.value.avgScores.community, name: '社区健康度' },
          { value: stats.value.avgScores.code, name: '代码质量' },
          { value: stats.value.avgScores.docs, name: '文档完整度' },
        ],
      },
    ],
  }

  trendChart.setOption(trendOption)
  healthChart.setOption(healthOption)

  // 监听主题变化
  watch(mode, (newMode) => {
    trendChart.dispose()
    healthChart.dispose()

    const newTrendChart = echarts.init(document.getElementById('trend-chart'))
    const newHealthChart = echarts.init(
      document.getElementById('health-distribution'),
    )

    // 更新配置中的颜色
    trendOption.textStyle.color = newMode === 'dark' ? '#fff' : '#000'
    trendOption.title.textStyle.color = newMode === 'dark' ? '#fff' : '#000'
    trendOption.legend.textStyle.color = newMode === 'dark' ? '#fff' : '#000'
    trendOption.xAxis.axisLabel.color = newMode === 'dark' ? '#fff' : '#000'
    trendOption.yAxis.axisLabel.color = newMode === 'dark' ? '#fff' : '#000'

    healthOption.textStyle.color = newMode === 'dark' ? '#fff' : '#000'
    healthOption.title.textStyle.color = newMode === 'dark' ? '#fff' : '#000'
    healthOption.legend.textStyle.color = newMode === 'dark' ? '#fff' : '#000'

    newTrendChart.setOption(trendOption)
    newHealthChart.setOption(healthOption)
  })

  // 响应式调整
  window.addEventListener('resize', () => {
    trendChart.resize()
    healthChart.resize()
  })
})

// 引导步骤
const steps = [
  {
    title: '欢迎使用',
    description:
      '这是一个开源项目健康度分析平台，帮助你了解和改进开源项目的健康状况。',
    target: '.dashboard',
  },
  {
    title: '添加项目',
    description: '点击这里开始分析你的第一个项目。',
    target: '.add-project',
  },
  {
    title: '查看分析',
    description: '在这里可以看到所有项目的分析结果。',
    target: '.view-projects',
  },
]

const showGuide = ref(projects.value.length === 0)
</script>

<template>
  <div class="dashboard">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="overview">
      <el-col :span="8">
        <el-card shadow="hover" class="overview-card">
          <template #header>
            <div class="card-header">
              <span>监控项目数</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ stats.total }}</h2>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="overview-card">
          <template #header>
            <div class="card-header">
              <span>平均健康度</span>
            </div>
          </template>
          <div class="card-content">
            <h2>
              {{
                Math.round(
                  (stats.avgScores.activity +
                    stats.avgScores.community +
                    stats.avgScores.code +
                    stats.avgScores.docs) /
                    4,
                )
              }}%
            </h2>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="overview-card">
          <template #header>
            <div class="card-header">
              <span>最近分析</span>
            </div>
          </template>
          <div class="card-content">
            <h2>
              {{
                projects.length > 0
                  ? new Date(
                      projects[projects.length - 1].lastAnalyzed,
                    ).toLocaleDateString()
                  : '-'
              }}
            </h2>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts" v-if="stats.total > 0">
      <el-col :span="16">
        <el-card shadow="hover">
          <div id="trend-chart" style="height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div id="health-distribution" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作区 -->
    <el-card shadow="hover" class="quick-actions">
      <div class="action-buttons">
        <el-button
          type="primary"
          class="add-project"
          @click="router.push('/analysis')"
        >
          <el-icon>
            <Plus />
          </el-icon>
          分析新项目
        </el-button>
        <el-button
          type="info"
          class="view-projects"
          @click="router.push('/projects')"
        >
          <el-icon>
            <List />
          </el-icon>
          查看项目列表
        </el-button>
      </div>
    </el-card>

    <!-- 新手引导 -->
    <el-dialog
      v-model="showGuide"
      title="欢迎使用"
      width="50%"
      :show-close="false"
    >
      <div class="guide-content">
        <el-steps :active="1" finish-status="success">
          <el-step
            v-for="step in steps"
            :key="step.title"
            :title="step.title"
            :description="step.description"
          />
        </el-steps>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showGuide = false">
            开始使用
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}

.overview {
  margin-bottom: 20px;
}

/* 
.overview-card {
  height: 200px;
} */

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 40px);
  gap: 10px;
}

.card-content h2 {
  font-size: 2.5em;
  margin: 0;
  color: var(--el-color-primary);
  line-height: 1;
}

.card-content .el-button {
  margin-top: 10px;
  white-space: nowrap;
}

.charts {
  margin-bottom: 20px;
}

.quick-actions {
  margin-top: 20px;
  padding: 16px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.action-buttons .el-button {
  padding: 12px 24px;
  font-size: 14px;
}

.action-buttons .el-icon {
  margin-right: 4px;
}

.guide-content {
  padding: 20px 0;
}

/* 暗色模式适配 */
:deep(.dark) {
  .card-content h2 {
    color: var(--el-color-primary-light-3);
  }
}
</style>
