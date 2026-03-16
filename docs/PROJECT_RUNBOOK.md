# 🚨 本地镜像规则

> **本地 `/root/dev/bus-route-query-system` 保持为“只保留 `README.md + docs/` 的稀疏检出”。**
> **代码、脚本、静态资源、测试文件一律不在本地修改；项目改动只在开发服务器 `root@8.134.206.52:/root/dev/bus-route-query-system` 执行。**
> **本地仅允许回写文档，用于让 Codex 先读本地文档再决定远端操作。**

# PJT-0001 · bus-route-query-system · PROJECT_RUNBOOK

最后更新：2026-03-16  
变更票据：`CHG-20260316-646`

## 🚨 2026-03-16 远端 SSH 断线结论（醒目保留）
- 用户现场观测到：**在手动重启之前，`8.134.206.52` 已经出现 SSH 无法连接，且外网网站也无法访问。**
- 已确认的绝对时间：
  - 当前 boot 时间：`2026-03-16 14:43:09 CST`
  - 上一轮 boot 日志终止在：`2026-03-16 13:55:13 CST` 左右
- 已排除项：
  - `journalctl -u ssh -b -1` 未见 sshd 崩溃
  - `journalctl -b -1` 未见 `shutdown/reboot/systemctl reboot/OOM/panic/watchdog` 正常收尾
- 资源侧补充：
  - `sar` 在 `13:50 CST` 前后未见资源耗尽：负载低、CPU 空闲高、内存与 swap 均未逼近极限。
- 因此更应按**主机级卡死 / 网络栈失联 / 云侧宿主机异常后由人工重启恢复**处理，而不是按应用过载或 sshd 单点故障处理。这里“主机级卡死/云侧异常”是依据现有证据做出的推断。
- 额外说明：本机 SSH 为 **socket 激活**（`ssh.socket=enabled/active`，`ssh.service=disabled`），重启后首次连接才会拉起 sshd；这不是故障。
- 强制规则：**以后任何长任务、关键修改、服务操作前，必须先把阶段性进度写入文档，再开始执行。** 整机重启会直接让当前 Codex / SSH 会话失效。

## 1. 项目定位
面向视障人士与行动不便人士的无障碍公交出行系统。当前以“演示稳定、远端可调试、线上可回滚”为首要目标。

## 2. 环境边界
- 本地文档入口：`/root/dev/bus-route-query-system`
- 远端开发工作区：`root@8.134.206.52:/root/dev/bus-route-query-system`
- 本地镜像形态：仅保留 `README.md + docs/` 稀疏检出，不展开源码树
- 当前唯一 demo 服务：`8133`
- 历史开发端口：`8134`（已停止长期维护）
- 运行形态：Java 17 / Spring Boot / MySQL 8（单实例 demo 直接跑当前远端工作区构建产物）
- 当前原则：默认只维护 `8133` 这一套，不再同时维护 `8133 + 8134`
- 后台静态资源当前版本：`transit-admin-theme.css?v=20260316-619`、`transit-admin-sidebar-dom.js?v=20260316-619`。
- 前台关键资源当前版本：`shell-page.js?v=20260316-646`、`route-list-page.js?v=20260316-630`、`map.html?v=20260316-646`、`accessibility-high-contrast.css?v=20260316-630`。
- 当前 `8133` 路线数据：接口 `gongjiaoluxian/list?page=1&limit=20` 返回 `total=12`（2026-03-16 实测）。
- 当前核心换乘走廊：`海珠广场`、`文化公园`、`珠江医院`、`纸厂地铁燕岗站`。
- 当前主回归演示对：`海珠广场 → 纸厂地铁燕岗站`（适合同时验证首次滚动、低视力高对比与线路导航地图展示）。
- 当前完整轨迹验证留档：`runtime/remote-dev/route-map-v646-segment-gray.png`（`64路/106路` 组合方案已确认渲染为 2 条完整 polyline）。
- 当前完整轨迹来源说明：底图仍为高德地图，但 `64路/106路` 完整线条目前使用**本地 demo 站序/轨迹点**渲染，不直接采用高德公交线路 API 返回结果；这样可先保证贴站与稳定显示。
- 当前 synthetic 全站点校准留档：`runtime/remote-dev/route-map-v646-segment-gray.png`（已确认地图与站点列表均纳入 10 个沿途站点）。
- 路线规划现状：除单线候选外，当前单实例系统已可返回“**一次换乘**”组合方案（适合演示中转价值）。
- 当前健康守护：`bus-route-health-guardian.timer` 已启用，每分钟自动检查 `8133 + SSH + 元数据链路 + 公网 8133`；异常时优先自动重启应用/SSH/网络栈，连续失败后再有限次自动重启整机。
- 当前稳定化脚本：
  - `bash scripts/single-demo-status.sh`：查看服务/守护/路线基线/版本号
  - `bash scripts/single-demo-smoke.sh`：一键检查单实例演示链路（内置启动后短等待，避免刚重启就误报）
  - `bash scripts/single-demo-smoke.sh --with-ui`：补充 UI 烟测（候选收短 + 次级按钮可见）；**也是旧壳层/路线页的快速验证命令，已写入文档固定使用**
  - `bash scripts/reset-single-demo-data.sh --dry-run`：只读校验 demo 基线 SQL 是否可恢复，并自动检查 `messages` 表字段是否齐全
  - `bash scripts/reset-single-demo-data.sh`：把 MySQL 演示路线与站点无障碍数据恢复为基线
  - `bash scripts/reset-single-demo-data.sh --with-content`：连同公告 / 友情链接 / 留言样本一并恢复，适合演示前快速校准内容页
