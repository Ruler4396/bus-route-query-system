package com.service;

import java.util.Map;

/**
 * 外部无障碍数据接入服务（OSM/Overpass + 开放广东）。
 */
public interface AccessibilityExternalDataService {

    /**
     * 获取连接器配置与运行元数据。
     */
    Map<String, Object> getConnectorMeta();

    /**
     * 获取 OSM/Overpass 无障碍统计摘要。
     */
    Map<String, Object> getOverpassSummary(String areaName, boolean forceRefresh);

    /**
     * 在“开放广东”中按关键词检索数据目录。
     */
    Map<String, Object> searchOpenGdCatalog(String keyword, Integer pageNo, Integer pageSize, boolean forceRefresh);

    /**
     * 获取“开放广东”单个资源明细。
     */
    Map<String, Object> getOpenGdResourceDetail(String resId, boolean includePreview, boolean forceRefresh);

    /**
     * 获取聚合摘要（含规则化质量评分与风险提示）。
     */
    Map<String, Object> getIntegratedAccessibilitySummary(String areaName, String keyword,
                                                          Integer pageNo, Integer pageSize,
                                                          boolean forceRefresh);
}

