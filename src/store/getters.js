const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  user: state => state.user,
  id: state => state.user.id,
  name: state => state.user.name,
  avatar: state => state.user.avatar,
  token: state => state.user.token,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routers,
  chat: state => state.chat
}
export default getters
