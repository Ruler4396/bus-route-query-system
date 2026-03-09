const { test, expect } = require('@playwright/test');

async function loginToShell(page) {
  await page.goto('http://127.0.0.1:8134/springbootmf383/front/pages/login/login.html', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="username"]', 'demo_user');
  await page.fill('input[name="password"]', 'demo123');
  await Promise.all([
    page.locator('#loginForm .btn-submit').click(),
    page.waitForFunction(() => location.href.includes('index.html') || !!document.querySelector('#header'), null, { timeout: 30000 })
  ]);
}

async function openFramePage(page, relPath, urlPattern) {
  await page.evaluate((src) => {
    const iframe = document.querySelector('#iframe');
    if (iframe) iframe.setAttribute('src', src);
    localStorage.setItem('iframeUrl', src);
  }, relPath);
  const iframeHandle = await page.locator('#iframe').elementHandle();
  const frame = await iframeHandle.contentFrame();
  await frame.waitForURL(urlPattern, { timeout: 20000 });
  await frame.waitForTimeout(1400);
  return frame;
}

function shellOverlapMetrics() {
  const iframe = document.querySelector('#iframe');
  const main = document.querySelector('#main-content');
  const fixedNodes = Array.from(document.querySelectorAll('body *')).filter((node) => {
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && ['fixed', 'sticky'].includes(style.position) && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || '1') > 0;
  });
  const intersects = (a, b) => {
    const left = Math.max(a.left, b.left);
    const top = Math.max(a.top, b.top);
    const right = Math.min(a.right, b.right);
    const bottom = Math.min(a.bottom, b.bottom);
    return Math.max(0, right - left) * Math.max(0, bottom - top);
  };
  const targets = [
    ['#iframe', iframe],
    ['#main-content', main]
  ].filter(([, node]) => !!node);
  const overlaps = [];
  for (const fixed of fixedNodes) {
    const fixedRect = fixed.getBoundingClientRect();
    for (const [sel, node] of targets) {
      if (fixed === node || fixed.contains(node) || node.contains(fixed)) continue;
      const area = intersects(fixedRect, node.getBoundingClientRect());
      if (area >= 2400) {
        overlaps.push({
          floating: fixed.className || fixed.id || fixed.tagName,
          target: sel,
          area: Math.round(area)
        });
      }
    }
  }
  return {
    innerWidth: window.innerWidth,
    bodyScrollWidth: document.body.scrollWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    overlapCount: overlaps.length,
    overlaps
  };
}

function frameMetrics(minGap) {
  const q = (sel) => document.querySelector(sel);
  const selectors = ['#app', '.account-page-header', '.account-shell'];
  const offenders = Array.from(document.querySelectorAll('body *')).filter((node) => {
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && (rect.left < -2 || rect.right > window.innerWidth + 2);
  }).slice(0, 12).map((node) => {
    const rect = node.getBoundingClientRect();
    return {
      tag: node.tagName,
      cls: node.className || '',
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width)
    };
  });
  const edgeTight = selectors.map((sel) => {
    const node = q(sel);
    if (!node) return { sel, missing: true };
    const rect = node.getBoundingClientRect();
    const leftGap = Math.round(rect.left);
    const rightGap = Math.round(window.innerWidth - rect.right);
    if (leftGap >= minGap && rightGap >= minGap) return null;
    return { sel, leftGap, rightGap, minGap };
  }).filter(Boolean);
  const swiper = q('#swiper');
  return {
    innerWidth: window.innerWidth,
    bodyScrollWidth: document.body.scrollWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    offenderCount: offenders.length,
    offenders,
    edgeTightCount: edgeTight.length,
    edgeTight,
    hasHeader: !!q('.account-page-header'),
    hasShell: !!q('.account-shell'),
    hasToolbar: !!q('.account-toolbar'),
    hasCollectionGrid: !!q('.account-collection-grid') || !!q('.account-empty-state'),
    swiperHidden: !swiper || window.getComputedStyle(swiper).display === 'none'
  };
}

test.describe('Storeup Layout', () => {
  for (const viewport of [
    { width: 796, height: 780, minGap: 12 },
    { width: 520, height: 820, minGap: 8 }
  ]) {
    test(`storeup page should stay within viewport at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await loginToShell(page);
      const frame = await openFramePage(page, './pages/storeup/list.html', /storeup\/list\.html/);

      const shellMetrics = await page.evaluate(shellOverlapMetrics);
      const metrics = await frame.evaluate(frameMetrics, viewport.minGap);

      expect(shellMetrics.bodyScrollWidth).toBeLessThanOrEqual(shellMetrics.innerWidth + 2);
      expect(shellMetrics.docScrollWidth).toBeLessThanOrEqual(shellMetrics.innerWidth + 2);
      expect(shellMetrics.overlapCount).toBe(0);
      expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);
      expect(metrics.docScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);
      expect(metrics.offenderCount).toBe(0);
      expect(metrics.edgeTightCount).toBe(0);
      expect(metrics.hasHeader).toBeTruthy();
      expect(metrics.hasShell).toBeTruthy();
      expect(metrics.hasToolbar).toBeTruthy();
      expect(metrics.hasCollectionGrid).toBeTruthy();
      expect(metrics.swiperHidden).toBeTruthy();
    });
  }
});