- 当前 Phase 2A 结构拆分：
  - 路线页核心逻辑：`src/main/resources/front/front/js/pages/route-list-core.js`
  - 路线页选点/右键菜单逻辑：`src/main/resources/front/front/js/pages/route-list-picker.js`
  - 路线页主入口：`src/main/resources/front/front/js/pages/route-list-page.js`
  - 路线页/地图页尾部样式：`src/main/resources/front/front/css/transit-route-list.css`
  - 后端拆分蓝图：`docs/ROUTE_PLANNING_SERVICE_SPLIT_BLUEPRINT.md`（Phase 2C 已先落地 RouteStationMatchService 第一刀）
- 当前 Phase 2B 资源/脚本收口：
  - 后台运行时资源版本文件：`src/main/resources/admin/admin/admin-runtime.version`
  - 后台 public→dist 同步脚本：`scripts/sync-admin-runtime-assets.sh`
  - 历史 8134 入口告警脚本：`scripts/legacy-dev-warning.sh`
  - `single-demo-status.sh` 已补充后台资源同步状态输出
- 当前 Phase 2C 后端拆分第一刀：
  - 站点匹配接口：`src/main/java/com/service/RouteStationMatchService.java`
  - 站点匹配实现：`src/main/java/com/service/impl/RouteStationMatchServiceImpl.java`
  - 当前已迁出站序构建 / 起终点匹配 / 换乘站识别 / matchType 判定等逻辑
- 当前 Phase 2D 候选查询拆分：
  - 候选查询接口：`src/main/java/com/service/RouteCandidateQueryService.java`
  - 候选查询实现：`src/main/java/com/service/impl/RouteCandidateQueryServiceImpl.java`
  - 当前已迁出直达候选、一次换乘候选与合成换乘路线拼装逻辑
- 当前前台主链路：`地点名 / 地图选点 → 自动匹配站点 → 完整出行方案 → 一键进入地图出发`。
- 当前路线页结构：已改为**地图优先**布局，广州地图默认直接显示在页面顶部，出发地 / 目的地输入框收口到地图下方，同屏可见。
- 当前路线输入候选：默认不再展开整列超长候选；输入框在**至少输入 1 个字**后，只显示最相关的 `12` 条候选站点，便于演示时快速收敛到“海珠广场 / 珠江医院 / 文化公园”等目标点。
- 当前“查看路线 / 生成方案”分工：
  - `查看路线`：按输入地点解析后的站点做**线路覆盖筛选**
  - `生成方案`：按服务画像 + 推荐偏好 + 无障碍评分 + 风险提示 + 数据透明度 + 首末段步行，生成**完整出行方案**
