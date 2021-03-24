<template>
  <div class="main-box">
    <div class="main-left">
      <div style="height: 38px">
        <el-input
          v-model="keyWords"
          size="medium"
          style="margin-top: 1px"
          placeholder="搜索算子"
          suffix-icon="el-icon-search"
        />
      </div>
      <el-collapse>
        <el-collapse-item name="1">
          <template slot="title">
            <div class="tabTitle" style="padding-left: 5px">数据</div>
          </template>
          <draggable v-for="(item,index) in dataList" :key="index" :options="{ sort: false }" style="margin-top: 10px;margin-left: 20px">
            <span class="dragTree" @dragstart="dataDragstart(item)">{{ item.file.dataset.name }}</span>
          </draggable>
        </el-collapse-item>
        <el-collapse-item name="2">
          <template slot="title">
            <div class="tabTitle" style="padding-left: 5px">算子</div>
          </template>
          <el-tree
            class="tabContent"
            ref="tree"
            :data="tree"
            node-key="id"
            :highlight-current="false"
            :expand-on-click-node="true"
            :filter-node-method="filterOperators"
            :render-content="renderContent"
          />
        </el-collapse-item>
        <el-collapse-item title="模型" name="3">
          <template slot="title">
            <div class="tabTitle" style="padding-left: 5px">模型</div>
          </template>
          模型
        </el-collapse-item>
      </el-collapse>

    </div>
    <div id="full" class="main-right">
      <div class="toolbar box-shadow">
        <span style="display: inline-block; padding: 5px 20px;font-weight: 600">{{ $route.query.name }}</span>
        <div style="float: right">
          <div class="normal-button" style="border:0px" >
            <el-dropdown size="mini"  split-button type="primary" @click="runWorkfile" @command="handleCommand">
              <i class="iconfont icon-yunhang" v-show="!loading"/> 
              <i class="el-icon-loading" v-show="loading"/>运行
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="yq" v-bind:class="{ 'active': yq }" >大数据平台</el-dropdown-item>
                <el-dropdown-item :command="yq" v-bind:class="{ 'active': !yq }" >本地执行引擎</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <!-- <div class="normal-button" @click="runWorkfile"><i class="iconfont icon-yunhang" /> 运行</div> -->
          <div class="normal-button" @click="saveWorkfile"><i class="iconfont icon-baocun" /> 保存</div>
          <div class="normal-button" @click="getHistoryLog"><i class="iconfont icon-lishi" /> 历史</div>
          <!-- <div class="normal-button">名称</div> -->
        </div>

      </div>
      <div class="toolbarBottom box-shadow">
        <div v-for="(item, index) in toolbarBottomList" :key="index">
          <el-tooltip
            v-if="item.is"
            :key="item.name"
            class="item"
            effect="dark"
            :content="item.name"
            :hide-after="0"
            popper-class="toolbarBottomTooltip"
            placement="right"
          >
            <div
              style="margin: 20px 12px;font-size: 16px;cursor: pointer"
              @click="toolbarBottomClick(item.name)"
              @mouseenter="tooltipFullscreen('toolbarBottomTooltip')"
            >
              <i :class="item.icon" />
            </div>
          </el-tooltip>
        </div>
        <div>
          <el-tooltip
            class="item"
            effect="dark"
            content="框选节点"
            :hide-after="0"
            popper-class="toolbarBottomTooltip"
            placement="right"
          >

            <div
              style="margin: 20px 12px;font-size: 16px;cursor: pointer"
              :style="toolbarClickType==='框选节点'?'color:#006DFF':''"
              @mouseenter="tooltipFullscreen('toolbarBottomTooltip')"
              @click="toolbarClick('框选节点')"
            >
              <i class="iconfont icon-kuangxuan" style="font-size: 16px" />
            </div>
          </el-tooltip>
        </div>
        <div>
          <el-tooltip
            class="item"
            effect="dark"
            content="原始比例"
            :hide-after="0"
            popper-class="toolbarBottomTooltip"
            placement="right"
          >
            <div
              style="margin: 20px 12px;font-size: 16px;cursor: pointer"
              @mouseenter="tooltipFullscreen('toolbarBottomTooltip')"
              @click="toolbarClick('原始比例')"
            >
              <i class="iconfont icon-huifuyuanshidaxiao" style="font-weight: 700;font-size: 18px" />
            </div>
          </el-tooltip>
        </div>
      </div>
      <div class="rightInfo" :style="isRightInfo?'right:0px':''">
        <div class="rightInfoClose">
          配置详情
          <i class="el-icon-close" @click="isRightInfo = false" />
        </div>
        <div style="height: calc(100% - 41px);overflow-y: auto;padding: 0 10px">
          <el-form label-position="top" size="small ">
            <template v-for="(item,i) in checkNode.parameters">
              <el-form-item v-if="setConfCondition(checkNode.parameters,item)" :key="item.key" :label="item.key" :rules="[{ required: !item.isOptional}]">
                <template v-if="item.type==='path'">
                  <!-- <el-input v-model="item.value" /> -->
                  <el-input v-model="item.value"><i slot="suffix" class="el-input__icon el-icon-tickets" @click="handleSelect(i)"></i>
                  </el-input>
                </template>
                <template v-if="item.type==='String'">
                  <el-input v-model="item.value" />
                </template>
                <template v-if="item.type==='Int'">
                  <el-input v-model="item.value" />
                </template>
                <template v-if="item.type==='Boolean'">
                  <el-switch
                    v-model="item.value"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                </template>
                <template v-if="item.type==='Category'">
                  <el-select v-model="item.value" placeholder="请选择">
                    <el-option
                      v-for="it in item.values"
                      :key="it"
                      :label="it"
                      :value="it"
                    />
                  </el-select>
                </template>
                <template v-if="item.type==='Double'">
                  <el-input v-model="item.value" />
                </template>
                <template v-if="item.type==='List'">
                  <div class="dataList">
                    <!-- <template v-for="val in item.paramList">
                      <el-form-item v-if="setConfCondition(item.paramList,val)" :key="val.key" :label="val.key" :rules="[{ required: !val.isOptional}]">
                        <template v-if="val.type==='path'">
                          <el-input v-model="val.default" />
                        </template>
                        <template v-if="val.type==='String'">
                          <el-input v-model="val.default" />
                        </template>
                        <template v-if="val.type==='Boolean'">
                          <el-switch
                            v-model="val.default"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                          />
                        </template>
                        <template v-if="val.type==='Category'">
                          <el-select v-model="val.default" placeholder="请选择">
                            <el-option
                              v-for="it in val.values"
                              :key="it"
                              :label="it"
                              :value="it"
                            />
                          </el-select>
                        </template>
                        <template v-if="val.type==='Double'">
                          <el-input v-model="val.default" />
                        </template>
                      </el-form-item>
                    </template> -->
                    <!-- //sl  -->
                    <template v-for="val in item.paramList">
                   
                      <!-- <span :key="val.key" :label="val.key"> -->
                      <el-form-item v-if="setConfCondition(item.paramList,val)" :key="val.key" :label="val.key" :rules="[{ required: !val.isOptional}]">
                        <template v-if="val.type==='List'">
                          <div class="dataList">
                        
                            <template v-for="val2 in val.paramList">
                          
                              <!-- <span :key="val2.key" :label="val2.key"> -->
                              <el-form-item v-if="setConfCondition(item.paramList,val)" :key="val2.key" :label="val2.key" :rules="[{ required: !val2.isOptional}]">

                                <template v-if="val2.type==='List'">
                                  <div class="dataList">
                                
                                    <template v-for="val3 in val2.paramList">
                                      
                                      <!-- <span :key="val3.key" :label="val3.key"> -->
                                      <el-form-item v-if="setConfCondition(item.paramList,val)" :key="val3.key" :label="val3.key" :rules="[{ required: !val3.isOptional}]">
                                        <template v-if="val3.type==='List'">
                                          <!-- <template v-if="val.type==='List'">
                                            <el-input v-model="val.default" />
                                          </template> -->
                                        </template>

                                        

                                        <template v-if="val3.type==='path'">
                                          <el-input v-model="val3.value" />
                                        </template>
                                        <template v-if="val3.type==='String'">
                                          <el-input v-model="val3.value" />
                                        </template>
                                        <template v-if="val3.type==='Boolean'">
                                          <el-switch
                                            v-model="val3.value"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                          />
                                        </template>
                                        <template v-if="val3.type==='Category'">
                                          <el-select v-model="val3.value" placeholder="请选择">
                                            <el-option
                                              v-for="it in val3.values"
                                              :key="it"
                                              :label="it"
                                              :value="it"
                                            />
                                          </el-select>
                                        </template>
                                        <template v-if="val3.type==='Double'">
                                          <el-input v-model="val3.value" />
                                        </template>
                                      <!-- </span> -->
                                      </el-form-item>
                                    </template>
                                  </div>



                                </template>


                                <!-- aaa -->
                                <template v-if="val2.type==='path'">
                                  <el-input v-model="val2.value" />
                                </template>
                                <template v-if="val2.type==='String'">
                                  <el-input v-model="val2.value" />
                                </template>
                                <template v-if="val2.type==='Boolean'">
                                  <el-switch
                                    v-model="val2.value"
                                    active-color="#13ce66"
                                    inactive-color="#ff4949"
                                  />
                                </template>
                                <template v-if="val2.type==='Category'">
                                  <el-select v-model="val2.value" placeholder="请选择">
                                    <el-option
                                      v-for="it in val2.values"
                                      :key="it"
                                      :label="it"
                                      :value="it"
                                    />
                                  </el-select>
                                </template>
                                <template v-if="val2.type==='Double'">
                                  <el-input v-model="val2.value" />
                                </template>
                              <!-- </span> -->
                            </el-form-item>
                            </template>
                          </div>



                        </template>
                        
                       


                        
                        <template v-if="val.type==='path'">
                          <el-input v-model="val.value" />
                        </template>
                        <template v-if="val.type==='String'">
                          <el-input v-model="val.value" />
                        </template>
                        <template v-if="val.type==='Boolean'">
                          <el-switch
                            v-model="val.value"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                          />
                        </template>
                        <template v-if="val.type==='Category'">
                          <el-select v-model="val.value" placeholder="请选择">
                            <el-option
                              v-for="it in val.values"
                              :key="it"
                              :label="it"
                              :value="it"
                            />
                          </el-select>
                        </template>
                        <template v-if="val.type==='Double'">
                          <el-input v-model="val.value" />
                        </template>
                    
                      <!-- </span> -->
                    </el-form-item>
                    <!-- //sl  -->

                    </template>
                  </div>
                </template>
              </el-form-item>
            </template>
          </el-form>
        </div>
      </div>
      <div class="tooltip">
        <ul>
          <li v-for="item in tooltip" :key="item.type">
            <div :style="'background-color:'+item.color" />
            {{ item.type }}
          </li>
          <li><div style="border-radius: 0px;background-color: black" />可连接多个输出</li>
          <li><div style="background-color: black" />只能连接单个输出</li>
        </ul>
      </div>
      <div id="main" class="graphBox" />
      <el-dialog
        title=""
        width="60%"
        :withHeader="false"
        :visible.sync="drawer"
        :append-to-body="true"
        direction="btt">
        <div style="display:flex">
          
          <div style="min-width:700px;">
            <el-table
              ref="logTable"
              :data="this.logData"
              width="100%"
              height="600"
              tooltip-effect="dark"
              style="height:100%;width: 100%;"
              @row-click="rowLogClick"
            >
              <el-table-column
                label="类型"
                width="50"
              >手动
                <!-- <template slot-scope="{ row }">{{row||"手动"}}</template> -->
              </el-table-column>
              <el-table-column
                label="开始时间"
                 width="160"
              >
                <template slot-scope="scope">{{ $dayjs(scope.row.started_at).format('YYYY-MM-DD HH:mm:ss') }}</template>
              </el-table-column>
              <el-table-column
                label="结束时间"
                 width="160"
              >
                <template slot-scope="scope">{{ scope.row.finished_at!=0?$dayjs(scope.row.finished_at).format('YYYY-MM-DD HH:mm:ss'):'-' }}</template>
              </el-table-column>
              <el-table-column
                label="总耗时"
              >
              <template slot-scope="{ row }">{{ row.finished_at!=0?formatTime(row.finished_at-row.started_at):'-'  }}</template>
              </el-table-column>
              <el-table-column
                label="状态"
              >
                <template slot-scope="{ row }">{{ row.status }}</template>
              </el-table-column>
               <el-table-column
                label="备注"
              >
                <template slot-scope="{ row }">{{ row.message }}</template>
              </el-table-column>
              <el-table-column
                label="日志"
                align="left"
              >
              
                <template slot-scope="scope">
                  <div>
                    <a :href="href" :download="downloadName">
                      <i v-if="scope.row.status=='FAILED'||scope.row.status=='SUCCESS'" class="el-icon-download" style="margin-left: 20px;cursor: pointer" @click="downLog(scope.row,$event)" />
                    </a>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div style="flex:1">
            <div style="margin-top: 15px;margin-left:20px">算子运行记录</div>
            <ul style="    margin-left: 20px;padding: 8px 20px;">
               <li  v-for="item in curLog" :key="item.id" style="font-weight: bold;">
                  {{item.name}}
                 <div style="    margin: 10px;"> {{item.status}}</div>
               </li>
               
            </ul>
          </div>

        </div>
      
      </el-dialog>

    </div>
    <el-dialog
      title="请选择数据文件"
      :visible.sync="dialogVisible"
      width="30%">


       <el-table
        ref="multipleTable"
        :data="this.dataList"
        tooltip-effect="dark"
        style="width: 100%;margin-top: 20px"
        @row-click="rowClick"
      >
        <el-table-column
          label="名称"
        >
          <template slot-scope="{ row }"><span style="cursor: pointer" @click="inDir(row,$event)"><i class="iconfont icon-biaoge" style="margin-right: 10px" />{{ row.file.dataset.name }}</span></template>
        </el-table-column>
        <!-- <el-table-column
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
              <el-tooltip content="预览" placement="bottom">
                <i v-if="scope.row.view_status==='READY'" class="iconfont icon-yulan" style="margin-left: 20px;cursor: pointer" @click="view(scope.row,$event)" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column> -->
      </el-table>
    </el-dialog>


    
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import { cloneDeep } from 'loadsh'
import * as d3 from 'd3'

