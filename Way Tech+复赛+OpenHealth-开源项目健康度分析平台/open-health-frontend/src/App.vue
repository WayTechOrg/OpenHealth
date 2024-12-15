<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* 全局样式 */
:root {
  /* 亮色模式变量 */
  --bg-color: #ffffff;
  --text-color: #213547;
  --border-color: #e4e7ed;
}

/* 暗色模式变量 */
html.dark {
  --bg-color: #1a1a1a;
  --text-color: rgba(255, 255, 255, 0.87);
  --border-color: #4c4d4f;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  color: var(--text-color);
  background-color: var(--bg-color);
  transition:
    color 0.5s,
    background-color 0.5s;
  line-height: 1.6;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 重置默认样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-color);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
</style>
