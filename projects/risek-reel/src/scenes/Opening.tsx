// Opening — recreates the risek-technology.com intro: logo + tagline + ">_ DISCOVER" over the
// server-corridor film, a tap on DISCOVER, then the site's own corridor→light-tunnel footage
// (rikica_hero.mp4, 7.0s→end) carries the camera through the tunnel into the drop.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp, mix } from '../lib/Polish';
import { C, DISPLAY } from '../brand';
import { LogoWithSheen } from '../components';
import { bF } from '../timeline';

const POP = bF(4); // DISCOVER appears
const TAP = bF(6); // finger tap on the beat
const TUNNEL_IN = TAP - 1;
const DROP = bF(10);

export const Opening: React.FC = () => {
  const f = useCurrentFrame();

  // UI layer (logo/tagline/button) leaves after the tap: scale up + blur + fade (camera "enters")
  const leave = ramp(f, TAP + 4, 16, EASE.exit);
  const uiScale = 1 + 0.35 * leave;
  const uiOpacity = 1 - leave;

  // logo materialises out of defocus
  const lp = ramp(f, 4, 30, EASE.out);
  // tagline
  const tp = ramp(f, 26, 20, EASE.out);
  // DISCOVER pill
  const bp = ramp(f, POP, 16, EASE.out);
  // press: 1 → .93 → 1, fills with light
  const press = f < TAP ? 0 : f < TAP + 4 ? ramp(f, TAP, 4, EASE.out) : 1 - ramp(f, TAP + 4, 8, EASE.out);
  const fillLight = f < TAP ? 0 : 1 - ramp(f, TAP + 2, 12, EASE.out);
  // touch indicator approaching, then ripple
  const touch = ramp(f, TAP - 10, 9, EASE.out);
  const ripple = ramp(f, TAP, 18, EASE.out);

  // corridor (intro loop) and tunnel push
  const corridorIn = ramp(f, 12, 40, EASE.smooth);
  const tunnelMix = ramp(f, TUNNEL_IN, 12, EASE.smooth);
  const push = ramp(f, TUNNEL_IN, DROP - TUNNEL_IN, EASE.exit); // accelerating into the light
  const tunnelScale = mix(1.0, 1.32, push);
  const bright = mix(0.95, 1.3, ramp(f, TUNNEL_IN, DROP - TUNNEL_IN, EASE.linear));

  const PILL_Y = 1150;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      {/* intro background: the site's corridor film, dimmed like the site overlay */}
      <Sequence from={0} durationInFrames={TUNNEL_IN + 14} layout="none">
        <AbsoluteFill style={{ opacity: 0.62 * corridorIn * (1 - tunnelMix), transform: `scale(${(1.06 + 0.03 * ramp(f, 0, 100, EASE.linear)).toFixed(4)})` }}>
          <OffthreadVideo src={staticFile('video/corridor.mp4')} muted trimBefore={45} style={{ width: 1080, height: 1920, filter: 'brightness(0.75) saturate(0.9)' }} />
        </AbsoluteFill>
      </Sequence>

      {/* tunnel: same film from 7.0s (corridor → light tunnel), slightly sped up so the burst meets the drop */}
      <Sequence from={TUNNEL_IN} durationInFrames={DROP - TUNNEL_IN + 10} layout="none">
        <AbsoluteFill style={{ opacity: tunnelMix, transform: `scale(${tunnelScale.toFixed(4)})` }}>
          <OffthreadVideo
            src={staticFile('video/corridor.mp4')}
            muted
            trimBefore={210}
            playbackRate={1.35}
            style={{ width: 1080, height: 1920, filter: `brightness(${bright.toFixed(3)})` }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* site overlay: navy wash */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 55% at 50% 45%, rgba(7,10,20,0.15), rgba(7,10,20,0.75) 100%)`, opacity: 1 - tunnelMix * 0.8 }} />

      {/* UI */}
      <AbsoluteFill style={{ opacity: uiOpacity, transform: `scale(${uiScale.toFixed(4)})`, transformOrigin: `540px ${PILL_Y}px`, filter: leave > 0.01 ? `blur(${(leave * 14).toFixed(2)}px)` : undefined }}>
        <div
          style={{
            position: 'absolute',
            left: 540 - 410,
            top: 560,
            opacity: lp,
            transform: `scale(${mix(1.08, 1, lp).toFixed(4)})`,
            filter: lp >= 0.999 ? undefined : `blur(${((1 - lp) * 18).toFixed(2)}px)`,
          }}
        >
          <LogoWithSheen src="img/risek2.png" width={820} sheenStart={30} sheenDur={26} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1020,
            textAlign: 'center',
            fontFamily: DISPLAY,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: '0.24em',
            color: 'rgba(194,196,200,0.72)',
            opacity: tp,
            transform: `translateY(${((1 - tp) * 20).toFixed(2)}px)`,
            filter: tp >= 0.999 ? undefined : `blur(${((1 - tp) * 8).toFixed(2)}px)`,
          }}
        >
          DON&apos;T TAKE A RISK, TAKE RISEK TECHNOLOGY
        </div>

        {/* >_ DISCOVER */}
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: PILL_Y,
            transform: `translate(-50%, -50%) translateY(${((1 - bp) * 26).toFixed(2)}px) scale(${(1 - 0.07 * press).toFixed(4)})`,
            opacity: bp,
            filter: bp >= 0.999 ? undefined : `blur(${((1 - bp) * 10).toFixed(2)}px)`,
          }}
        >
          <div
            style={{
              position: 'relative',
              padding: '30px 64px',
              borderRadius: 9999,
              border: '1.5px solid rgba(255,255,255,0.32)',
              background: `rgba(255,255,255,${(0.04 + 0.86 * fillLight).toFixed(3)})`,
              boxShadow: `0 0 ${(60 * fillLight).toFixed(1)}px rgba(150,195,255,${(0.7 * fillLight).toFixed(3)}), inset 0 1px 0 rgba(255,255,255,0.12)`,
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 34,
              letterSpacing: '0.35em',
              color: fillLight > 0.5 ? C.bg : 'rgba(255,255,255,0.82)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ letterSpacing: '0.05em', marginRight: 22, opacity: 0.8 }}>&gt;_</span>DISCOVER
          </div>
        </div>

        {/* touch point + ripple */}
        {f >= TAP - 10 && f < TAP + 20 && (
          <>
            <div
              style={{
                position: 'absolute',
                left: 540 + 70,
                top: PILL_Y + 6,
                width: 86,
                height: 86,
                marginLeft: -43,
                marginTop: -43,
                borderRadius: 99,
                background: 'rgba(255,255,255,0.35)',
                border: '2px solid rgba(255,255,255,0.6)',
                opacity: touch * (1 - ramp(f, TAP + 4, 10, EASE.out)),
                transform: `scale(${mix(1.5, 1, touch).toFixed(3)})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 540 + 70,
                top: PILL_Y + 6,
                width: 400,
                height: 400,
                marginLeft: -200,
                marginTop: -200,
                borderRadius: 999,
                border: '3px solid rgba(190,215,255,0.9)',
                opacity: f >= TAP ? 0.8 * (1 - ripple) : 0,
                transform: `scale(${(0.15 + 0.85 * ripple).toFixed(3)})`,
              }}
            />
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
