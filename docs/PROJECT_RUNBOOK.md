# PJT-0001 · bus-route-query-system · PROJECT_RUNBOOK

最后更新：2026-03-09  
变更票据：`CHG-20260309-051`

## 1. 项目定位
面向视障人士与行动不便人士的无障碍公交出行系统。当前以“演示稳定、远端可调试、线上可回滚”为首要目标。

## 2. 环境边界
- 本地文档入口：`/root/dev/bus-route-query-system`
- 远端开发工作区：`root@8.134.206.52:/root/dev/bus-route-query-system`
- 生产实例：`8133`
- 远端开发实例：`8134`
- 运行形态：Java 17 / Spring Boot / MySQL 8（生产） / H2 Demo（远端开发）
- 当前原则：默认不重启 `8133`，开发验证先走 `8134`
- 后台静态资源当前版本：`transit-admin-theme.css?v=20260309-053`、`transit-admin-sidebar-dom.js?v=20260309-053`。

## 3. 标准开发流（远端执行）
1. SSH 登录远端服务器。
2. 进入项目目录：`cd /root/dev/bus-route-query-system`
3. 先做检查：`bash scripts/remote-dev-check.sh`
4. 再做构建：`bash scripts/remote-dev-build.sh`
5. 启动开发实例：`bash scripts/remote-dev-start.sh`
6. 查看状态：`bash scripts/remote-dev-status.sh`
7. 停止开发实例：`bash scripts/remote-dev-stop.sh`

## 4. 关键路径与访问地址
- 开发环境 TTS 兜底依赖：`runtime/tts-venv/`（edge-tts）、缓存目录：`runtime/tts-cache/`。
- 生产公共入口：`http://8.134.206.52:8133/springbootmf383/front/index.html`（游客默认进入首页总览）
- 开发公共入口：`http://8.134.206.52:8134/springbootmf383/front/index.html`（游客默认进入首页总览）
- 前台真实路由示例：`/front/index.html?route=home|routes|map|announcements|messages|resources|accessibility|center`（地址栏会随导航自动同步）
- 开发登录入口：`http://8.134.206.52:8134/springbootmf383/front/pages/login/login.html`（收藏 / 个人中心 / 留言提交等个性化动作按需跳转）
- 开发后台入口（独立 URL）：`http://8.134.206.52:8134/springbootmf383/console/index.html`（管理员后台，跳转到 `/admin/dist/index.html#/login`）
- 开发日志：`runtime/remote-dev/app.log`
- 后台 UI 源码壳层：`src/main/resources/admin/admin/src/views/login.vue`、`src/main/resources/admin/admin/src/components/index/`、`src/main/resources/admin/admin/src/components/common/BreadCrumbs.vue`
- 后台主题资源：`src/main/resources/admin/admin/public/css/transit-admin-theme.css`、`src/main/resources/admin/admin/public/js/transit-admin-sidebar-dom.js`
- 后台 dist 镜像资源：`src/main/resources/admin/admin/dist/css/transit-admin-theme.css`、`src/main/resources/admin/admin/dist/js/transit-admin-sidebar-dom.js`
- 开发 PID：`runtime/remote-dev/server.pid`
- 页面级状态回归：`ui-automation/tests/ui-data-states.spec.js`
- 键盘与视觉提示回归：`ui-automation/tests/ui-accessibility-interaction.spec.js`
- 画像推荐回归：`ui-automation/tests/ui-route-persona.spec.js`
- 分段建模回归：`ui-automation/tests/ui-route-segments.spec.js`
- 数据治理回归：`ui-automation/tests/ui-governance-panel.spec.js`
- 反馈闭环回归：`ui-automation/tests/ui-feedback-workflow.spec.js`
- 准真实验证脚本：`ui-automation/scripts/run-user-validation.mjs`
- 屏幕阅读器代理回归：`ui-automation/tests/ui-screen-reader-baseline.spec.js`
- UI 布局审查：`ui-automation/scripts/run-layout-audit.mjs` / `cd ui-automation && npm run ui:audit:layout`（默认覆盖 `14` 个关键场景，检查溢出 / 贴边 / 遮挡，并在结束后自动删除 PNG；如需保留截图，加 `UI_LAYOUT_AUDIT_KEEP_SCREENSHOTS=1`）
- 登录 / 游客访问 / 个人中心 / 收藏 / 手机语音定向回归：`cd ui-automation && npx playwright test tests/ui-login-layout.spec.js tests/ui-user-center.spec.js tests/ui-storeup-layout.spec.js tests/ui-guest-access.spec.js tests/ui-resource-detail.spec.js tests/ui-caption-announcement.spec.js tests/ui-mobile-speech.spec.js tests/ui-speech-diagnostics.spec.js tests/ui-mobile-speech-fallback.spec.js --workers=1`
- 演示数据重置：`bash scripts/remote-dev-reset-demo-db.sh`
- 自动演示刷新退出回归：`ui-automation/tests/ui-demo-refresh-exit.spec.js`
- 手机端壳层按钮 / 弹窗回归：`ui-automation/tests/ui-mobile-shell-layout.spec.js`
- 前台/后台 URL 分离与演示入口隐藏回归：`ui-automation/tests/ui-portal-separation.spec.js`
- 真实路由 + 后台主题一致性回归：`ui-automation/tests/ui-real-route-admin-theme.spec.js`
- 后台 UI 统一主题回归（快速子集）：`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-real-route-admin-theme.spec.js -g "Admin login and dashboard should load transit-aligned theme styles" --workers=1`
- 后台 UI 推翻重做专项回归：`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js --workers=1`
- 后台侧栏对比截图（v045 -> v046）：`runtime/remote-dev/admin-sidebar-before-v045-recheck.png`、`runtime/remote-dev/admin-sidebar-after-v046.png`、`runtime/remote-dev/admin-sidebar-compare-v046.png`、`runtime/remote-dev/admin-sidebar-diff-v046.png`
- 后台侧栏商业化重做对比（v045 -> v047）：`runtime/remote-dev/admin-sidebar-after-v047.png`、`runtime/remote-dev/admin-sidebar-compare-v047.png`、`runtime/remote-dev/admin-sidebar-diff-v047.png`
- 后台侧栏扁平导轨版（v048）：`runtime/remote-dev/admin-sidebar-after-v048.png`、`runtime/remote-dev/admin-sidebar-compare-v048.png`
- 后台菜单 DOM 重做版（v051）：命中 `transit-admin-theme.css?v=20260309-051` 与 `transit-admin-sidebar-dom.js?v=20260309-051`，并执行 `tests/ui-admin-theme.spec.js` + `tests/ui-real-route-admin-theme.spec.js -g "Admin login and dashboard should load transit-aligned theme styles"`。

