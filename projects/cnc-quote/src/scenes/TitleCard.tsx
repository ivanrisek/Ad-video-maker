// paper-title-card, re-skinned: navy field instead of paper, Archivo heading cut (wdth 72, 720)
// instead of serif, one cobalt-blue accent word (upright, the app has no italics), cobalt underline.
// Motion is the card's: word i delay 4+i·4 over 9f, scale 1.28→1 + blur 7→0, underline 16→34f, 8f fade.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, FONT, wdth } from '../lib/Brand';
import { NavyStage } from './BrandOpen';

export const parseWords = (text: string) =>
  text.split(/\s+/).filter(Boolean).map((w) => {
    const m = w.match(/^\*(.+)\*$/);
    return m ? { text: m[1], accent: true } : { text: w, accent: false };
  });

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const TitleCard: React.FC<{ text: string; duration: number; sub?: string }> = ({ text, duration, sub }) => {
  const frame = useCurrentFrame();
  const words = parseWords(text);
  const fade = interpolate(frame, [duration - 8, duration], [1, 0], clamp);
  const fadeIn = interpolate(frame, [0, 4], [0, 1], clamp);
  const underline = interpolate(frame, [16, 34], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const subT = interpolate(frame, [14, 26], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <NavyStage light={0.8 * fadeIn}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 1560 }}>
            <div style={{ fontFamily: FONT, ...wdth(72), fontSize: 132, fontWeight: 720, lineHeight: 1.06, letterSpacing: '-0.01em', color: C.barInk, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.24em' }}>
              {words.map((w, i) => {
                if (w.text === '/') return <span key={i} style={{ flexBasis: '100%', height: 0 }} />;
                const d = 4 + i * 4;
                const t = interpolate(frame, [d, d + 9], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
                return (
                  <span key={i} style={{ display: 'inline-block', opacity: t, transform: `scale(${1.28 - 0.28 * t})`, filter: `blur(${(1 - t) * 7}px)`, color: w.accent ? '#8199ff' : undefined }}>
                    {w.text}
                  </span>
                );
              })}
            </div>
            <div style={{ height: 7, width: 220, margin: '44px auto 0', borderRadius: 4, background: C.dykem, transform: `scaleX(${underline})`, boxShadow: `0 0 18px rgba(47,75,216,0.55)` }} />
            {sub ? (
              <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginTop: 34, opacity: subT }}>{sub}</div>
            ) : null}
          </div>
        </AbsoluteFill>
      </NavyStage>
    </AbsoluteFill>
  );
};
