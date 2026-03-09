const { test, expect } = require('@playwright/test');

test.describe('Demo mode refresh exit', () => {
  test('Refreshing during auto demo should exit and restore prior state', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
      localStorage.setItem('accessibility_speech', 'false');
      localStorage.setItem('accessibility_caption_center', 'false');
      localStorage.setItem('accessibility_keyboard_nav', 'false');
      localStorage.setItem('accessibility_font_size', '14');
      localStorage.setItem('Token', 'before-refresh-token');
      localStorage.setItem('role', '用户');
      localStorage.setItem('userTable', 'yonghu');
      localStorage.setItem('sessionTable', 'yonghu');
      localStorage.setItem('adminName', 'before-refresh-admin');
      localStorage.setItem('userid', '42');
    });

    await page.goto('index.html?demo=auto', { waitUntil: 'domcontentloaded' });
    await expect.poll(async () => {
      return page.evaluate(() => ({
        running: !!(window.DemoPresentationService && window.DemoPresentationService.isRunning),
        url: window.location.href
      }));
    }, { timeout: 45_000 }).toMatchObject({ running: true });
    await expect.poll(() => page.url(), { timeout: 45_000 }).not.toContain('demo=');

    const duringDemo = await page.evaluate(() => ({
      running: !!(window.DemoPresentationService && window.DemoPresentationService.isRunning),
      speech: localStorage.getItem('accessibility_speech'),
      token: localStorage.getItem('Token'),
      refreshMarker: sessionStorage.getItem('demo_presentation_refresh_state')
    }));

    expect(duringDemo.running).toBeTruthy();
    expect(duringDemo.speech).toBe('true');
    expect(duringDemo.token).toBeNull();
    expect(duringDemo.refreshMarker).toBeTruthy();

    const refreshedUrl = page.url();
    await page.goto(refreshedUrl, { waitUntil: 'domcontentloaded' });
    await expect.poll(async () => {
      return page.evaluate(() => ({
        running: !!(window.DemoPresentationService && window.DemoPresentationService.isRunning),
        refreshMarker: sessionStorage.getItem('demo_presentation_refresh_state'),
        url: window.location.href
      }));
    }, { timeout: 10_000 }).toMatchObject({
      running: false,
      refreshMarker: null
    });

    const afterRefresh = await page.evaluate(() => ({
      running: !!(window.DemoPresentationService && window.DemoPresentationService.isRunning),
      runningFlag: document.body.getAttribute('data-demo-running') || '',
      speech: localStorage.getItem('accessibility_speech'),
      captionCenter: localStorage.getItem('accessibility_caption_center'),
      keyboardNav: localStorage.getItem('accessibility_keyboard_nav'),
      fontSize: localStorage.getItem('accessibility_font_size'),
      token: localStorage.getItem('Token'),
      role: localStorage.getItem('role'),
      userTable: localStorage.getItem('userTable'),
      sessionTable: localStorage.getItem('sessionTable'),
      adminName: localStorage.getItem('adminName'),
      userid: localStorage.getItem('userid'),
      refreshMarker: sessionStorage.getItem('demo_presentation_refresh_state'),
      url: window.location.href
    }));

    expect(afterRefresh.running).toBeFalsy();
    expect(afterRefresh.runningFlag).not.toBe('true');
    expect(afterRefresh.speech).toBe('false');
    expect(afterRefresh.captionCenter).toBe('false');
    expect(afterRefresh.keyboardNav).toBe('false');
    expect(afterRefresh.fontSize).toBe('14');
    expect(afterRefresh.token).toBe('before-refresh-token');
    expect(afterRefresh.role).toBe('用户');
    expect(afterRefresh.userTable).toBe('yonghu');
    expect(afterRefresh.sessionTable).toBe('yonghu');
    expect(afterRefresh.adminName).toBe('before-refresh-admin');
    expect(afterRefresh.userid).toBe('42');
    expect(afterRefresh.refreshMarker).toBeNull();
    expect(afterRefresh.url).not.toContain('demo=');
  });
});
