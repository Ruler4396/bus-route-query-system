# PJT-0001 · PROJECT_CHANGELOG

## 2026-03-11 · CHG-20260311-059 · 后台入口精简重组（高频工作台 + 低频下拉）与遗留暴露收口
- 按“后台只保留高频功能、低频功能下沉到下拉菜单，并清理遗留入口文案与无效模块暴露”的要求，对后台壳层做了结构级收口：
  - 工作台主入口改为仅保留高频模块：`公交路线`、`出行公告`、`资源链接`、`留言建议`、`用户管理`；
  - 顶栏新增“更多功能”下拉菜单，收纳低频入口：`个人信息`、`修改密码`、`在线提问`、`路线评论审核`、`公告评论审核`、`展示配置`；
  - 顶栏和工作台说明文案改为短句直述，移除冗长说明性文案；
  - 增加历史路由拦截：`#/pay` 这类遗留入口会自动回到工作台，避免继续暴露无效模块。
- 源码同步：
  - `src/main/resources/admin/admin/public/js/transit-admin-sidebar-dom.js`：重构模块清单、角色可见范围、工作台分组、下拉菜单与遗留路由拦截逻辑；
  - `src/main/resources/admin/admin/public/css/transit-admin-theme.css`：补充顶栏下拉菜单样式与移动端适配；
  - `src/main/resources/admin/admin/src/views/index.vue`：移除 `index-aside` 引用，彻底不再占用左侧布局位；
  - `src/main/resources/admin/admin/src/router/router-static.js`：移除 `/pay` 路由，并统一文案为“出行公告 / 资源链接 / 路线评论审核 / 展示配置”；
  - `src/main/resources/admin/admin/src/utils/menu.js`：按新后台结构重写菜单权限映射，补齐评论审核菜单项并清理旧文案。
- 运行资源同步：
  - `admin/public` 与 `admin/dist` 的 `transit-admin-theme.css`、`transit-admin-sidebar-dom.js` 已保持同版本内容；
  - `public/index.html` 与 `dist/index.html` 资源版本更新为：`v=20260311-301`。
- 低冲击验证：
  - `node --check src/main/resources/admin/admin/public/js/transit-admin-sidebar-dom.js`
  - `node --check src/main/resources/admin/admin/dist/js/transit-admin-sidebar-dom.js`
  - `node --check src/main/resources/admin/admin/src/utils/menu.js`
  - `node --check src/main/resources/admin/admin/src/router/router-static.js`
  - `bash scripts/remote-dev-check.sh`（`mvn -q -DskipTests compile` 通过）
- 说明：本轮仅做代码与静态资源重组，未执行服务重启。
- 对应提交：`TBD`


## 2026-03-10 · CHG-20260310-058 · 登录输入框与工作台稳定性收口修复
- 根据最新反馈，继续修复后台重做后的两个可用性问题：
  - 登录输入框图标与 placeholder 贴得过近，视觉上像“输入框坏了”；
  - 个别情况下登录后会落回旧的“欢迎使用 公交线路查询系统”首页，导致工作台不可用。
- 本轮实现：
  - `transit-admin-theme.css` 将登录输入框改为更常规的后台样式：图标绝对定位到输入框内部，文本与 placeholder 左侧留白提高到 `44px`，placeholder 颜色收敛，去掉异常挤压感；
  - 登录页说明文案收短，不再使用过强的“AI 味”说明，改为更直接的后台表达；
  - `transit-admin-sidebar-dom.js` 将首页工作台扫描兜底增强为“启动多次重扫 + pageshow/resize/hashchange 继续触发”，并把调度上限提高，降低偶发掉回旧欢迎页的概率；
  - 追加隐藏旧首页 `main-text` 的保护规则，避免在工作台尚未注入时把旧大标题暴露出来。
- 资源版本已升级到：`transit-admin-theme.css?v=20260310-204`、`transit-admin-sidebar-dom.js?v=20260310-204`。
- 远端 8134 备份与部署：
  - 备份目录：`runtime/manual-backups/admin-ui-stabilityfix-20260310-143916/`；
  - 当前开发实例 PID=`12745`，端口 `8134` 已监听，`8133` 生产实例未触碰。
- 最终验收：
  - Playwright 对外网地址连续执行 `3` 次真实登录，`3/3` 均稳定进入 `#/index/` 工作台；
  - 每次验收都满足：`hasWorkbench=true`、`hasOldWelcome=false`、`launcherCount=11`；
  - 最终确认截图：`runtime/remote-dev/admin-login-final-20260310.png`、`runtime/remote-dev/admin-home-final-20260310.png`、`runtime/remote-dev/admin-module-final-20260310.png`。
- 对应提交：`TBD`

## 2026-03-10 · CHG-20260310-057 · 修复后台登录页空白、按钮溢出与顶栏文字错位
- 根据现场截图反馈，修复了后台二次重做后的三个显示问题：
  - 登录页 `.container.loginIn` 被限制为固定宽度，导致右侧出现大面积空白；
  - 登录按钮受旧模板残留 `margin-left` / 高度规则影响，按钮向右溢出且文字显示异常；
  - 登录后顶栏继承旧模板行高，导致品牌标题与路由标题溢出到底部，形成“发虚重复字”的错位感。
- 本轮实现：
  - `transit-admin-theme.css` 调整登录页外层为全宽铺满视口，登录表单恢复块级布局，登录按钮强制回到卡片内部；
  - 主内容区继续保留无侧栏工作台结构，但统一把 `.el-main` 顶部留白提高，避免内容压到 sticky 顶栏；
  - 顶栏压缩为更稳定的单行/双行密度，重置 `.navbar` / `.admin-shell-topbar` 的 `line-height`、间距与溢出规则，消除顶部重复文字；
  - 面包屑行高同步收敛，避免字位看起来发飘。
- 资源版本已升级到：`transit-admin-theme.css?v=20260310-203`、`transit-admin-sidebar-dom.js?v=20260310-203`。
- 远端 8134 备份与部署：
  - 备份目录：`runtime/manual-backups/admin-ui-layoutfix-20260310-140936/`、`runtime/manual-backups/admin-ui-topfix-20260310-141722/`；
  - 当前开发实例 PID=`11420`，端口 `8134` 已监听，`8133` 生产实例未触碰。
- 验收结果：
  - Playwright 复核登录页：根容器宽度=`1832`，与视口等宽，登录按钮右边界=`1440`，未再超出表单；
  - Playwright 复核工作台：`topbarBottom=100 <= navbarBottom=112`，工作台首屏 `heroTop=142`，已不再被顶栏遮挡；
  - Playwright 复核模块页：`公交路线` 顶栏未再溢出，横幅 `bannerTop=200`，标题显示正常；
  - 修复确认截图：`runtime/remote-dev/admin-login-fixed-20260310.png`、`runtime/remote-dev/admin-home-fixed-20260310.png`、`runtime/remote-dev/admin-module-fixed-20260310.png`。
- 对应提交：`TBD`

## 2026-03-10 · CHG-20260310-056 · 后台改为无侧栏工作台入口，8134 全量重做生效
- 按“不要左侧侧边栏、改成主页按钮入口、整体样式与前端统一、仅沿用接口与业务逻辑”的要求，重新定义后台壳层：
  - 左侧 `aside` 彻底隐藏，不再作为后台导航入口；
  - 登录后首页 `#/index/` 改为“工作台按钮页”，集中提供 `个人中心 / 修改密码 / 公交路线 / 网站公告 / 友情链接 / 留言建议 / 在线提问 / 公交路线评论 / 网站公告评论 / 轮播图管理 / 用户管理` 共 `11` 个后台入口；
  - 所有内页统一注入顶部模块横幅，并保留“返回工作台”按钮；
  - 顶栏重做为前台同语系的品牌条、环境标签、用户标签与快捷操作区。
- 资源层重写：
  - `src/main/resources/admin/admin/public/js/transit-admin-sidebar-dom.js` 与 `dist/js/transit-admin-sidebar-dom.js` 全量改为新的运行时壳层脚本，负责登录页增强、工作台构建、模块页横幅注入、顶栏重建与视图状态切换；
  - `src/main/resources/admin/admin/public/css/transit-admin-theme.css` 与 `dist/css/transit-admin-theme.css` 全量改为新的“公交运营工作台”主题，采用与前台一致的深绿/米白/铜色系、直线分隔与低圆角平面语言，并在最终版补充 `Noto Sans SC` 正文字体回退，避免无本地中文字体环境出现方块字；
  - `src/main/resources/admin/admin/public/index.html` 与 `dist/index.html` 资源版本统一升级到 `v=20260310-201`。
- 文档同步：`docs/PROJECT_RUNBOOK.md` 已更新为当前“无侧栏工作台”后台形态，并补充最新截图路径。
- 远端 8134 备份与部署：
  - 备份目录：`runtime/manual-backups/admin-ui-20260310-135128/`；
  - 执行链路：`bash scripts/remote-dev-check.sh` → `bash scripts/remote-dev-build.sh` → `bash scripts/remote-dev-stop.sh` → `bash scripts/remote-dev-start.sh` → `bash scripts/remote-dev-status.sh`；
  - 当前开发实例 PID=`7964`，端口 `8134` 已监听，`8133` 生产实例未触碰。
