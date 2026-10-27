// 4x texture of the top of the Materijali page (crane close-up) + cell boxes of the tracked row.
// Same read-only rules and data swaps as capture.cjs.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const BASE = 'https://cnc-kalkulator-ponude-production.up.railway.app/';
const OUT = path.join(__dirname, '../public/textures');
const LAYOUT = path.join(__dirname, '../src/layout.json');
const SWAP = process.env.CNC_SWAP_FILE ? JSON.parse(fs.readFileSync(process.env.CNC_SWAP_FILE, 'utf8')) : [];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1100 }, deviceScaleFactor: 4 });
  const page = await ctx.newPage();
  await page.route('**/*', (r) => { const q = r.request(); if (q.method() !== 'GET' && q.method() !== 'HEAD' && !q.url().endsWith('/api/login')) return r.abort(); return r.continue(); });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', process.env.CNC_USER);
  await page.fill('input[type=password]', process.env.CNC_PASS);
  await page.click('button:has-text("Prijavi se")');
  await page.waitForTimeout(3500);
  await page.goto(BASE + '#materijali', { waitUntil: 'networkidle' });
  await page.evaluate((swap) => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) for (const [a, c] of swap) if (n.nodeValue.includes(a)) n.nodeValue = n.nodeValue.split(a).join(c);
  }, SWAP);
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(2, 1090);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/materials-top-4x.png`, clip: { x: 0, y: 0, width: 1920, height: 1100 } });
  const cells = await page.evaluate(() => {
    const tr = [...document.querySelectorAll('#matTable tbody tr')].find((t) => t.innerText.includes('EN AW-6082 T6'));
    return [...tr.querySelectorAll('td')].map((td) => { const r = td.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), text: td.innerText.replace(/\s+/g, ' ').slice(0, 30) }; });
  });
  const L = JSON.parse(fs.readFileSync(LAYOUT, 'utf8'));
  L.materials.trackCells = cells;
  fs.writeFileSync(LAYOUT, JSON.stringify(L, null, 1));
  console.log(cells);
  await b.close();
})();
