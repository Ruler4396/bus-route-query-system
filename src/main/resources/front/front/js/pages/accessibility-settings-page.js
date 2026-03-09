        function syncSettingsToShell() {
            try {
                if (window.parent && window.parent !== window && window.parent.AccessibilityUtils) {
                    window.parent.AccessibilityUtils.saveSettings(AccessibilityUtils.getSettings());
                    if (typeof window.parent.updateAssistStatus === 'function') {
                        window.parent.updateAssistStatus();
                    }
                    if (typeof window.parent.syncAssistSettingsToIframe === 'function') {
                        window.parent.syncAssistSettingsToIframe();
                    }
                }
            } catch (err) {
                console.warn('同步无障碍设置到壳层失败', err);
            }
        }

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
                refreshSpeechDiagnostics();
                return;
            }
            AccessibilityUtils.prepareSpeech();
            AccessibilityUtils.speak('语音播报测试成功，欢迎使用城市公交查询系统');
            showMessage('正在播放测试语音；若手机处于静音模式，请先关闭静音并调高媒体音量。');
            setTimeout(refreshSpeechDiagnostics, 180);
        }

        // 改变字体大小
        function changeFontSize(delta) {
            var currentSize = AccessibilityUtils.getFontSize();
            var newSize = currentSize + delta;

            if (newSize >= 12 && newSize <= 24) {
                AccessibilityUtils.setFontSize(newSize);
                document.getElementById('fontSizeValue').textContent = newSize + 'px';
                syncSettingsToShell();
            }
        }

        function applyPreset(presetKey) {
            var presetMap = {
                lowVision: {
                    speech: true,
                    highContrast: true,
                    reducedMotion: false,
                    captionCenter: true,
                    keyboardNav: true,
                    haptic: false,
                    fontSize: 20,
                    message: '已应用低视力预设'
                },
                hearing: {
                    speech: false,
                    highContrast: false,
                    reducedMotion: true,
                    captionCenter: true,
                    keyboardNav: true,
                    haptic: false,
                    fontSize: 16,
                    message: '已应用听障预设（文字反馈与视觉提示优先）'
                },
                mobility: {
                    speech: true,
                    highContrast: false,
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
            syncSettingsToShell();
            initSettings();
            showMessage(preset.message);
            AccessibilityUtils.announce(preset.message);
            refreshSpeechDiagnostics();
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
            syncSettingsToShell();
            showMessage('设置已保存');
            AccessibilityUtils.announce('设置已保存');
            refreshSpeechDiagnostics();
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
            syncSettingsToShell();
            initSettings();
            showMessage('已恢复默认设置');
            AccessibilityUtils.announce('已恢复默认设置');
            refreshSpeechDiagnostics();
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


        function formatDiagValue(value) {
            if (value === undefined || value === null || value === '') {
                return '暂无';
            }
            return String(value);
        }

        function refreshSpeechDiagnostics() {
            var container = document.getElementById('speechDiagnostics');
            if (!container || !window.AccessibilityUtils || typeof AccessibilityUtils.getSpeechDiagnostics !== 'function') {
                return;
            }
            var diag = AccessibilityUtils.getSpeechDiagnostics() || {};
            var speakTime = diag.lastSpeakAt ? new Date(diag.lastSpeakAt).toLocaleTimeString('zh-CN') : '暂无';
            var items = [
                ['原生语音支持', diag.supported ? '支持' : '不支持'],
                ['音频兜底可用', diag.fallbackAvailable ? '可用' : '不可用'],
                ['语音开关', diag.enabled ? '已开启' : '未开启'],
                ['移动端判定', diag.mobileLike ? '是' : '否'],
                ['手势解锁', diag.unlocked ? '已完成' : '未完成'],
                ['音频兜底解锁', diag.fallbackUnlocked ? '已完成' : '未完成'],
                ['iframe 委托壳层', diag.hostDelegated ? '是' : '否'],
                ['可用语音数量', formatDiagValue(diag.voiceCount)],
                ['当前语音', formatDiagValue(diag.currentVoice)],
                ['待播报数量', formatDiagValue(diag.pendingCount)],
                ['音频兜底待播报', formatDiagValue(diag.fallbackPending)],
                ['最近状态', formatDiagValue(diag.lastMode)],
                ['最近报错', formatDiagValue(diag.lastError)],
                ['最近播报时间', speakTime],
                ['最近播报文本', formatDiagValue(diag.lastSpokenText)]
            ];
            container.innerHTML = items.map(function(item) {
                return '<div class="speech-diagnostics-item"><strong>' + item[0] + '</strong><span>' + item[1] + '</span></div>';
            }).join('');
        }

        function testTone() {
            if (!window.AccessibilityUtils || typeof AccessibilityUtils.playAudioTestTone !== 'function') {
                showMessage('当前浏览器不支持提示音测试');
                return;
            }
            AccessibilityUtils.prepareSpeech();
            AccessibilityUtils.playAudioTestTone().then(function(ok) {
                showMessage(ok ? '提示音已播放；若仍然听不到，请先检查手机静音和媒体音量。' : '当前浏览器不支持提示音测试');
                setTimeout(refreshSpeechDiagnostics, 160);
            });
        }

        // 监听开关变化
        document.getElementById('contrastToggle').addEventListener('change', function(e) {
            AccessibilityUtils.saveSettings({ highContrast: !!e.target.checked });
            syncSettingsToShell();
            showMessage(e.target.checked ? '高对比度已开启' : '高对比度已关闭');
            refreshSpeechDiagnostics();
        });

        document.getElementById('speechToggle').addEventListener('change', function(e) {
            var enabled = !!e.target.checked;
            if (enabled) {
                AccessibilityUtils.prepareSpeech();
            }
            AccessibilityUtils.saveSettings({ speech: enabled });
            syncSettingsToShell();
            if (enabled) {
                AccessibilityUtils.speak('语音播报已开启，请点击测试语音确认手机可正常出声。');
                showMessage('语音播报已开启；手机端首次使用请点击“测试语音”确认声音正常。');
            } else {
                AccessibilityUtils.stopSpeech();
                showMessage('语音播报已关闭');
            }
            setTimeout(refreshSpeechDiagnostics, 180);
        });

        document.getElementById('motionToggle').addEventListener('change', function(e) {
            AccessibilityUtils.saveSettings({ reducedMotion: !!e.target.checked });
            syncSettingsToShell();
            showMessage(e.target.checked ? '减少动态效果已开启' : '减少动态效果已关闭');
            refreshSpeechDiagnostics();
        });

        document.getElementById('captionToggle').addEventListener('change', function(e) {
            AccessibilityUtils.saveSettings({ captionCenter: !!e.target.checked });
            syncSettingsToShell();
            showMessage(e.target.checked ? '视觉字幕提示面板已开启' : '视觉字幕提示面板已关闭');
            refreshSpeechDiagnostics();
        });

        document.getElementById('keyboardToggle').addEventListener('change', function(e) {
            AccessibilityUtils.saveSettings({ keyboardNav: !!e.target.checked });
            syncSettingsToShell();
            refreshSpeechDiagnostics();
        });

        document.getElementById('hapticToggle').addEventListener('change', function(e) {
            AccessibilityUtils.saveSettings({ haptic: !!e.target.checked });
            syncSettingsToShell();
            refreshSpeechDiagnostics();
        });

        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            initSettings();
            refreshSpeechDiagnostics();
        });
