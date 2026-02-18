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
 * 站点无障碍信息
 * 数据库通用操作实体类（普通增删改查）
 * @author
 * @email
 * @date 2022-04-04 22:19:36
 */
@TableName("zhandian_wuzhangai")
public class ZhandianWuzhangaiEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public ZhandianWuzhangaiEntity() {

	}

	public ZhandianWuzhangaiEntity(T t) {
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
	 * 站点名称
	 */

	private String zhandianming;

	/**
	 * 经度
	 */

	private Double jingdu;

	/**
	 * 纬度
	 */

	private Double weidu;

	/**
	 * 无障碍级别(0-完全无障碍,1-基本无障碍,2-部分障碍,3-有障碍)
	 */

	private Integer wuzhangaijibie;

	/**
	 * 是否有无障碍升降台(0-无,1-有)
	 */

	private Integer shengjiangtai;

	/**
	 * 是否有盲道(0-无,1-有)
	 */

	private Integer mangdao;

	/**
	 * 是否有盲文站牌(0-无,1-有)
	 */

	private Integer zhuizhu;

	/**
	 * 爱心座椅数量
	 */

	private Integer zuoweishu;

	/**
	 * 是否有无障碍厕所(0-无,1-有)
	 */

	private Integer cesuo;

	/**
	 * 是否有无障碍停车场(0-无,1-有)
	 */

	private Integer tingchechang;

	/**
	 * 备注说明
	 */

	private String beizhu;


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
	 * 设置：站点名称
	 */
	public void setZhandianming(String zhandianming) {
		this.zhandianming = zhandianming;
	}
	/**
	 * 获取：站点名称
	 */
	public String getZhandianming() {
		return zhandianming;
	}
	/**
	 * 设置：经度
	 */
	public void setJingdu(Double jingdu) {
		this.jingdu = jingdu;
	}
	/**
	 * 获取：经度
	 */
	public Double getJingdu() {
		return jingdu;
	}
	/**
	 * 设置：纬度
	 */
	public void setWeidu(Double weidu) {
		this.weidu = weidu;
	}
	/**
	 * 获取：纬度
	 */
	public Double getWeidu() {
		return weidu;
	}
	/**
	 * 设置：无障碍级别
	 */
	public void setWuzhangaijibie(Integer wuzhangaijibie) {
		this.wuzhangaijibie = wuzhangaijibie;
	}
	/**
	 * 获取：无障碍级别
	 */
	public Integer getWuzhangaijibie() {
		return wuzhangaijibie;
	}
	/**
	 * 设置：无障碍升降台
	 */
	public void setShengjiangtai(Integer shengjiangtai) {
		this.shengjiangtai = shengjiangtai;
	}
	/**
	 * 获取：无障碍升降台
	 */
	public Integer getShengjiangtai() {
		return shengjiangtai;
	}
	/**
	 * 设置：盲道
	 */
	public void setMangdao(Integer mangdao) {
		this.mangdao = mangdao;
	}
	/**
	 * 获取：盲道
	 */
	public Integer getMangdao() {
		return mangdao;
	}
	/**
	 * 设置：盲文站牌
	 */
	public void setZhuizhu(Integer zhuizhu) {
		this.zhuizhu = zhuizhu;
	}
	/**
	 * 获取：盲文站牌
	 */
	public Integer getZhuizhu() {
		return zhuizhu;
	}
	/**
	 * 设置：爱心座椅数量
	 */
	public void setZuoweishu(Integer zuoweishu) {
		this.zuoweishu = zuoweishu;
	}
	/**
	 * 获取：爱心座椅数量
	 */
	public Integer getZuoweishu() {
		return zuoweishu;
	}
	/**
	 * 设置：无障碍厕所
	 */
	public void setCesuo(Integer cesuo) {
		this.cesuo = cesuo;
	}
	/**
	 * 获取：无障碍厕所
	 */
	public Integer getCesuo() {
		return cesuo;
	}
	/**
	 * 设置：无障碍停车场
	 */
	public void setTingchechang(Integer tingchechang) {
		this.tingchechang = tingchechang;
	}
	/**
	 * 获取：无障碍停车场
	 */
	public Integer getTingchechang() {
		return tingchechang;
	}
	/**
	 * 设置：备注
	 */
	public void setBeizhu(String beizhu) {
		this.beizhu = beizhu;
	}
	/**
	 * 获取：备注
	 */
	public String getBeizhu() {
		return beizhu;
	}

}
