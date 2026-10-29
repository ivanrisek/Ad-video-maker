import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp } from './lib/Polish';
import { SHOTS, MUSIC_TRIM, TOTAL, WALK, bF } from './timeline';
import { Opening } from './scenes/Opening';
import { Outro } from './scenes/Finale';

const seq = (s: { from: number; to: number }) => ({ from: s.from, durationInFrames: s.to - s.from });

// SFX pinned to frames. trim = frames cut from the sample start.
type Sfx = { at: number; src: string; volume: number; trim?: number };
const SFX: Sfx[] = [
  { at: 4, src: 'light-aura', volume: 0.3 },
  { at: bF(6), src: 'switch-tap', volume: 0.85 },
  { at: 51, src: 'riser-cine', volume: 0.45, trim: 50 },
  { at: bF(6) + 8, src: 'warp-slide', volume: 0.55 },
  { at: bF(10) - 2, src: 'impact-deep-whoosh', volume: 0.6 }, // tunnel exit on the drop
  // finger taps in the walkthrough: tap foley, plus a soft air move when a project opens
  ...WALK.taps.map((t) => ({ at: WALK.from + t.frame, src: 'switch-tap', volume: 0.6 })),
  ...WALK.taps.filter((t) => t.kind === 'open').map((t) => ({ at: WALK.from + t.frame + 1, src: 'transition-soft', volume: 0.28 })),
  { at: SHOTS.outro.from - 2, src: 'impact-deep-whoosh', volume: 0.5 }, // logo
  { at: SHOTS.outro.from + 18, src: 'sparkle', volume: 0.3 },
];

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const drop = bF(10);
  const up = ramp(f, drop - 14, 14, EASE.exit);
  const down = 1 - ramp(f, drop, 16, EASE.out);
  const o = f < drop ? up : down;
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 48%, #ffffff 0%, #dbe8ff 60%, #b9cff5 100%)', opacity: 0.96 * o }} />;
};

// The real site, captured frame by frame at 1080x1920 (mobile layout), straight scroll + taps.
const Walk: React.FC = () => {
  const f = useCurrentFrame();
  const dur = SHOTS.walk.to - SHOTS.walk.from;
  const out = ramp(f, dur - 14, 14, EASE.exit);
  return (
    <AbsoluteFill style={{ background: '#070a14' }}>
      <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${(1 + 0.04 * out).toFixed(4)})` }}>
        <OffthreadVideo src={staticFile('video/walk.mp4')} muted style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const RisekReel: React.FC<{ bgm: boolean }> = ({ bgm }) => {
  return (
    <AbsoluteFill style={{ background: '#070a14' }}>
      <Sequence {...seq(SHOTS.opening)}>
        <Opening />
      </Sequence>
      <Sequence {...seq(SHOTS.walk)}>
        <Walk />
      </Sequence>
      <Sequence {...seq(SHOTS.outro)}>
        <Outro />
      </Sequence>
      <Flash />
      {bgm && (
        <Audio
          src={staticFile('audio/bgm-tech-house.mp3')}
          trimBefore={MUSIC_TRIM}
          volume={(f) => 0.8 * interpolate(f, [0, 3, TOTAL - 45, TOTAL - 2], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />
      )}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} layout="none">
          <Audio src={staticFile(`audio/${s.src}.mp3`)} volume={s.volume} trimBefore={s.trim} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
