# 城市公交在线查询系统

> 基于 Spring Boot 框架的智能公交查询系统，提供线路查询、站点检索、实时追踪、智能换乘等功能

---

## 项目概述

本系统旨在设计和实现一个基于Spring Boot框架的城市公交在线查询系统，解决市民出行中公交信息获取不便、实时性差、换乘方案不智能等痛点。通过该系统用户能够便捷查询公交线路、站点、实时到站信息及最优换乘方案。

---

## 更新日志

### v1.0.0 (2024-12-24)

- [x] 项目初始化，搭建Spring Boot + MyBatis-Plus框架
- [x] 创建13个核心数据表（用户、公交路线、公告、留言等）
- [x] 实现12个服务层模块（Service + ServiceImpl）
- [x] 完成Docker容器化部署配置
- [x] 实现管理后台与前台用户界面
- [x] GitHub仓库创建并推送代码

---

## 开发计划

### 一、主要任务和目标

#### 主要任务

| 任务 | 描述 | 优先级 |
|------|------|--------|
| 公交线路查询 | 支持按线路名称、编号查询 | 高 |
| 站点信息检索 | 查询站点位置、经过线路 | 高 |
| 实时位置追踪 | 车辆实时位置与到站预测 | 中 |
| 智能换乘规划 | 最优换乘方案推荐 | 高 |
| 到站提醒 | 推送即将到站通知 | 中 |

#### 技术目标

| 指标 | 目标值 |
|------|--------|
| 接口响应时间 | < 500ms |
| 并发访问支持 | ≥ 500 |
| 系统可用性 | 7×24小时 |
| 容错降级 | 支持 |

### 二、开发进度

#### 已完成 ✅

| 模块 | 内容 | 完成时间 |
|------|------|----------|
| 需求分析 | 用例分析、系统架构设计 | - |
| 数据库设计 | ER图、13张数据表、索引优化 | - |
| 后端框架 | Spring Boot + MyBatis-Plus + MySQL | 2024-12-24 |
| 服务层实现 | 12个Service接口 + 实现类 | 2024-12-24 |
| API接口 | RESTful风格接口（Controller层） | - |
| 前端界面 | Vue管理后台 + jQuery前台 | - |
| Docker部署 | docker-compose + 多阶段构建 | 2024-12-24 |

#### 进行中 🚧

| 任务 | 预计完成 |
|------|----------|
| 实时数据接入 | TBD |

#### 计划中 📋

| 阶段 | 任务 | 内容 |
|------|------|------|
| **后端增强** | 实时数据接入 | 对接GPS数据源，实现车辆位置追踪 |
| | 路径规划算法 | 实现Dijkstra/A*算法，提供最优换乘方案 |
| | 接口优化 | 添加缓存、限流、降级机制 |
| **前端优化** | 地图集成 | 集成高德/百度地图API |
| | 响应式优化 | 适配移动端设备 |
| **测试部署** | 性能测试 | JMeter压测，验证500并发目标 |
| | 容器化部署 | Docker Compose生产环境配置 |

---

## 技术架构

### 后端技术栈

```
Spring Boot 2.2.2.RELEASE
├── MyBatis-Plus 2.3        # ORM框架
├── MySQL 8.0               # 数据库
├── Shiro 1.3.2             # 权限管理
├── Hutool 4.0.12           # 工具类库
└── Swagger                 # API文档
```

### 前端技术栈

```
管理后台：Vue.js + ElementUI
前台页面：Vue.js + jQuery + Bootstrap
地图：待集成高德/百度地图API
```

