var ROUTE_MAP_SELECTION_KEY = 'routeMapSelection';
var DEFAULT_ROUTE_STATUS_TEXT = '输入起点和终点';
var ROUTE_STATION_SUGGESTION_LIMIT = 12;
var ROUTE_STATION_INDEX_CACHE = null;
var ROUTE_STATION_INDEX_PROMISE = null;
var ROUTE_AMAP_SDK_PROMISE = null;
var ROUTE_RESULTS_SCROLL_TIMERS = [];
var ROUTE_INPUT_RESOLUTION_STATE = { start: null, end: null };
var ROUTE_FIELD_REQUEST_SEQ = { start: 0, end: 0 };
var ACTIVE_LIST_RESOLUTION = { start: null, end: null };
var ROUTE_PICKER_CONTEXT = {
  layerIndex: null,
  field: '',
  stations: [],
  map: null,
  marker: null,
  clickedPoint: null,
  candidates: [],
  selectedCandidate: null,
  tileLayer: null,
  engineType: '',
  focusField: 'start',
  contextPoint: null,
  contextMenuBound: false,
  contextEventStamp: 0
};
var ROUTE_FIELD_CONFIG = {
  start: {
    inputSelector: '#qidianzhanming',
    hintSelector: '#startResolvedHint',
    pickerSelector: '#btn-pick-start',
    label: '出发地',
    defaultHint: '未选择',
    pickerTitle: '地图选出发地'
  },
  end: {
    inputSelector: '#zhongdianzhanming',
    hintSelector: '#endResolvedHint',
    pickerSelector: '#btn-pick-end',
    label: '目的地',
    defaultHint: '未选择',
    pickerTitle: '地图选目的地'
  }
};
var ROUTE_STATION_ALIAS_MAP = {
  '中山医': ['中山大学附属第一医院', '中山一院', '中山医地铁站'],
  '海珠广场': ['海珠广场地铁站', '海珠广场附近'],
  '文化公园': ['文化公园地铁站', '文化公园附近'],
  '珠江医院': ['珠江医院门诊', '珠江医院住院部', '珠江医院附近'],
  '纸厂地铁燕岗站': ['燕岗站', '燕岗地铁站', '纸厂'],
  '南石西地铁棣园站总站': ['棣园站', '棣园总站', '南石西棣园站'],
  '南石路地铁棣园站': ['棣园站'],
  '恩宁路永庆坊': ['永庆坊', '恩宁路'],
  '广州火车站': ['广州站'],
  '烈士陵园': ['烈士陵园地铁站'],
  '江南西': ['江南西地铁站'],
  '西门口人民北路': ['西门口', '西门口地铁站'],
  '中山图书馆': ['中图'],
  '如意坊总站': ['如意坊'],
  '解放北路应元路口总站': ['应元路口'],
  '芳村花园南门总站': ['芳村花园']
};

