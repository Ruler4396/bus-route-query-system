import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const projectRoot = process.env.PROJECT_ROOT || '/root/dev/bus-route-query-system';
const automationRoot = process.env.UI_AUTOMATION_ROOT || path.join(projectRoot, 'ui-automation');
const appPort = process.env.UI_APP_PORT || '8134';
const reportPath = process.env.UI_REPORT_PATH || path.join(automationRoot, 'reports', 'ui-check-report.json');
const maxAutofixRounds = Math.max(0, Number(process.env.UI_GUARD_MAX_AUTOFIX_ROUNDS || 1));

function runCmd(cmd, args, cwd, env, inherit = true) {
  const result = spawnSync(cmd, args, {
    cwd,
    env,
    stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe']
  });
  return result;
}

function ensureDirs() {
  fs.mkdirSync(path.join(automationRoot, 'reports'), { recursive: true });
  fs.mkdirSync(path.join(automationRoot, 'logs'), { recursive: true });
}

function ensureDevServer(env) {
  return runCmd('bash', ['scripts/remote-dev-start.sh'], projectRoot, env, true);
}

function runUiCheck(env) {
  return runCmd(
    'npx',
    ['playwright', 'test'],
    automationRoot,
    { ...env, PLAYWRIGHT_CHROMIUM_USE_HEADLESS_SHELL: '0' },
    true
  );
}

function runAutoFix(env) {
  const fixRun = runCmd(
    'node',
    ['scripts/auto-fix-known-issues.mjs'],
    automationRoot,
    { ...env, PROJECT_ROOT: projectRoot, UI_REPORT_PATH: reportPath },
    false
  );
  const stdout = (fixRun.stdout || '').toString('utf8').trim();
  let payload = { changed: false, changes: [] };
  if (stdout) {
    try {
      payload = JSON.parse(stdout);
    } catch (err) {
      payload = { changed: false, changes: [], raw: stdout };
    }
  }
  return { fixRun, payload };
}

function buildAndRestartDev(env) {
  const build = runCmd('bash', ['scripts/remote-dev-build.sh'], projectRoot, env, true);
  if (build.status !== 0) {
    return build.status || 2;
  }
  runCmd('bash', ['scripts/remote-dev-stop.sh'], projectRoot, env, true);
  const restart = runCmd('bash', ['scripts/remote-dev-start.sh'], projectRoot, env, true);
  return restart.status || 0;
}

function main() {
  ensureDirs();
  const env = {
    ...process.env,
    PROJECT_ROOT: projectRoot,
    UI_APP_PORT: appPort,
    UI_REPORT_PATH: reportPath,
    REMOTE_DEV_PORT: appPort
  };

  console.log('[ui-guard] step=ensure_dev_server port=' + appPort);
  const start = ensureDevServer(env);
  if (start.status !== 0) {
    console.error('[ui-guard] ensure_dev_server failed code=' + start.status);
    process.exit(start.status || 2);
  }

  console.log('[ui-guard] step=check phase=first');
  const first = runUiCheck(env);
  if (first.status === 0) {
    console.log('[ui-guard] result=pass phase=first');
    process.exit(0);
  }

  console.log('[ui-guard] result=fail phase=first');
  if (maxAutofixRounds <= 0) {
    console.error('[ui-guard] autofix disabled by UI_GUARD_MAX_AUTOFIX_ROUNDS=0');
    process.exit(first.status || 1);
  }

  for (let round = 1; round <= maxAutofixRounds; round += 1) {
    console.log('[ui-guard] step=auto_fix round=' + round + '/' + maxAutofixRounds);
    const { payload } = runAutoFix(env);
    console.log('[ui-guard] auto_fix_payload=' + JSON.stringify(payload));

    if (!payload.changed) {
      console.error('[ui-guard] no safe autofix available');
      process.exit(first.status || 1);
    }

    console.log('[ui-guard] step=build_restart_dev round=' + round);
    const restartStatus = buildAndRestartDev(env);
    if (restartStatus !== 0) {
      console.error('[ui-guard] build/restart dev failed with code=' + restartStatus);
      process.exit(restartStatus);
    }

    console.log('[ui-guard] step=check phase=retry round=' + round);
    const retry = runUiCheck(env);
    if (retry.status === 0) {
      console.log('[ui-guard] result=pass phase=retry round=' + round);
      process.exit(0);
    }
  }

  console.error('[ui-guard] result=fail after max autofix rounds=' + maxAutofixRounds);
  process.exit(1);
}

main();
