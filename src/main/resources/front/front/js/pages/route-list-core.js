/*
 * Phase 2A split: route list resolution and recommendation mapping helpers.
 * Extracted from route-list-page.js to reduce single-file editing risk.
 */

function cloneRouteData(value) {
  try {
    return JSON.parse(JSON.stringify(value || null));
  } catch (e) {
    return value || null;
  }
}

function normalizeRouteText(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function normalizeMatchKey(value) {
  return normalizeRouteText(value)
    .toLowerCase()
    .replace(/[()（）·•]/g, '')
    .replace(/公交站/g, '')
    .replace(/地铁口/g, '')
    .replace(/地铁站/g, '')
    .replace(/总站/g, '')
    .replace(/站点/g, '')
    .replace(/站/g, '')
    .replace(/附近/g, '')
    .replace(/\s+/g, '');
}

function hasMeaningfulRouteText(value) {
  var text = normalizeRouteText(value);
  if (!text) return false;
  return ['未知', '通用', '智能推荐', '暂无', '暂无推荐理由', '自动识别 / 通用', 'AUTO'].indexOf(text) === -1;
}

function isUsefulRecommendationReason(value) {
  var text = normalizeRouteText(value);
  if (!text) return false;
  return !(/通用访客画像|智能推荐进行排序|数据源未知|更新未知/.test(text));
}

function safeParseJson(value, fallback) {
  if (value == null || value === '') {
    return fallback;
  }
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
}

function resolveMapPageUrl() {
  return './pages/gongjiaoluxian/map.html';
}

function openRouteMapPage() {
  var shellUrl = resolveMapPageUrl();
  try {
    if (window.top && typeof window.top.navPage === 'function') {
      window.top.navPage(shellUrl);
      return;
    }
  } catch (e) {}
  jump('../gongjiaoluxian/map.html');
}

function buildRouteQueryLabel(start, end) {
  var from = normalizeRouteText(start) || '未填写出发地';
  var to = normalizeRouteText(end) || '未填写目的地';
  return from + ' → ' + to;
}

function getFieldConfig(field) {
  return ROUTE_FIELD_CONFIG[field] || ROUTE_FIELD_CONFIG.start;
}

function formatDistanceMeters(distanceMeters) {
  var distance = Number(distanceMeters || 0);
  if (isNaN(distance) || distance <= 0) {
    return '';
  }
  if (distance < 1000) {
    return Math.round(distance) + ' 米';
  }
  return (distance / 1000).toFixed(distance < 5000 ? 1 : 0) + ' 公里';
}

function buildStationAliases(name) {
  var stationName = normalizeRouteText(name);
  var aliases = [];

  function appendAlias(alias) {
    var value = normalizeRouteText(alias);
    if (!value || value === stationName || aliases.indexOf(value) >= 0) {
      return;
    }
    aliases.push(value);
  }

  appendAlias(stationName.replace(/总站$/, ''));
  appendAlias(stationName.replace(/地铁站/g, ''));
  appendAlias(stationName.replace(/地铁/g, ''));
  appendAlias(stationName.replace(/站$/, ''));

  (ROUTE_STATION_ALIAS_MAP[stationName] || []).forEach(appendAlias);
  return aliases;
}

function parseCoordinateText(value) {
  var raw = normalizeRouteText(value);
  if (!raw) return null;
  var parts = raw.split(',');
  if (parts.length < 2) {
    return null;
  }
  var lng = Number(parts[0]);
  var lat = Number(parts[1]);
  if (isNaN(lng) || isNaN(lat)) {
    return null;
  }
  return { lng: lng, lat: lat };
}

function tryParseCoordinateKeyword(value) {
  var raw = normalizeRouteText(value);
  if (!raw) {
    return null;
  }
  var match = raw.match(/(\d{2,3}\.\d+)\s*[,，]\s*(\d{2}\.\d+)/);
  if (!match) {
    return null;
  }
  var lng = Number(match[1]);
  var lat = Number(match[2]);
  if (isNaN(lng) || isNaN(lat)) {
    return null;
  }
  return { lng: lng, lat: lat };
}

function normalizeStationCandidate(candidate) {
  if (!candidate) {
    return null;
  }
  var name = normalizeRouteText(candidate.name || candidate.stationName || candidate.zhandianming);
  var lng = Number(candidate.lng != null ? candidate.lng : (candidate.jingdu != null ? candidate.jingdu : candidate.longitude));
  var lat = Number(candidate.lat != null ? candidate.lat : (candidate.weidu != null ? candidate.weidu : candidate.latitude));
  if (!name || isNaN(lng) || isNaN(lat)) {
    return null;
  }
  return {
    name: name,
    lng: lng,
    lat: lat,
    aliases: buildStationAliases(name)
  };
}

function appendStationCandidate(store, candidate) {
  var normalized = normalizeStationCandidate(candidate);
  if (!normalized) {
    return;
  }
  if (!store[normalized.name]) {
    store[normalized.name] = normalized;
    return;
  }
  if (isNaN(store[normalized.name].lng) || isNaN(store[normalized.name].lat)) {
    store[normalized.name].lng = normalized.lng;
    store[normalized.name].lat = normalized.lat;
  }
  normalized.aliases.forEach(function(alias) {
    if (store[normalized.name].aliases.indexOf(alias) < 0) {
      store[normalized.name].aliases.push(alias);
    }
  });
}

function extractStationCandidatesFromRoute(route, store) {
  if (!route) {
    return;
  }
  var startCoord = parseCoordinateText(route.qidianzuobiao);
  var endCoord = parseCoordinateText(route.zhongdianzuobiao);
  appendStationCandidate(store, {
    name: route.qidianzhanming,
    lng: startCoord && startCoord.lng,
    lat: startCoord && startCoord.lat
  });
  appendStationCandidate(store, {
    name: route.zhongdianzhanming,
    lng: endCoord && endCoord.lng,
    lat: endCoord && endCoord.lat
  });
  var stationList = safeParseJson(route.zhandianzuobiao, []);
  if (!Array.isArray(stationList)) {
    return;
  }
  stationList.forEach(function(station) {
    appendStationCandidate(store, station);
  });
}

function buildStationIndex(routes) {
  var store = {};
  (routes || []).forEach(function(route) {
    extractStationCandidatesFromRoute(route, store);
  });
  return Object.keys(store).map(function(key) {
    return store[key];
  }).sort(function(left, right) {
    return left.name.localeCompare(right.name, 'zh-Hans-CN');
  });
}

function getStationSuggestionMatches(stations, keyword, limit) {
  var rawKeyword = normalizeRouteText(keyword);
  if (!rawKeyword) {
    return [];
  }
  return (stations || []).map(function(station) {
    return scoreStationKeywordMatch(station, rawKeyword);
  }).filter(function(item) {
    return !!item;
  }).sort(function(left, right) {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return left.station.name.length - right.station.name.length;
  }).slice(0, limit || ROUTE_STATION_SUGGESTION_LIMIT).map(function(item) {
    return item.station;
  });
}

function renderStationSuggestions(stations, keyword) {
  var matches = getStationSuggestionMatches(stations, keyword, ROUTE_STATION_SUGGESTION_LIMIT);
  var html = matches.map(function(station) {
    return '<option value="' + station.name + '"></option>';
  }).join('');
  $('#routeStationSuggestionList').html(html);
}

function loadRouteStationIndex() {
  if (ROUTE_STATION_INDEX_CACHE && ROUTE_STATION_INDEX_CACHE.length) {
    return Promise.resolve(ROUTE_STATION_INDEX_CACHE);
  }
  if (ROUTE_STATION_INDEX_PROMISE) {
    return ROUTE_STATION_INDEX_PROMISE;
  }
  ROUTE_STATION_INDEX_PROMISE = new Promise(function(resolve, reject) {
    $.ajax({
      url: (window.__API_BASE_URL__ || '') + 'route/all-routes',
      type: 'GET',
      dataType: 'json',
      success: function(res) {
        if (!res || res.code !== 0) {
          reject(new Error((res && res.msg) || '站点索引加载失败'));
          return;
        }
        ROUTE_STATION_INDEX_CACHE = buildStationIndex(res.data || []);
        renderStationSuggestions(ROUTE_STATION_INDEX_CACHE, '');
        resolve(ROUTE_STATION_INDEX_CACHE);
      },
      error: function() {
        reject(new Error('站点索引加载失败'));
      },
      complete: function() {
        ROUTE_STATION_INDEX_PROMISE = null;
      }
    });
  });
  return ROUTE_STATION_INDEX_PROMISE;
}

function updateStationSuggestions(keyword) {
  loadRouteStationIndex().then(function(stations) {
    renderStationSuggestions(stations, keyword);
  }).catch(function() {});
}

function scoreStationKeywordMatch(station, keyword) {
  if (!station) {
    return null;
  }
  var rawKeyword = normalizeRouteText(keyword);
  var normalizedKeyword = normalizeMatchKey(keyword);
  if (!rawKeyword || !normalizedKeyword) {
    return null;
  }

  function scoreText(text, alias) {
    var rawText = normalizeRouteText(text);
    var normalizedText = normalizeMatchKey(text);
    var score = 0;
    if (!rawText || !normalizedText) {
      return 0;
    }
    if (rawText === rawKeyword) {
      score = 420;
    } else if (normalizedText === normalizedKeyword) {
      score = 400;
    } else if (rawText.indexOf(rawKeyword) >= 0 || rawKeyword.indexOf(rawText) >= 0) {
      score = 340;
    } else if (normalizedText.indexOf(normalizedKeyword) >= 0 || normalizedKeyword.indexOf(normalizedText) >= 0) {
      score = 300;
    }
    if (alias && score > 0) {
      score -= 12;
    }
    return score;
  }

  var best = {
    station: station,
    score: scoreText(station.name, false),
    matchedText: station.name,
    source: 'keyword'
  };
  (station.aliases || []).forEach(function(alias) {
    var score = scoreText(alias, true);
    if (score > best.score) {
      best.score = score;
      best.matchedText = alias;
      best.source = 'alias';
    }
  });
  return best.score > 0 ? best : null;
}

function findBestKeywordStation(stations, keyword) {
  var matches = (stations || []).map(function(station) {
    return scoreStationKeywordMatch(station, keyword);
  }).filter(function(item) {
    return !!item;
  }).sort(function(left, right) {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return left.station.name.length - right.station.name.length;
  });
  return matches.length ? matches[0] : null;
}

function haversineMeters(a, b) {
  var lat1 = Number(a && a.lat), lng1 = Number(a && a.lng);
  var lat2 = Number(b && b.lat), lng2 = Number(b && b.lng);
  if ([lat1, lng1, lat2, lng2].some(function(v) { return isNaN(v); })) {
    return NaN;
  }
  var r = 6378137;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var aa = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * r * Math.asin(Math.sqrt(aa));
}

function findNearestStations(stations, point, limit) {
  return (stations || []).map(function(station) {
    return {
      station: station,
      distanceMeters: haversineMeters(point, station)
    };
  }).filter(function(item) {
    return !isNaN(item.distanceMeters);
  }).sort(function(left, right) {
    return left.distanceMeters - right.distanceMeters;
  }).slice(0, limit || 3);
}

function buildCoordinateResolution(stations, point, rawInput, source, formattedAddress) {
  var nearest = findNearestStations(stations, point, 3);
  if (!nearest.length) {
    throw new Error('附近暂无可匹配站点');
  }
  var best = nearest[0];
  return {
    rawInput: rawInput,
    queryText: rawInput,
    stationName: best.station.name,
    stationLng: best.station.lng,
    stationLat: best.station.lat,
    pointLng: Number(point.lng),
    pointLat: Number(point.lat),
    source: source,
    matchMode: 'NEAREST',
    distanceMeters: Number(best.distanceMeters || 0),
    formattedAddress: formattedAddress || '',
    nearbyStations: nearest.map(function(item) {
      return {
        stationName: item.station.name,
        distanceMeters: Number(item.distanceMeters || 0)
      };
    })
  };
}

function loadRouteAmapSdk() {
  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }
  if (ROUTE_AMAP_SDK_PROMISE) {
    return ROUTE_AMAP_SDK_PROMISE;
  }
  ROUTE_AMAP_SDK_PROMISE = new Promise(function(resolve, reject) {
    if (!window.mapEngineConfig || !window.mapEngineConfig.amapKey) {
      reject(new Error('未配置高德 Key'));
      return;
    }
    if (window.mapEngineConfig.amapSecurityJsCode || window.mapEngineConfig.amapServiceHost) {
      window._AMapSecurityConfig = {};
      if (window.mapEngineConfig.amapSecurityJsCode) {
        window._AMapSecurityConfig.securityJsCode = window.mapEngineConfig.amapSecurityJsCode;
      }
      if (window.mapEngineConfig.amapServiceHost) {
        window._AMapSecurityConfig.serviceHost = window.mapEngineConfig.amapServiceHost;
      }
    }
    var script = document.createElement('script');
    script.src = 'https://webapi.amap.com/maps?v=' + encodeURIComponent(window.mapEngineConfig.amapVersion || '2.0') + '&key=' + encodeURIComponent(window.mapEngineConfig.amapKey);
    script.async = true;
    script.onload = function() {
      if (window.AMap) {
        resolve(window.AMap);
      } else {
        reject(new Error('高德 SDK 加载完成但不可用'));
      }
    };
    script.onerror = function() {
      reject(new Error('高德 SDK 加载失败'));
    };
    document.head.appendChild(script);
  });
  return ROUTE_AMAP_SDK_PROMISE;
}

