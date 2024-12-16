<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import fetcher from '@/utils/fetcher'

interface Config {
  weights: {
    activity: number
    community: number
    code: number
    docs: number
  }
  thresholds: {
    good: number
    warning: number
  }
}

const config = ref<Config>({
  weights: {
    activity: 30,
    community: 30,
    code: 20,
    docs: 20,
  },
  thresholds: {
    good: 80,
    warning: 60,
  },
})

const loading = ref(false)

// // 加载配置
// const loadConfig = async () => {
//   try {
//     loading.value = true
//     const { data } = await fetcher.getConfig()
//     config.value = data
//   } catch (error) {
//     ElMessage.error('加载配置失败')
//   } finally {
//     loading.value = false
//   }
// }

// 保存配置
const handleSave = async () => {
  try {
    loading.value = true
    await fetcher.updateConfigItem('weights', config.value.weights)
    await fetcher.updateConfigItem('thresholds', config.value.thresholds)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 重置配置
const handleReset = async () => {
  try {
    loading.value = true
    const { data } = await fetcher.getDefaultConfig()
    config.value = data
    ElMessage.success('重置成功')
  } catch (error) {
    ElMessage.error('重置失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="settings">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
          <div class="actions">
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" @click="handleSave">保存</el-button>
          </div>
        </div>
      </template>

      <el-form :model="config" label-width="120px">
        <el-form-item label="评分权重">
          <el-card class="weight-card">
            <el-form-item label="活跃度">
              <el-slider
                v-model="config.weights.activity"
                :min="0"
                :max="100"
              />
            </el-form-item>
            <el-form-item label="社区健康度">
              <el-slider
                v-model="config.weights.community"
                :min="0"
                :max="100"
              />
            </el-form-item>
            <el-form-item label="代码质量">
              <el-slider v-model="config.weights.code" :min="0" :max="100" />
            </el-form-item>
            <el-form-item label="文档完整性">
              <el-slider v-model="config.weights.docs" :min="0" :max="100" />
            </el-form-item>
          </el-card>
        </el-form-item>

        <el-form-item label="健康度阈值">
          <el-card class="threshold-card">
            <el-form-item label="良好">
              <el-slider v-model="config.thresholds.good" :min="0" :max="100" />
            </el-form-item>
            <el-form-item label="警告">
              <el-slider
                v-model="config.thresholds.warning"
                :min="0"
                :max="100"
              />
            </el-form-item>
          </el-card>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.settings {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 12px;
}

.weight-card,
.threshold-card {
  margin: 12px 0;
}
</style>