- 当前路线页选点底图：已改为**高德优先、Leaflet 兜底**；默认打开即展示广州视角，不再出现上方大片留白 + 下方灰底空图的首屏体验。
- 当前地点输入联动：路线页输入地点名后，失焦会自动识别并让页内地图移动到对应区域；也可点“定位出发地 / 目的地”或直接点击地图微调点位。
- 当前地图选点交互：点击地图后会生成临时点位，可直接点“设为起点 / 设为终点”，并支持“交换起终点”；同时支持在地图上**右键直接打开快捷菜单**，完成设起点 / 设终点 / 交换起终点。
- 当前壳层 routes 导航：从其他页点击“无障碍路线规划”时，壳层会直接跳到 `?route=routes&rt=...` 强制刷新到最新版，避免仍留在旧 iframe 页面直到手动刷新。
- 当前候选方案样式：路线结果已收口为更接近高德 / 百度的**单列候选方案列表**，默认突出方案序号、直达/换乘状态、上下车区间、首末段接驳与一键进地图。
- 当前候选方案按钮：次级按钮“详情”已恢复深色文字与边框，不再出现白底白字导致看起来像“空白按钮”的情况。
- 当前候选方案可用性（v630）：点击“生成方案”后，页面会通过**页内滚动 + 壳层父页滚动联动**把结果区直接带入当前视野；首次点击即可看到候选方案，不再出现“地图被滑动了，但结果列表没到视野里”的情况。
- 当前低视力高对比（v630）：`服务画像 / 推荐偏好` 等下拉、候选列表和结果卡文案已补齐黑底白字适配；`LOW_VISION` 下会自动开启高对比，切回其他画像会自动关闭。
- 当前地图导航稳定性（v630）：地图容器已固定为拉伸宽度，并在页面加载/回到前台/进入导航时做有限次 `resize / invalidateSize` 重算，避免点击候选进入导航后出现空白地图。
- 当前换乘轨迹呈现（v635）：对 `64路/106路` 这类 synthetic 换乘方案，地图页会优先按各子线路分别调用高德 `LineSearch`，并按命中站点窗口裁剪子线路轨迹；若候选子线路切片的端点与实际站点偏差过大，则继续尝试其他候选；全部不可靠时才退回局部直连兜底，并为轨迹增加白色描边，避免出现“状态显示成功但站点之间看不到连线”。
- 当前画像联动（v625/v628）：选择 `低视力` 时会自动开启高对比模式；切换回 `自动识别 / 轮椅 / 听障` 时会自动关闭高对比模式，避免预设残留。
- 当前路线详情页：已取消封面轮播，改为**文字概览卡 + 单卡信息区**；点赞/点踩操作与顶部概览卡直接贴合，避免旧双列结构下出现白色缝隙或空白区。
- 当前地图联动现状：路线页会把当前候选方案与 `startSelection / endSelection` 一并写入 `localStorage.routeMapSelection`；地图页优先读取该选择，并额外绘制首段接驳、末段接驳与换乘后的完整出行提示。
- 当前语音稳定性：`SpeechService` 与 `AriaService` 已增加同文案短时去重，用于缓解偶发双播报。

## 3. 标准开发流（远端执行）
1. SSH 登录远端服务器。
2. 如是长任务，先进入持久会话：`tmux new -As bus-route-dev`
3. 进入项目目录：`cd /root/dev/bus-route-query-system`
4. 直接部署单实例版本：`bash scripts/single-demo-deploy.sh`
5. 查看运行状态：`bash scripts/single-demo-status.sh`
6. 发布前先跑冒烟：`bash scripts/single-demo-smoke.sh`
7. 如需核对或恢复演示数据：`bash scripts/reset-single-demo-data.sh --dry-run`
8. 如首次安装或重装守护：`bash scripts/install-host-health-guardian.sh`

> 如需整机重启，必须先补文档 checkpoint，并记录绝对时间；应用问题优先通过 `single-demo-deploy.sh / single-demo-status.sh / systemctl restart bus-route.service` 处理，不要直接重启整机。
>
> 但如果再次出现“SSH + 外网网站同时不可达”，要优先按**主机/网络级事故**处理；重启是恢复手段，不代表故障起点就是“需要重启”。

