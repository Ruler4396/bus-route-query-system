/*
 * Phase 2A split: route list inline picker and map interaction helpers.
 * Extracted from route-list-page.js to reduce single-file editing risk.
 */

function destroyPickerMap() {
  if (ROUTE_PICKER_CONTEXT.marker && ROUTE_PICKER_CONTEXT.engineType === 'amap' && ROUTE_PICKER_CONTEXT.marker.setMap) {
    try {
      ROUTE_PICKER_CONTEXT.marker.setMap(null);
    } catch (e) {}
  }
  if (ROUTE_PICKER_CONTEXT.map) {
    try {
      if (ROUTE_PICKER_CONTEXT.engineType === 'amap' && typeof ROUTE_PICKER_CONTEXT.map.destroy === 'function') {
        ROUTE_PICKER_CONTEXT.map.destroy();
      } else if (typeof ROUTE_PICKER_CONTEXT.map.remove === 'function') {
        ROUTE_PICKER_CONTEXT.map.remove();
      }
    } catch (e) {}
  }
  ROUTE_PICKER_CONTEXT.map = null;
  ROUTE_PICKER_CONTEXT.marker = null;
  ROUTE_PICKER_CONTEXT.tileLayer = null;
  ROUTE_PICKER_CONTEXT.engineType = '';
  ROUTE_PICKER_CONTEXT.clickedPoint = null;
  ROUTE_PICKER_CONTEXT.contextPoint = null;
  ROUTE_PICKER_CONTEXT.candidates = [];
  ROUTE_PICKER_CONTEXT.selectedCandidate = null;
  hidePickerContextMenu();
}

function getPickerFocusField() {
  return ROUTE_PICKER_CONTEXT.focusField === 'end' ? 'end' : 'start';
}

function setPickerFocusField(field) {
  ROUTE_PICKER_CONTEXT.focusField = field === 'end' ? 'end' : 'start';
  $('#routePickerLocateInput').text('定位' + getFieldConfig(ROUTE_PICKER_CONTEXT.focusField).label);
}

function buildPickerSummaryText(selection) {
  if (!selection || !selection.stationName) {
    return '点击地图后可设为起点或终点';
  }
  var distanceText = formatDistanceMeters(selection.distanceMeters);
  return selection.stationName + (distanceText ? ' · ' + distanceText : '');
}

function renderPickerSelectionSummary(selection) {
  $('#routePickerSelectionSummary').text(buildPickerSummaryText(selection));
  if (selection && selection.stationName) {
    $('#routePickerTitle').text(selection.stationName);
  } else {
    $('#routePickerTitle').text('广州地图');
  }
}

function updatePickerStatus(selection) {
  if (!selection) {
    $('#routePickerStatus').text('点击地图选点');
    $('#routeAssignStart').prop('disabled', true);
    $('#routeAssignEnd').prop('disabled', true);
    $('#routePickerCandidates').html('');
    renderPickerSelectionSummary(null);
    return;
  }
  var activeStationName = normalizeRouteText((ROUTE_PICKER_CONTEXT.selectedCandidate || selection).stationName || selection.stationName);
  $('#routePickerStatus').text(selection.stationName);
  $('#routeAssignStart').prop('disabled', false);
  $('#routeAssignEnd').prop('disabled', false);
  renderPickerSelectionSummary(ROUTE_PICKER_CONTEXT.selectedCandidate || selection);
  var html = (selection.nearbyStations || []).map(function(item, index) {
    var activeClass = (activeStationName && activeStationName === normalizeRouteText(item.stationName)) || (!activeStationName && index === 0) ? ' is-active' : '';
    return '<button type="button" class="route-picker-candidate' + activeClass + '" data-station-name="' + item.stationName + '">' + item.stationName + (item.distanceMeters ? '<span>' + formatDistanceMeters(item.distanceMeters) + '</span>' : '') + '</button>';
  }).join('');
  $('#routePickerCandidates').html(html);
  $('#routePickerCandidates .route-picker-candidate').off('click').on('click', function() {
    var stationName = $(this).attr('data-station-name');
    var candidate = (selection.nearbyStations || []).filter(function(item) {
      return item.stationName === stationName;
    })[0];
    if (!candidate) {
      return;
    }
    var station = (ROUTE_PICKER_CONTEXT.stations || []).filter(function(item) {
      return item.name === stationName;
    })[0];
    if (!station) {
      return;
    }
    ROUTE_PICKER_CONTEXT.selectedCandidate = {
      rawInput: selection.rawInput,
      queryText: selection.queryText,
      stationName: station.name,
      stationLng: station.lng,
      stationLat: station.lat,
      pointLng: selection.pointLng,
      pointLat: selection.pointLat,
      source: selection.source || 'map',
      matchMode: 'NEAREST',
      distanceMeters: Number(candidate.distanceMeters || 0),
      formattedAddress: selection.formattedAddress || '',
      nearbyStations: selection.nearbyStations || []
    };
    $('#routePickerCandidates .route-picker-candidate').removeClass('is-active');
    $(this).addClass('is-active');
    $('#routePickerStatus').text(station.name);
    renderPickerSelectionSummary(ROUTE_PICKER_CONTEXT.selectedCandidate);
  });
}

