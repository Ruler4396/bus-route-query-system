# 无障碍公交查询与推荐系统的设计与实现（论文初稿）

> 文档类型：毕业论文初稿（按项目现状与代码结构生成）  
> 项目基线：`bus-route-query-system` / GitHub `main` / 提交基线 `804f1b6`  
> 生成日期：2026-03-17  
> 说明：本稿已经按“学术论文常见结构”组织，但**封面、页眉页脚、学校模板、参考文献著录格式、图表编号、致谢**仍需按学院要求二次整理。
>
> 2026-03-25 补充说明：论文“第4章 系统设计（或系统设置）”与“第5章 系统实现”的补写稿已单独整理到 `docs/THESIS_SYSTEM_DESIGN_IMPLEMENTATION_20260325.md`，其中图示均使用 Mermaid，便于直接导出到论文或答辩材料中。

---

## 题目页（学校模板信息占位）

- 论文题目：无障碍公交查询与推荐系统的设计与实现
- 英文题目：Design and Implementation of an Accessible Bus Query and Recommendation System
- 学校：`[学校名称]`
- 学院：`[学院名称]`
- 专业：`[专业名称]`
- 学生姓名：`[姓名]`
- 学号：`[学号]`
- 指导教师：`[指导教师姓名]`
- 完成日期：`[日期]`

---

# 摘要

随着城市老龄化程度的不断加深，以及无障碍交通服务需求的持续增长，传统公交查询系统仅关注“是否存在可乘坐线路”这一单一目标，难以有效回答轮椅用户、行动不便用户与低视力用户在真实出行过程中最关心的关键问题，例如站点是否可达、上下车是否方便、换乘节点是否具备电梯或坡道、终点入口是否可进入，以及当前推荐结果的数据是否可信等。针对上述问题，本文结合毕业设计项目 `bus-route-query-system` 的实际代码实现，设计并实现了一套面向无障碍场景的公交查询与推荐系统。

本系统以 Spring Boot、MyBatis-Plus、MySQL 为后端基础，以 Vue2、Layui、jQuery 和静态页面脚本为前端实现方式，并结合高德地图 API、Leaflet 双引擎显示、WebSocket 实时推送、Web Speech API 语音播报以及 OSM / Overpass、开放广东等外部开放数据源，构建了集“用户画像识别、路线候选筛选、无障碍评分推荐、风险提示、分段解释、地图展示、留言反馈、后台运营管理”于一体的无障碍公交出行原型系统。系统首轮服务对象聚焦于轮椅 / 行动不便用户与低视力用户，试点范围冻结在广州老城区公共服务走廊，以提升系统结论的可解释性与可信度。

在算法设计方面，本文提出了基于“路线基础信息—站点可达性—用户画像匹配”三层规则的无障碍评分模型，并引入“置信度—风险提示—拒绝/降级推荐”机制，使系统在数据不足时不再盲目输出看似可行的路线。同时，系统将公交出行过程拆分为起点步行段、上车站可达性、乘车段、换乘段、下车站可达性、终点步行段等多个环节，形成可解释的分段化建模结果，从而提高路线结果的透明度与可用性。

从工程实现角度看，项目当前包含 17 个控制器、19 个服务接口、19 个服务实现、14 个数据访问对象、13 张业务数据表、24 个运维与部署脚本以及 26 条前端自动化回归测试用例。围绕系统可维护性，项目已完成对路线规划核心大类 `RoutePlanningServiceImpl` 的阶段性拆分，将站点匹配与候选路线查询能力分别抽离为独立服务，减少了复杂逻辑集中在单一类中的维护风险。

综合实现结果表明，本文所设计的系统不仅能够完成常规公交查询与地图展示，更能够围绕特定无障碍用户的真实出行决策，给出面向画像的推荐结果、分段解释、风险说明、数据来源与更新时间提示，较传统模板型公交查询系统具备更强的无障碍导向性、可解释性与演示落地价值。

**关键词：** 无障碍公交；路线推荐；用户画像；分段解释；置信度评估；系统设计与实现

---

# Abstract

With the accelerating trend of urban aging and the increasing demand for accessible transportation services, conventional bus query systems mainly focus on whether a bus line exists between two points, while failing to answer key questions raised by wheelchair users, people with mobility impairments, and users with low vision. These questions include whether the boarding station is accessible, whether transfer facilities such as elevators or ramps are available, whether the destination entrance is reachable, and whether the recommended result is reliable enough for actual travel.

To address these issues, this thesis designs and implements an accessible bus query and recommendation system based on the real project code of `bus-route-query-system`. The system adopts Spring Boot, MyBatis-Plus, and MySQL on the backend, and uses Vue2, Layui, jQuery, and page-level JavaScript modules on the frontend. It integrates AMap and Leaflet dual map engines, WebSocket-based simulated real-time vehicle updates, Web Speech API, and external open data sources including OSM / Overpass and Open Guangdong.

The proposed system is not intended to provide a generic bus query service for all scenarios. Instead, it narrows the first-stage target users to wheelchair / mobility-impaired users and low-vision users, and limits the pilot scope to the public-service corridor of Guangzhou’s old urban area. A rule-based accessible recommendation model is introduced, which combines route-level accessibility, station-level accessibility, and user-profile matching. In addition, a confidence-and-risk mechanism is incorporated so that the system may degrade or reject recommendations when critical accessibility evidence is missing.

Another key contribution of the system lies in segment-based travel explanation. Instead of only returning a bus line name, the system decomposes a trip into origin walking, boarding accessibility, ride segment, transfer segment, alighting accessibility, and destination walking. This design improves interpretability and aligns the system with the actual decision-making logic of accessible public transit travel.