// Phase 2A split: core logic moved to route-list-core.js and route-list-picker.js

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
    a11yStatusText: DEFAULT_ROUTE_STATUS_TEXT
  },
  methods: {
    isAuth: function(tablename, button) {
      return isFrontAuth(tablename, button);
    },
    jump: function(url) {
      jump(url);
    },
    routeDetailUrl: function(item) {
      return '../gongjiaoluxian/detail.html?id=' + item.id;
    },
    openRouteDetail: function(item) {
      if (!item || !item.id) return;
      jump(this.routeDetailUrl(item));
    },
    clearStoredMapSelection: function() {
      try {
        localStorage.removeItem(ROUTE_MAP_SELECTION_KEY);
      } catch (e) {}
    },
    buildMapSelection: function(item, index) {
      return {
        selectedAt: Date.now(),
        routeIndex: typeof index === 'number' ? index : 0,
        isPlanMode: !!this.isPlanMode,
        fromKeyword: normalizeRouteText(document.getElementById('qidianzhanming') && document.getElementById('qidianzhanming').value),
        toKeyword: normalizeRouteText(document.getElementById('zhongdianzhanming') && document.getElementById('zhongdianzhanming').value),
        startSelection: cloneRouteData(getResolvedField('start')),
        endSelection: cloneRouteData(getResolvedField('end')),
        planMeta: cloneRouteData(this.planMeta),
        route: cloneRouteData(item)
      };
    },
    persistRouteSelection: function(item, index) {
      if (!item) return;
      try {
        localStorage.setItem(ROUTE_MAP_SELECTION_KEY, JSON.stringify(this.buildMapSelection(item, index)));
      } catch (e) {
        console.warn('保存地图选中路线失败', e);
      }
    },
    openMapNavigation: function(item, index) {
      if (!item) {
        this.openMapHub();
        return;
      }
      this.persistRouteSelection(item, index);
      if (window.AccessibilityUtils) {
        AccessibilityUtils.announce('正在进入地图并开始当前出行方案', 'polite', { interrupt: true });
      }
      openRouteMapPage();
    },
    openMapHub: function() {
      if (this.isPlanMode && this.dataList && this.dataList.length) {
        this.openMapNavigation(this.dataList[0], 0);
        return;
      }
      this.clearStoredMapSelection();
      openRouteMapPage();
    },
    onRouteCardKeydown: function(event, item, index) {
      if (!event) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.openMapNavigation(item, index);
      }
    },
    getAccessibilityLevelText: function(level) {
      var map = ['完全无障碍', '较高无障碍', '部分无障碍', '障碍较多'];
      var idx = Number(level);
      if (isNaN(idx) || idx < 0 || idx >= map.length) {
        return '待补充';
      }
      return map[idx];
    },
    getDecisionClass: function(item) {
      if (!item || !item.decisionState) return 'warn';
      if (item.decisionState === 'REJECTED' || item.decisionState === 'REJECT') return 'danger';
      if (item.decisionState === 'DEGRADED' || item.decisionState === 'CAUTION') return 'warn';
      return 'good';
    },
    getConfidenceClass: function(item) {
      var score = Number(item && item.confidenceScore ? item.confidenceScore : 0);
      if (score >= 80) return 'good';
      if (score >= 60) return 'warn';
      return 'danger';
    },
    shouldShowConfidence: function(item) {
      if (!item || !item.isRecommended) return false;
      var score = Number(item.confidenceScore || 0);
      return score > 0 || hasMeaningfulRouteText(item.confidenceLevelText);
    },
    formatConfidence: function(item) {
      if (!item) return '';
      var score = Number(item.confidenceScore || 0);
      if (score > 0) {
        return score.toFixed(0);
      }
      return normalizeRouteText(item.confidenceLevelText);
    },
    formatRouteRank: function(index) {
      var value = Number(index || 0) + 1;
      return value < 10 ? '0' + value : String(value);
    },
    extractDistanceLabel: function(text) {
      var match = normalizeRouteText(text).match(/([0-9]+(?:\.[0-9]+)?\s*(?:米|公里))/);
      return match ? match[1] : '';
    },
    getTransferCount: function(item) {
      var count = 0;
      ((item && item.segments) || []).forEach(function(segment) {
        var type = normalizeRouteText(segment && segment.type);
        var title = normalizeRouteText(segment && segment.title);
        if (type.indexOf('transfer') >= 0 || title.indexOf('换乘') >= 0) {
          count += 1;
        }
      });
      return count || (item && item.transferRequired ? 1 : 0);
    },
    getRouteLineLabel: function(item) {
      return normalizeRouteText(item && (item.luxianbianhao || item.luxianmingcheng)) || '候选方案';
    },
    getRouteTransferBadge: function(item) {
      var count = this.getTransferCount(item);
      return count > 0 ? count + ' 次换乘' : '直达';
    },
    getRouteKindLabel: function(item) {
      if (!item) return '';
      if (item.transferRequired) return '完整换乘方案';
      return item.isRecommended ? '完整出行方案' : '';
    },
    hasRouteKindLabel: function(item) {
      return !!normalizeRouteText(this.getRouteKindLabel(item));
    },
    getRoutePathText: function(item) {
      if (!item) return '点击后进入地图查看';
      var labels = [];
      var fromQuery = normalizeRouteText(item.startSelection && item.startSelection.queryText);
      var fromStation = normalizeRouteText(item.boardingStationName || item.qidianzhanming);
      var toStation = normalizeRouteText(item.alightingStationName || item.zhongdianzhanming);
      var toQuery = normalizeRouteText(item.endSelection && item.endSelection.queryText);
      if (fromQuery) labels.push(fromQuery);
      if (fromStation) labels.push(fromStation);
      labels.push(this.getTransferCount(item) > 0 ? '换乘' : '乘车');
      if (toStation) labels.push(toStation);
      if (toQuery) labels.push(toQuery);
      return labels.join(' · ');
    },
    getRouteFirstMileBadge: function(item) {
      var distance = this.extractDistanceLabel(item && item.firstMileText);
      return distance ? '上车前 ' + distance : '就近上车';
    },
    getRouteLastMileBadge: function(item) {
      var distance = this.extractDistanceLabel(item && item.lastMileText);
      return distance ? '下车后 ' + distance : '就近到达';
    },
    formatRouteScore: function(value) {
      var score = Number(value || 0);
      if (isNaN(score) || score <= 0) {
        return '—';
      }
      return score.toFixed(1) + ' 分';
    },
    formatRouteMinutes: function(value) {
      var minutes = Number(value || 0);
      if (isNaN(minutes) || minutes <= 0) {
        return '待估算';
      }
      if (minutes < 60) {
        return Math.round(minutes) + ' 分';
      }
      var hours = Math.floor(minutes / 60);
      var remain = Math.round(minutes % 60);
      return remain ? hours + ' 小时 ' + remain + ' 分' : hours + ' 小时';
    },
    formatRouteDistance: function(value) {
      return formatDistanceMeters(value) || '待估算';
    },
    getRouteJourneyText: function(item) {
      if (!item) return '待确认区间';
      var from = normalizeRouteText(item.boardingStationName || item.qidianzhanming) || '待确认起点';
      var to = normalizeRouteText(item.alightingStationName || item.zhongdianzhanming) || '待确认终点';
      return from + ' → ' + to;
    },
    getRouteMetrics: function(item) {
      return item && item.routeMetrics ? item.routeMetrics : null;
    },
    getRouteEstimatedDuration: function(item) {
      var metrics = this.getRouteMetrics(item);
      return metrics ? this.formatRouteMinutes(metrics.estimatedTotalMinutes) : '待估算';
    },
    getRouteEstimatedArrival: function(item) {
      var metrics = this.getRouteMetrics(item);
      return metrics && metrics.expectedArrivalTimeText ? metrics.expectedArrivalTimeText : '';
    },
    getRouteStartWalkText: function(item) {
      var metrics = this.getRouteMetrics(item);
      return metrics ? this.formatRouteDistance(metrics.firstWalkDistanceMeters) : '待估算';
    },
    getRouteEndWalkText: function(item) {
      var metrics = this.getRouteMetrics(item);
      return metrics ? this.formatRouteDistance(metrics.lastWalkDistanceMeters) : '待估算';
    },
    getRouteTotalWalkText: function(item) {
      var metrics = this.getRouteMetrics(item);
      return metrics ? this.formatRouteDistance(metrics.totalWalkDistanceMeters) : '待估算';
    },
    getRouteRideDistanceText: function(item) {
      var metrics = this.getRouteMetrics(item);
      return metrics ? this.formatRouteDistance(metrics.rideDistanceMeters) : '待估算';
    },
    getRecommendationReason: function(item) {
      return normalizeRouteText(item && (item.recommendationReason || item.decisionMessage || item.fullJourneyText)) || '系统已结合服务画像、无障碍偏好和首末段接驳进行综合推荐。';
    },
    getRouteDecisionText: function(item) {
      return normalizeRouteText(item && (item.decisionStateText || item.decisionMessage || ''));
    },
    getRouteRiskHints: function(item) {
      return item && item.riskHints && item.riskHints.length ? item.riskHints.slice(0, 3) : [];
    },
    getRouteDataSummary: function(item) {
      var parts = [];
      var source = normalizeRouteText(item && item.dataSourceText);
      var updatedAt = normalizeRouteText(item && item.dataUpdatedAtText);
      var confidence = this.formatConfidence(item);
      if (source) parts.push('数据来源：' + source);
      if (updatedAt) parts.push('更新时间：' + updatedAt);
      if (confidence) parts.push('置信度：' + confidence + (normalizeRouteText(item && item.confidenceLevelText) ? '（' + normalizeRouteText(item.confidenceLevelText) + '）' : ''));
      return parts.join('；') || '当前暂无更详细的数据透明度信息。';
    },
    getRouteProfileSummary: function(item) {
      var parts = [];
      var profile = normalizeRouteText(item && item.resolvedProfileLabel);
      var preference = normalizeRouteText(item && item.resolvedPreferenceLabel);
      if (profile) parts.push('按“' + profile + '”画像');
      if (preference) parts.push('以“' + preference + '”偏好排序');
      if (normalizeRouteText(item && item.voiceAnnounceText)) parts.push(item.voiceAnnounceText);
      if (normalizeRouteText(item && item.blindPathSupportText)) parts.push(item.blindPathSupportText);
      if (normalizeRouteText(item && item.guideDogSupportText)) parts.push(item.guideDogSupportText);
      return parts.join('；') || '当前以通用规则排序。';
    },
    getViaStations: function(item) {
      var raw = normalizeRouteText(item && item.tujingzhandian);
      if (!raw) return [];
      return raw.split(/[,，、]/).map(function(part) {
        return normalizeRouteText(part);
      }).filter(Boolean).slice(0, 5);
    },
    getRouteSummaryText: function(item) {
      if (!item) return '点击后进入地图查看。';
      if (item.isRecommended) {
        return item.fullJourneyText || '系统已按当前条件生成完整出行方案，点击后直接进入地图出发。';
      }
      return '先看线路覆盖区间；如果要按你的出发地和目的地筛选，请使用上面的地点输入框。';
    }
  }
});

