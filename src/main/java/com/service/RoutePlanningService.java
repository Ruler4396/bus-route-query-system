package com.service;

import com.entity.GongjiaoluxianEntity;
import com.entity.YonghuEntity;

import java.util.List;
import java.util.Map;

/**
 * 无障碍路线规划服务
 */
public interface RoutePlanningService {

    class RouteResult {
        private GongjiaoluxianEntity route;
        private double accessibilityScore;
        private double totalScore;
        private String recommendationReason;
        private String accessibilityLevelText;
        private String voiceAnnounceText;
        private String blindPathSupportText;
        private String guideDogSupportText;
        private String resolvedProfileType;
        private String resolvedProfileLabel;
        private String resolvedPreferenceType;
        private String resolvedPreferenceLabel;
        private double confidenceScore;
        private String confidenceLevelText;
        private String dataSourceText;
        private String dataUpdatedAtText;
        private List<String> riskHints;
        private List<String> missingDataHints;
        private boolean recommendable;
        private String decisionState;
        private String decisionStateText;
        private String decisionMessage;
        private Map<String, Double> ruleBreakdown;
        private List<Map<String, Object>> segments;
        private String boardingStationName;
        private String alightingStationName;
        private int travelStationCount;
        private boolean transferRequired;

        public GongjiaoluxianEntity getRoute() {
            return route;
        }

        public void setRoute(GongjiaoluxianEntity route) {
            this.route = route;
        }

        public double getAccessibilityScore() {
            return accessibilityScore;
        }

        public void setAccessibilityScore(double accessibilityScore) {
            this.accessibilityScore = accessibilityScore;
        }

        public double getTotalScore() {
            return totalScore;
        }

        public void setTotalScore(double totalScore) {
            this.totalScore = totalScore;
        }

        public String getRecommendationReason() {
            return recommendationReason;
        }

        public void setRecommendationReason(String recommendationReason) {
            this.recommendationReason = recommendationReason;
        }

        public String getAccessibilityLevelText() {
            return accessibilityLevelText;
        }

        public void setAccessibilityLevelText(String accessibilityLevelText) {
            this.accessibilityLevelText = accessibilityLevelText;
        }

        public String getVoiceAnnounceText() {
            return voiceAnnounceText;
        }

        public void setVoiceAnnounceText(String voiceAnnounceText) {
            this.voiceAnnounceText = voiceAnnounceText;
        }

        public String getBlindPathSupportText() {
            return blindPathSupportText;
        }

        public void setBlindPathSupportText(String blindPathSupportText) {
            this.blindPathSupportText = blindPathSupportText;
        }

        public String getGuideDogSupportText() {
            return guideDogSupportText;
        }

        public void setGuideDogSupportText(String guideDogSupportText) {
            this.guideDogSupportText = guideDogSupportText;
        }

        public String getResolvedProfileType() {
            return resolvedProfileType;
        }

        public void setResolvedProfileType(String resolvedProfileType) {
            this.resolvedProfileType = resolvedProfileType;
        }

        public String getResolvedProfileLabel() {
            return resolvedProfileLabel;
        }

        public void setResolvedProfileLabel(String resolvedProfileLabel) {
            this.resolvedProfileLabel = resolvedProfileLabel;
        }

        public String getResolvedPreferenceType() {
            return resolvedPreferenceType;
        }

        public void setResolvedPreferenceType(String resolvedPreferenceType) {
            this.resolvedPreferenceType = resolvedPreferenceType;
        }

        public String getResolvedPreferenceLabel() {
            return resolvedPreferenceLabel;
        }

        public void setResolvedPreferenceLabel(String resolvedPreferenceLabel) {
            this.resolvedPreferenceLabel = resolvedPreferenceLabel;
        }

        public double getConfidenceScore() {
            return confidenceScore;
        }

        public void setConfidenceScore(double confidenceScore) {
            this.confidenceScore = confidenceScore;
        }

        public String getConfidenceLevelText() {
            return confidenceLevelText;
        }

        public void setConfidenceLevelText(String confidenceLevelText) {
            this.confidenceLevelText = confidenceLevelText;
        }

        public String getDataSourceText() {
            return dataSourceText;
        }

        public void setDataSourceText(String dataSourceText) {
            this.dataSourceText = dataSourceText;
        }

        public String getDataUpdatedAtText() {
            return dataUpdatedAtText;
        }

        public void setDataUpdatedAtText(String dataUpdatedAtText) {
            this.dataUpdatedAtText = dataUpdatedAtText;
        }

        public List<String> getRiskHints() {
            return riskHints;
        }

        public void setRiskHints(List<String> riskHints) {
            this.riskHints = riskHints;
        }

        public List<String> getMissingDataHints() {
            return missingDataHints;
        }

        public void setMissingDataHints(List<String> missingDataHints) {
            this.missingDataHints = missingDataHints;
        }

        public boolean isRecommendable() {
            return recommendable;
        }

        public void setRecommendable(boolean recommendable) {
            this.recommendable = recommendable;
        }

        public String getDecisionState() {
            return decisionState;
        }

        public void setDecisionState(String decisionState) {
            this.decisionState = decisionState;
        }

        public String getDecisionStateText() {
            return decisionStateText;
        }

        public void setDecisionStateText(String decisionStateText) {
            this.decisionStateText = decisionStateText;
        }

        public String getDecisionMessage() {
            return decisionMessage;
        }

        public void setDecisionMessage(String decisionMessage) {
            this.decisionMessage = decisionMessage;
        }

        public Map<String, Double> getRuleBreakdown() {
            return ruleBreakdown;
        }

        public void setRuleBreakdown(Map<String, Double> ruleBreakdown) {
            this.ruleBreakdown = ruleBreakdown;
        }

        public List<Map<String, Object>> getSegments() {
            return segments;
        }

        public void setSegments(List<Map<String, Object>> segments) {
            this.segments = segments;
        }

        public String getBoardingStationName() {
            return boardingStationName;
        }

        public void setBoardingStationName(String boardingStationName) {
            this.boardingStationName = boardingStationName;
        }

        public String getAlightingStationName() {
            return alightingStationName;
        }

        public void setAlightingStationName(String alightingStationName) {
            this.alightingStationName = alightingStationName;
        }

        public int getTravelStationCount() {
            return travelStationCount;
        }

        public void setTravelStationCount(int travelStationCount) {
            this.travelStationCount = travelStationCount;
        }

        public boolean isTransferRequired() {
            return transferRequired;
        }

        public void setTransferRequired(boolean transferRequired) {
            this.transferRequired = transferRequired;
        }
    }

    default List<RouteResult> planAccessibleRoute(String startStation, String endStation, Long userId, String preferenceType) {
        return planAccessibleRoute(startStation, endStation, userId, preferenceType, "AUTO");
    }

    List<RouteResult> planAccessibleRoute(String startStation, String endStation, Long userId, String preferenceType, String profileType);

    String determineBestStrategy(YonghuEntity userProfile);

    double calculateAccessibilityScore(GongjiaoluxianEntity route, YonghuEntity userProfile);

    String getAccessibilityLevelText(Integer level);

    List<GongjiaoluxianEntity> getAllPossibleRoutes(String startStation, String endStation);

    Map<String, Object> getRuleEngineMeta();

    String getProfileTypeLabel(String profileType);

    String normalizeProfileType(String profileType);

    String getPreferenceLabel(String preferenceType);
}
