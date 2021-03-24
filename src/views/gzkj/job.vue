<template>
  <div class="app-container">
    <div class="filter-container">
      {{ curJob.name }}
      <span v-if="curJob.auto">{{ curJob.enable?'已启用':'已禁用' }}</span>
    </div>
    <div class="jobInfo">
      <span v-if="curJob.auto" class="filter-item">每隔 {{ curJob.value }} {{ curJob.unit=="DAY"?" 天":curJob.unit=="HOUR"?" 时":" 分" }}</span>
      <span v-else class="filter-item">手动触发</span>
      <span class="filter-item">开始时间 :{{ curJob.start_at|formatDate }}</span>
      <span class="filter-item">停止时间 :{{ curJob.end_at|formatDate }}</span>
      <span class="filter-item">拥有者{{ curJob.owner.username }}</span>
    </div>
    <div class="filter-container">

      <div style="float: right">
        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          icon="el-icon-plus"
          @click="handleCreate"
        >
          添加数据分析流程
        </el-button>
        <!-- <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          icon="el-icon-edit"
          @click="handleUpdateJObs"
        >
          编辑任务
        </el-button> -->
        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          :icon="isRun?'el-icon-loading':'el-icon-caret-right'"
          @click="isRun?handleStop() :handleRun()"
        >
          {{ isRun?"停止执行":" 立即执行" }}
        </el-button>
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-delete"
          @click="deleteData()"
        >
          删除
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
      <el-table-column label="任务" width="155" align="left">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleJobs(row)">
            <i class="el-icon-document" style="margin-right: 10px" />{{
              row.name
            }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" width="155" align="center">
        <template>
          <span>运行数据分析流程</span>
        </template>
      </el-table-column>
      <el-table-column label="执行引擎" width="155" align="center">
        <template slot-scope="{ row }">

          <span>{{ row.engine_id==0?"大数据平台":"本地执行引擎" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="left">
        <template slot-scope="{ row }">

          <span style="display:inline-block;width:120px"><span v-if="row.latest_workfile_status!=null">{{ row.latest_workfile_status=='FAILED'?'执行失败':row.latest_workfile_status=='SUCCESS'?'执行成功':row.latest_workfile_status=='RUNNING'?'正在执行':'停止执行' }}</span></span>
          <span v-if="row.latest_workfile_status!=null" style="margin-left:20px">开始时间 :{{ row.latest_workfile_start_at|formatDate }}</span>
          <span v-if="row.latest_workfile_status!=null" style="margin-left:20px">停止时间 :{{ row.latest_workfile_finish_at|formatDate }}</span>

        </template>

      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="280"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">

          <el-tooltip class="item" content="编辑" placement="top">
            <span style="display:inline-block;width:60px"><i class="el-icon-edit icon_button" @click="handleUpdate(row)" /></span>
          </el-tooltip>

          <el-tooltip class="item" content="删除" placement="top">
            <span style="display:inline-block;width:20px"><i class="el-icon-delete icon_button" @click="handleDelete(row, $index)" /></span>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :close-on-click-modal="false" title="编辑任务" :visible.sync="dialogVisibleJobs" width="40%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="margin-left:50px;margin-right:50px;"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        计划
        <el-divider style="margin:10px 0px" />
        可以对计划设置手动调度和自动周期调度
        <div style="margin:20px 0px">
          <el-radio v-model="radio" label="1" @change="handleSelectManu()">手动调度</el-radio>
          <el-radio v-model="radio" label="2" @change="handleSelectAuto()">自动调度</el-radio>
        </div>
        <el-form-item v-show="radio==2" label-width="0px">
          每   <el-input v-model="temp.value" style="width: 120px" />
          <el-select
            v-model="temp.unit"
            clearable
            style="margin-left:20px;width: 120px"
          >
            <el-option
              v-for="item in units"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-show="radio==2" label-width="0px">
          开始时间
          <el-date-picker
            v-model="start_at"
            type="datetime"
            placeholder="选择日期时间"
          />
        </el-form-item>
        <el-form-item v-show="radio==2" label-width="0px">
          <el-checkbox v-model="checked">停止时间</el-checkbox>
          <el-date-picker
            v-show="checked"
            v-model="end_at"
            style="margin-left:20px"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>

        通知
        <el-divider style="margin:10px 0px" />
        通知人
        <div style="margin:20px 0px">
          <el-radio v-model="radioMember" label="1" @change="handleSelectAll()">所有成员</el-radio>
          <el-radio v-model="radioMember" label="2" @click.native.prevent="handleClick()" @change="handleSelect()">选择成员<span v-if="selectJobsRows.length!=0">  (已选{{ selectJobsRows.length }}位)</span></el-radio>
        </div>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleJobs = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="false" title="添加数据分析流程" :visible.sync="dialogSelectGZLVisible" width="40%">
      <!-- <div v-for="item in member" :key="item.id" style="margin-left:10px" class="user">
              {{ item.username+"   "+item.email }}  </div>-->

      <el-table
        ref="multipleTableMember"
        :key="tableKey"
        v-loading="listLoading"
        :data="listWorkFiles"
        fit
        highlight-current-row
        style="width: 100%;"
        @row-click="rowClickMember"
        @selection-change="selectionChangeMember"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column label="名称" align="left">
          <template slot-scope="{ row }">
            <span class="link-type">
              <i class="el-icon-document" style="margin-right: 10px" />{{
                row.name
              }}</span>
            <span>
              <!-- <el-select v-model="value" placeholder="请选择">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.disabled">
                </el-option>
              </el-select> -->
            </span>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSelectGZLVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="selectJobs()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :close-on-click-modal="false" title="修改执行引擎" :visible.sync="dialogEngineVisible" width="40%">

      <el-select v-model="yqvalue" placeholder="请选择">
        <el-option
          v-for="item in yqoptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogEngineVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="updateEngine()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import { updateJobWorkFileVersion, getWorkFilesList, getJob, getGZKJSearch, addJobs, updateJobs, runJobs, stopJobs, deleteJobWorkFileVersion, addJobWorkFileVersion } from '@/api/gzkj'
import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination

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
  // components: { Pagination },
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
      isRun: false,
      dialogEngineVisible: false,
      yqoptions: [{
        value: 0,
        label: '大数据平台'
      }, {
        value: 1,
        label: '本地执行引擎'
      }],
      yqvalue: 0,
      curJob: { name: '', owner: { username: '' }},
      jobId: undefined,
      jobName: undefined,
      selectRows: [],
      selectJobsRows: [],
      dialogSelectGZLVisible: false,
      loading: false,
      keyword: '',
      tableKey: 0,
      list: null,
      listWorkFiles: null,
      total: 0,
      listLoading: true,
      listQuery: {
        // page: 1,
        // limit: 10,
        id: undefined,
        page: 1,
        per_page: 10,
        text: undefined,
        // curPage:1,
        // pageSize: 10,
        // type:'all',
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      gzlyq: [{ id: 1, name: '本地数据分析流程引擎' }],
      strgzlyq: '本地数据分析流程引擎',

      stryxq: '1',
      sj: '',
      calendarTypeOptions,
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' }
      ],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,

      radioMember: '1',
      radio: '1',
      units: [{ id: 'MINUTE', name: '分钟' }, { id: 'HOUR', name: '小时' }, { id: 'DAY', name: '天' }],
      start_at: undefined,
      end_at: 4956336000000,
      checked: false,
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
      member: [],
      gzkj: undefined,
      dialogVisibleJobs: false,
      dialogStatus: '',

      dialogPvVisible: false,
      dialogPublishVisible: false,
      pvData: [],
      rules: {

        name: [
          { required: true, message: '名称必填', trigger: 'blur' }
        ]
      },
      downloadLoading: false
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
    this.jobId = this.$route.query.jobid
    // this.jobName= this.$route.query.name
    // this.curJob=this.$route.params
    this.getList()
  },
  methods: {
    rowClick(row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    handleSelectionChange(val) {
      this.selectRows = val
    },
    rowClickMember(row) {
      this.$refs.multipleTableMember.toggleRowSelection(row)
    },
    selectionChangeMember(val) {
      this.selectJobsRows = val

      this.temp.members = val.map(item => {
        return item.id
      })
    },
    handleSelectAuto() {
      this.temp.auto = true
    },
    handleSelectManu() {
      this.temp.auto = false
    },
    handleSelect() {
      // this.dialogSelectGZLVisible=true
      // this.getMembersList();
      this.temp.notify_all = false
    },
    handleSelectAll() {
      this.temp.notify_all = true
    },
    handleClick() {
      this.dialogSelectGZLVisible = true
      this.getMembersList()
    },
    selectJobs() {
      this.listLoading = true
      var workfile_engines = []
      var workfile_versions = []

      this.selectJobsRows.forEach(element => {
        workfile_engines.push(0)
        workfile_versions.push(element.id)
      })
      this.curJob.workfile_engines = workfile_engines
      this.curJob.workfile_versions = workfile_versions
      var param = {
        'auto': this.curJob.auto,
        'enable': this.curJob.enable,
        'end_at': this.curJob.end_at,
        'members': this.curJob.members.map(value => { return value.user.id }),
        'name': this.curJob.name,
        'notify_all': this.curJob.notify_all,
        'start_at': this.curJob.start_at,
        'unit': this.curJob.unit,
        'value': this.curJob.value,
        'workfile_engines': workfile_engines,
        'workfile_versions': workfile_versions
      }
      addJobWorkFileVersion(this.gzkj, this.jobId, param).then(response => {
        // this.list = response.response.content
        // this.total = response.response.pagination.records
        this.dialogSelectGZLVisible = false
        this.$message.success('添加成功')
        this.listLoading = false
        this.getList()
        // Just to simulate the time of the request
        // setTimeout(() => {
        //   this.listLoading = false
        // }, 0.1 * 1000)
      }).catch(e => {
        this.$message('操作调用失败')
        this.dialogSelectGZLVisible = false

        this.listLoading = false
      })

      // this.curJob.workfile_engines
      // this.curJob.workfile_versions
    },

    // getMembersList() {
    //   var _this = this
    //   this.member = []
    //   var param = {
    //     id: this.gzkj,
    //     page: 0,
    //     per_page: 1000
    //   }
    //   getMembers(param).then((response) => {
    //     // this.dialogVisibleJobs = false
    //     this.member = response.response.content
    //     // var memberId=response.response.content.map(value=>{return value.id})
    //     var lsselectrows = []
    //     this.$nextTick(() => {
    //       _this.selectJobsRows.forEach(row => {
    //         var currow = this.member.filter(value => {
    //           if (value.id == row.user.id) {
    //             return value
    //           }
    //         })
    //         _this.$refs.multipleTableMember.toggleRowSelection(currow[0])
    //         lsselectrows.push(currow[0])
    //       })
    //       _this.selectJobsRows = lsselectrows
    //     })
    //   })
    // },
    getList() {
      this.listLoading = true
      getJob(this.gzkj, { id: this.jobId }).then(response => {
        this.list = response.response.content.workfile_versions
        this.curJob = response.response.content
        // this.total = response.response.pagination.records

        setTimeout(() => {
          this.listLoading = false
        }, 0.1 * 1000)
      })
    },
    getListPagination(param) {
      this.listQuery.page = param.page
      this.listQuery.per_page = param.per_page
      this.getList()
    },
    // updatePagination(param){
    //   console.log('update'+param)
    // },
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

      getGZKJSearch(this.gzkj, param).then(response => {
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
    getWorkFiles() {
      // var _this = this
      var param = {
        id: this.gzkj,
        page: 0,
        per_page: 1000,
        order: 'name'
      }
      getWorkFilesList(param).then(response => {
        var data = response.response.content.filter(value => {
          var count = 0
          this.list.forEach(element => {
            if (value.id == element.workFileVersion.id) {
              count++
            }
          })
          if (count == 0) {
            return value
          }
        })
        this.listWorkFiles = data
        // this.listWorkFiles = response.response.content
      })
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
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
    resetTemp() {
      this.temp = {
        id: undefined,
        description: '',
        auto: false,
        enable: true,
        end_at: 4956336000000,
        members: [],
        name: '',
        notify_all: true,
        start_at: undefined,
        unit: 'HOUR',
        value: 1,
        workfile_versions: []
      }
    },
    handleCreate() {
      this.resetTemp()
      this.selectJobsRows = []
      this.radioMember = '1'
      this.radio = '1'
      this.start_at = undefined
      this.end_at = undefined
      this.checked = !(this.temp.end_at === 4956336000000)

      this.dialogStatus = 'create'
      this.dialogSelectGZLVisible = true
      this.loading = false
      this.getWorkFiles()
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    createData() {
      this.loading = true
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          // this.temp.gzkj =this.gzkj
          this.temp.start_at = this.start_at.getTime()
          this.temp.end_at = this.end_at.getTime()
          if (!this.checked) {
            this.temp.end_at = 4956336000000
          }
          addJobs(this.gzkj, this.temp).then(() => {
            // this.list.unshift(this.temp)
            this.dialogVisibleJobs = false
            this.loading = true

            this.$message.success('创建成功')

            this.getList()
          }).catch(e => {
            this.loading = true
          })
        } else {
          this.loading = false
        }
      })
    },
    handleRun() {
      this.isRun = true
      runJobs(this.gzkj, this.jobId).then(() => {

      }).catch(e => {
        this.loading = true
      })
    },
    handleStop() {
      this.isRun = false
      stopJobs(this.gzkj, this.jobId).then(() => {

      }).catch(e => {
        this.loading = true
      })
    },
    // handleUpdateJObs() {
    //   // this.temp = Object.assign(this.temp, row) // copy obj
    //   // this.temp.timestamp = new Date(this.temp.timestamp)
    //   this.temp = {
    //     id: this.curJob.id,
    //     description: this.curJob.description,
    //     auto: this.curJob.auto,
    //     enable: this.curJob.enable,
    //     end_at: this.curJob.end_at === 4956336000000 ? 1611804847000 : this.curJob.end_at, // 没有选择停止则反2028年
    //     members: this.curJob.members.map(value => { return value.user.id }),
    //     name: this.curJob.name,
    //     notify_all: this.curJob.notify_all,
    //     start_at: this.curJob.start_at,
    //     unit: this.curJob.unit,
    //     value: this.curJob.value,
    //     workfile_versions: this.curJob.workfile_versions
    //   }
    //   this.dialogStatus = 'update'
    //   this.dialogVisibleJobs = true
    //   this.loading = false
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //   })
    //   // this.selectJobsRows=row.members.map(value=>{return value.user.id});
    //   this.selectJobsRows = row.members

    //   this.radioMember = row.members.length > 0 ? '2' : '1'
    //   this.radio = row.auto ? '2' : '1'
    //   this.start_at = row.start_at
    //   this.end_at = row.end_at
    //   this.checked = !(this.temp.end_at === 4956336000000)
    // },
    handleUpdate(row) {
      this.temp = Object.assign(this.temp, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      // this.temp = {
      //   id: row.id,
      //   description: row.description,
      //   auto: row.auto,
      //   enable: row.enable,
      //   end_at: row.end_at === 4956336000000 ? 1611804847000 : row.end_at, // 没有选择停止则反2028年
      //   members: row.members.map(value => { return value.user.id }),
      //   name: row.name,
      //   notify_all: row.notify_all,
      //   start_at: row.start_at,
      //   unit: row.unit,
      //   value: row.value,
      //   workfile_versions: row.workfile_versions
      // }
      // this.dialogStatus = 'update'
      this.dialogEngineVisible = true
      this.yqvalue = row.engine_id
      // this.loading = false
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
      // // this.selectJobsRows=row.members.map(value=>{return value.user.id});
      // this.selectJobsRows = row.members

      // this.radioMember = row.members.length > 0 ? '2' : '1'
      // this.radio = row.auto ? '2' : '1'
      // this.start_at = row.start_at
      // this.end_at = row.end_at
      // this.checked = !(this.temp.end_at === 4956336000000)
    },
    updateEngine() {
      var param = { engineId: this.yqvalue }
      updateJobWorkFileVersion(this.gzkj, this.jobId, this.temp.id, param).then(() => {
        // const index = this.list.findIndex(v => v.id === this.temp.id)
        // this.list.splice(index, 1, this.temp)
        this.loading = false

        this.dialogEngineVisible = false

        this.$message.success('更新成功')
        this.getList()
      }).catch(e => {
        this.loading = false
      })
    },
    handlePublish(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'publish'
      this.dialogPublishVisible = true
      this.loading = false
    },

    handleJobs(row) {
      // this.$router.push({ path: this.$route.path + '/' + row.id, query: { id: this.gzkj, gzlid: row.id, name: row.name }})
    },

    updateData() {
      this.loading = true
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateJobs(this.gzkj, this.temp).then(() => {
            // const index = this.list.findIndex(v => v.id === this.temp.id)
            // this.list.splice(index, 1, this.temp)
            this.loading = false

            this.dialogVisibleJobs = false

            this.$message.success('更新成功')
            this.getList()
          }).catch(e => {
            this.loading = false
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var param = { job_workfile_version_ids: [row.id] }
        deleteJobWorkFileVersion(this.gzkj, this.jobId, param).then(() => {
          this.dialogVisibleJobs = false

          this.$message.success('删除成功')
          this.getList()
        }).catch(e => {
          this.$message('操作调用失败')
          this.dialogVisibleJobs = false
        })
      }).catch(e =>{
          this.$message('取消删除')
          this.dialogVisibleJobs = false
      })
    },
    deleteData() {
      if (this.selectRows.length === 0) {
        this.$message.warning('选择数据')
        return
      }
      this.$confirm('确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var ids=[];
        this.selectRows.map(val =>{
          ids.push(val.id)
        })
        var param = { job_workfile_version_ids: ids }
        deleteJobWorkFileVersion(this.gzkj, this.jobId, param).then(() => {
          this.dialogVisibleJobs = false

          this.$message.success('删除成功')
          this.getList()
        }).catch(e => {
          this.$message('操作调用失败')
          this.dialogVisibleJobs = false
        })
      }).catch(e =>{
          this.$message('取消删除')
          this.dialogVisibleJobs = false
      })

      
     
    }

    // formatJson(filterVal) {
    //   return this.list.map(v =>
    //     filterVal.map(j => {
    //       if (j === 'timestamp') {
    //         return parseTime(v[j])
    //       } else {
    //         return v[j]
    //       }
    //     })
    //   )
    // },
    // getSortClass: function(key) {
    //   const sort = this.listQuery.sort
    //   return sort === `+${key}` ? 'ascending' : 'descending'
    // }
  }
}
</script>
<style scoped>
.jobInfo{
      display: flex;
    flex-direction: row;
    margin-bottom: 20px;
    padding: 12px 10px;
    border-radius: 3px;
    background-color: #b3d988;
}
.jobInfo span{
      width: 25%;
}
</style>
