<template>
  <div class="app-container">
    <!--操作栏-->
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        plain
        size="mini"
        @click="addRoleHandler"
      >
        新增
      </el-button>
    </div>
    <!--表格-->
    <el-table
      :data="roleList"
      style="width: 100%"
    >
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="roleKey" label="标识" />
      <el-table-column prop="remark" label="备注" />
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
          <el-button type="warning" plain size="mini" @click="updateRoleHanlder(row)">
            修改
          </el-button>
          <el-button type="danger" plain size="mini" @click="deleteRoleHandler(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getRoleList" />
    <!--角色新增/编辑表单-->
    <el-dialog
      :title="dialogTitleMap[editorType]"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form
        ref="roleForm"
        :rules="rules"
        :model="editorRole"
        label-position="right"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="editorRole.name" placeholder="请填写角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" prop="roleKey">
          <el-input v-model="editorRole.roleKey" placeholder="请填写角色标识" />
        </el-form-item>
        <el-form-item label="角色备注" prop="remark">
          <el-input v-model="editorRole.remark" placeholder="请填写角色备注" />
        </el-form-item>
        <el-form-item label="权限菜单" prop="menus">
          <el-tree
            ref="tree"
            v-model="editorRole.menus"
            :data="menuTreeData"
            node-key="id"
            show-checkbox
            :props="defaultProps"
          />
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
import { getRoleList, deleteRole, getById, saveRole, updateRole } from '@/api/role'
import Pagination from '@/components/Pagination'
import { defaultRole } from '@/views/sys/role/role'
import { success, messageBox } from '@/utils/global-message'
import { getMenuTree } from '@/api/menu'
export default {
  components: { Pagination },
  data() {
    return {
      rules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleKey: [{ required: true, message: '请输入角色标识', trigger: 'blur' }]
      },
      roleList: [],
      total: 0,
      listQuery: {
        current: 1,
        size: 10,
        params: {
          nickName: ''
        }
      },
      visible: false,
      editorType: 'create',
      dialogTitleMap: {
        create: '新增角色',
        update: '编辑角色'
      },
      editorRole: Object.assign({}, defaultRole),
      menuTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        disabled: 'disabled'
      }
    }
  },
  mounted() {
    this.getRoleList()
  },
  methods: {
    /**
     * 分页查询角色列表
     */
    getRoleList() {
      getRoleList(this.listQuery).then(res => {
        const data = res.data
        this.roleList = data.records
        this.total = data.total
      })
    },
    /**
     * 新增操作预处理
     * @returns {Promise<void>}
     */
    async addRoleHandler() {
      this.editorType = 'create'
      this.editorRole = Object.assign({}, defaultRole)
      // 获取权限菜单选择数据
      const { data } = await getMenuTree()
      this.menuTreeData = data
      this.visible = true
    },
    /**
     * 修改操作预处理
     * @param row
     * @returns {Promise<void>}
     */
    async updateRoleHanlder(row) {
      this.editorType = 'update'
      this.editorRole = Object.assign({}, defaultRole)
      // 获取权限菜单选择数据
      const { data } = await getMenuTree()
      this.menuTreeData = data
      // 获取角色编辑项详细数据
      const roleInfo = await getById(row.id)
      this.editorRole = roleInfo.data
      this.visible = true
      // 初始化已分配权限信息
      if (this.editorRole && this.editorRole.menuIds) {
        this.$nextTick(() => {
          this.editorRole.menuIds.forEach(id => {
            const node = this.$refs.tree.getNode(id)
            if (node && node.isLeaf) {
              this.$refs.tree.setChecked(node, true, false)
            }
          })
        })
      }
    },
    /**
     * 删除角色请求
     * @param row
     */
    deleteRoleHandler(row) {
      messageBox('删除角色').then(() => {
        deleteRole(row.id).then(res => {
          success('角色删除成功')
          this.getRoleList()
        })
      }).catch(() => {})
    },
    /**
     * 创建角色请求
     * @returns {Promise<boolean>}
     */
    async createData() {
      const valid = await this.$refs['roleForm'].validate()
      if (!valid) {
        return false
      }
      this.editorRole.menuIds = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys())
      messageBox('新增角色').then(() => {
        saveRole(this.editorRole).then(res => {
          success('新增角色成功')
          this.visible = false
          this.getRoleList()
        })
      }).catch(() => {})
    },
    /**
     * 更新角色请求
     * @returns {Promise<boolean>}
     */
    async updateData() {
      const valid = await this.$refs['roleForm'].validate()
      if (!valid) {
        return false
      }
      this.editorRole.menuIds = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys())
      messageBox('修改角色').then(() => {
        updateRole(this.editorRole).then(res => {
          success('修改角色成功')
          this.visible = false
          this.getRoleList()
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
</style>

