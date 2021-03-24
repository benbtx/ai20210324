/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const gzkjRouter = {
  path: '/gzkj',
  component: Layout,
  redirect: '/gzkj/index',
  // name: 'Gzkj',
  meta: {
    title: '工作项目',
    icon: 'iconfont icon-gongzuo'
  },
  children: [

    {
      path: 'index',
      component: () => import('@/views/gzkj/gzkj'),
      name: 'gzkj',
      hidden: true
      // meta: { title: '工作项目' }
    },
    // {
    //   path: ':id',
    //   component: () => import('@/views/gzkj/tab'),
    //   name: 'quickstart',
    //   hidden: true,
    //   meta: { title: '概要' },
    //   redirect: '/gzkj/:id/quickstart',
    //   children: [
    //     {
    //       path: 'quickstart',
    //       component: () => import('@/views/gzkj/quickstart'),
    //       hidden: true
    //     }
    //   ]
    // },

    {
      path: ':id',
      component: () => import('@/views/gzkj/tab'),
      name: 'datasets',
      hidden: true,
      meta: { title: '分发数据集' },
      redirect: '/gzkj/:id/datasets',
      children: [
        {
          path: 'datasets',
          component: () => import('@/views/gzkj/datasets'),
          hidden: true
        }
      ]
    },
    {
      path: ':id',
      component: () => import('@/views/gzkj/tab'),
      name: 'workfiles',
      hidden: true,
      meta: { title: '数据挖掘分析' },
      redirect: '/gzkj/:id/workfiles',
      children: [
        {
          path: 'workfiles',
          component: () => import('@/views/gzkj/workfiles'),
          hidden: true
        }
      ]
    },
    {
      path: ':id',
      component: () => import('@/views/gzkj/workflow/index'),
      name: 'workflows',
      hidden: true,
      meta: { title: '数据挖掘分析' },
      redirect: '/gzkj/:id/workfiles',
      children: [
        {
          path: 'workfiles/:id/index',
          component: () => import('@/views/gzkj/workflow/workfile'),
          name: 'workflow',
          hidden: true,
          meta: { title: '数据分析流程' }
        }
      ]
    },
    // {
    //   path: '/gzkj/:id/workfiles/:id',
    //   name: 'workfiles',
    //   hidden: true,
    //   meta: { title: '数据挖掘分析' },
    //   redirect: '/gzkj/:id/workfiles',
    //   children: [
    //     {
    //       // path: ':id/workfiles/:id',
    //       path: ':id/workfiles/:id/index',
    //       component: () => import('@/views/gzkj/workfiles_rv'),
    //       // component: () => import('@/views/gzkj/gzkj'),
    //       name: 'workfiles',
    //       hidden: true,
    //       meta: { title: '数据挖掘分析' },
    //     },
    //   ]
    // },
    // {
    //   // path: ':id/workfiles/:id',
    //   path: ':id/workfiles/:id/index',
    //   component: () => import('@/views/gzkj/workfile'),
    //   name: 'workfiles',
    //   hidden: true,
    //   meta: { title: '数据挖掘分析' },
    // },
    {
      path: ':id',
      component: () => import('@/views/gzkj/tab'),
      name: 'jobstab',
      hidden: true,
      meta: { title: '任务' },
      redirect: '/gzkj/:id/jobs',
      children: [
        {
          path: 'jobs',
          name:'jobs',
          component: () => import('@/views/gzkj/jobs'),
          hidden: true
        },
        {
          path: 'jobs/:id',
          name: 'job',
          component: () => import('@/views/gzkj/job'),
          hidden: true
        }
      ]
    },
    // {
    //   path: ':id/jobs/:id',
    //   // component: () => import('@/views/gzkj/workfiles_rv'),
    //   component: () => import('@/views/gzkj/gzkj'),
    //   name: '数据挖掘实验',
    //   hidden: true,
    //   meta: { title: '数据dddd' }

    // },
    {
      path: ':id',
      component: () => import('@/views/gzkj/tab'),
      name: 'models',
      hidden: true,
      meta: { title: '模型' },
      redirect: '/gzkj/:id/models',
      children: [
        {
          path: 'models',
          component: () => import('@/views/gzkj/models'),
          hidden: true
        }
      ]
    },
    {
      path: ':id',
      component: () => import('@/views/gzkj/tab'),
      name: 'exports',
      hidden: true,
      meta: { title: '服务' },
      redirect: '/gzkj/:id/exports',
      children: [
        {
          path: 'exports',
          component: () => import('@/views/gzkj/exports'),
          hidden: true
        }
      ]
    },
    {
      path: ':id',
      component: () => import('@/views/gzkj/tab'),
      name: 'visualization',
      hidden: true,
      meta: { title: '可视化' },
      redirect: '/gzkj/:id/visualization',
      children: [
        {
          path: 'visualization',
          component: () => import('@/views/gzkj/visualization'),
          hidden: true
        }
      ]
    },
    {
      path: ':id',
      component: () => import('@/views/gzkj/tab'),
      name: 'reportView',
      hidden: true,
      meta: { title: '报表查看' },
      redirect: '/gzkj/:id/reportView',
      children: [
        {
          path: 'reportView',
          component: () => import('@/views/gzkj/reportView'),
          hidden: true
        }
      ]
    }
  ]
}
export default gzkjRouter
