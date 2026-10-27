// brand-ink-open, re-skinned for CNC.Quote: on the app's navy (#0f1922) a cobalt crosshair (tool centre)
// draws itself, the logo + "CNC.Quote" wordmark letterpress in glyph by glyph with a cyan under-glint,
// a caps kicker types out, the lockup holds a full second, then lifts out.
// Timing follows demos/typography/brand-ink-open/BrandInkOpen.tsx (crosshair 0–18f, letters 10+i·3 / 12f,
// kicker 0.7f/char from 28f, hold ≥30f, 7f exit).
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, FONT, Logo, WORDMARK, rgba, wdth } from '../lib/Brand';
import { Grain } from '../lib/Polish';

export const BRAND_OPEN_DURATION = 100;
const KICKER = 'Kalkulacija CNC obrade i ponude';
const OUT = 93; // exit 93→100; wordmark complete at 10+9·3+12 = 49 → hold 49–93 (44f)

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const NavyStage: React.FC<{ light?: number; children?: React.ReactNode }> = ({ light = 1, children }) => (
  <AbsoluteFill style={{ background: C.bar }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 55% at 50% 42%, ${rgba(C.dykem, 0.26 * light)} 0%, ${rgba(C.dykem, 0)} 70%)` }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(4,8,12,0.55) 100%)` }} />
    {children}
    <Grain opacity={0.07} blend="soft-light" />
  </AbsoluteFill>
);

export const BrandOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const vDraw = interpolate(frame, [0, 9], [100, 0], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const hDraw = interpolate(frame, [8, 18], [100, 0], clamp);
  const crossFade = interpolate(frame, [24, 34], [1, 0], clamp);

  const kickStart = 30;
  const perChar = 0.7;
  const kickChars = Math.floor(Math.max(0, frame - kickStart) / perChar);
  const kickDone = kickStart + KICKER.length * perChar;
  const cursorOn = frame >= kickStart && (frame < kickDone || (frame <= 88 && Math.floor((frame - kickDone) / 3) % 2 === 0));

  const out = interpolate(frame, [OUT, BRAND_OPEN_DURATION], [0, 1], { ...clamp, easing: Easing.bezier(0.4, 0, 0.5, 1) });
  const logoT = interpolate(frame, [6, 18], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.25, 1) });

  return (
    <NavyStage light={1 - out * 0.5}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', opacity: 1 - out, transform: `translateY(${-out * 40}px) scale(${1 - out * 0.12})` }}>
          {/* crosshair: the tool centre, drawn by an invisible cobalt pen */}
          <svg width={72} height={72} viewBox="0 0 64 64" style={{ display: 'block', margin: '0 auto 40px', opacity: crossFade }}>
            <line x1={32} y1={2} x2={32} y2={62} stroke={C.cyan} strokeWidth={4} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={vDraw} />
            <line x1={2} y1={32} x2={62} y2={32} stroke={C.cyan} strokeWidth={4} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={hDraw} />
            <circle cx={32} cy={32} r={12} fill="none" stroke={C.cyan} strokeWidth={2.5} pathLength={100} strokeDasharray={100} strokeDashoffset={hDraw} opacity={0.8} />
          </svg>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 34 }}>
            <div style={{ opacity: logoT, transform: `scale(${1.5 - 0.5 * logoT})`, filter: `blur(${(1 - logoT) * 6}px)` }}>
              <Logo size={128} draw={interpolate(frame, [8, 24], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) })} />
            </div>
            <div style={{ fontFamily: FONT, ...wdth(80), fontSize: 168, fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1, color: C.barInk, display: 'inline-flex', alignItems: 'flex-end', whiteSpace: 'pre' }}>
              {WORDMARK.map((ch, i) => {
                const delay = 10 + i * 3;
                const t = interpolate(frame, [delay, delay + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.25, 1) });
                const gc = delay + 12;
                const glint = interpolate(frame, [gc - 4, gc, gc + 4], [0, 1, 0], clamp);
                return (
                  <span key={i} style={{ position: 'relative', display: 'inline-block', opacity: t, transform: `scale(${1.6 - 0.6 * t})`, transformOrigin: 'center bottom', filter: `blur(${(1 - t) * 6}px)`, color: i === 3 ? C.cyan : undefined, margin: i === 3 ? '0 0.02em' : undefined }}>
                    {ch}
                    <span style={{ position: 'absolute', left: '50%', bottom: -10, transform: 'translateX(-50%)', width: `${glint * 100}%`, height: 3, background: C.cyan, opacity: glint, borderRadius: 2 }} />
                  </span>
                );
              })}
            </div>
          </div>

          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 500, letterSpacing: '0.16em', color: C.dim, marginTop: 44, textTransform: 'uppercase', height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ whiteSpace: 'pre' }}>{KICKER.slice(0, kickChars)}</span>
            <span style={{ display: 'inline-block', width: 16, height: 32, marginLeft: 6, background: C.dykem, opacity: cursorOn ? 0.95 : 0 }} />
          </div>
        </div>
      </AbsoluteFill>
    </NavyStage>
  );
};
