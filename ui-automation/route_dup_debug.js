const { chromium } = require('playwright');
(async()=>{
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1280}});
  await page.goto('http://127.0.0.1:8134/springbootmf383/front/index.html?route=routes', {waitUntil:'networkidle', timeout:60000});
  const frame = await (await page.waitForSelector('iframe')).contentFrame();
  await frame.waitForSelector('#profileType');
  await frame.waitForTimeout(1200);
  const data = await frame.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('#profileType, #preferenceType, .layui-form-select')).map((el, i) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {i, tag:el.tagName, id:el.id||'', cls:el.className||'', display:cs.display, width:r.width, height:r.height, top:r.top, left:r.left, text:(el.innerText||el.value||'').trim().slice(0,120)};
    });
    return nodes;
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
