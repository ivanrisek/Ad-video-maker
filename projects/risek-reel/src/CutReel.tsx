// RisekReelCut — the punchy cut (~40 s). Same intro; then the captured site walkthrough is
// re-timed into beat-length clips (speed ramps per clip) with cut effects on every bar line:
// crash stops, whip blur, glitch tears, zoom punches, beat pumps. Ends on the logo only (no URL text).
import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp, mix } from './lib/Polish';
import { BEAT, MUSIC_TRIM, bF } from './timeline';
import { Opening } from './scenes/Opening';
import { LogoWithSheen } from './components';
import { C } from './brand';
import walk from './walk.json';

const W = 1080;
const H = 1920;
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ───────── clips: [src in, src out) in walkthrough frames, length in beats, cut effect INTO the clip ─────────
type Cut = 'none' | 'slam' | 'whip' | 'punch' | 'glitch';
type Clip = { src: [number, number]; beats: number; cut: Cut; tear?: boolean; pump?: boolean };
const CLIPS: Clip[] = [
  { src: [0, 44], beats: 3, cut: 'none' }, // hero
  { src: [44, 88], beats: 2, cut: 'none', tear: true }, // jump to services
  { src: [88, 447], beats: 14, cut: 'slam', pump: true }, // services glide ×1.8
  { src: [447, 476], beats: 2, cut: 'slam' }, // "Projekti koje smo realizirali"
  { src: [476, 535], beats: 2, cut: 'whip' }, // → CNC.Quote card
  { src: [535, 560], beats: 2, cut: 'punch' }, // tap (slow-mo)
  { src: [560, 776], beats: 8, cut: 'none', pump: true }, // modal ×1.9
  { src: [805, 864], beats: 2, cut: 'glitch' }, // → Dominus card
  { src: [864, 889], beats: 2, cut: 'punch' },
  { src: [889, 1091], beats: 8, cut: 'none', pump: true },
  { src: [1120, 1179], beats: 2, cut: 'whip' }, // → ATTENTION card
  { src: [1179, 1204], beats: 2, cut: 'punch' },
  { src: [1204, 1391], beats: 8, cut: 'none', pump: true },
  { src: [1420, 1522], beats: 4, cut: 'glitch' }, // clients fly-by
  { src: [1522, 1600], beats: 4, cut: 'whip' }, // contact
];
const START_BEAT = 10; // tunnel exit / drop
type Placed = Clip & { from: number; len: number; speed: number; beat: number };
const PLACED: Placed[] = (() => {
  let b = START_BEAT;
  return CLIPS.map((c) => {
    const from = bF(b);
    const len = bF(b + c.beats) - from;
    const p = { ...c, from, len, speed: (c.src[1] - c.src[0]) / len, beat: b };
    b += c.beats;
    return p;
  });
})();
const OUTRO_BEAT = PLACED[PLACED.length - 1].beat + PLACED[PLACED.length - 1].beats;
export const CUT_TOTAL = bF(OUTRO_BEAT + 6) + 6;

// ───────── source scroll velocity (css px / src frame), from the capture log ─────────
type LogSeg = { frame: number; scroll?: string | number; modalScroll?: string | number; dur?: number; ease?: string; tap?: string; pre?: number };
const DIST: Record<string, number> = { services: 2900, glide: 2300, card: 500, klijenti: 500, contact: 900 };
const MODAL_DIST = [1026, 828, 701];
const io = (t: number) => (t <= 0 || t >= 1 ? 0 : t < 0.5 ? 12 * t * t : 12 * (1 - t) * (1 - t)) / 1; // d/dt of in-out cubic (peak 3)
const gl = (t: number, a = 0.15) => {
  const v = 1 / (1 - a);
  if (t <= 0 || t >= 1) return 0;
  if (t < a) return (v * t) / a;
  if (t > 1 - a) return (v * (1 - t)) / a;
  return v;
};
const SEGS = (walk.segments as LogSeg[]).filter((s) => s.scroll !== undefined || s.modalScroll !== undefined);
let modalIdx = 0;
const VSEG = SEGS.map((s) => {
  const target = String(s.scroll ?? '');
  const dist =
    s.modalScroll !== undefined
      ? MODAL_DIST[modalIdx++] ?? 800
      : s.ease === 'glide'
        ? DIST.glide
        : target.startsWith('#services')
          ? DIST.services
          : target.includes('project-card')
            ? DIST.card
            : target.includes('klijenti')
              ? DIST.klijenti
              : DIST.contact;
  return { start: s.frame, dur: s.dur!, dist, glide: s.ease === 'glide' };
});
const srcVel = (sf: number) => {
  for (const s of VSEG) {
    const t = (sf - s.start) / s.dur;
    if (t > 0 && t < 1) return ((s.glide ? gl(t) : io(t)) * s.dist) / s.dur;
  }
  return 0;
};
const TAPS = (walk.segments as LogSeg[]).filter((s) => s.tap === '.project-more').map((s) => s.frame + (s.pre ?? 9));

