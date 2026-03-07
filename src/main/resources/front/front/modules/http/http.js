
layui.define(['jquery', 'layer'], function(exports) { //提示：模块也可以依赖其它模块，如：layui.define('layer', callback);
	"use strict";
	var jquery = layui.jquery,
		layer = layui.layer;

	function resolveRuntimeBaseUrl() {
		if (window.__API_BASE_URL__) {
			return /\/$/.test(window.__API_BASE_URL__) ? window.__API_BASE_URL__ : window.__API_BASE_URL__ + '/';
		}
		var origin = window.location.protocol + '//' + window.location.host;
		var pathname = window.location.pathname || '';
		var contextPath = '';
		var frontIdx = pathname.indexOf('/front/');
		if (frontIdx > 0) {
			contextPath = pathname.substring(0, frontIdx);
		} else {
			var adminIdx = pathname.indexOf('/admin/');
			if (adminIdx > 0) {
				contextPath = pathname.substring(0, adminIdx);
			} else {
				contextPath = '/springbootmf383';
			}
		}
		return origin + contextPath + '/';
	}

	var baseurl = resolveRuntimeBaseUrl();
	var http = {
        domain : baseurl,
		baseurl: baseurl,
		/**
		 * 获取传递参数值(修改支持中文)
		 */
		getParam: function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null)
				return decodeURI(r[2]); //对参数进行decodeURI解码
			return null;
		},
		request: function(url, type, data, callback) {
			//loading层
			var index = layer.load(1, {
				shade: [0.1, '#fff'] //0.1透明度的白色背景
			});
			url = baseurl + url;
			data['t'] = jquery.now();
			jquery.ajax({
				url: url,
				beforeSend: function(request) {
					request.setRequestHeader("Token", localStorage.getItem("Token"));
				},
				contentType: 'application/x-www-form-urlencoded',
				data: data,
				dataType: 'json',
				type: type,
				success: function(result, status, xhr) {
					if (result.code == 0) {
						callback(result);
					} else if (result.code == 401 || result.code == 403) {
						window.parent.location.href = '../login/login.html';
					} else {
						layer.msg(result.msg, {
							time: 2000,
							icon: 5
						})
					}
				},
				error: function(xhr, status, error) {
					console.log(xhr, status, error)
					var responseCode = xhr && xhr.responseJSON ? xhr.responseJSON.code : null;
					if(responseCode==401 || responseCode==403) {
                                                 window.parent.location.href = '../login/login.html';
					} else {
						layer.msg("请求接口失败", {
							time: 2000,
							icon: 5
						})
					}
				},
				complete: function() {
					layer.close(index);
				}
			});
		},
		requestJson: function(url, type, data, callback) {
			//loading层
			var index = layer.load(1, {
				shade: [0.1, '#fff'] //0.1透明度的白色背景
			});
			url = baseurl + url;
			var params = null;
			data['t'] = jquery.now();
			if (data) {
				params = JSON.stringify(data);
			}
			jquery.ajax({
				url: url,
				beforeSend: function(request) {
					request.setRequestHeader("Token", localStorage.getItem("Token"));
				},
				contentType: 'application/json',
				data: params,
				dataType: 'json',
				type: type,
				success: function(result, status, xhr) {
					if (result.code == 0) {
						callback(result);
					} else if (result.code == 401 || result.code == 403) {
						window.parent.location.href = '../login/login.html';
					} else {
						layer.msg(result.msg, {
							time: 2000,
							icon: 5
						})
					}
				},
				error: function(xhr, status, error) {
					console.log(xhr, status, error)
					var responseCode = xhr && xhr.responseJSON ? xhr.responseJSON.code : null;
					if(responseCode==401 || responseCode==403) {
                                                 window.parent.location.href = '../login/login.html';
					} else {
						layer.msg("请求接口失败", {
							time: 2000,
							icon: 5
						})
					}
				},
				complete: function() {
					layer.close(index);
				}
			});
		},
		upload: function(file, fileName, callback) {
			var url = baseurl + "file/upload";
			var formData = new FormData();
			formData.append('file', file);
			formData.append('fileName', fileName);
			jquery.ajax({
				url: url,
				/*接口域名地址*/
				type: 'post',
				data: formData,
				headers: {
					"Token": localStorage.getItem("Token")
				}, //添加请求头部
				contentType: false,
				processData: false,
				success: function(res) {
					if (res.code == 0) {
						callback(res);
					} else if (res.code == 401 || res.code == 403) {
						window.parent.location.href = '../login/login.html';
					} else {
						layer.msg(res.msg, {
							time: 2000,
							icon: 5
						})
					}
				}
			})
		}
	}
	//输出接口
	exports('http', http);
});
