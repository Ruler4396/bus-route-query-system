const { test, expect } = require('@playwright/test');

test('speech diagnostics panel should render support state and test controls on settings page', async ({ page }) => {
  await page.goto('http://127.0.0.1:8134/springbootmf383/front/pages/accessibility/settings.html', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('button', { name: /测试提示音/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /测试语音/ })).toBeVisible();
  await expect(page.locator('h4', { hasText: '语音诊断信息' })).toBeVisible();
  await expect(page.locator('#speechDiagnostics')).toContainText('原生语音支持');
  await expect(page.locator('#speechDiagnostics')).toContainText('手势解锁');
  await expect(page.locator('#speechDiagnostics')).toContainText('iframe 委托壳层');

  await page.locator('#speechToggle + .slider').click();
  await page.waitForTimeout(300);
  await expect(page.locator('#speechDiagnostics')).toContainText('语音开关');
  await expect(page.locator('#speechDiagnostics')).toContainText('已开启');
});