function geocodeKeywordToPoint(keyword) {
  return loadRouteAmapSdk().then(function(AMap) {
    return new Promise(function(resolve, reject) {
      if (!AMap || !AMap.plugin) {
        reject(new Error('高德地理编码插件不可用'));
        return;
      }
      AMap.plugin(['AMap.Geocoder'], function() {
        try {
          var geocoder = new AMap.Geocoder({ city: '广州' });
          geocoder.getLocation(keyword, function(status, result) {
            if (status === 'complete' && result && result.geocodes && result.geocodes.length) {
              var geocode = result.geocodes[0];
              if (!geocode.location) {
                reject(new Error('地点坐标为空'));
                return;
              }
              resolve({
                lng: Number(geocode.location.lng),
                lat: Number(geocode.location.lat),
                formattedAddress: geocode.formattedAddress || keyword
              });
              return;
            }
            reject(new Error('未识别到该地点'));
          });
        } catch (e) {
          reject(e);
        }
      });
    });
  });
}

function setFieldHint(field, text, state) {
  var config = getFieldConfig(field);
  var hint = $(config.hintSelector);
  if (!hint.length) {
    return;
  }
  hint.removeClass('is-ready is-warn is-error is-loading');
  if (state) {
    hint.addClass('is-' + state);
  }
  hint.text(text || config.defaultHint);
}

