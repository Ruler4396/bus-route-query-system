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
            @RequestParam(defaultValue = "AUTO") String preferenceType) {

        if (startStation == null || startStation.trim().isEmpty() ||
            endStation == null || endStation.trim().isEmpty()) {
            return R.error("起点和终点站不能为空");
        }

        List<RoutePlanningService.RouteResult> results =
                routePlanningService.planAccessibleRoute(startStation, endStation, userId, preferenceType);

        Map<String, Object> data = new HashMap<>();
        data.put("list", results);
        data.put("count", results.size());
        data.put("preferenceType", preferenceType);
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
            @RequestParam(defaultValue = "3") Integer topN) {

        if (startStation == null || startStation.trim().isEmpty()
                || endStation == null || endStation.trim().isEmpty()) {
            return R.error("起点和终点站不能为空");
        }

        int limit = topN == null ? 3 : Math.max(1, Math.min(topN, 10));
        List<RoutePlanningService.RouteResult> results =
                routePlanningService.planAccessibleRoute(startStation, endStation, userId, preferenceType);

        List<Map<String, Object>> topRoutes = new ArrayList<>();
        List<String> actionHints = new ArrayList<>();
        List<String> riskHints = new ArrayList<>();

        int count = Math.min(limit, results.size());
        for (int i = 0; i < count; i++) {
            RoutePlanningService.RouteResult item = results.get(i);
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
            topRoutes.add(routeCard);

            if (route.getYuyintongbao() == null || route.getYuyintongbao() != 1) {
                riskHints.add("路线「" + route.getLuxianmingcheng() + "」语音播报支持较弱");
            }
            if (route.getMangdaozhichi() == null || route.getMangdaozhichi() != 1) {
                riskHints.add("路线「" + route.getLuxianmingcheng() + "」盲道支持信息不足");
            }
        }

        if (topRoutes.isEmpty()) {
            actionHints.add("未匹配到路线，请更换起终点关键词或放宽偏好");
        } else {
            actionHints.add("优先查看第1条推荐路线，并进入地图核对站点细节");
            actionHints.add("如需更快到达，可切换“时间优先”再比较结果");
            actionHints.add("如需无障碍稳妥方案，可切换“无障碍优先”再比较结果");
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
        data.put("preferenceType", preferenceType);
        data.put("count", results.size());
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
            @RequestParam(required = false) Long userId) {

        GongjiaoluxianEntity route = gongjiaoluxianService.selectById(routeId);
        if (route == null) {
            return R.error("路线不存在");
        }

        com.entity.YonghuEntity userProfile = null;
        if (userId != null) {
            userProfile = new com.entity.YonghuEntity();
            userProfile.setId(userId);
        }

        double score = routePlanningService.calculateAccessibilityScore(route, userProfile);

        Map<String, Object> data = new HashMap<>();
        data.put("routeId", routeId);
        data.put("accessibilityScore", score);
        data.put("level", routePlanningService.getAccessibilityLevelText(route.getWuzhangaijibie()));

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
