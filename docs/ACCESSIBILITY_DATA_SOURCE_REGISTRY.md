# PJT-0001 · ACCESSIBILITY_DATA_SOURCE_REGISTRY

最后更新：2026-03-07

## 1. 目的
记录本项目当前使用或对接的无障碍数据源，明确：
- 来源
- 许可/开放方式
- 更新频率
- 覆盖范围
- 对应字段
- 置信度口径

## 2. 数据源登记
| 数据源ID | 名称 | 类型 | 更新频率 | 覆盖范围 | 当前用途 | 置信度口径 |
|---|---|---|---|---|---|---|
| `internal_route_fields` | 项目内置路线字段 | project_dataset | 按版本更新 | 路线无障碍等级、语音播报、盲道支持、导盲犬支持、电梯/换乘设施说明 | 路线推荐与解释 | single_source_structured |
| `station_accessibility_table` | 站点无障碍表 | project_dataset | 按试点维护 | 站点无障碍等级、升降台/坡道、盲道、座位、厕所、停车场 | 上下车段评估 | single_source_structured |
| `osm_overpass` | OSM / Overpass | open_data | 按需抓取 | wheelchair、tactile_paving、elevator、bus_stop/platform 覆盖率 | 外部聚合摘要、开放数据参照 | open_crowdsourced |
| `open_gd` | 开放广东 | government_open_data | 以资源更新时间为准 | 无障碍主题目录、交通/残联/政务类资源 | 外部资源目录与补录线索 | government_catalog |
| `pilot_manual_sample` | 试点人工样本基础 | project_manual_pilot | 手工维护 | 缘石坡道、上落车可达性、换乘节点设施、目的地入口可达性 | 分段建模增强、风险提示增强 | manual_pilot |

## 3. 当前重点字段映射
- 盲道：`mangdao` / `mangdaozhichi` / OSM `tactile_paving`
- 无障碍电梯/换乘：`diantifacilities` / OSM `highway=elevator`
- 缘石坡道：`pilot_manual_sample.stations[*].curbRamp`
- 站点无障碍等级：`zhandian_wuzhangai.wuzhangaijibie`
- 目的地入口可达性：`pilot_manual_sample.destinationEntrances[*]`

## 4. 当前结论
- 路线级与站点级结构化字段已经可用于演示级推荐与风险提示。
- 外部数据可作为补充与对照，但当前仍不应直接等同于“已人工核验可依赖数据”。
- 试点人工样本基础已接入系统，但其真正成为“人工核验数据”仍需后续线下核验与更新流程。
