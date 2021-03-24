<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.key"
        placeholder="搜索"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <div style="float: right">
        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          icon="el-icon-plus"
          @click="handleReset"
        >
          重置
        </el-button>
      </div>

    </div>

    <el-table
      ref="multipleTable"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      fit
      highlight-current-row
      style="width: 100%;"
      @row-click="rowClick"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column label="报表名称" align="left">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleJobs(row)">
            <i class="el-icon-document" style="margin-right: 10px" />{{
              row.reportName
            }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column label="发布时间" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.updatedAt| formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="left"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row}">
          <el-tooltip class="item" content="预览" placement="top">
            <i class="iconfont icon-yulan" style="margin-left: 20px;cursor: pointer" @click.stop="preview(row,$event)" />
            <!-- <span style="display:inline-block;width:20px"><i class="el-icon-eye icon_button" @click.stop @click="handleDelete(row, $index)" /></span> -->
          </el-tooltip>
          <el-tooltip class="item" content="删除" placement="top">
            <i class="el-icon-delete icon_button" @click.stop="handleDelete(row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page="listQuery.page"
      :per_page="listQuery.per_page"
      @pagination="getListPagination"
    />
    <!-- <pagination v-show="total>0" :total="total" :page="listQuery.page" :per_page="listQuery.per_page" @pagination="getList" /> -->

  

  </div>
</template>
<script>

