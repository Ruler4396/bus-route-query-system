const { test, expect } = require('@playwright/test');

test.describe('Login Page Layout', () => {
  for (const viewport of [
    { width: 1280, height: 900, minGap: 24, minTopGap: 24 },
    { width: 820, height: 860, minGap: 18, minTopGap: 20 },
    { width: 390, height: 844, minGap: 10, minTopGap: 14 }
  ]) {
    test(`login page should remain readable and within viewport at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://127.0.0.1:8134/springbootmf383/front/pages/login/login.html', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      const metrics = await page.evaluate(({ minGap, minTopGap }) => {
        const q = (sel) => document.querySelector(sel);
        const selectors = ['#app', '.login-intro', '#loginForm'];
        const app = q('#app');
        const topGapApp = app ? Math.round(app.getBoundingClientRect().top) : 0;
        const offenders = Array.from(document.querySelectorAll('body *')).filter((node) => {
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.left < -2 || rect.right > window.innerWidth + 2);
        }).slice(0, 12).map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            tag: node.tagName,
            cls: node.className || '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          };
        });
        const edgeTight = selectors.map((sel) => {
          const node = q(sel);
          if (!node) return { sel, missing: true };
          const rect = node.getBoundingClientRect();
          const leftGap = Math.round(rect.left);
          const rightGap = Math.round(window.innerWidth - rect.right);
          if (leftGap >= minGap && rightGap >= minGap) return null;
          return { sel, leftGap, rightGap, minGap };
        }).filter(Boolean);
        const form = q('#loginForm');
        const button = q('#loginForm .btn-submit');
        return {
          innerWidth: window.innerWidth,
          bodyScrollWidth: document.body.scrollWidth,
          docScrollWidth: document.documentElement.scrollWidth,
          formWidth: form ? Math.round(form.getBoundingClientRect().width) : 0,
          buttonWidth: button ? Math.round(button.getBoundingClientRect().width) : 0,
          offenderCount: offenders.length,
          offenders,
          edgeTightCount: edgeTight.length,
          edgeTight,
          topGapApp,
          minTopGap,
          hasCardHead: !!q('.login-card-head'),
          hasAccountCard: !!q('.login-account-card'),
          hasGuestEntry: !!q('.login-guest-btn'),
          hasAccessCard: !!q('.login-access-card'),
          hasVisibleLabels: Array.from(document.querySelectorAll('.login-field-label')).every((node) => !!node.textContent.trim())
        };
      }, viewport);

      expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);
      expect(metrics.docScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);
      expect(metrics.formWidth).toBeGreaterThan(0);
      expect(metrics.formWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);
      expect(metrics.buttonWidth).toBeLessThanOrEqual(metrics.formWidth + 2);
      expect(metrics.offenderCount).toBe(0);
      expect(metrics.edgeTightCount).toBe(0);
      expect(metrics.topGapApp).toBeGreaterThanOrEqual(metrics.minTopGap);
      expect(metrics.hasCardHead).toBeTruthy();
      expect(metrics.hasAccountCard).toBeTruthy();
      expect(metrics.hasGuestEntry).toBeTruthy();
      expect(metrics.hasAccessCard).toBeTruthy();
      expect(metrics.hasVisibleLabels).toBeTruthy();
    });
  }
});
