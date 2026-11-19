<template>
  <w-modal :visible.sync="opened" title="出区" width="980px" align-center :close-on-click-modal="false" :close-on-press-escape="!saving" :show-close="!saving" @open="initialize">
    <div class="departure-body">
      <div class="patient-summary">
        <w-avatar :size="48" :name="avatarName" shape="circle" alt="患者头像" />
        <div class="patient-details"><div class="patient-primary"><strong>{{ patient.bedName || '未排床' }}</strong><strong>{{ patient.name }}</strong><strong>{{ patient.age || '—' }}</strong><i class="patient-sex w-icon w-icon-userGroup-solid" role="img" aria-label="用户组"></i></div><div class="patient-secondary"><span><span class="muted">病历号：</span>{{ patient.medicalRecordNo || patient.visitNo || '—' }}</span><span><span class="muted">联系电话：</span>{{ patient.phone || '—' }}</span></div></div>
      </div>
      <w-form class="departure-form" ref="form" :model="form" :rules="rules" label-position="right" label-width="128px" correct-label-wrap size="medium" :disabled="saving">
        <div class="two-columns">
          <div class="field-cell"><w-form-item class="departure-field" label="出区时间" prop="departureTime"><w-date-picker-pro class="full-control" v-model="form.departureTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="请选择出区时间" /></w-form-item></div>
          <div class="field-cell"><w-form-item class="departure-field" label="科室" :required="false"><w-select :value="patient.department" disabled class="full-control"><w-option :value="patient.department || ''" :label="patient.department || '—'" /></w-select></w-form-item></div>
        </div>
        <div class="field-cell"><w-form-item class="departure-field" label="出区诊断" :required="false"><w-select :value="patient.diagnosis" disabled class="full-control"><w-option :value="patient.diagnosis || ''" :label="patient.diagnosis || '暂无诊断'" /></w-select></w-form-item></div>
        <div class="section-heading"><h3>生命体征</h3><div class="measurement-options"><w-checkbox v-model="form.refused">患者拒测</w-checkbox><w-checkbox v-model="form.noSigns">无生命迹象</w-checkbox><w-checkbox v-model="form.unmeasurable">测不出</w-checkbox></div></div>
        <div class="two-columns">
          <div class="field-cell" v-for="item in vitalFields" :key="item.key"><w-form-item class="departure-field" :label="item.label" :required="false" :prop="item.key"><w-input class="full-control" v-model="form[item.key]" :disabled="vitalsDisabled" placeholder="请输入" :label="item.label" suf-append="text"><template slot="suf-append">{{ item.unit }}</template></w-input></w-form-item></div>
        </div>
        <div class="two-columns">
          <div class="field-cell"><w-form-item class="departure-field" label="转归" prop="outcome"><w-select class="full-control" v-model="form.outcome" placeholder="请选择转归"><w-option v-for="item in outcomes" :key="item.value" :label="item.label" :value="item.value" /></w-select></w-form-item></div>
          <div class="field-cell"><w-form-item class="departure-field" label="去向" prop="destination"><w-select class="full-control" v-model="form.destination" placeholder="请选择去向"><w-option v-for="item in destinations" :key="item.value" :label="item.label" :value="item.value" /></w-select></w-form-item></div>
          <div class="field-cell custom-field" v-for="item in customFields" :key="item.key"><w-form-item class="departure-field" :label="item.label" label-width="128px" :required="false"><w-select class="full-control" v-model="form.custom[item.key]" clearable placeholder="请选择"><w-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value" /></w-select></w-form-item></div>
        </div>
        <h3>统计指标</h3>
        <div class="statistics"><div class="field-cell" v-for="item in statisticFields" :key="item.key"><w-form-item class="departure-field" :label="item.label" label-width="128px" :required="false"><w-radio-group class="statistic-options" v-model="form.statistics[item.key]"><w-radio class="statistic-option" :label="true">是</w-radio><w-radio class="statistic-option" :label="false">否</w-radio></w-radio-group></w-form-item></div></div>
        <div class="field-cell"><w-form-item class="departure-field" label="说明" :required="false" prop="notes"><w-input v-model="form.notes" type="textarea" :rows="2" :maxlength="256" show-counter resize="none" placeholder="请输入出区说明（选填）" /></w-form-item></div>
      </w-form>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </div>
    <div slot="footer"><w-button size="medium" :disabled="saving" @click="opened = false">取消</w-button><w-button type="primary" size="medium" :loading="saving" @click="submit">确定</w-button></div>
  </w-modal>
</template>