## 5. 回归重点
- 手机端排查顺序：先点“测试提示音”确认设备媒体音量，再点“测试语音”，最后查看“语音诊断信息”中的手势解锁/原生支持/最近报错。
- 手机端语音：优先从无障碍设置页点击“测试语音”确认已解除静音/媒体音量限制；iframe 页面中的语音播报会委托给壳层统一执行。
- 个性化入口（个人中心 / 收藏 / 留言提交 / 在线提问）是否先显示轻提示卡片，再由用户决定是否登录。
- 游客进入首页后是否仍可浏览公共功能，且只在收藏、留言提交、个人中心等个性化动作时要求登录。
- 自动演示通过 `?demo=1` / `?demo=auto` 启动后，地址栏是否已自动清理 `demo` 参数；刷新当前页时是否自动退出演示并恢复进入前设置。
- 手机端壳层快捷控制按钮是否仍有足够触控高度；游客登录提示、在线提问等弹窗是否完整落在视口内且按钮没有被拉伸。
- 首页与公告页是否仍出现“10 分钟自动演示”可见入口；管理员入口是否始终走独立 `console` URL。
- 前台地址栏是否随导航更新为 `?route=...`，并可通过直接访问 `index.html?route=...` 命中对应页面。
- 后台登录页是否仍出现旧模板的外层厚边框/悬浮大按钮；侧栏与面包屑是否已对齐前台设计语言。
- 后台左侧二级导航展开后是否具备清晰层级（展开面板、子项缩进、激活态不出现异常蓝底文字块）。
- 后台左侧一级菜单在 `hover / active / opened` 时是否具备明显反馈（位移、边框、导引条、亮度变化可见）。
- 后台登录页是否不再出现“用户/管理员”角色单选；管理员登录后流程是否直达后台首页。
- 首页推荐区、快捷控制栏、友情链接区域是否出现遮挡。
- 页面底部内容是否完整可见，是否再次出现双滚动条。
- 导航按钮热区是否完整，点击文字外围也能切换。
- 实时线路地图、无障碍路线规划、公告页是否仍有无尽加载。
- 盲人/低视力场景：高对比度、键盘导航、语音播报是否仍可用。

## 6. 运维约束
- 非必要不重启生产实例 `8133`。
- 所有编译默认低冲击执行，先 check 后 build。
- 运行产物统一放在 `runtime/` 下，不把日志和 PID 散落到仓库根目录。
- 本地只保留项目文档；源码开发与调试统一在远端完成。

## 7. 回滚方式
- 文档/脚本重整回滚：`git checkout -- .gitignore docs scripts/remote-dev-*.sh`
- 开发实例回滚：`bash scripts/remote-dev-stop.sh`
- 生产实例保持原进程不动，避免因本次工程整理影响线上访问。

## 8. 文档入口
- 变更记录：`docs/PROJECT_CHANGELOG.md`
- 远端开发流程：`docs/REMOTE_DEV_WORKFLOW.md`
- 商业侧栏参考文档：`docs/ADMIN_SIDEBAR_BENCHMARK_2026-03-09.md`
- 无障碍达标待办：`docs/ACCESSIBILITY_READINESS_TODO.md`
- 目标用户范围：`docs/TARGET_USER_SCOPE.md`
- 首轮试点范围：`docs/PILOT_SCOPE.md`
- 中期检查演示文档：`docs/MIDTERM_DEMO_GUIDE.md`
- 前端结构说明：`docs/FRONTEND_STRUCTURE_NOTES.md`
- 任务验证文档：`docs/ACCESSIBILITY_VALIDATION_TASKS.md`
- 验证报告：`docs/ACCESSIBILITY_VALIDATION_REPORT_2026-03-07.md`
- 屏幕阅读器基线：`docs/SCREEN_READER_BASELINE_2026-03-07.md`
- 试点核验台账：`docs/PILOT_VERIFICATION_LOG.md`
- 页面状态组件：`src/main/resources/front/front/js/page-state.js`
- 画像推荐接口：`/route/plan?profileType=...`
- 分段规划接口：`/route/plan` 返回 `segments`
- 治理配置资源：`src/main/resources/accessibility-governance.json`
- 反馈处理看板：`front/pages/messages/review.html`
- 字幕提示中心：`#a11y-caption-center`（壳层全局可见）
- 跨项目索引：`/root/dev/DEVELOPMENT_LOGBOOK.md`
