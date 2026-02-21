package com.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.service.AccessibilityExternalDataService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 外部无障碍数据接入实现（OSM/Overpass + 开放广东）。
 */
@Service("accessibilityExternalDataService")
public class AccessibilityExternalDataServiceImpl implements AccessibilityExternalDataService {

    private static final String SOURCE_OVERPASS = "osm_overpass";
    private static final String SOURCE_OPEN_GD = "open_gd";
    private static final DateTimeFormatter OPEN_GD_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Value("${accessibility.connector.cache-ttl-ms:600000}")
    private long cacheTtlMs;

    @Value("${accessibility.connector.overpass.endpoint:https://overpass-api.de/api/interpreter}")
    private String overpassEndpoint;

    @Value("${accessibility.connector.overpass.timeout-ms:25000}")
    private int overpassTimeoutMs;

    @Value("${accessibility.connector.overpass.default-area-name:广州市}")
    private String overpassDefaultAreaName;

    @Value("${accessibility.connector.open-gd.base-url:https://gddata.gd.gov.cn/backOpen/open/data}")
    private String openGdBaseUrl;

    @Value("${accessibility.connector.open-gd.timeout-ms:20000}")
    private int openGdTimeoutMs;

    private final Map<String, CacheEntry> overpassCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry> openGdSearchCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry> openGdDetailCache = new ConcurrentHashMap<>();

    @Override
    public Map<String, Object> getConnectorMeta() {
        Map<String, Object> overpass = new LinkedHashMap<>();
        overpass.put("endpoint", overpassEndpoint);
        overpass.put("timeoutMs", overpassTimeoutMs);
        overpass.put("defaultAreaName", overpassDefaultAreaName);
        overpass.put("cacheSize", overpassCache.size());
        overpass.put("lastRefreshedAt", latestCacheTimestamp(overpassCache));

        Map<String, Object> openGd = new LinkedHashMap<>();
        openGd.put("baseUrl", openGdBaseUrl);
        openGd.put("timeoutMs", openGdTimeoutMs);
        openGd.put("searchCacheSize", openGdSearchCache.size());
        openGd.put("detailCacheSize", openGdDetailCache.size());
        openGd.put("lastSearchRefreshedAt", latestCacheTimestamp(openGdSearchCache));
        openGd.put("lastDetailRefreshedAt", latestCacheTimestamp(openGdDetailCache));

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("cacheTtlMs", cacheTtlMs);
        meta.put("connectors", Arrays.asList(overpass, openGd));
        meta.put("generatedAt", nowIso());
        return meta;
    }

    @Override
    public Map<String, Object> getOverpassSummary(String areaName, boolean forceRefresh) {
        String normalizedAreaName = normalizeAreaName(areaName);
        String cacheKey = "area:" + normalizedAreaName;
        CacheEntry cached = overpassCache.get(cacheKey);
        if (isCacheValid(cached, forceRefresh)) {
            return cloneMap(cached.payload);
        }

        Map<String, String> metricQueryMap = buildOverpassMetricQueryMap();
        Map<String, Object> metrics = new LinkedHashMap<>();
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        String snapshotTimestamp = null;

        for (Map.Entry<String, String> entry : metricQueryMap.entrySet()) {
            OverpassCountResult countResult = queryOverpassCount(normalizedAreaName, entry.getValue());
            if (countResult.errorMessage != null) {
                errors.add(entry.getKey() + ": " + countResult.errorMessage);
                metrics.put(entry.getKey(), null);
                continue;
            }
            metrics.put(entry.getKey(), countResult.total);
            successCount++;
            if (snapshotTimestamp == null && StrUtil.isNotBlank(countResult.snapshotTimestamp)) {
                snapshotTimestamp = countResult.snapshotTimestamp;
            }
        }

        Map<String, Object> derived = new LinkedHashMap<>();
        derived.put("busStopWheelchairCoverage",
                calcCoveragePercent(asLong(metrics.get("bus_stop_wheelchair_any")), asLong(metrics.get("bus_stop_total"))));
        derived.put("platformWheelchairCoverage",
                calcCoveragePercent(asLong(metrics.get("platform_wheelchair_any")), asLong(metrics.get("platform_total"))));
        derived.put("stationWheelchairCoverage",
                calcCoveragePercent(asLong(metrics.get("station_wheelchair_any")), asLong(metrics.get("station_total"))));

        double completeness = metricQueryMap.isEmpty() ? 0.0 : (successCount * 1.0 / metricQueryMap.size());
        double qualityScore = roundToOneDecimal(60.0 + completeness * 30.0 + overpassFreshnessScore(snapshotTimestamp));

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("source", SOURCE_OVERPASS);
        summary.put("areaName", normalizedAreaName);
        summary.put("snapshotTimestamp", snapshotTimestamp);
        summary.put("metrics", metrics);
        summary.put("derived", derived);
        summary.put("qualityScore", Math.min(100.0, qualityScore));
        summary.put("metricSuccessCount", successCount);
        summary.put("metricTotalCount", metricQueryMap.size());
        summary.put("errors", errors);
        summary.put("endpoint", overpassEndpoint);
        summary.put("fetchedAt", nowIso());

        overpassCache.put(cacheKey, new CacheEntry(summary));
        return cloneMap(summary);
    }

