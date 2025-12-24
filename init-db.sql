-- 公交线路查询系统数据库初始化脚本

-- 管理员用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `username` VARCHAR(200) DEFAULT NULL COMMENT '用户账号',
  `password` VARCHAR(200) DEFAULT NULL COMMENT '密码',
  `role` VARCHAR(200) DEFAULT NULL COMMENT '用户类型',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员用户表';

-- 普通用户表
CREATE TABLE IF NOT EXISTS `yonghu` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `zhanghao` VARCHAR(200) DEFAULT NULL COMMENT '账号',
  `mima` VARCHAR(200) DEFAULT NULL COMMENT '密码',
  `xingming` VARCHAR(200) DEFAULT NULL COMMENT '姓名',
  `nianling` INT DEFAULT NULL COMMENT '年龄',
  `xingbie` VARCHAR(200) DEFAULT NULL COMMENT '性别',
  `shouji` VARCHAR(200) DEFAULT NULL COMMENT '手机',
  `zhaopian` VARCHAR(200) DEFAULT NULL COMMENT '照片',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 公交路线表
CREATE TABLE IF NOT EXISTS `gongjiaoluxian` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `luxianbianhao` VARCHAR(200) DEFAULT NULL COMMENT '路线编号',
  `luxianmingcheng` VARCHAR(200) DEFAULT NULL COMMENT '路线名称',
  `fengmian` VARCHAR(200) DEFAULT NULL COMMENT '封面',
  `jiage` INT DEFAULT NULL COMMENT '价格',
  `qidianzhanming` VARCHAR(200) DEFAULT NULL COMMENT '起点站名',
  `qidianzuobiao` VARCHAR(100) DEFAULT NULL COMMENT '起点站坐标(经度,纬度)',
  `tujingzhandian` TEXT DEFAULT NULL COMMENT '途径站点',
  `zhandianzuobiao` TEXT DEFAULT NULL COMMENT '站点坐标JSON数据',
  `zhongdianzhanming` VARCHAR(200) DEFAULT NULL COMMENT '终点站名',
  `zhongdianzuobiao` VARCHAR(100) DEFAULT NULL COMMENT '终点站坐标(经度,纬度)',
  `luxianxiangqing` TEXT DEFAULT NULL COMMENT '路线详情',
  `thumbsupnum` INT DEFAULT 0 COMMENT '赞',
  `crazilynum` INT DEFAULT 0 COMMENT '踩',
  `clicktime` DATETIME DEFAULT NULL COMMENT '最近点击时间',
  `clicknum` INT DEFAULT 0 COMMENT '点击次数',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公交路线表';

-- 网站公告表
CREATE TABLE IF NOT EXISTS `wangzhangonggao` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `biaoti` VARCHAR(200) DEFAULT NULL COMMENT '标题',
  `jianjie` VARCHAR(200) DEFAULT NULL COMMENT '简介',
  `fabushijian` DATE DEFAULT NULL COMMENT '发布时间',
  `fengmian` VARCHAR(200) DEFAULT NULL COMMENT '封面',
  `neirong` TEXT DEFAULT NULL COMMENT '内容',
  `thumbsupnum` INT DEFAULT 0 COMMENT '赞',
  `crazilynum` INT DEFAULT 0 COMMENT '踩',
  `clicktime` DATETIME DEFAULT NULL COMMENT '最近点击时间',
  `clicknum` INT DEFAULT 0 COMMENT '点击次数',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网站公告表';

-- 友情链接表
CREATE TABLE IF NOT EXISTS `youqinglianjie` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `lianjiemingcheng` VARCHAR(200) DEFAULT NULL COMMENT '链接名称',
  `lianjie` VARCHAR(200) DEFAULT NULL COMMENT '链接',
  `tupian` VARCHAR(200) DEFAULT NULL COMMENT '图片',
  `clicktime` DATETIME DEFAULT NULL COMMENT '最近点击时间',
  `clicknum` INT DEFAULT 0 COMMENT '点击次数',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友情链接表';

