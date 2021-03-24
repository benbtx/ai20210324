<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input
        v-model="listQuery.text"
        placeholder="搜索项目名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      /> -->
      <div style="float: right">
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-delete"
          @click="deleteData()"
        >
          删除
        </el-button>
        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          icon="el-icon-download"
          @click="handleCreate"
        >
          发布
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
      <el-table-column label="名称" width="220px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址" align="center">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleExcute(row)">{{ row.host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="120px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.type_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.phase }}</span>
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
        width="180"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <!-- <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
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
            <span style="display:inline-block;width:40px"><i class="el-icon-edit icon_button" @click.stop @click="handleUpdate(row)" /></span>
          </el-tooltip>

          <el-tooltip class="item" content="删除" placement="top">
            <span style="display:inline-block;width:20px"><i class="el-icon-delete icon_button" @click.stop @click="handleDelete(row, $index)" /></span>
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

    <el-dialog title="执行数据分析流程" :visible.sync="dialogFormVisible" width="30%">
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
        <el-form-item label="备注">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="请输入"
          />
        </el-form-item>

      </el-form>
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

    <el-dialog :visible.sync="dialogTipVisible" title="提示" width="30%">
      
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="updateData()">{{
          $t("table.confirm")
        }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogUpdateVisible" title="编辑模型" width="30%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="margin-left:50px;margin-right:50px;"
      >

        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="请输入"
          />
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="updateData()">{{
          $t("table.confirm")
        }}</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="dialogExcuteVisible" title="执行数据分析流程" width="60%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="margin-left:50px;margin-right:50px;"
      >

        <!-- <div style="margin-bottom:20px">
          将为数据分析流程 <span>{{ temp.name }}</span> 生成API地址，提供接口服务供用户调用
        </div> -->
        <div>   <el-button type="success">post</el-button>  {{ temp.host }}  执行数据分析流程  {{ temp.name }}</div>
        <div style="height: 30px; background: #e8ebef; line-height: 30px;margin:20px 0px">参数 </div>

        <el-form-item label="*body object">

          <el-input
            v-model="excuteInput"
            :autosize="{ minRows: 4, maxRows: 8 }"
            type="textarea"
            placeholder=""
          />
          <div style="margin-top:20px">Parameter content type
            <el-select
              v-model="paramsValue"
              style="width: 180px"
            >
              <el-option
                v-for="item in paramsType"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </div>
          <div>
            <el-button type="primary" size="mini" @click="excuteData()">
              执行
            </el-button>
            <el-button type="text" size="mini" @click="excuteClear()">
              清除执行结果
            </el-button>
          </div>
        </el-form-item>
        <div style="height: 30px; background: #e8ebef; line-height: 30px;">响应 </div>
        <el-form-item label="Code 200">
          <div>描述示例 </div>
          <el-input
            v-model="excuteOutput"
            :autosize="{ minRows: 4, maxRows: 8 }"
            type="textarea"
            placeholder=""
          />
        </el-form-item>

      </el-form>
      <!-- <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="updateData()">{{
          $t("table.confirm")
        }}</el-button>
      </span> -->
    </el-dialog>

  </div>
</template>
<script>
import { getModels, updateModels, deleteModels, publishModels, excuteFlow } from '@/api/gzkj'
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
      selectRows: [],
      timer: undefined,
      gzkj: undefined,
      loading: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        id: undefined,
        page: 1,
        per_page: 10,
        text: undefined,
        sort: 'id'
      },

      temp: {
        id: undefined,
        name: '',
        description: ''
        // status: 'published'
      },
      dialogFormVisible: false,
      dialogUpdateVisible: false,
      dialogTipVisible:false,
      dialogExcuteVisible: false,
      gzlyq: [{ id: 1, name: '本地数据分析流程引擎' }],
      gzlyqValue: 1,
      yxq: [{ id: 1, name: '长期' }, { id: 2, name: '期间' }],
      stryxq: 2,
      yxqsj: [],
      paramsType: [{ id: 'application/json', name: 'application/json' }, { id: 'application/xml', name: 'application/xml' }],
      paramsValue: 'application/json',
      excuteInput: '',
      excuteOutput: '',
      publishInput: '',
      publishOutput: '',
      start_at: '',
      end_at: '',
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
        // name: [
        //   { required: true, message: '名称必填', trigger: 'blur' }
        // ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.gzkj = this.$route.query.id
    this.listQuery.id = this.$route.query.id
    this.getList()
    this.timer = setInterval(() => {

    }, 20000)
  },
  destroyed() {
    clearInterval(this.timer)
  },
  methods: {
    rowClick(row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    handleSelectionChange(val) {
      this.selectRows = val
    },
    getList() {
      this.listLoading = true
      getModels(this.listQuery).then(response => {
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

    resetTemp() {
      this.temp = {
        id: undefined,
        text: '',
        description: ''
      }
    },
    handleCreate() {
      // this.resetTemp()
      // this.dialogStatus = 'create'
      // this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
      if(this.selectRows.length==0){
        this.$message.warning('未选择发布模型')
        return;
      }
      publishModels(this.gzkj, this.selectRows[0].id).then(() => {
        // this.$message.success('发布成功')
        this.dialogTipVisible=true
      }).catch(e => {
        this.$message('操作调用失败')
      })
     

    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // this.temp.author = 'vue-element-admin'
          // addGZKJ_SJJ(this.temp).then(() => {
          //   // this.list.unshift(this.temp)
          //   this.dialogFormVisible = false
          //   this.$notify({
          //     title: '成功',
          //     message: '创建成功',
          //     type: 'success',
          //     duration: 2000
          //   })
          //   this.getList()
          // })
        }
      })
    },
    handleExcute(row) {
      this.dialogExcuteVisible = true
      this.excuteInput = ''
      this.excuteOutput = ''
      this.temp = Object.assign({}, row)
    },
    excuteData() {
      var id = this.temp.host.split('/')[this.temp.host.split('/').length - 1]
      var data = this.excuteInput
      excuteFlow(this.temp.host, this.paramsValue, data).then((response) => {
        if (response.code == 200) {
          this.excuteOutput = response.response.content
        } else {
          this.excuteOutput = JSON.stringify(response)
        }

        this.dialogFormVisible = false
      }).catch(e => {
        this.excuteOutput = JSON.stringify(response)
        // this.$message('操作调用失败')
      })
    },
    excuteClear() {
      this.excuteOutput = ''
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogUpdateVisible = true
      this.publishInput = row.input_format
      this.publishOutput = row.output_format
      this.yxqsj = [row.start_at, row.end_at]

      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },

    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          var param = {
            id: this.temp.id,
            name: this.temp.name,
            description: this.temp.description
          }

          updateModels(this.gzkj, param).then((response) => {
            this.dialogUpdateVisible = false
            if(response.code==200){
              this.$message.success('编辑成功')
              this.getList()
            }else{
              this.$message.error(response.message)
            }
          }).catch(e => {
            this.$message('操作调用失败')
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
        deleteModels(this.gzkj, row.id).then((response) => {
          if(response.code==200){
            this.$message.success('删除成功')
            this.getList()
          }else{
            this.$message.error(response.message)
          }
        }).catch(e => {
          this.$message('操作调用失败')
        })
      }).catch(e =>{
          this.$message('取消删除')
      })
    },
    deleteData() {
      if (this.selectRows.length === 0) {
        this.$message.warning('选择数据')
        return
      }
      for (let i = 0; i < this.selectRows.length; i++) {
        const element = this.selectRows[i]

        deleteModels(this.gzkj, element.id)
          .then(res => res.data)
          .then(data => {
            // console.log('上传文件成功！');
            this.loading = false
            if (i === this.selectRows.length - 1) {
              this.$message({
                message: '删除成功',
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
    }

  }
}
</script>
