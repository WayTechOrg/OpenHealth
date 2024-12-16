<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import fetcher from '@/utils/fetcher'

const router = useRouter()
const mode = useColorMode()

// 同步暗黑模式
onMounted(() => {
  document.documentElement.className = mode.value
})

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const formRef = ref<FormInstance>()

const validatePass = (_: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' },
  ],
}

const handleRegister = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    await fetcher.register({
      username: registerForm.value.username,
      password: registerForm.value.password,
    })

    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container" :class="mode">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <img src="/team.png" alt="Logo" class="logo" />
          <h2>注册账号</h2>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>

        <div class="form-actions">
          <el-button
            type="primary"
            :loading="loading"
            @click="handleRegister"
            style="width: 100%"
          >
            注册
          </el-button>

          <div class="login-link">
            已有账号？
            <el-button link type="primary" @click="handleBack">
              返回登录
            </el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.register-container {
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
.register-container.dark {
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

.register-card {
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

.login-link {
  margin-top: 16px;
  text-align: center;
  color: var(--el-text-color-secondary);
}
</style>