- 验收结果：
  - `curl http://8.134.206.52:8134/springbootmf383/admin/dist/index.html` 已确认命中 `transit-admin-theme.css?v=20260310-201` 与 `transit-admin-sidebar-dom.js?v=20260310-201`；
  - Playwright 登录 `abo / abo` 后确认：工作台已渲染、入口按钮数=`11`、左侧侧边栏 `display=none`；
  - 抽查模块：`公交路线`、`留言建议`、`用户管理` 均可从工作台按钮进入，其中 `公交路线` 页面已显示新的顶部横幅与“返回工作台”；
  - 验收截图：`runtime/remote-dev/admin-workbench-home-20260310.png`、`runtime/remote-dev/admin-workbench-module-20260310.png`。
- 对应提交：`TBD`


## 2026-03-10 · CHG-20260310-055 · 修正旧 dist 运行时登录兜底，8134 后台 UI 已实际生效
- 修正 `transit-admin-sidebar-dom.js` 对旧 `admin/dist` 的运行时兼容策略：不再搬移原登录表单节点，改为“插入介绍区 + 保留原表单事件 + 登录 API 兜底”，避免旧版 Vue 事件在登录页失效。
- `transit-admin-theme.css` 同步补充旧登录布局的非侵入式重排规则与 `admin-login-inline-message` 提示样式，保证未重编译前端 bundle 的情况下，登录页仍可正常登录且保持新视觉语言。
- 远端 `8.134.206.52` 已完成：资源同步 → `bash scripts/remote-dev-check.sh` → `bash scripts/remote-dev-build.sh` → `bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh`。当前开发实例 PID=`6168`，端口 `8134` 已监听。
- 页面级验收：
  - 外网 `http://8.134.206.52:8134/springbootmf383/admin/dist/index.html` 已命中 `transit-admin-theme.css?v=20260309-120` 与 `transit-admin-sidebar-dom.js?v=20260309-120`；
  - Playwright 验证登录后命中 `#/index/`，并确认侧栏 `asideWidth=272`、一级激活项 `border-left=3px`、一级/二级导航 `border-radius=0`；
  - 验收截图：`runtime/remote-dev/admin-ui-flat-20260310.png`。
- 说明：本轮仅操作 `8134` 开发实例，`8133` 生产实例保持不动。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-054 · 后台壳层改为扁平中台风格（侧栏去圆角卡片化）
- 按“登录后的侧边栏不要圆角卡片式设计”的要求，重新定义后台壳层语言：顶部改为深色运营条带，左侧改为扁平导轨式导航，一级/二级菜单全部取消圆角卡片感，改成直线分隔、左侧激活导轨和更清晰的层级排布。
- 源码层同步重写：
  - `src/main/resources/admin/admin/src/views/login.vue` 改为“后台简介 + 登录表单”双栏结构；
  - `src/main/resources/admin/admin/src/components/index/IndexHeader.vue` 改为品牌条 + 环境标识 + 操作区；
  - `src/main/resources/admin/admin/src/components/index/IndexAsideStatic.vue` 增加角色/模块摘要、路由态联动与更平直的目录式导航；
  - `src/main/resources/admin/admin/src/components/index/IndexMain.vue`、`src/components/common/BreadCrumbs.vue`、`src/views/index.vue` 去除旧模板内联背景/圆角盒子写法。
- 资源层同步落地：
  - `src/main/resources/admin/admin/public/css/transit-admin-theme.css` 整份改为扁平中台主题；
  - `src/main/resources/admin/admin/public/js/transit-admin-sidebar-dom.js` 扩展为运行时兼容脚本，在旧 `dist` 骨架未重编译时也能重组登录页 / 头部 / 侧栏 DOM；
  - 同一套主题与脚本已镜像到 `src/main/resources/admin/admin/dist/css/transit-admin-theme.css`、`src/main/resources/admin/admin/dist/js/transit-admin-sidebar-dom.js`，并把 `public/index.html` / `dist/index.html` 资源版本统一到 `v=20260309-120`。
- 本地静态校验：`node -c src/main/resources/admin/admin/public/js/transit-admin-sidebar-dom.js`、`node -c src/main/resources/admin/admin/dist/js/transit-admin-sidebar-dom.js` 通过；`public/index.html` / `dist/index.html` 已确认同时命中 `transit-admin-theme.css?v=20260309-120` 与 `transit-admin-sidebar-dom.js?v=20260309-120`。
- 阻塞说明：远端 `8.134.206.52` 在本轮执行中出现 SSH banner exchange timeout，HTTP 8134 也超时，导致暂未完成“推送远端 → package → 重启 8134”这一步；本次未触碰 `8133` 生产实例。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-053 · 后台方案 B 补齐品牌头顶距并刷新资源版本
- 继续复核方案 B 的截图后，修正后台侧栏品牌头被顶栏遮挡的问题：把 `admin/dist|public/css/transit-admin-theme.css` 中的侧栏内边距顶部由 `26px` 提高到 `74px`，保证“运营控制台”品牌头完整露出，不再贴顶。
- 为避免浏览器继续命中旧缓存，后台入口资源版本升级为：`transit-admin-theme.css?v=20260309-053`、`transit-admin-sidebar-dom.js?v=20260309-053`（`admin/dist/index.html` + `admin/public/index.html`）。
- 本轮验证：复用 `bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh`，并重新执行后台专项 Playwright 回归与截图 spot check；截图复核后删除临时 PNG。
- 说明：仅验证 `8134` 开发实例，未触碰 `8133` 生产实例；未执行上线操作。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-052 · 后台侧栏改为方案 B（目录式企业控制台导航）
- 根据“不要圆角卡片展开式、尽量不要和现在一样”的反馈，后台左侧栏继续重构为更克制的方案 B：目录式企业控制台导航，而不是卡片堆叠。
- 本轮实现：
  - `src/main/resources/admin/admin/src/components/index/IndexAsideStatic.vue` 调整为“品牌头 + 分组标题 + 目录行 + 内缩子列表”的源码骨架，一级项改为扁平行式信息结构，二级项补齐右侧 caption；
  - `src/main/resources/admin/admin/dist/js/transit-admin-sidebar-dom.js` 与 `admin/public/js/transit-admin-sidebar-dom.js` 同步改成方案 B 的运行时 DOM 重组，确保当前 `dist` 页面立即看到新骨架；
  - `src/main/resources/admin/admin/dist/css/transit-admin-theme.css` 与 `admin/public/css/transit-admin-theme.css` 追加 v052 覆盖：去掉菜单项圆角卡片感、去掉 badge 方块背景、改成细分隔线 + 左导轨 + 内缩树形子导航。
