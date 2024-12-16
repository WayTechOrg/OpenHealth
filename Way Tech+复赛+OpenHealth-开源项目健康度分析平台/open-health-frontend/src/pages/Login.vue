<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import fetcher from '@/utils/fetcher'

const router = useRouter()
const route = useRoute()
const mode = useColorMode()

// 同步暗黑模式
onMounted(() => {
  document.documentElement.className = mode.value
})

const loginForm = ref({
  username: '',
  password: '',
})

const loading = ref(false)
const formRef = ref<FormInstance>()

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const { token } = (await fetcher.login(loginForm.value)) as any

    // 保存token到localStorage
    localStorage.setItem('token', token)
    // 设置fetcher的token
    fetcher.setToken(token)

    ElMessage.success('登录成功')

    // 获取重定向地址
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleRegister = () => {
  router.push('/register')
}

// 检查是否已登录
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    router.push('/')
  }
})
</script>

<template>
  <div class="login-container" :class="mode">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <img src="/team.png" alt="Logo" class="logo" />
          <h2>OpenHealth</h2>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <div class="form-actions">
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>

          <div class="register-link">
            还没有账号？
            <el-button link type="primary" @click="handleRegister">
              立即注册
            </el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-bg-color-page);
  transition:
    background-color 0.3s,
    color 0.3s;
}

/* 暗黑模式样式 */
.login-container.dark {
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

.login-card {
  width: 400px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.logo {
  width: 40px;
  height: 40px;
}

.card-header h2 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.form-actions {
  margin-top: 24px;
}

.register-link {
  margin-top: 16px;
  text-align: center;
  color: var(--el-text-color-secondary);
}
</style>
