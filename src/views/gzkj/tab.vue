<template>
  <div class="tab-container">
    <el-tabs v-model="activeName" style="margin-top:15px;" type="border-card" @tab-click="handleClick">
      <el-tab-pane v-for="item in tabMapOptions" :key="item.key" :label="item.label" :name="item.key" />
      <keep-alive>
        <!-- <tab-pane v-if="activeName==item.key" :type="item.key" @create="showCreatedTimes" /> -->
        <!-- adfasdfsddddd -->
        <!-- <router-view :key="toPath" /> -->
        <router-view />
      </keep-alive>
    </el-tabs>

  </div>
</template>

<script>
// import TabPane from './components/TabPane'

export default {
  name: 'Tab',
  // components: { TabPane },
  data() {
    return {
      tabMapOptions: [
        // { label: '概要', key: 'quickstart' },
        { label: '分发数据集', key: 'datasets' },
        { label: '数据挖掘分析', key: 'workfiles' },
        { label: '任务', key: 'jobs' },
        { label: '模型', key: 'models' },
        { label: '服务', key: 'exports' },
        { label: '报表设计', key: 'visualization' },
        { label: '报表查看', key: 'reportView' },
      ],
      activeName: 'datasets',
      createdTimes: 0,
      toPath: ''
    }
  },
  computed: {
    // cachedViews() {
    //   return this.$store.state.tagsView.cachedViews
    // },
    // key() {
    //   return this.$route.path
    // }
  },
  watch: {
    activeName(val, oldVal) {
      // this.$router.push(`${this.$route.path}?tab=${val}`)
      // this.$router.push({path: "/gzkj/"+val, query: {id: row.id}})

      // this.toPath = `/gzkj/${val}/id?id=${this.$route.query.id}`
      // this.$router.push(`/gzkj/${val}/id?id=${this.$route.query.id}`)
    }
  },
  created() {
    // init the default selected tab
    // const tab = this.$route.query.tab || this.$route.path.split('/')[this.$route.path.split('/').length - 2]
    const tab = this.$route.query.tab || this.$route.path.split('/')[3]
    if (tab) {
      // if (tab == 'index') {
      //   tab = this.$route.path.split('/')[3]
      //   // tab = this.$route.path.split('/')[3]
      // }
      this.activeName = tab
    }
  },
  methods: {
    showCreatedTimes() {
      this.createdTimes = this.createdTimes + 1
    },
    handleClick(tab, event) {
      console.log(tab, event)
      // this.$router.push(`/gzkj/${tab.name}/id?id=${this.$route.query.id}`)
      this.$router.push(`/gzkj/${this.$route.query.id}/${tab.name}?id=${this.$route.query.id}`)
    }
  }
}
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }
</style>