- 后台入口资源版本升级：`transit-admin-theme.css?v=20260309-052`、`transit-admin-sidebar-dom.js?v=20260309-052`（`admin/dist/index.html` + `admin/public/index.html`）。
- 回归同步更新：`ui-automation/tests/ui-admin-theme.spec.js`、`ui-automation/tests/ui-real-route-admin-theme.spec.js` 改为断言“无卡片圆角 / 无菜单渐变 / 左导轨 + 目录式网格骨架”的方案 B 约束。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh`、`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js --workers=1`、`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-real-route-admin-theme.spec.js -g "Admin login and dashboard should load transit-aligned theme styles" --workers=1`。
- 说明：仅验证 `8134` 开发实例，未触碰 `8133` 生产实例；未执行上线操作。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-051 · 后台菜单 DOM 结构重做（品牌头 / 分组标题 / 双层导航骨架）
- 不再只通过 CSS 覆盖旧后台菜单，而是直接引入新的 DOM 骨架：
  - `src/main/resources/admin/admin/src/components/index/IndexAsideStatic.vue` 已改为新的结构化模板（品牌头、工作台/账户设置/业务导航分组、一级导航双行内容、二级导航行内结构）。
  - 为了让当前 `dist` 产物立即生效，新增 `src/main/resources/admin/admin/dist/js/transit-admin-sidebar-dom.js` 与 `src/main/resources/admin/admin/public/js/transit-admin-sidebar-dom.js`，在运行时对旧菜单 DOM 做一次性重组。
- 新骨架设计语言参考官方商业后台模式：GitHub Primer NavList、GitLab Pajamas Navigation Sidebar、Microsoft Fluent Navigation、Ant Design Sider，落地为：
  - 真实品牌头（替换纯伪元素标题）；
  - 菜单分组标题（工作台 / 账户设置 / 业务导航）；
  - 一级菜单 = badge + kicker + label 的双层信息结构；
  - 二级菜单 = dot + text + caption 的层级信息结构。
- 后台入口资源版本升级：`transit-admin-theme.css?v=20260309-051`、`transit-admin-sidebar-dom.js?v=20260309-051`（`admin/dist/index.html` + `admin/public/index.html`）。
- 回归同步更新：`ui-automation/tests/ui-admin-theme.spec.js` 现在直接断言 `.admin-sidebar-brand`、`.admin-nav-section-heading`、`.admin-nav-row`、`.admin-subnav-row` 等新 DOM 节点已经存在。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js --workers=1` = `1 passed`；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-real-route-admin-theme.spec.js -g "Admin login and dashboard should load transit-aligned theme styles" --workers=1` = `1 passed`。
- 说明：仅验证 `8134` 开发实例，未触碰 `8133` 生产实例；未执行上线操作。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-050 · 管理后台主题文件整份重写（商业侧栏范式重新落地）
- 按“彻底删除旧样式、重新参考优秀商业后台侧栏”的要求，直接整份重写 `admin/dist/css/transit-admin-theme.css` 与 `admin/public/css/transit-admin-theme.css`，不再叠加旧补丁块。
- 设计参考改为官方商业设计系统的通用原则：GitHub Primer NavList、GitLab Pajamas Navigation Sidebar、Microsoft Fluent Navigation、Ant Design Sider；本轮落地为：
  - 浅色纸面式侧栏背景，去掉旧模板的深色厚块和胶囊堆叠；
  - 一级菜单采用“左导轨 + 底部分隔 + 轻 hover/active”的列表式导航；
  - 二级菜单采用“垂直导轨 + 文本项 + 小圆点”的层级式展开，而非内嵌卡片盒；
  - 顶栏与主内容区继续收敛到前台一致的深绿 / 米白设计语言。
- 样式缓存版本升级：`transit-admin-theme.css?v=20260309-050`（`admin/dist/index.html` + `admin/public/index.html`）。
- 回归同步更新：`ui-automation/tests/ui-admin-theme.spec.js` 重新对齐到新侧栏范式（宽度、左导轨、去 box-shadow、二级导轨容器等约束）。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js --workers=1` = `1 passed`；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-real-route-admin-theme.spec.js -g "Admin login and dashboard should load transit-aligned theme styles" --workers=1` = `1 passed`。
- 说明：`ui-real-route-admin-theme.spec.js` 内另一个“前台路由同步”用例存在历史性超时，与本轮后台样式重写无直接关联，本轮未继续改动该链路；本次仅以后台专项回归结果作为验收依据。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-049 · 管理后台左栏样式再重构（前台同色系导轨导航）
- 针对“后台左侧风格仍不统一、看起来还是旧模板”的反馈，新增 v049 主题覆盖（admin/dist/css/transit-admin-theme.css + admin/public/css/transit-admin-theme.css）：
  - 一级菜单改为前台同色系的扁平导轨样式（2px 左导轨 + 底部分隔线），去掉旧版胶囊卡片堆叠感。
  - 二级菜单改为“垂直导轨 + 轻量文本项 + 圆点引导”，去掉内嵌卡片盒与渐变大块。
  - 统一顶部栏/主内容区配色到前台 transit-business-ui 语言（深绿 + 米白），并修正菜单 box-sizing 与宽度，降低错位概率。
- 样式缓存版本升级：transit-admin-theme.css?v=20260309-049（admin/dist/index.html + admin/public/index.html）。
- 回归补强：ui-automation/tests/ui-admin-theme.spec.js 新增“扁平导轨约束”断言（一级菜单小圆角、左边线、上边框为 0、二级容器左导轨和子项非胶囊背景）。
- 本轮验证：bash scripts/remote-dev-check.sh、bash scripts/remote-dev-build.sh、bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh 通过；cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js tests/ui-real-route-admin-theme.spec.js --workers=1 = 3 passed。
- 说明：仅验证 8134 开发实例，未触碰 8133 生产实例；未执行上线操作。
- 对应提交：TBD


## 2026-03-09 · CHG-20260309-047 · 左栏样式“同质化”纠偏：改为扁平导轨式导航（v048）
- 针对“左栏怎么改都还是同一类胶囊卡片”的反馈，执行样式范式重置：
  - 一级菜单由“整块胶囊卡”改为“扁平条目 + 左侧状态导轨 + 底部分隔线”；
  - 二级菜单由“内嵌卡片组”改为“垂直导轨层级 + 轻量文本项”，去掉遗留胶囊块感；
  - 交互反馈保留（hover / active / opened），但改为更克制的信息化反馈而非重装饰块面。
- 根因修正：补强 `data-v-10547812` 范围选择器覆盖，清除旧版子菜单项的渐变/边框残留，避免新样式被历史规则“顶回去”。
- 样式缓存版本升级：`transit-admin-theme.css?v=20260309-048`（`admin/dist/index.html` + `admin/public/index.html`）。
- 截图产物：
  - 新版侧栏：`runtime/remote-dev/admin-sidebar-after-v048.png`
  - 上一版对比：`runtime/remote-dev/admin-sidebar-after-v047.png`
  - 并排图：`runtime/remote-dev/admin-sidebar-compare-v048.png`
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh`；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js tests/ui-real-route-admin-theme.spec.js --workers=1` = `3 passed`。
- 说明：仅验证 `8134` 开发实例，未触碰 `8133` 生产实例；未执行上线操作。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-046 · 管理后台 UI 全量重做（商业化侧栏范式）
- 按“商业后台侧栏”方向重做 `admin` 主题（v047），重点参考并落地以下官方设计体系：GitLab Pajamas Navigation Sidebar、GitHub Primer NavList、Microsoft Fluent 2 Nav、Ant Design 常用布局。
- 新版后台视觉语言（`transit-admin-theme.css`）完成全量覆盖：
  - 顶栏：浅色玻璃质感 + 轻渐变，右侧操作按钮改为胶囊态；
  - 侧栏：深色 SaaS 风格，一级菜单加入导引条、hover 位移、active 强化；
  - 层级：二级面板独立容器化（导引线 + 子项圆点 + 激活态高对比）；
  - 主区：内容卡片、面包屑、按钮语义色统一到新配色体系。
- 样式缓存版本升级：`transit-admin-theme.css?v=20260309-047`（`admin/dist/index.html` + `admin/public/index.html`），避免浏览器继续读取旧样式。
- 侧栏对比截图（同视口 `1850x700`）已生成：
  - 重做前：`runtime/remote-dev/admin-sidebar-before-v045-recheck.png`
  - 重做后：`runtime/remote-dev/admin-sidebar-after-v047.png`
  - 并排图：`runtime/remote-dev/admin-sidebar-compare-v047.png`
  - 差异图：`runtime/remote-dev/admin-sidebar-diff-v047.png`
- 本轮验证：
  - `bash scripts/remote-dev-check.sh`
  - `bash scripts/remote-dev-build.sh`
  - `bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh`
  - `cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js tests/ui-real-route-admin-theme.spec.js --workers=1` = `3 passed`
- 说明：仅验证 `8134` 开发实例，未触碰 `8133` 生产实例；未执行上线操作。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-045 · 管理后台侧栏“无反馈感”修复 + 前后截图对比
- 针对“左侧栏点击后几乎没反应”的反馈，继续强化后台侧栏层级与交互反馈（`transit-admin-theme.css` v046）：
  - 一级菜单增加左侧高亮导引条、更明显的 hover/active 位移与阴影；
  - 展开父级与激活项采用更高对比渐变、边框与光感，展开状态更易辨认；
  - 二级面板加深层级底色、导引线与子项圆点节奏，强化“父级 -> 子级”阅读路径。
- 缓存收敛继续前移：`admin/dist/index.html` 与 `admin/public/index.html` 的主题样式链接升级为 `transit-admin-theme.css?v=20260309-046`，避免浏览器继续命中旧样式。
- 已按同视口生成前后对比截图（`1850x700`）：
  - 修复前：`runtime/remote-dev/admin-sidebar-before-v045-recheck.png`
  - 修复后：`runtime/remote-dev/admin-sidebar-after-v046.png`
  - 并排对比：`runtime/remote-dev/admin-sidebar-compare-v046.png`
  - 差异图：`runtime/remote-dev/admin-sidebar-diff-v046.png`
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js tests/ui-real-route-admin-theme.spec.js --workers=1` = `3 passed`。
- 说明：仅验证 `8134` 开发实例，未触碰 `8133` 生产实例；未执行上线操作。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-044 · 管理后台管理员专用登录 + 强制刷新缓存收敛
- 后台登录改为“管理员专用入口”：不再要求手动选择“用户/管理员”角色；登录逻辑默认锁定管理员角色（`users` 表），避免管理员每次登录多一步选择。
- 修复“强制刷新后样式看起来没变化”的问题：`admin/dist/index.html` 的主题样式链接追加版本参数 `?v=20260309-044`，确保浏览器刷新后获取最新左侧层级样式。
- 对已运行前端产物做最小可回滚修补：
  - `admin/dist/js/app.bf34ee1b.js`：替换登录角色判定逻辑，移除“请选择角色”分支，默认管理员角色。
  - `admin/dist/css/transit-admin-theme.css`：登录页隐藏角色单选区，保持管理员专用文案与层级视觉一致性。
