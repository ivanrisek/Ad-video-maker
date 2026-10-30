// Login page ("naslovnica"), type-and-filter grammar: open wide on the real login page (dark lathe hero +
// form), push to the form, e-mail autofills (quick left→right wipe, as browsers do), password types at 2f
// per dot, pointer glides to "Prijavi se", presses (two ripples), camera pushes through the button.
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp } from '../lib/Polish';
import { C } from '../lib/Brand';
import W from '../walkthrough.json';
import { Cursor, Focus, Ripple, TypeReveal, World, camPath, pressAt, toScreen } from './ui';

export const LOGIN_DURATION = 125;
const L = W.login;
const EMAIL_AT = 46;
const PASS_AT = 58;
const PASS_CHARS = 17;
const CLICK = 98;
const BTN = { x: L.button.x + L.button.w / 2, y: L.button.y + L.button.h / 2 };

const KEYS = [
  { f: 0, x: 960, y: 540, s: 1.0 },
  { f: 18, x: 960, y: 540, s: 1.03 },
  { f: 42, x: 1484, y: 575, s: 1.75 },
  { f: 100, x: 1484, y: 585, s: 1.8 },
  { f: 125, x: BTN.x, y: BTN.y, s: 3.4 },
];

export const LoginShot: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camPath(KEYS, f, f > 100 ? EASE.exit : EASE.swift);
  const emailWipe = ramp(f, EMAIL_AT, 8, EASE.swift);
  const focusE = interpolate(f, [EMAIL_AT - 4, EMAIL_AT, PASS_AT - 4, PASS_AT], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const focusP = interpolate(f, [PASS_AT - 4, PASS_AT, 92, 96], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // pointer: appears near the password field, glides to the button
  const k = ramp(f, 84, 12, EASE.swift);
  const from = { x: L.password.x + L.password.w * 0.7, y: L.password.y + L.password.h + 30 };
  const ptr = { x: from.x + (BTN.x - from.x) * k, y: from.y + (BTN.y - from.y) * k - Math.sin(k * Math.PI) * 24 };
  const sp = toScreen(cam, ptr);
  const press = pressAt(f, [CLICK]);
  const btnDown = f >= CLICK && f < CLICK + 6 ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: C.sheet, overflow: 'hidden' }}>
      <World cam={cam} h={1080}>
        <Img src={staticFile('textures/wt/login-empty.png')} style={{ position: 'absolute', width: 1920, height: 1080 }} />
        {/* e-mail autofill wipe */}
        {emailWipe > 0 ? (
          <div style={{ position: 'absolute', left: L.email.x, top: L.email.y, width: L.email.w * emailWipe, height: L.email.h, overflow: 'hidden' }}>
            <Img src={staticFile('textures/wt/login-email.png')} style={{ position: 'absolute', left: -L.email.x, top: -L.email.y, width: 1920, height: 1080 }} />
          </div>
        ) : null}
        <TypeReveal src="textures/wt/login-filled.png" pageH={1080} b={L.password} f={f} start={PASS_AT} chars={PASS_CHARS} per={2} textW={L.password.w * 0.5} caret={f < 92} />
        <Focus b={L.email} on={focusE} />
        <Focus b={L.password} on={focusP} />
        {btnDown ? <div style={{ position: 'absolute', left: L.button.x, top: L.button.y, width: L.button.w, height: L.button.h, borderRadius: 8, background: 'rgba(10,20,80,0.18)' }} /> : null}
      </World>
      <Ripple x={sp.x} y={sp.y} f={f} at={CLICK} />
      <Cursor x={sp.x} y={sp.y} press={press} opacity={ramp(f, 80, 6, EASE.out) * (1 - ramp(f, CLICK + 8, 6, EASE.out))} />
    </AbsoluteFill>
  );
};