import wenjian from '@/assets/images/wenjian.png'
import { getToken } from '@/utils/auth' // get token from cookie
import { getOperators, getDatalinks, getModels, getWorkFlowLatest, saveWorkFlow, runWorkFlow, getHistory } from '@/api/workflow.js'
export default {
  name: 'Workfile',
  components: {
    draggable
  },
   filters: {
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
      keyWords: '',
      isRightInfo: false,
      dataList: [],
      tree: [{
        'id': 26,
        'name': 'TENSORFLOW',
        'description': 'TENSORFLOW',
        'operators': [],
        'children': [
          {
            'id': 27,
            'name': '算法SDK',
            'description': '算法SDK',
            'children': [
              {
                'name': 'ExecuteScript',
                'displayName': '执行TF脚本',
                'category': '算法SDK',
                'description': '上传代码并执行TensorFlow训练',
                'type': 'TENSORFLOW',
                'parameters': [
                  { 'key': 'code_file', 'type': 'path', 'default': '', 'description': '代码压缩包地址', 'selector': 'normal', 'isOptional': false, 'isDeprecated': false, 'isSensitive': false, 'isNumerical': false, 'isExpert': false, 'hide': false, 'condition': null },
                  { 'key': 'main_class_path', 'type': 'String', 'default': '', 'description': '主文件相对路径', 'selector': null, 'isOptional': false, 'isDeprecated': false, 'isSensitive': false, 'isNumerical': false, 'isExpert': false, 'hide': false, 'condition': null }],
                'inports': [{ 'name': 'data_in', 'type': 'TB', 'multiSource': true, 'isOptional': false }], 'outports': [{ 'name': 'board_out', 'type': 'TB', 'multiSource': true, 'isOptional': false }] }, { 'name': 'ReadHDFS', 'displayName': '读取HDFS文件', 'category': '算法SDK', 'description': '读取HDFS文件数据', 'type': 'TENSORFLOW', 'parameters': [{ 'key': 'dataList', 'type': 'List', 'default': '', 'description': '数据集合', 'selector': null, 'isOptional': false, 'isDeprecated': false, 'isSensitive': false, 'isNumerical': false, 'isExpert': false, 'hide': false, 'condition': null, 'paramList': [{ 'key': 'key', 'type': 'String', 'default': 'train_data', 'description': '数据key值', 'selector': null, 'isOptional': false, 'isDeprecated': false, 'isSensitive': false, 'isNumerical': false, 'isExpert': false, 'hide': false, 'condition': null }, { 'key': 'path', 'type': 'path', 'default': '', 'description': '数据hdfs路径', 'selector': 'normal', 'isOptional': false, 'isDeprecated': false, 'isSensitive': false, 'isNumerical': false, 'isExpert': false, 'hide': false, 'condition': null }] }], 'inports': [], 'outports': [{ 'name': 'data_out', 'type': 'TB', 'multiSource': true, 'isOptional': false }] }] }] }
      ],
      toolbarBottomList: [
        { name: '全屏', icon: 'iconfont icon-quanping1', is: true },
        { name: '退出全屏', icon: 'iconfont icon-shirk-screen', is: false },
        { name: '放大', icon: 'iconfont icon-fangda', is: true },
        { name: '缩小', icon: 'iconfont icon-suoxiao', is: true }
      ],
      // 图形参数
      nodesData: [],
      linksData: [],
      nodes: '',
      links: '',
      makers: '',
      container: '',
      linksGroup: '',
      nodesGroup: '',
      makersGroup: '',
      isMouseDown: false,
      timestamp: new Date().getTime(),
      nodeId: 0,
      dragNode: '',
      lineConf: {
        strokeColor: '#7a7b85',
        lineTextFontSize: 12,
        strokeWidth: 2
      },
      nodeConf: {
        fillColor: '#fff',
        innerFillColor: '#e8f4ff',
        borderColor: '#c9c9c9',
        innerBorderColor: '#1490FF',
        strokeColor: 'none',
        strokeWidth: 1,
        textFillColor: '#1490FF',
        textFontSzie: 14,
        height: 40,
        width: 220,
        cricleR: 5
      },
      isConnect: false,
      startNode: '',
      line_generator: '',
      toolbarClickType: '',
      isDeleteNodes: false,
      checkNode: '',
      checkList: [],
      checkLine: [],
      tooltip: [
        { type: 'DATA', color: '#006DFF' },
        { type: 'MODEL', color: '#09BB07' },
        { type: 'VIEW', color: '#F7B500' },
        { type: 'TB', color: '#F56C6C' }
      ],

      // 图形配置项
      scaleExtent: [0.2, 3], // 缩放范围
      width: '',
      height: '',
      yq:0,//0 本地 1 大数据平台
      dialogVisible: false,
      curPathIndex:0,//当前path在parameter的索引 ，默认第一个，有多个path 也可区分
      loading: false,
      drawer: false,
      logData:[],
      curLog:null,
      href:"",
      downloadName:"log",
    }
  },
  watch: {
    checkList() {
      this.changeCheckStatu()
      if (this.checkList.length === 0) {
        this.isRightInfo = false
      }
    },
    checkLine() {
      this.changeCheckLineStatu()
    },
    keyWords(val) {
      this.$refs.tree.filter(val)
    }
  },

  created() {
    this.$route.meta.title = this.$route.query.name
  },
  mounted() {
    this.getOperators()
    this.getModels()
    window.addEventListener('resize', this.resize)
    window.addEventListener('mouseup', this.mouseUp)
    this.createEventListener()
    document.getElementById('main').oncontextmenu = function() {
      return false
    }
    this.width = document.getElementById('main').offsetWidth
    this.height = document.getElementById('main').offsetHeight
    document.addEventListener('fullscreenchange', () => {
      var userAgent = navigator.userAgent
      var isFull
      if (userAgent.indexOf('Firefox') > -1) {
        // 判断是否Firefox浏览器
        isFull = document.mozFullScreen
      }
      if (userAgent.indexOf('Chrome') > -1) {
        isFull = document.webkitIsFullScreen
      }
      this.toolbarBottomList.map(value => {
        if (value.name === '全屏') {
          value.is = !isFull
        }
        if (value.name === '退出全屏') {
          value.is = isFull
        }
      })
    })
    this.createSvg()
    //获取当前项目数据进行恢复
    this.getWorkFlowData()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('mouseup', this.mouseUp)
  },
  methods: {
    downLog(row){
      let url="http://192.168.7.241:9090/workspaces/117/workfiles/138/versions/138/tasks/2562/log?Authorization=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiLlrovlh4wiLCJhdWRpZW5jZSI6IndlYiIsImNyZWF0ZWQiOjE2MTY1NTE3NzE3MzgsImV4cCI6MTYxNjU2OTc3MX0.7yuUwlwBGMUoivyCNQ1H9e4eip3E_GyeSY2ImU800I_sCY_2yOCap34xt_BD0u10s2_BeZvKd2Py55tAx_4miQ"
      this.href=window.location.origin+"/workspaces/"+this.$route.query.id+"/workfiles/"+this.$route.query.gzlid+"/versions/"+this.$route.query.gzlid+"/tasks/"+row.id+"log?Authorization="+getToken();
      this.downloadName=this.$route.query.name+"_log.zip"
      console.log(this.href)
    },
    filterOperators(value, data) {
      if (!value) return true
      if (data.name && !data.displayName) {
        return data.name.indexOf(value) !== -1
      }
      if (data.displayName) {
        return data.displayName.indexOf(value) !== -1
      }
    },
    handleClick(value){
      alert(value)
    },
    handleCommand(command) {
      // this.$message('click on item ' + command);
      this.yq=!this.yq
    },
    runWorkfile(){
      var engineId=this.yq?1:0;
      let data={
        content: "",
        parameter: "",
        type: "",
      };
      this.loading=true;
      runWorkFlow(this.$route.query.id,this.$route.query.gzlid,engineId,data).then(data => {
        if (data.code === 200) {
          if (data.response.content) {
              this.$message.success('运行成功') 
          }
          this.loading = false
        }
      }).catch(e => {
        this.$message.warning('运行失败')
        this.loading = false
      })
    },
    saveWorkfile(){
      this.nodesData;
      this.linksData;
      let nodes=[];
      let links=[];
      this.nodesData.map(value=>{
        nodes.push({
          children: {},
          height: 40,
          structure: {
            name:value.name, 
            displayName: value.displayName,
            type: value.type, 
            nodeType: value.nodeType, 
            inports: value.inports, 
            outports: value.outports, 
            parameters:value.parameters
          },
          tag: "",
          uuid: value.nodeId,
          width: 220,
          x: value.x,
          y: value.y,
        })
      })
      this.linksData.map(value=>{
        let source=value.source[value.sourceType][value.sourceIndex];
        let target=value.target[value.targetType][value.targetIndex];
        links.push({
          from: {
            isOptional:source.isOptional, 
            multiSource:source.multiSource,
            name: source.name, 
            type: source.type, 
            uuid: value.source.nodeId,
          },
          to: {
            isOptional:target.isOptional, 
            multiSource:target.multiSource,
            name: target.name, 
            type: target.type, 
            uuid: value.target.nodeId,
          },
         
        })
      })


      var data={
        "content": JSON.stringify({operators:nodes,links:links}),
        "description": "",
        "name": this.$route.query.name
      };
      saveWorkFlow(this.$route.query.id,this.$route.query.gzlid,data).then(data => {
        if (data.code === 200) {
          if (data.response.content) {
              this.$message.success('保存成功') 
          }
        }
      }).catch(e => {
        this.$message.warning('操作调用失败')
      })
    },
    getHistoryLog(){
      this.drawer=true;
      var data={
        page: 1,
        per_page: 10000
      };
      getHistory(this.$route.query.id,this.$route.query.gzlid,data).then(data => {
        if (data.code === 200) {
          if (data.response.content) {
            // this.$message.success('获取历史记录成功') 
            this.logData=data.response.content
            if(this.logData.length>0) this.curLog=this.logData[0].operator_statuses
            
          }
        }
      }).catch(e => {
        this.$message.warning('获取历史记录失败')
      })
    },
    formatTime(nTime){
      // 时间戳即毫秒数，86400000/(1000*60*60*24) = 天数
      var day = Math.floor(nTime/86400);    
      // var hour = Math.floor(nTime/86400/3600);    
      // var minute = Math.floor(nTime%86400%3600/60*2);
      // var minute =day*12*60;
      var minute=Math.floor(nTime/60/1000)
      return  minute+" 分钟"
    },
    rowLogClick(row){
      this.curLog=row.operator_statuses;
    },
    handleSelect(i){
      // console.log( this.dataList)
      // console.log( this.dataList[0].file.dataset.path)
      if(this.dataList.length>0) this.dialogVisible=true;
      this.curPathIndex=i
    },
    rowClick(row) {
      this.dialogVisible=false;
      console.log(row.file.dataset.data.connection.path)
      if(this.checkNode.parameters.length>0){
        this.checkNode.parameters.forEach((element,i) => {
          if(i==this.curPathIndex){
             element.default=row.file.dataset.data.connection.path
             element.value=row.file.dataset.data.connection.path

          }
        });
      }
    },
    // 请求算子接口
    getOperators() {
      getOperators().then(data => {
        if (data.code === 200) {
          var csv = {}
          var setData = function(d) {
            if (d.name === 'ReadCSV') {
              csv = d
            }
            if (d.children && !d.children.length && d.operators && d.operators.length) {
              d.children = d.operators
            }
            if (d.children && d.children.length) {
              d.children.map(value => {
                setData(value)
              })
            }
          }
          if (data.response.content) {
            data.response.content.map(value => {
              setData(value)
            })
          }
          this.tree = data.response.content
          this.getDatalinks(csv)
        }
      })
    },

    // 请求数据接口
    getDatalinks(csv) {
      getDatalinks(this.$route.query.id).then(data => {
        this.dataList = []
        if (data.code === 200) {
          if (data.response.content) {
            data.response.content.map(value => {
              var prams = {
                file: value,
                nodeType: 'data',
                ...csv
              }
              prams.parameters[0].default = prams.file.dataset.data.connection.path
              prams.parameters[0].value = prams.file.dataset.data.connection.path
              this.dataList.push(prams)
            })
          }
        }
      })
    },

    // 请求模型接口
    getModels() {
      getModels(this.$route.query.id).then(data => {
        if (data.code === 200) {}
      })
    },

    //如果有数据则恢复数据分析流程
    getWorkFlowData(){
      getWorkFlowLatest(this.$route.query.id,this.$route.query.gzlid).then(data => {
        if (data.code === 200) {
          if (data.response.content) {
            // this.nodesData=JSON.parse(data.response.content.content).operators
            // this.linksData=JSON.parse(data.response.content.content).links
            //构造时间
            this.createNodesLinksData(JSON.parse(data.response.content.content))
            // this.createNodeAndLine()
          }
        }
      })
      // .catch(e => {
      //   this.$message('操作调用失败')
      // })

    },
    createNodesLinksData(data){
      let nodes=data.operators
      let links=data.links
      nodes.map(value=>{
        this.nodesData.push({
          // category: "算法SDK",
          // description: "上传代码并执行TensorFlow训练",
          // displayName: "执行TF脚本",
          inports:value.structure.inports,
          name: value.structure.name,
          displayName: value.structure.displayName,
          nodeId: value.uuid,
          nodeType: value.structure.nodeType,
          outports:value.structure.outports,
          // parameters: value.structure.parameters,//数组 key type value=>default
          parameters: this.addValue(value.structure.parameters),//数组 key type value=>default

          type: value.structure.type,
          x: value.x,
          y: value.y,
        })
        this.createNodeAndLine()
      })
      links.map(value=>{
        let curItemFrom=this.nodesData.filter(item=>{ if (item.nodeId === value.from.uuid) {
              return item
        }});
        let curItemTo=this.nodesData.filter(item=>{ if (item.nodeId === value.to.uuid) {
              return item
        }});
        console.log(1)
        this.linksData.push({
          // source: {
          //   nodeId:value.from.uuid,
          //   inports:nodes.filter(item=>{ if (item.uuid === value.from.uuid) {
          //       return item.structure.inports
          //   } }),
          //   outports:nodes.filter(item=>{ if (item.uuid === value.from.uuid) {
          //       return item.structure.outports
          //   } }),
          //   // x:0,
          //   // y:0
          //   x:nodes.filter(item=>{ if (item.uuid === value.from.uuid) {
          //       return item
          //   } })[0].x,
          //   y:nodes.filter(item=>{ if (item.uuid === value.from.uuid) {
          //       return item
          //   } })[0].y,
          // },
          // target: {
          //   nodeId:value.to.uuid,
          //   inports:nodes.filter(item=>{ if (item.uuid === value.to.uuid) {
          //       return item.structure.inports
          //   } }),
          //   outports:nodes.filter(item=>{ if (item.uuid === value.to.uuid) {
          //       return item.structure.outports
          //   } }),
          //   // x:0,
          //   // y:0
          //   x:nodes.filter(item=>{ if (item.uuid === value.to.uuid) {
          //       return item
          //   } })[0].x,
          //   y:nodes.filter(item=>{ if (item.uuid === value.to.uuid) {
          //       return item
          //   } })[0].y,
          // },

          // source: {
          //   nodeId:value.from.uuid,
          //   inports:nodes.filter(item=>{ if (item.uuid === value.from.uuid) {
          //       return item.structure.inports
          //   } }),
          //   outports:nodes.filter(item=>{ if (item.uuid === value.from.uuid) {
          //       return item.structure.outports
          //   } }),
          //   x:this.nodesData.filter(item=>{ if (item.nodeId === value.from.uuid) {
          //       return item
          //   } })[0].x,
          //   y:this.nodesData.filter(item=>{ if (item.nodeId === value.from.uuid) {
          //       return item
          //   } })[0].y,
          // },
          // target: {
          //   nodeId:value.to.uuid,
          //   inports:nodes.filter(item=>{ if (item.uuid === value.to.uuid) {
          //       return item.structure.inports
          //   } }),
          //   outports:nodes.filter(item=>{ if (item.uuid === value.to.uuid) {
          //       return item.structure.outports
          //   } }),
          //   x:this.nodesData.filter(item=>{ if (item.nodeId === value.to.uuid) {
          //       return item
          //   } })[0].x,
          //   y:this.nodesData.filter(item=>{ if (item.nodeId === value.to.uuid) {
          //       return item
          //   } })[0].y,
          // },
          source:curItemFrom[0],
          target:curItemTo[0],
          // source2:curItemFrom[0],
          // target2:curItemTo[0],
          sourceIndex: 0,
          targetIndex: 0,
          sourceType: 'outports',
          targetType: 'inports',
          id: this.guid()
        });
        this.createNodeAndLine()
      })
    },
    
    //parameters default add value
    addValue(parameters){
      parameters.map(val=>{
        if(val.type=="List"){
          this.addValue(val.paramList)
        }else{
          val.value=val.default
        }
      })

      return parameters
    },

    // 创建事件监听
    createEventListener() {
      const shelf = this
      document.addEventListener('keyup', shelf.keyupEvent)
    },
    // 监听键盘keydup事件
    keyupEvent(event) {
      var e =
        event || window.event || arguments.callee.caller.arguments[0]
      if (e && e.keyCode === 46) {
        this.deleteNodes()
        this.deleteLines()
      }
    },
    renderContent(h, { node, data, store }) {
      data.nodeType = 'operator'
      const shelf = this
      if (node.childNodes.length) {
        return (
          <span class='custom-tree-node'>
            <span>{node.data.name}</span>
          </span>)
      } else {
        return (
          <draggable options={ { sort: false }}>
            <span class='dragTree' ondragstart={() => { shelf.dataDragstart(data) }}>{node.data.displayName}</span>
          </draggable>
        )
      }
    },
    resize() {
      this.setWidthHeight()
    },
    mouseUp() {
      this.isConnect = false
      d3.select('.movePath').remove()
    },
    setWidthHeight() {
      setTimeout(() => {
        this.width = document.getElementById('main').offsetWidth
        this.height = document.getElementById('main').offsetHeight
        d3.select('#main')
          .select('svg')
          .attr('width', this.width)
          .attr('height', this.height)
        this.zoomOverlay
          .attr('width', this.width)
          .attr('height', this.height)
      }, 100)
    },

    dataDragstart(data) {
      this.dragNode = cloneDeep(data)
      console.log(data)
    },

    // 创建图形
    createSvg() {
      const shelf = this
      // 缩放器
      this.zoom = d3.zoom()
        .scaleExtent(this.scaleExtent)
        .on('zoom', this.zoomFn)

      this.drag = d3
        .drag()
        .filter(() => !shelf.isConnect)
        .on('start', this.dragstartFn)
        .on('drag', this.dragFn)
        .on('end', this.dragendFn)

      // SVG
      this.svg = d3
        .select('#main')
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height)

      this.svg
        .on('dragover', () => {
          d3.event.preventDefault()
        })
        .on('drop', () => {
          if (!this.dragNode) {
            return
          }
          const point = this.getMovePath()
          this.dragNode.nodeId = this.guid()
          this.dragNode.x = point[0] - this.nodeConf.width / 2
          this.dragNode.y = point[1] - this.nodeConf.height / 2
          this.addValue(this.dragNode.parameters)
          console.log(this.dragNode)
          this.nodesData.push(this.dragNode)
          this.dragNode = ''
          this.createNodeAndLine()
        })
        .on('click',() =>{
          this.isRightInfo=false
        })
      // 缩放层
      this.zoomOverlay = this.svg
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('class', 'background')
        .style('fill', 'none')
        .style('cursor', 'move')
        .style('pointer-events', 'all')
        .call(this.zoom)
        .on('dblclick.zoom', null)

      this.container = this.svg.append('g').attr('class', 'container')

      // 监听框选事件
      this.selectEvent()

      // 连线组
      this.linksGroup = this.container.append('g').attr('id', 'linkGroup')

      // 节点组
      this.nodesGroup = this.container.append('g')

      // 箭头组
      this.makersGroup = this.container.append('g')

      // 贝塞尔曲线生产器
      this.line_generator = d3.linkVertical().x(d => { return d.x }).y(d => d.y)

      this.bindNodeLine()
    },

    // 缩放和平移
    zoomFn() {
      const { transform } = d3.event
      this.isConnect = false
      this.container.attr('transform', transform)
    },

    // 获取放置点坐标
    getMovePath() {
      const x0 = this.getLeft(document.getElementById('main'))
      const y0 = this.getTop(document.getElementById('main'))
      const transfrom = d3.zoomTransform(this.zoomOverlay.node())
      const offsetX = d3.event.clientX - x0
      const offsetY = d3.event.clientY - y0
      const x = offsetX / transfrom.k - transfrom.x / transfrom.k
      const y = offsetY / transfrom.k - transfrom.y / transfrom.k
      return [x, y]
    },

    // 获取左偏移
    getLeft(e) {
      let offset = e.offsetLeft
      if (e.offsetParent != null) offset += this.getLeft(e.offsetParent)
      return offset
    },

    // 获取上偏移
    getTop(e) {
      let offset = e.offsetTop
      if (e.offsetParent != null) offset += this.getTop(e.offsetParent)
      return offset
    },
    // 开始移动
    dragstartFn() {},
    // 拖动中
    dragFn(d) {
      // this.bindNodeLine()
      d.x = d3.event.x
      d.y = d3.event.y
      this.updateNodeLine()
    },

    // 拖动结束
    dragendFn(d) {
      d.x = d3.event.x
      d.y = d3.event.y
    },

    // 创建节点，边，maker
    createNodeAndLine() {
      var makers = this.makersGroup
        .selectAll('.maker')
        .data(this.linksData)
        .enter()

      makers
        .append('marker')
        .attr('class', 'maker')
        .attr('id', line => 'maker' + line.id)
        .attr('markerUnits', 'userSpaceOnUse')
        .style('fill', this.lineConf.strokeColor)
        .attr('markerWidth', 15)
        .attr('markerHeight', 10)
        .attr('refX', 10)
        .attr('viewBox', '0 -5 10 10')
        .attr('orient', 'auto')
        .append('path')
        .style('stroke', this.lineConf.strokeColor)
        .attr('d', 'M0,-5L10,0L0,5')

      // 节点g
      var enterNode = this.nodesGroup
        .selectAll('.node')
        .data(this.nodesData)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('id', node => 'node-' + node.nodeId)
        .attr(
          'transform',
          node => 'translate(' + node.x + ',' + node.y + ')'
        )
        .on('click', node => {
          event.stopPropagation();
          node.parameters.map(value => {
            if (value.type === 'Boolean' && typeof (value.default) === 'string') {
              value.default = value.default === 'true'
              value.value = value.value === 'true'
            }
            if (value.paramList!=undefined&&value.type === "List") {
              value.paramList.map(val=>{
                if (val.type === 'Boolean' && typeof (val.default) === 'string') {
                  val.default = val.default === 'true'
                  val.value = val.value === 'true'
                }
                if (val.paramList!=undefined&&val.type === "List") {
                  val.paramList.map(val2=>{
                    if (val2.paramList!=undefined&&val2.type === "List") {
                       console.log('继续List嵌套')
                    }
                    if (val2.type === 'Boolean' && typeof (val2.default) === 'string') {
                      val2.default = val2.default === 'true'
                      val2.value = val2.value === 'true'
                    }
                    
                  })
                 
                }
              })
             
            }
          })
          this.isRightInfo = true
          this.checkLine = []
          this.checkList = [node]
          this.checkNode = node
        })
        // .on('mouseup', node => {
        //   if (d3.event.button === 2) {
        //     if (this.checkList.findIndex(d => d.nodeId === node.nodeId) === -1) {
        //       this.checkList = [node]
        //     }
        //     console.log('弹出菜单')
        //   }
        // })
        .call(this.drag)
      enterNode
        .append('rect')
        .attr('class', 'checkRect')
        .attr('width', this.nodeConf.width + 4)
        .attr('height', this.nodeConf.height + 4)
        .attr('rx', 5)
        .attr('x', -2)
        .attr('y', -2)
        .attr('fill', 'none')
        .style('stroke', '#006DFF')
        .style('display', 'none')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '3 2')
      enterNode
        .append('rect')
        .attr('width', this.nodeConf.width)
        .attr('height', this.nodeConf.height)
        .attr('rx', 5)
        .attr('fill', '#fff')
        .style('stroke', this.nodeConf.borderColor)
        .style('stroke-width', this.nodeConf.strokeWidth)
      enterNode
        .append('rect')
        .attr('rx', 5)
        .attr('width', this.nodeConf.height)
        .attr('height', this.nodeConf.height)
        .attr('fill', node => {
          if (node.nodeType === 'data') {
            return '#006DFF'
          }
          if (node.nodeType === 'operator') {
            return '#09BB07'
          }
          if (node.nodeType === 'model') {
            return '#F7B500'
          }
          return '#909399'
        })
      enterNode
        .append('image')
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', 10)
        .attr('y', 10)
        .attr('fill', '#fff')
        .attr('xlink:href', wenjian)

      enterNode
        .append('circle')
        .attr('r', 5)
        .attr('fill', 'green')
        .attr('transform', 'translate(' + (this.nodeConf.width - 20) + ',' + this.nodeConf.height / 2 + ')')

      enterNode
        .append('text')
        .style('font-size', this.nodeConf.textFontSzie)
        .style('font-weight', 400)
        .attr('dx', this.nodeConf.height + 10)
        .attr('dy', 25)
        .text(d => {
          if (d.nodeType === 'data') {
            if (d.file && d.file.dataset) {
              return '读取' + d.file.dataset.name
            }
            return d.displayName||d.name
          }
          if (d.nodeType === 'operator') {
            return d.displayName||d.name
          }
        })

      // 节点连线点
      enterNode.filter(node => {
        if (node.inports && node.inports.length) {
          for (let n = 0; n < node.inports.length; n++) {
            node.inports[n].transformX = this.nodeConf.width / (node.inports.length + 1) * (n + 1)
            node.inports[n].transformY = 0
            if (node.inports[n].multiSource) {
              enterNode
                .append('rect')
                .attr('class', 'nodeCircle')
                .attr('width', this.nodeConf.cricleR * 2)
                .attr('height', this.nodeConf.cricleR * 2)
                .attr('x', -this.nodeConf.cricleR)
                .attr('y', -this.nodeConf.cricleR)
                .attr('transform', this.setOutInPosition('in', node.inports.length, n))
                .attr('fill', this.getColor(node.inports[n].type))
                .style('cursor', 'pointer')
                .on('mouseup', (d) => {
                  if (d3.event.button === 0 && this.isConnect && this.startNode.node.nodeId !== d.nodeId) {
                    if (this.startNode.type === 'outports') {
                      if (this.startNode.node.outports[this.startNode.indexNum].type !== d.inports[n].type) {
                        return
                      }
                      var line = {
                        source: this.startNode.node,
                        target: d,
                        sourceIndex: this.startNode.indexNum,
                        targetIndex: n,
                        sourceType: 'outports',
                        targetType: 'inports',
                        id: this.guid()
                      }
                      if (this.isHaveLink(line)) {
                        return
                      }
                      this.linksData.push(line)
                      this.createNodeAndLine()
                    }
                  }
                })
            } else {
              enterNode
                .append('circle')
                .attr('class', 'nodeCircle')
                .attr('r', this.nodeConf.cricleR)
                .attr('transform', this.setOutInPosition('in', node.inports.length, n))
                .attr('fill', this.getColor(node.inports[n].type))
                .style('cursor', 'pointer')
                .on('mouseup', (d) => {
                  if (d3.event.button === 0 && this.isConnect && this.startNode.node.nodeId !== d.nodeId) {
                    if (this.startNode.type === 'outports') {
                      if (this.startNode.node.outports[this.startNode.indexNum].type !== d.inports[n].type) {
                        return
                      }
                      var line = {
                        source: this.startNode.node,
                        target: d,
                        sourceIndex: this.startNode.indexNum,
                        targetIndex: n,
                        sourceType: 'outports',
                        targetType: 'inports',
                        id: this.guid()
                      }
                      if (this.isHaveLink(line)) {
                        return
                      }
                      this.linksData.push(line)
                      this.createNodeAndLine()
                    }
                  }
                })
            }
          }
        }
        if (node.outports && node.outports.length) {
          for (let n = 0; n < node.outports.length; n++) {
            node.outports[n].transformX = this.nodeConf.width / (node.outports.length + 1) * (n + 1)
            node.outports[n].transformY = this.nodeConf.height
            enterNode
              .append('circle')
              .attr('class', 'nodeCircle')
              .attr('r', this.nodeConf.cricleR)
              .attr('transform', this.setOutInPosition('out', node.outports.length, n))
              .attr('fill', this.getColor(node.outports[n].type))
              .style('cursor', 'pointer')
              .on('mousedown', (d) => {
                if (d3.event.button === 0) {
                  this.isConnect = true
                  d3.select('#main')
                    .select('.container')
                    .select('.movePath').remove()
                  d3.select('#main')
                    .select('.container')
                    .insert('path', '#linkGroup')
                    .attr('class', 'movePath')
                  this.startNode = {
                    node: d,
                    type: 'outports',
                    indexNum: n
                  }
                }
              })
          }
        }
      })

      var links = this.linksGroup
        .selectAll('.link')
        .data(this.linksData)
        .enter()

      links
        .append('path')
        .attr('class', 'link')
        .attr('d', link => this.getLinkPath(link))
        .style('stroke', this.lineConf.strokeColor)
        .style('stroke-width', this.lineConf.strokeWidth)
        .style('cursor', 'pointer')
        .style('fill', 'none')
        .attr(
          'marker-end',
          link => 'url(#maker' + link.id + ')'
        )
        .on('click', line => {
          this.checkLine = [line]
          this.checkList = []
        })
      this.bindNodeLine()
    },

    // 绑定数据
    bindNodeLine() {
      this.nodes = this.nodesGroup
        .selectAll('.node')
        .data(this.nodesData)
      this.links = this.linksGroup
        .selectAll('.link')
        .data(this.linksData)
      this.makers = this.makersGroup
        .selectAll('.maker')
        .data(this.linksData)
    },

    // 更新位置
    updateNodeLine() {
      this.nodes.attr(
        'transform',
        node => 'translate(' + node.x + ',' + node.y + ')'
      )
      this.links.attr('d', link => this.getLinkPath(link))
    },
    //获取连线坐标
    getLinkPath(link) {
      var l = {
        source: {
          x: link.source.x + this.nodeConf.width / (link.source[link.sourceType].length + 1) * (link.sourceIndex + 1) - this.nodeConf.cricleR,//一个或两个点，分成2-3份
          y: link.source.y + (link.sourceType === 'inports' ? 0 : this.nodeConf.height)
        },
        target: {
          x: link.target.x + this.nodeConf.width / (link.target[link.targetType].length + 1) * (link.targetIndex + 1) - this.nodeConf.cricleR,
          y: link.target.y - this.nodeConf.cricleR + (link.targetType === 'inports' ? 0 : this.nodeConf.height)
        }
      }
      var distanceX = (l.target.x - l.source.x) * 0.1
      var distanceY = l.target.y - l.source.y
      var m = l.source.x + ' ' + l.source.y
      var c1
      var c2
      var e = l.target.x + ',' + l.target.y
      if (l.source.y > l.target.y) {
        c1 = l.source.x + distanceX + ' ' + (l.source.y + Math.abs(distanceY) * 2)
        c2 = l.target.x + distanceX + ' ' + (l.target.y - Math.abs(distanceY) * 2)
      } else {
        c1 = l.source.x + distanceX + ' ' + (l.source.y + distanceY / 3 * 2)
        c2 = l.target.x - distanceX + ' ' + (l.target.y - distanceY / 3 * 2)
      }
      return `M${m} C ${c1}, ${c2}, ${e}`
    },

    // 左下角工具栏操作
    toolbarBottomClick(type) {
      var zoom = d3.zoomTransform(this.zoomOverlay.node())
      var x = zoom.x
      var y = zoom.y
      switch (type) {
        case '全屏':
          var fullDiv = document.getElementById('full')
          this.fullscreen(fullDiv)
          this.setWidthHeight()
          break
        case '退出全屏':
          this.fullscreen()
          this.setWidthHeight()
          break
        case '放大':
          zoom.k =
            zoom.k + 0.4 < this.scaleExtent[1]
              ? zoom.k + 0.4
              : this.scaleExtent[1]
          zoom.x = x
          zoom.y = y
          d3.zoom().transform(this.svg, zoom)
          this.container.attr('transform', zoom)
          break
        case '缩小':
          zoom.k =
            zoom.k - 0.2 > this.scaleExtent[0]
              ? zoom.k - 0.2
              : this.scaleExtent[0]
          zoom.x = x
          zoom.y = y
          d3.zoom().transform(this.svg, zoom)
          this.container.attr('transform', zoom)
          break
      }
    },

    tooltipFullscreen(name) {
      var userAgent = navigator.userAgent
      var isFull
      if (userAgent.indexOf('Firefox') > -1) {
        // 判断是否Firefox浏览器
        isFull = document.mozFullScreen
      }
      if (userAgent.indexOf('Chrome') > -1) {
        isFull = document.webkitIsFullScreen
      }
      if (isFull) {
        setTimeout(() => {
          var htmls = document.getElementsByClassName(name)
          for (let n = 0; n < htmls.length; n++) {
            document.getElementById('main').appendChild(htmls[n])
          }
        }, 100)
      } else {
        d3.select('#main')
          .selectAll('.' + name)
          .remove()
      }
    },

    // 全屏
    fullscreen(div) {
      if (!div) {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
      } else {
        // 进入全屏
        if (div.requestFullscreen) {
          div.requestFullscreen()
        } else if (div.webkitRequestFullScreen) {
          div.webkitRequestFullScreen()
        } else if (div.mozRequestFullScreen) {
          div.mozRequestFullScreen()
        } else if (div.msRequestFullscreen) {
          div.msRequestFullscreen()
        }
      }
    },

    // 设置输出和输入点的位置
    setOutInPosition(type, total, n) {
      var r = 5; var width = this.nodeConf.width
      var x = width / (total + 1) * (n + 1) - r
      if (type === 'in') {
        return 'translate(' + x + ',' + 0 + ')'
      } else {
        return 'translate(' + x + ',' + this.nodeConf.height + ')'
      }
    },

    // 判断是否已经有连线
    isHaveLink(link) {
      var is = false
      if (link.target[link.targetType][link.targetIndex].multiSource === true) {
        this.linksData.map(value => {
          if (value.source.nodeId === link.source.nodeId &&
            value.target.nodeId === link.target.nodeId &&
            value.sourceIndex === link.sourceIndex &&
            value.targetIndex === link.targetIndex &&
            value.sourceType === link.sourceType &&
            value.targetType === link.targetType) {
            is = true
          }
        })
      } else {
        this.linksData.map(value => {
          if (value.target.nodeId === link.target.nodeId &&
            value.targetIndex === link.targetIndex &&
            value.targetType === link.targetType) {
            is = true
          }
        })
      }

      return is
    },

    toolbarClick(type) {
      if (type === '框选节点') {
        this.toolbarClickType = this.toolbarClickType === type ? '' : type
        this.isDeleteNodes = this.toolbarClickType === '框选节点'
      }
      if (type === '原始比例') {
        var zoom = d3.zoomTransform(this.zoomOverlay.node())
        zoom.k = 1
        zoom.x = 0
        zoom.y = 0
        d3.zoom().transform(this.zoomOverlay, zoom)
        this.container.attr('transform', zoom)
      }
      this.zoomOverlay.style(
        'cursor',
        this.isDeleteNodes ? 'crosshair' : 'move'
      )
      this.stopZoom()
    },

    // 自定义删除时停止zoom事件
    stopZoom() {
      if (this.isDeleteNodes) {
        this.zoomOverlay.on('mousedown.zoom', null)
        this.zoomOverlay.on('mousemove.zoom', null)
        this.zoomOverlay.on('dblclick.zoom', null)
        this.zoomOverlay.on('touchstart.zoom', null)
        this.zoomOverlay.on('wheel.zoom', null)
        this.zoomOverlay.on('mousewheel.zoom', null)
      } else {
        this.zoomOverlay.call(this.zoom)
      }
    },

    // 监听框选事件
    selectEvent() {
      let start = [0, 0]
      let end = [0, 0]
      let isdown = false
      let isMove = false

      d3.select('#main')
        .select('svg')
        .on('mousedown', () => {
          const x = this.getLeft(document.getElementById('main'))
          const y = this.getTop(document.getElementById('main'))

          if (d3.event.button === 0 && this.isDeleteNodes && !this.isConnect) {
            start = [d3.event.clientX - x, d3.event.clientY - y]
            isdown = true
            d3.select('.selectBox').remove()
            d3.select('#main svg')
              .append('rect')
              .attr('width', 0)
              .attr('height', 0)
              .attr('class', 'selectBox')
              .attr('x', start[0])
              .attr('y', start[1])
              .style('stroke', '#006DFF')
              .style('stroke-width', 1)
              .style('stroke-dasharray', '3 2')
              .style('fill', 'none')
          }
        })
        .on('mousemove', () => {
          if (isdown) {
            const x = this.getLeft(document.getElementById('main'))
            const y = this.getTop(document.getElementById('main'))
            isMove = true
            end = [d3.event.clientX - x, d3.event.clientY - y]
            var w = end[0] - start[0]
            var h = end[1] - start[1]
            d3.select('.selectBox')
              .attr('width', Math.abs(w))
              .attr('height', Math.abs(h))
            if (w >= 0 && h < 0) {
              d3.select('.selectBox')
                .attr('x', start[0])
                .attr('y', end[1])
            } else if (w < 0 && h >= 0) {
              d3.select('.selectBox')
                .attr('x', end[0])
                .attr('y', start[1])
            } else if (w < 0 && h < 0) {
              d3.select('.selectBox')
                .attr('x', end[0])
                .attr('y', end[1])
            }
          }
          if (this.isConnect) {
            var transform = d3.zoomTransform(this.zoomOverlay.node())

            const x0 = this.getLeft(document.getElementById('main'))
            const y0 = this.getTop(document.getElementById('main'))
            const offsetX = d3.event.clientX - x0
            const offsetY = d3.event.clientY - y0
            const x = this.startNode.node.x + this.startNode.node[this.startNode.type][this.startNode.indexNum].transformX
            const y = this.startNode.node.y + this.startNode.node[this.startNode.type][this.startNode.indexNum].transformY
            var m =
              'M' + x + ',' + y + ' L' +
              (offsetX / transform.k - transform.x / transform.k) +
              ',' +
              (offsetY / transform.k - transform.y / transform.k)
            d3.select('.movePath')
              .style('stroke', () => this.lineConf.strokeColor)
              .attr('stroke-dasharray', '2 2')
              .attr('d', m)
          }
        })
        .on('mouseup', () => {
          if (d3.event.button === 0) {
            this.isConnect = false
            if (isMove) {
              this.findSelectNode(start, end)
            }
            isdown = false
            isMove = false
            start = [0, 0]
            end = [0, 0]
            d3.select('.selectBox').remove()
          }
        })
        .on('mouseleave', () => {
          if (isdown === true) {
            isdown = false
            start = [0, 0]
            end = [0, 0]
            d3.select('.selectBox').remove()
          }
        })
    },

    // 查找选中的点
    findSelectNode(start, end) {
      let boxX
      let boxY
      const checkList = []
      const zoom = d3.zoomTransform(this.zoomOverlay.node())
      const sacle = zoom.k
      const translate = [zoom.x, zoom.y]
      if (start[0] <= end[0]) {
        boxX = [start[0], end[0]]
      } else {
        boxX = [end[0], start[0]]
      }
      if (start[1] <= end[1]) {
        boxY = [start[1], end[1]]
      } else {
        boxY = [end[1], start[1]]
      }
      this.nodesData.map(node => {
        var isX = false
        var isY = false
        var outW = this.nodeConf.width * sacle
        var outH = this.nodeConf.height * sacle
        var x = node.x * sacle + translate[0]
        var y = node.y * sacle + translate[1]
        var minx = x
        var maxx = x + outW
        var maxy = y + outH
        var miny = y
        if (minx > boxX[1]) {
          isX = false
        } else if (maxx < boxX[0]) {
          isX = false
        } else {
          isX = true
        }
        if (miny > boxY[1]) {
          isY = false
        } else if (maxy < boxY[0]) {
          isY = false
        } else {
          isY = true
        }
        if (isX && isY) {
          checkList.push(node)
          return true
        } else {
          return false
        }
      })
      this.checkList = checkList
    },

    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0
        var v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },

    // 改变选择节点状态
    changeCheckStatu() {
      const shelf = this
      this.nodes.each(function(node) {
        if (shelf.checkList.findIndex(d => d.nodeId === node.nodeId) !== -1) {
          d3.select(this).select('.checkRect').style('display', 'block')
        } else {
          d3.select(this).select('.checkRect').style('display', 'none')
        }
      })
    },

    // 改变选择线状态
    changeCheckLineStatu() {
      const shelf = this
      this.links.each(function(link) {
        if (shelf.checkLine.findIndex(value => value.source.nodeId === link.source.nodeId &&
          value.target.nodeId === link.target.nodeId &&
          value.sourceIndex === link.sourceIndex &&
          value.targetIndex === link.targetIndex &&
          value.sourceType === link.sourceType &&
          value.targetType === link.targetType) !== -1) {
          d3.select(this).style('stroke', '#006DFF')
        } else {
          d3.select(this).style('stroke', shelf.lineConf.strokeColor)
        }
      })
    },

    // 删除节点
    deleteNodes() {
      const shelf = this
      this.nodes.each(function(node) {
        if (shelf.checkList.findIndex(d => d.nodeId === node.nodeId) !== -1) {
          d3.select(this).remove()
        }
      })
      for (let n = 0; n < shelf.nodesData.length; n++) {
        const index = shelf.checkList.findIndex(d => d.nodeId === shelf.nodesData[n].nodeId)
        if (index !== -1) {
          shelf.nodesData.splice(n--, 1)
        }
      }
      this.links.each(function(links) {
        if (shelf.checkList.findIndex(d => d.nodeId === links.source.nodeId || d.nodeId === links.target.nodeId) !== -1) {
          d3.select(this).remove()
        }
      })
      for (let n = 0; n < shelf.linksData.length; n++) {
        const index = shelf.checkList.findIndex(d => d.nodeId === shelf.linksData[n].source.nodeId || d.nodeId === shelf.linksData[n].target.nodeId)
        if (index !== -1) {
          shelf.linksData.splice(n--, 1)
        }
      }
      this.makers.each(function(links) {
        if (shelf.checkList.findIndex(d => d.nodeId === links.source.nodeId || d.nodeId === links.target.nodeId) !== -1) {
          d3.select(this).remove()
        }
      })
      this.checkList = []
      this.bindNodeLine()
    },

    // 删除连线
    deleteLines() {
      const shelf = this
      this.links.each(function(link) {
        if (shelf.checkLine.findIndex(value => value.id === link.id) !== -1) {
          d3.select(this).remove()
        }
      })
      for (let n = 0; n < shelf.linksData.length; n++) {
        const index = shelf.checkLine.findIndex(value => value.id === shelf.linksData[n].id)
        if (index !== -1) {
          shelf.linksData.splice(n--, 1)
        }
      }
      this.makers.each(function(link) {
        if (shelf.checkLine.findIndex(value => value.id === link.id) !== -1) {
          d3.select(this).remove()
        }
      })
      this.checkLine = []
      this.bindNodeLine()
    },

    getColor(type = '') {
      var color = '#909399'
      this.tooltip.map(value => {
        if (value.type === type) {
          color = value.color
        }
      })
      return color
    },

    setConfCondition(parameters, item) {
      // if (!item.condition) {
      //   return true
      // } else {
      //   let is = false
      //   parameters.map(value => {
      //     if (value.key === item.condition.key) {
      //       if (item.condition.expected.findIndex(d => d === value.default) !== -1) {
      //         is = true
      //       }
      //     }
      //   })
      //   return is
      // }
      return true
    }
  }
}
</script>

