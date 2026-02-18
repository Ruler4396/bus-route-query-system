package com.dao;

import com.entity.ZhandianWuzhangaiEntity;
import com.entity.vo.ZhandianWuzhangaiVO;
import com.entity.view.ZhandianWuzhangaiView;
import com.baomidou.mybatisplus.mapper.BaseMapper;
import java.util.List;
import org.apache.ibatis.annotations.Param;
import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.pagination.Pagination;


public interface ZhandianWuzhangaiDao extends BaseMapper<ZhandianWuzhangaiEntity> {

	List<ZhandianWuzhangaiVO> selectListVO(@Param("ew") Wrapper<ZhandianWuzhangaiEntity> wrapper);

	ZhandianWuzhangaiVO selectVO(@Param("ew") Wrapper<ZhandianWuzhangaiEntity> wrapper);

	List<ZhandianWuzhangaiView> selectListView(@Param("ew") Wrapper<ZhandianWuzhangaiEntity> wrapper);

	ZhandianWuzhangaiView selectView(@Param("ew") Wrapper<ZhandianWuzhangaiEntity> wrapper);

	List<ZhandianWuzhangaiView> selectListView(Pagination page, @Param("ew") Wrapper<ZhandianWuzhangaiEntity> wrapper);

	/**
	 * 根据站点名称查询无障碍信息
	 */
	ZhandianWuzhangaiEntity selectByStationName(@Param("zhandianming") String zhandianming);

}
