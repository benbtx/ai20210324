/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const logRouter = {
  path: '/log',
  component: Layout,
  redirect: '/log/index',
  meta: {
    title: '日志管理',
    roles: ['admin'],
    icon: 'iconfont icon-rizhiguanli'
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/logManage/index'),
      name: '日志管理',
      hidden: true
    }
  ]
}
export default logRouter
