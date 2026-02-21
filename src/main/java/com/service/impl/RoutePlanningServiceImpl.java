package com.service.impl;

import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.baomidou.mybatisplus.mapper.Wrapper;
import com.entity.GongjiaoluxianEntity;
import com.entity.YonghuEntity;
import com.entity.ZhandianWuzhangaiEntity;
import com.service.GongjiaoluxianService;
import com.service.RoutePlanningService;
import com.service.YonghuService;
import com.service.ZhandianWuzhangaiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service("routePlanningService")
public class RoutePlanningServiceImpl implements RoutePlanningService {

    @Autowired
    private GongjiaoluxianService gongjiaoluxianService;

    @Autowired
    private ZhandianWuzhangaiService zhandianWuzhangaiService;

    @Autowired
    private YonghuService yonghuService;

    private static final double DEFAULT_NEUTRAL_SCORE = 50.0;
    private static final String RULE_ROUTE_LEVEL = "routeLevel";
    private static final String RULE_STATION = "station";
    private static final String RULE_USER_MATCH = "userMatch";

    @Value("${route.rule.pipeline:routeLevel,station,userMatch}")
    private String scoreRulePipeline;

    @Value("${route.rule.weight.route-level:0.4}")
    private double routeLevelWeight;

    @Value("${route.rule.weight.station:0.3}")
    private double stationWeight;

    @Value("${route.rule.weight.user-match:0.3}")
    private double userMatchWeight;

    @Override
    public List<RouteResult> planAccessibleRoute(String startStation, String endStation, Long userId, String preferenceType) {
        // 1. 获取用户档案
        YonghuEntity userProfile = null;
        if (userId != null) {
            userProfile = yonghuService.selectById(userId);
        }

        // 2. 如果用户选择AUTO，则根据障碍类型智能推荐
        if ("AUTO".equals(preferenceType) && userProfile != null) {
            preferenceType = determineBestStrategy(userProfile);
        }

        // 3. 获取所有可行路线
        List<GongjiaoluxianEntity> routes = getAllPossibleRoutes(startStation, endStation);

        // 4. 计算每条路线的评分
        List<RouteResult> results = new ArrayList<>();
        for (GongjiaoluxianEntity route : routes) {
            RouteResult result = new RouteResult();
            result.setRoute(route);

            double accessibilityScore = calculateAccessibilityScore(route, userProfile);
            result.setAccessibilityScore(accessibilityScore);

            double totalScore = calculateTotalScore(route, accessibilityScore, preferenceType, userProfile);
            result.setTotalScore(totalScore);

            result.setRecommendationReason(generateRecommendationReason(route, userProfile, accessibilityScore));
            result.setAccessibilityLevelText(getAccessibilityLevelText(route.getWuzhangaijibie()));
            result.setVoiceAnnounceText(booleanFeatureText(route.getYuyintongbao(), "支持语音播报", "暂无语音播报"));
            result.setBlindPathSupportText(booleanFeatureText(route.getMangdaozhichi(), "有盲道支持", "暂无盲道支持信息"));
            result.setGuideDogSupportText(booleanFeatureText(route.getDitezhichi(), "支持导盲犬", "暂无导盲犬支持信息"));
            results.add(result);
        }

        // 5. 根据偏好排序
        results.sort((r1, r2) -> Double.compare(r2.getTotalScore(), r1.getTotalScore()));

        return results;
    }

    @Override
    public String determineBestStrategy(YonghuEntity userProfile) {
        if (userProfile == null || userProfile.getZhangaijibie() == null) {
            return "AUTO";
        }

        switch (userProfile.getZhangaijibie()) {
            case 1: // 视障
                return "ACCESSIBLE";  // 优先无障碍设施完善的路线
            case 2: // 听障
                return "TIME";        // 听障用户对时间敏感
            case 3: // 肢障
                return "ACCESSIBLE";  // 需要无障碍设施
            case 4: // 多重障碍
                return "ACCESSIBLE";  // 优先无障碍
            default:
                // 使用用户设置的偏好
                return userProfile.getPreferenceRouteType() != null ?
                        userProfile.getPreferenceRouteType() : "AUTO";
        }
    }

