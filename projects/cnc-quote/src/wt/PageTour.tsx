// bottom-push-stack-wipe (port of demos/transition/bottom-push-stack-wipe/BottomPushStackWipe.tsx) as a
// tour of every CNC.Quote page. Each chapter is a full-screen brand-colour field (lit top-left, pressed
// bottom-right) with eyebrow + 2-line headline + one line on the left and the REAL page as a window card on
// the right; the next chapter pushes the old one out with the heavy ease-out (26f), a 56px contact shadow
// and a 2px lit edge; the stack gets vertical speed blur. In-chapter events wait for the push to land.
// Chapter 0 arrives on a cut; 4 pushes (card limit 2–4), each on a beat (3 beats apart).
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, Grain, SpeedBlur, bezier, mix, ramp, softShadow, velocity } from '../lib/Polish';
import { C, FONT, Logo, rgba, wdth } from '../lib/Brand';
import W from '../walkthrough.json';

const H = 1080;
const PUSH_DUR = 26;
const heavyEaseOut = bezier(0.12, 0.9, 0.2, 1);

type Box = { x: number; y: number; w: number; h: number };
type Chapter = {
  key: keyof typeof W.pages; num: string; name: string; title: string; sub: string;
  hi: string; base: string; lo: string; shade: string; ink: string; ink2: string;
  event: 'row' | 'chart' | 'rows' | 'cards' | 'ring';
};
const CHAPTERS: Chapter[] = [
  { key: 'ponude', num: '01', name: 'Ponude', title: 'Sve ponude,\njedan popis.', sub: 'Traži po broju, kupcu, dijelu ili crtežu. Status jednim klikom.',
    hi: '#1c2b3b', base: '#0f1922', lo: '#0a1118', shade: '#000000', ink: '#eef3f7', ink2: 'rgba(230,237,242,0.68)', event: 'row' },
  { key: 'statistika', num: '02', name: 'Statistika', title: 'Koliko nudite.\nKoliko dobijete.', sub: 'Vrijednost po mjesecu, uspješnost i ponude koje čekaju odgovor.',
    hi: '#4565ff', base: '#2f4bd8', lo: '#2138c0', shade: '#0a1670', ink: '#ffffff', ink2: 'rgba(255,255,255,0.8)', event: 'chart' },
  { key: 'klijenti', num: '03', name: 'Klijenti', title: 'Svaki kupac,\nsvoji uvjeti.', sub: 'Kontakt, OIB, rabat i jezik ponude: hrvatski, njemački ili engleski.',
    hi: '#f6f8fa', base: '#e3e8ee', lo: '#d0d8e0', shade: '#5a6b7c', ink: '#122130', ink2: 'rgba(18,33,48,0.66)', event: 'rows' },
  { key: 'materijali', num: '04', name: 'Materijali i cijene', title: 'Cijene metala,\nsvaki radni dan.', sub: 'LME i ECB stižu sami, a za ostalo vrijedi vaš cjenik dobavljača.',
    hi: '#4a5a69', base: '#3b4a58', lo: '#2c3945', shade: '#0b1218', ink: '#ffffff', ink2: 'rgba(255,255,255,0.74)', event: 'cards' },
  { key: 'postavke', num: '05', name: 'Postavke', title: 'Vaša radionica,\nvaše satnice.', sub: 'Strojevi, satnice, marže, PDV i podaci tvrtke na svakoj ponudi.',
    hi: '#4565ff', base: '#2f4bd8', lo: '#2138c0', shade: '#0a1670', ink: '#ffffff', ink2: 'rgba(255,255,255,0.8)', event: 'ring' },
];

// window card: page crop x 300–1620, y 0–880 (css px), shown 1040 px wide
const CROP = { x: 300, y: 0, w: 1320, h: 880 };
const CARD_W = 1040;
const K = CARD_W / CROP.w;
const CARD_H = CROP.h * K;

export const BEAT = 30 * 60 / 124.0;
export const PUSH_STARTS = [3, 6, 9, 12].map((b) => b * BEAT - 4); // push lands ~4f after the beat begins → contact on the beat
export const PAGE_TOUR_DURATION = Math.round(15 * BEAT);
const pushP = (f: number, i: number) => ramp(f, PUSH_STARTS[i], PUSH_DUR, heavyEaseOut);
const landAt = (i: number) => (i === 0 ? 0 : PUSH_STARTS[i - 1] + 12);
const stackY = (f: number) => PUSH_STARTS.reduce((acc, _, i) => acc + pushP(f, i) * H, 0);

