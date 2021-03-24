<template>
  <div class="tab-container">
    <iframe id="visualizationID" :gzkj="gzkj" src="" style="height: 700px;width: 100%;border: 0;">
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
    setTimeout(this.setIframeSrc, 5)
  },
  methods: {
    setIframeSrc(){
      let s =localStorage.getItem('webUrl')+"//?#/project/" + localStorage.getItem('projectId') + "/vizs";
      let iframe1 = document.getElementById('visualizationID');
      if (-1 == navigator.userAgent.indexOf("MSIE")) {
          iframe1.src = s;
      } else {
          iframe1.location = s;
      }
    }
  }
}
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }
</style>
