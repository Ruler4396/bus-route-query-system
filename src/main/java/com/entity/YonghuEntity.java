package com.entity;

import com.baomidou.mybatisplus.annotations.TableId;
import com.baomidou.mybatisplus.annotations.TableName;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.lang.reflect.InvocationTargetException;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.apache.commons.beanutils.BeanUtils;
import com.baomidou.mybatisplus.annotations.TableField;
import com.baomidou.mybatisplus.enums.FieldFill;
import com.baomidou.mybatisplus.enums.IdType;


/**
 * 用户
 * 数据库通用操作实体类（普通增删改查）
 * @author 
 * @email 
 * @date 2022-04-04 22:19:36
 */
@TableName("yonghu")
public class YonghuEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public YonghuEntity() {
		
	}
	
	public YonghuEntity(T t) {
		try {
			BeanUtils.copyProperties(this, t);
		} catch (IllegalAccessException | InvocationTargetException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/**
	 * 主键id
	 */
	@TableId
	private Long id;
	/**
	 * 账号
	 */
					
	private String zhanghao;
	
	/**
	 * 密码
	 */
					
	private String mima;
	
	/**
	 * 姓名
	 */
					
	private String xingming;
	
	/**
	 * 年龄
	 */
					
	private Integer nianling;
	
	/**
	 * 性别
	 */
					
	private String xingbie;
	
	/**
	 * 手机
	 */
					
	private String shouji;
	
	/**
	 * 照片
	 */
					
	private String zhaopian;

	/**
	 * 用户障碍级别(0-无,1-视障,2-听障,3-肢障,4-多重障碍)
	 */

	private Integer zhangaijibie;

	/**
	 * 障碍具体情况说明
	 */

	private String zhangaijutiqingkuang;

	/**
	 * 辅助工具(轮椅,拐杖,导盲犬等)
	 */

	private String fuzhugongju;

	/**
	 * 是否启用语音播报(0-否,1-是)
	 */

	private Integer yuyinbofang;

	/**
	 * 是否启用高对比度(0-否,1-是)
	 */

	private Integer gaoduibidu;

	/**
	 * 字体大小(px)
	 */

	private Integer zitidaxiao;

	/**
	 * 是否启用键盘导航(0-否,1-是)
	 */

	private Integer jianpandaohang;

	/**
	 * 是否启用触觉反馈(0-否,1-是)
	 */

	private Integer hapticfeedback;

	/**
	 * 优先路线类型(AUTO-智能推荐,DISTANCE-最短距离,TIME-最短时间,ACCESSIBLE-无障碍最优)
	 */

	private String preferenceRouteType;


	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat
	private Date addtime;

	public Date getAddtime() {
		return addtime;
	}
	public void setAddtime(Date addtime) {
		this.addtime = addtime;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	/**
	 * 设置：账号
	 */
	public void setZhanghao(String zhanghao) {
		this.zhanghao = zhanghao;
	}
	/**
	 * 获取：账号
	 */
	public String getZhanghao() {
		return zhanghao;
	}
	/**
	 * 设置：密码
	 */
	public void setMima(String mima) {
		this.mima = mima;
	}
	/**
	 * 获取：密码
	 */
	public String getMima() {
		return mima;
	}
	/**
	 * 设置：姓名
	 */
	public void setXingming(String xingming) {
		this.xingming = xingming;
	}
	/**
	 * 获取：姓名
	 */
	public String getXingming() {
		return xingming;
	}
	/**
	 * 设置：年龄
	 */
	public void setNianling(Integer nianling) {
		this.nianling = nianling;
	}
	/**
	 * 获取：年龄
	 */
	public Integer getNianling() {
		return nianling;
	}
	/**
	 * 设置：性别
	 */
	public void setXingbie(String xingbie) {
		this.xingbie = xingbie;
	}
	/**
	 * 获取：性别
	 */
	public String getXingbie() {
		return xingbie;
	}
	/**
	 * 设置：手机
	 */
	public void setShouji(String shouji) {
		this.shouji = shouji;
	}
	/**
	 * 获取：手机
	 */
	public String getShouji() {
		return shouji;
	}
	/**
	 * 设置：照片
	 */
	public void setZhaopian(String zhaopian) {
		this.zhaopian = zhaopian;
	}
	/**
	 * 获取：照片
	 */
	public String getZhaopian() {
		return zhaopian;
	}
	/**
	 * 设置：障碍级别
	 */
	public void setZhangaijibie(Integer zhangaijibie) {
		this.zhangaijibie = zhangaijibie;
	}
	/**
	 * 获取：障碍级别
	 */
	public Integer getZhangaijibie() {
		return zhangaijibie;
	}
	/**
	 * 设置：障碍具体情况
	 */
	public void setZhangaijutiqingkuang(String zhangaijutiqingkuang) {
		this.zhangaijutiqingkuang = zhangaijutiqingkuang;
	}
	/**
	 * 获取：障碍具体情况
	 */
	public String getZhangaijutiqingkuang() {
		return zhangaijutiqingkuang;
	}
	/**
	 * 设置：辅助工具
	 */
	public void setFuzhugongju(String fuzhugongju) {
		this.fuzhugongju = fuzhugongju;
	}
	/**
	 * 获取：辅助工具
	 */
	public String getFuzhugongju() {
		return fuzhugongju;
	}
	/**
	 * 设置：语音播报
	 */
	public void setYuyinbofang(Integer yuyinbofang) {
		this.yuyinbofang = yuyinbofang;
	}
	/**
	 * 获取：语音播报
	 */
	public Integer getYuyinbofang() {
		return yuyinbofang;
	}
	/**
	 * 设置：高对比度
	 */
	public void setGaoduibidu(Integer gaoduibidu) {
		this.gaoduibidu = gaoduibidu;
	}
	/**
	 * 获取：高对比度
	 */
	public Integer getGaoduibidu() {
		return gaoduibidu;
	}
	/**
	 * 设置：字体大小
	 */
	public void setZitidaxiao(Integer zitidaxiao) {
		this.zitidaxiao = zitidaxiao;
	}
	/**
	 * 获取：字体大小
	 */
	public Integer getZitidaxiao() {
		return zitidaxiao;
	}
	/**
	 * 设置：键盘导航
	 */
	public void setJianpandaohang(Integer jianpandaohang) {
		this.jianpandaohang = jianpandaohang;
	}
	/**
	 * 获取：键盘导航
	 */
	public Integer getJianpandaohang() {
		return jianpandaohang;
	}
	/**
	 * 设置：触觉反馈
	 */
	public void setHapticfeedback(Integer hapticfeedback) {
		this.hapticfeedback = hapticfeedback;
	}
	/**
	 * 获取：触觉反馈
	 */
	public Integer getHapticfeedback() {
		return hapticfeedback;
	}
	/**
	 * 设置：路线偏好
	 */
	public void setPreferenceRouteType(String preferenceRouteType) {
		this.preferenceRouteType = preferenceRouteType;
	}
	/**
	 * 获取：路线偏好
	 */
	public String getPreferenceRouteType() {
		return preferenceRouteType;
	}

}