const lines = (t: string) => t.split('\n');

const Event: React.FC<{ c: Chapter; i: number; f: number }> = ({ c, i, f }) => {
  const t0 = landAt(i) + 14;
  const P = W.pages[c.key] as { rows: Box[]; cards: Box[]; chart: Box | null };
  const wash = (b: Box, start: number, r = 6) => {
    const p = ramp(f, start, 22, EASE.out);
    const op = Math.min(1, ramp(f, start, 3, EASE.linear)) * (1 - ramp(f, start + 10, 20, EASE.out));
    if (f < start || op <= 0.002) return null;
    const head = mix(-0.2, 1.1, p);
    return <div key={`${b.x}-${b.y}`} style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: r, opacity: op,
      background: `linear-gradient(90deg, ${rgba(C.dykem, 0.03)} 0%, ${rgba(C.dykem, 0.16)} ${(head * 100).toFixed(1)}%, ${rgba(C.dykem, 0)} ${((head + 0.25) * 100).toFixed(1)}%)`,
      boxShadow: `inset 0 0 0 1.5px ${rgba(C.dykem, 0.28)}` }} />;
  };
  if (c.event === 'row' && P.rows[0]) return wash(P.rows[0], t0);
  if (c.event === 'rows') return <>{P.rows.slice(0, 7).map((r, k) => wash(r, t0 + k * 3))}</>;
  if (c.event === 'cards') return <>{P.cards.slice(0, 7).map((r, k) => wash(r, t0 + k * 3, 12))}</>;
  if (c.event === 'chart' && P.chart) {
    // bars regrow: a white patch over the plot area lifts from the baseline upward
    const ch = P.chart;
    const g = f < landAt(i) ? 0 : ramp(f, t0 - 6, 22, EASE.swift);
    if (g >= 1) return null;
    return <div style={{ position: 'absolute', left: ch.x + 40, top: ch.y, width: ch.w - 40, height: (ch.h - 26) * (1 - g), background: '#ffffff' }} />;
  }
  if (c.event === 'ring') {
    const b = { x: 334, y: 312, w: 306, h: 204 }; // "Radionica" theme card (selected)
    const p = ramp(f, t0, 18, EASE.out);
    if (f < t0) return null;
    return <div style={{ position: 'absolute', left: b.x - 6 * (1 - p), top: b.y - 6 * (1 - p), width: b.w + 12 * (1 - p), height: b.h + 12 * (1 - p), borderRadius: 14,
      boxShadow: `0 0 0 ${2 + 6 * (1 - p)}px ${rgba(C.dykem, 0.6 * (1 - p) + 0.25)}`, opacity: 1 - ramp(f, t0 + 26, 16, EASE.out) }} />;
  }
  return null;
};

