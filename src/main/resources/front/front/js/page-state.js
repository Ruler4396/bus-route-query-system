(function(global) {
    'use strict';

    function resolveMount(mount) {
        if (!mount) return null;
        if (typeof mount === 'function') return mount();
        if (typeof mount === 'string') return document.querySelector(mount);
        return mount;
    }

    function createPanel(options) {
        options = options || {};
        var state = {
            phase: 'loading',
            title: '',
            description: '',
            count: null,
            sparse: false,
            sparseText: '',
            sourceLabel: options.sourceLabel || '',
            actionLabel: '',
            actionMode: ''
        };

        var panel = document.createElement('section');
        panel.className = 'front-page-state-panel phase-loading';
        panel.setAttribute('role', 'status');
        panel.setAttribute('aria-live', 'polite');
        panel.hidden = true;
        panel.innerHTML = [
            '<div class="front-page-state-badge"></div>',
            '<h3 class="front-page-state-title"></h3>',
            '<p class="front-page-state-desc"></p>',
            '<p class="front-page-state-sparse"></p>',
            '<div class="front-page-state-meta"></div>',
            '<button type="button" class="front-page-state-action"></button>'
        ].join('');

        function ensureMounted() {
            var mount = resolveMount(options.mount);
            if (!mount || !mount.parentNode) return false;
            if (!panel.parentNode) {
                if (options.position === 'after') {
                    mount.parentNode.insertBefore(panel, mount.nextSibling);
                } else {
                    mount.parentNode.insertBefore(panel, mount);
                }
            }
            return true;
        }

        function badgeText() {
            if (state.phase === 'loading') return '加载中';
            if (state.phase === 'error') return '请求失败';
            if (state.phase === 'empty') return '暂无数据';
            if (state.sparse) return '数据较少';
            return '已加载';
        }

        function render() {
            if (!ensureMounted()) return;
            var visible = state.phase !== 'ready' || !!state.sparse;
            panel.hidden = !visible;
            if (!visible) return;
            panel.className = 'front-page-state-panel phase-' + state.phase + (state.sparse ? ' is-sparse' : '');
            panel.querySelector('.front-page-state-badge').textContent = badgeText();
            panel.querySelector('.front-page-state-title').textContent = state.title || '';
            panel.querySelector('.front-page-state-desc').textContent = state.description || '';
            panel.querySelector('.front-page-state-sparse').textContent = state.sparseText || '';
            panel.querySelector('.front-page-state-sparse').style.display = state.sparseText ? 'block' : 'none';
            var meta = [];
            if (state.count !== null && state.count !== undefined) meta.push('当前记录：' + state.count);
            if (state.sourceLabel) meta.push(state.sourceLabel);
            panel.querySelector('.front-page-state-meta').textContent = meta.join(' ｜ ');
            var action = panel.querySelector('.front-page-state-action');
            if (state.actionLabel) {
                action.textContent = state.actionLabel;
                action.style.display = 'inline-flex';
            } else {
                action.style.display = 'none';
            }
        }

        panel.querySelector('.front-page-state-action').addEventListener('click', function() {
            if (typeof options.onAction === 'function') {
                options.onAction(state.actionMode, state);
            }
        });

        return {
            setLoading: function(opts) {
                opts = opts || {};
                state.phase = 'loading';
                state.title = opts.title || '正在加载内容';
                state.description = opts.description || '系统正在同步数据，请稍候。';
                state.count = opts.count !== undefined ? opts.count : null;
                state.sparse = false;
                state.sparseText = '';
                state.sourceLabel = opts.sourceLabel || options.sourceLabel || '';
                state.actionLabel = '';
                state.actionMode = '';
                render();
            },
            setReady: function(count, opts) {
                opts = opts || {};
                state.phase = 'ready';
                state.title = opts.title || '数据已同步';
                state.description = opts.description || '页面内容已完成加载。';
                state.count = count;
                state.sourceLabel = opts.sourceLabel || options.sourceLabel || '';
                state.actionLabel = opts.actionLabel || '';
                state.actionMode = opts.actionMode || '';
                state.sparse = false;
                state.sparseText = '';
                var threshold = Number(opts.sparseThreshold || 0);
                if (threshold > 0 && count > 0 && count < threshold) {
                    state.sparse = true;
                    state.sparseText = opts.sparseText || '当前为试点/演示样本，数据量有限，请结合试点边界理解结果。';
                }
                render();
            },
            setEmpty: function(opts) {
                opts = opts || {};
                state.phase = 'empty';
                state.title = opts.title || '当前暂无数据';
                state.description = opts.description || '还没有可展示的结果，可调整筛选条件或稍后刷新。';
                state.count = opts.count !== undefined ? opts.count : 0;
                state.sparse = false;
                state.sparseText = '';
                state.sourceLabel = opts.sourceLabel || options.sourceLabel || '';
                state.actionLabel = opts.actionLabel || '重新加载';
                state.actionMode = opts.actionMode || 'reload';
                render();
            },
            setError: function(opts) {
                opts = opts || {};
                state.phase = 'error';
                state.title = opts.title || '数据加载失败';
                state.description = opts.description || '请求接口失败，请稍后重试或检查后端服务。';
                state.count = opts.count !== undefined ? opts.count : null;
                state.sparse = false;
                state.sparseText = '';
                state.sourceLabel = opts.sourceLabel || options.sourceLabel || '';
                state.actionLabel = opts.actionLabel || '重新加载';
                state.actionMode = opts.actionMode || 'reload';
                render();
            },
            getState: function() {
                return Object.assign({}, state);
            }
        };
    }

    global.FrontPageState = {
        createPanel: createPanel
    };
})(window);
