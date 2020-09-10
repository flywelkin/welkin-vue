<template>
  <div class="app-container">
    <el-dialog
      :title="dialogTitleMap[type]"
      :visible.sync="visible"
      :close-on-click-modal="false"
      width="600px"
      @open="openDialogHandler"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="data"
        label-position="right"
        label-width="80px"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible = false">
          取消
        </el-button>
        <el-button type="primary" @click="type==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { defaultDept } from '@/views/sys/dept/dept'

export default {
  name: 'DeptEditor',
  props: {
    type: {
      type: String,
      default: 'create'
    },
    data: {
      type: Object,
      default: Object.assign({}, defaultDept)
    }
  },
  data() {
    return {
      rules: {},
      visible: false,
      dialogTitleMap: {
        create: '新增部门',
        update: '编辑部门'
      }
    }
  },
  methods: {
    openDialogHandler() {
    },
    createData() {
      this.visible = false
      this.$emit('callback')
    },
    updateData() {
      this.visible = false
      this.$emit('callback')
    }
  }
}
</script>

<style scoped>

</style>
