package com.service;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.service.IService;
import com.utils.PageUtils;
import com.entity.ZhandianWuzhangaiEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.ZhandianWuzhangaiVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.ZhandianWuzhangaiView;


/**
 * 站点无障碍信息
 *
 * @author
 * @email
 * @date 2022-04-04 22:19:36
 */
public interface ZhandianWuzhangaiService extends IService<ZhandianWuzhangaiEntity> {

    PageUtils queryPage(Map<String, Object> params);

    	List<ZhandianWuzhangaiVO> selectListVO(Wrapper<ZhandianWuzhangaiEntity> wrapper);

    	ZhandianWuzhangaiVO selectVO(@Param("ew") Wrapper<ZhandianWuzhangaiEntity> wrapper);

    	List<ZhandianWuzhangaiView> selectListView(Wrapper<ZhandianWuzhangaiEntity> wrapper);

    	ZhandianWuzhangaiView selectView(@Param("ew") Wrapper<ZhandianWuzhangaiEntity> wrapper);

    	PageUtils queryPage(Map<String, Object> params,Wrapper<ZhandianWuzhangaiEntity> wrapper);

    /**
     * 根据站点名称查询无障碍信息
     */
    ZhandianWuzhangaiEntity getByStationName(String zhandianming);
}
