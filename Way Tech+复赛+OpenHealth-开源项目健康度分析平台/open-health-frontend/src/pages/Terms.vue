<template>
  <div class="terms-page">
    <el-card>
      <template #header>
        <div class="page-header">
          <h1>服务条款</h1>
        </div>
      </template>

      <div class="content">
        <section class="section">
          <h2>1. 服务说明</h2>
          <p>
            OpenHealth
            是一个开源项目健康度分析平台，为用户提供开源项目的分析和评估服务。
          </p>
        </section>

        <section class="section">
          <h2>2. 用户义务</h2>
          <ul>
            <li>用户应遵守相关法律法规</li>
            <li>不得滥用平台资源</li>
            <li>保护账户安全</li>
            <li>遵守开源项目的许可协议</li>
          </ul>
        </section>

        <section class="section">
          <h2>3. 服务限制</h2>
          <p>我们保留在以下情况下限制或终止服务的权利：</p>
          <ul>
            <li>违反服务条款</li>
            <li>滥用平台资源</li>
            <li>影响平台正常运行</li>
          </ul>
        </section>

        <section class="section">
          <h2>4. 免责声明</h2>
          <p>
            OpenHealth
            提供的分析结果仅供参考，不构成任何形式的保证。我们不对因使用本平台而导致的任何损失承担责任。
          </p>
        </section>

        <section class="section">
          <h2>5. 知识产权</h2>
          <p>
            平台的代码、内容和分析方法等知识产权归 Way Tech
            所有。用户分析的项目的知识产权归其各自所有者所有。
          </p>
        </section>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.terms-page {
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