<style scoped lang="scss">
  .main-box{
    height: 100%;
    display: flex;
    border-radius: 5px;
    border: 1px solid #dfdfdf;
    overflow: hidden;
    box-shadow: 2px 2px 2px #ced3d9;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -khtml-user-select: none;
    user-select: none;
  }
  .main-left{
    width: 300px;
    height: 100%;
    overflow-x: hidden;
    border-right: 1px solid #ced3d9;
  }
  .main-right{
    width: calc(100% - 300px);
    height: 100%;
    position: relative;
  }
  .graphBox{
    height: 100%;
  }
  #full{
    background: url("../../../assets/images/wangge.jpg") repeat;
  }
  .toolbarBottom {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background-color: #fff;
  }
  .tooltip {
    position: absolute;
    top: 40px;
    left: 10px;
    line-height: 25px;
    font-size: 12px;
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      li {
        height: 25px;
        font-size: 14px;
        div{
          float: left;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          margin-right: 5px;
          margin-top: 6px;
        }
      }
    }
  }
  .toolbar {
    position: absolute;
    top: 0px;
    width: 100%;
    background-color: #fff;
    // padding: 5px 0;
    box-shadow: 0px 1px 0px #ced3d9;
  }
  .toolbarButton{
    display:inline-block;
    border: 1px solid #868686;
    padding: 5px;
    font-size: 16px;
    cursor: pointer
  }
  .normal-button{
    display: inline-block;
    padding: 5px 8px;
    border: 1px solid #006DFF;
    border-radius: 3px;
    font-size: 12px;
    color: #006DFF;
    margin-right: 10px;
    cursor: pointer;
  }
  .normal-button i{
    font-size: 12px;
  }
  .rightInfo{
    position: absolute;
    right: -300px;
    top: 38px;
    height: calc(100% - 38px);
    width: 300px;
    overflow-y: auto;
    background-color: #FAFBFC;
    transition: all .3s linear;
    border: 1px solid #ced3d9;
    border-right: none;
    .rightInfoClose{
      height: 40px;
      border-bottom: 1px solid #ced3d9;
      line-height: 40px;
      padding-left: 10px;
      font-size: 14px;
      i{
        float: right;
        cursor: pointer;
        font-size: 18px;
        line-height: 40px;
        padding-right: 5px;
        &:hover{
          color: #006DFF;
        }
      }
    }
    .dataList{
      border: 1px solid #ced3d9;
      background-color: #fff;
      padding: 10px;
    }
  }
  .active {
    background: rgb(179, 216, 255);
  }
  .tabTitle{
    padding-left: 5px;
    font-size: 18px;
    font-weight: bold;
    margin-left: 20px;
  }
  .tabContent{
    padding-left: 5px;
    font-size: 14px;
    font-weight: bold;
    margin-left: 20px;
  }
</style>
<style lang="scss">
  .main-box{
    .el-collapse-item__header.is-active{
      border-bottom-color: #e6ebf5;
    }
    .el-collapse-item__content{
      background-color: #EFF0F0;
      overflow: hidden;
    }
    .el-tree{
      background-color: rgba(0,0,0,0);
    }
    .el-tree-node__content:hover{
      background-color: rgba(0,0,0,0);
    }
    .el-tree-node__content{
      background-color: rgba(0,0,0,0)!important;
    }
    .el-collapse-item__content{
      padding-bottom: 10px;
    }
  }
  .dragTree{
    display: inline-block;
    padding: 0px 8px;
    border: 1px solid #006DFF;
    border-radius: 3px;
    font-size: 12px;
    color: #006DFF;
    cursor: move;
    &:hover{
      background-color: #006DFF;
      color: #fff;
    }
  }
  .node{
    cursor: pointer;
  }
</style>
