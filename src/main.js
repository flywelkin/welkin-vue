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
import iconPicker from 'e-icon-picker' // 图标选择器
import 'e-icon-picker/dist/index.css' // 基础样式
import 'e-icon-picker/dist/main.css' // fontAwesome 图标库样式
import ElTreeSelect from 'el-tree-select'
import * as filters from './filters' // global filters
import Auth from './directives/auth'// 注册全局权限指令

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(Auth)
Vue.use(ElementUI)
Vue.use(iconPicker)
Vue.use(ElTreeSelect)
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
