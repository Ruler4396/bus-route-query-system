
var projectName = '公交线路查询系统';

function resolveAppRuntimeContextPath() {
	try {
		var pathname = window.location.pathname || '';
		var frontIdx = pathname.indexOf('/front/');
		if (frontIdx > 0) {
			return pathname.substring(0, frontIdx);
		}
		var adminIdx = pathname.indexOf('/admin/');
		if (adminIdx > 0) {
			return pathname.substring(0, adminIdx);
		}
		var parts = pathname.split('/').filter(function(part) { return !!part; });
		if (parts.length > 0) {
			return '/' + parts[0];
		}
	} catch (e) {
		console.warn('解析运行上下文失败，回退默认contextPath', e);
	}
	return '/springbootmf383';
}

function resolveAppRuntimeBaseUrl() {
	var origin = window.location.protocol + '//' + window.location.host;
	var contextPath = resolveAppRuntimeContextPath();
	return origin + contextPath + '/';
}

var appContextPath = resolveAppRuntimeContextPath();
var appBaseUrl = resolveAppRuntimeBaseUrl();
window.__APP_CONTEXT_PATH__ = appContextPath;
window.__API_BASE_URL__ = appBaseUrl;
/**
 * 轮播图配置
 */
var swiper = {
	// 设定轮播容器宽度，支持像素和百分比
	width: '100%',
	height: '400px',
	// hover（悬停显示）
	// always（始终显示）
	// none（始终不显示）
	arrow: 'none',
	// default（左右切换）
	// updown（上下切换）
	// fade（渐隐渐显切换）
	anim: 'default',
	// 自动切换的时间间隔
	// 默认3000
	interval: 2000,
	// 指示器位置
	// inside（容器内部）
	// outside（容器外部）
	// none（不显示）
	indicator: 'outside'
}

/**
 * 个人中心菜单
 */
var centerMenu = [{
	name: '个人中心',
	url: '../' + localStorage.getItem('userTable') + '/center.html'
}, 
{
        name: '我的收藏',
        url: '../storeup/list.html'
}
]


var indexNav = [

{
	name: '无障碍路线规划',
	url: './pages/gongjiaoluxian/list.html'
}, 
{
	name: '实时线路地图',
	url: './pages/gongjiaoluxian/map.html'
}, 
{
	name: '出行服务公告',
	url: './pages/wangzhangonggao/list.html'
}, 
{
	name: '留言与改进建议',
	url: './pages/messages/list.html'
},
{
	name: '无障碍资源链接',
	url: './pages/youqinglianjie/list.html'
}
]

var adminurl = appBaseUrl + "admin/dist/index.html";

/**
 * 地图引擎配置
 * provider: auto | gaode | leaflet
 * 1. auto: 有高德key则优先高德，否则自动降级Leaflet
 * 2. gaode: 强制高德，加载失败会降级Leaflet并提示
 * 3. leaflet: 强制Leaflet兜底模式
 *
 * leafletTileMode: online | offline
 * 1. online: 使用在线瓦片服务（默认 OpenStreetMap）
 * 2. offline: 使用本地瓦片服务（如 /springbootmf383/front/tiles/{z}/{x}/{y}.png）
 */
var mapEngineConfig = {
	provider: 'gaode',
	amapKey: '116043f95f5218e800db21bda1cafd00',
	amapVersion: '2.0',
	amapSecurityJsCode: '8526d37e3fd9de964efaf654fe296f9e',
	amapServiceHost: '',
	center: [113.2644, 23.1291],
	zoom: 13,
	dataCoordinateSystem: 'wgs84',
	amapLineSearchCity: '广州',
	leafletTileMode: 'online',
	leafletTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	leafletOnlineTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	leafletOfflineTileUrl: (appContextPath || '/springbootmf383') + '/front/tiles/{z}/{x}/{y}.png',
	leafletOnlineAttribution: '&copy; OpenStreetMap contributors',
	leafletOfflineAttribution: 'Local Tiles',
	leafletMinZoom: 3,
	leafletMaxZoom: 19
}

var cartFlag = false

var chatFlag = false


chatFlag = true


