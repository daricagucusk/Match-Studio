// Canlı derin inceleme: kulüp kur, tüm ekranları gez, ekran bazlı hata/metrik topla.
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
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + String(e).slice(0, 160)));

  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  // Kulüp kur (test verisi, sentetik ad)
  await page.fill('input[type="text"], input:not([type])', 'Deneme Kulübü 2026').catch(() => {});
  const btn = page.locator('button', { hasText: /KULÜP OLUŞTUR/i }).first();
  await btn.click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(OUT, '02-kulup-sonrasi.png'), fullPage: true });

  // Nav bağlantılarını canlı oku
  const nav = await page.evaluate(() => [...document.querySelectorAll('.nav-link')].map(a => ({
    text: (a.textContent || '').trim().replace(/\s+/g, ' '),
    visible: !!(a.offsetWidth || a.offsetHeight)
  })));
  console.log('NAV:', JSON.stringify(nav));

  // Her görünür nav bağlantısına tıkla, ekranı kaydet
  const report = [];
  const links = page.locator('.nav-link:visible');
  const count = await links.count();
  for (let i = 0; i < count; i++) {
    const before = errors.length;
    const l = page.locator('.nav-link:visible').nth(i);
    const label = (await l.textContent() || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    await l.click().catch(e => errors.push('CLICKFAIL ' + label + ': ' + e.message.slice(0, 80)));
    await page.waitForTimeout(1300);
    const file = path.join(OUT, `ekran-${String(i + 3).padStart(2, '0')}-${label.replace(/[^\wçğıöşüÇĞİÖŞÜ ]/g, '').replace(/ /g, '-').toLowerCase()}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const stats = await page.evaluate(() => ({
      h1: document.querySelector('.workspace-title-row h1, h1, h2')?.textContent?.trim().slice(0, 50) || '',
      buttons: document.querySelectorAll('button').length,
      emptyStates: document.querySelectorAll('.empty').length,
      toasts: document.querySelectorAll('.toast').length,
      modals: document.querySelectorAll('.modal-backdrop').length
    })).catch(e => ({ err: e.message.slice(0, 80) }));
    report.push({ label, stats, newErrors: errors.slice(before) });
  }

  fs.writeFileSync(path.join(OUT, 'tarama.json'), JSON.stringify({ report, errors }, null, 1));
  console.log(JSON.stringify({ report: report.map(r => ({ l: r.label, s: r.stats, e: r.newErrors.length })), totalErrors: errors.length }, null, 1));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
