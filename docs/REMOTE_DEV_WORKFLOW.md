# 🚨 本地镜像规则

> **本地 `/root/dev/bus-route-query-system` 只保留 `README.md + docs/` 稀疏检出。**
> **除文档回写外，所有项目改动必须在开发服务器 `root@8.134.206.52:/root/dev/bus-route-query-system` 执行。**

# bus-route-query-system · REMOTE_DEV_WORKFLOW

最后更新：2026-03-16
票据：`CHG-20260316-625`

## 🚨 2026-03-16 SSH 断开结论（先看）
- 结合用户补充事实，本次事件的真实顺序是：**先出现 SSH 无法连接 + 外网网站无法访问，之后用户才手动重启远端主机。**
- 证据：
  - 当前启动时间：`2026-03-16 14:43:09 CST`（`uptime -s`）
  - 上一轮 boot 结束时间：`2026-03-16 13:55:13 CST` 左右（`journalctl --list-boots` / `journalctl -b -1`）
  - `journalctl -u ssh -b -1` 未发现 sshd 异常退出
  - `journalctl -b -1` 未记录 `shutdown` / `reboot` / `systemctl reboot` / `OOM` / `panic` / `watchdog` 的正常收尾
  - `sar` 指标在 `13:50 CST` 前后未显示资源耗尽：负载约 `0.03`、CPU 空闲约 `98.85%`、内存可用仍充足、无 swap 压力
- 结论：
  - 这次故障更应按**主机级卡死 / 网络栈失联 / 云侧宿主机异常**处理，SSH 与网站同时不可达只是表象；用户的手动重启是恢复动作，不是故障起点。
  - 日志只能证明“上一轮系统是突然中断的”，不能精确证明是宿主机问题、内核卡死还是云网络异常；上述分类属于基于现有证据的推断。
- 补充说明：
  - 当前机器的 SSH 采用 **socket 激活**：`ssh.service=disabled`、`ssh.socket=enabled/active`。
  - 因此重启后你可能先看到 `ssh.service` 未运行，但只要 `ssh.socket` 仍是 `active`，首次连接会自动拉起 sshd；这属于正常现象，不是新的故障。

## 🚨 为避免再次“断线即丢上下文”，后续一律执行
1. **长任务前先 checkpoint**：先把当前结论、待做项、关键命令写入 `docs/PROJECT_CHANGELOG.md` 或相关文档，再开始耗时操作。
2. **长任务不绑前台 SSH**：构建、回归、抓日志优先放进 `tmux` 或项目脚本，不直接把唯一进度绑在交互式 SSH 会话上。
3. **非必要不重启整机**：只需要恢复开发实例时，优先使用：
   ```bash
   systemctl restart bus-route.service
   bash scripts/single-demo-status.sh
   bash scripts/host-health-guardian.sh
   ```
   不要把“开发实例异常”直接升级成“重启整台服务器”。
   但如果出现“**SSH + 外网网站同时失联**”，要优先按**主机/网络级事故**处理，而不是先假设只是应用挂了。
4. **必须重启整机前，先做 3 件事**：
   - 写文档 checkpoint
   - 记录绝对时间（例如 `2026-03-16 14:43 CST`）
   - 确认后台任务已转入 `tmux` / `nohup` / 项目脚本
5. **断线后优先判因，不先盲目重启第二次**：
   ```bash
   uptime -s
   last -x reboot shutdown | head
   journalctl -b -1 -n 120 --no-pager
   journalctl -u ssh -b -1 --no-pager | tail -n 80
   systemctl is-active ssh.socket
   sar -q -f /var/log/sysstat/sa$(date +%d 2>/dev/null || printf "%02d" $(date +%d)) | tail
   ```
6. **默认 tmux 会话名**：
   ```bash
   ssh -i /root/dev/sf.pem root@8.134.206.52
   tmux new -As bus-route-dev
   ```