layui.use(['layer', 'element', 'laypage', 'http', 'jquery', 'laydate', 'form'], function() {
  var layer = layui.layer;
  var laypage = layui.laypage;
  var http = layui.http;
  var jquery = layui.jquery;
  var form = layui.form;
  var limit = 6;

  vue.baseurl = http.baseurl;
  bindResolutionListeners();
  loadRouteStationIndex().then(function(stations) {
    setPickerFocusField('start');
    activateInlinePicker({ scrollIntoView: false, silentScroll: true }).then(function() {
      var preferred = getFieldInputValue('start') ? 'start' : (getFieldInputValue('end') ? 'end' : 'start');
      setPickerFocusField(preferred);
      if (getFieldInputValue(preferred)) {
        return locatePickerToCurrentInput(preferred, { showToast: false });
      }
      return null;
    }).catch(function() {});
    return stations;
  }).catch(function() {});

  var routeStatePanel = FrontPageState.createPanel({
    mount: function() {
      return document.querySelector('.page-route-list .list');
    },
    onAction: function(actionMode) {
      if (actionMode === 'reset-filters') {
        jquery('#qidianzhanming, #zhongdianzhanming').val('');
        jquery('#preferenceType').val('AUTO');
        jquery('#profileType').val('AUTO');
        ACTIVE_LIST_RESOLUTION = { start: null, end: null };
        clearResolvedField('start');
        clearResolvedField('end');
        form.render('select');
        clearPlanNotice();
      }
      pageList();
    }
  });

  function setRouteStatusText(text, announce) {
    vue.a11yStatusText = text || DEFAULT_ROUTE_STATUS_TEXT;
    if (announce && window.AccessibilityUtils && text) {
      AccessibilityUtils.announce(text, 'polite', { interrupt: false });
    }
  }

  function clearPager() {
    jquery('#pager').html('');
  }

  function clearPlanNotice() {
    vue.planNoticeType = '';
    vue.planNoticeText = '';
    setRouteStatusText(DEFAULT_ROUTE_STATUS_TEXT, false);
  }

  function clearRouteResultScrollTimers() {
    while (ROUTE_RESULTS_SCROLL_TIMERS.length) {
      window.clearTimeout(ROUTE_RESULTS_SCROLL_TIMERS.pop());
    }
  }

  function scrollRouteResultsIntoParent(target) {
    if (!target) return;
    try {
      if (window.parent && window.parent !== window && window.frameElement) {
        var iframe = window.frameElement;
        var iframeRect = iframe.getBoundingClientRect();
        var targetRect = target.getBoundingClientRect();
        var childScrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
        var parentScrollTop = window.parent.scrollY || window.parent.pageYOffset || 0;
        var targetOffsetTop = targetRect.top + childScrollTop;
        var nextTop = iframeRect.top + parentScrollTop + Math.max(targetOffsetTop, 0) - 24;
        window.parent.scrollTo({ top: Math.max(nextTop, 0), behavior: 'smooth' });
      }
    } catch (e) {}
  }

  function focusRouteResults() {
    var container = document.getElementById('routeResultList');
    var anchor = document.querySelector('.route-plan-summary') || container;
    if (!container || !anchor) return;
    clearRouteResultScrollTimers();
    [0, 180, 420, 760].forEach(function(delay, index, allDelays) {
      ROUTE_RESULTS_SCROLL_TIMERS.push(window.setTimeout(function() {
        try {
          anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {
          anchor.scrollIntoView(true);
        }
        scrollRouteResultsIntoParent(anchor);
        if (index === allDelays.length - 1) {
          try {
            container.focus({ preventScroll: true });
          } catch (e) {
            container.focus();
          }
        }
      }, delay));
    });
  }

  function syncProfileAccessibilityPreset(options) {
    options = options || {};
    var profile = jquery('#profileType').val() || 'AUTO';
    var shouldEnableHighContrast = profile === 'LOW_VISION';
    if (window.AccessibilityUtils && typeof window.AccessibilityUtils.saveSettings === 'function') {
      window.AccessibilityUtils.saveSettings({ highContrast: shouldEnableHighContrast });
      if (!options.silent) {
        window.AccessibilityUtils.announce(shouldEnableHighContrast ? '已切换为视觉障碍预设，并自动开启高对比模式' : '已退出视觉障碍预设，并自动关闭高对比模式', 'polite', { interrupt: false });
      }
    }
  }

  function setPlanNotice(type, text, options) {
    options = options || {};
    vue.planNoticeType = type || '';
    vue.planNoticeText = text || '';
    setRouteStatusText(text || DEFAULT_ROUTE_STATUS_TEXT, !options.silentAnnounce && !!text);
  }

  function getListParams(page) {
    var param = {
      page: page || 1,
      limit: limit
    };
    var start = ACTIVE_LIST_RESOLUTION.start ? ACTIVE_LIST_RESOLUTION.start.stationName : getFieldInputValue('start');
    var end = ACTIVE_LIST_RESOLUTION.end ? ACTIVE_LIST_RESOLUTION.end.stationName : getFieldInputValue('end');
    if (start) {
      param.qidianzhanming = '%' + start + '%';
    }
    if (end) {
      param.zhongdianzhanming = '%' + end + '%';
    }
    return param;
  }

  function hasListFilters() {
    return !!(getFieldInputValue('start') || getFieldInputValue('end'));
  }

  function applyRouteStateForList(res, hasFilters) {
    var list = (res && res.data && jquery.isArray(res.data.list)) ? res.data.list : [];
    var total = (res && res.data && typeof res.data.total === 'number') ? res.data.total : list.length;
    vue.dataList = list;

    if (!list.length) {
      clearPager();
      routeStatePanel.setEmpty({
        title: hasFilters ? '没有找到匹配路线' : '当前暂无路线',
        description: hasFilters ? '请调整地点名称，或使用地图选点后重试。' : '请稍后刷新，或直接打开地图查看演示路线。',
        count: total,
        actionLabel: hasFilters ? '清空条件' : '重新加载',
        actionMode: hasFilters ? 'reset-filters' : 'reload'
      });
      return;
    }

    routeStatePanel.setReady(total, {
      title: vue.isPlanMode ? '已生成完整出行方案' : '路线已加载',
      description: vue.isPlanMode ? '点击任一方案即可直接进入地图出发。' : '可继续输入地点筛选，或直接打开地图。'
    });
  }

  function renderPagination(hasFilters, totalCount) {
    laypage.render({
      elem: 'pager',
      count: totalCount,
      limit: limit,
      groups: 5,
      layout: ['prev', 'page', 'next'],
      theme: '#B48A52',
      jump: function(obj, first) {
        if (first) return;
        var nextParam = getListParams(obj.curr);
        http.request('gongjiaoluxian/list', 'get', nextParam, function(innerRes) {
          applyRouteStateForList(innerRes, hasFilters);
        }, {
          silentError: true,
          onError: function() {
            vue.dataList = [];
            clearPager();
            routeStatePanel.setError({
              title: '路线列表加载失败',
              description: '请求分页数据失败，请稍后重试。',
              actionLabel: '重新加载',
              actionMode: 'reload'
            });
          }
        });
      }
    });
  }

  function pageList() {
    routeStatePanel.setLoading({
      title: '正在加载路线',
      description: '正在同步当前可展示的公交路线，请稍候。'
    });

    var param = getListParams(1);
    var hasFilters = hasListFilters();

    http.request('gongjiaoluxian/list', 'get', param, function(res) {
      vue.isPlanMode = false;
      vue.planMeta = null;
      clearPlanNotice();
      applyRouteStateForList(res, hasFilters);
      renderPagination(hasFilters, res && res.data ? res.data.total : 0);
    }, {
      silentError: true,
      onError: function() {
        vue.isPlanMode = false;
        clearPlanNotice();
        vue.dataList = [];
        clearPager();
        routeStatePanel.setError({
          title: '路线列表加载失败',
          description: '未能获取路线数据，请稍后重试或检查开发实例。',
          actionLabel: '重新加载',
          actionMode: 'reload'
        });
      }
    });
  }

  function resolveInputsForPlan() {
    var startRaw = getFieldInputValue('start');
    var endRaw = getFieldInputValue('end');
    if (!startRaw || !endRaw) {
      return Promise.reject(new Error('请先输入出发地和目的地'));
    }
    return Promise.all([
      resolveInputToStation('start', { keyword: startRaw }),
      resolveInputToStation('end', { keyword: endRaw })
    ]).then(function(results) {
      return {
        startRaw: startRaw,
        endRaw: endRaw,
        start: results[0],
        end: results[1]
      };
    });
  }

  function runResolvedListSearch() {
    var startRaw = getFieldInputValue('start');
    var endRaw = getFieldInputValue('end');
    if (!startRaw && !endRaw) {
      ACTIVE_LIST_RESOLUTION = { start: null, end: null };
      pageList();
      return;
    }
    setPlanNotice('info', '正在识别地点并刷新路线列表…', { silentAnnounce: true });
    var loadingIndex = layer.load(1, {
      shade: [0.1, '#fff']
    });
    var tasks = [];
    tasks.push(startRaw ? resolveInputToStation('start', { keyword: startRaw }) : Promise.resolve(null));
    tasks.push(endRaw ? resolveInputToStation('end', { keyword: endRaw }) : Promise.resolve(null));
    Promise.all(tasks).then(function(results) {
      ACTIVE_LIST_RESOLUTION = {
        start: results[0],
        end: results[1]
      };
      pageList();
    }).catch(function(error) {
      setPlanNotice('error', (error && error.message) || '地点识别失败，请尝试更具体的名称或地图选点。');
      layer.msg((error && error.message) || '地点识别失败');
    }).then(function() {
      layer.close(loadingIndex);
    });
  }

  function planAccessibleRoutes() {
    resolveInputsForPlan().then(function(resolutions) {
      var param = {
        startStation: resolutions.start.stationName,
        endStation: resolutions.end.stationName,
        preferenceType: jquery('#preferenceType').val() || 'AUTO',
        profileType: jquery('#profileType').val() || 'AUTO'
      };
      var userId = localStorage.getItem('userid');
      if (userId && userId !== 'null' && userId !== 'undefined') {
        param.userId = userId;
      }

      setPlanNotice('info', '已匹配站点：' + resolutions.start.stationName + ' → ' + resolutions.end.stationName + '，正在生成完整出行方案…', { silentAnnounce: false });
      routeStatePanel.setLoading({
        title: '正在生成完整出行方案',
        description: '系统正在结合首末段接驳、乘车段与换乘段计算推荐结果。'
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
          request.setRequestHeader('Token', localStorage.getItem('Token'));
        },
        success: function(res) {
          if (!res || res.code !== 0) {
            vue.isPlanMode = true;
            vue.dataList = [];
            vue.planMeta = null;
            clearPager();
            routeStatePanel.setError({
              title: '推荐失败',
              description: (res && res.msg) ? res.msg : '推荐服务返回异常，请稍后重试。',
              actionLabel: '重新推荐',
              actionMode: 'reload'
            });
            setPlanNotice('error', (res && res.msg) ? res.msg : '推荐服务返回异常，请稍后重试。');
            return;
          }

          var routeResults = (res.data && res.data.list && jquery.isArray(res.data.list)) ? res.data.list : [];
          var list = [];
          routeResults.forEach(function(result) {
            var mapped = mapRecommendationResult(result, resolutions);
            if (mapped) {
              list.push(mapped);
            }
          });

          vue.isPlanMode = true;
          vue.planMeta = buildPlanMeta(res.data || {}, resolutions.startRaw, resolutions.endRaw, param, list, resolutions);
          vue.dataList = list;
          clearPager();

          if (!list.length) {
            routeStatePanel.setEmpty({
              title: '暂无合适方案',
              description: '请调整出发地、目的地或推荐偏好后重试。',
              actionLabel: '重新推荐',
              actionMode: 'reload'
            });
            setPlanNotice('warn', '暂无合适方案，请调整条件后重试。');
            layer.msg('暂无合适方案，请调整条件后重试');
            return;
          }

          routeStatePanel.setReady(list.length, {
            title: '完整出行方案已生成',
            description: '点击任一方案即可直接进入地图出发。'
          });
          setPlanNotice('success', '已生成 ' + list.length + ' 条完整出行方案，结果区已自动滚动到当前视野。');
          vue.$nextTick(function() {
            focusRouteResults();
          });
        },
        error: function(xhr, status, error) {
          vue.isPlanMode = true;
          vue.dataList = [];
          vue.planMeta = null;
          clearPager();
          routeStatePanel.setError({
            title: '推荐接口请求失败',
            description: '请稍后重试或检查后端服务。',
            actionLabel: '重新推荐',
            actionMode: 'reload'
          });
          setPlanNotice('error', '推荐接口请求失败：' + (error || status || '未知错误'));
          layer.msg('推荐接口请求失败，请检查后端服务');
        },
        complete: function() {
          layer.close(loadingIndex);
        }
      });
    }).catch(function(error) {
      setPlanNotice('warn', (error && error.message) || '请先输入出发地和目的地，再开始推荐。');
      layer.msg((error && error.message) || '请先输入出发地和目的地');
    });
  }

  pageList();

  jquery('#profileType').on('change', function() {
    syncProfileAccessibilityPreset();
  });
  if (form && typeof form.on === 'function') {
    form.on('select(profileType)', function() {
      syncProfileAccessibilityPreset();
    });
  }
  syncProfileAccessibilityPreset({ silent: true });

  jquery('#btn-search').click(function() {
    runResolvedListSearch();
  });

  jquery('#btn-plan').click(function() {
    planAccessibleRoutes();
  });
});
