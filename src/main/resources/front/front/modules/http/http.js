layui.define(['jquery', 'layer'], function(exports) {
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

    function normalizeOptions(options) {
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            return {};
        }
        return options;
    }

    function buildAjaxCallbacks(options, callback) {
        options = normalizeOptions(options);
        return {
            beforeSend: function(request) {
                request.setRequestHeader('Token', localStorage.getItem('Token'));
                if (typeof options.beforeSend === 'function') {
                    options.beforeSend(request);
                }
            },
            onSuccess: function(result, status, xhr) {
                if (result.code == 0) {
                    if (typeof callback === 'function') {
                        callback(result, { status: status, xhr: xhr });
                    }
                    if (typeof options.onSuccess === 'function') {
                        options.onSuccess(result, { status: status, xhr: xhr });
                    }
                    return;
                }
                if (result.code == 401 || result.code == 403) {
                    window.parent.location.href = '../login/login.html';
                    return;
                }
                if (typeof options.onBizError === 'function') {
                    options.onBizError(result);
                }
                if (!options.silentError) {
                    layer.msg(result.msg || '请求失败', {
                        time: 2000,
                        icon: 5
                    });
                }
            },
            onError: function(xhr, status, error) {
                var responseCode = xhr && xhr.responseJSON ? xhr.responseJSON.code : null;
                var info = {
                    xhr: xhr,
                    status: status,
                    error: error,
                    responseCode: responseCode,
                    responseJSON: xhr && xhr.responseJSON ? xhr.responseJSON : null
                };
                if (responseCode == 401 || responseCode == 403) {
                    window.parent.location.href = '../login/login.html';
                    return;
                }
                if (typeof options.onError === 'function') {
                    options.onError(info);
                }
                if (!options.silentError) {
                    layer.msg(options.errorMessage || '请求接口失败', {
                        time: 2000,
                        icon: 5
                    });
                }
            },
            onComplete: function(xhr, status, loadingIndex) {
                if (loadingIndex !== null && loadingIndex !== undefined) {
                    layer.close(loadingIndex);
                }
                if (typeof options.onComplete === 'function') {
                    options.onComplete({ xhr: xhr, status: status });
                }
            }
        };
    }

    var baseurl = resolveRuntimeBaseUrl();
    var http = {
        domain: baseurl,
        baseurl: baseurl,
        getParam: function(name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURI(r[2]);
            return null;
        },
        request: function(url, type, data, callback, options) {
            options = normalizeOptions(options);
            var loadingIndex = null;
            if (options.showLoading !== false) {
                loadingIndex = layer.load(1, {
                    shade: [0.1, '#fff']
                });
            }
            url = baseurl + url;
            data = data || {};
            data['t'] = jquery.now();
            var handlers = buildAjaxCallbacks(options, callback);
            jquery.ajax({
                url: url,
                beforeSend: handlers.beforeSend,
                contentType: 'application/x-www-form-urlencoded',
                data: data,
                dataType: 'json',
                type: type,
                success: handlers.onSuccess,
                error: handlers.onError,
                complete: function(xhr, status) {
                    handlers.onComplete(xhr, status, loadingIndex);
                }
            });
        },
        requestJson: function(url, type, data, callback, options) {
            options = normalizeOptions(options);
            var loadingIndex = null;
            if (options.showLoading !== false) {
                loadingIndex = layer.load(1, {
                    shade: [0.1, '#fff']
                });
            }
            url = baseurl + url;
            data = data || {};
            data['t'] = jquery.now();
            var params = JSON.stringify(data);
            var handlers = buildAjaxCallbacks(options, callback);
            jquery.ajax({
                url: url,
                beforeSend: handlers.beforeSend,
                contentType: 'application/json',
                data: params,
                dataType: 'json',
                type: type,
                success: handlers.onSuccess,
                error: handlers.onError,
                complete: function(xhr, status) {
                    handlers.onComplete(xhr, status, loadingIndex);
                }
            });
        },
        upload: function(file, fileName, callback) {
            var url = baseurl + 'file/upload';
            var formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', fileName);
            jquery.ajax({
                url: url,
                type: 'post',
                data: formData,
                headers: {
                    'Token': localStorage.getItem('Token')
                },
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
                        });
                    }
                }
            })
        }
    }
    exports('http', http);
});
