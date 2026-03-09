const { test, expect } = require('@playwright/test');

const MOBILE_VIEWPORT = { width: 390, height: 844 };

async function login(page) {
  await page.goto('pages/login/login.html', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="username"]', 'demo_user');
  await page.fill('input[name="password"]', 'demo123');
  await Promise.all([
    page.locator('#loginForm .btn-submit').click(),
    page.waitForURL(/index\.html/, { timeout: 30_000 })
  ]);
  await page.waitForSelector('#header', { timeout: 20_000 });
}

test.describe('Mobile shell layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('Assist deck should provide touch-friendly buttons on mobile', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const metrics = await page.evaluate(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const buttons = Array.from(document.querySelectorAll('.transit-assist-strip .assist-btn')).map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          text: (node.textContent || '').trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom)
        };
      });
      const status = document.getElementById('assistStatusText');
      const statusRect = status ? status.getBoundingClientRect() : null;
      return {
        viewport,
        buttons,
        status: statusRect ? {
          left: Math.round(statusRect.left),
          right: Math.round(statusRect.right),
          top: Math.round(statusRect.top),
          bottom: Math.round(statusRect.bottom)
        } : null
      };
    });

    expect(metrics.buttons.length).toBeGreaterThanOrEqual(8);
    metrics.buttons.forEach((button) => {
      expect(button.height, `${button.text} height`).toBeGreaterThanOrEqual(40);
      expect(button.left, `${button.text} left`).toBeGreaterThanOrEqual(8);
      expect(button.right, `${button.text} right`).toBeLessThanOrEqual(metrics.viewport.width - 8);
    });
    expect(metrics.status).toBeTruthy();
    expect(metrics.status.left).toBeGreaterThanOrEqual(8);
    expect(metrics.status.right).toBeLessThanOrEqual(metrics.viewport.width - 8);
  });

  test('Guest login prompt should keep action buttons compact on mobile', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await page.locator('#header a', { hasText: '个人中心' }).click();
    await page.waitForSelector('.guest-login-sheet', { timeout: 10_000 });

    const metrics = await page.evaluate(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const layer = document.querySelector('.guest-login-layer');
      const layerRect = layer ? layer.getBoundingClientRect() : null;
      const buttons = Array.from(document.querySelectorAll('.guest-login-sheet__btn')).map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          text: (node.textContent || '').trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom)
        };
      });
      return {
        viewport,
        layer: layerRect ? {
          left: Math.round(layerRect.left),
          right: Math.round(layerRect.right),
          top: Math.round(layerRect.top),
          bottom: Math.round(layerRect.bottom),
          width: Math.round(layerRect.width),
          height: Math.round(layerRect.height)
        } : null,
        buttons
      };
    });

    expect(metrics.layer).toBeTruthy();
    expect(metrics.layer.left).toBeGreaterThanOrEqual(8);
    expect(metrics.layer.right).toBeLessThanOrEqual(metrics.viewport.width - 8);
    expect(metrics.layer.height).toBeLessThanOrEqual(metrics.viewport.height - 12);
    expect(metrics.buttons.length).toBe(2);
    metrics.buttons.forEach((button) => {
      expect(button.height, `${button.text} height`).toBeGreaterThanOrEqual(48);
      expect(button.height, `${button.text} height`).toBeLessThanOrEqual(72);
      expect(button.left, `${button.text} left`).toBeGreaterThanOrEqual(16);
      expect(button.right, `${button.text} right`).toBeLessThanOrEqual(metrics.viewport.width - 16);
    });
  });

  test('Chat dialog should stay within the mobile viewport after login', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(800);
    await page.locator('#header a', { hasText: '在线提问' }).click();
    await page.waitForSelector('.layui-layer.layui-layer-iframe', { timeout: 10_000 });

    const metrics = await page.evaluate(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const layer = document.querySelector('.layui-layer.layui-layer-iframe');
      const rect = layer ? layer.getBoundingClientRect() : null;
      const iframe = layer ? layer.querySelector('iframe') : null;
      const iframeRect = iframe ? iframe.getBoundingClientRect() : null;
      return {
        viewport,
        layer: rect ? {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        } : null,
        iframe: iframeRect ? {
          left: Math.round(iframeRect.left),
          right: Math.round(iframeRect.right),
          top: Math.round(iframeRect.top),
          bottom: Math.round(iframeRect.bottom),
          width: Math.round(iframeRect.width),
          height: Math.round(iframeRect.height)
        } : null
      };
    });

    expect(metrics.layer).toBeTruthy();
    expect(metrics.iframe).toBeTruthy();
    expect(metrics.layer.left).toBeGreaterThanOrEqual(0);
    expect(metrics.layer.right).toBeLessThanOrEqual(metrics.viewport.width);
    expect(metrics.layer.top).toBeGreaterThanOrEqual(0);
    expect(metrics.layer.bottom).toBeLessThanOrEqual(metrics.viewport.height);
    expect(metrics.layer.width).toBeLessThanOrEqual(metrics.viewport.width);
    expect(metrics.layer.height).toBeLessThanOrEqual(metrics.viewport.height - 8);
    expect(metrics.iframe.width).toBeLessThanOrEqual(metrics.viewport.width);
  });
});
