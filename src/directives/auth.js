import store from '@/store'

function hasPermission(permission) {
  const permissions = Array.isArray(permission) ? permission : [permission]
  // 当前用户的权限列表
  const userHavePermissions = store.getters.roles.map(item => item.perms)
  return permissions.some(e => userHavePermissions.includes(e))
}

// 开发插件的方式；定义指令；第一个参数是Vue 构造器，第二个参数是可选的选项对象
function install(Vue, options = {}) {
  Vue.directive(options.name || 'auth', {
    // 指令定义对象的钩子函数inserted
    inserted(el, binding) {
      if (!hasPermission(binding.value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  })
}

export default { install }
