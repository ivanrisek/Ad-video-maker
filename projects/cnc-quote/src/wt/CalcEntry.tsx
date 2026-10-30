// The randomly generated calculation, entered step by step on the real Kalkulacija page.
// cursor-flyover grammar: the camera visits each field (fly ~18f, dwell), the cursor (hand) arrives first
// and presses on the beat, the page texture then switches to the state captured after that step, typed
// values are uncovered char by char from that next state (3f/char). A cutout of the live price readout
// docks top-right and swaps to each new state's real price with a cyan pulse, so the live recalculation
// is always on screen. Then: camera to the result, click "Spremi ponudu" (saved as P-2026-0024 in the
// local demo DB), pull back to the titled quote, click "Ispiši / PDF".
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, SpeedBlur, mix, ramp } from '../lib/Polish';
import { C, rgba } from '../lib/Brand';
import W from '../walkthrough.json';
import { Box, Cursor, Focus, Ripple, StateLayer, TypeReveal, World, camPath, pressAt, toScreen } from './ui';

const B = 30 * 60 / 124.0; // beat in frames; the shot starts on a beat
const bt = (n: number) => Math.round(n * B);
export const CALC_ENTRY_DURATION = bt(22);
const PAGE_H = W.states[0].pageH;
const S = Object.fromEntries(W.states.map((s) => [s.name, s])) as Record<string, (typeof W.states)[number]>;
const G = S.s7;
const tex = (n: string) => `textures/wt/calc-${n}.png`;
const center = (b: Box, dx = 0.5, dy = 0.5) => ({ x: b.x + b.w * dx, y: b.y + b.h * dy });
const opt = W.matOpen.options[0];

// clicks on beats (local frames) and what they hit
const CL = {
  client: bt(3), part: bt(5), qty: bt(8), rod: bt(10), mat: bt(11), option: bt(13),
  dimD: bt(14), dimL: bt(15), machine: bt(17), save: bt(19), print: bt(21),
};
const TARGET: Record<keyof typeof CL, { x: number; y: number }> = {
  client: center(G.client, 0.55), part: center(G.part, 0.3), qty: center(G.qty, 0.7), rod: center(G.rodTab!),
  mat: center(G.mat, 0.25), option: center(opt as Box, 0.2), dimD: center(G.dimD!, 0.6), dimL: center(G.dimL!, 0.6),
  machine: center(G.machine, 0.35), save: center(G.save!), print: center(G.print!),
};
// state swaps (texture shown from this frame on)
const SWAP: [string, number][] = [
  ['s1', CL.client + 3], ['s2', CL.part + 3 + 11 * 3 + 2], ['s3', CL.qty + 3 + 2 * 3 + 2], ['s4', CL.rod + 3],
  ['s5open', CL.mat + 2], ['s5', CL.option + 3], ['s6', CL.dimL + 3 + 3 * 3 + 2], ['s7', CL.machine + 3], ['s8saved', CL.save + 3],
];
const stateAt = (f: number) => SWAP.filter(([, at]) => f >= at).map(([n]) => n).pop() || 's0';
const PRICE_STATES = SWAP.filter(([n]) => /^s[1-7]$/.test(n));

const KEYS = [
  { f: 0, x: 960, y: 600, s: 0.95 },
  { f: 22, x: 960, y: 600, s: 0.97 },
  { f: 40, x: 640, y: 380, s: 1.9 },
  { f: CL.part - 22, x: 640, y: 380, s: 1.9 },
  { f: CL.part - 4, x: 690, y: 700, s: 1.9 },
  { f: CL.rod - 20, x: 690, y: 700, s: 1.9 },
  { f: CL.rod - 3, x: 720, y: 1010, s: 1.85 },
  { f: CL.dimD - 16, x: 720, y: 1040, s: 1.85 },
  { f: CL.dimD - 3, x: 720, y: 1160, s: 1.95 },
  { f: CL.machine - 18, x: 720, y: 1160, s: 1.95 },
  { f: CL.machine - 3, x: 730, y: 1480, s: 1.9 },
  { f: CL.save - 22, x: 730, y: 1480, s: 1.9 },
  { f: CL.save - 4, x: 1387, y: 470, s: 1.55 },
  { f: CL.save + 6, x: 1387, y: 470, s: 1.55 },
  { f: CL.save + 22, x: 960, y: 540, s: 1.0 },
  { f: CALC_ENTRY_DURATION, x: 1000, y: 520, s: 1.06 },
];

