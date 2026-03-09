(function () {
  'use strict';

  var MENU_SELECTOR = '.el-aside.index-aside .el-menu-demo';
  var BRAND_SELECTOR = '.admin-sidebar-brand';
  var STRUCTURED_ATTR = 'data-admin-dom-structured';
  var LOGIN_STRUCTURED_ATTR = 'data-admin-login-structured';
  var HEADER_STRUCTURED_ATTR = 'data-admin-header-structured';
  var BREADCRUMB_STRUCTURED_ATTR = 'data-admin-breadcrumb-structured';

  function trimText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function tokenFor(label) {
    var clean = trimText(label).replace(/\s+/g, '');
    if (!clean) return 'NA';
    if (/^[A-Za-z]/.test(clean)) return clean.slice(0, 2).toUpperCase();
    return clean.slice(0, Math.min(2, clean.length));
  }

  function captionFor(label, level) {
    var clean = trimText(label);
    if (level === 'primary') {
      if (clean === '首页') return 'ENTRY';
      if (clean === '个人中心') return 'ACCOUNT';
      if (/用户|会员/.test(clean)) return 'USER';
      if (/公告|新闻|文章|资讯/.test(clean)) return 'CONTENT';
      if (/留言|评论|反馈/.test(clean)) return 'REVIEW';
      if (/路线|公交|站点|地图/.test(clean)) return 'TRANSIT';
      return 'MODULE';
    }
    if (clean === '修改密码') return 'SECURITY';
    if (clean === '个人信息') return 'PROFILE';
    if (/审核|回复/.test(clean)) return 'ACTION';
    if (/留言|评论|反馈/.test(clean)) return 'REVIEW';
    if (/统计|报表/.test(clean)) return 'REPORT';
    return 'SCREEN';
  }

  function extractLabel(node) {
    if (!node) return '';
    var explicit = node.querySelector('.admin-nav-label, .admin-subnav-text');
    if (explicit) return trimText(explicit.textContent);
    var clone = node.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('.el-submenu__icon-arrow, i, svg'), function (el) {
      el.remove();
    });
    return trimText(clone.textContent);
  }

  function make(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text !== 'undefined') el.textContent = text;
    return el;
  }

  function currentRole() {
    try {
      return window.localStorage.getItem('role') || '';
    } catch (err) {
      return '';
    }
  }

  function environmentLabel() {
    var port = String(window.location.port || '');
    if (port === '8134') return 'DEV 8134';
    if (port === '8133') return 'PROD 8133';
    return 'ADMIN CONSOLE';
  }

  function ensureLoginShell() {
    var container = document.querySelector('.container.loginIn');
    if (!container || container.getAttribute(LOGIN_STRUCTURED_ATTR) === '1') return;

    var form = container.querySelector('.login-form');
    if (!form) return;

    if (!container.querySelector('.admin-login-shell')) {
      var shell = make('div', 'admin-login-shell');
      var intro = make('section', 'admin-login-intro');
      intro.setAttribute('aria-label', '后台简介');
      intro.appendChild(make('p', 'admin-login-intro__eyebrow', 'TRANSIT OPERATIONS CONSOLE'));
      intro.appendChild(make('h1', 'admin-login-intro__title', '公交线路查询系统后台'));
      intro.appendChild(make('p', 'admin-login-intro__desc', '面向线路维护、公告发布、留言处理与友情链接管理的统一后台。本次界面改版采用更平直、更像运营中台的布局语言，减少圆角卡片感与模板味。'));

      var grid = make('div', 'admin-login-intro__grid');
      [
        ['适用入口', '开发实例 / 管理后台'],
        ['主要工作', '线路、公告、互动内容维护'],
        ['交互原则', '清晰层级、状态明确、无圆角卡片堆叠']
      ].forEach(function (item) {
        var card = make('div', 'admin-login-intro__item');
        card.appendChild(make('span', 'admin-login-intro__label', item[0]));
        var strong = make('strong', '', item[1]);
        card.appendChild(strong);
        grid.appendChild(card);
      });
      intro.appendChild(grid);

      var panel = make('section', 'admin-login-panel');
      panel.setAttribute('aria-label', '登录表单');
      panel.appendChild(form);
      shell.appendChild(intro);
      shell.appendChild(panel);
      container.innerHTML = '';
      container.appendChild(shell);
    }

    var titleContainer = form.querySelector('.title-container') || make('div', 'title-container');
    if (!titleContainer.parentNode) {
      form.insertBefore(titleContainer, form.firstChild || null);
    }
    if (!titleContainer.querySelector('.admin-login-panel__eyebrow')) {
      titleContainer.insertBefore(make('div', 'admin-login-panel__eyebrow', 'ADMIN SIGN IN'), titleContainer.firstChild || null);
    }
    var title = titleContainer.querySelector('.title');
    if (title) {
      title.textContent = '进入后台工作台';
    }
    if (!form.querySelector('.admin-login-tip')) {
      var firstFormItem = form.querySelector('.el-form-item') || null;
      var tip = make('div', 'admin-login-tip', '仅管理员可登录后台，无需额外选择角色。');
      form.insertBefore(tip, firstFormItem);
    }
    if (!form.querySelector('.admin-login-footnote')) {
      var setting = form.querySelector('.setting') || make('div', 'setting');
      if (!setting.parentNode) {
        form.appendChild(setting);
      }
      setting.innerHTML = '';
      setting.appendChild(make('div', 'admin-login-footnote', '建议使用分配账号登录；若账号不可用，请联系系统维护人员处理。'));
    }
    var button = form.querySelector('.loginInBt');
    if (button) button.textContent = '登录后台';

    container.setAttribute(LOGIN_STRUCTURED_ATTR, '1');
  }

  function ensureHeader() {
    var navbar = document.querySelector('.navbar');
    if (!navbar || navbar.getAttribute(HEADER_STRUCTURED_ATTR) === '1') return;

    var titleMenu = navbar.querySelector('.title-menu') || make('div', 'title-menu');
    var rightMenu = navbar.querySelector('.right-menu') || make('div', 'right-menu');
    var titleName = titleMenu.querySelector('.title-name');
    var titleText = trimText(titleName ? titleName.textContent : '公交线路查询系统');

    if (!titleMenu.querySelector('.admin-shell-header__brand')) {
      var brand = make('div', 'admin-shell-header__brand');
      brand.appendChild(make('div', 'admin-shell-header__eyebrow', 'BUS ROUTE QUERY SYSTEM'));
      var titles = make('div', 'admin-shell-header__titles');
      titles.appendChild(make('div', 'title-name', titleText || '公交线路查询系统'));
      titles.appendChild(make('div', 'admin-shell-header__subtitle', '线路资料、公告与互动内容统一管理后台'));
      brand.appendChild(titles);
      titleMenu.innerHTML = '';
      titleMenu.appendChild(brand);
    }

    if (!rightMenu.querySelector('.admin-shell-header__env')) {
      rightMenu.insertBefore(make('div', 'admin-shell-header__env', environmentLabel()), rightMenu.firstChild || null);
    }

    Array.prototype.forEach.call(rightMenu.querySelectorAll('.logout'), function (item) {
      item.classList.add('admin-shell-action');
      if (trimText(item.textContent) === '退出到前台') {
        item.textContent = '返回前台';
      }
    });

    var userInfo = rightMenu.querySelector('.user-info');
    if (userInfo) {
      userInfo.textContent = trimText(userInfo.textContent).replace(/\s+/g, ' · ');
    }

    navbar.setAttribute(HEADER_STRUCTURED_ATTR, '1');
  }

  function ensureBrand(container) {
    if (!container || container.querySelector(BRAND_SELECTOR)) return;
    var brand = document.createElement('div');
    brand.className = 'admin-sidebar-brand';
    brand.innerHTML = [
      '<div class="admin-sidebar-brand__eyebrow">BACKSTAGE CONTROL</div>',
      '<div class="admin-sidebar-brand__title">运营控制台</div>',
      '<p class="admin-sidebar-brand__meta">更平直的企业后台导航，避免圆角卡片式堆叠。</p>'
    ].join('');
    container.insertBefore(brand, container.firstChild);
  }

  function ensureSummary(container, menu) {
    if (!container || !menu) return;
    var summary = container.querySelector('.admin-sidebar-summary');
    if (!summary) {
      summary = make('div', 'admin-sidebar-summary');
      var brand = container.querySelector('.admin-sidebar-brand');
      if (brand && brand.nextSibling) {
        container.insertBefore(summary, brand.nextSibling);
      } else {
        container.appendChild(summary);
      }
    }
    var role = currentRole() || '管理员';
    var moduleCount = menu.querySelectorAll('.el-menu-item').length;
    summary.innerHTML = [
      '<div class="admin-sidebar-summary__item"><span class="admin-sidebar-summary__label">当前角色</span><strong>' + role + '</strong></div>',
      '<div class="admin-sidebar-summary__item"><span class="admin-sidebar-summary__label">可用模块</span><strong>' + moduleCount + ' 个</strong></div>'
    ].join('');
  }

  function createSectionHeading(title) {
    var node = document.createElement('li');
    node.className = 'admin-nav-section-heading';
    node.setAttribute('role', 'presentation');
    node.textContent = title;
    return node;
  }

  function removeSectionHeadings(menu) {
    Array.prototype.forEach.call(menu.querySelectorAll(':scope > .admin-nav-section-heading'), function (heading) {
      heading.remove();
    });
  }

  function normalizeNodeBox(node) {
    if (!node) return;
    node.style.paddingLeft = '0px';
    node.style.paddingRight = '0px';
    node.style.paddingTop = '0px';
    node.style.paddingBottom = '0px';
    node.style.margin = '0px';
    node.style.height = 'auto';
    node.style.lineHeight = 'normal';
    node.style.borderRadius = '0px';
  }

  function decoratePrimary(node) {
    if (!node) return;
    if (node.getAttribute(STRUCTURED_ATTR) === 'primary') return;
    if (node.querySelector('.admin-nav-row')) {
      normalizeNodeBox(node);
      node.setAttribute(STRUCTURED_ATTR, 'primary');
      return;
    }
    var label = extractLabel(node);
    if (!label) return;
    var arrow = node.querySelector('.el-submenu__icon-arrow');
    if (arrow && arrow.parentNode !== node) {
      arrow = arrow.cloneNode(true);
    }
    var row = document.createElement('span');
    row.className = 'admin-nav-row';
    var leading = document.createElement('span');
    leading.className = 'admin-nav-leading';
    leading.textContent = tokenFor(label);
    var body = document.createElement('span');
    body.className = 'admin-nav-body';
    body.appendChild(make('span', 'admin-nav-label', label));
    body.appendChild(make('span', 'admin-nav-kicker', captionFor(label, 'primary')));
    row.appendChild(leading);
    row.appendChild(body);
    while (node.firstChild) node.removeChild(node.firstChild);
    node.appendChild(row);
    if (arrow) row.appendChild(arrow);
    normalizeNodeBox(node);
    node.setAttribute(STRUCTURED_ATTR, 'primary');
  }

  function decorateChild(node) {
    if (!node) return;
    if (node.getAttribute(STRUCTURED_ATTR) === 'child') return;
    if (node.querySelector('.admin-subnav-row')) {
      normalizeNodeBox(node);
      node.setAttribute(STRUCTURED_ATTR, 'child');
      return;
    }
    var label = extractLabel(node);
    if (!label) return;
    var row = document.createElement('span');
    row.className = 'admin-subnav-row';
    row.appendChild(make('span', 'admin-subnav-dot'));
    row.appendChild(make('span', 'admin-subnav-text', label));
    row.appendChild(make('span', 'admin-subnav-caption', captionFor(label, 'child')));
    while (node.firstChild) node.removeChild(node.firstChild);
    node.appendChild(row);
    normalizeNodeBox(node);
    node.setAttribute(STRUCTURED_ATTR, 'child');
  }

  function ensureSections(menu) {
    removeSectionHeadings(menu);
    var items = Array.prototype.filter.call(menu.children, function (child) {
      return child && (child.classList.contains('el-menu-item') || child.classList.contains('el-submenu'));
    });
    if (!items.length) return;
    var homeItem = items.find(function (item) {
      return extractLabel(item.classList.contains('el-submenu') ? item.querySelector('.el-submenu__title') : item) === '首页';
    }) || items[0];
    var accountItem = items.find(function (item) {
      return extractLabel(item.classList.contains('el-submenu') ? item.querySelector('.el-submenu__title') : item) === '个人中心';
    });
    var businessItem = items.find(function (item) {
      return item !== homeItem && item !== accountItem;
    });
    if (homeItem) menu.insertBefore(createSectionHeading('工作台'), homeItem);
    if (accountItem) menu.insertBefore(createSectionHeading('账户设置'), accountItem);
    if (businessItem) menu.insertBefore(createSectionHeading('业务导航'), businessItem);
  }

  function ensureSidebar(menu) {
    if (!menu) return;
    var container = menu.closest('.index-aside-inner');
    ensureBrand(container);
    ensureSummary(container, menu);
    ensureSections(menu);

    Array.prototype.forEach.call(menu.children, function (child) {
      if (child.classList.contains('el-menu-item')) {
        decoratePrimary(child);
        return;
      }
      if (child.classList.contains('el-submenu')) {
        decoratePrimary(child.querySelector('.el-submenu__title'));
        Array.prototype.forEach.call(child.querySelectorAll('.el-menu--inline > .el-menu-item, .el-menu .el-menu-item'), function (item) {
          decorateChild(item);
        });
      }
    });
  }

  function ensureBreadcrumb() {
    Array.prototype.forEach.call(document.querySelectorAll('.app-breadcrumb'), function (breadcrumb) {
      if (breadcrumb.getAttribute(BREADCRUMB_STRUCTURED_ATTR) === '1') return;
      if (!breadcrumb.querySelector('.app-breadcrumb__eyebrow')) {
        breadcrumb.insertBefore(make('span', 'app-breadcrumb__eyebrow', 'PATH'), breadcrumb.firstChild || null);
      }
      breadcrumb.setAttribute(BREADCRUMB_STRUCTURED_ATTR, '1');
    });
  }

  function scan() {
    ensureLoginShell();
    ensureHeader();
    ensureBreadcrumb();
    Array.prototype.forEach.call(document.querySelectorAll(MENU_SELECTOR), function (menu) {
      ensureSidebar(menu);
    });
  }

  var timer = null;
  function scheduleScan() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(scan, 16);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleScan);
  } else {
    scheduleScan();
  }

  var observer = new MutationObserver(function () {
    scheduleScan();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
