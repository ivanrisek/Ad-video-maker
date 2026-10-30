import React from 'react';
import { Composition } from 'remotion';
import { Main, TOTAL } from './Main';
import { Walkthrough, WT_TOTAL } from './wt/Walkthrough';

export const Root: React.FC = () => (
  <>
    <Composition id="CncPromo" component={Main} defaultProps={{ bgm: true }} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="CncWalkthrough" component={Walkthrough} defaultProps={{ bgm: true }} durationInFrames={WT_TOTAL} fps={30} width={1920} height={1080} />
  </>
);
