import React from 'react';
import { OffthreadVideo, interpolate, Easing, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp } from './lib/Polish';
import { C, DISPLAY, MONO } from './brand';

// ───────── blur-slide (card: typography/blur-slide) ─────────
// y / blur / opacity share ONE progress p on one ease — words surface out of defocus.
export type Word = { text: string; start: number; dur?: number; style?: React.CSSProperties };

export const BlurWords: React.FC<{
  words: Word[];
  dy?: number;
  blur?: number;
  gap?: string;
  style?: React.CSSProperties;
  frameOverride?: number;
}> = ({ words, dy = 50, blur = 16, gap = '0.26em', style, frameOverride }) => {
  const f = useCurrentFrame();
  const frame = frameOverride ?? f;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: gap, ...style }}>
      {words.map((w, i) => {
        const p = ramp(frame, w.start, w.dur ?? 22, EASE.out);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${((1 - p) * dy).toFixed(2)}px)`,
              filter: p >= 0.999 ? undefined : `blur(${((1 - p) * blur).toFixed(2)}px)`,
              ...w.style,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

export const words = (text: string, start: number, gap = 4, dur = 22, style?: React.CSSProperties): Word[] =>
  text.split(' ').map((t, i) => ({ text: t, start: start + i * gap, dur, style }));

// Single block blur-slide (eyebrows, small lines)
export const BlurIn: React.FC<{ start: number; dur?: number; dy?: number; blur?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  start,
  dur = 18,
  dy = 24,
  blur = 8,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, dur, EASE.out);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${((1 - p) * dy).toFixed(2)}px)`,
        filter: p >= 0.999 ? undefined : `blur(${((1 - p) * blur).toFixed(2)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ───────── browser window around real footage (the site / the user's recording) ─────────
export const BrowserCard: React.FC<{
  src: string;
  width: number;
  aspect: number; // h / w of the footage
  url?: string;
  trimBefore?: number;
  playbackRate?: number;
  style?: React.CSSProperties;
}> = ({ src, width, aspect, url = 'risek-technology.com', trimBefore = 0, playbackRate = 1, style }) => {
  const barH = Math.round(width * 0.045);
  const h = Math.round(width * aspect);
  return (
    <div
      style={{
        width,
        borderRadius: 22,
        overflow: 'hidden',
        background: C.surface,
        border: `1px solid ${C.borderStrong}`,
        boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 30px 80px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,0,0,0.4), 0 0 120px -30px rgba(120,175,255,0.35)',
        ...style,
      }}
    >
      <div style={{ height: barH, display: 'flex', alignItems: 'center', gap: barH * 0.22, padding: `0 ${barH * 0.5}px`, borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(180deg,#141a2e,#0d1222)' }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: barH * 0.26, height: barH * 0.26, borderRadius: 99, background: c, opacity: 0.85 }} />
        ))}
        <div
          style={{
            marginLeft: barH * 0.4,
            flex: 1,
            height: barH * 0.56,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: barH * 0.4,
            fontFamily: MONO,
            fontSize: barH * 0.3,
            color: C.text2,
          }}
        >
          {url}
        </div>
      </div>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        trimBefore={trimBefore}
        playbackRate={playbackRate}
        style={{ display: 'block', width, height: h, objectFit: 'cover' }}
      />
    </div>
  );
};

// ───────── single sheen over a logo image (card: light-play-moves · sheen), once per shot ─────────
export const LogoWithSheen: React.FC<{ src: string; width: number; sheenStart: number; sheenDur?: number; style?: React.CSSProperties }> = ({
  src,
  width,
  sheenStart,
  sheenDur = 26,
  style,
}) => {
  const frame = useCurrentFrame();
  const s = ramp(frame, sheenStart, sheenDur, EASE.smooth);
  const active = frame >= sheenStart && frame <= sheenStart + sheenDur;
  const x = -40 + s * 180; // % across
  const url = `url(${staticFile(src)})`;
  return (
    <div style={{ position: 'relative', width, ...style }}>
      <img src={staticFile(src)} style={{ width, display: 'block' }} />
      {active && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: url,
            maskImage: url,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            background: `linear-gradient(105deg, transparent ${x - 14}%, rgba(255,255,255,0.0) ${x - 10}%, rgba(225,238,255,0.95) ${x}%, rgba(255,255,255,0) ${x + 10}%, transparent ${x + 14}%)`,
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  );
};

// ───────── gradient-word-sweep, re-skinned to RISEK ice blue (card: typography/gradient-word-sweep) ─────────
const mulberry32 = (a: number) => () => {
  let t = (a += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const GRAD = 'linear-gradient(92deg, #6fa6ff 0%, #a9ccff 30%, #ffffff 55%, #b9d5ff 78%, #78afff 100%)';
const PAD = 90;
const at = (x: number) => `calc(${PAD}px + (100% - ${PAD * 2}px) * ${(Math.max(-20, Math.min(120, x)) / 100).toFixed(4)})`;
const Halo: React.FC<{ mask?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ mask, style, children }) => (
  <span
    aria-hidden
    style={{
      position: 'absolute',
      left: -PAD,
      top: -PAD,
      right: -PAD,
      bottom: -PAD,
      padding: PAD,
      ...(mask ? { WebkitMaskImage: mask, maskImage: mask } : {}),
      ...style,
    }}
  >
    <span style={{ position: 'relative', display: 'block', width: '100%', height: '100%' }}>{children}</span>
  </span>
);

const rnd = mulberry32(20261029);
const FLICKER = Array.from({ length: 200 }, () => rnd());
const BOLTS = Array.from({ length: 8 }, (_, k) => {
  const x0 = 40 + rnd() * 300;
  const x1 = x0 + 180 + rnd() * 320;
  const yBase = 10 + rnd() * 30;
  const n = 7 + Math.floor(rnd() * 3);
  let d = `M ${x0.toFixed(1)} ${(yBase + 30).toFixed(1)}`;
  for (let i = 1; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n + (rnd() - 0.5) * 20;
    const y = yBase + Math.sin((i / n) * Math.PI) * -20 + (rnd() - 0.5) * 26 + (i === n ? 34 : 0) + k * 0;
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
});

export const IceSweepWord: React.FC<{ text: string; fillStart: number; fillDur?: number; style: React.CSSProperties; boltWidth?: number }> = ({
  text,
  fillStart,
  fillDur = 18,
  style,
  boltWidth = 900,
}) => {
  const frame = useCurrentFrame();
  const FILL_END = fillStart + fillDur;
  const p = interpolate(frame, [fillStart, FILL_END], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const pPct = p * 100;
  const filling = frame >= fillStart && frame <= FILL_END + 4;
  const headFade = interpolate(frame, [FILL_END, FILL_END + 6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const trailFade = interpolate(frame, [FILL_END, FILL_END + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const TRAIL = 34;
  const trailMask = `linear-gradient(90deg, transparent 0%, transparent ${at(pPct - TRAIL)}, rgba(0,0,0,0.9) ${at(pPct - 3)}, rgba(0,0,0,0.9) ${at(pPct + 1)}, transparent ${at(pPct + 6)})`;
  const headMask = `linear-gradient(90deg, transparent 0%, transparent ${at(pPct - 12)}, #000 ${at(pPct - 6)}, #000 ${at(pPct - 1)}, transparent ${at(pPct + 2)})`;
  // sparse, scheduled lightning (≤1 on screen, gaps ≥9f), thin, in brand ice blue
  const LIGHT = FILL_END + 3;
  const flashes = [2, 13, 25, 38].map((d, k) => ({ at: LIGHT + d, life: 3, bolt: (k * 3 + 1) % BOLTS.length }));
  const active = flashes.filter((fl) => frame >= fl.at && frame < fl.at + fl.life);
  const noise = FLICKER[Math.max(0, Math.min(frame, FLICKER.length - 1))];
  const glowLvl = p * (0.82 + 0.18 * noise) + (active.length ? 0.3 : 0);
  const softMask = (soft: number) => (p >= 1 ? undefined : `linear-gradient(90deg, #000 0%, #000 ${at(pPct - soft)}, transparent ${at(pPct + soft * 0.6)})`);
  const gradText: React.CSSProperties = { position: 'absolute', inset: 0, backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };
  return (
    <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', ...style }}>
      <span>{text}</span>
      <Halo mask={softMask(14)} style={{ opacity: 0.5 * glowLvl }}>
        <span style={{ ...gradText, filter: 'blur(40px) saturate(1.4)', transform: 'scale(1.04)' }}>{text}</span>
      </Halo>
      <Halo mask={softMask(10)} style={{ opacity: 0.55 * glowLvl }}>
        <span style={{ ...gradText, filter: 'blur(16px) brightness(1.1)' }}>{text}</span>
      </Halo>
      <Halo mask={softMask(7)} style={{ opacity: 0.62 * Math.min(1, glowLvl + 0.1) }}>
        <span style={{ ...gradText, filter: 'blur(5px) brightness(1.2)' }}>{text}</span>
      </Halo>
      <span aria-hidden style={{ ...gradText, clipPath: `inset(-25% ${100 - pPct}% -25% 0)` }}>
        {text}
      </span>
      {trailFade > 0.01 && (
        <Halo mask={trailMask} style={{ opacity: 0.95 * trailFade }}>
          <span style={{ ...gradText, filter: 'blur(9px) saturate(1.5) brightness(1.7)' }}>{text}</span>
        </Halo>
      )}
      {filling && p < 1 && (
        <Halo mask={headMask} style={{ opacity: 0.9 * headFade }}>
          <span style={{ position: 'absolute', inset: 0, color: '#fff', filter: 'blur(3px)', textShadow: '0 0 22px rgba(255,255,255,0.9), 0 0 55px rgba(150,195,255,0.85)' }}>{text}</span>
        </Halo>
      )}
      <svg aria-hidden viewBox={`0 0 ${boltWidth} 160`} style={{ position: 'absolute', left: 0, top: -40, width: boltWidth, height: 160, overflow: 'visible', pointerEvents: 'none' }}>
        {active.map((fl) => {
          const decay = 1 - (frame - fl.at) / fl.life;
          const d = BOLTS[fl.bolt];
          return (
            <g key={fl.at} opacity={Math.min(1, 1.1 * decay)}>
              <path d={d} fill="none" stroke="rgba(90,150,255,0.6)" strokeWidth={6} style={{ filter: 'blur(6px)' }} />
              <path d={d} fill="none" stroke="rgba(150,195,255,0.9)" strokeWidth={2.4} style={{ filter: 'blur(1.5px)' }} />
              <path d={d} fill="none" stroke="#eef5ff" strokeWidth={1.3} />
            </g>
          );
        })}
      </svg>
    </span>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.text2, display: 'flex', alignItems: 'center', gap: 14, ...style }}>
    <span style={{ width: 10, height: 10, borderRadius: 99, background: C.ice, boxShadow: `0 0 14px ${C.ice}` }} />
    {children}
  </div>
);

export const display = (size: number, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: size,
  lineHeight: 1.04,
  letterSpacing: size >= 80 ? '-0.035em' : '-0.02em',
  color: C.text,
  ...extra,
});
