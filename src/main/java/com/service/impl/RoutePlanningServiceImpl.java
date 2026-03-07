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

import java.text.SimpleDateFormat;
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
    private static final String PROFILE_GENERAL = "GENERAL";
    private static final String PROFILE_WHEELCHAIR = "WHEELCHAIR";
    private static final String PROFILE_LOW_VISION = "LOW_VISION";
    private static final String PROFILE_HEARING_TEXT = "HEARING_TEXT";
    private static final String PROFILE_MULTI = "MULTI";

    @Value("${route.rule.pipeline:routeLevel,station,userMatch}")
    private String scoreRulePipeline;

    @Value("${route.rule.weight.route-level:0.4}")
    private double routeLevelWeight;

    @Value("${route.rule.weight.station:0.3}")
    private double stationWeight;

    @Value("${route.rule.weight.user-match:0.3}")
    private double userMatchWeight;

    @Override
    public List<RouteResult> planAccessibleRoute(String startStation, String endStation, Long userId, String preferenceType, String profileType) {
        String normalizedProfileType = normalizeProfileType(profileType);
        YonghuEntity effectiveProfile = resolveEffectiveUserProfile(userId, normalizedProfileType);
        String resolvedProfileType = resolveProfileType(effectiveProfile, normalizedProfileType);
        String resolvedProfileLabel = getProfileTypeLabel(resolvedProfileType);
        String resolvedPreferenceType = normalizePreferenceType(preferenceType);
        if ("AUTO".equals(resolvedPreferenceType) && effectiveProfile != null) {
            resolvedPreferenceType = determineBestStrategy(effectiveProfile);
        }

        List<GongjiaoluxianEntity> routes = getAllPossibleRoutes(startStation, endStation);
        List<RouteResult> results = new ArrayList<>();
        for (GongjiaoluxianEntity route : routes) {
            RouteResult result = new RouteResult();
            result.setRoute(route);
            result.setResolvedProfileType(resolvedProfileType);
            result.setResolvedProfileLabel(resolvedProfileLabel);
            result.setResolvedPreferenceType(resolvedPreferenceType);
            result.setResolvedPreferenceLabel(getPreferenceLabel(resolvedPreferenceType));
            result.setDataSourceText(resolveDataSourceText(route));
            result.setDataUpdatedAtText(resolveDataUpdatedAtText(route));
            result.setAccessibilityLevelText(getAccessibilityLevelText(route.getWuzhangaijibie()));
            result.setVoiceAnnounceText(booleanFeatureText(route.getYuyintongbao(), "支持语音播报", "语音播报信息不足"));
            result.setBlindPathSupportText(booleanFeatureText(route.getMangdaozhichi(), "有盲道支持", "盲道支持信息不足"));
            result.setGuideDogSupportText(booleanFeatureText(route.getDitezhichi(), "支持导盲犬", "导盲犬支持信息不足"));

            double accessibilityScore = calculateAccessibilityScore(route, effectiveProfile);
            result.setAccessibilityScore(accessibilityScore);

            RouteAssessment assessment = assessRoute(route, effectiveProfile, resolvedProfileType, accessibilityScore);
            double totalScore = calculateTotalScore(route, accessibilityScore, resolvedPreferenceType, effectiveProfile);
            if (assessment.degraded) {
                totalScore -= 8.0;
            }
            if (!assessment.recommendable) {
                totalScore -= 35.0;
            }
            result.setTotalScore(roundToOneDecimal(Math.max(0.0, totalScore)));
            result.setConfidenceScore(assessment.confidenceScore);
            result.setConfidenceLevelText(assessment.confidenceLevelText);
            result.setRiskHints(assessment.riskHints);
            result.setMissingDataHints(assessment.missingDataHints);
            result.setRecommendable(assessment.recommendable);
            result.setDecisionState(assessment.decisionState);
            result.setDecisionStateText(resolveDecisionStateText(assessment.decisionState));
            result.setDecisionMessage(assessment.decisionMessage);
            result.setRuleBreakdown(assessment.ruleBreakdown);
            TravelPath path = resolveTravelPath(route, startStation, endStation);
            result.setBoardingStationName(path.boardingStationName);
            result.setAlightingStationName(path.alightingStationName);
            result.setTravelStationCount(path.travelStationCount);
            result.setTransferRequired(path.transferRequired);
            List<Map<String, Object>> segments = buildRouteSegments(route, path, resolvedProfileType, assessment);
            assessment.segments = segments;
            result.setSegments(segments);
            result.setRecommendationReason(generateRecommendationReason(route, effectiveProfile, resolvedProfileType, resolvedPreferenceType, accessibilityScore, assessment));
            results.add(result);
        }

        results.sort((left, right) -> {
            if (left.isRecommendable() != right.isRecommendable()) {
                return left.isRecommendable() ? -1 : 1;
            }
            return Double.compare(right.getTotalScore(), left.getTotalScore());
        });
        return results;
    }

    @Override
    public String determineBestStrategy(YonghuEntity userProfile) {
        if (userProfile == null || userProfile.getZhangaijibie() == null) {
            return "AUTO";
        }
        switch (userProfile.getZhangaijibie()) {
            case 1:
            case 3:
            case 4:
                return "ACCESSIBLE";
            case 2:
                return "TIME";
            default:
                return userProfile.getPreferenceRouteType() != null ? userProfile.getPreferenceRouteType() : "AUTO";
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

    @Override
    public List<GongjiaoluxianEntity> getAllPossibleRoutes(String startStation, String endStation) {
        Wrapper<GongjiaoluxianEntity> wrapper = new EntityWrapper<>();
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

    @Override
    public Map<String, Object> getRuleEngineMeta() {
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("pipeline", resolveRulePipeline());
        meta.put("weights", buildRuleWeightMap());
        meta.put("neutralScore", DEFAULT_NEUTRAL_SCORE);
        meta.put("supportedProfiles", Arrays.asList(
                buildProfileMeta(PROFILE_WHEELCHAIR),
                buildProfileMeta(PROFILE_LOW_VISION),
                buildProfileMeta(PROFILE_HEARING_TEXT),
                buildProfileMeta(PROFILE_GENERAL)
        ));
        return meta;
    }

    @Override
    public String getProfileTypeLabel(String profileType) {
        switch (normalizeProfileType(profileType)) {
            case PROFILE_WHEELCHAIR:
                return "轮椅 / 行动不便";
            case PROFILE_LOW_VISION:
                return "低视力";
            case PROFILE_HEARING_TEXT:
                return "听障（文本提示优先）";
            case PROFILE_MULTI:
                return "多重障碍";
            default:
                return "通用访客";
        }
    }

    @Override
    public String normalizeProfileType(String profileType) {
        if (profileType == null) {
            return "AUTO";
        }
        String normalized = profileType.trim().toUpperCase(Locale.ROOT);
        if (normalized.isEmpty() || "AUTO".equals(normalized)) {
            return "AUTO";
        }
        if (PROFILE_WHEELCHAIR.equals(normalized) || PROFILE_LOW_VISION.equals(normalized) || PROFILE_HEARING_TEXT.equals(normalized) || PROFILE_MULTI.equals(normalized) || PROFILE_GENERAL.equals(normalized)) {
            return normalized;
        }
        return "AUTO";
    }

    @Override
    public String getPreferenceLabel(String preferenceType) {
        String normalized = normalizePreferenceType(preferenceType);
        switch (normalized) {
            case "ACCESSIBLE":
                return "无障碍优先";
            case "TIME":
                return "时间优先";
            case "DISTANCE":
                return "距离优先";
            default:
                return "智能推荐";
        }
    }

    private YonghuEntity resolveEffectiveUserProfile(Long userId, String requestedProfileType) {
        if (!"AUTO".equals(requestedProfileType)) {
            return buildVirtualProfile(requestedProfileType);
        }
        if (userId == null) {
            return null;
        }
        return yonghuService.selectById(userId);
    }

    private YonghuEntity buildVirtualProfile(String profileType) {
        YonghuEntity profile = new YonghuEntity();
        String normalized = normalizeProfileType(profileType);
        if (PROFILE_WHEELCHAIR.equals(normalized)) {
            profile.setZhangaijibie(3);
            profile.setFuzhugongju("轮椅");
            profile.setPreferenceRouteType("ACCESSIBLE");
            profile.setGaoduibidu(1);
            profile.setJianpandaohang(1);
            profile.setZitidaxiao(18);
            return profile;
        }
        if (PROFILE_LOW_VISION.equals(normalized)) {
            profile.setZhangaijibie(1);
            profile.setFuzhugongju("低视力辅助");
            profile.setPreferenceRouteType("ACCESSIBLE");
            profile.setGaoduibidu(1);
            profile.setYuyinbofang(1);
            profile.setJianpandaohang(1);
            profile.setZitidaxiao(20);
            return profile;
        }
        if (PROFILE_HEARING_TEXT.equals(normalized)) {
            profile.setZhangaijibie(2);
            profile.setPreferenceRouteType("TIME");
            profile.setGaoduibidu(1);
            profile.setJianpandaohang(1);
            profile.setZitidaxiao(16);
            return profile;
        }
        if (PROFILE_MULTI.equals(normalized)) {
            profile.setZhangaijibie(4);
            profile.setPreferenceRouteType("ACCESSIBLE");
            profile.setFuzhugongju("轮椅,导盲辅助");
            profile.setGaoduibidu(1);
            profile.setYuyinbofang(1);
            profile.setJianpandaohang(1);
            profile.setZitidaxiao(20);
            return profile;
        }
        return null;
    }

    private String resolveProfileType(YonghuEntity profile, String requestedProfileType) {
        String normalized = normalizeProfileType(requestedProfileType);
        if (!"AUTO".equals(normalized)) {
            return normalized;
        }
        if (profile == null || profile.getZhangaijibie() == null) {
            return PROFILE_GENERAL;
        }
        switch (profile.getZhangaijibie()) {
            case 1:
                return PROFILE_LOW_VISION;
            case 2:
                return PROFILE_HEARING_TEXT;
            case 3:
                return PROFILE_WHEELCHAIR;
            case 4:
                return PROFILE_MULTI;
            default:
                return PROFILE_GENERAL;
        }
    }

    private String normalizePreferenceType(String preferenceType) {
        if (preferenceType == null || preferenceType.trim().isEmpty()) {
            return "AUTO";
        }
        String normalized = preferenceType.trim().toUpperCase(Locale.ROOT);
        if ("ACCESSIBLE".equals(normalized) || "TIME".equals(normalized) || "DISTANCE".equals(normalized) || "AUTO".equals(normalized)) {
            return normalized;
        }
        return "AUTO";
    }

    private double calculateStationAccessibilityScore(GongjiaoluxianEntity route) {
        if (route.getTujingzhandian() == null || route.getTujingzhandian().trim().isEmpty()) {
            return DEFAULT_NEUTRAL_SCORE;
        }
        String[] stations = route.getTujingzhandian().split(",");
        if (stations.length == 0) {
            return DEFAULT_NEUTRAL_SCORE;
        }
        double total = 0.0;
        int valid = 0;
        for (String raw : stations) {
            String stationName = raw == null ? "" : raw.trim();
            if (stationName.isEmpty()) {
                continue;
            }
            ZhandianWuzhangaiEntity station = zhandianWuzhangaiService.getByStationName(stationName);
            if (station != null) {
                total += calculateSingleStationScore(station);
                valid += 1;
            }
        }
        if (valid == 0) {
            return DEFAULT_NEUTRAL_SCORE;
        }
        return roundToOneDecimal(total / valid);
    }

    private double calculateSingleStationScore(ZhandianWuzhangaiEntity station) {
        double score = 20.0;
        Integer level = station.getWuzhangaijibie();
        if (level != null) {
            score += Math.max(0, (3 - level) * 12.0);
        }
        if (station.getShengjiangtai() != null && station.getShengjiangtai() == 1) score += 18.0;
        if (station.getMangdao() != null && station.getMangdao() == 1) score += 16.0;
        if (station.getZhuizhu() != null && station.getZhuizhu() == 1) score += 8.0;
        if (station.getCesuo() != null && station.getCesuo() == 1) score += 8.0;
        if (station.getTingchechang() != null && station.getTingchechang() == 1) score += 6.0;
        if (station.getZuoweishu() != null) score += Math.min(station.getZuoweishu(), 10);
        return clampScore(score);
    }

    private double calculateUserMatchScore(GongjiaoluxianEntity route, YonghuEntity userProfile) {
        if (userProfile == null || userProfile.getZhangaijibie() == null) {
            return DEFAULT_NEUTRAL_SCORE;
        }
        double score = 20.0;
        switch (userProfile.getZhangaijibie()) {
            case 1: // 低视力 / 视障
                if (route.getYuyintongbao() != null && route.getYuyintongbao() == 1) score += 35.0;
                if (route.getMangdaozhichi() != null && route.getMangdaozhichi() == 1) score += 30.0;
                if (route.getDitezhichi() != null && route.getDitezhichi() == 1) score += 10.0;
                if (containsKeyword(route.getWuzhangaisheshi(), "语音", "盲道", "引导")) score += 10.0;
                break;
            case 2: // 听障
                if (containsKeyword(route.getWuzhangaisheshi(), "电子显示屏", "字幕", "文字提示", "显示")) score += 40.0;
                score += 15.0;
                break;
            case 3: // 轮椅 / 行动不便
                if (containsKeyword(route.getWuzhangaisheshi(), "轮椅", "坡道", "低地板", "无障碍")) score += 35.0;
                if (route.getDiantifacilities() != null && !route.getDiantifacilities().trim().isEmpty()) score += 25.0;
                if (route.getWuzhangaijibie() != null && route.getWuzhangaijibie() <= 1) score += 10.0;
                break;
            case 4: // 多重障碍
                if (route.getWuzhangaijibie() != null && route.getWuzhangaijibie() <= 1) score += 35.0;
                if (route.getYuyintongbao() != null && route.getYuyintongbao() == 1) score += 15.0;
                if (route.getMangdaozhichi() != null && route.getMangdaozhichi() == 1) score += 15.0;
                if (route.getDiantifacilities() != null && !route.getDiantifacilities().trim().isEmpty()) score += 15.0;
                break;
            default:
                score = DEFAULT_NEUTRAL_SCORE;
        }
        if (route.getDitezhichi() != null && route.getDitezhichi() == 1 && userProfile.getFuzhugongju() != null && userProfile.getFuzhugongju().contains("导盲犬")) {
            score += 5.0;
        }
        return clampScore(score);
    }

    private double calculateTotalScore(GongjiaoluxianEntity route, double accessibilityScore, String preferenceType, YonghuEntity userProfile) {
        int stationCount = 0;
        if (route.getTujingzhandian() != null && !route.getTujingzhandian().trim().isEmpty()) {
            stationCount = route.getTujingzhandian().split(",").length;
        }
        double timeScore = Math.max(0.0, 88.0 - stationCount * 3.0);
        double distanceScore = Math.max(0.0, 82.0 - stationCount * 2.0);
        String normalized = normalizePreferenceType(preferenceType);
        if ("ACCESSIBLE".equals(normalized)) {
            return roundToOneDecimal(accessibilityScore * 0.72 + timeScore * 0.12 + distanceScore * 0.16);
        }
        if ("TIME".equals(normalized)) {
            return roundToOneDecimal(accessibilityScore * 0.35 + timeScore * 0.50 + distanceScore * 0.15);
        }
        if ("DISTANCE".equals(normalized)) {
            return roundToOneDecimal(accessibilityScore * 0.35 + distanceScore * 0.50 + timeScore * 0.15);
        }
        return roundToOneDecimal(accessibilityScore * 0.55 + timeScore * 0.20 + distanceScore * 0.25);
    }

    private RouteAssessment assessRoute(GongjiaoluxianEntity route, YonghuEntity profile, String resolvedProfileType, double accessibilityScore) {
        RouteAssessment assessment = new RouteAssessment();
        assessment.recommendable = true;
        assessment.decisionState = "READY";
        assessment.riskHints = new ArrayList<>();
        assessment.missingDataHints = new ArrayList<>();

        double confidenceScore = 38.0;
        if (route.getWuzhangaijibie() != null) confidenceScore += 14.0; else assessment.missingDataHints.add("路线无障碍等级缺失");
        if (route.getWuzhangaisheshi() != null && !route.getWuzhangaisheshi().trim().isEmpty()) confidenceScore += 12.0; else assessment.missingDataHints.add("路线设施说明不足");
        if (route.getYuyintongbao() != null) confidenceScore += 8.0;
        if (route.getMangdaozhichi() != null) confidenceScore += 8.0;
        if (route.getDitezhichi() != null) confidenceScore += 6.0;
        if (route.getDiantifacilities() != null && !route.getDiantifacilities().trim().isEmpty()) confidenceScore += 8.0;
        if (route.getAddtime() != null) confidenceScore += 6.0;
        if (containsKeyword(route.getLuxianxiangqing(), "OpenStreetMap", "OSRM", "真实数据来源")) confidenceScore += 8.0;
        if (containsKeyword(route.getLuxianxiangqing(), "演示")) confidenceScore += 4.0;
        if (accessibilityScore >= 70) confidenceScore += 10.0;

        boolean hasVoice = route.getYuyintongbao() != null && route.getYuyintongbao() == 1;
        boolean hasBlindPath = route.getMangdaozhichi() != null && route.getMangdaozhichi() == 1;
        boolean hasWheelchairFacilities = containsKeyword(route.getWuzhangaisheshi(), "轮椅", "坡道", "低地板", "无障碍");
        boolean hasElevatorInfo = route.getDiantifacilities() != null && !route.getDiantifacilities().trim().isEmpty();

        if (PROFILE_WHEELCHAIR.equals(resolvedProfileType)) {
            if (!hasWheelchairFacilities) {
                assessment.missingDataHints.add("轮椅/坡道信息不足");
                assessment.riskHints.add("该路线缺少明确的轮椅坡道或低地板车辆说明");
                confidenceScore -= 18.0;
            }
            if (!hasElevatorInfo) {
                assessment.missingDataHints.add("电梯/无障碍换乘信息不足");
                assessment.riskHints.add("关键换乘是否可达仍需现场或地图进一步核对");
                confidenceScore -= 16.0;
            }
            if ((route.getWuzhangaijibie() != null && route.getWuzhangaijibie() >= 3) || (!hasWheelchairFacilities && !hasElevatorInfo)) {
                assessment.recommendable = false;
                assessment.decisionState = "REJECTED";
                assessment.decisionMessage = "关键轮椅可达性信息不足，当前不直接推荐该路线。";
            } else if (!hasWheelchairFacilities || !hasElevatorInfo || (route.getWuzhangaijibie() != null && route.getWuzhangaijibie() >= 2)) {
                assessment.degraded = true;
                assessment.decisionState = "DEGRADED";
                assessment.decisionMessage = "该路线可作为候选，但关键换乘或设施信息仍需谨慎核对。";
            }
        } else if (PROFILE_LOW_VISION.equals(resolvedProfileType)) {
            if (!hasVoice) {
                assessment.missingDataHints.add("语音播报信息不足");
                assessment.riskHints.add("该路线语音播报支持较弱");
                confidenceScore -= 18.0;
            }
            if (!hasBlindPath) {
                assessment.missingDataHints.add("盲道支持信息不足");
                assessment.riskHints.add("该路线盲道支持信息不足");
                confidenceScore -= 16.0;
            }
            if ((route.getWuzhangaijibie() != null && route.getWuzhangaijibie() >= 3) || (!hasVoice && !hasBlindPath)) {
                assessment.recommendable = false;
                assessment.decisionState = "REJECTED";
                assessment.decisionMessage = "关键低视力支持信息不足，当前不直接推荐该路线。";
            } else if (!hasVoice || !hasBlindPath || (route.getWuzhangaijibie() != null && route.getWuzhangaijibie() >= 2)) {
                assessment.degraded = true;
                assessment.decisionState = "DEGRADED";
                assessment.decisionMessage = "该路线可作为候选，但语音或盲道信息仍需进一步核对。";
            }
        } else if (PROFILE_HEARING_TEXT.equals(resolvedProfileType)) {
            if (!containsKeyword(route.getWuzhangaisheshi(), "电子显示屏", "字幕", "文字提示", "显示")) {
                assessment.missingDataHints.add("文字提示设施信息不足");
                assessment.riskHints.add("该路线缺少明确的电子显示或字幕提示说明");
                confidenceScore -= 10.0;
                assessment.degraded = true;
                assessment.decisionState = "DEGRADED";
                assessment.decisionMessage = "该路线可展示，但文字提示设施信息还不够完整。";
            }
        }

        confidenceScore = clampScore(confidenceScore);
        assessment.confidenceScore = roundToOneDecimal(confidenceScore);
        assessment.confidenceLevelText = resolveConfidenceLevelText(assessment.confidenceScore);
        if (assessment.confidenceScore < 60.0 && assessment.recommendable) {
            assessment.degraded = true;
            assessment.decisionState = "DEGRADED";
            if (assessment.decisionMessage == null || assessment.decisionMessage.isEmpty()) {
                assessment.decisionMessage = "该路线数据可信度一般，请结合风险提示谨慎核对。";
            }
        }
        if (!assessment.recommendable && (assessment.decisionMessage == null || assessment.decisionMessage.isEmpty())) {
            assessment.decisionMessage = "关键无障碍数据不足，当前不直接推荐该路线。";
        }
        if (assessment.recommendable && !assessment.degraded) {
            assessment.decisionMessage = "关键无障碍信息相对完整，可作为优先候选路线。";
        }
        assessment.ruleBreakdown = new LinkedHashMap<>();
        assessment.ruleBreakdown.put("confidence", assessment.confidenceScore);
        assessment.ruleBreakdown.put("riskCount", (double) assessment.riskHints.size());
        assessment.ruleBreakdown.put("missingCount", (double) assessment.missingDataHints.size());
        return assessment;
    }

    private String generateRecommendationReason(GongjiaoluxianEntity route,
                                                YonghuEntity userProfile,
                                                String profileType,
                                                String preferenceType,
                                                double accessibilityScore,
                                                RouteAssessment assessment) {
        StringBuilder reason = new StringBuilder();
        reason.append("面向").append(getProfileTypeLabel(profileType)).append("画像，按").append(getPreferenceLabel(preferenceType)).append("进行排序；");
        if (accessibilityScore >= 80) {
            reason.append("当前路线无障碍基础较完整");
        } else if (accessibilityScore >= 60) {
            reason.append("当前路线无障碍基础中等");
        } else {
            reason.append("当前路线无障碍基础较弱");
        }
        if (assessment.degraded) {
            reason.append("，但存在需要进一步核对的风险点");
        }
        if (!assessment.recommendable) {
            reason.append("，关键数据不足，当前不直接推荐");
        }
        if (assessment.segments != null && !assessment.segments.isEmpty()) {
            reason.append("；已按步行、上下车、换乘段输出分段结果");
        }
        return reason.toString();
    }

    private String booleanFeatureText(Integer value, String yesText, String noText) {
        return value != null && value == 1 ? yesText : noText;
    }

    private Map<String, Object> buildProfileMeta(String profileType) {
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("type", profileType);
        meta.put("label", getProfileTypeLabel(profileType));
        return meta;
    }

    private String resolveDataSourceText(GongjiaoluxianEntity route) {
        String detail = route.getLuxianxiangqing() == null ? "" : route.getLuxianxiangqing();
        if (containsKeyword(detail, "OpenStreetMap", "OSRM", "真实数据来源")) {
            return "OpenStreetMap / OSRM 试点线路数据";
        }
        if (containsKeyword(detail, "演示")) {
            return "试点演示数据（H2）";
        }
        return "项目内置线路数据";
    }

    private String resolveDataUpdatedAtText(GongjiaoluxianEntity route) {
        if (route.getAddtime() == null) {
            return "时间未知";
        }
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(route.getAddtime());
    }

    private String resolveConfidenceLevelText(double confidenceScore) {
        if (confidenceScore >= 80) {
            return "高";
        }
        if (confidenceScore >= 60) {
            return "中";
        }
        return "低";
    }

    private boolean containsKeyword(String text, String... keywords) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        for (String keyword : keywords) {
            if (keyword != null && !keyword.isEmpty() && text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private TravelPath resolveTravelPath(GongjiaoluxianEntity route, String startStation, String endStation) {
        List<String> orderedStations = buildOrderedStations(route);
        TravelPath path = new TravelPath();
        if (orderedStations.isEmpty()) {
            path.boardingStationName = route.getQidianzhanming();
            path.alightingStationName = route.getZhongdianzhanming();
            path.travelStationCount = 1;
        } else {
            path.boardingStationName = findBestMatchingStationName(route, startStation, true);
            path.alightingStationName = findBestMatchingStationName(route, endStation, false);
            int boardingIndex = Math.max(0, orderedStations.indexOf(path.boardingStationName));
            int alightingIndex = Math.max(boardingIndex, orderedStations.indexOf(path.alightingStationName));
            path.travelStationCount = Math.max(1, alightingIndex - boardingIndex + 1);
        }
        path.boardingMatchType = resolveMatchType(startStation, path.boardingStationName, orderedStations, true);
        path.alightingMatchType = resolveMatchType(endStation, path.alightingStationName, orderedStations, false);
        path.transferRequired = false;
        if (route.getDiantifacilities() != null && route.getDiantifacilities().contains("换乘")) {
            path.transferRequired = true;
        }
        if (containsKeyword(route.getTujingzhandian(), "地铁", "广场", "文化公园", "海珠广场", "西门口")) {
            path.transferRequired = true;
        }
        return path;
    }

    private List<String> buildOrderedStations(GongjiaoluxianEntity route) {
        List<String> ordered = new ArrayList<>();
        appendStationIfAbsent(ordered, route.getQidianzhanming());
        if (route.getTujingzhandian() != null && !route.getTujingzhandian().trim().isEmpty()) {
            for (String raw : route.getTujingzhandian().split(",")) {
                appendStationIfAbsent(ordered, raw);
            }
        }
        appendStationIfAbsent(ordered, route.getZhongdianzhanming());
        return ordered;
    }

    private void appendStationIfAbsent(List<String> target, String stationName) {
        String safe = stationName == null ? "" : stationName.trim();
        if (!safe.isEmpty() && !target.contains(safe)) {
            target.add(safe);
        }
    }

    private String resolveMatchType(String keyword, String primaryStation, List<String> stations, boolean startSide) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        if (safeKeyword.isEmpty()) {
            return "UNKNOWN";
        }
        if (primaryStation != null && (primaryStation.equalsIgnoreCase(safeKeyword) || primaryStation.contains(safeKeyword) || safeKeyword.contains(primaryStation))) {
            return primaryStation.equalsIgnoreCase(safeKeyword) ? "EXACT" : "FUZZY";
        }
        for (String station : stations) {
            if (station.contains(safeKeyword) || safeKeyword.contains(station)) {
                return station.equalsIgnoreCase(safeKeyword) ? "EXACT" : "FUZZY";
            }
        }
        if (startSide) {
            return "HEURISTIC_START";
        }
        return "HEURISTIC_END";
    }

    private List<Map<String, Object>> buildRouteSegments(GongjiaoluxianEntity route, TravelPath path, String profileType, RouteAssessment assessment) {
        List<Map<String, Object>> segments = new ArrayList<>();
        ZhandianWuzhangaiEntity boardingStation = zhandianWuzhangaiService.getByStationName(path.boardingStationName);
        ZhandianWuzhangaiEntity alightingStation = zhandianWuzhangaiService.getByStationName(path.alightingStationName);

        segments.add(buildWalkSegment("origin_walk", "出发步行段", path.boardingStationName, path.boardingMatchType, profileType, true));
        segments.add(buildStationSegment("boarding_access", "上车站可达性", path.boardingStationName, boardingStation, profileType));
        segments.add(buildRideSegment(route, path, profileType, assessment));
        segments.add(buildTransferSegment(route, path, profileType));
        segments.add(buildStationSegment("alighting_access", "下车站可达性", path.alightingStationName, alightingStation, profileType));
        segments.add(buildWalkSegment("destination_walk", "到达步行段", path.alightingStationName, path.alightingMatchType, profileType, false));
        return segments;
    }

    private Map<String, Object> buildWalkSegment(String type, String title, String stationName, String matchType, String profileType, boolean origin) {
        Map<String, Object> segment = new LinkedHashMap<>();
        segment.put("type", type);
        segment.put("title", title);
        segment.put("stationName", stationName);
        int distanceMeters;
        String status;
        String statusText;
        String description;
        if ("EXACT".equals(matchType)) {
            distanceMeters = 80;
            status = "READY";
            statusText = "短距离可达";
            description = "输入位置与站点匹配较好，预计步行接驳距离较短。";
        } else if ("FUZZY".equals(matchType)) {
            distanceMeters = 220;
            status = "CAUTION";
            statusText = "需核对步行接驳";
            description = "当前按模糊匹配估算步行接驳，建议结合地图核对最后一段路径。";
        } else {
            distanceMeters = 450;
            status = "CAUTION";
            statusText = "步行段信息不足";
            description = origin ? "起点未精确命中站点，当前仅给出启发式步行接驳估算。" : "终点入口级数据不足，当前只给出启发式到达步行段估算。";
        }
        if (PROFILE_WHEELCHAIR.equals(profileType) && distanceMeters > 250) {
            status = "RISK";
            statusText = "步行接驳偏长";
        }
        segment.put("status", status);
        segment.put("statusText", statusText);
        segment.put("estimatedDistanceMeters", distanceMeters);
        segment.put("description", description);
        segment.put("dataSourceText", "启发式步行接驳估算");
        return segment;
    }

    private Map<String, Object> buildStationSegment(String type, String title, String stationName, ZhandianWuzhangaiEntity station, String profileType) {
        Map<String, Object> segment = new LinkedHashMap<>();
        segment.put("type", type);
        segment.put("title", title);
        segment.put("stationName", stationName);
        if (station == null) {
            segment.put("status", "RISK");
            segment.put("statusText", "站点数据不足");
            segment.put("description", "当前缺少该站点的无障碍详情，需要结合现场或后续试点核验。");
            segment.put("dataSourceText", "站点无障碍数据缺失");
            return segment;
        }
        boolean hasLift = station.getShengjiangtai() != null && station.getShengjiangtai() == 1;
        boolean hasBlind = station.getMangdao() != null && station.getMangdao() == 1;
        String status = "READY";
        String statusText = "基础可达";
        if (PROFILE_WHEELCHAIR.equals(profileType) && !hasLift) {
            status = "RISK";
            statusText = "轮椅上落需核对";
        } else if (PROFILE_LOW_VISION.equals(profileType) && !hasBlind) {
            status = "CAUTION";
            statusText = "盲道信息不足";
        }
        segment.put("status", status);
        segment.put("statusText", statusText);
        segment.put("description", "无障碍等级：" + getAccessibilityLevelText(station.getWuzhangaijibie()) + "；升降台/坡道：" + (hasLift ? "有" : "未知/无") + "；盲道：" + (hasBlind ? "有" : "未知/无"));
        segment.put("seatCount", station.getZuoweishu());
        segment.put("accessibleToilet", station.getCesuo());
        segment.put("parking", station.getTingchechang());
        segment.put("dataSourceText", station.getBeizhu() == null ? "站点基础无障碍数据" : station.getBeizhu());
        return segment;
    }

    private Map<String, Object> buildRideSegment(GongjiaoluxianEntity route, TravelPath path, String profileType, RouteAssessment assessment) {
        Map<String, Object> segment = new LinkedHashMap<>();
        segment.put("type", "ride_segment");
        segment.put("title", "公交乘车段");
        segment.put("status", assessment.recommendable ? (assessment.degraded ? "CAUTION" : "READY") : "RISK");
        segment.put("statusText", assessment.recommendable ? (assessment.degraded ? "可乘坐但需谨慎" : "可优先乘坐") : "不建议直接依赖");
        segment.put("stationSpan", path.travelStationCount);
        segment.put("description", "乘坐线路：" + route.getLuxianmingcheng() + "；预计覆盖站数：" + path.travelStationCount + "；语音：" + booleanFeatureText(route.getYuyintongbao(), "支持", "未知/无") + "；盲道：" + booleanFeatureText(route.getMangdaozhichi(), "支持", "未知/无"));
        segment.put("dataSourceText", resolveDataSourceText(route));
        return segment;
    }

    private Map<String, Object> buildTransferSegment(GongjiaoluxianEntity route, TravelPath path, String profileType) {
        Map<String, Object> segment = new LinkedHashMap<>();
        segment.put("type", "transfer_access");
        segment.put("title", "换乘设施评估");
        segment.put("transferRequired", path.transferRequired);
        if (!path.transferRequired) {
            segment.put("status", "READY");
            segment.put("statusText", "当前路线直达");
            segment.put("description", "当前路线在本次推荐中按直达处理，无需额外换乘。");
            segment.put("dataSourceText", "基于当前路线结构判断");
            return segment;
        }
        boolean hasTransferFacility = route.getDiantifacilities() != null && !route.getDiantifacilities().trim().isEmpty();
        segment.put("status", hasTransferFacility ? "CAUTION" : "RISK");
        segment.put("statusText", hasTransferFacility ? "已识别换乘设施" : "换乘设施信息不足");
        segment.put("description", hasTransferFacility ? route.getDiantifacilities() : "当前只识别到潜在换乘节点，但缺少明确电梯/通道/坡道说明。");
        segment.put("dataSourceText", hasTransferFacility ? "路线换乘设施字段" : "潜在换乘节点启发式识别");
        return segment;
    }

    private String findBestMatchingStationName(GongjiaoluxianEntity route, String keyword, boolean startSide) {
        List<String> ordered = buildOrderedStations(route);
        if (ordered.isEmpty()) {
            return startSide ? route.getQidianzhanming() : route.getZhongdianzhanming();
        }
        String safeKeyword = keyword == null ? "" : keyword.trim();
        if (safeKeyword.isEmpty()) {
            return startSide ? ordered.get(0) : ordered.get(ordered.size() - 1);
        }
        if (startSide) {
            for (String station : ordered) {
                if (station.contains(safeKeyword) || safeKeyword.contains(station)) {
                    return station;
                }
            }
            return ordered.get(0);
        }
        for (int i = ordered.size() - 1; i >= 0; i--) {
            String station = ordered.get(i);
            if (station.contains(safeKeyword) || safeKeyword.contains(station)) {
                return station;
            }
        }
        return ordered.get(ordered.size() - 1);
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
        for (String item : scoreRulePipeline.split(",")) {
            String key = item == null ? "" : item.trim();
            if (!key.isEmpty() && valid.contains(key) && !pipeline.contains(key)) {
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

    private String resolveDecisionStateText(String decisionState) {
        if ("REJECTED".equals(decisionState)) {
            return "不直接推荐";
        }
        if ("DEGRADED".equals(decisionState)) {
            return "谨慎核对";
        }
        return "可优先查看";
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

    private static class RouteAssessment {
        private boolean recommendable;
        private boolean degraded;
        private double confidenceScore;
        private String confidenceLevelText;
        private String decisionState;
        private String decisionMessage;
        private List<String> riskHints;
        private List<String> missingDataHints;
        private Map<String, Double> ruleBreakdown;
        private List<Map<String, Object>> segments;
    }

    private static class TravelPath {
        private String boardingStationName;
        private String alightingStationName;
        private int travelStationCount;
        private boolean transferRequired;
        private String boardingMatchType;
        private String alightingMatchType;
    }
}
