<template>
  <div>
    <div>
      <el-input
        ref="searchKey"
        v-model="keyWords"
        style="width: 200px"
        placeholder="搜索用户"
        clearable
        prefix-icon="el-icon-search"
        @keyup.enter.native="search"
      />
      <div style="float: right">
        筛选：
        <el-select v-model="sate" placeholder="请选择" style="width: 100px;margin-right: 10px" @change="typeChange">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button type="primary" @click="cancelValidity"><i class="iconfont icon-suo" />取消激活</el-button>
        <el-button type="primary" @click="clickAdd"><i class="el-icon-plus" />添加用户</el-button>
      </div>
    </div>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="tableData"
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
        prop="username"
        label="名称"
      />
      <el-table-column
        prop="phone"
        width="180"
        label="电话"
      />
      <el-table-column
        prop="email"
        width="250"
        label="邮箱"
        show-overflow-tooltip
      />
      <el-table-column
        width="180"
        label="创建时间"
      >
        <template slot-scope="scope">{{ $dayjs(scope.row.created_at).format('YYYY-MM-DD HH:mm:ss') }}</template>
      </el-table-column>
      <el-table-column
        width="100"
        label="来源"
      >
        <template>内部</template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="250"
      >
        <template slot-scope="scope">
          <div>
            <el-tooltip content="删除" placement="bottom">
              <i class="el-icon-delete" style="cursor: pointer" @click="deleteOne($event,scope.row.id)" />
            </el-tooltip>
            <el-tooltip content="修改资料" placement="bottom">
              <i class="el-icon-edit" style="margin-left: 20px;cursor: pointer" @click="edit($event,1,scope.row)" />
            </el-tooltip>
            <el-tooltip content="修改密码" placement="bottom">
              <i class="iconfont icon-icon_password" style="margin-left: 20px;cursor: pointer" @click="edit($event,2,scope.row)" />
            </el-tooltip>
            <el-tooltip content="激活" placement="bottom">
              <i v-if="!scope.row.active" class="iconfont icon-suo" style="margin-left: 20px;cursor: pointer" @click="validity($event,scope.row)" />
            </el-tooltip>
            <el-tooltip content="解除激活" placement="bottom">
              <i v-if="scope.row.active" class="iconfont icon-suo1" style="margin-left: 20px;cursor: pointer" @click="validity($event,scope.row)" />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total!==0"
      :total="total"
      :page="page"
      :per_page="size"
      @pagination="pageChange"
    />
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="550px"
      :close-on-click-modal="false"
      @close="cancel"
    >
      <div>
        <el-form ref="ruleForm" :model="ruleForm" :rules="title==='添加用户'?rules:title==='修改资料'?rules1:rules2" label-width="110px" class="demo-ruleForm">
          <template v-if="title==='添加用户'||title==='修改资料'">
            <el-form-item label="用户名：" prop="username">
              <el-input v-model.trim="ruleForm.username" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="电话：" prop="phone">
              <el-input v-model.trim="ruleForm.phone" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="邮箱：" prop="email">
              <el-input v-model.trim="ruleForm.email" placeholder="请输入" />
            </el-form-item>
          </template>
          <template v-if="title==='添加用户'||title==='修改密码'">
            <el-form-item :label="title==='修改密码'?'新密码':'密码'" prop="pass">
              <el-input v-model.trim="ruleForm.pass" type="password" autocomplete="off" />
            </el-form-item>
            <el-form-item :label="title==='修改密码'?'确认新密码':'确认密码'" prop="checkPass">
              <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" />
            </el-form-item>
          </template>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getUserList, addUser, deleteUser, validityUsers, getUserListBySearch, updateUsers, resetpwd } from '@/api/userManage.js'