function buildResolvedHintText(field, payload) {
  if (!payload || !payload.stationName) {
    return getFieldConfig(field).defaultHint;
  }
  var stationName = payload.stationName;
  var distanceText = formatDistanceMeters(payload.distanceMeters);
  return stationName + (distanceText ? ' · ' + distanceText : '');
}


function setResolvedField(field, payload) {
  ROUTE_INPUT_RESOLUTION_STATE[field] = payload;
  var warn = Number(payload && payload.distanceMeters || 0) > 900;
  setFieldHint(field, buildResolvedHintText(field, payload), warn ? 'warn' : 'ready');
}

function clearResolvedField(field, options) {
  ROUTE_INPUT_RESOLUTION_STATE[field] = null;
  ACTIVE_LIST_RESOLUTION[field] = null;
  if (options && options.keepHint) {
    return;
  }
  setFieldHint(field, getFieldConfig(field).defaultHint, '');
}

function getResolvedField(field) {
  return ROUTE_INPUT_RESOLUTION_STATE[field] ? cloneRouteData(ROUTE_INPUT_RESOLUTION_STATE[field]) : null;
}

function getFieldInputValue(field) {
  return normalizeRouteText($(getFieldConfig(field).inputSelector).val());
}

function setFieldInputValue(field, value) {
  $(getFieldConfig(field).inputSelector).val(value || '');
}

