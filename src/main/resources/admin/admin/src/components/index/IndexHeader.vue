<template>
  <div class="navbar admin-shell-header">
    <div class="title-menu admin-shell-header__brand">
      <div class="admin-shell-header__eyebrow">BUS ROUTE QUERY SYSTEM</div>
      <div class="admin-shell-header__titles">
        <div class="title-name">{{ this.$project.projectName }}</div>
        <div class="admin-shell-header__subtitle">线路资料、公告与互动内容统一管理后台</div>
      </div>
    </div>

    <div class="right-menu admin-shell-header__actions">
      <div class="admin-shell-header__env">{{ environmentLabel }}</div>
      <div class="user-info">{{ this.$storage.get('role') }} · {{ this.$storage.get('adminName') }}</div>
      <button
        v-if="this.$storage.get('role')!='管理员'"
        type="button"
        class="logout admin-shell-action"
        @click="onIndexTap"
      >
        返回前台
      </button>
      <button type="button" class="logout admin-shell-action" @click="onLogout">退出登录</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {}
    };
  },
  computed: {
    environmentLabel() {
      const port = window.location.port || ''
      if (port === '8134') return 'DEV 8134'
      if (port === '8133') return 'PROD 8133'
      return 'ADMIN CONSOLE'
    }
  },
  mounted() {
    const sessionTable = this.$storage.get("sessionTable")
    if (!sessionTable) {
      return
    }
    this.$http({
      url: sessionTable + '/session',
      method: "get"
    }).then(({ data }) => {
      if (data && data.code === 0) {
        this.user = data.data
        this.$storage.set('userid', data.data.id)
      } else {
        this.$message.error(data.msg)
      }
    })
  },
  methods: {
    onLogout() {
      this.$storage.clear()
      this.$router.replace({
        name: "login"
      })
    },
    onIndexTap() {
      window.location.href = `${this.$base.indexUrl}`
    }
  }
};
</script>

<style lang="scss" scoped>
.admin-shell-header {
  width: 100%;
}
</style>