function getSelectionFocusPoint(selection) {
  if (!selection) {
    return null;
  }
  var lng = Number(selection.pointLng != null ? selection.pointLng : selection.stationLng);
  var lat = Number(selection.pointLat != null ? selection.pointLat : selection.stationLat);
  if (isNaN(lng) || isNaN(lat)) {
    return null;
  }
  return {
    lng: lng,
    lat: lat,
    label: normalizeRouteText(selection.formattedAddress || selection.queryText || selection.rawInput || selection.stationName) || '地点'
  };
}

function resizePickerMap() {
  if (!ROUTE_PICKER_CONTEXT.map) {
    return;
  }
  if (ROUTE_PICKER_CONTEXT.engineType === 'amap') {
    try {
      ROUTE_PICKER_CONTEXT.map.resize();
    } catch (e) {}
    return;
  }
  try {
    ROUTE_PICKER_CONTEXT.map.invalidateSize();
  } catch (e) {}
}

function getRoutePickerMapElement() {
  return document.getElementById('routePickerMap');
}

function hidePickerContextMenu() {
  var menu = document.getElementById('routeMapContextMenu');
  if (!menu) {
    return;
  }
  menu.hidden = true;
  menu.setAttribute('aria-hidden', 'true');
  menu.classList.remove('is-visible');
  menu.style.left = '';
  menu.style.top = '';
  ROUTE_PICKER_CONTEXT.contextPoint = null;
}

function showPickerContextMenu(anchor) {
  var menu = document.getElementById('routeMapContextMenu');
  var container = getRoutePickerMapElement();
  if (!menu || !container) {
    return;
  }
  var left = Number(anchor && anchor.left);
  var top = Number(anchor && anchor.top);
  menu.hidden = false;
  menu.setAttribute('aria-hidden', 'false');
  menu.classList.add('is-visible');
  var padding = 14;
  var maxLeft = Math.max(padding, container.clientWidth - menu.offsetWidth - padding);
  var maxTop = Math.max(padding, container.clientHeight - menu.offsetHeight - padding);
  if (isNaN(left)) {
    left = padding;
  }
  if (isNaN(top)) {
    top = padding;
  }
  menu.style.left = Math.max(padding, Math.min(left, maxLeft)) + 'px';
  menu.style.top = Math.max(padding, Math.min(top, maxTop)) + 'px';
}

function openPickerContextMenu(point, anchor) {
  handlePickerPointSelection(point);
  ROUTE_PICKER_CONTEXT.contextPoint = { lng: Number(point.lng), lat: Number(point.lat) };
  showPickerContextMenu(anchor);
}

