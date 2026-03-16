package com.service;

import com.entity.GongjiaoluxianEntity;

import java.util.List;

/**
 * 路线候选查询服务
 */
public interface RouteCandidateQueryService {

    List<GongjiaoluxianEntity> getAllPossibleRoutes(String startStation, String endStation);
}
