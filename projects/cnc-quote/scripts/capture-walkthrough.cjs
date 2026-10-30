// Walkthrough capture from a LOCAL CNC.Quote instance seeded with invented demo data (scripts/seed-demo.mjs).
// Login page → every page → a randomly generated calculation captured step by step → save → printed quote.
// Output: public/textures/wt/*.png (2x) and src/walkthrough.json (states, element boxes, the random values used).
// Usage: BASE=http://127.0.0.1:3500/ node scripts/capture-walkthrough.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://127.0.0.1:3500/';
const OUT = path.join(__dirname, '../public/textures/wt');
const JSON_OUT = path.join(__dirname, '../src/walkthrough.json');
const USER = { email: 'marko.horvat@primjer-metal.hr', password: 'Demo-lozinka-2026' };
fs.mkdirSync(OUT, { recursive: true });

// seeded "random" calculation (repeatable)
let seed = +(process.env.SEED || 4521);
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const between = (a, b, step = 1) => Math.round((a + rnd() * (b - a)) / step) * step;
const CALC = (() => {
  const client = pick(['Brodomont Split d.o.o.', 'Agrostroj Slavonija d.o.o.', 'Hidroteh Zagreb d.o.o.', 'Alatnica Sava d.o.o.']);
  const [mat, query] = pick([['42CrMo4', '42cr'], ['C45', 'c45'], ['1.4301', '1.4301'], ['EN AW-7075 T651', '7075']]);
  const D = between(40, 70, 5);
  const part = `${pick(['Vratilo', 'Osovina', 'Svornjak'])} Ø${D - 5}`;
  return {
    client, part, drawing: `${part.slice(0, 2).toUpperCase()}-${between(100, 999)}-${String(between(1, 20)).padStart(2, '0')}`,
    qty: String(pick([20, 25, 40, 50])), mat, query, D: String(D), L: String(between(140, 260, 10)),
    machine: 'CNC tokarilica', cycle: String(between(9, 18)),
  };
})();

