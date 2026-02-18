package com.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Date;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

import com.utils.ValidatorUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.BeanUtils;

import com.annotation.IgnoreAuth;
import com.annotation.LoginUser;

import com.entity.ZhandianWuzhangaiEntity;
import com.entity.view.ZhandianWuzhangaiView;

import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.service.ZhandianWuzhangaiService;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;


/**
 * 站点无障碍信息
 * 后端接口
 * @author
 * @email
 * @date 2022-04-04 22:19:36
 */
@RestController
@RequestMapping("/zhandianwuzhangai")
public class ZhandianWuzhangaiController {
    @Autowired
    private ZhandianWuzhangaiService zhandianWuzhangaiService;


    /**
     * 后端列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params){
        PageUtils page = zhandianWuzhangaiService.queryPage(params);
        return R.ok().put("data", page);
    }

    /**
     * 前端列表
     */
    @IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params){
        PageUtils page = zhandianWuzhangaiService.queryPage(params);
        return R.ok().put("data", page);
    }

    /**
     * 根据站点名称查询无障碍信息
     */
    @IgnoreAuth
    @RequestMapping("/infoByName")
    public R infoByName(@RequestParam String zhandianming){
        ZhandianWuzhangaiEntity zhandianWuzhangai = zhandianWuzhangaiService.getByStationName(zhandianming);
        return R.ok().put("data", zhandianWuzhangai);
    }

	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( ZhandianWuzhangaiEntity zhandianWuzhangai){
       	EntityWrapper<ZhandianWuzhangaiEntity> ew = new EntityWrapper<ZhandianWuzhangaiEntity>();
      	ew.allEq(MPUtil.allEQMapPre( zhandianWuzhangai, "zhandianWuzhangai"));
        return R.ok().put("data", zhandianWuzhangaiService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(ZhandianWuzhangaiEntity zhandianWuzhangai){
        EntityWrapper< ZhandianWuzhangaiEntity> ew = new EntityWrapper< ZhandianWuzhangaiEntity>();
 		ew.allEq(MPUtil.allEQMapPre( zhandianWuzhangai, "zhandianWuzhangai"));
		ZhandianWuzhangaiView zhandianWuzhangaiView =  zhandianWuzhangaiService.selectView(ew);
		return R.ok("查询站点无障碍信息成功").put("data", zhandianWuzhangaiView);
    }

    /**
     * 后端详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        ZhandianWuzhangaiEntity zhandianWuzhangai = zhandianWuzhangaiService.selectById(id);
        return R.ok().put("data", zhandianWuzhangai);
    }

    /**
     * 前端详情
     */
    @IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        ZhandianWuzhangaiEntity zhandianWuzhangai = zhandianWuzhangaiService.selectById(id);
        return R.ok().put("data", zhandianWuzhangai);
    }


    /**
     * 后端保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody ZhandianWuzhangaiEntity zhandianWuzhangai, HttpServletRequest request){
        zhandianWuzhangai.setId(new Date().getTime()+new Double(Math.floor(Math.random()*1000)).longValue());
        zhandianWuzhangaiService.insert(zhandianWuzhangai);
        return R.ok();
    }

    /**
     * 前端保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody ZhandianWuzhangaiEntity zhandianWuzhangai, HttpServletRequest request){
        zhandianWuzhangai.setId(new Date().getTime()+new Double(Math.floor(Math.random()*1000)).longValue());
        zhandianWuzhangaiService.insert(zhandianWuzhangai);
        return R.ok();
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    public R update(@RequestBody ZhandianWuzhangaiEntity zhandianWuzhangai, HttpServletRequest request){
        zhandianWuzhangaiService.updateById(zhandianWuzhangai);
        return R.ok();
    }

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        zhandianWuzhangaiService.deleteBatchIds(Arrays.asList(ids));
        return R.ok();
    }

}
