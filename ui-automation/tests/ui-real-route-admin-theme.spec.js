const { test, expect } = require('@playwright/test');

const BASE = process.env.UI_BASE_URL || 'http://127.0.0.1:8134/springbootmf383/front/';
const ADMIN_LOGIN_URL = new URL('../admin/dist/index.html#/login', BASE).toString();
const ADMIN_INDEX_URL = new URL('../admin/dist/index.html#/index', BASE).toString();
const USERS_LOGIN_API = new URL('../users/login?username=abo&password=abo', BASE).toString();

test.describe('Real route navigation and admin theme consistency', () => {
  test('Front shell should keep URL route in sync with top navigation', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });

    await expect.poll(() => page.evaluate(() => window.location.search || '')).toContain('route=home');
    await expect.poll(async () => page.locator('#iframe').getAttribute('src')).toContain('./pages/home/home.html');

    await page.locator('a[href*="route=map"]', { hasText: '实时线路地图' }).first().click();
    await expect.poll(() => page.evaluate(() => window.location.search || '')).toContain('route=map');
    await expect.poll(async () => page.locator('#iframe').getAttribute('src')).toContain('./pages/gongjiaoluxian/map.html');

    await page.locator('a[href*="route=announcements"]', { hasText: '出行服务公告' }).first().click();
    await expect.poll(() => page.evaluate(() => window.location.search || '')).toContain('route=announcements');
    await expect.poll(async () => page.locator('#iframe').getAttribute('src')).toContain('./pages/wangzhangonggao/list.html');

    await page.locator('a[href*="route=messages"]', { hasText: '留言与改进建议' }).first().click();
    await expect.poll(() => page.evaluate(() => window.location.search || '')).toContain('route=messages');
    await expect.poll(async () => page.locator('#iframe').getAttribute('src')).toContain('./pages/messages/list.html');
  });

  test('Admin login and dashboard should load transit-aligned theme styles', async ({ page, request }) => {
    await page.goto(ADMIN_LOGIN_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('link[href*="transit-admin-theme.css"]')).toHaveCount(1);

    const loginRes = await request.post(USERS_LOGIN_API);
    expect(loginRes.ok()).toBeTruthy();
    const loginJson = await loginRes.json();
    expect(loginJson.code).toBe(0);
    expect(loginJson.token).toBeTruthy();

    await page.evaluate(({ token }) => {
      localStorage.setItem('Token', token);
      localStorage.setItem('role', '管理员');
      localStorage.setItem('sessionTable', 'users');
      localStorage.setItem('adminName', 'abo');
    }, { token: loginJson.token });

    await page.goto(ADMIN_INDEX_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.navbar');

    const navbarBackground = await page.locator('.navbar').evaluate((el) => getComputedStyle(el).backgroundImage || '');
    expect(navbarBackground).toContain('gradient');

    const activeMenuMetrics = await page.locator('.el-menu-item.is-active').first().evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        backgroundImage: style.backgroundImage || '',
        borderLeftWidth: parseFloat(style.borderLeftWidth) || 0,
        boxShadow: style.boxShadow || ''
      };
    });
    expect(activeMenuMetrics.backgroundImage).toBe('none');
    expect(activeMenuMetrics.borderLeftWidth).toBeGreaterThanOrEqual(3);
    expect(activeMenuMetrics.boxShadow).toBe('none');

    const cardRadius = await page.locator('.el-main > .content, .el-main > .table-content, .el-main > .form-content').first().evaluate((el) => {
      return parseFloat(getComputedStyle(el).borderTopLeftRadius || '0');
    });
    expect(cardRadius).toBeGreaterThanOrEqual(16);
  });
});