From the software engineering perspective, the current codebase contains 17 controllers, 19 service interfaces, 19 service implementations, 14 DAO files, 13 business tables, 24 operation scripts, and 26 frontend UI regression tests. The route planning core has also been partially refactored by extracting station matching and route candidate query services from the previously oversized planning service.

The implementation results show that the system not only supports regular route query and map visualization, but also provides profile-oriented recommendation, segmented explanation, risk disclosure, and data transparency, which makes it more suitable for accessible transit scenarios than traditional template-based bus information systems.

**Key Words:** accessible transit; bus recommendation; user profile; segment-based explanation; confidence evaluation; system design and implementation

---

# 目录（初稿版）

- 第1章 绪论
- 第2章 需求分析与相关技术
- 第3章 系统总体设计
- 第4章 系统详细设计与代码结构
- 第5章 系统创新点与关键实现
- 第6章 系统测试与结果分析
- 第7章 结论与展望
- 参考文献
- 附录A 项目代码结构摘要
- 附录B 核心接口与关键脚本

---

# 第1章 绪论

## 1.1 研究背景

随着信息技术和智慧交通系统的发展，公交查询系统已经成为城市居民日常出行的重要工具。然而现有多数公交查询平台主要面向一般用户，核心目标通常是“更快到达”或“更短距离”，对于特殊群体的真实无障碍需求考虑不足。对于轮椅 / 行动不便用户而言，公交出行并不只是“坐哪一条线路”的问题，更关键的是：能否到达站点、是否存在台阶、换乘是否具备电梯或坡道、候车和上下车是否安全。对于低视力用户而言，真正影响体验的也不只是线路本身，还包括界面可读性、盲道信息、语音播报支持、错误提示显著性等。

因此，传统公交查询系统在无障碍场景下往往存在两个根本不足：第一，缺乏面向特定障碍类型的差异化判断机制；第二，即使给出推荐结果，也很少说明风险边界与数据可信度。这种“只给答案、不解释过程”的方式，在普通场景下尚可接受，但在无障碍场景下可能直接影响用户出行安全与决策质量。

## 1.2 研究意义

本文研究的意义主要体现在以下几个方面：

1. **现实应用意义。** 项目尝试将无障碍需求从“界面层优化”进一步推进到“路线推荐逻辑层优化”，提升公交信息系统对特殊群体的适配程度。
2. **教学与答辩意义。** 该系统能够展示从需求分析、数据库设计、前后端实现、外部接口接入、自动化测试到运维脚本治理的完整工程链路，适合作为毕业设计的综合性项目。
3. **方法探索意义。** 本文提出的“画像驱动推荐 + 分段解释 + 置信度治理”的思路，不仅适用于公交场景，也可为其他无障碍信息系统设计提供参考。
4. **工程实践意义。** 项目在真实代码中落实了服务拆分、脚本化部署、回归测试与运行守护，体现了毕业设计从“能运行”走向“可维护、可演示、可解释”的改进方向。

## 1.3 现有问题分析

从项目实际目标出发，当前同类系统或常规模板型毕业设计常见问题可以概括为以下几类：

1. **面向普通用户的单一排序。** 大部分系统只考虑时间和距离，而忽略用户障碍类型导致的出行约束差异。
2. **结果黑盒化。** 推荐结果只给出某一条线路，未说明为什么推荐、是否存在风险、哪些信息仍待核实。
3. **步行段和换乘段缺失。** 普通系统更关注公交线路本身，而无障碍场景最关键的痛点往往集中在“最后一百米”。
4. **数据来源边界不清。** 开放数据、人工样本、项目内置字段混合使用时，如果没有可信度表达，系统结果容易被误解为“已完全核验”。
5. **项目代码结构混杂。** 前端大文件、后端单类职责过多等问题，会严重影响后续维护与答辩阐述的清晰度。

## 1.4 本文研究内容

围绕上述问题，本文完成的主要工作如下：

1. 明确首轮目标用户为**轮椅 / 行动不便用户**与**低视力用户**，并冻结试点范围为广州老城区公共服务走廊；
2. 设计包含路线基础信息、站点无障碍信息、用户画像匹配的三层评分模型；
3. 引入置信度评分、风险提示、降级推荐与拒绝推荐机制；
4. 将路线结果拆解为步行、上下车、乘车、换乘、到达等多个解释性分段；
5. 实现高德与 Leaflet 双引擎地图展示、ETA 估算与 WebSocket 实时位置推送；
6. 构建留言反馈与后台运营模块，形成基础闭环；
7. 对核心路线规划服务进行结构拆分，并通过自动化测试与运维脚本提高系统稳定性。

## 1.5 论文结构安排

本文共分为七章：

- 第1章介绍研究背景、意义、问题与研究内容；
- 第2章分析系统需求，并说明所采用的主要开发技术；
- 第3章给出系统总体架构、数据库设计与核心推荐模型；
- 第4章结合项目代码，对前后端模块结构和实现方式进行详细说明；
- 第5章总结本项目的主要创新点与关键实现策略；
- 第6章给出测试方案、结果分析与代码结构评估；
- 第7章总结全文并给出后续改进方向。

---

# 第2章 需求分析与相关技术

## 2.1 目标用户与试点范围分析

根据项目文档 `TARGET_USER_SCOPE.md` 与 `PILOT_SCOPE.md`，系统首轮服务边界并非“全量用户 + 全量城市”，而是采用“先收边界、再做可信闭环”的策略：

### 2.1.1 目标用户范围

1. **主服务人群：轮椅 / 行动不便用户**  
   包括轮椅使用者、拐杖和助行器使用者、老年行动迟缓人群等，对台阶、长距离步行、复杂换乘敏感。
2. **次服务人群：低视力用户**  
   更关注高对比、大字号、语音播报、盲道支持和信息层级清晰度。
