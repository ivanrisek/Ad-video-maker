// cursor-flyover on the real "Kalkulacija" page. Port of demos/camera/cursor-flyover/CursorFlyover.tsx:
// camera table CAMS + click table TARGETS in page px; the cursor (hand) leaves 2f before the camera (eye),
// arrives ~6f earlier, aims a beat, presses at legStart+22 (3f squash, overshoot back), ripple 18f;
// legs: fly 20f + dwell 24f; hop −8% between stops; directional speed blur (0.09, max 8);
// after stop 4 the camera pulls back (smooth 24f) so all four responses share one frame, then a 1% creep.
// Responses are drawn over the real screenshot in page space:
//   ① Duljina L field focus (the app's own focus style) + wash over "Sirovac 0,538 kg · materijal 4,20 €"
//   ② cycle-time field focus + wash over the operation block
//   ③ price readout: single sheen across the dark card (light only reads on dark, rule from light-play-moves)
//   ④ price-structure bar grows left→right, legend rows tick in one by one
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, SpeedBlur, bezier, mix, ramp } from '../lib/Polish';
import { C, rgba } from '../lib/Brand';
import layout from '../layout.json';

export const CALC_FLYOVER_DURATION = 261;
const L = layout.calc;
const PAGE_H = L.pageH;

const dimL = L.dims; // Duljina L input
const cyc = L.machine; // cycle-time input
const price = L.bigPrice!; // "19,20 €"
const card = L.priceCard; // dark readout card
const bar = L.bar!;
const SIROVAC = L.sirovac;
const OPS = { x: 352, y: 1428, w: 776, h: 142 }; // operation block (machine + cycle/clamps/setup)
const LEGEND = [714, 739, 764, 789, 813, 838].map((y) => ({ x: 1185, y: y - 7, w: 404, h: 26 }));

const TARGETS = [
  { x: dimL.x + 60, y: dimL.y + dimL.h / 2 },
  { x: cyc.x + 40, y: cyc.y + cyc.h / 2 },
  { x: price.x + 150, y: price.y + price.h / 2 + 4 },
  { x: bar.x + bar.w * 0.62, y: bar.y + bar.h / 2 },
];
const CAMS = [
  { x: 960, y: 540, s: 1.0 },
  { x: 730, y: 1150, s: 1.9 },
  { x: 730, y: 1460, s: 1.9 },
  { x: 1387, y: 372, s: 2.0 },
  { x: 1387, y: 760, s: 2.0 },
];
const END = { x: 960, y: 820, s: 0.86 };
// clicks land on the music grid: 124 BPM = 14.516 f/beat, a click every 3 beats (43.55 f)
const LEG0 = 21.55;
const LEG = 43.55;
const legStart = (k: number) => LEG0 + k * LEG;
const clickAt = (k: number) => legStart(k) + 22;
const BACK = 204; // stop 4 settles ~30f before the pull-back; overview then holds ~33f
const CAM_EASE = bezier(0.55, 0, 0.18, 1);

const camAt = (f: number) => {
  let { x, y, s } = CAMS[0];
  s *= mix(0.97, 1, ramp(f, 0, 22, EASE.snappy));
  let hop = 0;
  for (let k = 0; k < 4; k++) {
    const u = ramp(f, legStart(k) + 2, 20, CAM_EASE);
    const to = CAMS[k + 1];
    x = mix(x, to.x, u); y = mix(y, to.y, u); s = mix(s, to.s, u);
    if (k > 0 && u > 0 && u < 1) hop = 0.08 * Math.sin(Math.PI * u);
  }
  const b = ramp(f, BACK, 24, EASE.smooth);
  x = mix(x, END.x, b); y = mix(y, END.y, b); s = mix(s, END.s, b);
  s *= (1 - hop) * (1 + 0.01 * ramp(f, BACK + 24, 14, EASE.smooth));
  return { x, y, s };
};

const cursorAt = (f: number) => {
  let x = 1240, y = 620;
  for (let k = 0; k < 4; k++) {
    const u = ramp(f, legStart(k), 16, EASE.swift);
    const to = TARGETS[k];
    const dx = to.x - x, dy = to.y - y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const bow = Math.sin(Math.PI * u) * Math.min(90, len * 0.12);
    const nx = mix(x, to.x, u) + (-dy / len) * bow;
    const ny = mix(y, to.y, u) + (dx / len) * bow;
    x = nx; y = ny;
  }
  return { x, y };
};
const resp = (f: number, k: number, dur = 16, ease = EASE.snappy) => ramp(f, clickAt(k) + 2, dur, ease);

