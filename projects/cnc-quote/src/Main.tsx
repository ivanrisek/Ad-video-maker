import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { C, useFonts } from './lib/Brand';
import { Caption, FlashCut } from './lib/Overlays';
import { BrandOpen } from './scenes/BrandOpen';
import { TitleCard } from './scenes/TitleCard';
import { MaterialsCrane } from './scenes/MaterialsCrane';
import { CalcFlyover } from './scenes/CalcFlyover';
import { QtyRows } from './scenes/QtyRows';
import { QuotesSearch } from './scenes/QuotesSearch';
import { Outro } from './scenes/Outro';

// ~32.5s @ 30fps. Single source of truth for the timeline; captions, flashes and SFX derive from it.
// Music: bgm-tech-house.mp3, 125 BPM (14.4 f/beat), started 145 f into the track so its drop (15.49 s)
// lands on the calculator cut (f320). From the drop on, every cut and key hit sits on beatF(n).
export const BGM_START_FROM = 145; // frames into the track
export const BEAT = 14.4;
export const beatF = (n: number) => Math.round(319.7 + n * BEAT); // n = beats after the drop

export const SHOTS = {
  brand: { from: 0, duration: 100 },
  card1: { from: 100, duration: 55 },
  materials: { from: 155, duration: 165 },
  calc: { from: beatF(0), duration: beatF(16) - beatF(0) }, // 320–550
  card2: { from: beatF(16), duration: beatF(20) - beatF(16) }, // 550–608
  qty: { from: beatF(20), duration: beatF(27) - beatF(20) }, // 608–708
  quotes: { from: beatF(27), duration: beatF(35) - beatF(27) }, // 708–824
  outro: { from: beatF(35), duration: 150 }, // 824–974; wordmark stamp on beatF(38)
} as const;
export const TOTAL = SHOTS.outro.from + SHOTS.outro.duration;

export const TITLE_CARDS = {
  card1: { text: 'Cijene metala s *burze,* / svaki dan.' },
  card2: { text: 'Svaka količina, / *svoja* cijena.' },
} as const;

const S = SHOTS;
export const CAPTIONS = [
  { from: S.materials.from + 40, duration: 110, text: 'LME + premija · osvježeno svaki radni dan' },
  { from: S.calc.from + 29, duration: 40, text: 'Dimenzije → sirovac i materijal' },
  { from: S.calc.from + 72, duration: 40, text: 'Strojno vrijeme i obrada' },
  { from: S.calc.from + 115, duration: 40, text: 'Cijena po komadu, odmah' },
  { from: S.calc.from + 159, duration: 64, text: 'Struktura cijene do centa' },
  { from: S.qty.from + 12, duration: 82, text: '1 → 1000 kom · do −77 % po komadu' },
  { from: S.quotes.from + 50, duration: 60, text: 'Sve ponude na jednom mjestu' },
] as const;

// cool flash cuts straddling hard cuts between live shots
export const FLASH_CUTS = [S.calc.from, S.quotes.from, S.outro.from];

