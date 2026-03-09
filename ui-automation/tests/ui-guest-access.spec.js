const { test, expect } = require('@playwright/test');

test.setTimeout(120000);

async function getIframe(page) {
  const iframeLocator = page.locator('#iframe');
  await expect(iframeLocator).toBeVisible();
  const iframeHandle = await iframeLocator.elementHandle();
  if (!iframeHandle) throw new Error('IFRAME_MISSING');
  const frame = await iframeHandle.contentFrame();
  if (!frame) throw new Error('IFRAME_NO_CONTENT');
  return frame;
}

async function browseAsGuest(page) {
  await page.goto('http://127.0.0.1:8134/springbootmf383/front/pages/login/login.html', { waitUntil: 'domcontentloaded' });
  await Promise.all([
    page.waitForURL(/front\/index\.html/, { timeout: 20000, waitUntil: 'domcontentloaded' }),
    page.locator('.login-guest-btn').click()
  ]);
  await expect(page.locator('#header')).toBeVisible();
  await expect(page.locator('#iframe')).toBeVisible();
}

test('guest sees gentle login prompt before entering personal center', async ({ page }) => {
  await browseAsGuest(page);

  await page.locator('#header .utility-link', { hasText: '个人中心' }).first().click();
  await expect(page.locator('.guest-login-sheet')).toBeVisible();
  await expect(page.locator('.guest-login-sheet')).toContainText('进入个人中心前请先登录');
  await page.locator('.guest-login-sheet__btn--secondary').click();
  await expect(page.locator('.guest-login-sheet')).toHaveCount(0);
  await expect(page).toHaveURL(/front\/index\.html/);

  await page.locator('#header .utility-link', { hasText: '个人中心' }).first().click();
  await page.locator('.guest-login-sheet__btn--primary').click();
  await page.waitForURL(/pages\/login\/login\.html/, { timeout: 20000, waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => localStorage.getItem('iframeUrl'))).toBe('./pages/yonghu/center.html');
});

test('guest sees gentle login prompt before submitting message feedback', async ({ page }) => {
  await browseAsGuest(page);
  await page.evaluate(() => navPage('./pages/messages/list.html'));

  const frame = await getIframe(page);
  await frame.waitForURL(/messages\/list\.html/, { timeout: 20000, waitUntil: 'domcontentloaded' });
  await expect(frame.locator('.message-login-guard')).toBeVisible();
  await expect(frame.locator('textarea[name="content"]')).toBeDisabled();

  await frame.locator('.message-login-btn').click();
  await expect(page.locator('.guest-login-sheet')).toBeVisible();
  await expect(page.locator('.guest-login-sheet')).toContainText('提交留言前请先登录');
  await page.locator('.guest-login-sheet__btn--secondary').click();
  await expect(page.locator('.guest-login-sheet')).toHaveCount(0);
  await expect(frame.locator('.message-login-guard')).toBeVisible();

  await frame.locator('.message-login-btn').click();
  await page.locator('.guest-login-sheet__btn--primary').click();
  await page.waitForURL(/pages\/login\/login\.html/, { timeout: 20000, waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => localStorage.getItem('iframeUrl'))).toBe('./pages/messages/list.html');
});

test('guest can browse detail page content and only sees login prompt when trying to favorite it', async ({ page }) => {
  await browseAsGuest(page);

  await page.locator('#header a', { hasText: '出行服务公告' }).first().click();
  const frame = await getIframe(page);
  await expect.poll(async () => frame.url(), { timeout: 20000 }).toMatch(/wangzhangonggao\/list\.html/);
  await frame.locator('.list .list-item').first().evaluate((node) => node.click());
  await expect.poll(async () => frame.url(), { timeout: 20000 }).toMatch(/wangzhangonggao\/detail\.html\?id=/);
  await expect(frame.locator('body')).not.toContainText('请输入账号');
  await frame.locator('a', { hasText: '点我收藏' }).first().click();
  await expect(page.locator('.guest-login-sheet')).toBeVisible();
  await expect(page.locator('.guest-login-sheet')).toContainText('收藏前请先登录个人服务');
  await page.locator('.guest-login-sheet__btn--primary').click();
  await page.waitForURL(/pages\/login\/login\.html/, { timeout: 20000, waitUntil: 'domcontentloaded' });
  const iframeUrl = await page.evaluate(() => localStorage.getItem('iframeUrl'));
  expect(iframeUrl).toMatch(/\.\/pages\/wangzhangonggao\/detail\.html\?id=/);
});