// the app's input focus ring: 1px dykem border + 3px dykem-wash halo, radius 8
const Focus: React.FC<{ b: { x: number; y: number; w: number; h: number }; on: number }> = ({ b, on }) =>
  on > 0.01 ? (
    <div style={{ position: 'absolute', left: b.x - 1, top: b.y - 1, width: b.w + 2, height: b.h + 2, borderRadius: 9, boxSizing: 'border-box', opacity: on,
      border: `1.5px solid ${C.dykem}`, boxShadow: `0 0 0 ${3 + 2 * (1 - on)}px ${rgba(C.dykem, 0.16)}` }} />
  ) : null;

// one cobalt wash sweeping across a block (same grammar as the crane's row wash)
const Wash: React.FC<{ b: { x: number; y: number; w: number; h: number }; t0: number; f: number; r?: number }> = ({ b, t0, f, r = 6 }) => {
  if (f < t0) return null;
  const p = ramp(f, t0, 22, EASE.out);
  const op = Math.min(1, ramp(f, t0, 3, EASE.linear)) * (1 - ramp(f, t0 + 8, 20, EASE.out));
  if (op <= 0.002) return null;
  const head = mix(-0.2, 1.1, p);
  return (
    <div style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: r, opacity: op,
      background: `linear-gradient(90deg, ${rgba(C.dykem, 0.03)} 0%, ${rgba(C.dykem, 0.16)} ${(head * 100).toFixed(1)}%, ${rgba(C.dykem, 0)} ${((head + 0.25) * 100).toFixed(1)}%)`,
      boxShadow: `inset 0 0 0 1px ${rgba(C.dykem, 0.22)}` }} />
  );
};

const Responses: React.FC<{ f: number }> = ({ f }) => {
  // ① / ② field focus (lit from the click until the camera leaves the stop)
  const focus1 = ramp(f, clickAt(0), 4, EASE.out) * (1 - ramp(f, legStart(1) + 10, 10, EASE.out));
  const focus2 = ramp(f, clickAt(1), 4, EASE.out) * (1 - ramp(f, legStart(2) + 10, 10, EASE.out));
  // ③ sheen across the dark readout
  const sheen = ramp(f, clickAt(2) + 1, 16, EASE.swift);
  const ring = ramp(f, clickAt(2), 4, EASE.out) * (1 - ramp(f, clickAt(2) + 10, 14, EASE.out));
  // ④ bar regrows left→right; legend rows tick in
  const grow = f < clickAt(3) ? 1 : ramp(f, clickAt(3) + 1, 18, EASE.swift);
  const barCover = f >= clickAt(3) && grow < 1;
  return (
    <>
      <Focus b={dimL} on={focus1} />
      <Wash b={{ x: SIROVAC.x, y: SIROVAC.y, w: SIROVAC.w, h: SIROVAC.h }} t0={clickAt(0) + 4} f={f} r={4} />
      <Focus b={cyc} on={focus2} />
      <Wash b={OPS} t0={clickAt(1) + 4} f={f} r={10} />
      {/* readout sheen, clipped to the card's radius */}
      <div style={{ position: 'absolute', left: card.x, top: card.y, width: card.w, height: 105, borderRadius: '12px 12px 0 0', overflow: 'hidden', pointerEvents: 'none' }}>
        {sheen > 0 && sheen < 1 ? (
          <div style={{ position: 'absolute', top: -40, bottom: -40, width: 180, left: mix(-220, card.w + 40, sheen), transform: 'skewX(-18deg)',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(160,180,255,0.16) 40%, rgba(255,255,255,0.32) 50%, rgba(160,180,255,0.16) 60%, rgba(255,255,255,0) 100%)', mixBlendMode: 'screen' }} />
        ) : null}
      </div>
      {ring > 0.01 ? (
        <div style={{ position: 'absolute', left: price.x - 10, top: price.y - 8, width: price.w + 20, height: price.h + 16, borderRadius: 10, opacity: ring, boxShadow: `0 0 0 2px ${rgba(C.cyan, 0.7)}, 0 0 24px ${rgba(C.cyan, 0.35)}` }} />
      ) : null}
      {/* bar regrow: a white patch retreats to the right, revealing the real segments */}
      {barCover ? (
        <div style={{ position: 'absolute', left: bar.x + bar.w * grow - 1, top: bar.y - 2, width: bar.w * (1 - grow) + 3, height: bar.h + 4, background: C.sheet }} />
      ) : null}
      {LEGEND.map((r, i) => {
        const t0 = clickAt(3) + 4 + i * 3;
        if (f < t0 || f > t0 + 16) return null;
        const op = Math.min(1, ramp(f, t0, 2, EASE.linear)) * (1 - ramp(f, t0 + 4, 12, EASE.out));
        return <div key={i} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 5, background: rgba(C.dykem, 0.1 * op), boxShadow: `inset 0 0 0 1px ${rgba(C.dykem, 0.25 * op)}` }} />;
      })}
    </>
  );
};

