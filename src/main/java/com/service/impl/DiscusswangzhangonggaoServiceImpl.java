package com.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.dao.DiscusswangzhangonggaoDao;
import com.entity.DiscusswangzhangonggaoEntity;
import com.entity.vo.DiscusswangzhangonggaoVO;
import com.entity.view.DiscusswangzhangonggaoView;
import com.service.DiscusswangzhangonggaoService;
import com.utils.PageUtils;
import com.utils.Query;

/**
 * 网站公告评论表服务实现
 */
@Service
public class DiscusswangzhangonggaoServiceImpl extends ServiceImpl<DiscusswangzhangonggaoDao, DiscusswangzhangonggaoEntity> implements DiscusswangzhangonggaoService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<DiscusswangzhangonggaoEntity> page = this.selectPage(new Query<DiscusswangzhangonggaoEntity>(params).getPage());
        return new PageUtils(page);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<DiscusswangzhangonggaoEntity> wrapper) {
        Page<DiscusswangzhangonggaoEntity> page = this.selectPage(new Query<DiscusswangzhangonggaoEntity>(params).getPage(), wrapper);
        return new PageUtils(page);
    }

    @Override
    public List<DiscusswangzhangonggaoVO> selectListVO(Wrapper<DiscusswangzhangonggaoEntity> wrapper) {
        return baseMapper.selectListVO(wrapper);
    }

    @Override
    public DiscusswangzhangonggaoVO selectVO(Wrapper<DiscusswangzhangonggaoEntity> wrapper) {
        return baseMapper.selectVO(wrapper);
    }

    @Override
    public List<DiscusswangzhangonggaoView> selectListView(Wrapper<DiscusswangzhangonggaoEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public DiscusswangzhangonggaoView selectView(Wrapper<DiscusswangzhangonggaoEntity> wrapper) {
        return baseMapper.selectView(wrapper);
    }
}
