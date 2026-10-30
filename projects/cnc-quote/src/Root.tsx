import React from 'react';
import { Composition, Still } from 'remotion';
import { IG, IgFrame } from './social/IgFrame';
import { Reel, REEL } from './social/Reel';
import { Main, TOTAL } from './Main';
import { Walkthrough, WT_TOTAL } from './wt/Walkthrough';

export const Root: React.FC = () => (
  <>
    <Composition id="CncPromo" component={Main} defaultProps={{ bgm: true }} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="CncWalkthrough" component={Walkthrough} defaultProps={{ bgm: true }} durationInFrames={WT_TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="CncReel" component={Reel} defaultProps={{ bgm: true }} durationInFrames={WT_TOTAL} fps={30} width={REEL.w} height={REEL.h} />
    <Still id="IgFrame" component={IgFrame} width={IG.w} height={IG.h} />
  </>
);
