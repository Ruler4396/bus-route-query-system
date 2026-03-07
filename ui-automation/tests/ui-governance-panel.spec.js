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

test.describe('Accessibility Governance Panel', () => {
  test('Route list should show data-source registry, confidence rules and pilot sample counts', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '无障碍路线规划' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForURL(/gongjiaoluxian\/list\.html/);
    await expect(frame.locator('.route-governance-panel')).toBeVisible();
    await expect(frame.locator('.route-governance-panel')).toContainText('数据源登记');
    await expect(frame.locator('.route-governance-panel')).toContainText('置信度规则');
    await expect(frame.locator('.route-governance-panel')).toContainText('试点人工样本基础');
  });
});