function buildKeywordResolution(stationMatch, rawInput) {
  return {
    rawInput: rawInput,
    queryText: rawInput,
    stationName: stationMatch.station.name,
    stationLng: stationMatch.station.lng,
    stationLat: stationMatch.station.lat,
    pointLng: stationMatch.station.lng,
    pointLat: stationMatch.station.lat,
    source: stationMatch.source || 'keyword',
    matchMode: stationMatch.score >= 400 ? 'EXACT' : 'FUZZY',
    distanceMeters: 0,
    matchedText: stationMatch.matchedText || stationMatch.station.name,
    nearbyStations: [{ stationName: stationMatch.station.name, distanceMeters: 0 }]
  };
}

function resolveInputToStation(field, options) {
  options = options || {};
  var rawInput = normalizeRouteText(options.keyword || getFieldInputValue(field));
  if (!rawInput) {
    return Promise.reject(new Error(getFieldConfig(field).label + '不能为空'));
  }
  var requestId = ++ROUTE_FIELD_REQUEST_SEQ[field];
  if (!options.silent) {
    setFieldHint(field, '定位中', 'loading');
  }

  return loadRouteStationIndex().then(function(stations) {
    var directMatch = findBestKeywordStation(stations, rawInput);
    if (directMatch) {
      return buildKeywordResolution(directMatch, rawInput);
    }
    var coordinatePoint = tryParseCoordinateKeyword(rawInput);
    if (coordinatePoint) {
      return buildCoordinateResolution(stations, coordinatePoint, rawInput, 'coordinate', rawInput);
    }
    if (options.disableGeocode) {
      throw new Error('未找到可匹配站点');
    }
    return geocodeKeywordToPoint(rawInput).then(function(point) {
      return buildCoordinateResolution(stations, point, rawInput, 'geocode', point.formattedAddress || rawInput);
    });
  }).then(function(resolved) {
    var currentValue = getFieldInputValue(field);
    if (requestId === ROUTE_FIELD_REQUEST_SEQ[field] && currentValue === rawInput && !options.skipStore) {
      setResolvedField(field, resolved);
    }
    return resolved;
  }).catch(function(error) {
    var currentValue = getFieldInputValue(field);
    if (requestId === ROUTE_FIELD_REQUEST_SEQ[field] && currentValue === rawInput && !options.skipErrorHint) {
      setFieldHint(field, '未识别', 'error');
    }
    throw error;
  });
}

