        // 初始化设置
        function initSettings() {
            var settings = AccessibilityUtils.getSettings();

            document.getElementById('speechToggle').checked = settings.speech;
            document.getElementById('contrastToggle').checked = settings.highContrast;
            document.getElementById('motionToggle').checked = !!settings.reducedMotion;
            document.getElementById('captionToggle').checked = !!settings.captionCenter;
            document.getElementById('keyboardToggle').checked = settings.keyboardNav;
            document.getElementById('hapticToggle').checked = settings.haptic;
            document.getElementById('fontSizeValue').textContent = settings.fontSize + 'px';
        }

        // 测试语音
        function testSpeech() {
            if (!AccessibilityUtils.isSpeechEnabled()) {
                showMessage('请先开启语音播报功能');
                return;
            }
            AccessibilityUtils.speak('语音播报测试成功，欢迎使用城市公交查询系统');
            showMessage('正在播放测试语音...');
        }

        // 改变字体大小
        function changeFontSize(delta) {
            var currentSize = AccessibilityUtils.getFontSize();
            var newSize = currentSize + delta;

            if (newSize >= 12 && newSize <= 24) {
                AccessibilityUtils.setFontSize(newSize);
                document.getElementById('fontSizeValue').textContent = newSize + 'px';
            }
        }

        function applyPreset(presetKey) {
            var presetMap = {
                lowVision: {
                    speech: false,
                    highContrast: true,
                    keyboardNav: true,
                    haptic: false,
                    fontSize: 20,
                    message: '已应用低视力预设'
                },
                hearing: {
                    speech: false,
                    highContrast: true,
                    reducedMotion: true,
                    captionCenter: true,
                    keyboardNav: true,
                    haptic: false,
                    fontSize: 16,
                    message: '已应用听障预设（文字反馈与视觉提示优先）'
                },
                mobility: {
                    speech: true,
                    highContrast: true,
                    reducedMotion: true,
                    captionCenter: true,
                    keyboardNav: true,
                    haptic: true,
                    fontSize: 18,
                    message: '已应用行动不便预设'
                }
            };
            var preset = presetMap[presetKey];
            if (!preset) {
                return;
            }
            AccessibilityUtils.saveSettings({
                speech: preset.speech,
                highContrast: preset.highContrast,
                reducedMotion: !!preset.reducedMotion,
                captionCenter: !!preset.captionCenter,
                keyboardNav: preset.keyboardNav,
                haptic: preset.haptic,
                fontSize: preset.fontSize
            });
            initSettings();
            showMessage(preset.message);
            AccessibilityUtils.announce(preset.message);
        }

        // 保存设置
        function saveSettings() {
            var settings = {
                speech: document.getElementById('speechToggle').checked,
                highContrast: document.getElementById('contrastToggle').checked,
                reducedMotion: document.getElementById('motionToggle').checked,
                captionCenter: document.getElementById('captionToggle').checked,
                keyboardNav: document.getElementById('keyboardToggle').checked,
                haptic: document.getElementById('hapticToggle').checked,
                fontSize: AccessibilityUtils.getFontSize()
            };

            AccessibilityUtils.saveSettings(settings);
            showMessage('设置已保存');
            AccessibilityUtils.announce('设置已保存');
        }

        // 恢复默认设置
        function resetSettings() {
            var defaultSettings = {
                speech: false,
                highContrast: false,
                reducedMotion: false,
                captionCenter: false,
                keyboardNav: true,
                haptic: false,
                fontSize: 14
            };

            AccessibilityUtils.saveSettings(defaultSettings);
            initSettings();
            showMessage('已恢复默认设置');
            AccessibilityUtils.announce('已恢复默认设置');
        }

        // 显示消息
        function showMessage(msg) {
            var el = document.getElementById('statusMessage');
            el.textContent = msg;
            el.classList.add('show');

            setTimeout(function() {
                el.classList.remove('show');
            }, 3000);
        }

        // 监听开关变化
        document.getElementById('contrastToggle').addEventListener('change', function(e) {
            if (e.target.checked) {
                AccessibilityUtils.enableHighContrast();
            } else {
                AccessibilityUtils.disableHighContrast();
            }
        });

        document.getElementById('speechToggle').addEventListener('change', function(e) {
            AccessibilityUtils.saveSettings({ speech: !!e.target.checked });
        });

        document.getElementById('motionToggle').addEventListener('change', function(e) {
            AccessibilityUtils.saveSettings({ reducedMotion: !!e.target.checked });
            showMessage(e.target.checked ? '减少动态效果已开启' : '减少动态效果已关闭');
        });

        document.getElementById('captionToggle').addEventListener('change', function(e) {
            AccessibilityUtils.saveSettings({ captionCenter: !!e.target.checked });
            showMessage(e.target.checked ? '视觉字幕提示面板已开启' : '视觉字幕提示面板已关闭');
        });

        document.getElementById('keyboardToggle').addEventListener('change', function(e) {
            AccessibilityUtils.saveSettings({ keyboardNav: !!e.target.checked });
        });

        document.getElementById('hapticToggle').addEventListener('change', function(e) {
            AccessibilityUtils.saveSettings({ haptic: !!e.target.checked });
        });

        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', initSettings);
    