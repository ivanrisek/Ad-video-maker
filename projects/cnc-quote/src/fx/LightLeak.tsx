// Light-leak overlay over a cut point (Remotion skill: transitions / light-leaks): a <Solid> with the
// lightLeak() effect, progress 0→1 across the overlay so the leak blooms over the first half (peaking on
// the cut) and retracts over the second. hueShift 176 ≈ the app's cobalt. Mounted in a <Sequence> that
// straddles the cut, so it does not shorten the timeline (same semantics as TransitionSeries.Overlay).
import React from 'react';
import { interpolate, Solid, useCurrentFrame, useVideoConfig } from 'remotion';
import { lightLeak } from '@remotion/effects/light-leak';

export const LightLeakOverlay: React.FC<{ seed?: number; hueShift?: number }> = ({ seed = 0, hueShift = 176 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  return (
    <Solid
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}
      effects={[
        lightLeak({
          seed,
          hueShift,
          progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }),
      ]}
    />
  );
};
