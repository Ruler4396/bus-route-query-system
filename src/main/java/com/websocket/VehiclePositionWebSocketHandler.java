package com.websocket;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.entity.GongjiaoluxianEntity;
import com.service.GongjiaoluxianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 车辆位置实时推送（WebSocket）
 * 客户端连接示例：ws://host:port/springbootmf383/ws/vehicle?routeId=1
 */
@Component
public class VehiclePositionWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private GongjiaoluxianService gongjiaoluxianService;

    private final Map<String, SessionState> sessionStates = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long routeId = parseRouteIdFromSession(session);
        if (routeId == null) {
            session.sendMessage(new TextMessage(errorPayload("routeId不能为空或格式错误")));
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        List<StationPoint> stations = loadRouteStations(routeId);
        if (stations.size() < 2) {
            session.sendMessage(new TextMessage(errorPayload("路线站点不足，无法推送车辆位置")));
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        SessionState state = new SessionState(session, routeId, stations);
        sessionStates.put(session.getId(), state);
        session.sendMessage(new TextMessage(successPayload(routeId, state.current(), state.currentIndex())));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        SessionState state = sessionStates.get(session.getId());
        if (state == null) {
            return;
        }
        String payload = message.getPayload();
        if (payload == null || payload.trim().isEmpty()) {
            return;
        }
        try {
            JSONObject json = JSON.parseObject(payload);
            if (json == null || !json.containsKey("routeId")) {
                return;
            }
            Long routeId = json.getLong("routeId");
            if (routeId == null) {
                return;
            }
            List<StationPoint> stations = loadRouteStations(routeId);
            if (stations.size() < 2) {
                session.sendMessage(new TextMessage(errorPayload("切换路线失败，站点不足")));
                return;
            }
            state.reset(routeId, stations);
            session.sendMessage(new TextMessage(successPayload(routeId, state.current(), state.currentIndex())));
        } catch (Exception e) {
            session.sendMessage(new TextMessage(errorPayload("消息格式错误")));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionStates.remove(session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        sessionStates.remove(session.getId());
        try {
            if (session.isOpen()) {
                session.close(CloseStatus.SERVER_ERROR);
            }
        } catch (IOException ignored) {
            // ignore close exception
        }
    }

    @Scheduled(fixedDelayString = "${vehicle.ws.push-interval-ms:2000}")
    public void pushVehiclePosition() {
        if (sessionStates.isEmpty()) {
            return;
        }
        for (SessionState state : new ArrayList<>(sessionStates.values())) {
            WebSocketSession session = state.session;
            if (session == null || !session.isOpen()) {
                if (session != null) {
                    sessionStates.remove(session.getId());
                }
                continue;
            }
            state.advance();
            try {
                session.sendMessage(new TextMessage(successPayload(state.routeId, state.current(), state.currentIndex())));
            } catch (IOException e) {
                sessionStates.remove(session.getId());
                try {
                    session.close(CloseStatus.SERVER_ERROR);
                } catch (IOException ignored) {
                    // ignore close exception
                }
            }
        }
    }

    private Long parseRouteIdFromSession(WebSocketSession session) {
        try {
            String routeIdParam = UriComponentsBuilder.fromUri(session.getUri())
                    .build()
                    .getQueryParams()
                    .getFirst("routeId");
            if (routeIdParam == null || routeIdParam.trim().isEmpty()) {
                return null;
            }
            return Long.valueOf(routeIdParam);
        } catch (Exception e) {
            return null;
        }
    }

    private List<StationPoint> loadRouteStations(Long routeId) {
        GongjiaoluxianEntity route = gongjiaoluxianService.selectById(routeId);
        if (route == null) {
            return Collections.emptyList();
        }

        String stationJson = route.getZhandianzuobiao();
        if (stationJson != null && !stationJson.trim().isEmpty()) {
            try {
                JSONArray arr = JSON.parseArray(stationJson);
                List<StationPoint> list = new ArrayList<>();
                for (int i = 0; i < arr.size(); i++) {
                    JSONObject item = arr.getJSONObject(i);
                    if (item == null) {
                        continue;
                    }
                    Double lng = item.getDouble("lng");
                    Double lat = item.getDouble("lat");
                    if (lng == null || lat == null) {
                        continue;
                    }
                    String name = item.getString("name");
                    if (name == null || name.trim().isEmpty()) {
                        name = "站点" + (i + 1);
                    }
                    list.add(new StationPoint(name, lng, lat));
                }
                if (!list.isEmpty()) {
                    return list;
                }
            } catch (Exception ignored) {
                // fallback to generated stations
            }
        }

        String stationNames = route.getTujingzhandian();
        if (stationNames == null || stationNames.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String[] names = stationNames.split("[,，]");
        List<StationPoint> generated = new ArrayList<>();
        double baseLng = 121.4737;
        double baseLat = 31.2304;
        double lngStep = 0.005;
        double latStep = 0.003;
        for (int i = 0; i < names.length; i++) {
            String name = names[i].trim();
            if (name.isEmpty()) {
                continue;
            }
            generated.add(new StationPoint(name, baseLng + i * lngStep, baseLat + i * latStep));
        }
        return generated;
    }

    private String successPayload(Long routeId, StationPoint point, int stationIndex) {
        JSONObject data = new JSONObject();
        data.put("routeId", routeId);
        data.put("stationIndex", stationIndex);
        data.put("stationName", point.name);
        data.put("lng", point.lng);
        data.put("lat", point.lat);
        data.put("timestamp", System.currentTimeMillis());

        JSONObject root = new JSONObject();
        root.put("code", 0);
        root.put("msg", "ok");
        root.put("data", data);
        return root.toJSONString();
    }

    private String errorPayload(String msg) {
        JSONObject root = new JSONObject();
        root.put("code", 1);
        root.put("msg", msg);
        return root.toJSONString();
    }

    private static class SessionState {
        private final WebSocketSession session;
        private Long routeId;
        private List<StationPoint> stations;
        private int idx = 0;

        private SessionState(WebSocketSession session, Long routeId, List<StationPoint> stations) {
            this.session = session;
            this.routeId = routeId;
            this.stations = stations;
        }

        private StationPoint current() {
            if (stations == null || stations.isEmpty()) {
                return new StationPoint("未知站点", 121.4737, 31.2304);
            }
            if (idx < 0 || idx >= stations.size()) {
                idx = 0;
            }
            return stations.get(idx);
        }

        private void advance() {
            if (stations == null || stations.isEmpty()) {
                idx = 0;
                return;
            }
            idx++;
            if (idx >= stations.size()) {
                idx = 0;
            }
        }

        private void reset(Long routeId, List<StationPoint> stations) {
            this.routeId = routeId;
            this.stations = stations;
            this.idx = 0;
        }

        private int currentIndex() {
            if (idx < 0) {
                return 0;
            }
            return idx;
        }
    }

    private static class StationPoint {
        private final String name;
        private final double lng;
        private final double lat;

        private StationPoint(String name, double lng, double lat) {
            this.name = name;
            this.lng = lng;
            this.lat = lat;
        }
    }
}