## 4. 关键路径与访问地址
- 开发环境 TTS 兜底依赖：`runtime/tts-venv/`（edge-tts）、缓存目录：`runtime/tts-cache/`。
- 生产公共入口：`http://8.134.206.52:8133/springbootmf383/front/index.html`（游客默认进入首页总览）
- `8134` 已不再作为长期维护入口。
- 前台真实路由示例：`/front/index.html?route=home|routes|map|announcements|messages|resources|accessibility|center`（地址栏会随导航自动同步）
- 路线差异演示主输入：`海珠广场 → 纸厂地铁燕岗站`（轮椅首选 `64路/106路`，低视力首选 `16路`）
- 登录入口：`http://8.134.206.52:8133/springbootmf383/front/pages/login/login.html`（收藏 / 个人中心 / 留言提交等个性化动作按需跳转）
- 后台入口（独立 URL）：`http://8.134.206.52:8133/springbootmf383/console/index.html`（管理员后台，跳转到 `/admin/dist/index.html#/login`）
- 当前对外服务日志：`server-8133.log`
- 健康守护日志：`runtime/host-guardian/guardian.log`
- 健康守护定时器：`bus-route-health-guardian.timer`
- 单实例冒烟脚本：`scripts/single-demo-smoke.sh`
- 演示数据重置脚本：`scripts/reset-single-demo-data.sh`
- 路线页 Phase 2A 核心脚本：`src/main/resources/front/front/js/pages/route-list-core.js`
- 路线页 Phase 2A 选点脚本：`src/main/resources/front/front/js/pages/route-list-picker.js`
- 路线页 Phase 2A 样式：`src/main/resources/front/front/css/transit-route-list.css`
- 路线详情页截图（去封面版）：`runtime/remote-dev/route-detail-v623.png`
- 路线规划结果页截图（自动聚焦 + 透明推荐版）：`runtime/remote-dev/route-plan-v624.png`
- 后台 UI 源码壳层：`src/main/resources/admin/admin/src/views/login.vue`、`src/main/resources/admin/admin/src/components/index/`、`src/main/resources/admin/admin/src/components/common/BreadCrumbs.vue`
- 后台主题资源（当前维护源）：`src/main/resources/admin/admin/public/css/transit-admin-theme.css`、`src/main/resources/admin/admin/public/js/transit-admin-sidebar-dom.js`
- 后台 dist 镜像资源（运行时兼容镜像）：`src/main/resources/admin/admin/dist/css/transit-admin-theme.css`、`src/main/resources/admin/admin/dist/js/transit-admin-sidebar-dom.js`
- 后台运行时版本文件：`src/main/resources/admin/admin/admin-runtime.version`
- 后台资源同步/校验：`bash scripts/sync-admin-runtime-assets.sh --sync|--check`
- 后台壳层现状：已取消左侧侧边栏；`#/index/` 工作台仅保留高频主入口（路线 / 公告 / 资源 / 留言 / 用户），低频功能（账户设置 / 评论审核 / 在线提问 / 展示配置）收纳到顶栏“更多功能”下拉菜单。
- 后台 2026-03-10 无侧栏工作台截图：`runtime/remote-dev/admin-workbench-home-20260310.png`、`runtime/remote-dev/admin-workbench-module-20260310.png`。
- 后台 2026-03-10 布局修复确认截图：`runtime/remote-dev/admin-login-fixed-20260310.png`、`runtime/remote-dev/admin-home-fixed-20260310.png`、`runtime/remote-dev/admin-module-fixed-20260310.png`。
- 后台 2026-03-10 最终可用性确认截图：`runtime/remote-dev/admin-login-final-20260310.png`、`runtime/remote-dev/admin-home-final-20260310.png`、`runtime/remote-dev/admin-module-final-20260310.png`。
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
- 演示数据重置：`bash scripts/reset-single-demo-data.sh [--dry-run]`
- 换乘/画像差异推荐输入：`海珠广场 → 纸厂地铁燕岗站`、`中山图书馆 → 南石西地铁棣园站总站`。
- 推荐结果直达地图烟测（2026-03-16）：`cd ui-automation && node -e ...` 已验证壳层 URL 切换到 `?route=map`，且地图页会自动载入 `__selection__` 合成换乘方案。
- 路线页页内地图联动烟测（2026-03-16）：`runtime/remote-dev/route-inline-picker-20260316.png` 已验证页内地图成功渲染；点击“地图选出发地”时 `layerCount=0`，输入 `珠江医院` 后地图中心从 `23.12915,113.26441` 移动到 `23.08075,113.26319`。
- 路线页地图优先布局烟测（2026-03-16）：`runtime/remote-dev/route-page-compact-20260316.png` 已确认 `engineType=amap`、默认中心为广州 `113.2644,23.1291`，且地图区域 `top=117,bottom=677`、出发地输入框 `top=761`，实现“地图在上、输入在下”的单屏布局。
- 地图选点设起终点烟测（2026-03-16）：脚本已确认地图点位可先后设为 `农讲所 -> 江南西`，点击“交换起终点”后输入框内容与提示一并互换。
- routes 候选方案与右键菜单烟测（2026-03-16）：`ui-automation/route_v613_smoke.js` 已确认 iframe 命中 `list.html?v=20260316-613`，地图右键菜单可完成 `设为起点 / 设为终点 / 交换起终点`，且输入 `东山署前路总站 -> 珠江医院` 后可生成 `6` 条候选方案；截图：`runtime/remote-dev/route-v613-map-panel.png`、`runtime/remote-dev/route-v613-solution-list.png`。
- routes 强制切新版烟测（2026-03-16）：从 `?route=home` 点击“无障碍路线规划”后，URL 已变为 `index.html?route=routes&rt=...`，iframe 同步命中 `./pages/gongjiaoluxian/list.html?v=20260316-613`。
- 自动演示刷新退出回归：`ui-automation/tests/ui-demo-refresh-exit.spec.js`
- 手机端壳层按钮 / 弹窗回归：`ui-automation/tests/ui-mobile-shell-layout.spec.js`
- 前台/后台 URL 分离与演示入口隐藏回归：`ui-automation/tests/ui-portal-separation.spec.js`
- 真实路由 + 后台主题一致性回归：`ui-automation/tests/ui-real-route-admin-theme.spec.js`
- 后台 UI 统一主题回归（快速子集）：`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8133/springbootmf383/front/ npx playwright test tests/ui-real-route-admin-theme.spec.js -g "Admin login and dashboard should load transit-aligned theme styles" --workers=1`
- 后台 UI 推翻重做专项回归：`cd ui-automation && UI_BASE_URL=http://127.0.0.1:8133/springbootmf383/front/ npx playwright test tests/ui-admin-theme.spec.js --workers=1`
- 后台侧栏对比截图（v045 -> v046）：`runtime/remote-dev/admin-sidebar-before-v045-recheck.png`、`runtime/remote-dev/admin-sidebar-after-v046.png`、`runtime/remote-dev/admin-sidebar-compare-v046.png`、`runtime/remote-dev/admin-sidebar-diff-v046.png`
- 后台侧栏商业化重做对比（v045 -> v047）：`runtime/remote-dev/admin-sidebar-after-v047.png`、`runtime/remote-dev/admin-sidebar-compare-v047.png`、`runtime/remote-dev/admin-sidebar-diff-v047.png`
- 后台侧栏扁平导轨版（v048）：`runtime/remote-dev/admin-sidebar-after-v048.png`、`runtime/remote-dev/admin-sidebar-compare-v048.png`
- 后台菜单 DOM 重做版（v051）：命中 `transit-admin-theme.css?v=20260309-051` 与 `transit-admin-sidebar-dom.js?v=20260309-051`，并执行 `tests/ui-admin-theme.spec.js` + `tests/ui-real-route-admin-theme.spec.js -g "Admin login and dashboard should load transit-aligned theme styles"`。

