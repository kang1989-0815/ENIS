import Vue from 'vue'
import WinDesign from 'win-design'
import 'win-design/lib/themes/default.css'
import 'win-design/lib/themes/icons.css'
import 'win-design/lib/themes/fonts/avatars.js'
import App from './App.vue'
Vue.use(WinDesign)
new Vue({ render: h => h(App) }).$mount('#app')
