<template>
  <div class="about-page">
    <el-card>
      <template #header>
        <div class="page-header">
          <h1>关于我们</h1>
        </div>
      </template>

      <div class="content">
        <section class="section">
          <h2>项目介绍</h2>
          <p>
            OpenHealth
            是一个开源项目健康度分析平台，旨在帮助开发者和组织更好地了解和改进他们的开源项目。通过分析多个维度的指标，我们为开源项目提供全面的健康度评估。
          </p>
        </section>

        <section class="section">
          <h2>核心功能</h2>
          <ul>
            <li>项目活跃度分析</li>
            <li>社区健康度评估</li>
            <li>代码质量分析</li>
            <li>文档完整性检查</li>
            <li>AI 驱动的建议</li>
          </ul>
        </section>

        <section class="section">
          <h2>团队介绍</h2>
          <div class="team-members">
            <el-card
              v-for="member in teamMembers"
              :key="member.name"
              class="member-card"
            >
              <img
                :src="member.avatar"
                :alt="member.name"
                class="member-avatar"
              />
              <h3>{{ member.name }}</h3>
              <p class="member-role">{{ member.role }}</p>
              <p class="member-desc">{{ member.description }}</p>
              <div class="member-links">
                <a :href="member.github" target="_blank">
                  <el-button type="primary" circle>
                    <el-icon>
                      <Link />
                    </el-icon>
                  </el-button>
                </a>
              </div>
            </el-card>
          </div>
        </section>

        <section class="section">
          <h2>联系我们</h2>
          <p>如果您有任何问题或建议，欢迎通过以下方式联系我们：</p>
          <br />
          <ul>
            <li>
              GitHub:
              <a href="https://github.com/WayTechOrg" target="_blank"
                >@WayTechOrg</a
              >
            </li>
            <li>
              项目仓库:
              <a href="https://github.com/WayTechOrg/OpenHealth" target="_blank"
                >OpenHealth</a
              >
            </li>
          </ul>
        </section>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const teamMembers = [
  {
    name: 'wibus',
    role: '项目负责人',
    description: '全栈开发工程师，开源爱好者',
    avatar: 'https://github.com/wibus-wee.png',
    github: 'https://github.com/wibus-wee',
  },
  {
    name: 'yzd',
    role: '项目设计',
    description: '项目设计，PPT 制作',
    avatar: 'https://github.com/yzd2005.png',
    github: 'https://github.com/yzd2005',
  },
  {
    name: 'chillguy',
    role: '项目管理',
    description: '项目管理，项目协调，PPT 制作',
    avatar: 'https://github.com/chillguy901.png',
    github: 'https://github.com/chillguy901',
  },
]
</script>

<style scoped>
.about-page {
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

.team-members {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.member-card {
  text-align: center;
  padding: 30px;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.member-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  margin-bottom: 20px;
  border: 4px solid var(--el-color-primary-light-8);
  transition: all 0.3s ease;
  object-fit: cover;
}

.member-card:hover .member-avatar {
  border-color: var(--el-color-primary);
  transform: scale(1.05);
}

.member-card h3 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 600;
}

.member-role {
  color: var(--el-color-primary);
  margin: 10px 0;
  font-size: 16px;
  font-weight: 500;
}

.member-desc {
  color: var(--el-text-color-regular);
  margin: 15px 0;
  line-height: 1.6;
  font-size: 14px;
}

.member-links {
  margin-top: 20px;
}

.member-links .el-button {
  transition: all 0.3s ease;
}

.member-links .el-button:hover {
  transform: rotate(360deg);
  background-color: var(--el-color-primary-dark-2);
}

a {
  color: var(--el-color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
