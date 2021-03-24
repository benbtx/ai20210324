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
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          icon="el-icon-plus"
          @click="handleCreate"
        >
          添加
        </el-button>
        <el-button
          v-waves
          :loading="downloadLoading"
          class="filter-item"
          type="primary"
          icon="el-icon-upload2"
          @click="handleDownload"
        >
          导出
        </el-button>
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-download"
          @click="handleUpload"
        >
          导入
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
      <el-table-column label="名称" align="left">
        <!-- <template slot-scope="{ row }">
          <span class="link-type" @click="handleWorkfiles(row)">{{
            row.name
          }}</span>
        </template> -->
        <template slot-scope="{ row }">
          <span class="link-type" style="cursor: pointer" @click="handleWorkfiles(row)">
            <!-- <i :class="typeIcon(row)" style="margin-right: 10px" /> -->
            <i class="el-icon-s-claim" style="margin-right: 10px" />
            {{ row.name }}
          </span>
        </template>

      </el-table-column>
      <el-table-column label="创建者" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.owner.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后修改时间" align="center">
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
          <el-button type="success" size="mini" @click="handlePublish(row)">
            发布
          </el-button>
          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            删除
          </el-button> -->
          <el-tooltip class="item" content="编辑" placement="top">
            <i class="el-icon-edit icon_button" @click.stop="handleUpdate(row)" />
          </el-tooltip>
          <el-tooltip class="item" content="发布" placement="top">
            <i class="el-icon-upload icon_button" @click.stop="handlePublish(row)" />
          </el-tooltip>
          <el-tooltip class="item" content="删除" placement="top">
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

    <el-dialog :close-on-click-modal="false" :title="dialogStatus === 'create' ? '新增挖掘分析' : dialogStatus === 'update' ? '修改挖掘分析': '上传'" :visible.sync="dialogFormVisible" width="30%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="margin-left:50px;margin-right:50px;"
      >
        <el-form-item v-show="dialogStatus!='upload'" label="名称" prop="name">
          <el-input v-model.trim="temp.name" />
        </el-form-item>
        <el-form-item v-show="dialogStatus!='upload'" label="备注">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item v-show="dialogStatus=='upload'" label="" prop="">
          <el-upload
            ref="uploadfilepl"
            style="display: inline-block;"
            class="upload-demo"
            multiple
            action="#"
            accept=".json"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="wjchangeUpload"
            :before-upload="beforeUpload"
          >
            <el-button size="big" type="primary">上传</el-button>
            <!-- <el-popover
                placement="top-start"
                title="提示"
                width="200"
                trigger="hover"
                content="文件名相同会覆盖掉原来上传的文件">

                 <el-button slot="reference" size="big" type="primary">上传</el-button>
              </el-popover> -->

          </el-upload>
          <div v-for="item in fileList" :key="item.id">
            {{ item.name }}
          </div>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="dialogStatus === 'create' ? createData() : dialogStatus === 'update' ? updateData():uploadData()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPublishVisible" title="发布数据分析流程" width="40%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="160px"
        style="margin-left:50px;margin-right:50px;"
      >

        <div style="margin-bottom:20px">
          将为数据分析流程 <span>{{ temp.name }}</span> 生成API地址，提供接口服务供用户调用
        </div>
        <el-form-item label="数据分析流程引擎" prop="name">
          <el-select
            v-model="strgzlyq"
          >
            <el-option
              v-for="item in gzlyq"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期">
          <el-select
            v-model="stryxq"
            @change="yxqChange"
          >
            <el-option
              v-for="item in yxq"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-show="stryxq=='2'" prop="name">
          <el-date-picker
            v-model="temp.sj"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="publishData()">{{
          $t("table.confirm")
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getGZKJSearch, getWorkFilesList, addWorkFiles, updateWorkFiles, deleteWorkFiles, uploadWorkFiles, publishWorkFiles, downloadWorkFiles } from '@/api/gzkj'
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
    return {
      loading: true,
      keyword: '',
      fileList: [],
      formData: undefined,
      selectRows: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        id: undefined,
        page: 1,
        per_page: 10
      },
      gzlyq: [{ id: 1, name: '本地数据分析流程引擎' }],
      strgzlyq: '本地数据分析流程引擎',
      yxq: [{ id: 1, name: '长期' }, { id: 2, name: '期间' }],
      stryxq: 1,

      calendarTypeOptions,
      // sortOptions: [
      //   { label: 'ID Ascending', key: '+id' },
      //   { label: 'ID Descending', key: '-id' }
      // ],
      // statusOptions: ['published', 'draft', 'deleted'],
      // showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        description: '',
        sj: ''
      },
      gzkj: undefined,
      dialogFormVisible: false,
      dialogStatus: '',
      // dialogPvVisible: false,
      dialogPublishVisible: false,
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
        ],
        sj: [
          { required: true, message: '名称必填', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.listQuery.id = this.$route.query.id
    this.gzkj = this.$route.query.id
    this.getList()
  },
  methods: {
    typeIcon(row) {
      return 'iconfont icon-wendang'
      // if (row.dataset.data_type === 'DIR') {
      //   return 'iconfont icon-wenjianjia'
      // } else if (row.dataset.type === 'FILE') {
      //   if (row.dataset.data_type === 'REMOTE_DB_TABLE') {
      //     return 'iconfont icon-biaoge'
      //   } else {
      //     return 'iconfont icon-wendang'
      //   }
      // }
    },
    rowClick(row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    handleSelectionChange(val) {
      this.selectRows = val
    },
    yxqChange() {
      console.log(this.stryxq)
    },
    getList() {
      this.listLoading = true
      getWorkFilesList(this.listQuery).then(response => {
        this.list = response.response.content
        this.total = response.response.pagination.records
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
    handleFilter() {
      this.listLoading = true
      if (this.keyword === '') {
        this.listQuery.page = 1
        this.getList()
        return
      }
      var param = {
        type: 'WorkFile',
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
        this.loading = false
        this.dialogFormVisible = false
      })
    },
    // handleModifyStatus(row, status) {
    //   this.$message({
    //     message: '操作成功',
    //     type: 'success'
    //   })
    //   row.status = status
    // },
    // sortChange(data) {
    //   const { prop, order } = data
    //   if (prop === 'id') {
    //     this.sortByID(order)
    //   }
    // },
    // sortByID(order) {
    //   if (order === 'ascending') {
    //     this.listQuery.sort = '+id'
    //   } else {
    //     this.listQuery.sort = '-id'
    //   }
    //   this.handleFilter()
    // },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        description: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.loading = true
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // this.temp.gzkj =this.gzkj

          addWorkFiles(this.gzkj, this.temp).then((response) => {
            // this.list.unshift(this.temp)
            this.loading = false
            if(response.code==200){
              this.$message.success('创建成功')
              this.dialogFormVisible = false
              this.getList()
            }else{
              this.$message.error(response.message)
            }
          })
        } else {
          this.loading = false
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    uploadData() {
      this.loading = true
      // if(this.formData==undefined||this.formData.get('file')==null){return this.$message.success("选择一个文件上传")}
      if (this.fileList.length === 0) { return this.$message.success('选择一个文件上传') }

      for (let i = 0; i < this.fileList.length; i++) {
        const element = this.fileList[i]
        this.formData = new FormData()

        // 循环添加到formData中
        // file.raw
        this.formData.append('file', element.file)
        uploadWorkFiles(this.gzkj, this.formData)
          .then(res => res.data)
          .then(data => {
            // console.log('上传文件成功！');
            this.loading = false
            if (i === this.fileList.length - 1) {
              this.$message({
                message: '上传成功',
                type: 'success'
              })
              this.getList()
              this.dialogFormVisible = false
            }
          }).catch(e => {
            this.$message('操作调用失败')
            this.loading = false
            this.dialogFormVisible = false
          })
      }

      //  uploadWorkFiles(this.gzkj,this.formData)
      //   .then(res => res.data)
      //   .then(data => {
      //     console.log('上传文件成功！');
      //     this.$message({
      //       message: '上传成功',
      //       type: "success"
      //     });
      //      this.getList()
      //      this.dialogFormVisible=false
      //   }).catch(action => {

      // });
    },
    beforeUpload(file) {
      console.log(file)
    },
    wjchangeUpload(file) {
      // this.fileList=[];
      // this.formData = new FormData();
      // //循环添加到formData中
      // // file.raw
      // this.formData.append('file', file.raw);
      // fileList.forEach(function (file) {
      //     formData.append('file', file, file.name);
      // })
      if(file.name.indexOf('.json')==-1){
        this.$message.warning('只能上传json文件')
        // fileList.pop();
        return;
      }
      this.fileList.push({ name: file.raw.name, id: file.raw.uid, file: file.raw })
    },
    handlePublish(row) {
      this.temp = Object.assign(this.temp, row) // copy obj
      this.dialogStatus = 'publish'
      this.dialogPublishVisible = true
      this.loading = false
    },
    publishData() {
      if (this.stryxq === 2 && this.temp.sj.length === 0) {
        this.$message('选择时间')
        return
      }
      this.loading = true
      var param = {
        'name': '',
        'engine_id': 0,
        'description': '',
        'start_at': this.temp.sj == '' ? 0 : this.temp.sj[0].getTime(),
        'end_at': this.temp.sj == '' ? 0 : this.temp.sj[1].getTime(),
        'input_format': '',
        'output_format': ''
      }
      publishWorkFiles(this.gzkj, this.temp.id, param).then((response) => {
        this.dialogPublishVisible = false
        this.loading = false
        if(response.code==200){
          this.$message.success('发布成功')
        }else{
          this.$message.error(response.message)
        }
      }).catch(e => {
        this.$message('操作调用失败')
        this.loading = false
        this.dialogFormVisible = false
      })
      

    },

    handleWorkfiles(row) {
      // return
      // this.$router.push({ path: '/gzkj/workfiles/id', query: { id: row.id }})
      // this.$router.push({ path: '/gzkj/'+row.id+'/datasets', query: { id: row.id }})
      this.$router.push({ path: this.$route.path + '/' + row.id + '/index', meta: { title: row.name }, query: { id: this.gzkj, gzlid: row.id, name: row.name }})
    },

    updateData() {
      this.loading = true
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateWorkFiles(this.gzkj, this.temp).then((response) => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.loading = false
            this.$message.success('更新成功')
          }).catch(e => {
            this.$message('操作调用失败')
            this.loading = false
            this.dialogFormVisible = false
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
        deleteWorkFiles(this.gzkj, row.id).then((response) => {
          // if(response.code==403){
          //   this.$message.error(response.message)
          //   this.dialogFormVisible = false
          //   this.$refs.searchKey.focus()
          //   this.$refs.searchKey.blur()
          //   return
          // }
          if(response.code==200){
            //  const index = this.list.findIndex(v => v.id === this.temp.id)
            // this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false

            this.$message.success('删除成功')

            this.getList()
          }else{
            this.$message.error(response.message)
            this.dialogFormVisible = false
            this.$refs.searchKey.focus()
            this.$refs.searchKey.blur()
          }
         
        }).catch(e => {
          this.$message('操作调用失败')
          this.loading = false
          this.dialogFormVisible = false
        })
      }).catch(e =>{
          this.$message('取消删除')
          this.dialogFormVisible = false
          this.$refs.searchKey.focus()
          this.$refs.searchKey.blur()
      })
    },
    // handleFetchPv(pv) {
    //   fetchPv(pv).then(response => {
    //     this.pvData = response.data.pvData
    //     this.dialogPvVisible = true
    //   })
    // },
    handleUpload() {
      this.dialogStatus = 'upload'
      this.dialogFormVisible = true
      this.loading = false
      this.fileList = []
      this.formData = null
    },
    handleDownload() {
      if (this.selectRows.length === 0) {
        this.$message.warning('未选择选项')
        return
      }
      this.downloadLoading = true

      var ids = this.selectRows.map(value => {
        return value.id
      })
      var param = {
        'ids': ids.toString()
      }
      downloadWorkFiles(this.gzkj, param).then((response) => {
        // this.loading = false
        this.downloadLoading = false
        // let blob = new Blob([response], {type: 'application/zip'})
        // let url = window.URL.createObjectURL(blob)
        // window.location.href = url
        console.log(response)
        console.log(response.data)
        const blob = new Blob([response], { type: 'application/zip' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a') // 创建a标签
        link.href = url
        link.download = (new Date()).toLocaleString() + '.zip'
        link.click()
        URL.revokeObjectURL(url) // 释放内存
      }).catch(e => {
        this.$message('操作调用失败')
        this.loading = false
        this.dialogFormVisible = false
      })
      // this.$message.success('关联数据成功')
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
