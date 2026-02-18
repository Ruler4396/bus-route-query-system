package com.controller;

import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Date;
import java.util.Calendar;
import java.text.SimpleDateFormat;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.entity.GongjiaoluxianEntity;
import com.service.AmapWebService;
import com.service.GongjiaoluxianService;
import com.utils.R;

/**
 * 地图接口
 */
@RestController
@RequestMapping("/map")
@CrossOrigin
public class MapController {
    private static final double ETA_BASE_SPEED_KMH = 24.0;
    private static final double ETA_FALLBACK_DISTANCE_PER_STATION_KM = 0.8;

    @Autowired
    private GongjiaoluxianService gongjiaoluxianService;
    @Autowired
    private AmapWebService amapWebService;

    /**
     * 获取路线地图数据
     */
    @GetMapping("/route/{id}")
    public R getRouteMapData(@PathVariable("id") Long id) {
        GongjiaoluxianEntity route = gongjiaoluxianService.selectById(id);
        if (route == null) {
            return R.error("路线不存在");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("id", route.getId());
        data.put("luxianbianhao", route.getLuxianbianhao());
        data.put("luxianmingcheng", route.getLuxianmingcheng());
        data.put("qidianzhanming", route.getQidianzhanming());
        data.put("qidianzuobiao", route.getQidianzuobiao());
        data.put("zhongdianzhanming", route.getZhongdianzhanming());
        data.put("zhongdianzuobiao", route.getZhongdianzuobiao());
        data.put("zhandianzuobiao", route.getZhandianzuobiao());
        data.put("luxianguiji", route.getLuxianguiji());
        data.put("tujingzhandian", route.getTujingzhandian());

        return R.ok().put("data", data);
    }

    /**
     * 获取所有路线列表（含坐标）
     */
    @GetMapping("/routes")
    public R getAllRoutes() {
        EntityWrapper<GongjiaoluxianEntity> wrapper = new EntityWrapper<>();
        wrapper.isNotNull("qidianzuobiao");  // 只返回有坐标的路线
        return R.ok().put("data", gongjiaoluxianService.selectList(wrapper));
    }

    /**
     * 解析站点坐标JSON
     * 返回格式：[{name: "站点名", lng: 经度, lat: 纬度}]
     */
    @GetMapping("/stations/{id}")
    public R getRouteStations(@PathVariable("id") Long id) {
        GongjiaoluxianEntity route = gongjiaoluxianService.selectById(id);
        if (route == null) {
            return R.error("路线不存在");
        }

        // 如果有站点坐标JSON数据，直接返回
        if (route.getZhandianzuobiao() != null && !route.getZhandianzuobiao().isEmpty()) {
            return R.ok().put("data", route.getZhandianzuobiao());
        }

        // 否则根据途径站点生成模拟坐标
        String tujingzhandian = route.getTujingzhandian();
        String[] stations = tujingzhandian != null ? tujingzhandian.split("[,，]") : new String[0];

        // 模拟坐标数据（基于上海坐标）
        double baseLng = 121.4737;
        double baseLat = 31.2304;
        double lngStep = 0.005;
        double latStep = 0.003;

        StringBuilder jsonBuilder = new StringBuilder("[");
        for (int i = 0; i < stations.length; i++) {
            if (i > 0) jsonBuilder.append(",");
            jsonBuilder.append("{");
            jsonBuilder.append("\"name\":\"").append(stations[i].trim()).append("\",");
            jsonBuilder.append("\"lng\":").append(baseLng + i * lngStep).append(",");
            jsonBuilder.append("\"lat\":").append(baseLat + i * latStep);
            jsonBuilder.append("}");
        }
        jsonBuilder.append("]");

        return R.ok().put("data", jsonBuilder.toString());
    }

    /**
     * 获取到站时间估算（ETA）
     * @param id 路线ID
     * @param currentStationIndex 当前站点索引（从0开始）
     * @return ETA信息
     */
    @GetMapping("/eta/{id}")
    public R getRouteEta(@PathVariable("id") Long id,
                         @RequestParam(defaultValue = "0") Integer currentStationIndex) {
        GongjiaoluxianEntity route = gongjiaoluxianService.selectById(id);
        if (route == null) {
            return R.error("路线不存在");
        }

        int stationCount = getStationCount(route);
        if (stationCount < 2) {
            return R.error("站点数据不足，无法计算ETA");
        }

        int idx = currentStationIndex == null ? 0 : currentStationIndex;
        if (idx < 0) idx = 0;
        if (idx >= stationCount) idx = stationCount - 1;

        int remainingStations = Math.max(stationCount - 1 - idx, 0);
        List<StationPoint> stationPoints = parseStationPoints(route);
        double remainingDistanceKm = calculateRemainingDistanceKm(stationPoints, idx);
        String modelType = "coordinate+traffic+dwell";
        if (remainingDistanceKm <= 0) {
            // 当站点坐标缺失或解析失败时回退到站数估算，避免接口不可用。
            remainingDistanceKm = remainingStations * ETA_FALLBACK_DISTANCE_PER_STATION_KM;
            modelType = "station-count+traffic+dwell";
        }

        TrafficProfile trafficProfile = buildTrafficProfile();
        double avgSpeedKmh = Math.max(ETA_BASE_SPEED_KMH * trafficProfile.speedFactor, 8.0);
        double driveMinutes = avgSpeedKmh <= 0 ? 0 : (remainingDistanceKm / avgSpeedKmh * 60.0);
        double dwellMinutes = remainingStations * trafficProfile.dwellMinutesPerStation;
        int etaMinutes = (int) Math.ceil(driveMinutes + dwellMinutes);
        if (etaMinutes < 0) etaMinutes = 0;

        long etaMillis = System.currentTimeMillis() + etaMinutes * 60L * 1000L;
        String expectedArrivalTime = new SimpleDateFormat("HH:mm").format(new Date(etaMillis));

        Map<String, Object> data = new HashMap<>();
        data.put("routeId", id);
        data.put("currentStationIndex", idx);
        data.put("totalStations", stationCount);
        data.put("remainingStations", remainingStations);
        data.put("remainingDistanceKm", roundTo(remainingDistanceKm, 2));
        data.put("trafficLevel", trafficProfile.level);
        data.put("trafficFactor", roundTo(trafficProfile.speedFactor, 2));
        data.put("avgSpeedKmh", roundTo(avgSpeedKmh, 1));
        data.put("driveMinutes", roundTo(driveMinutes, 1));
        data.put("dwellMinutes", roundTo(dwellMinutes, 1));
        data.put("modelType", modelType);
        data.put("etaMinutes", etaMinutes);
        data.put("expectedArrivalTime", expectedArrivalTime);
        data.put("calculatedAt", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));

        return R.ok().put("data", data);
    }