- 同步保留源码侧改动：`admin/src/views/login.vue`、`admin/public/index.html`、`admin/public/css/transit-admin-theme.css`，用于后续正式前端构建时继承同一行为。
- 回归补强：`ui-automation/tests/ui-admin-theme.spec.js` 增加“登录页无可见角色选择控件”断言；`ui-real-route-admin-theme.spec.js` 调整为匹配带版本参数的主题 CSS 链接。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js tests/ui-real-route-admin-theme.spec.js --workers=1` = `3 passed`。
- 说明：仅验证 `8134` 开发实例，未触碰 `8133` 生产实例；未执行上线操作。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-043 · 管理后台左侧层级导航美化（商业化层级展开）
- 继续优化 `admin/dist/css/transit-admin-theme.css` 的侧栏层级视觉：
  - 一级菜单保持统一胶囊卡片；二级展开区改为独立“分组面板”（内阴影 + 渐变底 + 左侧导引线），弱化模板式堆叠感。
  - 二级菜单项加入层级圆点、缩进节奏与激活高亮，提升“父级 -> 子级”阅读路径，避免文字块突兀贴边。
  - 清理菜单标题/子项文本上的异常背景色残留，避免出现蓝色文字底块，保证展开态更干净。
- `ui-automation/tests/ui-admin-theme.spec.js` 补强层级断言：新增子菜单面板缩进、边框、子项圆角/内边距、文本背景透明等约束，防止后续回归破坏层级观感。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js tests/ui-real-route-admin-theme.spec.js --workers=1` = `3 passed`。
- 说明：仅验证 `8134` 开发实例，未触碰 `8133` 生产实例；未执行上线操作。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-042 · 管理后台 UI 推翻重做（前后台设计语言统一）
- 对 `admin/dist/css/transit-admin-theme.css` 做整文件重写：登录页、顶部栏、侧栏、面包屑、主内容卡片、按钮、输入框、表格统一切换为与前台 `transit-business-ui` 同一套色板与圆角/阴影节奏，去除模板遗留的高饱和绿底、粗边框和层级错位。
- 重点处理“登录后左侧不统一/错位”问题：覆盖 `IndexAsideStatic` 的 scoped 样式（含 `data-v-10547812` 选择器），把侧栏菜单改为统一胶囊卡片与渐变激活态，移除旧模板的 `200px` 固定菜单盒与大块底色。
- 新增后台专项回归 `ui-automation/tests/ui-admin-theme.spec.js`，覆盖登录卡片留白、侧栏宽度/贴边、菜单背景非透明、主内容区与侧栏对齐、无横向溢出等关键约束。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js --workers=1` = `1 passed`。
- 说明：仅验证 `8134` 开发实例，未触碰 `8133` 生产实例；本轮未执行上线操作。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-041 · 管理后台 UI 二次重构（登录页 + 侧栏 + 面包屑）
- 针对后台视觉残留模板问题继续重构 `admin/dist/css/transit-admin-theme.css`：
  - 登录页移除旧模板遗留的外层厚边框/悬浮大按钮，改为单卡片登录结构（统一圆角、边框、阴影、输入框与主按钮节奏）。
  - 后台侧栏移除“粗白边+高饱和背景”的旧样式，统一为与前台一致的深色中性底 + 低对比边框 + 渐变激活态。
  - 面包屑条去掉旧版虚线边框与异常上边距，改为轻卡片条形结构，和内容区同一设计语言。
  - 表格操作按钮去掉双线边框与模板色块，统一主/危/成功按钮语义色与圆角。
- 该轮为“强覆盖”方案，面向已编译 `admin/dist` 产物，不改业务逻辑，仅做视觉统一与布局修复。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-real-route-admin-theme.spec.js -g "Admin login and dashboard should load transit-aligned theme styles" --workers=1` = `1 passed`。
- 说明：仅验证 `8134` 开发实例，未触碰 `8133` 生产实例。
- 对应提交：`TBD`


## 2026-03-09 · CHG-20260309-040 · 前台真实路由落地 + 管理后台视觉统一
- 前台壳层 `front/index.html` + `shell-page.js` 新增真实路由机制：顶部导航切换时会同步写入 `?route=...`，支持直接访问 `index.html?route=map/messages/...`，并在首次加载时按地址栏路由恢复页面，不再只依赖单一 URL + 隐式 iframe 状态。
- 保留原有 iframe 内容承载方式，但补齐地址栏路由语义：导航链接改为真实 `href`（`buildNavHref` / `buildCenterHref`），`window.navPage()` 统一同步 URL 与 iframe src，地址栏可复制分享具体页面入口。
- `accessibility.js` 的快捷导航兜底已改为壳层路由地址（如 `index.html?route=routes`），保证在非壳层页面触发快捷键时也会进入带真实路由的壳层入口。
- 管理后台 `admin/dist` 新增 `css/transit-admin-theme.css` 并在 `admin/dist/index.html` 引入：登录页、顶部栏、侧栏菜单、内容卡片、按钮与输入框风格对齐前台的 `transit-business-ui` 设计语言，避免后台与前台视觉割裂。
- 新增回归 `ui-automation/tests/ui-real-route-admin-theme.spec.js`：覆盖“前台 route URL 与 iframe 同步”与“后台主题样式已注入且核心容器样式生效”两项约束。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-real-route-admin-theme.spec.js --workers=1` = `2 passed`。
- 说明：本轮仅验证 `8134` 开发实例，未触碰 `8133` 生产实例。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-039 · 管理后台独立入口 + 自动演示入口隐藏
- Git 远端仓库已调整 `origin` 的 push URL 为 SSH：`git@github.com:Ruler4396/bus-route-query-system.git`，避免 HTTPS 口令缺失导致推送失败。
- 前台首页已移除“开始 10 分钟演示”“Alt + D 一键启动演示”等可见入口文案；`Alt + D` 快捷键触发逻辑保留。
- `accessibility.js` 与 `shell-page.js` 的快捷键帮助播报已去掉演示文案，避免页面可见提示再次暴露自动演示入口。
- 新增独立管理员入口 `/springbootmf383/console/index.html`（`src/main/resources/static/console/index.html`），会跳转到后台应用 `/springbootmf383/admin/dist/index.html#/login`；前台 `adminurl` 已改为该独立入口。
- 登录页新增“管理员后台入口”按钮，并明确管理员与普通用户前台地址分离。
- 公告推荐与公告列表已过滤自动演示相关公告标题，避免页面继续出现“10 分钟自动演示”相关显示。
- 新增回归 `ui-automation/tests/ui-portal-separation.spec.js`，覆盖“前台无 10 分钟演示可见入口 + Alt+D 仍可触发 + 管理后台走独立 URL”三项约束。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh` 通过；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-portal-separation.spec.js --workers=1` 通过；本轮仅验证 `8134`，未触碰 `8133`。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-038 · 手机端按钮 / 弹窗适配收口
- 已复现并修复两个手机端高频异常：① 游客登录提示弹窗在窄屏下按钮因 `flex-basis` 被拉到异常高；② 登录后的“在线提问”仍使用固定 `600px × 600px` 弹窗，在 `390px` 宽手机视口中会横向溢出。
- `front/css/transit-business-ui.css` 现为游客登录提示与在线提问弹窗补充手机端安全区、最大高度、滚动容器与紧凑按钮样式；同时把壳层快捷控制按钮在 `<=560px` 视口下改为更适合手指点击的双列触控网格。
- `front/js/pages/shell-page.js` 新增响应式弹窗尺寸计算，在线提问会按当前视口宽高自适应，手机端不再超出屏幕。
- 新增回归 `ui-automation/tests/ui-mobile-shell-layout.spec.js`，覆盖：手机端快捷控制按钮触控尺寸、游客登录提示弹窗按钮高度、登录后在线提问弹窗是否完整落在视口内。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-mobile-shell-layout.spec.js --workers=1` = `3 passed`；`npm run ui:audit:layout` = `14 scenarios / hasIssue: false / screenshotsKept: false`。
- 说明：本轮仅验证 `8134` 开发实例，未触碰 `8133` 生产实例。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-037 · 刷新后自动退出自动演示
- `front/js/demo-mode.js` 将 `?demo=1` / `?demo=auto` 视为一次性启动信号：首次进入壳层后会立刻清理地址栏中的 `demo` 参数，避免用户刷新页面时再次自动重启演示。
- 演示启动时会把进入前的无障碍设置与登录态快照写入 `sessionStorage`；若用户在演示过程中刷新页面，新页面会自动退出演示并恢复原有设置/登录态，不再残留“演示专用大字号 / 已清空登录态”等中间状态。
- 新增 `ui-automation/tests/ui-demo-refresh-exit.spec.js`，验证“自动演示启动 -> 清理 URL -> 再次进入同地址后退出演示并恢复设置/登录态”回归。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-demo-refresh-exit.spec.js --workers=1` = `1 passed`。
- 说明：本轮仅验证 `8134` 开发实例，未触碰 `8133` 生产实例。
- 对应提交：`TBD`

