package com.service.impl;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.List;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.utils.PageUtils;
import com.utils.Query;


import com.dao.ZhandianWuzhangaiDao;
import com.entity.ZhandianWuzhangaiEntity;
import com.service.ZhandianWuzhangaiService;
import com.entity.vo.ZhandianWuzhangaiVO;
import com.entity.view.ZhandianWuzhangaiView;


@Service("zhandianWuzhangaiService")
public class ZhandianWuzhangaiServiceImpl extends ServiceImpl<ZhandianWuzhangaiDao, ZhandianWuzhangaiEntity> implements ZhandianWuzhangaiService {


    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<ZhandianWuzhangaiEntity> page = this.selectPage(
                new Query<ZhandianWuzhangaiEntity>(params).getPage(),
                new EntityWrapper<ZhandianWuzhangaiEntity>()
        );
        return new PageUtils(page);
    }

    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<ZhandianWuzhangaiEntity> wrapper) {
		Page<ZhandianWuzhangaiView> page =new Query<ZhandianWuzhangaiView>(params).getPage();
		page.setRecords(baseMapper.selectListView(page,wrapper));
		PageUtils pageUtil = new PageUtils(page);
		return pageUtil;
	}

    @Override
    public List<ZhandianWuzhangaiVO> selectListVO(Wrapper<ZhandianWuzhangaiEntity> wrapper) {
        return baseMapper.selectListVO(wrapper);
    }

    @Override
    public ZhandianWuzhangaiVO selectVO(Wrapper<ZhandianWuzhangaiEntity> wrapper) {
        return baseMapper.selectVO(wrapper);
    }

    @Override
    public List<ZhandianWuzhangaiView> selectListView(Wrapper<ZhandianWuzhangaiEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public ZhandianWuzhangaiView selectView(Wrapper<ZhandianWuzhangaiEntity> wrapper) {
        return baseMapper.selectView(wrapper);
    }

    @Override
    public ZhandianWuzhangaiEntity getByStationName(String zhandianming) {
        return baseMapper.selectByStationName(zhandianming);
    }

}