// cursor path: leaves ~16f before each click, arrives ~4f before it
const ORDER = Object.keys(CL) as (keyof typeof CL)[];
const cursorAt = (f: number) => {
  let p = { x: 1100, y: 640 };
  for (const k of ORDER) {
    const to = TARGET[k];
    const u = ramp(f, CL[k] - 16, 12, EASE.swift);
    const bow = Math.sin(Math.PI * u) * 30;
    p = { x: mix(p.x, to.x, u), y: mix(p.y, to.y, u) - bow };
  }
  return p;
};

const HUD: React.FC<{ f: number }> = ({ f }) => {
  const on = ramp(f, 26, 10, EASE.out) * (1 - ramp(f, CL.save - 30, 10, EASE.out));
  if (on <= 0.001) return null;
  const cur = PRICE_STATES.filter(([, at]) => f >= at).pop();
  const prev = PRICE_STATES.filter(([, at]) => cur && at < cur[1]).pop();
  const t = cur ? Math.min(1, (f - cur[1]) / 5) : 1;
  const pulse = cur ? 1 - ramp(f, cur[1], 18, EASE.out) : 0;
  const name = cur ? cur[0] : 's0';
  const w = 430 * 0.9, h = 242 * 0.9;
  return (
    <div style={{ position: 'absolute', right: 56, top: 52, width: w, height: h, opacity: on, transform: `translateY(${(1 - on) * -16}px) scale(${1 + 0.025 * pulse})`, transformOrigin: '50% 0%',
      borderRadius: 12, overflow: 'hidden', boxShadow: `0 18px 50px -12px rgba(10,18,26,0.55), 0 0 0 ${1 + 2 * pulse}px ${rgba(C.cyan, 0.15 + 0.6 * pulse)}` }}>
      <Img src={staticFile(`textures/wt/price-${prev ? prev[0] : 's0'}.png`)} style={{ position: 'absolute', inset: 0, width: w, height: h }} />
      <Img src={staticFile(`textures/wt/price-${name}.png`)} style={{ position: 'absolute', inset: 0, width: w, height: h, opacity: t }} />
    </div>
  );
};

