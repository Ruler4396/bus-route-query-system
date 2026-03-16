package com.service.impl;

import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.entity.GongjiaoluxianEntity;
import com.service.GongjiaoluxianService;
import com.service.RouteCandidateQueryService;
import com.service.RouteStationMatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service("routeCandidateQueryService")
public class RouteCandidateQueryServiceImpl implements RouteCandidateQueryService {

    @Autowired
    private GongjiaoluxianService gongjiaoluxianService;

    @Autowired
    private RouteStationMatchService routeStationMatchService;

    @Override
    public List<GongjiaoluxianEntity> getAllPossibleRoutes(String startStation, String endStation) {
        List<GongjiaoluxianEntity> allRoutes = gongjiaoluxianService.selectList(new EntityWrapper<GongjiaoluxianEntity>());
        LinkedHashMap<String, GongjiaoluxianEntity> ordered = new LinkedHashMap<>();
        List<GongjiaoluxianEntity> startMatches = new ArrayList<>();
        List<GongjiaoluxianEntity> endMatches = new ArrayList<>();

        for (GongjiaoluxianEntity route : allRoutes) {
            boolean startMatch = routeStationMatchService.matchesRouteStation(route, startStation);
            boolean endMatch = routeStationMatchService.matchesRouteStation(route, endStation);
            if (startMatch || endMatch) {
                ordered.put("DIRECT#" + String.valueOf(route.getId()), route);
            }
            if (startMatch) {
                startMatches.add(route);
            }
            if (endMatch) {
                endMatches.add(route);
            }
        }

        int syntheticCount = 0;
        for (GongjiaoluxianEntity first : startMatches) {
            for (GongjiaoluxianEntity second : endMatches) {
                if (first.getId() != null && first.getId().equals(second.getId())) {
                    continue;
                }
                String transferStation = routeStationMatchService.findTransferStation(first, second, startStation, endStation);
                if (transferStation == null) {
                    continue;
                }
                GongjiaoluxianEntity transferRoute = buildTransferRoute(first, second, transferStation, startStation, endStation);
                if (transferRoute == null) {
                    continue;
                }
                String comboKey = "TRANSFER#" + String.valueOf(first.getId()) + "#" + String.valueOf(second.getId()) + "#" + transferStation;
                ordered.put(comboKey, transferRoute);
                syntheticCount++;
                if (syntheticCount >= 6) {
                    break;
                }
            }
            if (syntheticCount >= 6) {
                break;
            }
        }
        return new ArrayList<>(ordered.values());
    }

