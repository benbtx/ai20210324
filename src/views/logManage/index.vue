<template>
  <div class="app-container">
    <div>
      <el-input
        ref="searchKey"
        v-model="keyWords"
        style="width: 200px"
        placeholder="搜索日志"
        clearable
        prefix-icon="el-icon-search"
      />
      <span style="margin-left: 20px">
        日期：
        <el-date-picker
          v-model="date"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </span>
      <el-button type="primary" icon="el-icon-search" style="margin-left: 20px" @click="getLogList">搜索</el-button>
    </div>
    <div style="margin-top: 20px">
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="tableData"
        :max-height="maxHeight"
        tooltip-effect="dark"
      >
        <el-table-column
          prop="userName"
          label="操作人"
        />
        <el-table-column
          prop="objectName"
          label="操作对象"
        />
        <el-table-column
          prop="logTypeName"
          label="操作名称"
        />
        <el-table-column
          width="200"
          label="创建时间"
        >
          <template slot-scope="scope">{{ $dayjs(scope.row.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total!==0"
        :total="total"
        :page="page"
        :per_page="size"
        @pagination="pageChange"
      />
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getLogList } from '@/api/logManage.js'
export default {
  name: 'Index',
  components: { Pagination },
  data() {
    return {
      keyWords: '',
      date: [this.$dayjs(new Date().getTime() - 3600 * 1000 * 24 * 30).format('YYYY-MM-DD'), this.$dayjs(new Date()).format('YYYY-MM-DD')],
      tableData: [],
      loading: false,
      maxHeight: 500,
      total: 0,
      page: 1,
      size: 10
    }
  },
  mounted() {
    this.getLogList()
    setTimeout(() => {
      this.resize()
    })
    window.addEventListener('resize', this.resize)
  },
  destroyed() {
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    resize() {
      this.maxHeight = document.body.offsetHeight - 200
    },
    pageChange(params) {
      this.page = params.page
      this.size = params.per_page
      this.getLogList()
    },

    getLogList() {
      console.log(this.date)
      // console.log(typeof(this.date[0]))
    
      if (this.date==null||!this.date.length) {
        this.$message('请选择时间')
        return
      }
      if(typeof(this.date[0])!="string"){
        this.date[0]=this.$dayjs(this.date[0]).format('YYYY-MM-DD');
        this.date[1]=this.$dayjs(this.date[1]).format('YYYY-MM-DD');
      }
      this.loading = true
      getLogList({
        from: this.date[0],
        to: this.date[1],
        page: this.page,
        per_page: this.size,
        text: this.keyWords
      }).then(data => {
        this.loading = false
        if (data.code === 200) {
          this.tableData = data.response.content
          this.total = data.response.pagination.records
        } else {
          this.tableData = []
          this.total = 0
        }
      }).catch(() => {
        this.tableData = []
        this.total = 0
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
