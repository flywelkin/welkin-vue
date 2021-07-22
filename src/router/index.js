import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    redirect: '/dashboard',
    component: Layout,
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  }
]

export const asyncRouters = [
  {
    path: '/sys',
    redirect: '/sys/user',
    name: 'sys',
    hidden: false,
    meta: { title: '系统管理', icon: 'el-icon-setting', permission: 'sys' },
    component: Layout,
    children: [
      {
        path: 'user',
        name: 'user',
        hidden: false,
        component: () => import('@/views/sys/user/index'),
        meta: { title: '用户管理', icon: 'el-icon-user-solid', permission: 'sys:user:list' }
      },
      {
        path: 'role',
        name: 'role',
        hidden: false,
        component: () => import('@/views/sys/role/index'),
        meta: { title: '角色管理', icon: 'el-icon-s-help', permission: 'sys:role:list' }
      },
      {
        path: 'menu',
        name: 'menu',
        hidden: false,
        component: () => import('@/views/sys/menu/index'),
        meta: { title: '菜单管理', icon: 'el-icon-menu', permission: 'sys:menu:list' }
      },
      {
        path: 'dept',
        name: 'dept',
        hidden: false,
        component: () => import('@/views/sys/dept/index'),
        meta: { title: '机构管理', icon: 'el-icon-office-building', permission: 'sys:dept:list' }
      }
    ]
  },
  {
    path: '/task',
    redirect: '/task/quartz',
    name: 'task',
    hidden: false,
    meta: { title: '任务管理', icon: 'el-icon-date', permission: 'task' },
    component: Layout,
    children: [
      {
        path: 'quartz',
        name: 'quartz',
        hidden: false,
        component: () => import('@/views/task/quartz/index'),
        meta: { title: '定时任务', icon: 'el-icon-alarm-clock', permission: 'task:quartz:list' }
      }
    ]
  },
  {
    path: '/chat',
    name: 'chat',
    hidden: true,
    meta: { title: '聊天', icon: 'el-icon-date', permission: 'chat' },
    component: () => import('@/views/chat/index')
  }
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
