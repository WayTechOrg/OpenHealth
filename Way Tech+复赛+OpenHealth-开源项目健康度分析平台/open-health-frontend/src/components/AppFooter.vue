<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>OpenHealth</h3>
        <p>开源项目健康度分析平台</p>
      </div>
      <div class="footer-section">
        <h3>相关链接</h3>
        <ul>
          <li>
            <a href="https://github.com/WayTechOrg/OpenHealth" target="_blank"
              >GitHub Repository</a
            >
          </li>
          <li><a href="/about">关于我们</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>联系我们</h3>
        <ul>
          <li>
            <a href="https://github.com/WayTechOrg" target="_blank">GitHub</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© {{ currentYear }} Way Tech. All rights reserved.</p>
      <p>
        <a href="/terms">服务条款</a> ·
        <a href="/privacy">隐私政策</a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  padding: 40px 20px 20px;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.footer-section p {
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section ul li a {
  color: var(--el-text-color-regular);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-section ul li a:hover {
  color: var(--el-color-primary);
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.footer-bottom a {
  color: var(--el-text-color-secondary);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-bottom a:hover {
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
