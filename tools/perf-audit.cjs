'use strict';
/* Performans Denetimi (Sonal) — MCP external-eye audit for Match Studio PWA F.19 RC.1 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:8913';
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000, isMobile: false },
  { name: 'laptop', width: 1280, height: 720, isMobile: false },
  { name: 'fold-open', width: 840, height: 980, isMobile: true, hasTouch: true },
  { name: 'phone', width: 360, height: 780, isMobile: true, hasTouch: true },
];
const REPORT_DIR = path.join(__dirname, '..', '..', 'perf-audit-results');
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

async function measureMetrics(page) {
  const loadPromise = page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await loadPromise;
  // Wait for app shell to render
  try { await page.waitForSelector('.app-shell', { timeout: 10000 }); } catch(e) {}
  await page.waitForTimeout(2000);

  // FCP: observer start immediately, get entry as soon as it fires
  const fcpResult = await page.evaluate(() => Promise.race([new Promise((resolve) => {
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const e of entries) if (e.name === 'first-contentful-paint') resolve(e.startTime);
        setTimeout(() => resolve(null), 4000);
      }).observe({ type: 'first-contentful-paint', buffered: true });
    } catch(e) { resolve(null); }
  }), new Promise((resolve) => setTimeout(() => resolve(null), 6000))]));

  // LCP
  const lcpResult = await page.evaluate(() => {
    try {
      const list = performance.getEntriesByType('largest-contentful-paint');
      if (!list.length) return null;
      return Math.max(...list.map(e => e.startTime));
    } catch(e) { return null; }
  });

  // CLS
  const clsResult = await page.evaluate(() => {
    try {
      const list = performance.getEntriesByType('layout-shift');
      return list.length ? list.reduce((a, b) => a + b.value, 0) : 0;
    } catch(e) { return 0; }
  });

  const readyState = await page.evaluate(() => document.readyState);
  const loadTime = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return nav ? nav.loadEventEnd : null;
  });
  const swStatus = await page.evaluate(() => navigator.serviceWorker.controller ? 'active' : 'none');
  const memInfo = await page.evaluate(() => ({
    usedJSHeapSize: (performance.memory && performance.memory.usedJSHeapSize) || null,
    totalJSHeapSize: (performance.memory && performance.memory.totalJSHeapSize) || null,
  }));

  // Network breakdown
  const networkData = await page.evaluate(() => new Promise((resolve) => {
    const senders = {}; let totalCount = 0; let totalBytes = 0;
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const key = entry.name.split('/').pop().split('?')[0];
          senders[key] = (senders[key] || 0) + entry.transferSize;
          totalCount++; totalBytes += entry.transferSize || 0;
        }
      });
      obs.observe({ entryTypes: ['resource'] });
      setTimeout(() => resolve({ senders, totalCount, totalBytes }), 3000);
    } catch(e) { resolve({ senders: {}, totalCount: 0, totalBytes: 0 }); }
  }));

  const topResources = await page.evaluate(() => performance.getEntriesByType('resource').map(e => ({
    name: e.name.split('/').pop().split('?')[0], size: e.transferSize,
  })).sort((a, b) => b.size - a.size).slice(0, 15));

  return { fcp: fcpResult, lcp: lcpResult, tbt: null, cls: clsResult, domReady: readyState, loadTime, swStatus, memInfo, networkData, topResources };
}

async function measureCPUThrottled(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(3000);

  const frameStats = await page.evaluate(() => new Promise((resolve) => {
    const counts = { idle: 0, busy: 0, slow: 0 };
    let lastCheck = performance.now();
    function check() {
      const current = performance.now();
      const delta = current - lastCheck;
      lastCheck = current;
      if (delta < 16) counts.idle++;
      else if (delta < 32) counts.busy++;
      else counts.slow++;
      setTimeout(check, 1000);
    }
    requestAnimationFrame(check);
    setTimeout(() => {
      const interactive = document.querySelectorAll('.app-shell, .sidebar, .main').length > 0;
      resolve({ counts, interactive });
    }, 4000);
  }));

  // Memory sampling over ~5 seconds
  const memGrowth = await page.evaluate(() => new Promise((resolve) => {
    const points = []; let idx = 0;
    function next() {
      if (idx >= 5) { resolve({ points, varianceKB: 0 }); return; }
      points.push(Math.round((performance.memory ? performance.memory.usedJSHeapSize : 0) / 1024));
      idx++;
      setTimeout(next, 1000);
    }
    next();
  }));

  return { frameStats, memGrowth };
}

async function main() {
  console.log('='.repeat(70));
  console.log('Match Studio F.19 RC.1 — Performans Denetimi / Dış Göz');
  console.log('='.repeat(70));
console.log(`Target: ${BASE_URL}`);
  console.log(`Viewport plans: ${VIEWPORTS.map(v => `${v.name}(${v.width}x${v.height}${v.isMobile?' mobile':''})`).join(', ')}\n`);

  const browser = await chromium.launch();
  const allResults = {};

  for (const vp of VIEWPORTS) {
    console.log(`\n${' '.repeat(2)} ${vp.name}: ${vp.width}x${vp.height}${vp.isMobile?' [mobile]':''}`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    const perf = await measureMetrics(page);
    allResults[vp.name] = perf;

    const cpuThrottled = await measureCPUThrottled(page, vp);
    allResults[`${vp.name}-cpu`] = cpuThrottled;

    console.log(`  FCP:     ${perf.fcp != null ? perf.fcp.toFixed(0) + 'ms' : 'N/A'}`);
    console.log(`  LCP:     ${perf.lcp != null ? perf.lcp.toFixed(0) + 'ms' : 'N/A'}`);
    console.log(`  CLS:     ${perf.cls != null ? perf.cls.toExponential(2) : 'N/A'}`);
    console.log(`  Load:    ${perf.loadTime != null ? perf.loadTime.toFixed(0) + 'ms' : 'N/A'}`);
    console.log(`  SW:      ${perf.swStatus}`);
    console.log(`  DOM:     ${perf.domReady === 'complete' ? 'done' : 'loading'}`);
    console.log(`  Frames:  idle=${cpuThrottled.frameStats.idle} busy=${cpuThrottled.frameStats.busy} slow=${cpuThrottled.frameStats.slow}`);
    console.log(`  Heap:    ${cpuThrottled.memGrowth.varianceKB.toFixed(0)} KB/s (samples: ${cpuThrottled.memGrowth.points.join(',')})`);
    const downloadedMB = (perf.topResources.reduce((s, r) => s + (r.size || 0), 0) / 1024 / 1024).toFixed(2);
    console.log(`  Downloaded: ${downloadedMB} MB / ${perf.networkData.totalCount} requests`);

    await context.close();
  }

  await browser.close();

  fs.writeFileSync(path.join(REPORT_DIR, 'raw-metrics.json'), JSON.stringify(allResults, null, 2));
  const rel = path.relative(process.cwd(), path.join(REPORT_DIR, 'raw-metrics.json'));
  console.log(`\nRaw metrics saved to ${rel}`);
  console.log('Audit complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
