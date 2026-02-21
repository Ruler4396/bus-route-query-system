package com.service;

import com.entity.GongjiaoluxianEntity;
import com.entity.YonghuEntity;
import java.util.Map;
import java.util.List;

/**
 * 无障碍路线规划服务
 * 实现融合无障碍权重的路线规划算法
 */
public interface RoutePlanningService {

    /**
     * 路线规划结果类
     */
    class RouteResult {
        private GongjiaoluxianEntity route;
        private double accessibilityScore;  // 无障碍评分
        private double totalScore;          // 综合评分
        private String recommendationReason; // 推荐理由
        private String accessibilityLevelText; // 无障碍等级文本
        private String voiceAnnounceText;      // 语音播报支持文本
        private String blindPathSupportText;   // 盲道支持文本
        private String guideDogSupportText;    // 导盲犬支持文本

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
    }

    /**
     * 无障碍路线规划
     * @param startStation 起点站名
     * @param endStation 终点站名
     * @param userId 用户ID（可选，用于获取用户档案）
     * @param preferenceType 偏好类型：AUTO(智能推荐)/DISTANCE(最短距离)/TIME(最短时间)/ACCESSIBLE(无障碍最优)
     * @return 排序后的路线列表
     */
    List<RouteResult> planAccessibleRoute(String startStation, String endStation, Long userId, String preferenceType);

    /**
     * 根据用户障碍档案确定最佳排序策略
     * @param userProfile 用户档案
     * @return 策略类型
     */
    String determineBestStrategy(YonghuEntity userProfile);

    /**
     * 计算路线的无障碍评分
     * @param route 公交路线
     * @param userProfile 用户档案（可选）
     * @return 评分(0-100)
     */
    double calculateAccessibilityScore(GongjiaoluxianEntity route, YonghuEntity userProfile);

    /**
     * 获取路线无障碍级别的文本描述
     * @param level 级别代码
     * @return 文本描述
     */
    String getAccessibilityLevelText(Integer level);

    /**
     * 获取所有可行路线
     * @param startStation 起点站
     * @param endStation 终点站
     * @return 路线列表
     */
    List<GongjiaoluxianEntity> getAllPossibleRoutes(String startStation, String endStation);

    /**
     * 获取当前评分规则引擎配置元数据
     * @return 规则引擎信息（规则管线、权重等）
     */
    Map<String, Object> getRuleEngineMeta();
}
