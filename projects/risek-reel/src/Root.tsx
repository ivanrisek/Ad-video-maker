import React from 'react';
import { Composition } from 'remotion';
import { RisekReel } from './Reel';
import { FPS, TOTAL } from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="RisekReel"
    component={RisekReel}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ bgm: true }}
  />
);