3. **基础支持但不作为首轮核心优化对象的人群：听障用户、全盲 / 重度视障用户、多重障碍组合用户。**

### 2.1.2 试点区域范围

项目试点冻结为广州老城区公共服务走廊，主要覆盖：

- 越秀东段：东山署前路、东山龟岗、中山医、烈士陵园、农讲所一带；
- 越秀西段与老城核心：西门口、人民中路、海珠广场、文化公园一带；
- 荔湾东段：上九路、恩宁路、如意坊、芳村隧道口一带；
- 海珠西北段：凤凰新村、珠江医院、纸厂地铁燕岗站、南石路地铁棣园站一带。

这一范围选择与项目已收集线路及人工样本基础一致，有利于形成“可信而非泛化”的演示闭环。

## 2.2 功能需求分析

### 2.2.1 前台功能需求

1. 用户登录、注册、个人中心与无障碍设置；
2. 公交线路列表查询、条件筛选与推荐方案生成；
3. 地点关键词输入、站点匹配、地图选点与起终点交换；
4. 路线结果展示，包括推荐理由、风险提示、数据来源、更新时间、置信度、步行距离与总耗时；
5. 地图页展示线路轨迹、站点、实时车辆位置、ETA 与分段化说明；
6. 留言、收藏、公告查看、外部资源查看等辅助功能。

### 2.2.2 后台功能需求

1. 用户信息管理；
2. 公交路线信息管理；
3. 网站公告与友情链接管理；
4. 留言与互动内容处理；
5. 展示配置与基础运营管理。

### 2.2.3 无障碍专项需求

1. 不同用户画像下权重应不同；
2. 关键无障碍信息缺失时，应允许系统降级或拒绝推荐；
3. 页面需支持高对比度、大字号、焦点高亮、语音播报、键盘访问；
4. 推荐结果应具备解释性，而不是单纯返回线路名。

## 2.3 非功能需求分析

1. **可用性要求：** 前台主要演示路径应操作流畅，首屏信息清晰；
2. **可维护性要求：** 后端路线规划逻辑与前端页面脚本应逐步拆分，避免超大文件持续膨胀；
3. **可靠性要求：** 演示环境在单实例部署条件下应具备一键部署、状态检查与健康守护能力；
4. **可扩展性要求：** 地图引擎与外部数据接口应支持替换或降级；
5. **可测试性要求：** 关键前台交互链路应具备自动化回归用例。

## 2.4 关键技术选型

### 2.4.1 Spring Boot

Spring Boot 用于搭建后端服务框架，负责控制器、服务层、配置、拦截器、定时任务以及 WebSocket 处理等。该框架适合快速构建中小型毕业设计系统，并便于统一接口风格。

### 2.4.2 MyBatis-Plus 与 MySQL

MyBatis-Plus 负责实体、DAO 与分页查询的快速实现；MySQL 用于存储用户信息、公交线路、站点无障碍信息、公告、留言、收藏、令牌等核心业务数据。项目当前核心业务数据表共 13 张。

### 2.4.3 Vue2 + Layui + jQuery 页面模式

项目前端并非完整 SPA，而是使用 Vue2、Layui、jQuery 与静态页面脚本组合实现。该方案与原始模板系统兼容性较强，适合在现有毕业设计项目基础上做增量重构。为了提升可维护性，项目已将多个页面的内联脚本下沉为独立 JS 文件。

### 2.4.4 高德地图与 Leaflet 双引擎

系统以高德地图作为主显示引擎，并保留 Leaflet 作为降级兜底。该双栈方案能够兼顾演示效果与可用性：当高德加载失败或受环境限制时，Leaflet 仍可提供基础地图与站点展示能力。

### 2.4.5 WebSocket 与 ETA 模型

WebSocket 用于向地图页持续推送车辆位置，ETA 模块结合剩余距离、时段路况和停靠时间等要素估算到站时间，提升系统动态展示能力。

### 2.4.6 外部开放数据接入

项目通过 `AccessibilityExternalDataServiceImpl` 接入 OSM / Overpass 与开放广东，用于补充开放数据摘要、资源目录和数据治理元信息，不直接替代项目内置结构化数据。

## 2.5 可行性分析

1. **技术可行。** 所采用技术均成熟稳定，且项目代码已验证可运行；
2. **数据可行。** 项目内已有路线、站点与人工试点样本，可支持演示级闭环；
3. **实现可行。** 系统已具备完整前后台与自动化回归基础；
4. **答辩可行。** 项目既有界面展示能力，也有足够的代码结构与工程细节可用于论文阐述。

---

# 第3章 系统总体设计

## 3.1 系统总体架构设计

本系统采用前后端分离的分层架构，总体可划分为用户交互层、前端业务层、后端服务层、数据层与外部接口层。其逻辑结构如下所示：

```text
┌────────────────────────────────────────────┐
│                用户交互层                  │
│ 首页 / 路线规划 / 地图导航 / 留言反馈 / 后台 │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│                前端业务层                  │
│ shell-page / route-list-page / map.html   │
│ accessibility-settings / admin components │
└────────────────────────────────────────────┘
                    │ HTTP / WebSocket
                    ▼
┌────────────────────────────────────────────┐
│                后端服务层                  │
│ Controller → Service → DAO → Entity       │
│ 路线规划 / 地图接口 / 实时推送 / 留言处理    │
└────────────────────────────────────────────┘
          │                    │
          ▼                    ▼
┌──────────────────┐   ┌──────────────────────┐
│   MySQL 数据层   │   │   外部开放数据与地图层 │
│ 线路/站点/用户等 │   │ 高德 / OSM / OpenGD   │
└──────────────────┘   └──────────────────────┘
```

该架构既保留了传统 CRUD 系统的清晰层次，又为无障碍推荐、地图可视化和外部数据治理提供了扩展空间。

