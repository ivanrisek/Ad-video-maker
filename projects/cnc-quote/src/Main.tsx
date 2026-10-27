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
import { PdfReveal } from './scenes/PdfReveal';

// ~38.6s @ 30fps. Single source of truth for the timeline; captions, flashes and SFX derive from it.
//
// Music: bgm-tech-house.mp3, measured 124.0 BPM → BEAT = 14.516 f. Started BGM_START_FROM frames into
// the track so its drop lands on the calculator cut. From the drop on, every cut and key hit sits on
// beatF(n) = the frame where beat n is HEARD in the render (kick onset + measured output offset).
// Measured offsets (Remotion 4.0.484, h264/aac, ffmpeg cross-correlation, 2026-10-27):
//   - output audio offset: +1.28 f (AAC priming), uniform for all sources;
//   - source lead-in to peak: click-camera 5.7 f, swoosh-quick 8.9 f, transition-soft 13 f,
//     impact-deep-whoosh 16.5 f, riser-cine 22 f.
// SFX `from` = target frame − lead-in − OUT_OFFSET, so the peak is heard on the picture frame.
export const BGM_START_FROM = 125; // frames into the track
export const BEAT = 30 * 60 / 124.0; // 14.516 f
const BEAT0 = 342.1; // heard frame of the drop downbeat
export const beatF = (n: number) => Math.round(BEAT0 + n * BEAT);
const OUT_OFFSET = 1.3;
const LEAD: Record<string, number> = { 'click-camera.mp3': 5.7, 'swoosh-quick.mp3': 8.9, 'transition-soft.mp3': 13, 'impact-deep-whoosh.mp3': 16.5, 'riser-cine.mp3': 22, 'whoosh-fast.mp3': 6, 'whoosh-big.mp3': 8, 'keyboard.mp3': 0, 'sparkle-touch.mp3': 2 };
const at = (frame: number, src: string) => Math.round(frame - (LEAD[src] ?? 0) - OUT_OFFSET);

export const SHOTS = {
  brand: { from: 0, duration: 100 },
  card1: { from: 100, duration: 75 },
  materials: { from: 175, duration: 167 },
  calc: { from: beatF(0), duration: beatF(18) - beatF(0) }, // 342–603
  card2: { from: beatF(18), duration: beatF(23) - beatF(18) }, // 603–676
  qty: { from: beatF(23), duration: beatF(30) - beatF(23) }, // 676–778
  quotes: { from: beatF(30), duration: beatF(38) - beatF(30) }, // 778–894
  pdf: { from: beatF(38), duration: beatF(46) - beatF(38) }, // 894–1010: the printed quote writes itself
  outro: { from: beatF(46), duration: 150 }, // 1010–1160; logo stamp on beatF(49)
} as const;
export const TOTAL = SHOTS.outro.from + SHOTS.outro.duration;

export const TITLE_CARDS = {
  card1: { text: '*Današnje* cijene metala, / svaki radni dan.' },
  card2: { text: 'Svakoj količini – / *svoja* cijena.' },
} as const;

const S = SHOTS;
export const CAPTIONS = [
  { from: S.materials.from + 40, duration: 110, text: 'LME + premija · cjenici dobavljača' },
  { from: S.calc.from + 29, duration: 42, text: 'Dimenzije → sirovac i materijal' },
  { from: S.calc.from + 73, duration: 42, text: 'Strojno vrijeme i obrada' },
  { from: S.calc.from + 116, duration: 42, text: 'Cijena po komadu, odmah' },
  { from: S.calc.from + 160, duration: 92, text: 'Struktura cijene do centa' },
  { from: S.qty.from + 12, duration: 84, text: '1 → 1000 kom · do −77 % po komadu' },
  { from: S.quotes.from + 48, duration: 62, text: 'Sve ponude na jednom mjestu' },
  { from: S.pdf.from + 30, duration: 80, text: 'Gotova ponuda za kupca · ispis i PDF' },
] as const;

// cool flash cuts on the two big hard cuts (drop into the calculator, into the finale)
export const FLASH_CUTS = [S.calc.from, S.outro.from];

// SFX pinned to picture. Cinematic vocabulary only; with a driving BGM the SFX stay sparse.
export type Sfx = { from: number; src: string; volume: number; dur?: number; note: string };
const sfx = (frame: number, src: string, volume: number, note: string, dur?: number): Sfx => ({ from: at(frame, src), src, volume, note, dur });
const CLICK_LOCAL = (k: number) => 21.55 + 22 + 43.55 * k; // CalcFlyover clickAt(k) = beats 3/6/9/12
const STAMP = beatF(49); // outro logo lands
export const SFX: Sfx[] = [
  sfx(14, 'transition-soft.mp3', 0.4, 'brand logo lands'),
  sfx(S.brand.from + 96, 'whoosh-fast.mp3', 0.35, 'lockup lifts out'),
  sfx(S.card1.from + 6, 'swoosh-quick.mp3', 0.38, 'title card 1 words press in'),
  sfx(S.materials.from + 2, 'transition-soft.mp3', 0.36, 'close-up on the tracked row'),
  sfx(S.materials.from + 30, 'whoosh-big.mp3', 0.42, 'crane lift at speed'),
  sfx(S.materials.from + 134, 'sparkle-touch.mp3', 0.32, "today's price pulses", 40),
  ...[0, 1, 2, 3].map((k) => sfx(S.calc.from + CLICK_LOCAL(k), 'click-camera.mp3', 0.55 - 0.04 * k, `calculator click ${k + 1} (beat ${3 + 3 * k})`)),
  sfx(S.card2.from + 6, 'swoosh-quick.mp3', 0.38, 'title card 2 words press in'),
  sfx(S.qty.from + 12, 'transition-soft.mp3', 0.36, 'first quantity row lands'),
  sfx(S.quotes.from + 15, 'keyboard.mp3', 0.45, 'typing "prirub" (6 chars × 3f)', 18),
  sfx(S.quotes.from + 46, 'whoosh-fast.mp3', 0.3, 'rows filter away'),
  sfx(S.quotes.from + 73, 'click-camera.mp3', 0.6, 'click Otvori (beat 35)'),
  sfx(S.pdf.from + 2, 'transition-soft.mp3', 0.36, 'quote sheet in'),
  sfx(S.pdf.from + 8, 'keyboard.mp3', 0.3, 'document writes itself (8→53f)', 45),
  sfx(STAMP, 'riser-cine.mp3', 0.36, 'riser peaks into the stamp, fades with it', 30),
  sfx(STAMP, 'impact-deep-whoosh.mp3', 0.4, 'logo stamp (beat 41, film peak)'),
  sfx(S.outro.from + 58, 'sparkle-touch.mp3', 0.34, 'rule + tagline glint', 50),
];

// BGM envelope: fade in, sit at 0.34 under the SFX, dip under the outro stamp, fade out
const bgmVolume = (f: number) => {
  const fadeIn = Math.min(1, f / 20);
  const fadeOut = Math.min(1, Math.max(0, (TOTAL - f) / 36));
  const dip = 1 - 0.35 * Math.max(0, 1 - Math.abs(f - STAMP) / 10);
  return 0.34 * fadeIn * fadeOut * dip;
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
      <Sequence from={S.pdf.from} durationInFrames={S.pdf.duration}><PdfReveal /></Sequence>
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