function buildResolutionSummaryLabel(field, resolution) {
  if (!resolution || !resolution.stationName) {
    return '';
  }
  var stationName = resolution.stationName;
  var distanceText = formatDistanceMeters(resolution.distanceMeters);
  if (resolution.source === 'map' || resolution.source === 'geocode' || resolution.source === 'coordinate') {
    return stationName + (distanceText ? ' · ' + distanceText : '');
  }
  return stationName;
}

function buildFirstLastMileText(type, resolution, stationName) {
  var safeStation = normalizeRouteText(stationName) || (type === 'start' ? '上车站' : '下车站');
  if (!resolution) {
    return type === 'start' ? '前往 ' + safeStation + ' 上车' : '从 ' + safeStation + ' 前往目的地';
  }
  var distanceText = formatDistanceMeters(resolution.distanceMeters);
  if (type === 'start') {
    if (distanceText && resolution.source !== 'keyword' && resolution.source !== 'alias') {
      return '从当前位置步行约 ' + distanceText + ' 到 ' + safeStation + ' 上车';
    }
    return '从 ' + safeStation + ' 就近上车';
  }
  if (distanceText && resolution.source !== 'keyword' && resolution.source !== 'alias') {
    return '到站后步行约 ' + distanceText + ' 到达目的地';
  }
  return '在 ' + safeStation + ' 下车后前往目的地';
}

function parseRouteTrackPoints(route) {
  var raw = safeParseJson(route && route.luxianguiji, []);
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(function(point) {
    var lng = Number(point && point.lng);
    var lat = Number(point && point.lat);
    if (isNaN(lng) || isNaN(lat)) {
      return null;
    }
    return { lng: lng, lat: lat };
  }).filter(Boolean);
}

