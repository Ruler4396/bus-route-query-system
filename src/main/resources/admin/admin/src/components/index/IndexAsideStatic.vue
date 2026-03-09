<template>
  <el-aside class="index-aside" width="272px">
    <div class="index-aside-inner menulist">
      <div class="admin-sidebar-brand">
        <div class="admin-sidebar-brand__eyebrow">BACKSTAGE CONTROL</div>
        <div class="admin-sidebar-brand__title">运营控制台</div>
        <p class="admin-sidebar-brand__meta">更平直的企业后台导航，避免圆角卡片式堆叠。</p>
      </div>

      <div class="admin-sidebar-summary">
        <div class="admin-sidebar-summary__item">
          <span class="admin-sidebar-summary__label">当前角色</span>
          <strong>{{ role || '未登录' }}</strong>
        </div>
        <div class="admin-sidebar-summary__item">
          <span class="admin-sidebar-summary__label">可用模块</span>
          <strong>{{ moduleCount }} 个</strong>
        </div>
      </div>

      <div v-if="currentRoleMenu" class="menulist-item">
        <el-menu
          :key="menuRenderKey"
          :mode="'vertical'"
          :unique-opened="true"
          :default-active="activeIndex"
          :default-openeds="openedMenus"
          class="el-menu-demo admin-nav-menu"
        >
          <li class="admin-nav-section-heading" role="presentation">工作台</li>
          <el-menu-item index="0" @click="menuHandler('', '0')">
            <span class="admin-nav-row">
              <span class="admin-nav-leading">{{ menuToken('首页') }}</span>
              <span class="admin-nav-body">
                <span class="admin-nav-label">首页</span>
                <span class="admin-nav-kicker">{{ menuCaption('首页') }}</span>
              </span>
            </span>
          </el-menu-item>

          <li class="admin-nav-section-heading" role="presentation">账户设置</li>
          <el-submenu index="1">
            <template slot="title">
              <span class="admin-nav-row">
                <span class="admin-nav-leading">{{ menuToken('个人中心') }}</span>
                <span class="admin-nav-body">
                  <span class="admin-nav-label">个人中心</span>
                  <span class="admin-nav-kicker">{{ menuCaption('个人中心') }}</span>
                </span>
              </span>
            </template>
            <el-menu-item index="1-1" @click="menuHandler('updatePassword', '1-1', '1')">
              <span class="admin-subnav-row">
                <span class="admin-subnav-dot"></span>
                <span class="admin-subnav-text">修改密码</span>
                <span class="admin-subnav-caption">{{ menuCaption('修改密码', 'child') }}</span>
              </span>
            </el-menu-item>
            <el-menu-item index="1-2" @click="menuHandler('center', '1-2', '1')">
              <span class="admin-subnav-row">
                <span class="admin-subnav-dot"></span>
                <span class="admin-subnav-text">个人信息</span>
                <span class="admin-subnav-caption">{{ menuCaption('个人信息', 'child') }}</span>
              </span>
            </el-menu-item>
          </el-submenu>

          <li v-if="currentRoleMenu.backMenu && currentRoleMenu.backMenu.length" class="admin-nav-section-heading" role="presentation">业务导航</li>
          <el-submenu
            v-for="(menu, index) in currentRoleMenu.backMenu"
            :key="menu.menu"
            :index="String(index + 2)"
          >
            <template slot="title">
              <span class="admin-nav-row">
                <span class="admin-nav-leading">{{ menuToken(menu.menu) }}</span>
                <span class="admin-nav-body">
                  <span class="admin-nav-label">{{ menu.menu }}</span>
                  <span class="admin-nav-kicker">{{ menuCaption(menu.menu) }}</span>
                </span>
              </span>
            </template>
            <el-menu-item
              v-for="(child, sort) in menu.child"
              :key="sort"
              :index="(index + 2) + '-' + sort"
              @click="menuHandler(child.tableName, (index + 2) + '-' + sort, String(index + 2))"
            >
              <span class="admin-subnav-row">
                <span class="admin-subnav-dot"></span>
                <span class="admin-subnav-text">{{ child.menu }}</span>
                <span class="admin-subnav-caption">{{ menuCaption(child.menu, 'child') }}</span>
              </span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
    </div>
  </el-aside>
</template>

<script>
import menu from '@/utils/menu'

