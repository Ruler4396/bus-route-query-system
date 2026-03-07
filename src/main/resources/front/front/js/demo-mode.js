(function(global) {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
  }

  function shellAvailable() {
    return !!byId('iframe') && typeof global.navPage === 'function';
  }

  function safeAnnounce(message) {
    try {
      if (global.AccessibilityUtils && typeof global.AccessibilityUtils.announce === 'function') {
        global.AccessibilityUtils.announce(message);
      }
    } catch (err) {
      console.warn('演示提示播报失败', err);
    }
  }

  function closeTransientLayers() {
    try {
      if (global.layui && global.layui.layer) {
        global.layui.layer.closeAll();
      }
    } catch (err) {
      console.warn('关闭弹层失败', err);
    }
  }

  var steps = [
    {
      id: 'intro',
      title: '首页总览：项目定位与试点边界',
      url: './pages/home/home.html',
      durationLabel: '建议 55 秒',
      coverage: ['首页总览', '目标用户', '试点范围'],
      notes: [
        '先说明系统首轮主服务人群是轮椅/行动不便，次服务人群是低视力。',
        '再说明试点只覆盖广州老城区公共服务走廊，不宣传广州全城都已可信可用。',
        '点出这不是模板站点，而是围绕真实试点线路和场景组织的演示原型。'
      ]
    },
    {
      id: 'assist',
      title: '无障碍快捷控制：高对比、大字体、语音与键盘导航',
      url: './pages/home/home.html',
      durationLabel: '建议 60 秒',
      coverage: ['高对比度', '大字体', '语音播报', '键盘导航'],
      notes: [
        '展示顶栏的无障碍快捷控制区，说明这些能力是全站级而不是单页开关。',
        '演示 Alt + H / Alt + M / Alt + A / Alt + D 等快捷键。',
        '说明这是服务低视力与行动不便用户的交互基线。'
      ],
      action: 'presetAssistiveMode'
    },
    {
      id: 'route-list',
      title: '路线规划与可达路线清单',
      url: './pages/gongjiaoluxian/list.html',
      durationLabel: '建议 70 秒',
      coverage: ['路线列表', '无障碍等级', '推荐排序', '试点线路'],
      notes: [
        '说明路线列表不是全城承诺，而是先围绕 1路、3路、31路做可信闭环。',
        '讲解为何这些线路适合轮椅/行动不便用户演示。',
        '强调路线排序最终会接入画像、置信度和风险提示。'
      ]
    },
    {
      id: 'route-detail',
      title: '路线详情：推荐理由、设施标签与说明文案',
      url: './pages/gongjiaoluxian/detail.html?id=1',
      durationLabel: '建议 60 秒',
      coverage: ['路线详情', '设施标签', '文字说明'],
      notes: [
        '展示一条路线的详细说明、关键站点和无障碍设施字段。',
        '强调路线详情页是后续补“推荐理由 / 风险点 / 置信度”的落点页面。',
        '可以指出当前系统已经开始从模板字段转向无障碍解释字段。'
      ]
    },
    {
      id: 'map',
      title: '实时线路地图与 ETA 估算',
      url: './pages/gongjiaoluxian/map.html',
      durationLabel: '建议 75 秒',
      coverage: ['地图展示', '站点核对', 'ETA', '风险核对'],
      notes: [
        '展示路线轨迹、站点、车辆位置与 ETA。',
        '说明地图页是“出门到到达”建模的中间层，目前仍以公交段为主。',
        '强调未来要补步行段、入口级可达性和关键设施置信度。'
      ]
    },
    {
      id: 'announcements',
      title: '出行服务公告：试点说明与演示提示',
      url: './pages/wangzhangonggao/list.html',
      durationLabel: '建议 45 秒',
      coverage: ['公告内容', '试点口径', '演示账号'],
      notes: [
        '展示公告页不再空白，而是承载试点范围说明、演示模式说明和演示账号说明。',
        '强调公告页是“状态透明”和“能力边界透明”的一部分。'
      ]
    },
    {
      id: 'resources',
      title: '无障碍资源链接：数据来源与核查路径',
      url: './pages/youqinglianjie/list.html',
      durationLabel: '建议 45 秒',
      coverage: ['外部数据源', '友情链接', '核查路径'],
      notes: [
        '展示 Wheelmap、OpenStreetMap、开放广东等资源链接。',
        '说明系统不是闭门造车，关键数据需要外部来源与后续人工核验。'
      ]
    },
    {
      id: 'messages',
      title: '留言与改进建议：用户反馈闭环',
      url: './pages/messages/list.html',
      durationLabel: '建议 50 秒',
      coverage: ['留言反馈', '问题回复', '改进闭环'],
      notes: [
        '展示用户留言和管理员回复，说明数据不准、路径不可达、页面不可用都能沉淀为改进项。',
        '这部分是后续真实用户验证和人工纠错闭环的雏形。'
      ]
    },
    {
      id: 'settings',
      title: '无障碍设置页：交互模式基线',
      url: './pages/accessibility/settings.html',
      durationLabel: '建议 55 秒',
      coverage: ['高对比', '字体', '语音', '键盘'],
      notes: [
        '展示无障碍设置页，把快捷控制区和单独设置页串起来。',
        '强调这是低视力场景的直接收益点，也是后续屏幕阅读器基线验证的入口。'
      ]
    },
    {
      id: 'login-chat',
      title: '登录态扩展示范：演示账号与在线提问',
      url: './pages/home/home.html',
      durationLabel: '建议 65 秒',
      coverage: ['演示账号', '登录态', '在线提问'],
      notes: [
        '演示模式会自动尝试登录 demo_user / demo123。',
        '登录成功后自动打开在线提问弹窗，展示问答记录。',
        '这一步属于扩展示范，用于补足中期检查视频的功能覆盖面。'
      ],
      action: 'loginAndOpenChat'
    },
    {
      id: 'summary',
      title: '总结：当前完成度、边界与后续待办',
      url: './pages/home/home.html',
      durationLabel: '建议 60 秒',
      coverage: ['阶段成果', '边界说明', '后续工作'],
      notes: [
        '回到首页，强调当前已经有试点范围、用户范围、一键演示、自动巡检和基础无障碍交互。',
        '同时说明系统仍未达到“完全可信的无障碍出行系统”，后续还要继续完成主待办文档。',
        '建议在视频末尾点出：当前答案仍然是 NO，但已经知道要如何迭代到 YES。'
      ]
    }
  ];

  var DemoPresentationService = {
    isOpen: false,
    isAutoplay: false,
    currentIndex: 0,
    timerId: null,
    root: null,

    init: function() {
      if (!shellAvailable()) return;
      this.mount();
      this.bindControls();
      this.bindEntryPoints();
      this.handleQueryStart();
    },

    mount: function() {
      if (byId('demoPresentationRoot')) {
        this.root = byId('demoPresentationRoot');
        return;
      }
      var root = document.createElement('div');
      root.id = 'demoPresentationRoot';
      root.className = 'demo-presentation';
      root.hidden = true;
      root.innerHTML = [
        '<section class="demo-panel" role="dialog" aria-modal="false" aria-labelledby="demoPanelTitle">',
        '  <div class="demo-panel-header">',
        '    <div>',
        '      <div class="demo-panel-eyebrow">Midterm Demo Deck</div>',
        '      <h2 id="demoPanelTitle">10 分钟演示模式</h2>',
        '      <p id="demoPanelStatus" class="demo-panel-status">Alt + D 可随时重新打开本面板。</p>',
        '    </div>',
        '    <div class="demo-panel-actions">',
        '      <button type="button" class="demo-mini-btn" id="demoToggleAutoplay">自动播放</button>',
        '      <button type="button" class="demo-mini-btn" id="demoClose">关闭</button>',
        '    </div>',
        '  </div>',
        '  <div class="demo-panel-body">',
        '    <div class="demo-step-list-wrap">',
        '      <div class="demo-step-list-title">演示步骤</div>',
        '      <div id="demoStepList" class="demo-step-list" role="tablist" aria-label="演示步骤列表"></div>',
        '    </div>',
        '    <div class="demo-step-detail">',
        '      <div class="demo-step-meta">',
        '        <span id="demoDuration" class="demo-chip"></span>',
        '        <span class="demo-chip">覆盖所有公开前台功能</span>',
        '      </div>',
        '      <h3 id="demoStepTitle" class="demo-step-title"></h3>',
        '      <p id="demoStepSummary" class="demo-step-summary"></p>',
        '      <div>',
        '        <div class="demo-block-title">本步骤覆盖</div>',
        '        <div id="demoCoverage" class="demo-coverage"></div>',
        '      </div>',
        '      <div>',
        '        <div class="demo-block-title">建议讲解内容</div>',
        '        <ol id="demoNarration" class="demo-narration"></ol>',
        '      </div>',
        '      <div class="demo-step-toolbar">',
        '        <button type="button" class="demo-main-btn secondary" id="demoPrev">上一步</button>',
        '        <button type="button" class="demo-main-btn" id="demoNext">下一步</button>',
        '      </div>',
        '      <div class="demo-step-tip">可用方式：<kbd>Alt + D</kbd> 打开演示，<kbd>?demo=1</kbd> 直接进入，<kbd>?demo=auto</kbd> 自动串场。</div>',
        '    </div>',
        '  </div>',
        '</section>'
      ].join('');
      document.body.appendChild(root);
      this.root = root;
      this.renderStepList();
    },

    bindControls: function() {
      var self = this;
      byId('demoClose').addEventListener('click', function() { self.close(); });
      byId('demoPrev').addEventListener('click', function() { self.previous(); });
      byId('demoNext').addEventListener('click', function() { self.next(); });
      byId('demoToggleAutoplay').addEventListener('click', function() { self.toggleAutoplay(); });
    },

    bindEntryPoints: function() {
      var self = this;
      var assistButton = byId('assistDemo');
      if (assistButton) {
        assistButton.addEventListener('click', function() {
          self.open({ autoplay: false, source: 'assist-button' });
        });
      }
    },

    handleQueryStart: function() {
      try {
        var params = new URLSearchParams(global.location.search || '');
        if (params.get('demo') === '1') {
          var self = this;
          setTimeout(function() { self.open({ autoplay: false, source: 'query-demo' }); }, 800);
        } else if (params.get('demo') === 'auto') {
          var service = this;
          setTimeout(function() { service.open({ autoplay: true, source: 'query-auto' }); }, 800);
        }
      } catch (err) {
        console.warn('解析演示模式 query 参数失败', err);
      }
    },

    renderStepList: function() {
      var container = byId('demoStepList');
      if (!container) return;
      container.innerHTML = steps.map(function(step, index) {
        return '<button type="button" class="demo-step-item" data-step-index="' + index + '">' +
          '<span class="demo-step-no">' + (index + 1) + '</span>' +
          '<span class="demo-step-text">' + step.title + '</span>' +
        '</button>';
      }).join('');
      var self = this;
      Array.prototype.forEach.call(container.querySelectorAll('[data-step-index]'), function(node) {
        node.addEventListener('click', function() {
          self.goTo(Number(node.getAttribute('data-step-index')), false);
        });
      });
    },

    open: function(options) {
      options = options || {};
      this.isOpen = true;
      this.root.hidden = false;
      this.root.classList.add('is-open');
      this.goTo(this.currentIndex || 0, !!options.autoplay);
      if (options.autoplay) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
      safeAnnounce('中期检查演示模式已打开');
    },

    close: function() {
      this.isOpen = false;
      this.stopAutoplay();
      if (this.root) {
        this.root.hidden = true;
        this.root.classList.remove('is-open');
      }
      closeTransientLayers();
      safeAnnounce('演示模式已关闭');
    },

    toggleAutoplay: function() {
      if (this.isAutoplay) {
        this.stopAutoplay();
      } else {
        this.startAutoplay();
      }
      this.renderCurrentStep();
    },

    startAutoplay: function() {
      this.isAutoplay = true;
      this.queueNext();
    },

    stopAutoplay: function() {
      this.isAutoplay = false;
      clearTimeout(this.timerId);
      this.timerId = null;
    },

    queueNext: function() {
      clearTimeout(this.timerId);
      if (!this.isAutoplay) return;
      var step = steps[this.currentIndex];
      var delay = step && step.autoplayMs ? step.autoplayMs : 25000;
      var self = this;
      this.timerId = setTimeout(function() { self.next(true); }, delay);
    },

    next: function(fromAuto) {
      if (this.currentIndex >= steps.length - 1) {
        if (fromAuto) this.stopAutoplay();
        return;
      }
      this.goTo(this.currentIndex + 1, fromAuto);
    },

    previous: function() {
      if (this.currentIndex <= 0) return;
      this.goTo(this.currentIndex - 1, false);
    },

    goTo: function(index, fromAuto) {
      if (index < 0 || index >= steps.length) return;
      this.currentIndex = index;
      var step = steps[index];
      closeTransientLayers();
      if (step.url && typeof global.navPage === 'function') {
        global.navPage(step.url);
      }
      this.renderCurrentStep();
      var self = this;
      setTimeout(function() { self.runStepAction(step); }, 900);
      if (fromAuto || this.isAutoplay) {
        this.queueNext();
      }
    },

    renderCurrentStep: function() {
      var step = steps[this.currentIndex];
      if (!step) return;
      var totalMinutes = '约 10 分钟';
      byId('demoPanelStatus').textContent = '当前步骤 ' + (this.currentIndex + 1) + '/' + steps.length + ' · ' + totalMinutes + ' 演示总时长';
      byId('demoDuration').textContent = step.durationLabel;
      byId('demoStepTitle').textContent = step.title;
      byId('demoStepSummary').textContent = '当前展示页面：' + step.url.replace('./pages/', '');
      byId('demoCoverage').innerHTML = step.coverage.map(function(item) {
        return '<span class="demo-coverage-chip">' + item + '</span>';
      }).join('');
      byId('demoNarration').innerHTML = step.notes.map(function(item) {
        return '<li>' + item + '</li>';
      }).join('');
      byId('demoToggleAutoplay').textContent = this.isAutoplay ? '暂停自动播放' : '自动播放';
      Array.prototype.forEach.call(document.querySelectorAll('.demo-step-item'), function(node, idx) {
        node.classList.toggle('is-active', idx === DemoPresentationService.currentIndex);
      });
      safeAnnounce('演示步骤已切换到：' + step.title);
    },

    runStepAction: function(step) {
      if (!step || !step.action) return;
      if (step.action === 'presetAssistiveMode') {
        try {
          if (global.AccessibilityUtils) {
            if (!global.AccessibilityUtils.isHighContrast()) {
              global.AccessibilityUtils.enableHighContrast();
            }
            global.AccessibilityUtils.setFontSize(18);
            global.AccessibilityUtils.saveSettings({ keyboardNav: true, speech: true, highContrast: true, fontSize: 18 });
            if (typeof global.syncAssistSettingsToIframe === 'function') global.syncAssistSettingsToIframe();
            if (typeof global.updateAssistStatus === 'function') global.updateAssistStatus();
          }
        } catch (err) {
          console.warn('应用演示无障碍预设失败', err);
        }
      }
      if (step.action === 'loginAndOpenChat') {
        this.loginDemoUser().then(function() {
          if (typeof global.chatTap === 'function') {
            global.chatTap();
          }
        }).catch(function(err) {
          console.warn('演示账号登录失败', err);
          safeAnnounce('演示账号自动登录失败，可按文档中的账号手动登录');
        });
      }
    },

    loginDemoUser: function() {
      var base = global.__API_BASE_URL__ || ((global.location.origin || '') + '/springbootmf383/');
      var loginUrl = base + 'yonghu/login?username=demo_user&password=demo123';
      return fetch(loginUrl, {
        method: 'GET',
        credentials: 'same-origin'
      }).then(function(res) {
        return res.json();
      }).then(function(json) {
        if (!json || json.code !== 0 || !json.token) {
          throw new Error((json && json.msg) || '登录失败');
        }
        localStorage.setItem('Token', json.token);
        localStorage.setItem('role', '用户');
        localStorage.setItem('userTable', 'yonghu');
        localStorage.setItem('sessionTable', 'yonghu');
        localStorage.setItem('adminName', 'demo_user');
        return fetch(base + 'yonghu/session', {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            Token: json.token
          }
        });
      }).then(function(res) {
        return res.json();
      }).then(function(json) {
        if (json && json.data && json.data.id) {
          localStorage.setItem('userid', json.data.id);
        }
        safeAnnounce('演示账号已自动登录，正在打开在线提问');
        return json;
      });
    }
  };

  global.DemoPresentationService = DemoPresentationService;
  global.openDemoMode = function(options) {
    DemoPresentationService.open(options || {});
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { DemoPresentationService.init(); });
  } else {
    DemoPresentationService.init();
  }
})(window);
