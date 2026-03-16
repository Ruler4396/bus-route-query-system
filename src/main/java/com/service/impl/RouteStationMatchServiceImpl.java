package com.service.impl;

import com.entity.GongjiaoluxianEntity;
import com.service.RouteStationMatchService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service("routeStationMatchService")
public class RouteStationMatchServiceImpl implements RouteStationMatchService {

    @Override
    public List<String> buildOrderedStations(GongjiaoluxianEntity route) {
        List<String> ordered = new ArrayList<>();
        if (route == null) {
            return ordered;
        }
        appendStationIfAbsent(ordered, route.getQidianzhanming());
        if (route.getTujingzhandian() != null && !route.getTujingzhandian().trim().isEmpty()) {
            for (String raw : route.getTujingzhandian().split(",")) {
                appendStationIfAbsent(ordered, raw);
            }
        }
        appendStationIfAbsent(ordered, route.getZhongdianzhanming());
        return ordered;
    }

    @Override
    public boolean matchesRouteStation(GongjiaoluxianEntity route, String keyword) {
        List<String> stations = buildOrderedStations(route);
        if (stations.isEmpty()) {
            return false;
        }
        for (String station : stations) {
            if (matchesStationName(station, keyword)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean matchesStationName(String stationName, String keyword) {
        String safeStation = stationName == null ? "" : stationName.trim();
        String safeKeyword = keyword == null ? "" : keyword.trim();
        if (safeStation.isEmpty() || safeKeyword.isEmpty()) {
            return false;
        }
        return safeStation.contains(safeKeyword) || safeKeyword.contains(safeStation);
    }

    @Override
    public String findTransferStation(GongjiaoluxianEntity first, GongjiaoluxianEntity second, String startStation, String endStation) {
        List<String> leftStations = buildOrderedStations(first);
        List<String> rightStations = buildOrderedStations(second);
        if (leftStations.isEmpty() || rightStations.isEmpty()) {
            return null;
        }
        String resolvedStart = findBestMatchingStationName(first, startStation, true);
        String resolvedEnd = findBestMatchingStationName(second, endStation, false);
        int startIndex = Math.max(0, leftStations.indexOf(resolvedStart));
        int endIndex = rightStations.indexOf(resolvedEnd);
        if (endIndex < 0) {
            endIndex = rightStations.size() - 1;
        }
        Set<String> rightSet = new LinkedHashSet<>(rightStations);
        String fallback = null;
        for (int i = startIndex; i < leftStations.size(); i++) {
            String station = leftStations.get(i);
            if (!rightSet.contains(station)) {
                continue;
            }
            int rightIndex = rightStations.indexOf(station);
            if (rightIndex < 0 || rightIndex > endIndex) {
                continue;
            }
            if (matchesStationName(station, resolvedStart) || matchesStationName(station, resolvedEnd)) {
                continue;
            }
            if (fallback == null) {
                fallback = station;
            }
            if (isPreferredTransferStation(station)) {
                return station;
            }
        }
        return fallback;
    }

    @Override
    public String findBestMatchingStationName(GongjiaoluxianEntity route, String keyword, boolean startSide) {
        List<String> ordered = buildOrderedStations(route);
        if (ordered.isEmpty()) {
            if (route == null) {
                return null;
            }
            return startSide ? route.getQidianzhanming() : route.getZhongdianzhanming();
        }
        String safeKeyword = keyword == null ? "" : keyword.trim();
        if (safeKeyword.isEmpty()) {
            return startSide ? ordered.get(0) : ordered.get(ordered.size() - 1);
        }
        if (startSide) {
            for (String station : ordered) {
                if (station.contains(safeKeyword) || safeKeyword.contains(station)) {
                    return station;
                }
            }
            return ordered.get(0);
        }
        for (int i = ordered.size() - 1; i >= 0; i--) {
            String station = ordered.get(i);
            if (station.contains(safeKeyword) || safeKeyword.contains(station)) {
                return station;
            }
        }
        return ordered.get(ordered.size() - 1);
    }

    @Override
    public String resolveMatchType(String keyword, String primaryStation, List<String> stations, boolean startSide) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        if (safeKeyword.isEmpty()) {
            return "UNKNOWN";
        }
        if (primaryStation != null && (primaryStation.equalsIgnoreCase(safeKeyword) || primaryStation.contains(safeKeyword) || safeKeyword.contains(primaryStation))) {
            return primaryStation.equalsIgnoreCase(safeKeyword) ? "EXACT" : "FUZZY";
        }
        for (String station : stations) {
            if (station.contains(safeKeyword) || safeKeyword.contains(station)) {
                return station.equalsIgnoreCase(safeKeyword) ? "EXACT" : "FUZZY";
            }
        }
        if (startSide) {
            return "HEURISTIC_START";
        }
        return "HEURISTIC_END";
    }

    private void appendStationIfAbsent(List<String> target, String stationName) {
        String safe = stationName == null ? "" : stationName.trim();
        if (!safe.isEmpty() && !target.contains(safe)) {
            target.add(safe);
        }
    }

    private boolean isPreferredTransferStation(String stationName) {
        return containsKeyword(stationName, "海珠广场", "文化公园", "纸厂地铁燕岗站", "西门口", "珠江医院", "中山医", "如意坊", "江南西");
    }

    private boolean containsKeyword(String text, String... keywords) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        for (String keyword : keywords) {
            if (keyword != null && !keyword.isEmpty() && text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}
