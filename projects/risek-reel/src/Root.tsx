import React from 'react';
import { Composition } from 'remotion';
import { RisekReel } from './Reel';
import { FPS, TOTAL } from './timeline';
import { RisekReelCut, CUT_TOTAL } from './CutReel';
import { RisekLed, LED_TOTAL, LED_W, LED_H } from './Led';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="RisekReel"
    component={RisekReel}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ bgm: true }}
  />
  <Composition
    id="RisekReelCut"
    component={RisekReelCut}
    durationInFrames={CUT_TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ bgm: true }}
  />
  <Composition id="RisekLed" component={RisekLed} durationInFrames={LED_TOTAL} fps={FPS} width={LED_W} height={LED_H} />
  </>
);
