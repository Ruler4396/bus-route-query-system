				var DEFAULT_IFRAME_URL = './pages/home/home.html';
				var frameResizeTimer = null;
				var frameResizeObserver = null;
				var lastAppliedFrameHeight = 0;

				function normalizeIframeUrl(rawUrl) {
					var fallbackUrl = DEFAULT_IFRAME_URL;
					var url = (rawUrl || '').trim();
					if (!url) return fallbackUrl;
					if (url === 'null' || url === 'undefined') return fallbackUrl;
					if (url.indexOf('javascript:') === 0) return fallbackUrl;
					if (url.indexOf('data:') === 0) return fallbackUrl;
					if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return fallbackUrl;
					if (url.indexOf('//') === 0) return fallbackUrl;
					var safePathPattern = /^\.\/pages\/[a-zA-Z0-9_\-/]+\.html(?:[?#].*)?$/;
					return safePathPattern.test(url) ? url : fallbackUrl;
				}

				function scrollShellToTop() {
					window.scrollTo({ top: 0, behavior: 'auto' });
				}

				function disconnectFrameSizeObservers() {
					if (frameResizeObserver) {
						try { frameResizeObserver.disconnect(); } catch (e) {}
						frameResizeObserver = null;
					}
				}

				function attachFrameSizeObservers() {
					var iframe = document.getElementById('iframe');
					if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) return;
					disconnectFrameSizeObservers();
					var doc = iframe.contentWindow.document;
					var observeTarget = doc.body || doc.documentElement;
					if (!observeTarget) return;
					var ResizeCtor = iframe.contentWindow.ResizeObserver || window.ResizeObserver;
					if (ResizeCtor) {
						frameResizeObserver = new ResizeCtor(function() {
							scheduleFrameResize(40);
						});
						frameResizeObserver.observe(observeTarget);
						if (doc.documentElement && doc.documentElement !== observeTarget) {
							frameResizeObserver.observe(doc.documentElement);
						}
					}
					if (doc.fonts && doc.fonts.ready) {
						doc.fonts.ready.then(function() {
							scheduleFrameResize(60);
						}).catch(function() {});
					}
				}

				function queueFrameResizeBurst() {
					[0, 180, 520, 1100, 2000].forEach(function(delay) {
						setTimeout(changeFrameHeight, delay);
					});
				}

				function applyIframeUrl(url, persist) {
					var iframe = document.getElementById('iframe');
					if (!iframe) return;
					var safeUrl = normalizeIframeUrl(url);
					if (persist !== false) {
						localStorage.setItem('iframeUrl', safeUrl);
					}
					if (vue) {
						vue.activeNavUrl = safeUrl;
					}
					scrollShellToTop();
					var currentSrc = iframe.getAttribute('src') || '';
					if (currentSrc === safeUrl) {
						scheduleFrameResize(30);
						queueFrameResizeBurst();
						return;
					}
					disconnectFrameSizeObservers();
					iframe.src = safeUrl;
					scheduleFrameResize(120);
					queueFrameResizeBurst();
				}

	      var vue1 = new Vue({el: '#tabbar'})

			var vue = new Vue({
				el: '#header',
				data: {
					iconArr: ['layui-icon-gift','layui-icon-email','layui-icon-logout','layui-icon-transfer','layui-icon-slider','layui-icon-print','layui-icon-cols','layui-icon-snowflake','layui-icon-note','layui-icon-flag','layui-icon-theme','layui-icon-website','layui-icon-console','layui-icon-face-surprised','layui-icon-template-1','layui-icon-app','layui-icon-read','layui-icon-component','layui-icon-file-b','layui-icon-unlink','layui-icon-tabs','layui-icon-form','layui-icon-chat'],
					indexNav: indexNav,
					primaryNav: [],
					supportNav: [],
					activeNavUrl: './pages/home/home.html',
					showAdminEntry: false,
					cartFlag: cartFlag,
					adminurl: adminurl,
					chatFlag: chatFlag,
					projectName: projectName,
				},
				mounted: function() {
					this.initNavStructure();
				},
				created() {
					this.iconArr.sort(()=>{
					  return (0.5-Math.random())
					})
				},
				methods: {
					jump(url) {
						jump(url)
					},
						initNavStructure() {
							var saved = normalizeIframeUrl(localStorage.getItem('iframeUrl'));
							var role = localStorage.getItem('userTable');
							this.showAdminEntry = role === 'users';
							this.activeNavUrl = saved || DEFAULT_IFRAME_URL;
							localStorage.setItem('iframeUrl', this.activeNavUrl);
							this.primaryNav = [];
							this.supportNav = [];
						for (var i = 0; i < this.indexNav.length; i++) {
							var item = this.indexNav[i];
							if (item.name.indexOf('友情链接') !== -1 || item.name.indexOf('资源') !== -1) {
								this.supportNav.push(item);
							} else {
								this.primaryNav.push(item);
							}
						}
					},
					openNav(url) {
						this.activeNavUrl = url;
						navPage(url);
					},
					centerPageShell() {
						centerPage();
					},
					openAccessibilityPage() {
						this.openNav('./pages/accessibility/settings.html');
					},
					chatTapShell() {
						chatTap();
					}
				}
			});

					layui.use(['element','layer'], function() {
						var element = layui.element;
						var layer = layui.layer;
					});

			function chatTap(){
				var userTable = localStorage.getItem('userTable');
				if (userTable) {
					layui.layer.open({
						type: 2,
						title: '在线提问',
						area: ['600px', '600px'],
						content: './pages/chat/chat.html'
					});
				} else {
					window.location.href = './pages/login/login.html'
				}
			}

				function updateAssistStatus() {
					if (!window.AccessibilityUtils) return;
					var settings = window.AccessibilityUtils.getSettings();
					var status = [
						settings.highContrast ? '高对比开启' : '高对比关闭',
						'字体' + settings.fontSize + 'px',
						settings.speech ? '语音开启' : '语音关闭',
						settings.keyboardNav ? '键盘导航开启' : '键盘导航关闭'
					].join(' | ');
					var statusNode = document.getElementById('assistStatusText');
					if (statusNode) {
						statusNode.textContent = status;
					}
				}

			function syncAssistSettingsToIframe() {
				if (!window.AccessibilityUtils) return;
				var iframe = document.getElementById('iframe');
				if (!iframe || !iframe.contentWindow || !iframe.contentWindow.AccessibilityUtils) return;
				try {
					iframe.contentWindow.AccessibilityUtils.saveSettings(AccessibilityUtils.getSettings());
				} catch (e) {
					console.warn('同步无障碍设置到iframe失败:', e);
				}
			}

			function initAssistDeck() {
				if (!window.AccessibilityUtils) return;
				var bind = function(id, handler) {
					var node = document.getElementById(id);
					if (node) node.addEventListener('click', handler);
				};

				bind('assistHighContrast', function() {
					var enabled = AccessibilityUtils.toggleHighContrast();
					AccessibilityUtils.announce(enabled ? '高对比模式已开启' : '高对比模式已关闭');
					syncAssistSettingsToIframe();
					updateAssistStatus();
				});
				bind('assistFontPlus', function() {
					AccessibilityUtils.increaseFontSize();
					AccessibilityUtils.announce('字体已放大');
					syncAssistSettingsToIframe();
					updateAssistStatus();
				});
				bind('assistFontMinus', function() {
					AccessibilityUtils.decreaseFontSize();
					AccessibilityUtils.announce('字体已缩小');
					syncAssistSettingsToIframe();
					updateAssistStatus();
				});
				bind('assistSpeech', function() {
					var enabled = AccessibilityUtils.toggleSpeech();
					AccessibilityUtils.announce(enabled ? '语音播报已开启' : '语音播报已关闭');
					syncAssistSettingsToIframe();
					updateAssistStatus();
				});
				bind('assistKeyboard', function() {
					var enabled = AccessibilityUtils.toggleKeyboardNav();
					AccessibilityUtils.announce(enabled ? '键盘导航已开启' : '键盘导航已关闭');
					syncAssistSettingsToIframe();
					updateAssistStatus();
				});
				bind('assistCaption', function() {
					var enabled = AccessibilityUtils.toggleCaptionCenter();
					AccessibilityUtils.announce(enabled ? '字幕提示面板已开启' : '字幕提示面板已关闭');
					syncAssistSettingsToIframe();
					updateAssistStatus();
				});
				bind('assistMotion', function() {
					var enabled = AccessibilityUtils.toggleReducedMotion();
					AccessibilityUtils.announce(enabled ? '减少动态效果已开启' : '减少动态效果已关闭');
					syncAssistSettingsToIframe();
					updateAssistStatus();
				});
				bind('assistShortcutHelp', function() {
					AccessibilityUtils.announce('快捷键帮助：Alt加1到7切换导航，Alt加S聚焦搜索，Alt加L聚焦主内容，Alt加C切换字幕提示，Alt加R切换减少动态，Alt加A打开设置，Alt加D打开演示。');
					updateAssistStatus();
				});
						var iframe = document.getElementById('iframe');
						if (iframe) {
							iframe.addEventListener('load', function() {
								syncAssistSettingsToIframe();
								attachFrameSizeObservers();
								updateAssistStatus();
								scheduleFrameResize(0);
								scheduleFrameResize(300);
								scheduleFrameResize(1000);
								queueFrameResizeBurst();
							});
							iframe.addEventListener('error', function() {
								var statusNode = document.getElementById('assistStatusText');
								if (statusNode) {
									statusNode.textContent = '页面加载失败，已回退首页';
								}
								disconnectFrameSizeObservers();
								applyIframeUrl(DEFAULT_IFRAME_URL, true);
							});
						}
					syncAssistSettingsToIframe();
					updateAssistStatus();
				}

				// 导航栏跳转
					function navPage(url) {
						applyIframeUrl(url, true);
					}

			// 跳转到个人中心也
				function centerPage() {
					var userTable = localStorage.getItem('userTable');
					if (userTable) {
						var centerUrl = './pages/' + userTable + '/center.html';
						applyIframeUrl(centerUrl, true);
						} else {
							window.location.href = './pages/login/login.html'
						}
					}

						var iframeUrl = normalizeIframeUrl(localStorage.getItem('iframeUrl'));
						applyIframeUrl(iframeUrl, true);
						function scheduleFrameResize(delay) {
							clearTimeout(frameResizeTimer);
							frameResizeTimer = setTimeout(changeFrameHeight, delay || 30);
						}

						function syncShellOffset() {
							var header = document.getElementById('header');
							var main = document.getElementById('main-content');
							if (!header || !main) return;
							var computed = window.getComputedStyle(header);
							if (computed && computed.position === 'fixed') {
								main.style.paddingTop = (header.offsetHeight + 10) + 'px';
							} else {
								main.style.paddingTop = '';
							}
						}

	

	      function readFrameHeight(doc) {
	        if (!doc) return 0;
	        var body = doc.body;
	        var html = doc.documentElement;
	        var win = doc.defaultView || window;
	        var maxBottom = 0;

	        function consider(node) {
	          if (!node || !node.getBoundingClientRect) return;
	          var style = win.getComputedStyle(node);
	          if (style && style.position === 'fixed') return;
	          var rect = node.getBoundingClientRect();
	          if (!rect) return;
	          maxBottom = Math.max(maxBottom, Math.ceil(rect.bottom + (win.scrollY || win.pageYOffset || 0)));
	        }

	        consider(doc.getElementById('app'));
	        consider(doc.querySelector('main'));
	        if (body && body.children) {
	          for (var i = 0; i < body.children.length; i++) {
	            consider(body.children[i]);
	          }
	        }

	        if (maxBottom > 0) {
	          return maxBottom;
	        }

	        return Math.max(
	          body ? body.scrollHeight || 0 : 0,
	          body ? body.offsetHeight || 0 : 0,
	          html ? html.scrollHeight || 0 : 0,
	          html ? html.offsetHeight || 0 : 0
	        );
	      }

	      function changeFrameHeight() {
	        var iframe = document.getElementById('iframe');
	        if (!iframe) return;
	        var doc = null;
	        try {
	          doc = iframe.contentWindow && iframe.contentWindow.document ? iframe.contentWindow.document : null;
	        } catch (e) {
	          doc = null;
	        }
	        var minHeight = 560;
	        var nextHeight = minHeight;
	        if (doc) {
	          nextHeight = Math.max(minHeight, Math.ceil(readFrameHeight(doc) + 12));
	        } else {
	          var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 900;
	          nextHeight = Math.max(minHeight, viewportHeight - 120);
	        }

	        if (Math.abs(nextHeight - lastAppliedFrameHeight) <= 4) {
	          return;
	        }

	        iframe.style.height = nextHeight + 'px';
	        iframe.style.overflow = 'hidden';
	        iframe.setAttribute('scrolling', 'no');
	        document.body.setAttribute('data-shell-scroll-mode', 'page');
	        document.body.style.overflowX = 'hidden';
	        document.body.style.overflowY = 'auto';
	        document.documentElement.style.overflowX = 'hidden';
	        document.documentElement.style.overflowY = 'auto';
	        lastAppliedFrameHeight = nextHeight;
	      };

			//  窗口变化时候iframe自适应
			// function changeFrameHeight() {
				// var header = document.getElementById('header').scrollHeight;
    //     let isshow = false
    //     var tabbar = 0
    //     if(isshow) {
    //       tabbar = document.getElementById('tabbar').scrollHeight
    //     }
				// var ifm = document.getElementById("iframe");
				// ifm.height = document.documentElement.clientHeight - header - tabbar;
				// ifm.width = document.documentElement.clientWidth;
			// }

				// reasize 事件 窗口大小变化后执行的方法
						window.onresize = function() {
							syncShellOffset();
							scheduleFrameResize(30);
						}

					setTimeout(initAssistDeck, 300);
					syncShellOffset();
					scheduleFrameResize(300);
			