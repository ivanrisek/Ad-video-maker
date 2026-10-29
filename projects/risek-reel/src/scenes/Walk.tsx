// Walk — the captured site walkthrough with an edit layer on top:
// · fast scrolls get vertical motion blur + RGB split, scaled by the scroll's own velocity curve
// · the hero→services jump tears into horizontal bands at peak speed (card: tear-streak-transitions · glitch-displace)
// · arriving on services and on projects = crash stop: punch zoom, exposure flash, decaying shake (card: crash-zoom-punch)
// · opening a project = small zoom pulse + ice-blue bloom
import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp } from '../lib/Polish';
import { WALK_FX, Seg } from '../walkFx';

const W = 1080;
const H = 1920;

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// in-out cubic velocity, normalised so the peak is 1
const velIO = (t: number) => (t <= 0 || t >= 1 ? 0 : (t < 0.5 ? 12 * t * t : 12 * (1 - t) * (1 - t)) / 3);

const fxAt = (f: number) => {
  let v = 0;
  let tear = 0;
  let punch = 0;
  let shake = 0;
  let flash = 0;
  let pulse = 0;
  let bloom = 0;
  for (const s of WALK_FX) {
    const t = (f - s.start) / s.dur;
    if (s.kind === 'fast' && t > 0 && t < 1) v = Math.max(v, velIO(t) * s.strength);
    if (s.tear && t > 0.22 && t < 0.78) tear = Math.max(tear, Math.sin(((t - 0.22) / 0.56) * Math.PI));
    const k = f - (s.start + s.dur); // frames since landing
    if (s.slam && k >= 0 && k < 30) {
      punch = Math.max(punch, 0.075 * Math.exp(-k / 4.5));
      shake = Math.max(shake, 16 * Math.exp(-k / 1.8));
      flash = Math.max(flash, 0.55 * Math.exp(-k / 2.6));
    }
  }
  for (const tp of WALK_FX_TAPS) {
    const k = f - tp;
    if (k >= 0 && k < 24) {
      pulse = Math.max(pulse, 0.035 * Math.sin(Math.min(1, k / 14) * Math.PI) * Math.exp(-k / 18));
      bloom = Math.max(bloom, 0.32 * Math.exp(-k / 5));
    }
  }
  return { v, tear, punch, shake, flash, pulse, bloom };
};
const WALK_FX_TAPS: number[] = (WALK_FX as Seg[]).filter((s) => s.kind === 'open').map((s) => s.start);

const RgbSplit: React.FC<{ id: string; dy: number; blur: number }> = ({ id, dy, blur }) => (
  <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation={`0 ${blur.toFixed(2)}`} result="b" />
      <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
      <feOffset in="r" dy={-dy} result="ro" />
      <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
      <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bl" />
      <feOffset in="bl" dy={dy} result="bo" />
      <feBlend in="ro" in2="g" mode="screen" result="rg" />
      <feBlend in="rg" in2="bo" mode="screen" />
    </filter>
  </svg>
);

const Footage: React.FC<{ filter?: string }> = ({ filter }) => (
  <OffthreadVideo src={staticFile('video/walk.mp4')} muted style={{ width: W, height: H, display: 'block', filter }} />
);

export const Walk: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const fx = fxAt(f);
  const out = ramp(f, dur - 14, 14, EASE.exit);

  const blur = fx.v * 26;
  const split = fx.v * 12 + fx.tear * 10;
  const id = `rgb-${f}`;
  const useFx = blur > 0.4 || split > 0.4;

  const scale = 1 + fx.v * 0.05 + fx.punch + fx.pulse + 0.04 * out;
  const sx = fx.shake > 0.3 ? (hash(f * 3.1) - 0.5) * 2 * fx.shake : 0;
  const sy = fx.shake > 0.3 ? (hash(f * 7.7) - 0.5) * 2 * fx.shake : 0;

  // tear bands: 16 unequal horizontal strips, each a full-page copy clipped to its strip
  const BANDS = 16;
  const cuts = React.useMemo(() => {
    const raw = Array.from({ length: BANDS }, (_, i) => 0.4 + hash(i * 13.7));
    const sum = raw.reduce((a, b) => a + b, 0);
    let acc = 0;
    return raw.map((r) => {
      const y = acc;
      acc += (r / sum) * H;
      return [Math.round(y), Math.round(acc)];
    });
  }, []);

  const grade = 'contrast(1.06) saturate(1.1)';
  return (
    <AbsoluteFill style={{ background: '#070a14', overflow: 'hidden' }}>
      {useFx && <RgbSplit id={id} dy={split} blur={blur} />}
      <AbsoluteFill
        style={{
          opacity: 1 - out,
          transform: `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) scale(${scale.toFixed(4)})`,
          filter: `${grade} brightness(${(1 + fx.flash * 0.6).toFixed(3)})`,
        }}
      >
        {fx.tear > 0.02 ? (
          cuts.map(([y0, y1], i) => {
            const e = hash(i * 31 + 5);
            const amp = e < 0.2 ? 0 : e < 0.5 ? 1 : 0.35;
            const dx = amp * Math.sign(hash(i * 31 + f * 7) - 0.5) * Math.pow(hash(i * 17 + f * 3), 0.6) * 70 * fx.tear;
            return (
              <div key={i} style={{ position: 'absolute', left: 0, top: y0, width: W, height: y1 - y0, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: dx, top: -y0, width: W, height: H }}>
                  <Footage filter={useFx ? `url(#${id})` : undefined} />
                </div>
                {Math.abs(dx) > 25 && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1.5, background: 'rgba(190,215,255,0.7)' }} />}
              </div>
            );
          })
        ) : (
          <Footage filter={useFx ? `url(#${id})` : undefined} />
        )}
      </AbsoluteFill>
      {/* ice-blue bloom when a project opens */}
      {fx.bloom > 0.01 && (
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 40%, rgba(150,195,255,0.9), rgba(120,175,255,0) 70%)', mixBlendMode: 'screen', opacity: fx.bloom }} />
      )}
      {/* exposure flash on crash stops */}
      {fx.flash > 0.01 && <AbsoluteFill style={{ background: '#e8f1ff', opacity: fx.flash * 0.5 }} />}
      {/* cinematic edge falloff */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 48%, rgba(2,4,10,0) 60%, rgba(2,4,10,0.38) 100%)' }} />
    </AbsoluteFill>
  );
};
