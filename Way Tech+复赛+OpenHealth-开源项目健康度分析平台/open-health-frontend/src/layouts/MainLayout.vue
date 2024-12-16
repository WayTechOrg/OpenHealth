<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useColorMode } from '@vueuse/core'
import { useRouter } from 'vue-router'
import fetcher from '@/utils/fetcher'
import AppFooter from '@/components/AppFooter.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const token = computed(() => localStorage.getItem('token'))
const loading = ref(false)

// 检查登录状态
const checkLoginStatus = async () => {
  const currentToken = localStorage.getItem('token')
  if (!currentToken) return

  try {
    loading.value = true
    // 调用后端验证接口
    await fetcher.check()
  } catch (error) {
    // 如果验证失败，清除token并跳转到登录页
    localStorage.removeItem('token')
    fetcher.setToken('')
    router.push('/login')
    ElMessage.error('登录已过期，请重新登录')
  } finally {
    loading.value = false
  }
}

// 组件挂载时检查登录状态
onMounted(() => {
  checkLoginStatus()
})

// 使用 vueuse 的 useColorMode 来管理暗黑模式
const mode = useColorMode()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 切换暗黑模式
const toggleDark = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
  // 同步更新 html 的 class
  document.documentElement.className = mode.value
}

const handleLogout = () => {
  // 清除token
  localStorage.removeItem('token')
  fetcher.setToken('')
  // 跳转到登录页
  router.push('/login')
  ElMessage.success('已退出登录')
}
</script>

<template>
  <el-container v-loading="loading" class="layout-container">
    <!-- 主要内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <div
            class="logo-container"
            @click="router.push('/')"
            style="cursor: pointer"
          >
            <img src="/team.png" alt="Logo" class="logo" />
            <h1 class="title">OpenHealth</h1>
          </div>
        </div>

        <div class="header-center">
          <el-menu mode="horizontal" :router="true" class="nav-menu">
            <template v-if="token">
              <el-menu-item index="/">仪表盘</el-menu-item>
              <el-menu-item index="/analysis">项目分析</el-menu-item>
              <el-menu-item index="/projects">项目列表</el-menu-item>
              <el-menu-item index="/compare">项目对比</el-menu-item>
            </template>
            <el-menu-item index="/about">关于我们</el-menu-item>
          </el-menu>
        </div>

        <div class="header-right">
          <el-button class="theme-btn" @click="toggleDark">
            <el-icon>
              <Moon v-if="mode === 'light'" />
              <Sunny v-else />
            </el-icon>
          </el-button>

          <el-dropdown v-if="token">
            <div class="user-info">
              <el-avatar :size="32" src="https://github.com/wibus-wee.png" />
              <span class="username">Admin</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon>
                    <User />
                  </el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-icon>
                    <Setting />
                  </el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <template v-else>
            <el-button type="primary" @click="router.push('/login')"
              >登录</el-button
            >
          </template>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main>
        <router-view />
      </el-main>

      <!-- 添加页脚 -->
      <AppFooter />
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.aside {
  transition: width 0.3s;
  background: var(--el-menu-bg-color);
}

.menu {
  height: 100%;
  border-right: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
  padding: 0 20px;
  height: 60px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  height: 32px;
  width: 32px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.nav-menu {
  border-bottom: none;
}

.collapse-btn {
  padding: 6px;
  border: none;
}

.theme-btn {
  padding: 8px;
  border: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: var(--el-fill-color-light);
}

.username {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu-item) {
  font-size: 14px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-icon) {
  vertical-align: middle;
}
</style>
