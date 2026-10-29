// Hero — the site's hero film (risek-laptop.mp4) full-bleed; the site's H1 lands word by word
// (blur-slide), and the site's accent phrase "na jednom mjestu." gets the ice-blue gradient sweep.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp, mix } from '../lib/Polish';
import { C } from '../brand';
import { BlurWords, BlurIn, Eyebrow, IceSweepWord, display, words } from '../components';
import { bF, SHOTS } from '../timeline';

const L = (n: number) => bF(n) - SHOTS.hero.from; // beat → local frame
export const HERO_DUR = SHOTS.hero.to - SHOTS.hero.from;

export const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const settle = ramp(f, 0, 60, EASE.out);
  const out = ramp(f, HERO_DUR - 12, 12, EASE.exit);
  const lineIn = ramp(f, L(14), 20, EASE.out);
  const H = display(100, { color: '#dfe2e7' });

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${mix(1.16, 1.04, settle).toFixed(4)})`, opacity: 1 - out * 0.6 }}>
        <OffthreadVideo src={staticFile('video/hero.mp4')} muted trimBefore={0} style={{ width: 1080, height: 1920, filter: 'brightness(0.92) saturate(1.05)' }} />
      </AbsoluteFill>
      {/* legibility: navy floor like the site's hero overlay */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7,10,20,0.55) 0%, rgba(7,10,20,0) 18%, rgba(7,10,20,0) 38%, rgba(7,10,20,0.78) 56%, rgba(7,10,20,0.96) 78%, #070a14 100%)',
        }}
      />

      <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${(-40 * out).toFixed(2)}px)` }}>
        <BlurIn start={6} style={{ position: 'absolute', left: 72, top: 1010 }}>
          <Eyebrow>RISEK TECHNOLOGY · Krapina</Eyebrow>
        </BlurIn>
        <div style={{ position: 'absolute', left: 68, right: 60, top: 1080 }}>
          <BlurWords words={words('IT podrška,', L(11) - 6, 4, 22)} style={H} />
          <BlurWords words={words('razvoj i', L(12) - 6, 4, 22)} style={H} />
          <BlurWords words={words('infrastruktura', L(13) - 6, 4, 24)} style={H} />
          <div
            style={{
              ...H,
              marginTop: 4,
              opacity: lineIn,
              transform: `translateY(${((1 - lineIn) * 50).toFixed(2)}px)`,
              filter: lineIn >= 0.999 ? undefined : `blur(${((1 - lineIn) * 16).toFixed(2)}px)`,
            }}
          >
            <IceSweepWord text="na jednom mjestu." fillStart={L(16) - 4} fillDur={18} style={{ color: '#dfe2e7' }} boltWidth={880} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