<script>
const vitalFields = [
  { key: 'temperature', label: '体温', unit: '℃' },
  { key: 'respiration', label: '呼吸', unit: '次/min' },
  { key: 'pulse', label: '脉搏', unit: '次/min' },
  { key: 'heartRate', label: '心率', unit: '次/min' },
  { key: 'bloodPressure', label: '血压', unit: 'mmHg' },
  { key: 'oxygen', label: '血氧', unit: '%' }
]
export default {
  name: 'PatientDepartureModal',
  props: {
    visible: Boolean,
    patient: { type: Object, required: true },
    save: { type: Function, required: true },
    outcomes: { type: Array, default: () => [] },
    destinations: { type: Array, default: () => [] },
    customFields: { type: Array, default: () => [] },
    statisticFields: { type: Array, default: () => [
      { key: 'surgery', label: '手术' }, { key: 'cpr', label: '心肺复苏' },
      { key: 'irreversibleDischarge', label: '因不可逆疾病而自动出院的患者' }
    ] }
  },
  data() { return { form: {}, vitalFields, saving: false, error: '' } },
  computed: {
    avatarName() {
      const age = parseInt(this.patient.age, 10)
      const sex = this.patient.sex
      if (sex !== '男' && sex !== '女') return 'w-avatar-unknown-lgt'
      const category = age >= 60 ? (sex === '男' ? 'old-man' : 'old-woman') : (sex === '男' ? 'middle-aged-male' : 'middle-aged-female')
      return `w-avatar-${category}-lgt`
    },
    opened: { get() { return this.visible }, set(value) { if (!this.saving) this.$emit('update:visible', value) } },
    vitalsDisabled() { return this.form.refused || this.form.noSigns || this.form.unmeasurable },
    rules() {
      const rules = {
        departureTime: [{ type: 'date', required: true, message: '请选择出区时间', trigger: 'change' }, { type: 'date', validator: this.validateTime, trigger: 'change' }],
        outcome: [{ type: 'string', required: true, message: '请选择转归', trigger: 'change' }],
        destination: [{ type: 'string', required: true, message: '请选择去向', trigger: 'change' }],
        notes: [{ type: 'string', max: 256, message: '说明最多256字', trigger: 'blur' }]
      }
      vitalFields.forEach(item => { rules[item.key] = [{ type: 'string', validator: (rule, value, callback) => {
        if (this.vitalsDisabled || !value) return callback()
        const valid = item.key === 'bloodPressure' ? /^\d{1,3}\s*\/\s*\d{1,3}$/.test(value) : /^\d+(\.\d+)?$/.test(value)
        callback(valid ? undefined : new Error(item.key === 'bloodPressure' ? '格式如120/80' : '请输入非负数值'))
      }, trigger: 'blur' }] })
      return rules
    }
  },
  watch: { visible(value) { if (value) this.initialize() }, vitalsDisabled() { this.$nextTick(() => { if (this.$refs.form) this.$refs.form.clearValidate(vitalFields.map(item => item.key)) }) } },
  created() { this.initialize() },
  methods: {
    initialize() {
      const statistics = {}; this.statisticFields.forEach(item => { statistics[item.key] = null })
      const custom = {}; this.customFields.forEach(item => { custom[item.key] = '' })
      this.form = { departureTime: new Date(), refused: false, noSigns: false, unmeasurable: false, temperature: '', respiration: '', pulse: '', heartRate: '', bloodPressure: '', oxygen: '', outcome: '', destination: '', statistics, custom, notes: '' }
      this.error = ''
      this.$nextTick(() => { if (this.$refs.form) this.$refs.form.clearValidate() })
    },
    validateTime(rule, value, callback) {
      if (!(value instanceof Date) || Number.isNaN(value.getTime())) return callback(new Error('请选择有效时间'))
      if (value.getTime() > Date.now()) return callback(new Error('出区时间不能晚于当前时间'))
      if (this.patient.admissionTime && value.getTime() < new Date(this.patient.admissionTime).getTime()) return callback(new Error('出区时间不能早于入区时间'))
      callback()
    },
    submit() {
      if (this.saving) return
      this.$refs.form.validateForm(async valid => {
        if (!valid || this.saving) return
        this.saving = true; this.error = ''
        const payload = { ...this.form, patientId: this.patient.id, visitNo: this.patient.visitNo, departureTime: this.form.departureTime.toISOString(), statistics: { ...this.form.statistics }, custom: { ...this.form.custom } }
        if (this.vitalsDisabled) vitalFields.forEach(item => { payload[item.key] = null })
        try {
          await this.save(payload)
          this.saving = false
          this.$emit('success', payload)
          this.$emit('update:visible', false)
        } catch (error) { this.error = error.message || '保存失败，请重试'; this.saving = false }
      })
    }
  }
}
</script>

<style scoped>
.departure-body{--primary:#2d5afa;--border:#e9e9e9;--muted:#666;--surface:#f5f7fa;margin:-20px -20px 0;color:#000;font-size:14px}
.patient-summary{display:flex;align-items:center;gap:16px;padding:8px 24px;background:var(--surface);margin-bottom:12px}.patient-details{min-width:0}.patient-primary{display:flex;align-items:center;gap:12px;font-size:16px;margin-bottom:4px}.patient-primary strong{font-weight:500}.patient-sex{font-size:20px;color:var(--primary)}.patient-secondary{display:flex;flex-wrap:wrap;gap:8px 24px;font-size:14px}.muted{color:var(--muted)}
.departure-form{padding:0 24px}.departure-field{display:flow-root;min-width:0}.field-cell{min-width:0;margin-bottom:12px}.two-columns{display:grid;align-items:start;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:16px}.full-control{width:100%}.custom-field{grid-column:1 / -1}
h3{font-size:14px;margin:0 0 12px;padding:4px 0 8px;border-bottom:1px solid var(--border)}.section-heading{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);margin-bottom:8px;gap:16px}.section-heading h3{border:0;margin:0}.measurement-options{display:flex;gap:8px;flex-wrap:wrap}.with-unit{display:flex;align-items:center;gap:8px}.with-unit span{color:var(--muted);white-space:nowrap;font-size:12px;min-width:48px}.error{color:#ec0000;margin:8px 24px}.statistics{display:grid;grid-template-columns:repeat(3,248px);justify-content:space-between;align-items:start;margin-bottom:0}.statistics .field-cell{margin-bottom:12px}.statistic-options{display:flex;align-items:center;justify-content:space-between;width:120px;height:34px}.statistic-option{margin:0}
@media(max-width:760px){.two-columns,.statistics{grid-template-columns:1fr}.section-heading{flex-wrap:wrap}.patient-secondary{flex-direction:column}.patient-summary{padding:12px 16px}.statistics .field-cell:nth-child(3n){justify-self:stretch;width:auto}}
</style>