function tryResolveContextPoint(anchor) {
  if (!ROUTE_PICKER_CONTEXT.map) {
    return null;
  }
  var point = null;
  if (ROUTE_PICKER_CONTEXT.engineType === 'amap' && window.AMap && typeof ROUTE_PICKER_CONTEXT.map.containerToLngLat === 'function') {
    var lngLat = null;
    try {
      lngLat = ROUTE_PICKER_CONTEXT.map.containerToLngLat(new AMap.Pixel(anchor.left, anchor.top));
    } catch (e) {
      try {
        lngLat = ROUTE_PICKER_CONTEXT.map.containerToLngLat([anchor.left, anchor.top]);
      } catch (ignore) {}
    }
    if (lngLat) {
      point = {
        lng: Number(lngLat.lng != null ? lngLat.lng : (lngLat.getLng ? lngLat.getLng() : NaN)),
        lat: Number(lngLat.lat != null ? lngLat.lat : (lngLat.getLat ? lngLat.getLat() : NaN))
      };
    }
  } else if (ROUTE_PICKER_CONTEXT.engineType === 'leaflet' && typeof ROUTE_PICKER_CONTEXT.map.containerPointToLatLng === 'function') {
    var latlng = ROUTE_PICKER_CONTEXT.map.containerPointToLatLng([anchor.left, anchor.top]);
    if (latlng) {
      point = { lng: Number(latlng.lng), lat: Number(latlng.lat) };
    }
  }
  if (point && !isNaN(point.lng) && !isNaN(point.lat)) {
    return point;
  }
  return null;
}

function handleMapContextGesture(event) {
  if (!event) {
    return;
  }
  var isContextMenu = event.type === 'contextmenu';
  var isRightButton = event.button === 2 || event.which === 3 || event.buttons === 2;
  if (!isContextMenu && !isRightButton) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === 'function') {
    event.stopImmediatePropagation();
  }
  if (!ROUTE_PICKER_CONTEXT.map) {
    return;
  }
  var now = Date.now();
  if (now - Number(ROUTE_PICKER_CONTEXT.contextEventStamp || 0) < 180) {
    return;
  }
  ROUTE_PICKER_CONTEXT.contextEventStamp = now;
  var mapElement = getRoutePickerMapElement();
  if (!mapElement) {
    return;
  }
  var rect = mapElement.getBoundingClientRect();
  var anchor = {
    left: Number(event.clientX - rect.left),
    top: Number(event.clientY - rect.top)
  };
  var point = tryResolveContextPoint(anchor);
  if (point) {
    openPickerContextMenu(point, anchor);
  }
}

function bindRouteMapContextMenu() {
  if (ROUTE_PICKER_CONTEXT.contextMenuBound) {
    return;
  }
  ROUTE_PICKER_CONTEXT.contextMenuBound = true;

  $(document).on('click.routeMapContextMenu', function(event) {
    if ($(event.target).closest('#routeMapContextMenu').length) {
      return;
    }
    hidePickerContextMenu();
  });

  $(document).on('keydown.routeMapContextMenu', function(event) {
    if (event.key === 'Escape') {
      hidePickerContextMenu();
    }
  });

  $('#routeMapContextMenu').on('click', '[data-action]', function(event) {
    event.preventDefault();
    event.stopPropagation();
    var action = $(this).attr('data-action');
    if (action === 'set-start') {
      assignSelectionToField('start');
      return;
    }
    if (action === 'set-end') {
      assignSelectionToField('end');
      return;
    }
    if (action === 'swap') {
      swapRouteSelections();
    }
  });

  var mapElement = getRoutePickerMapElement();
  if (mapElement) {
    mapElement.addEventListener('contextmenu', handleMapContextGesture, true);
    mapElement.addEventListener('mouseup', handleMapContextGesture, true);
  }
}