7. **明确认知**：只要整机重启，当前 Codex / SSH live session 就会直接失效，所以“先落盘，再操作”是强制规则，不是建议。
8. **如果再次出现“SSH + 外网同时不可达”**：
   - 优先判断为主机/网络级事故
   - 第一动作是保留时间点并在恢复后取证
   - 第二动作才是恢复 `8133` 与健康守护链路
   - 不要误判为“只是 bus-route 服务没起来”

## 1. 目标
把开发、调试、部署统一收敛到远端服务器 `8.134.206.52`，本地工作区仅作为文档入口和索引，不再作为主执行环境。

## 1.1 当前运行模式（2026-03-16 起）
- **单实例 demo 模式**：`8133` 是唯一长期运行的对外服务。
- `8134` 不再作为长期维护实例；当前版本直接在远端工作区构建后替换 `8133`。
- 为避免再靠人工整机重启恢复，服务器已安装：
  - `scripts/host-health-guardian.sh`
  - `scripts/install-host-health-guardian.sh`
  - `bus-route-health-guardian.timer`
- 为避免“代码已改但演示链路漂移”，当前再追加两类单实例治理脚本：
  - `scripts/single-demo-smoke.sh`
  - `scripts/reset-single-demo-data.sh`
- 为降低单文件改动带来的误伤，Phase 2A 已先做第一刀结构拆分：
  - `route-list-page.js` 拆为 `route-list-core.js + route-list-picker.js + route-list-page.js`
  - 路线尾部样式从 `transit-business-ui.css` 抽到 `transit-route-list.css`
  - `RoutePlanningServiceImpl` 拆分蓝图见 `docs/ROUTE_PLANNING_SERVICE_SPLIT_BLUEPRINT.md`
- Phase 2B 已补后台资源与脚本流收口：
  - `scripts/sync-admin-runtime-assets.sh`：统一校验/同步 `admin/public` 与 `admin/dist` 的运行时 CSS/JS 与版本号
  - `src/main/resources/admin/admin/admin-runtime.version`：后台运行时资源唯一版本号入口
  - `scripts/legacy-dev-warning.sh`：历史 `8134` 脚本执行前先提示走 `single-demo-*` 主流程
  - `single-demo-status.sh` 已追加后台资源同步状态输出
- Phase 2C 已启动真实后端拆分：
  - 新增 `RouteStationMatchService` / `RouteStationMatchServiceImpl`
  - 已先迁出站点顺序、站点命中、换乘站识别与 matchType 判定
  - 当前仍保持 `RoutePlanningController` 与 `route/plan` 输出不变
- Phase 2D 已继续抽候选查询层：
  - 新增 `RouteCandidateQueryService` / `RouteCandidateQueryServiceImpl`
  - 已迁出直达候选、一次换乘候选与合成换乘路线逻辑
  - 当前 `RoutePlanningServiceImpl` 已进一步收口为 orchestrator + scoring + mapping 主体
- 健康守护默认每分钟检查一次：
  - 本机 `8133`
  - 公网 `8133`
  - `ssh.socket / ssh.service`
  - 默认路由 + 元数据链路
- 守护动作顺序：**先重启应用/SSH/网络栈，最后才有限次自动重启整机**。

## 2. 端口约定
- `8133`：当前唯一 demo 服务，对外访问入口。
- `8134`：历史开发端口，默认不维护、不常驻启动。

## 3. 标准命令
```bash
cd /root/dev/bus-route-query-system
bash scripts/single-demo-deploy.sh
bash scripts/single-demo-status.sh
bash scripts/single-demo-smoke.sh
bash scripts/single-demo-smoke.sh --with-ui   # 旧壳层 / 路线页快速验证命令
bash scripts/reset-single-demo-data.sh --dry-run
# 如需把留言页/公告页/友情链接样本一起恢复
bash scripts/reset-single-demo-data.sh --with-content
bash scripts/install-host-health-guardian.sh
```

如需只做编译检查：
```bash
bash scripts/sync-admin-runtime-assets.sh --check
bash scripts/remote-dev-check.sh
bash scripts/remote-dev-build.sh   # 内置 --sync，构建前会自动同步后台运行时资源
```

