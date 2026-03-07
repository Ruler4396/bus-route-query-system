const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function getIframe(page) {
  const iframeLocator = page.locator('#iframe');
  await expect(iframeLocator).toBeVisible();
  const handle = await iframeLocator.elementHandle();
  if (!handle) {
    throw new Error('IFRAME_MISSING: 未找到业务iframe');
  }
  const frame = await handle.contentFrame();
  if (!frame) {
    throw new Error('IFRAME_NO_CONTENT: iframe尚未加载内容');
  }
  return { iframeLocator, frame };
}

test.describe('UI Guardrails', () => {
  test('Shell must not be blank or collapsed', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const { iframeLocator, frame } = await getIframe(page);

    await frame.waitForSelector('body', { timeout: 20_000 });

    const iframeHeight = await iframeLocator.evaluate((node) =>
      Math.round(node.getBoundingClientRect().height)
    );
    if (iframeHeight < 520) {
      throw new Error(`IFRAME_COLLAPSE: iframe高度异常(${iframeHeight}px)`);
    }

    const mainTextLength = await frame.evaluate(() => {
      const body = document.body;
      if (!body) return 0;
      return (body.innerText || '').replace(/\s+/g, '').length;
    });
    if (mainTextLength < 20) {
      throw new Error('MAIN_BLANK: 页面内容过少，疑似空白');
    }
  });

  test('Header and assist strip must not overlap main content', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();

    const check = await page.evaluate(() => {
      const header = document.getElementById('header');
      const main = document.getElementById('main-content');
      if (!header || !main) return { overlap: false, legacyRed: false };
      const headerRect = header.getBoundingClientRect();
      const assistStrip = document.querySelector('#header .transit-assist-strip');
      const assistBottom = assistStrip ? assistStrip.getBoundingClientRect().bottom : 0;
      const overlayBottom = Math.max(headerRect.bottom, assistBottom);
      const mainRect = main.getBoundingClientRect();
      const style = window.getComputedStyle(header);
      const legacyRed =
        style.backgroundColor === 'rgb(212, 46, 59)' ||
        (parseFloat(style.borderBottomWidth || '0') > 0 &&
          style.borderBottomColor === 'rgb(6, 137, 125)');
      return {
        overlap: overlayBottom > mainRect.top + 2,
        legacyRed
      };
    });

    if (check.overlap) {
      throw new Error('HEADER_OVERLAY: 顶部区域遮挡主内容');
    }
    if (check.legacyRed) {
      throw new Error('HEADER_LEGACY_THEME: 检测到旧模板红色头部样式残留');
    }
  });

  test('Map page should not have excessive blank scroll area', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '实时线路地图' }).first().click();

    const { frame } = await getIframe(page);
    await frame.waitForSelector('#map', { timeout: 25_000 });
    await frame.waitForTimeout(1200);

    const metrics = await frame.evaluate(() => {
      const mapContainer = document.querySelector('.map-container');
      const app = document.getElementById('app');
      if (!mapContainer) {
        return { missing: true, blankGap: 0 };
      }
      const contentBottom = mapContainer.getBoundingClientRect().bottom + window.scrollY;
      const appBottom = app ? app.getBoundingClientRect().bottom + window.scrollY : contentBottom;
      const totalHeight = Math.max(
        document.documentElement.offsetHeight || 0,
        document.body ? document.body.offsetHeight || 0 : 0,
        document.documentElement.clientHeight || 0,
        document.body ? document.body.clientHeight || 0 : 0
      );
      return {
        missing: false,
        blankGap: Math.max(0, Math.round(totalHeight - Math.max(contentBottom, appBottom)))
      };
    });

    if (metrics.missing) {
      throw new Error('MAP_CONTAINER_MISSING: 地图容器不存在');
    }
    if (metrics.blankGap > 260) {
      throw new Error(`MAP_BLANK_SCROLL: 地图页面底部空白滚动过大(${metrics.blankGap}px)`);
    }
  });

  test('Navigation should not be blocked by frozen loading mask', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const targets = ['无障碍路线规划', '出行服务公告', '无障碍资源链接'];

    for (const navText of targets) {
      await page.locator('#header a', { hasText: navText }).first().click();
      const { frame } = await getIframe(page);
      await frame.waitForTimeout(1800);

      const frozenLoading = await frame.evaluate(() => {
        const nodes = document.querySelectorAll(
          '.layui-layer-loading, .loading, .loading-mask, .spinner, [aria-busy="true"], [data-loading="true"]'
        );
        const now = Date.now();
        for (const node of nodes) {
          const marker = Number(node.getAttribute('data-ui-heal-loading-start') || 0);
          if (marker && now - marker > 15000) {
            return true;
          }
        }
        return false;
      });
      if (frozenLoading) {
        throw new Error(`FROZEN_LOADING: ${navText} 页面出现疑似卡死加载层`);
      }
    }
  });

  test('Primary nav pill should be clickable on outer hit area', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const targetLi = page.locator('#header .nav-primary-group li').nth(1);
    await expect(targetLi).toBeVisible();

    const beforeSrc = await page.locator('#iframe').getAttribute('src');
    const box = await targetLi.boundingBox();
    if (!box) {
      throw new Error('NAV_HITBOX_MISSING: 无法获取导航按钮区域');
    }

    // 点击胶囊左侧区域，避开文字中心，验证外围可点击
    await page.mouse.click(box.x + 8, box.y + box.height / 2);
    await page.waitForTimeout(600);
    const afterSrc = await page.locator('#iframe').getAttribute('src');

    if (beforeSrc === afterSrc) {
      throw new Error('NAV_OUTER_CLICK_INVALID: 导航按钮外围区域点击未触发切换');
    }
  });

  test('Shell should avoid dual vertical scrollbars', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const { iframeLocator, frame } = await getIframe(page);
    await frame.waitForSelector('body', { timeout: 20_000 });
    await page.waitForTimeout(1200);

    const metrics = await page.evaluate(() => {
      const iframe = document.getElementById('iframe');
      if (!iframe) {
        return { missing: true };
      }
      const bodyStyle = window.getComputedStyle(document.body);
      const shellScrollable =
        (document.documentElement.scrollHeight || 0) - window.innerHeight;
      return {
        missing: false,
        shellMode: document.body.getAttribute('data-shell-scroll-mode') || '',
        bodyOverflowY: bodyStyle ? bodyStyle.overflowY || '' : '',
        iframeScrolling: iframe.getAttribute('scrolling') || '',
        iframeOverflow: window.getComputedStyle(iframe).overflowY || '',
        shellScrollable
      };
    });
    if (metrics.missing) {
      throw new Error('IFRAME_MISSING: 页面缺少业务 iframe');
    }
    const frameMetrics = await frame.evaluate(() => ({
      innerScrollable:
        (document.documentElement.scrollHeight || 0) - window.innerHeight
    }));

    const iframeMode = metrics.shellMode === 'iframe';
    if (iframeMode) {
      if (!['hidden', 'clip'].includes(metrics.bodyOverflowY)) {
        throw new Error(`SHELL_SCROLL_MODE_INVALID: iframe单滚动模式下body未锁定(${metrics.bodyOverflowY})`);
      }
      if (!['auto', 'yes'].includes(metrics.iframeScrolling)) {
        throw new Error(`IFRAME_SCROLL_ATTR_INVALID: iframe单滚动模式下scrolling属性异常(${metrics.iframeScrolling})`);
      }
      if (metrics.shellScrollable > 24) {
        throw new Error(`SHELL_STILL_SCROLLABLE: 外层页面仍可滚动(${Math.round(metrics.shellScrollable)}px)`);
      }
      if (frameMetrics.innerScrollable < 20) {
        throw new Error('IFRAME_SCROLL_RANGE_TOO_SMALL: iframe内滚动范围异常偏小');
      }
      return;
    }

    if (metrics.iframeScrolling !== 'no') {
      throw new Error(`DUAL_SCROLL_ATTR: iframe scrolling 属性异常(${metrics.iframeScrolling})`);
    }
    if (metrics.shellScrollable > 40 && frameMetrics.innerScrollable > 40) {
      throw new Error(
        `DUAL_SCROLLBAR: 检测到内外层同时可滚动(shell=${Math.round(metrics.shellScrollable)}, frame=${Math.round(frameMetrics.innerScrollable)})`
      );
    }
  });

  test('Floating accessibility entry should be explicit and easy to hit', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const entry = page.locator('.assist-entry-btn');
    await expect(entry).toBeVisible();

    const info = await entry.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        text: (node.textContent || '').replace(/\s+/g, ''),
        label: node.getAttribute('aria-label') || '',
        width: rect.width,
        height: rect.height
      };
    });

    if (!info.text.includes('无障碍设置')) {
      throw new Error('ASSIST_ENTRY_TEXT: 无障碍入口文案不清晰');
    }
    if (!info.label) {
      throw new Error('ASSIST_ENTRY_ARIA: 无障碍入口缺少 aria-label');
    }
    if (info.width < 92 || info.height < 40) {
      throw new Error(`ASSIST_ENTRY_SIZE: 无障碍入口点击热区过小(${info.width}x${info.height})`);
    }
  });

  test('Home recommendation sections should not be clipped by iframe container', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '首页总览' }).first().click();
    const { iframeLocator, frame } = await getIframe(page);
    await frame.waitForSelector('.home-unified-sections', { timeout: 25_000 });
    await frame.waitForTimeout(2200);

    const shellMode = await page.evaluate(
      () => document.body.getAttribute('data-shell-scroll-mode') || ''
    );

    const shellMetrics = await iframeLocator.evaluate((node) => ({
      iframeHeight: Math.round(node.getBoundingClientRect().height)
    }));
    const frameMetrics = await frame.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('.home-unified-section'));
      const linkSection = sections[2] || null;
      const docHeight = Math.max(
        document.documentElement.scrollHeight || 0,
        document.body ? document.body.scrollHeight || 0 : 0
      );
      const linkBottom = linkSection
        ? Math.round(linkSection.getBoundingClientRect().bottom + window.scrollY)
        : -1;
      return {
        sectionCount: sections.length,
        docHeight,
        linkBottom
      };
    });

    if (frameMetrics.sectionCount < 3) {
      throw new Error(`HOME_SECTION_MISSING: 推荐区数量异常(${frameMetrics.sectionCount})`);
    }

    if (shellMode === 'iframe') {
      await frame.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight || document.body.scrollHeight || 0);
      });
      await frame.waitForTimeout(260);
      const visibleCheck = await frame.evaluate(() => {
        const sections = Array.from(document.querySelectorAll('.home-unified-section'));
        const linkSection = sections[2] || null;
        if (!linkSection) return { ok: false, reason: 'LINK_SECTION_MISSING' };
        const rect = linkSection.getBoundingClientRect();
        return {
          ok: rect.bottom <= window.innerHeight + 8
        };
      });
      if (!visibleCheck.ok) {
        throw new Error('HOME_LINK_SECTION_NOT_REACHABLE: iframe单滚动模式下底部推荐区仍不可达');
      }
      return;
    }

    if (shellMetrics.iframeHeight + 28 < frameMetrics.docHeight) {
      throw new Error(
        `HOME_CLIPPED_BY_IFRAME: iframe高度不足(iframe=${shellMetrics.iframeHeight}, doc=${frameMetrics.docHeight})`
      );
    }
    if (frameMetrics.linkBottom > shellMetrics.iframeHeight + 24) {
      throw new Error(
        `HOME_LINK_SECTION_CLIPPED: 友情链接推荐区域被裁切(linkBottom=${frameMetrics.linkBottom}, iframe=${shellMetrics.iframeHeight})`
      );
    }
  });

  test('Iframe height should stay stable while scrolling and avoid jitter', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const { frame } = await getIframe(page);
    await frame.waitForSelector('body', { timeout: 20_000 });
    await page.waitForTimeout(3000);

    const metrics = await page.evaluate(async () => {
      const iframe = document.getElementById('iframe');
      if (!iframe) return { missing: true };

      function getHeight() {
        return Math.round(iframe.getBoundingClientRect().height);
      }

      // 等待高度进入稳定区，避免把首次异步加载的正常增高误判为抖动
      const warmup = [];
      for (let i = 0; i < 28; i++) {
        warmup.push(getHeight());
        if (warmup.length >= 6) {
          const recent = warmup.slice(-6);
          const minRecent = Math.min.apply(null, recent);
          const maxRecent = Math.max.apply(null, recent);
          if (maxRecent - minRecent <= 10) {
            break;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 180));
      }

      const samples = [];
      for (let i = 0; i < 20; i++) {
        window.scrollBy(0, i % 2 === 0 ? 30 : -6);
        await new Promise((resolve) => setTimeout(resolve, 160));
        samples.push(getHeight());
      }

      const min = Math.min(...samples);
      const max = Math.max(...samples);
      let largeJumps = 0;
      for (let i = 1; i < samples.length; i++) {
        if (Math.abs(samples[i] - samples[i - 1]) > 26) {
          largeJumps += 1;
        }
      }
      return {
        missing: false,
        range: max - min,
        largeJumps
      };
    });

    if (metrics.missing) {
      throw new Error('IFRAME_MISSING: 页面缺少业务 iframe');
    }
    if (metrics.range > 40) {
      throw new Error(`IFRAME_HEIGHT_JITTER: iframe高度波动过大(range=${metrics.range}px)`);
    }
    if (metrics.largeJumps > 1) {
      throw new Error(`IFRAME_HEIGHT_JUMPY: iframe高度出现异常跳变(count=${metrics.largeJumps})`);
    }
  });

  test('A11y check on shell should not have critical violations', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const axe = await new AxeBuilder({ page })
      .include('#header')
      .include('#main-content')
      .analyze();
    const critical = axe.violations.filter((v) => v.impact === 'critical');
    if (critical.length > 0) {
      const first = critical[0];
      throw new Error(`A11Y_CRITICAL: ${first.id} ${first.help}`);
    }
  });
});
