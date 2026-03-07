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

  test('Announcement and links pages should stay non-blank without noisy sparse-state overlays', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });

    await page.locator('#header a', { hasText: '出行服务公告' }).first().click();
    let ctx = await getIframe(page);
    await expect(ctx.frame.locator('.list .list-item').first()).toBeVisible();
    await expect(ctx.frame.locator('body')).not.toContainText('公告数据已同步');
    await expect(ctx.frame.locator('body')).not.toContainText('当前公告条目较少');
    await expect(ctx.frame.locator('body')).not.toContainText('当前记录：');

    await page.locator('#header a', { hasText: '无障碍资源链接' }).first().click();
    ctx = await getIframe(page);
    await expect(ctx.frame.locator('.list .list-item').first()).toBeVisible();
  });

  test('Messages page should show explicit empty or populated feedback state', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '留言与改进建议' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForSelector('form.message-form', { timeout: 20000 });
    const count = await frame.locator('.message-item').count();
    if (count === 0) {
      await expect(frame.locator('.front-page-state-panel')).toContainText('当前暂无留言记录');
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('Home recommendation sections should prefer clean cards instead of noisy sparse-state explanations', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const { frame } = await getIframe(page);
    await frame.waitForSelector('.home-unified-card', { timeout: 20000 });
    const cardCount = await frame.locator('.home-unified-card').count();
    expect(cardCount).toBeGreaterThanOrEqual(9);
    const text = await frame.locator('body').innerText();
    expect(text).not.toContain('首页路线推荐已同步');
    expect(text).not.toContain('首页公告推荐已同步');
    expect(text).not.toContain('首页资源推荐已同步');
    expect(text).not.toContain('当前记录：');
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
