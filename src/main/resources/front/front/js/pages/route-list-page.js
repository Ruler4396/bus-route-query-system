    var vue = new Vue({
      el: '#app',
      data: {
        dataList: [],
        baseurl: '',
        swiperIndex: '-1',
        isPlanMode: false,
        planMeta: null,
        planNoticeType: '',
        planNoticeText: '',
        a11yStatusText: '请输入起点与终点站名，点击“无障碍推荐”开始。'
      },
      filters: {
        newsDesc: function(val) {
          if (val) {
            if (val.length > 60) {
              return val.substring(0, 60).replace(/<[^>]*>/g).replace(/undefined/g, '');
            }
            return val.replace(/<[^>]*>/g).replace(/undefined/g, '');
          }
          return '';
        }
      },
      methods: {
        isAuth: function(tablename, button) {
          return isFrontAuth(tablename, button);
        },
        jump: function(url) {
          jump(url);
        },
        openRouteDetail: function(item) {
          if (!item || !item.id) return;
          jump(this.routeDetailUrl(item));
        },
        routeDetailUrl: function(item) {
          return '../gongjiaoluxian/detail.html?id=' + item.id;
        },
        onRouteCardKeydown: function(event, item) {
          if (!event) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.openRouteDetail(item);
          }
        },
        getAccessibilityLevelText: function(level) {
          var map = ['完全无障碍', '较高无障碍', '部分无障碍', '障碍较多'];
          var idx = Number(level);
          if (isNaN(idx) || idx < 0 || idx >= map.length) {
            return '暂无';
          }
          return map[idx];
        },
        getDecisionClass: function(item) {
          if (!item || !item.decisionState) return 'warn';
          if (item.decisionState === 'REJECTED') return 'danger';
          if (item.decisionState === 'DEGRADED') return 'warn';
          return 'good';
        },
        getConfidenceClass: function(item) {
          var score = Number(item && item.confidenceScore ? item.confidenceScore : 0);
          if (score >= 80) return 'good';
          if (score >= 60) return 'warn';
          return 'danger';
        }
      }
    });


    layui.use(['layer', 'element', 'laypage', 'http', 'jquery','laydate', 'form'], function() {
	var layer = layui.layer;
	var element = layui.element;
	var laypage = layui.laypage;
	var http = layui.http;
	var jquery = layui.jquery;
	var laydate = layui.laydate;
		var form = layui.form;
	var routeStatePanel = FrontPageState.createPanel({
		mount: function() { return document.querySelector('.page-route-list .list'); },
		onAction: function(actionMode) {
			if (actionMode === 'reset-filters') {
				jquery('#luxianmingcheng, #qidianzhanming, #tujingzhandian, #zhongdianzhanming').val('');
				jquery('#preferenceType').val('AUTO');
				form.render('select');
				clearPlanNotice();
			}
			pageList();
		}
	});

	function applyRouteStateForList(res, hasFilters) {
		var list = (res && res.data && jquery.isArray(res.data.list)) ? res.data.list : [];
		var total = (res && res.data && typeof res.data.total === 'number') ? res.data.total : list.length;
		vue.dataList = list;
		if (!list.length) {
			clearPager();
			routeStatePanel.setEmpty({
				title: hasFilters ? '未找到符合条件的路线' : '当前暂无可展示路线',
				description: hasFilters ? '可减少筛选条件，或直接查看 1路、3路、31路这三条试点重点线路。' : '当前页没有可展示结果，可稍后刷新，或切换到实时地图继续查看试点线路。',
				count: total,
				actionLabel: hasFilters ? '清空筛选并重试' : '重新加载',
				actionMode: hasFilters ? 'reset-filters' : 'reload',
				sourceLabel: '当前环境：试点演示数据'
			});
			return;
		}
		routeStatePanel.setReady(total, {
			title: vue.isPlanMode ? '推荐结果已生成' : '路线数据已同步',
			description: vue.isPlanMode ? '当前展示无障碍推荐结果，可切换到地图页继续核对站点和 ETA。' : '当前展示首轮试点范围内的路线数据，可按关键词筛选。',
			sparseThreshold: 4,
			sparseText: '当前仅展示首轮试点的重点线路（1路、3路、31路），属于试点样本，数量有限但可完整演示。',
			sourceLabel: '当前环境：试点演示数据'
		});
	}

	var limit = 8;
    limit = 3 * 2;
	vue.baseurl = http.baseurl;
      // 分页列表
      pageList();

	      // 搜索按钮
	      jquery('#btn-search').click(function(e) {
	        pageList();
	      });

	      // 无障碍推荐按钮
	      jquery('#btn-plan').click(function(e) {
	        planAccessibleRoutes();
	      });

	      function clearPager() {
	        jquery('#pager').html('');
	      }

	      function setPlanNotice(type, text) {
	        vue.planNoticeType = type || '';
	        vue.planNoticeText = text || '';
			vue.a11yStatusText = text || '可输入筛选条件后开始查询。';
			if (window.AccessibilityUtils && text) {
			  AccessibilityUtils.announce(text);
			}
	      }

	      function clearPlanNotice() {
	        setPlanNotice('', '');
	      }

	      function pageList() {
        routeStatePanel.setLoading({
          title: '正在加载路线数据',
          description: '系统正在同步试点范围内的路线，请稍候。',
          sourceLabel: '当前环境：试点演示数据'
        });
        var param = {
          page: 1,
          limit: limit
        };

        if (jquery('#luxianmingcheng').val()) {
          param['luxianmingcheng'] = '%' + jquery('#luxianmingcheng').val() + '%';
        }
        if (jquery('#qidianzhanming').val()) {
          param['qidianzhanming'] = '%' + jquery('#qidianzhanming').val() + '%';
        }
        if (jquery('#tujingzhandian').val()) {
          param['tujingzhandian'] = '%' + jquery('#tujingzhandian').val() + '%';
        }
        if (jquery('#zhongdianzhanming').val()) {
          param['zhongdianzhanming'] = '%' + jquery('#zhongdianzhanming').val() + '%';
        }

        var hasFilters = !!(jquery('#luxianmingcheng').val() || jquery('#qidianzhanming').val() || jquery('#tujingzhandian').val() || jquery('#zhongdianzhanming').val());

        http.request('gongjiaoluxian/list', 'get', param, function(res) {
          vue.isPlanMode = false;
          vue.planMeta = null;
          clearPlanNotice();
          applyRouteStateForList(res, hasFilters);
          laypage.render({
            elem: 'pager',
            count: res.data.total,
            limit: limit,
            groups: 5,
            layout: ['prev','page','next'],
            theme: '#B7BA6B',
            jump: function(obj, first) {
              param.page = obj.curr;
              if (!first) {
                http.request('gongjiaoluxian/list', 'get', param, function(innerRes) {
                  applyRouteStateForList(innerRes, hasFilters);
                }, {
                  silentError: true,
                  onError: function() {
                    vue.dataList = [];
                    clearPager();
                    routeStatePanel.setError({
                      title: '路线列表加载失败',
                      description: '请求分页数据失败，请稍后重试或检查开发实例。',
                      actionLabel: '重新加载',
                      actionMode: 'reload',
                      sourceLabel: '当前环境：试点演示数据'
                    });
                  }
                });
              }
            }
          });
        }, {
          silentError: true,
          onError: function() {
            vue.isPlanMode = false;
            clearPlanNotice();
            vue.dataList = [];
            clearPager();
            routeStatePanel.setError({
              title: '路线列表加载失败',
              description: '未能获取路线数据，请稍后重试或检查开发实例服务。',
              actionLabel: '重新加载',
              actionMode: 'reload',
              sourceLabel: '当前环境：试点演示数据'
            });
          }
        });
      }

      function planAccessibleRoutes() {
	        var startStation = jquery.trim(jquery('#qidianzhanming').val() || '');
	        var endStation = jquery.trim(jquery('#zhongdianzhanming').val() || '');

	        if (!startStation || !endStation) {
	          setPlanNotice('warn', '请先输入起点站名和终点站名，再执行无障碍推荐');
	          layer.msg('请先输入起点站名和终点站名');
	          return;
	        }

	        var param = {
	          startStation: startStation,
	          endStation: endStation,
	          preferenceType: jquery('#preferenceType').val() || 'AUTO',
	          profileType: jquery('#profileType').val() || 'AUTO'
	        };
	        var userId = localStorage.getItem('userid');
	        if (userId && userId !== 'null' && userId !== 'undefined') {
	          param.userId = userId;
	        }

	        setPlanNotice('info', '正在计算推荐路线，请稍候...');
        routeStatePanel.setLoading({
          title: '正在计算推荐路线',
          description: '系统正在结合起终点、偏好与试点线路数据生成推荐，请稍候。',
          sourceLabel: '推荐范围：首轮试点线路'
        });
	        var loadingIndex = layer.load(1, {
	          shade: [0.1, '#fff']
	        });

	        jquery.ajax({
	          url: http.baseurl + 'route/plan',
	          type: 'get',
	          data: param,
	          dataType: 'json',
	          beforeSend: function(request) {
	            request.setRequestHeader("Token", localStorage.getItem("Token"));
	          },
	          success: function(res) {
	            if (!res || res.code !== 0) {
	              vue.isPlanMode = true;
	              vue.dataList = [];
	              clearPager();
	              setPlanNotice('error', (res && res.msg) ? res.msg : '推荐服务返回异常，请稍后重试');
	              return;
	            }

	            var routeResults = (res.data && res.data.list && jquery.isArray(res.data.list)) ? res.data.list : [];
	            var list = [];
	            routeResults.forEach(function(result) {
	              if (!result || !result.route) {
	                return;
	              }
	              var route = result.route;
	              route.accessibilityScore = Number(result.accessibilityScore || 0);
	              route.totalScore = Number(result.totalScore || 0);
	              route.recommendationReason = result.recommendationReason || '暂无推荐理由';
	              route.accessibilityLevelText = result.accessibilityLevelText || '';
	              route.voiceAnnounceText = result.voiceAnnounceText || '';
	              route.blindPathSupportText = result.blindPathSupportText || '';
	              route.guideDogSupportText = result.guideDogSupportText || '';
	              route.isRecommended = true;
	              route.resolvedProfileLabel = result.resolvedProfileLabel || '';
	              route.resolvedPreferenceType = result.resolvedPreferenceType || '';
	              route.resolvedPreferenceLabel = result.resolvedPreferenceLabel || '';
	              route.confidenceScore = Number(result.confidenceScore || 0);
	              route.confidenceLevelText = result.confidenceLevelText || '';
	              route.dataSourceText = result.dataSourceText || '';
	              route.dataUpdatedAtText = result.dataUpdatedAtText || '';
	              route.riskHints = result.riskHints || [];
	              route.decisionState = result.decisionState || '';
	              route.decisionStateText = result.decisionStateText || '';
	              route.decisionMessage = result.decisionMessage || '';
	              list.push(route);
	            });

	            vue.isPlanMode = true;
	            vue.planMeta = {
	              count: Number(res.data.count || 0),
	              evaluatedCount: Number(res.data.evaluatedCount || list.length),
	              rejectedCount: Number(res.data.rejectedCount || 0),
	              profileLabel: res.data.resolvedProfileLabel || '通用',
	              preferenceType: res.data.preferenceType || param.preferenceType,
	              preferenceLabel: res.data.preferenceLabel || '',
	              decisionState: res.data.decisionState || 'OK',
	              decisionStateText: res.data.decisionState === 'REJECT' ? '暂不推荐' : (res.data.decisionState === 'CAUTION' ? '有风险，谨慎核对' : '已生成推荐'),
	              actionHints: res.data.actionHints || [],
	              riskHints: res.data.riskHints || [],
	              rejectedRoutes: res.data.rejectedRoutes || []
	            };
	            vue.dataList = list;
	            clearPager();

	            if (!list.length) {
	              setPlanNotice(res.data.decisionState === 'REJECT' ? 'error' : 'warn', res.data.decisionState === 'REJECT' ? '关键无障碍数据不足，当前不直接推荐任何路线，请参考风险提示与已过滤路线。' : '未找到匹配路线，请调整起终点或偏好后重试');
	              layer.msg(res.data.decisionState === 'REJECT' ? '关键无障碍数据不足，暂不推荐路线' : '未找到匹配路线，请调整起终点后重试');
	              return;
	            }

	            setPlanNotice(res.data.rejectedCount > 0 ? 'warn' : 'success', res.data.rejectedCount > 0 ? ('已返回 ' + list.length + ' 条候选路线，并过滤 ' + res.data.rejectedCount + ' 条关键数据不足的路线') : ('已返回 ' + list.length + ' 条推荐路线'));
	          },
	          error: function(xhr, status, error) {
	            vue.isPlanMode = true;
	            vue.dataList = [];
	            clearPager();
	            setPlanNotice('error', '推荐接口请求失败：' + (error || status || '未知错误'));
	            layer.msg('推荐接口请求失败，请检查后端服务');
	          },
	          complete: function() {
	            layer.close(loadingIndex);
	          }
	        });
	      }
	    });

    window.xznSlide = function() {
      jQuery(".banner").slide({mainCell:".bd ul",autoPlay:true,interTime:5000});
      jQuery("#ifocus").slide({ titCell:"#ifocus_btn li", mainCell:"#ifocus_piclist ul",effect:"leftLoop", delayTime:200, autoPlay:true,triggerTime:0});
      jQuery("#ifocus").slide({ titCell:"#ifocus_btn li", mainCell:"#ifocus_tx ul",delayTime:0, autoPlay:true});
      jQuery(".product_list").slide({mainCell:".bd ul",autoPage:true,effect:"leftLoop",autoPlay:true,vis:5,trigger:"click",interTime:4000});
    };
  