    private GongjiaoluxianEntity buildTransferRoute(GongjiaoluxianEntity first, GongjiaoluxianEntity second, String transferStation, String startStation, String endStation) {
        List<String> leftStations = routeStationMatchService.buildOrderedStations(first);
        List<String> rightStations = routeStationMatchService.buildOrderedStations(second);
        if (leftStations.isEmpty() || rightStations.isEmpty()) {
            return null;
        }
        String resolvedStart = routeStationMatchService.findBestMatchingStationName(first, startStation, true);
        String resolvedEnd = routeStationMatchService.findBestMatchingStationName(second, endStation, false);
        int startIndex = leftStations.indexOf(resolvedStart);
        int transferLeftIndex = leftStations.indexOf(transferStation);
        int transferRightIndex = rightStations.indexOf(transferStation);
        int endIndex = rightStations.indexOf(resolvedEnd);
        if (startIndex < 0) {
            startIndex = 0;
        }
        if (transferLeftIndex < startIndex || transferRightIndex < 0) {
            return null;
        }
        if (endIndex < transferRightIndex) {
            endIndex = rightStations.size() - 1;
        }
        List<String> mergedStations = new ArrayList<>();
        for (int i = startIndex; i <= transferLeftIndex; i++) {
            appendStationIfAbsent(mergedStations, leftStations.get(i));
        }
        for (int i = transferRightIndex + 1; i <= endIndex && i < rightStations.size(); i++) {
            appendStationIfAbsent(mergedStations, rightStations.get(i));
        }
        if (mergedStations.size() < 3) {
            return null;
        }

        Map<String, Map<String, Object>> coordinateMap = buildStationCoordinateMap(first);
        coordinateMap.putAll(buildStationCoordinateMap(second));

        GongjiaoluxianEntity route = new GongjiaoluxianEntity();
        route.setId(null);
        route.setLuxianbianhao(String.valueOf(first.getLuxianbianhao()) + "/" + String.valueOf(second.getLuxianbianhao()));
        route.setLuxianmingcheng(String.valueOf(first.getLuxianbianhao()) + "→" + String.valueOf(second.getLuxianbianhao()) + " 换乘方案（" + transferStation + "）");
        route.setFengmian(first.getFengmian() != null ? first.getFengmian() : second.getFengmian());
        route.setJiage(safeInteger(first.getJiage()) + safeInteger(second.getJiage()));
        route.setQidianzhanming(mergedStations.get(0));
        route.setQidianzuobiao(buildCoordinateText(coordinateMap, route.getQidianzhanming()));
        route.setTujingzhandian(String.join(",", mergedStations.subList(1, mergedStations.size())));
        route.setZhandianzuobiao(buildStationCoordinateJson(mergedStations, coordinateMap));
        route.setLuxianguiji(buildTransferTrackJson(first, second, coordinateMap, resolvedStart, transferStation, resolvedEnd, mergedStations));
        route.setZhongdianzhanming(mergedStations.get(mergedStations.size() - 1));
        route.setZhongdianzuobiao(buildCoordinateText(coordinateMap, route.getZhongdianzhanming()));
        route.setLuxianxiangqing("演示换乘方案：先乘坐" + first.getLuxianbianhao() + "至" + transferStation + "，再换乘" + second.getLuxianbianhao() + "前往" + route.getZhongdianzhanming() + "。用于展示多线路中转推荐与风险核对。");
        route.setThumbsupnum(safeInteger(first.getThumbsupnum()) + safeInteger(second.getThumbsupnum()));
        route.setCrazilynum(safeInteger(first.getCrazilynum()) + safeInteger(second.getCrazilynum()));
        route.setClicknum(Math.max(safeInteger(first.getClicknum()), safeInteger(second.getClicknum())) + mergedStations.size());
        route.setWuzhangaisheshi(combineText("；", first.getWuzhangaisheshi(), second.getWuzhangaisheshi()));
        route.setWuzhangaijibie(mergeAccessibilityLevel(first.getWuzhangaijibie(), second.getWuzhangaijibie()));
        route.setDiantifacilities(transferStation + "换乘节点；首段：" + safeText(first.getDiantifacilities(), "换乘设施待核对") + "；次段：" + safeText(second.getDiantifacilities(), "换乘设施待核对"));
        route.setXunlianzhuankuan("换乘节点：" + transferStation + "；先乘坐" + first.getLuxianbianhao() + "，再换乘" + second.getLuxianbianhao() + "。");
        route.setYuyintongbao(mergeBooleanField(first.getYuyintongbao(), second.getYuyintongbao()));
        route.setMangdaozhichi(mergeBooleanField(first.getMangdaozhichi(), second.getMangdaozhichi()));
        route.setDitezhichi(mergeBooleanField(first.getDitezhichi(), second.getDitezhichi()));
        Date latestTime = first.getAddtime();
        if (latestTime == null || (second.getAddtime() != null && second.getAddtime().after(latestTime))) {
            latestTime = second.getAddtime();
        }
        route.setAddtime(latestTime != null ? latestTime : new Date());
        return route;
    }

    private void appendStationIfAbsent(List<String> target, String stationName) {
        String safe = stationName == null ? "" : stationName.trim();
        if (!safe.isEmpty() && !target.contains(safe)) {
            target.add(safe);
        }
    }

    private Map<String, Map<String, Object>> buildStationCoordinateMap(GongjiaoluxianEntity route) {
        Map<String, Map<String, Object>> coordinateMap = new LinkedHashMap<>();
        if (route == null) {
            return coordinateMap;
        }
        putCoordinateIfAbsent(coordinateMap, route.getQidianzhanming(), route.getQidianzuobiao());
        putCoordinateIfAbsent(coordinateMap, route.getZhongdianzhanming(), route.getZhongdianzuobiao());
        if (route.getZhandianzuobiao() == null || route.getZhandianzuobiao().trim().isEmpty()) {
            return coordinateMap;
        }
        Object parsed = JSON.parse(route.getZhandianzuobiao());
        if (!(parsed instanceof List)) {
            return coordinateMap;
        }
        for (Object item : (List<?>) parsed) {
            if (!(item instanceof Map)) {
                continue;
            }
            Map<?, ?> raw = (Map<?, ?>) item;
            String name = raw.get("name") == null ? "" : String.valueOf(raw.get("name")).trim();
            Double lng = toDouble(raw.get("lng"));
            Double lat = toDouble(raw.get("lat"));
            if (name.isEmpty() || lng == null || lat == null) {
                continue;
            }
            coordinateMap.put(name, createCoordinateNode(name, lng, lat));
        }
        return coordinateMap;
    }