function syncPickerMarker(point, zoom, preserveSelection) {
  if (!ROUTE_PICKER_CONTEXT.map || !point) {
    return;
  }
  var lng = Number(point.lng);
  var lat = Number(point.lat);
  if (isNaN(lng) || isNaN(lat)) {
    return;
  }
  if (ROUTE_PICKER_CONTEXT.engineType === 'amap' && window.AMap) {
    var position = [lng, lat];
    if (ROUTE_PICKER_CONTEXT.marker) {
      ROUTE_PICKER_CONTEXT.marker.setPosition(position);
    } else {
      ROUTE_PICKER_CONTEXT.marker = new AMap.Marker({ position: position, anchor: 'bottom-center' });
      ROUTE_PICKER_CONTEXT.map.add(ROUTE_PICKER_CONTEXT.marker);
    }
    if (zoom) {
      ROUTE_PICKER_CONTEXT.map.setZoomAndCenter(zoom, position);
    } else {
      ROUTE_PICKER_CONTEXT.map.setCenter(position);
    }
  } else if (window.L) {
    var latlng = [lat, lng];
    if (ROUTE_PICKER_CONTEXT.marker) {
      ROUTE_PICKER_CONTEXT.marker.setLatLng(latlng);
    } else {
      ROUTE_PICKER_CONTEXT.marker = L.marker(latlng).addTo(ROUTE_PICKER_CONTEXT.map);
    }
    if (zoom) {
      if (typeof ROUTE_PICKER_CONTEXT.map.flyTo === 'function') {
        ROUTE_PICKER_CONTEXT.map.flyTo(latlng, zoom, { animate: true, duration: 0.8 });
      } else {
        ROUTE_PICKER_CONTEXT.map.setView(latlng, zoom);
      }
    }
  }
  if (!preserveSelection) {
    ROUTE_PICKER_CONTEXT.clickedPoint = { lng: lng, lat: lat };
  }
}

function focusPickerSelection(selection, options) {
  options = options || {};
  if (!selection) {
    updatePickerStatus(null);
    return;
  }
  ROUTE_PICKER_CONTEXT.selectedCandidate = cloneRouteData(selection);
  updatePickerStatus(selection);
  var point = getSelectionFocusPoint(selection);
  if (point) {
    syncPickerMarker(point, options.zoom || (selection.source === 'map' ? 16 : 15), true);
  }
}

function buildAssignedSelection(field, selection) {
  var payload = cloneRouteData(selection) || {};
  payload.source = payload.source || 'map';
  payload.rawInput = payload.stationName || payload.rawInput || '';
  payload.queryText = payload.stationName || payload.queryText || payload.rawInput || '';
  return payload;
}

function assignSelectionToField(field) {
  var selection = cloneRouteData(ROUTE_PICKER_CONTEXT.selectedCandidate);
  if (!selection || !selection.stationName) {
    return;
  }
  var payload = buildAssignedSelection(field, selection);
  setFieldInputValue(field, payload.stationName || '');
  setResolvedField(field, payload);
  ACTIVE_LIST_RESOLUTION[field] = cloneRouteData(payload);
  setPickerFocusField(field);
  hidePickerContextMenu();
  if (window.AccessibilityUtils) {
    AccessibilityUtils.announce('已设为' + getFieldConfig(field).label, 'polite', { interrupt: true });
  }
}

function applyFieldState(field, value, resolution) {
  setFieldInputValue(field, value || '');
  if (resolution && resolution.stationName) {
    ROUTE_INPUT_RESOLUTION_STATE[field] = cloneRouteData(resolution);
    ACTIVE_LIST_RESOLUTION[field] = cloneRouteData(resolution);
    setFieldHint(field, buildResolvedHintText(field, resolution), Number(resolution.distanceMeters || 0) > 900 ? 'warn' : 'ready');
  } else {
    clearResolvedField(field);
  }
}

function swapRouteSelections() {
  var startValue = getFieldInputValue('start');
  var endValue = getFieldInputValue('end');
  var startSelection = getResolvedField('start');
  var endSelection = getResolvedField('end');
  applyFieldState('start', endValue, endSelection);
  applyFieldState('end', startValue, startSelection);
  setPickerFocusField('start');
  hidePickerContextMenu();
  if (window.AccessibilityUtils) {
    AccessibilityUtils.announce('已交换起点和终点', 'polite', { interrupt: true });
  }
}