    @Override
    public double calculateAccessibilityScore(GongjiaoluxianEntity route, YonghuEntity userProfile) {
        RouteScoreContext context = new RouteScoreContext(route, userProfile);
        Map<String, ScoreRule> ruleRegistry = buildRuleRegistry();
        Map<String, Double> weightMap = buildRuleWeightMap();

        double weightedScore = 0.0;
        double totalWeight = 0.0;

        for (String ruleKey : resolveRulePipeline()) {
            ScoreRule rule = ruleRegistry.get(ruleKey);
            double weight = weightMap.containsKey(ruleKey) ? weightMap.get(ruleKey) : 0.0;
            if (rule == null || weight <= 0.0) {
                continue;
            }
            double rawScore = clampScore(rule.apply(context));
            context.getRuleScores().put(ruleKey, rawScore);
            weightedScore += rawScore * weight;
            totalWeight += weight;
        }

        if (totalWeight <= 0.0) {
            return DEFAULT_NEUTRAL_SCORE;
        }
        return roundToOneDecimal(weightedScore / totalWeight);
    }

    /**
     * 计算站点无障碍评分
     */
    private double calculateStationAccessibilityScore(GongjiaoluxianEntity route) {
        if (route.getTujingzhandian() == null || route.getTujingzhandian().isEmpty()) {
            return 50.0; // 默认中等评分
        }

        String[] stations = route.getTujingzhandian().split(",");
        if (stations.length == 0) {
            return 50.0;
        }

        double totalScore = 0.0;
        int validStationCount = 0;

        for (String stationName : stations) {
            stationName = stationName.trim();
            ZhandianWuzhangaiEntity stationInfo = zhandianWuzhangaiService.getByStationName(stationName);

            if (stationInfo != null) {
                double stationScore = calculateSingleStationScore(stationInfo);
                totalScore += stationScore;
                validStationCount++;
            }
        }

        if (validStationCount == 0) {
            return 50.0;
        }

        return totalScore / validStationCount;
    }

    /**
     * 计算单个站点评分
     */
    private double calculateSingleStationScore(ZhandianWuzhangaiEntity station) {
        double score = 0.0;

        // 基础分：根据无障碍级别
        Integer level = station.getWuzhangaijibie();
        if (level == null) level = 3;
        score += (3 - level) / 3.0 * 40; // 最高40分

        // 设施加分
        if (station.getShengjiangtai() != null && station.getShengjiangtai() == 1) score += 15;
        if (station.getMangdao() != null && station.getMangdao() == 1) score += 10;
        if (station.getZhuizhu() != null && station.getZhuizhu() == 1) score += 10;
        if (station.getCesuo() != null && station.getCesuo() == 1) score += 10;
        if (station.getTingchechang() != null && station.getTingchechang() == 1) score += 10;

        // 爱心座椅加分
        if (station.getZuoweishu() != null && station.getZuoweishu() > 0) score += 5;

        return Math.min(score, 100.0);
    }