    private void putCoordinateIfAbsent(Map<String, Map<String, Object>> target, String stationName, String coordinateText) {
        String safeStation = stationName == null ? "" : stationName.trim();
        String safeCoordinate = coordinateText == null ? "" : coordinateText.trim();
        if (safeStation.isEmpty() || safeCoordinate.isEmpty() || target.containsKey(safeStation)) {
            return;
        }
        String[] parts = safeCoordinate.split(",");
        if (parts.length != 2) {
            return;
        }
        Double lng = toDouble(parts[0]);
        Double lat = toDouble(parts[1]);
        if (lng == null || lat == null) {
            return;
        }
        target.put(safeStation, createCoordinateNode(safeStation, lng, lat));
    }

    private Map<String, Object> createCoordinateNode(String stationName, Double lng, Double lat) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("name", stationName);
        node.put("lng", lng);
        node.put("lat", lat);
        return node;
    }

    private Double toDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(String.valueOf(value).trim());
        } catch (Exception ignore) {
            return null;
        }
    }

    private String buildCoordinateText(Map<String, Map<String, Object>> coordinateMap, String stationName) {
        Map<String, Object> node = coordinateMap.get(stationName);
        if (node == null) {
            return "";
        }
        Object lng = node.get("lng");
        Object lat = node.get("lat");
        if (lng == null || lat == null) {
            return "";
        }
        return String.valueOf(lng) + "," + String.valueOf(lat);
    }

    private String buildStationCoordinateJson(List<String> mergedStations, Map<String, Map<String, Object>> coordinateMap) {
        List<Map<String, Object>> nodes = new ArrayList<>();
        for (String station : mergedStations) {
            Map<String, Object> node = coordinateMap.get(station);
            if (node != null) {
                nodes.add(new LinkedHashMap<>(node));
            }
        }
        return nodes.isEmpty() ? null : JSON.toJSONString(nodes);
    }

    private String buildTrackJson(List<String> mergedStations, Map<String, Map<String, Object>> coordinateMap) {
        List<Map<String, Object>> nodes = new ArrayList<>();
        for (String station : mergedStations) {
            Map<String, Object> node = coordinateMap.get(station);
            if (node == null) {
                continue;
            }
            Map<String, Object> trackNode = new LinkedHashMap<>();
            trackNode.put("lng", node.get("lng"));
            trackNode.put("lat", node.get("lat"));
            nodes.add(trackNode);
        }
        return nodes.isEmpty() ? null : JSON.toJSONString(nodes);
    }


    private String buildTransferTrackJson(GongjiaoluxianEntity first,
                                          GongjiaoluxianEntity second,
                                          Map<String, Map<String, Object>> coordinateMap,
                                          String resolvedStart,
                                          String transferStation,
                                          String resolvedEnd,
                                          List<String> mergedStations) {
        List<Map<String, Object>> nodes = new ArrayList<>();
        appendTrackSlice(nodes, parseTrackNodes(first == null ? null : first.getLuxianguiji()), coordinateMap.get(resolvedStart), coordinateMap.get(transferStation), false);
        appendTrackSlice(nodes, parseTrackNodes(second == null ? null : second.getLuxianguiji()), coordinateMap.get(transferStation), coordinateMap.get(resolvedEnd), !nodes.isEmpty());
        if (nodes.size() < Math.max(6, ((mergedStations == null ? 0 : mergedStations.size()) + 1))) {
            return buildTrackJson(mergedStations, coordinateMap);
        }
        return JSON.toJSONString(nodes);
    }

    private List<Map<String, Object>> parseTrackNodes(String rawTrack) {
        List<Map<String, Object>> nodes = new ArrayList<>();
        if (rawTrack == null || rawTrack.trim().isEmpty()) {
            return nodes;
        }
        Object parsed = JSON.parse(rawTrack);
        if (!(parsed instanceof List)) {
            return nodes;
        }
        for (Object item : (List<?>) parsed) {
            Double lng = null;
            Double lat = null;
            if (item instanceof Map) {
                Map<?, ?> raw = (Map<?, ?>) item;
                lng = toDouble(raw.get("lng"));
                lat = toDouble(raw.get("lat"));
            } else if (item instanceof List) {
                List<?> raw = (List<?>) item;
                if (raw.size() >= 2) {
                    lng = toDouble(raw.get(0));
                    lat = toDouble(raw.get(1));
                }
            }
            if (lng == null || lat == null) {
                continue;
            }
            Map<String, Object> node = new LinkedHashMap<>();
            node.put("lng", lng);
            node.put("lat", lat);
            nodes.add(node);
        }
        return nodes;
    }

    private void appendTrackSlice(List<Map<String, Object>> target,
                                  List<Map<String, Object>> track,
                                  Map<String, Object> startNode,
                                  Map<String, Object> endNode,
                                  boolean skipFirstPoint) {
        if (track == null || track.size() < 2 || startNode == null || endNode == null) {
            return;
        }
        int startIndex = findNearestTrackIndex(track, toDouble(startNode.get("lng")), toDouble(startNode.get("lat")));
        int endIndex = findNearestTrackIndex(track, toDouble(endNode.get("lng")), toDouble(endNode.get("lat")));
        if (startIndex < 0 || endIndex < 0) {
            return;
        }
        if (startIndex <= endIndex) {
            for (int i = startIndex + (skipFirstPoint ? 1 : 0); i <= endIndex; i++) {
                appendTrackPoint(target, track.get(i));
            }
            return;
        }
        for (int i = startIndex - (skipFirstPoint ? 1 : 0); i >= endIndex; i--) {
            appendTrackPoint(target, track.get(i));
        }
    }

    private int findNearestTrackIndex(List<Map<String, Object>> track, Double lng, Double lat) {
        if (track == null || track.isEmpty() || lng == null || lat == null) {
            return -1;
        }
        int bestIndex = -1;
        double bestScore = Double.MAX_VALUE;
        for (int i = 0; i < track.size(); i++) {
            Map<String, Object> point = track.get(i);
            Double pointLng = toDouble(point.get("lng"));
            Double pointLat = toDouble(point.get("lat"));
            if (pointLng == null || pointLat == null) {
                continue;
            }
            double dx = pointLng - lng;
            double dy = pointLat - lat;
            double score = dx * dx + dy * dy;
            if (score < bestScore) {
                bestScore = score;
                bestIndex = i;
            }
        }
        return bestIndex;
    }

    private void appendTrackPoint(List<Map<String, Object>> target, Map<String, Object> point) {
        if (point == null) {
            return;
        }
        Double lng = toDouble(point.get("lng"));
        Double lat = toDouble(point.get("lat"));
        if (lng == null || lat == null) {
            return;
        }
        if (!target.isEmpty()) {
            Map<String, Object> last = target.get(target.size() - 1);
            Double lastLng = toDouble(last.get("lng"));
            Double lastLat = toDouble(last.get("lat"));
            if (lastLng != null && lastLat != null && Math.abs(lastLng - lng) < 0.0000001d && Math.abs(lastLat - lat) < 0.0000001d) {
                return;
            }
        }
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("lng", lng);
        node.put("lat", lat);
        target.add(node);
    }

    private Integer mergeAccessibilityLevel(Integer first, Integer second) {
        if (first == null || second == null) {
            return null;
        }
        return Math.max(first, second);
    }

    private Integer mergeBooleanField(Integer first, Integer second) {
        if (first == null || second == null) {
            return null;
        }
        return (first == 1 && second == 1) ? 1 : 0;
    }

    private String combineText(String separator, String... values) {
        List<String> segments = new ArrayList<>();
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                segments.add(value.trim());
            }
        }
        if (segments.isEmpty()) {
            return null;
        }
        return String.join(separator, segments);
    }

    private String safeText(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value.trim();
    }

    private Integer safeInteger(Integer value) {
        return value == null ? 0 : value;
    }
}
