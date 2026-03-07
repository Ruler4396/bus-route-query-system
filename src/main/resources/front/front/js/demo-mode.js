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

  function wait(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }

  function getFrameWindow() {
    var iframe = byId('iframe');
    return iframe && iframe.contentWindow ? iframe.contentWindow : null;
  }

  function getFrameDocument() {
    try {
      var win = getFrameWindow();
      return win && win.document ? win.document : null;
    } catch (err) {
      return null;
    }
  }

  function setRunnerStatus(text) {
    var statusNode = byId('assistStatusText');
    if (statusNode) {
      statusNode.textContent = text;
    }
  }

  function syncAssistSettings() {
    try {
      if (typeof global.syncAssistSettingsToIframe === 'function') {
        global.syncAssistSettingsToIframe();
      }
      if (typeof global.updateAssistStatus === 'function') {
        global.updateAssistStatus();
      }
    } catch (err) {
      console.warn('同步演示无障碍设置失败', err);
    }
  }

  function fireInputEvents(node) {
    if (!node) return;
    ['input', 'change', 'blur'].forEach(function(type) {
      node.dispatchEvent(new Event(type, { bubbles: true }));
    });
  }

  async function waitForFrameSelector(selector, timeoutMs) {
    var timeout = timeoutMs || 15000;
    var started = Date.now();
    while (Date.now() - started < timeout) {
      var doc = getFrameDocument();
      if (doc && doc.querySelector(selector)) {
        return doc.querySelector(selector);
      }
      await wait(160);
    }
    throw new Error('FRAME_SELECTOR_TIMEOUT: ' + selector);
  }

  async function setFrameValue(selector, value) {
    var node = await waitForFrameSelector(selector, 12000);
    node.focus();
    node.value = value;
    fireInputEvents(node);
    return node;
  }

  async function setFrameSelectValue(selector, value) {
    var node = await waitForFrameSelector(selector, 12000);
    node.value = value;
    fireInputEvents(node);
    return node;
  }

  async function clickFrame(selector) {
    var node = await waitForFrameSelector(selector, 12000);
    node.click();
    return node;
  }

  var steps = [
    {
      id: 'intro',
      title: '首页总览：项目定位与试点边界',
      url: './pages/home/home.html',
      durationLabel: '建议 55 秒',
      autoplayMs: 4200,
      coverage: ['首页总览', '目标用户', '试点范围'],
      notes: [
        '说明首轮主服务人群是轮椅/行动不便，次服务人群是低视力。',
        '强调当前只承诺广州老城区公共服务走廊试点，不宣传广州全城都已可信可用。'
      ]
    },
    {
      id: 'assist',
      title: '无障碍快捷控制：高对比、大字体与键盘导航',
      url: './pages/home/home.html',
      durationLabel: '建议 60 秒',
      autoplayMs: 5200,
      coverage: ['高对比度', '大字体', '键盘导航'],
      notes: [
        '像手动测试一样演示高对比度和大字体效果。',
        '展示完成后自动恢复默认观感，避免影响后续页面录制。'
      ],
      action: 'demoAssistControls'
    },
    {
      id: 'route-list',
      title: '路线规划与可达路线清单',
      url: './pages/gongjiaoluxian/list.html',
      durationLabel: '建议 70 秒',
      autoplayMs: 5200,
      coverage: ['路线列表', '服务画像', '无障碍推荐'],
      notes: [
        '自动切换服务画像和推荐偏好，触发一次无障碍推荐。',
        '验证路线页在演示环境下可以正常交互。'
      ],
      action: 'demoRoutePlanning'
    },
    {
      id: 'map',
      title: '实时线路地图与站点核验',
      url: './pages/gongjiaoluxian/map.html',
      durationLabel: '建议 75 秒',
      autoplayMs: 5600,
      coverage: ['地图展示', '站点定位', '车辆切换'],
      notes: [
        '自动选择一条试点路线，并点击站点、切换车辆显示。',
        '展示地图页可用，而不是停在静态画面。'
      ],
      action: 'demoMap'
    },
    {
      id: 'announcements',
      title: '出行服务公告：搜索与卡片阅读',
      url: './pages/wangzhangonggao/list.html',
      durationLabel: '建议 45 秒',
      autoplayMs: 4400,
      coverage: ['公告搜索', '卡片摘要'],
      notes: [
        '自动填写公告关键词并触发搜索，再恢复默认列表。'
      ],
      action: 'demoAnnouncementSearch'
    },
    {
      id: 'resources',
      title: '无障碍资源链接：数据来源核查',
      url: './pages/youqinglianjie/list.html',
      durationLabel: '建议 45 秒',
      autoplayMs: 4400,
      coverage: ['资源搜索', '数据来源'],
      notes: [
        '自动搜索 Wheelmap 等资源关键词，验证资源页可用。'
      ],
      action: 'demoResourceSearch'
    },
    {
      id: 'messages',
      title: '留言与改进建议：反馈闭环测试',
      url: './pages/messages/list.html',
      durationLabel: '建议 50 秒',
      autoplayMs: 7800,
      coverage: ['反馈提交', '处理看板', '审核保存'],
      notes: [
        '像人工巡检一样自动提交一条演示反馈，再进入处理看板保存处理结果。'
      ],
      action: 'demoFeedbackLoop'
    },
    {
      id: 'settings',
      title: '无障碍设置页：开关效果验证',
      url: './pages/accessibility/settings.html',
      durationLabel: '建议 55 秒',
      autoplayMs: 5000,
      coverage: ['高对比', '减少动态', '字幕'],
      notes: [
        '自动打开关键开关并恢复默认状态，避免影响后续观感。'
      ],
      action: 'demoSettings'
    },
    {
      id: 'login-center',
      title: '登录态扩展示范：演示账号与个人中心',
      url: './pages/home/home.html',
      durationLabel: '建议 60 秒',
      autoplayMs: 5200,
      coverage: ['演示账号', '登录态', '个人中心'],
      notes: [
        '演示模式会静默登录 demo_user / demo123，并跳转个人中心。',
        '不再弹出额外窗口，而是像人工巡检一样在主流程中完成。'
      ],
      action: 'demoLoginCenter'
    },
    {
      id: 'summary',
      title: '总结：当前完成度与后续工作',
      url: './pages/home/home.html',
      durationLabel: '建议 60 秒',
      autoplayMs: 4200,
      coverage: ['阶段成果', '边界说明'],
      notes: [
        '回到首页收束演示，并恢复默认显示设置。'
      ],
      action: 'restoreAssistiveDefaults'
    }
  ];

  var DemoPresentationService = {
    isRunning: false,
    isAutoplay: false,
    currentIndex: 0,
    timerId: null,
    baseSettings: null,
    lastStatusText: '',

    init: function() {
      if (!shellAvailable()) return;
      this.handleQueryStart();
    },

    handleQueryStart: function() {
      try {
        var params = new URLSearchParams(global.location.search || '');
        if (params.get('demo') === '1' || params.get('demo') === 'auto') {
          var self = this;
          setTimeout(function() {
            self.open({ autoplay: true, source: 'query-auto' });
          }, 800);
        }
      } catch (err) {
        console.warn('解析演示模式 query 参数失败', err);
      }
    },

    open: function(options) {
      options = options || {};
      if (this.isRunning) {
        this.close('演示模式已停止');
        return;
      }
      this.isRunning = true;
      document.body.setAttribute('data-demo-running', 'true');
      this.isAutoplay = options.autoplay !== false;
      this.currentIndex = 0;
      this.lastStatusText = byId('assistStatusText') ? byId('assistStatusText').textContent : '';
      this.baseSettings = global.AccessibilityUtils && typeof global.AccessibilityUtils.getSettings === 'function'
        ? global.AccessibilityUtils.getSettings()
        : null;
      safeAnnounce('演示模式已启动，将按人工巡检顺序自动检查页面与功能。');
      this.runCurrentStep();
    },

    close: function(message) {
      clearTimeout(this.timerId);
      this.timerId = null;
      this.isRunning = false;
      document.body.setAttribute('data-demo-running', 'false');
      document.body.removeAttribute('data-demo-step');
      this.isAutoplay = false;
      closeTransientLayers();
      this.restoreAssistiveDefaults();
      if (typeof global.updateAssistStatus === 'function') {
        global.updateAssistStatus();
      } else if (this.lastStatusText) {
        setRunnerStatus(this.lastStatusText);
      }
      safeAnnounce(message || '演示模式已关闭');
    },

    finish: function() {
      clearTimeout(this.timerId);
      this.timerId = null;
      this.isRunning = false;
      document.body.setAttribute('data-demo-running', 'false');
      document.body.removeAttribute('data-demo-step');
      this.isAutoplay = false;
      this.restoreAssistiveDefaults();
      setRunnerStatus('演示流程已完成，可按 Alt + D 重新开始。');
      safeAnnounce('演示流程已完成，已恢复默认显示设置。');
      var self = this;
      setTimeout(function() {
        if (!self.isRunning && typeof global.updateAssistStatus === 'function') {
          global.updateAssistStatus();
        }
      }, 2200);
    },

    scheduleNext: function(delay) {
      var self = this;
      clearTimeout(this.timerId);
      this.timerId = setTimeout(function() {
        if (!self.isRunning) return;
        if (self.currentIndex >= steps.length - 1) {
          self.finish();
          return;
        }
        self.currentIndex += 1;
        self.runCurrentStep();
      }, delay || 4200);
    },

    async runCurrentStep() {
      if (!this.isRunning) return;
      var step = steps[this.currentIndex];
      document.body.setAttribute('data-demo-step', step ? step.id : '');
      if (!step) {
        this.finish();
        return;
      }
      closeTransientLayers();
      setRunnerStatus('演示步骤 ' + (this.currentIndex + 1) + '/' + steps.length + '：' + step.title);
      safeAnnounce('开始演示：' + step.title);
      if (step.url && typeof global.navPage === 'function') {
        global.navPage(step.url);
      }
      await wait(1100);
      try {
        await this.runStepAction(step);
      } catch (err) {
        console.warn('演示步骤执行失败', step.id, err);
        safeAnnounce('演示步骤执行失败：' + step.title + '，已继续后续步骤。');
      }
      if (!this.isRunning) return;
      if (this.isAutoplay) {
        this.scheduleNext(step.autoplayMs || 4200);
      }
    },

    async runStepAction(step) {
      switch (step.action) {
        case 'demoAssistControls':
          await this.demoAssistControls();
          break;
        case 'demoRoutePlanning':
          await this.demoRoutePlanning();
          break;
        case 'demoMap':
          await this.demoMap();
          break;
        case 'demoAnnouncementSearch':
          await this.demoAnnouncementSearch();
          break;
        case 'demoResourceSearch':
          await this.demoResourceSearch();
          break;
        case 'demoFeedbackLoop':
          await this.demoFeedbackLoop();
          break;
        case 'demoSettings':
          await this.demoSettings();
          break;
        case 'demoLoginCenter':
          await this.demoLoginCenter();
          break;
        case 'restoreAssistiveDefaults':
          this.restoreAssistiveDefaults();
          break;
        default:
          break;
      }
    },

    restoreAssistiveDefaults: function() {
      try {
        if (global.AccessibilityUtils && this.baseSettings) {
          global.AccessibilityUtils.saveSettings(this.baseSettings);
          syncAssistSettings();
        }
      } catch (err) {
        console.warn('恢复演示默认设置失败', err);
      }
    },

    async demoAssistControls() {
      if (!global.AccessibilityUtils || !this.baseSettings) return;
      global.AccessibilityUtils.enableHighContrast();
      syncAssistSettings();
      await wait(900);
      global.AccessibilityUtils.setFontSize(Math.min((this.baseSettings.fontSize || 14) + 4, 20));
      syncAssistSettings();
      await wait(900);
      global.AccessibilityUtils.disableHighContrast();
      global.AccessibilityUtils.setFontSize(this.baseSettings.fontSize || 14);
      syncAssistSettings();
      await wait(360);
    },

    async demoRoutePlanning() {
      await waitForFrameSelector('#profileType', 15000);
      await setFrameValue('#qidianzhanming', '东山口');
      await setFrameValue('#zhongdianzhanming', '芳村花园');
      await setFrameSelectValue('#profileType', 'LOW_VISION');
      await setFrameSelectValue('#preferenceType', 'ACCESSIBLE');
      await clickFrame('#btn-plan');
      await wait(1800);
    },

    async demoMap() {
      var select = await waitForFrameSelector('#routeSelect', 15000);
      if (select && select.options && select.options.length > 1) {
        select.value = select.options[1].value;
        fireInputEvents(select);
      }
      await wait(1600);
      var stationButton = getFrameDocument() && getFrameDocument().querySelector('.station-item-btn');
      if (stationButton) {
        stationButton.click();
        await wait(900);
      }
      var vehicleBtn = getFrameDocument() && getFrameDocument().querySelector('#vehicleBtn');
      if (vehicleBtn) {
        vehicleBtn.click();
        await wait(1200);
        vehicleBtn.click();
      }
      await wait(600);
    },

    async demoAnnouncementSearch() {
      await setFrameValue('#biaoti', '试点');
      await clickFrame('#btn-search');
      await wait(1200);
      await setFrameValue('#biaoti', '');
      await clickFrame('#btn-search');
      await wait(500);
    },

    async demoResourceSearch() {
      await setFrameValue('#lianjiemingcheng', 'Wheelmap');
      await clickFrame('#btn-search');
      await wait(1200);
      await setFrameValue('#lianjiemingcheng', '');
      await clickFrame('#btn-search');
      await wait(500);
    },

    async demoFeedbackLoop() {
      var marker = new Date().toISOString().replace('T', ' ').slice(0, 19);
      await waitForFrameSelector('textarea[name="content"]', 15000);
      await setFrameValue('textarea[name="content"]', '演示巡检反馈：自动验证留言流程是否可用（' + marker + '）');
      await setFrameSelectValue('#feedbackType', 'PAGE_USABILITY');
      await setFrameSelectValue('#severityLevel', 'LOW');
      await setFrameValue('input[name="routeName"]', '1路');
      await setFrameValue('input[name="stationName"]', '东山口');
      await clickFrame('#messageSubmitBtn');
      await wait(2200);
      await clickFrame('#messageReviewBoardBtn');
      await waitForFrameSelector('#reviewBoardStatus', 15000);
      var doc = getFrameDocument();
      var select = doc.querySelector('select');
      if (select) {
        select.value = 'IN_REVIEW';
        fireInputEvents(select);
      }
      var owner = doc.querySelector('input[placeholder="审核人"]');
      if (owner) {
        owner.value = '演示巡检';
        fireInputEvents(owner);
      }
      var notes = doc.querySelector('input[placeholder="审核备注"]');
      if (notes) {
        notes.value = '已完成自动化演示检查';
        fireInputEvents(notes);
      }
      var saveBtn = Array.prototype.find.call(doc.querySelectorAll('button'), function(node) {
        return (node.textContent || '').indexOf('保存处理') >= 0;
      });
      if (saveBtn) {
        saveBtn.click();
      }
      await wait(1500);
    },

    async demoSettings() {
      await waitForFrameSelector('#contrastToggle', 15000);
      var doc = getFrameDocument();
      ['#contrastToggle', '#motionToggle', '#captionToggle'].forEach(function(selector) {
        var node = doc.querySelector(selector);
        if (node && !node.checked) {
          node.click();
        }
      });
      await wait(900);
      ['#contrastToggle', '#motionToggle', '#captionToggle'].forEach(function(selector) {
        var node = doc.querySelector(selector);
        if (node && node.checked) {
          node.click();
        }
      });
      await wait(600);
    },

    async demoLoginCenter() {
      await this.loginDemoUser();
      if (typeof global.navPage === 'function') {
        global.navPage('./pages/yonghu/center.html');
      }
      await wait(1800);
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
        safeAnnounce('演示账号已自动登录，正在进入个人中心。');
        return json;
      }).catch(function(err) {
        console.warn('演示账号登录失败', err);
        safeAnnounce('演示账号自动登录失败，可手动使用 demo_user / demo123 登录。');
        throw err;
      });
    }
  };

  global.DemoPresentationService = DemoPresentationService;
  global.openDemoMode = function(options) {
    DemoPresentationService.open(options || {});
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      DemoPresentationService.init();
    });
  } else {
    DemoPresentationService.init();
  }
})(window);