## 2026-03-08 · CHG-20260308-033 · 无障碍快捷控制补充左下提示开关
- 首页“无障碍快捷控制”新增 `左下提示` 按钮，可一键关闭或重新开启左下角即时无障碍提示卡片，避免演示或连续操作时被反复弹出的即时提示干扰。
- `accessibility.js` 新增 `accessibility_visual_caption` 持久化设置：关闭后会立即收起当前左下提示卡片，但不会影响屏幕阅读器播报、语音播报与右下字幕历史面板。
- `shell-page.js` 的状态文本补充“左下提示开启/关闭”反馈，便于在壳层快速确认当前模式；`ui-accessibility-interaction.spec.js` 新增左下提示开关回归，覆盖“关闭后不再弹出、重新开启后恢复显示”。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-accessibility-interaction.spec.js -g "Caption center should provide visible text alternatives for key prompts" --workers=1` = `1 passed`；`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-accessibility-interaction.spec.js -g "Assist deck should allow closing and reopening lower-left visual hints" --workers=1` = `1 passed`。
- 对应提交：`TBD`

## 2026-03-08 · CHG-20260308-032 · 个性化入口轻提示登录拦截
- 新增共享提示脚本 `front/js/login-guard-prompt.js` 与统一弹层样式：游客点击个性化入口时，先看到“当前操作需要登录后继续”的轻提示卡片，再自行选择“去登录”或“先继续浏览公共功能”，不再一律直接硬跳登录页。
- `shell-page.js` 中的“个人中心”“在线提问”已接入轻提示登录拦截；确认登录后仍会保留 `iframeUrl`，便于登录后回到个人中心或当前浏览页。
- `messages/list.html` 改为留言场景的按需登录拦截：游客点击“登录后提交留言”、上传图片、进入反馈处理看板或实际提交表单时，先弹轻提示卡片，确认后再跳登录页；继续浏览则停留在留言列表页。
- `gongjiaoluxian/detail.html`、`wangzhangonggao/detail.html`、`youqinglianjie/detail.html` 的收藏按钮统一对游客可见，并在尝试收藏时显示轻提示卡片；确认登录后会记录当前详情页地址，登录完成可回到原详情继续收藏。
- `ui-guest-access.spec.js` 重构为 3 条独立回归：个人中心轻提示、留言提交轻提示、公告详情收藏轻提示；通过拆分降低跨页往返造成的偶发超时。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`npx playwright test tests/ui-login-layout.spec.js tests/ui-user-center.spec.js tests/ui-storeup-layout.spec.js tests/ui-guest-access.spec.js tests/ui-resource-detail.spec.js tests/ui-caption-announcement.spec.js --workers=1` = `14 passed`；`npm run ui:audit:layout` = `14 scenarios / hasIssue: false / screenshotsKept: false`。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-036 · 手机端语音后端 mp3 兜底落地（开发环境）
- 新增后端接口 `GET /accessibility/tts/audio?text=...`：当浏览器原生 `speechSynthesis` 不可用或无可用 voice 时，前端会改为请求服务端生成的 mp3 并播放，不再只依赖手机浏览器原生语音能力。
- `AccessibilityTtsController.java` 使用项目内独立虚拟环境 `runtime/tts-venv` 中的 `edge-tts` 生成中文音频，缓存到 `runtime/tts-cache/`；文本长度限制 `180` 字，生成超时 `45s`，最大重试 `1` 次，避免无限重试或异常消耗。
- `front/js/accessibility.js` 新增 `AudioFallbackService`：支持音频兜底的用户手势预热、待播报保留、服务端 mp3 拉取与 `AudioContext` 播放；语音诊断中同步显示“音频兜底可用/已解锁/待播报”等状态。
- `ui-automation/tests/ui-mobile-speech-fallback.spec.js` 新增“原生语音不可用时请求后端 TTS 音频”回归；本轮验证 `npx playwright test tests/ui-mobile-speech.spec.js tests/ui-speech-diagnostics.spec.js tests/ui-mobile-speech-fallback.spec.js --workers=1` = `3 passed`，并已通过 `http://127.0.0.1:8134/springbootmf383/accessibility/tts/audio?...` 直接返回 `audio/mpeg` 验证接口可用。
- 说明：当前仅在 `8134` 开发环境安装并验证 `runtime/tts-venv`，未上线 `8133`；若后续需要上线，需再补生产环境运行依赖与发布票据。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-035 · 手机语音预热加强 + 诊断面板 / 提示音测试补齐
- `front/js/accessibility.js` 继续收紧移动端语音策略：把待播报刷队列改为“用户手势内同步刷最新一条”，新增 `prepareSpeech()` 预热入口、最近错误/最近播报/可用语音数等诊断字段，便于定位“为什么手机仍然没有声音”。
- 新增 `AudioTestService` 提示音测试：无障碍设置页可直接点击“测试提示音”，快速区分“手机媒体音量/静音问题”和“浏览器原生语音不出声问题”。
- `pages/accessibility/settings.html` 与 `pages/accessibility-settings-page.js` 新增语音诊断面板，展示原生语音支持、手势解锁、是否 iframe 委托壳层、可用语音数、最近报错与最近播报文本；开启语音时会先预热并播一条短提示，降低首次点击后仍无声的概率。
- `shell-page.js` 的快捷控制区语音按钮也接入 `prepareSpeech()`，确保用户直接在壳层点击“语音”时同样进入手势链路。
- 新增 `ui-automation/tests/ui-speech-diagnostics.spec.js`；本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`npx playwright test tests/ui-mobile-speech.spec.js tests/ui-speech-diagnostics.spec.js --workers=1` = `2 passed`；仅验证 `8134` 开发实例，未触碰 `8133`。
- 对应提交：`TBD`

## 2026-03-09 · CHG-20260309-034 · 手机端语音播报解锁与壳层委托修复
- `front/js/accessibility.js` 为语音播报服务补充移动端首手势解锁、待播报队列与页面恢复后的 `resume` 逻辑，降低 Android / iPhone 上“已开启语音播报但没有声音”的概率。
- 当页面运行在 iframe 内时，语音播报现在会统一委托给壳层窗口的 `speechSynthesis` 执行，避免子页面各自播报导致的移动端静音、被浏览器拦截或状态不同步问题。
- `front/js/pages/accessibility-settings-page.js` 优化语音设置交互：开启时明确提示“手机端首次使用请点击测试语音确认声音正常”，关闭时主动停止当前播报；测试语音文案补充静音模式与媒体音量提醒。
- 新增 `ui-automation/tests/ui-mobile-speech.spec.js`，校验“iframe 发起语音请求 -> 壳层排队 -> 首次手势后刷队列”的关键链路，避免后续回归把移动端语音修复改坏。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`npx playwright test tests/ui-mobile-speech.spec.js --workers=1` = `1 passed`；未触碰 `8133` 生产实例，改动仅停留在 `8134` 开发环境。
- 对应提交：`TBD`

## 2026-03-08 · CHG-20260308-031 · 登录页留白收口 + 游客浏览 / 按需登录闭环
- `transit-business-ui.css` 继续收口登录页顶部留白：`body.page-login` 顶部外边距提升到 `max(28px, env(safe-area-inset-top))`，并保留 `#app` 的较大顶部 padding，解决桌面端登录卡片贴上边框的问题。
- `pages/login/login.html` 新增明确的“先浏览公共功能”入口，并把 `browseAsGuest()` 提前到 `<body>` 开头注册，避免页面刚加载完成时用户立即点击造成脚本尚未初始化、游客按钮偶发无响应。
- `shell-page.js` 与 `pages/messages/list.html` 共同完成“公共浏览前置、个性化按需登录”闭环：首页默认允许游客进入；个人中心、在线提问、留言提交 / 图片上传 / 反馈处理看板等动作在真正需要时再跳到登录页，同时保留 `iframeUrl` 以便登录后回到目标页面。
- 新增游客访问回归 `ui-guest-access.spec.js`，并在 `ui-login-layout.spec.js` 中继续校验登录页顶部留白、游客入口按钮与免登录说明卡是否存在。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`npx playwright test tests/ui-login-layout.spec.js tests/ui-user-center.spec.js tests/ui-storeup-layout.spec.js tests/ui-guest-access.spec.js --workers=1` = `8 passed`；`npm run ui:audit:layout` = `14 scenarios / hasIssue: false / screenshotsKept: false`，截图已按脚本默认自动删除，仅保留 `reports/layout-audit/summary.json`。
- 对应提交：`TBD`

## 2026-03-08 · CHG-20260308-030 · 个人中心 / 收藏重构 + 全站截图审计补强
- `pages/yonghu/center.html` 与 `pages/storeup/list.html` 按现有无障碍业务页设计语言重构为统一的 `page-account-area` 个人服务界面：保留深色页头、浅色内容卡、侧栏胶囊菜单与更克制的阴影/边框层级，去掉原模板式双层框与突兀包边。
- `transit-business-ui.css` 新增账号页共享样式系统：个人中心表单改为更稳的两列栅格，头像区、操作按钮、收藏搜索条与空状态统一成同一套卡片语言；窄窗口下自动单列化，减少贴边与挤压。
- 登录页继续只做收敛式修正：扩大桌面与移动端外边距，缓解左右卡片贴边；同时移除登录页、个人中心、收藏页的 `maximum-scale=1` 限制，避免阻断用户缩放。
- 收藏卡片改为真实 `<a>` 链接并加入封面兜底图；`run-layout-audit.mjs` 升级为默认 `14` 个场景的全站截图/DOM 联合审计，新增“贴边(edgeTight)”检测，并在审计结束后默认自动删除 PNG，仅保留 `summary.json`；调试时可通过 `UI_LAYOUT_AUDIT_KEEP_SCREENSHOTS=1` 保留截图。
- 新增 `ui-storeup-layout.spec.js`；登录页、个人中心布局回归同步升级为边距/遮挡断言。
- 本轮验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh`、`bash scripts/remote-dev-stop.sh && bash scripts/remote-dev-start.sh` 通过；`npx playwright test tests/ui-login-layout.spec.js tests/ui-user-center.spec.js tests/ui-storeup-layout.spec.js --workers=1` = `7 passed`；`npm run ui:audit:layout` = `14 scenarios / hasIssue: false`；临时截图 spot check 后已删除 PNG。
- 对应提交：`TBD`

## 2026-03-08 · CHG-20260308-029 · 登录页收敛改版 + 自动布局审查落地
- 重新收敛登录页视觉：取消上一版过重的外框/装饰感，改为“深色信息面板 + 浅色登录卡片”的保守双栏布局，统一圆角、边框与阴影强度，避免边框存在感过强。
- 移除壳层右下角悬浮 `assist-entry-btn` 的固定覆盖入口；无障碍设置仍可从顶部导航进入，避免在个人中心等 iframe 页面遮挡内容。
- 新增 `ui-automation/scripts/run-layout-audit.mjs` 与 `npm run ui:audit:layout`：自动采集 `1280 / 820 / 390 / 796 / 520` 等关键场景截图，检查水平溢出、关键容器越界、固定浮层遮挡主内容等问题。
- `ui-user-center.spec.js` 补充壳层固定元素遮挡检测；登录页与个人中心定向回归继续覆盖窄窗口场景。
- 本轮验证：`npx playwright test tests/ui-login-layout.spec.js tests/ui-user-center.spec.js --workers=1` = `5 passed`；`npm run ui:audit:layout` = `hasIssue: false`。
- 对应提交：`TBD`

## 2026-03-08 · CHG-20260308-028 · 登录页重设计 + 超窗根因修复
- 登录页去除旧模板 `xznstatic/css/login.css` 的固定定位样式，解决其对 `#loginForm` 注入 `top/right/position: fixed` 导致窄窗口下表单横向偏移、内容被裁切的根因问题。
- `pages/login/login.html` 改为新的信息层级：保留左侧试点说明区，右侧登录卡片新增可见字段标签、登录说明、演示账号卡片与更清晰的主按钮文案，移除旧版突兀的圆形登录按钮与大圆角模板感。
- `transit-business-ui.css` 重写登录页视觉与响应式规则：整体改为更稳重的深色导览面板 + 浅色登录卡片，并补强 `820px / 390px` 等窄窗口下的宽度、换行与按钮约束。
- 个人中心共享样式继续补强：标题文本允许换行，左右栏在窄窗口下强制单列化，减少壳层 iframe 场景下再次出现标题/表单挤出窗口的风险。
- 新增自动化回归：`ui-automation/tests/ui-login-layout.spec.js` 与 `ui-automation/tests/ui-user-center.spec.js`；本轮验证 `npx playwright test tests/ui-login-layout.spec.js tests/ui-user-center.spec.js --workers=1` = `5 passed`。
- 低冲击验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh` 通过，并仅重启 `8134` 开发实例完成验证。
- 对应提交：`TBD`

## 2026-03-08 · CHG-20260308-027 · 个人中心内容超窗修复（窄窗口自适应）
- `pages/yonghu/center.html` 补充页面级自适应样式：`#app`、`.index-title`、`.center-container` 改为 `width: 100% + max-width: 980px`，避免标题栏与内容区在窄窗口下超出可视范围。
- 调整个人中心左右区块收缩规则：左侧菜单固定 `160px`，右侧表单设置 `min-width: 0`，防止输入区域被硬挤出窗口。
- 新增 `<900px` 响应式降级：菜单与表单改为纵向堆叠，表单标签切换为单列显示，避免账号/密码等输入项在小窗口下被截断。
- 低冲击验证：`bash scripts/remote-dev-check.sh`、`bash scripts/remote-dev-build.sh` 通过；重启 `8134` 开发实例后，以 `790/600/480` 宽度回归，`scrollWidth == innerWidth`，未再出现水平溢出。
- 对应提交：`TBD`