### 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    用户层                             │
│    管理后台(Vue)    │    前台页面(Vue/jQuery)        │
├─────────────────────────────────────────────────────┤
│                   API网关层                           │
│        RESTful API  │  Swagger文档                   │
├─────────────────────────────────────────────────────┤
│                   业务逻辑层                          │
│  Service层 (12个模块) │  Controller层 (13个控制器)    │
├─────────────────────────────────────────────────────┤
│                   数据访问层                          │
│        MyBatis-Plus  │  DAO层 (13个Mapper)           │
├─────────────────────────────────────────────────────┤
│                   数据存储层                          │
│              MySQL 8.0 (13张表)                      │
└─────────────────────────────────────────────────────┘
```

---

## 快速开始

### 环境要求

| 组件 | 版本 |
|------|------|
| JDK | 1.8+ |
| Maven | 3.6+ |
| MySQL | 8.0+ |
| Docker | 20.10+ (可选) |

### 方式一：Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/Ruler4396/bus-route-query-system.git
cd bus-route-query-system

# 2. 一键启动
docker compose up -d

# 3. 访问系统
# 前台：http://localhost:8080/springbootmf383/front/index.html
# 后台：http://localhost:8080/springbootmf383/admin/dist/index.html
```

### 方式二：本地开发

```bash
# 1. 创建数据库
mysql -u root -p < init-db.sql

# 2. 修改配置
# 编辑 src/main/resources/application.yml
# 设置数据库连接信息

# 3. 启动项目
mvn spring-boot:run
```

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `abo` | `abo` |
| 普通用户 | 需注册 | 需注册 |

---

## API 接口

### 认证接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/users/login` | POST | 用户登录 |
| `/users/register` | POST | 用户注册 |
| `/users/logout` | GET | 退出登录 |

### 公交查询接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/gongjiaoluxian/list` | GET | 公交路线列表 |
| `/gongjiaoluxian/info/{id}` | GET | 路线详情 |
| `/gongjiaoluxian/page` | GET | 分页查询 |

### 其他接口

- 公告管理：`/wangzhangonggao/*`
- 留言建议：`/messages/*`
- 在线提问：`/chat/*`
- 友情链接：`/youqinglianjie/*`

完整API文档：启动后访问 `/swagger-ui.html`

---

## 数据库设计

### 核心数据表

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `users` | 管理员表 | id, username, password, role |
| `yonghu` | 用户表 | id, zhanghao, mima, xingming |
| `gongjiaoluxian` | 公交路线表 | id, luxianbianhao, luxianmingcheng, qidianzhanming, zhongdianzhanming |
| `wangzhangonggao` | 网站公告表 | id, biaoti, neirong, fabushijian |
| `messages` | 留言建议表 | id, userid, content, reply |
| `chat` | 在线提问表 | id, userid, ask, reply |

### ER关系

```
用户(yonghu) ─┬─> 留言(messages)
              ├─> 收藏(storeup)
              ├─> 提问(chat)
              └─> 评论(discuss*)

管理员(users) ─> 管理(所有模块)
```

---

## 系统截图

### 前台用户界面

| 功能 | 截图 |
|------|------|
| 首页 | ![首页](images/fb3f40d0942ead058b95439952adc3f.png) |
| 公交路线 | ![公交路线](images/e4e6c0d95f862ad4e19c9b7d61aeac7.png) |
| 网站公告 | ![网站公告](images/475b0c6ed6cb389a9c74e6b6a96827b.png) |

### 管理后台

| 功能 | 截图 |
|------|------|
| 登录 | ![登录](images/e18148b3b35ba855d7db2439479f8dc.png) |
| 用户管理 | ![用户管理](images/e081ea119e954dd1daeabc471cad35f.png) |
| 路线管理 | ![路线管理](images/93e786eef841fa08df36803e3c1967e.png) |
| 留言管理 | ![留言管理](images/63b89ef48b37000d245773e31dfbaa3.png) |

---

## 常用命令

```bash
# Docker操作
docker compose up -d          # 启动服务
docker compose down           # 停止服务
docker compose logs app       # 查看应用日志
docker compose restart        # 重启服务

# Maven操作
mvn clean package             # 打包
mvn spring-boot:run           # 运行

# Git操作
git pull origin main          # 拉取更新
git add . && git commit       # 提交更改
```

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 联系方式

- 仓库地址：https://github.com/Ruler4396/bus-route-query-system
- 问题反馈：[Issues](https://github.com/Ruler4396/bus-route-query-system/issues)

---

**Powered by Spring Boot | Made with ❤️ by Ruler4396**
