// Instagram Reel (9:16, 1080×1920) of the walkthrough: brand on top, the full 16:9 film across the width,
// and the film's captions re-set large under it (kept inside the Reels safe zone: top 220 / bottom 420 px).
import React from 'react';
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { C, FONT, Logo, WORDMARK, rgba, useFonts, wdth } from '../lib/Brand';
import { Walkthrough, WT_CAPTIONS, WT_SHOTS } from '../wt/Walkthrough';
import { CHAPTERS, PAGE_TOUR_DURATION, PUSH_STARTS } from '../wt/PageTour';

export const REEL = { w: 1080, h: 1920, videoY: 620, videoH: 608 };
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const BigCaption: React.FC<{ text: string; duration: number }> = ({ text, duration }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.25, 1) });
  const out = interpolate(f, [duration - 7, duration], [1, 0], clamp);
  const parts = text.split(' · ');
  return (
    <div style={{ position: 'absolute', top: REEL.videoY + REEL.videoH + 64, left: 70, right: 70, display: 'flex', justifyContent: 'center', opacity: t * out, transform: `translateY(${((1 - t) * 18).toFixed(2)}px)` }}>
      <div style={{ textAlign: 'center', fontFamily: FONT, fontWeight: 700, color: C.barInk, fontSize: 50, lineHeight: 1.18, textWrap: 'balance' }}>
        {parts.map((p, i) => (
          <div key={i} style={{ color: i === 0 ? C.barInk : C.cyan, fontSize: i === 0 ? 50 : 44, marginTop: i === 0 ? 0 : 10 }}>{p}</div>
        ))}
      </div>
    </div>
  );
};

// page-tour chapter headlines, re-set large under the film while each chapter holds
const TOUR_TEXT = CHAPTERS.map((c, i) => {
  const from = WT_SHOTS.tour.from + Math.round(i === 0 ? 6 : PUSH_STARTS[i - 1] + 14);
  const to = WT_SHOTS.tour.from + Math.round(i < PUSH_STARTS.length ? PUSH_STARTS[i] + 2 : PAGE_TOUR_DURATION);
  return { from, duration: to - from, eyebrow: `${c.num} · ${c.name}`, title: c.sub };
});
const ChapterText: React.FC<{ eyebrow: string; title: string; duration: number }> = ({ eyebrow, title, duration }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.25, 1) });
  const out = interpolate(f, [duration - 6, duration], [1, 0], clamp);
  return (
    <div style={{ position: 'absolute', top: REEL.videoY + REEL.videoH + 64, left: 70, right: 70, textAlign: 'center', opacity: t * out, transform: `translateY(${((1 - t) * 18).toFixed(2)}px)` }}>
      <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.cyan }}>{eyebrow}</div>
      <div style={{ fontFamily: FONT, fontSize: 46, fontWeight: 600, lineHeight: 1.22, color: C.barInk, marginTop: 16, textWrap: 'balance' }}>{title}</div>
    </div>
  );
};

export const Reel: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => {
  useFonts();
  const k = REEL.w / 1920;
  return (
    <AbsoluteFill style={{ background: C.bar }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 30% at 50% ${REEL.videoY + REEL.videoH / 2}px, ${rgba(C.dykem, 0.35)} 0%, ${rgba(C.dykem, 0)} 70%)` }} />
      <div style={{ position: 'absolute', top: 250, height: REEL.videoY - 250, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 22 }}>
          <Logo size={84} />
          <div style={{ fontFamily: FONT, ...wdth(80), fontSize: 112, fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1, color: C.barInk, whiteSpace: 'pre' }}>
            {WORDMARK.map((ch, i) => <span key={i} style={{ color: i === 3 ? C.cyan : undefined, margin: i === 3 ? '0 0.02em' : undefined }}>{ch}</span>)}
          </div>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 500, letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase' }}>Kalkulacija CNC obrade i ponude</div>
      </div>
      <div style={{ position: 'absolute', top: REEL.videoY, left: 0, width: REEL.w, height: REEL.videoH, overflow: 'hidden', boxShadow: `0 30px 80px rgba(0,0,0,0.55)` }}>
        <div style={{ width: 1920, height: 1080, transform: `scale(${k})`, transformOrigin: '0 0' }}>
          <Walkthrough bgm={bgm} captions={false} />
        </div>
      </div>
      {TOUR_TEXT.map((c) => (
        <Sequence key={`ch-${c.from}`} from={c.from} durationInFrames={c.duration}><ChapterText eyebrow={c.eyebrow} title={c.title} duration={c.duration} /></Sequence>
      ))}
      {WT_CAPTIONS.map((c) => (
        <Sequence key={c.from} from={c.from} durationInFrames={c.duration}><BigCaption text={c.text} duration={c.duration} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