import { reportView, deleteReport} from '@/api/gzkj'
import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'Workspaces',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    },
    formatDate(d) {
      if (d === null || d === undefined) {
        return ''
      }
      var date = new Date(d)
      var YY = date.getFullYear() + '-'
      var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate())
      var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
      var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
      var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
      return YY + MM + DD + ' ' + hh + mm + ss
    }
  },
  data() {
    return {
      selectRows: [],
      selectMemberRows: [],
      lsselectrows: [],
      loading: false,
      keyword: '',
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        // page: 1,
        // limit: 10,
        id: undefined,
        page: 1,
        per_page: 10,
        key: undefined,
        // curPage:1,
        // pageSize: 10,
        // type:'all',
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      calendarTypeOptions,
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' }
      ],
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        id: undefined,
        name: '',
        description: '',
        auto: false,
        enable: true,
        end_at: 4956336000000,
        members: [],
        notify_all: true,
        start_at: undefined,
        unit: 'HOUR',
        value: 1,
        workfile_versions: []
      },
      gzkj: undefined,
      dialogFormVisible: false,
      dialogStatus: '',
      rules: {
        // type: [
        //   { required: true, message: 'type is required', trigger: 'change' }
        // ],
        // timestamp: [
        //   {
        //     type: 'date',
        //     required: true,
        //     message: 'timestamp is required',
        //     trigger: 'change'
        //   }
        // ],
        name: [
          { required: true, message: '名称必填', trigger: 'blur' }
        ]
      },
    }
  },
  computed: {
    // checked() {
    //   //是否选择停止时间
    //   return !this.temp.end_at===4956336000000
    // }
  },
  created() {
    this.listQuery.id = this.$route.query.id
    this.gzkj = this.$route.query.id
    this.getList()
  },
  methods: {
    preview(row){
      window.open(row.token)
    },
    handleDelete(row) {
      this.$confirm('确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteReport({id:row.id}).then(() => {
          this.$message.success('删除成功')
          this.getList()
        }).catch(e => {
          this.$message('操作调用失败')
          this.loading = false
        })
      }).catch(e =>{
          this.$message('取消删除')
          this.loading = false
      })
    },
    rowClick(row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    handleSelectionChange(val) {
      this.selectRows = val
      // _this.lsselectrows.push(currow[0].id)
    },
    rowClickMember(row) {
      this.$refs.multipleTableMember.toggleRowSelection(row)
      this.lsselectrows = []
      this.selectMemberRows.map(value => {
        this.lsselectrows.push(value.id)
      })
    },
    selectionChangeMember(val) {
      this.selectMemberRows = val
      this.temp.members = val.map(item => {
        return item.id
      })
    },
    handleClick() {
      this.temp.notify_all = false
      this.radioMember = '2'
      this.dialogSelectVisible = true
      this.getMembersList()
    },
    selectMember() {
      this.dialogSelectVisible = false
      // this.selectMemberRows
    },
    getList() {
      this.listLoading = true
      var data={
        'wsId':parseInt(this.listQuery.id),
        'keyword':this.listQuery.key,
        'page':this.listQuery.page,
        'per_page':this.listQuery.per_page,
      
      }
      reportView(data).then(response => {
        this.list = response.response.content
        this.total = response.response.pagination.records
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.1 * 1000)
      }).catch(e => {
        this.$message('操作调用失败')
        this.listLoading = false
      })
    },
    getListPagination(param) {
      this.listQuery.page = param.page
      this.listQuery.per_page = param.per_page
      this.getList()
    },
    handleFilter() {
      this.listLoading = true
      if (this.keyword === '') {
        this.listQuery.page = 1
        this.getList()
        return
      }
      var param = {
        type: 'JobModel',
        text: this.keyword,
        page: 0,
        per_page: 10000
      }
      reportView(data).then(response => {
        this.list = response.response.content
        this.total = response.response.pagination.records

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.1 * 1000)
      }).catch(e => {
        this.$message('操作调用失败')
        this.listLoading = false
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    handleReset(){
      this.listQuery.key=""
      this.getList()
    },
    // resetTemp() {
    //   this.temp = {
    //     id: undefined,
    //     description: '',
    //     auto: false,
    //     enable: true,
    //     end_at: 4956336000000,
    //     members: [],
    //     name: '',
    //     notify_all: true,
    //     start_at: undefined,
    //     unit: 'HOUR',
    //     value: 1,
    //     workfile_versions: []
    //   }
    // },
    // handleCreate() {
    //   this.resetTemp()
    //   this.selectMemberRows = []
    //   this.radioMember = '1'
    //   this.radio = '1'
    //   this.start_at = undefined
    //   this.end_at = undefined
    //   this.checked = !(this.temp.end_at === 4956336000000)
    //   this.dialogStatus = 'create'
    //   this.dialogFormVisible = true
    //   this.loading = false
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //   })
    // },
    // createData() {
    //   this.$refs['dataForm'].validate(valid => {
    //     if (valid) {
    //       if (this.temp.auto && this.start_at == undefined) {
    //         this.$message('选择开始时间')
    //         return
    //       }
    //       this.loading = true
    //       // this.temp.gzkj =this.gzkj
    //       this.temp.start_at = this.start_at != undefined ? this.start_at.getTime() : undefined
    //       this.temp.end_at = this.end_at != undefined ? this.end_at.getTime() : (new Date()).getTime()
    //       if (!this.checked) {
    //         this.temp.end_at = 4956336000000
    //       }
    //       addJobs(this.gzkj, this.temp).then(() => {
    //         // this.list.unshift(this.temp)
    //         this.dialogFormVisible = false
    //         this.loading = true
    //         this.$message.success('创建成功')
    //         this.getList()
    //       }).catch(e => {
    //         this.loading = true
    //       })
    //     } else {
    //       this.loading = false
    //     }
    //   })
    // },
    // handleUpdate(row) {
    //   // this.temp = Object.assign(this.temp, row) // copy obj
    //   // this.temp.timestamp = new Date(this.temp.timestamp)
    //   this.temp = {
    //     id: row.id,
    //     description: row.description,
    //     auto: row.auto,
    //     enable: row.enable,
    //     // end_at: row.end_at === 4956336000000 ? 1611804847000 : row.end_at, // 没有选择停止则反2028年
    //     end_at: row.end_at,
    //     members: row.members.map(value => { return value.user.id }),
    //     name: row.name,
    //     notify_all: row.notify_all,
    //     start_at: row.start_at,
    //     unit: row.unit,
    //     value: row.value,
    //     workfile_versions: row.workfile_versions
    //   }
    //   this.lsselectrows = row.members.map(value => { return value.user.id }),
    //   this.dialogStatus = 'update'
    //   this.dialogFormVisible = true
    //   this.loading = false
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //   })
    //   //  var workfile_engines = []
    //   var workfile_versions = []
    //   row.workfile_versions.forEach(element => {
    //     // workfile_engines.push(0)
    //     workfile_versions.push(element.id)
    //   })
    //   // this.temp.workfile_engines = workfile_engines
    //   this.temp.workfile_versions = workfile_versions
    //   // this.selectMemberRows=row.members.map(value=>{return value.user.id});
    //   this.selectMemberRows.length = row.members.length
    //   this.radioMember = row.members.length > 0 ? '2' : '1'
    //   this.radioMember = row.notify_all ? '1' : '2'
    //   this.radio = row.auto ? '2' : '1'
    //   this.start_at = row.start_at
    //   this.end_at = row.end_at
    //   this.checked = !(row.end_at === 4956336000000)
    // },
    // rowClickJob(row) {
    // },
    // selectionChangeJobs(val) {
    // },
  
    // updateData() {
    //   this.temp.end_at = this.end_at.getTime ? this.end_at.getTime() : this.end_at
    //   if (!this.checked) {
    //     this.temp.end_at = 4956336000000
    //   }
    //   this.loading = true
    //   this.$refs['dataForm'].validate(valid => {
    //     if (valid) {
    //       updateJobs(this.gzkj, this.temp).then(() => {
    //         // const index = this.list.findIndex(v => v.id === this.temp.id)
    //         // this.list.splice(index, 1, this.temp)
    //         this.loading = false
    //         this.dialogFormVisible = false
    //         this.$message.success('更新成功')
    //         this.getList()
    //       }).catch(e => {
    //         this.loading = false
    //       })
    //     }
    //   })
    // },
    // handleDelete(row, index) {
    //   this.$confirm('确定删除?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     deleteJobs(this.gzkj, row).then(() => {
    //       const index = this.list.findIndex(v => v.id === this.temp.id)
    //       this.list.splice(index, 1, this.temp)
    //       this.dialogFormVisible = false
    //       this.$message.success('删除成功')
    //       this.getList()
    //     }).catch(e => {
    //       this.$message('操作调用失败')
    //       this.dialogFormVisible = false
    //     })
    //   })
    // }
  }
}
</script>
