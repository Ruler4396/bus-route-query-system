# bus-route-query-system · REMOTE_DEV_WORKFLOW

最后更新：2026-03-07  
票据：`CHG-20260307-001`

## 1. 目标
把开发、调试、回归统一收敛到远端服务器 `8.134.206.52`，本地工作区仅作为文档入口和索引，不再作为主执行环境。

## 2. 端口约定
- `8133`：生产实例，保持现网可访问。
- `8134`：远端开发实例，供代码调试、页面回归、UI 自动化验证使用。

## 3. 标准命令
```bash
cd /root/dev/bus-route-query-system
bash scripts/remote-dev-check.sh
bash scripts/remote-dev-build.sh
bash scripts/remote-dev-start.sh
bash scripts/remote-dev-status.sh
bash scripts/remote-dev-stop.sh
```

## 4. 行为约束
- 开发改动先在 `8134` 验证，再决定是否影响 `8133`。
- 默认低冲击执行，不并行高负载构建。
- 如只涉及文档、脚本、样式微调，优先做最小回归，不触碰生产实例。
- 所有新增运维入口必须写入文档，避免“只有服务器上知道”的隐式流程。

## 5. 推荐验证顺序
1. `remote-dev-check.sh`
2. `remote-dev-build.sh`
3. `remote-dev-start.sh`
4. 浏览器访问：`http://8.134.206.52:8134/springbootmf383/front/index.html`
5. 如需 UI 自动化：
```bash
cd /root/dev/bus-route-query-system/ui-automation
npm install
UI_BASE_URL=http://127.0.0.1:8134/springbootmf383/front/ npm run ui:check
```

## 6. 产物位置
- 日志：`runtime/remote-dev/app.log`
- PID：`runtime/remote-dev/server.pid`
- 演示 H2 数据：`data/springbootmf383-demo.mv.db`
