// document-typewriter-reveal on the app's own printed quote ("Ispiši / PDF"), port of
// demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal.tsx:
// the A4 quote floats on the navy stage (rounded sheet, hairline edge, cobalt backlight, long shadow);
// its blocks are "written" two by two (white mask anchored right shrinks left→right, ONE cobalt caret
// riding the reveal edge), while a monotone-Hermite camera pulls back from a tilted close-up of the
// header to the whole sheet. Tail event (replaces the card's history-list drop, which has no
// counterpart here): the grand total gets a cobalt multiply wash, then a long readable hold.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, rgba } from '../lib/Brand';
import { Grain } from '../lib/Polish';
import layout from '../layout.json';

export const PDF_REVEAL_DURATION = 116;
const P = layout.pdf!;
const W = P.sheet.w, H = P.sheet.h;
const PAPER = '#ffffff';
type B = { x: number; y: number; w: number; h: number };
const half = (b: B, side: 'l' | 'r', split = 0.5): B =>
  side === 'l' ? { ...b, w: b.w * split } : { ...b, x: b.x + b.w * split, w: b.w * (1 - split) };
// blocks in reading order, written two at a time
const BLOCKS: B[] = [
  half(P.head, 'l', 0.55), half(P.head, 'r', 0.55),
  half(P.to, 'l', 0.6), half(P.to, 'r', 0.6),
  P.thead, P.rows[0],
  P.rows[1], P.rows[2],
  P.totLines[0], P.totLines[1],
  P.totLines[2], P.rest[0],
  P.rest[1], P.rest[2],
];
const WIPE = 9;
const cueFor = (i: number) => 8 + Math.floor(i / 2) * 6;
const REVEAL_EASE = Easing.bezier(0.4, 0, 0.6, 1);
const TOTAL = P.totLines[2];
const TOT_CUE = 64;

type Cam = { cx: number; cy: number; zoom: number; rotX: number; rotY: number };
const ANCHORS: (Cam & { frame: number })[] = [
  { frame: 0, cx: 300, cy: 150, zoom: 1.6, rotX: 8, rotY: -18 },
  { frame: 26, cx: 350, cy: 300, zoom: 1.25, rotX: 6, rotY: -12 },
  { frame: 64, cx: W / 2, cy: 400, zoom: 1.1, rotX: 3, rotY: -5 },
  { frame: 116, cx: W / 2, cy: 400, zoom: 1.13, rotX: 3, rotY: -3 },
];
const KEYS: (keyof Cam)[] = ['cx', 'cy', 'zoom', 'rotX', 'rotY'];
const hermite = (xs: number[], ys: number[]) => {
  const n = xs.length;
  const d = xs.slice(0, -1).map((x, i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - x));
  const m = xs.map((_, i) => (i === 0 || i === n - 1 ? 0 : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
    if (h > 9) { const k = 3 / Math.sqrt(h); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
};
const CURVES = Object.fromEntries(KEYS.map((k) => [k, hermite(ANCHORS.map((a) => a.frame), ANCHORS.map((a) => a[k]))])) as Record<keyof Cam, (x: number) => number>;
const camAt = (f: number) => Object.fromEntries(KEYS.map((k) => [k, CURVES[k](f)])) as Cam;
const PERSP = 2200;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const PdfReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camAt(frame);
  let caretIdx = -1;
  BLOCKS.forEach((_, i) => { if (frame >= cueFor(i) && frame <= cueFor(i) + WIPE + 2) caretIdx = i; });
  const idleBlink = frame < cueFor(0) ? (Math.floor(frame / 4) % 2 === 0 ? 1 : 0.25) : 0;
  const totWash = interpolate(frame, [TOT_CUE, TOT_CUE + 8], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  return (
    <AbsoluteFill style={{ background: C.bar, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 60% at 50% 40%, ${rgba(C.dykem, 0.28)} 0%, ${rgba(C.dykem, 0)} 70%)` }} />
      <div style={{ position: 'absolute', inset: 0, perspective: `${(PERSP * cam.zoom).toFixed(2)}px`, perspectiveOrigin: '960px 540px' }}>
        <div style={{
          position: 'absolute', width: W, height: H, zoom: cam.zoom,
          transform: `translate(${(960 / cam.zoom - cam.cx).toFixed(3)}px, ${(540 / cam.zoom - cam.cy).toFixed(3)}px) rotateY(${cam.rotY.toFixed(3)}deg) rotateX(${cam.rotX.toFixed(3)}deg)`,
          transformOrigin: `${cam.cx.toFixed(2)}px ${cam.cy.toFixed(2)}px`, transformStyle: 'preserve-3d',
        }}>
          {/* cobalt backlight behind the sheet */}
          <div style={{ position: 'absolute', left: -200, top: -160, width: W + 400, height: H + 320, transform: 'translateZ(-40px)',
            background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(C.dykem, 0.45)} 0%, ${rgba(C.cyan, 0.08)} 55%, transparent 72%)` }} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, borderRadius: 10, overflow: 'hidden', background: PAPER,
            boxShadow: `0 0 0 1.5px rgba(255,255,255,0.35), 0 70px 160px -20px rgba(0,0,0,0.85), 0 20px 60px rgba(0,0,0,0.5)` }}>
            <Img src={staticFile('textures/quote-pdf.png')} style={{ position: 'absolute', width: W, height: H }} />
            {totWash > 0 ? (
              <div style={{ position: 'absolute', left: TOTAL.x - 6, top: TOTAL.y + 2, width: (TOTAL.w + 12) * totWash, height: TOTAL.h - 2, borderRadius: 5, background: rgba(C.dykem, 0.16), mixBlendMode: 'multiply' }} />
            ) : null}
            {BLOCKS.map((b, i) => {
              const cue = cueFor(i);
              const cover = interpolate(frame, [cue, cue + WIPE], [1, 0], { ...clamp, easing: REVEAL_EASE });
              const bx = b.x - 4, by = b.y - 2, bw = b.w + 8, bh = b.h + 4;
              const caretH = Math.min(24, b.h - 4);
              return (
                <React.Fragment key={i}>
                  {cover > 0 ? (
                    <div style={{ position: 'absolute', left: bx, top: by, width: bw, height: bh, overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${cover * 100}%`, background: PAPER }} />
                    </div>
                  ) : null}
                  {i === caretIdx ? (
                    <div style={{ position: 'absolute', left: bx + bw * (1 - cover), top: b.y + Math.max(2, (Math.min(b.h, 30) - caretH) / 2), width: 3, height: caretH, background: C.dykem, borderRadius: 2,
                      boxShadow: `0 0 8px ${rgba(C.dykem, 0.6)}, 0 0 18px ${rgba(C.dykem, 0.35)}`,
                      opacity: cover > 0 ? 1 : interpolate(frame, [cue + WIPE, cue + WIPE + 2], [1, 0], clamp) }} />
                  ) : null}
                </React.Fragment>
              );
            })}
            {idleBlink > 0 ? <div style={{ position: 'absolute', left: BLOCKS[0].x - 4, top: BLOCKS[0].y + 4, width: 3, height: 24, background: C.dykem, borderRadius: 2, opacity: idleBlink }} /> : null}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 3, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)' }} />
          </div>
        </div>
      </div>
      <Grain opacity={0.05} blend="soft-light" />
    </AbsoluteFill>
  );
};
