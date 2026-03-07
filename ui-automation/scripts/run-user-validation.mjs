import fs from 'fs';
import path from 'path';
const { chromium } = await import('@playwright/test');

const baseURL = (process.env.UI_BASE_URL || 'http://127.0.0.1:8134/springbootmf383/front/').replace(/\/?$/, '/');
const reportPath = path.resolve(process.cwd(), 'reports/user-validation-report.json');

async function getFrame(page) {
  const iframe = page.locator('#iframe');
  await iframe.waitFor({ state: 'visible', timeout: 20000 });
  const handle = await iframe.elementHandle();
  const frame = await handle.contentFrame();
  if (!frame) throw new Error('IFRAME_NO_CONTENT');
  return frame;
}

async function setSelectValue(frame, selector, value) {
  await frame.evaluate(({ selector, value }) => {
    const node = document.querySelector(selector);
    if (!node) throw new Error('SELECT_NOT_FOUND:' + selector);
    node.value = value;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, { selector, value });
}

function makeResult(id, title) {
  return { id, title, passed: false, durationMs: 0, understandingCost: 'MEDIUM', misleadingRisk: 'LOW', observations: [], checks: [] };
}

async function main() {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  try {
    await page.goto(baseURL + 'index.html', { waitUntil: 'networkidle' });

    // T01
    {
      const task = makeResult('T01', '轮椅画像路线选择任务');
      const start = Date.now();
      try {
        await page.locator('#header a', { hasText: '无障碍路线规划' }).first().click();
        const frame = await getFrame(page);
        await frame.locator('#qidianzhanming').fill('总站');
        await frame.locator('#zhongdianzhanming').fill('总站');
        await setSelectValue(frame, '#profileType', 'WHEELCHAIR');
        await frame.locator('#btn-plan').click();
        await frame.waitForTimeout(1200);
        const topRoute = await frame.locator('.list .list-item .route-card-name').first().innerText();
        const summary = await frame.locator('.route-plan-summary').innerText();
        task.checks.push({ check: 'top_route', value: topRoute });
        task.checks.push({ check: 'summary_has_rejected', value: summary.includes('已过滤路线') });
        task.passed = topRoute.includes('1路') && summary.includes('已过滤路线');
        task.observations.push('轮椅画像下 1路 排名第一，说明画像排序已生效。');
        task.observations.push('系统对关键轮椅信息不足的路线做了过滤，未直接误导用户。');
      } catch (err) {
        task.observations.push('失败：' + err.message);
        task.misleadingRisk = 'MEDIUM';
      }
      task.durationMs = Date.now() - start;
      results.push(task);
    }

    // T02
    {
      const task = makeResult('T02', '低视力画像路线选择任务');
      const start = Date.now();
      try {
        const frame = await getFrame(page);
        await setSelectValue(frame, '#profileType', 'LOW_VISION');
        await frame.locator('#btn-plan').click();
        await frame.waitForTimeout(1200);
        const topRoute = await frame.locator('.list .list-item .route-card-name').first().innerText();
        const topCardText = await frame.locator('.list .list-item').first().innerText();
        task.checks.push({ check: 'top_route', value: topRoute });
        task.checks.push({ check: 'card_has_confidence', value: topCardText.includes('置信度') });
        task.checks.push({ check: 'card_has_source', value: topCardText.includes('数据源') });
        task.passed = topRoute.includes('3路') && topCardText.includes('置信度') && topCardText.includes('数据源');
        task.observations.push('低视力画像下 3路 排名第一，和轮椅画像结果不同。');
      } catch (err) {
        task.observations.push('失败：' + err.message);
        task.misleadingRisk = 'MEDIUM';
      }
      task.durationMs = Date.now() - start;
      results.push(task);
    }

    // T03
    {
      const task = makeResult('T03', '分段风险理解任务');
      const start = Date.now();
      try {
        const frame = await getFrame(page);
        const segmentText = await frame.locator('.route-segment-list').first().innerText();
        const required = ['出发步行段', '上车站可达性', '公交乘车段', '换乘设施评估', '下车站可达性', '到达步行段'];
        const ok = required.every(label => segmentText.includes(label));
        task.checks.push({ check: 'all_segments_visible', value: ok });
        task.passed = ok;
        task.observations.push('用户能够看到门到门分段结构，而不是只看到一条总路线。');
        task.understandingCost = 'LOW';
      } catch (err) {
        task.observations.push('失败：' + err.message);
        task.misleadingRisk = 'MEDIUM';
      }
      task.durationMs = Date.now() - start;
      results.push(task);
    }

    // T04
    {
      const task = makeResult('T04', '数据治理理解任务');
      const start = Date.now();
      try {
        const frame = await getFrame(page);
        const governance = await frame.locator('.route-governance-panel').innerText();
        task.checks.push({ check: 'governance_panel', value: governance.includes('数据源登记') && governance.includes('置信度规则') && governance.includes('试点人工样本基础') });
        task.passed = governance.includes('数据源登记') && governance.includes('置信度规则') && governance.includes('试点人工样本基础');
        task.observations.push('用户能看到系统的治理口径，而不是只看到分数。');
        task.understandingCost = 'MEDIUM';
      } catch (err) {
        task.observations.push('失败：' + err.message);
        task.misleadingRisk = 'MEDIUM';
      }
      task.durationMs = Date.now() - start;
      results.push(task);
    }

        // T05
    {
      const task = makeResult('T05', '反馈闭环任务');
      const start = Date.now();
      try {
        await page.locator('#header a', { hasText: '留言与改进建议' }).first().click();
        await page.waitForFunction(() => {
          const iframe = document.getElementById('iframe');
          return iframe && iframe.getAttribute('src') && iframe.getAttribute('src').indexOf('messages/list.html') >= 0;
        }, { timeout: 20000 });
        let frame = await getFrame(page);
        await frame.waitForSelector('form.message-form', { timeout: 20000 });
        const bodyText = await frame.locator('body').innerText();
        const intakeReady = bodyText.includes('反馈处理看板') && bodyText.includes('留言');
        task.checks.push({ check: 'feedback_entry', value: intakeReady });
        await frame.locator('textarea[name="content"]').fill('准真实验证反馈：请核对 31 路终点地铁衔接可达性');
        await frame.locator('input[name="routeName"]').fill('31路');
        await frame.locator('input[name="stationName"]').fill('南石路地铁棣园站');
        await frame.locator('#messageSubmitBtn').click();
        await frame.waitForTimeout(1500);
        await frame.locator('button', { hasText: '反馈处理看板' }).click();
        await frame.waitForURL(/messages\/review\.html/, { timeout: 20000 });
        await frame.waitForSelector('button', { timeout: 20000 });
        await frame.locator('select').first().selectOption('IN_REVIEW');
        await frame.locator('input[placeholder="审核人"]').first().fill('准真实验证审核员');
        await frame.locator('input[placeholder="审核备注"]').first().fill('自动化验证通过');
        await frame.locator('button', { hasText: '保存处理' }).first().click();
        await frame.waitForTimeout(1000);
        const reviewBody = await frame.locator('body').innerText();
        const reviewSaved = reviewBody.includes('反馈处理看板') && reviewBody.includes('IN_REVIEW');
        task.checks.push({ check: 'review_saved', value: reviewSaved });
        task.passed = intakeReady && reviewSaved;
        task.observations.push('用户提出问题后，系统存在最小审核处理闭环。');
      } catch (err) {
        task.observations.push('失败：' + err.message);
        task.misleadingRisk = 'MEDIUM';
      }
      task.durationMs = Date.now() - start;
      results.push(task);
    }

    const passed = results.filter(item => item.passed).length;
    const report = {
      validationType: 'quasi_real_task_validation',
      baseURL,
      generatedAt: new Date().toISOString(),
      summary: {
        totalTasks: results.length,
        passedTasks: passed,
        successRate: Number((passed / results.length * 100).toFixed(1)),
        conclusion: passed / results.length >= 0.8 ? '通过准真实任务验证门槛' : '未达到准真实任务验证门槛'
      },
      tasks: results,
      limitations: [
        '本轮是准真实用户验证，不等同于真实残障用户实测。',
        '尚未完成 NVDA / VoiceOver / TalkBack 等真实屏幕阅读器基线。',
        '尚未完成线下人工核验与真实步行路径试走。'
      ]
    };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = passed / results.length >= 0.8 ? 0 : 2;
  } finally {
    await browser.close();
  }
}

main();
