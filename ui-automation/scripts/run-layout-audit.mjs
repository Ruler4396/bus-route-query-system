import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

const projectRoot = process.env.PROJECT_ROOT || '/root/dev/bus-route-query-system';
const automationRoot = process.env.UI_AUTOMATION_ROOT || path.join(projectRoot, 'ui-automation');
const baseUrl = process.env.UI_BASE_URL || 'http://127.0.0.1:8134/springbootmf383/front/';
const outDir = process.env.UI_LAYOUT_AUDIT_DIR || path.join(automationRoot, 'reports', 'layout-audit');
const failOnIssue = process.env.UI_LAYOUT_AUDIT_FAIL_ON_ISSUE !== '0';
const keepScreenshots = process.env.UI_LAYOUT_AUDIT_KEEP_SCREENSHOTS === '1';
const fullPageScreenshots = process.env.UI_LAYOUT_AUDIT_FULL_PAGE !== '0';
const maxScenarios = Math.max(1, Number(process.env.UI_LAYOUT_AUDIT_MAX_SCENARIOS || 14));
const waitMs = Math.max(400, Number(process.env.UI_LAYOUT_AUDIT_WAIT_MS || 1400));

fs.mkdirSync(outDir, { recursive: true });
for (const name of fs.readdirSync(outDir)) {
  if (/\.png$/i.test(name)) {
    fs.rmSync(path.join(outDir, name), { force: true });
  }
}

function toAbs(rel) {
  return new URL(rel, baseUrl).toString();
}

function safeName(name) {
  return name.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
}

async function login(page) {
  await page.goto(toAbs('pages/login/login.html'), { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="username"]', 'demo_user');
  await page.fill('input[name="password"]', 'demo123');
  await Promise.all([
    page.locator('#loginForm .btn-submit').click(),
    page.waitForFunction(() => location.href.includes('index.html') || !!document.querySelector('#header'), null, { timeout: 30000 })
  ]);
}

async function captureAuthStorage(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await login(page);
    return await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  } finally {
    await page.close();
  }
}

async function newPage(browser, viewport, storage = null) {
  const page = await browser.newPage({ viewport });
  if (storage && Object.keys(storage).length > 0) {
    await page.addInitScript((entries) => {
      for (const [key, value] of Object.entries(entries)) {
        localStorage.setItem(key, value);
      }
    }, storage);
  }
  return page;
}

async function openAuthedShell(browser, viewport, storage) {
  const page = await newPage(browser, viewport, storage);
  await page.goto(toAbs('index.html'), { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForSelector('#header', { timeout: 8000 });
  } catch (error) {
    await login(page);
  }
  await page.waitForSelector('#iframe', { timeout: 20000 });
  return page;
}

async function openShellFrame(browser, viewport, storage, relPath, frameUrlPattern) {
  const page = await openAuthedShell(browser, viewport, storage);
  const iframeHandle = await page.locator('#iframe').elementHandle();
  let frame = await iframeHandle.contentFrame();
  if (relPath) {
    await page.evaluate((src) => {
      const iframe = document.querySelector('#iframe');
      if (iframe) {
        iframe.setAttribute('src', src);
      }
      localStorage.setItem('iframeUrl', src);
    }, relPath);
    frame = await iframeHandle.contentFrame();
  }
  if (frameUrlPattern) {
    await frame.waitForURL(frameUrlPattern, { timeout: 20000 });
  }
  await frame.waitForTimeout(waitMs);
  return { page, frame };
}

async function collectPageIssues(pageOrFrame, selectorSpecs = []) {
  return pageOrFrame.evaluate((selectorSpecs) => {
    const tol = 2;
    const intersect = (a, b) => {
      const left = Math.max(a.left, b.left);
      const top = Math.max(a.top, b.top);
      const right = Math.min(a.right, b.right);
      const bottom = Math.min(a.bottom, b.bottom);
      const width = Math.max(0, right - left);
      const height = Math.max(0, bottom - top);
      return { left, top, right, bottom, width, height, area: width * height };
    };
    const rectObj = (r) => ({
      left: Math.round(r.left),
      top: Math.round(r.top),
      right: Math.round(r.right),
      bottom: Math.round(r.bottom),
      width: Math.round(r.width),
      height: Math.round(r.height)
    });
    const visible = (node) => {
      if (!node || !node.getBoundingClientRect) return false;
      const style = window.getComputedStyle(node);
      if (!style || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || '1') === 0) return false;
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const resolved = selectorSpecs.map((spec) => ({
      sel: spec.sel,
      minGap: Number(spec.minGap || 0),
      node: document.querySelector(spec.sel)
    }));
    const missingSelectors = resolved.filter((item) => !visible(item.node)).map((item) => item.sel);
    const selectorNodes = resolved.filter((item) => visible(item.node));
    const canScrollVertically = document.documentElement.scrollHeight > window.innerHeight + tol;

    const clipped = selectorNodes.map(({ sel, node }) => {
      const rect = node.getBoundingClientRect();
      const outsideHorizontally = rect.left < -tol || rect.right > window.innerWidth + tol;
      const outsideTop = rect.top < -tol;
      const outsideBottom = rect.bottom > window.innerHeight + tol && !canScrollVertically;
      if (!(outsideHorizontally || outsideTop || outsideBottom)) return null;
      return { selector: sel, rect: rectObj(rect) };
    }).filter(Boolean);

    const edgeTight = selectorNodes.map(({ sel, node, minGap }) => {
      if (!minGap) return null;
      const rect = node.getBoundingClientRect();
      const leftGap = Math.round(rect.left);
      const rightGap = Math.round(window.innerWidth - rect.right);
      if (leftGap >= minGap && rightGap >= minGap) return null;
      return { selector: sel, minGap, leftGap, rightGap, rect: rectObj(rect) };
    }).filter(Boolean);

    const fixedNodes = Array.from(document.querySelectorAll('body *')).filter((node) => {
      if (!visible(node)) return false;
      const style = window.getComputedStyle(node);
      const pos = style.position;
      if (pos !== 'fixed' && pos !== 'sticky') return false;
      const rect = node.getBoundingClientRect();
      return rect.width * rect.height >= 900;
    }).slice(0, 60);

    const overlaps = [];
    for (const fixed of fixedNodes) {
      const fixedRect = fixed.getBoundingClientRect();
      for (const { sel, node } of selectorNodes) {
        if (fixed === node || fixed.contains(node) || node.contains(fixed)) continue;
        const area = intersect(fixedRect, node.getBoundingClientRect());
        const nodeArea = Math.max(1, node.getBoundingClientRect().width * node.getBoundingClientRect().height);
        if (area.area >= 2400 && area.area / nodeArea >= 0.03) {
          overlaps.push({
            floating: fixed.className || fixed.id || fixed.tagName,
            target: sel,
            intersection: {
              width: Math.round(area.width),
              height: Math.round(area.height),
              area: Math.round(area.area)
            }
          });
        }
      }
    }

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      docScrollWidth: document.documentElement.scrollWidth,
      docScrollHeight: document.documentElement.scrollHeight,
      bodyScrollWidth: document.body.scrollWidth,
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      missingSelectors,
      clipped,
      edgeTight,
      overlaps
    };
  }, selectorSpecs);
}