## 3.2 功能模块设计

### 3.2.1 用户与画像模块

该模块负责系统用户登录、注册、个人中心与无障碍偏好设置。其中用户实体 `yonghu` 增加了障碍等级、辅助工具、语音播放、高对比度、字体大小、键盘导航、触觉反馈和偏好路线类型等字段，为后续画像驱动推荐提供数据基础。

### 3.2.2 路线数据与站点数据模块

核心表 `gongjiaoluxian` 存储路线编号、路线名称、起终点、站点列表、轨迹、无障碍设施字段等；`zhandian_wuzhangai` 存储站点级无障碍信息，包括无障碍等级、升降台 / 坡道、盲道、候车座椅、厕所与临停接驳等。两者共同构成无障碍推荐的主要结构化数据来源。

### 3.2.3 路线推荐与评估模块

该模块是系统核心，主要任务为：

1. 根据起点和终点匹配候选路线；
2. 识别一次换乘可能性；
3. 根据用户画像计算无障碍评分；
4. 生成总分、推荐理由、风险提示与分段说明；
5. 对关键数据不足的路线进行降级或拒绝。

### 3.2.4 地图与导航模块

地图模块负责展示路线轨迹、站点、实时车辆位置、ETA 与无障碍信息，并支持高德与 Leaflet 双引擎切换。前端地图页以高德为主，当关键 API 不可用时可回退至 Leaflet，保证系统仍可演示。

### 3.2.5 留言反馈与后台运营模块

通过 `messages` 表、前台留言页和后台留言处理页，系统能够记录用户对路线不准确、设施异常、入口信息缺失、页面可用性等问题的反馈，形成轻量级运营闭环。

## 3.3 数据库设计

根据 `schema-demo.sql`，项目核心业务数据表为 13 张，其中与论文主题关系最紧密的主要表如表 3-1 所示。

### 表3-1 核心业务表设计摘要

| 表名 | 主要作用 | 关键字段 |
|---|---|---|
| `users` | 后台管理员账号 | `username`、`password`、`role` |
| `yonghu` | 前台用户与画像信息 | `zhangaijibie`、`fuzhugongju`、`gaoduibidu`、`preference_route_type` |
| `gongjiaoluxian` | 公交线路主表 | `luxianmingcheng`、`tujingzhandian`、`zhandianzuobiao`、`luxianguiji`、`wuzhangaisheshi` |
| `zhandian_wuzhangai` | 站点无障碍表 | `wuzhangaijibie`、`shengjiangtai`、`mangdao`、`zuoweishu`、`cesuo` |
| `messages` | 用户留言与处理记录 | `feedback_type`、`severity_level`、`handle_status`、`review_notes` |
| `wangzhangonggao` | 公告内容 | `biaoti`、`jianjie`、`neirong` |
| `youqinglianjie` | 外部资源链接 | `lianjiemingcheng`、`lianjie` |
| `token` | 登录令牌 | `userid`、`tablename`、`role`、`token` |
| `storeup` | 收藏信息 | `userid`、`refid`、`tablename` |

从数据库设计可以看出，本项目并非只停留在路线表与用户表两张核心表，而是已经围绕“路线—站点—画像—反馈—运营”形成完整的业务链条。

## 3.4 无障碍推荐模型设计

### 3.4.1 三层评分模型

在后端 `RoutePlanningServiceImpl` 中，无障碍评分由三类规则共同组成：

1. **路线基础规则（routeLevel）**：依据路线无障碍等级、设施说明等路线级字段；
2. **站点规则（station）**：依据上落车站点无障碍水平；
3. **用户匹配规则（userMatch）**：依据不同用户画像对无障碍信息的偏好差异。

其总体形式可表示为：

\[
S_{acc}=\frac{\sum_{i=1}^{n} w_i \cdot s_i}{\sum_{i=1}^{n} w_i}
\]

其中，\(s_i\) 分别表示路线级、站点级和画像匹配级得分，\(w_i\) 表示对应权重。

### 3.4.2 画像驱动权重调整

与普通公交推荐只采用统一权重不同，本系统根据用户画像动态切换权重配置：

| 用户画像 | 路线级权重 | 站点级权重 | 画像匹配权重 |
|---|---:|---:|---:|
| 通用访客 | 0.40 | 0.30 | 0.30 |
| 轮椅 / 行动不便 | 0.22 | 0.34 | 0.44 |
| 低视力 | 0.18 | 0.37 | 0.45 |
| 听障（文本优先） | 0.24 | 0.22 | 0.54 |
| 多重障碍 | 0.20 | 0.35 | 0.45 |

可以看出，轮椅 / 行动不便与低视力用户都显著提高了“用户匹配规则”的权重，这体现了本系统“围绕具体用户而不是围绕统一线路”的设计思想。

### 3.4.3 综合总分模型

在获得无障碍评分后，系统还结合时间与距离启发式得分生成总分：

- 无障碍优先：`0.72 × 无障碍分 + 0.12 × 时间分 + 0.16 × 距离分`
- 时间优先：`0.35 × 无障碍分 + 0.50 × 时间分 + 0.15 × 距离分`
- 距离优先：`0.35 × 无障碍分 + 0.50 × 距离分 + 0.15 × 时间分`
- 智能推荐：`0.55 × 无障碍分 + 0.20 × 时间分 + 0.25 × 距离分`

该设计使系统既能体现无障碍核心价值，又保留常规出行软件对时间和距离的考量方式。

## 3.5 风险提示与置信度设计

### 3.5.1 置信度机制

系统并非只计算路线分数，还会依据路线等级、设施说明、语音播报、盲道支持、换乘设施、数据更新时间以及数据来源等字段计算置信度等级，并输出“高 / 中 / 低”三档提示。