## 5. 回归重点
- 手机端排查顺序：先点“测试提示音”确认设备媒体音量，再点“测试语音”，最后查看“语音诊断信息”中的手势解锁/原生支持/最近报错。
- 手机端语音：优先从无障碍设置页点击“测试语音”确认已解除静音/媒体音量限制；iframe 页面中的语音播报会委托给壳层统一执行。
- 无障碍设置页的“一键场景预设”按钮不再带副文案；点击预设时若仍听到双播报，优先复查 `src/main/resources/front/front/js/accessibility.js` 的 announce/speak 去重逻辑。
- 路线页应以“我的出发地 / 我的目的地”为输入语义；推荐结果点击后应直接进入地图，而不是默认跳详情页。
- 路线页现支持“地点名 / 地图选点”输入，不再强制要求用户先知道具体站点名；系统会先匹配更合适的上下车站，再生成完整出行方案。
- 地图页应展示首末段接驳、上/下车站无障碍提示与换乘说明；从推荐页进入后，侧栏不应只剩线路静态信息。
- 地图页若是从推荐页进入，顶部状态与地址栏都应切到 `map`，且 `#routeInfo` 里应直接出现当前推荐路线信息；不应停留在占位文案。
- 个性化入口（个人中心 / 收藏 / 留言提交 / 在线提问）是否先显示轻提示卡片，再由用户决定是否登录。
- 游客进入首页后是否仍可浏览公共功能，且只在收藏、留言提交、个人中心等个性化动作时要求登录。
- 自动演示通过 `?demo=1` / `?demo=auto` 启动后，地址栏是否已自动清理 `demo` 参数；刷新当前页时是否自动退出演示并恢复进入前设置。
- 手机端壳层快捷控制按钮是否仍有足够触控高度；游客登录提示、在线提问等弹窗是否完整落在视口内且按钮没有被拉伸。
- 首页与公告页是否仍出现“10 分钟自动演示”可见入口；管理员入口是否始终走独立 `console` URL。
- 前台地址栏是否随导航更新为 `?route=...`，并可通过直接访问 `index.html?route=...` 命中对应页面。
- 后台登录页是否仍出现旧模板的外层厚边框/悬浮大按钮；顶栏与面包屑是否已对齐前台设计语言。
- 后台工作台是否仅显示高频入口，且“更多功能”下拉菜单可打开低频模块（账户设置 / 互动审核 / 展示配置）。
- 直接访问历史路由（如 `#/pay`）是否会被拦截并回到工作台，避免无效模块暴露。
- 后台登录页是否不再出现“用户/管理员”角色单选；管理员登录后流程是否直达后台首页。
- 首页推荐区、快捷控制栏、友情链接区域是否出现遮挡。
- 页面底部内容是否完整可见，是否再次出现双滚动条。
- 导航按钮热区是否完整，点击文字外围也能切换。
- 实时线路地图、无障碍路线规划、公告页是否仍有无尽加载。
- 盲人/低视力场景：高对比度、键盘导航、语音播报是否仍可用。