    /**
     * 调用高德Web服务进行驾车路径规划
     * origin/destination 格式：lng,lat
     */
    @GetMapping("/amap/driving")
    public R getAmapDriving(@RequestParam String origin,
                            @RequestParam String destination,
                            @RequestParam(required = false) String waypoints,
                            @RequestParam(defaultValue = "0") String strategy) {
        AmapWebService.ApiResult result = amapWebService.getDrivingRoute(origin, destination, waypoints, strategy);
        if (!result.isSuccess()) {
            return R.error(result.getMessage());
        }
        return R.ok().put("data", result.getData());
    }

    /**
     * 调用高德Web服务进行地理编码
     */
    @GetMapping("/amap/geocode")
    public R geocode(@RequestParam String address,
                     @RequestParam(required = false) String city) {
        AmapWebService.ApiResult result = amapWebService.geocode(address, city);
        if (!result.isSuccess()) {
            return R.error(result.getMessage());
        }
        return R.ok().put("data", result.getData());
    }

    /**
     * 调用高德Web服务进行逆地理编码
     */
    @GetMapping("/amap/regeo")
    public R reverseGeocode(@RequestParam String location,
                            @RequestParam(defaultValue = "300") Integer radius) {
        AmapWebService.ApiResult result = amapWebService.reverseGeocode(location, radius);
        if (!result.isSuccess()) {
            return R.error(result.getMessage());
        }
        return R.ok().put("data", result.getData());
    }