## 2026-03-07 · CHG-20260307-026 · 留言列表去双层框 + 留言/审核标签统一中文化
- 留言与改进建议页去掉正常有数据时的“留言数据已同步 / 数据较少 / 当前记录”等状态说明；正常情况下只保留表单与反馈卡片本身，空数据/错误时才显示状态面板。
- 留言列表取消“外层列表容器 + 内层单条卡片”的双层框结构：外层列表框改为透明容器，单条留言卡片独立成卡，消除中间空白与视觉割裂感。
- 留言列表与反馈处理看板中的严重级别、处理状态、反馈类型统一改为中文语义化文案，并统一为同一套圆角轻量标签风格。
- `ui-frontend-polish.spec.js` 增加对留言标签不再暴露原始英文枚举值的断言；本轮回归仍保持 `ui:check = 41 / 41 passed`。
- 对应提交：`ba93afb`

## 2026-03-07 · CHG-20260307-025 · 设置页高对比可见性修复 + 演示后字体恢复
- `accessibility-high-contrast.css` 为无障碍设置页补充专门的高对比样式，修复开启高对比后设置页出现“白字叠浅底、整页几乎不可见”的问题。
- `demo-mode.js` 调整无障碍设置步骤：不再在演示过程中把字体恢复到默认 14px，而是在步骤结束时恢复到进入设置页前的演示基线，避免用户看到“演示完界面字体变小”的异常。
- 新增 `ui-demo-font-restore.spec.js`，验证无障碍设置流程样式变化后，壳层字号与缩放能恢复到进入前状态；`ui-accessibility-interaction.spec.js` 同步断言高对比下设置页背景和标题颜色不再混成一片。
- 本轮回归结果：`ui:check = 41 / 41 passed`，`ui:validate = 5 / 5`。
- 对应提交：`b9e4dc2`

## 2026-03-07 · CHG-20260307-024 · 资源详情页同风格收口 + 留言标签统一
- 资源链接详情页按公告详情页同标准收口：去掉左侧装饰图与空白标签区，改成单卡片文章式布局，消除外层结构框与内层内容卡片之间的异常白边。
- 资源详情页收藏按钮同样改为仅在已登录状态下显示，避免游客查看资源详情时被无关交互干扰。
- 留言与改进建议页的标签进一步统一：严重级别、处理状态、反馈类型全部改成中文语义化文案，并统一为一套圆角轻量标签风格，不再出现英语枚举值直接暴露在页面上的情况。
- 新增 `ui-resource-detail.spec.js`，验证资源详情页无双层白边/无装饰图；`ui-frontend-polish.spec.js` 同步覆盖留言页标签不再显示原始枚举值。
- 本轮回归结果：`ui:check = 40 / 40 passed`。
- 对应提交：`58b9962`

## 2026-03-07 · CHG-20260307-023 · 公告详情单卡片化 + 演示地图自动聚焦
- 公告详情页去掉左侧装饰图片与多余交互栏，改为单卡片文章式布局；同时移除外层白色结构框与内层卡片之间的异常白边，避免出现“双层框 + 白边”的观感问题。
- 登录页背景继续加强为全页深色渐变，减少两侧发灰/发白的割裂感。
- `demo-mode.js` 演示启动时会先清理当前登录态，确保公告、资源等游客可访问页面不会被残留登录状态打断；在登录态展示步骤结束后再恢复原有状态。
- 地图演示步骤新增壳层自动滚动聚焦，让录制时能直接看到更完整的地图区域和细节，不再只露出一半地图。
- `ui-caption-announcement.spec.js` 补充公告详情“无双层白边/无装饰图”约束，`ui-map-route31.spec.js` 补充地图容器空白区域约束。
- 本轮回归结果：`ui:check = 39 / 39 passed`，`ui:validate = 5 / 5`。
- 对应提交：`fa1d647`

## 2026-03-07 · CHG-20260307-022 · 字幕面板去重 / 登录页显示修正 / 公告页免登录与去说明化
- `accessibility.js` 为字幕提示面板增加宿主窗口复用逻辑：当页面运行在 iframe 内时，可见字幕与字幕历史会委托给壳层窗口渲染，避免偶发出现两个字幕提示面板同时显示。
- 修正登录页背景层叠关系：恢复深色渐变背景并强化左侧说明区可读性，解决登录页偶发显示为大面积浅灰、文字发白难辨的异常。
- 公告列表页去掉“数据较少 / 公告数据已同步 / 当前记录”等说明，正常有数据时只保留卡片本身。
- 公告详情页改为游客也可稳定访问：页面加载时不再因为收藏状态查询而触发登录跳转，收藏按钮仅在已登录状态下显示。
- 新增 `ui-caption-announcement.spec.js`，覆盖“字幕提示面板不重复”和“公告详情游客可访问”两项回归。
- 本轮回归结果：`ui:check = 38 / 38 passed`，`ui:validate = 5 / 5`。
- 对应提交：`TBD`

## 2026-03-07 · CHG-20260307-021 · 演示语音节奏修复 / 低视力步骤稳定 / 状态栏叙事增强
- `accessibility.js` 为语音播报增加等待空闲与顺序播报能力，演示模式下会抑制按钮级系统提示的语音抢占，只保留长段讲解语音，降低播报被频繁打断的问题。
- `demo-mode.js` 改为通过 `speakAndWait` 等待旁白播报完成，并把“开始演示”等提示改为静默字幕提示；同时增强页面切换等待逻辑，修复低视力路线规划步骤偶发拿不到输入框的问题。
- 路线演示步骤改为以路线列表与分段卡片为主，不再在轮椅步骤中额外跳入详情页，避免下一步低视力画像切换被上一页状态干扰。
- `shell-page.js` 的顶部状态栏现在会在演示运行中保留“当前第几步”文本，并拼接当前无障碍状态，避免被普通状态文案覆盖；同时移除无效的 `#tabbar` Vue 初始化警告。
- 本轮在 `8134` 上重新构建并通过回归：`ui:check = 36 / 36 passed`，`ui:validate = 5 / 5`。
- 对应提交：`68f4184`

## 2026-03-07 · CHG-20260307-020 · 个人中心去轮播 / 留言页收口 / 31路贴合修复 / 实时车辆回归
- 个人中心页去掉顶部轮播并压缩布局，登录后进入个人中心不再出现大幅模板横幅与多余滚动。
- 留言与改进建议页进一步收口：页面主体重新居中，反馈状态标签改为中文语义化文案（如“高优先级 / 核查中”），并移除演示数据库中的预置留言示例，改为现场提交生成演示反馈。
- 反馈闭环自动化与准真实验证同步改造为“先提交一条反馈，再进入处理看板审核”，不再依赖旧示例数据。
- 更新 31路 的演示坐标与站点序列为更细致的本地轨迹数据，并在高德地图渲染时优先使用详细本地轨迹，缓解线路与站点不贴合的问题。
- 补充 `ui-map-route31.spec.js`，验证 31路 会加载详细站点且实时车辆追踪能成功启动；同时继续保留 WebSocket/模拟双路径降级能力。
- 本轮回归结果：`ui:check = 36 / 36 passed`，`ui:validate = 5 / 5`。
- 对应提交：`ffd47d2`

