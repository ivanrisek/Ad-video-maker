// crane-rise-reveal on the real "Materijali i cijene" page (focus → whole wall).
// Port of demos/opening/crane-rise-reveal/CraneRiseReveal.tsx onto a real 4x screenshot:
//  - 0–24f hold tight (3.0×, +1.5% breath) on the EN AW-6082 T6 row; only that row is sharp, the rest
//    sits at ~38% (paper scrim), a cobalt tracking dot breathes at the row start;
//  - 24–126f crane: aim point and scale share one bezier(0.2,0,0.25,1) progress (zero-speed start,
//    peak ~19%, long soft stop); CameraMotionBlur only on the fast first part (until 64f);
//  - every row/card wipes with a cobalt wash the moment it enters the frame (solved per frame);
//  - 134f aftershock: the tracked €/kg cell pulses (today's price), then a clean hold.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { EASE, bezier, mix, ramp } from '../lib/Polish';
import { C, rgba } from '../lib/Brand';
import layout from '../layout.json';

export const MATERIALS_CRANE_DURATION = 165;

const HOLD = 24;
const MOVE_END = 126;
const BLUR_END = 64;
const FLIP = 134;
const crane = bezier(0.2, 0, 0.25, 1);

const PAGE_W = 1920;
const PAGE_H = 1100; // the 4x texture covers the top 1100 css px of the page
const M = layout.materials;
const cells = M.trackCells;
const TR = { x: cells[0].x, y: cells[0].y, w: cells[cells.length - 1].x + cells[cells.length - 1].w - cells[0].x, h: cells[0].h };
const PRICE = cells[2]; // €/kg cell, "6,19"

const S0 = 3.0;
const BREATH = 0.015;
const F0 = { x: 620, y: TR.y + TR.h / 2 };
const S1 = 1.25; // settle a little tight so the app content (318–1602 px) fills the frame
const F1 = { x: 960, y: 432 };

const camAt = (frame: number) => {
  const breath = ramp(frame, 0, HOLD, EASE.smooth);
  const e = crane(Math.min(1, Math.max(0, (frame - HOLD) / (MOVE_END - HOLD))));
  const s0 = S0 * (1 + BREATH * breath);
  const s = mix(s0, S1, e);
  const fx = mix(F0.x, F1.x, e);
  const fy = mix(F0.y, F1.y, e);
  return { s, e, fx, fy, visTop: fy - 540 / s, visBot: fy + 540 / s };
};

// things that wash in as the frame first reaches them
type Box = { x: number; y: number; w: number; h: number };
const ROWS: Box[] = M.rows.filter((r: Box) => r.y + r.h < PAGE_H && r.y !== TR.y);
const CARDS: Box[] = M.idx;
const trigOf = (b: Box) => {
  const c0 = camAt(HOLD);
  if (b.y + b.h > c0.visTop && b.y < c0.visBot) return -1; // already in frame at the start
  for (let f = HOLD; f <= MOVE_END; f++) {
    const c = camAt(f);
    if (c.visTop <= b.y + 2 && c.visBot >= b.y + b.h * 0.3) return f;
  }
  return MOVE_END;
};
const WASH = [...ROWS.map((b) => ({ b, t: trigOf(b), r: 4 })), ...CARDS.map((b) => ({ b, t: trigOf(b), r: 12 }))];

const World: React.FC<{ frame: number; children?: React.ReactNode }> = ({ frame, children }) => {
  const { s, fx, fy } = camAt(frame);
  return (
    <div style={{ position: 'absolute', width: PAGE_W, height: PAGE_H, zoom: s, transform: `translate(${960 / s - fx}px, ${540 / s - fy}px)` }}>
      {children}
    </div>
  );
};

// the page itself (reads its own frame so CameraMotionBlur can sub-sample it)
const Page: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <World frame={frame}>
        <Img src={staticFile('textures/materials-top-4x.png')} style={{ position: 'absolute', width: PAGE_W, height: PAGE_H }} />
      </World>
    </AbsoluteFill>
  );
};

