<template>
  <div class="about-page">
    <el-card class="fade-in">
      <template #header>
        <div class="page-header">
          <h1>关于我们</h1>
        </div>
      </template>

      <div class="content">
        <section class="section slide-up">
          <h2>项目介绍</h2>
          <div class="gradient-border">
            <p>
              OpenHealth 是一个开源项目健康度分析平台，旨在帮助开发者和组织更好地了解和改进他们的开源项目。通过分析多个维度的指标，我们为开源项目提供全面的健康度评估。
            </p>
          </div>
        </section>

        <section class="section slide-up">
          <h2>核心功能</h2>
          <div class="features-grid">
            <div v-for="(feature, index) in features" :key="feature.title" class="feature-card"
              :style="{ animationDelay: `${index * 0.1}s` }">
              <el-icon class="feature-icon" :size="40">
                <component :is="feature.icon" />
              </el-icon>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </section>

        <section class="section slide-up">
          <h2>团队介绍</h2>
          <div class="team-members">
            <div v-for="(member, index) in teamMembers" :key="member.name" class="member-card-wrapper"
              :style="{ animationDelay: `${index * 0.2}s` }">
              <div class="member-card">
                <div class="member-card-front">
                  <div class="member-avatar-wrapper">
                    <div class="avatar-background"></div>
                    <img :src="member.avatar" :alt="member.name" class="member-avatar" />
                    <div class="member-avatar-overlay">
                      <el-icon class="flip-icon">
                        <Refresh />
                      </el-icon>
                    </div>
                  </div>
                  <div class="member-front-info">
                    <h3>{{ member.name }}</h3>
                    <div class="role-badge">{{ member.role }}</div>
                  </div>
                </div>
                <div class="member-card-back">
                  <div class="member-info">
                    <div class="back-header">
                      <h3>{{ member.name }}</h3>
                      <div class="role-badge">{{ member.role }}</div>
                    </div>
                    <p class="member-desc">{{ member.description }}</p>
                    <div class="member-skills">
                      <el-tag v-for="skill in member.skills" :key="skill" class="skill-tag"
                        :style="{ animationDelay: `${index * 0.1}s` }" effect="dark">
                        {{ skill }}
                      </el-tag>
                    </div>
                    <div class="member-links">
                      <a :href="member.github" target="_blank" class="social-link github">
                        <el-icon>
                          <Platform />
                        </el-icon>
                      </a>
                      <a :href="`mailto:${member.email}`" class="social-link email" v-if="member.email">
                        <el-icon>
                          <Message />
                        </el-icon>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="section slide-up contact-section">
          <h2>联系我们</h2>
          <div class="contact-container">
            <p>如果您有任何问题或建议，欢迎通过以下方式联系我们：</p>
            <div class="contact-links">
              <a href="https://github.com/WayTechOrg" target="_blank" class="contact-link">
                <el-icon>
                  <Platform />
                </el-icon>
                <span>@WayTechOrg</span>
              </a>
              <a href="https://github.com/WayTechOrg/OpenHealth" target="_blank" class="contact-link">
                <el-icon>
                  <Document />
                </el-icon>
                <span>OpenHealth</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Platform, Document, DataLine, Share, Monitor, ChatDotRound, Plus, Message, Refresh } from '@element-plus/icons-vue'

const features = [
  {
    title: '项目活跃度分析',
    description: '深入分析项目的贡献频率、更新活跃度等指标',
    icon: 'DataLine'
  },
  {
    title: '社区健康度评估',
    description: '评估社区参与度、响应速度和互动质量',
    icon: 'Share'
  },
  {
    title: '代码质量分析',
    description: '全方位检测代码质量、测试覆盖率等技术指标',
    icon: 'Monitor'
  },
  {
    title: 'AI 驱动的建议',
    description: '基于数据分析提供智能化改进建议',
    icon: 'ChatDotRound'
  }
]

