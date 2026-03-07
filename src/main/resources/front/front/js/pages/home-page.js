    var vue = new Vue({
      el: '#app',
      data: {

        gongjiaoluxianRecommend: [],
        wangzhangonggaoRecommend: [],
        youqinglianjieRecommend: [],

        newsList: [],
        leftNewsList: [],
        rightNewsList: [],
	baseurl:''
      },
      filters: {
        newsDesc: function(val) {
          if (val) {
            val = val.replace(/<[^<>]+>/g, '').replace(/undefined/g, '');
            if (val.length > 60) {
              val = val.substring(0, 60);
            }

            return val;
          }
          return '';
        }
      },
      methods: {
        jump(url) {
          	jump(url)
        },
        openCardByKeyboard(event, url) {
          if (!event) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.jump(url);
          }
        }
      }
    });

    layui.use(['layer', 'form', 'element', 'http', 'jquery'], function() {
			var layer = layui.layer;
			var element = layui.element;
			var form = layui.form;
			var http = layui.http;
			var jquery = layui.jquery;
			vue.baseurl = http.baseurl;

			var routeRecommendState = FrontPageState.createPanel({
				mount: function() {
					var title = document.getElementById('route-recommend-title');
					return title ? title.closest('.home-unified-section').querySelector('.home-unified-grid') : null;
				},
				onAction: function() { vue.jump('../gongjiaoluxian/list.html'); }
			});
			var noticeRecommendState = FrontPageState.createPanel({
				mount: function() {
					var title = document.getElementById('notice-recommend-title');
					return title ? title.closest('.home-unified-section').querySelector('.home-unified-grid') : null;
				},
				onAction: function() { vue.jump('../wangzhangonggao/list.html'); }
			});
			var linkRecommendState = FrontPageState.createPanel({
				mount: function() {
					var title = document.getElementById('link-recommend-title');
					return title ? title.closest('.home-unified-section').querySelector('.home-unified-grid') : null;
				},
				onAction: function() { vue.jump('../youqinglianjie/list.html'); }
			});

			function applyHomeRecommendState(panel, list, options) {
				var count = list.length;
				if (!count) {
					panel.setEmpty({
						title: options.emptyTitle,
						description: options.emptyDescription,
						count: 0,
						actionLabel: options.actionLabel,
						actionMode: 'goto-list',
						sourceLabel: '当前环境：试点演示数据'
					});
					return;
				}
				panel.setReady(count, {
					title: options.readyTitle,
					description: options.readyDescription,
					sparseThreshold: options.sparseThreshold,
					sparseText: options.sparseText,
					sourceLabel: '当前环境：试点演示数据'
				});
			}

			routeRecommendState.setLoading({
				title: '正在加载首页路线推荐',
				description: '系统正在同步试点线路推荐，请稍候。',
				sourceLabel: '当前环境：试点演示数据'
			});
			noticeRecommendState.setLoading({
				title: '正在加载首页公告推荐',
				description: '系统正在同步公告内容，请稍候。',
				sourceLabel: '当前环境：试点演示数据'
			});
			linkRecommendState.setLoading({
				title: '正在加载首页资源推荐',
				description: '系统正在同步无障碍资源链接，请稍候。',
				sourceLabel: '当前环境：试点演示数据'
			});

			function requestRecommend(endpoint, targetKey, panel, options) {
				http.request(endpoint, 'get', {
					page: 1,
					limit: 4
				}, function(res) {
					vue[targetKey] = (res.data && res.data.list) ? res.data.list : [];
					applyHomeRecommendState(panel, vue[targetKey], options);
				}, {
					silentError: true,
					onError: function() {
						vue[targetKey] = [];
						panel.setError({
							title: options.errorTitle,
							description: options.errorDescription,
							actionLabel: options.actionLabel,
							actionMode: 'goto-list',
							sourceLabel: '当前环境：试点演示数据'
						});
					}
				});
			}

			requestRecommend('gongjiaoluxian/autoSort', 'gongjiaoluxianRecommend', routeRecommendState, {
				readyTitle: '首页路线推荐已同步',
				readyDescription: '当前首页展示的是首轮试点线路，可继续进入路线详情与地图页。',
				emptyTitle: '首页暂无路线推荐',
				emptyDescription: '当前没有可展示的路线推荐，可进入完整路线页继续查看。',
				errorTitle: '首页路线推荐加载失败',
				errorDescription: '当前无法加载路线推荐，可进入路线列表继续查看。',
				actionLabel: '打开路线清单',
				sparseThreshold: 4,
				sparseText: '首页路线推荐当前只展示首轮试点线路样本，数量有限但适合演示。'
			});
			requestRecommend('wangzhangonggao/autoSort', 'wangzhangonggaoRecommend', noticeRecommendState, {
				readyTitle: '首页公告推荐已同步',
				readyDescription: '当前首页公告推荐已完成加载，可继续进入公告页查看试点说明与演示提示。',
				emptyTitle: '首页暂无公告推荐',
				emptyDescription: '当前没有可展示的公告推荐，可进入公告页继续查看。',
				errorTitle: '首页公告推荐加载失败',
				errorDescription: '当前无法加载公告推荐，可进入公告页继续查看。',
				actionLabel: '打开公告页',
				sparseThreshold: 4,
				sparseText: '公告条目仍属于试点样本，数量有限，但足以说明边界、演示模式和演示账号。'
			});
			requestRecommend('youqinglianjie/autoSort', 'youqinglianjieRecommend', linkRecommendState, {
				readyTitle: '首页资源推荐已同步',
				readyDescription: '当前首页资源推荐已完成加载，可继续进入资源页查看外部数据来源。',
				emptyTitle: '首页暂无资源推荐',
				emptyDescription: '当前没有可展示的资源链接，可进入资源页继续查看。',
				errorTitle: '首页资源推荐加载失败',
				errorDescription: '当前无法加载资源推荐，可进入资源页继续查看。',
				actionLabel: '打开资源页',
				sparseThreshold: 5,
				sparseText: '当前友情链接样本量有限，但已覆盖 Wheelmap、OpenStreetMap、开放广东等主要数据来源。'
			});
	  });

  window.xznSlide = function() {
    // jQuery(".banner").slide({mainCell:".bd ul",autoPlay:true,interTime:5000});
    jQuery("#ifocus").slide({ titCell:"#ifocus_btn li", mainCell:"#ifocus_piclist ul",effect:"leftLoop", delayTime:200, autoPlay:true,triggerTime:0});
    jQuery("#ifocus").slide({ titCell:"#ifocus_btn li", mainCell:"#ifocus_tx ul",delayTime:0, autoPlay:true});
    jQuery(".product_list").slide({mainCell:".bd ul",autoPage:true,effect:"leftLoop",autoPlay:true,vis:5,trigger:"click",interTime:4000});
  };
