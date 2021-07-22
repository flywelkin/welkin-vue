
export function setStorageL(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStorageL(key) {
  const item = localStorage.getItem(key)
  if (item != null) {
    try {
      return JSON.parse(item)
    } catch (e) {
      removeStorageL(key)
      return null
    }
  }
  return null
}

export function removeStorageL(key) {
  localStorage.removeItem(key)
}

export function setStorageS(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function getStorageS(key) {
  const item = sessionStorage.getItem(key)
  if (item != null) {
    try {
      return JSON.parse(item)
    } catch (e) {
      removeStorageL(key)
      return null
    }
  }
  return null
}

export function removeStorageS(key) {
  sessionStorage.removeItem(key)
}

export function clearStore() {
  sessionStorage.clear()
  localStorage.clear()
}

export const CONST = {
  token: 'token'
}