// SFX pinned to picture (relative to shot starts / beats). Cinematic vocabulary only; with a
// driving BGM the SFX stay sparse: transitions, real clicks, typing, and the outro riser→impact→sparkle.
export type Sfx = { from: number; src: string; volume: number; dur?: number; note: string };
const CLICK_LOCAL = (k: number) => 21 + 22 + 43.2 * k; // CalcFlyover clickAt(k)
export const SFX: Sfx[] = [
  { from: 12, src: 'transition-soft.mp3', volume: 0.4, note: 'brand lockup lands' },
  { from: S.brand.from + 92, src: 'whoosh-fast.mp3', volume: 0.35, note: 'lockup lifts out' },
  { from: S.card1.from, src: 'swoosh-quick.mp3', volume: 0.38, note: 'title card 1' },
  { from: S.materials.from + 2, src: 'transition-soft.mp3', volume: 0.38, note: 'close-up on the tracked row' },
  { from: S.materials.from + 24, src: 'whoosh-big.mp3', volume: 0.42, note: 'crane lift starts' },
  { from: S.materials.from + 134, src: 'sparkle-touch.mp3', volume: 0.3, dur: 40, note: "today's price pulses" },
  ...[0, 1, 2, 3].map((k) => ({ from: S.calc.from + Math.round(CLICK_LOCAL(k)), src: 'click-camera.mp3', volume: 0.5 - 0.04 * k, note: `calculator click ${k + 1} (on beat)` })),
  { from: S.calc.from + 192, src: 'swoosh-quick.mp3', volume: 0.3, note: 'pull back to the whole page' },
  { from: S.card2.from, src: 'swoosh-quick.mp3', volume: 0.38, note: 'title card 2' },
  { from: S.qty.from + 2, src: 'transition-soft.mp3', volume: 0.38, note: 'quantity rows start landing' },
  { from: S.quotes.from + 15, src: 'keyboard.mp3', volume: 0.42, dur: 18, note: 'typing "prirub" (6 chars × 3f)' },
  { from: S.quotes.from + 44, src: 'whoosh-fast.mp3', volume: 0.3, note: 'rows filter away' },
  { from: S.quotes.from + 72, src: 'click-camera.mp3', volume: 0.55, note: 'click Otvori (on beat)' },
  { from: beatF(38) - 22, src: 'riser-cine.mp3', volume: 0.5, dur: 30, note: 'riser peaks into the stamp' },
  { from: beatF(38) - 12, src: 'impact-deep-whoosh.mp3', volume: 0.46, note: 'wordmark stamp (beat 38, film peak)' },
  { from: S.outro.from + 57, src: 'sparkle-touch.mp3', volume: 0.32, dur: 50, note: 'rule + tagline glint' },
];

// BGM envelope: fade in, sit at 0.34 under the SFX, dip a little under the outro impact, fade out
const bgmVolume = (f: number) => {
  const fadeIn = Math.min(1, f / 20);
  const fadeOut = Math.min(1, Math.max(0, (TOTAL - f) / 36));
  return 0.34 * fadeIn * fadeOut;
};

export const Main: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bar }}>
      {bgm ? <Audio src={staticFile('audio/bgm-tech-house.mp3')} startFrom={BGM_START_FROM} volume={bgmVolume} /> : null}
      {SFX.map((s, i) => (
        <Sequence key={`sfx-${i}`} from={s.from} durationInFrames={s.dur ?? 90}>
          <Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} />
        </Sequence>
      ))}
      <Sequence from={S.brand.from} durationInFrames={S.brand.duration}><BrandOpen /></Sequence>
      <Sequence from={S.card1.from} durationInFrames={S.card1.duration}><TitleCard text={TITLE_CARDS.card1.text} duration={S.card1.duration} /></Sequence>
      <Sequence from={S.materials.from} durationInFrames={S.materials.duration}><MaterialsCrane /></Sequence>
      <Sequence from={S.calc.from} durationInFrames={S.calc.duration}><CalcFlyover /></Sequence>
      <Sequence from={S.card2.from} durationInFrames={S.card2.duration}><TitleCard text={TITLE_CARDS.card2.text} duration={S.card2.duration} /></Sequence>
      <Sequence from={S.qty.from} durationInFrames={S.qty.duration}><QtyRows /></Sequence>
      <Sequence from={S.quotes.from} durationInFrames={S.quotes.duration}><QuotesSearch /></Sequence>
      <Sequence from={S.outro.from} durationInFrames={S.outro.duration}><Outro /></Sequence>
      {CAPTIONS.map((c) => (
        <Sequence key={c.from} from={c.from} durationInFrames={c.duration}><Caption text={c.text} duration={c.duration} /></Sequence>
      ))}
      {FLASH_CUTS.map((cut) => (
        <Sequence key={cut} from={cut - 5} durationInFrames={10}><FlashCut /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
