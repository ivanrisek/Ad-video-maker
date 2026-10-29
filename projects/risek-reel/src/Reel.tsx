import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Grain, Vignette, EASE, ramp } from './lib/Polish';
import { SHOTS, MUSIC_TRIM, TOTAL, bF } from './timeline';
import { Opening } from './scenes/Opening';
import { Hero } from './scenes/Hero';
import { Services } from './scenes/Services';
import { Projects } from './scenes/Projects';
import { Slogan, Outro } from './scenes/Finale';

const seq = (s: { from: number; to: number }) => ({ from: s.from, durationInFrames: s.to - s.from });

// SFX pinned to frames (beats via bF). trim = frames cut from the sample start.
type Sfx = { at: number; src: string; volume: number; trim?: number };
const SNAP_LANDS = [24, 26, 28, 30, 32].map(bF);
const SFX: Sfx[] = [
  { at: 4, src: 'light-aura', volume: 0.3 },
  { at: bF(6), src: 'switch-tap', volume: 0.85 },
  { at: 51, src: 'riser-cine', volume: 0.45, trim: 50 },
  { at: bF(6) + 8, src: 'warp-slide', volume: 0.55 },
  { at: bF(10) - 2, src: 'impact-deep-whoosh', volume: 0.6 }, // big slam 1: tunnel exit on the drop
  { at: bF(16) - 4, src: 'light-sweep-magic', volume: 0.32 },
  { at: SHOTS.services.from - 8, src: 'transition-soft', volume: 0.4 },
  ...SNAP_LANDS.map((land, k) => ({ at: land - 9, src: k % 2 ? 'swoosh-quick' : 'sweep-short', volume: 0.3 - k * 0.03 })),
  { at: SHOTS.projects.from - 6, src: 'transition-tech', volume: 0.38 },
  ...[40, 44, 48].map((b, k) => ({ at: bF(b) - 2, src: k % 2 ? 'whoosh-fast' : 'air-woosh-quick', volume: 0.42 - k * 0.04 })),
  ...[40, 44, 48].map((b) => ({ at: bF(b) + 9, src: 'transition-snap', volume: 0.22 })),
  { at: bF(54), src: 'whoosh-electric', volume: 0.42 },
  { at: bF(56), src: 'hit-weak', volume: 0.5 },
  { at: bF(57), src: 'bass-hit-short', volume: 0.55 },
  { at: bF(58) - 2, src: 'impact-deep-whoosh', volume: 0.55 }, // big slam 2: logo
  { at: bF(58) + 18, src: 'sparkle', volume: 0.3 },
];

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const drop = bF(10);
  const up = ramp(f, drop - 14, 14, EASE.exit);
  const down = 1 - ramp(f, drop, 14, EASE.out);
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
      <Sequence {...seq(SHOTS.hero)}>
        <Hero />
      </Sequence>
      <Sequence {...seq(SHOTS.services)}>
        <Services />
      </Sequence>
      <Sequence {...seq(SHOTS.projects)}>
        <Projects />
      </Sequence>
      <Sequence {...seq(SHOTS.slogan)}>
        <Slogan />
      </Sequence>
      <Sequence {...seq(SHOTS.outro)}>
        <Outro />
      </Sequence>
      <Flash />
      <Vignette strength={0.35} inner={0.55} color="#02040a" />
      <Grain opacity={0.07} blend="soft-light" />

      {bgm && (
        <Audio
          src={staticFile('audio/bgm-tech-house.mp3')}
          trimBefore={MUSIC_TRIM}
          volume={(f) => 0.85 * interpolate(f, [0, 3, TOTAL - 45, TOTAL - 2], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
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
