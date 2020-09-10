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
        @click="addDeptHandler"
      >
        新增
      </el-button>
    </div>
    <!--表格-->
    <el-table
      :data="depetList"
      style="width: 100%"
      row-key="id"
      lazy
      :load="load"
      :tree-props="{hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="name" label="名称" />
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
          <el-button type="warning" plain size="mini" @click="updateDeptHanlder(row)">
            修改
          </el-button>
          <el-button v-if="row.status!='deleted'" type="danger" plain size="mini">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <dept-editor ref="deptEditor" :type="editorType" :data="dept" @callback="getDeptList" />
  </div>
</template>

<script>
import { getDeptList } from '@/api/dept'
import DeptEditor from '@/views/sys/dept/editor.vue'
import { defaultDept } from '@/views/sys/dept/dept'

export default {
  components: { DeptEditor },
  data() {
    return {
      depetList: [],
      listQuery: {
        current: 1,
        size: 10,
        params: {
          parentId: 0
        }
      },
      dept: {},
      editorType: 'create'
    }
  },
  mounted() {
    this.getDeptList()
  },
  methods: {
    async getDeptList() {
      const { data } = await getDeptList(this.listQuery)
      data.records.forEach(item => {
        item.hasChildren = true
      })
      this.depetList = data.records
      this.total = data.total
      console.log(data)
    },
    async load(tree, treeNode, resolve) {
      this.listQuery.params.parentId = tree.id
      const { data } = await getDeptList(this.listQuery)
      data.records.forEach(item => {
        item.hasChildren = true
      })
      resolve(data.records)
    },
    addDeptHandler() {
      this.editorType = 'create'
      this.dept = Object.assign({}, defaultDept)
      this.$refs.deptEditor.visible = true
    },
    updateDeptHanlder(row) {
      this.editorType = 'update'
      this.dept = Object.assign({}, row)
      this.$refs.deptEditor.visible = true
    }
  }
}
</script>

<style scoped>
  .line{
    text-align: center;
  }
</style>