const scenarioList = [
  {
    name: 'login-desktop',
    viewport: { width: 1280, height: 900 },
    run: async (browser) => {
      const page = await newPage(browser, { width: 1280, height: 900 });
      await page.goto(toAbs('pages/login/login.html'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '.login-intro', minGap: 24 },
          { sel: '#loginForm', minGap: 24 }
        ]
      };
    }
  },
  {
    name: 'login-tablet',
    viewport: { width: 820, height: 860 },
    run: async (browser) => {
      const page = await newPage(browser, { width: 820, height: 860 });
      await page.goto(toAbs('pages/login/login.html'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '.login-intro', minGap: 18 },
          { sel: '#loginForm', minGap: 18 }
        ]
      };
    }
  },
  {
    name: 'login-mobile',
    viewport: { width: 390, height: 844 },
    run: async (browser) => {
      const page = await newPage(browser, { width: 390, height: 844 });
      await page.goto(toAbs('pages/login/login.html'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '.login-intro', minGap: 10 },
          { sel: '#loginForm', minGap: 10 }
        ]
      };
    }
  },
  {
    name: 'shell-home-desktop',
    viewport: { width: 1280, height: 900 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 1280, height: 900 }, authStorage, null, /home\/home\.html/);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 10 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '#app', minGap: 10 },
          { sel: '.hero-command-center', minGap: 10 }
        ]
      };
    }
  },
  {
    name: 'shell-route-list-desktop',
    viewport: { width: 1280, height: 920 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 1280, height: 920 }, authStorage, './pages/gongjiaoluxian/list.html', /gongjiaoluxian\/list\.html/);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 10 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '#app', minGap: 10 }
        ]
      };
    }
  },
  {
    name: 'shell-route-map-desktop',
    viewport: { width: 1280, height: 920 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 1280, height: 920 }, authStorage, './pages/gongjiaoluxian/map.html', /gongjiaoluxian\/map\.html/);
      await frame.waitForTimeout(waitMs + 800);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 10 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '#app', minGap: 10 },
          { sel: '#map', minGap: 8 }
        ]
      };
    }
  },
  {
    name: 'shell-notice-list-desktop',
    viewport: { width: 1280, height: 920 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 1280, height: 920 }, authStorage, './pages/wangzhangonggao/list.html', /wangzhangonggao\/list\.html/);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 10 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '#app', minGap: 10 },
          { sel: '.recommend', minGap: 10 }
        ]
      };
    }
  },
  {
    name: 'shell-links-list-desktop',
    viewport: { width: 1280, height: 920 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 1280, height: 920 }, authStorage, './pages/youqinglianjie/list.html', /youqinglianjie\/list\.html/);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 10 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '#app', minGap: 10 },
          { sel: '.recommend', minGap: 10 }
        ]
      };
    }
  },
  {
    name: 'shell-messages-desktop',
    viewport: { width: 1280, height: 920 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 1280, height: 920 }, authStorage, './pages/messages/list.html', /messages\/list\.html/);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 10 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '#app', minGap: 10 },
          { sel: '.message-container', minGap: 10 }
        ]
      };
    }
  },
  {
    name: 'shell-accessibility-desktop',
    viewport: { width: 1280, height: 920 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 1280, height: 920 }, authStorage, './pages/accessibility/settings.html', /accessibility\/settings\.html/);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 10 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '.settings-container', minGap: 10 }
        ]
      };
    }
  },
  {
    name: 'shell-user-center-tablet',
    viewport: { width: 796, height: 780 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 796, height: 780 }, authStorage, './pages/yonghu/center.html', /yonghu\/center\.html/);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 8 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '#app', minGap: 12 },
          { sel: '.account-page-header', minGap: 12 },
          { sel: '.account-shell', minGap: 12 }
        ]
      };
    }
  },
  {
    name: 'shell-user-center-mobile',
    viewport: { width: 520, height: 820 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 520, height: 820 }, authStorage, './pages/yonghu/center.html', /yonghu\/center\.html/);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 6 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '#app', minGap: 8 },
          { sel: '.account-page-header', minGap: 8 },
          { sel: '.account-shell', minGap: 8 }
        ]
      };
    }
  },
  {
    name: 'shell-storeup-tablet',
    viewport: { width: 796, height: 780 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 796, height: 780 }, authStorage, './pages/storeup/list.html', /storeup\/list\.html/);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 8 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '#app', minGap: 12 },
          { sel: '.account-page-header', minGap: 12 },
          { sel: '.account-shell', minGap: 12 }
        ]
      };
    }
  },
  {
    name: 'shell-storeup-mobile',
    viewport: { width: 520, height: 820 },
    run: async (browser, authStorage) => {
      const { page, frame } = await openShellFrame(browser, { width: 520, height: 820 }, authStorage, './pages/storeup/list.html', /storeup\/list\.html/);
      return {
        page,
        shellSelectorSpecs: [
          { sel: '#iframe', minGap: 6 }
        ],
        frame,
        frameSelectorSpecs: [
          { sel: '#app', minGap: 8 },
          { sel: '.account-page-header', minGap: 8 },
          { sel: '.account-shell', minGap: 8 }
        ]
      };
    }
  }
].slice(0, maxScenarios);