### 3.5.2 决策状态机制

为防止系统在数据不足时给出误导性推荐，后端设置了三种决策状态：

- `READY`：关键信息相对完整，可优先查看；
- `DEGRADED`：可作为候选，但关键数据需进一步核对；
- `REJECTED`：关键无障碍信息不足，不直接推荐。

该机制保证了系统在无障碍场景下遵循“宁可谨慎，也不装懂”的原则。

## 3.6 分段建模设计

本系统将出行过程拆分为 6 类主要分段：

1. `origin_walk`：出发步行段；
2. `boarding_access`：上车站可达性；
3. `ride_segment`：公交乘车段；
4. `transfer_segment`：换乘段；
5. `alighting_access`：下车站可达性；
6. `destination_walk`：到达步行段。

分段建模的意义在于：无障碍出行的真正难点，通常集中在公交线路之外的接驳和换乘环节。通过分段结构，系统可以把风险分散到具体阶段中表达，而不是笼统地说“这条线可以”或“不可以”。

---

# 第4章 系统详细设计与代码结构

## 4.1 后端代码结构设计

根据项目当前代码统计，后端主要结构如下：

- 控制器：17 个
- 服务接口：19 个
- 服务实现：19 个
- DAO：14 个
- 实体类：14 个
- Mapper XML：14 个

后端目录结构可概括为：

```text
src/main/java/com
├─ annotation        # IgnoreAuth 等注解
├─ config            # WebSocket、调度器、拦截器配置
├─ controller        # 17 个控制器，负责接口入口
├─ dao               # 数据访问层
├─ entity            # 实体、VO、View、Model
├─ interceptor       # Token 权限拦截器
├─ service           # 业务接口定义
│  └─ impl           # 业务实现类
├─ utils             # 工具类
└─ websocket         # 实时车辆推送处理器
```

### 4.1.1 控制器层设计

项目控制器中与论文主题关系最密切的包括：

1. **`RoutePlanningController`**：提供 `/route/plan`、`/route/plan/summary` 等接口，负责聚合推荐结果、风险提示和推荐摘要；
2. **`MapController`**：提供路线地图数据、站点数据、ETA、以及高德驾车路径、地理编码、逆地理编码接口；
3. **`MessagesController`**：提供前后台留言查询、更新、删除等接口；
4. **`AccessibilityTtsController`**：负责与语音播报相关的后端支持；
5. **`UserController` / `YonghuController`**：分别对应后台管理员和前台用户的登录与会话管理。

### 4.1.2 服务层设计

服务层是本系统的核心，尤其是路线规划部分。当前关键服务包括：

- `RoutePlanningService`：路线规划总接口；
- `RouteStationMatchService`：站点匹配服务；
- `RouteCandidateQueryService`：候选路线与一次换乘组合服务；
- `AccessibilityExternalDataService`：外部开放数据与治理元数据服务；
- `AmapWebService`：高德 Web 服务封装；
- `GongjiaoluxianService`、`ZhandianWuzhangaiService`：路线和站点数据服务。

### 4.1.3 路线规划核心的结构拆分

项目早期版本中，`RoutePlanningServiceImpl` 一度超过 1300 行，承担了候选路线检索、站点匹配、规则评分、分段构建、推荐文案生成等多项职责。当前项目已按拆分蓝图完成两项核心拆分：

1. **`RouteStationMatchServiceImpl`**：负责构建站点序列、模糊匹配站名、换乘站识别、输入命中类型解析；
2. **`RouteCandidateQueryServiceImpl`**：负责直达路线筛选、一次换乘候选组合、合成换乘路线字段生成与轨迹切片。

这一拆分使 `RoutePlanningServiceImpl` 的体量由约 1364 行下降到当前约 1031 行，逐步向“编排层”靠近，为后续继续抽离评分服务和视图映射服务打下基础。

### 4.1.4 外部数据治理服务设计

`AccessibilityExternalDataServiceImpl` 负责接入 OSM / Overpass 与开放广东，主要功能包括：

- 获取外部连接器元数据；
- 获取 OSM / Overpass 覆盖率摘要；
- 检索开放广东目录资源；
- 读取本地治理规则 JSON；
- 输出数据源、置信度规则和试点样本摘要。

这一设计的重要价值在于，系统并不把外部开放数据直接视为“已核验真值”，而是将其纳入治理层，为前端展示“数据来源”和“可信度边界”提供支持。

### 4.1.5 地图与实时推送服务设计

`MapController` 与 `VehiclePositionWebSocketHandler` 共同组成地图动态能力：

- `MapController` 提供路线轨迹、站点、ETA 和高德接口代理；
- `VehiclePositionWebSocketHandler` 通过 `ws://.../ws/vehicle?routeId=...` 周期性推送车辆位置；
- `SchedulingConfig` 和 `WebSocketConfig` 负责调度与 WebSocket 注册。

值得指出的是，项目实时推送目前属于“演示级实时能力”，车辆位置按照站点序列进行模拟推进，但从系统接口与前端交互角度看，已经形成了真实的 WebSocket 数据流。

## 4.2 前端代码结构设计

前端资源主要位于 `src/main/resources/front/front` 和 `src/main/resources/admin/admin`。其中前台以页面级脚本为主，后台以 Vue 组件为主。

### 4.2.1 前台页面脚本结构

当前前台关键页面脚本包括：

| 文件 | 行数 | 主要职责 |
|---|---:|---|
| `shell-page.js` | 668 | 壳层导航、iframe 管理、地址栏同步、全局辅助设置同步 |
| `route-list-page.js` | 737 | 路线页编排、分页、方案生成、状态提示、滚动聚焦 |
| `route-list-core.js` | 869 | 站点索引、关键词解析、距离估算、推荐结果映射、方案元数据构建 |
| `route-list-picker.js` | 593 | 地图选点、右键菜单、起终点交换、Amap/Leaflet 选点联动 |
| `home-page.js` | 主页交互 | 首页内容装配 |
| `accessibility-settings-page.js` | 设置页交互 | 高对比、语音、键盘等设置管理 |
| `messages-review-page.js` | 留言看板 | 反馈状态统计与处理保存 |

