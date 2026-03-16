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
  '中山医,烈士陵园,农讲所,海珠广场,市中医院,芳村花园南门总站',
  '[{"name":"东山署前路总站","lng":113.289614,"lat":23.124731},{"name":"中山医","lng":113.285998,"lat":23.127552},{"name":"烈士陵园","lng":113.28013,"lat":23.129439},{"name":"农讲所","lng":113.270226,"lat":23.12932},{"name":"海珠广场","lng":113.26181,"lat":23.116607},{"name":"市中医院","lng":113.236027,"lat":23.111493},{"name":"芳村花园南门总站","lng":113.218871,"lat":23.076651}]',
  '[{"lng":113.289614,"lat":23.124731},{"lng":113.285998,"lat":23.127552},{"lng":113.28013,"lat":23.129439},{"lng":113.270226,"lat":23.12932},{"lng":113.26181,"lat":23.116607},{"lng":113.236027,"lat":23.111493},{"lng":113.218871,"lat":23.076651}]',
  '芳村花园南门总站', '113.218871,23.076651',
  '试点演示线路：覆盖越秀核心医疗区、海珠广场与芳村片区，可在海珠广场与文化公园衔接多条示范路线。',
  12, 1, 89,
  '轮椅坡道,低地板公交,语音提示', 1, '海珠广场换乘电梯,芳村花园总站无障碍坡道', '轮椅/行动不便画像下优先推荐，适合展示跨江可达性与中转核对。',
  1, 0, 0, CURRENT_TIMESTAMP
),
(
  2, '3路', '3路：如意坊总站-东山龟岗总站', 'front/img/a11y-covers/route-2.svg', 2,
  '如意坊总站', '113.240920,23.122762',
  '广医三院,恩宁路永庆坊,上九路,省中医院,中山图书馆,东华东路,东山龟岗总站',
  '[{"name":"如意坊总站","lng":113.24092,"lat":23.122762},{"name":"广医三院","lng":113.24896,"lat":23.120213},{"name":"恩宁路永庆坊","lng":113.244362,"lat":23.118642},{"name":"上九路","lng":113.247655,"lat":23.119683},{"name":"省中医院","lng":113.265638,"lat":23.121566},{"name":"中山图书馆","lng":113.275402,"lat":23.126754},{"name":"东华东路","lng":113.290115,"lat":23.122813},{"name":"东山龟岗总站","lng":113.303311,"lat":23.123792}]',
  '[{"lng":113.24092,"lat":23.122762},{"lng":113.24896,"lat":23.120213},{"lng":113.244362,"lat":23.118642},{"lng":113.247655,"lat":23.119683},{"lng":113.265638,"lat":23.121566},{"lng":113.275402,"lat":23.126754},{"lng":113.290115,"lat":23.122813},{"lng":113.303311,"lat":23.123792}]',
  '东山龟岗总站', '113.303311,23.123792',
  '试点演示线路：连接荔湾历史街区和东山片区，可与16路、64路在如意坊总站/上九路走廊换乘。',
  9, 0, 64,
  '站台盲道,语音播报,导盲犬友好', 1, '中山图书馆与东山龟岗片区平坡通道', '低视力画像下优先推荐，强调语音播报、盲道与老城区步行风险说明。',
  1, 1, 1, CURRENT_TIMESTAMP
),
(
  3, '31路', '31路：解放北路应元路口总站-南石西地铁棣园站总站', 'front/img/a11y-covers/route-3.svg', 2,
  '解放北路应元路口总站', '113.256609,23.135768',
  '西门口人民北路,人民中路,文化公园,沙园,珠江医院,纸厂地铁燕岗站,南石路地铁棣园站,南石西地铁棣园站总站',
  '[{"name":"解放北路应元路口总站","lng":113.256609,"lat":23.135768},{"name":"西门口人民北路","lng":113.249262,"lat":23.128714},{"name":"人民中路","lng":113.248202,"lat":23.124598},{"name":"文化公园","lng":113.245722,"lat":23.111277},{"name":"沙园","lng":113.257035,"lat":23.088728},{"name":"珠江医院","lng":113.263189,"lat":23.080753},{"name":"纸厂地铁燕岗站","lng":113.266275,"lat":23.078136},{"name":"南石路地铁棣园站","lng":113.257237,"lat":23.075964},{"name":"南石西地铁棣园站总站","lng":113.258178,"lat":23.074974}]',
  '[{"lng":113.256609,"lat":23.135768},{"lng":113.249262,"lat":23.128714},{"lng":113.248202,"lat":23.124598},{"lng":113.245722,"lat":23.111277},{"lng":113.257035,"lat":23.088728},{"lng":113.263189,"lat":23.080753},{"lng":113.266275,"lat":23.078136},{"lng":113.257237,"lat":23.075964},{"lng":113.258178,"lat":23.074974}]',
  '南石西地铁棣园站总站', '113.258178,23.074974',
  '试点演示线路：覆盖西门口、文化公园、珠江医院与燕岗站，适合演示南北向换乘骨干线。',
  15, 1, 103,
  '轮椅坡道,电子显示屏', 2, '', '用于演示关键无障碍信息不足时的降级或拒绝推荐行为。',
  0, 0, 0, CURRENT_TIMESTAMP
),
(
  4, '16路', '16路：天字码头-如意坊总站', 'front/img/a11y-covers/route-1.svg', 2,
  '天字码头', '113.273900,23.114200',
  '海珠广场,文化公园,上九路,恩宁路永庆坊,如意坊总站',
  '[{"name":"天字码头","lng":113.2739,"lat":23.1142},{"name":"海珠广场","lng":113.26181,"lat":23.116607},{"name":"文化公园","lng":113.245722,"lat":23.111277},{"name":"上九路","lng":113.247655,"lat":23.119683},{"name":"恩宁路永庆坊","lng":113.244362,"lat":23.118642},{"name":"如意坊总站","lng":113.24092,"lat":23.122762}]',
  '[{"lng":113.2739,"lat":23.1142},{"lng":113.26181,"lat":23.116607},{"lng":113.245722,"lat":23.111277},{"lng":113.247655,"lat":23.119683},{"lng":113.244362,"lat":23.118642},{"lng":113.24092,"lat":23.122762}]',
  '如意坊总站', '113.240920,23.122762',
  '演示补充样本：以海珠广场、文化公园为核心衔接东部与西部，可作为中转首选线路。',
  7, 0, 52,
  '低地板公交,语音播报,站台盲道', 1, '海珠广场换乘电梯,文化公园平坡通道', '随机补充的无障碍样本字段，用于展示多线路中转推荐逻辑。',
  1, 1, 0, CURRENT_TIMESTAMP
),
(
  5, '64路', '64路：中山八路总站-珠江医院', 'front/img/a11y-covers/route-2.svg', 2,
  '中山八路总站', '113.233500,23.125500',
  '如意坊总站,文化公园,海珠广场,江南西,珠江医院',
  '[{"name":"中山八路总站","lng":113.2335,"lat":23.1255},{"name":"如意坊总站","lng":113.24092,"lat":23.122762},{"name":"文化公园","lng":113.245722,"lat":23.111277},{"name":"海珠广场","lng":113.26181,"lat":23.116607},{"name":"江南西","lng":113.2697,"lat":23.0975},{"name":"珠江医院","lng":113.263189,"lat":23.080753}]',
  '[{"lng":113.2335,"lat":23.1255},{"lng":113.24092,"lat":23.122762},{"lng":113.245722,"lat":23.111277},{"lng":113.26181,"lat":23.116607},{"lng":113.2697,"lat":23.0975},{"lng":113.263189,"lat":23.080753}]',
  '珠江医院', '113.263189,23.080753',
  '演示补充样本：串联中山八路、如意坊、海珠广场与珠江医院，适合展示西向转南向换乘。',
  8, 0, 58,
  '轮椅坡道,导盲犬友好,电子站牌', 1, '如意坊总站平坡通道,珠江医院接驳通道', '随机补充的无障碍样本字段，用于演示不同画像下的排序差异。',
  0, 1, 1, CURRENT_TIMESTAMP
),
(
  6, '82路', '82路：广州火车站-沙园', 'front/img/a11y-covers/route-3.svg', 2,
  '广州火车站', '113.264385,23.148469',
  '解放北路应元路口总站,西门口人民北路,海珠广场,江南西,沙园',
  '[{"name":"广州火车站","lng":113.264385,"lat":23.148469},{"name":"解放北路应元路口总站","lng":113.256609,"lat":23.135768},{"name":"西门口人民北路","lng":113.249262,"lat":23.128714},{"name":"海珠广场","lng":113.26181,"lat":23.116607},{"name":"江南西","lng":113.2697,"lat":23.0975},{"name":"沙园","lng":113.257035,"lat":23.088728}]',
  '[{"lng":113.264385,"lat":23.148469},{"lng":113.256609,"lat":23.135768},{"lng":113.249262,"lat":23.128714},{"lng":113.26181,"lat":23.116607},{"lng":113.2697,"lat":23.0975},{"lng":113.257035,"lat":23.088728}]',
  '沙园', '113.257035,23.088728',
  '演示扩展线路：与31路、244路共用西门口和广州火车站节点，当前无障碍字段待补采。',
  4, 0, 41,
  NULL, NULL, NULL, '当前未获得结构化无障碍字段，用于展示覆盖率边界和过滤逻辑。',
  NULL, NULL, NULL, CURRENT_TIMESTAMP
),
(
  7, '106路', '106路：中山图书馆-南石路地铁棣园站', 'front/img/a11y-covers/route-1.svg', 2,
  '中山图书馆', '113.275402,23.126754',
  '农讲所,海珠广场,江南西,纸厂地铁燕岗站,南石路地铁棣园站',
  '[{"name":"中山图书馆","lng":113.275402,"lat":23.126754},{"name":"农讲所","lng":113.270226,"lat":23.12932},{"name":"海珠广场","lng":113.26181,"lat":23.116607},{"name":"江南西","lng":113.2697,"lat":23.0975},{"name":"纸厂地铁燕岗站","lng":113.266275,"lat":23.078136},{"name":"南石路地铁棣园站","lng":113.257237,"lat":23.075964}]',
  '[{"lng":113.275402,"lat":23.126754},{"lng":113.270226,"lat":23.12932},{"lng":113.26181,"lat":23.116607},{"lng":113.2697,"lat":23.0975},{"lng":113.266275,"lat":23.078136},{"lng":113.257237,"lat":23.075964}]',
  '南石路地铁棣园站', '113.257237,23.075964',
  '演示补充样本：从中山图书馆经海珠广场直达燕岗/棣园片区，适合医疗与地铁接驳场景。',
  11, 0, 71,
  '低地板公交,语音播报,盲道接驳', 1, '海珠广场电梯,纸厂地铁燕岗站换乘电梯', '随机补充的无障碍样本字段，用于演示医疗目的地与地铁接驳。',
  1, 1, 0, CURRENT_TIMESTAMP
),
(
  8, '183路', '183路：东山龟岗总站-纸厂地铁燕岗站', 'front/img/a11y-covers/route-2.svg', 2,
  '东山龟岗总站', '113.303311,23.123792',
  '烈士陵园,中山医,海珠广场,珠江医院,纸厂地铁燕岗站',
  '[{"name":"东山龟岗总站","lng":113.303311,"lat":23.123792},{"name":"烈士陵园","lng":113.28013,"lat":23.129439},{"name":"中山医","lng":113.285998,"lat":23.127552},{"name":"海珠广场","lng":113.26181,"lat":23.116607},{"name":"珠江医院","lng":113.263189,"lat":23.080753},{"name":"纸厂地铁燕岗站","lng":113.266275,"lat":23.078136}]',
  '[{"lng":113.303311,"lat":23.123792},{"lng":113.28013,"lat":23.129439},{"lng":113.285998,"lat":23.127552},{"lng":113.26181,"lat":23.116607},{"lng":113.263189,"lat":23.080753},{"lng":113.266275,"lat":23.078136}]',
  '纸厂地铁燕岗站', '113.266275,23.078136',
  '演示补充样本：东山至海珠医疗走廊线路，可在海珠广场或燕岗站接续其他线路。',
  10, 0, 62,
  '轮椅坡道,语音播报', 2, '海珠广场换乘坡道,纸厂地铁燕岗站电梯', '随机补充的无障碍样本字段，用于演示候选但需核对的路线。',
  1, 0, 0, CURRENT_TIMESTAMP
),
(
  9, '244路', '244路：芳村花园南门总站-广州火车站', 'front/img/a11y-covers/route-3.svg', 2,
  '芳村花园南门总站', '113.218871,23.076651',
  '市中医院,文化公园,西门口人民北路,广州火车站',
  '[{"name":"芳村花园南门总站","lng":113.218871,"lat":23.076651},{"name":"市中医院","lng":113.236027,"lat":23.111493},{"name":"文化公园","lng":113.245722,"lat":23.111277},{"name":"西门口人民北路","lng":113.249262,"lat":23.128714},{"name":"广州火车站","lng":113.264385,"lat":23.148469}]',
  '[{"lng":113.218871,"lat":23.076651},{"lng":113.236027,"lat":23.111493},{"lng":113.245722,"lat":23.111277},{"lng":113.249262,"lat":23.128714},{"lng":113.264385,"lat":23.148469}]',
  '广州火车站', '113.264385,23.148469',
  '演示扩展线路：从芳村回到老城北部，当前无障碍字段待补采，可用于演示数据覆盖边界。',
  5, 0, 39,
  NULL, NULL, NULL, '当前未获得结构化无障碍字段，用于展示未覆盖线路的处理方式。',
  NULL, NULL, NULL, CURRENT_TIMESTAMP
),
(
  10, '541路', '541路：中山医-南石西地铁棣园站总站', 'front/img/a11y-covers/route-1.svg', 2,
  '中山医', '113.285998,23.127552',
  '海珠广场,文化公园,珠江医院,南石西地铁棣园站总站',
  '[{"name":"中山医","lng":113.285998,"lat":23.127552},{"name":"海珠广场","lng":113.26181,"lat":23.116607},{"name":"文化公园","lng":113.245722,"lat":23.111277},{"name":"珠江医院","lng":113.263189,"lat":23.080753},{"name":"南石西地铁棣园站总站","lng":113.258178,"lat":23.074974}]',
  '[{"lng":113.285998,"lat":23.127552},{"lng":113.26181,"lat":23.116607},{"lng":113.245722,"lat":23.111277},{"lng":113.263189,"lat":23.080753},{"lng":113.258178,"lat":23.074974}]',
  '南石西地铁棣园站总站', '113.258178,23.074974',
  '演示补充样本：中山医—海珠广场—文化公园—珠江医院—棣园的跨区走廊，适合展示换乘优先排序。',
  13, 0, 86,
  '轮椅坡道,低地板公交,导盲犬友好', 1, '文化公园换乘电梯,珠江医院无障碍通道', '随机补充的无障碍样本字段，适合演示换乘优先与可达性权衡。',
  1, 0, 1, CURRENT_TIMESTAMP
),
(
  11, 'B3A线', 'B3A线：海珠广场-中山八路总站', 'front/img/a11y-covers/route-2.svg', 2,
  '海珠广场', '113.261810,23.116607',
  '文化公园,上九路,恩宁路永庆坊,如意坊总站,中山八路总站',
  '[{"name":"海珠广场","lng":113.26181,"lat":23.116607},{"name":"文化公园","lng":113.245722,"lat":23.111277},{"name":"上九路","lng":113.247655,"lat":23.119683},{"name":"恩宁路永庆坊","lng":113.244362,"lat":23.118642},{"name":"如意坊总站","lng":113.24092,"lat":23.122762},{"name":"中山八路总站","lng":113.2335,"lat":23.1255}]',
  '[{"lng":113.26181,"lat":23.116607},{"lng":113.245722,"lat":23.111277},{"lng":113.247655,"lat":23.119683},{"lng":113.244362,"lat":23.118642},{"lng":113.24092,"lat":23.122762},{"lng":113.2335,"lat":23.1255}]',
  '中山八路总站', '113.233500,23.125500',
  '演示扩展线路：以海珠广场—文化公园—如意坊为主轴，当前无障碍字段待补采。',
  6, 1, 44,
  NULL, NULL, NULL, '当前未获得结构化无障碍字段，用于展示补采优先级。',
  NULL, NULL, NULL, CURRENT_TIMESTAMP
),
(
  12, '旅游1线', '旅游1线：东山署前路总站-芳村花园南门总站', 'front/img/a11y-covers/route-3.svg', 2,
  '东山署前路总站', '113.289614,23.124731',
  '中山图书馆,海珠广场,文化公园,芳村花园南门总站',
  '[{"name":"东山署前路总站","lng":113.289614,"lat":23.124731},{"name":"中山图书馆","lng":113.275402,"lat":23.126754},{"name":"海珠广场","lng":113.26181,"lat":23.116607},{"name":"文化公园","lng":113.245722,"lat":23.111277},{"name":"芳村花园南门总站","lng":113.218871,"lat":23.076651}]',
  '[{"lng":113.289614,"lat":23.124731},{"lng":113.275402,"lat":23.126754},{"lng":113.26181,"lat":23.116607},{"lng":113.245722,"lat":23.111277},{"lng":113.218871,"lat":23.076651}]',
  '芳村花园南门总站', '113.218871,23.076651',
  '演示补充样本：覆盖东山文化区、海珠广场与芳村片区，可作为观光与可达性综合展示线路。',
  9, 0, 55,
  '语音播报,高对比电子站牌,低地板公交', 1, '海珠广场换乘电梯,文化公园平坡通道', '随机补充的无障碍样本字段，用于展示观光线路的可达性说明。',
  1, 0, 0, CURRENT_TIMESTAMP
);

