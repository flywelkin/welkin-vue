import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control
import iconPicker from 'e-icon-picker'
import 'e-icon-picker/dist/symbol.js' // 基本彩色图标库
import 'e-icon-picker/dist/index.css' // 基本样式，包含基本图标
import 'font-awesome/css/font-awesome.min.css' // font-awesome 图标库
import 'element-ui/lib/theme-chalk/icon.css' // element-ui 图标库
import ElTreeSelect from 'el-tree-select'
import * as filters from './filters' // global filters
import Auth from './directives/auth'// 注册全局权限指令

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(Auth)
Vue.use(ElementUI)
Vue.use(ElTreeSelect)
Vue.use(iconPicker, { FontAwesome: true, ElementUI: true, eIcon: true, eIconSymbol: true })// 使用e-icon-picker
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
