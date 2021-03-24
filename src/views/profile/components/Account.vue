<template>
  <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm">
    <!-- <el-form-item label="用户">
      <el-input v-model.trim="user.name" />
    </el-form-item>
    <el-form-item label="邮件">
      <el-input v-model.trim="user.email" />
    </el-form-item> -->
    <el-form-item label="旧密码" prop="oldPass">
      <el-input type="password" v-model="ruleForm.oldPass" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="新密码" prop="pass">
      <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="确认新密码" prop="checkPass">
      <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">更新密码</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { resetUserPwd } from '@/api/userManage.js'
export default {
  data(){
    var validatePass = (rule, value, callback) => {
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
    var validatePass2 = (rule, value, callback) => {
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
      // oldPwd: '',
      newPwd: '',
      newPwd2: '',
      ruleForm: {
        oldPass:'',
        pass: '',
        checkPass: '',
      },
      rules: {
        oldPass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        // age: [
        //   { validator: checkAge, trigger: 'blur' }
        // ]
      },
    }
  },
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: ''
        }
      }
    }
  },
  methods: {
    submit() {
      // if (this.newPwd !== this.newPwd2) {
      //   this.$message({type: "error", message: "两次输入密码不一致"});
      //   return;
      // }
      // this.$message({
      //   message: 'User information has been updated successfully',
      //   type: 'success',
      //   duration: 5 * 1000
      // })
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.resetpwd()
          this.dialogVisible = false
        } else {
          return false
        }
      })
    },
    resetpwd() {
      // let userInfo=JSON.parse(localStorage.getItem('userInfo'));
      resetUserPwd({ new_password:this.ruleForm.pass,old_password: this.ruleForm.oldPass }).then(data => {
        if (data.code === 200) {
          this.$message.success('修改成功')
        }else{
          this.$message(data.message)
        }
      }).catch(error => {
        this.$message.error('密码错误')
      })
    }
  }
}
</script>