-- 留言建议表
CREATE TABLE IF NOT EXISTS `messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `userid` BIGINT DEFAULT NULL COMMENT '留言人id',
  `username` VARCHAR(200) DEFAULT NULL COMMENT '用户名',
  `content` TEXT DEFAULT NULL COMMENT '留言内容',
  `cpicture` VARCHAR(200) DEFAULT NULL COMMENT '留言图片',
  `reply` TEXT DEFAULT NULL COMMENT '回复内容',
  `rpicture` VARCHAR(200) DEFAULT NULL COMMENT '回复图片',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='留言建议表';

-- 在线提问表
CREATE TABLE IF NOT EXISTS `chat` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `userid` BIGINT DEFAULT NULL COMMENT '用户id',
  `adminid` BIGINT DEFAULT NULL COMMENT '管理员id',
  `ask` TEXT DEFAULT NULL COMMENT '提问',
  `reply` TEXT DEFAULT NULL COMMENT '回复',
  `isreply` INT DEFAULT 0 COMMENT '是否回复',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在线提问表';

-- 收藏表
CREATE TABLE IF NOT EXISTS `storeup` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `userid` BIGINT DEFAULT NULL COMMENT '用户id',
  `refid` BIGINT DEFAULT NULL COMMENT '收藏id',
  `tablename` VARCHAR(200) DEFAULT NULL COMMENT '表名',
  `name` VARCHAR(200) DEFAULT NULL COMMENT '收藏名称',
  `picture` VARCHAR(200) DEFAULT NULL COMMENT '收藏图片',
  `type` VARCHAR(200) DEFAULT NULL COMMENT '类型(1:收藏,21:赞,22:踩)',
  `inteltype` VARCHAR(200) DEFAULT NULL COMMENT '推荐类型',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 配置表
CREATE TABLE IF NOT EXISTS `config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `name` VARCHAR(200) DEFAULT NULL COMMENT 'key',
  `value` VARCHAR(200) DEFAULT NULL COMMENT 'value',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配置表';

-- Token表
CREATE TABLE IF NOT EXISTS `token` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `userid` BIGINT DEFAULT NULL COMMENT '用户id',
  `username` VARCHAR(200) DEFAULT NULL COMMENT '用户名',
  `tablename` VARCHAR(200) DEFAULT NULL COMMENT '表名',
  `role` VARCHAR(200) DEFAULT NULL COMMENT '角色',
  `token` VARCHAR(200) DEFAULT NULL COMMENT 'token',
  `expiratedtime` DATETIME DEFAULT NULL COMMENT '过期时间',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='token表';

-- 公交路线评论表
CREATE TABLE IF NOT EXISTS `discussgongjiaoluxian` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `refid` BIGINT DEFAULT NULL COMMENT '关联表id',
  `userid` BIGINT DEFAULT NULL COMMENT '用户id',
  `nickname` VARCHAR(200) DEFAULT NULL COMMENT '用户名',
  `content` TEXT DEFAULT NULL COMMENT '评论内容',
  `reply` TEXT DEFAULT NULL COMMENT '回复内容',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公交路线评论表';

-- 网站公告评论表
CREATE TABLE IF NOT EXISTS `discusswangzhangonggao` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `refid` BIGINT DEFAULT NULL COMMENT '关联表id',
  `userid` BIGINT DEFAULT NULL COMMENT '用户id',
  `nickname` VARCHAR(200) DEFAULT NULL COMMENT '用户名',
  `content` TEXT DEFAULT NULL COMMENT '评论内容',
  `reply` TEXT DEFAULT NULL COMMENT '回复内容',
  `addtime` DATETIME DEFAULT NULL COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网站公告评论表';

-- 插入默认管理员账号 (密码: abo)
INSERT INTO `users` (`username`, `password`, `role`, `addtime`) VALUES
('abo', 'abo', 'admin', NOW())
ON DUPLICATE KEY UPDATE `username`=`username`;

-- 插入默认配置
INSERT INTO `config` (`name`, `value`) VALUES
('picture1', 'upload/picture1.jpg'),
('picture2', 'upload/picture2.jpg'),
('picture3', 'upload/picture3.jpg')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- =============================================
-- 示例公交路线数据（上海市真实路线）
-- =============================================

