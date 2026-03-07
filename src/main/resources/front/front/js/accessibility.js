/**
 * 无障碍工具库 - 公交路线查询系统
 * 使用原生JavaScript实现，不依赖框架
 * 功能：语音播报、触觉反馈、高对比度主题、键盘导航、ARIA支持
 */
(function(global) {
    'use strict';
    var BASE_FONT_SIZE = 14;

    function openViaTopNav(url) {
        try {
            if (window.top && typeof window.top.navPage === 'function') {
                window.top.navPage(url);
                return true;
            }
        } catch (e) {
            // ignore cross-window access errors
        }
        return false;
    }

    function resolveFrontUrl(relativePath) {
        var clean = String(relativePath || '').replace(/^\.\//, '');
        var path = window.location.pathname || '';
        var frontIndex = path.indexOf('/front/');
        if (frontIndex >= 0) {
            return path.substring(0, frontIndex + '/front/'.length) + clean;
        }
        return './' + clean;
    }

    // 语音播报服务
    var SpeechService = {
        synth: window.speechSynthesis,
        isEnabled: false,
        currentVoice: null,

        /**
         * 初始化语音服务
         */
        init: function() {
            if (!this.synth) {
                console.warn('当前浏览器不支持语音合成');
                return false;
            }

            // 加载保存的设置
            this.isEnabled = localStorage.getItem('accessibility_speech') === 'true';

            // 获取中文语音
            var self = this;
            var loadVoices = function() {
                var voices = self.synth.getVoices();
                for (var i = 0; i < voices.length; i++) {
                    if (voices[i].lang.indexOf('zh') === 0) {
                        self.currentVoice = voices[i];
                        break;
                    }
                }
            };

            if (self.synth.onvoiceschanged !== undefined) {
                self.synth.onvoiceschanged = loadVoices;
            }
            loadVoices();

            return true;
        },

        /**
         * 语音播报
         * @param {string} text - 要播报的文本
         * @param {Object} options - 配置选项
         */
        speak: function(text, options) {
            options = options || {};

            if (!this.synth || !this.isEnabled || !text) return;

            // 取消当前播报
            this.synth.cancel();
            if (this.synth.paused) {
                this.synth.resume();
            }

            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = options.rate || 1;
            utterance.pitch = options.pitch || 1;
            utterance.volume = options.volume || 1;

            if (this.currentVoice) {
                utterance.voice = this.currentVoice;
            }

            try {
                this.synth.speak(utterance);
            } catch (err) {
                console.warn('语音播报触发失败:', err);
            }
        },

        /**
         * 停止播报
         */
        stop: function() {
            if (this.synth) {
                this.synth.cancel();
            }
        },

        /**
         * 切换语音播报开关
         */
        toggle: function() {
            this.isEnabled = !this.isEnabled;
            localStorage.setItem('accessibility_speech', this.isEnabled);
            return this.isEnabled;
        },

        /**
         * 播报路线信息
         */
        speakRouteInfo: function(route) {
            if (!route) return;

            var text = route.luxianmingcheng + '，';
            text += '从' + route.qidianzhanming + '开往' + route.zhongdianzhanming + '，';
            text += '途经' + route.tujingzhandian + '。';

            if (route.wuzhangaijibie !== undefined) {
                var levels = ['完全无障碍', '基本无障碍', '部分障碍', '有障碍'];
                text += '无障碍级别：' + levels[route.wuzhangaijibie] || '未知' + '。';
            }

            if (route.yuyintongbao === 1) {
                text += '支持语音播报。';
            }

            if (route.mangdaozhichi === 1) {
                text += '有盲道支持。';
            }

            this.speak(text);
        },

        /**
         * 播报站点信息
         */
        speakStationInfo: function(station) {
            if (!station) return;

            var text = station.zhandianming + '站，';

            if (station.shengjiangtai === 1) {
                text += '有无障碍升降台，';
            }

            if (station.mangdao === 1) {
                text += '有盲道，';
            }

            if (station.zhuizhu === 1) {
                text += '有盲文站牌，';
            }

            if (station.zuoweishu > 0) {
                text += '有' + station.zuoweishu + '个爱心座椅，';
            }

            if (station.cesuo === 1) {
                text += '有无障碍厕所，';
            }

            text += '欢迎乘坐。';

            this.speak(text);
        }
    };

    // 触觉反馈服务
    var HapticService = {
        isEnabled: false,

        init: function() {
            this.isEnabled = localStorage.getItem('accessibility_haptic') === 'true';
            return 'vibrate' in navigator;
        },

        /**
         * 震动反馈
         * @param {number|Array} pattern - 震动模式
         */
        vibrate: function(pattern) {
            if (!this.isEnabled || !('vibrate' in navigator)) return;

            pattern = pattern || 50;
            navigator.vibrate(pattern);
        },

        /**
         * 短震动
         */
        light: function() {
            this.vibrate(20);
        },

        /**
         * 中震动
         */
        medium: function() {
            this.vibrate(50);
        },

        /**
         * 强震动
         */
        heavy: function() {
            this.vibrate([50, 100, 50]);
        },

        toggle: function() {
            this.isEnabled = !this.isEnabled;
            localStorage.setItem('accessibility_haptic', this.isEnabled);
            return this.isEnabled;
        }
    };

    // 高对比度主题服务
    var ThemeService = {
        isHighContrast: false,
        currentFontSize: BASE_FONT_SIZE,

        init: function() {
            // 加载保存的设置
            this.isHighContrast = localStorage.getItem('accessibility_high_contrast') === 'true';
            this.currentFontSize = parseInt(localStorage.getItem('accessibility_font_size'), 10) || BASE_FONT_SIZE;

            // 应用设置
            if (this.isHighContrast) {
                this.enableHighContrast();
            }
            this.setFontSize(this.currentFontSize);

            return true;
        },

        /**
         * 启用高对比度主题
         */
        enableHighContrast: function() {
            document.body.classList.add('high-contrast');
            this.isHighContrast = true;
            localStorage.setItem('accessibility_high_contrast', 'true');
        },

        /**
         * 禁用高对比度主题
         */
        disableHighContrast: function() {
            document.body.classList.remove('high-contrast');
            this.isHighContrast = false;
            localStorage.setItem('accessibility_high_contrast', 'false');
        },

        /**
         * 切换高对比度主题
         */
        toggleHighContrast: function() {
            if (this.isHighContrast) {
                this.disableHighContrast();
            } else {
                this.enableHighContrast();
            }
            return this.isHighContrast;
        },

        /**
         * 设置字体大小
         * @param {number} size - 字体大小(px)
         */
        setFontSize: function(size) {
            size = Math.max(12, Math.min(24, size));
            this.currentFontSize = size;
            document.documentElement.style.fontSize = size + 'px';
            document.documentElement.style.setProperty('--a11y-font-size', size + 'px');
            document.documentElement.style.setProperty('--a11y-font-scale', (size / BASE_FONT_SIZE).toFixed(3));
            this.applyBodyScale(size / BASE_FONT_SIZE);
            localStorage.setItem('accessibility_font_size', size);
        },

        /**
         * 应用页面整体缩放，保证大量写死px的旧模板也能响应字体调整
         * @param {number} scale - 缩放比例
         */
        applyBodyScale: function(scale) {
            var apply = function() {
                if (!document.body) return;
                var safeScale = Math.max(0.85, Math.min(1.75, Number(scale) || 1));
                document.body.style.zoom = safeScale.toFixed(2);
                document.body.setAttribute('data-a11y-font-scale', safeScale.toFixed(2));
            };
            if (document.body) {
                apply();
            } else {
                document.addEventListener('DOMContentLoaded', apply, { once: true });
            }
        },

        /**
         * 增大字体
         */
        increaseFontSize: function() {
            this.setFontSize(this.currentFontSize + 2);
        },

        /**
         * 减小字体
         */
        decreaseFontSize: function() {
            this.setFontSize(this.currentFontSize - 2);
        }
    };

    // 键盘导航服务
    var KeyboardService = {
        isEnabled: true,
        shortcuts: {},
        hasBoundListener: false,

        init: function() {
            this.isEnabled = localStorage.getItem('accessibility_keyboard_nav') !== 'false';
            this.registerDefaultShortcuts();
            this.ensureShortcutBinding();

            return true;
        },

        ensureShortcutBinding: function() {
            if (!this.hasBoundListener) {
                this.bindGlobalShortcuts();
                this.hasBoundListener = true;
            }
        },

        /**
         * 绑定全局快捷键
         */
        bindGlobalShortcuts: function() {
            var self = this;

            document.addEventListener('keydown', function(e) {
                if (!self.isEnabled) return;

                // Alt + 数字键导航
                if (e.altKey && e.key >= '1' && e.key <= '9') {
                    e.preventDefault();
                    self.executeShortcut('nav_' + e.key);
                }

                // Alt + S 搜索
                if (e.altKey && (e.key === 's' || e.key === 'S')) {
                    e.preventDefault();
                    self.focusSearch();
                }

                // Alt + H 首页
                if (e.altKey && (e.key === 'h' || e.key === 'H')) {
                    e.preventDefault();
                    self.goHome();
                }

                // Alt + M 地图
                if (e.altKey && (e.key === 'm' || e.key === 'M')) {
                    e.preventDefault();
                    self.goMap();
                }

                // Alt + A 无障碍设置
                if (e.altKey && (e.key === 'a' || e.key === 'A')) {
                    e.preventDefault();
                    self.openAccessibilitySettings();
                }

                // ESC 关闭弹窗或返回
                if (e.key === 'Escape') {
                    var modals = document.querySelectorAll('.modal, .layui-layer');
                    if (modals.length > 0) {
                        // 尝试关闭弹窗
                        if (typeof layui !== 'undefined' && layui.layer) {
                            layui.layer.closeAll();
                        }
                    }
                }
            });
        },

        /**
         * 注册快捷键
         */
        registerShortcut: function(key, callback) {
            this.shortcuts[key] = callback;
        },

        /**
         * 注册默认快捷键动作
         */
        registerDefaultShortcuts: function() {
            var self = this;
            this.registerShortcut('nav_1', function() { self.goHome(); });
            this.registerShortcut('nav_2', function() { self.goRouteList(); });
            this.registerShortcut('nav_3', function() { self.goMap(); });
            this.registerShortcut('nav_4', function() { self.goAnnouncements(); });
            this.registerShortcut('nav_5', function() { self.goAccessibility(); });
        },

        /**
         * 执行快捷键
         */
        executeShortcut: function(key) {
            if (this.shortcuts[key]) {
                this.shortcuts[key]();
            }
        },

        /**
         * 聚焦搜索框
         */
        focusSearch: function() {
            var searchInput = document.querySelector('input[name="luxianmingcheng"]');
            if (searchInput) {
                searchInput.focus();
                AccessibilityUtils.announce('已聚焦到搜索框');
            }
        },

        /**
         * 打开无障碍设置
         */
        openAccessibilitySettings: function() {
            this.goAccessibility();
        },

        goHome: function() {
            if (!openViaTopNav('./pages/home/home.html')) {
                window.location.href = resolveFrontUrl('index.html');
            }
        },

        goRouteList: function() {
            if (!openViaTopNav('./pages/gongjiaoluxian/list.html')) {
                window.location.href = resolveFrontUrl('pages/gongjiaoluxian/list.html');
            }
        },

        goMap: function() {
            if (!openViaTopNav('./pages/gongjiaoluxian/map.html')) {
                window.location.href = resolveFrontUrl('pages/gongjiaoluxian/map.html');
            }
        },

        goAnnouncements: function() {
            if (!openViaTopNav('./pages/wangzhangonggao/list.html')) {
                window.location.href = resolveFrontUrl('pages/wangzhangonggao/list.html');
            }
        },

        goAccessibility: function() {
            if (!openViaTopNav('./pages/accessibility/settings.html')) {
                window.location.href = resolveFrontUrl('pages/accessibility/settings.html');
            }
        },

        /**
         * 使元素可通过键盘访问
         */
        makeAccessible: function(element) {
            if (!element) return;

            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }

            element.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        },

        toggle: function() {
            this.isEnabled = !this.isEnabled;
            this.ensureShortcutBinding();
            localStorage.setItem('accessibility_keyboard_nav', this.isEnabled);
            return this.isEnabled;
        }
    };

    // ARIA辅助服务
    var AriaService = {
        captionTimer: null,

        /**
         * 为听障用户显示可见字幕提示
         * @param {string} message
         */
        showVisualCaption: function(message) {
            if (!message) return;

            var caption = document.getElementById('a11y-visual-caption');
            if (!caption) {
                caption = document.createElement('div');
                caption.id = 'a11y-visual-caption';
                caption.setAttribute('role', 'status');
                caption.setAttribute('aria-live', 'polite');
                caption.innerHTML = '<div class=\"caption-title\">无障碍提示</div><div class=\"caption-message\"></div>';
                document.body.appendChild(caption);
            }

            var msgNode = caption.querySelector('.caption-message');
            if (msgNode) {
                msgNode.textContent = message;
            }

            caption.classList.add('show');
            if (this.captionTimer) {
                clearTimeout(this.captionTimer);
            }
            this.captionTimer = setTimeout(function() {
                caption.classList.remove('show');
            }, 4200);
        },

        /**
         * 向屏幕阅读器宣告内容
         * @param {string} message - 要宣告的消息
         * @param {string} priority - 优先级：polite/assertive
         */
        announce: function(message, priority) {
            priority = priority || 'polite';

            var announcer = document.getElementById('sr-announcer');
            if (!announcer) {
                announcer = document.createElement('div');
                announcer.id = 'sr-announcer';
                announcer.setAttribute('role', 'status');
                announcer.setAttribute('aria-live', priority);
                announcer.setAttribute('aria-atomic', 'true');
                announcer.className = 'sr-only';
                document.body.appendChild(announcer);
            }

            // 先清空，再设置内容，确保屏幕阅读器会读取
            announcer.textContent = '';
            setTimeout(function() {
                announcer.textContent = message;
            }, 100);

            // 同步可见字幕提示，保证听障用户能看到系统反馈
            this.showVisualCaption(message);

            // 若已开启语音播报，则同步语音提示，避免“按钮有反馈但没有声音”
            if (SpeechService.isEnabled) {
                SpeechService.speak(message, { rate: 1.02, pitch: 1 });
            }
        },

        /**
         * 设置元素的ARIA标签
         */
        setLabel: function(element, label) {
            if (element && label) {
                element.setAttribute('aria-label', label);
            }
        },

        /**
         * 设置元素为当前选中状态
         */
        setCurrent: function(element, isCurrent) {
            if (element) {
                if (isCurrent) {
                    element.setAttribute('aria-current', 'page');
                } else {
                    element.removeAttribute('aria-current');
                }
            }
        },

        /**
         * 设置展开/折叠状态
         */
        setExpanded: function(element, isExpanded) {
            if (element) {
                element.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            }
        }
    };

    /**
     * UI自愈规则引擎
     * 仅处理已知且低风险的问题，避免对页面结构进行激进改动。
     */
    var UiSelfHealService = {
        enabled: true,
        intervalId: null,
        mutationTimer: null,
        mutationObserver: null,
        stats: {
            runs: 0,
            fixes: {}
        },

        init: function() {
            this.enabled = localStorage.getItem('ui_self_heal_disabled') !== 'true';
            if (!this.enabled) return;

            this.injectStyle();
            this.runAllRules('init');
            this.bindEvents();
        },

        injectStyle: function() {
            if (document.getElementById('ui-self-heal-style')) return;
            var style = document.createElement('style');
            style.id = 'ui-self-heal-style';
            style.type = 'text/css';
            style.textContent = [
                '.ui-heal-toast {',
                '  position: fixed;',
                '  right: 16px;',
                '  bottom: 16px;',
                '  z-index: 9999;',
                '  max-width: min(420px, calc(100% - 20px));',
                '  background: rgba(34, 44, 40, 0.95);',
                '  color: #fff;',
                '  border-radius: 10px;',
                '  padding: 10px 12px;',
                '  font-size: 13px;',
                '  line-height: 1.45;',
                '  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);',
                '}',
                '.ui-heal-toast strong { display: block; margin-bottom: 4px; font-weight: 700; }'
            ].join('');
            document.head.appendChild(style);
        },

        bindEvents: function() {
            var self = this;
            window.addEventListener('load', function() {
                self.runAllRules('load');
            });
            window.addEventListener('resize', function() {
                self.scheduleRun('resize', 80);
            });
            window.addEventListener('pageshow', function() {
                self.scheduleRun('pageshow', 50);
            });

            this.intervalId = window.setInterval(function() {
                self.runAllRules('interval');
            }, 2800);

            if ('MutationObserver' in window && document.body) {
                this.mutationObserver = new MutationObserver(function() {
                    self.scheduleRun('mutation', 120);
                });
                this.mutationObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class', 'aria-busy']
                });
            }
        },

        scheduleRun: function(trigger, delay) {
            var self = this;
            clearTimeout(this.mutationTimer);
            this.mutationTimer = window.setTimeout(function() {
                self.runAllRules(trigger);
            }, delay || 80);
        },

        runAllRules: function(trigger) {
            if (!this.enabled) return;
            this.stats.runs += 1;
            this.fixHeaderOverlap(trigger);
            this.fixLegacyHeaderTheme(trigger);
            this.fixDualVerticalScrollbar(trigger);
            this.fixIframeCollapse(trigger);
            this.fixMapBlankScroll(trigger);
            this.fixFrozenLoading(trigger);
            this.fixBlockedClicks(trigger);
            this.fixMissingImageAlt(trigger);
        },

        markFix: function(ruleKey) {
            if (!this.stats.fixes[ruleKey]) {
                this.stats.fixes[ruleKey] = 0;
            }
            this.stats.fixes[ruleKey] += 1;
        },

        notify: function(title, message) {
            var existing = document.getElementById('ui-heal-toast');
            if (!existing) {
                existing = document.createElement('div');
                existing.id = 'ui-heal-toast';
                existing.className = 'ui-heal-toast';
                document.body.appendChild(existing);
            }
            existing.innerHTML = '<strong>' + title + '</strong><span>' + message + '</span>';
            existing.style.display = 'block';
            clearTimeout(existing._hideTimer);
            existing._hideTimer = setTimeout(function() {
                existing.style.display = 'none';
            }, 4200);
        },

        sanitizeIframeUrl: function(rawUrl) {
            var fallback = './pages/home/home.html';
            var url = String(rawUrl || '').trim();
            if (!url || url === 'null' || url === 'undefined') return fallback;
            if (url.indexOf('javascript:') === 0 || url.indexOf('data:') === 0) return fallback;
            if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return fallback;
            if (url.indexOf('//') === 0) return fallback;
            var safePathPattern = /^\.\/pages\/[a-zA-Z0-9_\-/]+\.html(?:[?#].*)?$/;
            return safePathPattern.test(url) ? url : fallback;
        },

        isIframeViewportScrollMode: function() {
            var body = document.body;
            if (!body || !body.classList) return false;
            return (
                body.classList.contains('transit-shell') &&
                body.getAttribute('data-shell-scroll-mode') === 'iframe'
            );
        },

        fixHeaderOverlap: function() {
            var header = document.getElementById('header');
            var main = document.getElementById('main-content');
            if (!header || !main) return;

            var style = window.getComputedStyle(header);
            if (!style) return;
            // Only fixed headers require artificial top padding.
            // Sticky/relative headers stay in normal flow and should not be adjusted on scroll.
            if (style.position !== 'fixed') {
                if (main.getAttribute('data-ui-heal-header-padding') === '1') {
                    main.style.paddingTop = '';
                    main.removeAttribute('data-ui-heal-header-padding');
                }
                return;
            }

            var headerRect = header.getBoundingClientRect();
            var assistStrip = document.querySelector('#header .transit-assist-strip');
            var assistBottom = assistStrip ? assistStrip.getBoundingClientRect().bottom : 0;
            var overlayBottom = Math.ceil(Math.max(headerRect.bottom, assistBottom));
            var mainTop = Math.floor(main.getBoundingClientRect().top);
            var isOverlay = overlayBottom >= mainTop;

            if (isOverlay) {
                main.style.paddingTop = (overlayBottom - mainTop + 10) + 'px';
                main.setAttribute('data-ui-heal-header-padding', '1');
                this.markFix('header_overlap');
                return;
            }

            if (main.getAttribute('data-ui-heal-header-padding') === '1') {
                main.style.paddingTop = '';
                main.removeAttribute('data-ui-heal-header-padding');
            }
        },

        fixLegacyHeaderTheme: function() {
            var header = document.getElementById('header');
            if (!header) return;
            var style = window.getComputedStyle(header);
            if (!style) return;
            var hasLegacyRed =
                style.backgroundColor === 'rgb(212, 46, 59)' ||
                (parseFloat(style.borderBottomWidth || '0') > 0 &&
                    style.borderBottomColor === 'rgb(6, 137, 125)');
            if (!hasLegacyRed) return;

            header.style.background = '#1e2724';
            header.style.borderBottom = '0';
            header.style.border = '0';
            this.markFix('legacy_header_theme');
        },

        fixDualVerticalScrollbar: function() {
            var iframe = document.getElementById('iframe');
            if (!iframe) return;

            if (this.isIframeViewportScrollMode()) {
                document.body.style.overflowY = 'hidden';
                document.documentElement.style.overflowY = 'hidden';
                iframe.setAttribute('scrolling', 'auto');
                iframe.style.overflow = 'auto';
                this.markFix('single_scroll_iframe');
                return;
            }

            if (iframe.getAttribute('scrolling') !== 'no') {
                iframe.setAttribute('scrolling', 'no');
                this.markFix('iframe_scrolling_attr');
            }

            var bodyStyle = window.getComputedStyle(document.body || document.documentElement);
            if (!bodyStyle) return;
            var bodyScrollable = ['auto', 'scroll', 'overlay'].indexOf(bodyStyle.overflowY) >= 0;
            var iframeScrollable = false;

            try {
                var iframeWin = iframe.contentWindow || (iframe.contentDocument && iframe.contentDocument.parentWindow);
                if (iframeWin && iframeWin.document && iframeWin.document.documentElement) {
                    var iframeDocEl = iframeWin.document.documentElement;
                    var iframeBody = iframeWin.document.body;
                    var iframeStyle = iframeWin.getComputedStyle(iframeBody || iframeDocEl);
                    var overflowY = iframeStyle ? iframeStyle.overflowY : '';
                    var canScrollByHeight =
                        (iframeDocEl.scrollHeight || 0) >
                        (iframe.clientHeight + 12);
                    iframeScrollable = ['auto', 'scroll', 'overlay'].indexOf(overflowY) >= 0 && canScrollByHeight;
                }
            } catch (e) {
                // ignore cross-origin access
            }

            if (bodyScrollable && iframeScrollable) {
                iframe.style.overflow = 'hidden';
                this.markFix('dual_scrollbar');
            }
        },

        fixIframeCollapse: function() {
            var iframe = document.getElementById('iframe');
            if (!iframe) return;

            var safeUrl = this.sanitizeIframeUrl(localStorage.getItem('iframeUrl'));
            var src = iframe.getAttribute('src') || '';
            if (!src || src === 'about:blank') {
                iframe.setAttribute('src', safeUrl);
                this.markFix('iframe_empty_src');
            }

            var minHeight = 560;
            var visualHeight = Math.round(iframe.getBoundingClientRect().height);
            if (visualHeight < 240) {
                iframe.style.height = minHeight + 'px';
                this.markFix('iframe_too_short');
            }

            if (this.isIframeViewportScrollMode()) {
                var header = document.getElementById('header');
                var main = document.getElementById('main-content');
                var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 900;
                var headerHeight = header ? Math.ceil(header.getBoundingClientRect().height || header.offsetHeight || 0) : 0;
                var mainStyle = main ? window.getComputedStyle(main) : null;
                var padTop = mainStyle ? parseFloat(mainStyle.paddingTop || '0') : 0;
                var padBottom = mainStyle ? parseFloat(mainStyle.paddingBottom || '0') : 0;
                var targetHeight = Math.max(420, Math.floor(viewportHeight - headerHeight - padTop - padBottom - 2));
                if (Math.abs(targetHeight - visualHeight) > 6) {
                    iframe.style.height = targetHeight + 'px';
                    this.markFix('iframe_viewport_height');
                }
                iframe.setAttribute('scrolling', 'auto');
                iframe.style.overflow = 'auto';
                return;
            }

            try {
                var iframeWin = iframe.contentWindow || (iframe.contentDocument && iframe.contentDocument.parentWindow);
                if (iframeWin && iframeWin.document) {
                    var body = iframeWin.document.body;
                    var docEl = iframeWin.document.documentElement;
                    if (body && docEl) {
                        var bodyHeight = Math.max(
                            body.scrollHeight || 0,
                            body.offsetHeight || 0,
                            body.clientHeight || 0
                        );
                        var docHeight = Math.max(
                            docEl.scrollHeight || 0,
                            docEl.offsetHeight || 0,
                            docEl.clientHeight || 0
                        );
                        var appNode = iframeWin.document.getElementById('app');
                        var appHeight = appNode ? Math.max(
                            appNode.scrollHeight || 0,
                            appNode.offsetHeight || 0,
                            appNode.clientHeight || 0
                        ) : 0;
                        var nextHeight = Math.max(bodyHeight, appHeight, minHeight);
                        if (docHeight > 0 && docHeight <= nextHeight + 160) {
                            nextHeight = Math.max(nextHeight, docHeight);
                        }
                        nextHeight += 20;
                        // 保守策略：自愈规则只负责“补高”，避免与主壳层缩高逻辑互相打架导致抖动。
                        if (nextHeight > visualHeight + 14) {
                            iframe.style.height = nextHeight + 'px';
                            this.markFix('iframe_height_sync');
                        }
                    }
                }
            } catch (e) {
                // same-origin以外的场景不做处理
            }
        },

        fixMapBlankScroll: function() {
            var body = document.body;
            if (!body || !body.classList || !body.classList.contains('page-route-map')) return;

            var app = document.getElementById('app');
            var container = document.querySelector('.map-container');
            if (!app || !container) return;

            var contentBottom = container.getBoundingClientRect().bottom + window.scrollY;
            var totalHeight = Math.max(document.body.scrollHeight || 0, document.body.offsetHeight || 0);
            var blankGap = Math.max(0, totalHeight - contentBottom);

            if (blankGap > 220) {
                app.style.paddingBottom = '10px';
                body.style.marginBottom = '0';
                this.markFix('map_blank_scroll');
            }
        },

        fixFrozenLoading: function() {
            var nodes = document.querySelectorAll(
                '.layui-layer-loading, .loading, .loading-mask, .spinner, [aria-busy="true"], [data-loading="true"]'
            );
            if (!nodes.length) return;

            var now = Date.now();
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (!node || !node.getBoundingClientRect) continue;
                var rect = node.getBoundingClientRect();
                var visible = rect.width > 0 && rect.height > 0;
                if (!visible) continue;

                var startAt = Number(node.getAttribute('data-ui-heal-loading-start') || 0);
                if (!startAt) {
                    node.setAttribute('data-ui-heal-loading-start', String(now));
                    continue;
                }
                if (now - startAt < 16000) continue;
                if (node.getAttribute('data-ui-heal-loading-fixed') === '1') continue;

                node.setAttribute('data-ui-heal-loading-fixed', '1');
                if (window.layui && layui.layer && typeof layui.layer.closeAll === 'function') {
                    layui.layer.closeAll('loading');
                }
                node.style.display = 'none';
                this.markFix('frozen_loading');
                this.notify('已自动恢复', '检测到加载状态超时，系统已自动关闭异常加载层。');
            }
        },

        fixBlockedClicks: function() {
            var selectors = '.assist-btn, .utility-link, .support-link, .navs a, button';
            var buttons = document.querySelectorAll(selectors);
            for (var i = 0; i < buttons.length; i++) {
                var node = buttons[i];
                var style = window.getComputedStyle(node);
                if (!style) continue;
                if (style.pointerEvents === 'none' && !node.disabled) {
                    node.style.pointerEvents = 'auto';
                    this.markFix('blocked_click');
                }
            }
        },

        fixMissingImageAlt: function() {
            var images = document.querySelectorAll('img');
            for (var i = 0; i < images.length; i++) {
                var img = images[i];
                var alt = (img.getAttribute('alt') || '').trim();
                if (alt) continue;

                var label = (img.getAttribute('aria-label') || img.getAttribute('title') || '').trim();
                if (!label) {
                    var src = (img.getAttribute('src') || '').trim();
                    if (src) {
                        var parts = src.split('/');
                        label = parts[parts.length - 1].split('?')[0] || '页面图片';
                    } else {
                        label = '页面图片';
                    }
                }
                img.setAttribute('alt', label);
                this.markFix('missing_img_alt');
            }
        },

        getStats: function() {
            return {
                enabled: this.enabled,
                runs: this.stats.runs,
                fixes: this.stats.fixes
            };
        }
    };

    // 无障碍工具主对象
    var AccessibilityUtils = {
        // 初始化所有服务
        init: function() {
            SpeechService.init();
            HapticService.init();
            ThemeService.init();
            KeyboardService.init();
            UiSelfHealService.init();

            console.log('无障碍工具库已初始化');
        },

        // 语音播报
        speak: function(text, options) {
            SpeechService.speak(text, options);
        },

        speakRouteInfo: function(route) {
            SpeechService.speakRouteInfo(route);
        },

        speakStationInfo: function(station) {
            SpeechService.speakStationInfo(station);
        },

        stopSpeech: function() {
            SpeechService.stop();
        },

        toggleSpeech: function() {
            return SpeechService.toggle();
        },

        isSpeechEnabled: function() {
            return SpeechService.isEnabled;
        },

        // 触觉反馈
        vibrate: function(pattern) {
            HapticService.vibrate(pattern);
        },

        vibrateLight: function() {
            HapticService.light();
        },

        vibrateMedium: function() {
            HapticService.medium();
        },

        vibrateHeavy: function() {
            HapticService.heavy();
        },

        toggleHaptic: function() {
            return HapticService.toggle();
        },

        isHapticEnabled: function() {
            return HapticService.isEnabled;
        },

        // 主题
        enableHighContrast: function() {
            ThemeService.enableHighContrast();
            return ThemeService.isHighContrast;
        },

        disableHighContrast: function() {
            ThemeService.disableHighContrast();
            return ThemeService.isHighContrast;
        },

        toggleHighContrast: function() {
            return ThemeService.toggleHighContrast();
        },

        isHighContrast: function() {
            return ThemeService.isHighContrast;
        },

        setFontSize: function(size) {
            ThemeService.setFontSize(size);
        },

        increaseFontSize: function() {
            ThemeService.increaseFontSize();
        },

        decreaseFontSize: function() {
            ThemeService.decreaseFontSize();
        },

        getFontSize: function() {
            return ThemeService.currentFontSize;
        },

        // 键盘导航
        toggleKeyboardNav: function() {
            return KeyboardService.toggle();
        },

        isKeyboardNavEnabled: function() {
            return KeyboardService.isEnabled;
        },

        makeAccessible: function(element) {
            KeyboardService.makeAccessible(element);
        },

        // ARIA
        announce: function(message, priority) {
            AriaService.announce(message, priority);
        },

        setAriaLabel: function(element, label) {
            AriaService.setLabel(element, label);
        },

        setAriaCurrent: function(element, isCurrent) {
            AriaService.setCurrent(element, isCurrent);
        },

        runUiSelfHeal: function() {
            UiSelfHealService.runAllRules('manual');
            return UiSelfHealService.getStats();
        },

        getUiSelfHealStats: function() {
            return UiSelfHealService.getStats();
        },

        // 获取所有设置
        getSettings: function() {
            return {
                speech: SpeechService.isEnabled,
                haptic: HapticService.isEnabled,
                highContrast: ThemeService.isHighContrast,
                fontSize: ThemeService.currentFontSize,
                keyboardNav: KeyboardService.isEnabled
            };
        },

        // 保存所有设置
        saveSettings: function(settings) {
            if (settings.speech !== undefined) {
                SpeechService.isEnabled = settings.speech;
                localStorage.setItem('accessibility_speech', settings.speech);
            }
            if (settings.haptic !== undefined) {
                HapticService.isEnabled = settings.haptic;
                localStorage.setItem('accessibility_haptic', settings.haptic);
            }
            if (settings.highContrast !== undefined) {
                if (settings.highContrast) {
                    ThemeService.enableHighContrast();
                } else {
                    ThemeService.disableHighContrast();
                }
            }
            if (settings.fontSize !== undefined) {
                ThemeService.setFontSize(settings.fontSize);
            }
            if (settings.keyboardNav !== undefined) {
                KeyboardService.isEnabled = settings.keyboardNav;
                KeyboardService.ensureShortcutBinding();
                localStorage.setItem('accessibility_keyboard_nav', settings.keyboardNav);
            }
        }
    };

    // 暴露到全局
    global.AccessibilityUtils = AccessibilityUtils;

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            AccessibilityUtils.init();
        });
    } else {
        AccessibilityUtils.init();
    }

})(window);
