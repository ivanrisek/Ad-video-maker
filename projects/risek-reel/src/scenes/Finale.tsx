// Outro: logo lockup holds with URL and CTA after the website walkthrough.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE, ramp, mix } from '../lib/Polish';
import { C, DISPLAY, MONO } from '../brand';
import { LogoWithSheen } from '../components';


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
