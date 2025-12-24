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
  `tujingzhandian` TEXT DEFAULT NULL COMMENT '途径站点',
  `zhongdianzhanming` VARCHAR(200) DEFAULT NULL COMMENT '终点站名',
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