    @Override
    public Map<String, Object> searchOpenGdCatalog(String keyword, Integer pageNo, Integer pageSize, boolean forceRefresh) {
        String normalizedKeyword = defaultIfBlank(StrUtil.trim(keyword), "无障碍");
        int normalizedPageNo = pageNo == null ? 1 : Math.max(1, pageNo);
        int normalizedPageSize = pageSize == null ? 10 : Math.max(1, Math.min(50, pageSize));

        String cacheKey = normalizedKeyword + "|" + normalizedPageNo + "|" + normalizedPageSize;
        CacheEntry cached = openGdSearchCache.get(cacheKey);
        if (isCacheValid(cached, forceRefresh)) {
            return cloneMap(cached.payload);
        }

        String endpoint = normalizeOpenGdBaseUrl() + "/data/openCatalog/findPageBySearch";
        JSONObject req = new JSONObject();
        req.put("pageNo", normalizedPageNo);
        req.put("pageSize", normalizedPageSize);
        req.put("keyword", normalizedKeyword);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("source", SOURCE_OPEN_GD);
        result.put("endpoint", endpoint);
        result.put("keyword", normalizedKeyword);
        result.put("pageNo", normalizedPageNo);
        result.put("pageSize", normalizedPageSize);

        try {
            JSONObject root = postJson(endpoint, req, openGdTimeoutMs);
            String status = root == null ? null : root.getString("status");
            if (!"1000".equals(status)) {
                result.put("success", false);
                result.put("message", root == null ? "开放广东无响应" : root.getString("msg"));
                result.put("total", 0);
                result.put("items", Collections.emptyList());
                result.put("qualityScore", 35.0);
                result.put("fetchedAt", nowIso());
                openGdSearchCache.put(cacheKey, new CacheEntry(result));
                return cloneMap(result);
            }

            JSONObject dataObj = root.getJSONObject("data");
            JSONObject pageObj = dataObj == null ? null : dataObj.getJSONObject("page");
            Integer total = pageObj == null ? 0 : safeInt(pageObj.get("total"), 0);
            JSONArray list = pageObj == null ? null : pageObj.getJSONArray("list");
            List<Map<String, Object>> items = normalizeOpenGdSearchItems(list);

            double averageItemScore = 0.0;
            if (!items.isEmpty()) {
                double scoreSum = 0.0;
                for (Map<String, Object> item : items) {
                    Number s = (Number) item.get("qualityScore");
                    scoreSum += s == null ? 0.0 : s.doubleValue();
                }
                averageItemScore = scoreSum / items.size();
            }

            double qualityScore = roundToOneDecimal(Math.min(100.0, 40.0
                    + (total != null && total > 0 ? 15.0 : 0.0)
                    + (items.isEmpty() ? 0.0 : 15.0)
                    + averageItemScore * 0.3));

            result.put("success", true);
            result.put("message", root.getString("msg"));
            result.put("total", total == null ? 0 : total);
            result.put("items", items);
            result.put("qualityScore", qualityScore);
            result.put("fetchedAt", nowIso());

            openGdSearchCache.put(cacheKey, new CacheEntry(result));
            return cloneMap(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "开放广东查询异常: " + e.getMessage());
            result.put("total", 0);
            result.put("items", Collections.emptyList());
            result.put("qualityScore", 30.0);
            result.put("fetchedAt", nowIso());
            openGdSearchCache.put(cacheKey, new CacheEntry(result));
            return cloneMap(result);
        }
    }

