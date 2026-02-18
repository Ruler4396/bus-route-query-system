package com.controller;

import com.annotation.IgnoreAuth;
import com.entity.GongjiaoluxianEntity;
import com.service.GongjiaoluxianService;
import com.service.RoutePlanningService;
import com.service.ZhandianWuzhangaiService;
import com.utils.R;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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

        return R.ok("路线规划成功").put("data", data);
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
}