从结构上看，路线页已经由原先的单一脚本逐步拆分为“编排层 + 逻辑层 + 选点层”，这是项目当前前端可维护性提升最明显的部分。

### 4.2.2 地图页与样式结构

当前地图页 `map.html` 仍然是较大的页面热点文件，约 3612 行，是系统后续继续结构优化的重点目标之一。样式方面：

- `transit-business-ui.css`：前台主要业务样式；
- `transit-route-list.css`：从大样式文件中抽出的路线页局部样式；
- `accessibility-high-contrast.css`：高对比度模式样式；
- `theme.css`、`common.css`：基础主题与公共样式。

### 4.2.3 后台 Vue 组件结构

后台管理页主要组件包括：

- `IndexHeader.vue`：显示项目名、环境标签、当前登录角色、退出登录等；
- `IndexAsideStatic.vue`：提供工作台、账户设置、业务导航等后台菜单结构；
- `IndexMain.vue`：作为后台主舞台区承载 `router-view`；
- `transit-admin-theme.css`：后台统一主题样式，当前约 1439 行；
- `transit-admin-sidebar-dom.js`：后台菜单 DOM 与交互增强脚本，当前约 1080 行。

这些组件和静态资源共同组成了当前后台“线路资料、公告与互动内容统一管理后台”的基础壳层。

## 4.3 前后端交互流程设计

### 4.3.1 路线推荐流程

路线推荐的典型调用链如下：

```text
前端输入起点/终点
→ route-list-core 进行关键词解析 / 站点匹配
→ 请求 /route/plan 或 /route/plan/summary
→ RoutePlanningController 接收参数
→ RouteCandidateQueryService 获取直达/一次换乘候选
→ RoutePlanningServiceImpl 计算评分、置信度、风险和分段
→ 返回推荐列表
→ 前端映射为结果卡和地图入口
```

### 4.3.2 地图页导航流程

```text
用户点击推荐结果
→ 前端将选中方案写入页面状态
→ 跳转地图页
→ 地图页读取 routeId / selection
→ 请求 /map/route/{id}、/map/stations/{id}、/map/eta/{id}
→ 建立 /ws/vehicle WebSocket
→ 渲染轨迹、站点、车辆位置与 ETA
```

### 4.3.3 反馈闭环流程

```text
前台用户提交留言
→ /messages/add 入库
→ 后台留言处理页加载 /messages/page 或 /messages/list
→ 管理员更新 handleStatus / reviewNotes / reply
→ 前台与后台共同形成问题追踪闭环
```

## 4.4 项目工程与运维结构

项目除业务代码外，还包含较完整的工程辅助结构：

- 24 个脚本文件，覆盖构建、部署、状态检查、健康守护、数据重置、资源同步等；
- 26 条 UI 自动化测试，覆盖路由、可访问性、留言、用户中心、后台主题、语音等关键链路；
- 单实例 demo 的启动、部署与健康检查脚本，适合演示环境快速恢复。

这部分内容虽然不属于传统论文中的算法主体，但对毕业设计“能稳定展示”的要求具有重要意义。

---

# 第5章 系统创新点与关键实现

## 5.1 创新点一：冻结服务对象与试点范围，而非空泛地追求“大而全”

本项目最重要的思路之一，是主动缩小系统承诺边界。与常见的“面向所有残障用户、全城市范围可用”的笼统表述不同，本系统在设计阶段即明确：

- 主服务对象为轮椅 / 行动不便用户；
- 次服务对象为低视力用户；
- 首轮试点范围为广州老城区公共服务走廊。

这一做法的创新性在于，它把系统从“概念性展示”推进到“有限范围可信原型”。对于毕业设计而言，这种边界冻结比空泛追求功能全覆盖更具有可验证性和工程现实性。

## 5.2 创新点二：将用户画像真正引入推荐权重，而不是只停留在界面选项层

系统并非只在前端提供一个“服务画像”下拉框，而是将画像直接接入评分权重。例如：

- 轮椅 / 行动不便用户更关注上下车可达性、低地板、坡道、电梯与换乘设施；
- 低视力用户更关注盲道、语音播报、页面高对比度和信息可读性；
- 听障用户则更倾向于文字提示与电子显示能力。

在代码层面，`buildRuleWeightMap` 方法对不同画像返回不同权重配置，说明画像已进入后端核心逻辑，而不是仅存在于前端展示中。

## 5.3 创新点三：采用“分段建模”替代单条线路结果展示

传统公交查询系统通常输出一条线路或若干条线路，而本系统将出行过程拆分为多个阶段，分别描述：

- 起点步行距离是否偏长；
- 上车站是否具备可达条件；
- 乘车段是否具备低地板车、语音播报等支持；
- 换乘是否依赖电梯或坡道；
- 下车后终点入口是否可进入。

这种设计使系统结果更接近无障碍出行用户的真实决策流程，也使论文中对系统“为什么推荐 / 不推荐”的解释更加充分。

## 5.4 创新点四：在推荐结果中显式引入风险提示、数据来源、更新时间与置信度

本系统认为，在无障碍场景中“能给出一个答案”并不等于“答案可信”。因此，系统在每条推荐结果中额外输出：

- `confidenceScore`：置信度；
- `confidenceLevelText`：高 / 中 / 低；
- `riskHints`：风险提示列表；
- `missingDataHints`：缺失数据说明；
- `dataSourceText`：数据来源；
- `dataUpdatedAtText`：数据更新时间。

