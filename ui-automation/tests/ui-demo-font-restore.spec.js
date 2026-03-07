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

test.describe('Demo Font Restore', () => {
  test('Accessibility settings flow should restore shell font size after walkthrough-style changes', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const beforeSettings = await page.evaluate(() => window.AccessibilityUtils.getSettings());
    const beforeMetrics = await page.evaluate(() => ({
      rootFont: parseFloat(getComputedStyle(document.documentElement).fontSize),
      bodyZoom: document.body.style.zoom || ''
    }));

    await page.locator('#header a', { hasText: '无障碍设置' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForURL(/accessibility\/settings\.html/);

    await frame.evaluate(() => {
      const findPreset = (text) => Array.from(document.querySelectorAll('.preset-btn')).find((node) => (node.textContent || '').includes(text));
      findPreset('低视力预设')?.click();
    });
    await frame.waitForTimeout(600);
    await frame.evaluate(() => {
      const findPreset = (text) => Array.from(document.querySelectorAll('.preset-btn')).find((node) => (node.textContent || '').includes(text));
      findPreset('听障预设')?.click();
    });
    await frame.waitForTimeout(600);
    await frame.evaluate(() => {
      const findPreset = (text) => Array.from(document.querySelectorAll('.preset-btn')).find((node) => (node.textContent || '').includes(text));
      findPreset('行动不便预设')?.click();
    });
    await frame.waitForTimeout(600);

    await page.evaluate((saved) => {
      window.AccessibilityUtils.saveSettings(saved);
      if (typeof window.syncAssistSettingsToIframe === 'function') {
        window.syncAssistSettingsToIframe();
      }
      if (typeof window.updateAssistStatus === 'function') {
        window.updateAssistStatus();
      }
    }, beforeSettings);
    await page.waitForTimeout(800);

    const afterMetrics = await page.evaluate(() => ({
      rootFont: parseFloat(getComputedStyle(document.documentElement).fontSize),
      bodyZoom: document.body.style.zoom || ''
    }));

    expect(Math.abs(afterMetrics.rootFont - beforeMetrics.rootFont)).toBeLessThanOrEqual(0.1);
    expect(afterMetrics.bodyZoom).toBe(beforeMetrics.bodyZoom);
  });
});
