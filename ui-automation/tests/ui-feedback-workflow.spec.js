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

test.describe('Feedback Workflow', () => {
  test('Front feedback page should show typed feedback and review board should update status', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '留言与改进建议' }).first().click();
    const { frame } = await getIframe(page);
    await frame.waitForURL(/messages\/list\.html/);
    await expect(frame.locator('body')).toContainText('类型：');
    await expect(frame.locator('body')).toContainText('反馈处理看板');

    await frame.locator('button', { hasText: '反馈处理看板' }).click();
    await frame.waitForURL(/messages\/review\.html/);
    await expect(frame.locator('body')).toContainText('反馈处理看板');
    await expect(frame.locator('body')).toContainText('待核查');

    await frame.locator('select').first().selectOption('IN_REVIEW');
    await frame.locator('input[placeholder="审核人"]').first().fill('自动化审核员');
    await frame.locator('input[placeholder="审核备注"]').first().fill('已进入自动化核查');
    await frame.locator('button', { hasText: '保存处理' }).first().click();
    await expect(frame.locator('#reviewBoardStatus')).toContainText('已加载');
  });
});
