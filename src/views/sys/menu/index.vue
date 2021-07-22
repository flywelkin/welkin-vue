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
        @click="addMenuHandler"
      >
        新增
      </el-button>
    </div>
    <!--表格-->
    <el-table
      :data="menuList"
      style="width: 100%"
      row-key="id"
      :tree-props="{children: 'children'}"
    >
      <el-table-column prop="name" label="名称" />
      <el-table-column label="类型">
        <template slot-scope="{row}">
          <el-tag :type="row.type | menuTypeFilter">
            {{ row.type | menuNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="url" label="菜单URL" />
      <el-table-column prop="perms" label="权限" />
      <el-table-column label="图标">
        <template slot-scope="{row}">
          <i :class="row.icon" />
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
          <el-button type="warning" plain size="mini" @click="updateMenuHandler(row)">
            修改
          </el-button>
          <el-button type="danger" plain size="mini" @click="deleteMenuHandler(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--权限新增/编辑表单-->
    <el-dialog
      :title="dialogTitleMap[editorType]"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form
        ref="menuForm"
        :rules="rules"
        :model="editorMenu"
        label-position="right"
        label-width="80px"
      >
        <el-form-item key="type" label="菜单类型" prop="type">
          <el-radio-group v-model="editorMenu.type" size="medium" :disabled="editorType === 'update'" @change="handlerChangeType">
            <el-radio :label="0">目录</el-radio>
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="editorMenu.type !== 0" key="parentId" label="上级菜单" prop="parentId">
          <el-tree-select
            ref="treeSelect"
            v-model="editorMenu.parentId"
            :select-params="selectParams"
            :tree-params="treeParams"
            @searchFun="searchFun"
          />
        </el-form-item>
        <el-form-item key="name" label="菜单名称" prop="name">
          <el-input v-model="editorMenu.name" placeholder="菜单名称" />
        </el-form-item>
        <el-form-item v-if="editorMenu.type !== 2" key="url" label="菜单地址" prop="url">
          <el-input v-model="editorMenu.url" placeholder="菜单地址" />
        </el-form-item>
        <el-form-item v-if="editorMenu.type !== 2" key="icon" label="图标" prop="icon">
          <e-icon-picker v-model="editorMenu.icon" />
        </el-form-item>
        <el-form-item key="perms" label="权限标识" prop="perms">
          <el-input v-model="editorMenu.perms" placeholder="权限标识" />
        </el-form-item>
        <el-form-item key="orderNum" label="排序" prop="orderNum">
          <el-input-number v-model="editorMenu.orderNum" :min="0" :max="999" />
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
import { getMenuTree, deleteMenu, saveMenu, updateMenu } from '@/api/menu'
import { messageBox, success } from '@/utils/global-message'
import { defaultMenu } from '@/views/sys/menu/menu'

export default {
  filters: {
    menuNameFilter(type) {
      const nameMap = {
        0: '目录',
        1: '菜单',
        2: '按钮'
      }
      return nameMap[type]
    },
    menuTypeFilter(type) {
      const typeMap = {
        0: '',
        1: 'success',
        2: 'info'
      }
      return typeMap[type]
    }
  },
  data() {
    return {
      rules: {
        type: [{ required: true, message: '请选择菜单类型', trigger: 'blur' }],
        name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
        parentId: [{ required: true, message: '请选上级菜单', trigger: 'change' }],
        url: [{ required: true, message: '请输入菜单地址', trigger: 'blur' }],
        icon: [{ required: true, message: '请输选择图标', trigger: 'change' }],
        perms: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
        orderNum: [{ required: true, message: '请选择排序', trigger: 'change' }]
      },
      menuList: [],
      listQuery: {
        current: 1,
        size: 10,
        params: {
          parentId: 0
        }
      },
      editorType: 'create',
      editorMenu: Object.assign({}, defaultMenu),
      visible: false,
      dialogTitleMap: {
        create: '新增菜单',
        update: '编辑菜单'
      },
      selectParams: {
        clearable: true,
        placeholder: '请选择上级菜单'
      },
      treeParams: {
        clickParent: true,
        filterable: true,
        accordion: true,
        data: [],
        props: {
          children: 'children',
          label: 'name',
          disabled: 'disabled',
          value: 'id'
        }
      }
    }
  },
  mounted() {
    this.getMenuTree()
  },
  methods: {
    /**
     * 查询权限树列表
     */
    getMenuTree() {
      getMenuTree(this.listQuery).then(res => {
        this.menuList = res.data
      })
    },
    /**
     * 新增操作预处理
     * @returns {Promise<void>}
     */
    addMenuHandler() {
      this.editorType = 'create'
      this.editorMenu = Object.assign({}, defaultMenu)
      // 获取父及菜单选择数据
      getMenuTree().then(res => {
        this.treeParams.data = res.data
        this.visible = true
      })
    },
    /**
     * 修改操作预处理
     * @param row
     * @returns {Promise<void>}
     */
    updateMenuHandler(row) {
      this.editorType = 'update'
      this.editorMenu = Object.assign({}, row)
      // 获取父及菜单选择数据
      getMenuTree().then(res => {
        this.treeParams.data = res.data
        this.visible = true
      })
    },
    /**
     * 删除权限请求
     * @param row
     */
    deleteMenuHandler(row) {
      messageBox('删除菜单').then(() => {
        deleteMenu(row.id).then(res => {
          success('菜单删除成功')
          this.getMenuTree()
        })
      }).catch(() => {})
    },
    /**
     * 创建权限请求
     * @returns {Promise<boolean>}
     */
    async createData() {
      const valid = await this.$refs['menuForm'].validate()
      if (!valid) {
        return false
      }
      messageBox('新增菜单').then(() => {
        saveMenu(this.editorMenu).then(res => {
          success('菜单添加成功')
          this.visible = false
          this.getMenuTree()
          // this.$refs['menuForm'].clearValidate()
        })
      }).catch(() => {})
    },
    /**
     * 更新权限请求
     * @returns {Promise<boolean>}
     */
    async updateData() {
      const valid = await this.$refs['menuForm'].validate()
      if (!valid) {
        return false
      }
      messageBox('修改菜单').then(() => {
        updateMenu(this.editorMenu).then(res => {
          success('菜单修改成功')
          this.visible = false
          this.getMenuTree()
        })
      }).catch(() => {})
    },
    /**
     * 编辑表单中上级菜单树搜索过滤处理
     * @param value
     */
    searchFun(value) {
      this.$refs.treeSelect.filterFun(value)
    },
    /**
     * 编辑表单中菜单类型发生变化处理
     * @param value
     */
    handlerChangeType(value) {
      this.$refs['menuForm'].clearValidate()
      if (value === '0') {
        this.data.parentId = '0'
      }
    }
  }
}
</script>

<style scoped>

</style>

