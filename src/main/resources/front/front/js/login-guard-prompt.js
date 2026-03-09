(function(window) {
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getLayerApi(host) {
    return host && host.layui && host.layui.layer ? host.layui.layer : null;
  }

  function buildFrontRelativeUrl(locationObj) {
    var loc = locationObj || window.location;
    var pathname = loc.pathname || '';
    var marker = '/front/';
    var markerIndex = pathname.indexOf(marker);
    if (markerIndex === -1) {
      return './pages/home/home.html';
    }
    var relativePath = pathname.slice(markerIndex + marker.length);
    if (!relativePath) {
      return './pages/home/home.html';
    }
    return './' + relativePath + (loc.search || '') + (loc.hash || '');
  }

  function buildSheetHtml(options) {
    var highlights = Array.isArray(options.highlights) && options.highlights.length
      ? options.highlights
      : [
          '公共路线、公告、资源与无障碍设置仍可继续浏览。',
          '登录后可继续使用个人中心、收藏、留言提交等个性化服务。'
        ];
    var highlightHtml = highlights.map(function(item) {
      return '' +
        '<li>' +
          '<span class="guest-login-sheet__bullet" aria-hidden="true"></span>' +
          '<span>' + escapeHtml(item) + '</span>' +
        '</li>';
    }).join('');

    return '' +
      '<div class="guest-login-sheet" role="dialog" aria-modal="true" aria-label="登录提示">' +
        '<button type="button" class="guest-login-sheet__close" data-login-guard-action="close" aria-label="关闭提示">×</button>' +
        '<div class="guest-login-sheet__eyebrow">' + escapeHtml(options.eyebrow || 'Personal Service Sign-in') + '</div>' +
        '<h3 class="guest-login-sheet__title">' + escapeHtml(options.title || '当前操作需要登录后继续') + '</h3>' +
        '<p class="guest-login-sheet__desc">' + escapeHtml(options.description || '你仍可先浏览公共信息，登录后再继续当前操作。') + '</p>' +
        '<ul class="guest-login-sheet__list">' + highlightHtml + '</ul>' +
        '<div class="guest-login-sheet__actions">' +
          '<button type="button" class="guest-login-sheet__btn guest-login-sheet__btn--primary" data-login-guard-action="confirm">' + escapeHtml(options.confirmLabel || '去登录') + '</button>' +
          '<button type="button" class="guest-login-sheet__btn guest-login-sheet__btn--secondary" data-login-guard-action="cancel">' + escapeHtml(options.cancelLabel || '先浏览公共功能') + '</button>' +
        '</div>' +
      '</div>';
  }

  function open(options) {
    options = options || {};
    var host = options.layerHost || ((window.parent && window.parent !== window && getLayerApi(window.parent)) ? window.parent : window);
    var layerApi = getLayerApi(host) || getLayerApi(window);
    if (!layerApi || typeof layerApi.open !== 'function') {
      if (typeof options.onConfirm === 'function') {
        options.onConfirm();
      }
      return null;
    }

    var viewportWidth = host.innerWidth || window.innerWidth || 430;
    var areaWidth = viewportWidth <= 640 ? Math.max(viewportWidth - 24, 280) + 'px' : (options.width || '430px');
    var html = buildSheetHtml(options);

    var index = layerApi.open({
      type: 1,
      title: false,
      closeBtn: 0,
      shadeClose: true,
      resize: false,
      skin: 'guest-login-layer',
      area: [areaWidth, 'auto'],
      shade: 0.34,
      content: html,
      success: function(layero, dialogIndex) {
        var root = layero && layero[0] ? layero[0] : layero;
        if (!root) return;

        function closeDialog() {
          layerApi.close(dialogIndex);
        }

        function bind(actionName, handler) {
          var node = root.querySelector('[data-login-guard-action="' + actionName + '"]');
          if (!node) return;
          node.addEventListener('click', function() {
            closeDialog();
            if (typeof handler === 'function') {
              handler();
            }
          });
        }

        bind('confirm', options.onConfirm);
        bind('cancel', options.onCancel);
        bind('close', options.onCancel);

        var primary = root.querySelector('[data-login-guard-action="confirm"]');
        if (primary && typeof primary.focus === 'function') {
          setTimeout(function() { primary.focus(); }, 30);
        }
      }
    });

    return index;
  }

  window.TransitLoginGuard = {
    open: open,
    buildFrontRelativeUrl: buildFrontRelativeUrl
  };
})(window);
