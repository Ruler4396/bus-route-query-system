const { test, expect } = require('@playwright/test');

function resolveAdminUrl() {
  if (process.env.UI_ADMIN_URL) {
    return process.env.UI_ADMIN_URL;
  }
  const frontBase = process.env.UI_BASE_URL || 'http://127.0.0.1:8134/springbootmf383/front/';
  return frontBase.replace(/front\/?$/, 'admin/dist/index.html');
}

test.describe('Admin UI redesign consistency', () => {
  test('Admin login and shell should follow unified front-end language', async ({ page }) => {
    const adminUrl = resolveAdminUrl();

    await page.goto(adminUrl, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.container.loginIn .login-form')).toBeVisible();
    await expect(page.locator('.container.loginIn .role:visible')).toHaveCount(0);

    const loginMetrics = await page.evaluate(() => {
      const form = document.querySelector('.container.loginIn .login-form');
      const btn = document.querySelector('.container.loginIn .loginInBt');
      if (!form || !btn) {
        return null;
      }
      const formRect = form.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      return {
        formTop: Math.round(formRect.top),
        formLeft: Math.round(formRect.left),
        formWidth: Math.round(formRect.width),
        btnWidth: Math.round(btnRect.width),
        btnHeight: Math.round(btnRect.height)
      };
    });

    expect(loginMetrics).toBeTruthy();
    expect(loginMetrics.formTop).toBeGreaterThanOrEqual(40);
    expect(loginMetrics.formLeft).toBeGreaterThanOrEqual(120);
    expect(loginMetrics.formWidth).toBeGreaterThanOrEqual(520);
    expect(loginMetrics.btnWidth).toBeGreaterThanOrEqual(460);
    expect(loginMetrics.btnHeight).toBeGreaterThanOrEqual(50);

    await page.fill('input[name=username]', 'abo');
    await page.fill('input[name=password]', 'abo');
    await page.click('button.loginInBt');

    await page.waitForFunction(() => window.location.hash.includes('/index/'), null, { timeout: 15000 });
    await page.waitForSelector('.el-aside.index-aside .el-menu-item', { timeout: 15000 });

    await page.evaluate(() => {
      const firstSubmenu = document.querySelector('.el-aside.index-aside .el-submenu');
      if (firstSubmenu && !firstSubmenu.classList.contains('is-opened')) {
        const title = firstSubmenu.querySelector('.el-submenu__title');
        if (title) title.click();
      }
    });
    await page.waitForTimeout(300);

    await expect(page.locator('.admin-sidebar-brand')).toBeVisible();
    await expect(page.locator('.admin-nav-section-heading')).toHaveCount(3);
    expect(await page.locator('.admin-nav-row').count()).toBeGreaterThan(2);
    expect(await page.locator('.admin-subnav-row').count()).toBeGreaterThan(1);

    const shellMetrics = await page.evaluate(() => {
      const aside = document.querySelector('.el-aside.index-aside');
      const brand = document.querySelector('.admin-sidebar-brand');
      const section = document.querySelector('.admin-nav-section-heading');
      const activeMenu = document.querySelector('.el-aside.index-aside .el-menu-demo > .el-menu-item.is-active, .el-aside.index-aside .el-submenu.is-opened > .el-submenu__title');
      const firstBody = document.querySelector('.admin-nav-body');
      const firstBadge = document.querySelector('.admin-nav-leading');
      const firstChildPanel = document.querySelector('.el-aside.index-aside .el-menu--inline');
      const firstChildItem = document.querySelector('.el-aside.index-aside .el-menu--inline .el-menu-item');
      const firstChildRow = document.querySelector('.admin-subnav-row');
      if (!aside || !brand || !section || !activeMenu || !firstBody || !firstBadge || !firstChildPanel || !firstChildItem || !firstChildRow) {
        return null;
      }
      const asideRect = aside.getBoundingClientRect();
      const activeStyle = getComputedStyle(activeMenu);
      const bodyStyle = getComputedStyle(firstBody);
      const badgeStyle = getComputedStyle(firstBadge);
      const panelStyle = getComputedStyle(firstChildPanel);
      const childItemStyle = getComputedStyle(firstChildItem);
      const childRowStyle = getComputedStyle(firstChildRow);
      return {
        asideWidth: Math.round(asideRect.width),
        menuBorderLeftWidth: parseFloat(activeStyle.borderLeftWidth) || 0,
        menuBorderBottomWidth: parseFloat(activeStyle.borderBottomWidth) || 0,
        menuBoxShadow: activeStyle.boxShadow || '',
        menuBgImage: activeStyle.backgroundImage || '',
        badgeWidth: parseFloat(badgeStyle.width) || 0,
        badgeRadius: parseFloat(badgeStyle.borderTopLeftRadius) || 0,
        badgeBg: badgeStyle.backgroundColor || '',
        bodyDisplay: bodyStyle.display || '',
        bodyGridCols: bodyStyle.gridTemplateColumns || '',
        panelBorderLeftWidth: parseFloat(panelStyle.borderLeftWidth) || 0,
        panelRadius: parseFloat(panelStyle.borderTopLeftRadius) || 0,
        childItemRadius: parseFloat(childItemStyle.borderTopLeftRadius) || 0,
        childDisplay: childRowStyle.display || '',
        childGridCols: childRowStyle.gridTemplateColumns || ''
      };
    });

    expect(shellMetrics).toBeTruthy();
    expect(shellMetrics.asideWidth).toBeGreaterThanOrEqual(264);
    expect(shellMetrics.asideWidth).toBeLessThanOrEqual(280);
    expect(shellMetrics.menuBorderLeftWidth).toBeGreaterThanOrEqual(3);
    expect(shellMetrics.menuBorderBottomWidth).toBeGreaterThanOrEqual(1);
    expect(shellMetrics.menuBoxShadow).toBe('none');
    expect(shellMetrics.menuBgImage).toBe('none');
    expect(shellMetrics.badgeWidth).toBeGreaterThanOrEqual(24);
    expect(shellMetrics.badgeWidth).toBeLessThanOrEqual(32);
    expect(shellMetrics.badgeRadius).toBeLessThanOrEqual(1);
    expect(shellMetrics.badgeBg).toBe('rgba(0, 0, 0, 0)');
    expect(shellMetrics.bodyDisplay).toBe('grid');
    expect(shellMetrics.bodyGridCols).not.toBe('none');
    expect(shellMetrics.panelBorderLeftWidth).toBeGreaterThanOrEqual(1);
    expect(shellMetrics.panelRadius).toBeLessThanOrEqual(1);
    expect(shellMetrics.childItemRadius).toBeLessThanOrEqual(1);
    expect(shellMetrics.childDisplay).toBe('grid');
    expect(shellMetrics.childGridCols).not.toBe('none');
  });
});
