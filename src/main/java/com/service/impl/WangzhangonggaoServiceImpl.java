package com.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.dao.WangzhangonggaoDao;
import com.entity.WangzhangonggaoEntity;
import com.entity.vo.WangzhangonggaoVO;
import com.entity.view.WangzhangonggaoView;
import com.service.WangzhangonggaoService;
import com.utils.PageUtils;
import com.utils.Query;

/**
 * 网站公告服务实现
 */
@Service
public class WangzhangonggaoServiceImpl extends ServiceImpl<WangzhangonggaoDao, WangzhangonggaoEntity> implements WangzhangonggaoService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<WangzhangonggaoEntity> page = this.selectPage(new Query<WangzhangonggaoEntity>(params).getPage());
        return new PageUtils(page);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<WangzhangonggaoEntity> wrapper) {
        Page<WangzhangonggaoEntity> page = this.selectPage(new Query<WangzhangonggaoEntity>(params).getPage(), wrapper);
        return new PageUtils(page);
    }

    @Override
    public List<WangzhangonggaoVO> selectListVO(Wrapper<WangzhangonggaoEntity> wrapper) {
        return baseMapper.selectListVO(wrapper);
    }

    @Override
    public WangzhangonggaoVO selectVO(Wrapper<WangzhangonggaoEntity> wrapper) {
        return baseMapper.selectVO(wrapper);
    }

    @Override
    public List<WangzhangonggaoView> selectListView(Wrapper<WangzhangonggaoEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public WangzhangonggaoView selectView(Wrapper<WangzhangonggaoEntity> wrapper) {
        return baseMapper.selectView(wrapper);
    }
}
