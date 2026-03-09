const { test, expect } = require('@playwright/test');

test('mobile speech requests should delegate from iframe to shell host', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('accessibility_speech', 'true');
  });

  await page.goto('http://127.0.0.1:8134/springbootmf383/front/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#iframe')).toBeVisible();

  await page.evaluate(() => {
    const host = window.__A11Y_SPEECH_SERVICE;
    const originalSpeak = host.speak.bind(host);
    host.isEnabled = true;
    host.speechUnlocked = false;
    host.pendingQueue = [];
    host.isMobileLike = () => true;
    host.resumeIfNeeded = () => {};
    window.__speechCallLog = [];
    host.speak = (text, options) => {
      window.__speechCallLog.push({ text, deferIfLocked: !(options && options.deferIfLocked === false) });
      return originalSpeak(text, options);
    };
  });

  const iframeHandle = await page.locator('#iframe').elementHandle();
  const frame = await iframeHandle.contentFrame();
  await frame.evaluate(() => {
    AccessibilityUtils.speak('手机语音委托测试');
  });

  const before = await page.evaluate(() => ({
    callLog: window.__speechCallLog || [],
    unlocked: window.__A11Y_SPEECH_SERVICE.speechUnlocked
  }));

  expect(before.callLog.some((item) => item.text === '手机语音委托测试')).toBeTruthy();
  expect(before.unlocked).toBeFalsy();

  await page.click('body', { position: { x: 16, y: 16 } });
  await page.waitForTimeout(200);

  const after = await page.evaluate(() => ({
    unlocked: window.__A11Y_SPEECH_SERVICE.speechUnlocked,
    callLog: window.__speechCallLog || []
  }));

  expect(after.unlocked).toBeTruthy();
  expect(after.callLog.filter((item) => item.text === '手机语音委托测试').length).toBeGreaterThanOrEqual(1);
});
