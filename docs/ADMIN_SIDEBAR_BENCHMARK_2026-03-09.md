# 管理后台侧边栏商业化参考（2026-03-09）

> 目标：为 bus-route-query-system 管理后台侧栏重做提供可追溯的商业设计依据，避免“拍脑袋调样式”。

## 1) 参考来源（官方文档）

1. GitLab Pajamas — Navigation sidebar  
   https://design.gitlab.com/patterns/navigation-sidebar/
2. GitHub Primer — NavList  
   https://primer.style/product/components/nav-list/
3. Microsoft Fluent 2 — React Nav  
   https://fluent2.microsoft.design/components/web/react/core/nav/usage
4. Ant Design — 常用布局（侧边导航）  
   https://010x.ant.design/spec/layout/

## 2) 可执行设计规则（从参考提炼）

### A. 信息架构
- 侧栏应保持“高频可达、低认知负担”。
- 层级控制在 2 级为主，避免深层树状迷宫（GitLab/Primer 均强调层级克制）。
- 菜单名称短而可扫描，优先 1-2 个词（GitLab/Fluent）。

### B. 状态反馈
- 当前项必须显著高于默认态：颜色、边框、指示条至少占两种通道（Fluent selection indicator）。
- hover 提供轻位移与亮度变化，建立“可点击”预期。
- 父级展开时，父项与子面板均应可见状态变化，避免“点了像没反应”。

### C. 布局与尺寸
- 侧栏宽度采用企业后台常见范围（约 240-280px），并在小屏可收敛（Ant 导航宽度公式和响应式实践）。
- 主内容区与侧栏分层明确：侧栏稳定、内容卡片轻浮层（Primer split layout 思路）。

### D. 响应式与可访问
- 窄屏下保持可用：侧栏可覆盖/收起，避免挤压主内容（Fluent Nav 在窄屏转 overlay）。
- 文本可换行或安全截断，避免 tooltip 阻挡核心导航。
- 对比度与焦点可见性不能因美化被削弱。

## 3) 本项目映射（v047）

- 一级菜单：增加左侧导引条 + hover 位移 + active 渐变强化。
- 二级面板：独立深色容器 + 垂直导引线 + 子项圆点，强化“父 -> 子”路径。
- 选中状态：父级/子级均有高对比边框与背景，提升可感知反馈。
- 响应式：保留 `1200px`、`900px` 两档收敛规则，避免侧栏挤压内容。

## 4) 说明
- 本参考仅用于 8134 开发环境重构验证，不影响 8133 生产环境。
- 若后续进入上线评审，请基于本清单补充可用性走查记录（任务完成时间、错误率、主观满意度）。
