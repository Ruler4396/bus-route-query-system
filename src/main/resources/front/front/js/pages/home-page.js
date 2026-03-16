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

			function shouldHideAutoDemoNotice(item) {
				var rawTitle = item && item.biaoti ? String(item.biaoti) : '';
				var normalized = rawTitle.replace(/\s+/g, '');
				if (!normalized) return false;
				return /10分钟演示|10分鐘演示|自动演示|演示模式已就绪|Alt\+D/i.test(normalized);
			}

			function filterRecommendList(list, options) {
				if (!Array.isArray(list)) return [];
				if (options && typeof options.listFilter === 'function') {
					return list.filter(options.listFilter);
				}
				return list;
			}

			function applyHomeRecommendState(panel, list, options) {
				var count = list.length;
				if (!count) {
					panel.setEmpty({
						title: options.emptyTitle,
						description: options.emptyDescription,
						count: 0,
						actionLabel: options.actionLabel,
						actionMode: 'goto-list',
						});
					return;
				}
				panel.setReady(count, {
					title: options.readyTitle,
					description: options.readyDescription,
				});
			}





			function requestRecommend(endpoint, targetKey, panel, options) {
				http.request(endpoint, 'get', {
					page: 1,
					limit: 4
				}, function(res) {
					var rawList = (res.data && res.data.list) ? res.data.list : [];
					vue[targetKey] = filterRecommendList(rawList, options);
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
								});
					}
				});
			}

			requestRecommend('gongjiaoluxian/autoSort', 'gongjiaoluxianRecommend', routeRecommendState, {
				emptyTitle: '首页暂无路线推荐',
				emptyDescription: '当前没有可展示的路线推荐，可进入完整路线页继续查看。',
				errorTitle: '首页路线推荐加载失败',
				errorDescription: '当前无法加载路线推荐，可进入路线列表继续查看。',
				actionLabel: '打开路线清单',
			});
			requestRecommend('wangzhangonggao/autoSort', 'wangzhangonggaoRecommend', noticeRecommendState, {
				emptyTitle: '首页暂无公告推荐',
				emptyDescription: '当前没有可展示的公告推荐，可进入公告页继续查看。',
				errorTitle: '首页公告推荐加载失败',
				errorDescription: '当前无法加载公告推荐，可进入公告页继续查看。',
				actionLabel: '打开公告页',
				listFilter: function(item) {
					return !shouldHideAutoDemoNotice(item);
				}
			});
			requestRecommend('youqinglianjie/autoSort', 'youqinglianjieRecommend', linkRecommendState, {
				emptyTitle: '首页暂无资源推荐',
				emptyDescription: '当前没有可展示的资源链接，可进入资源页继续查看。',
				errorTitle: '首页资源推荐加载失败',
				errorDescription: '当前无法加载资源推荐，可进入资源页继续查看。',
				actionLabel: '打开资源页',
			});
	  });

  window.xznSlide = function() {
    // jQuery(".banner").slide({mainCell:".bd ul",autoPlay:true,interTime:5000});
    jQuery("#ifocus").slide({ titCell:"#ifocus_btn li", mainCell:"#ifocus_piclist ul",effect:"leftLoop", delayTime:200, autoPlay:true,triggerTime:0});
    jQuery("#ifocus").slide({ titCell:"#ifocus_btn li", mainCell:"#ifocus_tx ul",delayTime:0, autoPlay:true});
    jQuery(".product_list").slide({mainCell:".bd ul",autoPage:true,effect:"leftLoop",autoPlay:true,vis:5,trigger:"click",interTime:4000});
  };
