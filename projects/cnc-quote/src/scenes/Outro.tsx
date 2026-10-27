// outro-group-photo-launch (port of demos/outro/outro-group-photo-launch/OutroGroupPhotoLaunch.tsx),
// re-skinned to the app's navy: one representative element from every shot flies in from all sides
// (cue 4 + 3f each, 12f flight, bezier(0.34,1.4,0.44,1) real overshoot, speed blur, landing press),
// the logo then "CNC.Quote" letterpress in (logo 38f, letters 42+i·1.8), everything else recedes,
// cobalt stage light behind the wordmark, rule + extension lines, tagline, cyan dust; crane
// (rotateX 4°→0, scale 1.06→1) then a slow push; ≥30f sign-off hold, then a fade to navy.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { EASE, Grain, SpeedBlur, ramp, velocity } from '../lib/Polish';
import { C, FONT, Logo, WORDMARK, rgba, wdth } from '../lib/Brand';
import layout from '../layout.json';

export const OUTRO_DURATION = 150;
const TAGLINE = 'Od nacrta do ponude, s današnjim cijenama.';
const FLY_EASE = Easing.bezier(0.34, 1.4, 0.44, 1);
const CRANE_EASE = Easing.bezier(0.3, 0, 0.2, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const trackRow = layout.materials.trackCells;
const TR = { x: trackRow[0].x, y: trackRow[0].y, w: 1282, h: trackRow[0].h };

type El = { key: string; file?: string; crop?: boolean; w: number; h: number; cx: number; cy: number; scale: number; rot: number; dx: number; dy: number; radius: number; cue: number };
const ELS: El[] = [
  { key: 'topbar', file: 'el-topbar.png', w: 1920, h: 99, cx: 960, cy: 66, scale: 0.6, rot: 0, dx: 0, dy: -140, radius: 10, cue: 4 },
  { key: 'price', file: 'el-price.png', w: 430, h: 244, cx: 255, cy: 250, scale: 0.82, rot: -4, dx: -520, dy: 0, radius: 12, cue: 7 },
  { key: 'al', file: 'idx-al.png', w: 175, h: 176, cx: 1640, cy: 300, scale: 1.15, rot: 4, dx: 520, dy: 0, radius: 12, cue: 10 },
  { key: 'qty', file: 'el-qty.png', w: 430, h: 425, cx: 1610, cy: 800, scale: 0.7, rot: -3, dx: 450, dy: 260, radius: 12, cue: 13 },
  { key: 'struct', file: 'el-structure.png', w: 430, h: 236, cx: 330, cy: 820, scale: 0.86, rot: 3, dx: -420, dy: 300, radius: 12, cue: 16 },
  { key: 'quote', file: 'qrow3.png', w: 1282, h: 61, cx: 960, cy: 966, scale: 0.62, rot: 1.5, dx: 0, dy: 320, radius: 8, cue: 19 },
  { key: 'mat', crop: true, w: TR.w, h: TR.h, cx: 1060, cy: 196, scale: 0.55, rot: -1.5, dx: 300, dy: -240, radius: 8, cue: 22 },
];

const DUST = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 439 + 137) % 1920, y0: (i * 613 + 271) % 1080, rise: 0.3 + (i % 5) * 0.11,
  swayAmp: 9 + (i % 4) * 5, swayFreq: 0.022 + (i % 3) * 0.008, phase: (i * 0.83) % (Math.PI * 2),
  size: 2.2 + (i % 3) * 0.9, opacity: 0.3 + ((i * 7) % 5) * 0.08,
}));

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const D = OUTRO_DURATION;
  const blur = interpolate(frame, [0, 24], [2, 16], { ...clamp, easing: Easing.bezier(0.4, 0, 0.4, 1) });
  const scrim = interpolate(frame, [0, 20], [0.45, 0.82], clamp);
  const recede = interpolate(frame, [42, 50], [0, 1], clamp);
  const craneT = interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: CRANE_EASE });
  const pushT = ramp(frame, 36, D - 36, EASE.smooth);
  const camScale = 1.06 - 0.06 * craneT + 0.035 * pushT;
  const camTilt = 4 * (1 - craneT);
  const sweepX = interpolate(frame, [2, 14], [-700, 2020], { ...clamp, easing: Easing.bezier(0.4, 0, 0.6, 1) });
  const sweepO = interpolate(frame, [2, 5, 11, 14], [0, 0.14, 0.14, 0], clamp);
  const stage = interpolate(frame, [42, 50, 58], [0, 0.8, 0.5], clamp);
  const rule = interpolate(frame, [58, 70], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const ruleExt = interpolate(frame, [58, 66], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const ruleExtFade = interpolate(frame, [66, 72], [1, 0], clamp);
  const tag = ramp(frame, 68, 12, EASE.out);
  const spacing = interpolate(frame, [62, 66], [0, 0.012], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const fadeOut = 1 - ramp(frame, D - 12, 11, EASE.exit);

  return (
    <AbsoluteFill style={{ background: C.bar }}>
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <AbsoluteFill style={{ transform: `perspective(1400px) rotateX(${camTilt}deg) scale(${camScale})`, transformOrigin: '50% 45%' }}>
          {/* the calculator page, defocused, as the backdrop */}
          <AbsoluteFill style={{ overflow: 'hidden' }}>
            <Img src={staticFile('textures/calc-full.png')} style={{ position: 'absolute', left: 0, top: -300, width: 1920, height: layout.calc.pageH, filter: `blur(${blur}px)`, transform: 'scale(1.08)' }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: `radial-gradient(1300px 820px at 50% 46%, rgba(15,25,34,${scrim * 0.92}), rgba(15,25,34,${Math.min(1, scrim * 1.12)}) 70%)` }} />
          <AbsoluteFill style={{ background: `radial-gradient(760px 380px at 960px 470px, ${rgba(C.dykem, 0.5)}, ${rgba(C.dykem, 0.16)} 55%, ${rgba(C.dykem, 0)} 78%)`, opacity: stage }} />
          {ELS.map((el) => {
            if (frame < el.cue) return null;
            const posAt = (fr: number) => {
              const tt = interpolate(fr, [el.cue, el.cue + 12], [0, 1], { ...clamp, easing: FLY_EASE });
              return [el.dx * (1 - tt), el.dy * (1 - tt)];
            };
            const t = interpolate(frame, [el.cue, el.cue + 12], [0, 1], { ...clamp, easing: FLY_EASE });
            const op = interpolate(frame, [el.cue, el.cue + 3], [0, 1], clamp) * (1 - 0.18 * recede);
            const [x, y] = posAt(frame);
            const vx = velocity((fr) => posAt(fr)[0], frame);
            const vy = velocity((fr) => posAt(fr)[1], frame);
            const land = interpolate(frame, [el.cue + 9, el.cue + 12, el.cue + 16], [0, 1, 0], clamp);
            const air = Math.max(0, 1 - t);
            const scale = el.scale * (1.12 - 0.12 * t) * (1 - 0.015 * land);
            const shadow = `0 ${14 + 26 * air - 5 * land}px ${34 + 40 * air - 12 * land}px rgba(0,0,0,${0.4 + 0.1 * air}), 0 2px 6px rgba(0,0,0,0.25)`;
            return (
              <SpeedBlur key={el.key} vx={vx} vy={vy} amount={0.3} max={22}>
                <div style={{ position: 'absolute', left: el.cx - el.w / 2, top: el.cy - el.h / 2, width: el.w, height: el.h, borderRadius: el.radius, overflow: 'hidden',
                  transform: `translate(${x}px, ${y}px) rotate(${el.rot * (2 - t)}deg) scale(${scale})`, opacity: op, boxShadow: shadow,
                  filter: `saturate(${1 - 0.1 * recede}) brightness(${1 - 0.12 * recede})`,
                  ...(el.crop ? { background: `#fff url(${staticFile('textures/materials-top-4x.png')}) -${TR.x}px -${TR.y}px / 1920px 1100px no-repeat` } : null) }}>
                  {el.file ? <Img src={staticFile(`textures/${el.file}`)} style={{ position: 'absolute', inset: 0, width: el.w, height: el.h }} /> : null}
                </div>
              </SpeedBlur>
            );
          })}
        </AbsoluteFill>

        {/* cyan dust */}
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          {DUST.map((d, i) => {
            const y = (((d.y0 - frame * d.rise) % 1080) + 1080) % 1080;
            const x = d.x + Math.sin(frame * d.swayFreq + d.phase) * d.swayAmp;
            const tw = 0.7 + 0.3 * Math.sin(frame * 0.21 + d.phase * 3);
            return <div key={i} style={{ position: 'absolute', left: x, top: y, width: d.size, height: d.size, borderRadius: '50%', background: '#bfefff', opacity: d.opacity * tw * interpolate(frame, [20, 40], [0, 1], clamp), boxShadow: `0 0 ${d.size * 2.5}px ${d.size * 0.6}px rgba(70,198,224,0.55)` }} />;
          })}
        </AbsoluteFill>

        {sweepO > 0 ? (
          <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: sweepX - 300, width: 600, opacity: sweepO, background: 'linear-gradient(90deg, rgba(160,180,255,0), rgba(200,214,255,1) 50%, rgba(160,180,255,0))' }} />
          </AbsoluteFill>
        ) : null}

        {/* wordmark sign-off */}
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginTop: -40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
              {(() => {
                const t = interpolate(frame, [38, 46], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
                return (
                  <div style={{ opacity: t, transform: `translateY(${(1 - t) * 28}px) scale(${1.35 - 0.35 * t})`, filter: t < 0.995 ? `blur(${(1 - t) * 8}px)` : undefined }}>
                    <Logo size={150} />
                  </div>
                );
              })()}
              <div style={{ fontFamily: FONT, ...wdth(80), fontSize: 178, fontWeight: 700, lineHeight: 1, color: C.barInk, letterSpacing: `${0.01 + spacing}em`, display: 'flex', whiteSpace: 'pre', textShadow: '0 14px 40px rgba(0,0,0,0.45)' }}>
                {WORDMARK.map((ch, i) => {
                  const d = Math.round(42 + i * 1.8);
                  const t = interpolate(frame, [d, d + 8], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
                  return <span key={i} style={{ display: 'inline-block', opacity: t, transform: `translateY(${(1 - t) * 28}px) scale(${1.35 - 0.35 * t})`, filter: `blur(${(1 - t) * 8}px)`, color: i === 3 ? C.cyan : undefined, margin: i === 3 ? '0 0.02em' : undefined }}>{ch}</span>;
                })}
              </div>
            </div>
            <div style={{ position: 'relative', height: 7, width: 280, margin: '42px auto 0' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 4, background: C.dykem, transform: `scaleX(${rule})`, boxShadow: '0 0 20px rgba(47,75,216,0.6)' }} />
              {ruleExt > 0 && ruleExtFade > 0 ? (
                <>
                  <div style={{ position: 'absolute', top: 3, height: 1, right: '100%', width: 200 * ruleExt, background: C.cyan, opacity: ruleExtFade }} />
                  <div style={{ position: 'absolute', top: 3, height: 1, left: '100%', width: 200 * ruleExt, background: C.cyan, opacity: ruleExtFade }} />
                </>
              ) : null}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 46, fontWeight: 500, color: '#c9d4de', marginTop: 34, opacity: tag, transform: `translateY(${(1 - tag) * 8}px)` }}>{TAGLINE}</div>
          </div>
        </AbsoluteFill>
        <Grain opacity={0.06} blend="soft-light" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
