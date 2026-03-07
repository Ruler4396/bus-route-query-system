package com.service;

import java.util.Map;

/**
 * 外部无障碍数据接入服务（OSM/Overpass + 开放广东 + 本地治理元数据）。
 */
public interface AccessibilityExternalDataService {

    Map<String, Object> getConnectorMeta();

    Map<String, Object> getGovernanceMeta();

    Map<String, Object> getOverpassSummary(String areaName, boolean forceRefresh);

    Map<String, Object> searchOpenGdCatalog(String keyword, Integer pageNo, Integer pageSize, boolean forceRefresh);

    Map<String, Object> getOpenGdResourceDetail(String resId, boolean includePreview, boolean forceRefresh);

    Map<String, Object> getIntegratedAccessibilitySummary(String areaName, String keyword,
                                                          Integer pageNo, Integer pageSize,
                                                          boolean forceRefresh);
}