    @Override
    public Map<String, Object> getOpenGdResourceDetail(String resId, boolean includePreview, boolean forceRefresh) {
        if (StrUtil.isBlank(resId)) {
            Map<String, Object> invalid = new LinkedHashMap<>();
            invalid.put("success", false);
            invalid.put("message", "resId不能为空");
            invalid.put("resource", Collections.emptyMap());
            invalid.put("fields", Collections.emptyList());
            invalid.put("preview", Collections.emptyMap());
            return invalid;
        }

        String cacheKey = resId.trim() + "|" + includePreview;
        CacheEntry cached = openGdDetailCache.get(cacheKey);
        if (isCacheValid(cached, forceRefresh)) {
            return cloneMap(cached.payload);
        }

        String base = normalizeOpenGdBaseUrl();
        String metaEndpoint = base + "/data/openCatalog/selectDataCatalogByResId";
        String fieldEndpoint = base + "/data/openCatalog/getPreviewDataItem";
        String previewEndpoint = base + "/data/openCatalog/getPreviewData";

        JSONObject req = new JSONObject();
        req.put("resId", resId.trim());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("source", SOURCE_OPEN_GD);
        result.put("resourceId", resId.trim());
        result.put("metaEndpoint", metaEndpoint);
        result.put("fieldEndpoint", fieldEndpoint);
        result.put("previewEndpoint", previewEndpoint);

        try {
            JSONObject metaRoot = postJson(metaEndpoint, req, openGdTimeoutMs);
            if (metaRoot == null || !"1000".equals(metaRoot.getString("status"))) {
                result.put("success", false);
                result.put("message", metaRoot == null ? "开放广东无响应" : metaRoot.getString("msg"));
                result.put("resource", Collections.emptyMap());
                result.put("fields", Collections.emptyList());
                result.put("preview", Collections.emptyMap());
                result.put("qualityScore", 30.0);
                result.put("fetchedAt", nowIso());
                openGdDetailCache.put(cacheKey, new CacheEntry(result));
                return cloneMap(result);
            }

            JSONObject resource = metaRoot.getJSONObject("data");
            JSONObject fieldRoot = postJson(fieldEndpoint, req, openGdTimeoutMs);
            JSONArray fieldList = fieldRoot == null ? null : fieldRoot.getJSONArray("data");
            List<Map<String, Object>> normalizedFields = normalizeFieldList(fieldList);

            Map<String, Object> preview = new LinkedHashMap<>();
            preview.put("status", "skipped");
            preview.put("message", "未请求预览");
            preview.put("rows", Collections.emptyList());

            if (includePreview) {
                JSONObject previewReq = new JSONObject();
                previewReq.put("resId", resId.trim());
                previewReq.put("pageNo", 1);
                previewReq.put("pageSize", 10);
                JSONObject previewRoot = postJson(previewEndpoint, previewReq, openGdTimeoutMs);
                String previewStatus = previewRoot == null ? null : previewRoot.getString("status");
                Object previewData = previewRoot == null ? null : previewRoot.get("data");
                preview.put("status", defaultIfBlank(previewStatus, "0000"));
                preview.put("message", previewRoot == null ? "预览请求无响应" : previewRoot.getString("msg"));
                if (previewData instanceof JSONArray) {
                    preview.put("rows", previewData);
                } else {
                    preview.put("rows", Collections.emptyList());
                }
            }

            double qualityScore = roundToOneDecimal(calculateOpenGdDetailQuality(resource, normalizedFields, preview));

            result.put("success", true);
            result.put("message", "ok");
            result.put("resource", normalizeOpenGdResource(resource));
            result.put("fields", normalizedFields);
            result.put("preview", preview);
            result.put("qualityScore", qualityScore);
            result.put("fetchedAt", nowIso());
            openGdDetailCache.put(cacheKey, new CacheEntry(result));
            return cloneMap(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "开放广东资源详情异常: " + e.getMessage());
            result.put("resource", Collections.emptyMap());
            result.put("fields", Collections.emptyList());
            result.put("preview", Collections.emptyMap());
            result.put("qualityScore", 30.0);
            result.put("fetchedAt", nowIso());
            openGdDetailCache.put(cacheKey, new CacheEntry(result));
            return cloneMap(result);
        }
    }

