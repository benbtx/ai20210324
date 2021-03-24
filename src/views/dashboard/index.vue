<template>
  <div id="container1" class="app-container" style="height: calc(100vh - 50px);background-color: #f4f6f8;">
    <el-row :gutter="20">
      <el-col :span="4">
        <div class="statistics"><i class="iconfont icon-shujuguanli" />数据 {{ num.dataSetCount }}</div>
      </el-col>
      <el-col :span="4">
        <div class="statistics"><i class="iconfont icon-gongzuo" />项目 {{ num.workSpaceCount }}</div>
      </el-col>
      <el-col :span="4">
        <div class="statistics"><i class="iconfont icon-shujuwajue" />挖掘 {{ num.workFileCount }}</div>
      </el-col>
      <el-col :span="4">
        <div class="statistics"><i class="iconfont icon-task" />任务 {{ num.jobCount }}</div>
      </el-col>
      <el-col :span="4">
        <div class="statistics"><i class="iconfont icon-moxing" />模型 {{ num.modelCount }}</div>
      </el-col>
      <el-col :span="4">
        <div class="statistics"><i class="iconfont icon-fuwuqi" />服务 {{ num.modelServerCount }}</div>
      </el-col>
    </el-row>
    <div id="middle" />
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="bottom">
          <el-table
            :data="tableData2"
            tooltip-effect="dark"
            row-class-name="dashboardRow"
          >
            <el-table-column
              show-overflow-tooltip
              label="工作项目"
            >
              <template slot-scope="scope"><span style="cursor: pointer" @click="handleClick(scope.row)">{{ scope.row.name }}</span></template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              label="拥有者"
            >
              <template slot-scope="scope">{{ scope.row.owner.username }}</template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              width="160"
              label="最后修改时间"
            >
              <template slot-scope="scope">{{ $dayjs(scope.row.updated_at).format('YYYY-MM-DD HH:mm:ss') }}</template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="bottom">
          <el-table
            :data="tableData1"
            tooltip-effect="dark"
            row-class-name="dashboardRow"
          >
            <el-table-column
              show-overflow-tooltip
              prop="name"
              label="数据挖掘"
            >
               <template slot-scope="scope"><span  style="cursor: pointer" @click="handleWorkflow( scope.row)">{{ scope.row.name }}</span></template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              width="160"
              label="所属项目"
            >
              <template slot-scope="scope">{{ scope.row.workspace.name }}</template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              label="拥有者"
            >
              <template slot-scope="scope">{{ scope.row.owner.username }}</template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              width="160"
              label="创建时间"
            >
              <template slot-scope="scope">{{ $dayjs(scope.row.created_at).format('YYYY-MM-DD HH:mm:ss') }}</template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="bottom">
          <el-table
            :data="tableData"
            tooltip-effect="dark"
            row-class-name="dashboardRow"
          >
            <el-table-column
              show-overflow-tooltip
              prop="userName"
              label="操作人"
            />
            <el-table-column
              show-overflow-tooltip
              prop="objectName"
              label="操作对象"
            />
            <el-table-column
              show-overflow-tooltip
              prop="logTypeName"
              label="操作名称"
            />
            <el-table-column
              show-overflow-tooltip
              width="160"
              label="创建时间"
            >
              <template slot-scope="scope">{{ $dayjs(scope.row.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getLogList } from '@/api/logManage.js'
import { getNum, getWorkFiles, getWorkSpace, getLine } from '@/api/dashboard.js'
export default {
  name: 'Dashboard',
  data() {
    return {
      date: [this.$dayjs(new Date().getTime() - 3600 * 1000 * 24 * 365).format('YYYY-MM-DD'), this.$dayjs(new Date()).format('YYYY-MM-DD')],
      tableData: [],
      tableData1: [],
      tableData2: [],
      num: {
        'dataSetCount': 0,
        'workSpaceCount': 0,
        'modelServerCount': 0,
        'workFileCount': 0,
        'modelCount': 0,
        'jobCount': 0
      }
    }
  },
  mounted() {
    document.getElementById('middle').style.height = document.getElementById('container1').offsetHeight - 386 + 'px'
    this.lineChart()
    this.getLogList()
    this.getNum()
    this.getWorkFiles()
    this.getWorkSpace()
    this.getLine()
  },
  methods: {
    handleWorkflow(row){
       this.$router.push({ path: '/gzxm/' + row.workspace.id + '/workfiles/' + row.id + '/index', query: { id: row.workspace.id ,gzlid:row.id,name:row.name}})
    },
    lineChart(series, x) {
      var myChart = echarts.init(document.getElementById('middle'))
      var option = {
        xAxis: {
          data: x,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 30,
          right: 50,
          bottom: 30,
          top: 40,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ['数据', '项目', '挖掘', '任务', '模型', '服务']
        },
        series: series
      }
      myChart.setOption(option, true)
    },
    getLogList() {
      getLogList({
        from: this.date[0],
        to: this.date[1],
        page: 1,
        per_page: 5
      }).then(data => {
        if (data.code === 200) {
          this.tableData = data.response.content
        } else {
          this.tableData = []
        }
      }).catch(() => {
        this.tableData = []
      })
    },
    getNum() {
      getNum().then(data => {
        if (data.code === 200) {
          this.num = data.response.content
        }
      })
    },
    getWorkFiles() {
      getWorkFiles().then(data => {
        if (data.code === 200) {
          this.tableData1 = data.response.content
        } else {
          this.tableData1 = []
        }
      }).catch(() => {
        this.tableData1 = []
      })
    },
    getWorkSpace() {
      getWorkSpace().then(data => {
        if (data.code === 200) {
          this.tableData2 = data.response.content
        } else {
          this.tableData2 = []
        }
      }).catch(() => {
        this.tableData2 = []
      })
    },
    handleClick(row) {
      this.$router.push({
        path: '/gzkj/86/datasets',
        query: {
          id: row.id
        }
      })
    },
    getLine() {
      getLine().then(data => {
        if (data.code === 200) {
          var all = data.response.content
          var name = {
            unionDataSetMaps: '数据',
            workSpaceMaps: '项目',
            workFileMaps: '挖掘',
            jobMaps: '任务',
            modelMaps: '模型',
            modelServerSpaceMaps: '服务'
          }
          var series = []; var x = []
          for (const k in all.unionDataSetMaps) {
            x.push(k)
          }
          x = x.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          for (const key in all) {
            var y = []
            var params = {
              name: name[key],
              smooth: true,
              type: 'line',
              data: y,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }
            for (let n = 0; n < x.length; n++) {
              y.push(all[key][x[n]])
            }
            series.push(params)
            this.lineChart(series, x)
          }
        }
      })
    }
  }
}
</script>
<style scoped>
  .statistics{
    height: 100px;
    background-color: #fff;
    border-radius: 5px;
    line-height: 100px;
    text-align: center;
    font-size: 30px;
  }
  .statistics i{
    font-size: 30px;
    color: #1890ff;
    padding-right: 20px;
  }
  .bottom{
    padding: 0 20px;
    height: 206px;
    background-color: #fff;
    border-radius: 5px;
  }
  #middle{
    margin: 20px 0;
    background-color: #fff;
    border-radius: 5px;
  }
</style>
<style>
  .dashboardRow td{
   padding: 4px 0;
  }
</style>
