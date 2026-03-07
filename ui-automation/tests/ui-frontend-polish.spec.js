const { test, expect } = require('@playwright/test');

async function getIframe(page) {
  const iframeLocator = page.locator('#iframe');
  await expect(iframeLocator).toBeVisible();
  const handle = await iframeLocator.elementHandle();
  if (!handle) throw new Error('IFRAME_MISSING');
  const frame = await handle.contentFrame();
  if (!frame) throw new Error('IFRAME_NO_CONTENT');
  return { iframeLocator, frame };
}

test.describe('Frontend Polish', () => {
  test('Shell nav group titles and buttons should use enlarged readable sizing', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    const metrics = await page.evaluate(() => {
      const title = document.querySelector('#header .nav-group-title');
      const primary = document.querySelector('#header .navs li a');
      const utility = document.querySelector('#header .nav-support-group .utility-link');
      return {
        titleSize: title ? parseFloat(window.getComputedStyle(title).fontSize) : 0,
        primarySize: primary ? parseFloat(window.getComputedStyle(primary).fontSize) : 0,
        utilitySize: utility ? parseFloat(window.getComputedStyle(utility).fontSize) : 0,
        utilityHeight: utility ? Math.round(utility.getBoundingClientRect().height) : 0
      };
    });

    expect(metrics.titleSize).toBeGreaterThanOrEqual(14);
    expect(metrics.primarySize).toBeGreaterThanOrEqual(15);
    expect(metrics.utilitySize).toBeGreaterThanOrEqual(14);
    expect(metrics.utilityHeight).toBeGreaterThanOrEqual(38);
  });

  test('Messages page should center title, align actions and avoid broken usernames', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '留言与改进建议' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForSelector('.message-page-title', { timeout: 20_000 });
    const info = await frame.evaluate(() => {
      const title = document.querySelector('.message-page-title');
      const actionWrap = document.querySelector('.message-actions');
      const buttons = actionWrap ? Array.from(actionWrap.querySelectorAll('button')) : [];
      const username = document.querySelector('.username');
      const buttonTops = buttons.map((node) => Math.round(node.getBoundingClientRect().top));
      return {
        titleAlign: title ? window.getComputedStyle(title).textAlign : '',
        titleDisplay: title ? window.getComputedStyle(title).display : '',
        actionDisplay: actionWrap ? window.getComputedStyle(actionWrap).display : '',
        usernameText: username ? (username.textContent || '').trim() : '',
        buttonTopSpread: buttonTops.length ? Math.max(...buttonTops) - Math.min(...buttonTops) : 999
      };
    });

    expect(info.titleAlign).toBe('center');
    expect(info.titleDisplay).toBe('flex');
    expect(info.actionDisplay).toBe('flex');
    if (info.usernameText) {
      expect(info.usernameText).toContain('用户：');
      expect(info.usernameText).not.toContain('undefined');
      expect(info.usernameText).not.toContain('null');
    }
    expect(info.buttonTopSpread).toBeLessThanOrEqual(6);
    const metaCount = await frame.locator('.feedback-meta-line').count();
    if (metaCount > 0) {
      const metaLine = await frame.locator('.feedback-meta-line').first().innerText();
      expect(metaLine).not.toContain('FACILITY_ABNORMAL');
      expect(metaLine).not.toContain('ROUTE_INACCURATE');
    }
  });

  test('Login page should render redesigned intro panel and visible submit button', async ({ page }) => {
    await page.goto('pages/login/login.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.login-intro')).toBeVisible();
    await expect(page.locator('#loginForm')).toBeVisible();

    const metrics = await page.evaluate(() => {
      const intro = document.querySelector('.login-intro');
      const button = document.querySelector('#loginForm .btn-submit');
      const form = document.getElementById('loginForm');
      return {
        introTextLength: intro ? ((intro.textContent || '').replace(/\s+/g, '').length) : 0,
        buttonWidth: button ? Math.round(button.getBoundingClientRect().width) : 0,
        buttonHeight: button ? Math.round(button.getBoundingClientRect().height) : 0,
        formWidth: form ? Math.round(form.getBoundingClientRect().width) : 0
      };
    });

    expect(metrics.introTextLength).toBeGreaterThan(30);
    expect(metrics.formWidth).toBeGreaterThanOrEqual(360);
    expect(metrics.buttonWidth).toBeGreaterThanOrEqual(320);
    expect(metrics.buttonHeight).toBeGreaterThanOrEqual(50);
  });

  test('Announcement search should use keyword-oriented label and placeholder', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '出行服务公告' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForSelector('#biaoti', { timeout: 20_000 });
    const copy = await frame.evaluate(() => {
      const label = document.querySelector('.filter .item-list .lable');
      const input = document.getElementById('biaoti');
      return {
        labelText: label ? (label.textContent || '').trim() : '',
        placeholder: input ? input.getAttribute('placeholder') || '' : ''
      };
    });

    expect(copy.labelText).toContain('公告关键词');
    expect(copy.placeholder).toContain('输入公告标题关键词');
  });



  test('Accessibility presets should not force high contrast for every profile and manual toggle must recover', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '无障碍设置' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForSelector('.preset-btn', { timeout: 20_000 });

    await frame.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.preset-btn')).find((node) => node.textContent.includes('听障预设'));
      if (btn) btn.click();
    });
    await frame.waitForTimeout(600);
    await expect(frame.locator('#contrastToggle')).not.toBeChecked();

    await frame.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.preset-btn')).find((node) => node.textContent.includes('行动不便预设'));
      if (btn) btn.click();
    });
    await frame.waitForTimeout(600);
    await expect(frame.locator('#contrastToggle')).not.toBeChecked();

    await frame.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.preset-btn')).find((node) => node.textContent.includes('低视力预设'));
      if (btn) btn.click();
    });
    await frame.waitForTimeout(600);
    await expect(frame.locator('#contrastToggle')).toBeChecked();

    await frame.evaluate(() => {
      const node = document.getElementById('contrastToggle');
      if (node) node.click();
    });
    await frame.waitForTimeout(600);
    await expect(frame.locator('#contrastToggle')).not.toBeChecked();

    const shellHighContrast = await page.evaluate(() => document.body.classList.contains('high-contrast'));
    expect(shellHighContrast).toBeFalsy();
  });

  test('Demo mode should autoplay without showing a separate dialog window', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Alt+D');
    await page.waitForTimeout(1800);

    const state = await page.evaluate(() => ({
      running: !!(window.DemoPresentationService && window.DemoPresentationService.isRunning),
      runningFlag: document.body.getAttribute('data-demo-running') || '',
      stepId: document.body.getAttribute('data-demo-step') || '',
      hasDialog: !!document.querySelector('#demoPresentationRoot.is-open, .demo-panel[role="dialog"]')
    }));

    expect(state.running).toBeTruthy();
    expect(state.runningFlag).toBe('true');
    expect(state.stepId.length).toBeGreaterThan(0);
    expect(state.hasDialog).toBeFalsy();

    await page.keyboard.press('Alt+D');
    await page.waitForTimeout(400);
    const stopped = await page.evaluate(() => !!(window.DemoPresentationService && window.DemoPresentationService.isRunning));
    expect(stopped).toBeFalsy();
  });
});
