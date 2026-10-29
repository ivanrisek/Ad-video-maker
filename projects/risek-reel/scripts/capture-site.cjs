// Deterministic 30fps capture of risek-technology.com (mobile 432x768 @2.5x = 1080x1920).
// Time is virtual: JS timers via page.clock, CSS/Web animations and <video> are paused and stepped per frame.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2] || 'cap/frames';
const LIMIT = +(process.argv[3] || 1e9);
const FPS = 30, DT = 1000 / FPS;
fs.mkdirSync(OUT, { recursive: true });

// glide: ease in over the first 15%, constant speed, ease out over the last 15% (C1-continuous)
const glide = (t, a = 0.15) => { const v = 1 / (1 - a); if (t < a) return (v * t * t) / (2 * a); if (t > 1 - a) { const u = 1 - t; return 1 - (v * u * u) / (2 * a); } return v * (t - a / 2); };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // in-out cubic
const PLAN = JSON.parse(fs.readFileSync(process.argv[4] || 'plan.json', 'utf8'));

(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] });
  const ctx = await b.newContext({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto('https://risek-technology.com', { waitUntil: 'networkidle', timeout: 90000 });
  await p.waitForTimeout(1200);
  await p.getByText(/discover/i).first().click();
  await p.waitForTimeout(6000); // let the site's own intro finish in real time
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.body.style.scrollBehavior = 'auto'; window.scrollTo({ top: 0, behavior: 'instant' }); });
  await p.waitForTimeout(500);
  await p.evaluate(() => { window.__realTimeout = window.setTimeout.bind(window); });
  await p.clock.install();
  await p.evaluate(() => {
    const t = document.createElement('div'); t.id = '__touch';
    t.style.cssText = 'position:fixed;left:0;top:0;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:99px;background:rgba(255,255,255,.38);border:2px solid rgba(255,255,255,.75);box-shadow:0 0 18px rgba(150,195,255,.6);z-index:2147483647;pointer-events:none;opacity:0';
    const r = document.createElement('div'); r.id = '__ring';
    r.style.cssText = 'position:fixed;left:0;top:0;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:999px;border:2px solid rgba(190,215,255,.9);z-index:2147483647;pointer-events:none;opacity:0';
    document.body.append(t, r);
    window.__step = async (dt) => {
      for (const a of document.getAnimations()) {
        if (!a.__tr) { a.__tr = true; a.__run = a.playState === 'running'; try { a.pause(); } catch (e) {} }
        if (a.__run) { try { a.currentTime = (a.currentTime || 0) + dt; } catch (e) {} }
      }
      const seeks = [];
      for (const v of document.querySelectorAll('video')) {
        if (!v.__tr) { v.__tr = true; v.__t = v.currentTime || 0; }
        if (!v.paused) v.pause();
        v.__t += dt / 1000;
        const r = v.getBoundingClientRect();
        const vis = r.bottom > -50 && r.top < innerHeight + 50 && r.width > 0 && getComputedStyle(v).visibility !== 'hidden';
        if (vis && v.duration > 0 && isFinite(v.duration)) {
          const t = v.__t % v.duration;
          if (Math.abs(v.currentTime - t) > 0.001) {
            seeks.push(new Promise((res) => { const done = () => { v.removeEventListener('seeked', done); res(); }; v.addEventListener('seeked', done); window.__realTimeout(res, 400); }));
            v.currentTime = t;
          }
        }
      }
      await Promise.race([Promise.all(seeks), new Promise((r) => window.__realTimeout(r, 600))]);
    };
  });
  // keep a real timeout reference for the seek guard (clock fakes setTimeout)
  await p.evaluate(() => {});

  const vh = 768;
  let frame = 0, scrollY = 0, modalY = 0;
  const shot = async () => {
    await p.clock.runFor(DT);
    await p.evaluate((dt) => window.__step(dt), DT);
    await p.screenshot({ path: `${OUT}/${String(frame).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
    frame++;
    if (frame >= LIMIT) { await b.close(); process.exit(0); }
  };
  const setScroll = (y) => p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
  const setModal = (y) => p.evaluate((y) => { const d = document.querySelector('#projModal .proj-dialog'); if (d) d.scrollTop = y; }, y);
  const touch = (x, y, o, rs, ro) => p.evaluate(([x, y, o, rs, ro]) => {
    const t = document.getElementById('__touch'), r = document.getElementById('__ring');
    t.style.left = r.style.left = x + 'px'; t.style.top = r.style.top = y + 'px';
    t.style.opacity = o; t.style.transform = `scale(${1 + (1 - o) * 0.5})`;
    r.style.opacity = ro; r.style.transform = `scale(${rs})`;
  }, [x, y, o, rs, ro]);
  const log = [];

  for (const s of PLAN) {
    log.push({ frame, ...s });
    if (s.hold) { for (let i = 0; i < s.hold; i++) await shot(); }
    else if (s.scroll !== undefined) {
      // selector targets are re-measured every frame: the page's sticky story section changes layout while scrolling
      const target = async () => typeof s.scroll === 'number' ? s.scroll : p.evaluate(([sel, off, nth]) => { const e = document.querySelectorAll(sel)[nth || 0]; return Math.max(0, Math.round(e.getBoundingClientRect().top + window.scrollY - off)); }, [s.scroll, s.offset || 0, s.nth || 0]);
      const from = scrollY;
      let to = await target();
      for (let i = 1; i <= s.dur; i++) {
        to = await target();
        scrollY = from + (to - from) * (s.ease === 'glide' ? glide(i / s.dur) : ease(i / s.dur));
        await setScroll(scrollY); await shot();
      }
      scrollY = to; await setScroll(scrollY);
    } else if (s.modalScroll !== undefined) {
      let to = s.modalScroll;
      if (to === 'end') to = await p.evaluate(() => { const d = document.querySelector('#projModal .proj-dialog'); return d.scrollHeight - d.clientHeight; });
      const from = modalY;
      for (let i = 1; i <= s.dur; i++) { modalY = from + (to - from) * ease(i / s.dur); await setModal(modalY); await shot(); }
      modalY = to;
    } else if (s.tap) {
      // s.tap: css selector (+ nth); finger comes in over s.pre frames, taps, ring expands over s.post frames
      const pt = await p.evaluate(([sel, nth]) => { const e = document.querySelectorAll(sel)[nth || 0]; const r = e.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 70), y: r.top + r.height / 2 }; }, [s.tap, s.nth]);
      const pre = s.pre || 9, post = s.post || 14;
      for (let i = 1; i <= pre; i++) { const k = i / pre; await touch(pt.x, pt.y, 0.9 * (1 - Math.pow(1 - k, 3)), 0.2, 0); await shot(); }
      await p.evaluate(([sel, nth]) => document.querySelectorAll(sel)[nth || 0].click(), [s.tap, s.nth]);
      if (s.resetModal) { modalY = 0; await setModal(0); }
      for (let i = 1; i <= post; i++) { const k = i / post; await touch(pt.x, pt.y, 0.9 * (1 - k), 0.2 + 0.9 * (1 - Math.pow(1 - k, 3)), 0.85 * (1 - k)); await shot(); }
      await touch(0, 0, 0, 0, 0);
    }
  }
  fs.writeFileSync(`${OUT}/../log.json`, JSON.stringify(log, null, 1));
  console.log('frames', frame);
  await b.close();
})().catch((e) => { console.error('ERR', e.stack); process.exit(1); });