function calculatePolylineDistanceMeters(points) {
  if (!points || points.length < 2) {
    return 0;
  }
  var sum = 0;
  for (var i = 0; i < points.length - 1; i++) {
    sum += haversineMeters(points[i], points[i + 1]);
  }
  return Math.round(sum);
}

function resolveRouteTrafficProfile() {
  var hour = new Date().getHours();
  if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
    return { level: '拥堵', speedFactor: 0.62, dwellMinutesPerStation: 0.9 };
  }
  if ((hour >= 6 && hour < 7) || (hour >= 9 && hour < 22)) {
    return { level: '正常', speedFactor: 0.82, dwellMinutesPerStation: 0.6 };
  }
  return { level: '畅通', speedFactor: 1.05, dwellMinutesPerStation: 0.35 };
}

function countTransferSegments(route) {
  var count = 0;
  ((route && route.segments) || []).forEach(function(segment) {
    var type = normalizeRouteText(segment && segment.type);
    var title = normalizeRouteText(segment && segment.title);
    if (type.indexOf('transfer') >= 0 || title.indexOf('换乘') >= 0) {
      count += 1;
    }
  });
  return count || (route && route.transferRequired ? 1 : 0);
}

function sumSegmentDistanceMeters(route, segmentType) {
  var sum = 0;
  ((route && route.segments) || []).forEach(function(segment) {
    if (!segment || segment.type !== segmentType) {
      return;
    }
    var distance = Number(segment.estimatedDistanceMeters || 0);
    if (!isNaN(distance) && distance > 0) {
      sum += distance;
    }
  });
  return Math.round(sum);
}

function estimateWalkSpeedMetersPerMinute(route) {
  var profileType = normalizeRouteText(route && route.resolvedProfileType);
  if (profileType === 'WHEELCHAIR') {
    return 50;
  }
  if (profileType === 'LOW_VISION') {
    return 60;
  }
  return 75;
}

function formatExpectedArrivalTime(minutes) {
  var total = Number(minutes || 0);
  if (isNaN(total) || total <= 0) {
    return '';
  }
  var date = new Date(Date.now() + total * 60 * 1000);
  var hh = String(date.getHours()).padStart(2, '0');
  var mm = String(date.getMinutes()).padStart(2, '0');
  return hh + ':' + mm;
}

function estimateRouteMetrics(route) {
  var firstWalk = sumSegmentDistanceMeters(route, 'origin_walk');
  var lastWalk = sumSegmentDistanceMeters(route, 'destination_walk');
  if (!firstWalk && route && route.startSelection && route.startSelection.distanceMeters) {
    firstWalk = Math.round(route.startSelection.distanceMeters);
  }
  if (!lastWalk && route && route.endSelection && route.endSelection.distanceMeters) {
    lastWalk = Math.round(route.endSelection.distanceMeters);
  }
  var totalWalk = firstWalk + lastWalk;
  var rideDistance = calculatePolylineDistanceMeters(parseRouteTrackPoints(route));
  var stationCount = Number(route && route.travelStationCount || 0);
  if ((!rideDistance || rideDistance <= 0) && stationCount > 0) {
    rideDistance = Math.round(stationCount * 800);
  }
  var traffic = resolveRouteTrafficProfile();
  var avgSpeedKmh = Math.max(24 * traffic.speedFactor, 8);
  var rideMinutes = rideDistance > 0 ? (rideDistance / 1000) / avgSpeedKmh * 60 : 0;
  var dwellMinutes = stationCount > 0 ? stationCount * traffic.dwellMinutesPerStation : 0;
  var transferCount = countTransferSegments(route);
  var transferMinutes = transferCount * 6;
  var walkMinutes = totalWalk > 0 ? totalWalk / estimateWalkSpeedMetersPerMinute(route) : 0;
  var totalMinutes = Math.ceil(rideMinutes + dwellMinutes + transferMinutes + walkMinutes);
  return {
    firstWalkDistanceMeters: firstWalk,
    lastWalkDistanceMeters: lastWalk,
    totalWalkDistanceMeters: totalWalk,
    rideDistanceMeters: rideDistance,
    estimatedRideMinutes: Math.round(rideMinutes),
    estimatedWalkMinutes: Math.round(walkMinutes),
    estimatedTransferMinutes: Math.round(transferMinutes),
    estimatedTotalMinutes: totalMinutes,
    expectedArrivalTimeText: formatExpectedArrivalTime(totalMinutes),
    trafficLevel: traffic.level
  };
}