    @Override
    public Map<String, Object> getIntegratedAccessibilitySummary(String areaName, String keyword,
                                                                 Integer pageNo, Integer pageSize,
                                                                 boolean forceRefresh) {
        Map<String, Object> overpass = getOverpassSummary(areaName, forceRefresh);
        Map<String, Object> openGd = searchOpenGdCatalog(keyword, pageNo, pageSize, forceRefresh);

        Number overpassScore = (Number) overpass.get("qualityScore");
        Number openGdScore = (Number) openGd.get("qualityScore");
        double overpassQuality = overpassScore == null ? 0.0 : overpassScore.doubleValue();
        double openGdQuality = openGdScore == null ? 0.0 : openGdScore.doubleValue();
        double overallScore = roundToOneDecimal(overpassQuality * 0.6 + openGdQuality * 0.4);

        List<String> warnings = new ArrayList<>();
        Map<String, Object> overpassMetrics = castMap(overpass.get("metrics"));
        long busStopTotal = safeLong(overpassMetrics.get("bus_stop_total"), 0L);
        long busStopWheelchairAny = safeLong(overpassMetrics.get("bus_stop_wheelchair_any"), 0L);
        if (busStopTotal > 0) {
            double ratio = (busStopWheelchairAny * 1.0) / busStopTotal;
            if (ratio < 0.03) {
                warnings.add("公交站点轮椅标签覆盖率偏低，需优先补采样本数据");
            }
        }

        long openGdTotal = safeLong(openGd.get("total"), 0L);
        if (openGdTotal <= 0) {
            warnings.add("开放广东关键词暂无匹配，可改用“残疾人/地铁/公交”等关键词分场景检索");
        } else if (openGdTotal < 5) {
            warnings.add("开放广东直接命中的无障碍主题资源较少，建议叠加业务词做二次检索");
        }

        if (overpassQuality < 70.0) {
            warnings.add("OSM标签完整度不足，当前结果应作为辅助参考而非唯一决策");
        }

        List<String> nextActions = new ArrayList<>();
        nextActions.add("将 OSM 指标纳入日更任务，重点追踪 bus_stop/platform 的 wheelchair 覆盖率");
        nextActions.add("对开放广东“审核开放”资源建立人工审核清单与补录流程");
        nextActions.add("在前端展示每条结论的数据来源与可信度，避免误导用户");

        Map<String, Object> synthesis = new LinkedHashMap<>();
        synthesis.put("overallScore", overallScore);
        synthesis.put("warnings", warnings);
        synthesis.put("nextActions", nextActions);
        synthesis.put("modelVersion", "accessibility-connector-v1");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("areaName", overpass.get("areaName"));
        result.put("keyword", openGd.get("keyword"));
        result.put("overpass", overpass);
        result.put("openGd", openGd);
        result.put("synthesis", synthesis);
        result.put("connectorMeta", getConnectorMeta());
        result.put("generatedAt", nowIso());
        return result;
    }

