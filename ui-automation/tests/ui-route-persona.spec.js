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

async function setSelectValue(frame, selector, value) {
  await frame.evaluate(({ selector, value }) => {
    const node = document.querySelector(selector);
    if (!node) throw new Error('SELECT_NOT_FOUND:' + selector);
    node.value = value;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, { selector, value });
}

test.describe('Route Persona Planning', () => {
  test('Wheelchair and low-vision personas should yield different top routes and decision summaries', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '无障碍路线规划' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForURL(/gongjiaoluxian\/list\.html/);

    await frame.locator('#qidianzhanming').fill('总站');
    await frame.locator('#zhongdianzhanming').fill('总站');

    await setSelectValue(frame, '#profileType', 'WHEELCHAIR');
    await setSelectValue(frame, '#preferenceType', 'AUTO');
    await frame.locator('#btn-plan').click();
    await expect(frame.locator('.route-plan-summary')).toContainText('轮椅 / 行动不便');
    await expect(frame.locator('.route-plan-summary')).toContainText('已过滤路线');
    await expect(frame.locator('.list .list-item').first()).toContainText('1路：东山署前路总站-芳村花园南门总站');
    await expect(frame.locator('.list .list-item').first()).toContainText('置信度');
    await expect(frame.locator('.list .list-item').first()).toContainText('数据源');
    await expect(frame.locator('.list .list-item').first()).toContainText('状态');

    await setSelectValue(frame, '#profileType', 'LOW_VISION');
    await setSelectValue(frame, '#preferenceType', 'AUTO');
    await frame.locator('#btn-plan').click();
    await expect(frame.locator('.route-plan-summary')).toContainText('低视力');
    await expect(frame.locator('.route-plan-summary')).toContainText('已过滤路线');
    await expect(frame.locator('.list .list-item').first()).toContainText('3路：如意坊总站-东山龟岗总站');
    await expect(frame.locator('.list .list-item').first()).toContainText('置信度');
    await expect(frame.locator('.list .list-item').first()).toContainText('数据源');
    await expect(frame.locator('.list .list-item').first()).toContainText('状态');
  });
});
