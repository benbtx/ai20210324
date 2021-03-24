/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: '/system/index',
  meta: {
    title: '系统管理',
    roles: ['admin'],
    icon: 'iconfont icon-xitongguanli'
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/system/index'),
      name: '系统管理',
      hidden: true
    }
  ]
}
export default systemRouter