    private Map<String, String> buildOverpassMetricQueryMap() {
        Map<String, String> queries = new LinkedHashMap<>();
        queries.put("wheelchair_any", "nwr(area.a)[\"wheelchair\"];");
        queries.put("wheelchair_yes", "nwr(area.a)[\"wheelchair\"=\"yes\"];");
        queries.put("wheelchair_limited", "nwr(area.a)[\"wheelchair\"=\"limited\"];");
        queries.put("wheelchair_no", "nwr(area.a)[\"wheelchair\"=\"no\"];");
        queries.put("tactile_paving_any", "nwr(area.a)[\"tactile_paving\"];");
        queries.put("tactile_paving_yes", "nwr(area.a)[\"tactile_paving\"=\"yes\"];");
        queries.put("highway_elevator", "nwr(area.a)[\"highway\"=\"elevator\"];");
        queries.put("bus_stop_total", "nwr(area.a)[\"highway\"=\"bus_stop\"];");
        queries.put("bus_stop_wheelchair_any", "nwr(area.a)[\"highway\"=\"bus_stop\"][\"wheelchair\"];");
        queries.put("station_total", "nwr(area.a)[\"railway\"=\"station\"];");
        queries.put("station_wheelchair_any", "nwr(area.a)[\"railway\"=\"station\"][\"wheelchair\"];");
        queries.put("platform_total", "nwr(area.a)[\"public_transport\"=\"platform\"];");
        queries.put("platform_wheelchair_any", "nwr(area.a)[\"public_transport\"=\"platform\"][\"wheelchair\"];");
        queries.put("crossing_total", "nwr(area.a)[\"highway\"=\"crossing\"];");
        queries.put("crossing_tactile_paving_yes", "nwr(area.a)[\"highway\"=\"crossing\"][\"tactile_paving\"=\"yes\"];");
        queries.put("crossing_sound_yes", "nwr(area.a)[\"highway\"=\"crossing\"][\"crossing:sound\"=\"yes\"];");
        queries.put("toilets_wheelchair_yes", "nwr(area.a)[\"amenity\"=\"toilets\"][\"wheelchair\"=\"yes\"];");
        return queries;
    }

    private OverpassCountResult queryOverpassCount(String areaName, String filterExpr) {
        OverpassCountResult result = new OverpassCountResult();
        try {
            String cleanAreaName = areaName.replace("\"", "");
            String areaClause = "area[\"name\"=\"" + cleanAreaName + "\"][\"boundary\"=\"administrative\"]->.a;";
            String query = "[out:json][timeout:90];" + areaClause + filterExpr + "out count;";

            Map<String, Object> params = new LinkedHashMap<>();
            params.put("data", query);
            String raw = HttpUtil.get(overpassEndpoint, params, overpassTimeoutMs);
            JSONObject root = JSON.parseObject(raw);
            if (root == null) {
                result.errorMessage = "overpass返回为空";
                return result;
            }

            JSONArray elements = root.getJSONArray("elements");
            if (elements == null || elements.isEmpty()) {
                result.errorMessage = "elements为空";
                return result;
            }
            JSONObject countObj = elements.getJSONObject(0);
            JSONObject tags = countObj == null ? null : countObj.getJSONObject("tags");
            if (tags == null) {
                result.errorMessage = "count tags为空";
                return result;
            }
            String totalText = tags.getString("total");
            result.total = safeLong(totalText, 0L);

            JSONObject osm3s = root.getJSONObject("osm3s");
            result.snapshotTimestamp = osm3s == null ? null : osm3s.getString("timestamp_osm_base");
            return result;
        } catch (Exception e) {
            result.errorMessage = e.getMessage();
            return result;
        }
    }

    private List<Map<String, Object>> normalizeOpenGdSearchItems(JSONArray list) {
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> items = new ArrayList<>();
        for (int i = 0; i < list.size(); i++) {
            JSONObject item = list.getJSONObject(i);
            if (item == null) {
                continue;
            }
            Map<String, Object> normalized = new LinkedHashMap<>();
            normalized.put("source", SOURCE_OPEN_GD);
            normalized.put("sourceId", item.getString("resId"));
            normalized.put("title", item.getString("resTitle"));
            normalized.put("owner", item.getString("officeName"));
            normalized.put("updatedAt", item.getString("dataUpdateTime"));
            normalized.put("abstract", item.getString("resAbstract"));
            normalized.put("recordTotal", item.getString("recordTotal"));
            normalized.put("sourceType", mapOpenGdSourceType(item.getString("sourceType")));
            normalized.put("qualityScore", roundToOneDecimal(calculateOpenGdSearchItemQuality(item)));
            items.add(normalized);
        }
        return items;
    }