export const CalcEntry: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camPath(KEYS, f);
  const c1 = camPath(KEYS, f + 0.5), c0 = camPath(KEYS, f - 0.5);
  const st = stateAt(f);
  const ptr = cursorAt(f);
  const sp = toScreen(cam, ptr);
  const clicks = ORDER.map((k) => CL[k]);
  const press = pressAt(f, clicks);
  const lastClick = clicks.filter((c) => f >= c).pop() ?? -100;
  const focus = (k: keyof typeof CL, until: number) => (f >= CL[k] && f < until ? Math.min(1, (f - CL[k]) / 3) : 0);
  // material dropdown: list unrolls from the input downward
  const listOpen = f >= CL.mat + 2 && f < CL.option + 3 ? ramp(f, CL.mat + 6, 8, EASE.out) : 0;
  const L = W.matOpen.list;
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <SpeedBlur vx={-(c1.x - c0.x) * cam.s} vy={-(c1.y - c0.y) * cam.s} amount={0.05} max={4}>
        <World cam={cam} h={PAGE_H}>
          <Img src={staticFile(tex('s0'))} style={{ position: 'absolute', width: 1920, height: PAGE_H }} />
          {SWAP.map(([n, at]) => (f >= at && (n === st || SWAP.findIndex((x) => x[0] === st) - SWAP.findIndex((x) => x[0] === n) === 1) ? <StateLayer key={n} src={tex(n)} pageH={PAGE_H} f={f} at={at} /> : null))}
          {/* typing: part name, qty, material query, dims */}
          <TypeReveal src={tex('s2')} pageH={PAGE_H} b={G.part} f={f} start={CL.part + 3} chars={11} textW={92} until={SWAP[1][1]} />
          <TypeReveal src={tex('s3')} pageH={PAGE_H} b={G.qty} f={f} start={CL.qty + 3} chars={2} textW={20} clear={CL.qty + 1} until={SWAP[2][1]} pad={36} />
          {st === 's5open' ? (
            <>
              <TypeReveal src={tex('s5open')} pageH={PAGE_H} b={G.mat} f={f} start={CL.mat + 3} chars={3} textW={26} clear={CL.mat + 2} />
              {/* list: cover with the pre-open state, uncover top→down */}
              <div style={{ position: 'absolute', left: L.x - 4, top: L.y + L.h * listOpen, width: L.w + 8, height: L.h * (1 - listOpen) + 4, overflow: 'hidden' }}>
                <Img src={staticFile(tex('s4'))} style={{ position: 'absolute', left: -(L.x - 4), top: -(L.y + L.h * listOpen), width: 1920, height: PAGE_H }} />
              </div>
            </>
          ) : null}
          <TypeReveal src={tex('s6')} pageH={PAGE_H} b={G.dimD!} f={f} start={CL.dimD + 3} chars={2} textW={20} clear={CL.dimD + 1} until={SWAP[6][1]} />
          <TypeReveal src={tex('s6')} pageH={PAGE_H} b={G.dimL!} f={f} start={CL.dimL + 3} chars={3} textW={30} clear={CL.dimL + 1} until={SWAP[6][1]} />
          {/* focus rings follow the active field */}
          <Focus b={G.client} on={focus('client', CL.client + 14)} />
          <Focus b={G.part} on={focus('part', CL.qty)} />
          <Focus b={G.qty} on={focus('qty', CL.rod - 6)} />
          <Focus b={G.mat} on={focus('mat', CL.option + 2)} />
          <Focus b={G.dimD!} on={focus('dimD', CL.dimL)} />
          <Focus b={G.dimL!} on={focus('dimL', CL.machine - 6)} />
          <Focus b={G.machine} on={focus('machine', CL.machine + 16)} />
          {/* blank weight line washes when the dimensions land */}
          {G.sirovac && f >= SWAP[6][1] && f < SWAP[6][1] + 30 ? (
            <div style={{ position: 'absolute', left: G.sirovac.x, top: G.sirovac.y, width: G.sirovac.w, height: G.sirovac.h, borderRadius: 4,
              background: `linear-gradient(90deg, ${rgba(C.dykem, 0.03)} 0%, ${rgba(C.dykem, 0.18)} ${mix(-20, 110, ramp(f, SWAP[6][1], 22, EASE.out)).toFixed(1)}%, ${rgba(C.dykem, 0)} ${mix(5, 135, ramp(f, SWAP[6][1], 22, EASE.out)).toFixed(1)}%)`,
              opacity: 1 - ramp(f, SWAP[6][1] + 12, 18, EASE.out) }} />
          ) : null}
        </World>
      </SpeedBlur>
      <HUD f={f} />
      {clicks.map((c) => <Ripple key={c} x={toScreen(cam, cursorAt(c)).x} y={toScreen(cam, cursorAt(c)).y} f={f} at={c} />)}
      <Cursor x={sp.x} y={sp.y} press={press} opacity={ramp(f, 24, 8, EASE.out) * (f > lastClick + 10 && lastClick === CL.print ? 1 - ramp(f, CL.print + 8, 6, EASE.out) : 1)} />
    </AbsoluteFill>
  );
};
