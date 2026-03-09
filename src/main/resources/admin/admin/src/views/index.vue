<template>
  <el-container class="admin-shell">
    <index-header></index-header>
    <el-container class="admin-shell__body">
      <index-aside></index-aside>
      <index-main></index-main>
    </el-container>
  </el-container>
</template>
<script>
import IndexHeader from '@/components/index/IndexHeader'
import IndexAside from '@/components/index/IndexAsideStatic'
import IndexMain from '@/components/index/IndexMain'

export default {
  components: {
    IndexHeader,
    IndexAside,
    IndexMain
  }
}
</script>

<style lang="scss" scoped>
.admin-shell {
  position: absolute;
  inset: 0;
  width: 100%;
}

.admin-shell__body {
  min-height: 0;
}
</style>
