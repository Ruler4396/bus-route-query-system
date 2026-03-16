<template>
  <div class="container loginIn admin-login-page">
    <div class="admin-login-shell">
      <section class="admin-login-intro" aria-label="后台简介">
        <p class="admin-login-intro__eyebrow">TRANSIT OPERATIONS CONSOLE</p>
        <h1 class="admin-login-intro__title">公交线路查询系统后台</h1>
        <p class="admin-login-intro__desc">
          管理员登录后可进入路线、公告、留言等后台模块。
        </p>
        <div class="admin-login-intro__grid">
          <div class="admin-login-intro__item">
            <span class="admin-login-intro__label">适用入口</span>
            <strong>后台管理</strong>
          </div>
          <div class="admin-login-intro__item">
            <span class="admin-login-intro__label">主要工作</span>
            <strong>路线 / 公告 / 留言</strong>
          </div>
          <div class="admin-login-intro__item">
            <span class="admin-login-intro__label">交互原则</span>
            <strong>仅管理员可登录</strong>
          </div>
        </div>
      </section>

      <section class="admin-login-panel" aria-label="登录表单">
        <el-form class="login-form" label-position="left" label-width="0px">
          <div class="title-container">
            <div class="admin-login-panel__eyebrow">ADMIN SIGN IN</div>
            <h3 class="title">进入后台工作台</h3>
          </div>

          <div class="admin-login-tip">仅管理员可登录。</div>

          <el-form-item class="style1">
            <span class="svg-container"><svg-icon icon-class="user" /></span>
            <el-input
              v-model="rulesForm.username"
              placeholder="请输入用户名"
              name="username"
              type="text"
              autocomplete="username"
              @keyup.enter.native="login"
            />
          </el-form-item>

          <el-form-item class="style1">
            <span class="svg-container"><svg-icon icon-class="password" /></span>
            <el-input
              v-model="rulesForm.password"
              placeholder="请输入密码"
              name="password"
              type="password"
              autocomplete="current-password"
              @keyup.enter.native="login"
            />
          </el-form-item>

          <el-button type="primary" @click="login()" class="loginInBt">登录后台</el-button>

          <el-form-item class="setting">
            <div class="admin-login-footnote">
              如账号异常，请联系维护人员。
            </div>
          </el-form-item>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script>
import menu from "@/utils/menu";

export default {
  data() {
    return {
      rulesForm: {
        username: "",
        password: "",
        role: "",
        code: '',
      },
      menus: [],
      roles: [],
      tableName: "",
      codes: [{
        num: 1,
        color: '#000',
        rotate: '10deg',
        size: '16px'
      },{
        num: 2,
        color: '#000',
        rotate: '10deg',
        size: '16px'
      },{
        num: 3,
        color: '#000',
        rotate: '10deg',
        size: '16px'
      },{
        num: 4,
        color: '#000',
        rotate: '10deg',
        size: '16px'
      }],
    };
  },
  mounted() {
    let menus = menu.list() || [];
    this.menus = menus;
    const adminRole = menus.find((item) => item.hasBackLogin == '是' && item.roleName == '管理员');
    const fallbackRole = menus.find((item) => item.hasBackLogin == '是');
    const selectedRole = adminRole || fallbackRole || null;
    this.roles = selectedRole ? [selectedRole] : [];
    this.rulesForm.role = selectedRole ? selectedRole.roleName : '';
    this.tableName = selectedRole ? selectedRole.tableName : '';
  },
  created() {
    this.getRandCode()
  },
  methods: {
    register(tableName){
      this.$storage.set("loginTable", tableName);
      this.$router.push({path:'/register'})
    },
    // 登陆
    login() {
      if (!this.rulesForm.username) {
         this.$message.error("请输入用户名");
        return;
      }
      if (!this.rulesForm.password) {
         this.$message.error("请输入密码");
        return;
      }
      if (!this.roles.length) {
         this.$message.error("后台未配置管理员登录角色，请联系系统维护人员");
         return;
      }
      this.tableName = this.roles[0].tableName;
      this.rulesForm.role = this.roles[0].roleName;

      this.$http({
        url: `${this.tableName}/login?username=${this.rulesForm.username}&password=${this.rulesForm.password}`,
        method: "post"
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$storage.set("Token", data.token);
          this.$storage.set("role", this.rulesForm.role);
          this.$storage.set("sessionTable", this.tableName);
          this.$storage.set("adminName", this.rulesForm.username);
          this.$router.replace({ path: "/index/" });
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    getRandCode(len = 4){
      this.randomString(len)
    },
    randomString(len = 4) {
      let chars = [
          "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
          "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v",
          "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G",
          "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R",
          "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2",
          "3", "4", "5", "6", "7", "8", "9"
      ]
      let colors = ["0", "1", "2","3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]
      let sizes = ['14', '15', '16', '17', '18']

      let output = [];
      for (let i = 0; i < len; i++) {
        // 随机验证码
        let key = Math.floor(Math.random()*chars.length)
        this.codes[i].num = chars[key]
        // 随机验证码颜色
        let code = '#'
        for (let j = 0; j < 6; j++) {
          let key = Math.floor(Math.random()*colors.length)
          code += colors[key]
        }
        this.codes[i].color = code
        // 随机验证码方向
        let rotate = Math.floor(Math.random()*60)
        let plus = Math.floor(Math.random()*2)
        if(plus == 1) rotate = '-'+rotate
        this.codes[i].rotate = 'rotate('+rotate+'deg)'
        // 随机验证码字体大小
        let size = Math.floor(Math.random()*sizes.length)
        this.codes[i].size = sizes[size]+'px'
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.admin-login-page {
  min-height: 100vh;
}
</style>
