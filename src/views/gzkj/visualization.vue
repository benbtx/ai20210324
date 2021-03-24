<template>
  <div class="tab-container">
    <iframe id="visualizationID" :gzkj="gzkj" :src="kshsjsrc" style="height: 700px;width: 100%;border: 0;">
        IE：你们都看我干吗，我现在也是支持的
    </iframe>
  </div>
</template>

<script>
// import TabPane from './components/TabPane'
import { getReportServerInfo, } from '@/api/gzkj'
export default {
  name: 'Tab',
  // components: { TabPane },
  data() {
    return {
      gzkj: undefined,
      kshsjsrc:localStorage.getItem('webUrl')+"//?#/project/" + localStorage.getItem('projectId') + "/vizs"
    }
  },
  computed: {
    // cachedViews() {
    //   return this.$store.state.tagsView.cachedViews
    // },
    // key() {
    //   return this.$route.path
    // }
  },
  watch: {

  },
  created() {
    // this.listQuery.id = this.$route.query.id
    this.gzkj = this.$route.query.id
    this.$route.meta.title = this.$route.query.name
    var data={
      "wsId":parseInt(this.gzkj),
    }
    if(localStorage.getItem('webUrl')=="null"||localStorage.getItem('projectId')=="null"){
      this.$message('未查询到相关项目')
    }
    // this.kshsjsrc="http://192.168.7.233:5201//?#/project/29/vizs"
    // this.kshsjsrc=localStorage.getItem('webUrl')+"//?#/project/" + localStorage.getItem('projectId') + "/vizs"

    // getReportServerInfo(data).then(response => {
    //   // this.kshsjsrc="http://192.168.7.233:5201//?#/login?xm="+response.response.content.projectId
    //   // this.kshsjsrc="http://192.168.7.233:5201//?#/project/"+response.response.content.projectId+"/vizs"
    //   this.kshsjsrc=response.response.content.webUrl+"//?#/project/"+response.response.content.projectId+"/vizs"
    //   //  this.kshsjsrc="http://localhost:5002//?#/project/"+response.response.content.projectId+"/vizs"
    //   //?#/project/26/vizs
    // }).catch(e => {
    //   this.$message('操作调用失败')
    //   this.listLoading = false
    // })
    // let token=localStorage.getItem("token");
    // this.kshsjsrc=apiURL_sjksh+token
    // this.kshsjsrc="http://192.168.7.233:8848//?#/login?xm=7&token="+"Bearer eyJhbGciOiJIUzUxMiJ9.eyJ0b2tlbl9jcmVhdGVfdGltZSI6MTYwOTEyNTcxMTIyMiwic3ViIjoiYWRtaW4iLCJ0b2tlbl91c2VyX25hbWUiOiJhZG1pbiIsImlhdCI6MTYwOTEyNTcxMX0.6PVAGnWMxX2Dl9AIHhl_kpchg2EIoFvPujIfYjSfm3yDliFOpOzV6Uyk6MRAKL1mT5RqloB3YOkLuwdMdZ_xNg"
    // this.kshsjsrc="http://192.168.7.233:5201//?#/login?xm=7&token="+"Bearer eyJhbGciOiJIUzUxMiJ9.eyJ0b2tlbl9jcmVhdGVfdGltZSI6MTYwOTEyNTcxMTIyMiwic3ViIjoiYWRtaW4iLCJ0b2tlbl91c2VyX25hbWUiOiJhZG1pbiIsImlhdCI6MTYwOTEyNTcxMX0.6PVAGnWMxX2Dl9AIHhl_kpchg2EIoFvPujIfYjSfm3yDliFOpOzV6Uyk6MRAKL1mT5RqloB3YOkLuwdMdZ_xNg"
    // this.kshsjsrc="http://192.168.7.233:5201//?#/login?xm=7"
    // this.kshsjsrc="http://192.168.7.233:5201//?#/login?xm="+this.gzkj
    // var frame = document.getElementById('visualizationID');
    // frame.contentWindow.postMessage(object,'*');
    // window.addEventListener('message',function(event){
    //     //此处执行事件
    // })
  },
  methods: {

  }
}
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }
</style>
