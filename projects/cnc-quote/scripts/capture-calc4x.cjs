// 4x captures from the Kalkulacija page: the quantity card (row-embed close-up) and the right-column
// cards used in the outro. Tall viewport so nothing is cut off. Same read-only rules and swaps as capture.cjs.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const BASE = 'https://cnc-kalkulator-ponude-production.up.railway.app/';
const OUT = path.join(__dirname, '../public/textures');
const SWAP = process.env.CNC_SWAP_FILE ? JSON.parse(fs.readFileSync(process.env.CNC_SWAP_FILE, 'utf8')) : [];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 2400 }, deviceScaleFactor: 4 });
  const page = await ctx.newPage();
  await page.route('**/*', (r) => { const q = r.request(); if (q.method() !== 'GET' && q.method() !== 'HEAD' && !q.url().endsWith('/api/login')) return r.abort(); return r.continue(); });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', process.env.CNC_USER);
  await page.fill('input[type=password]', process.env.CNC_PASS);
  await page.click('button:has-text("Prijavi se")');
  await page.waitForTimeout(3500);
  await page.goto(BASE + '#kalkulacija', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const swap = () => page.evaluate((sw) => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) for (const [a, c] of sw) if (n.nodeValue.includes(a)) n.nodeValue = n.nodeValue.split(a).join(c);
    document.querySelectorAll('option').forEach((o) => { for (const [a, c] of sw) if (o.text.includes(a)) o.text = o.text.split(a).join(c); });
  }, SWAP);
  await swap();
  await page.selectOption('#clientSel', { index: 1 }).catch(() => {});
  const fill = async (sel, v) => { await page.fill(sel, ''); await page.type(sel, v); await page.press(sel, 'Tab'); };
  await fill('#f-part', 'Nosač senzora');
  await fill('#f-drawing', 'NS-1042');
  await fill('#f-q-commercial-marginPct', '20');
  await page.waitForTimeout(800);
  await swap();
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.mouse.click(1800, 2390);
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(2, 2390);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/calc-qty-4x.png`, clip: { x: 1160, y: 870, width: 450, height: 450 } });
  const cards = page.locator('.calc .card');
  for (let i = 0; i < (await cards.count()); i++) {
    const t = (await cards.nth(i).innerText()).trim();
    if (t.startsWith('Struktura')) await cards.nth(i).screenshot({ path: `${OUT}/el-structure.png` });
    if (t.startsWith('Cijena prema')) await cards.nth(i).screenshot({ path: `${OUT}/el-qty.png` });
  }
  await page.locator('section.tb').screenshot({ path: `${OUT}/el-price.png` });
  await b.close();
})();
