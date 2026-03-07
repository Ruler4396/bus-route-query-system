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

test.describe('Resource Detail Layout', () => {
  test('Resource detail should avoid nested white frame gaps and hide decorative media', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#header a', { hasText: '无障碍资源链接' }).first().click();
    const { frame } = await getIframe(page);
    await frame.locator('.list .list-item').first().click();
    await frame.waitForURL(/youqinglianjie\/detail\.html\?id=/, { timeout: 20000 });
    const metrics = await frame.evaluate(() => {
      const outer = document.querySelector('#app > .data-detail:nth-of-type(2)');
      const article = document.querySelector('.layui-col-md7');
      const swiper = document.getElementById('swiper');
      const detailTab = document.querySelector('.detail-tab');
      const outerStyle = outer ? getComputedStyle(outer) : null;
      const articleRect = article ? article.getBoundingClientRect() : null;
      const outerRect = outer ? outer.getBoundingClientRect() : null;
      return {
        outerBg: outerStyle ? outerStyle.backgroundColor : '',
        outerShadow: outerStyle ? outerStyle.boxShadow : '',
        swiperDisplay: swiper ? getComputedStyle(swiper).display : 'none',
        detailTabDisplay: detailTab ? getComputedStyle(detailTab).display : 'none',
        extraInset: outerRect && articleRect ? Math.round((articleRect.left - outerRect.left) + (outerRect.right - articleRect.right)) : 999
      };
    });
    expect(metrics.outerBg).toBe('rgba(0, 0, 0, 0)');
    expect(metrics.outerShadow === 'none' || metrics.outerShadow === '').toBeTruthy();
    expect(metrics.swiperDisplay).toBe('none');
    expect(metrics.detailTabDisplay).toBe('none');
    expect(metrics.extraInset).toBeLessThanOrEqual(12);
  });
});