// ───────── RGB split + vertical motion blur filter ─────────
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

const BANDS = (() => {
  const raw = Array.from({ length: 16 }, (_, i) => 0.4 + hash(i * 13.7));
  const sum = raw.reduce((a, b) => a + b, 0);
  let acc = 0;
  return raw.map((r) => {
    const y = acc;
    acc += (r / sum) * H;
    return [Math.round(y), Math.round(acc)] as [number, number];
  });
})();

// one clip of footage, re-timed; effects are computed in reel frames by the parent
const ClipView: React.FC<{ c: Placed; filter?: string; tear: number; f: number }> = ({ c, filter, tear, f }) => {
  const video = (
    <OffthreadVideo src={staticFile('video/walk.mp4')} muted trimBefore={c.src[0]} playbackRate={c.speed} style={{ width: W, height: H, display: 'block', filter }} />
  );
  if (tear < 0.02) return video;
  return (
    <>
      {BANDS.map(([y0, y1], i) => {
        const e = hash(i * 31 + 5);
        const amp = e < 0.2 ? 0 : e < 0.5 ? 1 : 0.35;
        const dx = amp * Math.sign(hash(i * 31 + f * 7) - 0.5) * Math.pow(hash(i * 17 + f * 3), 0.6) * 80 * tear;
        return (
          <div key={i} style={{ position: 'absolute', left: 0, top: y0, width: W, height: y1 - y0, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: dx, top: -y0, width: W, height: H }}>{video}</div>
            {Math.abs(dx) > 25 && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1.5, background: 'rgba(190,215,255,0.75)' }} />}
          </div>
        );
      })}
    </>
  );
};

