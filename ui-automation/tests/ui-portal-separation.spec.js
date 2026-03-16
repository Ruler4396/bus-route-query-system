const { test, expect } = require('@playwright/test');

const BASE = process.env.UI_BASE_URL || 'http://127.0.0.1:8134/springbootmf383/front/';
const CONSOLE_URL = new URL('../console/index.html', BASE).toString();

test.describe('Demo visibility and admin console separation', () => {
  test('Home page should not display 10-minute auto-demo entry, but Alt+D still works', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const iframeLocator = page.locator('#iframe');
    await expect(iframeLocator).toBeVisible();
    const iframeHandle = await iframeLocator.elementHandle();
    const frame = await iframeHandle.contentFrame();

    await expect(frame.getByText('开始 10 分钟演示')).toHaveCount(0);
    await expect(frame.getByText('一键启动演示')).toHaveCount(0);

    await page.keyboard.press('Alt+D');
    await page.waitForTimeout(1200);
    const running = await page.evaluate(() => !!(window.DemoPresentationService && window.DemoPresentationService.isRunning));
    expect(running).toBeTruthy();

    await page.keyboard.press('Alt+D');
    await page.waitForTimeout(400);
    const stopped = await page.evaluate(() => !!(window.DemoPresentationService && window.DemoPresentationService.isRunning));
    expect(stopped).toBeFalsy();
  });

  test('Admin backend should use independent console URL and redirect to admin app', async ({ page }) => {
    await page.goto('pages/login/login.html', { waitUntil: 'domcontentloaded' });
    await expect.poll(async () => {
      return page.locator('#adminConsoleEntry').getAttribute('href');
    }, { timeout: 6_000 }).toContain('/console/index.html');

    await page.goto(CONSOLE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/admin\/dist\/index\.html#\/.+/, { timeout: 20_000 });
    expect(page.url()).toContain('/admin/dist/index.html#');
    expect(page.url()).not.toContain('/front/index.html');
  });
});
