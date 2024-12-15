<template>
  <div class="privacy-page">
    <el-card>
      <template #header>
        <div class="page-header">
          <h1>隐私政策</h1>
        </div>
      </template>

      <div class="content">
        <section class="section">
          <h2>1. 信息收集</h2>
          <p>我们收集的信息包括：</p>
          <ul>
            <li>用户账户信息（用户名、密码等）</li>
            <li>分析的开源项目信息</li>
            <li>使用平台时的操作日志</li>
          </ul>
        </section>

        <section class="section">
          <h2>2. 信息使用</h2>
          <p>我们收集的信息将用于：</p>
          <ul>
            <li>提供项目分析服务</li>
            <li>改进平台功能</li>
            <li>发送服务通知</li>
            <li>处理用户反馈</li>
          </ul>
        </section>

        <section class="section">
          <h2>3. 信息保护</h2>
          <p>我们采取以下措施保护用户信息：</p>
          <ul>
            <li>数据加密存储</li>
            <li>访问权限控制</li>
            <li>安���审计日志</li>
          </ul>
        </section>

        <section class="section">
          <h2>4. 信息共享</h2>
          <p>除非得到用户明确同意或法律要求，我们不会与第三方共享用户信息。</p>
        </section>

        <section class="section">
          <h2>5. 用户权利</h2>
          <p>用户有权：</p>
          <ul>
            <li>访问和更正个人信息</li>
            <li>删除账户</li>
            <li>退出服务</li>
          </ul>
        </section>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.privacy-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
}

.page-header h1 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 28px;
}

.content {
  padding: 20px 0;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  color: var(--el-text-color-primary);
  font-size: 24px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--el-border-color-light);
}

.section p {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  font-size: 16px;
}

.section ul {
  list-style: disc;
  padding-left: 20px;
  color: var(--el-text-color-regular);
}

.section ul li {
  margin-bottom: 10px;
  font-size: 16px;
}
</style>
