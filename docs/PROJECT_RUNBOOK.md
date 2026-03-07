# PJT-0001 · bus-route-query-system · PROJECT_RUNBOOK

最后更新：2026-03-07  
变更票据：`CHG-20260307-004`

## 1. 项目定位
面向视障人士与行动不便人士的无障碍公交出行系统。当前以“演示稳定、远端可调试、线上可回滚”为首要目标。

## 2. 环境边界
- 本地文档入口：`/root/dev/bus-route-query-system`
- 远端开发工作区：`root@8.134.206.52:/root/dev/bus-route-query-system`
- 生产实例：`8133`
- 远端开发实例：`8134`
- 运行形态：Java 17 / Spring Boot / MySQL 8（生产） / H2 Demo（远端开发）
- 当前原则：默认不重启 `8133`，开发验证先走 `8134`

## 3. 标准开发流（远端执行）
1. SSH 登录远端服务器。
2. 进入项目目录：`cd /root/dev/bus-route-query-system`
3. 先做检查：`bash scripts/remote-dev-check.sh`
4. 再做构建：`bash scripts/remote-dev-build.sh`
5. 启动开发实例：`bash scripts/remote-dev-start.sh`
6. 查看状态：`bash scripts/remote-dev-status.sh`
7. 停止开发实例：`bash scripts/remote-dev-stop.sh`

## 4. 关键路径与访问地址
- 生产地址：`http://8.134.206.52:8133/springbootmf383/front/index.html`
- 开发地址：`http://8.134.206.52:8134/springbootmf383/front/index.html`
- 开发日志：`runtime/remote-dev/app.log`
- 开发 PID：`runtime/remote-dev/server.pid`

## 5. 回归重点
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
- 无障碍达标待办：`docs/ACCESSIBILITY_READINESS_TODO.md`
- 目标用户范围：`docs/TARGET_USER_SCOPE.md`
- 首轮试点范围：`docs/PILOT_SCOPE.md`
- 跨项目索引：`/root/dev/DEVELOPMENT_LOGBOOK.md`