const browser = await chromium.launch({ headless: true });
const summary = [];
const screenshotPaths = [];
let hasIssue = false;

try {
  const authStorage = await captureAuthStorage(browser);
  for (const scenario of scenarioList) {
    const result = await scenario.run(browser, authStorage);
    const shellIssues = await collectPageIssues(result.page, result.shellSelectorSpecs || []);
    const frameIssues = result.frame ? await collectPageIssues(result.frame, result.frameSelectorSpecs || []) : null;

    const screenshotPath = path.join(outDir, `${safeName(scenario.name)}.png`);
    await result.page.screenshot({ path: screenshotPath, fullPage: fullPageScreenshots });
    screenshotPaths.push(screenshotPath);

    const issueCount = [
      shellIssues.horizontalOverflow > 2 ? 1 : 0,
      shellIssues.missingSelectors.length,
      shellIssues.clipped.length,
      shellIssues.edgeTight.length,
      shellIssues.overlaps.length,
      frameIssues && frameIssues.horizontalOverflow > 2 ? 1 : 0,
      frameIssues ? frameIssues.missingSelectors.length : 0,
      frameIssues ? frameIssues.clipped.length : 0,
      frameIssues ? frameIssues.edgeTight.length : 0,
      frameIssues ? frameIssues.overlaps.length : 0
    ].reduce((sum, value) => sum + value, 0);

    if (issueCount > 0) hasIssue = true;

    summary.push({
      scenario: scenario.name,
      viewport: scenario.viewport,
      screenshot: keepScreenshots ? screenshotPath : null,
      screenshotDeleted: !keepScreenshots,
      shell: shellIssues,
      frame: frameIssues,
      issueCount
    });

    await result.page.close();
  }
} finally {
  await browser.close();
}

if (!keepScreenshots) {
  for (const screenshotPath of screenshotPaths) {
    fs.rmSync(screenshotPath, { force: true });
  }
}

const reportPath = path.join(outDir, 'summary.json');
fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({
  reportPath,
  scenarios: summary.length,
  hasIssue,
  screenshotsKept: keepScreenshots
}, null, 2));

if (hasIssue && failOnIssue) {
  process.exit(1);
}
