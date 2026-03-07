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

test.describe('UI Data States', () => {
  test('Route list should show sparse state with demo dataset and turn empty on unmatched search', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '无障碍路线规划' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForSelector('.front-page-state-panel', { timeout: 20000 });
    await expect(frame.locator('.front-page-state-panel')).toContainText('数据较少');
    await expect(frame.locator('.list .list-item')).toHaveCount(3);

    await frame.locator('#luxianmingcheng').fill('根本不存在的线路');
    await frame.locator('#btn-search').click();
    await frame.waitForTimeout(900);
    await expect(frame.locator('.front-page-state-panel')).toContainText('未找到符合条件的路线');
    await expect(frame.locator('.list .list-item')).toHaveCount(0);
  });

  test('Announcement and links pages should expose sparse but non-blank states', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    for (const navText of ['出行服务公告', '无障碍资源链接']) {
      await page.locator('#header a', { hasText: navText }).first().click();
      const { frame } = await getIframe(page);
      await frame.waitForSelector('.front-page-state-panel', { timeout: 20000 });
      await expect(frame.locator('.front-page-state-panel')).toContainText('数据较少');
      await expect(frame.locator('.list .list-item').first()).toBeVisible();
    }
  });

  test('Messages page should show visible feedback entries with explicit state handling', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '留言与改进建议' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForSelector('.message-item', { timeout: 20000 });
    await expect(frame.locator('.message-item')).toHaveCount(4);
    const panelCount = await frame.locator('.front-page-state-panel').count();
    if (panelCount > 0) {
      const panelText = await frame.locator('.front-page-state-panel').first().innerText();
      expect(panelText.length).toBeGreaterThan(0);
    }
  });

  test('Home recommendation sections should show sparse-state hints rather than silent blanks', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const { frame } = await getIframe(page);
    await frame.waitForSelector('.front-page-state-panel', { timeout: 20000 });
    await frame.waitForFunction(() => {
      const text = document.body ? document.body.innerText || '' : '';
      return text.includes('首页路线推荐已同步') && text.includes('首页公告推荐已同步') && text.includes('首页资源推荐已同步');
    }, { timeout: 20000 });
    await expect(frame.locator('.front-page-state-panel')).toHaveCount(3);
    const text = await frame.locator('body').innerText();
    expect(text).toContain('首页路线推荐已同步');
    expect(text).toContain('首页公告推荐已同步');
    expect(text).toContain('首页资源推荐已同步');
  });

  test('Pages should show explicit error state when backend list API fails', async ({ page }) => {
    await page.route('**/springbootmf383/wangzhangonggao/list**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ code: 500, msg: 'mocked failure' })
      });
    });

    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '出行服务公告' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForSelector('.front-page-state-panel.phase-error', { timeout: 20000 });
    await expect(frame.locator('.front-page-state-panel.phase-error')).toContainText('列表加载失败');
    await expect(frame.locator('.front-page-state-panel.phase-error')).toContainText('重新加载');
  });
});