const CutWalk: React.FC = () => {
  const f = useCurrentFrame(); // reel frame (this component is mounted at 0)
  const idx = PLACED.findIndex((c) => f >= c.from && f < c.from + c.len);
  if (idx < 0) return null;
  const c = PLACED[idx];
  const local = f - c.from;
  const sf = c.src[0] + local * c.speed;

  // motion: source scroll speed × re-time speed → output px/frame
  const outV = srcVel(sf) * c.speed * 2.5;
  let blur = Math.min(38, outV * 0.14);
  let split = Math.min(16, outV * 0.07);
  let scale = 1;
  let shake = 0;
  let flash = 0;
  let tear = 0;

  // tear inside the jump clip at peak speed
  if (c.tear) {
    const t = local / c.len;
    if (t > 0.2 && t < 0.8) tear = Math.sin(((t - 0.2) / 0.6) * Math.PI);
  }
  // cut INTO this clip
  const k = local;
  if (c.cut === 'slam' && k < 30) {
    scale += 0.09 * Math.exp(-k / 4.5);
    shake = 16 * Math.exp(-k / 1.8);
    flash = 0.6 * Math.exp(-k / 2.6);
  }
  if (c.cut === 'punch' && k < 20) scale += 0.1 * Math.exp(-k / 3.5);
  if (c.cut === 'whip' && k < 8) {
    const w = 1 - k / 8;
    blur = Math.max(blur, 46 * w);
    split = Math.max(split, 10 * w);
  }
  if (c.cut === 'glitch' && k < 7) {
    tear = Math.max(tear, 1 - k / 7);
    split = Math.max(split, 18 * (1 - k / 7));
  }
  // whip / glitch also smear the last frames of the outgoing clip
  const next = PLACED[idx + 1];
  const toEnd = c.len - local;
  if (next && toEnd <= 5) {
    const w = 1 - (toEnd - 1) / 5;
    if (next.cut === 'whip') {
      blur = Math.max(blur, 46 * w);
      split = Math.max(split, 10 * w);
    }
    if (next.cut === 'glitch') {
      tear = Math.max(tear, 0.7 * w);
      split = Math.max(split, 14 * w);
    }
    if (next.cut === 'punch') scale += 0.03 * w;
  }
  // beat pump on the kick (every beat) for pump clips
  if (c.pump) {
    const sinceBeat = (f - bF(START_BEAT)) % BEAT;
    scale += 0.018 * Math.exp(-sinceBeat / 3);
  }
  // project open: ice bloom
  let bloom = 0;
  for (const tp of TAPS) {
    if (sf >= tp && sf < tp + 18 * c.speed) bloom = Math.max(bloom, 0.34 * Math.exp(-(sf - tp) / (5 * c.speed)));
  }
  // clips sped up a lot get a gentle constant push-in to feel like travel
  if (c.speed > 2.5) scale += 0.02 * (local / c.len);

  const sx = shake > 0.3 ? (hash(f * 3.1) - 0.5) * 2 * shake : 0;
  const sy = shake > 0.3 ? (hash(f * 7.7) - 0.5) * 2 * shake : 0;
  const useFx = blur > 0.4 || split > 0.4;
  const id = `cutfx-${f}`;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      {useFx && <RgbSplit id={id} dy={split} blur={blur} />}
      <AbsoluteFill
        style={{
          transform: `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) scale(${scale.toFixed(4)})`,
          filter: `contrast(1.08) saturate(1.12) brightness(${(1 + flash * 0.6).toFixed(3)})`,
        }}
      >
        <Sequence from={c.from} durationInFrames={c.len} layout="none">
          <ClipView c={c} filter={useFx ? `url(#${id})` : undefined} tear={tear} f={f} />
        </Sequence>
      </AbsoluteFill>
      {bloom > 0.01 && (
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 40%, rgba(150,195,255,0.9), rgba(120,175,255,0) 70%)', mixBlendMode: 'screen', opacity: bloom }} />
      )}
      {flash > 0.01 && <AbsoluteFill style={{ background: '#e8f1ff', opacity: flash * 0.5 }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 48%, rgba(2,4,10,0) 58%, rgba(2,4,10,0.42) 100%)' }} />
    </AbsoluteFill>
  );
};

