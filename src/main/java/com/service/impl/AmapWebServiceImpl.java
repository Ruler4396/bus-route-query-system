package com.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.SecureUtil;
import cn.hutool.http.HttpUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.service.AmapWebService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;

/**
 * 高德 Web 服务实现
 */
@Service("amapWebService")
public class AmapWebServiceImpl implements AmapWebService {

    private static final String AMAP_WEB_BASE = "https://restapi.amap.com";

    @Value("${amap.web.key:}")
    private String amapWebKey;

    @Value("${amap.web.security-key:}")
    private String amapWebSecurityKey;

    @Value("${amap.web.timeout-ms:8000}")
    private Integer timeoutMs;

    @Override
    public ApiResult getDrivingRoute(String origin, String destination, String waypoints, String strategy) {
        if (StrUtil.isBlank(origin) || StrUtil.isBlank(destination)) {
            return ApiResult.fail("起点和终点坐标不能为空");
        }

        Map<String, Object> params = new LinkedHashMap<>();
        params.put("origin", origin);
        params.put("destination", destination);
        params.put("strategy", StrUtil.isBlank(strategy) ? "0" : strategy);
        params.put("extensions", "base");
        if (StrUtil.isNotBlank(waypoints)) {
            params.put("waypoints", waypoints);
        }

        ApiResult apiResult = callAmapApi("/v3/direction/driving", params);
        if (!apiResult.isSuccess()) {
            return apiResult;
        }

        JSONObject data = apiResult.getData();
        JSONObject route = data.getJSONObject("route");
        if (route == null) {
            return ApiResult.fail("高德返回结果缺少route字段");
        }
        JSONArray paths = route.getJSONArray("paths");
        if (paths == null || paths.isEmpty()) {
            return ApiResult.fail("未查询到可用路径");
        }

        JSONObject bestPath = paths.getJSONObject(0);
        JSONArray steps = bestPath.getJSONArray("steps");
        JSONArray points = parsePolylinePoints(steps);
        if (points.isEmpty()) {
            return ApiResult.fail("高德路径点为空");
        }

        JSONObject result = new JSONObject();
        result.put("distanceMeters", toLong(bestPath.getString("distance")));
        result.put("distanceKm", roundTo(toDouble(bestPath.getString("distance")) / 1000.0, 2));
        result.put("durationSeconds", toLong(bestPath.getString("duration")));
        result.put("durationMinutes", (int) Math.ceil(toDouble(bestPath.getString("duration")) / 60.0));
        result.put("trafficLights", toLong(bestPath.getString("traffic_lights")));
        result.put("tolls", toDouble(bestPath.getString("tolls")));
        result.put("taxiCost", toDouble(bestPath.getString("taxi_cost")));
        result.put("pointCount", points.size());
        result.put("polylinePoints", points);

        return ApiResult.ok(result);
    }

    @Override
    public ApiResult geocode(String address, String city) {
        if (StrUtil.isBlank(address)) {
            return ApiResult.fail("地址不能为空");
        }

        Map<String, Object> params = new LinkedHashMap<>();
        params.put("address", address);
        if (StrUtil.isNotBlank(city)) {
            params.put("city", city);
        }

        ApiResult apiResult = callAmapApi("/v3/geocode/geo", params);
        if (!apiResult.isSuccess()) {
            return apiResult;
        }

        JSONArray geocodes = apiResult.getData().getJSONArray("geocodes");
        if (geocodes == null || geocodes.isEmpty()) {
            return ApiResult.fail("未查到地理编码结果");
        }
        return ApiResult.ok(geocodes.getJSONObject(0));
    }