const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = ramp(frame, HOLD - 2, 28, EASE.out); // 0 = only the tracked row is clear
  const scrim = 0.62 * (1 - focus);
  const beat = 0.5 + 0.5 * Math.sin(frame / 5.5);
  const hl = 1 - 0.6 * ramp(frame, MOVE_END - 10, 20, EASE.out); // tracked-row highlight softens on landing
  const pulse = ramp(frame, FLIP, 22, EASE.out);
  const pulseOn = frame >= FLIP && frame < FLIP + 26;
  const flipPop = frame >= FLIP ? ramp(frame, FLIP, 6, EASE.out) * (1 - ramp(frame, FLIP + 6, 16, EASE.smooth)) : 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      <World frame={frame}>
        {/* focus scrim: everything but the tracked row */}
        {scrim > 0.003 ? (
          <>
            <div style={{ position: 'absolute', left: 0, top: 0, width: PAGE_W, height: TR.y, background: rgba(C.paper, scrim) }} />
            <div style={{ position: 'absolute', left: 0, top: TR.y + TR.h, width: PAGE_W, height: PAGE_H - TR.y - TR.h, background: rgba(C.paper, scrim) }} />
          </>
        ) : null}
        {/* tracked row */}
        <div style={{ position: 'absolute', left: TR.x + 3, top: TR.y + 3, width: TR.w - 6, height: TR.h - 6, borderRadius: 8, opacity: hl,
          background: `linear-gradient(90deg, ${rgba(C.dykem, 0.1)} 0%, ${rgba(C.dykem, 0.05)} 60%, ${rgba(C.dykem, 0.02)} 100%)`,
          boxShadow: `inset 0 0 0 1px ${rgba(C.dykem, 0.28)}` }} />
        <div style={{ position: 'absolute', left: TR.x - 18, top: TR.y + TR.h / 2 - 5, width: 10, height: 10, borderRadius: 5, background: C.dykem, opacity: hl }} />
        <div style={{ position: 'absolute', left: TR.x - 18 - 6 * beat, top: TR.y + TR.h / 2 - 5 - 6 * beat, width: 10 + 12 * beat, height: 10 + 12 * beat, borderRadius: 20, border: `1.5px solid ${rgba(C.dykem, 0.5 * (1 - beat) * hl)}` }} />
        {/* wash as rows/cards enter */}
        {WASH.map(({ b, t, r }, i) => {
          if (t < 0) return null;
          const p = ramp(frame, t, 20, EASE.out);
          const op = Math.min(1, ramp(frame, t, 3, EASE.linear)) * (1 - ramp(frame, t + 6, 18, EASE.out));
          if (op <= 0.002) return null;
          const head = mix(-0.2, 1.1, p);
          return (
            <div key={i} style={{ position: 'absolute', left: b.x + 2, top: b.y + 2, width: b.w - 4, height: b.h - 4, borderRadius: r, opacity: op,
              background: `linear-gradient(90deg, ${rgba(C.dykem, 0.02)} 0%, ${rgba(C.dykem, 0.13)} ${(head * 100).toFixed(1)}%, ${rgba(C.dykem, 0)} ${((head + 0.22) * 100).toFixed(1)}%)`,
              boxShadow: `inset 0 0 0 1px ${rgba(C.dykem, 0.18)}` }} />
          );
        })}
        {/* aftershock: today's price pulses */}
        {pulseOn ? (
          <>
            <div style={{ position: 'absolute', left: PRICE.x + PRICE.w - 66, top: PRICE.y + 14, width: 56, height: PRICE.h - 28, borderRadius: 8, background: rgba(C.dykem, 0.12 * flipPop + 0.0), boxShadow: `inset 0 0 0 ${1.5}px ${rgba(C.dykem, 0.55 * flipPop)}` }} />
            <div style={{ position: 'absolute', left: PRICE.x + PRICE.w - 38 - 40 * (0.6 + pulse), top: PRICE.y + PRICE.h / 2 - 22 * (0.6 + pulse), width: 80 * (0.6 + pulse), height: 44 * (0.6 + pulse), borderRadius: 40, border: `2px solid ${rgba(C.dykem, 0.6 * (1 - pulse))}` }} />
          </>
        ) : null}
      </World>
    </AbsoluteFill>
  );
};

export const MaterialsCrane: React.FC = () => {
  const frame = useCurrentFrame();
  const fast = frame > HOLD + 1 && frame < BLUR_END;
  const vig = 1 - ramp(frame, HOLD, 60, EASE.swift);
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      {fast ? (
        <CameraMotionBlur shutterAngle={150} samples={8}>
          <Page />
        </CameraMotionBlur>
      ) : (
        <Page />
      )}
      <Overlays />
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: vig, background: `radial-gradient(ellipse 75% 70% at 45% 55%, rgba(15,25,34,0) 55%, rgba(15,25,34,0.18) 100%)` }} />
    </AbsoluteFill>
  );
};
