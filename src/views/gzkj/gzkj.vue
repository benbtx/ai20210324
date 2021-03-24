<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        ref="searchKey"
        v-model="listQuery.text"
        placeholder="搜索项目名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <!-- <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button> -->
      <el-button
        class="filter-item"
        style="margin-left: 10px;float:right"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        添加
      </el-button>
      <!-- <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        导出
      </el-button> -->
    </div>

    <el-table
      :key="tableKey"
      v-loading="loading"
      :data="list"

      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
      @row-click="rowClick"
    >
      <!-- <el-table-column
        label="序号"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column> -->
      <el-table-column
        type="selection"
        width="55"
      />

      <el-table-column label="名称" width="180px" align="left">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleWorkfiles(row)">
            <i class="el-icon-folder" style="margin-right: 10px" />
            {{ row.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="拥有者" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.owner.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据集" min-width="120px">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleDatasets(row)">{{
            row.datasets_count
          }}</span>
          <!-- <el-tag>{{ row.type | typeFilter }}</el-tag> -->
        </template>
      </el-table-column>
      <el-table-column label="数据挖掘分析" min-width="120px">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleWorkfiles(row)">{{
            row.workfiles_count
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务" min-width="120px">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleJobs(row)">{{
            row.job_model_count
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模型" min-width="120px">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleModels(row)">{{
            row.model_count
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务" min-width="120px">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleService(row)">{{
            row.model_server_count
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后修改时间" width="180px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.updated_at | formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="280"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <!-- <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="primary" size="mini" @click="handleUsers(row)">
            编辑成员
          </el-button>
          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            删除
          </el-button> -->

          <!-- <i class="el-icon-edit icon_button" title="重命名" @click="handleUpdate(row)"></i>
          <i class="el-icon-user icon_button" title="编辑成员" @click="handleUsers(row)"></i>
          <i class="el-icon-delete icon_button" title="删除" @click="handleDelete(row, $index)"></i> -->
          <el-tooltip v-if="row.canOperating" class="item" content="编辑" placement="top">
            <i class="el-icon-edit icon_button" @click.stop="handleUpdate(row)" />
          </el-tooltip>
          <el-tooltip v-if="row.canOperating" class="item" content="授权" placement="top">
            <i class="el-icon-user icon_button" @click.stop="handleUsers(row)" />
          </el-tooltip>
          <el-tooltip v-if="row.canOperating" class="item" content="删除" placement="top">
            <i class="el-icon-delete icon_button" @click.stop="handleDelete(row, $index)" />
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

    <el-dialog :close-on-click-modal="false" :title="dialogStatus === 'create' ? '新增工作项目' : dialogStatus === 'update' ? '修改工作项目' : '工作项目授权'" :visible.sync="dialogFormVisible" width="50%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="margin-left:50px;margin-right:50px;"
      >
        <el-form-item v-show="dialogStatus != 'updateUsers'" label="名称" prop="name">
          <el-input v-model.trim="temp.name" />
        </el-form-item>
        <el-form-item v-show="dialogStatus == 'update'" label="拥有者" prop="name">
          <el-select v-model="owner_id" class="yyz" placeholder="请选择">
            <el-option
              v-for="item in member"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-show="dialogStatus != 'updateUsers'" label="备注">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="请输入"
          />
        </el-form-item>
        <!-- <el-form-item v-show="dialogStatus == 'updateUsers'" label="成员">
            <el-select
              v-model="ryidvalue"
              multiple
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteMethod"
              :loading="loading">
              <el-option
                v-for="item in ryLeftValue"
                :key="item.id"
                :label="item.email"
                :value="item.id">
              </el-option>
            </el-select>
        </el-form-item> -->
        <div v-show="dialogStatus == 'updateUsers'" style="height:450px;display:flex;overflow:auto">
          <div style="width:46%">
            <div>
              <el-input v-model="keyword" placeholder="模糊查询用户姓名邮箱电话" @keyup.enter.native="searchUser" />
            </div>
            <div v-if="ryLeftValue.length==0" class="user">
              暂无数据
            </div>
            <div v-for="item in ryLeftValue" v-else :key="item.id" style="" class="user">
              {{ item.username+"   "+item.email }}
              <span style="float:right">
                <i class="el-icon-arrow-right icon_button" @click.stop="handlePlus(item)" />
              </span>
            </div>
          </div>
          <div style="width:48%">
            <div style="margin-left:20px;height:40px">
              <!-- <el-input v-model="temp.name" /> -->
              列表：
            </div>
            <div v-for="(item) in ryValue" :key="item.id" style="margin-left:10px" class="user">
              {{ item.username+"   "+item.email }}
              <!-- <span v-if="item.admin" style="float:right">拥有者</span> -->
              <span v-if="item.id==temp.owner_id" style="float:right">拥有者</span>
              <span v-else style="float:right">
                <i class="el-icon-minus icon_button" @click.stop="handleMinus(item)" />
              </span>
            </div>
          </div>
          <!-- <div  v-for="item in ryLeftValue" :key='item.id'  class="user">
               {{item.email}}
          </div> -->
          <!-- <el-checkbox-group v-model="ryidvalue" >
            <el-checkbox v-for="ry in ryLeftValue" :label="ry.id" :key="ry.id">{{ry.email+"    ("+ry.username+")"}}</el-checkbox>
          </el-checkbox-group> -->
        </div>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="dialogStatus === 'create' ? createData() : dialogStatus === 'update' ? updateData() : updateMembers()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{
          $t("table.confirm")
        }}</el-button>
      </span>
    </el-dialog>
    <el-drawer
      class="mydrawer"
      title="我是标题"
      size="250px"
      style="overflow:auto"
      :visible.sync="drawer"
      :with-header="false"
    >

      <div style="margin-left:20px;margin-top:20px">
        <div>项目成员</div>
        <el-divider />
        <!-- email  username -->
        <div v-for="item in member" :key="item.id">
          {{ item.email }}
        </div>
        <el-divider />
        <div>操作记录</div>
        <el-divider />
        <div v-for="item in activity" :key="item.id">
          {{ item.user.username }}
          <el-divider />
        </div>
        <el-button
          v-if="currActivityCount!=0"
          v-waves
          class="filter-item"
          type="primary"
          @click="getMore"
        >
          加载更多
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>
<script>
// import { getXMGLList, addXMGL, deleteXMGL, etchPv, createArticle, updateArticle } from '@/api/xmgl' // getUserList
import { getGZKJList, addGZKJ, updateGZKJ, deleteGZKJ, getMembers, getActivities, addMembers, getUserList,getReportServerInfo } from '@/api/gzkj'
// import { getUserList, addUser, deleteUser, validityUsers, getUserListBySearch, updateUsers, resetpwd } from '@/api/userManage.js'
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
    var validateName = (rule, value, callback) => {
      if (value.indexOf(' ')>-1) {
        callback(new Error('名称不能包含空格'));
      }
    };
    return {
      // loading:false,
      tableKey: 0,
      list: null,
      total: 0,
      loading: true,
      listQuery: {
        // page: 1,
        // limit: 10,
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
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' }
      ],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      owner_id: undefined,
      temp: {
        id: undefined,
        name: '',
        description: '',
        userid: '', // 所有者
        username: '', // 所有者
        archived: false
      },
      dialogFormVisible: false,
      dialogStatus: '',
      drawer: false,
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
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
          // { validator: validateName, trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      activities: {
        page: 1,
        per_page: 10,
        entity_type: undefined,
        entity_id: undefined
      },
      memberParam: {
        id: undefined,
        page: 1,
        per_page: 10
      },
      member: [],
      activity: [],
      currActivityCount: 0,
      email: '',
      emails: undefined,
      ryLeftValue: [], // 左侧授权模糊查询返回结果
      ryidvalue: [], // 右侧工作项目成员
      ryValue: [], // 右侧
      keyword: '',
      curPageNum:0,
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handlePlus(item) {
      // 列表
      this.ryLeftValue = this.ryLeftValue.filter(value => {
        if (value.id !== item.id) { return value }
      })
      this.ryValue.push(item)
      var obj = {}
      this.ryValue = this.ryValue.reduce(function(item, next) {
        obj[next.id] ? '' : obj[next.id] = true && item.push(next)
        return item
      }, [])

      // 人员id
      this.ryidvalue.push(item.id)
      this.ryidvalue = [...new Set(this.ryidvalue)]
    },
    handleMinus(item) {
      // 列表
      this.ryValue = this.ryValue.filter(value => {
        if (value.id !== item.id) { return value }
      })
      this.ryLeftValue.push(item)
      var obj = {}
      this.ryLeftValue = this.ryLeftValue.reduce(function(item, next) {
        obj[next.id] ? '' : obj[next.id] = true && item.push(next)
        return item
      }, [])

      // 人员id
      this.ryidvalue = this.ryidvalue.filter(value => {
        if (value !== item.id) { return value }
      })
    },
    getUserList() {
      var params = {
        page: 1,
        per_page: 10000,
        // filter: '',
        keyword: this.keyword,
        ws_id: this.temp.id,
      }
      getUserList(params).then(data => {
        if (data.code === 200) {
          this.ryLeftValue = data.response.content
          //  this.getMembersList()
        } else {
          this.$message(data.message)
          this.dialogFormVisible = false
          this.loading = false
        }
      }).catch(() => {
        this.tableData = []
        this.total = 0
        this.$message('操作调用失败')
        this.dialogFormVisible = false
        this.loading = false
      })
    },

    searchUser() {
      this.getUserList()
    },
    getMore() {
      this.activities.page++
      this.getActivitiesList()
    },
    // getAuthorizationUsers(){
    //   let data={email:this.email}
    //   getGZKJUsers(data).then((response) => {
    //     // this.dialogFormVisible = false
    //     this.emails=response.response.content.email;

    //   })
    // },
    getActivitiesList() {
      const _this = this
      getActivities(this.activities).then((response) => {
        this.dialogFormVisible = false
        this.currActivityCount = response.response.content.length
        _this.activity = _this.activity.concat(response.response.content)
      })
    },
    getMembersList() {
      var _this = this
      getMembers(this.memberParam).then((response) => {
        // this.dialogFormVisible = false
        _this.member = response.response.content
        _this.ryValue = []
        _this.ryidvalue = []
        if (_this.dialogStatus === 'updateUsers') {
          for (let i = 0; i < response.response.content.length; i++) {
            _this.ryidvalue.push(response.response.content[i].id)
            _this.ryValue.push(response.response.content[i])
          }
        }
        if (_this.dialogStatus === 'update') {
          _this.owner_id = _this.temp.owner.id// 默认拥有者
        }
      })
    },
    handleSelectionChange(val) {
      // console.log("22:"+val)
    },
    rowClick(row) {
      console.log(row)
      // this.memberParam.id=row.id;
      // this.activities.entity_type='workspace',
      // this.activities.entity_id=row.id;
      // this.drawer=true;
      // this.activity=[];
      // this.member=[];
      // this.getActivitiesList();
      // this.getMembersList();
    },
    getList() {
      this.loading = true

      getGZKJList(this.listQuery).then(response => {
        this.list = response.response.content
        this.total = response.response.pagination.records
        this.curPageNum=response.response.content.length
        // Just to simulate the time of the request
        setTimeout(() => {
          this.loading = false
        }, 0.1 * 1000)
      })
    },
    getListPagination(param) {
      this.listQuery.page = param.page
      this.listQuery.per_page = param.per_page
      this.getList()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
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
        name: '',
        description: '',
        userid: '', // 所有者
        username: '', // 所有者
        archived: false
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.loading = true
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          var para = {
            archived: false,
            description: this.temp.description,
            // owner_id:this.value,
            name: this.temp.name
          }
          addGZKJ(para).then((response) => {
            // this.list.unshift(this.temp)
            this.loading = false
            if(response.code==200){
              this.$message.success('创建成功')
              this.dialogFormVisible = false
              this.getList()
            }else{
              this.$message.error(response.message)
            }
          }).catch(e => {
            this.$message('操作调用失败')
            this.dialogFormVisible = false
            this.loading = false
          })
        } else {
          this.loading = false
        }
      })
    },
    handleUsers(row) {
      this.memberParam.id = row.id
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.temp.owner_id = row.owner.id// 默认拥有者
      this.dialogStatus = 'updateUsers'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.ryidvalue = []
      this.ryLeftValue = []
      this.ryValue = []
      this.keyword = ''
      // this.getUserList()
      this.getMembersList()
      // Promise.all([promise1, promise2, promise3]).then((values) => {
      //   console.log(values);
      // });
    },
    handleUpdate(row) {
      this.memberParam.id = row.id
      this.temp = Object.assign(this.temp, row) // copy obj
      this.getMembersList()
      this.temp.name = row.name
      this.temp.id = row.id
      this.temp.description = row.description

      this.temp.owner_id = row.owner.id// 默认拥有者

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })

      // return
    },
    handleDatasets(row) {
      this.$router.push({ path: '/gzkj/' + row.id + '/datasets', query: { id: row.id }})
      this.getReportConfig(row.id);
    },
    handleWorkfiles(row) {
      this.$router.push({ path: '/gzkj/' + row.id + '/workfiles', query: { id: row.id }})
      this.getReportConfig(row.id);
    },
    handleJobs(row) {
      this.$router.push({ path: '/gzkj/' + row.id + '/jobs', query: { id: row.id }})
      this.getReportConfig(row.id);
    },
    handleModels(row) {
      this.$router.push({ path: '/gzkj/' + row.id + '/models', query: { id: row.id }})
      this.getReportConfig(row.id);
    },
    handleService(row) {
      this.$router.push({ path: '/gzkj/' + row.id + '/exports', query: { id: row.id }})
      this.getReportConfig(row.id);
    },
    getReportConfig(id){
      var data={
        "wsId":parseInt(id),
      }
      getReportServerInfo(data).then(response => {
        localStorage.setItem('webUrl',response.response.content.webUrl)
        localStorage.setItem('projectId',response.response.content.projectId)
      }).catch(e => {
        // this.$message('获取报表配置接口出错')
        console.log('获取报表配置接口出错')
      })
    },

    updateData() {
      this.loading = true
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          var para = {
            archived: false,
            description: this.temp.description,
            owner_id: this.owner_id,
            name: this.temp.name
            // id:this.temp.id
          }
          updateGZKJ(this.temp.id, para).then((response) => {
            this.loading = false
            this.dialogFormVisible = false
            // this.$notify({
            //   title: '成功',
            //   message: '更新成功',
            //   type: 'success',
            //   duration: 2000
            // })
            if(response.code==200){
              this.$message.success('更新成功')
              this.getList()
            }else{
              this.$message.error(response.message)
            }
            
          }).catch(e => {
            this.$message('操作调用失败')
            this.dialogFormVisible = false
            this.loading = false
          })
        } else {
          this.loading = false
        }
      })
    },
    updateMembers() {
      this.loading = true
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          var data = {
            collection: {},
            member_ids: this.ryidvalue
          }
          addMembers(this.memberParam.id, data).then((response) => {
            this.loading = false
            this.dialogFormVisible = false
            // this.$notify({
            //   title: '成功',
            //   message: '更新成功',
            //   type: 'success',
            //   duration: 2000
            // })
            if(response.code==200){
              this.$message.success('更新成功')
            }else{
              this.$message.error(response.message)
            }
          }).catch(e => {
            this.$message('操作调用失败')
            this.dialogFormVisible = false
            this.loading = false
          })
        } else {
          this.loading = false
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteGZKJ(row.id).then((response) => {
          const index = this.list.findIndex(v => v.id === this.temp.id)
          this.list.splice(index, 1, this.temp)
          this.dialogFormVisible = false
          // this.$notify({
          //   title: '成功',
          //   message: '删除成功',
          //   type: 'success',
          //   duration: 2000
          // })
          if(response.code==200){
            this.$message.success('删除成功')
            if( this.curPageNum==1){
              this.listQuery.page= this.listQuery.page>1?this.listQuery.page-1:1
            }
            this.getList()
          }else{
            this.$message.error(response.message)
          }
          
        }).catch(e => {
          this.$message('操作调用失败')
          this.dialogFormVisible = false
          this.loading = false
        })
      }).catch(e =>{
          this.$message('取消删除')
          this.dialogFormVisible = false
          this.loading = false
          this.$refs.searchKey.focus()
          this.$refs.searchKey.blur()
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
<style lang="scss" scoped>
.mydrawer   ::v-deep  .el-drawer__body{
  overflow: auto;
}
.yyz{
  width: 100%;
}
.user{
  margin-top: 20px;
  align-items: center;
  padding: 10px 5px;
  border: 1px solid #f4f6f8;
  background: #fff;
  font-size: .85rem;
  min-height: 50px;
}
</style>
<style  scoped>
/* .mydrawer  >>> .el-drawer__body{
  overflow: auto;
} */
</style>

