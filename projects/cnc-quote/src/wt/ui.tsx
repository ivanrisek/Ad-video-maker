// Shared bits for the walkthrough film: camera helper, cursor, click ripple, focus ring, and a typed-text
// reveal that uncovers a field region from the NEXT captured state, one character step at a time
// (interaction typing at 3f/char, per type-and-filter's tuned value).
import React from 'react';
import { Img, staticFile } from 'remotion';
import { EASE, mix, ramp } from '../lib/Polish';
import { C, rgba } from '../lib/Brand';

export type Box = { x: number; y: number; w: number; h: number };
export type Cam = { x: number; y: number; s: number };

// piecewise camera: list of {f, x, y, s}; each segment eases (default swift: crisp start, soft landing)
export const camPath = (keys: { f: number; x: number; y: number; s: number }[], f: number, ease = EASE.swift): Cam => {
  if (f <= keys[0].f) return { x: keys[0].x, y: keys[0].y, s: keys[0].s };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f <= b.f) {
      const t = ease((f - a.f) / Math.max(1e-6, b.f - a.f));
      return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), s: mix(a.s, b.s, t) };
    }
  }
  const z = keys[keys.length - 1];
  return { x: z.x, y: z.y, s: z.s };
};

// page layer under a camera (CSS zoom = layout-scale rasterisation, sharp up to ~2x on 2x textures)
export const World: React.FC<{ cam: Cam; w?: number; h: number; children: React.ReactNode }> = ({ cam, w = 1920, h, children }) => (
  <div style={{ position: 'absolute', width: w, height: h, zoom: cam.s, transform: `translate(${960 / cam.s - cam.x}px, ${540 / cam.s - cam.y}px)` }}>
    {children}
  </div>
);
export const toScreen = (cam: Cam, p: { x: number; y: number }) => ({ x: 960 + (p.x - cam.x) * cam.s, y: 540 + (p.y - cam.y) * cam.s });

export const Cursor: React.FC<{ x: number; y: number; press?: number; opacity?: number }> = ({ x, y, press = 0, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, opacity }}>
    <svg viewBox="0 0 24 24" width={42} height={42} style={{ position: 'absolute', left: -3, top: -2, overflow: 'visible',
      filter: 'drop-shadow(0 2px 2px rgba(12,26,58,0.35)) drop-shadow(0 8px 12px rgba(12,26,58,0.25))',
      transform: `scale(${(1 - 0.16 * press).toFixed(3)})`, transformOrigin: '3px 2px' }}>
      <path d="M4.5 2.5 L4.5 19.2 L8.9 15 L11.9 21.6 L14.9 20.3 L11.9 13.8 L18.2 13.4 Z" fill="#0f1922" stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  </div>
);

// two concentric rings (type-and-filter click confirmation), screen space
export const Ripple: React.FC<{ x: number; y: number; f: number; at: number }> = ({ x, y, f, at }) => (
  <>
    {[0, 1].map((k) => {
      const st = at + k * 3;
      if (f < st || f > st + 12) return null;
      const p = EASE.out(Math.min(1, (f - st) / 12));
      const r = mix(10, k ? 62 : 42, p);
      return <div key={k} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', boxSizing: 'border-box',
        border: `${k ? 1.5 : 2.5}px solid ${C.dykem}`, background: k ? undefined : rgba(C.dykem, 0.08 * (1 - p)), opacity: 1 - p }} />;
    })}
  </>
);

// press state from a list of click frames
export const pressAt = (f: number, clicks: number[]) => {
  let p = 0;
  for (const c of clicks) {
    const d = f - c;
    if (d > -2 && d < 8) p = Math.max(p, d < 1 ? ramp(d, -2, 3, EASE.swift) : 1 - ramp(d, 1, 6, EASE.overshoot));
  }
  return p;
};

// the app's input focus style: 1.5px dykem border + soft dykem halo (page space)
export const Focus: React.FC<{ b: Box; on: number; r?: number }> = ({ b, on, r = 9 }) =>
  on > 0.01 ? <div style={{ position: 'absolute', left: b.x - 1, top: b.y - 1, width: b.w + 2, height: b.h + 2, borderRadius: r, boxSizing: 'border-box', opacity: on,
    border: `1.5px solid ${C.dykem}`, boxShadow: `0 0 0 3px ${rgba(C.dykem, 0.16)}`, pointerEvents: 'none' }} /> : null;

// uncover the field text from the next state's texture, stepping one char every `per` frames
export const TypeReveal: React.FC<{ src: string; pageW?: number; pageH: number; b: Box; f: number; start: number; chars: number; per?: number; pad?: number; textW?: number; caret?: boolean; clear?: number; until?: number }> =
  ({ src, pageW = 1920, pageH, b, f, start, chars, per = 3, pad = 10, textW, caret = true, clear, until = Infinity }) => {
    // clear = frame from which the old value is wiped (field emptied on focus); until = state swap frame (stop drawing)
    if (f >= until) return null;
    const wipe = clear != null && f >= clear ? <div style={{ position: 'absolute', left: b.x + 3, top: b.y + 3, width: b.w - 6, height: b.h - 6, background: '#ffffff', borderRadius: 6 }} /> : null;
    if (f < start) return wipe;
    const n = Math.min(chars, Math.floor((f - start) / per) + 1);
    const tw = textW ?? b.w - pad * 2;
    const w = pad + (tw * n) / chars;
    const done = n >= chars;
    const blink = !done || Math.floor((f - start - chars * per) / 8) % 2 === 0;
    return (
      <>
        {wipe}
        <div style={{ position: 'absolute', left: b.x + 2, top: b.y + 2, width: b.w - 4, height: b.h - 4, overflow: 'hidden', borderRadius: 6 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: Math.min(b.w - 4, w), height: b.h - 4, overflow: 'hidden' }}>
            <Img src={staticFile(src)} style={{ position: 'absolute', left: -(b.x + 2), top: -(b.y + 2), width: pageW, height: pageH }} />
          </div>
        </div>
        {caret && blink ? <div style={{ position: 'absolute', left: b.x + Math.min(b.w - 8, w + 1), top: b.y + b.h * 0.25, width: 1.5, height: b.h * 0.5, background: C.dykem, borderRadius: 1 }} /> : null}
      </>
    );
  };

// cross-fade a whole page state in (4f), page space
export const StateLayer: React.FC<{ src: string; pageH: number; f: number; at: number; dur?: number }> = ({ src, pageH, f, at, dur = 4 }) => {
  if (f < at) return null;
  const o = Math.min(1, (f - at) / dur);
  return <Img src={staticFile(src)} style={{ position: 'absolute', width: 1920, height: pageH, opacity: o }} />;
};
