import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp } from './lib/Polish';
import { SHOTS, MUSIC_TRIM, TOTAL, WALK, bF } from './timeline';
import { Opening } from './scenes/Opening';
import { Outro } from './scenes/Finale';
import { Walk } from './scenes/Walk';
import { WALK_FX } from './walkFx';

const seq = (s: { from: number; to: number }) => ({ from: s.from, durationInFrames: s.to - s.from });

// SFX pinned to frames. trim = frames cut from the sample start.
type Sfx = { at: number; src: string; volume: number; trim?: number };
const w = (n: number) => WALK.from + n; // walkthrough-local → reel frame
const walkSfx: Sfx[] = WALK_FX.flatMap((s): Sfx[] => {
  const land = w(s.start + s.dur);
  if (s.kind === 'fast' && s.tear)
    return [
      { at: w(s.start), src: 'whoosh-big', volume: 0.55 },
      { at: w(s.start + Math.round(s.dur * 0.35)), src: 'glitch-electric-small', volume: 0.4 },
      { at: land - 1, src: 'bass-hit-futuristic', volume: 0.65 },
      { at: land - 1, src: 'impact-zoom-quick', volume: 0.35 },
    ];
  if (s.kind === 'fast') return [{ at: w(s.start + 2), src: s.strength > 0.5 ? 'whoosh-fast' : 'swoosh-quick', volume: s.strength > 0.5 ? 0.38 : 0.32 }];
  if (s.kind === 'glide')
    return [
      { at: land - 144, src: 'riser-cine', volume: 0.42 }, // 4.8s build into the projects
      { at: land - 2, src: 'impact-epic-trailer', volume: 0.5 },
    ];
  if (s.kind === 'open')
    return [
      { at: w(s.start), src: 'switch-tap', volume: 0.65 },
      { at: w(s.start + 1), src: 'zoom-futuristic', volume: 0.3 },
    ];
  if (s.kind === 'close')
    return [
      { at: w(s.start), src: 'switch-tap', volume: 0.55 },
      { at: w(s.start + 2), src: 'transition-snap', volume: 0.25 },
    ];
  if (s.kind === 'modal') return [{ at: w(s.start + 2), src: 'sweep-short', volume: 0.16 }];
  return [];
});
const SFX: Sfx[] = [
  { at: 4, src: 'light-aura', volume: 0.3 },
  { at: bF(6), src: 'switch-tap', volume: 0.85 },
  { at: 51, src: 'riser-cine', volume: 0.45, trim: 50 },
  { at: bF(6) + 8, src: 'warp-slide', volume: 0.55 },
  { at: bF(10) - 2, src: 'impact-deep-whoosh', volume: 0.6 }, // tunnel exit on the drop
  ...walkSfx,
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

export const RisekReel: React.FC<{ bgm: boolean }> = ({ bgm }) => {
  return (
    <AbsoluteFill style={{ background: '#070a14' }}>
      <Sequence {...seq(SHOTS.opening)}>
        <Opening />
      </Sequence>
      <Sequence {...seq(SHOTS.walk)}>
        <Walk dur={SHOTS.walk.to - SHOTS.walk.from} />
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
