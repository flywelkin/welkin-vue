import { asyncRouters, constantRoutes } from '@/router/index'

// 判断是否有权限访问该菜单
function hasPermission(menus, route) {
  if (route) {
    const currMenu = getMenu(route.meta.permission, menus)
    if (currMenu != null) {
      // 设置菜单的标题、图标和可见性
      if (currMenu.name && currMenu.name !== '') {
        route.meta.title = currMenu.name
      }
      if (currMenu.icon && currMenu.icon !== '') {
        route.meta.icon = currMenu.icon
      }
      if (currMenu.hidden && currMenu.hidden != null) {
        route.hidden = currMenu.hidden !== 0
      }
      if (route.sort && currMenu.sort != null && currMenu.sort !== '') {
        route.sort = currMenu.sort
      }
      return true
    } else {
      route.sort = 0
      if (route.hidden !== undefined && route.hidden === true) {
        return true
      } else {
        return false
      }
    }
  } else {
    return true
  }
}

// 根据路由名称获取菜单
function getMenu(permission, menus) {
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i]
    if (permission === menu.perms) {
      return menu
    }
  }
  return null
}

// 对菜单进行排序
function sortRouters(accessedRouters) {
  for (let i = 0; i < accessedRouters.length; i++) {
    const router = accessedRouters[i]
    if (router.children && router.children.length > 0) {
      router.children.sort(compare('sort'))
    }
  }
  accessedRouters.sort(compare('sort'))
}

// 降序比较函数
function compare(p) {
  return function(m, n) {
    const a = m[p]
    const b = n[p]
    return b - a
  }
}

const getDefaultState = () => {
  return {
    routers: [], // 完整路由表
    addRouters: [] // 用户可访问路由表
  }
}

const state = Object.assign({}, getDefaultState())

const mutations = {
  SET_ROUTERS: (state, routers) => {
    state.routers = constantRoutes.concat(routers)
    state.addRouters = routers
  }
}

const actions = {
  generateRoutes({ commit }, data) {
    return new Promise(resolve => {
      const { permissions } = data
      const accessedRouters = asyncRouters.filter(v => {
        if (hasPermission(permissions, v)) {
          if (v.children && v.children.length > 0) {
            v.children = v.children.filter(child => {
              if (hasPermission(permissions, child)) {
                return child
              }
              return false
            })
            return v
          } else {
            return v
          }
        }
        return false
      })
      // 对菜单进行排序
      sortRouters(accessedRouters)
      commit('SET_ROUTERS', accessedRouters)
      resolve(accessedRouters)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