function enhanceSegmentsWithSelections(route, resolutions) {
  if (!route || !route.segments || !route.segments.length) {
    return;
  }
  route.segments = route.segments.map(function(segment) {
    return cloneRouteData(segment) || segment;
  });
  var startSelection = resolutions && resolutions.start;
  var endSelection = resolutions && resolutions.end;

  route.segments.forEach(function(segment) {
    if (!segment || !segment.type) {
      return;
    }
    if (segment.type === 'origin_walk' && startSelection) {
      if (startSelection.distanceMeters > 0) {
        segment.estimatedDistanceMeters = Math.round(startSelection.distanceMeters);
      }
      segment.status = startSelection.distanceMeters > 900 ? 'RISK' : (startSelection.distanceMeters > 300 ? 'CAUTION' : 'READY');
      segment.statusText = startSelection.distanceMeters > 900 ? '步行距离较长' : (startSelection.distanceMeters > 300 ? '步行距离中等' : '步行距离较短');
      segment.description = buildFirstLastMileText('start', startSelection, route.boardingStationName || route.qidianzhanming) + '。';
      segment.dataSourceText = startSelection.source === 'map' ? '地图选点匹配' : (startSelection.source === 'geocode' ? '地点名匹配' : '站点识别');
    }
    if (segment.type === 'destination_walk' && endSelection) {
      if (endSelection.distanceMeters > 0) {
        segment.estimatedDistanceMeters = Math.round(endSelection.distanceMeters);
      }
      segment.status = endSelection.distanceMeters > 900 ? 'RISK' : (endSelection.distanceMeters > 300 ? 'CAUTION' : 'READY');
      segment.statusText = endSelection.distanceMeters > 900 ? '到站后步行较长' : (endSelection.distanceMeters > 300 ? '到站后步行中等' : '到站后步行较短');
      segment.description = buildFirstLastMileText('end', endSelection, route.alightingStationName || route.zhongdianzhanming) + '。';
      segment.dataSourceText = endSelection.source === 'map' ? '地图选点匹配' : (endSelection.source === 'geocode' ? '地点名匹配' : '站点识别');
    }
  });
}

function enrichRouteWithSelections(route, resolutions) {
  if (!route) {
    return route;
  }
  var startSelection = resolutions && resolutions.start ? cloneRouteData(resolutions.start) : null;
  var endSelection = resolutions && resolutions.end ? cloneRouteData(resolutions.end) : null;
  route.startSelection = startSelection;
  route.endSelection = endSelection;
  route.firstMileText = buildFirstLastMileText('start', startSelection, route.boardingStationName || route.qidianzhanming);
  route.lastMileText = buildFirstLastMileText('end', endSelection, route.alightingStationName || route.zhongdianzhanming);
  route.fullJourneyText = route.firstMileText + '；' + (route.transferRequired ? '中途含换乘。' : '全程无需换乘。') + '；' + route.lastMileText + '。';
  route.itineraryLabels = [
    normalizeRouteText(startSelection && startSelection.queryText) || '当前位置',
    normalizeRouteText(route.boardingStationName || route.qidianzhanming) || '上车站',
    route.transferRequired ? '换乘' : '乘车',
    normalizeRouteText(route.alightingStationName || route.zhongdianzhanming) || '下车站',
    normalizeRouteText(endSelection && endSelection.queryText) || '目的地'
  ];
  enhanceSegmentsWithSelections(route, resolutions);
  return route;
}