export default {
  name: 'Index',
  components: { Pagination },
  data() {
    var userName = (rule, value, callback) => {
      var regex = /^[0-9]*$/
      if (value.trim() === '') {
        callback(new Error('请输入用户名'))
      } else {
        if (!regex.test(value)) {
          if (value.indexOf('@') !== -1) {
            callback(new Error('用户名不能包含@，且不能全为数字'))
          } else {
            callback()
          }
        } else {
          callback(new Error('用户名不能包含@，且不能全为数字'))
        }
      }
    }
    var email = (rule, value, callback) => {
      var regex = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
      if (value.trim() === '') {
        callback(new Error('请输入邮箱'))
      } else {
        if (regex.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的邮箱'))
        }
      }
    }
    var phone = (rule, value, callback) => {
      var regex = /^1\d{10}$/
      if (value.trim() === '') {
        callback(new Error('请输入手机号'))
      } else {
        if (regex.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的手机号'))
        }
      }
    }
    var pass = (rule, value, callback) => {
      var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\s\S]{8,}$/
      if (value.trim() === '') {
        callback(new Error('请输入密码'))
      } else {
        if (regex.test(value)) {
          callback()
        } else {
          callback(new Error('密码至少8个字符并且至少包含1个大写字母，1个小写字母和1个数字'))
        }
      }
    }
    var pass1 = (rule, value, callback) => {
      if (value.trim() === '') {
        callback(new Error('请输入密码'))
      } else {
        if (value !== this.ruleForm.pass) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }
    }
    return {
      keyWords: '',
      sate: 'all',
      options: [
        { label: '全部', value: 'all' },
        { label: '未激活', value: 'not_active' }
      ],
      tableData: [],
      selectRows: [],
      dialogVisible: false,
      title: '添加用户',
      ruleForm: {
        username: '',
        phone: '',
        email: '',
        pass: '',
        checkPass: ''
      },
      rules: {
        username: [
          { required: true, validator: userName, trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: phone, trigger: 'blur' }
        ],
        email: [
          { required: true, validator: email, trigger: 'blur' }
        ],
        pass: [
          { required: true, validator: pass, trigger: 'blur' }
        ],
        checkPass: [
          { required: true, validator: pass1, trigger: 'blur' }
        ]
      },
      rules1: {
        username: [
          { required: true, validator: userName, trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: phone, trigger: 'blur' }
        ],
        email: [
          { required: true, validator: email, trigger: 'blur' }
        ]
      },
      rules2: {
        pass: [
          { required: true, validator: pass, trigger: 'blur' }
        ],
        checkPass: [
          { required: true, validator: pass1, trigger: 'blur' }
        ]
      },
      page: 1,
      size: 10,
      total: 0,
      loading: false,
      updateId: ''
    }
  },
  mounted() {
    this.getUserList()
  },
  methods: {
    search() {
      this.page = 1
      this.sate = 'all'
      if (this.keyWords === '' || this.keyWords.trim() === '') {
        this.getUserList()
      } else {
        this.getUserListBySearch()
      }
    },
    typeChange() {
      this.page = 1
      this.keyWords = ''
      this.getUserList()
    },
    handleSelectionChange(val) {
      this.selectRows = val
    },
    rowClick(row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    clickAdd() {
      this.dialogVisible = true
      this.title = '添加用户'
    },
    edit(event, type, row) {
      event.stopPropagation()
      this.dialogVisible = true
      this.updateId = row.id
      if (type === 1) {
        this.title = '修改资料'
        this.ruleForm = {
          username: row.username,
          phone: row.phone,
          email: row.email
        }
      } else {
        this.title = '修改密码'
        this.ruleForm = {
          pass: '',
          checkPass: ''
        }
      }
    },
    deleteOne(event, id) {
      event.stopPropagation()
      this.$confirm('是否确认删除此用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteUser(id)
      }).catch(e =>{
        this.$message('取消删除');
        this.$refs.searchKey.focus()
        this.$refs.searchKey.blur()
      })
    },
    validity(event, row) {
      event.stopPropagation()
      var title = row.active ? '确定取消激活用户' + row.username + '吗?' : '确定激活用户' + row.username + '吗?'
      var params = {}
      params[row.id] = !row.active
      this.$confirm(title, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.validityUsers({ users: params })
      })
    },
    cancelValidity() {
      var params = {}; var list = []
      this.selectRows.map(value => {
        if (value.active) {
          list.push(value.username)
          params[value.id] = false
        }
      })
      if (list.length) {
        var title = '确定取消激活下列用户 ' + list.join(',') + ' 吗'
        this.$confirm(title, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.validityUsers({ users: params })
        })
      } else {
        this.$message.error('没有需要取消激活的用户')
      }
    },
    cancel() {
      this.ruleForm = {
        username: '',
        phone: '',
        email: '',
        pass: '',
        checkPass: ''
      }
      this.$refs.ruleForm.clearValidate()
      this.dialogVisible = false
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          if (this.title === '添加用户') { this.addUser() }
          if (this.title === '修改资料') { this.updateUsers() }
          if (this.title === '修改密码') { this.resetpwd() }
          // this.dialogVisible = false
        } else {
          return false
        }
      })
    },
    pageChange(params) {
      this.page = params.page
      this.size = params.per_page
      this.getUserList()
    },
    getUserList() {
      this.loading = true
      this.selectRows = []
      var params = {
        page: this.page,
        per_page: this.size,
        filter: this.sate,
        order: 'created_at'
      }
      getUserList(params).then(data => {
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
    },
    addUser() {
      addUser({
        email: this.ruleForm.email,
        password: this.ruleForm.pass,
        phone: this.ruleForm.phone,
        username: this.ruleForm.username
      }).then(data => {
        if (data.code === 200) {
          this.dialogVisible = false
          this.$message.success('添加成功')
          this.getUserList()
        }else{
          this.$message.error(data.message)
        }
      }).catch(e=>{
        // this.$message.error(e.response.data.message)
        this.$message.error('接口调用失败');
      })
    },
    deleteUser(id) {
      deleteUser(id).then(data => {
        if (data.code === 200) {
          this.$message.success('删除成功')
          this.getUserList()
        }else{
          this.$message.error(data.message)
        }
      }).catch(e=>{
        this.$message(e.response.data.message)
      })
    },
    validityUsers(params) {
      validityUsers(params).then(data => {
        if (data.code === 200) {
          this.$message.success('操作成功')
          this.getUserList()
        }
      })
    },
    getUserListBySearch() {
      this.loading = true
      this.selectRows = []
      var params = {
        page: this.page,
        per_page: this.size,
        email: this.keyWords
      }
      getUserListBySearch(params).then(data => {
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
    },
    updateUsers() {
      updateUsers(this.updateId, this.ruleForm).then(data => {
        if (data.code === 200) {
          this.$message.success('修改成功')
          this.getUserList()
        }
        this.dialogVisible = false
      }).catch(e=>{
        this.$message.error(e.response.data.message)
      })
    },
    resetpwd() {
      resetpwd(this.updateId, { password: this.ruleForm.pass }).then(data => {
        if (data.code === 200) {
          this.$message.success('修改成功')
          this.getUserList()
        }else{
          this.$message.error(data.message)
        }
        this.dialogVisible = false
      }).catch(e=>{
        this.dialogVisible = false
        this.$message.error(e.response.data.message)
      })
    }
  }
}
</script>

<style scoped>

</style>
