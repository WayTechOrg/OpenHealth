import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: 'about',
          name: 'About',
          component: () => import('@/pages/About.vue'),
        },
        {
          path: 'terms',
          name: 'Terms',
          component: () => import('@/pages/Terms.vue'),
        },
        {
          path: 'privacy',
          name: 'Privacy',
          component: () => import('@/pages/Privacy.vue'),
        },
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/pages/Dashboard.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'analysis',
          name: 'ProjectAnalysis',
          component: () => import('@/pages/ProjectAnalysis.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'projects',
          name: 'ProjectList',
          component: () => import('@/pages/ProjectList.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/pages/Settings.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/Login.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/Register.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
