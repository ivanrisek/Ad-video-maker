// Capture the app's own printed quote ("Ispiši / PDF") as a 3x texture for the promo.
// Read-only: the save request the print button makes (POST api/quotes) is answered locally with a fake
// "saved" reply and never reaches the server; every other non-GET request is aborted.
// Company and customer details on the document are replaced with invented ones before capture.
// Usage: CNC_USER=... CNC_PASS=... CNC_SWAP_FILE=/private/swap.json node scripts/capture-pdf.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const BASE = 'https://cnc-kalkulator-ponude-production.up.railway.app/';
const OUT = path.join(__dirname, '../public/textures');
const LAYOUT = path.join(__dirname, '../src/layout.json');
const SWAP = process.env.CNC_SWAP_FILE ? JSON.parse(fs.readFileSync(process.env.CNC_SWAP_FILE, 'utf8')) : [];

const COMPANY = { name: 'Primjer Metal d.o.o.', lines: ['Industrijska ulica 12, 10000 Zagreb', 'OIB 12345678901', 'ured@primjer-metal.hr', '+385 1 555 0100', 'www.primjer-metal.hr'] };
const CUSTOMER = { name: 'Kovina Rijeka d.o.o.', lines: ['Riječka cesta 5, 51000 Rijeka', 'OIB 98765432109'] };
const ITEMS = [
  { part: 'Nosač senzora', drawing: 'NS-1042', qty: '10' },
  { part: 'Osovina Ø36', drawing: 'OS-036-03', qty: '25', shape: 'Okrugla šipka' },
  { part: 'Čahura vodilice', drawing: 'CV-022-01', qty: '100', shape: 'Okrugla šipka' },
];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1600 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.print = () => { window.__printed = true; }; });
  await page.route('**/*', (r) => {
    const q = r.request();
    const m = q.method();
    if (m === 'GET' || m === 'HEAD' || q.url().endsWith('/api/login')) return r.continue();
    if (m === 'POST' && /\/api\/quotes$/.test(q.url())) {
      const input = JSON.parse(q.postData() || '{}').input || {};
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        id: 990019, number: 'P-2026-0019', status: 'nacrt', issuedOn: '2026-10-27', validUntil: '2026-11-26', version: 1, customer: input.customer, input,
      }) });
    }
    return r.abort();
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', process.env.CNC_USER);
  await page.fill('input[type=password]', process.env.CNC_PASS);
  await page.click('button:has-text("Prijavi se")');
  await page.waitForTimeout(3500);
  await page.goto(BASE + '#kalkulacija', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.selectOption('#clientSel', { index: 1 }).catch(() => {});
  const fill = async (sel, v) => { await page.fill(sel, ''); await page.type(sel, v); await page.press(sel, 'Tab'); };
  for (let i = 0; i < ITEMS.length; i++) {
    const it = ITEMS[i];
    if (i > 0) { await page.click('button:has-text("Nova stavka")'); await page.waitForTimeout(600); }
    if (it.shape) { await page.click(`button:has-text("${it.shape}")`).catch(() => {}); await page.waitForTimeout(300); }
    await fill('#f-part', it.part);
    await fill('#f-drawing', it.drawing);
    await fill('#qtyIn', it.qty);
  }
  await fill('#f-q-commercial-marginPct', '20');
  await page.waitForTimeout(600);
  await page.click('#printBtn');
  await page.waitForTimeout(1500);
  const ok = await page.evaluate(() => !!document.querySelector('#print .pq'));
  if (!ok) throw new Error('print view did not render');

  // invented company / customer details; then generic swaps for anything else
  await page.evaluate(({ C, K, SW }) => {
    const co = document.querySelector('#print .pq-head .co');
    co.innerHTML = `<b>${C.name}</b><div>${C.lines.join('<br>')}</div>`;
    const to = document.querySelector('#print .pq-to > div');
    to.innerHTML = `<span class="lbl">Kupac</span><b>${K.name}</b><div class="small">${K.lines.join('<br>')}</div>`;
    const foot = document.querySelector('#print .foot');
    if (foot) foot.textContent = `${C.name} · IBAN HR12 1234 5670 0000 0000 1`;
    const w = document.createTreeWalker(document.querySelector('#print'), NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) for (const [a, c] of SW) if (n.nodeValue.includes(a)) n.nodeValue = n.nodeValue.split(a).join(c);
    // show the document as an A4 sheet on screen
    const pr = document.querySelector('#print');
    pr.style.cssText = 'display:block;position:absolute;left:0;top:0;z-index:99999;width:794px;min-height:1123px;box-sizing:border-box;padding:56px 60px;background:#fff;';
    document.querySelectorAll('body > *:not(#print)').forEach((e) => (e.style.visibility = 'hidden'));
    window.scrollTo(0, 0);
  }, { C: COMPANY, K: CUSTOMER, SW: SWAP });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const text = await page.evaluate(() => document.querySelector('#print').innerText);
  console.log(text);
  await page.locator('#print').screenshot({ path: `${OUT}/quote-pdf.png` });
  const boxes = await page.evaluate(() => {
    const r2 = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const pr = document.querySelector('#print');
    return {
      sheet: r2(pr),
      head: r2(pr.querySelector('.pq-head')),
      to: r2(pr.querySelector('.pq-to')),
      thead: r2(pr.querySelector('table thead')),
      rows: [...pr.querySelectorAll('table:first-of-type tbody tr')].map(r2),
      tot: r2(pr.querySelector('.tot')),
      totLines: [...pr.querySelectorAll('.tot > div')].map(r2),
      rest: [...pr.querySelectorAll('h2, p, .foot')].map(r2),
    };
  });
  const L = JSON.parse(fs.readFileSync(LAYOUT, 'utf8'));
  L.pdf = boxes;
  fs.writeFileSync(LAYOUT, JSON.stringify(L, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})();
