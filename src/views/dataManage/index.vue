<template>
  <div class="app-container">
    <div><i class="iconfont icon-wenjianjia" style="margin-right: 10px;cursor: pointer" @click="rootClick" />/
      <span v-for="(item,index) in dirList" :key="item.id" style="cursor: pointer" @click="dirClick(index)"> {{ item.name }} /</span>
    </div>
    <div style="margin-top: 20px">
      <el-input
        ref="searchKey"
        v-model="keyWords"
        style="width: 200px"
        placeholder="搜索数据集"
        clearable
        prefix-icon="el-icon-search"
        @keyup.enter.native="search"
      />
      <div style="float: right">
        <el-button @click="upLevel"><i class="iconfont icon-ai207" /></el-button>
        <el-button @click="getList"><i class="iconfont icon-shuaxin" /></el-button>
        <el-button type="primary" @click="move(1)"><i class="iconfont icon-caozuojiemiantubiao--_yidong" /> 移动</el-button>
        <el-button type="primary" @click="batchDelete"><i class="el-icon-delete" /> 删除</el-button>
        <el-button type="primary" @click="uploadFile"><i class="el-icon-upload2" /> 上传数据</el-button>
        <!--<el-button type="primary"><i class="el-icon-download" /> 导出HIVE表</el-button>-->
        <el-button type="primary" @click="createFolder"><i class="el-icon-plus" /> 创建文件夹</el-button>
      </div>
    </div>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="tableData"
      :height="maxHeight"
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
        <template slot-scope="scope"><span style="cursor: pointer" @click="inDir(scope.row,$event)"><i :class="typeIcon(scope.row)" style="margin-right: 10px" />{{ scope.row.name }}</span></template>
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
            <el-tooltip content="移动" placement="bottom">
              <i class="iconfont icon-caozuojiemiantubiao--_yidong" style="cursor: pointer" @click="move($event,scope.row)" />
            </el-tooltip>
            <el-tooltip content="重命名" placement="bottom">
              <i class="el-icon-edit" style="margin-left: 20px;cursor: pointer" @click="edit(scope.row,$event)" />
            </el-tooltip>
            <el-tooltip content="分发" placement="bottom">
              <i v-if="scope.row.type!=='DIR'" class="iconfont icon-lianjie" style="margin-left: 20px;cursor: pointer" @click="share(scope.row,$event)" />
            </el-tooltip>
            <el-tooltip content="解除分发" placement="bottom">
              <i v-if="scope.row.type!=='DIR'" class="iconfont icon-duankailianjie" style="margin-left: 20px;cursor: pointer" @click="unShare(scope.row,$event)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="bottom">
              <i class="el-icon-delete" style="margin-left: 20px;cursor: pointer" @click="deleteOne(scope.row,$event)" />
            </el-tooltip>
            <!--<el-tooltip content="分配" placement="bottom">-->
            <!--<i v-if="scope.row.type!=='DIR'" class="iconfont icon-renwufenpei" style="margin-left: 20px;cursor: pointer" />-->
            <!--</el-tooltip>-->
            <el-tooltip content="预览" placement="bottom">
              <i v-if="scope.row.view_status==='READY'" class="iconfont icon-yulan" style="margin-left: 20px;cursor: pointer" @click="view(scope.row,$event)" />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="550px"
      destroy-on-close
      :close-on-click-modal="false"
      @close="cancel"
    >
      <div>
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="110px" class="demo-ruleForm">
          <template v-if="title==='创建文件夹'">
            <el-form-item label="文件夹名称：" prop="name">
              <el-input v-model.trim="ruleForm.name" placeholder="请输入" />
            </el-form-item>
          </template>
          <template v-if="title==='重命名'">
            <!-- <el-input v-model.trim="ruleForm.name" placeholder="请输入" /> -->
            <el-form-item label="重命名：" prop="name">
              <el-input v-model.trim="ruleForm.name" placeholder="请输入" />
            </el-form-item>
          </template>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确认</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="title1"
      :visible.sync="dialogVisible1"
      width="750px"
      top="50px"
      :close-on-click-modal="false"
      @close="dialogVisible1=false"
    >
      <div>
        <div><i class="iconfont icon-wenjianjia" style="margin-right: 10px;cursor: pointer" @click="rootClick1" />/
          <span v-for="(item,index) in dirList1" :key="item.id" style="cursor: pointer" @click="dirClick1(index)"> {{ item.name }} /</span>
        </div>
        <el-input
          v-model="keyWords1"
          style="width: 200px;margin-top: 10px"
          placeholder="搜索数据集"
          clearable
          prefix-icon="el-icon-search"
          @keyup.enter.native="search1"
        />
        <el-table
          ref="multipleTable1"
          v-loading="loading1"
          :data="tableData1"
          :max-height="movemaxHeight"
          style="width: 100%;margin-top: 10px"
        >
          <el-table-column
            label="名称"
          >
            <template slot-scope="scope"><span style="cursor: pointer" @click="inDir1(scope.row,$event)"><i :class="typeIcon(scope.row)" style="margin-right: 10px" />{{ scope.row.name }}</span></template>
          </el-table-column>
          <el-table-column
            label="时间"
          >
            <template slot-scope="scope">{{ $dayjs(scope.row.created_at).format('YYYY-MM-DD HH:mm:ss') }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="moveSubmit">确认</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="title2"
      :visible.sync="dialogVisible2"
      width="70%"
      top="50px"
      :close-on-click-modal="false"
      @close="dialogVisible2=false"
    >
      <div>
        <el-input
          v-model="keyWords2"
          style="width: 200px;margin-top: 10px"
          placeholder="搜索工作项目"
          clearable
          prefix-icon="el-icon-search"
        />
        <el-table
          ref="multipleTable1"
          v-loading="loading2"
          :data="tableData2c"
          :max-height="movemaxHeight"
          tooltip-effect="dark"
          style="width: 100%;margin-top: 10px"
          @row-click="rowClick1"
          @selection-change="handleSelectionChange1"
        >
          <el-table-column
            type="selection"
            width="55"
          />
          <el-table-column label="名称" prop="name" width="180px" align="center" />
          <el-table-column label="创建者" width="110px" align="center">
            <template slot-scope="{ row }">
              <span>{{ row.owner.username }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数据集" prop="datasets_count" min-width="150px" />
          <el-table-column label="数据挖掘实验" prop="workfiles_count" min-width="150px" />
          <el-table-column label="任务" prop="job_model_count" min-width="150px" />
          <el-table-column label="导出模型" prop="model_count" min-width="150px" />
          <el-table-column label="最后修改时间" width="180px" align="center">
            <template slot-scope="{ row }">
              <span>{{ $dayjs(row.updated_at).format('YYYY-MM-DD HH:mm:ss') }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="shareSubmit">确认</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="上传数据"
      :visible.sync="dialogVisible3"
      width="500px"
      top="50px"
      :close-on-click-modal="false"
      @close="dialogVisible3=false"
    >
      <div>
        <el-upload
          ref="upload"
          class="upload-demo"
          drag
          multiple
          accept=".csv"
          :action="http"
          :on-success="success"
          :on-error="error"
          :on-change="change"
          :file-list="fileList"
          :auto-upload="false"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">单个文件大小上限为 1 GB。<br><br>
            当前可对逗号分隔、首行为列名的CSV文件生成预览，列名须以字母开头，且只能包含字母、数字和下划线。</div>
        </el-upload>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitUpload">确认</el-button>
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
      <div v-loading="loading3">
        <div style="margin-bottom: 10px">
          行:{{ numRow }} <span style="padding-left: 20px">列:{{ numCol }}</span>
        </div>
        <el-row class="view-box" :style="{height:movemaxHeight+120+'px'}">
          <el-col :span="16" style="border-right: 1px solid #b8b8b8;height: 100%;overflow-y: auto">
            <el-table
              ref="multipleTable"
              :data="viewRows"
              height="100%"
              @header-click="headerClick"
            >
              <el-table-column
                v-for="(item,index) in headers"
                :key="index"
                min-width="200px"
                :index="index"
                show-overflow-tooltip
                :label="item.name"
              >
                <template slot-scope="scope">
                  <div v-if="scope.row[index]===true" :id="'echart'+index" style="width: 100%;height: 50px" @click="viewClick(index)" />
                  <span v-else>
                    {{ scope.row[index] }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
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
              可视化效果
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
              <div id="echartV" style="height: 350px;width: 100%" />
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import echarts from 'echarts'
import request from '@/utils/request'
import axios from 'axios'
import { getDatasets, createF, getChildren, deleteData, rename, getDataShare, getView, search, getGZKJSearch ,getWorkSpacesexcludeDataSet, destroyCheck, destoryCheckMultiple} from '@/api/dataManage.js'
import { getGZKJList } from '@/api/gzkj'
export default {
  name: 'Index',
  data() {
    return {
      keyWords: '',
      keyWords1: '',
      keyWords2: '',
      tableData: [],
      tableData1: [],
      tableData2: [],
      tableData2c: [],
      selectRows: [],
      selectRows1: [],
      loading: false,
      loading1: false,
      loading2: false,
      loading3: false,
      dialogVisible: false,
      dialogVisible1: false,
      dialogVisible2: false,
      dialogVisible3: false,
      dialogVisible4: false,
      maxHeight: 500,
      movemaxHeight: 500,
      title: '',
      title1: '',
      title2: '',
      ruleForm: {
        parent_id: '',
        name: ''
      },
      rules: {
          name: [
            { required: true, message: '名称必填', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
          ],
      },
      root: '',
      dirList: [],
      dirList1: [],
      editId: '',
      isMoveOne: false,
      moveObj: '',
      shareRow: '',
      fileList: [],
      http: '',
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
      disabled:true,
    }
  },
  watch: {
    keyWords2() {
      this.search2()
    }
  },
  mounted() {
    this.getDatasets()
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
      this.movemaxHeight = document.body.offsetHeight - 350
    },
    rowClick(row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    rowClick1(row) {
      this.$refs.multipleTable1.toggleRowSelection(row)
    },
    handleSelectionChange(val) {
      this.selectRows = val
    },
    handleSelectionChange1(val) {
      this.selectRows1 = val
    },
    upLevel() {
      if (this.dirList.length) {
        this.dirList.splice(this.dirList.length - 1, 1)
        this.getList()
      }
    },
    move(e, row) {
      this.dirList1 = []
      if (e === 1) {
        this.isMoveOne = false
        if (this.selectRows.length) {
          this.dialogVisible1 = true
          this.title1 = '移动' + this.selectRows.length + '个对象到...'
          this.getChildren1(this.root.id)
        } else {
          this.$message.error('请选择要移动的对象')
        }
      } else {
        e.stopPropagation()
        this.isMoveOne = true
        this.moveObj = row
        this.dialogVisible1 = true
        this.title1 = '移动1个对象到...'
        this.getChildren1(this.root.id)
      }
    },
    share(row, event) {
      event.stopPropagation()
      this.dialogVisible2 = true
      this.title2 = '分发到工作项目'
      this.shareRow = row
      this.getGZKJList()
    },
    unShare(row, event) {
      event.stopPropagation()
      this.dialogVisible2 = true
      this.title2 = '从工作项目解除分发'
      this.shareRow = row
      this.getDataShare()
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
      this.getView(row.id)
    },
    uploadFile() {
      if (!this.root.id) {
        return
      }
      var id = this.dirList.length ? this.dirList[this.dirList.length - 1].id : this.root.id
      this.dialogVisible3 = true
      this.fileList = []
      this.http = '/datasets/' + id + '/file'
    },
    typeIcon(row) {
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
    inDir1(row, event) {
      this.dirList1.push(row)
      this.getChildren1(row.id)
    },
    dirClick(index) {
      this.dirList.splice(index + 1, 1)
      this.getChildren(this.dirList[index].id)
    },
    dirClick1(index) {
      this.dirList1.splice(index + 1, 1)
      this.getChildren1(this.dirList[index].id)
    },
    rootClick() {
      this.dirList = []
      this.getDatasets()
    },
    rootClick1() {
      this.dirList1 = []
      this.getChildren1(this.root.id)
    },
    edit(row, event) {
      event.stopPropagation()
      this.title = '重命名'
      this.dialogVisible = true
      this.ruleForm.name = row.name
      this.editId = row.id
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          if (this.title === '创建文件夹') {
            if(this.ruleForm.name==""){this.$message('请输入文件名');return}
             this.createF()
          }
          if (this.title === '重命名') { 
             if(this.ruleForm.name==""){this.$message('请输入文件名');return}
            this.rename() }
          if (this.title === '修改密码') { this.resetpwd() }
          this.dialogVisible = false
        } else {
          return false
        }
      })
    },
    moveSubmit() {
      var req = []; var moveTo = this.dirList1.length ? this.dirList1[this.dirList1.length - 1].id : this.root.id
      var list = this.isMoveOne ? [this.moveObj] : this.selectRows
      list.map(i => {
        req.push(
          request({
            url: '/datasets/' + i.id + '/move/' + moveTo,
            method: 'put'
          })
        )
      })
      axios.all(req).then(data => {
         let num=0;
         data.map(value=>{
            if (value.code === 200) {
                this.dialogVisible1 = false
                this.$message.success('移动成功')
                num+=1
                this.getList()
            }else{
                this.$message.error(value.message)
            }
         })
        //  if(data.length==num&&num!=0){
        //     this.$message.success('移动成功')
        //  }
      }).catch(e =>{
        // this.$message('取消删除')
        // this.blur()
        console.log(e)
        this.dialogVisible1 = false
      })
     
    },
    cancel() {
      this.ruleForm = {
        parent_id: '',
        name: ''
      }
      this.$refs.ruleForm.clearValidate()
      this.dialogVisible = false
    },
    batchDelete() {
      var list = []; var id = []
      this.selectRows.map(value => {
        list.push(value.name)
        id.push(value.id)
      })
      if (list.length) {
        var title = '确定删除下列文件/文件夹 ' + list.join(',') + ' 吗'
        this.$confirm(title, '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var req = []
          id.map(i => {
            req.push(
              request({
                url: '/datasets/' + i,
                method: 'DELETE'
              })
            )
          })
          destoryCheckMultiple(id).then(data => {
            if (data.code === 200) {
               axios.all(req).then(data => {
                this.$message.success('删除成功')
                this.getList()
              })
            }else{
              this.$message.error(data.message)
              this.$refs.searchKey.focus()
              this.$refs.searchKey.blur()
            }
          }).catch(e =>{
            // this.$message('取消删除')
            console.log(e)
            this.$refs.searchKey.focus()
            this.$refs.searchKey.blur()
          })
         
        }).catch(e =>{
          this.$message('取消删除')
          // this.blur()
        })
      } else {
        this.$message.error('请选择要删除的对象')
      }
    },
    deleteOne(row, event) {
      event.stopPropagation()
      var title = '确定删除下列文件/文件夹 ' + row.name + ' 吗'
      this.$confirm(title, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteData(row.id)
      }).catch(e =>{
        this.$message('取消删除');
        // window.focus()
        this.$refs.searchKey.focus()
        this.$refs.searchKey.blur()

        // this.disabled=false;
      })
    },
    createFolder() {
      this.dialogVisible = true
      this.title = '创建文件夹'
      if (this.dirList.length) {
        this.ruleForm.parent_id = this.dirList[this.dirList.length - 1].id
      } else {
        this.ruleForm.parent_id = this.root.id
      }
    },
    getDatasets() {
      this.loading = true
      this.selectRows = []
      getDatasets().then(data => {
        this.loading = false
        if (data.code === 200) {
          this.root = data.response.content
          getChildren(this.root.id).then(d => {
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
              this.tableData = [...dir, ...other]
            }
          }).catch(() => {
            this.loading = false
          })
        }
      }).catch(() => {
        this.loading = false
      })
    },
    getDatasets1() {
      this.loading1 = true
      // this.selectRows = []
      getDatasets().then(data => {
        this.loading1 = false
        if (data.code === 200) {
          this.root = data.response.content
          getChildren(this.root.id).then(d => {
            this.loading1 = false
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
              // other.sort(function(a, b) {
              //   return a.created_at < b.created_at ? 1 : -1
              // })
              this.tableData1 = [...dir]
            }
          }).catch(() => {
            this.loading1 = false
          })
        }
      }).catch(() => {
        this.loading1 = false
      })
    },
    createF() {
      createF({
        name: this.ruleForm.name,
        parent_id: this.ruleForm.parent_id
      }, this.ruleForm.parent_id).then(data => {
        if (data.code === 200) {
          this.$message.success('创建成功')
          this.getList()
        }
      })
    },
    getChildren(id) {
      this.loading = true
      getChildren(id).then(d => {
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
          this.tableData = [...dir, ...other]
        }
      }).catch(() => {
        this.loading = false
      })
    },
    getChildren1(id) {
      this.loading1 = true
      getChildren(id).then(d => {
        this.loading1 = false
        if (d.code === 200) {
          var dir = []
          d.response.content.map(value => {
            if (value.type === 'DIR') {
              dir.push(value)
            }
          })
          dir.sort(function(a, b) {
            return a.created_at < b.created_at ? 1 : -1
          })
          this.tableData1 = dir
        }
      }).catch(() => {
        this.loading1 = false
      })
    },
    deleteData(id) {
      destroyCheck(id).then(data => {
        if (data.code === 200) {
          deleteData(id).then(data => {
            if (data.code === 200) {
              this.$message.success('删除成功')
              this.getList()
            }
          })
        }else{
          this.$message.error(data.message)
        }
      }).catch((e) => {
        console.log(e)
        this.$refs.searchKey.focus()
        this.$refs.searchKey.blur()
      })
     
    },
    getList() {
      if (this.dirList.length) {
        this.getChildren(this.dirList[this.dirList.length - 1].id)
      } else {
        this.getDatasets()
      }
    },
    rename() {
      rename({ name: this.ruleForm.name }, this.editId).then(data => {
        if (data.code === 200) {
          this.$message.success('修改成功')
          this.getList()
        }
      })
    },
    getGZKJList() {
      this.loading2 = true
      // getGZKJList({
      //   per_page: 1000,
      //   page: 1,
      //   sort: '+id'
      // }).then(data => {
      //   this.loading2 = false
      //   if (data.code === 200) {
      //     this.tableData2 = [...data.response.content]
      //     this.tableData2c = data.response.content
      //   }
      // }).catch(() => {
      //   this.loading2 = false
      // })
      getWorkSpacesexcludeDataSet({
        per_page: 1000,
        page: 1,
        sort: '+id',
        dataSetId:this.shareRow.id,
        type:'all',
        text:'',
      }).then(data => {
        this.loading2 = false
        if (data.code === 200) {
          this.tableData2 = [...data.response.content]
          this.tableData2c = data.response.content
        }
      }).catch(() => {
        this.loading2 = false
      })
    },
    shareSubmit() {
      if (this.title2 === '分发到工作项目') {
        if (!this.selectRows1) {
          this.$message.error('请选择需要分发的工作项目')
          return
        }
        const req = []
        this.selectRows1.map(i => {
          req.push(
            request({
              url: '/workspaces/' + i.id + '/datalinks',
              method: 'post',
              data: {
                dataset_id: this.shareRow.id
              }
            })
          )
        })
        axios.all(req).then(data => {
          this.$message.success('分发成功')
        })
        this.dialogVisible2 = false
      } else {
        if (!this.selectRows1) {
          this.$message.error('请选择需要解除分发的工作项目')
          return
        }
        const req = []
        this.selectRows1.map(i => {
          req.push(
            request({
              url: '/datasets/' + this.shareRow.id + '/workspaces/' + i.id + '/disassociation',
              method: 'delete'
            })
          )
        })
        axios.all(req).then(data => {
          this.$message.success('解除分发成功')
        })
        this.dialogVisible2 = false
      }
    },

    getDataShare() {
      this.loading2 = true
      getDataShare(this.shareRow.id).then(data => {
        this.loading2 = false
        if (data.code === 200) {
          this.tableData2 = [...data.response.content]
          this.tableData2c = data.response.content
        }
      }).catch(() => {
        this.loading2 = false
      })
    },

    success(response, file, fileList) {
      this.$message.success('上传成功')
      this.dialogVisible3 = false
      this.getList()
    },

    error() {
      this.$message.success('上传失败')
    },

    change(file, fileList) {
      if(file.name.indexOf('.csv')==-1){
        this.$message.warning('只能上传csv文件')
        fileList.pop();
        return;
      }
    },

    getView(id) {
      this.loading3 = true
      getView(id).then(data => {
        this.loading3 = false
        if (data.code === 200) {
          var chart = []
          this.viewData = JSON.parse(data.response.content.view.content)
          this.numRow = this.viewData.Data.info.numOfRow
          this.numCol = this.viewData.Data.info.numOfColumn
          this.headers = this.viewData.Data.headers
          for (let n = 0; n < this.headers.length; n++) {
            chart.push(true)
          }
          this.viewRows = [chart, ...this.viewData.Data.rows]
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
      }).catch(() => {
        this.loading3 = false
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
    },

    // search() {
    //   this.loading = true
    //   search({
    //     type: 'UnionDataSet',
    //     text: this.keyWords,
    //     page: 1,
    //     per_page: 1000
    //   }).then(data => {
    //     this.loading = false
    //     if (data.code === 200) {
    //       var dir = []; var other = []
    //       data.response.content.map(value => {
    //         if (value.type === 'DIR') {
    //           dir.push(value)
    //         } else {
    //           other.push(value)
    //         }
    //       })
    //       dir.sort(function(a, b) {
    //         return a.created_at < b.created_at ? 1 : -1
    //       })
    //       other.sort(function(a, b) {
    //         return a.created_at < b.created_at ? 1 : -1
    //       })
    //       this.tableData = [...dir, ...other]
    //     }
    //   }).catch(() => {
    //     this.loading = false
    //   })
    // },
    search() {
      this.loading = true
      
      if (this.keyWords != '') {
        search({
          type: 'UnionDataSet',
          text: this.keyWords,
          page: 1,
          per_page: 1000
        }).then(data => {
          this.loading = false
          if (data.code === 200) {
            var dir = []; var other = []
            data.response.content.map(value => {
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
            this.tableData = [...dir, ...other]
          }
        }).catch(() => {
          this.loading = false
        })
        return
      }
      this.getDatasets()
      
    },

    // search1() {
    //   this.loading1 = true
    //   search({
    //     type: 'UnionDataSet',
    //     text: this.keyWords1,
    //     page: 1,
    //     per_page: 1000
    //   }).then(data => {
    //     this.loading1 = false
    //     if (data.code === 200) {
    //       var dir = []; var other = []
    //       data.response.content.map(value => {
    //         if (value.type === 'DIR') {
    //           dir.push(value)
    //         } else {
    //           other.push(value)
    //         }
    //       })
    //       dir.sort(function(a, b) {
    //         return a.created_at < b.created_at ? 1 : -1
    //       })
    //       other.sort(function(a, b) {
    //         return a.created_at < b.created_at ? 1 : -1
    //       })
    //       this.tableData1 = [...dir, ...other]
    //     }
    //   }).catch(() => {
    //     this.loading1 = false
    //   })
    // },

     search1() {
      this.loading1 = true
      
      if (this.keyWords1 != '') {
          search({
          type: 'UnionDataSet',
          text: this.keyWords1,
          page: 1,
          per_page: 1000
        }).then(data => {
          this.loading1 = false
          if (data.code === 200) {
            var dir = []; var other = []
            data.response.content.map(value => {
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
            this.tableData1 = [...dir, ...other]
          }
        }).catch(() => {
          this.loading1 = false
        })
        return
      }
      this.getDatasets1()
    },

    search2() {
      if (this.keyWords2 !== '') {
        var list = []
        this.tableData2.map(value => {
          var is = false
          if (value.name.indexOf(this.keyWords2) !== -1) {
            is = true
          }
          if (value.owner.username.indexOf(this.keyWords2) !== -1) {
            is = true
          }
          if (is) {
            list.push(value)
          }
        })
        this.tableData2c = list
      } else {
        this.tableData2c = this.tableData2
      }
    },

    headerClick(column) {
      this.viewClick(column.index)
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
