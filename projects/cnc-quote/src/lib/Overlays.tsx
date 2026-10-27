import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, FONT } from './Brand';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Bottom narration strip over the live shots: navy pill, caps Archivo, cyan square. */
export const Caption: React.FC<{ text: string; duration: number }> = ({ text, duration }) => {
  const frame = useCurrentFrame();
  const inT = interpolate(frame, [0, 8], [0, 1], clamp);
  const outT = interpolate(frame, [duration - 8, duration], [1, 0], clamp);
  return (
    <div style={{
      position: 'absolute', left: '50%', bottom: 46, transform: `translate(-50%, ${(1 - inT) * 10}px)`, opacity: inT * outT,
      display: 'flex', alignItems: 'center', gap: 20, padding: '14px 34px', borderRadius: 16,
      background: 'rgba(15,25,34,0.92)', boxShadow: '0 10px 30px -10px rgba(15,25,34,0.5)',
      fontFamily: FONT, fontSize: 56, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.barInk, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 14, height: 14, background: '#8199ff', borderRadius: 3, display: 'inline-block' }} />
      <span>{text}</span>
    </div>
  );
};

/** Cool-white flash that straddles a hard cut (from = cut − 5, 10f). */
export const FlashCut: React.FC<{ duration?: number; strength?: number }> = ({ duration = 10, strength = 0.5 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, duration * 0.45, duration], [0, strength, 0], clamp);
  return <AbsoluteFill style={{ pointerEvents: 'none', opacity: o, background: 'radial-gradient(ellipse at 50% 45%, rgba(246,249,255,1), rgba(233,237,253,0.7) 55%, rgba(233,237,253,0.2) 85%)' }} />;
};