-- 1路公交车：上海火车站 - 莘庄路
INSERT INTO `gongjiaoluxian` (
  `luxianbianhao`, `luxianmingcheng`, `fengmian`, `jiage`,
  `qidianzhanming`, `qidianzuobiao`, `tujingzhandian`, `zhandianzuobiao`,
  `zhongdianzhanming`, `zhongdianzuobiao`, `luxianxiangqing`,
  `thumbsupnum`, `crazilynum`, `clicknum`, `addtime`
) VALUES (
  '101路', '上海火车站-莘庄', 'upload/101.jpg', 2,
  '上海火车站', '121.4561,31.2491',
  '北广场,中兴路,交通路,洛川中路,延安中路,上海马戏城,延安西路,中山西路,虹桥路,水城路,虹梅路,莲花路,莘庄',
  '[{"name":"上海火车站","lng":121.4561,"lat":31.2491},{"name":"北广场","lng":121.4580,"lat":31.2475},{"name":"中兴路","lng":121.4600,"lat":31.2458},{"name":"交通路","lng":121.4620,"lat":31.2435},{"name":"洛川中路","lng":121.4650,"lat":31.2410},{"name":"延安中路","lng":121.4680,"lat":31.2385},{"name":"上海马戏城","lng":121.4710,"lat":31.2360},{"name":"延安西路","lng":121.4740,"lat":31.2340},{"name":"中山西路","lng":121.4770,"lat":31.2320},{"name":"虹桥路","lng":121.4800,"lat":31.2300},{"name":"水城路","lng":121.4830,"lat":31.2280},{"name":"虹梅路","lng":121.4860,"lat":31.2260},{"name":"莲花路","lng":121.4890,"lat":31.2240},{"name":"莘庄","lng":121.4920,"lat":31.2220}]',
  '莘庄', '121.4920,31.2220',
  '贯穿上海市中心城区南北向主干线，连接上海火车站与闵行区莘庄，途经静安寺、中山公园、虹桥等重要商圈。',
  0, 0, 0, NOW()
) ON DUPLICATE KEY UPDATE `luxianbianhao`=`luxianbianhao`;

-- 2路公交车：人民广场 - 张江高科
INSERT INTO `gongjiaoluxian` (
  `luxianbianhao`, `luxianmingcheng`, `fengmian`, `jiage`,
  `qidianzhanming`, `qidianzuobiao`, `tujingzhandian`, `zhandianzuobiao`,
  `zhongdianzhanming`, `zhongdianzuobiao`, `luxianxiangqing`,
  `thumbsupnum`, `crazilynum`, `clicknum`, `addtime`
) VALUES (
  '102路', '人民广场-张江高科', 'upload/102.jpg', 3,
  '人民广场', '121.4759,31.2293',
  '人民大道,黄陂北路,淮海中路,重庆南路,西藏中路,河南中路,山东中路,南京东路,外滩,陆家嘴,东方路,源深路,世纪大道,杨高中路,张江高科',
  '[{"name":"人民广场","lng":121.4759,"lat":31.2293},{"name":"人民大道","lng":121.4780,"lat":31.2275},{"name":"黄陂北路","lng":121.4800,"lat":31.2258},{"name":"淮海中路","lng":121.4820,"lat":31.2240},{"name":"重庆南路","lng":121.4840,"lat":31.2225},{"name":"西藏中路","lng":121.4860,"lat":31.2210},{"name":"河南中路","lng":121.4880,"lat":31.2195},{"name":"山东中路","lng":121.4900,"lat":31.2180},{"name":"南京东路","lng":121.4920,"lat":31.2165},{"name":"外滩","lng":121.4940,"lat":31.2150},{"name":"陆家嘴","lng":121.5050,"lat":31.2340},{"name":"东方路","lng":121.5100,"lat":31.2300},{"name":"源深路","lng":121.5150,"lat":31.2260},{"name":"世纪大道","lng":121.5200,"lat":31.2220},{"name":"杨高中路","lng":121.5250,"lat":31.2180},{"name":"张江高科","lng":121.5300,"lat":31.2140}]',
  '张江高科', '121.5300,31.2140',
  '连接市中心人民广场与浦东张江高科技园区，途经外滩、陆家嘴、世纪公园等浦东核心区域。',
  0, 0, 0, NOW()
) ON DUPLICATE KEY UPDATE `luxianbianhao`=`luxianbianhao`;