## 4. 行为约束
- 路线规划页与线路导航页已进一步收口为一条链路；`实时线路地图` 不再作为前台主导航独立入口保留。
- 网页上的长段说明已下沉到文档与回复口径；前台页面只保留短提示和结构化结果，避免继续拖慢旧壳层渲染。
- 路线页/旧壳层做完样式或交互微调后，优先执行：`bash scripts/single-demo-smoke.sh --with-ui`。
- 当前路线页/地图页回归主案例固定为：`海珠广场 → 纸厂地铁燕岗站`；验收至少看 4 件事：①首次点击 `生成方案` 后结果区进入当前视野；②`LOW_VISION` 下 Layui 下拉为黑底白字；③点击候选进入导航后 `#map` 宽度大于 0 且 `engineStatus` 不为初始化/空白；④`WHEELCHAIR` 首推 `64路/106路` 进入导航后，地图引擎状态应优先出现 `高德地图（换乘组合轨迹）`，避免三点直线。
- 本地镜像不展开源码目录，默认保持 `README.md + docs/` 即可。
- 本地只回写文档；代码、脚本、静态资源、测试文件统一在远端修改。
- 当前不再长期维护 `8134`；改动完成后直接通过单实例脚本替换 `8133`。
- `remote-dev-start.sh / remote-dev-stop.sh / remote-dev-status.sh / remote-dev-reset-demo-db.sh` 当前仅保留为历史开发入口，不再作为单实例 demo 日常主流程；执行时会先打印 legacy 告警。
- 默认低冲击执行，不并行高负载构建。
- 如需长时间构建、日志观察、批量脚本，优先在远端 `tmux` 中运行，避免 SSH 断开导致唯一上下文丢失。
- 如只涉及文档、脚本、样式微调，优先做最小回归，不触碰生产实例。
- 所有新增运维入口必须写入文档，避免“只有服务器上知道”的隐式流程。

## 5. 推荐验证顺序
1. `single-demo-deploy.sh`
2. `single-demo-status.sh`
3. `single-demo-smoke.sh`（已内置本机前台预热等待）
4. 如需确认 demo 数据基线：`reset-single-demo-data.sh --dry-run`
5. 浏览器访问：`http://8.134.206.52:8133/springbootmf383/front/index.html`
6. 如需 UI 自动化：
```bash
cd /root/dev/bus-route-query-system/ui-automation
npm install
UI_BASE_URL=http://127.0.0.1:8133/springbootmf383/front/ npx playwright test tests/ui-login-layout.spec.js tests/ui-user-center.spec.js tests/ui-storeup-layout.spec.js --workers=1
UI_BASE_URL=http://127.0.0.1:8133/springbootmf383/front/ npm run ui:check
UI_BASE_URL=http://127.0.0.1:8133/springbootmf383/front/ npm run ui:audit:layout
UI_LAYOUT_AUDIT_KEEP_SCREENSHOTS=1 UI_BASE_URL=http://127.0.0.1:8133/springbootmf383/front/ npm run ui:audit:layout
```

## 6. 产物位置
- 单实例状态：`bash scripts/single-demo-status.sh`
- 单实例冒烟：`bash scripts/single-demo-smoke.sh`
- 演示数据重置：`bash scripts/reset-single-demo-data.sh [--dry-run]`
- 健康守护日志：`runtime/host-guardian/guardian.log`
- 健康守护状态：`runtime/host-guardian/state.env`
- 健康守护定时器：`bus-route-health-guardian.timer`
- 当前对外服务日志：`/root/dev/bus-route-query-system/server-8133.log`

## 7. 布局截图审计说明
- `ui:audit:layout` 默认覆盖 `14` 个登录 / 壳层 / 路线 / 公告 / 资源 / 留言 / 设置 / 个人中心 / 收藏场景，自动检查溢出、贴边和固定层遮挡。
- 默认行为是“生成截图 -> 输出 `summary.json` -> 删除 PNG”，避免测试产物长期堆积。
- 仅在需要肉眼复核时再加：`UI_LAYOUT_AUDIT_KEEP_SCREENSHOTS=1`。