const teamMembers = [
  {
    name: 'wibus',
    role: '项目负责人',
    description: '全栈开发工程师，开源爱好者，热衷于创新技术和开源社区建设。',
    avatar: 'https://github.com/wibus-wee.png',
    github: 'https://github.com/wibus-wee',
    email: 'wibus@qq.com',
    skills: ['全栈开发', 'DevOps', '架构设计']
  },
  {
    name: 'yzd',
    role: '项目设计',
    description: '富有创意的UI/UX设计师，专注于用户体验和界面交互设计。',
    avatar: 'https://github.com/yzd2005.png',
    github: 'https://github.com/yzd2005',
    skills: ['UI设计', 'UX设计', '产品设计']
  },
  {
    name: 'chillguy',
    role: '项目管理',
    description: '经验丰富的项目经理，擅长团队协调和敏捷开发管理。',
    avatar: 'https://github.com/chillguy901.png',
    github: 'https://github.com/chillguy901',
    skills: ['项目管理', '敏捷开发', '团队协作']
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 30px;
}

.member-card-wrapper {
  perspective: 1000px;
  animation: slideUp 0.8s ease-out forwards;
}

.member-card {
  position: relative;
  width: 100%;
  height: 450px;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  cursor: pointer;
  margin: 0;
}

.member-card-front,
.member-card-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(145deg, var(--el-bg-color-overlay), var(--el-bg-color));
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.member-card-front {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 30px;
  position: relative;
  overflow: hidden;
}

.member-card-front::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-success));
  opacity: 0.1;
}

.member-avatar-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: 25px;
  border-radius: 50%;
  z-index: 1;
}

.avatar-background {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-success));
  opacity: 0.8;
  z-index: 1;
  transform: scale(0.95);
  transition: transform 0.3s ease;
}

.member-avatar {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid var(--el-bg-color);
  z-index: 2;
  transition: transform 0.3s ease;
}

.member-avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(var(--el-color-primary-rgb), 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 3;
  border-radius: 50%;
}

.flip-icon {
  font-size: 24px;
  color: white;
  transform: rotate(0deg);
  transition: transform 0.3s ease;
}

.member-card-wrapper:hover .flip-icon {
  transform: rotate(180deg);
}

.member-front-info {
  text-align: center;
  z-index: 1;
}

.member-front-info h3 {
  font-size: 24px;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.role-badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-success));
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.member-card-back {
  transform: rotateY(180deg);
  padding: 30px;
  background: linear-gradient(145deg, var(--el-bg-color), var(--el-bg-color-overlay));
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-info {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.back-header {
  margin-bottom: 15px;
  text-align: center;
}

.back-header h3 {
  margin-bottom: 12px;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.member-desc {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  font-size: 15px;
  margin: 15px 0;
  text-align: center;
  flex-grow: 0;
}

.member-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 15px 0;
  flex-grow: 0;
}

.skill-tag {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
  padding: 6px 12px;
  font-size: 13px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin: 0 10px;
  transition: all 0.3s ease;
}

.social-link.github {
  background: #24292e;
  color: white;
}

.social-link.email {
  background: var(--el-color-success);
  color: white;
}

.social-link:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.member-card-wrapper:hover .member-card {
  transform: rotateY(180deg);
}

.member-card-wrapper:hover .avatar-background {
  transform: scale(1);
}

@keyframes cardFlip {
  from {
    transform: rotateY(0deg);
  }

  to {
    transform: rotateY(180deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 1s ease-out;
}

.slide-up {
  animation: slideUp 0.8s ease-out forwards;
  opacity: 0;
}

.gradient-border {
  padding: 20px;
  background: linear-gradient(145deg, var(--el-bg-color), var(--el-bg-color-overlay));
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.gradient-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-success));
  border-radius: 3px 3px 0 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.feature-card {
  background: var(--el-bg-color-overlay);
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
  animation: slideUp 0.8s ease-out forwards;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  color: var(--el-color-primary);
  margin-bottom: 15px;
}

.contact-section {
  background: linear-gradient(145deg, var(--el-bg-color), var(--el-bg-color-overlay));
  border-radius: 15px;
  padding: 30px;
}

.contact-container {
  text-align: center;
}

.contact-links {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: var(--el-bg-color);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.contact-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  background: var(--el-color-primary-light-9);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .contact-links {
    flex-direction: column;
    align-items: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .team-members {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .member-card {
    height: 400px;
  }

  .member-avatar-wrapper {
    width: 150px;
    height: 150px;
  }
}
</style>
