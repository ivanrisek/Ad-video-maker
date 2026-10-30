// The randomly generated calculation, entered step by step on the real Kalkulacija page.
// cursor-flyover grammar: the camera visits each field and settles BEFORE the click (cursor-flyover pitfall),
// the cursor (hand) arrives first and presses on the beat; each value is typed (3f/char) by uncovering the
// field from the state captured after that step; the page then HARD-switches to that captured state (no
// cross-fade, so typed values never revert or double-expose). A cutout of the live price readout docks
// top-right once the camera is in close, and swaps to each step's real price with a cyan pulse.
// Then: camera to the result, click "Spremi ponudu" (saved as P-2026-0024 in the local demo DB),
// pull back to the titled quote with its toast, click "Ispiši / PDF".
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Circle } from '@remotion/rough-notation';
import { EASE, SpeedBlur, mix, ramp } from '../lib/Polish';
import { C, rgba } from '../lib/Brand';
import W from '../walkthrough.json';
import { Box, Cursor, Focus, Ripple, TypeReveal, World, camPath, pressAt, toScreen } from './ui';

const B = 30 * 60 / 124.0; // beat in frames; the shot starts on a beat
const bt = (n: number) => Math.round(n * B);
export const CALC_ENTRY_BEATS = 27;
export const CALC_ENTRY_DURATION = bt(CALC_ENTRY_BEATS);
const PAGE_H = W.states[0].pageH;
const S = Object.fromEntries(W.states.map((s) => [s.name, s])) as Record<string, (typeof W.states)[number]>;
const G = S.s7;
const tex = (n: string) => `textures/wt/calc-${n}.png`;
const center = (b: Box, dx = 0.5, dy = 0.5) => ({ x: b.x + b.w * dx, y: b.y + b.h * dy });
const opt = W.matOpen.options[0] as Box;
const C_ = W.calc;

// clicks on beats (local frames)
export const CL = {
  client: bt(3), part: bt(5), drawing: bt(8), qty: bt(11), rod: bt(12), mat: bt(13), option: bt(15),
  dimD: bt(16), dimL: bt(17), machine: bt(19), cycle: bt(20), save: bt(23), print: bt(25),
};
type K = keyof typeof CL;
const TARGET: Record<K, { x: number; y: number }> = {
  client: center(G.client, 0.55), part: center(G.part, 0.3), drawing: center(G.drawing!, 0.4), qty: center(G.qty, 0.7), rod: center(G.rodTab!),
  mat: center(G.mat, 0.25), option: center(opt, 0.2), dimD: center(G.dimD!, 0.6), dimL: center(G.dimL!, 0.6),
  machine: center(G.machine, 0.35), cycle: center(G.cycle!, 0.6), save: center(G.save!), print: center(G.print!),
};
// measured text extents inside each field (css px from the field's left edge)
const TXT = { part: [11.5, 84], drawing: [11.5, 83], qty: [41.5, 59], mat: [11.5, 34.5], dimD: [12, 26.5], dimL: [12, 35], cycle: [12.5, 27] } as const;
const typed = (k: keyof typeof TXT, chars: number) => ({ pad: TXT[k][0] - 1, textW: TXT[k][1] - TXT[k][0] + 2, chars });
const PER = 3;
const endOf = (k: K, chars: number) => CL[k] + 3 + chars * PER;

// hard state switches (texture shown from this frame on)
export const SWAP = {
  s1: CL.client + 3,
  s2: endOf('drawing', C_.drawing.length) + 2,
  s3: endOf('qty', C_.qty.length) + 2,
  s4: CL.rod + 3,
  s5open: CL.mat + 2,
  s5: CL.option + 3,
  s6: endOf('dimL', C_.L.length) + 2,
  s7: CL.machine + 3, // machine label + (cycle field held at its old value until typed, below)
  s8saved: CL.save + 3,
};
const ORDERED = Object.entries(SWAP).sort((a, b) => a[1] - b[1]);
const stateAt = (f: number) => ORDERED.filter(([, at]) => f >= at).map(([n]) => n).pop() || 's0';
const CYCLE_DONE = endOf('cycle', C_.cycle.length) + 2;
// price readout states: the real price of each step; the s7 price appears once the cycle time is typed
const PRICE: [string, number][] = [['s0', 0], ['s3', SWAP.s3], ['s4', SWAP.s4], ['s5', SWAP.s5], ['s6', SWAP.s6], ['s7', CYCLE_DONE]];

