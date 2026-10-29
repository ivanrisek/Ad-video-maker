// Slogan + outro. The site's line "Don't take a risk, take RISEK" lands phrase by phrase on beats over
// the site's energy film, then the logo lockup holds with URL and CTA.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp, mix } from '../lib/Polish';
import { C, DISPLAY, MONO } from '../brand';
import { LogoWithSheen } from '../components';
import { bF, SHOTS } from '../timeline';

const SL = (n: number) => bF(n) - SHOTS.slogan.from;
export const SLOGAN_DUR = SHOTS.slogan.to - SHOTS.slogan.from;

// element-level slam: 6f scale/blur settle, no full-frame shake
const Slam: React.FC<{ at: number; until?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, until, children, style }) => {
  const f = useCurrentFrame();
  if (f < at || (until !== undefined && f >= until)) return null;
  const p = ramp(f, at, 7, EASE.snappy);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `scale(${mix(1.14, 1, p).toFixed(4)})`,
        opacity: mix(0.2, 1, p),
        filter: p >= 0.999 ? undefined : `blur(${((1 - p) * 10).toFixed(2)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Slogan: React.FC = () => {
  const f = useCurrentFrame();
  const bg = ramp(f, 0, 10, EASE.out);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ opacity: 0.5 * bg, transform: `scale(${(1 + 0.08 * ramp(f, 0, SLOGAN_DUR, EASE.linear)).toFixed(4)})` }}>
        <OffthreadVideo src={staticFile('video/energy.mp4')} muted trimBefore={60} playbackRate={1.4} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 48%, rgba(7,10,20,0.55), rgba(7,10,20,0.9) 100%)' }} />
      <Slam at={0} until={SL(56)} style={{ top: 830 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: '-0.035em', color: '#e6e9ee', lineHeight: 1.04 }}>
          Don&apos;t take
          <br />a risk.
        </div>
      </Slam>
      <Slam at={SL(56)} until={SL(57)} style={{ top: 880 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, letterSpacing: '-0.04em', color: '#e6e9ee' }}>Take</div>
      </Slam>
      <Slam at={SL(57)} style={{ top: 850 }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 200,
            letterSpacing: '0.06em',
            lineHeight: 1,
            backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #c8d3e6 50%, #8a97ad 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(120,175,255,0.45))',
          }}
        >
          RISEK
        </div>
      </Slam>
    </AbsoluteFill>
  );
};

export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const lp = ramp(f, 0, 20, EASE.snappy);
  const glow = ramp(f, 0, 30, EASE.out);
  const e = (s: number) => ramp(f, s, 18, EASE.out);
  const fade = (p: number, dy = 20): React.CSSProperties => ({
    opacity: p,
    transform: `translateY(${((1 - p) * dy).toFixed(2)}px)`,
    filter: p >= 0.999 ? undefined : `blur(${((1 - p) * 8).toFixed(2)}px)`,
  });
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 30% at 50% 44%, rgba(${C.iceRGB},${(0.16 * glow).toFixed(3)}), rgba(7,10,20,0) 70%)` }} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 460,
          top: 520,
          opacity: lp,
          transform: `scale(${mix(1.12, 1, lp).toFixed(4)})`,
          filter: lp >= 0.999 ? undefined : `blur(${((1 - lp) * 16).toFixed(2)}px)`,
        }}
      >
        <LogoWithSheen src="img/risek2.png" width={920} sheenStart={18} sheenDur={26} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: MONO, fontSize: 30, letterSpacing: '0.14em', color: C.text2, ...fade(e(20)) }}>
        IT · PROGRAMIRANJE · AI · WEB
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 600, fontSize: 58, letterSpacing: '-0.01em', color: '#f1f3f6', ...fade(e(26)) }}>
        risek-technology.com
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', ...fade(e(32)) }}>
        <div
          style={{
            padding: '24px 52px',
            borderRadius: 9999,
            border: '1.5px solid rgba(255,255,255,0.32)',
            background: 'rgba(255,255,255,0.05)',
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          <span style={{ letterSpacing: '0.05em', marginRight: 18, opacity: 0.8 }}>&gt;_</span>POŠALJITE UPIT
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center', fontFamily: MONO, fontSize: 24, letterSpacing: '0.16em', color: C.muted, ...fade(e(40)) }}>
        KRAPINA · HRVATSKA
      </div>
    </AbsoluteFill>
  );
};
