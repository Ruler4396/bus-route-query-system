package com.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.dao.DiscussgongjiaoluxianDao;
import com.entity.DiscussgongjiaoluxianEntity;
import com.entity.vo.DiscussgongjiaoluxianVO;
import com.entity.view.DiscussgongjiaoluxianView;
import com.service.DiscussgongjiaoluxianService;
import com.utils.PageUtils;
import com.utils.Query;

/**
 * 公交路线评论表服务实现
 */
@Service
public class DiscussgongjiaoluxianServiceImpl extends ServiceImpl<DiscussgongjiaoluxianDao, DiscussgongjiaoluxianEntity> implements DiscussgongjiaoluxianService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<DiscussgongjiaoluxianEntity> page = this.selectPage(new Query<DiscussgongjiaoluxianEntity>(params).getPage());
        return new PageUtils(page);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<DiscussgongjiaoluxianEntity> wrapper) {
        Page<DiscussgongjiaoluxianEntity> page = this.selectPage(new Query<DiscussgongjiaoluxianEntity>(params).getPage(), wrapper);
        return new PageUtils(page);
    }

    @Override
    public List<DiscussgongjiaoluxianVO> selectListVO(Wrapper<DiscussgongjiaoluxianEntity> wrapper) {
        return baseMapper.selectListVO(wrapper);
    }

    @Override
    public DiscussgongjiaoluxianVO selectVO(Wrapper<DiscussgongjiaoluxianEntity> wrapper) {
        return baseMapper.selectVO(wrapper);
    }

    @Override
    public List<DiscussgongjiaoluxianView> selectListView(Wrapper<DiscussgongjiaoluxianEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public DiscussgongjiaoluxianView selectView(Wrapper<DiscussgongjiaoluxianEntity> wrapper) {
        return baseMapper.selectView(wrapper);
    }
}