function handlePickerPointSelection(point) {
  hidePickerContextMenu();
  syncPickerMarker(point, 16);
  var resolution = buildCoordinateResolution(ROUTE_PICKER_CONTEXT.stations, {
    lng: Number(point.lng),
    lat: Number(point.lat)
  }, '地图选点', 'map', '地图选点');
  resolution.source = 'map';
  resolution.queryText = resolution.stationName || '地图选点';
  ROUTE_PICKER_CONTEXT.clickedPoint = { lng: Number(point.lng), lat: Number(point.lat) };
  ROUTE_PICKER_CONTEXT.selectedCandidate = resolution;
  updatePickerStatus(resolution);
}

function initLeafletPickerMap(stations) {
  return new Promise(function(resolve, reject) {
    if (!window.L) {
      reject(new Error('Leaflet 不可用'));
      return;
    }
    ROUTE_PICKER_CONTEXT.engineType = 'leaflet';
    ROUTE_PICKER_CONTEXT.stations = stations || [];
    var center = (window.mapEngineConfig && window.mapEngineConfig.center) ? window.mapEngineConfig.center : [113.2644, 23.1291];
    var tileUrl = (window.mapEngineConfig && (window.mapEngineConfig.leafletOnlineTileUrl || window.mapEngineConfig.leafletTileUrl)) || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var attribution = (window.mapEngineConfig && window.mapEngineConfig.leafletOnlineAttribution) || '&copy; OpenStreetMap contributors';
    ROUTE_PICKER_CONTEXT.map = L.map('routePickerMap', { zoomControl: true }).setView([center[1], center[0]], Number((window.mapEngineConfig && window.mapEngineConfig.zoom) || 13));
    ROUTE_PICKER_CONTEXT.tileLayer = L.tileLayer(tileUrl, { attribution: attribution }).addTo(ROUTE_PICKER_CONTEXT.map);
    ROUTE_PICKER_CONTEXT.map.on('click', function(event) {
      var latlng = event.latlng || {};
      handlePickerPointSelection({ lng: Number(latlng.lng), lat: Number(latlng.lat) });
    });
    ROUTE_PICKER_CONTEXT.map.on('movestart', function() {
      hidePickerContextMenu();
    });
    ROUTE_PICKER_CONTEXT.map.on('zoomstart', function() {
      hidePickerContextMenu();
    });
    ROUTE_PICKER_CONTEXT.map.on('dragstart', function() {
      hidePickerContextMenu();
    });
    bindRouteMapContextMenu();
    setTimeout(function() {
      resizePickerMap();
      resolve(ROUTE_PICKER_CONTEXT.map);
    }, 120);
  });
}

function initAmapPickerMap(stations) {
  return loadRouteAmapSdk().then(function(AMap) {
    ROUTE_PICKER_CONTEXT.engineType = 'amap';
    ROUTE_PICKER_CONTEXT.stations = stations || [];
    var center = (window.mapEngineConfig && window.mapEngineConfig.center) ? window.mapEngineConfig.center : [113.2644, 23.1291];
    ROUTE_PICKER_CONTEXT.map = new AMap.Map('routePickerMap', {
      zoom: Number((window.mapEngineConfig && window.mapEngineConfig.zoom) || 13),
      center: [Number(center[0]), Number(center[1])],
      viewMode: '2D'
    });
    ROUTE_PICKER_CONTEXT.map.on('click', function(event) {
      if (!event || !event.lnglat) {
        return;
      }
      handlePickerPointSelection({ lng: Number(event.lnglat.lng), lat: Number(event.lnglat.lat) });
    });
    ROUTE_PICKER_CONTEXT.map.on('mapmove', function() {
      hidePickerContextMenu();
    });
    ROUTE_PICKER_CONTEXT.map.on('zoomstart', function() {
      hidePickerContextMenu();
    });
    ROUTE_PICKER_CONTEXT.map.on('dragstart', function() {
      hidePickerContextMenu();
    });
    bindRouteMapContextMenu();
    setTimeout(function() {
      resizePickerMap();
    }, 160);
    return ROUTE_PICKER_CONTEXT.map;
  });
}

