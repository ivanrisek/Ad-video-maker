// Instagram feed frame (4:5, 1080×1350) for the walkthrough film: brand wordmark above, tagline below.
// The 16:9 film (scaled to 1080×608) is laid over the empty middle band by scripts/instagram.sh.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, FONT, Logo, WORDMARK, rgba, useFonts, wdth } from '../lib/Brand';

export const IG = { w: 1080, h: 1350, videoY: 371, videoH: 608 };

export const IgFrame: React.FC = () => {
  useFonts();
  const mid = IG.videoY + IG.videoH / 2;
  return (
    <AbsoluteFill style={{ background: C.bar }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 45% at 50% ${mid}px, ${rgba(C.dykem, 0.35)} 0%, ${rgba(C.dykem, 0)} 70%)` }} />
      <div style={{ position: 'absolute', top: 0, height: IG.videoY, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 22 }}>
          <Logo size={78} />
          <div style={{ fontFamily: FONT, ...wdth(80), fontSize: 104, fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1, color: C.barInk, whiteSpace: 'pre' }}>
            {WORDMARK.map((ch, i) => <span key={i} style={{ color: i === 3 ? C.cyan : undefined, margin: i === 3 ? '0 0.02em' : undefined }}>{ch}</span>)}
          </div>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 500, letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase' }}>Kalkulacija CNC obrade i ponude</div>
      </div>
      <div style={{ position: 'absolute', top: IG.videoY + IG.videoH, bottom: 0, left: 60, right: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT, fontSize: 54, fontWeight: 700, lineHeight: 1.12, color: C.barInk }}>
          Od upisa dijela<br />do <span style={{ color: C.cyan }}>gotove ponude.</span>
        </div>
        <div style={{ width: 64, height: 4, borderRadius: 2, background: C.dykem }} />
      </div>
    </AbsoluteFill>
  );
};
