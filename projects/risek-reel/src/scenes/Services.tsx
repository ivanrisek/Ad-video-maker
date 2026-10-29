// Services — "Inženjerstvo na svakom sloju sustava." The user's own screen recording of the services
// grid floats in a browser window; below it a mobile picker (card: picker-carousel-feature-cycle)
// snaps through the six services, one snap every two beats.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp, mix, SpeedBlur } from '../lib/Polish';
import { C, DISPLAY, ICE_GRAD } from '../brand';
import { BlurIn, BlurWords, BrowserCard, Eyebrow, display, words } from '../components';
import { bF, SHOTS } from '../timeline';

const L = (n: number) => bF(n) - SHOTS.services.from;
export const SERVICES_DUR = SHOTS.services.to - SHOTS.services.from;

const ITEMS = [
  'Izrada web stranica i aplikacija',
  'IT infrastruktura i održavanje',
  'Automatizacija poslovnih procesa',
  'AI rješenja i savjetovanje',
  'IT podrška za tvrtke',
  'IT pomoć za privatne korisnike',
];
// 16-grid line icons: code, server, flow, spark, headset, user
const ICONS: string[][] = [
  ['M5.5 4.5 2 8l3.5 3.5', 'M10.5 4.5 14 8l-3.5 3.5', 'M9 3 7 13'],
  ['M2.5 2.5h11v4.5h-11z', 'M2.5 9h11v4.5h-11z', 'M5 4.75h.01', 'M5 11.25h.01'],
  ['M3 3.5h4v3H3z', 'M9 9.5h4v3H9z', 'M5 6.5v2.5c0 .8.7 1.5 1.5 1.5H9'],
  ['M8 2v3', 'M8 11v3', 'M2 8h3', 'M11 8h3', 'M8 5.5 9 7l1.5 1L9 9 8 10.5 7 9 5.5 8 7 7z'],
  ['M3 9V8a5 5 0 0 1 10 0v1', 'M3 9h2v4H3z', 'M11 9h2v4h-2z'],
  ['M8 8a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 8 8z', 'M3 14c.6-2.6 2.6-4 5-4s4.4 1.4 5 4'],
];
const Icon: React.FC<{ d: string[] }> = ({ d }) => (
  <svg width={40} height={40} viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
    {d.map((p, i) => (
      <path key={i} d={p} stroke={C.ice} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </svg>
);

const ROW_H = 104;
const STEP_LANDS = [24, 26, 28, 30, 32].map(L); // snaps land on the beat
const MOVE = 13; // outQuint travel, then true stillness until the next beat (HOLD)
const outQuint = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 5);
const posAt = (f: number) => STEP_LANDS.reduce((acc, land) => acc + outQuint((f - (land - MOVE)) / MOVE), 0);

export const Services: React.FC = () => {
  const f = useCurrentFrame();
  const inP = ramp(f, 0, 14, EASE.out);
  const out = ramp(f, SERVICES_DUR - 10, 10, EASE.exit);
  const card = ramp(f, 8, 26, EASE.out);
  const picker = ramp(f, 18, 18, EASE.out);
  const pos = posAt(f);
  const vy = -(posAt(f + 0.5) - posAt(f - 0.5)) * ROW_H;
  const stepIdx = STEP_LANDS.findIndex((land) => f >= land - MOVE && f < land + 4);
  const land = stepIdx >= 0 ? Math.max(0, (f - STEP_LANDS[stepIdx]) / 8) : 0;
  const breath = stepIdx >= 0 && f >= STEP_LANDS[stepIdx] ? Math.sin(Math.min(1, land) * Math.PI) * 0.05 : 0;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity: inP * (1 - out) }}>
      {/* faint energy field from the site's about film */}
      <AbsoluteFill style={{ opacity: 0.22 }}>
        <OffthreadVideo src={staticFile('video/energy.mp4')} muted trimBefore={150} playbackRate={0.6} style={{ width: 1080, height: 1920, filter: 'blur(6px) saturate(0.8)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 90% 60% at 50% 35%, rgba(7,10,20,0.35), #070a14 85%)' }} />

      <BlurIn start={2} style={{ position: 'absolute', left: 72, top: 236 }}>
        <Eyebrow>Što radimo</Eyebrow>
      </BlurIn>
      <div style={{ position: 'absolute', left: 68, right: 60, top: 292 }}>
        <BlurWords words={words('Inženjerstvo na', 4, 4, 22)} style={display(84, { color: '#dfe2e7' })} />
        <BlurWords
          words={words('svakom sloju sustava.', 12, 4, 24, { backgroundImage: ICE_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' })}
          style={display(84)}
        />
      </div>

      {/* the user's own recording of the services section */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 540, perspective: 1800, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            opacity: card,
            transform: `translateY(${((1 - card) * 120).toFixed(1)}px) rotateX(${mix(18, 6, card).toFixed(2)}deg) scale(${mix(0.92, 1, card).toFixed(4)})`,
            transformOrigin: '50% 100%',
            filter: card >= 0.999 ? undefined : `blur(${((1 - card) * 10).toFixed(2)}px)`,
          }}
        >
          <BrowserCard src="video/rec_services.mp4" width={940} aspect={722 / 1400} trimBefore={0} playbackRate={1.25} />
        </div>
      </div>

      {/* picker */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: 1130,
          height: ROW_H * 5,
          overflow: 'hidden',
          opacity: picker,
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 26%, #000 74%, transparent 100%)',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 26%, #000 74%, transparent 100%)',
        }}
      >
        {/* fixed focus pill — never moves, only breathes on landing */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: ROW_H * 2 + 4,
            height: ROW_H - 8,
            borderRadius: 999,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.085), rgba(255,255,255,0.035))',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 40px -10px rgba(0,0,0,0.6), 0 0 60px -20px rgba(120,175,255,0.45)',
            transform: `scaleY(${(1 + breath).toFixed(4)})`,
          }}
        />
        <SpeedBlur vx={0} vy={vy} amount={0.05} max={3}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${(ROW_H * 2 - pos * ROW_H).toFixed(2)}px)` }}>
            {ITEMS.map((txt, i) => {
              const d = Math.abs(i - pos);
              const k2 = Math.min(2, d);
              const o = k2 <= 1 ? mix(1, 0.55, k2) : mix(0.55, 0.18, k2 - 1);
              return (
                <div
                  key={i}
                  style={{
                    height: ROW_H,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 18,
                    fontFamily: DISPLAY,
                    fontWeight: 600,
                    fontSize: mix(52, 40, Math.min(1, d / 2)),
                    letterSpacing: '-0.015em',
                    color: d < 0.5 ? '#ffffff' : d < 1.5 ? C.text2 : C.muted,
                    opacity: o,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ opacity: Math.max(0, 1 - d * 1.6), width: 40 }}>
                    <Icon d={ICONS[i]} />
                  </span>
                  <span>{txt}</span>
                </div>
              );
            })}
          </div>
        </SpeedBlur>
      </div>
    </AbsoluteFill>
  );
};
