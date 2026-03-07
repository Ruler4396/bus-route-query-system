MERGE INTO users (id, username, password, role, addtime)
KEY(id)
VALUES (1, 'abo', 'abo', 'admin', CURRENT_TIMESTAMP);

MERGE INTO yonghu (
  id, zhanghao, mima, xingming, nianling, xingbie, shouji, zhaopian,
  zhangaijibie, zhangaijutiqingkuang, fuzhugongju,
  yuyinbofang, gaoduibidu, zitidaxiao, jianpandaohang, hapticfeedback,
  preference_route_type, addtime
)
KEY(id)
VALUES (
  1001, 'demo_user', 'demo123', '演示用户', 29, '女', '13800000000', 'front/img/a11y-covers/hero-1.svg',
  2, '轮椅/行动不便演示画像', '轮椅',
  1, 1, 18, 1, 0,
  'ACCESSIBILITY_FIRST', CURRENT_TIMESTAMP
);

MERGE INTO config (id, name, value)
KEY(id)
VALUES
  (1, 'picture1', 'front/img/a11y-covers/hero-1.svg'),
  (2, 'picture2', 'front/img/a11y-covers/hero-2.svg'),
  (3, 'picture3', 'front/img/a11y-covers/hero-3.svg');

MERGE INTO gongjiaoluxian (
  id, luxianbianhao, luxianmingcheng, fengmian, jiage,
  qidianzhanming, qidianzuobiao, tujingzhandian, zhandianzuobiao, luxianguiji,
  zhongdianzhanming, zhongdianzuobiao, luxianxiangqing,
  thumbsupnum, crazilynum, clicknum,
  wuzhangaisheshi, wuzhangaijibie, diantifacilities, xunlianzhuankuan,
  yuyintongbao, mangdaozhichi, ditezhichi, addtime
)
KEY(id)
VALUES
(
  1, '1路', '1路：东山署前路总站-芳村花园南门总站', 'front/img/a11y-covers/route-1.svg', 2,
  '东山署前路总站', '113.289614,23.124731',
  '农林东,中山医,烈士陵园,农讲所,海珠广场,市中医院,芳村隧道口,芳村花园南门总站',
  '[{"name":"东山署前路总站","lng":113.289614,"lat":23.124731},{"name":"中山医","lng":113.285998,"lat":23.127552},{"name":"烈士陵园","lng":113.280130,"lat":23.129439},{"name":"农讲所","lng":113.270226,"lat":23.129320},{"name":"海珠广场","lng":113.261810,"lat":23.116607},{"name":"市中医院","lng":113.236027,"lat":23.111493},{"name":"芳村隧道口","lng":113.230549,"lat":23.102228},{"name":"芳村花园南门总站","lng":113.218871,"lat":23.076651}]',
  '[{"lng":113.289614,"lat":23.124731},{"lng":113.280130,"lat":23.129439},{"lng":113.270226,"lat":23.129320},{"lng":113.261810,"lat":23.116607},{"lng":113.236027,"lat":23.111493},{"lng":113.230549,"lat":23.102228},{"lng":113.218871,"lat":23.076651}]',
  '芳村花园南门总站', '113.218871,23.076651',
  '试点演示线路：覆盖越秀核心医疗区、海珠广场与芳村片区。适合展示跨江公交路线、站点设施标注和轮椅/低视力优先推荐。',
  12, 1, 89,
  '轮椅坡道,站台盲道,语音提示', 2, '中山医,海珠广场', '低地板车辆优先，跨江场景重点演示风险提示',
  1, 1, 1, CURRENT_TIMESTAMP
),
(
  2, '3路', '3路：如意坊总站-东山龟岗总站', 'front/img/a11y-covers/route-2.svg', 2,
  '如意坊总站', '113.240920,23.122762',
  '广医三院,恩宁路永庆坊,上九路,省中医院,中山图书馆,东华东路,东山龟岗总站',
  '[{"name":"如意坊总站","lng":113.240920,"lat":23.122762},{"name":"广医三院","lng":113.248960,"lat":23.120213},{"name":"恩宁路永庆坊","lng":113.244362,"lat":23.118642},{"name":"省中医院","lng":113.265638,"lat":23.121566},{"name":"中山图书馆","lng":113.275402,"lat":23.126754},{"name":"东华东路","lng":113.290115,"lat":23.122813},{"name":"东山龟岗总站","lng":113.303311,"lat":23.123792}]',
  '[{"lng":113.240920,"lat":23.122762},{"lng":113.248960,"lat":23.120213},{"lng":113.244362,"lat":23.118642},{"lng":113.265638,"lat":23.121566},{"lng":113.275402,"lat":23.126754},{"lng":113.290115,"lat":23.122813},{"lng":113.303311,"lat":23.123792}]',
  '东山龟岗总站', '113.303311,23.123792',
  '试点演示线路：连接荔湾历史街区和越秀东山片区，适合展示医院、文化服务点与老城区步行换乘场景。',
  9, 0, 64,
  '坡道,换乘引导,文本提示', 2, '东山龟岗总站', '老城街区演示，强调步行和换乘复杂度说明',
  1, 1, 1, CURRENT_TIMESTAMP
),
(
  3, '31路', '31路：解放北路应元路口总站-南石西地铁棣园站总站', 'front/img/a11y-covers/route-3.svg', 2,
  '解放北路应元路口总站', '113.263724,23.138285',
  '广医,西门口人民北路,文化公园,凤凰岗站,珠江医院,纸厂地铁燕岗站,南石路地铁棣园站,南石西地铁棣园站总站',
  '[{"name":"解放北路应元路口总站","lng":113.263724,"lat":23.138285},{"name":"广医","lng":113.264198,"lat":23.136264},{"name":"西门口人民北路","lng":113.257392,"lat":23.129259},{"name":"文化公园","lng":113.249008,"lat":23.111709},{"name":"凤凰岗站","lng":113.246763,"lat":23.103278},{"name":"珠江医院","lng":113.252458,"lat":23.088815},{"name":"纸厂地铁燕岗站","lng":113.255860,"lat":23.079692},{"name":"南石路地铁棣园站","lng":113.262612,"lat":23.077064},{"name":"南石西地铁棣园站总站","lng":113.258178,"lat":23.074974}]',
  '[{"lng":113.263724,"lat":23.138285},{"lng":113.264198,"lat":23.136264},{"lng":113.257392,"lat":23.129259},{"lng":113.249008,"lat":23.111709},{"lng":113.246763,"lat":23.103278},{"lng":113.252458,"lat":23.088815},{"lng":113.255860,"lat":23.079692},{"lng":113.262612,"lat":23.077064},{"lng":113.258178,"lat":23.074974}]',
  '南石西地铁棣园站总站', '113.258178,23.074974',
  '试点演示线路：覆盖越秀老城核心、西门口、文化公园以及海珠医疗与地铁换乘场景，适合展示地图、ETA 与换乘风险提示。',
  15, 1, 103,
  '电梯换乘,轮椅坡道,语音提示', 2, '纸厂地铁燕岗站,南石路地铁棣园站', '重点展示地铁衔接、医院访问和换乘风险说明',
  1, 1, 1, CURRENT_TIMESTAMP
);

