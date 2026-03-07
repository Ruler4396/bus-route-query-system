package com.controller;

import com.annotation.IgnoreAuth;
import com.entity.GongjiaoluxianEntity;
import com.service.AccessibilityExternalDataService;
import com.service.GongjiaoluxianService;
import com.service.RoutePlanningService;
import com.service.ZhandianWuzhangaiService;
import com.utils.R;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 无障碍路线规划控制器
 */
@RestController
@RequestMapping("/route")
public class RoutePlanningController {

    @Autowired
    private RoutePlanningService routePlanningService;

    @Autowired
    private GongjiaoluxianService gongjiaoluxianService;

    @Autowired
    private ZhandianWuzhangaiService zhandianWuzhangaiService;

    @Autowired
    private AccessibilityExternalDataService accessibilityExternalDataService;

    /**
     * 路线规划接口
     * @param startStation 起点站名
     * @param endStation 终点站名
     * @param userId 用户ID（可选）
     * @param preferenceType 偏好类型：AUTO/DISTANCE/TIME/ACCESSIBLE
     * @return 排序后的路线列表
     */
    @IgnoreAuth
    @RequestMapping("/plan")
    public R planRoute(
            @RequestParam String startStation,
            @RequestParam String endStation,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "AUTO") String preferenceType,
            @RequestParam(defaultValue = "AUTO") String profileType) {

        if (startStation == null || startStation.trim().isEmpty() ||
            endStation == null || endStation.trim().isEmpty()) {
            return R.error("起点和终点站不能为空");
        }

        List<RoutePlanningService.RouteResult> results =
                routePlanningService.planAccessibleRoute(startStation, endStation, userId, preferenceType, profileType);

        List<RoutePlanningService.RouteResult> recommended = new ArrayList<>();
        List<Map<String, Object>> rejectedRoutes = new ArrayList<>();
        List<String> riskHints = new ArrayList<>();
        String resolvedProfileLabel = routePlanningService.getProfileTypeLabel(profileType);
        String resolvedPreferenceType = preferenceType;
        String resolvedPreferenceLabel = routePlanningService.getPreferenceLabel(preferenceType);

        for (RoutePlanningService.RouteResult item : results) {
            if (item == null) {
                continue;
            }
            if (item.getResolvedProfileLabel() != null) {
                resolvedProfileLabel = item.getResolvedProfileLabel();
            }
            if (item.getResolvedPreferenceType() != null) {
                resolvedPreferenceType = item.getResolvedPreferenceType();
                resolvedPreferenceLabel = item.getResolvedPreferenceLabel();
            }
            if (item.isRecommendable()) {
                recommended.add(item);
            } else {
                Map<String, Object> rejected = new HashMap<>();
                rejected.put("routeId", item.getRoute() != null ? item.getRoute().getId() : null);
                rejected.put("routeName", item.getRoute() != null ? item.getRoute().getLuxianmingcheng() : "未知路线");
                rejected.put("decisionMessage", item.getDecisionMessage());
                rejected.put("missingDataHints", item.getMissingDataHints());
                rejectedRoutes.add(rejected);
            }
            if (item.getRiskHints() != null) {
                for (String risk : item.getRiskHints()) {
                    if (risk != null && !risk.trim().isEmpty() && !riskHints.contains(risk)) {
                        riskHints.add(risk);
                    }
                }
            }
        }

        String decisionState = recommended.isEmpty() ? (rejectedRoutes.isEmpty() ? "EMPTY" : "REJECT") : (rejectedRoutes.isEmpty() ? "OK" : "CAUTION");
        List<String> actionHints = new ArrayList<>();
        if ("REJECT".equals(decisionState)) {
            actionHints.add("关键无障碍数据不足，当前不直接推荐任何路线，请改用试点线路关键词或查看地图页核对站点信息。");
        } else if (recommended.isEmpty()) {
            actionHints.add("未匹配到路线，请更换起终点关键词或放宽偏好。");
        } else {
            actionHints.add("优先查看第1条推荐路线，并进入地图页核对站点与 ETA。");
            if (!rejectedRoutes.isEmpty()) {
                actionHints.add("已有部分路线因关键无障碍数据不足被过滤，建议只比较当前可推荐结果。");
            }
        }

        Map<String, Object> data = new HashMap<>();
        data.put("list", recommended);
        data.put("count", recommended.size());
        data.put("evaluatedCount", results.size());
        data.put("rejectedCount", rejectedRoutes.size());
        data.put("decisionState", decisionState);
        data.put("requestedProfileType", profileType);
        data.put("resolvedProfileLabel", resolvedProfileLabel);
        data.put("preferenceType", resolvedPreferenceType);
        data.put("preferenceLabel", resolvedPreferenceLabel);
        data.put("riskHints", riskHints);
        data.put("actionHints", actionHints);
        data.put("rejectedRoutes", rejectedRoutes);
        data.put("ruleEngine", routePlanningService.getRuleEngineMeta());

        return R.ok("路线规划成功").put("data", data);
    }

    /**
     * 无障碍规划聚合摘要接口
     * 返回适合前端“摘要卡片 + 语音/字幕播报”的聚合数据。
     */
    @IgnoreAuth
    @RequestMapping("/plan/summary")
    public R planRouteSummary(
            @RequestParam String startStation,
            @RequestParam String endStation,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "AUTO") String preferenceType,
            @RequestParam(defaultValue = "AUTO") String profileType,
            @RequestParam(defaultValue = "3") Integer topN) {

        if (startStation == null || startStation.trim().isEmpty()
                || endStation == null || endStation.trim().isEmpty()) {
            return R.error("起点和终点站不能为空");
        }

        int limit = topN == null ? 3 : Math.max(1, Math.min(topN, 10));
        List<RoutePlanningService.RouteResult> results =
                routePlanningService.planAccessibleRoute(startStation, endStation, userId, preferenceType, profileType);

        List<Map<String, Object>> topRoutes = new ArrayList<>();
        List<String> actionHints = new ArrayList<>();
        List<String> riskHints = new ArrayList<>();
        List<RoutePlanningService.RouteResult> recommended = new ArrayList<>();
        List<Map<String, Object>> rejectedRoutes = new ArrayList<>();
        String resolvedProfileLabel = routePlanningService.getProfileTypeLabel(profileType);
        String resolvedPreferenceType = preferenceType;
        String resolvedPreferenceLabel = routePlanningService.getPreferenceLabel(preferenceType);

        for (RoutePlanningService.RouteResult item : results) {
            if (item == null) {
                continue;
            }
            if (item.getResolvedProfileLabel() != null) {
                resolvedProfileLabel = item.getResolvedProfileLabel();
            }
            if (item.getResolvedPreferenceType() != null) {
                resolvedPreferenceType = item.getResolvedPreferenceType();
                resolvedPreferenceLabel = item.getResolvedPreferenceLabel();
            }
            if (item.isRecommendable()) {
                recommended.add(item);
            } else {
                Map<String, Object> rejected = new HashMap<>();
                rejected.put("routeId", item.getRoute() != null ? item.getRoute().getId() : null);
                rejected.put("routeName", item.getRoute() != null ? item.getRoute().getLuxianmingcheng() : "未知路线");
                rejected.put("decisionMessage", item.getDecisionMessage());
                rejected.put("missingDataHints", item.getMissingDataHints());
                rejectedRoutes.add(rejected);
            }
            if (item.getRiskHints() != null) {
                for (String risk : item.getRiskHints()) {
                    if (risk != null && !risk.trim().isEmpty() && !riskHints.contains(risk)) {
                        riskHints.add(risk);
                    }
                }
            }
        }

        int count = Math.min(limit, recommended.size());
        for (int i = 0; i < count; i++) {
            RoutePlanningService.RouteResult item = recommended.get(i);
            GongjiaoluxianEntity route = item.getRoute();
            if (route == null) {
                continue;
            }
            Map<String, Object> routeCard = new HashMap<>();
            routeCard.put("rank", i + 1);
            routeCard.put("routeId", route.getId());
            routeCard.put("routeName", route.getLuxianmingcheng());
            routeCard.put("routeNo", route.getLuxianbianhao());
            routeCard.put("start", route.getQidianzhanming());
            routeCard.put("end", route.getZhongdianzhanming());
            routeCard.put("accessibilityScore", item.getAccessibilityScore());
            routeCard.put("totalScore", item.getTotalScore());
            routeCard.put("reason", item.getRecommendationReason());
            routeCard.put("accessibilityLevelText", item.getAccessibilityLevelText());
            routeCard.put("voiceAnnounceText", item.getVoiceAnnounceText());
            routeCard.put("blindPathSupportText", item.getBlindPathSupportText());
            routeCard.put("guideDogSupportText", item.getGuideDogSupportText());
            routeCard.put("confidenceScore", item.getConfidenceScore());
            routeCard.put("confidenceLevelText", item.getConfidenceLevelText());
            routeCard.put("dataSourceText", item.getDataSourceText());
            routeCard.put("dataUpdatedAtText", item.getDataUpdatedAtText());
            routeCard.put("decisionStateText", item.getDecisionStateText());
            routeCard.put("decisionMessage", item.getDecisionMessage());
            routeCard.put("riskHints", item.getRiskHints());
            routeCard.put("boardingStationName", item.getBoardingStationName());
            routeCard.put("alightingStationName", item.getAlightingStationName());
            routeCard.put("travelStationCount", item.getTravelStationCount());
            routeCard.put("transferRequired", item.isTransferRequired());
            routeCard.put("segments", item.getSegments());
            topRoutes.add(routeCard);
        }

        if (topRoutes.isEmpty()) {
            actionHints.add("关键无障碍数据不足，当前不直接推荐路线，请改用试点线路关键词或查看地图页核对。");
        } else {
            actionHints.add("优先查看第1条推荐路线，并进入地图核对站点细节。");
            actionHints.add("可切换不同画像对比路线排序差异。");
        }

        Map<String, Object> stationSummary = new HashMap<>();
        stationSummary.put("startStation", zhandianWuzhangaiService.getByStationName(startStation));
        stationSummary.put("endStation", zhandianWuzhangaiService.getByStationName(endStation));

        String spokenSummary;
        if (topRoutes.isEmpty()) {
            spokenSummary = "未找到从" + startStation + "到" + endStation + "的可用推荐路线。";
        } else {
            Map<String, Object> best = topRoutes.get(0);
            spokenSummary = "已为您推荐" + topRoutes.size() + "条路线，首选是"
                    + String.valueOf(best.get("routeName"))
                    + "，无障碍评分"
                    + String.valueOf(best.get("accessibilityScore")) + "分。";
        }

        Map<String, Object> data = new HashMap<>();
        data.put("startStation", startStation);
        data.put("endStation", endStation);
        data.put("preferenceType", resolvedPreferenceType);
        data.put("preferenceLabel", resolvedPreferenceLabel);
        data.put("resolvedProfileLabel", resolvedProfileLabel);
        data.put("rejectedRoutes", rejectedRoutes);
        data.put("count", recommended.size());
        data.put("rejectedCount", rejectedRoutes.size());
        data.put("topRoutes", topRoutes);
        data.put("actionHints", actionHints);
        data.put("riskHints", riskHints);
        data.put("spokenSummary", spokenSummary);
        data.put("stationSummary", stationSummary);
        data.put("ruleEngine", routePlanningService.getRuleEngineMeta());

        return R.ok("路线摘要生成成功").put("data", data);
    }

    /**
     * 获取路线无障碍级别
     * @param routeId 路线ID
     * @return 无障碍级别信息
     */
    @IgnoreAuth
    @RequestMapping("/accessible-level/{routeId}")
    public R getAccessibleLevel(@PathVariable("routeId") Long routeId) {
        GongjiaoluxianEntity route = gongjiaoluxianService.selectById(routeId);
        if (route == null) {
            return R.error("路线不存在");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("routeId", routeId);
        data.put("routeName", route.getLuxianmingcheng());
        data.put("accessibilityLevel", route.getWuzhangaijibie());
        data.put("accessibilityLevelText",
                routePlanningService.getAccessibilityLevelText(route.getWuzhangaijibie()));
        data.put("facilities", route.getWuzhangaisheshi());
        data.put("voiceAnnounce", route.getYuyintongbao());
        data.put("blindPath", route.getMangdaozhichi());
        data.put("guideDogSupport", route.getDitezhichi());

        return R.ok().put("data", data);
    }

    /**
     * 批量获取站点无障碍信息
     * @param stationNames 站点名称列表，逗号分隔
     * @return 站点无障碍信息列表
     */
    @IgnoreAuth
    @RequestMapping("/stations-accessibility")
    public R getStationsAccessibility(@RequestParam String stationNames) {
        if (stationNames == null || stationNames.trim().isEmpty()) {
            return R.error("站点名称不能为空");
        }

        String[] names = stationNames.split(",");
        Map<String, Object> result = new HashMap<>();

        for (String name : names) {
            name = name.trim();
            if (!name.isEmpty()) {
                result.put(name, zhandianWuzhangaiService.getByStationName(name));
            }
        }

        return R.ok().put("data", result);
    }

    /**
     * 获取所有路线列表（带无障碍信息）
     * @return 路线列表
     */
    @IgnoreAuth
    @RequestMapping("/all-routes")
    public R getAllRoutes() {
        List<GongjiaoluxianEntity> routes = gongjiaoluxianService.selectList(null);

        // 为每条路线添加无障碍级别文本
        for (GongjiaoluxianEntity route : routes) {
            // 可以在这里添加额外处理
        }

        return R.ok().put("data", routes);
    }

    /**
     * 计算路线的无障碍评分
     * @param routeId 路线ID
     * @param userId 用户ID（可选）
     * @return 评分信息
     */
    @IgnoreAuth
    @RequestMapping("/score/{routeId}")
    public R calculateScore(
            @PathVariable("routeId") Long routeId,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "AUTO") String profileType) {

        GongjiaoluxianEntity route = gongjiaoluxianService.selectById(routeId);
        if (route == null) {
            return R.error("路线不存在");
        }

        List<RoutePlanningService.RouteResult> oneRoute = routePlanningService.planAccessibleRoute(route.getQidianzhanming(), route.getZhongdianzhanming(), userId, "ACCESSIBLE", profileType);
        RoutePlanningService.RouteResult matched = null;
        for (RoutePlanningService.RouteResult item : oneRoute) {
            if (item.getRoute() != null && routeId.equals(item.getRoute().getId())) {
                matched = item;
                break;
            }
        }
        double score = matched != null ? matched.getAccessibilityScore() : routePlanningService.calculateAccessibilityScore(route, null);

        Map<String, Object> data = new HashMap<>();
        data.put("routeId", routeId);
        data.put("accessibilityScore", score);
        data.put("level", routePlanningService.getAccessibilityLevelText(route.getWuzhangaijibie()));
        if (matched != null) {
            data.put("confidenceScore", matched.getConfidenceScore());
            data.put("confidenceLevelText", matched.getConfidenceLevelText());
            data.put("decisionStateText", matched.getDecisionStateText());
        }

        return R.ok().put("data", data);
    }

    /**
     * 获取外部连接器配置元数据。
     */
    @IgnoreAuth
    @RequestMapping("/external/connectors")
    public R getExternalConnectorMeta() {
        return R.ok().put("data", accessibilityExternalDataService.getConnectorMeta());
    }

    @IgnoreAuth
    @RequestMapping("/external/governance")
    public R getGovernanceMeta() {
        return R.ok().put("data", accessibilityExternalDataService.getGovernanceMeta());
    }

    /**
     * 获取 OSM/Overpass 无障碍统计摘要。
     */
    @IgnoreAuth
    @RequestMapping("/external/overpass/summary")
    public R getOverpassSummary(
            @RequestParam(defaultValue = "广州市") String areaName,
            @RequestParam(defaultValue = "false") Boolean forceRefresh) {
        boolean refresh = forceRefresh != null && forceRefresh;
        Map<String, Object> data = accessibilityExternalDataService.getOverpassSummary(areaName, refresh);
        return R.ok().put("data", data);
    }

    /**
     * 在“开放广东”检索无障碍相关数据目录。
     */
    @IgnoreAuth
    @RequestMapping("/external/opengd/search")
    public R searchOpenGd(
            @RequestParam(defaultValue = "无障碍") String keyword,
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "false") Boolean forceRefresh) {
        boolean refresh = forceRefresh != null && forceRefresh;
        Map<String, Object> data = accessibilityExternalDataService.searchOpenGdCatalog(
                keyword, pageNo, pageSize, refresh);
        return R.ok().put("data", data);
    }

    /**
     * 获取“开放广东”单个资源详情（可选预览数据）。
     */
    @IgnoreAuth
    @RequestMapping("/external/opengd/detail")
    public R openGdDetail(
            @RequestParam String resId,
            @RequestParam(defaultValue = "true") Boolean includePreview,
            @RequestParam(defaultValue = "false") Boolean forceRefresh) {
        boolean preview = includePreview == null || includePreview;
        boolean refresh = forceRefresh != null && forceRefresh;
        Map<String, Object> data = accessibilityExternalDataService.getOpenGdResourceDetail(
                resId, preview, refresh);
        return R.ok().put("data", data);
    }

    /**
     * 外部无障碍数据聚合摘要（OSM + 开放广东）。
     */
    @IgnoreAuth
    @RequestMapping("/external/aggregate")
    public R getExternalAggregate(
            @RequestParam(defaultValue = "广州市") String areaName,
            @RequestParam(defaultValue = "无障碍") String keyword,
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "false") Boolean forceRefresh) {
        boolean refresh = forceRefresh != null && forceRefresh;
        Map<String, Object> data = accessibilityExternalDataService.getIntegratedAccessibilitySummary(
                areaName, keyword, pageNo, pageSize, refresh);
        return R.ok().put("data", data);
    }
}