const KEYS = [
  { f: 0, x: 960, y: 540, s: 1.0 },
  { f: 20, x: 960, y: 540, s: 1.0 },
  { f: 38, x: 640, y: 380, s: 1.9 },
  { f: CL.part - 22, x: 640, y: 380, s: 1.9 },
  { f: CL.part - 6, x: 690, y: 700, s: 1.9 },
  { f: CL.rod - 22, x: 690, y: 700, s: 1.9 },
  { f: CL.rod - 6, x: 720, y: 1040, s: 1.85 },
  { f: CL.dimD - 18, x: 720, y: 1040, s: 1.85 },
  { f: CL.dimD - 5, x: 720, y: 1160, s: 1.95 },
  { f: CL.machine - 20, x: 720, y: 1160, s: 1.95 },
  { f: CL.machine - 5, x: 730, y: 1490, s: 1.9 },
  { f: CL.save - 24, x: 730, y: 1490, s: 1.9 },
  { f: CL.save - 6, x: 1387, y: 470, s: 1.55 },
  { f: CL.save + 6, x: 1387, y: 470, s: 1.55 },
  { f: CL.save + 22, x: 960, y: 560, s: 1.0 },
  { f: CALC_ENTRY_DURATION, x: 960, y: 560, s: 1.02 },
];

// cursor: leaves ~18f before each click, arrives ~5f before it
const ORDER = Object.keys(CL) as K[];
const cursorAt = (f: number) => {
  let p = { x: 1100, y: 640 };
  for (const k of ORDER) {
    const to = TARGET[k];
    const u = ramp(f, CL[k] - 18, 13, EASE.swift);
    const bow = Math.sin(Math.PI * u) * 30;
    p = { x: mix(p.x, to.x, u), y: mix(p.y, to.y, u) - bow };
  }
  return p;
};

const HUD: React.FC<{ f: number }> = ({ f }) => {
  const on = ramp(f, 40, 10, EASE.out) * (1 - ramp(f, CL.save - 24, 8, EASE.out));
  if (on <= 0.001) return null;
  const idx = PRICE.filter(([, at]) => f >= at).length - 1;
  const [name, at] = PRICE[Math.max(0, idx)];
  const prev = PRICE[Math.max(0, idx - 1)][0];
  const t = idx > 0 ? Math.min(1, (f - at) / 5) : 1;
  const pulse = idx > 0 ? 1 - ramp(f, at, 18, EASE.out) : 0;
  const w = 430 * 0.9, h = 242 * 0.9;
  return (
    <div style={{ position: 'absolute', right: 56, top: 52, width: w, height: h, opacity: on, transform: `translateY(${(1 - on) * -16}px) scale(${1 + 0.025 * pulse})`, transformOrigin: '50% 0%',
      borderRadius: 12, overflow: 'hidden', boxShadow: `0 18px 50px -12px rgba(10,18,26,0.55), 0 0 0 ${1 + 2 * pulse}px ${rgba(C.cyan, 0.15 + 0.6 * pulse)}` }}>
      <Img src={staticFile(`textures/wt/price-${prev}.png`)} style={{ position: 'absolute', inset: 0, width: w, height: h }} />
      <Img src={staticFile(`textures/wt/price-${name}.png`)} style={{ position: 'absolute', inset: 0, width: w, height: h, opacity: t }} />
    </div>
  );
};

// a region of another state's texture, pinned in page space (used to hold the old cycle value)
const Patch: React.FC<{ src: string; b: Box }> = ({ src, b }) => (
  <div style={{ position: 'absolute', left: b.x + 2, top: b.y + 2, width: b.w - 4, height: b.h - 4, overflow: 'hidden' }}>
    <Img src={staticFile(src)} style={{ position: 'absolute', left: -(b.x + 2), top: -(b.y + 2), width: 1920, height: PAGE_H }} />
  </div>
);