MERGE INTO wangzhangonggao (
  id, biaoti, jianjie, fabushijian, fengmian, neirong,
  thumbsupnum, crazilynum, clicknum, addtime
)
KEY(id)
VALUES
(
  1, '试点范围公告：广州老城区公共服务走廊', '首轮试点仅承诺 1路、3路、31路及其覆盖的老城区公共服务走廊。', CURRENT_DATE, 'front/img/a11y-covers/notice-1.svg',
  '本系统首轮试点聚焦越秀、荔湾、海珠老城区公共服务走廊，优先服务轮椅/行动不便与低视力人群，不默认承诺广州全城都已完成可信验证。',
  6, 0, 26, CURRENT_TIMESTAMP
),
(
  2, '演示模式已就绪：Alt + D 一键启动', '首页支持 Alt + D 打开 10 分钟中期检查演示模式。', CURRENT_DATE, 'front/img/a11y-covers/notice-2.svg',
  '演示模式将按首页总览、快捷控制、路线规划、路线详情、实时地图、公告、资源链接、留言反馈、无障碍设置、登录态扩展示范的顺序串讲。',
  5, 0, 18, CURRENT_TIMESTAMP
),
(
  3, '演示账号说明', '如需演示登录态和在线提问，可使用内置 demo 账号。', CURRENT_DATE, 'front/img/a11y-covers/notice-3.svg',
  '演示账号：demo_user / demo123。用于展示登录态、在线提问和反馈闭环。该账号仅用于本地演示数据环境，不代表生产环境开放匿名访问。',
  8, 0, 31, CURRENT_TIMESTAMP
);