const ChapterScene: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const c = CHAPTERS[i];
  const land = landAt(i);
  const lit = c.ink === '#ffffff' || c.ink === '#eef3f7';
  return (
    <AbsoluteFill style={{ background: `linear-gradient(176deg, ${c.hi} 0%, ${c.base} 44%, ${c.lo} 100%)`, overflow: 'hidden', fontFamily: FONT }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 62% 70% at 18% 6%, rgba(255,255,255,${lit ? 0.14 : 0.5}) 0%, rgba(255,255,255,0) 70%), radial-gradient(ellipse 70% 70% at 100% 100%, ${rgba(c.shade, 0.3)} 0%, ${rgba(c.shade, 0)} 70%)` }} />
      {/* eyebrow */}
      <div style={{ position: 'absolute', left: 110, top: 190, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ height: 46, padding: '0 16px', borderRadius: 23, display: 'flex', alignItems: 'center', boxShadow: `inset 0 0 0 2px ${rgba(lit ? '#ffffff' : C.ink, 0.5)}`, color: c.ink, fontSize: 26, fontWeight: 700 }}>{c.num}</div>
        <div style={{ fontSize: 32, fontWeight: 650, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.ink }}>{c.name}</div>
      </div>
      {/* headline: lines rise from below a mask once the push has landed */}
      <div style={{ position: 'absolute', left: 106, top: 290, width: 680, color: c.ink, fontSize: 104, fontWeight: 760, ...wdth(72), lineHeight: 1.0, letterSpacing: '-0.01em' }}>
        {lines(c.title).map((l, k) => {
          const p = ramp(f, land + k * 5, 18, EASE.snappy);
          return <div key={k} style={{ overflow: 'hidden', padding: '0.04em 0 0.14em', margin: '-0.04em 0 -0.14em' }}><div style={{ transform: `translateY(${((1 - p) * 110).toFixed(1)}%)` }}>{l}</div></div>;
        })}
      </div>
      <div style={{ position: 'absolute', left: 110, top: 540, width: 600, fontSize: 38, fontWeight: 500, lineHeight: 1.3, color: c.ink2,
        opacity: ramp(f, land + 8, 14, EASE.out), transform: `translateY(${((1 - ramp(f, land + 8, 16, EASE.snappy)) * 18).toFixed(1)}px)` }}>{c.sub}</div>
      {/* footer: logo + chapter ticks */}
      <div style={{ position: 'absolute', left: 110, bottom: 92, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Logo size={40} />
        <span style={{ fontSize: 34, fontWeight: 700, ...wdth(80), color: c.ink }}>CNC<span style={{ color: C.cyan }}>.</span>Quote</span>
        <div style={{ display: 'flex', gap: 10, marginLeft: 28 }}>
          {CHAPTERS.map((_, k) => <div key={k} style={{ width: k === i ? 60 : 26, height: 8, borderRadius: 4, background: c.ink, opacity: k === i ? 0.95 : 0.28 }} />)}
        </div>
      </div>
      {/* the real page, pinned as a window card */}
      <div style={{ position: 'absolute', right: 96, top: (H - CARD_H) / 2, width: CARD_W, height: CARD_H, borderRadius: 18, overflow: 'hidden', background: C.paper,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), ${softShadow(48, { color: c.shade, strength: 1.5 })}` }}>
        <div style={{ position: 'absolute', left: -CROP.x * K, top: -CROP.y * K, width: 1920, height: 1080, transform: `scale(${K})`, transformOrigin: '0 0' }}>
          <Img src={staticFile(`textures/wt/page-${c.key}.png`)} style={{ position: 'absolute', width: 1920, height: 1080 }} />
          <Event c={c} i={i} f={f} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const PageTour: React.FC = () => {
  const f = useCurrentFrame();
  const progress = PUSH_STARTS.map((_, i) => pushP(f, i));
  const vy = -velocity(stackY, f);
  const settle = 1 + 0.015 * ramp(f, PUSH_STARTS[3] + 30, 40, EASE.smooth);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: CHAPTERS[0].base }}>
      <AbsoluteFill style={{ transform: `scale(${settle.toFixed(4)})` }}>
        <SpeedBlur vx={0} vy={vy} amount={0.1} max={22}>
          {CHAPTERS.map((_, i) => {
            const pushedIn = i === 0 ? 1 : progress[i - 1];
            const pushedOut = i < CHAPTERS.length - 1 ? progress[i] : 0;
            const y = (1 - pushedIn) * H - pushedOut * H;
            if (y <= -H || y >= H) return null;
            const moving = pushedIn < 1;
            return (
              <AbsoluteFill key={i} style={{ transform: `translateY(${y.toFixed(2)}px)` }}>
                <ChapterScene i={i} f={f} />
                {i > 0 && moving ? (
                  <>
                    <div style={{ position: 'absolute', top: -56, left: 0, right: 0, height: 56, background: `linear-gradient(to top, ${rgba(CHAPTERS[i].shade, 0.42)}, ${rgba(CHAPTERS[i].shade, 0.12)} 40%, ${rgba(CHAPTERS[i].shade, 0)})` }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.45)' }} />
                  </>
                ) : null}
              </AbsoluteFill>
            );
          })}
        </SpeedBlur>
      </AbsoluteFill>
      <Grain opacity={0.05} blend="overlay" />
    </AbsoluteFill>
  );
};
