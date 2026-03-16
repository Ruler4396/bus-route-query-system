# PJT-0001 · FRONTEND_STRUCTURE_NOTES

最后更新：2026-03-16  
状态：**S01 完成 + Phase 2A/2B/2C/2D 持续推进中**

## 1. 目标
本轮结构优化只做**低风险拆分**，不重写前端框架，不改变既有功能，不动生产 `8133`。

核心目标：
- 降低大文件内联脚本导致的括号/引号/局部 patch 失误率
- 降低后续继续做 `E/F/G/H` 时的维护风险
- 保持现有自动化回归全绿

---

## 2. 本轮拆分范围
### 2.1 已拆分页面
- `src/main/resources/front/front/index.html`
- `src/main/resources/front/front/pages/home/home.html`
- `src/main/resources/front/front/pages/gongjiaoluxian/list.html`
- `src/main/resources/front/front/pages/accessibility/settings.html`

### 2.2 抽离后的脚本文件
- `src/main/resources/front/front/js/pages/shell-page.js`
- `src/main/resources/front/front/js/pages/home-page.js`
- `src/main/resources/front/front/js/pages/route-list-page.js`
- `src/main/resources/front/front/js/pages/accessibility-settings-page.js`

### 2.3 2026-03-16 已继续完成的结构收口
- 路线规划页继续拆分为：
  - `src/main/resources/front/front/js/pages/route-list-core.js`
  - `src/main/resources/front/front/js/pages/route-list-picker.js`
  - `src/main/resources/front/front/js/pages/route-list-page.js`（主入口已降到更偏编排层）
- 路线规划相关页面级样式从 `transit-business-ui.css` 抽出到：
  - `src/main/resources/front/front/css/transit-route-list.css`
- 后端 `RoutePlanningServiceImpl` 已完成两刀真实拆分：
  - `RouteStationMatchService / RouteStationMatchServiceImpl`
  - `RouteCandidateQueryService / RouteCandidateQueryServiceImpl`
- 路线详情页已完成一轮 UI 结构收口：
  - 取消封面轮播，改为文字优先的 summary card
  - 基础字段改为 facts grid，降低旧双列布局继续叠加 patch 的风险

---

## 3. 结构优化原则
1. 页面结构尽量不动，只抽离内联脚本。  
2. 先保留现有全局依赖（layui / Vue / jQuery / AccessibilityUtils），不做框架迁移。  
3. 先解决“最容易出格式问题”的部分：内联 JS。  
4. 每次拆分都以现有自动化测试全绿为验收标准。  

---

## 4. 为什么先拆脚本而不是整体重构
当前前端的问题不是“功能完全不可用”，而是：
- 单文件过大
- HTML / CSS / JS 混写
- 模板化历史代码较多
- 局部 patch 时容易出现括号、引号、缩进问题

因此本轮最划算的做法不是重写，而是先把高风险内联脚本抽出去，获得：
- 可直接 `node --check` 的脚本文件
- 更小的 patch 范围
- 更清晰的功能边界
- 更低的增量改动风险

---

## 5. 当前收益
- 后续修改壳层、首页、路线规划页、设置页时，不再需要在大 HTML 文件里同时处理长段脚本。
- 页面级功能逻辑已经有明确落点：
  - 壳层逻辑 -> `shell-page.js`
  - 首页逻辑 -> `home-page.js`
  - 路线规划页逻辑 -> `route-list-page.js`
  - 设置页逻辑 -> `accessibility-settings-page.js`
- 本轮拆分后，现有 20 条自动化回归测试全部通过。

---

## 6. 后续建议
### 6.1 下一阶段可继续拆的内容
- `src/main/resources/front/front/pages/gongjiaoluxian/map.html`
  - 当前仍是路线相关前端最大的页面热点之一，内联逻辑和地图交互耦合度高
- `src/main/resources/front/front/js/accessibility.js`
  - 仍是高风险大文件，后续可按播报、主题、配置、设备诊断继续切
- `src/main/resources/front/front/css/transit-business-ui.css`
  - 已经做过第一刀，但体量仍大，适合继续按页面域拆
- `src/main/resources/admin/admin/public/js/transit-admin-sidebar-dom.js`
  - 后台菜单 DOM 与交互脚本仍偏长
- `src/main/resources/admin/admin/public/css/transit-admin-theme.css`
  - 后台主题已独立，但仍有继续按 layout / module / token 细分的空间
- `RoutePlanningServiceImpl` 剩余两块目标职责：
  - `RouteAccessibilityScoringService`
  - `RoutePlanViewMapper`
- `detail.html` 当前脚本逻辑仍是内联，可作为后续“页面脚本继续下沉”的候选

### 6.2 暂不做的事
- 暂不迁移到 Vue SFC / Vite / React
- 暂不进行全面样式重写
- 暂不进行目录级大重构

原因：当前主待办仍以“无障碍系统逻辑自洽和可用性”优先，结构优化只做最影响稳定性的那一层。

### 6.3 当前拆分进度估算（2026-03-16）
- **后端 RoutePlanningService 主线：约完成 50%**
  - 蓝图里原定 4 个目标职责块；
  - 当前已完成 2 个：`RouteStationMatchService`、`RouteCandidateQueryService`；
  - 剩余 2 个：`RouteAccessibilityScoringService`、`RoutePlanViewMapper`。
- **`RoutePlanningServiceImpl` 体量压降：已完成约 28%**
  - 约 `1364` 行 → 约 `983` 行；
  - 现在已明显更接近编排层，但还没完全收口。
- **前端高风险热点：约完成 55% 左右**
  - 已做：壳层/首页/路线页/设置页脚本拆分、路线页 CSS 第一刀、后台运行时资源收口、路线详情页结构收口；
  - 未做：地图页大文件、`accessibility.js`、全局大 CSS 继续拆分、后台主题/侧栏脚本细分。
- 这个比例是为了帮助答辩和后续排期，不是精确工程度量；实际优先级仍以“演示稳定 + 改动风险”排序。