const box = (page, sel) => page.evaluate((s) => {
  const e = typeof s === 'string' ? document.querySelector(s) : null;
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
}, sel);
const boxes = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.offsetParent).map((e) => {
  const r = e.getBoundingClientRect();
  return { x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), text: (e.innerText || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 50) };
}), sel);
const byText = (page, sel, re) => page.evaluate(([s, src]) => {
  const rx = new RegExp(src);
  const e = [...document.querySelectorAll(s)].find((x) => x.offsetParent && rx.test(x.innerText || x.value || ''));
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
}, [sel, re.source]);

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, locale: 'hr-HR', timezoneId: 'Europe/Zagreb' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.addInitScript(() => { window.print = () => { window.__printed = true; }; });
  const settle = async (ms = 700) => { await page.evaluate(() => document.fonts.ready); await page.mouse.move(1910, 1075); await page.waitForTimeout(ms); };
  const shot = async (name, full = true) => { await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full }); };
  const W = { calc: CALC, pages: {}, states: [] };

  // ---------- login page ----------
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await settle(1200);
  await shot('login-empty', false);
  W.login = {
    email: await box(page, 'input[type=email]'), password: await box(page, 'input[type=password]'),
    button: await byText(page, 'button', /Prijavi se/), hero: await box(page, '.auth-art, .auth-hero, aside, .auth > :first-child'),
  };
  await page.fill('input[type=email]', USER.email);
  await settle(300);
  await shot('login-email', false);
  await page.fill('input[type=password]', USER.password);
  await page.evaluate(() => document.activeElement.blur());
  await settle(300);
  await shot('login-filled', false);
  await page.click('button:has-text("Prijavi se")');
  await page.waitForTimeout(2500);

  // ---------- page tour ----------
  const PAGES = ['ponude', 'statistika', 'klijenti', 'materijali', 'postavke'];
  for (const h of PAGES) {
    await page.goto(BASE + '#' + h, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await settle(1800);
    await shot(`page-${h}`, false);
    W.pages[h] = {
      nav: await boxes(page, '.nav button'),
      head: await box(page, '.view-head'),
      rows: await boxes(page, 'main table tbody tr, #app table tbody tr'),
      cards: await boxes(page, '.idx-grid > *, .kpis > *, .kpi, .stat, .theme-opt, .themes > *'),
      chart: await box(page, 'svg.chart, .chart svg, .chart'),
    };
  }

  // ---------- calculation, step by step ----------
  await page.goto(BASE + '#kalkulacija', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await settle(1500);
  const geo = async () => ({
    pageH: await page.evaluate(() => document.documentElement.scrollHeight),
    client: await box(page, '#clientSel'), part: await box(page, '#f-part'), drawing: await box(page, '#f-drawing'), qty: await box(page, '#qtyIn'),
    mat: await box(page, '#matIn'), matList: await box(page, '#matList:not([hidden])'),
    rodTab: await byText(page, 'button', /^Okrugla šipka$/), dimD: await box(page, '#f-material-dims-D'), dimL: await box(page, '#f-material-dims-L'),
    machine: await page.evaluate(() => { const e = [...document.querySelectorAll('select.sel')].find((s) => /glodalica|tokarilica/.test(s.innerText)); const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; }),
    cycle: await box(page, '#f-ops-0-cycleMin'), sirovac: await page.evaluate(() => { const e = [...document.querySelectorAll('.calc *')].filter((x) => x.innerText && x.innerText.trim().startsWith('Sirovac')).pop(); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; }),
    price: await box(page, 'section.tb'), bigPrice: await box(page, '.tb-price .big'), save: await box(page, '#saveBtn'), print: await box(page, '#printBtn'),
    structure: await byText(page, '.calc .card', /^Struktura/), qtyCard: await byText(page, '.calc .card', /^Cijena prema/),
    title: await box(page, '.view-head h1'),
    priceText: await page.evaluate(() => document.querySelector('.tb-price .big')?.innerText.replace(/\s+/g, ' ').trim()),
  });
  const state = async (name, note) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(500);
    await shot(`calc-${name}`);
    await page.locator('section.tb').screenshot({ path: `${OUT}/price-${name}.png` });
    const g = await geo();
    W.states.push({ name, note, ...g });
    console.log(name, g.priceText);
  };
  const type = async (sel, v) => { await page.fill(sel, ''); await page.type(sel, v, { delay: 20 }); };

  await state('s0', 'empty new quote');
  await page.selectOption('#clientSel', { label: CALC.client });
  await page.waitForTimeout(500);
  await state('s1', `client ${CALC.client}`);
  await type('#f-part', CALC.part);
  await type('#f-drawing', CALC.drawing);
  await page.press('#f-drawing', 'Tab');
  await state('s2', 'part + drawing');
  await type('#qtyIn', CALC.qty);
  await page.press('#qtyIn', 'Tab');
  await state('s3', `qty ${CALC.qty}`);
  await page.click('button:has-text("Okrugla šipka")');
  await page.waitForTimeout(500);
  await state('s4', 'round bar');
  // material picker open with the query typed (dropdown visible)
  await page.click('#matIn');
  await page.type('#matIn', CALC.query, { delay: 40 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await shot('calc-s5open');
  W.matOpen = { list: await box(page, '#matList'), options: await boxes(page, '#matList .mat-opt'), input: await box(page, '#matIn') };
  await page.click(`#matList .mat-opt:has-text("${CALC.mat}")`);
  await page.waitForTimeout(600);
  await page.evaluate(() => document.activeElement.blur());
  await state('s5', `material ${CALC.mat}`);
  await type('#f-material-dims-D', CALC.D);
  await type('#f-material-dims-L', CALC.L);
  await page.press('#f-material-dims-L', 'Tab');
  await page.evaluate(() => document.activeElement.blur());
  await state('s6', `blank Ø${CALC.D}×${CALC.L}`);
  const machineSel = page.locator('select.sel').filter({ hasText: 'glodalica' }).first();
  await machineSel.selectOption({ label: (await machineSel.locator('option', { hasText: CALC.machine }).first().innerText()).trim() });
  await page.waitForTimeout(400);
  await type('#f-ops-0-cycleMin', CALC.cycle);
  await page.press('#f-ops-0-cycleMin', 'Tab');
  await page.evaluate(() => document.activeElement.blur());
  await state('s7', `${CALC.machine}, ${CALC.cycle} min`);

  // ---------- save (real, into the local demo DB) ----------
  await page.click('#saveBtn');
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(1910, 1075);
  await page.waitForTimeout(150);
  await shot('calc-s8saved');
  W.saved = { toast: await box(page, '.toast'), title: await box(page, '.view-head h1'), titleText: await page.evaluate(() => document.querySelector('.view-head h1').innerText) };
  console.log('saved as', W.saved.titleText);

  // ---------- print: the app's own quote document ----------
  await page.click('#printBtn');
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const pr = document.querySelector('#print');
    pr.style.cssText = 'display:block;position:absolute;left:0;top:0;z-index:99999;width:794px;min-height:1123px;box-sizing:border-box;padding:56px 60px;background:#fff;';
    document.querySelectorAll('body > *:not(#print)').forEach((e) => (e.style.visibility = 'hidden'));
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const pctx = await b.newContext({ viewport: { width: 1920, height: 1600 }, deviceScaleFactor: 3 });
  await pctx.close();
  await page.locator('#print').screenshot({ path: `${OUT}/quote-pdf.png` });
  W.pdf = await page.evaluate(() => {
    const r2 = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const pr = document.querySelector('#print');
    return {
      sheet: r2(pr), head: r2(pr.querySelector('.pq-head')), to: r2(pr.querySelector('.pq-to')), thead: r2(pr.querySelector('table thead')),
      rows: [...pr.querySelectorAll('table:first-of-type tbody tr')].map(r2),
      alt: [...pr.querySelectorAll('h2, table')].slice(1).map(r2),
      tot: r2(pr.querySelector('.tot')), totLines: [...pr.querySelectorAll('.tot > div')].map(r2),
      rest: [...pr.querySelectorAll('h2, p, .foot')].map(r2), text: pr.innerText,
    };
  });
  fs.writeFileSync(JSON_OUT, JSON.stringify(W, null, 1));
  console.log(JSON.stringify(CALC));
  await b.close();
})();
