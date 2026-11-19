# 患者管理 · 出区弹窗

Vue 2.7 Options API + win-design 2.6.39，依据现有急诊护理工作站的出区弹窗字段实现。

## 运行

```sh
npm install
npm run dev
npm run build
```

如 WinDesign 无法从当前 npm 源获取，请在本机配置组织授权的包源后安装；仓库不包含内部包源配置。

## 接入患者管理

复用 `src/components/PatientDepartureModal.vue`。宿主需注册 WinDesign 和主题样式（见 `src/main.js`）。

```vue
<patient-departure-modal
  :visible.sync="departureVisible"
  :patient="selectedPatient"
  :outcomes="outcomeDictionary"
  :destinations="destinationDictionary"
  :custom-fields="customFields"
  :statistic-fields="statisticFields"
  :save="saveDeparture"
  @success="reloadPatients"
/>
```

- `patient`：id、visitNo、bedName、name、sex、age、department、diagnosis、admissionTime（Date 或带时区的 ISO 时间）。
- `outcomes` / `destinations`：`{ label, value }[]`，value 为字符串，接入实际业务字典。
- `customFields`：`{ key, label, options: [{ label, value }] }[]`。
- `statisticFields`：`{ key, label }[]`，未选择提交 null，明确否提交 false。
- `save(payload)`：必传异步保存函数，接口失败须 reject；成功后弹窗关闭并触发 success。示例仅将数据保存在内存，刷新页面清空。
- departureTime 提交为 UTC ISO 字符串，后端按实际接口约定转换；选择器使用浏览器本地时区。
- 生命体征特殊标记选中时暂时禁用输入，保留草稿，提交时相关数值置 null；取消标记后可以继续填写。
- 出区时间必填且不能早于入区时间或晚于当前时间；转归和去向必填；数值做格式校验，未擅自设置临床阈值。

示例字典与自定义指标仅供演示，正式接入时由业务配置提供。原系统页面未做修改，未提交任何患者出区操作。