function buildPlanMeta(resData, start, end, param, list, resolutions) {
  var profileLabel = hasMeaningfulRouteText(resData.resolvedProfileLabel) ? resData.resolvedProfileLabel : '';
  var preferenceLabel = hasMeaningfulRouteText(resData.preferenceLabel) ? resData.preferenceLabel : '';
  if (!preferenceLabel) {
    var prefType = param.preferenceType || 'AUTO';
    if (prefType === 'ACCESSIBLE') preferenceLabel = '无障碍优先';
    if (prefType === 'TIME') preferenceLabel = '时间优先';
    if (prefType === 'DISTANCE') preferenceLabel = '距离优先';
  }
  var ruleEngine = resData.ruleEngine || {};
  var weights = ruleEngine.weights || {};
  var weightLabels = [];
  var weightMap = {
    routeLevel: '线路级',
    station: '站点级',
    userMatch: '用户画像'
  };
  Object.keys(weights).forEach(function(key) {
    var value = Number(weights[key]);
    if (isNaN(value)) return;
    weightLabels.push((weightMap[key] || key) + ' ' + Math.round(value * 100) + '%');
  });
  var pipeline = Array.isArray(ruleEngine.pipeline) ? ruleEngine.pipeline.join(' → ') : '';
  return {
    count: Number(resData.count || list.length || 0),
    evaluatedCount: Number(resData.evaluatedCount || list.length || 0),
    rejectedCount: Number(resData.rejectedCount || 0),
    profileLabel: profileLabel,
    preferenceLabel: preferenceLabel,
    queryLabel: buildRouteQueryLabel(start, end),
    resolvedStartLabel: buildResolutionSummaryLabel('start', resolutions && resolutions.start),
    resolvedEndLabel: buildResolutionSummaryLabel('end', resolutions && resolutions.end),
    riskHints: resData.riskHints || [],
    actionHints: resData.actionHints || [],
    ruleEnginePipelineText: pipeline ? '分段链路：' + pipeline : '',
    ruleEngineWeightText: weightLabels.length ? '评分权重：' + weightLabels.join(' · ') : '',
    modeDifferenceText: '“查看路线”只做线路覆盖筛选；“生成方案”会把地点自动吸附到可上车/下车站，再结合画像、无障碍偏好、风险、置信度和分段结果做推荐。',
    innovationSummary: '把普通公交线路查询升级为“可执行的无障碍出行方案”：不仅告诉你坐哪条线，还告诉你为什么推荐、风险在哪里、数据靠不靠谱、起终点需要走多远。'
  };
}

function mapRecommendationResult(result, resolutions) {
  if (!result || !result.route) return null;
  var route = cloneRouteData(result.route) || {};
  route.accessibilityScore = Number(result.accessibilityScore || 0);
  route.totalScore = Number(result.totalScore || 0);
  route.recommendationReason = isUsefulRecommendationReason(result.recommendationReason) ? result.recommendationReason : '';
  route.accessibilityLevelText = result.accessibilityLevelText || '';
  route.voiceAnnounceText = result.voiceAnnounceText || '';
  route.blindPathSupportText = result.blindPathSupportText || '';
  route.guideDogSupportText = result.guideDogSupportText || '';
  route.isRecommended = true;
  route.resolvedProfileType = result.resolvedProfileType || '';
  route.resolvedProfileLabel = result.resolvedProfileLabel || '';
  route.resolvedPreferenceType = result.resolvedPreferenceType || '';
  route.resolvedPreferenceLabel = result.resolvedPreferenceLabel || '';
  route.confidenceScore = Number(result.confidenceScore || 0);
  route.confidenceLevelText = result.confidenceLevelText || '';
  route.dataSourceText = result.dataSourceText || '';
  route.dataUpdatedAtText = result.dataUpdatedAtText || '';
  route.riskHints = result.riskHints || [];
  route.missingDataHints = result.missingDataHints || [];
  route.ruleBreakdown = result.ruleBreakdown || {};
  route.decisionState = result.decisionState || '';
  route.decisionStateText = result.decisionStateText || '';
  route.decisionMessage = result.decisionMessage || '';
  route.segments = result.segments || [];
  route.boardingStationName = result.boardingStationName || '';
  route.alightingStationName = result.alightingStationName || '';
  route.travelStationCount = Number(result.travelStationCount || 0);
  route.transferRequired = !!result.transferRequired;
  route = enrichRouteWithSelections(route, resolutions);
  route.routeMetrics = estimateRouteMetrics(route);
  return route;
}
