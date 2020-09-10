<template>
  <div class="app-container">
    <!--操作栏-->
    <div class="filter-container">
      <el-input
        v-model="listQuery.params.nickName"
        placeholder="姓名"
        style="width: 200px;"
        size="mini"
        class="filter-item"
        @keyup.enter.native="getUserList"
      />
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-search"
        plain
        size="mini"
        @click="getUserList"
      >
        搜索
      </el-button>
      <el-button
        v-auth="['sys:user:add']"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        plain
        size="mini"
        @click="addUserHandler"
      >
        新增
      </el-button>
    </div>
    <!--表格-->
    <el-table
      :data="userList"
      style="width: 100%"
    >
      <el-table-column prop="userName" label="账号" />
      <el-table-column prop="nickName" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="mobile" label="手机" />
      <el-table-column prop="deptId" label="部门" />
      <el-table-column label="状态">
        <template slot-scope="{row}">
          <el-tag :type="row.status === 1 ? 'success': 'danger'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="createTime" label="创建时间">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="lastUpdateBy" label="修改人" />
      <el-table-column prop="lastUpdateTime" label="修改时间">
        <template slot-scope="{row}">
          <span>{{ row.lastUpdateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <el-button v-auth="['sys:user:update']" type="warning" plain size="mini" @click="updateUserHandler(row)">
            修改
          </el-button>
          <el-button v-auth="['sys:user:delete']" type="danger" plain size="mini" @click="deleteUserHandler(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getUserList" />
    <!--用户新增/编辑表单-->
    <el-dialog
      :inline="true"
      :title="dialogTitleMap[editorType]"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form
        ref="userForm"
        :rules="rules"
        :model="editorUser"
        label-position="right"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editorUser.userName" placeholder="请填写用户名" />
        </el-form-item>
        <el-form-item v-show="editorType==='create'" label="密码" prop="password">
          <el-input v-model="editorUser.password" auto-complete="new-password" placeholder="请填写密码" />
        </el-form-item>
        <el-form-item v-show="editorType==='create'" label="确认密码" prop="confirmPassword">
          <el-input v-model="editorUser.confirmPassword" auto-complete="new-password" placeholder="请填写确认密码" />
        </el-form-item>
        <el-form-item label="姓名" prop="nickName">
          <el-input v-model="editorUser.nickName" placeholder="请填写姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="editorUser.roleIds" value="" multiple filterable clearable placeholder="请选择角色">
            <el-option
              v-for="item in roles"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="editorUser.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="正常"
            inactive-text="停用"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editorUser.email" placeholder="请填写邮箱" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editorUser.mobile" placeholder="请填写手机号" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible = false">
          取消
        </el-button>
        <el-button type="primary" @click="editorType==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, getUserById, saveUser, updateUser, deleteUserById } from '@/api/user'
import { getCurrentRoles } from '@/api/role'
import Pagination from '@/components/Pagination'
import { defaultUser } from '@/views/sys/user/user'
import { success } from '@/utils/global-message'

export default {
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      userList: [],
      total: 0,
      listQuery: {
        current: 1,
        size: 10,
        params: {
          nickName: ''
        }
      },
      editorUser: {},
      editorType: 'create',
      rules: {},
      visible: false,
      dialogTitleMap: {
        create: '新增用户',
        update: '编辑用户'
      },
      roles: []
    }
  },
  mounted() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data } = await getUserList(this.listQuery)
      this.userList = data.records
      this.total = data.total
    },
    async addUserHandler() {
      this.editorType = 'create'
      this.editorUser = Object.assign({}, defaultUser)
      const { data } = await getCurrentRoles()
      this.roles = data
      this.visible = true
    },
    async updateUserHandler(row) {
      this.editorType = 'update'
      this.editorUser = Object.assign({}, row)
      const { data } = await getCurrentRoles()
      this.roles = data
      const userInfo = await getUserById(row.id)
      if (userInfo.data) {
        this.editorUser = userInfo.data
      }
      this.visible = true
    },
    createData() {
      saveUser(this.editorUser).then(res => {
        success('用户添加成功')
        this.visible = false
        this.getUserList()
      })
    },
    updateData() {
      updateUser(this.editorUser).then(res => {
        success('用户修改成功')
        this.visible = false
        this.getUserList()
      })
    },
    deleteUserHandler(row) {
      deleteUserById(row.id).then(res => {
        success('用户删除成功')
        this.getUserList()
      })
    }
  }
}
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>

