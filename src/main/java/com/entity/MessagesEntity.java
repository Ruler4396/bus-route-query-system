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
 * 留言建议
 * 数据库通用操作实体类（普通增删改查）
 * @author 
 * @email 
 * @date 2022-04-04 22:19:37
 */
@TableName("messages")
public class MessagesEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public MessagesEntity() {
		
	}
	
	public MessagesEntity(T t) {
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
	 * 留言人id
	 */
					
	private Long userid;
	
	/**
	 * 用户名
	 */
					
	private String username;
	
	/**
	 * 留言内容
	 */
					
	private String content;
	
	/**
	 * 留言图片
	 */
					
	private String cpicture;
	
	/**
	 * 回复内容
	 */
					
	private String reply;
	
	/**
	 * 回复图片
	 */
					
	private String rpicture;

	/**
	 * 反馈类型
	 */
	private String feedbackType;

	/**
	 * 严重级别
	 */
	private String severityLevel;

	/**
	 * 关联路线ID
	 */
	private Long routeId;

	/**
	 * 关联路线名称
	 */
	private String routeName;

	/**
	 * 关联站点名称
	 */
	private String stationName;

	/**
	 * 处理状态
	 */
	private String handleStatus;

	/**
	 * 审核人
	 */
	private String auditOwner;

	/**
	 * 审核备注
	 */
	private String reviewNotes;

	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat
	private Date reviewedAt;
	
	
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
	 * 设置：留言人id
	 */
	public void setUserid(Long userid) {
		this.userid = userid;
	}
	/**
	 * 获取：留言人id
	 */
	public Long getUserid() {
		return userid;
	}
	/**
	 * 设置：用户名
	 */
	public void setUsername(String username) {
		this.username = username;
	}
	/**
	 * 获取：用户名
	 */
	public String getUsername() {
		return username;
	}
	/**
	 * 设置：留言内容
	 */
	public void setContent(String content) {
		this.content = content;
	}
	/**
	 * 获取：留言内容
	 */
	public String getContent() {
		return content;
	}
	/**
	 * 设置：留言图片
	 */
	public void setCpicture(String cpicture) {
		this.cpicture = cpicture;
	}
	/**
	 * 获取：留言图片
	 */
	public String getCpicture() {
		return cpicture;
	}
	/**
	 * 设置：回复内容
	 */
	public void setReply(String reply) {
		this.reply = reply;
	}
	/**
	 * 获取：回复内容
	 */
	public String getReply() {
		return reply;
	}
	/**
	 * 设置：回复图片
	 */
	public void setRpicture(String rpicture) {
		this.rpicture = rpicture;
	}
	/**
	 * 获取：回复图片
	 */
	public String getRpicture() {
		return rpicture;
	}

	public String getFeedbackType() {
		return feedbackType;
	}
	public void setFeedbackType(String feedbackType) {
		this.feedbackType = feedbackType;
	}
	public String getSeverityLevel() {
		return severityLevel;
	}
	public void setSeverityLevel(String severityLevel) {
		this.severityLevel = severityLevel;
	}
	public Long getRouteId() {
		return routeId;
	}
	public void setRouteId(Long routeId) {
		this.routeId = routeId;
	}
	public String getRouteName() {
		return routeName;
	}
	public void setRouteName(String routeName) {
		this.routeName = routeName;
	}
	public String getStationName() {
		return stationName;
	}
	public void setStationName(String stationName) {
		this.stationName = stationName;
	}
	public String getHandleStatus() {
		return handleStatus;
	}
	public void setHandleStatus(String handleStatus) {
		this.handleStatus = handleStatus;
	}
	public String getAuditOwner() {
		return auditOwner;
	}
	public void setAuditOwner(String auditOwner) {
		this.auditOwner = auditOwner;
	}
	public String getReviewNotes() {
		return reviewNotes;
	}
	public void setReviewNotes(String reviewNotes) {
		this.reviewNotes = reviewNotes;
	}
	public Date getReviewedAt() {
		return reviewedAt;
	}
	public void setReviewedAt(Date reviewedAt) {
		this.reviewedAt = reviewedAt;
	}

}
