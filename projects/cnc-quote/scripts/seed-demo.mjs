// Seed a LOCAL CNC.Quote instance (embedded PGlite, never production) with an invented demo company.
// Step 1 (server running): node scripts/seed-demo.mjs api   → company, user, settings, clients, quotes via the API
// Step 2 (server stopped):  node scripts/seed-demo.mjs db    → price history, fetch log, quote dates spread over 12 months
// Env: APP_DIR (cnc-kalkulator-ponude checkout), BASE (default http://127.0.0.1:3500/), DATA_DIR (local data dir)
import path from 'node:path';

const APP_DIR = process.env.APP_DIR || '/home/user/cnc-kalkulator-ponude';
const BASE = process.env.BASE || 'http://127.0.0.1:3500/';
export const DEMO_USER = { email: 'marko.horvat@primjer-metal.hr', password: 'Demo-lozinka-2026', name: 'Marko Horvat' };

// deterministic random
let seed = 20261030;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const between = (a, b, step = 1) => Math.round((a + rnd() * (b - a)) / step) * step;

const CLIENTS = [
  { name: 'Kovina Rijeka d.o.o.', oib: '98765432109', address: 'Riječka cesta 5, 51000 Rijeka', contact: 'Ivana Kos', email: 'nabava@kovina-primjer.hr', phone: '+385 51 555 0101' },
  { name: 'Tokarija Vuk d.o.o.', oib: '11223344556', address: 'Obrtnička 14, 42000 Varaždin', contact: 'Petar Vuk', email: 'petar@tokarija-primjer.hr', phone: '+385 42 555 0102' },
  { name: 'Alatnica Sava d.o.o.', oib: '22334455667', address: 'Savska 88, 10000 Zagreb', contact: 'Ana Babić', email: 'ana@alatnica-primjer.hr', phone: '+385 1 555 0103' },
  { name: 'Hidroteh Zagreb d.o.o.', oib: '33445566778', address: 'Radnička 21, 10000 Zagreb', contact: 'Luka Marić', email: 'luka@hidroteh-primjer.hr', phone: '+385 1 555 0104' },
  { name: 'Agrostroj Slavonija d.o.o.', oib: '44556677889', address: 'Industrijska zona 3, 31000 Osijek', contact: 'Josip Perić', email: 'nabava@agrostroj-primjer.hr', phone: '+385 31 555 0105' },
  { name: 'Brodomont Split d.o.o.', oib: '55667788990', address: 'Put brodogradilišta 7, 21000 Split', contact: 'Mia Jurić', email: 'mia@brodomont-primjer.hr', phone: '+385 21 555 0106' },
  { name: 'Mehatronika Alpe GmbH', oib: '', address: 'Industriestraße 9, 8020 Graz', contact: 'Stefan Huber', email: 's.huber@mehatronika-beispiel.at', phone: '+43 316 555 0107', lang: 'de' },
];

const PARTS = [
  ['Prirubnica', 'rod'], ['Vratilo', 'rod'], ['Čahura vodilice', 'rod'], ['Osovina', 'rod'], ['Adapter M30', 'hex'],
  ['Nosač senzora', 'box'], ['Ploča stezna', 'box'], ['Kućište ventila', 'box'], ['Poklopac', 'box'], ['Distancer', 'tube'],
  ['Zupčanik Z24', 'rod'], ['Klizna letva', 'box'], ['Spojnica', 'rod'], ['Matica specijalna', 'hex'], ['Ručica', 'box'],
];
const MATS = ['al-6082', 'al-6082', 'al-7075', 'al-5083', 'st-c45', 'st-s355', 'st-42crmo4', 'ss-14301', 'ss-14404', 'ms58', 'pl-pomc', 'pl-pa6'];