当关键字段缺失时，系统允许直接给出 `REJECTED` 状态，而不是继续生成“看似合理”的推荐结果。这体现了系统的风险治理意识。

## 5.5 创新点五：地图双引擎与外部开放数据治理相结合

项目并未将地图与开放数据简单叠加，而是采用“高德主显示 + Leaflet 兜底 + OSM / OpenGD 作为治理补充”的策略：

1. 高德提供较好的交互体验和路径服务；
2. Leaflet 在高德不可用时保障基础展示；
3. OSM / Overpass 和开放广东不直接替代真值数据，而是以治理摘要、外部参考和补录线索的形式参与系统。

这种“能力层与治理层分离”的设计，有助于避免开放数据被误认为“已经人工核验”的结论。

## 5.6 创新点六：围绕毕业设计场景进行结构化代码治理

除功能创新外，项目还体现了较强的工程化特色，主要包括：

1. 将路线规划大类按职责拆分；
2. 将路线页前端脚本从单文件拆分为多个页面模块；
3. 增加部署、状态检查、数据重置和健康守护脚本；
4. 形成 26 条 UI 自动化回归测试；
5. 将留言反馈、后台处理、演示数据校准纳入日常开发流程。

这些做法使本项目不只是“功能能跑”，而是逐步具备可维护、可验证、可演示的工程特征。

---

# 第6章 系统测试与结果分析

## 6.1 测试环境

根据项目运行配置，系统采用以下基础环境：

- 操作系统：Linux 服务器环境；
- JDK：Java 17；
- 数据库：MySQL 8；
- Web 框架：Spring Boot；
- 前端：Vue2 + Layui + jQuery；
- 地图：高德 JS API + Leaflet；
- 自动化测试：Playwright；
- 单实例演示端口：8133。

## 6.2 功能测试分析

系统当前已具备较完整的功能链路，主要验证内容包括：

1. 用户注册、登录与个人中心；
2. 公交线路列表加载与推荐方案生成；
3. 地图页轨迹展示、站点展示、车辆推送与 ETA 展示；
4. 公告、收藏、留言与后台运营；
5. 高对比度、语音播报、键盘导航等无障碍功能。

从代码仓库结构统计看，当前 `ui-automation/tests` 下共有 26 条自动化用例，覆盖可访问性、路由、留言、后台主题、移动端语音等多个方向。这说明项目已经不仅仅依赖人工点击验证，而具备基本自动化回归能力。

## 6.3 典型场景验证

### 6.3.1 典型场景一：海珠广场 → 纸厂地铁燕岗站

该场景适合展示系统对不同画像的推荐差异：

- 在轮椅 / 行动不便画像下，系统倾向于选择换乘设施相对清晰的组合方案；
- 在低视力画像下，系统会优先强调盲道、语音播报与页面可读性相关信息。

该场景能够有效说明系统推荐逻辑并非固定，而是与用户画像绑定。

### 6.3.2 典型场景二：中山图书馆 → 南石西地铁棣园站总站

该场景适合展示系统在医院、换乘节点和老城区走廊条件下的路线解释能力，尤其是步行段、换乘段和目标入口段的说明。

## 6.4 无障碍能力分析

从当前实现结果看，系统在无障碍能力方面已经取得以下效果：

1. 页面可支持高对比度、大字号、语音播报与键盘辅助；
2. 路线结果能显式呈现风险提示、推荐理由、数据来源、更新时间和置信度；
3. 下车站和终点步行段不再被忽略，而是进入推荐逻辑和结果表达；
4. 留言与反馈模块使“信息缺失和线路偏差”问题可以被记录和处理。

这些能力说明系统已经从“无障碍外观”迈向“无障碍决策支持”。

## 6.5 代码结构与维护性分析

虽然项目已完成一定程度的结构收口，但从代码体量上看，仍存在若干热点文件：

| 文件 | 当前行数 | 说明 |
|---|---:|---|
| `map.html` | 3612 | 地图页仍较重，是后续拆分重点 |
| `transit-admin-theme.css` | 1439 | 后台主题样式较大 |
| `transit-admin-sidebar-dom.js` | 1080 | 后台菜单交互脚本仍较长 |
| `RoutePlanningServiceImpl.java` | 1031 | 已收缩但仍是后端复杂热点 |
| `route-list-core.js` | 869 | 前台路线页逻辑核心，后续可继续按职责拆分 |

另一方面，路线规划服务已从约 1364 行下降到约 1031 行，说明项目已经从“单类承担全部逻辑”的状态转向“职责逐步分离”的过程，这对毕业设计答辩中的代码结构说明是有帮助的。

## 6.6 当前不足分析

尽管项目已具备较完整的演示能力，但仍存在以下不足：

1. **真正的多换乘图搜索尚未完善。** 当前主要支持直达和一次换乘候选，尚未引入成熟的图论最短路算法；
2. **地图页仍偏大。** `map.html` 体量较大，后续仍需拆分；
3. **实时车辆数据为演示级模拟。** WebSocket 数据流真实存在，但位置推进仍基于站点序列模拟；
4. **盲道与入口数据仍有较多人工样本成分。** 当前不应宣传为全城实地核验结果；
5. **试点范围有限。** 系统目前更适合作为试点型原型，而非全城生产级系统。

---

# 第7章 结论与展望

## 7.1 结论

本文围绕无障碍公交出行这一具体场景，设计并实现了一套面向轮椅 / 行动不便用户和低视力用户的公交查询与推荐系统。与普通公交查询系统相比，本系统并未止步于线路检索和地图展示，而是将用户画像、无障碍评分、分段解释、置信度与风险提示引入推荐主链路，使系统能够更贴近特定用户的真实决策过程。

