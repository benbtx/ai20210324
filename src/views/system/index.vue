<template>
  <div class="app-container">
    <el-tabs v-model="activeName">
      <el-tab-pane label="用户管理" name="first">
        <user />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import user from './user/index.vue'
export default {
  name: 'Index',
  components: {
    user
  },
  data() {
    return {
      activeName: 'first'
    }
  }
}
</script>

<style scoped>

</style>
