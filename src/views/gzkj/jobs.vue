<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        ref="searchKey"
        v-model="listQuery.text"
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
          @click="handleCreate"
        >
          添加
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
      <el-table-column label="名称" align="left" width="140">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleJobs(row)">
            <i class="el-icon-document" style="margin-right: 10px" />{{
              row.name
            }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件数" align="center" width="80">
        <template slot-scope="{ row }">
          <span>{{ row.workfile_versions.length }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度" align="center" width="120">
        <template slot-scope="{ row }">
          <span v-if="row.auto">每隔 {{ row.value }} {{ row.unit=="DAY"?" 天":row.unit=="HOUR"?" 时":" 分" }}</span>
          <span v-else>手动触发</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="最后修改时间"  align="center">
        <template slot-scope="{ row }">
          <span>{{ row.updated_at | formatDate }}</span>
        </template>
      </el-table-column>  -->
      <el-table-column
        label="操作"
        align="left"
        width="360"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-tooltip class="item" :content="row.enable?'关闭调度':'开启调度'" placement="top">
            <span style="display:inline-block;width:60px" @click.stop>
              <el-switch
                v-if="row.auto"
                v-model="row.enable"
                @change="switchChange(row)"
              />
            </span>
          </el-tooltip>
          <!-- <el-tooltip class="item" :content="isRun?'停止执行':'立即执行'" placement="top">
            <span style="display:inline-block;width:40px"><i v-if="row.workfile_versions.length!=0"
             :class="isRun?'el-icon-loading icon_button':'el-icon-caret-right icon_button'"

             @click.stop
             @click="isRun?handleStop(row) :handleRun(row)" />
            </span>
          </el-tooltip> -->
          <el-tooltip class="item" content="立即执行" placement="top">
            <span style="display:inline-block;width:40px"><i
              v-if="row.workfile_versions.length!=0"
              class="el-icon-caret-right icon_button"
              @click.stop
              @click="handleRun(row)"
            />
            </span>
          </el-tooltip>
          <el-tooltip class="item" content="编辑" placement="top">
            <span style="display:inline-block;width:40px"><i class="el-icon-edit icon_button" @click.stop @click="handleUpdate(row)" /></span>
          </el-tooltip>
          <el-tooltip class="item" content="添加数据分析流程" placement="top">
            <span style="display:inline-block;width:40px"><i class="el-icon-plus icon_button" @click.stop @click="handleGZL(row)" /></span>
          </el-tooltip>
          <el-tooltip class="item" content="删除" placement="top">
            <span style="display:inline-block;width:20px"><i class="el-icon-delete icon_button" @click.stop @click="handleDelete(row, $index)" /></span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="left">
        <template slot-scope="{ row }">
          <!-- <span v-if="row.auto">{{ row.enable?'已启用':'已禁用' }}</span> -->
          <span style="display:inline-block;width:120px"><span v-if="row.latest_task!=null">{{ row.latest_task.status=='FAILED'?'执行失败':row.latest_task.status=='SUCCESS'?'执行成功':row.latest_task.status=='RUNNING'?'正在执行':'停止执行' }}</span></span>
          <span v-if="row.latest_task!=null" style="margin-left:20px">开始时间 :{{ row.latest_task.start_at|formatDate }}</span>
          <span v-if="row.latest_task!=null" style="margin-left:20px">停止时间 :{{ row.latest_task.end_at|formatDate }}</span>

          <!-- <span v-if="row.auto" style="margin-left:20px">开始时间 :{{ row.start_at|formatDate }}</span>
          <span v-if="row.end_at.toString()!=4956336000000" style="margin-left:20px"><span v-if="row.auto">停止时间 :{{ row.end_at|formatDate }}</span></span> -->
          <!-- <span v-else style="margin-left:20px">
            <span v-if="row.auto&&row.latest_task!=null">最后一次运行 :{{ row.latest_task.end_at|formatDate }}执行文件数:{{ row.latest_task.sum }}成功:失败:未完成:</span>
          </span> -->
        </template>
        <!-- <template scope="scope">
          <span  v-if="scope.row.auto">{{ scope.row.enable?'已启用':'已禁用' }}</span>
          <span  v-if="scope.row.auto" style="margin-left:20px">开始时间 :{{ scope.row.start_at|formatDate }}</span>
          <span  v-if="scope.row.end_at.toString()!=4956336000000" style="margin-left:20px"><span v-if="scope.row.auto" >停止时间 :{{ scope.row.end_at|formatDate }}</span></span>
          <span  v-else style="margin-left:20px"><span v-if="scope.row.auto" >最后一次运行 :{{ scope.row.latest_task!=undefined?  scope.row.latest_task.end_at|formatDate }}执行文件数:{{scope.row.latest_task.sum}}成功:失败:未完成:</span></span>
          </template> -->
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

    <el-dialog :close-on-click-modal="false" :title="dialogStatus === 'create' ? '新增任务' : '修改任务'" :visible.sync="dialogFormVisible" width="40%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="margin-left:50px;margin-right:50px;"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model.trim="temp.name" />
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
          <el-checkbox v-model="checked" @change="stopTimeChange">停止时间</el-checkbox>
          <el-date-picker
            v-show="checked"
            v-model="end_at"
            style="margin-left:20px"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
<!-- 
        通知
        <el-divider style="margin:10px 0px" />
        通知人
        <div style="margin:20px 0px">
          <el-radio v-model="radioMember" label="1" @change="handleSelectAll()">所有成员</el-radio>
          <el-radio v-model="radioMember" label="2" @click.native.prevent="handleClick()" @change="handleSelect()">选择成员<span v-if="!temp.notify_all&&selectMemberRows.length!=0">  (已选{{ selectMemberRows.length }}位)</span></el-radio>
        </div> -->

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
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

    <el-dialog :close-on-click-modal="false" title="选择人员" :visible.sync="dialogSelectVisible" width="40%">
      <!-- <div v-for="item in member" :key="item.id" style="margin-left:10px" class="user">
              {{ item.username+"   "+item.email }}  </div>-->

      <el-table
        ref="multipleTableMember"
        :key="tableKey"
        v-loading="listLoading"
        :data="member"
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
                row.user.username
              }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSelectVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="selectMember()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="false" title="添加数据分析流程" :visible.sync="dialogSelectGZLVisible" width="40%">
      <!-- <div v-for="item in member" :key="item.id" style="margin-left:10px" class="user">
              {{ item.username+"   "+item.email }}  </div>-->

      <el-table
        ref="multipleTableJob"
        :key="tableKey"
        v-loading="listLoading"
        :data="listWorkFiles"
        fit
        highlight-current-row
        style="width: 100%;"
        @row-click="rowClickJob"
        @selection-change="selectionChangeJobs"
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

  </div>
</template>
<script>

import { getGZKJSearch, getJobsList, addJobs, updateJobs, deleteJobs, runJobs, stopJobs, getMemberships, getWorkFilesList, addJobWorkFileVersion } from '@/api/gzkj'
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
      isRun: false,
      listWorkFiles: null,
      dialogSelectGZLVisible: false,
      selectRows: [],
      selectMemberRows: [],
      lsselectrows: [],
      dialogSelectVisible: false,
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
      dialogFormVisible: false,
      dialogStatus: '',

      dialogPvVisible: false,
      dialogPublishVisible: false,
      pvData: [],
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
          { required: true, message: '名称必填', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
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
    this.getList()
  },
  methods: {
    handleRun(row) {
      this.isRun = true
      runJobs(this.gzkj, row.id).then(() => {

      }).catch(e => {
        this.loading = true
      })
    },
    handleStop(row) {
      this.isRun = false
      stopJobs(this.gzkj, row.id).then(() => {

      }).catch(e => {
        this.loading = true
      })
    },
    stopTimeChange(value) {
      console.log(value)
      if (value) {
        this.end_at = (new Date()).getTime()
      } else {
        this
      }
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
    handleSelectAuto() {
      this.temp.auto = true
    },
    handleSelectManu() {
      this.temp.auto = false
    },
    handleSelect() {
      // this.dialogSelectVisible=true
      // this.getMembersList();
      this.temp.notify_all = false
      this.radioMember = '2'
    },
    handleSelectAll() {
      this.temp.notify_all = true
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

    getMembersList() {
      var _this = this
      this.member = []
      // var lsselectrows ;
      var param = {
        id: this.gzkj,
        page: 0,
        per_page: 1000
      }
      getMemberships(param).then((response) => {
        // this.dialogFormVisible = false
        this.member = response.response.content
        // var memberId=response.response.content.map(value=>{return value.id})

        this.$nextTick(() => {
          this.lsselectrows.forEach(id => {
            var currow = this.member.filter(value => {
              if (value.user.id === id) {
                return value
              }
            })
            if (currow.length > 0) {
              _this.$refs.multipleTableMember.toggleRowSelection(currow[0])
              // _this.lsselectrows.push(currow[0].id)
            }
          })
          // _this.selectMemberRows = lsselectrows
        })
      })
    },
    getList() {
      this.listLoading = true
      getJobsList(this.listQuery).then(response => {
        this.list = response.response.content
        this.total = response.response.pagination.records

        // Just to simulate the time of the request
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
      this.selectMemberRows = []
      this.radioMember = '1'
      this.radio = '1'
      this.start_at = undefined
      this.end_at = undefined
      this.checked = !(this.temp.end_at === 4956336000000)

      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          if (this.temp.auto && this.start_at == undefined) {
            this.$message('选择开始时间')
            return
          }
          this.loading = true
          // this.temp.gzkj =this.gzkj
          this.temp.start_at = this.start_at != undefined ? this.start_at.getTime() : undefined
          this.temp.end_at = this.end_at != undefined ? (this.end_at.getTime?this.end_at.getTime() :this.end_at): (new Date()).getTime()
          if (!this.checked) {
            this.temp.end_at = 4956336000000
          }
          if(this.temp.start_at>this.temp.end_at){
            this.$message.warning('开始时间不能大于结束时间')
            this.loading = false
            return
          }
          addJobs(this.gzkj, this.temp).then((response) => {
            // this.list.unshift(this.temp)
            if(response.code==200){
              this.dialogFormVisible = false
              this.loading = false

              this.$message.success('创建成功')

              this.getList()
            }else{
              this.loading = false
              this.$message.error(response.message);
            }
          }).catch(e => {
            this.loading = false
          })
        } else {
          this.loading = false
        }
      })
    },
    handleUpdate(row) {
      // this.temp = Object.assign(this.temp, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)

      this.temp = {
        id: row.id,
        description: row.description,
        auto: row.auto,
        enable: row.enable,
        // end_at: row.end_at === 4956336000000 ? 1611804847000 : row.end_at, // 没有选择停止则反2028年
        end_at: row.end_at,

        members: row.members.map(value => { return value.user.id }),
        name: row.name,
        notify_all: row.notify_all,
        start_at: row.start_at,
        unit: row.unit,
        value: row.value,
        workfile_versions: row.workfile_versions
      }
      this.lsselectrows = row.members.map(value => { return value.user.id }),
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      //  var workfile_engines = []
      var workfile_versions = []

      row.workfile_versions.forEach(element => {
        // workfile_engines.push(0)
        workfile_versions.push(element.id)
      })
      // this.temp.workfile_engines = workfile_engines
      this.temp.workfile_versions = workfile_versions

      // this.selectMemberRows=row.members.map(value=>{return value.user.id});
      this.selectMemberRows.length = row.members.length

      this.radioMember = row.members.length > 0 ? '2' : '1'
      this.radioMember = row.notify_all ? '1' : '2'
      this.radio = row.auto ? '2' : '1'
      this.start_at = row.start_at
      this.end_at = row.end_at
      this.checked = !(row.end_at === 4956336000000)
    },
    handleGZL(row) {
      // this.temp = Object.assign({}, row) // copy obj
      this.temp = {
        id: row.id,
        description: row.description,
        auto: row.auto,
        enable: row.enable,
        // end_at: row.end_at === 4956336000000 ? 1611804847000 : row.end_at, // 没有选择停止则反2028年
        end_at: row.end_at,

        members: row.members.map(value => { return value.user.id }),
        name: row.name,
        notify_all: row.notify_all,
        start_at: row.start_at,
        unit: row.unit,
        value: row.value,
        workfile_versions: row.workfile_versions
      }
      this.dialogStatus = 'publish'
      this.dialogSelectGZLVisible = true
      this.loading = false
      this.getWorkFiles(row)
    },
    getWorkFiles(row) {
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
          row.workfile_versions.forEach(element => {
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
    rowClickJob(row) {
      this.$refs.multipleTableJob.toggleRowSelection(row)
    },
    selectionChangeJobs(val) {
      this.selectJobsRows = val

      this.temp.members = val.map(item => {
        return item.id
      })
    },
    selectJobs() {
      this.listLoading = true
      var workfile_engines = []
      var workfile_versions = []

      this.selectJobsRows.forEach(element => {
        workfile_engines.push(0)
        workfile_versions.push(element.id)
      })
      this.temp.workfile_engines = workfile_engines
      this.temp.workfile_versions = workfile_versions
      var param = {
        'auto': this.temp.auto,
        'enable': this.temp.enable,
        'end_at': this.temp.end_at,
        'members': this.temp.members,
        'name': this.temp.name,
        'notify_all': this.temp.notify_all,
        'start_at': this.temp.start_at,
        'unit': this.temp.unit,
        'value': this.temp.value,
        'workfile_engines': workfile_engines,
        'workfile_versions': workfile_versions
      }
      addJobWorkFileVersion(this.gzkj, this.temp.id, param).then(response => {
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

    handleJobs(row) {
      // this.$router.push({ path: this.$route.path + '/' + row.id, query: { id:this.gzkj,gzlid: row.id, name: row.name }})
      this.$router.push({ name: 'job', params: row, meta: row, query: { id: this.gzkj, jobid: row.id }})
    },
    switchChange(row) {
      this.temp = {
        id: row.id,
        description: row.description,
        auto: row.auto,
        enable: row.enable,
        // end_at: row.end_at === 4956336000000 ? 1611804847000 : row.end_at, // 没有选择停止则反2028年
        end_at: row.end_at,

        members: row.members.map(value => { return value.user.id }),
        name: row.name,
        notify_all: row.notify_all,
        start_at: row.start_at,
        unit: row.unit,
        value: row.value,
        workfile_versions: row.workfile_versions
      }

      var workfile_versions = []
      row.workfile_versions.forEach(element => {
        // workfile_engines.push(0)
        workfile_versions.push(element.id)
      })
      // this.temp.workfile_engines = workfile_engines
      this.temp.workfile_versions = workfile_versions
      updateJobs(this.gzkj, this.temp).then(() => {
        // this.loading = false
        // this.$message.success('更新成功')
        this.getList()
      }).catch(e => {
        // this.loading = false
      })
    },

    updateData() {
      this.temp.end_at = this.end_at.getTime ? this.end_at.getTime() : this.end_at
      if (!this.checked) {
        this.temp.end_at = 4956336000000
      }

      this.loading = true
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateJobs(this.gzkj, this.temp).then(() => {
            // const index = this.list.findIndex(v => v.id === this.temp.id)
            // this.list.splice(index, 1, this.temp)
            this.loading = false

            this.dialogFormVisible = false

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
        deleteJobs(this.gzkj, row).then(() => {
          const index = this.list.findIndex(v => v.id === this.temp.id)
          this.list.splice(index, 1, this.temp)
          this.dialogFormVisible = false

          this.$message.success('删除成功')
          this.getList()
        }).catch(e => {
          this.$message('操作调用失败')
          this.dialogFormVisible = false
        })
      }).catch(e =>{
          this.$message('取消删除')
          this.dialogFormVisible = false
          this.$refs.searchKey.focus()
          this.$refs.searchKey.blur()
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
