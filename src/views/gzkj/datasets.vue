<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        ref="searchKey"
        v-model="keyword"
        placeholder="搜索"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <div style="float: right">
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          @click="handleDelete"
        > <i class="iconfont icon-duankailianjie"></i>
          解除分发
        </el-button>
        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          @click="handleUpdate"
        ><i class="iconfont icon-lianjie"/>
          分发我的数据
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
    </div>

    <el-table
      ref="DatasetsTable"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @row-click="rowDatasetsClick"
      @selection-change="handleDatasetsSelectionChange"
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

      <el-table-column label="名称" align="left">
        <!-- <template slot-scope="{ row }">
          <span>{{ row.dataset.name }}</span>
        </template> -->
        <template slot-scope="{ row }"><span style="cursor: pointer" @click="inDir(row,$event)"><i :class="typeIcon(row)" style="margin-right: 10px" />{{ row.dataset.name }}</span></template>
      </el-table-column>
      <!-- <el-table-column label="路径" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.dataset.path }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="创建者" width="160px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.dataset.owner.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" width="160px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.dataset.size| formatSize }}</span>
        </template>
      </el-table-column>

      <el-table-column label="最后修改时间" width="180px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.updated_at | formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="left"
        width="160"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <!-- <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            解除分发
          </el-button> -->
          <el-tooltip class="item" content="解除分发" placement="top">
            <!-- <i class="el-icon-paperclip icon_button" @click="deleteData(row, $event)" /> -->
            <span v-if="row.type!=='DIR'" style="display:inline-block;width:40px"><i class="iconfont icon-duankailianjie" style="margin-left: 20px;cursor: pointer" @click.stop="deleteData(row, $event)"/></span>
          </el-tooltip>
          <el-tooltip content="预览" placement="bottom">
            <span v-if="row.dataset.view_status==='READY'" style="display:inline-block;width:40px"><i class="iconfont icon-yulan" style="margin-left: 20px;cursor: pointer" @click.stop="view(row,$event)"/></span>
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

    <el-dialog :close-on-click-modal="false" title="分发我的数据集" :visible.sync="dialogFormVisible" width="70%">
      <div><i class="iconfont icon-wenjianjia" style="margin-right: 10px;cursor: pointer" @click="rootClick" />/
        <span v-for="(item,index) in dirList" :key="item.id" style="cursor: pointer" @click="dirClick(index)"> {{ item.name }} /</span>
      </div>
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="list_gxsj"
        :height="maxHeight"
        tooltip-effect="dark"
        style="width: 100%;margin-top: 20px"
        @row-click="rowClick"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          label="名称"
        >
          <template slot-scope="{ row }"><span style="cursor: pointer" @click="inDir(row,$event)"><i :class="typeIconDialog(row)" style="margin-right: 10px" />{{ row.name }}</span></template>

          <!-- <template slot-scope="scope"><span style="cursor: pointer" @click="inDir(scope.row,$event)"><i :class="typeIcon(scope.row)" style="margin-right: 10px" />{{ scope.row.name }}</span></template> -->
        </el-table-column>
        <el-table-column
          label="时间"
        >
          <template slot-scope="scope">{{ $dayjs(scope.row.created_at).format('YYYY-MM-DD HH:mm:ss') }}</template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="350"
        >
          <template slot-scope="scope">
            <div>
              <!-- <el-tooltip content="移动" placement="bottom">
                <i class="iconfont icon-caozuojiemiantubiao--_yidong" style="cursor: pointer" />
              </el-tooltip>
              <el-tooltip content="重命名" placement="bottom">
                <i class="el-icon-edit" style="margin-left: 20px;cursor: pointer" />
              </el-tooltip>
              <el-tooltip content="分发" placement="bottom">
                <i v-if="scope.row.type!=='DIR'" class="iconfont icon-lianjie" style="margin-left: 20px;cursor: pointer" />
              </el-tooltip>
              <el-tooltip content="解除分发" placement="bottom">
                <i v-if="scope.row.type!=='DIR'" class="iconfont icon-duankailianjie" style="margin-left: 20px;cursor: pointer" />
              </el-tooltip>
              <el-tooltip content="删除" placement="bottom">
                <i class="el-icon-delete" style="margin-left: 20px;cursor: pointer" @click="deleteOne(scope.row,$event)" />
              </el-tooltip>
              <el-tooltip content="分配" placement="bottom">
                <i v-if="scope.row.type!=='DIR'" class="iconfont icon-renwufenpei" style="margin-left: 20px;cursor: pointer" />
              </el-tooltip> -->
              <el-tooltip content="预览" placement="bottom">
                <i v-if="scope.row.view_status==='READY'" class="iconfont icon-yulan" style="margin-left: 20px;cursor: pointer" @click="view(scope.row,$event)" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="数据预览"
      :visible.sync="dialogVisible4"
      width="90%"
      top="50px"
      :close-on-click-modal="false"
      @close="dialogVisible4=false"
    >
      <div>
        <div style="margin-bottom: 10px">
          行:{{ numRow }} <span style="padding-left: 20px">列:{{ numCol }}</span>
        </div>
        <el-row class="view-box" :style="{height:movemaxHeight+120+'px'}">
          <el-col :span="16" style="border-right: 1px solid #b8b8b8;height: 100%;overflow-y: auto">
            <div :style="{ 'column-count': headers.length,'-webkit-column-count':headers.length,'-moz-column-count':headers.length}" class="view-header">
              <div v-for="(item,index) in headers" :key="index" class="header-item" @click="viewClick(index)">{{ item.name }}</div>
            </div>
            <div :style="{ 'column-count': headers.length,'-webkit-column-count':headers.length,'-moz-column-count':headers.length}">
              <div v-for="(item,index) in headers" :id="'echart'+index" :key="index" style="height: 80px;width: 100%;cursor: pointer" @click="viewClick(index)" />
            </div>
            <div v-for="(item,index) in viewRows" :key="index" :style="{ 'column-count': headers.length,'-webkit-column-count':headers.length,'-moz-column-count':headers.length}">
              <div v-for="(it,ind) in item" :key="ind" class="row-item">{{ it }}</div>
            </div>
          </el-col>
          <el-col :span="8" style="height: 100%;overflow-y: auto">
            <div style="line-height:40px;padding-left: 10px;font-weight: 700" class="view-header">
              统计
            </div>
            <div style="line-height: 30px;padding-left: 10px">
              列名: {{ viewDetail.info?viewDetail.info.colName:"" }}
              <span style="padding-left: 10px">类型: {{ viewDetail.info?viewDetail.info.type:'' }}</span>
              <span style="padding-left: 10px">索引: {{ viewDetail.info?viewDetail.info.index:'' }}</span>
            </div>
            <div :style="{ 'column-count': viewStatics.headers.length,'-webkit-column-count':viewStatics.headers.length,'-moz-column-count':viewStatics.headers.length}" style="text-align: center;line-height: 30px;font-weight: 700">
              <div v-for="(item,index) in viewStatics.headers" :key="index">{{ item.name }}</div>
            </div>
            <div v-for="(item,index) in viewStatics.rows" :key="index" :style="{ 'column-count': viewStatics.headers.length,'-webkit-column-count':viewStatics.headers.length,'-moz-column-count':viewStatics.headers.length}" style="text-align: center;line-height: 30px">
              <div v-for="(it,ind) in item" :key="ind">{{ it }}</div>
            </div>
            <div style="line-height:40px;padding-left: 10px;font-weight: 700" class="view-header">
              可视化
            </div>
            <div>
              <div style="padding-left: 10px;line-height: 30px">
                {{ viewDetail.info?viewDetail.info.colName:'' }}
              </div>
              <div style="text-align: center;margin-top: 10px">
                <el-radio-group v-model="viewRadio" @change="changeView">
                  <el-radio label="zzt"><i class="iconfont icon-tubiaozhuzhuangtu" /></el-radio>
                  <el-radio label="bzt"><i class="iconfont icon-bingzhuangtu" /></el-radio>
                  <el-radio label="zxt"><i class="iconfont icon-jurassic_broken-line" /></el-radio>
                </el-radio-group>
              </div>
              <div id="echartV" style="height: 300px;width: 100%" />
            </div>
          </el-col>
        </el-row>
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
  </div>
