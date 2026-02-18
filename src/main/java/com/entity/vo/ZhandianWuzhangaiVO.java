package com.entity.vo;

import com.baomidou.mybatisplus.annotations.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;


/**
 * 站点无障碍信息
 * 手机端接口返回实体辅助类
 * （主要作用去除一些不必要的字段）
 * @author
 * @email
 * @date 2022-04-04 22:19:36
 */
public class ZhandianWuzhangaiVO  implements Serializable {
	private static final long serialVersionUID = 1L;


	/**
	 * 站点名称
	 */

	private String zhandianming;

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