    private int getStationCount(GongjiaoluxianEntity route) {
        String stationJson = route.getZhandianzuobiao();
        if (stationJson != null && !stationJson.trim().isEmpty()) {
            try {
                JSONArray arr = JSON.parseArray(stationJson);
                if (arr != null && arr.size() > 0) {
                    return arr.size();
                }
            } catch (Exception ignored) {
                // fallback
            }
        }

        String tujingzhandian = route.getTujingzhandian();
        if (tujingzhandian == null || tujingzhandian.trim().isEmpty()) {
            return 0;
        }
        String[] stations = tujingzhandian.split("[,，]");
        int count = 0;
        for (String station : stations) {
            if (station != null && !station.trim().isEmpty()) {
                count++;
            }
        }
        return count;
    }

    private List<StationPoint> parseStationPoints(GongjiaoluxianEntity route) {
        List<StationPoint> points = new ArrayList<>();
        String stationJson = route.getZhandianzuobiao();
        if (stationJson == null || stationJson.trim().isEmpty()) {
            return points;
        }
        try {
            JSONArray arr = JSON.parseArray(stationJson);
            if (arr == null) {
                return points;
            }
            for (int i = 0; i < arr.size(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                if (obj == null) {
                    continue;
                }
                Double lng = obj.getDouble("lng");
                Double lat = obj.getDouble("lat");
                if (lng == null || lat == null) {
                    continue;
                }
                points.add(new StationPoint(lng, lat));
            }
        } catch (Exception ignored) {
            // 返回空集合交给上层回退处理。
        }
        return points;
    }

    private double calculateRemainingDistanceKm(List<StationPoint> points, int startIndex) {
        if (points == null || points.size() < 2) {
            return 0;
        }
        if (startIndex < 0) {
            startIndex = 0;
        }
        if (startIndex >= points.size() - 1) {
            return 0;
        }
        double sum = 0;
        for (int i = startIndex; i < points.size() - 1; i++) {
            StationPoint a = points.get(i);
            StationPoint b = points.get(i + 1);
            sum += haversineKm(a.lat, a.lng, b.lat, b.lng);
        }
        return sum;
    }

    private double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double earthRadiusKm = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }

    private TrafficProfile buildTrafficProfile() {
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        // 工作日高峰时段近似：7-9点、17-19点
        if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
            return new TrafficProfile("拥堵", 0.62, 0.9);
        }
        // 白天与晚高峰后时段
        if ((hour >= 6 && hour < 7) || (hour >= 9 && hour < 22)) {
            return new TrafficProfile("正常", 0.82, 0.6);
        }
        // 夜间道路通常更通畅
        return new TrafficProfile("畅通", 1.05, 0.35);
    }

    private double roundTo(double value, int scale) {
        double factor = Math.pow(10, scale);
        return Math.round(value * factor) / factor;
    }

    private static class StationPoint {
        private final double lng;
        private final double lat;

        private StationPoint(double lng, double lat) {
            this.lng = lng;
            this.lat = lat;
        }
    }

    private static class TrafficProfile {
        private final String level;
        private final double speedFactor;
        private final double dwellMinutesPerStation;

        private TrafficProfile(String level, double speedFactor, double dwellMinutesPerStation) {
            this.level = level;
            this.speedFactor = speedFactor;
            this.dwellMinutesPerStation = dwellMinutesPerStation;
        }
    }
}
