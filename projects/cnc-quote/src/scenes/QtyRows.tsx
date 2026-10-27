// row-embed on the real "Cijena prema količini" table (port of demos/ui-entrance/row-embed/RowEmbed.tsx):
// each quantity row is a texture crop of the full-page screenshot that drops from the air
// (perspective translateY −120·air + rotateX 16°·air, bezier(.5,0,.8,.75) so it still has speed at the
// bottom), scale 1.06→0.995 then a 4f press back to 1; the slot is first covered by a white patch +
// faint dashed slot frame, removed 2f after landing; a 2px cobalt seam opens from the centre (5f) and
// fades (8f). Cues accelerate (9→4f). Camera drifts down and pushes in slightly the whole time.
// Aftershock: the 1000-pcs saving cell (−77 %) gets one cobalt ring.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { camAt } from '../lib/PageCam';
import { EASE, ramp } from '../lib/Polish';
import { C, rgba } from '../lib/Brand';
import layout from '../layout.json';

export const QTY_ROWS_DURATION = 100;
const L = layout.calc;
const PAGE_H = L.pageH;
const ROWS = L.qtyRows;
const SRC = staticFile('textures/calc-full.png');
// 4x crop of the quantity card (css 1160,870 450×450) keeps the 2.2–2.34× close-up sharp
const HI = staticFile('textures/calc-qty-4x.png');
const HX = 1160, HY = 870, HS = 450;
const CUES = [8, 17, 25, 32, 38, 43, 48, 52, 56, 60];
const FLY = 12;
const FLY_EASE = Easing.bezier(0.5, 0, 0.8, 0.75);
const KEYS = [
  { frame: 0, cx: 1387, cy: 1010, zoom: 2.2 },
  { frame: 84, cx: 1387, cy: 1130, zoom: 2.34 },
];
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const last = ROWS[ROWS.length - 1];
const SAVE = { x: last.x + last.w - 86, y: last.y + 3, w: 84, h: last.h - 6 }; // "−77 %" cell

export const QtyRows: React.FC = () => {
  const frame = useCurrentFrame();
  const c = camAt(KEYS, frame, Easing.bezier(0.33, 0, 0.3, 1));
  const ring = ramp(frame, 76, 16, EASE.out);
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 1920, height: PAGE_H, zoom: c.zoom, transform: `translate(${960 / c.zoom - c.cx}px, ${540 / c.zoom - c.cy}px)` }}>
        <Img src={SRC} style={{ position: 'absolute', width: 1920, height: PAGE_H }} />
        <Img src={HI} style={{ position: 'absolute', left: HX, top: HY, width: HS, height: HS }} />
        {ROWS.map((r, i) => {
          const cue = CUES[i];
          const land = cue + FLY;
          const patchO = interpolate(frame, [land, land + 2], [1, 0], clamp);
          let flyer: React.ReactNode = null;
          if (frame >= cue && frame < land + 5) {
            const p = interpolate(frame, [cue, land], [0, 1], { ...clamp, easing: FLY_EASE });
            const appear = interpolate(frame, [cue, cue + 3], [0, 1], clamp);
            const scale = frame < land ? 1.06 - 0.065 * p : interpolate(frame, [land, land + 4], [0.995, 1], { ...clamp, easing: Easing.out(Easing.quad) });
            const air = 1 - p;
            flyer = (
              <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 4, zIndex: 3,
                backgroundColor: C.sheet, backgroundImage: `url(${HI})`, backgroundSize: `${HS}px ${HS}px`, backgroundPosition: `-${r.x - HX}px -${r.y - HY}px`,
                opacity: appear, transform: `perspective(900px) translateY(${-120 * air}px) rotateX(${16 * air}deg) scale(${scale})`,
                boxShadow: `0 ${24 * air}px ${48 * air}px rgba(15,30,45,${0.22 * air}), 0 ${6 * air}px ${14 * air}px rgba(15,30,45,${0.12 * air})` }} />
            );
          }
          let seam: React.ReactNode = null;
          if (frame >= land && frame < land + 8) {
            const spread = interpolate(frame, [land, land + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
            const so = interpolate(frame, [land, land + 2, land + 8], [1, 1, 0], clamp);
            const w = r.w * spread;
            seam = <div style={{ position: 'absolute', left: r.x + (r.w - w) / 2, top: r.y + r.h - 2, width: w, height: 2, zIndex: 4, opacity: so, borderRadius: 1,
              background: `linear-gradient(90deg, ${rgba(C.dykem, 0)}, ${C.dykem} 15%, ${C.dykem} 85%, ${rgba(C.dykem, 0)})`, boxShadow: `0 0 7px ${rgba(C.dykem, 0.45)}` }} />;
          }
          return (
            <React.Fragment key={i}>
              {patchO > 0 ? (
                <div style={{ position: 'absolute', left: r.x - 2, top: r.y, width: r.w + 4, height: r.h, background: C.sheet, opacity: patchO, zIndex: 1 }}>
                  <div style={{ position: 'absolute', inset: '4px 2px', borderRadius: 4, border: `1px dashed ${rgba(C.ink, 0.16)}` }} />
                </div>
              ) : null}
              {flyer}
              {seam}
            </React.Fragment>
          );
        })}
        {frame >= 76 ? (
          <div style={{ position: 'absolute', left: SAVE.x, top: SAVE.y, width: SAVE.w, height: SAVE.h, borderRadius: 6, zIndex: 5,
            boxShadow: `0 0 0 ${1.5}px ${rgba(C.dykem, 0.8 * (1 - 0.5 * ring))}, 0 0 ${10 * ring}px ${rgba(C.dykem, 0.3)}`, background: rgba(C.dykem, 0.06 * ring) }} />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
