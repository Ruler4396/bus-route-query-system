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
 * 公交路线
 * 数据库通用操作实体类（普通增删改查）
 * @author 
 * @email 
 * @date 2022-04-04 22:19:36
 */
@TableName("gongjiaoluxian")
public class GongjiaoluxianEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public GongjiaoluxianEntity() {
		
	}
	
	public GongjiaoluxianEntity(T t) {
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
	 * 路线编号
	 */
					
	private String luxianbianhao;
	
	/**
	 * 路线名称
	 */
					
	private String luxianmingcheng;
	
	/**
	 * 封面
	 */
					
	private String fengmian;
	
	/**
	 * 价格
	 */
					
	private Integer jiage;
	
	/**
	 * 起点站名
	 */

	private String qidianzhanming;

	/**
	 * 起点站坐标
	 */

	private String qidianzuobiao;

	/**
	 * 途径站点
	 */

	private String tujingzhandian;

	/**
	 * 站点坐标JSON数据
	 */

	private String zhandianzuobiao;

	/**
	 * 路线轨迹JSON数据(道路折线)
	 */

	private String luxianguiji;

	/**
	 * 终点站名
	 */

	private String zhongdianzhanming;

	/**
	 * 终点站坐标
	 */

	private String zhongdianzuobiao;
	
	/**
	 * 路线详情
	 */
					
	private String luxianxiangqing;
	
	/**
	 * 赞
	 */
					
	private Integer thumbsupnum;
	
	/**
	 * 踩
	 */
					
	private Integer crazilynum;
	
	/**
	 * 最近点击时间
	 */
				
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 		
	private Date clicktime;
	
	/**
	 * 点击次数
	 */
					
	private Integer clicknum;

	/**
	 * 无障碍设施(轮椅坡道,盲道,语音提示等)
	 */

	private String wuzhangaisheshi;

	/**
	 * 无障碍级别(0-完全无障碍,1-基本无障碍,2-部分障碍,3-有障碍)
	 */

	private Integer wuzhangaijibie;

	/**
	 * 电梯设施(站点名称列表)
	 */

	private String diantifacilities;

	/**
	 * 轮椅专用区域说明
	 */

	private String xunlianzhuankuan;

	/**
	 * 是否有语音播报(0-无,1-有)
	 */

	private Integer yuyintongbao;

	/**
	 * 是否有盲道支持(0-无,1-有)
	 */

	private Integer mangdaozhichi;

	/**
	 * 是否支持导盲犬(0-无,1-有)
	 */

	private Integer ditezhichi;


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
	 * 设置：路线编号
	 */
	public void setLuxianbianhao(String luxianbianhao) {
		this.luxianbianhao = luxianbianhao;
	}
	/**
	 * 获取：路线编号
	 */
	public String getLuxianbianhao() {
		return luxianbianhao;
	}
	/**
	 * 设置：路线名称
	 */
	public void setLuxianmingcheng(String luxianmingcheng) {
		this.luxianmingcheng = luxianmingcheng;
	}
	/**
	 * 获取：路线名称
	 */
	public String getLuxianmingcheng() {
		return luxianmingcheng;
	}
	/**
	 * 设置：封面
	 */
	public void setFengmian(String fengmian) {
		this.fengmian = fengmian;
	}
	/**
	 * 获取：封面
	 */
	public String getFengmian() {
		return fengmian;
	}
	/**
	 * 设置：价格
	 */
	public void setJiage(Integer jiage) {
		this.jiage = jiage;
	}
	/**
	 * 获取：价格
	 */
	public Integer getJiage() {
		return jiage;
	}
	/**
	 * 设置：起点站名
	 */
	public void setQidianzhanming(String qidianzhanming) {
		this.qidianzhanming = qidianzhanming;
	}
	/**
	 * 获取：起点站名
	 */
	public String getQidianzhanming() {
		return qidianzhanming;
	}
	/**
	 * 设置：起点站坐标
	 */
	public void setQidianzuobiao(String qidianzuobiao) {
		this.qidianzuobiao = qidianzuobiao;
	}
	/**
	 * 获取：起点站坐标
	 */
	public String getQidianzuobiao() {
		return qidianzuobiao;
	}
	/**
	 * 设置：途径站点
	 */
	public void setTujingzhandian(String tujingzhandian) {
		this.tujingzhandian = tujingzhandian;
	}
	/**
	 * 获取：途径站点
	 */
	public String getTujingzhandian() {
		return tujingzhandian;
	}
	/**
	 * 设置：站点坐标JSON数据
	 */
	public void setZhandianzuobiao(String zhandianzuobiao) {
		this.zhandianzuobiao = zhandianzuobiao;
	}
	/**
	 * 获取：站点坐标JSON数据
	 */
	public String getZhandianzuobiao() {
		return zhandianzuobiao;
	}
	/**
	 * 设置：路线轨迹JSON数据(道路折线)
	 */
	public void setLuxianguiji(String luxianguiji) {
		this.luxianguiji = luxianguiji;
	}
	/**
	 * 获取：路线轨迹JSON数据(道路折线)
	 */
	public String getLuxianguiji() {
		return luxianguiji;
	}
	/**
	 * 设置：终点站名
	 */
	public void setZhongdianzhanming(String zhongdianzhanming) {
		this.zhongdianzhanming = zhongdianzhanming;
	}
	/**
	 * 获取：终点站名
	 */
	public String getZhongdianzhanming() {
		return zhongdianzhanming;
	}
	/**
	 * 设置：终点站坐标
	 */
	public void setZhongdianzuobiao(String zhongdianzuobiao) {
		this.zhongdianzuobiao = zhongdianzuobiao;
	}
	/**
	 * 获取：终点站坐标
	 */
	public String getZhongdianzuobiao() {
		return zhongdianzuobiao;
	}
	/**
	 * 设置：路线详情
	 */
	public void setLuxianxiangqing(String luxianxiangqing) {
		this.luxianxiangqing = luxianxiangqing;
	}
	/**
	 * 获取：路线详情
	 */
	public String getLuxianxiangqing() {
		return luxianxiangqing;
	}
	/**
	 * 设置：赞
	 */
	public void setThumbsupnum(Integer thumbsupnum) {
		this.thumbsupnum = thumbsupnum;
	}
	/**
	 * 获取：赞
	 */
	public Integer getThumbsupnum() {
		return thumbsupnum;
	}
	/**
	 * 设置：踩
	 */
	public void setCrazilynum(Integer crazilynum) {
		this.crazilynum = crazilynum;
	}
	/**
	 * 获取：踩
	 */
	public Integer getCrazilynum() {
		return crazilynum;
	}
	/**
	 * 设置：最近点击时间
	 */
	public void setClicktime(Date clicktime) {
		this.clicktime = clicktime;
	}
	/**
	 * 获取：最近点击时间
	 */
	public Date getClicktime() {
		return clicktime;
	}
	/**
	 * 设置：点击次数
	 */
	public void setClicknum(Integer clicknum) {
		this.clicknum = clicknum;
	}
	/**
	 * 获取：点击次数
	 */
	public Integer getClicknum() {
		return clicknum;
	}
	/**
	 * 设置：无障碍设施
	 */
	public void setWuzhangaisheshi(String wuzhangaisheshi) {
		this.wuzhangaisheshi = wuzhangaisheshi;
	}
	/**
	 * 获取：无障碍设施
	 */
	public String getWuzhangaisheshi() {
		return wuzhangaisheshi;
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
	 * 设置：电梯设施
	 */
	public void setDiantifacilities(String diantifacilities) {
		this.diantifacilities = diantifacilities;
	}
	/**
	 * 获取：电梯设施
	 */
	public String getDiantifacilities() {
		return diantifacilities;
	}
	/**
	 * 设置：轮椅专用区域
	 */
	public void setXunlianzhuankuan(String xunlianzhuankuan) {
		this.xunlianzhuankuan = xunlianzhuankuan;
	}
	/**
	 * 获取：轮椅专用区域
	 */
	public String getXunlianzhuankuan() {
		return xunlianzhuankuan;
	}
	/**
	 * 设置：语音播报
	 */
	public void setYuyintongbao(Integer yuyintongbao) {
		this.yuyintongbao = yuyintongbao;
	}
	/**
	 * 获取：语音播报
	 */
	public Integer getYuyintongbao() {
		return yuyintongbao;
	}
	/**
	 * 设置：盲道支持
	 */
	public void setMangdaozhichi(Integer mangdaozhichi) {
		this.mangdaozhichi = mangdaozhichi;
	}
	/**
	 * 获取：盲道支持
	 */
	public Integer getMangdaozhichi() {
		return mangdaozhichi;
	}
	/**
	 * 设置：导盲犬支持
	 */
	public void setDitezhichi(Integer ditezhichi) {
		this.ditezhichi = ditezhichi;
	}
	/**
	 * 获取：导盲犬支持
	 */
	public Integer getDitezhichi() {
		return ditezhichi;
	}

}