function initPickerMap(stations) {
  ROUTE_PICKER_CONTEXT.stations = stations || ROUTE_PICKER_CONTEXT.stations || [];
  if (ROUTE_PICKER_CONTEXT.map) {
    setTimeout(function() {
      resizePickerMap();
    }, 60);
    return Promise.resolve(ROUTE_PICKER_CONTEXT.map);
  }
  if (window.mapEngineConfig && window.mapEngineConfig.amapKey) {
    return initAmapPickerMap(stations).catch(function() {
      return initLeafletPickerMap(stations);
    });
  }
  return initLeafletPickerMap(stations);
}

function locatePickerToCurrentInput(field, options) {
  options = options || {};
  var activeField = field || getPickerFocusField();
  setPickerFocusField(activeField);
  var currentValue = getFieldInputValue(activeField);
  var resolved = getResolvedField(activeField);
  if (!currentValue && resolved) {
    focusPickerSelection(resolved, { zoom: 16 });
    return Promise.resolve(resolved);
  }
  if (!currentValue) {
    updatePickerStatus(null);
    return Promise.resolve(null);
  }
  $('#routePickerStatus').text('定位中');
  return resolveInputToStation(activeField, { keyword: currentValue, silent: true }).then(function(selection) {
    focusPickerSelection(selection, { zoom: selection.source === 'geocode' ? 15 : 16 });
    return selection;
  }).catch(function(error) {
    $('#routePickerStatus').text('未识别');
    renderPickerSelectionSummary(null);
    if (options.showToast) {
      layui.layer.msg((error && error.message) || '地点定位失败');
    }
    throw error;
  });
}

function activateInlinePicker(options) {
  options = options || {};
  return loadRouteStationIndex().then(function(stations) {
    return initPickerMap(stations).then(function() {
      if (options.scrollIntoView !== false) {
        var panel = document.getElementById('routeInlinePickerPanel');
        if (panel && options.silentScroll !== true) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      var resolved = getResolvedField(getPickerFocusField()) || getResolvedField('start') || getResolvedField('end');
      if (resolved) {
        focusPickerSelection(resolved, { zoom: 16 });
        return resolved;
      }
      updatePickerStatus(null);
      return null;
    });
  });
}

function bindResolutionListeners() {
  ['start', 'end'].forEach(function(field) {
    var config = getFieldConfig(field);
    $(config.inputSelector).on('focus', function() {
      setPickerFocusField(field);
      updateStationSuggestions(getFieldInputValue(field));
    }).on('input', function() {
      var currentValue = getFieldInputValue(field);
      clearResolvedField(field);
      setFieldHint(field, '未选择', '');
      updateStationSuggestions(currentValue);
    }).on('blur', function() {
      var currentValue = getFieldInputValue(field);
      window.setTimeout(function() {
        renderStationSuggestions(ROUTE_STATION_INDEX_CACHE || [], '');
      }, 120);
      if (!currentValue) {
        clearResolvedField(field);
        return;
      }
      resolveInputToStation(field, { keyword: currentValue, silent: true }).then(function(selection) {
        focusPickerSelection(selection, { zoom: selection.source === 'geocode' ? 15 : 16 });
      }).catch(function() {});
    });
  });

  $('#routePickerLocateInput').on('click', function() {
    locatePickerToCurrentInput(getPickerFocusField(), { showToast: true }).catch(function() {});
  });
  $('#routeAssignStart').on('click', function() {
    assignSelectionToField('start');
  });
  $('#routeAssignEnd').on('click', function() {
    assignSelectionToField('end');
  });
  $('#routeSwapPoints').on('click', function() {
    swapRouteSelections();
  });

  bindRouteMapContextMenu();
}