MERGE INTO wangzhangonggao (
  id, biaoti, jianjie, fabushijian, fengmian, neirong,
  thumbsupnum, crazilynum, clicknum, addtime
)
KEY(id)
VALUES
(
  1, '试点范围公告：广州老城区换乘走廊', '当前演示样本已扩展到 12 条路线，围绕海珠广场、文化公园、燕岗站形成可换乘走廊。', CURRENT_DATE, 'front/img/a11y-covers/notice-1.svg',
  '首轮试点仍聚焦广州老城区公共服务走廊，但演示数据库已补充 12 条可互相换乘的示范路线，便于展示无障碍推荐、换乘风险提示和覆盖率边界。',
  6, 0, 26, CURRENT_TIMESTAMP
),
(
  2, '演示模式已就绪：Alt + D 一键启动', '首页支持 Alt + D 打开 10 分钟中期检查演示模式，并可切入换乘讲解。', CURRENT_DATE, 'front/img/a11y-covers/notice-2.svg',
  '演示模式可按首页总览、快捷控制、路线规划、路线详情、实时地图、公告、资源链接、留言反馈、无障碍设置的顺序串讲；推荐加入海珠广场、文化公园、燕岗站三类中转节点演示。',
  5, 0, 18, CURRENT_TIMESTAMP
),
(
  3, '演示账号说明', '如需演示登录态和在线提问，可使用内置 demo 账号。', CURRENT_DATE, 'front/img/a11y-covers/notice-3.svg',
  '演示账号：demo_user / demo123。建议演示输入示例：东山署前路总站 → 珠江医院，或中山图书馆 → 南石西地铁棣园站总站。',
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

DELETE FROM messages;

MERGE INTO messages (
  id, userid, username, content, cpicture, reply, rpicture,
  feedback_type, severity_level, route_id, route_name, station_name,
  handle_status, audit_owner, review_notes, reviewed_at, addtime
)
KEY(id)
VALUES
  (101, 1001, 'demo_user', '海珠广场到纸厂地铁燕岗站的组合推荐很适合演示，建议把换乘电梯提示放得更醒目。', NULL, '已在推荐卡与地图导航页补充换乘设施摘要，并同步优化排版。', NULL, '路线建议', '中', 7, '106路：中山图书馆-南石路地铁棣园站', '海珠广场', '已处理', '演示运营', '用于验证留言页公开列表与已处理状态展示。', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (102, 1002, 'wheelchair_demo', '珠江医院一带如果能补充坡道连续性和临停接驳说明，会更方便轮椅用户判断。', NULL, '已补充医院接驳点样本，并在站点详情中展示临停接驳与厕所信息。', NULL, '站点反馈', '高', 5, '64路：中山八路总站-珠江医院', '珠江医院', '核查中', '演示运营', '保留为核查中样本，便于展示处理流程。', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (103, 1003, 'lowvision_demo', '低视力模式下我更关注盲道和语音播报，建议默认突出这两项。', NULL, '已在低视力画像下强化高对比，并优先展示盲道/语音相关字段。', NULL, '无障碍体验', '中', 4, '16路：天字码头-如意坊总站', '文化公园', '已处理', '演示运营', '用于展示不同画像下的差异化信息排序。', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

MERGE INTO chat (
  id, userid, adminid, ask, reply, isreply, addtime
)
KEY(id)
VALUES
  (11, 1001, NULL, '我需要录制中期检查视频，哪条路线最适合展示换乘？', NULL, 1, DATEADD('MINUTE', -12, CURRENT_TIMESTAMP)),
  (12, 1001, 1, NULL, '建议优先展示 1路、16路、64路、541路，它们能在海珠广场、文化公园和珠江医院形成连续中转走廊。', 0, DATEADD('MINUTE', -11, CURRENT_TIMESTAMP)),
  (13, 1001, NULL, '如果观众想看真正有中转的规划，应当输入什么？', NULL, 1, DATEADD('MINUTE', -9, CURRENT_TIMESTAMP)),
  (14, 1001, 1, NULL, '可直接输入“东山署前路总站 → 珠江医院”或“中山图书馆 → 南石西地铁棣园站总站”，系统会优先返回带中转节点的候选方案。', 0, DATEADD('MINUTE', -8, CURRENT_TIMESTAMP));

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
  (5, '海珠广场', 113.2618100, 23.1166070, 2, 1, 1, 1, 10, 1, 1, '核心换乘节点：可连接多条演示线路并核对换乘设施。', CURRENT_TIMESTAMP),
  (6, '市中医院', 113.2360270, 23.1114930, 2, 1, 0, 1, 6, 1, 0, '医疗节点：适合演示医院到达口说明。', CURRENT_TIMESTAMP),
  (7, '广医三院', 113.2489600, 23.1202130, 2, 1, 0, 1, 6, 1, 0, '医疗节点：适合演示西侧医院访问场景。', CURRENT_TIMESTAMP),
  (8, '省中医院', 113.2656380, 23.1215660, 2, 0, 1, 1, 5, 1, 0, '医院/老城场景：适合展示资源链接和可信度说明。', CURRENT_TIMESTAMP),
  (9, '西门口人民北路', 113.2492620, 23.1287140, 2, 1, 1, 1, 6, 0, 0, '老城换乘点：适合展示步行与路口复杂度风险。', CURRENT_TIMESTAMP),
  (10, '文化公园', 113.2457220, 23.1112770, 2, 1, 1, 1, 6, 1, 0, '换乘节点：适合展示跨区域公交衔接。', CURRENT_TIMESTAMP),
  (11, '珠江医院', 113.2631890, 23.0807530, 2, 1, 0, 1, 8, 1, 1, '医院终点：适合展示海珠片区医疗目的地。', CURRENT_TIMESTAMP),
  (12, '纸厂地铁燕岗站', 113.2662750, 23.0781360, 2, 1, 1, 1, 4, 0, 0, '地铁衔接点：适合展示电梯与换乘设施。', CURRENT_TIMESTAMP),
  (13, '南石路地铁棣园站', 113.2572370, 23.0759640, 2, 1, 1, 1, 4, 0, 0, '终点换乘点：适合展示站点级可达性。', CURRENT_TIMESTAMP),
  (14, '南石西地铁棣园站总站', 113.2581780, 23.0749740, 2, 1, 1, 1, 6, 0, 0, '试点终点总站：适合演示地铁接驳与终点说明。', CURRENT_TIMESTAMP),
  (15, '如意坊总站', 113.2409200, 23.1227620, 1, 1, 1, 1, 6, 0, 0, '西侧演示起点：可与3路、16路、64路衔接。', CURRENT_TIMESTAMP),
  (16, '东山龟岗总站', 113.3033110, 23.1237920, 1, 1, 1, 1, 6, 0, 0, '东侧演示终点：适合对比文化/医疗走廊线路。', CURRENT_TIMESTAMP),
  (17, '广州火车站', 113.2643850, 23.1484690, 1, 1, 1, 1, 10, 1, 1, '北向枢纽：适合演示跨区换乘起点。', CURRENT_TIMESTAMP),
  (18, '江南西', 113.2697000, 23.0975000, 1, 1, 1, 1, 8, 1, 0, '生活服务节点：可衔接海珠中部线路。', CURRENT_TIMESTAMP),
  (19, '沙园', 113.2570350, 23.0887280, 1, 1, 1, 1, 6, 1, 0, '海珠南向换乘点：适合展示南北向转乘。', CURRENT_TIMESTAMP),
  (20, '天字码头', 113.2739000, 23.1142000, 2, 0, 1, 1, 4, 0, 0, '滨水节点：适合演示步行接驳与文化观光场景。', CURRENT_TIMESTAMP),
  (21, '中山八路总站', 113.2335000, 23.1255000, 1, 1, 1, 0, 6, 0, 0, '西向总站：可与如意坊—文化公园走廊联动。', CURRENT_TIMESTAMP),
  (22, '恩宁路永庆坊', 113.2443620, 23.1186420, 2, 0, 1, 1, 4, 0, 0, '历史街区节点：适合演示步行风险提示。', CURRENT_TIMESTAMP),
  (23, '上九路', 113.2476550, 23.1196830, 2, 0, 1, 1, 4, 0, 0, '商业步行街节点：适合演示人流密集场景提示。', CURRENT_TIMESTAMP),
  (24, '人民中路', 113.2482020, 23.1245980, 2, 0, 1, 1, 4, 0, 0, '老城中轴节点：适合演示直达与换乘交织。', CURRENT_TIMESTAMP),
  (25, '芳村花园南门总站', 113.2188710, 23.0766510, 1, 1, 0, 1, 6, 0, 0, '芳村片区总站：适合演示跨江后终点可达性。', CURRENT_TIMESTAMP),
  (26, '中山图书馆', 113.2754020, 23.1267540, 1, 1, 1, 1, 6, 1, 0, '文化服务节点：适合演示学习/办事目的地。', CURRENT_TIMESTAMP),
  (27, '解放北路应元路口总站', 113.2566090, 23.1357680, 1, 1, 1, 0, 6, 0, 0, '北向起点：适合连接广州火车站与老城核心。', CURRENT_TIMESTAMP);

MERGE INTO discussgongjiaoluxian (id, refid, userid, nickname, content, reply, addtime)
KEY(id)
VALUES
  (201, 1, 1001, 'demo_user', '1路 的跨江段如果能补充坡道连续性说明，会更适合轮椅用户决策。', '已记录，将在试点核验阶段补充关键站点连续可达性说明。', DATEADD('MINUTE', -18, CURRENT_TIMESTAMP)),
  (202, 3, 1001, 'demo_user', '31路 的地铁衔接场景很适合演示换乘风险提示。', '已作为演示线路网络中的南北向骨干线保留。', DATEADD('MINUTE', -6, CURRENT_TIMESTAMP)),
  (203, 10, 1001, 'demo_user', '541路 很适合讲海珠广场与文化公园之间的中转逻辑。', '已加入演示脚本，作为多线路换乘推荐的典型案例。', DATEADD('MINUTE', -3, CURRENT_TIMESTAMP));

MERGE INTO discusswangzhangonggao (id, refid, userid, nickname, content, reply, addtime)
KEY(id)
VALUES
  (301, 1, 1001, 'demo_user', '试点范围公告建议直接说明现在有 12 条演示线路和 3 个核心换乘节点。', '已更新公告文案，明确海珠广场、文化公园、燕岗站三类中转节点。', DATEADD('MINUTE', -14, CURRENT_TIMESTAMP)),
  (302, 2, 1001, 'demo_user', '演示模式支持 Alt + D 很适合录屏，也建议串讲换乘走廊。', '已保留手动演示与自动串场两种模式。', DATEADD('MINUTE', -4, CURRENT_TIMESTAMP));


-- ==================== 2026-03-16 演示增强：站点无障碍样本补充 ====================
UPDATE zhandian_wuzhangai
SET wuzhangaijibie = 1,
    shengjiangtai = 1,
    mangdao = 1,
    zhuizhu = 1,
    zuoweishu = 4,
    cesuo = 1,
    tingchechang = 1,
    beizhu = '站厅电梯、盲道导向、低位扶手与志愿服务点已做演示核验'
WHERE zhandianming = '海珠广场';

UPDATE zhandian_wuzhangai
SET wuzhangaijibie = 1,
    shengjiangtai = 1,
    mangdao = 1,
    zhuizhu = 1,
    zuoweishu = 3,
    cesuo = 1,
    tingchechang = 0,
    beizhu = '历史街区换乘节点，补充坡道、电梯和盲道样本'
WHERE zhandianming = '文化公园';

UPDATE zhandian_wuzhangai
SET wuzhangaijibie = 1,
    shengjiangtai = 1,
    mangdao = 1,
    zhuizhu = 1,
    zuoweishu = 5,
    cesuo = 1,
    tingchechang = 1,
    beizhu = '医院门诊接驳点，补充轮椅坡道、导医台和语音提示样本'
WHERE zhandianming = '珠江医院';

UPDATE zhandian_wuzhangai
SET wuzhangaijibie = 1,
    shengjiangtai = 1,
    mangdao = 1,
    zhuizhu = 1,
    zuoweishu = 3,
    cesuo = 1,
    tingchechang = 1,
    beizhu = '地铁换乘口补充坡道、盲道和站外接驳指引样本'
WHERE zhandianming = '纸厂地铁燕岗站';

INSERT INTO zhandian_wuzhangai (zhandianming, jingdu, weidu, wuzhangaijibie, shengjiangtai, mangdao, zhuizhu, zuoweishu, cesuo, tingchechang, beizhu, addtime)
SELECT '江南西', 113.2697000, 23.0975000, 1, 1, 1, 1, 4, 1, 0, '换乘大厅与站外步道已补充电梯、盲道和站牌样本', NOW()
WHERE NOT EXISTS (SELECT 1 FROM zhandian_wuzhangai WHERE zhandianming = '江南西');

UPDATE gongjiaoluxian
SET wuzhangaisheshi = '低地板公交,轮椅坡道,盲道接驳,语音播报',
    diantifacilities = '天字码头低位站牌,海珠广场电梯,文化公园无障碍换乘通道,如意坊总站平坡出入口',
    xunlianzhuankuan = '首末站均预留轮椅转向区，途中重点站点补充导向标识',
    yuyintongbao = 1,
    mangdaozhichi = 1,
    ditezhichi = 1
WHERE id = 4;

UPDATE gongjiaoluxian
SET wuzhangaisheshi = '轮椅坡道,导盲犬友好,电子站牌,语音播报',
    diantifacilities = '如意坊总站平坡通道,文化公园电梯换乘口,海珠广场低位引导标识,珠江医院接驳通道',
    xunlianzhuankuan = '中段重点站点设有轮椅转向区与候车提醒',
    yuyintongbao = 1,
    mangdaozhichi = 1,
    ditezhichi = 1
WHERE id = 5;

UPDATE gongjiaoluxian
SET wuzhangaisheshi = '低地板公交,语音播报,盲道接驳,导盲犬友好',
    diantifacilities = '中山图书馆平坡口,海珠广场电梯,江南西换乘电梯,纸厂地铁燕岗站换乘电梯',
    xunlianzhuankuan = '重点换乘站补充轮椅停靠区与站内导向',
    yuyintongbao = 1,
    mangdaozhichi = 1,
    ditezhichi = 1
WHERE id = 7;

UPDATE gongjiaoluxian
SET wuzhangaisheshi = '轮椅坡道,低地板公交,导盲犬友好,语音播报',
    diantifacilities = '中山医无障碍电梯,文化公园换乘电梯,珠江医院无障碍通道,棣园站坡道接驳',
    xunlianzhuankuan = '换乘节点补充轮椅掉头区和语音提示',
    yuyintongbao = 1,
    mangdaozhichi = 1,
    ditezhichi = 1
WHERE id = 10;
