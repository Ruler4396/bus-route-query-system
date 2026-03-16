# RoutePlanningServiceImpl 拆分蓝图（Phase 2A）

最后更新：2026-03-16  
票据：`CHG-20260316-621`

## 1. 背景
## 1.1 当前阶段进度（2026-03-16 · Phase 2C）
- 已新增：
  - `src/main/java/com/service/RouteStationMatchService.java`
  - `src/main/java/com/service/impl/RouteStationMatchServiceImpl.java`
- 已迁出职责：
  - `buildOrderedStations`
  - `matchesStationName`
  - `matchesRouteStation`
  - `findTransferStation`
  - `findBestMatchingStationName`
  - `resolveMatchType`
- 当前仍留在 `RoutePlanningServiceImpl` 的相关逻辑：
  - `resolveTravelPath`（当前只保留轻量编排）
  - 评分、治理提示、分段映射与推荐文案逻辑
- 本轮目标是先把**站点匹配类纯逻辑**从超大类中拿出来，作为后续继续抽 `RouteCandidateQueryService` 的落脚点。

- Phase 2A 建蓝图时，`src/main/java/com/service/impl/RoutePlanningServiceImpl.java` 约 `1364` 行；截至 Phase 2C 第一刀后约 `1241` 行，仍承担输入归一化、候选路线筛选、一次换乘组合、无障碍过滤/打分、提示文案拼装与前端输出映射等多类职责。
- 这会导致：
  - 单个类改动面过大
  - 定位问题时需要跨越多段逻辑
  - 单测与回归边界不清晰
  - 小调整容易影响整条规划链路

## 1.2 当前阶段进度（2026-03-16 · Phase 2D）
- 已新增：
  - `src/main/java/com/service/RouteCandidateQueryService.java`
  - `src/main/java/com/service/impl/RouteCandidateQueryServiceImpl.java`
- 已迁出职责：
  - `getAllPossibleRoutes(...)`
  - 直达候选筛选
  - 一次换乘候选组合
  - 合成换乘路线 `buildTransferRoute(...)`
  - 合成路线坐标/轨迹/字段拼装 helper
- 当前 `RoutePlanningServiceImpl` 约 `983` 行，已不再直接依赖 `GongjiaoluxianService`；候选查询层与站点匹配层已有独立类边界。

## 2. 拆分目标
本轮先**定边界，不立即大重构业务行为**，后续按“保持接口不变、内部逐步迁移”的方式拆分。

### 目标结构
1. `RouteStationMatchService`
   - 负责输入站点归一化
   - 负责别名匹配 / 关键词匹配 / 最近站点匹配
   - 负责输出统一的 `ResolvedStationSelection`

2. `RouteCandidateQueryService`
   - 负责直达路线候选提取
   - 负责一次换乘候选组合
   - 负责中转节点搜索

3. `RouteAccessibilityScoringService`
   - 负责无障碍字段完整度、适配画像、风险提示和可信度评分
   - 负责“拒绝 / 降级 / 通过”的决策状态

4. `RoutePlanViewMapper`
   - 负责把内部候选对象映射成前台 `route/plan` 输出结构
   - 负责分段文案、首末段提示、风险文案与标签拼装

5. `RoutePlanningServiceImpl`
   - 仅保留 orchestration（编排）职责
   - 负责串联 station match → candidate query → scoring → mapper

## 3. 推荐拆分顺序
### Step 1：先抽纯函数/工具段
- 坐标解析
- 站点 JSON 解析
- 距离计算
- 文案小工具

### Step 2：抽站点匹配
- 以不改 controller/service 接口为前提
- 先把“输入 -> 匹配站点”挪到 `RouteStationMatchService`
- **状态：已完成第一刀（Phase 2C）**

### Step 3：抽候选查询
- 先抽“直达候选”
- 再抽“一次换乘候选”
- **状态：已完成第一刀（Phase 2D）**

### Step 4：抽评分与输出映射
- 先把决策状态与风险提示迁出
- 最后把前台结构映射迁出

## 4. 风险控制
- 保持 `RoutePlanningController` 与现有 API 出参不变
- 每一步拆分后都跑：
  - 典型查询：`东山署前路总站 -> 珠江医院`
  - 典型查询：`中山图书馆 -> 南石西地铁棣园站总站`
  - `scripts/single-demo-smoke.sh`
- 每一步仅迁移一类职责，不同时改评分规则与查询规则

## 5. 验收口径
拆分完成后，应满足：
- `RoutePlanningServiceImpl.java` 降到约 `400~600` 行以内
- 匹配 / 查询 / 评分 / 映射具备独立类边界
- 单次需求改动不再同时触碰整条规划链路
