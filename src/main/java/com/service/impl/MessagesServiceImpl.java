package com.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.dao.MessagesDao;
import com.entity.MessagesEntity;
import com.entity.vo.MessagesVO;
import com.entity.view.MessagesView;
import com.service.MessagesService;
import com.utils.PageUtils;
import com.utils.Query;

/**
 * 留言建议服务实现
 */
@Service
public class MessagesServiceImpl extends ServiceImpl<MessagesDao, MessagesEntity> implements MessagesService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<MessagesEntity> page = this.selectPage(new Query<MessagesEntity>(params).getPage());
        return new PageUtils(page);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<MessagesEntity> wrapper) {
        Page<MessagesEntity> page = this.selectPage(new Query<MessagesEntity>(params).getPage(), wrapper);
        return new PageUtils(page);
    }

    @Override
    public List<MessagesVO> selectListVO(Wrapper<MessagesEntity> wrapper) {
        return baseMapper.selectListVO(wrapper);
    }

    @Override
    public MessagesVO selectVO(Wrapper<MessagesEntity> wrapper) {
        return baseMapper.selectVO(wrapper);
    }

    @Override
    public List<MessagesView> selectListView(Wrapper<MessagesEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public MessagesView selectView(Wrapper<MessagesEntity> wrapper) {
        return baseMapper.selectView(wrapper);
    }
}
