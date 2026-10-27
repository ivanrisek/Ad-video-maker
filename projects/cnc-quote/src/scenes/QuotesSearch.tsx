// type-and-filter on the real "Ponude" page (port of demos/interaction/type-and-filter/TypeAndFilter.tsx):
// camera tight on the search box (2.0×), the query types at 3f/char (caret solid while typing, then an
// 8f blink), a breath, pull back to the full list; non-matching rows leave in reading order (fade + 8px
// sink + slight shrink/blur), the match slides up into the first-row slot (lifted, wider shadow, speed
// blur), the pointer glides in and clicks "Otvori" (two cobalt ripples, selected outline), then a slow push.
// Rows are 2x element cutouts over an empty-table plate captured from the same page.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { camAt } from '../lib/PageCam';
import { SpeedBlur, velocity } from '../lib/Polish';
import { C, FONT, rgba } from '../lib/Brand';
import layout from '../layout.json';

export const QUOTES_SEARCH_DURATION = 115;
const Q = layout.quotes;
const ROWS = Q.rows;
const SEARCH = Q.search!;
const QUERY = 'prirub';
const TARGET = 3; // P-2026-0015 · PRIRUBNICA Ø80 + još 2
// beat-locked (shot starts on a beat; 14.4 f/beat): typing beat 1, filter beat 3, click beat 5
const TYPE_START = 15;
const FILTER_START = 44;
const CLICK = 73;
const t = ROWS[TARGET];
const SLOT = ROWS[0];
const CLICK_C = { x: 1426, y: SLOT.y + SLOT.h / 2 }; // "Otvori" button in the first-row slot
const KEYS = [
  { frame: 0, cx: 660, cy: 300, zoom: 2.0 },
  { frame: 32, cx: 660, cy: 300, zoom: 2.0 },
  { frame: 43, cx: 960, cy: 470, zoom: 1.15 },
  { frame: 76, cx: 960, cy: 470, zoom: 1.15 },
  { frame: 114, cx: 960, cy: 420, zoom: 1.42 },
];
const CAM_EASE = Easing.bezier(0.33, 0, 0.15, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const PTR_FROM = { x: 760, y: 330 };
const ptrAt = (f: number) => {
  const k = interpolate(f, [55, 69], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  const arc = Math.sin(k * Math.PI) * 50;
  return { x: PTR_FROM.x + (CLICK_C.x - PTR_FROM.x) * k, y: PTR_FROM.y + (CLICK_C.y - PTR_FROM.y) * k - arc };
};

// leave order: reading order of the non-target rows
const others = ROWS.map((_, i) => i).filter((i) => i !== TARGET);

export const QuotesSearch: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camAt(KEYS, frame, CAM_EASE);
  const typed = frame < TYPE_START ? 0 : Math.min(QUERY.length, Math.floor((frame - TYPE_START) / 3) + 1);
  const caretOn = frame >= TYPE_START - 2 && frame <= CLICK + 2 && (frame <= TYPE_START + 20 || Math.floor((frame - (TYPE_START + 20)) / 8) % 2 === 0);
  const focus = interpolate(frame, [TYPE_START - 6, TYPE_START - 2, CLICK, CLICK + 6], [0, 1, 1, 0], clamp);
  const slideAt = (f: number) => interpolate(f, [FILTER_START + 4, FILTER_START + 14], [0, 1], { ...clamp, easing: Easing.bezier(0.35, 0, 0.2, 1) });
  const slide = slideAt(frame);
  const vy = velocity((f) => (SLOT.y - t.y) * slideAt(f), frame);
  const float = Math.sin(slide * Math.PI);
  const ptr = ptrAt(frame);
  const ptrO = interpolate(frame, [48, 53, 86, 92], [0, 1, 1, 0], clamp);
  const ptrPress = interpolate(frame, [CLICK - 1, CLICK + 1, CLICK + 5], [1, 0.86, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 1920, height: 1080, zoom: cam.zoom, transform: `translate(${960 / cam.zoom - cam.cx}px, ${540 / cam.zoom - cam.cy}px)` }}>
        <Img src={staticFile('textures/quotes-empty.png')} style={{ position: 'absolute', width: 1920, height: 1080 }} />
        {/* non-matching rows leave in reading order */}
        {others.map((i, rank) => {
          const r = ROWS[i];
          const cue = FILTER_START + rank * 1.2;
          if (frame >= cue + 6) return null;
          const o = interpolate(frame, [cue, cue + 6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
          return (
            <div key={i} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, opacity: 1 - o,
              transform: `translateY(${8 * o}px) scale(${1 - 0.015 * o})`, filter: o > 0.02 ? `blur(${(1.5 * o).toFixed(2)}px)` : undefined }}>
              <Img src={staticFile(`textures/qrow${i}.png`)} style={{ width: r.w, height: r.h, display: 'block' }} />
            </div>
          );
        })}
        {/* the match slides up into the first slot */}
        <SpeedBlur vx={0} vy={vy} amount={0.04} max={6} style={{ zIndex: 2 }}>
          <div style={{ position: 'absolute', left: t.x, top: t.y, width: t.w, height: t.h, borderRadius: 6, overflow: 'hidden',
            transform: `translateY(${(SLOT.y - t.y) * slide}px) scale(${1 + 0.02 * float})`,
            boxShadow: `0 ${1 + 3 * float}px ${2 + 6 * float}px rgba(15,30,45,${0.05 + 0.05 * float}), 0 ${4 + 18 * float}px ${12 + 30 * float}px -${4 + 6 * float}px rgba(15,30,45,${0.06 + 0.16 * float})` }}>
            <Img src={staticFile(`textures/qrow${TARGET}.png`)} style={{ width: t.w, height: t.h, display: 'block' }} />
          </div>
        </SpeedBlur>
        {/* after filtering, the table collapses to one row: page-colour patch over the empty plates
            + a new rounded bottom edge for the table card */}
        {frame >= FILTER_START + 12 ? (() => {
          const k = interpolate(frame, [FILTER_START + 12, FILTER_START + 20], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
          const top = SLOT.y + SLOT.h;
          const tb = Q.table!;
          return (
            <div style={{ position: 'absolute', left: tb.x - 30, top, width: tb.w + 60, height: tb.y + tb.h - top + 40, opacity: k, zIndex: 1 }}>
              <div style={{ position: 'absolute', inset: 0, background: C.paper }} />
              <div style={{ position: 'absolute', left: 30, top: -12, width: tb.w, height: 12, background: C.sheet, borderRadius: '0 0 12px 12px',
                boxShadow: `inset 1px 0 0 ${C.rule}, inset -1px 0 0 ${C.rule}, inset 0 -1px 0 ${C.rule}, 0 6px 20px -10px rgba(15,30,45,0.14)` }} />
            </div>
          );
        })() : null}
        {/* search field: patch the placeholder, type the query */}
        <div style={{ position: 'absolute', left: SEARCH.x + 3, top: SEARCH.y + 3, width: SEARCH.w - 6, height: SEARCH.h - 6, background: C.sheet, borderRadius: 6 }} />
        <div style={{ position: 'absolute', left: SEARCH.x - 1, top: SEARCH.y - 1, width: SEARCH.w + 2, height: SEARCH.h + 2, borderRadius: 9, boxSizing: 'border-box', opacity: focus,
          border: `1.5px solid ${C.dykem}`, boxShadow: `0 0 0 3px ${rgba(C.dykem, 0.16)}` }} />
        <div style={{ position: 'absolute', left: SEARCH.x + 13, top: SEARCH.y, height: SEARCH.h, display: 'flex', alignItems: 'center', fontFamily: FONT, fontSize: 15, color: C.ink }}>
          <span style={{ whiteSpace: 'pre' }}>{QUERY.slice(0, typed)}</span>
          {caretOn ? <span style={{ display: 'inline-block', width: 1.5, height: 19, marginLeft: 1.5, borderRadius: 1, background: C.dykem }} /> : null}
        </div>
        {/* click: two concentric ripples + selected outline */}
        {[0, 1].map((k) => {
          const st = CLICK + k * 3;
          if (frame < st || frame > st + 10) return null;
          const p = interpolate(frame, [st, st + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          const rad = interpolate(p, [0, 1], [10, k === 0 ? 40 : 58]);
          return <div key={k} style={{ position: 'absolute', left: CLICK_C.x - rad, top: CLICK_C.y - rad, width: rad * 2, height: rad * 2, borderRadius: '50%', boxSizing: 'border-box', zIndex: 5,
            border: `${k === 0 ? 2 : 1.5}px solid ${C.dykem}`, opacity: 1 - p }} />;
        })}
        {frame >= CLICK + 2 ? (
          <div style={{ position: 'absolute', left: SLOT.x - 4, top: SLOT.y - 4, width: SLOT.w + 8, height: SLOT.h + 8, borderRadius: 10, boxSizing: 'border-box', zIndex: 4,
            border: `2px solid ${C.dykem}`, boxShadow: `0 0 0 4px ${rgba(C.dykem, 0.1)}, 0 8px 30px -6px ${rgba(C.dykem, 0.35)}`,
            opacity: interpolate(frame, [CLICK + 2, CLICK + 5], [0.5, 1], clamp),
            transform: `scale(${interpolate(frame, [CLICK + 2, CLICK + 7], [1.012, 1], { ...clamp, easing: Easing.out(Easing.cubic) })})` }} />
        ) : null}
        {ptrO > 0.001 ? (
          <svg width={28} height={28} viewBox="0 0 28 28" style={{ position: 'absolute', left: ptr.x - 2, top: ptr.y - 1, zIndex: 6, opacity: ptrO, overflow: 'visible',
            transformOrigin: '2px 1px', transform: `scale(${((1 / cam.zoom) * ptrPress * 1.5).toFixed(4)})`,
            filter: 'drop-shadow(0 0.6px 0.6px rgba(12,20,30,0.35)) drop-shadow(0 3px 5px rgba(12,20,30,0.25))' }}>
            <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill="#0f1922" stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
