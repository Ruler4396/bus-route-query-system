# PJT-0001 · PROJECT_CHANGELOG

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
