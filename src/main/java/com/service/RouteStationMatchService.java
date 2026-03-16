package com.service;

import com.entity.GongjiaoluxianEntity;

import java.util.List;

/**
 * 路线站点匹配服务
 */
public interface RouteStationMatchService {

    List<String> buildOrderedStations(GongjiaoluxianEntity route);

    boolean matchesRouteStation(GongjiaoluxianEntity route, String keyword);

    boolean matchesStationName(String stationName, String keyword);

    String findTransferStation(GongjiaoluxianEntity first, GongjiaoluxianEntity second, String startStation, String endStation);

    String findBestMatchingStationName(GongjiaoluxianEntity route, String keyword, boolean startSide);

    String resolveMatchType(String keyword, String primaryStation, List<String> stations, boolean startSide);
}
