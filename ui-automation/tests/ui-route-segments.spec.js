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

test.describe('Route Segment Modeling', () => {
  test('Persona planning should render walk/boarding/ride/transfer/alighting segments', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '无障碍路线规划' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForURL(/gongjiaoluxian\/list\.html/);
    await frame.locator('#qidianzhanming').fill('总站');
    await frame.locator('#zhongdianzhanming').fill('总站');
    await setSelectValue(frame, '#profileType', 'WHEELCHAIR');
    await frame.locator('#btn-plan').click();
    const segmentList = frame.locator('.route-segment-list').first();
    await expect(segmentList).toBeVisible();
    const segmentText = await segmentList.innerText();
    expect(segmentText).toContain('出发步行段');
    expect(segmentText).toContain('上车站可达性');
    expect(segmentText).toContain('公交乘车段');
    expect(segmentText).toContain('换乘设施评估');
    expect(segmentText).toContain('下车站可达性');
    expect(segmentText).toContain('到达步行段');
  });
});
