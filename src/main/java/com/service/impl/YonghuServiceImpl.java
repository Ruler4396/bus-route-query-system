package com.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.dao.YonghuDao;
import com.entity.YonghuEntity;
import com.entity.vo.YonghuVO;
import com.entity.view.YonghuView;
import com.service.YonghuService;
import com.utils.PageUtils;
import com.utils.Query;

/**
 * 用户服务实现
 */
@Service
public class YonghuServiceImpl extends ServiceImpl<YonghuDao, YonghuEntity> implements YonghuService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<YonghuEntity> page = this.selectPage(new Query<YonghuEntity>(params).getPage());
        return new PageUtils(page);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<YonghuEntity> wrapper) {
        Page<YonghuEntity> page = this.selectPage(new Query<YonghuEntity>(params).getPage(), wrapper);
        return new PageUtils(page);
    }

    @Override
    public List<YonghuVO> selectListVO(Wrapper<YonghuEntity> wrapper) {
        return baseMapper.selectListVO(wrapper);
    }

    @Override
    public YonghuVO selectVO(Wrapper<YonghuEntity> wrapper) {
        return baseMapper.selectVO(wrapper);
    }

    @Override
    public List<YonghuView> selectListView(Wrapper<YonghuEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public YonghuView selectView(Wrapper<YonghuEntity> wrapper) {
        return baseMapper.selectView(wrapper);
    }
}