export const CalcEntry: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camPath(KEYS, f);
  const c1 = camPath(KEYS, f + 0.5), c0 = camPath(KEYS, f - 0.5);
  const st = stateAt(f);
  const sp = toScreen(cam, cursorAt(f));
  const clicks = ORDER.map((k) => CL[k]);
  const press = pressAt(f, clicks);
  const focus = (k: K, until: number) => (f >= CL[k] && f < until ? Math.min(1, (f - CL[k]) / 3) : 0);
  const listOpen = st === 's5open' ? ramp(f, CL.mat + 6, 8, EASE.out) : 0;
  const L = W.matOpen.list;
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <SpeedBlur vx={-(c1.x - c0.x) * cam.s} vy={-(c1.y - c0.y) * cam.s} amount={0.04} max={3}>
        <World cam={cam} h={PAGE_H}>
          <Img src={staticFile(tex(st))} style={{ position: 'absolute', width: 1920, height: PAGE_H }} />
          {/* part + drawing (both live in state s2) */}
          <TypeReveal src={tex('s2')} pageH={PAGE_H} b={G.part} f={f} start={CL.part + 3} {...typed('part', C_.part.length)} caret={f < CL.drawing} until={SWAP.s2} />
          <TypeReveal src={tex('s2')} pageH={PAGE_H} b={G.drawing!} f={f} start={CL.drawing + 3} {...typed('drawing', C_.drawing.length)} until={SWAP.s2} />
          <TypeReveal src={tex('s3')} pageH={PAGE_H} b={G.qty} f={f} start={CL.qty + 3} {...typed('qty', C_.qty.length)} clear={CL.qty + 1} until={SWAP.s3} />
          {st === 's5open' ? (
            <>
              <TypeReveal src={tex('s5open')} pageH={PAGE_H} b={G.mat} f={f} start={CL.mat + 3} {...typed('mat', C_.query.length)} clear={CL.mat + 2} />
              <div style={{ position: 'absolute', left: L.x - 4, top: L.y + L.h * listOpen, width: L.w + 8, height: L.h * (1 - listOpen) + 4, overflow: 'hidden' }}>
                <Img src={staticFile(tex('s4'))} style={{ position: 'absolute', left: -(L.x - 4), top: -(L.y + L.h * listOpen), width: 1920, height: PAGE_H }} />
              </div>
            </>
          ) : null}
          <TypeReveal src={tex('s6')} pageH={PAGE_H} b={G.dimD!} f={f} start={CL.dimD + 3} {...typed('dimD', C_.D.length)} clear={CL.dimD + 1} caret={f < CL.dimL} until={SWAP.s6} />
          <TypeReveal src={tex('s6')} pageH={PAGE_H} b={G.dimL!} f={f} start={CL.dimL + 3} {...typed('dimL', C_.L.length)} clear={CL.dimL + 1} until={SWAP.s6} />
          {/* machine switched: hold the old cycle value until it is typed */}
          {f >= SWAP.s7 && f < CL.cycle + 1 ? <Patch src={tex('s6')} b={G.cycle!} /> : null}
          <TypeReveal src={tex('s7')} pageH={PAGE_H} b={G.cycle!} f={f} start={CL.cycle + 3} {...typed('cycle', C_.cycle.length)} clear={CL.cycle + 1} until={CYCLE_DONE + 10} />
          <Focus b={G.client} on={focus('client', CL.client + 14)} />
          <Focus b={G.part} on={focus('part', CL.drawing)} />
          <Focus b={G.drawing!} on={focus('drawing', CL.qty)} />
          <Focus b={G.qty} on={focus('qty', CL.rod - 6)} />
          <Focus b={G.mat} on={focus('mat', CL.option + 2)} />
          <Focus b={G.dimD!} on={focus('dimD', CL.dimL)} />
          <Focus b={G.dimL!} on={focus('dimL', CL.machine - 8)} />
          <Focus b={G.machine} on={focus('machine', CL.cycle)} />
          <Focus b={G.cycle!} on={focus('cycle', CYCLE_DONE + 10)} />
          {/* the result: a hand-drawn cobalt circle around the price per piece (Remotion rough-notation) */}
          {f >= CL.save - 10 && f < CL.save + 24 ? (
            <div style={{ position: 'absolute', left: G.bigPrice!.x, top: G.bigPrice!.y, opacity: interpolate(f, [CL.save + 14, CL.save + 24], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <Circle color={C.cyan} strokeWidth={3.5} iterations={2} seed={7} padding={{ top: 12, right: 26, bottom: 12, left: 18 }}
                progress={interpolate(f, [CL.save - 10, CL.save + 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.swift })}>
                <div style={{ width: G.bigPrice!.w, height: G.bigPrice!.h }} />
              </Circle>
            </div>
          ) : null}
          {G.sirovac && f >= SWAP.s6 && f < SWAP.s6 + 30 ? (
            <div style={{ position: 'absolute', left: G.sirovac.x, top: G.sirovac.y, width: G.sirovac.w, height: G.sirovac.h, borderRadius: 4,
              background: `linear-gradient(90deg, ${rgba(C.dykem, 0.03)} 0%, ${rgba(C.dykem, 0.18)} ${mix(-20, 110, ramp(f, SWAP.s6, 22, EASE.out)).toFixed(1)}%, ${rgba(C.dykem, 0)} ${mix(5, 135, ramp(f, SWAP.s6, 22, EASE.out)).toFixed(1)}%)`,
              opacity: 1 - ramp(f, SWAP.s6 + 12, 18, EASE.out) }} />
          ) : null}
        </World>
      </SpeedBlur>
      <HUD f={f} />
      {clicks.map((c) => { const p = toScreen(camPath(KEYS, c), cursorAt(c)); return <Ripple key={c} x={p.x} y={p.y} f={f} at={c} />; })}
      <Cursor x={sp.x} y={sp.y} press={press} opacity={ramp(f, 24, 8, EASE.out) * (1 - ramp(f, CL.print + 10, 6, EASE.out))} />
    </AbsoluteFill>
  );
};
