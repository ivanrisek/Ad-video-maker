// Capture real CNC.Quote screens for the promo: 2x full pages, element cutouts, layout.json.
// Read-only: every non-GET request except the login is aborted, so nothing is saved to the app.
// Real customer data is replaced with fictional values in this local browser only.
// Usage: CNC_USER=... CNC_PASS=... node scripts/capture.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://cnc-kalkulator-ponude-production.up.railway.app/';
const OUT = path.join(__dirname, '../public/textures');
const LAYOUT = path.join(__dirname, '../src/layout.json');
fs.mkdirSync(OUT, { recursive: true });

// fictional replacements for every real name in the account
// Real → fictional name pairs live OUTSIDE the repo (they contain the real names):
// CNC_SWAP_FILE=/path/swap.json, a JSON array of [real, fictional] pairs.
const SWAP = process.env.CNC_SWAP_FILE ? JSON.parse(fs.readFileSync(process.env.CNC_SWAP_FILE, 'utf8')) : [];
if (!SWAP.length) console.warn('CNC_SWAP_FILE not set: real names will NOT be replaced');

const QUOTES = [
  ['P-2026-0018', '27. 10. 2026.', 'Hidroteh Zagreb d.o.o.', 'KUĆIŠTE VENTILA + još 1', 2, 8, '1.264,40', 'poslano'],
  ['P-2026-0017', '26. 10. 2026.', 'Tokarija Vuk d.o.o.', 'VRATILO Ø40', 1, 25, '537,50', 'prihvaćeno'],
  ['P-2026-0016', '24. 10. 2026.', 'Alatnica Sava d.o.o.', 'ČAHURA VODILICE + još 4', 5, 140, '1.905,00', 'nacrt'],
  ['P-2026-0015', '23. 10. 2026.', 'Kovina Rijeka d.o.o.', 'PRIRUBNICA Ø80 + još 2', 3, 60, '2.418,00', 'poslano'],
  ['P-2026-0014', '22. 10. 2026.', 'Kovina Rijeka d.o.o.', 'NOSAČ SENZORA', 1, 10, '196,00', 'prihvaćeno'],
  ['P-2026-0013', '21. 10. 2026.', 'Tokarija Vuk d.o.o.', 'ADAPTER M30', 1, 50, '660,00', 'nacrt'],
  ['P-2026-0012', '20. 10. 2026.', 'Alatnica Sava d.o.o.', 'PLOČA STEZNA + još 3', 4, 12, '884,90', 'odbijeno'],
  ['P-2026-0011', '17. 10. 2026.', 'Hidroteh Zagreb d.o.o.', 'ZUPČANIK Z24', 1, 30, '1.032,00', 'poslano'],
];

const swapText = (page) =>
  page.evaluate((swap) => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) for (const [a, b] of swap) if (n.nodeValue.includes(a)) n.nodeValue = n.nodeValue.split(a).join(b);
    document.querySelectorAll('option').forEach((o) => { for (const [a, b] of swap) if (o.text.includes(a)) o.text = o.text.split(a).join(b); });
    document.querySelectorAll('[title],[aria-label]').forEach((e) => {
      for (const at of ['title', 'aria-label']) { const v = e.getAttribute(at); if (v) for (const [a, b] of swap) if (v.includes(a)) e.setAttribute(at, v.split(a).join(b)); }
    });
  }, SWAP);

const settle = async (page, ms = 900) => {
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(2, 1070);
  await page.waitForTimeout(ms);
};

const box = (page, sel, all = false) =>
  page.evaluate(([s, a]) => {
    const r2 = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
    if (a) return [...document.querySelectorAll(s)].filter((e) => e.offsetParent).map((e) => ({ ...r2(e), text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) }));
    const e = document.querySelector(s);
    return e ? r2(e) : null;
  }, [sel, all]);

