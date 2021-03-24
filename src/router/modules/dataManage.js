/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const dataManageRouter = {
  path: '/dataManage',
  component: Layout,
  redirect: '/dataManage/index',
  meta: {
    title: '数据管理',
    icon: 'iconfont icon-shujuguanli'
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/dataManage/index'),
      name: '数据管理',
      hidden: true
    }
  ]
}
export default dataManageRouter