MERGE INTO youqinglianjie (
  id, lianjiemingcheng, lianjie, tupian, clicknum, addtime
)
KEY(id)
VALUES
  (1, 'Wheelmap 无障碍地图', 'https://wheelmap.org/', 'front/img/a11y-covers/link-1.svg', 12, CURRENT_TIMESTAMP),
  (2, 'OpenStreetMap', 'https://www.openstreetmap.org/', 'front/img/a11y-covers/link-2.svg', 8, CURRENT_TIMESTAMP),
  (3, '开放广东数据平台', 'https://gddata.gd.gov.cn/', 'front/img/a11y-covers/link-3.svg', 7, CURRENT_TIMESTAMP),
  (4, '广东省残疾人联合会', 'https://www.gddpf.org.cn/', 'front/img/a11y-covers/link-4.svg', 4, CURRENT_TIMESTAMP);

MERGE INTO messages (
  id, userid, username, content, cpicture, reply, rpicture, addtime
)
KEY(id)
VALUES
  (1, 1001, 'demo_user', '我想从东山口附近去医院，希望系统优先推荐轮椅更容易上下车的路线。', 'front/img/a11y-covers/hero-1.svg', '已收到，建议优先查看 1路 与 31路 的站点可达性与换乘风险提示。', '', DATEADD('MINUTE', -30, CURRENT_TIMESTAMP)),
  (2, 1001, 'demo_user', '地图页能否标注哪些站点是演示范围内人工核验过的？', 'front/img/a11y-covers/hero-2.svg', '已纳入待办，后续会在试点范围内增加人工核验标识与可信度说明。', '', DATEADD('MINUTE', -20, CURRENT_TIMESTAMP)),
  (3, 1001, 'demo_user', '友情链接页建议增加真实无障碍数据源，方便核对。', 'front/img/a11y-covers/hero-3.svg', '已补充 Wheelmap、OpenStreetMap、开放广东等入口，用于演示数据来源与核查路径。', '', DATEADD('MINUTE', -10, CURRENT_TIMESTAMP));

MERGE INTO chat (
  id, userid, adminid, ask, reply, isreply, addtime
)
KEY(id)
VALUES
  (11, 1001, NULL, '我需要录制中期检查视频，哪条路线最适合展示？', NULL, 1, DATEADD('MINUTE', -12, CURRENT_TIMESTAMP)),
  (12, 1001, 1, NULL, '建议优先展示 1路、3路、31路，它们已经纳入试点范围并能串联医院、老城换乘点与无障碍提示。', 0, DATEADD('MINUTE', -11, CURRENT_TIMESTAMP)),
  (13, 1001, NULL, '如果观众想看实时地图和 ETA，应当从哪里开始？', NULL, 1, DATEADD('MINUTE', -9, CURRENT_TIMESTAMP)),
  (14, 1001, 1, NULL, '可先按 Alt + D 进入演示模式，再切到“实时线路地图与 ETA”步骤，页面会自动切到地图页。', 0, DATEADD('MINUTE', -8, CURRENT_TIMESTAMP));