    private List<Map<String, Object>> normalizeFieldList(JSONArray fieldList) {
        if (fieldList == null || fieldList.isEmpty()) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> fields = new ArrayList<>();
        for (int i = 0; i < fieldList.size(); i++) {
            JSONObject field = fieldList.getJSONObject(i);
            if (field == null) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("fieldName", defaultIfBlank(field.getString("fieldName"), field.getString("name")));
            item.put("fieldComment", defaultIfBlank(field.getString("fieldComment"), field.getString("title")));
            item.put("fieldType", defaultIfBlank(field.getString("fieldType"), field.getString("type")));
            fields.add(item);
        }
        return fields;
    }

    private Map<String, Object> normalizeOpenGdResource(JSONObject resource) {
        if (resource == null) {
            return Collections.emptyMap();
        }
        Map<String, Object> normalized = new LinkedHashMap<>();
        normalized.put("source", SOURCE_OPEN_GD);
        normalized.put("sourceId", resource.getString("resId"));
        normalized.put("title", resource.getString("resTitle"));
        normalized.put("owner", resource.getString("officeName"));
        normalized.put("updatedAt", resource.getString("dataUpdateTime"));
        normalized.put("openLevelName", resource.getString("openLevelName"));
        normalized.put("openMode", resource.getString("openMode"));
        normalized.put("openCondition", resource.getString("openCondition"));
        normalized.put("sourceType", mapOpenGdSourceType(resource.getString("sourceType")));
        normalized.put("recordTotal", resource.getString("recordTotal"));
        normalized.put("abstract", resource.getString("resAbstract"));
        return normalized;
    }

    private JSONObject postJson(String url, JSONObject payload, int timeoutMs) {
        String body = payload == null ? "{}" : payload.toJSONString();
        String raw = HttpRequest.post(url)
                .timeout(timeoutMs <= 0 ? 20000 : timeoutMs)
                .header("Content-Type", "application/json")
                .body(body)
                .execute()
                .body();
        return JSON.parseObject(raw);
    }

    private String mapOpenGdSourceType(String sourceType) {
        if ("1".equals(sourceType)) {
            return "api";
        }
        if ("2".equals(sourceType)) {
            return "file";
        }
        if ("3".equals(sourceType)) {
            return "database_table";
        }
        return "unknown";
    }

    private double calculateOpenGdSearchItemQuality(JSONObject item) {
        double score = 45.0;
        if (StrUtil.isNotBlank(item.getString("officeName"))) {
            score += 10.0;
        }
        if (StrUtil.isNotBlank(item.getString("resAbstract"))) {
            score += 10.0;
        }
        if (StrUtil.isNotBlank(item.getString("sourceType"))) {
            score += 5.0;
        }
        score += openGdFreshnessScore(item.getString("dataUpdateTime"));
        return Math.min(100.0, score);
    }

    private double calculateOpenGdDetailQuality(JSONObject resource, List<Map<String, Object>> fields, Map<String, Object> preview) {
        double score = 50.0;
        if (resource != null) {
            if (StrUtil.isNotBlank(resource.getString("openMode")) && resource.getString("openMode").contains("无条件")) {
                score += 15.0;
            } else if (StrUtil.isNotBlank(resource.getString("openMode")) && resource.getString("openMode").contains("有条件")) {
                score += 8.0;
            }
            if (StrUtil.isNotBlank(resource.getString("openLevelName")) && resource.getString("openLevelName").contains("普通")) {
                score += 8.0;
            }
            score += openGdFreshnessScore(resource.getString("dataUpdateTime"));
        }
        if (fields != null && !fields.isEmpty()) {
            score += 12.0;
        }
        Object rows = preview == null ? null : preview.get("rows");
        if (rows instanceof List && !((List<?>) rows).isEmpty()) {
            score += 10.0;
        } else if (rows instanceof JSONArray && !((JSONArray) rows).isEmpty()) {
            score += 10.0;
        }
        return Math.min(100.0, score);
    }

