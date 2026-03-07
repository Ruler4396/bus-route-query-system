# PJT-0001 · FRONTEND_STRUCTURE_NOTES

最后更新：2026-03-07  
状态：**S01 前端高风险页面脚本拆分已完成**

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
- `map.html` 的内联脚本
- 列表页的重复样式块
- 公告/友情链接/留言页的重复分页逻辑
- 路线页中评分解释与摘要渲染逻辑，进一步抽成专用模块

### 6.2 暂不做的事
- 暂不迁移到 Vue SFC / Vite / React
- 暂不进行全面样式重写
- 暂不进行目录级大重构

原因：当前主待办仍以“无障碍系统逻辑自洽和可用性”优先，结构优化只做最影响稳定性的那一层。