</template>
<script>
import echarts from 'echarts'
import { getDatasets, getChildren, getChildrenExclude, getGZKJDatasetsList, deleteGZKJDatasets, updateGZKJDatasets, getGZKJSearch } from '@/api/gzkj'
import { createF, deleteData, rename, getDataShare, getView, search } from '@/api/dataManage.js'
// import { getDatasets, createF, getChildren, deleteData } from '@/api/dataManage.js'
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
    },
    formatSize(size) {
      if (size < 1024) {
        return size + 'B'
      } else if (size >= 1024 && size < 1048576) {
        return (size / 1024).toFixed(2) + 'KB'
      } else if (size >= 1048576) {
        return (size / 1048576).toFixed(2) + 'M'
      }
    }
  },
  data() {
    return {
      movemaxHeight: 500,
      viewData: {},
      numRow: 0,
      numCol: 0,
      headers: [],
      viewRows: [],
      viewDetail: {},
      viewStatics: {
        headers: [],
        rows: []
      },
      viewRadio: '',
      dialogVisible4: false,
      keyword: '',
      gzkj: undefined,
      selectDatasetsRows: [],
      selectRows: [], // 弹出框
      loading: false,
      maxHeight: 500,
      dirList: [],
      root: '',
      list_gxsj: [],
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
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' }
      ],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        remark: ''
        // importance: 1,
        // remark: '',
        // timestamp: new Date(),
        // title: '',
        // type: '',
        // status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
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
        ]
      },
      downloadLoading: false,
      curPageNum:0,
    }
  },
  created() {
    this.gzkj = this.$route.query.id
    this.listQuery.id = this.$route.query.id
    this.getList()
  },
  methods: {
    resize() {
      // this.maxHeight = document.body.offsetHeight - 200
      this.movemaxHeight = document.body.offsetHeight - 350
    },
    rowDatasetsClick(row) {
      this.$refs.DatasetsTable.toggleRowSelection(row)
    },
    handleDatasetsSelectionChange(val) {
      this.selectDatasetsRows = val
    },
    getGXSJList() {
      if (this.dirList.length) {
        this.getChildren(this.dirList[this.dirList.length - 1].id)
      } else {
        this.getDatasets()
      }
    },
    rowClick(row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    handleSelectionChange(val) {
      this.selectRows = val
    },
    typeIcon(row) {
      if (row.dataset.data_type === 'DIR') {
        return 'iconfont icon-wenjianjia'
      } else if (row.dataset.type === 'FILE') {
        if (row.dataset.data_type === 'REMOTE_DB_TABLE') {
          return 'iconfont icon-biaoge'
        } else {
          return 'iconfont icon-wendang'
        }
      }
      // if (row.type === 'DIR') {
      //   return 'iconfont icon-wenjianjia'
      // } else if (row.type === 'FILE') {
      //   if (row.data_type === 'REMOTE_DB_TABLE') {
      //     return 'iconfont icon-biaoge'
      //   } else {
      //     return 'iconfont icon-wendang'
      //   }
      // }
    },
    typeIconDialog(row) {
      if (row.type === 'DIR') {
        return 'iconfont icon-wenjianjia'
      } else if (row.type === 'FILE') {
        if (row.data_type === 'REMOTE_DB_TABLE') {
          return 'iconfont icon-biaoge'
        } else {
          return 'iconfont icon-wendang'
        }
      }
    },
    inDir(row, event) {
      event.stopPropagation()
      if (row.type === 'DIR') {
        this.dirList.push(row)
        this.getChildren(row.id)
      }
    },
    dirClick(index) {
      this.dirList.splice(index + 1, 1)
      this.getChildren(this.dirList[index].id)
    },
    rootClick() {
      this.dirList = []
      this.getDatasets()
    },
    getDatasets() {
      this.loading = true
      // this.selectRows = []
      getDatasets().then(data => {
        this.loading = false
        if (data.code === 200) {
          this.root = data.response.content
          // ddd getChildren
          
          getChildrenExclude(this.root.id,{'workSpaceId':parseInt(this.gzkj)}).then(d => {
          // getChildren(this.root.id).then(d => {
            this.loading = false
            if (d.code === 200) {
              var dir = []; var other = []
              d.response.content.map(value => {
                if (value.type === 'DIR') {
                  dir.push(value)
                } else {
                  other.push(value)
                }
              })
              dir.sort(function(a, b) {
                return a.created_at < b.created_at ? 1 : -1
              })
              other.sort(function(a, b) {
                return a.created_at < b.created_at ? 1 : -1
              })
              this.list_gxsj = [...dir, ...other]
            }
          }).catch(() => {
            this.loading = false
          })
        }
      }).catch(() => {
        this.loading = false
      })
    },
    getChildren(id) {
      this.loading = true
       // ddd  getChildren
      getChildrenExclude(id,{'workSpaceId':parseInt(this.gzkj)}).then(d => {
      // getChildren(id).then(d => {
        this.loading = false
        if (d.code === 200) {
          var dir = []; var other = []
          d.response.content.map(value => {
            if (value.type === 'DIR') {
              dir.push(value)
            } else {
              other.push(value)
            }
          })
          dir.sort(function(a, b) {
            return a.created_at < b.created_at ? 1 : -1
          })
          other.sort(function(a, b) {
            return a.created_at < b.created_at ? 1 : -1
          })
          this.list_gxsj = [...dir, ...other]
        }
      }).catch(() => {
        this.loading = false
      })
    },

    getList() {
      // page,per_page
      // var _this=this;
      this.listLoading = true
      getGZKJDatasetsList(this.listQuery).then(response => {
        this.list = response.response.content
        this.total = response.response.pagination.records
        this.curPageNum=response.response.content.length


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
        type: 'DataSetLink',
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
    // sortByID(order) {
    //   if (order === 'ascending') {
    //     this.listQuery.sort = '+id'
    //   } else {
    //     this.listQuery.sort = '-id'
    //   }
    //   this.handleFilter()
    // },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.loading = false
      this.getGXSJList()
    },
    updateData() {
      if (this.selectRows.length === 0) {
        this.$message.warning('未选择可解除分发的数据集')
        return
      }
      this.loading = true
      var items = this.selectRows
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        var param = {
          'dataset_id': item.id
        }
        updateGZKJDatasets(this.gzkj, param).then(() => {
          this.loading = false
          this.dialogFormVisible = false
          if (i === items.length - 1) {
            this.$message.success('关联数据成功')
            this.getList()
          }
        }).catch(e => {
          this.$message('操作调用失败')
        })
      }
    },
    handleDelete() {
      var _this = this
      if (this.selectDatasetsRows.length === 0) {
        this.$message.warning('未选择可解除分发的数据集')
        return
      }
      this.$confirm('确定解除分发?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var items = this.selectDatasetsRows
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          deleteGZKJDatasets(this.gzkj, item.id).then((response) => {
            if(response.code==200){
              this.dialogFormVisible = false
            
              if (i === items.length - 1) {
                if( this.curPageNum==items.length){
                  this.listQuery.page= this.listQuery.page>1?this.listQuery.page-1:1
                }
                _this.$message.success('解除分发数据集成功')
                _this.getList()
              }
            }else{
              this.$message(response.message)
            }
           
          }).finally(function(data) {
            // _this.$message.success('解除分发数据集成功')
            // _this.getList()
          }).catch(e => {
            this.$message('调用接口失败')
          })
        }
      }).finally(function(data) {

      })
        .catch(e => {
          this.$message('取消解除分发')
          this.getList()
        })
    },
    deleteData(row, event) {
      var _this = this
      event.stopPropagation()
      this.selectDatasetsRows = [row]
      if (this.selectDatasetsRows.length === 0) {
        this.$message.warning('未选择可解除分发的数据集')
        return
      }
      this.$confirm('确定解除分发?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var items = this.selectDatasetsRows
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          deleteGZKJDatasets(this.gzkj, item.id).then((response) => {
            if(response.code==200){
              this.dialogFormVisible = false
              if (i === items.length - 1) {
                if( this.curPageNum==items.length){
                  this.listQuery.page= this.listQuery.page>1?this.listQuery.page-1:1
                }
                _this.$message.success('解除分发数据集成功')
                _this.getList()
              }
            }else{
              this.$message(response.message)
            }
          }).finally(function(data) {
            // _this.$message.success('解除分发数据集成功')
            // _this.getList()
          }).catch(e => {
            this.$message('调用接口失败')
          })
        }
      }).finally(function(data) {
      }).catch(e => {
        this.$message('取消解除分发')
        this.getList()
      })
    },

    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    view(row, event) {
      event.stopPropagation()
      this.dialogVisible4 = true
      this.viewRows = []
      this.viewDetail = {}
      this.viewStatics = {
        headers: [],
        rows: []
      }
      this.getView(row.dataset ? row.dataset.id : row.id)
    },
    getView(id) {
      getView(id).then(data => {
        if (data.code === 200) {
          if (data.response.content.view == undefined) { return }
          this.viewData = JSON.parse(data.response.content.view.content)
          this.numRow = this.viewData.Data.info.numOfRow
          this.numCol = this.viewData.Data.info.numOfColumn
          this.headers = this.viewData.Data.headers
          this.viewRows = this.viewData.Data.rows
          console.log(this.viewData)
          setTimeout(() => {
            this.viewData.Visualizations.map((value, index) => {
              var myChart = echarts.init(document.getElementById('echart' + index))
              var xData = []; var yData = []
              value.points.map(val => {
                xData.push(val.x1)
                yData.push(val.y)
              })
              var option = {
                xAxis: {
                  type: 'category',
                  data: xData,
                  show: false,
                  axisTick: {
                    show: false
                  },
                  axisLine: {
                    show: false
                  }
                },
                yAxis: {
                  type: 'value',
                  show: false
                },
                series: [{
                  data: yData,
                  type: 'bar',
                  itemStyle: {
                    normal: {
                      color: '#1890FF'
                    }
                  }
                }]
              }
              myChart.setOption(option, true)
            })
          })
        }
      })
    },

    viewClick(index) {
      this.viewDetail = this.viewData.Visualizations[index]
      this.viewStatics = this.viewData.Statics[index]
      this.viewRadio = 'zzt'
      var myChart = echarts.init(document.getElementById('echartV'))
      var x1 = []; var yData = []
      this.viewDetail.points.map(value => {
        if (value.x2 !== null) {
          x1.push(value.x1 + '-' + value.x2)
        } else {
          x1.push(value.x1)
        }
        yData.push(value.y)
      })
      var option = {
        xAxis: [
          {
            type: 'category',
            data: x1
          }
        ],
        yAxis: {
          type: 'value'
        },
        series: [{
          data: yData,
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#1890FF'
            }
          }
        }]
      }
      myChart.setOption(option, true)
    },

    changeView(label) {
      var myChart = echarts.init(document.getElementById('echartV'))
      var x1 = []; var yData = []; var option
      if(!this.viewDetail.points) return
      if (label === 'zzt') {
        this.viewDetail.points.map(value => {
          if (value.x2 !== null) {
            x1.push(value.x1 + '-' + value.x2)
          } else {
            x1.push(value.x1)
          }
          yData.push(value.y)
        })
        option = {
          xAxis: [
            {
              type: 'category',
              data: x1
            }
          ],
          yAxis: {
            type: 'value'
          },
          series: [{
            data: yData,
            type: 'bar',
            itemStyle: {
              normal: {
                color: '#1890FF'
              }
            }
          }]
        }
      }
      if (label === 'bzt') {
        var data = []
        this.viewDetail.points.map(value => {
          var name = ''
          if (value.x2 !== null) {
            name = value.x1 + '-' + value.x2
          } else {
            name = value.x1
          }
          data.push({
            name,
            value: value.y
          })
        })
        option = {
          legend: {
            top: 'bottom'
          },
          series: [
            {
              type: 'pie',
              radius: [20, '70%'],
              center: ['50%', '50%'],
              roseType: 'area',
              itemStyle: {
                borderRadius: 8
              },
              data: data
            }
          ]
        }
      }
      if (label === 'zxt') {
        this.viewDetail.points.map(value => {
          if (value.x2 !== null) {
            x1.push(value.x1 + '-' + value.x2)
          } else {
            x1.push(value.x1)
          }
          yData.push(value.y)
        })
        option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: x1
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: yData,
            type: 'line',
            smooth: true,
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#1890FF'
                }
              }
            }
          }]
        }
      }
      myChart.setOption(option, true)
    }
  }
}
</script>
<style scoped>
.view-box{
  border: 1px solid #b8b8b8;
  overflow: hidden;
}
.view-header{
  border-bottom: 1px solid #b8b8b8;
}
.header-item{
  line-height: 40px;
  cursor: pointer;
  padding-left: 10px;
}
.row-item{
  line-height: 30px;
  padding-left: 10px;
}
</style>
