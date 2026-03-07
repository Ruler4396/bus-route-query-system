MERGE INTO users (id, username, password, role, addtime)
KEY(id)
VALUES (1, 'abo', 'abo', 'admin', CURRENT_TIMESTAMP);

MERGE INTO config (id, name, value)
KEY(id)
VALUES
  (1, 'picture1', 'upload/picture1.jpg'),
  (2, 'picture2', 'upload/picture2.jpg'),
  (3, 'picture3', 'upload/picture3.jpg');

MERGE INTO gongjiaoluxian (
  id, luxianbianhao, luxianmingcheng, fengmian, jiage,
  qidianzhanming, qidianzuobiao, tujingzhandian, zhandianzuobiao, luxianguiji,
  zhongdianzhanming, zhongdianzuobiao, luxianxiangqing,
  thumbsupnum, crazilynum, clicknum,
  wuzhangaisheshi, wuzhangaijibie, diantifacilities, xunlianzhuankuan,
  yuyintongbao, mangdaozhichi, ditezhichi, addtime
)
KEY(id)
VALUES (
  1, 'DEMO-1', '无障碍示例线路：中山纪念堂-珠江新城', 'upload/101.jpg', 2,
  '中山纪念堂', '113.264385,23.132108',
  '中山纪念堂,公园前,农讲所,东山口,体育西路,珠江新城',
  '[{"name":"中山纪念堂","lng":113.264385,"lat":23.132108},{"name":"公园前","lng":113.264818,"lat":23.129126},{"name":"珠江新城","lng":113.324345,"lat":23.118123}]',
  '[{"lng":113.264385,"lat":23.132108},{"lng":113.264818,"lat":23.129126},{"lng":113.324345,"lat":23.118123}]',
  '珠江新城', '113.324345,23.118123',
  '演示数据：包含盲道、语音提示和导盲犬支持字段。',
  0, 0, 0,
  '轮椅坡道,盲道,语音提示', 1, '中山纪念堂站,珠江新城站', '低地板公交+站点坡道',
  1, 1, 1, CURRENT_TIMESTAMP
);

MERGE INTO wangzhangonggao (
  id, biaoti, jianjie, fabushijian, fengmian, neirong,
  thumbsupnum, crazilynum, clicknum, addtime
)
KEY(id)
VALUES (
  1, '演示公告', '该系统已切换为轻量化演示数据库。', CURRENT_DATE, 'upload/picture1.jpg',
  '当前演示环境使用内嵌式 H2 数据库，无需单独部署 MySQL。',
  0, 0, 0, CURRENT_TIMESTAMP
);

MERGE INTO zhandian_wuzhangai (
  id, zhandianming, jingdu, weidu, wuzhangaijibie, shengjiangtai, mangdao, zhuizhu,
  zuoweishu, cesuo, tingchechang, beizhu, addtime
)
KEY(id)
VALUES (
  1, '中山纪念堂', 113.2643850, 23.1321080, 1, 1, 1, 1, 8, 1, 1,
  '演示站点：配置了盲道、无障碍卫生间、无障碍停车位。', CURRENT_TIMESTAMP
);