const pageH = (page) => page.evaluate(() => document.documentElement.scrollHeight);

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.route('**/*', (r) => {
    const q = r.request();
    if (q.method() !== 'GET' && q.method() !== 'HEAD' && !q.url().endsWith('/api/login')) return r.abort();
    return r.continue();
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', process.env.CNC_USER);
  await page.fill('input[type=password]', process.env.CNC_PASS);
  await page.click('button:has-text("Prijavi se")');
  await page.waitForTimeout(3500);

  const layout = {};

  // ---------- 1. Materijali i cijene ----------
  await page.goto(BASE + '#materijali', { waitUntil: 'networkidle' });
  await swapText(page);
  await settle(page, 1500);
  layout.materials = {
    pageH: await pageH(page),
    rows: await box(page, '#matTable tbody tr', true),
    idx: await box(page, '.idx-grid > *', true),
    head: await box(page, '.view-head'),
    grid: await box(page, '.idx-grid'),
  };
  await page.screenshot({ path: `${OUT}/materials-full.png`, fullPage: true });
  await page.locator('.idx-grid > *').first().screenshot({ path: `${OUT}/idx-al.png` });

  // ---------- 2. Kalkulacija ----------
  await page.goto(BASE + '#kalkulacija', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await swapText(page);
  await page.selectOption('#clientSel', { index: 1 }).catch(() => {});
  const fill = async (sel, v) => { await page.fill(sel, ''); await page.type(sel, v); await page.press(sel, 'Tab'); };
  await fill('#f-part', 'Nosač senzora');
  await fill('#f-drawing', 'NS-1042');
  await fill('#f-q-commercial-marginPct', '20');
  await page.waitForTimeout(800);
  await swapText(page);
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.mouse.click(1800, 1060);
  await settle(page, 1200);
  layout.calc = {
    pageH: await pageH(page),
    dims: await box(page, '#f-material-dims-L'),
    dimsH: await box(page, '#f-material-dims-H'),
    matSection: await box(page, '#matIn'),
    machine: await box(page, '#f-ops-0-cycleMin'),
    machineSel: await box(page, 'select:not(#clientSel):not(#langSel):not(#addOut)'),
    priceCard: await box(page, 'section.tb'),
    cards: await box(page, '.calc .card', true),
    qtyRows: await box(page, 'table.qt tbody tr', true),
    qtyTable: await box(page, 'table.qt'),
    ticker: await box(page, '#ticker'),
    topbar: await box(page, 'header.topbar'),
    calc: await box(page, '.calc'),
    sirovac: await page.evaluate(() => { const e = [...document.querySelectorAll('.calc *')].filter((x) => x.innerText && x.innerText.trim().startsWith('Sirovac')).pop(); const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; }),
    heads: await page.evaluate(() => [...document.querySelectorAll('.calc section > header, .calc .card > header, .calc header')].filter((e) => e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return { text: e.innerText.replace(/\s+/g, ' ').slice(0, 40), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; })),
    legend: await page.evaluate(() => { const c = [...document.querySelectorAll('.calc .card')].find((e) => e.innerText.startsWith('Struktura')); return [...c.querySelectorAll('*')].filter((e) => /€/.test(e.innerText) && e.children.length > 1 && e.getBoundingClientRect().height < 30 && e.getBoundingClientRect().width > 300).map((e) => { const r = e.getBoundingClientRect(); return { text: e.innerText.replace(/\s+/g, ' '), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; }); }),
    bigPrice: await page.evaluate(() => { const tb = document.querySelector('section.tb'); const e = [...tb.querySelectorAll('*')].find((x) => /^\d+,\d\d/.test(x.innerText.trim()) && parseFloat(getComputedStyle(x).fontSize) > 40); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.innerText, x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), fs: getComputedStyle(e).fontSize }; }),
    texts: await page.evaluate(() => [...document.querySelectorAll('section.tb *')].filter((e) => e.children.length === 0 && e.innerText.trim()).map((e) => { const r = e.getBoundingClientRect(); return { t: e.innerText.trim(), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), fs: getComputedStyle(e).fontSize, fw: getComputedStyle(e).fontWeight, c: getComputedStyle(e).color }; })),
    bar: await page.evaluate(() => {
      const c = [...document.querySelectorAll('.calc .card')].find((e) => e.innerText.startsWith('Struktura'));
      const bar = c && [...c.querySelectorAll('*')].find((e) => { const r = e.getBoundingClientRect(); return r.height > 4 && r.height < 16 && r.width > 300; });
      if (!bar) return null;
      const r = bar.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    }),
  };
  await page.screenshot({ path: `${OUT}/calc-full.png`, fullPage: true });
  await page.locator('section.tb').screenshot({ path: `${OUT}/el-price.png` });
  const cards = page.locator('.calc .card');
  const n = await cards.count();
  for (let i = 0; i < n; i++) {
    const t = (await cards.nth(i).innerText()).trim();
    if (t.startsWith('Struktura')) await cards.nth(i).screenshot({ path: `${OUT}/el-structure.png` });
    if (t.startsWith('Cijena prema')) await cards.nth(i).screenshot({ path: `${OUT}/el-qty.png` });
  }
  await page.locator('header.topbar').screenshot({ path: `${OUT}/el-topbar.png` });

  // ---------- 3. Ponude ----------
  await page.goto(BASE + '#ponude', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate((Q) => {
    const tb = document.querySelector('#qList tbody');
    const tpl = tb.querySelector('tr');
    const rows = Q.map((q) => {
      const tr = tpl.cloneNode(true);
      const td = tr.querySelectorAll('td');
      td[0].querySelector('b').textContent = q[0];
      td[1].textContent = q[1]; td[2].textContent = q[2]; td[3].textContent = q[3];
      td[4].textContent = q[4]; td[5].textContent = q[5]; td[6].textContent = q[6];
      [...td[7].querySelectorAll('option')].forEach((o) => { o.selected = o.text === q[7]; });
      td[8].innerHTML = `${q[1]}<br><small>M. Horvat</small>`;
      return tr;
    });
    tb.replaceChildren(...rows);
  }, QUOTES);
  await swapText(page);
  await settle(page, 1000);
  layout.quotes = {
    pageH: 1080,
    rows: await box(page, '#qList tbody tr', true),
    search: await box(page, '.toolbar input'),
    table: await box(page, '#qList'),
    head: await box(page, '#qList thead'),
  };
  await page.screenshot({ path: `${OUT}/quotes-full.png` });
  const trs = page.locator('#qList tbody tr');
  for (let i = 0; i < (await trs.count()); i++) await trs.nth(i).screenshot({ path: `${OUT}/qrow${i}.png` });
  // empty plate: rows hidden, search placeholder kept (patched in-video)
  await page.evaluate(() => document.querySelectorAll('#qList tbody tr').forEach((t) => (t.style.visibility = 'hidden')));
  await settle(page, 300);
  await page.screenshot({ path: `${OUT}/quotes-empty.png` });

  fs.writeFileSync(LAYOUT, JSON.stringify(layout, null, 1));
  console.log(JSON.stringify(layout, null, 1).slice(0, 6000));
  await b.close();
})();
