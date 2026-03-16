(function () {
  'use strict';

  var LOGIN_STRUCTURED_ATTR = 'data-admin-login-structured';
  var LOGIN_BUTTON_BOUND_ATTR = 'data-admin-login-bound';
  var BREADCRUMB_STRUCTURED_ATTR = 'data-admin-breadcrumb-structured';
  var HEADER_SIGNATURE_ATTR = 'data-admin-header-signature';
  var WORKBENCH_SIGNATURE_ATTR = 'data-admin-workbench-signature';
  var ROUTE_BANNER_SIGNATURE_ATTR = 'data-admin-route-banner-signature';
  var ACTION_BOUND_ATTR = 'data-admin-action-bound';
  var MAX_SCHEDULES_PER_WINDOW = 480;
  var SCHEDULE_WINDOW_MS = 15000;
  var timer = null;
  var scheduleWindowStartedAt = 0;
  var scheduleCount = 0;
  var scheduleWarned = false;

  var HOME_ROUTE = '/index';
  var LEGACY_ROUTES = ['/pay', '/register'];
  var DROPDOWN_DOC_BOUND = false;
  var MODULES = [
    {
      path: '/center',
      title: '个人中心',
      token: 'ME',
      group: '账号设置',
      tone: 'focus',
      desc: '查看管理员资料与登录信息。',
      kicker: 'ACCOUNT'
    },
    {
      path: '/updatePassword',
      title: '修改密码',
      token: 'PW',
      group: '账号设置',
      tone: 'warn',
      desc: '更新后台密码，保持账号安全。',
      kicker: 'SECURITY'
    },
    {
      path: '/gongjiaoluxian',
      title: '公交路线',
      token: 'RT',
      group: '路线与公告',
      tone: 'focus',
      desc: '维护路线编号、站点与票价信息。',
      kicker: 'TRANSIT'
    },
    {
      path: '/wangzhangonggao',
      title: '网站公告',
      token: 'GG',
      group: '路线与公告',
      tone: 'accent',
      desc: '发布运营公告与站点通知。',
      kicker: 'NOTICE'
    },
    {
      path: '/youqinglianjie',
      title: '友情链接',
      token: 'LK',
      group: '路线与公告',
      tone: 'accent',
      desc: '维护公共服务与资源链接。',
      kicker: 'LINKS'
    },
    {
      path: '/config',
      title: '轮播图管理',
      token: 'KV',
      group: '展示配置',
      tone: 'accent',
      desc: '更新首页轮播与运营视觉素材。',
      kicker: 'VISUAL'
    },
    {
      path: '/messages',
      title: '留言建议',
      token: 'MS',
      group: '用户反馈',
      tone: 'focus',
      desc: '处理留言建议并跟进反馈。',
      kicker: 'FEEDBACK'
    },
    {
      path: '/chat',
      title: '在线提问',
      token: 'QA',
      group: '互动审核',
      tone: 'good',
      desc: '查看在线提问记录与答复。',
      kicker: 'QA'
    },
    {
      path: '/discussgongjiaoluxian',
      title: '公交路线评论',
      token: 'RC',
      group: '互动审核',
      tone: 'warn',
      desc: '审核路线评论内容。',
      kicker: 'REVIEW'
    },
    {
      path: '/discusswangzhangonggao',
      title: '网站公告评论',
      token: 'AC',
      group: '互动审核',
      tone: 'warn',
      desc: '审核公告评论内容。',
      kicker: 'REVIEW'
    },
    {
      path: '/yonghu',
      title: '用户管理',
      token: 'UR',
      group: '用户管理',
      tone: 'danger',
      desc: '维护用户账号与状态信息。',
      kicker: 'USERS'
    }
  ];

  var WORKBENCH_GROUPS = [
    {
      id: 'core',
      title: '路线与公告',
      desc: '路线、公告与资源入口集中展示。',
      items: ['/gongjiaoluxian', '/wangzhangonggao', '/youqinglianjie']
    },
    {
      id: 'feedback',
      title: '留言处理',
      desc: '集中处理用户留言与出行建议。',
      items: ['/messages']
    },
    {
      id: 'users',
      title: '用户管理',
      desc: '维护用户账号、状态与基础资料。',
      items: ['/yonghu']
    }
  ];

  var SECONDARY_GROUPS = [
    {
      id: 'account',
      title: '账号设置',
      desc: '个人资料与密码维护。',
      items: ['/center', '/updatePassword']
    },
    {
      id: 'review',
      title: '互动审核',
      desc: '在线提问与评论巡检。',
      items: ['/chat', '/discussgongjiaoluxian', '/discusswangzhangonggao']
    },
    {
      id: 'visual',
      title: '展示配置',
      desc: '首页视觉与轮播素材。',
      items: ['/config']
    }
  ];

  var PRIMARY_ROUTES = ['/gongjiaoluxian', '/wangzhangonggao', '/youqinglianjie', '/messages', '/yonghu'];

  var ROUTE_MAP = {};
  var i;
  for (i = 0; i < MODULES.length; i += 1) {
    ROUTE_MAP[MODULES[i].path] = MODULES[i];
  }

  function trimText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function make(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text !== 'undefined') el.textContent = text;
    return el;
  }

  function removeAllChildren(node) {
    while (node && node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key) || '';
    } catch (err) {
      return '';
    }
  }

  function safeStorageRemove(keys) {
    try {
      for (var index = 0; index < keys.length; index += 1) {
        window.localStorage.removeItem(keys[index]);
      }
    } catch (err) {}
  }

  function appBasePath() {
    var path = String(window.location.pathname || '');
    var distIndex = path.indexOf('/admin/dist/index.html');
    var publicIndex = path.indexOf('/admin/public/index.html');
    if (distIndex >= 0) return path.slice(0, distIndex);
    if (publicIndex >= 0) return path.slice(0, publicIndex);
    return '/springbootmf383';
  }

  function adminIndexUrl() {
    return window.location.origin + appBasePath() + '/admin/dist/index.html';
  }

  function frontHomeUrl() {
    return window.location.origin + appBasePath() + '/front/index.html';
  }

  function environmentLabel() {
    var port = String(window.location.port || '');
    if (port === '8134') return 'DEV 8134';
    if (port === '8133') return 'PROD 8133';
    return 'ADMIN';
  }

  function currentRole() {
    return trimText(safeStorageGet('role')) || '管理员';
  }

  function currentAdminName() {
    var storageName = trimText(safeStorageGet('adminName'));
    if (storageName) return storageName;
    var userInfo = document.querySelector('.user-info');
    var text = trimText(userInfo ? userInfo.textContent : '');
    if (!text) return '未命名管理员';
    var parts = text.split(/[·•]/);
    if (parts.length > 1) return trimText(parts[parts.length - 1]);
    return text.replace(/^管理员\s*/, '') || '未命名管理员';
  }

  function currentHashPath() {
    return normalizeRoutePath(String(window.location.hash || '').replace(/^#/, '') || HOME_ROUTE);
  }

  function normalizeRoutePath(value) {
    var path = trimText(value || '');
    if (!path) path = HOME_ROUTE;
    path = path.replace(/^#/, '');
    if (path.charAt(0) !== '/') path = '/' + path;
    path = path.replace(/\/+/g, '/');
    if (path.length > 1) path = path.replace(/\/+$/, '');
    if (path === '/') return HOME_ROUTE;
    return path;
  }

  function isHomeRoute(path) {
    var routePath = normalizeRoutePath(path || currentHashPath());
    return routePath === HOME_ROUTE;
  }

  function isLegacyRoute(path) {
    var routePath = normalizeRoutePath(path || currentHashPath());
    for (var index = 0; index < LEGACY_ROUTES.length; index += 1) {
      if (routePath === LEGACY_ROUTES[index]) return true;
    }
    return false;
  }

  function breadcrumbTitle() {
    var items = document.querySelectorAll('.app-breadcrumb .el-breadcrumb__inner');
    if (!items.length) return '';
    return trimText(items[items.length - 1].textContent);
  }

  function tokenFor(label) {
    var clean = trimText(label).replace(/[\s/]+/g, '');
    if (!clean) return 'GO';
    if (/^[A-Za-z]/.test(clean)) return clean.slice(0, Math.min(3, clean.length)).toUpperCase();
    return clean.slice(0, Math.min(2, clean.length));
  }

  function fallbackRouteMeta(path) {
    var title = breadcrumbTitle() || '业务模块';
    return {
      path: normalizeRoutePath(path),
      title: title,
      token: tokenFor(title),
      group: '业务模块',
      tone: 'focus',
      desc: '入口已收口，操作流程保持不变。',
      kicker: 'MODULE'
    };
  }

  function routeMetaFor(path) {
    var routePath = normalizeRoutePath(path || currentHashPath());
    if (isHomeRoute(routePath)) {
      return {
        path: HOME_ROUTE,
        title: '后台工作台',
        token: 'WB',
        group: '工作台入口',
        tone: 'focus',
        desc: '常用入口集中在工作台，更多功能在顶栏。',
        kicker: 'WORKBENCH'
      };
    }
    return ROUTE_MAP[routePath] || fallbackRouteMeta(routePath);
  }

  function hashFor(path) {
    var routePath = normalizeRoutePath(path);
    if (isHomeRoute(routePath)) return '#/index/';
    return '#' + routePath;
  }

  function navigateTo(path) {
    window.location.hash = hashFor(path);
  }

  function setBodyView(view, routePath) {
    document.body.classList.add('transit-admin-runtime-root');
    document.body.setAttribute('data-admin-view', view);
    document.body.setAttribute('data-admin-route', normalizeRoutePath(routePath || currentHashPath()).replace(/[^a-zA-Z0-9\-_]/g, '_'));
  }

  function renderLoginMessage(form, msg, tone) {
    if (!form) return;
    var box = form.querySelector('.admin-login-inline-message');
    if (!box) {
      box = make('div', 'admin-login-inline-message');
      var btn = form.querySelector('.loginInBt');
      if (btn && btn.parentNode) {
        btn.parentNode.insertBefore(box, btn);
      } else {
        form.appendChild(box);
      }
    }
    box.textContent = msg;
    box.setAttribute('data-tone', tone || 'info');
  }

  function ensureLoginFallback(form) {
    if (!form) return;
    var button = form.querySelector('button.loginInBt, .loginInBt');
    var userInput = form.querySelector('input[name=username]');
    var passInput = form.querySelector('input[name=password]');
    if (!button || !userInput || !passInput || button.getAttribute(LOGIN_BUTTON_BOUND_ATTR) === '1') return;

    var trigger = function () {
      var username = trimText(userInput.value);
      var password = String(passInput.value || '');
      var url;
      if (!username) {
        renderLoginMessage(form, '请输入用户名', 'error');
        return;
      }
      if (!password) {
        renderLoginMessage(form, '请输入密码', 'error');
        return;
      }
      url = appBasePath() + '/users/login?username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password);
      renderLoginMessage(form, '正在登录后台…', 'info');
      fetch(url, { method: 'POST', credentials: 'same-origin' })
        .then(function (resp) { return resp.json(); })
        .then(function (data) {
          if (data && data.code === 0) {
            try {
              window.localStorage.setItem('Token', data.token || '');
              window.localStorage.setItem('role', '管理员');
              window.localStorage.setItem('sessionTable', 'users');
              window.localStorage.setItem('adminName', username);
            } catch (err) {}
            window.location.href = adminIndexUrl() + '#/index/';
            return;
          }
          renderLoginMessage(form, (data && data.msg) || '登录失败，请稍后重试', 'error');
        })
        .catch(function () {
          renderLoginMessage(form, '登录请求失败，请检查服务是否可用', 'error');
        });
    };

    button.addEventListener('click', function (event) {
      event.preventDefault();
      trigger();
    });
    userInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        trigger();
      }
    });
    passInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        trigger();
      }
    });
    button.setAttribute(LOGIN_BUTTON_BOUND_ATTR, '1');
  }

  function ensureLoginShell() {
    var container = document.querySelector('.container.loginIn');
    var form;
    var intro;
    var titleContainer;
    var title;
    var firstFormItem;
    var setting;
    var button;
    var metrics;
    if (!container) return;
    form = container.querySelector('.login-form');
    if (!form) return;

    setBodyView('login', '/login');
    container.classList.add('admin-login-grid');

    intro = container.querySelector('.admin-login-intro');
    if (!intro) {
      intro = make('section', 'admin-login-intro');
      intro.setAttribute('aria-label', '后台简介');
      intro.appendChild(make('p', 'admin-login-intro__eyebrow', 'TRANSIT OPERATIONS DESK'));
      intro.appendChild(make('h1', 'admin-login-intro__title', '公交线路查询系统后台'));
      intro.appendChild(make('p', 'admin-login-intro__desc', '管理员登录后进入路线、公告、留言等核心模块。'));
      metrics = make('div', 'admin-login-intro__grid');
      [
        ['入口', '后台工作台'],
        ['核心', '路线 · 公告 · 留言'],
        ['账号', '管理员登录']
      ].forEach(function (item) {
        var row = make('div', 'admin-login-intro__item');
        row.appendChild(make('span', 'admin-login-intro__label', item[0]));
        row.appendChild(make('strong', '', item[1]));
        metrics.appendChild(row);
      });
      intro.appendChild(metrics);
      container.insertBefore(intro, container.firstChild || null);
    }

    titleContainer = form.querySelector('.title-container') || make('div', 'title-container');
    if (!titleContainer.parentNode) {
      form.insertBefore(titleContainer, form.firstChild || null);
    }
    if (!titleContainer.querySelector('.admin-login-panel__eyebrow')) {
      titleContainer.insertBefore(make('div', 'admin-login-panel__eyebrow', 'ADMIN SIGN IN'), titleContainer.firstChild || null);
    }
    title = titleContainer.querySelector('.title, .h1');
    if (title) {
      title.textContent = '进入后台工作台';
    }
    if (!form.querySelector('.admin-login-tip')) {
      firstFormItem = form.querySelector('.el-form-item') || null;
      form.insertBefore(make('div', 'admin-login-tip', '仅管理员登录。'), firstFormItem);
    }
    if (!form.querySelector('.admin-login-footnote')) {
      setting = form.querySelector('.setting') || make('div', 'setting');
      if (!setting.parentNode) {
        form.appendChild(setting);
      }
      setting.appendChild(make('div', 'admin-login-footnote', '如账号异常，请联系维护人员。'));
    }
    button = form.querySelector('.loginInBt');
    if (button) button.textContent = '登录后台';

    ensureLoginFallback(form);
    container.setAttribute(LOGIN_STRUCTURED_ATTR, '1');
  }

  function bindActionNode(node, handler) {
    if (!node || node.getAttribute(ACTION_BOUND_ATTR) === '1') return;
    node.addEventListener('click', function (event) {
      if (node.tagName.toLowerCase() === 'a') return;
      event.preventDefault();
      handler();
    });
    node.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler();
      }
    });
    node.setAttribute(ACTION_BOUND_ATTR, '1');
  }

  function bindKeyboardClick(node) {
    if (!node || node.getAttribute('data-admin-keyboard-bound') === '1') return;
    node.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        node.click();
      }
    });
    node.setAttribute('data-admin-keyboard-bound', '1');
  }

  function makeActionButton(label, className, handler) {
    var button = make('button', className, label);
    button.type = 'button';
    bindActionNode(button, handler);
    return button;
  }

  function makeActionLink(label, className, href) {
    var link = make('a', className, label);
    link.href = href;
    return link;
  }

  function createLogoutFallback() {
    var node = make('button', 'admin-shell-action admin-shell-action--danger logout', '退出登录');
    node.type = 'button';
    bindActionNode(node, function () {
      safeStorageRemove(['Token', 'role', 'sessionTable', 'adminName', 'userid']);
      window.location.href = adminIndexUrl() + '#/login';
    });
    return node;
  }

  function closeDropdown(dropdown) {
    if (!dropdown) return;
    dropdown.removeAttribute('data-open');
    var trigger = dropdown.querySelector('.admin-shell-dropdown__trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function openDropdown(dropdown, focusFirst) {
    if (!dropdown) return;
    dropdown.setAttribute('data-open', '1');
    var trigger = dropdown.querySelector('.admin-shell-dropdown__trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (focusFirst) {
      var first = dropdown.querySelector('.admin-shell-dropdown__item');
      if (first) first.focus();
    }
  }

  function toggleDropdown(dropdown) {
    if (!dropdown) return;
    if (dropdown.getAttribute('data-open') === '1') {
      closeDropdown(dropdown);
    } else {
      openDropdown(dropdown);
    }
  }

  function createDropdownItem(meta) {
    var item = make('button', 'admin-shell-dropdown__item');
    item.type = 'button';
    item.appendChild(make('span', 'admin-shell-dropdown__label', meta.title));
    item.appendChild(make('span', 'admin-shell-dropdown__desc', meta.desc));
    bindActionNode(item, function () {
      navigateTo(meta.path);
      closeDropdown(item.closest('.admin-shell-dropdown'));
    });
    return item;
  }

  function createDropdownMenu() {
    if (!SECONDARY_GROUPS || !SECONDARY_GROUPS.length) return null;
    var dropdown = make('div', 'admin-shell-dropdown');
    var trigger = make('button', 'admin-shell-action admin-shell-action--ghost admin-shell-dropdown__trigger', '更多功能');
    var menu = make('div', 'admin-shell-dropdown__menu');
    trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    SECONDARY_GROUPS.forEach(function (group) {
      var section = make('div', 'admin-shell-dropdown__section');
      var head = make('div', 'admin-shell-dropdown__head');
      var list = make('div', 'admin-shell-dropdown__list');
      head.appendChild(make('div', 'admin-shell-dropdown__title', group.title));
      if (group.desc) {
        head.appendChild(make('div', 'admin-shell-dropdown__meta', group.desc));
      }
      section.appendChild(head);
      group.items.forEach(function (path) {
        if (ROUTE_MAP[path]) {
          list.appendChild(createDropdownItem(ROUTE_MAP[path]));
        }
      });
      section.appendChild(list);
      menu.appendChild(section);
    });

    dropdown.appendChild(trigger);
    dropdown.appendChild(menu);

    if (dropdown.getAttribute('data-admin-dropdown-bound') !== '1') {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleDropdown(dropdown);
      });
      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          openDropdown(dropdown, true);
        }
      });
      dropdown.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          closeDropdown(dropdown);
          trigger.focus();
        }
      });
      dropdown.setAttribute('data-admin-dropdown-bound', '1');
    }

    if (!DROPDOWN_DOC_BOUND) {
      document.addEventListener('click', function (event) {
        var opened = document.querySelector('.admin-shell-dropdown[data-open="1"]');
        if (opened && !opened.contains(event.target)) {
          closeDropdown(opened);
        }
      });
      DROPDOWN_DOC_BOUND = true;
    }

    return dropdown;
  }

  function ensureHeader() {
    var navbar = document.querySelector('.navbar');
    var meta;
    var signature;
    var existingLogout;
    var existingUserInfo;
    var shell;
    var brand;
    var brandInfo;
    var actions;
    var workbenchButton;
    var frontLink;
    var moreMenu;
    if (!navbar) return;

    meta = routeMetaFor(currentHashPath());
    signature = [environmentLabel(), currentRole(), currentAdminName(), meta.path, meta.title].join('|');
    if (navbar.getAttribute(HEADER_SIGNATURE_ATTR) === signature && navbar.querySelector('.admin-shell-topbar')) {
      return;
    }

    existingLogout = navbar.querySelector('.logout');
    existingUserInfo = navbar.querySelector('.user-info');
    if (!existingLogout) {
      existingLogout = createLogoutFallback();
    }
    if (!existingUserInfo) {
      existingUserInfo = make('div', 'user-info');
    }

    existingUserInfo.className = 'admin-shell-chip admin-shell-chip--user user-info';
    existingUserInfo.textContent = currentRole() + ' · ' + currentAdminName();

    existingLogout.classList.add('admin-shell-action', 'admin-shell-action--danger', 'logout');
    existingLogout.setAttribute('role', 'button');
    existingLogout.setAttribute('tabindex', '0');
    existingLogout.textContent = '退出登录';
    if (existingLogout.tagName && existingLogout.tagName.toLowerCase() !== 'button' && existingLogout.tagName.toLowerCase() !== 'a') {
      bindKeyboardClick(existingLogout);
    }

    shell = navbar.querySelector('.admin-shell-topbar') || make('div', 'admin-shell-topbar');
    removeAllChildren(shell);

    brand = make('div', 'admin-shell-topbar__brand');
    brandInfo = make('div', 'admin-shell-topbar__titles');
    brandInfo.appendChild(make('div', 'admin-shell-topbar__eyebrow', 'TRANSIT OPS CONSOLE'));
    brandInfo.appendChild(make('div', 'admin-shell-topbar__title', '公交线路查询系统后台'));
    brandInfo.appendChild(make('div', 'admin-shell-topbar__subtitle', isHomeRoute(meta.path) ? '高频维护入口集中在工作台，低频治理入口统一收纳到“更多功能”。' : ('当前模块：' + meta.title + ' · ' + meta.desc)));
    brand.appendChild(brandInfo);

    actions = make('div', 'admin-shell-topbar__actions');
    actions.appendChild(make('div', 'admin-shell-chip admin-shell-chip--env', environmentLabel()));
    actions.appendChild(make('div', 'admin-shell-chip admin-shell-chip--route', meta.group));
    actions.appendChild(existingUserInfo);

    workbenchButton = makeActionButton(isHomeRoute(meta.path) ? '当前为工作台' : '返回工作台', 'admin-shell-action admin-shell-action--primary', function () {
      navigateTo(HOME_ROUTE);
    });
    if (isHomeRoute(meta.path)) {
      workbenchButton.disabled = true;
      workbenchButton.setAttribute('aria-current', 'page');
    }
    actions.appendChild(workbenchButton);

    moreMenu = createDropdownMenu();
    if (moreMenu) {
      actions.appendChild(moreMenu);
    }

    frontLink = makeActionLink('前台首页', 'admin-shell-action', frontHomeUrl());
    actions.appendChild(frontLink);
    actions.appendChild(existingLogout);

    shell.appendChild(brand);
    shell.appendChild(actions);

    removeAllChildren(navbar);
    navbar.appendChild(shell);
    navbar.setAttribute(HEADER_SIGNATURE_ATTR, signature);
  }

  function ensureBreadcrumb() {
    var breadcrumbs = document.querySelectorAll('.app-breadcrumb');
    var index;
    var breadcrumb;
    for (index = 0; index < breadcrumbs.length; index += 1) {
      breadcrumb = breadcrumbs[index];
      if (!breadcrumb.querySelector('.app-breadcrumb__eyebrow')) {
        breadcrumb.insertBefore(make('span', 'app-breadcrumb__eyebrow', 'ROUTE MAP'), breadcrumb.firstChild || null);
      }
      breadcrumb.setAttribute(BREADCRUMB_STRUCTURED_ATTR, '1');
    }
  }

  function createMetric(label, value, meta) {
    var item = make('div', 'admin-workbench-metric');
    item.appendChild(make('span', 'admin-workbench-metric__label', label));
    item.appendChild(make('strong', 'admin-workbench-metric__value', value));
    if (meta) item.appendChild(make('span', 'admin-workbench-metric__meta', meta));
    return item;
  }

  function createWorkbenchChip(text, tone) {
    var chip = make('span', 'admin-workbench-chip', text);
    if (tone) chip.setAttribute('data-tone', tone);
    return chip;
  }

  function createWorkbenchAction(label, path, className) {
    return makeActionButton(label, className || 'admin-shell-action', function () {
      navigateTo(path);
    });
  }

  function createLauncher(meta) {
    var button = make('button', 'admin-launcher-tile');
    var header = make('div', 'admin-launcher-tile__header');
    var copy = make('div', 'admin-launcher-tile__copy');
    var footer = make('div', 'admin-launcher-tile__footer');
    button.type = 'button';
    button.setAttribute('data-tone', meta.tone || 'focus');
    button.setAttribute('data-path', meta.path);

    header.appendChild(make('span', 'admin-launcher-tile__token', meta.token || tokenFor(meta.title)));
    header.appendChild(make('span', 'admin-launcher-tile__kicker', meta.kicker || 'MODULE'));

    copy.appendChild(make('strong', 'admin-launcher-tile__title', meta.title));
    copy.appendChild(make('span', 'admin-launcher-tile__desc', meta.desc));

    footer.appendChild(make('span', 'admin-launcher-tile__group', meta.group));
    footer.appendChild(make('span', 'admin-launcher-tile__arrow', '进入模块 →'));

    button.appendChild(header);
    button.appendChild(copy);
    button.appendChild(footer);

    bindActionNode(button, function () {
      navigateTo(meta.path);
    });

    return button;
  }

  function createWorkbench() {
    var page = make('section', 'admin-workbench-page');
    var hero = make('section', 'admin-workbench-hero');
    var heroMain = make('div', 'admin-workbench-hero__main');
    var heroBoard = make('div', 'admin-workbench-hero__board');
    var heroChips = make('div', 'admin-workbench-chip-list');
    var heroActions = make('div', 'admin-workbench-hero__actions');
    var groupIndex;

    heroMain.appendChild(make('span', 'admin-workbench-eyebrow', 'OPERATIONS OVERVIEW'));
    heroMain.appendChild(make('h1', 'admin-workbench-hero__title', '后台运营工作台'));
    heroMain.appendChild(make('p', 'admin-workbench-hero__desc', '将高频维护入口、互动处理与低频治理功能收拢到同一套后台节奏里：先看总览，再进入模块处理，最后回到工作台继续调度。'));

    heroChips.appendChild(createWorkbenchChip(environmentLabel(), 'focus'));
    heroChips.appendChild(createWorkbenchChip('当前角色：' + currentRole(), 'good'));
    heroChips.appendChild(createWorkbenchChip('高频入口 ' + PRIMARY_ROUTES.length + ' 个', 'accent'));
    heroChips.appendChild(createWorkbenchChip('更多功能 ' + SECONDARY_GROUPS.length + ' 组', 'warn'));
    heroMain.appendChild(heroChips);

    heroActions.appendChild(createWorkbenchAction('进入公交路线', '/gongjiaoluxian', 'admin-shell-action admin-shell-action--primary'));
    heroActions.appendChild(createWorkbenchAction('查看留言建议', '/messages', 'admin-shell-action'));
    heroActions.appendChild(makeActionLink('前台首页', 'admin-shell-action admin-shell-action--ghost', frontHomeUrl()));
    heroMain.appendChild(heroActions);

    heroBoard.appendChild(createMetric('当前账号', currentAdminName(), currentRole() + ' · 已登录后台'));
    heroBoard.appendChild(createMetric('高频入口', String(PRIMARY_ROUTES.length), '路线 / 公告 / 留言 / 用户'));
    heroBoard.appendChild(createMetric('扩展功能', String(SECONDARY_GROUPS.length), '账号 / 审核 / 展示配置'));
    heroBoard.appendChild(createMetric('运行环境', environmentLabel(), '开发验证先看 8134，生产保持 8133'));

    hero.appendChild(heroMain);
    hero.appendChild(heroBoard);
    page.appendChild(hero);

    for (groupIndex = 0; groupIndex < WORKBENCH_GROUPS.length; groupIndex += 1) {
      var group = WORKBENCH_GROUPS[groupIndex];
      var section = make('section', 'admin-workbench-group');
      var head = make('div', 'admin-workbench-group__head');
      var info = make('div', 'admin-workbench-group__info');
      var grid = make('div', 'admin-launcher-grid');
      var itemIndex;
      head.appendChild(make('span', 'admin-workbench-group__eyebrow', group.id.toUpperCase()));
      info.appendChild(make('h2', 'admin-workbench-group__title', group.title));
      info.appendChild(make('p', 'admin-workbench-group__desc', group.desc));
      head.appendChild(info);
      head.appendChild(make('span', 'admin-workbench-group__count', String(group.items.length) + ' 个入口'));
      section.appendChild(head);

      for (itemIndex = 0; itemIndex < group.items.length; itemIndex += 1) {
        if (ROUTE_MAP[group.items[itemIndex]]) {
          grid.appendChild(createLauncher(ROUTE_MAP[group.items[itemIndex]]));
        }
      }
      section.appendChild(grid);
      page.appendChild(section);
    }

    return page;
  }

  function ensureWorkbench() {
    var main = document.querySelector('.el-main');
    var routerView = main && main.querySelector('.router-view');
    var signature = [environmentLabel(), currentRole(), currentAdminName(), PRIMARY_ROUTES.length, MODULES.length].join('|');
    if (!main || !routerView) return;

    if (main.querySelector('.admin-route-banner')) {
      main.querySelector('.admin-route-banner').remove();
    }

    if (routerView.getAttribute(WORKBENCH_SIGNATURE_ATTR) === signature && routerView.querySelector('.admin-workbench-page')) {
      return;
    }

    removeAllChildren(routerView);
    routerView.appendChild(createWorkbench());
    routerView.setAttribute(WORKBENCH_SIGNATURE_ATTR, signature);
  }

  function upsertPanelHeading(container, eyebrow, title, meta, tone) {
    var heading;
    var info;
    var metaNode;
    if (!container) return;
    heading = container.querySelector('.admin-panel-heading');
    if (!heading) {
      heading = make('div', 'admin-panel-heading');
      info = make('div', 'admin-panel-heading__info');
      info.appendChild(make('span', 'admin-panel-heading__eyebrow', eyebrow));
      info.appendChild(make('h2', 'admin-panel-heading__title', title));
      metaNode = make('span', 'admin-panel-heading__meta', meta || '');
      heading.appendChild(info);
      heading.appendChild(metaNode);
      container.insertBefore(heading, container.firstChild || null);
    } else {
      metaNode = heading.querySelector('.admin-panel-heading__meta');
      if (!metaNode) {
        metaNode = make('span', 'admin-panel-heading__meta');
        heading.appendChild(metaNode);
      }
      var eyebrowNode = heading.querySelector('.admin-panel-heading__eyebrow');
      var titleNode = heading.querySelector('.admin-panel-heading__title');
      if (eyebrowNode) eyebrowNode.textContent = eyebrow;
      if (titleNode) titleNode.textContent = title;
    }
    heading.setAttribute('data-tone', tone || 'focus');
    metaNode.textContent = meta || '';
  }

  function visibleTableRows() {
    var rows = document.querySelectorAll('.el-table__body-wrapper tbody tr');
    var count = 0;
    for (var index = 0; index < rows.length; index += 1) {
      if (rows[index].children && rows[index].children.length) {
        count += 1;
      }
    }
    return count;
  }

  function ensureContentPanels() {
    var mainContent = document.querySelector('.router-view.main-content, .router-view .main-content');
    var detailPanel = document.querySelector('.router-view.detail-form-content, .router-view .detail-form-content');
    var meta = routeMetaFor(currentHashPath());
    var formPanel;
    var tablePanel;
    var rowCount;
    if (!mainContent && !detailPanel) return;

    formPanel = mainContent && mainContent.querySelector('.form-content');
    tablePanel = mainContent && mainContent.querySelector('.table-content');
    rowCount = visibleTableRows();

    if (formPanel) {
      upsertPanelHeading(formPanel, 'FILTERS', meta.title + ' · 筛选与操作', '支持关键词检索、批量操作与导出入口', 'focus');
    }
    if (tablePanel) {
      upsertPanelHeading(tablePanel, 'DATA GRID', meta.title + ' · 数据列表', rowCount > 0 ? ('当前可见 ' + rowCount + ' 条记录') : '等待数据加载或请先执行筛选', 'accent');
    }
    if (detailPanel) {
      upsertPanelHeading(detailPanel, 'DETAIL FORM', meta.title + ' · 编辑详情', '字段结构与原流程保持一致，当前仅做后台视觉优化', 'good');
    }
  }

  function ensureRouteBanner() {
    var main = document.querySelector('.el-main');
    var routerView = main && main.querySelector('.router-view');
    var meta = routeMetaFor(currentHashPath());
    var signature = [meta.path, meta.title, environmentLabel()].join('|');
    var banner;
    var copy;
    var metaRow;
    var actionRow;
    if (!main || !routerView || isHomeRoute(meta.path)) return;

    banner = main.querySelector('.admin-route-banner');
    if (banner && banner.getAttribute(ROUTE_BANNER_SIGNATURE_ATTR) === signature) {
      return;
    }
    if (banner) banner.remove();

    banner = make('section', 'admin-route-banner');
    banner.setAttribute(ROUTE_BANNER_SIGNATURE_ATTR, signature);

    copy = make('div', 'admin-route-banner__copy');
    copy.appendChild(make('span', 'admin-route-banner__eyebrow', meta.kicker || 'MODULE'));
    copy.appendChild(make('h1', 'admin-route-banner__title', meta.title));
    copy.appendChild(make('p', 'admin-route-banner__desc', meta.desc));

    metaRow = make('div', 'admin-route-banner__meta');
    metaRow.appendChild(make('span', 'admin-route-banner__tag', meta.group));
    metaRow.appendChild(make('span', 'admin-route-banner__tag', environmentLabel()));
    metaRow.appendChild(make('span', 'admin-route-banner__tag', currentRole() + ' · ' + currentAdminName()));
    copy.appendChild(metaRow);

    actionRow = make('div', 'admin-route-banner__actions');
    actionRow.appendChild(makeActionButton('返回工作台', 'admin-route-banner__action admin-route-banner__action--primary', function () {
      navigateTo(HOME_ROUTE);
    }));
    actionRow.appendChild(makeActionLink('前台首页', 'admin-route-banner__action', frontHomeUrl()));
    copy.appendChild(actionRow);

    banner.appendChild(copy);
    main.insertBefore(banner, routerView);
  }

  function shouldCleanMediaFields() {
    var routePath = normalizeRoutePath(currentHashPath());
    return routePath === '/gongjiaoluxian' || routePath === '/wangzhangonggao' || routePath === '/youqinglianjie' || routePath === '/yonghu';
  }

  function hideMediaColumns() {
    var table = document.querySelector('.el-table');
    if (!table) return;
    var headerRow = table.querySelector('tr');
    if (!headerRow) return;
    var headers = headerRow.querySelectorAll('th');
    var targetIndexes = [];
    var targetLabels = ['封面', '图片', '照片'];
    for (var i = 0; i < headers.length; i += 1) {
      var label = trimText(headers[i].textContent);
      if (targetLabels.indexOf(label) !== -1) {
        targetIndexes.push(i);
        headers[i].style.display = 'none';
      }
    }
    if (!targetIndexes.length) return;
    var rows = table.querySelectorAll('tr');
    for (var r = 0; r < rows.length; r += 1) {
      var cells = rows[r].children;
      for (var c = 0; c < targetIndexes.length; c += 1) {
        var index = targetIndexes[c];
        if (cells && cells[index]) {
          cells[index].style.display = 'none';
        }
      }
    }
  }

  function hideMediaFormItem() {
    var items = document.querySelectorAll('.el-form-item');
    var targetLabels = ['封面', '图片', '照片'];
    for (var i = 0; i < items.length; i += 1) {
      var label = items[i].querySelector('.el-form-item__label');
      if (label && targetLabels.indexOf(trimText(label.textContent)) !== -1) {
        items[i].style.display = 'none';
      }
    }
  }

  function cleanupMediaUi() {
    if (!shouldCleanMediaFields()) return;
    hideMediaColumns();
    hideMediaFormItem();
  }

  function scan() {
    var path = currentHashPath();
    if (isLegacyRoute(path)) {
      navigateTo(HOME_ROUTE);
      return;
    }
    ensureLoginShell();
    ensureHeader();
    ensureBreadcrumb();

    if (document.querySelector('.container.loginIn')) {
      return;
    }

    if (isHomeRoute(path)) {
      setBodyView('home', path);
      ensureWorkbench();
      return;
    }

    setBodyView('module', path);
    ensureRouteBanner();
    ensureContentPanels();
    cleanupMediaUi();
  }

  function scheduleScan() {
    var now = Date.now();
    if (!scheduleWindowStartedAt || now - scheduleWindowStartedAt > SCHEDULE_WINDOW_MS) {
      scheduleWindowStartedAt = now;
      scheduleCount = 0;
      scheduleWarned = false;
    }
    scheduleCount += 1;
    if (scheduleCount > MAX_SCHEDULES_PER_WINDOW) {
      if (!scheduleWarned && window.console && console.warn) {
        console.warn('[transit-admin-ui] scan limit reached within 15s, stop scheduling to avoid runaway loops.');
        scheduleWarned = true;
      }
      return;
    }
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(scan, 48);
  }

  function bootstrapRescans() {
    [120, 400, 900, 1800, 3200, 5200, 8000].forEach(function (delay) {
      window.setTimeout(scheduleScan, delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      scheduleScan();
      bootstrapRescans();
    });
  } else {
    scheduleScan();
    bootstrapRescans();
  }

  window.addEventListener('hashchange', scheduleScan);
  window.addEventListener('resize', scheduleScan);
  window.addEventListener('pageshow', scheduleScan);

  var observer = new MutationObserver(function () {
    scheduleScan();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
