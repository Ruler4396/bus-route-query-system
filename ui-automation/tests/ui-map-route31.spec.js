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

test.describe('Map Route 31 Behavior', () => {
  test('Route 31 should load detailed stations and vehicle tracking should start', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '实时线路地图' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForSelector('#routeSelect', { timeout: 20_000 });
    await frame.waitForFunction(() => {
      const select = document.getElementById('routeSelect');
      return !!select && Array.from(select.options || []).some((node) => (node.textContent || '').includes('31路'));
    }, { timeout: 20_000 });

    const route31Value = await frame.evaluate(() => {
      const select = document.getElementById('routeSelect');
      const option = Array.from(select.options || []).find((node) => (node.textContent || '').includes('31路'));
      return option ? option.value : '';
    });
    expect(route31Value).not.toBe('');
    await frame.selectOption('#routeSelect', route31Value);
    await frame.waitForTimeout(2200);

    const stationCount = await frame.locator('.station-item').count();
    expect(stationCount).toBeGreaterThanOrEqual(20);

    await frame.locator('#vehicleBtn').click();
    await frame.waitForTimeout(4200);

    const state = await frame.evaluate(() => ({
      btnText: (document.getElementById('vehicleBtn') || {}).textContent || '',
      statusText: (document.getElementById('a11yMapStatus') || {}).textContent || '',
      markerPresent: !!(window.mapEngine && window.mapEngine.vehicleMarker),
      running: !!window.isVehicleRunning,
      useWebSocket: !!window.useWebSocketVehicle
    }));

    expect(state.running).toBeTruthy();
    expect(state.markerPresent).toBeTruthy();
    expect(state.btnText).toMatch(/停止/);
    expect(state.statusText).toMatch(/实时推送|模拟车辆|推送通道/);
  });
});
