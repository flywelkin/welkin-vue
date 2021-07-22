// import Cookies from 'js-cookie'
import { CONST, setStorageL, getStorageL, removeStorageL } from '@/utils/storeUtils'

// const TokenKey = 'user_token'

export function getToken() {
  // return Cookies.get(TokenKey)
  return getStorageL(CONST.token)
}

export function setToken(token) {
  setStorageL(CONST.token, token)
  // return Cookies.set(TokenKey, token)
}

export function removeToken() {
  // return Cookies.remove(TokenKey)
  removeStorageL(CONST.token)
}
