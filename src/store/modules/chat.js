import { getFriends } from '@/api/chat'

const state = {
  users: [],
  currentUser: null
}

const mutations = {
  USERS: (state, users) => {
    state.users = users
  },
  CURRENT_USER: (state, currentUser) => {
    state.currentUser = currentUser
  },
  COMMIT_MESSAGE: (state, data) => {
    state.users.forEach(user => {
      if (user.id === data.messageRequest.from) {
        const message = {
          type: 'accept',
          message: data.messageRequest.content,
          avatar: user.avatar
        }
        if (user.messages) {
          user.messages.push(message)
        } else {
          user.messages = []
          user.messages.push(message)
        }
      }
    })
  }
}

const actions = {
  initUsers({ commit }) {
    return new Promise((resolve, reject) => {
      getFriends().then(response => {
        const { data } = response
        commit('USERS', data)
        commit('CURRENT_USER', data[0])
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  changeUser({ commit }, currentUser) {
    commit('CURRENT_USER', currentUser)
  },
  commitMessage({ commit, state }, data) {
    commit('COMMIT_MESSAGE', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