## 6. 运维约束
- 非必要不重启当前唯一服务 `8133`。
- 非必要不重启整台远端服务器；优先依赖健康守护与 `single-demo-deploy/status` 脚本恢复。
- 所有编译默认低冲击执行，先 check 后 build。
- 运行产物统一放在 `runtime/` 下，不把日志和 PID 散落到仓库根目录。
- 本地只保留项目文档；源码开发与调试统一在远端完成。
- 长任务默认放入 `tmux` / 后台脚本；不要把唯一操作进度只留在 SSH 当前窗口里。
- 当前 demo 已切到单实例基线，**`remote-dev-start/stop/status/reset-demo-db.sh` 仅保留为历史入口，不再作为日常主流程**；这些脚本现在会先打印 legacy 告警，再继续执行。

## 7. SSH 断线后的判因顺序
```bash
uptime -s
last -x reboot shutdown | head
journalctl -b -1 -n 120 --no-pager
journalctl -u ssh -b -1 --no-pager | tail -n 80
systemctl is-active ssh.socket
bash scripts/single-demo-status.sh
sar -q -f /var/log/sysstat/sa$(date +%d)
sar -r -f /var/log/sysstat/sa$(date +%d)
```

- 如果看到“boot 时间变化 + 上一轮 boot 无正常 shutdown/reboot 收尾”，再结合用户现场出现“SSH + 网站同时失联”，按**主机级故障后被人工重启恢复**处理。
- 如果 `ssh.socket` 仍为 `active`，说明 SSH 入口仍在，`ssh.service` 是否常驻不是首要判断项。

## 8. 回滚方式
- 文档/脚本重整回滚：`git checkout -- .gitignore docs scripts/remote-dev-*.sh scripts/single-demo-*.sh scripts/install-host-health-guardian.sh ops/systemd/bus-route-health-guardian.*`
- 二进制/服务回滚：从 `runtime/manual-backups/single-demo-*` 中恢复备份 jar / `bus-route.service`
- 健康守护回滚：`systemctl disable --now bus-route-health-guardian.timer && rm -f /etc/systemd/system/bus-route-health-guardian.* && systemctl daemon-reload`
- 演示数据回滚：从 `runtime/manual-backups/reset-single-demo-data-*/` 中恢复对应表快照

## 9. 文档入口
- 变更记录：`docs/PROJECT_CHANGELOG.md`
- 远端开发流程：`docs/REMOTE_DEV_WORKFLOW.md`
- 商业侧栏参考文档：`docs/ADMIN_SIDEBAR_BENCHMARK_2026-03-09.md`
- 无障碍达标待办：`docs/ACCESSIBILITY_READINESS_TODO.md`
- 目标用户范围：`docs/TARGET_USER_SCOPE.md`
- 首轮试点范围：`docs/PILOT_SCOPE.md`
- 中期检查演示文档：`docs/MIDTERM_DEMO_GUIDE.md`
- 创新主线演示讲稿：`docs/DEMO_INNOVATION_SCRIPT.md`
- RoutePlanningService 拆分蓝图：`docs/ROUTE_PLANNING_SERVICE_SPLIT_BLUEPRINT.md`
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