// macOS-style arrow, constant 40px on screen
const Cursor: React.FC<{ press: number }> = ({ press }) => (
  <svg viewBox="0 0 24 24" width={40} height={40} style={{ position: 'absolute', left: -3, top: -2, overflow: 'visible',
    filter: 'drop-shadow(0 2px 2px rgba(12,26,58,0.35)) drop-shadow(0 8px 12px rgba(12,26,58,0.25))',
    transform: `scale(${(1 - 0.16 * press).toFixed(3)})`, transformOrigin: '3px 2px' }}>
    <path d="M4.5 2.5 L4.5 19.2 L8.9 15 L11.9 21.6 L14.9 20.3 L11.9 13.8 L18.2 13.4 Z" fill="#0f1922" stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

export const CalcFlyover: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camAt(frame);
  // blur from camera panning only (screen px/frame); zoom changes would read as a full-frame smear
  const c1 = camAt(frame + 0.5), c0 = camAt(frame - 0.5);
  const pan = frame < BACK ? 1 : 0; // no blur on the pull-back: it reads as defocus
  const a = { x: -(c1.x - c0.x) * cam.s * pan, y: -(c1.y - c0.y) * cam.s * pan }, b = { x: 0, y: 0 };
  const cur = cursorAt(frame);
  const cx = 960 + (cur.x - cam.x) * cam.s;
  const cy = 540 + (cur.y - cam.y) * cam.s;
  let press = 0;
  let ripple = -1;
  for (let k = 0; k < 4; k++) {
    const pf = frame - clickAt(k);
    if (pf > -2 && pf < 8) press = Math.max(press, pf < 1 ? ramp(pf, -2, 3, EASE.swift) : 1 - ramp(pf, 1, 6, EASE.overshoot));
    if (pf >= 0 && pf < 18) ripple = pf / 18;
  }
  const curOn = ramp(frame, 8, 10, EASE.out) * (1 - ramp(frame, BACK + 6, 12, EASE.out));
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <SpeedBlur vx={a.x - b.x} vy={a.y - b.y} amount={0.06} max={4}>
        <div style={{ position: 'absolute', width: 1920, height: PAGE_H, zoom: cam.s, transform: `translate(${960 / cam.s - cam.x}px, ${540 / cam.s - cam.y}px)` }}>
          <Img src={staticFile('textures/calc-full.png')} style={{ position: 'absolute', width: 1920, height: PAGE_H }} />
          <Responses f={frame} />
        </div>
      </SpeedBlur>
      {ripple >= 0 ? (
        <div style={{ position: 'absolute', left: cx - 40, top: cy - 40, width: 80, height: 80, borderRadius: 40,
          border: `3px solid ${rgba(C.dykem, (1 - ripple) * 0.9)}`, background: rgba(C.dykem, (1 - ripple) * 0.12),
          transform: `scale(${(0.3 + EASE.out(ripple) * 1.2).toFixed(3)})` }} />
      ) : null}
      <div style={{ position: 'absolute', left: cx, top: cy, opacity: curOn }}>
        <Cursor press={press} />
      </div>
    </AbsoluteFill>
  );
};
