const { test, expect } = require('@playwright/test');

async function getIframe(page) {
  const iframeLocator = page.locator('#iframe');
  await expect(iframeLocator).toBeVisible();
  const handle = await iframeLocator.elementHandle();
  if (!handle) throw new Error('IFRAME_MISSING');
  const frame = await handle.contentFrame();
  if (!frame) throw new Error('IFRAME_NO_CONTENT');
  return { iframeLocator, frame };
}

test.describe('Shell Naturalness', () => {
  test('Shell should scroll as one page and let header naturally leave viewport', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const { iframeLocator, frame } = await getIframe(page);
    await frame.waitForSelector('body', { timeout: 20_000 });
    await page.waitForTimeout(1200);

    const initial = await page.evaluate(() => ({
      mode: document.body.getAttribute('data-shell-scroll-mode') || '',
      headerTop: Math.round(document.getElementById('header').getBoundingClientRect().top),
      windowScrollY: Math.round(window.scrollY || window.pageYOffset || 0)
    }));

    if (initial.mode !== 'page') {
      throw new Error(`SHELL_MODE_UNEXPECTED: ${initial.mode}`);
    }
    if (initial.windowScrollY !== 0) {
      throw new Error(`SHELL_INITIAL_SCROLL: 初始滚动位置异常(${initial.windowScrollY})`);
    }

    await page.evaluate(() => window.scrollTo(0, 720));
    await page.waitForTimeout(450);

    const after = await page.evaluate(() => {
      const header = document.getElementById('header');
      const iframe = document.getElementById('iframe');
      return {
        windowScrollY: Math.round(window.scrollY || window.pageYOffset || 0),
        headerBottom: Math.round(header.getBoundingClientRect().bottom),
        iframeOverflowY: window.getComputedStyle(iframe).overflowY,
        bodyOverflowY: window.getComputedStyle(document.body).overflowY
      };
    });

    if (after.windowScrollY < 300) {
      throw new Error(`SHELL_NOT_SCROLLING: 外层页面未产生自然滚动(${after.windowScrollY})`);
    }
    if (after.headerBottom > 0) {
      throw new Error(`HEADER_STILL_FIXED: 顶部壳层仍停留在视口内(headerBottom=${after.headerBottom})`);
    }
    if (after.iframeOverflowY === 'scroll' || after.iframeOverflowY === 'auto') {
      throw new Error(`IFRAME_SCROLLABLE: iframe 仍保留独立滚动(${after.iframeOverflowY})`);
    }
    if (after.bodyOverflowY === 'hidden') {
      throw new Error('BODY_SCROLL_LOCKED: 外层页面仍被锁定滚动');
    }
  });



  test('Shell should not auto-scroll again after user reaches the page bottom', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const { frame } = await getIframe(page);
    await frame.waitForSelector('.home-unified-sections', { timeout: 20_000 });
    await page.waitForTimeout(1800);

    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight || document.body.scrollHeight || 0);
    });
    await page.waitForTimeout(500);

    const before = await page.evaluate(() => Math.round(window.scrollY || window.pageYOffset || 0));
    await page.waitForTimeout(4200);
    const after = await page.evaluate(() => Math.round(window.scrollY || window.pageYOffset || 0));

    if (Math.abs(after - before) > 12) {
      throw new Error(`SHELL_AUTO_SCROLL_BOTTOM: 页面到底后出现自动滚动(before=${before}, after=${after})`);
    }
  });

  test('Announcement, messages and resource pages should suppress decorative banners', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const checks = [
      { nav: '出行服务公告', pageFlag: 'page-notice-list' },
      { nav: '留言与改进建议', pageFlag: 'page-messages-list' },
      { nav: '无障碍资源链接', pageFlag: 'page-links-list' }
    ];

    for (const item of checks) {
      await page.locator('#header a', { hasText: item.nav }).first().click();
      const { frame } = await getIframe(page);
      await frame.waitForSelector('body', { timeout: 20_000 });
      await frame.waitForTimeout(800);

      const state = await frame.evaluate((pageFlag) => {
        const body = document.body;
        const banner = document.querySelector('.banner, #swiper, #test1');
        const img = document.querySelector('.list-item-body img');
        const bannerStyle = banner ? window.getComputedStyle(banner) : null;
        const imgStyle = img ? window.getComputedStyle(img) : null;
        return {
          bodyClass: body ? body.className : '',
          bannerVisible: banner ? !(bannerStyle.display === 'none' || bannerStyle.visibility === 'hidden' || parseFloat(bannerStyle.opacity || '1') === 0) : false,
          firstImageVisible: img ? !(imgStyle.display === 'none' || imgStyle.visibility === 'hidden' || parseFloat(imgStyle.opacity || '1') === 0) : false,
          textLength: ((body && body.innerText) || '').replace(/\s+/g, '').length
        };
      }, item.pageFlag);

      if (!state.bodyClass.includes(item.pageFlag)) {
        throw new Error(`PAGE_FLAG_MISSING: ${item.nav} 缺少 ${item.pageFlag}`);
      }
      if (state.textLength < 40) {
        throw new Error(`PAGE_TEXT_TOO_SHORT: ${item.nav} 页面文本过少`);
      }
      if (state.bannerVisible) {
        throw new Error(`DECORATIVE_BANNER_VISIBLE: ${item.nav} 仍显示装饰性轮播/横幅`);
      }
      if (item.pageFlag !== 'page-messages-list' && state.firstImageVisible) {
        throw new Error(`DECORATIVE_IMAGE_VISIBLE: ${item.nav} 仍显示装饰性封面图`);
      }
    }
  });
});