export default {
  data() {
    return {
      menuList: [],
      role: '',
      activeIndex: '0',
      openedMenus: ['1'],
      menuRenderKey: 0
    }
  },
  computed: {
    currentRoleMenu() {
      return this.menuList.find((item) => item.roleName === this.role) || null
    },
    moduleCount() {
      if (!this.currentRoleMenu || !Array.isArray(this.currentRoleMenu.backMenu)) {
        return 2
      }
      return this.currentRoleMenu.backMenu.reduce((count, item) => count + ((item.child || []).length || 0), 2)
    }
  },
  watch: {
    '$route.path': {
      immediate: true,
      handler() {
        this.syncMenuState()
      }
    },
    currentRoleMenu() {
      this.syncMenuState()
    }
  },
  mounted() {
    const menus = menu.list()
    if (menus) {
      this.menuList = menus
      this.role = this.$storage.get('role')
      this.syncMenuState()
    } else {
      this.$http({
        url: 'menu/list',
        method: 'get',
        params: {
          page: 1,
          limit: 1,
          sort: 'id'
        }
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.menuList = JSON.parse(data.data.list[0].menujson)
          this.$storage.set('menus', this.menuList)
          this.role = this.$storage.get('role')
          this.syncMenuState()
        }
      })
    }
  },
  methods: {
    menuHandler(name, index = '0', parentIndex = '') {
      this.activeIndex = index
      this.openedMenus = parentIndex ? [parentIndex] : []
      this.menuRenderKey += 1
      this.$router.push('/' + name)
    },
    syncMenuState() {
      const path = String((this.$route && this.$route.path) || '').replace(/\/+$/, '') || '/index'
      if (path === '/index' || path === '/') {
        this.activeIndex = '0'
        this.openedMenus = []
        this.menuRenderKey += 1
        return
      }
      if (path === '/updatePassword') {
        this.activeIndex = '1-1'
        this.openedMenus = ['1']
        this.menuRenderKey += 1
        return
      }
      if (path === '/center') {
        this.activeIndex = '1-2'
        this.openedMenus = ['1']
        this.menuRenderKey += 1
        return
      }
      if (this.currentRoleMenu && Array.isArray(this.currentRoleMenu.backMenu)) {
        for (let groupIndex = 0; groupIndex < this.currentRoleMenu.backMenu.length; groupIndex += 1) {
          const group = this.currentRoleMenu.backMenu[groupIndex]
          const items = Array.isArray(group.child) ? group.child : []
          for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
            if (`/${items[itemIndex].tableName}` === path) {
              this.activeIndex = `${groupIndex + 2}-${itemIndex}`
              this.openedMenus = [String(groupIndex + 2)]
              this.menuRenderKey += 1
              return
            }
          }
        }
      }
      this.activeIndex = '0'
      this.openedMenus = []
      this.menuRenderKey += 1
    },
    menuToken(label) {
      const clean = String(label || '').replace(/\s+/g, '')
      if (!clean) return 'NA'
      if (/^[A-Za-z]/.test(clean)) {
        return clean.slice(0, 2).toUpperCase()
      }
      return clean.slice(0, 2)
    },
    menuCaption(label, level = 'primary') {
      const clean = String(label || '').trim()
      if (level === 'primary') {
        if (clean === '首页') return 'ENTRY'
        if (clean === '个人中心') return 'ACCOUNT'
        if (/用户|会员/.test(clean)) return 'USER'
        if (/公告|新闻|文章|资讯/.test(clean)) return 'CONTENT'
        if (/留言|评论|反馈/.test(clean)) return 'REVIEW'
        if (/路线|公交|站点|地图/.test(clean)) return 'TRANSIT'
        return 'MODULE'
      }
      if (clean === '修改密码') return 'SECURITY'
      if (clean === '个人信息') return 'PROFILE'
      if (/审核|回复/.test(clean)) return 'ACTION'
      if (/留言|评论|反馈/.test(clean)) return 'REVIEW'
      if (/统计|报表/.test(clean)) return 'REPORT'
      return 'SCREEN'
    }
  }
}
</script>

<style lang="scss" scoped>
.index-aside {
  .admin-sidebar-brand,
  .admin-sidebar-summary,
  .admin-nav-section-heading,
  .admin-nav-row,
  .admin-subnav-row {
    list-style: none;
  }
}
</style>