    @Override
    public ApiResult reverseGeocode(String location, Integer radius) {
        if (StrUtil.isBlank(location)) {
            return ApiResult.fail("location不能为空，格式如121.4737,31.2304");
        }
        int queryRadius = radius == null ? 300 : radius;
        if (queryRadius < 0) {
            queryRadius = 0;
        }
        if (queryRadius > 3000) {
            queryRadius = 3000;
        }

        Map<String, Object> params = new LinkedHashMap<>();
        params.put("location", location);
        params.put("radius", queryRadius);
        params.put("extensions", "base");
        params.put("roadlevel", "0");

        ApiResult apiResult = callAmapApi("/v3/geocode/regeo", params);
        if (!apiResult.isSuccess()) {
            return apiResult;
        }

        JSONObject regeocode = apiResult.getData().getJSONObject("regeocode");
        if (regeocode == null) {
            return ApiResult.fail("未查到逆地理编码结果");
        }
        return ApiResult.ok(regeocode);
    }

    private ApiResult callAmapApi(String path, Map<String, Object> bizParams) {
        if (StrUtil.isBlank(amapWebKey)) {
            return ApiResult.fail("未配置高德Web服务Key，请检查 application.yml 的 amap.web.key");
        }

        try {
            TreeMap<String, Object> params = new TreeMap<>();
            params.put("output", "json");
            params.put("key", amapWebKey);
            if (bizParams != null) {
                params.putAll(bizParams);
            }

            if (StrUtil.isNotBlank(amapWebSecurityKey)) {
                params.put("sig", buildSignature(params, amapWebSecurityKey));
            }

            String raw = HttpUtil.get(AMAP_WEB_BASE + path, params, timeoutMs == null ? 8000 : timeoutMs);
            JSONObject response = JSON.parseObject(raw);
            if (response == null) {
                return ApiResult.fail("高德服务无响应");
            }

            String status = response.getString("status");
            if (!"1".equals(status)) {
                String info = response.getString("info");
                String infocode = response.getString("infocode");
                return ApiResult.fail("高德服务调用失败: " + (info == null ? "unknown" : info)
                        + (infocode == null ? "" : "（" + infocode + "）"));
            }
            return ApiResult.ok(response);
        } catch (Exception e) {
            return ApiResult.fail("高德服务请求异常: " + e.getMessage());
        }
    }

    private String buildSignature(Map<String, Object> params, String securityKey) {
        StringBuilder builder = new StringBuilder();
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            if (entry.getValue() == null) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append("&");
            }
            builder.append(entry.getKey()).append("=").append(entry.getValue());
        }
        builder.append(securityKey);
        return SecureUtil.md5(builder.toString());
    }

    private JSONArray parsePolylinePoints(JSONArray steps) {
        JSONArray points = new JSONArray();
        if (steps == null || steps.isEmpty()) {
            return points;
        }

        String lastPoint = null;
        for (int i = 0; i < steps.size(); i++) {
            JSONObject step = steps.getJSONObject(i);
            if (step == null) {
                continue;
            }
            String polyline = step.getString("polyline");
            if (StrUtil.isBlank(polyline)) {
                continue;
            }
            String[] segments = polyline.split(";");
            for (String segment : segments) {
                String trimmed = segment == null ? "" : segment.trim();
                if (trimmed.isEmpty() || trimmed.equals(lastPoint)) {
                    continue;
                }
                String[] lngLat = trimmed.split(",");
                if (lngLat.length != 2) {
                    continue;
                }
                double lng = toDouble(lngLat[0]);
                double lat = toDouble(lngLat[1]);
                if (lng == 0 && lat == 0) {
                    continue;
                }
                JSONObject point = new JSONObject();
                point.put("lng", lng);
                point.put("lat", lat);
                points.add(point);
                lastPoint = trimmed;
            }
        }
        return points;
    }

    private long toLong(String value) {
        try {
            return value == null ? 0L : Long.parseLong(value);
        } catch (Exception ignored) {
            return 0L;
        }
    }

    private double toDouble(String value) {
        try {
            return value == null ? 0.0 : Double.parseDouble(value);
        } catch (Exception ignored) {
            return 0.0;
        }
    }

    private double roundTo(double value, int scale) {
        double factor = Math.pow(10, scale);
        return Math.round(value * factor) / factor;
    }
}