    /**
     * 计算用户适配度
     */
    private double calculateUserMatchScore(GongjiaoluxianEntity route, YonghuEntity userProfile) {
        double score = 0.0;
        Integer disabilityLevel = userProfile.getZhangaijibie();

        if (disabilityLevel == null) {
            return 50.0;
        }

        switch (disabilityLevel) {
            case 1: // 视障用户
                // 重视：语音播报、盲道
                if (route.getYuyintongbao() != null && route.getYuyintongbao() == 1) score += 40;
                if (route.getMangdaozhichi() != null && route.getMangdaozhichi() == 1) score += 30;
                break;

            case 2: // 听障用户
                // 重视：电子显示屏（通过无障碍设施字段判断）
                if (route.getWuzhangaisheshi() != null && route.getWuzhangaisheshi().contains("电子显示屏")) {
                    score += 50;
                }
                score += 30; // 听障用户对路线本身要求不高
                break;

            case 3: // 肢障用户
                // 重视：轮椅设施、电梯
                if (route.getWuzhangaisheshi() != null && route.getWuzhangaisheshi().contains("轮椅")) {
                    score += 30;
                }
                if (route.getDiantifacilities() != null && !route.getDiantifacilities().isEmpty()) {
                    score += 30;
                }
                break;

            case 4: // 多重障碍
                // 要求最高
                if (route.getWuzhangaijibie() != null && route.getWuzhangaijibie() == 0) {
                    score += 50;
                }
                break;

            default:
                score = 50.0;
        }

        // 导盲犬支持
        if (route.getDitezhichi() != null && route.getDitezhichi() == 1) {
            if (userProfile.getFuzhugongju() != null && userProfile.getFuzhugongju().contains("导盲犬")) {
                score += 20;
            }
        }

        return Math.min(score + 20, 100.0); // 基础分20分
    }

    /**
     * 计算综合评分
     */
    private double calculateTotalScore(GongjiaoluxianEntity route, double accessibilityScore,
                                       String preferenceType, YonghuEntity userProfile) {
        double score = accessibilityScore;

        switch (preferenceType) {
            case "ACCESSIBLE":
                // 无障碍优先，无障碍评分权重最高
                score = accessibilityScore * 0.8 + 20;
                break;

            case "TIME":
                // 时间优先，假设站点越少时间越短
                if (route.getTujingzhandian() != null) {
                    int stationCount = route.getTujingzhandian().split(",").length;
                    // 站点越少得分越高
                    double timeScore = Math.max(0, 50 - stationCount * 2);
                    score = accessibilityScore * 0.3 + timeScore * 0.7;
                }
                break;

            case "DISTANCE":
                // 距离优先，这里简化处理
                score = accessibilityScore * 0.4 + 40; // 基础分40
                break;

            default: // AUTO
                // 均衡考虑
                score = accessibilityScore * 0.6 + 30;
                break;
        }

        return Math.min(score, 100.0);
    }

    @Override
    public Map<String, Object> getRuleEngineMeta() {
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("pipeline", resolveRulePipeline());
        meta.put("weights", buildRuleWeightMap());
        meta.put("neutralScore", DEFAULT_NEUTRAL_SCORE);
        return meta;
    }

    private Map<String, ScoreRule> buildRuleRegistry() {
        Map<String, ScoreRule> registry = new LinkedHashMap<>();
        registry.put(RULE_ROUTE_LEVEL, new ScoreRule() {
            @Override
            public double apply(RouteScoreContext context) {
                Integer routeLevel = context.getRoute().getWuzhangaijibie();
                if (routeLevel == null) {
                    routeLevel = 3;
                }
                return (3 - routeLevel) / 3.0 * 100.0;
            }
        });
        registry.put(RULE_STATION, new ScoreRule() {
            @Override
            public double apply(RouteScoreContext context) {
                return calculateStationAccessibilityScore(context.getRoute());
            }
        });
        registry.put(RULE_USER_MATCH, new ScoreRule() {
            @Override
            public double apply(RouteScoreContext context) {
                YonghuEntity profile = context.getUserProfile();
                if (profile == null || profile.getZhangaijibie() == null) {
                    return DEFAULT_NEUTRAL_SCORE;
                }
                return calculateUserMatchScore(context.getRoute(), profile);
            }
        });
        return registry;
    }

    private Map<String, Double> buildRuleWeightMap() {
        Map<String, Double> weights = new LinkedHashMap<>();
        weights.put(RULE_ROUTE_LEVEL, clampWeight(routeLevelWeight));
        weights.put(RULE_STATION, clampWeight(stationWeight));
        weights.put(RULE_USER_MATCH, clampWeight(userMatchWeight));
        return weights;
    }

