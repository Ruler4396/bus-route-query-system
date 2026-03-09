<template>
  <el-main class="admin-shell-main">
    <div class="admin-shell-main__inner">
      <bread-crumbs :title="title" class="bread-crumbs"></bread-crumbs>
      <div class="admin-shell-main__stage">
        <router-view class="router-view"></router-view>
      </div>
    </div>
  </el-main>
</template>

<script>
import menu from "@/utils/menu";

export default {
  data() {
    return {
      menuList: [],
      role: "",
      currentIndex: -2,
      itemMenu: [],
      title: '',
    };
  },
  mounted() {
    let menus = menu.list();
    this.menuList = menus;
    this.role = this.$storage.get("role");
  },
  created() {
    this.init();
  },
  methods: {
    init(){
      this.$nextTick(()=>{})
    },
    menuHandler(menu) {
      this.$router.push({
        name: menu.tableName
      });
      this.title = menu.menu;
    },
    titleChange(index, menus) {
      this.currentIndex = index
      this.itemMenu = menus;
    },
    homeChange(index) {
      this.itemMenu = [];
      this.title = ""
      this.currentIndex = index
      this.$router.push({
        name: 'home'
      });
    },
    centerChange(index) {
      this.itemMenu = [{
        "buttons": ["新增", "查看", "修改", "删除"],
        "menu": "修改密码",
        "tableName": "updatePassword"
      }, {
        "buttons": ["新增", "查看", "修改", "删除"],
        "menu": "个人信息",
        "tableName": "center"
      }];
      this.title = ""
      this.currentIndex = index
      this.$router.push({
        name: 'home'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.admin-shell-main,
.admin-shell-main__inner,
.admin-shell-main__stage {
  height: 100%;
}

.router-view {
  min-height: 100%;
}
</style>