在系统实现方面，本文完成了用户画像与试点范围冻结、路线与站点数据建模、无障碍评分模型设计、地图与 ETA 展示、留言反馈闭环、后台管理功能实现，并结合项目代码对核心模块进行了工程化重构与测试增强。实践结果表明，该系统具备较好的展示完整性、逻辑自洽性与答辩说明性，能够作为一个具有明确创新点和代码结构支撑的毕业设计项目。

## 7.2 展望

后续工作可从以下几个方向继续完善：

1. 引入基于图模型的多换乘路径规划算法，提高复杂出行场景下的推荐能力；
2. 继续扩大人工试点核验范围，补齐站点入口、坡道、盲道与换乘设施数据；
3. 将 `RoutePlanningServiceImpl` 继续拆分为评分服务与视图映射服务；
4. 对地图页和后台主题资源继续做结构拆分，降低单文件复杂度；
5. 为全盲 / 重度视障用户引入更细粒度的步行导航和连续无障碍路径支持；
6. 在真实公交接口接入条件允许的情况下，将实时数据由模拟推进升级为真实车辆位置与真实 ETA。

综上，本文所实现的系统已经具备从毕业设计原型向更高可信度无障碍交通应用演进的基础。

---

# 参考文献（初稿占位版）

> 说明：以下参考文献为初稿版清单，正式提交前应按学校要求统一改为 GB/T 7714 或学院指定格式，并补齐访问日期、版本号、出版信息或 DOI。

[1] W3C. Web Content Accessibility Guidelines (WCAG) 2.1[S]. 2018.  
[2] Spring Team. Spring Boot Reference Documentation[EB/OL].  
[3] MyBatis-Plus Team. MyBatis-Plus Documentation[EB/OL].  
[4] 高德开放平台. 高德地图 Web 服务 API 文档[EB/OL].  
[5] OpenStreetMap Wiki. OpenStreetMap / Overpass API Documentation[EB/OL].  
[6] 广东省政务数据开放平台. 开放广东数据资源目录文档[EB/OL].  
[7] 城市公共交通无障碍服务与可达性研究相关中文论文文献[待按学校模板补齐].  
[8] 公共交通路径规划、多目标推荐与出行决策支持相关中文论文文献[待按学校模板补齐].

---

# 附录A 项目代码结构摘要

## A.1 项目目录摘要

```text
bus-route-query-system
├─ README.md
├─ pom.xml
├─ scripts/                     # 构建、部署、状态检查、数据重置、守护脚本
├─ ui-automation/tests/         # 26 条前端回归测试
├─ src/main/java/com/
│  ├─ controller/               # 17 个控制器
│  ├─ service/                  # 19 个服务接口
│  ├─ service/impl/             # 19 个服务实现
│  ├─ dao/                      # 14 个 DAO
│  ├─ entity/                   # 14 个实体与相关 VO/View
│  ├─ config/                   # WebSocket、调度、拦截器配置
│  ├─ interceptor/              # Token 鉴权拦截器
│  ├─ websocket/                # 实时推送处理器
│  └─ utils/                    # 工具类
└─ src/main/resources/
   ├─ application.yml
   ├─ schema-demo.sql
   ├─ data-demo.sql
   ├─ mapper/
   ├─ front/front/              # 前台页面与脚本
   └─ admin/admin/              # 后台页面与资源
```

## A.2 当前高风险热点文件

- `src/main/resources/front/front/pages/gongjiaoluxian/map.html`
- `src/main/java/com/service/impl/RoutePlanningServiceImpl.java`
- `src/main/resources/admin/admin/public/css/transit-admin-theme.css`
- `src/main/resources/admin/admin/public/js/transit-admin-sidebar-dom.js`

---

# 附录B 核心接口与关键脚本

## B.1 代表性接口

| 接口 | 方法 | 说明 |
|---|---|---|
| `/route/plan` | GET | 生成无障碍推荐路线 |
| `/route/plan/summary` | GET | 返回推荐摘要与语音友好信息 |
| `/map/route/{id}` | GET | 获取路线地图数据 |
| `/map/stations/{id}` | GET | 获取站点坐标数据 |
| `/map/eta/{id}` | GET | 获取 ETA 估算结果 |
| `/map/amap/driving` | GET | 调用高德驾车路径规划 |
| `/map/amap/geocode` | GET | 调用高德地理编码 |
| `/map/amap/regeo` | GET | 调用高德逆地理编码 |
| `/messages/list` | GET | 前台留言列表 |
| `/messages/page` | GET | 后台留言分页 |
| `/ws/vehicle` | WebSocket | 车辆位置推送 |

## B.2 代表性脚本

| 脚本 | 作用 |
|---|---|
| `scripts/remote-dev-check.sh` | 编译检查 |
| `scripts/single-demo-deploy.sh` | 单实例演示部署 |
| `scripts/single-demo-smoke.sh` | 单实例烟测 |
| `scripts/single-demo-status.sh` | 状态检查 |
| `scripts/reset-single-demo-data.sh` | 演示数据重置 |
| `scripts/sync-admin-runtime-assets.sh` | 后台资源同步 |
| `scripts/host-health-guardian.sh` | 主机健康守护 |

---

# 使用说明（给你后续继续改稿时参考）

如果你下一步要把这份初稿继续打磨成学校可交版本，建议按下面顺序继续处理：

1. 补学校封面、目录、页码、摘要格式；
2. 把第 1 章中的“研究现状”替换成真实文献综述；
3. 在第 3 章和第 4 章补 2~4 张系统结构图、流程图、数据库 E-R 图；
4. 在第 6 章加入 2~3 张真实测试截图与一张测试结果表；
5. 按学校格式重写参考文献；
6. 最后把语言再收紧一轮，改成更正式、更像论文的表述。
