(function(global) {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
  }

  function shellAvailable() {
    return !!byId('iframe') && typeof global.navPage === 'function';
  }

  function safeAnnounce(message, options) {
    try {
      if (global.AccessibilityUtils && typeof global.AccessibilityUtils.announce === 'function') {
        global.AccessibilityUtils.announce(message, 'polite', options || {});
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

  function stripText(text) {
    return String(text || '').replace(/\s+/g, '');
  }

  function readAuthState() {
    return {
      Token: localStorage.getItem('Token'),
      role: localStorage.getItem('role'),
      userTable: localStorage.getItem('userTable'),
      sessionTable: localStorage.getItem('sessionTable'),
      adminName: localStorage.getItem('adminName'),
      userid: localStorage.getItem('userid'),
      vip: localStorage.getItem('vip')
    };
  }

  function applyAuthState(state) {
    state = state || {};
    ['Token','role','userTable','sessionTable','adminName','userid','vip'].forEach(function(key) {
      if (state[key]) {
        localStorage.setItem(key, state[key]);
      } else {
        localStorage.removeItem(key);
      }
    });
  }

  function clearAuthState() {
    applyAuthState({});
  }

  function scrollShellPageTo(offset) {
    var iframe = byId('iframe');
    if (!iframe) return;
    var rect = iframe.getBoundingClientRect();
    var top = (window.scrollY || window.pageYOffset || 0) + rect.top + (offset || 0);
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function setRunnerStatus(text) {
    document.body.setAttribute('data-demo-status-text', text || '');
    if (typeof global.updateAssistStatus === 'function') {
      global.updateAssistStatus();
      return;
    }
    var statusNode = byId('assistStatusText');
    if (statusNode) {
      statusNode.textContent = text;
    }
  }

  function fireInputEvents(node) {
    if (!node) return;
    ['input', 'change', 'blur'].forEach(function(type) {
      node.dispatchEvent(new Event(type, { bubbles: true }));
    });
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

  var steps = [
    {
      id: 'intro',
      title: '首页总览：目标用户与试点边界',
      url: './pages/home/home.html',
      targetMs: 50000
    },
    {
      id: 'assist',
      title: '全站快捷控制：逐个验证关键按钮',
      url: './pages/home/home.html',
      targetMs: 60000
    },
    {
      id: 'route-wheelchair',
      title: '轮椅用户路线规划：医院 / 政务服务场景',
      url: './pages/gongjiaoluxian/list.html',
      targetMs: 65000
    },
    {
      id: 'route-lowvision',
      title: '低视力用户路线规划：文本理解与分段确认',
      url: './pages/gongjiaoluxian/list.html',
      targetMs: 60000
    },
    {
      id: 'map',
      title: '地图与站点核验：多条线路切换',
      url: './pages/gongjiaoluxian/map.html',
      targetMs: 65000
    },
    {
      id: 'announcements',
      title: '服务公告：搜索、详情与边界说明',
      url: './pages/wangzhangonggao/list.html',
      targetMs: 45000
    },
    {
      id: 'resources',
      title: '资源链接：数据来源与辅助服务入口',
      url: './pages/youqinglianjie/list.html',
      targetMs: 45000
    },
    {
      id: 'messages',
      title: '反馈闭环：用户提报到审核处理',
      url: './pages/messages/list.html',
      targetMs: 70000
    },
    {
      id: 'settings',
      title: '无障碍设置：预设与开关逐项验证',
      url: './pages/accessibility/settings.html',
      targetMs: 70000
    },
    {
      id: 'login-center',
      title: '登录态扩展示范：个人中心与收藏入口',
      url: './pages/home/home.html',
      targetMs: 50000
    },
    {
      id: 'summary',
      title: '回到首页：总结完整出行支持闭环',
      url: './pages/home/home.html',
      targetMs: 50000
    }
  ];

  var DemoPresentationService = {
    isRunning: false,
    isAutoplay: false,
    currentIndex: 0,
    timerId: null,
    baseSettings: null,
    baseAuthState: null,
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

    pause: function(ms) {
      var self = this;
      var remaining = Math.max(0, Number(ms) || 0);
      return new Promise(function(resolve, reject) {
        function tick() {
          if (!self.isRunning) {
            reject(new Error('DEMO_STOPPED'));
            return;
          }
          if (remaining <= 0) {
            resolve();
            return;
          }
          var slice = Math.min(remaining, 220);
          remaining -= slice;
          setTimeout(tick, slice);
        }
        tick();
      });
    },

    estimateNarrationMs: function(message, minimumMs) {
      var base = stripText(message).length * 260 + 1200;
      return Math.max(minimumMs || 0, Math.min(16000, Math.max(4200, base)));
    },

    narrate: async function(message, minimumMs) {
      safeAnnounce(message, { silentSpeech: true });
      var estimate = this.estimateNarrationMs(message, minimumMs);
      if (global.AccessibilityUtils && global.AccessibilityUtils.isSpeechEnabled && global.AccessibilityUtils.isSpeechEnabled()) {
        if (typeof global.AccessibilityUtils.speakAndWait === 'function') {
          await global.AccessibilityUtils.speakAndWait(message, { rate: 1, pitch: 1, waitTimeoutMs: estimate + 4000 });
          await this.pause(600);
          return;
        }
        if (typeof global.AccessibilityUtils.waitForSpeechIdle === 'function') {
          await global.AccessibilityUtils.waitForSpeechIdle(estimate + 4000);
          await this.pause(600);
          return;
        }
      }
      await this.pause(estimate);
    },

    openStepPage: async function(url, selector, timeoutMs) {
      if (url && typeof global.navPage === 'function') {
        global.navPage(url);
      }
      await this.pause(1600);
      if (selector) {
        await this.waitForFrameSelector(selector, timeoutMs || 20000);
      }
    },

    waitForFrameSelector: async function(selector, timeoutMs) {
      var timeout = timeoutMs || 15000;
      var started = Date.now();
      while (Date.now() - started < timeout) {
        if (!this.isRunning) {
          throw new Error('DEMO_STOPPED');
        }
        var doc = getFrameDocument();
        if (doc && doc.querySelector(selector)) {
          return doc.querySelector(selector);
        }
        await this.pause(180);
      }
      throw new Error('FRAME_SELECTOR_TIMEOUT: ' + selector);
    },

    setFrameValue: async function(selector, value) {
      var node = await this.waitForFrameSelector(selector, 15000);
      node.focus();
      node.value = value;
      fireInputEvents(node);
      await this.pause(320);
      return node;
    },

    setFrameSelectValue: async function(selector, value) {
      var node = await this.waitForFrameSelector(selector, 15000);
      node.value = value;
      fireInputEvents(node);
      await this.pause(320);
      return node;
    },

    clickFrame: async function(selector) {
      var node = await this.waitForFrameSelector(selector, 15000);
      node.click();
      await this.pause(320);
      return node;
    },

    findFrameButtonByText: function(text) {
      var doc = getFrameDocument();
      if (!doc) return null;
      var buttons = doc.querySelectorAll('button, a[role="button"], .preset-btn');
      return Array.prototype.find.call(buttons, function(node) {
        return (node.textContent || '').indexOf(text) >= 0;
      }) || null;
    },

    scrollFrameTo: async function(top) {
      var win = getFrameWindow();
      if (win && typeof win.scrollTo === 'function') {
        win.scrollTo({ top: Math.max(0, top || 0), behavior: 'smooth' });
        await this.pause(1200);
      }
    },

    scrollFrameToBottom: async function() {
      var doc = getFrameDocument();
      var win = getFrameWindow();
      if (!doc || !win) return;
      var height = Math.max(doc.documentElement.scrollHeight || 0, doc.body ? doc.body.scrollHeight || 0 : 0);
      win.scrollTo({ top: height, behavior: 'smooth' });
      await this.pause(1400);
    },

    scrollFrameElementIntoView: async function(selector) {
      var node = await this.waitForFrameSelector(selector, 12000);
      if (node && node.scrollIntoView) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.pause(1000);
      }
      return node;
    },

    clickAssist: async function(id) {
      var node = byId(id);
      if (!node) return;
      node.click();
      await this.pause(600);
    },

    open: function(options) {
      options = options || {};
      if (this.isRunning) {
        this.close('演示模式已停止');
        return;
      }
      this.isRunning = true;
      document.body.setAttribute('data-demo-running', 'true');
      document.body.setAttribute('data-demo-status-text', '演示准备中');
      window.__demoMuteSystemAnnounce = true;
      this.isAutoplay = options.autoplay !== false;
      this.currentIndex = 0;
      this.lastStatusText = byId('assistStatusText') ? byId('assistStatusText').textContent : '';
      this.baseSettings = global.AccessibilityUtils && typeof global.AccessibilityUtils.getSettings === 'function'
        ? global.AccessibilityUtils.getSettings()
        : null;
      this.baseAuthState = readAuthState();
      clearAuthState();
      try {
        if (global.AccessibilityUtils && this.baseSettings) {
          global.AccessibilityUtils.saveSettings({
            speech: true,
            captionCenter: true,
            keyboardNav: true,
            highContrast: false,
            reducedMotion: false,
            fontSize: Math.max(this.baseSettings.fontSize || 14, 16),
            haptic: this.baseSettings.haptic
          });
          syncAssistSettings();
        }
      } catch (err) {
        console.warn('初始化演示设置失败', err);
      }
      safeAnnounce('自动演示已启动，将按残障用户实际使用流程逐页验证功能。');
      this.runCurrentStep();
    },

    close: function(message) {
      clearTimeout(this.timerId);
      this.timerId = null;
      this.isRunning = false;
      document.body.setAttribute('data-demo-running', 'false');
      document.body.removeAttribute('data-demo-step');
      document.body.removeAttribute('data-demo-status-text');
      window.__demoMuteSystemAnnounce = false;
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
      document.body.removeAttribute('data-demo-status-text');
      window.__demoMuteSystemAnnounce = false;
      this.isAutoplay = false;
      this.restoreAssistiveDefaults();
      setRunnerStatus('演示流程已完成，可按 Alt + D 重新开始。');
      safeAnnounce('演示流程已完成，已恢复默认显示设置。');
      var self = this;
      setTimeout(function() {
        if (!self.isRunning && typeof global.updateAssistStatus === 'function') {
          global.updateAssistStatus();
        }
      }, 2000);
    },

    restoreAssistiveDefaults: function() {
      try {
        if (global.AccessibilityUtils && this.baseSettings) {
          global.AccessibilityUtils.saveSettings(this.baseSettings);
          syncAssistSettings();
        }
        if (this.baseAuthState) {
          applyAuthState(this.baseAuthState);
        }
      } catch (err) {
        console.warn('恢复演示默认设置失败', err);
      }
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
      }, delay || 400);
    },

    runCurrentStep: async function() {
      if (!this.isRunning) return;
      var step = steps[this.currentIndex];
      if (!step) {
        this.finish();
        return;
      }
      var started = Date.now();
      document.body.setAttribute('data-demo-step', step.id);
      closeTransientLayers();
      setRunnerStatus('演示步骤 ' + (this.currentIndex + 1) + '/' + steps.length + '：' + step.title);
      safeAnnounce('开始演示：' + step.title, { silentSpeech: true });
      if (step.url && typeof global.navPage === 'function') {
        global.navPage(step.url);
      }
      try {
        await this.pause(1800);
        await this.runStepAction(step);
        var remain = (step.targetMs || 45000) - (Date.now() - started);
        if (remain > 0) {
          await this.pause(remain);
        }
      } catch (err) {
        if (err && err.message !== 'DEMO_STOPPED') {
          console.warn('演示步骤执行失败', step.id, err);
          safeAnnounce('演示步骤执行失败：' + step.title + '，已继续后续步骤。', { silentSpeech: true });
        }
      }
      if (!this.isRunning) return;
      if (this.isAutoplay) {
        this.scheduleNext(500);
      }
    },

    runStepAction: async function(step) {
      switch (step.id) {
        case 'intro':
          await this.performIntro();
          break;
        case 'assist':
          await this.performAssistDeck();
          break;
        case 'route-wheelchair':
          await this.performWheelchairRoute();
          break;
        case 'route-lowvision':
          await this.performLowVisionRoute();
          break;
        case 'map':
          await this.performMapWalkthrough();
          break;
        case 'announcements':
          await this.performAnnouncementWalkthrough();
          break;
        case 'resources':
          await this.performResourceWalkthrough();
          break;
        case 'messages':
          await this.performFeedbackWalkthrough();
          break;
        case 'settings':
          await this.performSettingsWalkthrough();
          break;
        case 'login-center':
          await this.performLoginCenterWalkthrough();
          break;
        case 'summary':
          await this.performSummary();
          break;
        default:
          break;
      }
    },

    performIntro: async function() {
      await this.openStepPage('./pages/home/home.html', '.hero-command-center', 20000);
      await this.narrate('先从首页开始。残障人士使用系统的第一步不是盲目出发，而是先确认目标用户范围和试点边界，避免被误导成全城都已无障碍。', 8500);
      await this.scrollFrameTo(0);
      await this.narrate('首页保留了统一卡片式的路线、公告和资源入口，删掉了影响判断的冗长说明，方便轮椅用户和低视力用户快速找到下一步操作。', 9000);
      await this.scrollFrameElementIntoView('#route-recommend-title');
      await this.narrate('在真实使用场景里，用户通常会先看推荐路线，再去看公告边界和资源入口，所以演示也按这个顺序推进。', 7600);
      await this.scrollFrameToBottom();
    },

    performAssistDeck: async function() {
      await this.openStepPage('./pages/home/home.html', '.hero-command-center', 20000);
      await this.narrate('第二步演示全站快捷控制。这些按钮是残障人士真正需要的即时帮助入口，所以我们逐个切换，确认效果可见、可恢复。', 9000);
      await this.clickAssist('assistHighContrast');
      await this.narrate('先打开高对比度，模拟低视力用户在光照复杂环境下提升识别度。', 6500);
      await this.clickAssist('assistFontPlus');
      await this.narrate('再放大字体，让按钮、说明和列表在不放大浏览器的情况下也更清楚。', 6500);
      await this.clickAssist('assistCaption');
      await this.narrate('字幕提示面板适合听障用户或不方便开声音的环境，重要提示不能只靠语音。', 7200);
      await this.clickAssist('assistMotion');
      await this.narrate('减少动态效果后，切换和动画会更克制，降低部分用户的不适感。', 6200);
      await this.clickAssist('assistKeyboard');
      await this.narrate('键盘导航可帮助上肢操作不便或依赖键盘辅助设备的用户完成切换。', 6500);
      await this.clickAssist('assistShortcutHelp');
      await this.pause(3200);
      await this.clickAssist('assistMotion');
      await this.clickAssist('assistCaption');
      await this.clickAssist('assistFontMinus');
      await this.clickAssist('assistHighContrast');
      await this.clickAssist('assistSpeech');
      await this.pause(1200);
      await this.clickAssist('assistSpeech');
      await this.narrate('演示结束后，我们把高对比和放大字体恢复，避免影响后续页面观感。', 7200);
    },

    performWheelchairRoute: async function() {
      await this.openStepPage('./pages/gongjiaoluxian/list.html', '#qidianzhanming', 20000);
      await this.narrate('现在进入轮椅用户场景。假设用户要从东山口前往芳村花园附近的公共服务点，系统需要优先筛掉关键无障碍信息不足的路线。', 9200);
      await this.setFrameValue('#luxianmingcheng', '');
      await this.setFrameValue('#qidianzhanming', '东山口');
      await this.setFrameValue('#zhongdianzhanming', '芳村花园');
      await this.setFrameSelectValue('#profileType', 'WHEELCHAIR');
      await this.setFrameSelectValue('#preferenceType', 'ACCESSIBLE');
      await this.clickFrame('#btn-plan');
      await this.pause(2200);
      await this.scrollFrameElementIntoView('.route-plan-summary');
      await this.narrate('这里会展示推荐理由、已过滤路线以及门到门分段结果，重点告诉轮椅用户哪些路段安全，哪些地方仍待核查。', 8800);
      await this.scrollFrameElementIntoView('.list .list-item');
      await this.narrate('在卡片列表本身，用户就能继续核对路线等级、起终点和关键风险，不必被迫跳转才能理解结果。', 7800);
    },

    performLowVisionRoute: async function() {
      await this.openStepPage('./pages/gongjiaoluxian/list.html', '#qidianzhanming', 20000);
      await this.narrate('接下来切换到低视力用户场景。此时更重要的是文本说明、分段提示和高可辨识的推荐排序。', 8400);
      await this.setFrameValue('#luxianmingcheng', '');
      await this.setFrameValue('#qidianzhanming', '如意坊');
      await this.setFrameValue('#zhongdianzhanming', '东山龟岗');
      await this.setFrameSelectValue('#profileType', 'LOW_VISION');
      await this.setFrameSelectValue('#preferenceType', 'AUTO');
      await this.clickFrame('#btn-plan');
      await this.pause(2200);
      await this.scrollFrameElementIntoView('.route-segment-list');
      await this.narrate('系统会把起点步行、上车、乘车、换乘和终点入口分开写清楚，这样用户即使看不清地图，也能理解实际出行过程。', 9000);
      await this.scrollFrameElementIntoView('.list .list-item');
      await this.narrate('低视力用户可以继续依赖卡片中的文字信息和分段提示，而不必强依赖地图定位。', 7600);
    },

    performMapWalkthrough: async function() {
      await this.openStepPage('./pages/gongjiaoluxian/map.html', '#routeSelect', 20000);
      scrollShellPageTo(220);
      await this.pause(1200);
      await this.narrate('路线确认之后，用户还需要在地图上核对站点顺序、相对位置和预计到站信息。这里我们切换多条试点线路，验证不是只支持一条演示线。', 9500);
      var select = await this.waitForFrameSelector('#routeSelect', 12000);
      var routeTexts = Array.prototype.map.call(select.options || [], function(option) {
        return option.textContent || '';
      });
      function pickValueByKeyword(keyword) {
        var idx = routeTexts.findIndex(function(text) { return text.indexOf(keyword) >= 0; });
        return idx >= 0 ? select.options[idx].value : '';
      }
      var firstValue = pickValueByKeyword('1路') || (select.options[1] && select.options[1].value);
      if (firstValue) {
        select.value = firstValue;
        fireInputEvents(select);
        await this.pause(1800);
      }
      var stationBtn = getFrameDocument().querySelector('.station-item-btn');
      if (stationBtn) {
        stationBtn.click();
        await this.pause(1200);
      }
      var fitBtn = getFrameDocument().querySelector('.btn-primary');
      if (fitBtn) {
        fitBtn.click();
        await this.pause(1200);
      }
      var vehicleBtn = getFrameDocument().querySelector('#vehicleBtn');
      if (vehicleBtn) {
        vehicleBtn.click();
        await this.pause(1800);
        vehicleBtn.click();
        await this.pause(1200);
      }
      var route31 = pickValueByKeyword('31路');
      if (route31) {
        select.value = route31;
        fireInputEvents(select);
        await this.pause(1800);
      }
      await this.narrate('通过地图切换 1 路和 31 路，用户可以确认站点分布与车辆状态，从而把抽象推荐结果落到具体空间位置上。', 9000);
    },

    performAnnouncementWalkthrough: async function() {
      await this.openStepPage('./pages/wangzhangonggao/list.html', '#biaoti', 20000);
      await this.narrate('出行服务公告页不是装饰页，而是用来告诉用户当前试点边界、演示账号和注意事项。先演示关键词搜索，再看一条公告详情。', 9000);
      await this.setFrameValue('#biaoti', '试点');
      await this.clickFrame('#btn-search');
      await this.pause(1800);
      var item = await this.waitForFrameSelector('.list .list-item', 12000);
      item.click();
      await this.pause(1800);
      await this.scrollFrameTo(260);
      await this.narrate('对于残障用户来说，提前知道哪些线路已核验、哪些仍是演示范围，本身就是减少误导的重要服务。', 8200);
    },

    performResourceWalkthrough: async function() {
      await this.openStepPage('./pages/youqinglianjie/list.html', '#lianjiemingcheng', 20000);
      await this.narrate('资源链接页用于告诉用户和答辩老师：系统背后依赖哪些公开数据源，以及后续可以去哪里补充人工核验。', 8600);
      await this.setFrameValue('#lianjiemingcheng', 'Wheelmap');
      await this.clickFrame('#btn-search');
      await this.pause(1800);
      var item = await this.waitForFrameSelector('.list .list-item', 12000);
      item.click();
      await this.pause(1800);
      await this.scrollFrameTo(260);
      await this.narrate('像 Wheelmap、OpenStreetMap、开放广东这样的资源，是构建无障碍出行系统不可缺少的基础。', 7800);
    },

    performFeedbackWalkthrough: async function() {
      await this.openStepPage('./pages/messages/list.html', 'textarea[name="content"]', 20000);
      var marker = new Date().toISOString().replace('T', ' ').slice(0, 19);
      await this.narrate('如果用户在现场发现盲道中断、电梯无法使用或页面信息不准，就需要通过反馈闭环把问题沉淀回来。', 8800);
      await this.setFrameValue('textarea[name="content"]', '演示巡检反馈：轮椅用户在换乘点需要再次确认电梯状态（' + marker + '）');
      await this.setFrameSelectValue('#feedbackType', 'FACILITY_ABNORMAL');
      await this.setFrameSelectValue('#severityLevel', 'MEDIUM');
      await this.setFrameValue('input[name="routeName"]', '31路');
      await this.setFrameValue('input[name="stationName"]', '海珠广场');
      await this.clickFrame('#messageSubmitBtn');
      await this.pause(2400);
      await this.scrollFrameToBottom();
      await this.narrate('提交后，再进入反馈处理看板，让系统像真实运维一样完成审核和状态更新。', 7600);
      await this.clickFrame('#messageReviewBoardBtn');
      await this.waitForFrameSelector('#reviewBoardStatus', 15000);
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
        notes.value = '已转为待核验设施问题';
        fireInputEvents(notes);
      }
      var saveBtn = Array.prototype.find.call(doc.querySelectorAll('button'), function(node) {
        return (node.textContent || '').indexOf('保存处理') >= 0;
      });
      if (saveBtn) {
        saveBtn.click();
        await this.pause(1800);
      }
      await this.narrate('这样残障用户报告的问题，才能变成下一次出行前真正被修复或被标记的风险点。', 7600);
    },

    performSettingsWalkthrough: async function() {
      await this.openStepPage('./pages/accessibility/settings.html', '.preset-btn', 20000);
      await this.narrate('最后进入设置页做逐项验证。这里特别演示不同预设的差异，确保不是所有预设都强制打开高对比度。', 9000);
      var lowVisionBtn = this.findFrameButtonByText('低视力预设');
      if (lowVisionBtn) {
        lowVisionBtn.click();
        await this.pause(1800);
      }
      await this.narrate('低视力预设会开启高对比度、大字号和字幕提示，这是为了阅读清晰。', 7200);
      var hearingBtn = this.findFrameButtonByText('听障预设');
      if (hearingBtn) {
        hearingBtn.click();
        await this.pause(1800);
      }
      await this.narrate('听障预设重点是字幕和减少动态，不应该把页面强制锁定在高对比度。', 7600);
      var mobilityBtn = this.findFrameButtonByText('行动不便预设');
      if (mobilityBtn) {
        mobilityBtn.click();
        await this.pause(1800);
      }
      await this.narrate('行动不便预设更关注键盘导航、触觉反馈和较大的字号，也不应该强制高对比。', 7600);
      var contrastToggle = await this.waitForFrameSelector('#contrastToggle', 12000);
      if (contrastToggle.checked) {
        contrastToggle.click();
        await this.pause(1200);
      }
      var motionToggle = await this.waitForFrameSelector('#motionToggle', 12000);
      if (!motionToggle.checked) {
        motionToggle.click();
        await this.pause(1000);
        motionToggle.click();
        await this.pause(800);
      }
      var captionToggle = await this.waitForFrameSelector('#captionToggle', 12000);
      if (!captionToggle.checked) {
        captionToggle.click();
        await this.pause(800);
      }
      await this.narrate('预设只是起点，用户仍然可以手动关闭高对比度、切换减少动态或字幕提示，找到最适合自己的组合。', 8600);
      var resetBtn = this.findFrameButtonByText('恢复默认');
      if (resetBtn) {
        resetBtn.click();
        await this.pause(1600);
      }
    },

    performLoginCenterWalkthrough: async function() {
      await this.narrate('接下来展示登录态扩展。演示账号登录后，用户可以查看个人中心、收藏记录和后续个性化服务入口。', 8600);
      await this.loginDemoUser();
      if (typeof global.navPage === 'function') {
        global.navPage('./pages/yonghu/center.html');
      }
      await this.pause(2200);
      await this.scrollFrameTo(260);
      await this.narrate('这一步说明系统不仅有公开信息展示，还保留了登录后的个人使用链路。', 7200);
    },

    performSummary: async function() {
      await this.openStepPage('./pages/home/home.html', '.hero-command-center', 20000);
      await this.scrollFrameTo(0);
      await this.narrate('回到首页，总结一遍残障人士的真实使用路径：先打开适合自己的无障碍控制，再按画像规划路线、核对地图和公告、查看资源入口，最后通过反馈闭环修正现场问题。', 9800);
      await this.scrollFrameToBottom();
      await this.narrate('当前系统仍然不是最终答案，但至少已经形成了从准备出门到问题回报的一条完整实验链路。', 8200);
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
