import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

export type CamKey = { frame: number; cx: number; cy: number; zoom: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const camAt = (keys: CamKey[], frame: number, ease: (t: number) => number = Easing.bezier(0.33, 0, 0.15, 1)) => {
  let a = keys[0], b = keys[keys.length - 1];
  if (frame <= keys[0].frame) return { ...keys[0] };
  if (frame >= b.frame) return { ...b };
  for (let i = 0; i < keys.length - 1; i++) {
    if (frame >= keys[i].frame && frame <= keys[i + 1].frame) { a = keys[i]; b = keys[i + 1]; break; }
  }
  const t = a.frame === b.frame ? 1 : interpolate(frame, [a.frame, b.frame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return { frame, cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), zoom: lerp(a.zoom, b.zoom, t) };
};

/**
 * 2D camera over a 2x full-page screenshot (template PageCam, flat mode).
 * (cx, cy) = page CSS point centred in the 1920x1080 frame; zoom = output px per CSS px.
 * Magnification uses CSS `zoom` (layout-scale rasterisation) so the 2x texture stays sharp
 * up to ~2x camera zoom (aesthetic rule Q2). Children are positioned in page CSS px.
 */
export const PageCam: React.FC<{
  src: string;
  pageH: number;
  keys?: CamKey[];
  cam?: { cx: number; cy: number; zoom: number };
  bg?: string;
  blur?: number;
  ease?: (t: number) => number;
  children?: React.ReactNode;
}> = ({ src, pageH, keys, cam, bg = '#edf1f4', blur = 0, ease, children }) => {
  const frame = useCurrentFrame();
  const c = cam ?? camAt(keys!, frame, ease);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: bg }}>
      <div
        style={{
          position: 'absolute', width: 1920, height: pageH,
          zoom: c.zoom,
          transform: `translate(${960 / c.zoom - c.cx}px, ${540 / c.zoom - c.cy}px)`,
          filter: blur > 0 ? `blur(${blur / c.zoom}px)` : undefined,
        }}
      >
        <Img src={staticFile(src)} style={{ position: 'absolute', width: 1920, height: pageH }} />
        {children}
      </div>
    </AbsoluteFill>
  );
};
