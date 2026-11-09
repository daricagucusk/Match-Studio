// Canlı inceleme: açılış, her ekran, perf metrikleri, konsol hataları.
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8911/index.html';
const OUT = path.join(__dirname, '..', 'test-results', 'live-review-20261108');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));

  const t0 = Date.now();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const fcp = Date.now() - t0;
  await page.screenshot({ path: path.join(OUT, '01-acilis.png'), fullPage: true });

  const navInfo = await page.evaluate(() => {
    const links = [...document.querySelectorAll('.nav-link, .mobile-link')].map(a => ({
      text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
      id: a.id || null,
      visible: !!(a.offsetWidth || a.offsetHeight)
    }));
    const tabs = [...document.querySelectorAll('.workflow-tabs button, .segmented button, .mobile-editor-tabs button')].map(b => (b.textContent || '').trim().slice(0, 30));
    return { navLinks: links, secondLevelTabs: tabs, h1: document.querySelector('h1,h2')?.textContent?.trim().slice(0, 60) };
  });

  const routes = [];
  for (const l of navInfo.navLinks) {
    if (!l.visible) continue;
    routes.push(l);
  }
  fs.writeFileSync(path.join(OUT, 'nav.json'), JSON.stringify({ navInfo, errors }, null, 1));
  console.log(JSON.stringify({ fcpMs: fcp, navCount: routes.length, tabs: navInfo.secondLevelTabs, h1: navInfo.h1, errors: errors.slice(0, 5) }, null, 1));

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paint = performance.getEntriesByType('paint');
    const res = performance.getEntriesByType('resource').map(r => ({ name: r.name.split('/').pop(), kb: Math.round(r.transferSize / 1024) }))
      .sort((a, b) => b.kb - a.kb).slice(0, 8);
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      loadEvent: Math.round(nav.loadEventEnd || 0),
      fcp: Math.round(paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0),
      biggestResources: res,
      resourceCount: performance.getEntriesByType('resource').length,
      totalTransferKB: Math.round(performance.getEntriesByType('resource').reduce((s, r) => s + r.transferSize, 0) / 1024)
    };
  });
  console.log(JSON.stringify(metrics, null, 1));
  fs.writeFileSync(path.join(OUT, 'perf.json'), JSON.stringify(metrics, null, 1));

  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
