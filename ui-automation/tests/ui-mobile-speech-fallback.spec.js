const { test, expect } = require('@playwright/test');

test('settings page should request backend tts audio when native speech is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      get() {
        return undefined;
      }
    });
  });

  const requests = [];
  page.on('request', (request) => {
    if (request.url().includes('/accessibility/tts/audio')) {
      requests.push(request.url());
    }
  });

  await page.goto('http://127.0.0.1:8134/springbootmf383/front/pages/accessibility/settings.html', { waitUntil: 'domcontentloaded' });
  await page.locator('#speechToggle + .slider').click();
  await page.getByRole('button', { name: /测试语音/ }).click();
  await page.waitForTimeout(1800);

  expect(requests.length).toBeGreaterThan(0);
  await expect(page.locator('#speechDiagnostics')).toContainText('音频兜底可用');
  await expect(page.locator('#speechDiagnostics')).toContainText('原生语音支持');
  await expect(page.locator('#speechDiagnostics')).toContainText('不支持');
});
