package com.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.dao.ChatDao;
import com.entity.ChatEntity;
import com.entity.vo.ChatVO;
import com.entity.view.ChatView;
import com.service.ChatService;
import com.utils.PageUtils;
import com.utils.Query;

/**
 * 在线提问服务实现
 */
@Service
public class ChatServiceImpl extends ServiceImpl<ChatDao, ChatEntity> implements ChatService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<ChatEntity> page = this.selectPage(new Query<ChatEntity>(params).getPage());
        return new PageUtils(page);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<ChatEntity> wrapper) {
        Page<ChatEntity> page = this.selectPage(new Query<ChatEntity>(params).getPage(), wrapper);
        return new PageUtils(page);
    }

    @Override
    public List<ChatVO> selectListVO(Wrapper<ChatEntity> wrapper) {
        return baseMapper.selectListVO(wrapper);
    }

    @Override
    public ChatVO selectVO(Wrapper<ChatEntity> wrapper) {
        return baseMapper.selectVO(wrapper);
    }

    @Override
    public List<ChatView> selectListView(Wrapper<ChatEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public ChatView selectView(Wrapper<ChatEntity> wrapper) {
        return baseMapper.selectView(wrapper);
    }
}