    private List<String> resolveRulePipeline() {
        List<String> defaultPipeline = Arrays.asList(RULE_ROUTE_LEVEL, RULE_STATION, RULE_USER_MATCH);
        if (scoreRulePipeline == null || scoreRulePipeline.trim().isEmpty()) {
            return defaultPipeline;
        }
        Set<String> valid = new LinkedHashSet<>(defaultPipeline);
        List<String> pipeline = new ArrayList<>();
        String[] items = scoreRulePipeline.split(",");
        for (String item : items) {
            String key = item == null ? "" : item.trim();
            if (key.isEmpty()) {
                continue;
            }
            if (valid.contains(key) && !pipeline.contains(key)) {
                pipeline.add(key);
            }
        }
        return pipeline.isEmpty() ? defaultPipeline : pipeline;
    }

    private double clampWeight(double weight) {
        if (Double.isNaN(weight) || Double.isInfinite(weight)) {
            return 0.0;
        }
        return Math.max(0.0, Math.min(weight, 1.0));
    }

    private double clampScore(double score) {
        if (Double.isNaN(score) || Double.isInfinite(score)) {
            return DEFAULT_NEUTRAL_SCORE;
        }
        return Math.max(0.0, Math.min(score, 100.0));
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    @Override
    public List<GongjiaoluxianEntity> getAllPossibleRoutes(String startStation, String endStation) {
        Wrapper<GongjiaoluxianEntity> wrapper = new EntityWrapper<>();

        // 查询包含起点或终点，或经过站点的路线
        wrapper.like("qidianzhanming", startStation)
                .or()
                .like("zhongdianzhanming", endStation)
                .or()
                .like("tujingzhandian", startStation)
                .or()
                .like("tujingzhandian", endStation);

        return gongjiaoluxianService.selectList(wrapper);
    }

    @Override
    public String getAccessibilityLevelText(Integer level) {
        if (level == null) return "未知";
        switch (level) {
            case 0:
                return "完全无障碍";
            case 1:
                return "基本无障碍";
            case 2:
                return "部分障碍";
            case 3:
                return "有障碍";
            default:
                return "未知";
        }
    }

    /**
     * 生成推荐理由
     */
    private String generateRecommendationReason(GongjiaoluxianEntity route, YonghuEntity userProfile, double accessibilityScore) {
        StringBuilder reason = new StringBuilder();

        if (accessibilityScore >= 80) {
            reason.append("无障碍设施完善");
        } else if (accessibilityScore >= 60) {
            reason.append("基本无障碍");
        } else {
            reason.append("无障碍设施有限");
        }

        if (route.getYuyintongbao() != null && route.getYuyintongbao() == 1) {
            reason.append("，支持语音播报");
        }

        if (route.getDitezhichi() != null && route.getDitezhichi() == 1) {
            reason.append("，支持导盲犬");
        }

        return reason.toString();
    }

    /**
     * 布尔设施字段转换为可读文本，便于前端直出无障碍信息。
     */
    private String booleanFeatureText(Integer value, String yesText, String noText) {
        return value != null && value == 1 ? yesText : noText;
    }

    private interface ScoreRule {
        double apply(RouteScoreContext context);
    }

    private static class RouteScoreContext {
        private final GongjiaoluxianEntity route;
        private final YonghuEntity userProfile;
        private final Map<String, Double> ruleScores = new LinkedHashMap<>();

        RouteScoreContext(GongjiaoluxianEntity route, YonghuEntity userProfile) {
            this.route = route;
            this.userProfile = userProfile;
        }

        public GongjiaoluxianEntity getRoute() {
            return route;
        }

        public YonghuEntity getUserProfile() {
            return userProfile;
        }

        public Map<String, Double> getRuleScores() {
            return ruleScores;
        }
    }
}