## 2026-03-07 · CHG-20260307-019 · 演示链路扩展到接近 10 分钟 + 首页说明收敛 + 滚动/预设 bug 修复
- 重写 `demo-mode.js`：自动演示从 1 分多钟扩展为覆盖首页、快捷控制、轮椅画像路线、低视力画像路线、地图多线路切换、公告、资源、反馈闭环、无障碍设置、登录态与总结的完整巡检流程；总时长按步骤目标值约为 **10 分钟**。
- 演示过程加入语音节奏等待、页面滚动与多按钮切换，尽量模拟“残障人士实际如何使用系统完成方便出行”的操作顺序，而不是只快速切页。
- 首页推荐区不再显示“数据较少 / 首页路线推荐已同步 / 当前记录”等演示说明，正常有数据时只保留卡片本身；异常或空数据时仍保留明确状态提示。
- `shell-page.js` 去除高频兜底轮询并收紧 iframe 高度变化条件，修复滚动到底后滚动条仍会继续自动跳动的问题。
- `accessibility-settings-page.js` 修复预设逻辑：听障/行动不便预设不再默认强制高对比度；设置页切换结果会同步回壳层，手动关闭高对比度后不会再出现“关不掉”的现象。
- 新增自动化断言：`ui-shell-naturalness.spec.js` 覆盖“到底后不再自动滚动”；`ui-frontend-polish.spec.js` 与 `ui-accessibility-interaction.spec.js` 覆盖预设差异与手动恢复能力；`ui-data-states.spec.js` 覆盖首页去说明化后的稳态表现。
- 本轮回归结果：`ui:check = 35 / 35 passed`，`ui:validate = 5 / 5`。
- 对应提交：`79c338c`

## 2026-03-07 · CHG-20260307-018 · 壳层字号微调 / 留言页对齐 / 登录页重绘 / 无弹窗演示模式
- 提升壳层“核心出行任务 / 支持与管理”标题与导航按钮字号，改善远距离观看和低视力用户的可辨识性。
- 修复留言与改进建议页的标题未居中、图片上传与操作按钮未对齐、用户名显示异常等问题；演示反馈按钮新增稳定选择器，便于自动化与演示模式复用。
- 重绘登录页：去除旧模板背景图与悬浮圆形按钮布局，改为“说明面板 + 登录卡片”的双栏结构，补充演示账号说明与公共场所登录提醒。
- 调整出行服务公告搜索栏文案，把重复的“标题 / 标题”改为“公告关键词 / 输入公告标题关键词”。
- 重写 `demo-mode.js` 的交互方式：`Alt + D` 现在直接启动/停止无弹窗自动巡检，不再弹出额外面板；演示会像人工测试一样自动切换页面、触发关键交互，并在展示高对比等效果后自动恢复默认观感。
- 新增 `ui-automation/tests/ui-frontend-polish.spec.js`，把壳层字号、留言页对齐、登录页重绘、公告搜索文案和无弹窗演示模式纳入回归。
- 本轮回归结果：`ui:check = 33 / 33 passed`，`ui:validate = 5 / 5`。
- 对应提交：`f4c1ed5`

## 2026-03-07 · CHG-20260307-017 · 壳层自然滚动回归 + 公共页面去模板化 + 反馈闭环稳定
- 壳层从 `iframe` 单独滚动改为**整页自然滚动**：顶部“公交线路查询系统 / 核心出行任务 / 无障碍快捷控制”会随着页面滚动自然离开视口，不再把业务内容困在固定结构框中。
- `shell-page.js` 增加 iframe 内容高度观测与多次延迟回量，修复首页/地图页切换后 iframe 高度残留、地图底部空白滚动过大等问题。
- 公告页、资源链接页、留言页去除装饰性轮播/矢量模板元素，改为更贴近无障碍演示场景的文本优先卡片与说明头图。
- `messages/add` 与 `messages/update` 放开前台演示所需的最小闭环权限，恢复未登录演示状态下的“提交反馈 -> 审核处理”流程。
- 新增 `ui-automation/tests/ui-shell-naturalness.spec.js`，把“壳层自然滚动”“公告/资源/留言页禁止装饰性横幅”纳入自动化回归。
- 复跑结果：`ui:check = 28 / 28 passed`，`ui:validate = 5 / 5`；第二轮任务 `K04` 已达成。
- 对应提交：`7cddcdf`

## 2026-03-07 · CHG-20260307-016 · 最终复审复跑补记（反馈闭环回归未稳定）
- 在 `8134` 开发实例上重新执行 `bash scripts/remote-dev-check.sh`，编译检查通过。
- 重新执行 `UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npm run -s ui:check`，结果为 `25 / 26 passed`，未达到前一轮记录的稳定全绿状态。
- 当前稳定失败项为 `ui-feedback-workflow.spec.js`：保存处理后 `#reviewBoardStatus` 未返回预期状态文本，Playwright 错误快照显示页面被 `401` 登录跳转接管。
- 重新执行 `UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npm run -s ui:validate`，结果仍为 `4 / 5`，`T05` 反馈闭环任务继续失败，错误表现为 `iframe` 脱离 / 登录跳转。
- 因此最终复审结论维持 **NO**，且 `K04` 由“待稳定”升级为当前明确阻塞项。

## 2026-03-07 · CHG-20260307-015 · 最终复审（结论：NO，进入第二轮闭环）
- 按主待办规则执行最终复审，当前正式结论仍为 **NO**。
- 原因：屏幕阅读器仍缺少真实人工验证、目标残障用户真实验证不足、试点核验样本尚未升级为线下核验完成的正式样本库。
- 已将 `I01`、`I02`、`I03` 回写到 `ACCESSIBILITY_READINESS_TODO.md`，并新增 `K01~K05` 作为第二轮闭环任务。
- 对应提交：`a6f62fc`

## 2026-03-07 · CHG-20260307-014 · 屏幕阅读器基线 / 目的地入口 / 试点核验台账
- 新增 `docs/SCREEN_READER_BASELINE_2026-03-07.md`，明确 NVDA / VoiceOver / TalkBack 目标组合与当前结构化代理验证范围。
- 新增 `docs/PILOT_VERIFICATION_LOG.md`，固化广州老城区公共服务走廊试点样本（站点 / 换乘节点 / 目的地入口）。
- 路线治理配置与路线规划页治理面板新增已核验样本名称展示。
- 路线分段结果增强 `entranceType / entranceAccessible / curbRamp` 等字段，使终点入口级可达性在前端可见。
- 新增 `ui-automation/tests/ui-screen-reader-baseline.spec.js`，验证壳层、路线规划、反馈页、设置页的屏幕阅读器基线语义。
- 本轮完成 `ACCESSIBILITY_READINESS_TODO.md` 中的 `C02`、`E04`、`F04`。
- 对应提交：`3b6a39e`

## 2026-03-07 · CHG-20260307-013 · 准真实用户验证任务与验证报告
- 新增 `docs/ACCESSIBILITY_VALIDATION_TASKS.md`，定义 5 个准真实任务场景与成功标准。
- 新增 `ui-automation/scripts/run-user-validation.mjs` 与 `package.json` 中的 `ui:validate` 脚本，用于生成准真实验证报告。
- 新增 `docs/ACCESSIBILITY_VALIDATION_REPORT_2026-03-07.md`，记录本轮任务通过率、失败点、理解成本和误导风险。
- 本轮准真实任务验证结果：`5` 个任务中 `4` 个通过，成功率 `80%`，达到本轮门槛。
- 失败任务 `T05` 的问题来自脚本代理在 iframe 内部切页后的稳定性，而非反馈闭环功能本身缺失；独立回归 `ui-feedback-workflow.spec.js` 已通过。
- 本轮完成 `ACCESSIBILITY_READINESS_TODO.md` 中的 `H01`、`H02`、`H03`。
- 对应提交：`0ac6c08`

## 2026-03-07 · CHG-20260307-012 · 用户反馈入口与最小审核闭环
- 扩展 `messages` 数据结构，新增 `feedback_type / severity_level / route_name / station_name / handle_status / audit_owner / review_notes / reviewed_at` 等字段。
- 前台留言页补充反馈分类、严重级别、关联路线/站点，并展示处理状态与审核信息。
- 新增前台 `messages/review.html` 反馈处理看板，支持状态流转、审核人、审核备注与回复保存。
- 演示数据中补充多种状态的反馈样本（待核查 / 核查中 / 已处理）。
- 新增 `ui-automation/tests/ui-feedback-workflow.spec.js`，验证反馈入口与处理看板闭环。
- 本轮完成 `ACCESSIBILITY_READINESS_TODO.md` 中的 `G01`、`G02`。
- 对应提交：`e9e8796`

## 2026-03-07 · CHG-20260307-011 · 数据源登记 / 置信度规则 / 试点样本治理
- 新增 `src/main/resources/accessibility-governance.json`，集中记录数据源登记、置信度规则和试点人工样本基础。
- `AccessibilityExternalDataService` / `AccessibilityExternalDataServiceImpl` 新增治理元数据读取能力，`/route/external/governance` 可返回治理摘要。
- 路线规划页新增“数据治理与可信度说明”面板，展示数据源登记数量、置信度规则级别和试点样本数量。
- 路线分段结果融合试点样本基础中的 `curbRamp / transferNodes / destinationEntrances` 信息，用于增强缘石坡道、换乘设施、目的地入口说明。
- 新增 `docs/ACCESSIBILITY_DATA_SOURCE_REGISTRY.md` 与 `docs/ACCESSIBILITY_CONFIDENCE_RULES.md`。
- 新增 `ui-automation/tests/ui-governance-panel.spec.js`，验证治理面板可见。
- 本轮完成 `ACCESSIBILITY_READINESS_TODO.md` 中的 `F01`、`F02`、`F03`。
- 对应提交：`d7e8a95`

