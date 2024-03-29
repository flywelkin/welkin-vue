import { asyncRouters } from '@/router'

// 判断是否有权限访问该菜单
function hasPermission(menus, route) {
  if (route.name) {
    const currMenu = getMenu(route.meta.title, menus)
    if (currMenu != null) {
      // 设置菜单的标题、图标和可见性
      if (currMenu.name != null && currMenu.name !== '') {
        route.meta.title = currMenu.name
      }
      if (currMenu.icon != null && currMenu.title !== '') {
        route.meta.icon = currMenu.icon
      }
      if (currMenu.hidden != null) {
        route.hidden = currMenu.hidden !== 0
      }
      if (currMenu.sort != null && currMenu.sort !== '') {
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
function getMenu(name, menus) {
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i]
    if (name === menu.name) {
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

export function routerFiler(menus) {
  const accessedRouters = asyncRouters.filter(v => {
    if (hasPermission(menus, v)) {
      if (v.children && v.children.length > 0) {
        v.children = v.children.filter(child => {
          if (hasPermission(menus, child)) {
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
  return accessedRouters
}

