package com.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.dao.YouqinglianjieDao;
import com.entity.YouqinglianjieEntity;
import com.entity.vo.YouqinglianjieVO;
import com.entity.view.YouqinglianjieView;
import com.service.YouqinglianjieService;
import com.utils.PageUtils;
import com.utils.Query;

/**
 * 友情链接服务实现
 */
@Service
public class YouqinglianjieServiceImpl extends ServiceImpl<YouqinglianjieDao, YouqinglianjieEntity> implements YouqinglianjieService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<YouqinglianjieEntity> page = this.selectPage(new Query<YouqinglianjieEntity>(params).getPage());
        return new PageUtils(page);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<YouqinglianjieEntity> wrapper) {
        Page<YouqinglianjieEntity> page = this.selectPage(new Query<YouqinglianjieEntity>(params).getPage(), wrapper);
        return new PageUtils(page);
    }

    @Override
    public List<YouqinglianjieVO> selectListVO(Wrapper<YouqinglianjieEntity> wrapper) {
        return baseMapper.selectListVO(wrapper);
    }

    @Override
    public YouqinglianjieVO selectVO(Wrapper<YouqinglianjieEntity> wrapper) {
        return baseMapper.selectVO(wrapper);
    }

    @Override
    public List<YouqinglianjieView> selectListView(Wrapper<YouqinglianjieEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public YouqinglianjieView selectView(Wrapper<YouqinglianjieEntity> wrapper) {
        return baseMapper.selectView(wrapper);
    }
}