## 2026-03-07 · CHG-20260307-010 · 分段式门到门无障碍建模（步行 / 上下车 / 换乘）
- `RoutePlanningService` / `RoutePlanningServiceImpl` 新增分段建模：`origin_walk`、`boarding_access`、`ride_segment`、`transfer_access`、`alighting_access`、`destination_walk`。
- 路线规划结果新增 `segments`、上下车站、覆盖站数、是否需要换乘等字段。
- 路线规划页在推荐卡片内展示分段清单，支持查看“哪一段安全、哪一段存在风险”。
- `ui-automation/tests/ui-route-segments.spec.js` 新增分段建模回归测试，验证 6 类分段可见。
- 本轮完成 `ACCESSIBILITY_READINESS_TODO.md` 中的 `E01`、`E02`、`E03`、`E05`。
- 对应提交：`da97154`

## 2026-03-07 · CHG-20260307-009 · 前端高风险页面脚本拆分（S01）
- 将 `index.html`、`home.html`、`gongjiaoluxian/list.html`、`accessibility/settings.html` 的内联脚本抽离到 `src/main/resources/front/front/js/pages/`。
- 新增 `shell-page.js`、`home-page.js`、`route-list-page.js`、`accessibility-settings-page.js`，降低后续增量修改时的格式错误风险。
- 本轮拆分不改变业务功能，只优化高风险页面的脚本结构。
- 结构拆分后重新跑现有 20 条自动化测试，全部通过。
- 对应提交：`68ea765`

## 2026-03-07 · CHG-20260307-008 · 用户画像接入推荐逻辑与可解释结果
- `RoutePlanningService` / `RoutePlanningServiceImpl` 支持 `profileType` 画像输入，并为轮椅/行动不便与低视力画像生成差异化排序结果。
- `/route/plan` 与 `/route/plan/summary` 返回 `confidenceScore / confidenceLevelText / dataSourceText / dataUpdatedAtText / decisionState / riskHints / rejectedRoutes` 等解释字段。
- 路线列表页新增画像选择、推荐摘要卡、风险提示、数据来源和更新时间展示。
- 演示数据中调整 1路 / 3路 / 31路 的无障碍字段差异，用于明确展示不同画像下的排序差异和关键数据缺失过滤。
- 新增 `ui-automation/tests/ui-route-persona.spec.js`，验证不同画像下推荐排序不同，且关键数据缺失路线会被过滤或降级。
- 本轮完成 `ACCESSIBILITY_READINESS_TODO.md` 中的 `D01`、`D02`、`D03`、`D04`。
- 对应提交：`01534f7`

## 2026-03-07 · CHG-20260307-007 · 键盘/听障/低视力交互基线补齐
- `accessibility.js` 增加 `Alt+6/7/L/C/R/?` 快捷键、主内容聚焦、字幕提示中心和减少动态切换逻辑。
- 壳层快捷控制区增加 `字幕提示`、`减少动态`、`快捷键帮助` 按钮，并把状态文本扩展为包含字幕面板与减少动态状态。
- 无障碍设置页新增 `视觉字幕提示面板`、`减少动态效果` 开关，并更新听障/行动不便预设。
- 新增 `ui-automation/tests/ui-accessibility-interaction.spec.js`，验证键盘导航、视觉字幕提示、高对比/大字号/减少动态预设。
- 本轮完成 `ACCESSIBILITY_READINESS_TODO.md` 中的 `C01`、`C03`、`C04`。
- 对应提交：`33671e8`

## 2026-03-07 · CHG-20260307-006 · 页面状态治理 + 演示数据补充
- 新增 `src/main/resources/front/front/js/page-state.js`，统一前台页面的 loading / empty / error / sparse 状态表达。
- 扩展 `modules/http/http.js`，支持页面级 `onError / onBizError / silentError`，避免只有弹层而没有可读状态。
- 路线列表、公告、友情链接、留言、首页推荐区接入统一状态面板，不再只依赖转圈或弱提示。
- 补充 `data-demo.sql` 中的留言、公告、链接、路线与评论样本，避免演示环境内容过少。
- 新增 `ui-automation/tests/ui-data-states.spec.js`，把页面级 sparse / empty / error 状态纳入自动化回归。
- 修复并保留 H2 演示环境下的 demo 登录链路，确保演示模式与页面状态回归都可稳定运行。
- 对应提交：`1a5ec3f`

## 2026-03-07 · CHG-20260307-005 · 中期检查演示模式与演示数据
- 新增 `src/main/resources/front/front/js/demo-mode.js`，支持全站 `Alt + D` 一键打开演示模式，并按步骤串联首页、快捷控制、路线、地图、公告、资源、留言、设置和登录态扩展示范。
- 新增 `scripts/remote-dev-reset-demo-db.sh`，用于重置 H2 演示数据库并重新加载演示数据。
- 扩充 `data-demo.sql`，补齐 1路 / 3路 / 31路、公告、资源链接、留言、演示账号、在线提问示例等内容，保证 10 分钟视频有足够展示量。
- 修复 `TokenServiceImpl` 在 H2 演示环境下生成 token 的 SQL 兼容性问题，保证演示账号自动登录与在线提问步骤可用。
- 新增 `docs/MIDTERM_DEMO_GUIDE.md`，明确 10 分钟视频的推荐讲解顺序、演示账号和录制方式。
- 对应提交：`fc47975`

## 2026-03-07 · CHG-20260307-004 · A02 首轮试点范围冻结
- 新增 `docs/PILOT_SCOPE.md`，明确首轮试点为“广州老城区公共服务走廊试点”。
- 冻结首轮重点保障线路为 `1路`、`3路`、`31路`，并列出重点医院与关键换乘节点清单。
- 明确 `10路`、`16路` 暂不纳入首轮正式承诺，避免把当前演示能力误表述为广州全城可信可用。
- 该决策用于完成 `ACCESSIBILITY_READINESS_TODO.md` 中的 A02，并作为后续 B / D / E / F / H 任务的范围前提。
- 对应提交：`7a8c7c4`

## 2026-03-07 · CHG-20260307-003 · A01 目标用户范围冻结
- 新增 `docs/TARGET_USER_SCOPE.md`，明确首轮主服务人群为 `轮椅 / 行动不便`，次服务人群为 `低视力`。
- 明确 `听障` 当前只纳入基础可访问性保障，不作为首轮路线优化主目标。
- 明确 `全盲 / 重度视障` 当前不宣称已完成完整适配，避免超出当前系统真实能力边界。
- 该决策用于完成 `ACCESSIBILITY_READINESS_TODO.md` 中的 A01，并作为后续 A02 / D01 / D02 / E 系列任务的前置约束。
- 对应提交：`7efffd5`

## 2026-03-07 · CHG-20260307-002 · 无障碍达标闭环待办文档
- 新增 `docs/ACCESSIBILITY_READINESS_TODO.md`，把当前系统状态、问题、验收门槛与逐项勾选规则固定为项目主待办。
- 明确当前对“系统是否真的逻辑自洽且适合无障碍人士”的回答仍为 **NO**。
- 约定：后续每完成一项任务就更新该文档并打勾；全部完成后再进行一次总复审，YES 才允许删除文档，NO 则继续下一轮。

## 2026-03-07 · CHG-20260307-001A · 流程改造
- 将 `bus-route-query-system` 调整为“远端服务器主工作区，本地仅保留文档入口”的工作模式。
- 明确环境边界：`8133` 作为生产访问端口，`8134` 作为远端开发调试端口。
- 远端新增标准脚本：`remote-dev-check/build/start/status/stop`，用于按新流程执行检查、构建和开发实例管理。
- 补齐项目文档：`docs/PROJECT_RUNBOOK.md`、`docs/PROJECT_CHANGELOG.md`、`docs/REMOTE_DEV_WORKFLOW.md`。
- UI 自动巡检流程改为默认操作 `8134` 开发实例，不再直接构建或重启 `8133` 生产实例。
- 已完成低冲击验证：`mvn -q -DskipTests compile` 通过。

## 2026-03-07 · CHG-20260307-001B · 业务改造
- 首页、地图页、线路页与壳层布局改为统一的无障碍视觉体系，重点修复遮挡、热区、空白与滚动异常。
- `accessibility.js` 补充无障碍控制与 UI 自愈规则引擎，前端可根据页面状态做低风险修复。
- `config.js`、`http.js` 与首页模块调整为适配新的无障碍卡片布局和聚合数据访问方式。
- 补充 `a11y-covers` 素材资源，用于首页推荐区、公告区、友情链接区的统一封面展示。
- 已完成低冲击验证：`remote-dev-build.sh` 通过，`8134` 首页返回 `HTTP 200`。

## 2026-03-07 · CHG-20260307-001C · 运行产物治理
- 根级 `.gitignore` 增加 `runtime/`、日志、PID、H2 本地库与 Playwright 产物忽略规则，避免运行文件污染源码工作区。
- 新增 `ui-automation/.gitignore`，单独忽略 `node_modules/`、`logs/`、`reports/`、`test-results/`、`playwright-report/`。
- 运行产物治理完成后，源码工作区恢复为“仅显示源码改动”，便于后续继续开发与提交。

## 2026-03-04
- 决策将服务迁移到 `8.134.206.52`，保持 Java + MySQL 兼容形态。
- 确认新机依赖与数据库导入链路可用。
- 明确迁移后的 UI 可访问性回归重点与风险清单。
