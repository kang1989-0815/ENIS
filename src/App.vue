<template><main class="demo"><patient-departure-modal :visible.sync="visible" :patient="patient" :outcomes="outcomes" :destinations="destinations" :custom-fields="customFields" :statistic-fields="statisticFields" :save="saveDemo" /></main></template>
<script>
import PatientDepartureModal from './components/PatientDepartureModal.vue'
export default {
  components: { PatientDepartureModal },
  data() { return {
    visible: true, saved: null,
    patient: { id: 'demo-001', bedName: 'A001床', name: '张示例', sex: '男', age: '42岁', visitNo: 'DEMO20261119001', medicalRecordNo: 'DEMO20261119001', phone: '138****0000', department: '急诊内科', diagnosis: '示例诊断', admissionTime: new Date(Date.now() - 3600000) },
    outcomes: ['好转','治愈','未愈','其他'].map(label => ({label,value:label})),
    destinations: ['离院','住院','转院','其他'].map(label => ({label,value:label})),
    customFields: [{key:'custom1',label:'出区自定义字段1',options:[{label:'示例选项',value:'demo'}]}],
    statisticFields: [{key:'surgery',label:'手术'},{key:'cpr',label:'心肺复苏'},{key:'irreversibleDischarge',label:'因不可逆疾病而自动出院的患者'},...Array.from({length:5},(_,i)=>({key:`custom${i+1}`,label:`自定义统计指标${i+1}`}))]
  } },
  methods: { async saveDemo(payload) { this.saved = payload } }
}
</script>
<style>html,body,#app,.demo{margin:0;min-height:100vh}body{background:#f5f5f5;font:14px system-ui,"Noto Sans SC",sans-serif}</style>
