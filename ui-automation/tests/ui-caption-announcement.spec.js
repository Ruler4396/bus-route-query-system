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

test.describe('Caption and Announcement Stability', () => {
  test('Caption panel should not duplicate between shell and iframe', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Alt+C');
    await page.waitForTimeout(600);
    const { frame } = await getIframe(page);
    const topCount = await page.locator('#a11y-caption-center').count();
    const frameCount = await frame.locator('#a11y-caption-center').count();
    expect(topCount + frameCount).toBe(1);
  });

  test('Announcement detail should remain guest-accessible without redirecting to login', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('Token');
      localStorage.removeItem('userid');
      localStorage.removeItem('role');
      localStorage.removeItem('userTable');
      localStorage.removeItem('sessionTable');
      localStorage.removeItem('adminName');
    });
    await page.locator('#header a', { hasText: '出行服务公告' }).first().click();
    const { frame } = await getIframe(page);
    await frame.locator('.list .list-item').first().click();
    await frame.waitForURL(/wangzhangonggao\/detail\.html\?id=/, { timeout: 20000 });
    await expect(frame.locator('body')).not.toContainText('请输入账号');
  });
});
