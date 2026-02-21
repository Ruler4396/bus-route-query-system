import fs from 'fs';
import path from 'path';

const projectRoot = process.env.PROJECT_ROOT || '/root/dev/bus-route-query-system';
const reportPath = process.env.UI_REPORT_PATH || path.join(projectRoot, 'ui-automation', 'reports', 'ui-check-report.json');

function readFileSafe(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (err) {
    return null;
  }
}

function writeIfChanged(file, nextContent, prevContent, changeTag, changes) {
  if (nextContent !== prevContent) {
    fs.writeFileSync(file, nextContent, 'utf8');
    changes.push(changeTag);
    return true;
  }
  return false;
}

function parseFailureCodes() {
  const raw = readFileSafe(reportPath);
  if (!raw) return [];
  try {
    const json = JSON.parse(raw);
    const text = JSON.stringify(json);
    const codes = [
      'IFRAME_COLLAPSE',
      'MAIN_BLANK',
      'HEADER_OVERLAY',
      'MAP_BLANK_SCROLL',
      'FROZEN_LOADING',
      'A11Y_CRITICAL'
    ];
    return codes.filter((code) => text.includes(code));
  } catch (err) {
    return [];
  }
}

function patchIndexHtml(changes) {
  const file = path.join(projectRoot, 'src/main/resources/front/front/index.html');
  const content = readFileSafe(file);
  if (!content) return false;

  let next = content;
  next = next.replace(/scrolling="no"/g, 'scrolling="auto"');
  next = next.replace(/onload="changeFrameHeight"(?!\()/g, 'onload="changeFrameHeight()"');
  next = next.replace(/iframe\.style\.height\s*=\s*['"]1px['"];\s*/g, '');
  next = next.replace(
    /iframe\.height\s*=\s*Math\.max\(([^;]+)\);/g,
    "iframe.style.height = Math.max($1) + 'px';"
  );

  return writeIfChanged(file, next, content, 'index_html_hardening', changes);
}

function patchTransitCss(changes) {
  const file = path.join(projectRoot, 'src/main/resources/front/front/css/transit-business-ui.css');
  const content = readFileSafe(file);
  if (!content) return false;

  const markerStart = '/* ui-heal-emergency-start */';
  const markerEnd = '/* ui-heal-emergency-end */';
  if (content.includes(markerStart) && content.includes(markerEnd)) {
    return false;
  }

  const emergencyBlock = [
    '',
    markerStart,
    'body.transit-shell #header {',
    '  position: sticky !important;',
    '  top: 0 !important;',
    '  z-index: 30 !important;',
    '  height: auto !important;',
    '  overflow: visible !important;',
    '  background: #1e2724 !important;',
    '  border-bottom: 0 !important;',
    '  border: 0 !important;',
    '}',
    '',
    'body.transit-shell #main-content {',
    '  min-height: 560px !important;',
    '}',
    '',
    'body.transit-shell #iframe {',
    '  min-height: 560px !important;',
    '  display: block !important;',
    '}',
    '',
    '.page-route-map #app {',
    '  min-height: 0 !important;',
    '  padding-bottom: 10px !important;',
    '}',
    markerEnd,
    ''
  ].join('\n');

  const next = content + emergencyBlock;
  return writeIfChanged(file, next, content, 'transit_css_emergency_block', changes);
}

function patchAccessibilityEngine(changes) {
  const file = path.join(projectRoot, 'src/main/resources/front/front/js/accessibility.js');
  const content = readFileSafe(file);
  if (!content) return false;

  if (content.includes('UI自愈规则引擎') && content.includes('runUiSelfHeal')) {
    return false;
  }

  const insertion = [
    '',
    '// UI auto-fix guard marker',
    "console.warn('UI自愈引擎缺失，请同步最新accessibility.js');",
    ''
  ].join('\n');

  const next = content + insertion;
  return writeIfChanged(file, next, content, 'accessibility_engine_marker', changes);
}

function main() {
  const changes = [];
  const failureCodes = parseFailureCodes();
  const has = (code) => failureCodes.includes(code);

  if (has('IFRAME_COLLAPSE') || has('MAIN_BLANK') || has('HEADER_OVERLAY')) {
    patchIndexHtml(changes);
    patchTransitCss(changes);
  }
  if (has('MAP_BLANK_SCROLL')) {
    patchTransitCss(changes);
  }
  if (has('FROZEN_LOADING')) {
    patchAccessibilityEngine(changes);
  }

  const payload = {
    projectRoot,
    reportPath,
    failureCodes,
    changed: changes.length > 0,
    changes
  };
  process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
  if (changes.length > 0) {
    process.exitCode = 10;
  }
}

main();