async function api() {
  const { blankQuote, blankItem } = await import(path.join(APP_DIR, 'public/js/quote.js'));
  const { DEFAULT_SETTINGS } = await import(path.join(APP_DIR, 'public/js/defaults.js'));
  let cookie = '';
  const req = async (method, url, body) => {
    const r = await fetch(BASE + url, { method, headers: { 'content-type': 'application/json', cookie }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie');
    if (sc) cookie = sc.split(';')[0];
    const t = await r.text();
    if (!r.ok) throw new Error(`${method} ${url} → ${r.status} ${t.slice(0, 200)}`);
    return t ? JSON.parse(t) : null;
  };
  let ok = false;
  for (const pw of [process.env.ADMIN_PASSWORD, 'Demo-admin-2026'].filter(Boolean)) {
    try { await req('POST', 'api/login', { email: 'admin@localhost.test', password: pw }); ok = true; break; } catch { /* next */ }
  }
  if (!ok) throw new Error('superadmin login failed');
  await req('POST', 'api/admin/companies', { name: 'Primjer Metal d.o.o.', adminEmail: DEMO_USER.email, adminName: DEMO_USER.name, adminPassword: DEMO_USER.password, maxUsers: 5 });
  await req('POST', 'api/logout');
  await req('POST', 'api/login', { email: DEMO_USER.email, password: DEMO_USER.password });

  const s = await req('GET', 'api/settings');
  s.company = { ...s.company, name: 'Primjer Metal d.o.o.', oib: '12345678901', address: 'Industrijska ulica 12, 10000 Zagreb', email: 'ured@primjer-metal.hr', phone: '+385 1 555 0100', iban: 'HR12 1234 5670 0000 0000 1', web: 'www.primjer-metal.hr' };
  s.machines = [
    { id: 'mill3', name: '3-osna glodalica', rate: 45 },
    { id: 'mill5', name: '5-osna glodalica', rate: 85 },
    { id: 'lathe', name: 'CNC tokarilica', rate: 40 },
    { id: 'lathe-live', name: 'Tokarilica s pogonjenim alatima', rate: 60 },
    { id: 'saw', name: 'Pila / priprema sirovca', rate: 28 },
  ];
  await req('PUT', 'api/settings', s);

  const clients = [];
  for (const c of CLIENTS) clients.push(await req('POST', 'api/clients', c));

  const settings = { ...DEFAULT_SETTINGS, ...s };
  const statuses = ['prihvaćeno', 'prihvaćeno', 'poslano', 'poslano', 'odbijeno', 'nacrt', 'prihvaćeno'];
  const created = [];
  for (let n = 0; n < 26; n++) {
    const cl = pick(clients);
    const q = blankQuote(settings);
    q.clientId = cl.id; q.customer = cl.name; q.lang = cl.lang || 'hr';
    q.deliveryWeeks = pick([2, 2, 3, 4]);
    q.commercial.marginPct = pick([15, 18, 20, 22, 25]);
    const items = [];
    const nItems = pick([1, 1, 2, 2, 3, 4]);
    for (let i = 0; i < nItems; i++) {
      const [part, mode] = pick(PARTS);
      const it = blankItem(settings);
      it.part = part === 'Prirubnica' ? `Prirubnica Ø${between(50, 120, 10)}` : part === 'Vratilo' ? `Vratilo Ø${between(20, 60, 5)}` : part;
      it.drawing = `${part.slice(0, 2).toUpperCase().replace('Č', 'C').replace('Ž', 'Z')}-${between(100, 999)}-${String(between(1, 9)).padStart(2, '0')}`;
      it.qty = pick([1, 2, 5, 10, 10, 20, 25, 50, 100, 250]);
      it.material.id = pick(MATS);
      it.material.mode = mode;
      it.material.dims = mode === 'box'
        ? { ...it.material.dims, L: between(60, 300, 5), W: between(30, 150, 5), H: between(10, 60, 5) }
        : mode === 'tube' ? { ...it.material.dims, D: between(30, 90, 5), d: between(15, 25, 5), L: between(20, 120, 5) }
          : mode === 'hex' ? { ...it.material.dims, S: between(24, 50, 2), L: between(30, 120, 5) }
            : { ...it.material.dims, D: between(25, 130, 5), L: between(40, 300, 5) };
      const lathe = mode !== 'box';
      it.ops = [{ ...it.ops[0], machineId: lathe ? 'lathe' : pick(['mill3', 'mill3', 'mill5']), rate: lathe ? 40 : 45, cycleMin: between(4, 35), setups: pick([1, 2, 2, 3]), setupH: pick([0.5, 0.75, 1]) }];
      it.programming.hours = pick([0.5, 1, 1.5, 2]);
      items.push(it);
    }
    q.items = items; q.active = 0;
    const saved = await req('POST', 'api/quotes', { input: q });
    const st = pick(statuses);
    if (st !== 'nacrt') await req('PUT', `api/quotes/${saved.id}`, { status: st });
    created.push(saved.id);
  }
  console.log(`company + ${clients.length} clients + ${created.length} quotes`);
}

async function dbStep() {
  const { PGlite } = await import(path.join(APP_DIR, 'node_modules/@electric-sql/pglite/dist/index.js'));
  const db = new PGlite(path.join(process.env.DATA_DIR, 'pglite'));
  // 26.–27. 10. 2026 public market values (Westmetall LME cash / ECB), random-walk history back 150 days
  const END = { AL: 3048, CU: 14500, NI: 15535, SN: 50925, ZN: 3900, MS58: 1244, EURUSD: 1.1188 };
  const VOL = { AL: 0.009, CU: 0.011, NI: 0.013, SN: 0.014, ZN: 0.012, MS58: 0.006, EURUSD: 0.003 };
  const today = new Date('2026-10-29T12:00:00Z');
  const days = [];
  for (let d = 150; d >= 0; d--) { const t = new Date(today.getTime() - d * 86400000); if (t.getUTCDay() % 6) days.push(t.toISOString().slice(0, 10)); }
  await db.query('DELETE FROM index_values');
  for (const [key, end] of Object.entries(END)) {
    // smooth random walk (AR(1) drift) so the sparklines read as market trends, not noise
    let v = end, drift = 0;
    const vals = [];
    for (let i = days.length - 1; i >= 0; i--) { vals[i] = v; drift = 0.85 * drift + 0.15 * (rnd() - 0.5) * 2 * VOL[key]; v = v / (1 + drift + 0.0003); }
    for (let i = 0; i < days.length; i++) {
      await db.query(`INSERT INTO index_values (key, date, value, unit, source, fetched_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        [key, days[i], key === 'EURUSD' ? +vals[i].toFixed(4) : Math.round(vals[i] * 2) / 2, key === 'EURUSD' ? 'USD' : key === 'MS58' ? 'EUR/100kg' : 'USD/t', key === 'EURUSD' ? 'ecb' : 'westmetall', `${days[i]}T10:52:00Z`]);
    }
  }
  await db.query('DELETE FROM fetch_log');
  const now = new Date().toISOString();
  for (const s of ['westmetall', 'ecb']) await db.query('INSERT INTO fetch_log (source, at, ok, message) VALUES ($1,$2,TRUE,$3)', [s, now, 'demo']);

  // spread quotes over the last 12 months (more recent = denser), renumber per year in date order
  const { rows } = await db.query('SELECT id FROM quotes ORDER BY id');
  const dates = rows.map((_, i) => {
    const back = Math.floor(Math.pow(rnd(), 1.6) * 330) + 1;
    return new Date(today.getTime() - back * 86400000).toISOString().slice(0, 10);
  }).sort();
  const counters = {};
  for (let i = 0; i < rows.length; i++) {
    const d = dates[i];
    const y = d.slice(0, 4);
    counters[y] = (counters[y] || 0) + 1;
    const valid = new Date(new Date(`${d}T12:00:00Z`).getTime() + 30 * 86400000).toISOString().slice(0, 10);
    await db.query(`UPDATE quotes SET number=$2, issued_on=$3, valid_until=$4, created_at=$5, updated_at=$5, status_changed_at=$5 WHERE id=$1`,
      [rows[i].id, `P-${y}-${String(counters[y]).padStart(4, '0')}`, d, valid, `${d}T09:${String(10 + (i % 40)).padStart(2, '0')}:00Z`]);
  }
  await db.query('DELETE FROM quote_counters');
  for (const [y, n] of Object.entries(counters)) await db.query('INSERT INTO quote_counters (company_id, year, last) SELECT id, $1, $2 FROM companies WHERE slug IS NOT NULL LIMIT 1', [+y, n]);
  await db.close();
  console.log(`prices for ${days.length} days, ${rows.length} quotes dated`, counters);
}

const step = process.argv[2];
if (step === 'api') await api();
else if (step === 'db') await dbStep();
else console.log('usage: seed-demo.mjs api|db');