-- 3路公交车：上海南站 - 五角场
INSERT INTO `gongjiaoluxian` (
  `luxianbianhao`, `luxianmingcheng`, `fengmian`, `jiage`,
  `qidianzhanming`, `qidianzuobiao`, `tujingzhandian`, `zhandianzuobiao`,
  `zhongdianzhanming`, `zhongdianzuobiao`, `luxianxiangqing`,
  `thumbsupnum`, `crazilynum`, `clicknum`, `addtime`
) VALUES (
  '103路', '上海南站-五角场', 'upload/103.jpg', 2,
  '上海南站', '121.4335,31.1655',
  '南广场,石龙路,龙川北路,上海师大,桂林公园,武宁路,曹家渡,静安寺,常德路,愚园路,中山公园,凯旋路,延安西路,定西路,江苏路,四平路,五角场',
  '[{"name":"上海南站","lng":121.4335,"lat":31.1655},{"name":"南广场","lng":121.4350,"lat":31.1670},{"name":"石龙路","lng":121.4380,"lat":31.1700},{"name":"龙川北路","lng":121.4410,"lat":31.1730},{"name":"上海师大","lng":121.4440,"lat":31.1760},{"name":"桂林公园","lng":121.4470,"lat":31.1790},{"name":"武宁路","lng":121.4500,"lat":31.1820},{"name":"曹家渡","lng":121.4530,"lat":31.1850},{"name":"静安寺","lng":121.4560,"lat":31.2280},{"name":"常德路","lng":121.4590,"lat":31.2260},{"name":"愚园路","lng":121.4620,"lat":31.2240},{"name":"中山公园","lng":121.4650,"lat":31.2220},{"name":"凯旋路","lng":121.4680,"lat":31.2200},{"name":"延安西路","lng":121.4710,"lat":31.2180},{"name":"定西路","lng":121.4740,"lat":31.2160},{"name":"江苏路","lng":121.4770,"lat":31.2140},{"name":"四平路","lng":121.4800,"lat":31.2120},{"name":"五角场","lng":121.4830,"lat":31.2100}]',
  '五角场', '121.4830,31.2100',
  '连接上海南站与杨浦区五角场副中心，途经长宁区、静安区等区域，是重要的东西向公交线路。',
  0, 0, 0, NOW()
) ON DUPLICATE KEY UPDATE `luxianbianhao`=`luxianbianhao`;