    private double overpassFreshnessScore(String timestamp) {
        if (StrUtil.isBlank(timestamp)) {
            return 0.0;
        }
        try {
            Instant snapshot = Instant.parse(timestamp);
            long hours = Duration.between(snapshot, Instant.now()).toHours();
            if (hours <= 24) {
                return 10.0;
            }
            if (hours <= 24 * 7) {
                return 8.0;
            }
            if (hours <= 24 * 30) {
                return 5.0;
            }
            return 2.0;
        } catch (Exception ignored) {
            return 0.0;
        }
    }

    private double openGdFreshnessScore(String dateTimeText) {
        if (StrUtil.isBlank(dateTimeText)) {
            return 0.0;
        }
        try {
            LocalDateTime dt = LocalDateTime.parse(dateTimeText, OPEN_GD_TIME_FORMATTER);
            long days = Duration.between(dt.atZone(ZoneId.systemDefault()).toInstant(), Instant.now()).toDays();
            if (days <= 30) {
                return 18.0;
            }
            if (days <= 90) {
                return 12.0;
            }
            if (days <= 365) {
                return 7.0;
            }
            return 3.0;
        } catch (Exception ignored) {
            return 0.0;
        }
    }

    private double calcCoveragePercent(Long tagged, Long total) {
        if (tagged == null || total == null || total <= 0) {
            return 0.0;
        }
        return roundToOneDecimal((tagged * 100.0) / total);
    }

    private boolean isCacheValid(CacheEntry cache, boolean forceRefresh) {
        if (forceRefresh || cache == null) {
            return false;
        }
        return (System.currentTimeMillis() - cache.createdAtMs) <= Math.max(cacheTtlMs, 1000L);
    }

    private String normalizeAreaName(String areaName) {
        String normalized = defaultIfBlank(StrUtil.trim(areaName), overpassDefaultAreaName);
        if (StrUtil.isBlank(normalized)) {
            return "广州市";
        }
        return normalized;
    }

    private String normalizeOpenGdBaseUrl() {
        String base = defaultIfBlank(openGdBaseUrl, "https://gddata.gd.gov.cn/backOpen/open/data");
        if (base.endsWith("/")) {
            return base.substring(0, base.length() - 1);
        }
        return base;
    }

    private String nowIso() {
        return Instant.now().toString();
    }

    private String defaultIfBlank(String value, String defaultValue) {
        return StrUtil.isBlank(value) ? defaultValue : value;
    }

    private String latestCacheTimestamp(Map<String, CacheEntry> cacheMap) {
        if (cacheMap == null || cacheMap.isEmpty()) {
            return null;
        }
        long max = 0L;
        for (CacheEntry entry : cacheMap.values()) {
            if (entry != null && entry.createdAtMs > max) {
                max = entry.createdAtMs;
            }
        }
        return max <= 0 ? null : Instant.ofEpochMilli(max).toString();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> cloneMap(Map<String, Object> source) {
        if (source == null) {
            return new LinkedHashMap<>();
        }
        Object parsed = JSON.parse(JSON.toJSONString(source));
        if (parsed instanceof Map) {
            return (Map<String, Object>) parsed;
        }
        return new LinkedHashMap<>(source);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castMap(Object value) {
        if (value instanceof Map) {
            return (Map<String, Object>) value;
        }
        return new LinkedHashMap<>();
    }

    private Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception ignored) {
            return null;
        }
    }

    private long safeLong(Object value, long defaultValue) {
        Long parsed = asLong(value);
        return parsed == null ? defaultValue : parsed;
    }

    private int safeInt(Object value, int defaultValue) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception ignored) {
            return defaultValue;
        }
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private static class OverpassCountResult {
        private long total;
        private String snapshotTimestamp;
        private String errorMessage;
    }

    private static class CacheEntry {
        private final long createdAtMs;
        private final Map<String, Object> payload;

        private CacheEntry(Map<String, Object> payload) {
            this.createdAtMs = System.currentTimeMillis();
            this.payload = payload == null ? new LinkedHashMap<String, Object>() : payload;
        }
    }
}
