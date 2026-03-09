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

test.describe('Accessibility Interaction Baseline', () => {
  test('Keyboard shortcuts should cover shell navigation and focus main content', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });

    await page.keyboard.press('Alt+2');
    let { frame } = await getIframe(page);
    await frame.waitForURL(/gongjiaoluxian\/list\.html/);

    await page.keyboard.press('Alt+M');
    ({ frame } = await getIframe(page));
    await frame.waitForURL(/gongjiaoluxian\/map\.html/);

    await page.keyboard.press('Alt+6');
    ({ frame } = await getIframe(page));
    await frame.waitForURL(/messages\/list\.html/);

    await page.keyboard.press('Alt+7');
    ({ frame } = await getIframe(page));
    await frame.waitForURL(/youqinglianjie\/list\.html/);

    await page.keyboard.press('Alt+A');
    ({ frame } = await getIframe(page));
    await frame.waitForURL(/accessibility\/settings\.html/);

    await page.keyboard.press('Alt+L');
    await page.waitForTimeout(400);
    const focusState = await page.evaluate(() => {
      const shellFocused = document.activeElement && document.activeElement.id === 'main-content';
      let frameFocused = false;
      const iframe = document.getElementById('iframe');
      try {
        if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
          const active = iframe.contentWindow.document.activeElement;
          frameFocused = !!active && (active.id === 'app' || active.getAttribute('role') === 'main');
        }
      } catch (e) {}
      return { shellFocused, frameFocused };
    });
    expect(focusState.shellFocused || focusState.frameFocused).toBeTruthy();
  });

  test('Route list cards should open detail page with keyboard Enter', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Alt+2');
    const { frame } = await getIframe(page);
    await frame.waitForURL(/gongjiaoluxian\/list\.html/);
    const firstCard = frame.locator('.list .list-item').first();
    await expect(firstCard).toBeVisible();
    await firstCard.focus();
    await firstCard.press('Enter');
    await frame.waitForURL(/gongjiaoluxian\/detail\.html\?id=/);
  });

  test('Caption center should provide visible text alternatives for key prompts', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Alt+C');
    await expect(page.locator('#a11y-caption-center.show')).toBeVisible();

    await page.keyboard.press('Alt+/');
    await page.waitForTimeout(500);
    await expect(page.locator('#a11y-caption-center .caption-center-list')).toContainText('快捷键帮助');
    await expect(page.locator('#a11y-visual-caption.show')).toBeVisible();
  });

  test('Assist deck should allow closing and reopening lower-left visual hints', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(700);

    await page.locator('#assistShortcutHelp').click();
    await expect(page.locator('#a11y-visual-caption.show')).toBeVisible();

    await page.locator('#assistVisualHint').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#a11y-visual-caption.show')).toHaveCount(0);
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('accessibility_visual_caption'))).toBe('false');

    await page.locator('#assistShortcutHelp').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#a11y-visual-caption.show')).toHaveCount(0);

    await page.locator('#assistVisualHint').click();
    await page.waitForTimeout(300);
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('accessibility_visual_caption'))).toBe('true');

    await page.locator('#assistShortcutHelp').click();
    await expect(page.locator('#a11y-visual-caption.show')).toBeVisible();
  });

  test('Settings presets should apply high contrast, large font and reduced motion', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Alt+A');
    const { frame } = await getIframe(page);
    await frame.waitForURL(/accessibility\/settings\.html/);

    await frame.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.preset-btn')).find((node) => node.textContent.includes('低视力预设'));
      if (btn) btn.click();
    });
    await frame.waitForTimeout(300);
    let settings = await frame.evaluate(() => AccessibilityUtils.getSettings());
    expect(settings.highContrast).toBeTruthy();
    expect(settings.fontSize).toBeGreaterThanOrEqual(20);

    await frame.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.preset-btn')).find((node) => node.textContent.includes('听障预设'));
      if (btn) btn.click();
    });
    await frame.waitForTimeout(300);
    settings = await frame.evaluate(() => AccessibilityUtils.getSettings());
    expect(settings.captionCenter).toBeTruthy();
    expect(settings.reducedMotion).toBeTruthy();
    expect(settings.keyboardNav).toBeTruthy();
    expect(settings.highContrast).toBeFalsy();

    const modeFlags = await frame.evaluate(() => ({
      highContrast: document.body.classList.contains('high-contrast'),
      reducedMotionBody: document.body.classList.contains('reduced-motion'),
      reducedMotionRoot: document.documentElement.classList.contains('reduced-motion'),
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
      titleColor: window.getComputedStyle(document.querySelector('.page-title')).color
    }));
    expect(modeFlags.highContrast).toBeFalsy();
    expect(modeFlags.reducedMotionBody || modeFlags.reducedMotionRoot).toBeTruthy();
    expect(modeFlags.bodyBg).not.toBe('rgb(245, 245, 245)');
    expect(modeFlags.titleColor).not.toBe(modeFlags.bodyBg);
  });
});