MERGE INTO zhandian_wuzhangai (
  id, zhandianming, jingdu, weidu, wuzhangaijibie, shengjiangtai, mangdao, zhuizhu,
  zuoweishu, cesuo, tingchechang, beizhu, addtime
)
KEY(id)
VALUES
  (1, '东山署前路总站', 113.2896140, 23.1247310, 2, 1, 1, 1, 8, 0, 0, '试点总站：适合演示轮椅上下车与起点准备。', CURRENT_TIMESTAMP),
  (2, '中山医', 113.2859980, 23.1275520, 2, 1, 1, 1, 6, 1, 0, '医疗目的地：适合演示医院场景与步行终点风险提示。', CURRENT_TIMESTAMP),
  (3, '烈士陵园', 113.2801300, 23.1294390, 2, 0, 1, 1, 4, 0, 0, '老城区站点：适合演示盲道和复杂路口提示。', CURRENT_TIMESTAMP),
  (4, '农讲所', 113.2702260, 23.1293200, 2, 0, 1, 1, 4, 0, 0, '政务/历史街区节点：适合展示文本提示和低视力模式。', CURRENT_TIMESTAMP),
  (5, '海珠广场', 113.2618100, 23.1166070, 2, 1, 1, 1, 10, 1, 1, '核心换乘节点：适合展示风险核对与换乘提示。', CURRENT_TIMESTAMP),
  (6, '市中医院', 113.2360270, 23.1114930, 2, 1, 0, 1, 6, 1, 0, '医疗节点：适合演示医院到达口说明。', CURRENT_TIMESTAMP),
  (7, '广医三院', 113.2489600, 23.1202130, 2, 1, 0, 1, 6, 1, 0, '医疗节点：适合演示 3 路 医院访问场景。', CURRENT_TIMESTAMP),
  (8, '省中医院', 113.2656380, 23.1215660, 2, 0, 1, 1, 5, 1, 0, '医院/老城场景：适合展示资源链接和可信度说明。', CURRENT_TIMESTAMP),
  (9, '西门口人民北路', 113.2573920, 23.1292590, 2, 1, 1, 1, 6, 0, 0, '老城换乘点：适合展示步行与路口复杂度风险。', CURRENT_TIMESTAMP),
  (10, '文化公园', 113.2490080, 23.1117090, 2, 1, 1, 1, 6, 1, 0, '换乘节点：适合展示跨区域公交衔接。', CURRENT_TIMESTAMP),
  (11, '珠江医院', 113.2524580, 23.0888150, 2, 1, 0, 1, 8, 1, 1, '医院终点：适合展示海珠片区医疗目的地。', CURRENT_TIMESTAMP),
  (12, '纸厂地铁燕岗站', 113.2558600, 23.0796920, 2, 1, 1, 1, 4, 0, 0, '地铁衔接点：适合展示电梯与换乘设施。', CURRENT_TIMESTAMP),
  (13, '南石路地铁棣园站', 113.2626120, 23.0770640, 2, 1, 1, 1, 4, 0, 0, '终点换乘点：适合展示站点级可达性。', CURRENT_TIMESTAMP),
  (14, '南石西地铁棣园站总站', 113.2581780, 23.0749740, 2, 1, 1, 1, 6, 0, 0, '试点终点总站：适合演示地铁接驳与终点说明。', CURRENT_TIMESTAMP);


MERGE INTO discussgongjiaoluxian (id, refid, userid, nickname, content, reply, addtime)
KEY(id)
VALUES
  (201, 1, 1001, 'demo_user', '1路 的跨江段如果能补充坡道连续性说明，会更适合轮椅用户决策。', '已记录，将在试点核验阶段补充关键站点连续可达性说明。', DATEADD('MINUTE', -18, CURRENT_TIMESTAMP)),
  (202, 3, 1001, 'demo_user', '31路 的地铁衔接场景很适合演示换乘风险提示。', '已作为中期检查视频中的重点展示线路。', DATEADD('MINUTE', -6, CURRENT_TIMESTAMP));

MERGE INTO discusswangzhangonggao (id, refid, userid, nickname, content, reply, addtime)
KEY(id)
VALUES
  (301, 1, 1001, 'demo_user', '试点范围公告建议持续显示在首页和公告页，方便观众理解边界。', '已通过首页总览 + 公告页双重呈现进行强化。', DATEADD('MINUTE', -14, CURRENT_TIMESTAMP)),
  (302, 2, 1001, 'demo_user', '演示模式支持 Alt + D 很适合录屏。', '已保留手动演示与自动串场两种模式。', DATEADD('MINUTE', -4, CURRENT_TIMESTAMP));
