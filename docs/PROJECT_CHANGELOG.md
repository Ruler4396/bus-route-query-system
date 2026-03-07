# PJT-0001 · PROJECT_CHANGELOG

## 2026-03-07 · CHG-20260307-009 · 前端高风险页面脚本拆分（S01）
- 将 `index.html`、`home.html`、`gongjiaoluxian/list.html`、`accessibility/settings.html` 的内联脚本抽离到 `src/main/resources/front/front/js/pages/`。
- 新增 `shell-page.js`、`home-page.js`、`route-list-page.js`、`accessibility-settings-page.js`，降低后续增量修改时的格式错误风险。
- 本轮拆分不改变业务功能，只优化高风险页面的脚本结构。
- 结构拆分后重新跑现有 20 条自动化测试，全部通过。
- 对应提交：`c5b2f08`

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