// logo-only end card: crash-in from white, sheen, breathing glow
const LogoEnd: React.FC = () => {
  const f = useCurrentFrame();
  const lp = ramp(f, 0, 14, EASE.snappy);
  const flash = Math.exp(-f / 3);
  const breathe = 0.5 + 0.5 * Math.sin(f / 9);
  const shake = 10 * Math.exp(-f / 1.8);
  const sx = shake > 0.3 ? (hash(f * 3.1) - 0.5) * 2 * shake : 0;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 26% at 50% 50%, rgba(${C.iceRGB},${(0.12 + 0.08 * breathe) * lp}), rgba(7,10,20,0) 72%)` }} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 470,
          top: 960 - 313,
          opacity: lp,
          transform: `translateX(${sx.toFixed(2)}px) scale(${mix(1.35, 1, lp).toFixed(4)})`,
          filter: lp >= 0.999 ? undefined : `blur(${((1 - lp) * 18).toFixed(2)}px)`,
        }}
      >
        <LogoWithSheen src="img/risek2.png" width={940} sheenStart={16} sheenDur={24} />
      </div>
      <AbsoluteFill style={{ background: '#eef5ff', opacity: 0.85 * flash }} />
    </AbsoluteFill>
  );
};

const TunnelFlash: React.FC = () => {
  const f = useCurrentFrame();
  const drop = bF(10);
  const o = f < drop ? ramp(f, drop - 14, 14, EASE.exit) : 1 - ramp(f, drop, 14, EASE.out);
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 48%, #ffffff 0%, #dbe8ff 60%, #b9cff5 100%)', opacity: 0.96 * o }} />;
};

// ───────── sound ─────────
type Sfx = { at: number; src: string; volume: number; trim?: number };
const cutSfx: Sfx[] = PLACED.flatMap((c, i): Sfx[] => {
  const out: Sfx[] = [];
  if (c.tear) {
    out.push({ at: c.from, src: 'whoosh-big', volume: 0.55 });
    out.push({ at: c.from + Math.round(c.len * 0.35), src: 'glitch-electric-small', volume: 0.45 });
  }
  if (c.cut === 'slam') out.push({ at: c.from - 1, src: i === 2 ? 'bass-hit-futuristic' : 'impact-epic-trailer', volume: i === 2 ? 0.7 : 0.5 }, { at: c.from - 1, src: 'impact-zoom-quick', volume: 0.35 });
  if (c.cut === 'whip') out.push({ at: c.from - 4, src: i % 2 ? 'swoosh-quick' : 'air-woosh-quick', volume: 0.45 });
  if (c.cut === 'glitch') out.push({ at: c.from - 3, src: i % 2 ? 'glitch-virtual-quick' : 'break-glitch-digital', volume: 0.4 });
  if (c.cut === 'punch') out.push({ at: c.from - 1, src: 'hit-weak', volume: 0.4 });
  // taps inside this clip (re-timed)
  for (const tp of TAPS) {
    if (tp >= c.src[0] && tp < c.src[1]) {
      const at = c.from + Math.round((tp - c.src[0]) / c.speed);
      out.push({ at, src: 'switch-tap', volume: 0.7 }, { at: at + 1, src: 'zoom-futuristic', volume: 0.32 });
    }
  }
  if (i === 2) out.push({ at: c.from + c.len - 144, src: 'riser-cine', volume: 0.42 });
  return out;
});
const SFX: Sfx[] = [
  { at: 4, src: 'light-aura', volume: 0.3 },
  { at: bF(6), src: 'switch-tap', volume: 0.85 },
  { at: 51, src: 'riser-cine', volume: 0.45, trim: 50 },
  { at: bF(6) + 8, src: 'warp-slide', volume: 0.55 },
  { at: bF(10) - 2, src: 'impact-deep-whoosh', volume: 0.6 },
  ...cutSfx,
  { at: bF(OUTRO_BEAT) - 6, src: 'whoosh-fast', volume: 0.4 },
  { at: bF(OUTRO_BEAT) - 2, src: 'impact-deep-whoosh', volume: 0.6 },
  { at: bF(OUTRO_BEAT) + 16, src: 'sparkle', volume: 0.32 },
];

export const RisekReelCut: React.FC<{ bgm: boolean }> = ({ bgm }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0} durationInFrames={bF(10) + 8}>
      <Opening />
    </Sequence>
    <Sequence from={bF(START_BEAT)} durationInFrames={bF(OUTRO_BEAT) - bF(START_BEAT)}>
      <CutWalkMount />
    </Sequence>
    <Sequence from={bF(OUTRO_BEAT)} durationInFrames={CUT_TOTAL - bF(OUTRO_BEAT)}>
      <LogoEnd />
    </Sequence>
    <TunnelFlash />
    {bgm && (
      <Audio
        src={staticFile('audio/bgm-tech-house.mp3')}
        trimBefore={MUSIC_TRIM}
        volume={(fr) => 0.85 * interpolate(fr, [0, 3, CUT_TOTAL - 40, CUT_TOTAL - 2], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    )}
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.at} layout="none">
        <Audio src={staticFile(`audio/${s.src}.mp3`)} volume={s.volume} trimBefore={s.trim} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// CutWalk works in reel frames; the mount offsets the Sequence back so PLACED.from stays absolute.
const CutWalkMount: React.FC = () => (
  <Sequence from={-bF(START_BEAT)} layout="none">
    <CutWalk />
  </Sequence>
);
