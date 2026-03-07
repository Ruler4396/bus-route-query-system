const { test, expect } = require('@playwright/test');

async function getIframe(page) {
  const iframeLocator = page.locator('#iframe');
  await expect(iframeLocator).toBeVisible();
  const handle = await iframeLocator.elementHandle();
  if (!handle) throw new Error('IFRAME_MISSING');
  const frame = await handle.contentFrame();
  if (!frame) throw new Error('IFRAME_NO_CONTENT');
  return { frame };
}

test.describe('Screen Reader Baseline', () => {
  test('Shell should expose skip link, main landmark and shortcut-labeled controls', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.skip-link')).toBeVisible();
    await expect(page.locator('#main-content')).toHaveAttribute('aria-label', /页面主要内容区域/);
    await expect(page.locator('#assistCaption')).toHaveAttribute('aria-keyshortcuts', 'Alt+C');
    await expect(page.locator('#assistMotion')).toHaveAttribute('aria-keyshortcuts', 'Alt+R');
    await expect(page.locator('#assistShortcutHelp')).toHaveAttribute('aria-keyshortcuts', 'Alt+/');
  });

  test('Route planning page controls and summaries should have screen-reader-friendly labels', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '无障碍路线规划' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForURL(/gongjiaoluxian\/list\.html/);
    await expect(frame.locator('#luxianmingcheng')).toHaveAttribute('aria-label', '路线名称');
    await expect(frame.locator('#qidianzhanming')).toHaveAttribute('aria-label', '起点站名');
    await expect(frame.locator('#zhongdianzhanming')).toHaveAttribute('aria-label', '终点站名');
    await expect(frame.locator('#profileType')).toHaveAttribute('aria-label', '服务画像');
    await expect(frame.locator('#preferenceType')).toHaveAttribute('aria-label', '推荐偏好');
  });

  test('Settings and feedback pages should expose accessible names for toggles and inputs', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '无障碍设置' }).first().click();
    let { frame } = await getIframe(page);
    await frame.waitForURL(/accessibility\/settings\.html/);
    await expect(frame.locator('#motionToggle')).toHaveAttribute('aria-label', '减少动态效果');
    await expect(frame.locator('#captionToggle')).toHaveAttribute('aria-label', '视觉字幕提示面板');

    await page.locator('#header a', { hasText: '留言与改进建议' }).first().click();
    ({ frame } = await getIframe(page));
    await frame.waitForURL(/messages\/list\.html/);
    await expect(frame.locator('#feedbackType')).toHaveAttribute('aria-label', '反馈类型');
    await expect(frame.locator('#severityLevel')).toHaveAttribute('aria-label', '严重级别');
    await expect(frame.locator('input[name="routeName"]')).toHaveAttribute('aria-label', '关联路线');
    await expect(frame.locator('input[name="stationName"]')).toHaveAttribute('aria-label', '关联站点');
  });
});
