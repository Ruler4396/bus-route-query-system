package com.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.dao.GongjiaoluxianDao;
import com.entity.GongjiaoluxianEntity;
import com.entity.vo.GongjiaoluxianVO;
import com.entity.view.GongjiaoluxianView;
import com.service.GongjiaoluxianService;
import com.utils.PageUtils;
import com.utils.Query;

/**
 * 公交路线服务实现
 */
@Service
public class GongjiaoluxianServiceImpl extends ServiceImpl<GongjiaoluxianDao, GongjiaoluxianEntity> implements GongjiaoluxianService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<GongjiaoluxianEntity> page = this.selectPage(new Query<GongjiaoluxianEntity>(params).getPage());
        return new PageUtils(page);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<GongjiaoluxianEntity> wrapper) {
        Page<GongjiaoluxianEntity> page = this.selectPage(new Query<GongjiaoluxianEntity>(params).getPage(), wrapper);
        return new PageUtils(page);
    }

    @Override
    public List<GongjiaoluxianVO> selectListVO(Wrapper<GongjiaoluxianEntity> wrapper) {
        return baseMapper.selectListVO(wrapper);
    }

    @Override
    public GongjiaoluxianVO selectVO(Wrapper<GongjiaoluxianEntity> wrapper) {
        return baseMapper.selectVO(wrapper);
    }

    @Override
    public List<GongjiaoluxianView> selectListView(Wrapper<GongjiaoluxianEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public GongjiaoluxianView selectView(Wrapper<GongjiaoluxianEntity> wrapper) {
        return baseMapper.selectView(wrapper);
    }
}
