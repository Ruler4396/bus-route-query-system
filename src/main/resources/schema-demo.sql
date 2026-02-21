CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(200),
  password VARCHAR(200),
  role VARCHAR(200),
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yonghu (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  zhanghao VARCHAR(200),
  mima VARCHAR(200),
  xingming VARCHAR(200),
  nianling INT,
  xingbie VARCHAR(200),
  shouji VARCHAR(200),
  zhaopian VARCHAR(200),
  zhangaijibie INT DEFAULT 0,
  zhangaijutiqingkuang VARCHAR(500),
  fuzhugongju VARCHAR(200),
  yuyinbofang TINYINT DEFAULT 0,
  gaoduibidu TINYINT DEFAULT 0,
  zitidaxiao INT DEFAULT 14,
  jianpandaohang TINYINT DEFAULT 1,
  hapticfeedback TINYINT DEFAULT 0,
  preference_route_type VARCHAR(50) DEFAULT 'AUTO',
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gongjiaoluxian (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  luxianbianhao VARCHAR(200),
  luxianmingcheng VARCHAR(200),
  fengmian VARCHAR(200),
  jiage INT,
  qidianzhanming VARCHAR(200),
  qidianzuobiao VARCHAR(100),
  tujingzhandian CLOB,
  zhandianzuobiao CLOB,
  luxianguiji CLOB,
  zhongdianzhanming VARCHAR(200),
  zhongdianzuobiao VARCHAR(100),
  luxianxiangqing CLOB,
  thumbsupnum INT DEFAULT 0,
  crazilynum INT DEFAULT 0,
  clicktime TIMESTAMP,
  clicknum INT DEFAULT 0,
  wuzhangaisheshi VARCHAR(500),
  wuzhangaijibie INT DEFAULT 0,
  diantifacilities VARCHAR(200),
  xunlianzhuankuan VARCHAR(200),
  yuyintongbao TINYINT DEFAULT 0,
  mangdaozhichi TINYINT DEFAULT 0,
  ditezhichi TINYINT DEFAULT 0,
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wangzhangonggao (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  biaoti VARCHAR(200),
  jianjie VARCHAR(200),
  fabushijian DATE,
  fengmian VARCHAR(200),
  neirong CLOB,
  thumbsupnum INT DEFAULT 0,
  crazilynum INT DEFAULT 0,
  clicktime TIMESTAMP,
  clicknum INT DEFAULT 0,
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS youqinglianjie (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  lianjiemingcheng VARCHAR(200),
  lianjie VARCHAR(200),
  tupian VARCHAR(200),
  clicktime TIMESTAMP,
  clicknum INT DEFAULT 0,
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userid BIGINT,
  username VARCHAR(200),
  content CLOB,
  cpicture VARCHAR(200),
  reply CLOB,
  rpicture VARCHAR(200),
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userid BIGINT,
  adminid BIGINT,
  ask CLOB,
  reply CLOB,
  isreply INT DEFAULT 0,
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS storeup (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userid BIGINT,
  refid BIGINT,
  tablename VARCHAR(200),
  name VARCHAR(200),
  picture VARCHAR(200),
  type VARCHAR(200),
  inteltype VARCHAR(200),
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS config (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200),
  value VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS token (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userid BIGINT,
  username VARCHAR(200),
  tablename VARCHAR(200),
  role VARCHAR(200),
  token VARCHAR(200),
  expiratedtime TIMESTAMP,
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discussgongjiaoluxian (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  refid BIGINT,
  userid BIGINT,
  nickname VARCHAR(200),
  content CLOB,
  reply CLOB,
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discusswangzhangonggao (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  refid BIGINT,
  userid BIGINT,
  nickname VARCHAR(200),
  content CLOB,
  reply CLOB,
  addtime TIMESTAMP
);

CREATE TABLE IF NOT EXISTS zhandian_wuzhangai (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  zhandianming VARCHAR(200) NOT NULL,
  jingdu DECIMAL(10, 7),
  weidu DECIMAL(10, 7),
  wuzhangaijibie INT DEFAULT 0,
  shengjiangtai TINYINT DEFAULT 0,
  mangdao TINYINT DEFAULT 0,
  zhuizhu TINYINT DEFAULT 0,
  zuoweishu INT DEFAULT 0,
  cesuo TINYINT DEFAULT 0,
  tingchechang TINYINT DEFAULT 0,
  beizhu CLOB,
  addtime TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_zhandian ON zhandian_wuzhangai (zhandianming);
