import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const projectRoot = process.env.PROJECT_ROOT || '/root/dev/bus-route-query-system';
const automationRoot = process.env.UI_AUTOMATION_ROOT || path.join(projectRoot, 'ui-automation');
const appPort = process.env.UI_APP_PORT || '8133';
const jarPath = process.env.UI_JAR_PATH || path.join(projectRoot, 'target', 'springbootmf383-0.0.1-SNAPSHOT.jar');
const serverLog = process.env.UI_SERVER_LOG || path.join(projectRoot, 'server-8133.log');
const reportPath = process.env.UI_REPORT_PATH || path.join(automationRoot, 'reports', 'ui-check-report.json');

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
      payload.raw = stdout;
    }
  }
  return { fixRun, payload };
}

function buildAndRestart() {
  const env = process.env;
  const build = runCmd('mvn', ['-DskipTests', 'package', '-q'], projectRoot, env, true);
  if (build.status !== 0) {
    return build.status || 2;
  }

  const restartScript = [
    "PIDS=$(ps -ef | grep '[j]ava .*springbootmf383-0.0.1-SNAPSHOT.jar' | awk '{print $2}')",
    'if [ -n "$PIDS" ]; then kill $PIDS; sleep 2; fi',
    `cd ${projectRoot}`,
    `nohup /usr/bin/java -Xms128m -Xmx512m -Dserver.port=${appPort} -Dvehicle.ws.push-interval-ms=10000 -Djava.awt.headless=true -jar ${jarPath} >${serverLog} 2>&1 < /dev/null & disown`,
    `for i in $(seq 1 30); do ss -ltnp | grep :${appPort} >/dev/null && break; sleep 1; done`,
    `ss -ltnp | grep :${appPort}`
  ].join('\n');

  const restart = runCmd('bash', ['-lc', restartScript], projectRoot, env, true);
  return restart.status || 0;
}

function main() {
  ensureDirs();
  const env = {
    ...process.env,
    PROJECT_ROOT: projectRoot,
    UI_REPORT_PATH: reportPath
  };

  console.log('[ui-guard] step=check phase=first');
  const first = runUiCheck(env);
  if (first.status === 0) {
    console.log('[ui-guard] result=pass phase=first');
    process.exit(0);
  }

  console.log('[ui-guard] result=fail phase=first');
  console.log('[ui-guard] step=auto_fix');
  const { payload } = runAutoFix(env);
  console.log('[ui-guard] auto_fix_payload=' + JSON.stringify(payload));

  if (!payload.changed) {
    console.error('[ui-guard] no safe autofix available');
    process.exit(first.status || 1);
  }

  console.log('[ui-guard] step=build_restart');
  const restartStatus = buildAndRestart();
  if (restartStatus !== 0) {
    console.error('[ui-guard] build/restart failed with code=' + restartStatus);
    process.exit(restartStatus);
  }

  console.log('[ui-guard] step=check phase=second');
  const second = runUiCheck(env);
  if (second.status === 0) {
    console.log('[ui-guard] result=pass phase=second');
    process.exit(0);
  }

  console.error('[ui-guard] result=fail phase=second');
  process.exit(second.status || 1);
}

main();
