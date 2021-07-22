<template>
  <div class="app-container">
    <!--操作栏-->
    <div class="filter-container">
      <el-input
        v-model="listQuery.params.jobName"
        placeholder="名称"
        style="width: 200px;"
        size="mini"
        class="filter-item"
      />
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-search"
        plain
        size="mini"
        @click="getTasks"
      >
        搜索
      </el-button>
      <el-button
        v-auth="['sys:quarte:add']"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        plain
        size="mini"
        @click="addHandler"
      >
        新增
      </el-button>
    </div>
    <!--表格-->
    <el-table
      :data="tasks"
      style="width: 100%"
    >
      <el-table-column prop="jobName" label="名称" />
      <el-table-column prop="jobGroup" label="分组" />
      <el-table-column prop="beanClass" label="方法" />
      <el-table-column prop="cronExpression" label="表达式" />
      <el-table-column label="状态">
        <template slot-scope="{row}">
          <el-tag :type="row.jobStatus === '1' ? 'success': 'danger'">
            {{ row.jobStatus === '1' ? '运行' : '停止' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="createTime" label="创建时间">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <el-button
            v-auth="['sys:quarte:update']"
            :type="row.jobStatus === '0' ? 'success': 'danger'"
            plain
            size="mini"
            @click="updateStatus(row)"
          >
            {{ row.jobStatus === '0' ? '启动' : '停止' }}
          </el-button>
          <el-button
            v-if="row.jobStatus === '0'"
            v-auth="['sys:quarte:update']"
            type="success"
            plain
            size="mini"
            @click="updateHandler(row)"
          >
            更新
          </el-button>
          <el-button
            v-if="row.jobStatus === '0'"
            v-auth="['sys:quarte:update']"
            type="success"
            plain
            size="mini"
            @click="deleteTask(row)"
          >
            删除
          </el-button>
          <el-button
            v-if="row.jobStatus === '1'"
            v-auth="['sys:quarte:run']"
            type="success"
            plain
            size="mini"
            @click="runJobNow(row)"
          >
            立即执行
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getTasks" />

    <!--编辑表单-->
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
        :model="task"
        label-position="right"
        label-width="100px"
      >
        <el-form-item label="任务名" prop="jobName">
          <el-input v-model="task.jobName" placeholder="请填写任务名" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input v-model="task.description" placeholder="请填写任务描述" />
        </el-form-item>
        <el-form-item label="cron表达式" prop="cronExpression">
          <el-input v-model="task.cronExpression" placeholder="请填写cron表达式" />
        </el-form-item>
        <el-form-item label="任务目标" prop="beanClass">
          <el-input v-model="task.beanClass" placeholder="请填写任务目标" />
        </el-form-item>
        <el-form-item label="任务分组" prop="jobGroup">
          <el-input v-model="task.jobGroup" placeholder="请填写任务分组" />
        </el-form-item>
        <!--
                <el-form-item label="状态">
                  <el-switch
                    v-model="task.status"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    active-text="正常"
                    inactive-text="停用"
                    :active-value="1"
                    :inactive-value="0"
                  />
                </el-form-item>-->
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
import Pagination from '@/components/Pagination'
import { getTasks, updateTaskStatus, runJobNow, addTask, updateTask, deleteTask } from '@/api/task'
import { success } from '@/utils/global-message'
import { defaultQuartz } from '@/views/task/quartz'

export default {
  components: { Pagination },

  data() {
    return {
      rules: {
        jobName: [{ required: true, message: '请填写任务名', trigger: 'blur' }],
        description: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        cronExpression: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        beanClass: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        jobGroup: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },
      tasks: [],
      total: 0,
      listQuery: {
        current: 1,
        size: 10,
        params: {
          jobName: ''
        }
      },
      task: {},
      visible: false,
      editorType: 'create',
      dialogTitleMap: {
        create: '新增任务',
        update: '编辑任务'
      }
    }
  },
  mounted() {
    this.getTasks()
  },
  methods: {
    async getTasks() {
      const { data } = await getTasks(this.listQuery)
      this.tasks = data.records
      this.total = data.total
    },
    updateStatus(row) {
      row.jobStatus === '1' ? row.jobStatus = '0' : row.jobStatus = '1'
      updateTaskStatus(row).then(e => {
        this.getTasks()
      })
    },
    addHandler() {
      this.editorType = 'create'
      this.visible = true
      this.task = Object.assign({}, defaultQuartz)
    },
    updateHandler(row) {
      this.editorType = 'update'
      this.visible = true
      this.task = row
    },
    createData() {
      addTask(this.task).then(e => {
        this.visible = false
        success('任务添加成功')
        this.getTasks()
      })
    },
    updateData() {
      updateTask(this.task).then(e => {
        this.visible = false
        success('任务更新成功')
        this.getTasks()
      })
    },
    deleteTask(row) {
      console.log(row)
      deleteTask(row.id).then(e => {
        this.visible = false
        success('任务删除成功')
        this.getTasks()
      })
    },
    runJobNow(row) {
      runJobNow(row).then(e => {
        success('执行完成')
      })
    }
  }
}
</script>

<style scoped>

</style>