-- 4路公交车：虹口足球场 - 世纪公园
INSERT INTO `gongjiaoluxian` (
  `luxianbianhao`, `luxianmingcheng`, `fengmian`, `jiage`,
  `qidianzhanming`, `qidianzuobiao`, `tujingzhandian`, `zhandianzuobiao`,
  `zhongdianzhanming`, `zhongdianzuobiao`, `luxianxiangqing`,
  `thumbsupnum`, `crazilynum`, `clicknum`, `addtime`
) VALUES (
  '104路', '虹口足球场-世纪公园', 'upload/104.jpg', 2,
  '虹口足球场', '121.5074,31.2674',
  '四川北路,海宁路,河南北路,天津路,江西中路,南京东路,河南中路,西藏中路,重庆南路,淮海中路,襄阳公园,淮海中路,陕西南路,常熟路,宝庆路,复兴中路,淮海中路,高安路,瑞金二路,南昌路,科学会堂,世纪公园',
  '[{"name":"虹口足球场","lng":121.5074,"lat":31.2674},{"name":"四川北路","lng":121.5050,"lat":31.2650},{"name":"海宁路","lng":121.5025,"lat":31.2625},{"name":"河南北路","lng":121.5000,"lat":31.2600},{"name":"天津路","lng":121.4975,"lat":31.2575},{"name":"江西中路","lng":121.4950,"lat":31.2550},{"name":"南京东路","lng":121.4925,"lat":31.2525},{"name":"河南中路","lng":121.4900,"lat":31.2500},{"name":"西藏中路","lng":121.4875,"lat":31.2475},{"name":"重庆南路","lng":121.4850,"lat":31.2450},{"name":"淮海中路","lng":121.4825,"lat":31.2425},{"name":"襄阳公园","lng":121.4800,"lat":31.2400},{"name":"淮海中路","lng":121.4775,"lat":31.2375},{"name":"陕西南路","lng":121.4750,"lat":31.2350},{"name":"常熟路","lng":121.4725,"lat":31.2325},{"name":"宝庆路","lng":121.4700,"lat":31.2300},{"name":"复兴中路","lng":121.4675,"lat":31.2275},{"name":"淮海中路","lng":121.4650,"lat":31.2250},{"name":"高安路","lng":121.4625,"lat":31.2225},{"name":"瑞金二路","lng":121.4600,"lat":31.2200},{"name":"南昌路","lng":121.4575,"lat":31.2175},{"name":"科学会堂","lng":121.4550,"lat":31.2150},{"name":"世纪公园","lng":121.4525,"lat":31.2125}]',
  '世纪公园', '121.4525,31.2125',
  '贯穿虹口区、静安区、黄浦区、浦东新区的重要公交线路，途经南京路、淮海路、世纪公园等知名景点。',
  0, 0, 0, NOW()
) ON DUPLICATE KEY UPDATE `luxianbianhao`=`luxianbianhao`;

-- 5路公交车：上海西站 - 浦东南路
INSERT INTO `gongjiaoluxian` (
  `luxianbianhao`, `luxianmingcheng`, `fengmian`, `jiage`,
  `qidianzhanming`, `qidianzuobiao`, `tujingzhandian`, `zhandianzuobiao`,
  `zhongdianzhanming`, `zhongdianzuobiao`, `luxianxiangqing`,
  `thumbsupnum`, `crazilynum`, `clicknum`, `addtime`
) VALUES (
  '105路', '上海西站-浦东南路', 'upload/105.jpg', 3,
  '上海西站', '121.4142,31.2562',
  '西站,虹桥路,虹桥路,长宁路,中山公园,延安西路,华山路,常熟路,乌鲁木齐北路,延安中路,石门一路,瑞金一路,淮海中路,重庆南路,西藏南路,大兴街,黄陂南路,江边码头,浦东南路',
  '[{"name":"上海西站","lng":121.4142,"lat":31.2562},{"name":"西站","lng":121.4160,"lat":31.2545},{"name":"虹桥路","lng":121.4180,"lat":31.2525},{"name":"虹桥路","lng":121.4200,"lat":31.2505},{"name":"长宁路","lng":121.4220,"lat":31.2485},{"name":"中山公园","lng":121.4240,"lat":31.2465},{"name":"延安西路","lng":121.4260,"lat":31.2445},{"name":"华山路","lng":121.4280,"lat":31.2425},{"name":"常熟路","lng":121.4300,"lat":31.2405},{"name":"乌鲁木齐北路","lng":121.4320,"lat":31.2385},{"name":"延安中路","lng":121.4340,"lat":31.2365},{"name":"石门一路","lng":121.4360,"lat":31.2345},{"name":"瑞金一路","lng":121.4380,"lat":31.2325},{"name":"淮海中路","lng":121.4400,"lat":31.2305},{"name":"重庆南路","lng":121.4420,"lat":31.2285},{"name":"西藏南路","lng":121.4840,"lat":31.2265},{"name":"大兴街","lng":121.4860,"lat":31.2250},{"name":"黄陂南路","lng":121.4880,"lat":31.2235},{"name":"江边码头","lng":121.4900,"lat":31.2220},{"name":"浦东南路","lng":121.4920,"lat":31.2205}]',
  '浦东南路', '121.4920,31.2205',
  '连接上海西站与浦东新区，途经长宁区、静安区、黄浦区、陆家嘴金融区等核心区域。',
  0, 0, 0, NOW()
) ON DUPLICATE KEY UPDATE `luxianbianhao`=`luxianbianhao`;