var menu = [{"backMenu":[{"child":[{"appFrontIcon":"cuIcon-cardboard","buttons":["新增","查看","修改","删除"],"menu":"用户","menuJump":"列表","tableName":"yonghu"}],"menu":"用户管理"},{"child":[{"appFrontIcon":"cuIcon-clothes","buttons":["新增","查看","修改","删除","查看评论"],"menu":"公交路线","menuJump":"列表","tableName":"gongjiaoluxian"}],"menu":"公交路线管理"},{"child":[{"appFrontIcon":"cuIcon-full","buttons":["新增","查看","修改","删除","查看评论"],"menu":"网站公告","menuJump":"列表","tableName":"wangzhangonggao"}],"menu":"网站公告管理"},{"child":[{"appFrontIcon":"cuIcon-medal","buttons":["新增","查看","修改","删除"],"menu":"友情链接","menuJump":"列表","tableName":"youqinglianjie"}],"menu":"友情链接管理"},{"child":[{"appFrontIcon":"cuIcon-message","buttons":["查看","修改","回复","删除"],"menu":"留言建议","tableName":"messages"}],"menu":"留言建议"},{"child":[{"appFrontIcon":"cuIcon-copy","buttons":["查看","修改","删除"],"menu":"轮播图管理","tableName":"config"},{"appFrontIcon":"cuIcon-service","buttons":["查看","修改","删除"],"menu":"在线提问","tableName":"chat"}],"menu":"系统管理"}],"frontMenu":[{"child":[{"appFrontIcon":"cuIcon-medal","buttons":["查看"],"menu":"公交路线列表","menuJump":"列表","tableName":"gongjiaoluxian"}],"menu":"公交路线模块"},{"child":[{"appFrontIcon":"cuIcon-taxi","buttons":["查看"],"menu":"网站公告列表","menuJump":"列表","tableName":"wangzhangonggao"}],"menu":"网站公告模块"},{"child":[{"appFrontIcon":"cuIcon-discover","buttons":["查看"],"menu":"友情链接列表","menuJump":"列表","tableName":"youqinglianjie"}],"menu":"友情链接模块"}],"hasBackLogin":"是","hasBackRegister":"否","hasFrontLogin":"否","hasFrontRegister":"否","roleName":"管理员","tableName":"users"},{"backMenu":[{"child":[{"appFrontIcon":"cuIcon-message","buttons":["查看","删除"],"menu":"留言建议","tableName":"messages"}],"menu":"留言建议"}],"frontMenu":[{"child":[{"appFrontIcon":"cuIcon-medal","buttons":["查看"],"menu":"公交路线列表","menuJump":"列表","tableName":"gongjiaoluxian"}],"menu":"公交路线模块"},{"child":[{"appFrontIcon":"cuIcon-taxi","buttons":["查看"],"menu":"网站公告列表","menuJump":"列表","tableName":"wangzhangonggao"}],"menu":"网站公告模块"},{"child":[{"appFrontIcon":"cuIcon-discover","buttons":["查看"],"menu":"友情链接列表","menuJump":"列表","tableName":"youqinglianjie"}],"menu":"友情链接模块"}],"hasBackLogin":"是","hasBackRegister":"否","hasFrontLogin":"是","hasFrontRegister":"是","roleName":"用户","tableName":"yonghu"}]


var isAuth = function (tableName,key) {
    let role = localStorage.getItem("userTable");
    let menus = menu;
    for(let i=0;i<menus.length;i++){
        if(menus[i].tableName==role){
            for(let j=0;j<menus[i].backMenu.length;j++){
                for(let k=0;k<menus[i].backMenu[j].child.length;k++){
                    if(tableName==menus[i].backMenu[j].child[k].tableName){
                        let buttons = menus[i].backMenu[j].child[k].buttons.join(',');
                        return buttons.indexOf(key) !== -1 || false
                    }
                }
            }
        }
    }
    return false;
}

var isFrontAuth = function (tableName,key) {
    let role = localStorage.getItem("userTable");
    let menus = menu;
    for(let i=0;i<menus.length;i++){
        if(menus[i].tableName==role){
            for(let j=0;j<menus[i].frontMenu.length;j++){
                for(let k=0;k<menus[i].frontMenu[j].child.length;k++){
                    if(tableName==menus[i].frontMenu[j].child[k].tableName){
                        let buttons = menus[i].frontMenu[j].child[k].buttons.join(',');
                        return buttons.indexOf(key) !== -1 || false
                    }
                }
            }
        }
    }
    return false;
}
