// Film 2: CNC.Quote walkthrough promo (login → every page → random calculation → saved + printed quote).
// Single source of truth for this film's timeline; captions, flashes and SFX derive from it.
// Music: same bgm-tech-house.mp3 (124 BPM, BEAT = 14.516 f); started so its drop is heard on the page-tour
// cut (f225). From the drop on, cuts and key hits sit on beatF(n) (heard frame of beat n).
// SFX offsets measured for film 1 (see src/Main.tsx): output +1.3 f, per-source lead-in to peak.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { C, useFonts } from '../lib/Brand';
import { Caption, FlashCut } from '../lib/Overlays';
import { BrandOpen } from '../scenes/BrandOpen';
import { TitleCard } from '../scenes/TitleCard';
import { PdfLayout, PdfReveal } from '../scenes/PdfReveal';
import { El, Outro } from '../scenes/Outro';
import { LoginShot, LOGIN_DURATION } from './LoginShot';
import { PageTour } from './PageTour';
import { CalcEntry } from './CalcEntry';
import WT from '../walkthrough.json';

export const BEAT = 30 * 60 / 124.0;
const DROP = 225.1;
export const BGM_START_FROM = Math.round(145 + (322.1 - DROP)); // film 1: startFrom 145 → drop heard at 322.1
export const beatF = (n: number) => Math.round(DROP + n * BEAT);
const OUT_OFFSET = 1.3;
const LEAD: Record<string, number> = { 'click-camera.mp3': 5.7, 'switch-click-quick.mp3': 0.2, 'swoosh-quick.mp3': 8.9, 'transition-soft.mp3': 13, 'impact-deep-whoosh.mp3': 16.5, 'riser-cine.mp3': 22, 'whoosh-fast.mp3': 6, 'whoosh-big.mp3': 8, 'keyboard.mp3': 0, 'sparkle-touch.mp3': 2 };
const at = (frame: number, src: string) => Math.round(frame - (LEAD[src] ?? 0) - OUT_OFFSET);

export const WT_SHOTS = {
  brand: { from: 0, duration: 100 },
  login: { from: 100, duration: LOGIN_DURATION }, // 100–225
  tour: { from: beatF(0), duration: beatF(15) - beatF(0) }, // 225–443
  card: { from: beatF(15), duration: beatF(20) - beatF(15) }, // 443–515
  calc: { from: beatF(20), duration: beatF(42) - beatF(20) }, // 515–835
  pdf: { from: beatF(42), duration: beatF(50) - beatF(42) }, // 835–951
  outro: { from: beatF(50), duration: 150 }, // 951–1101; logo stamp on beatF(53)
} as const;
export const WT_TOTAL = WT_SHOTS.outro.from + WT_SHOTS.outro.duration;
const S = WT_SHOTS;
const STAMP = beatF(53);
const CARD_TEXT = 'Upišite dio. / Cijena se računa *odmah.*';
const TAGLINE = 'Kalkulacije i ponude s današnjim cijenama materijala.';

const B = (n: number) => Math.round(n * BEAT); // local beat offset inside a beat-aligned shot
export const WT_CAPTIONS = [
  { from: S.calc.from + 30, duration: 36, text: 'Kupac iz popisa klijenata' },
  { from: S.calc.from + 70, duration: 56, text: `${WT.calc.part} · ${WT.calc.qty} kom` },
  { from: S.calc.from + B(10) - 2, duration: 56, text: `Materijal ${WT.calc.mat} po današnjoj cijeni` },
  { from: S.calc.from + B(14) - 2, duration: 52, text: `Sirovac Ø${WT.calc.D}×${WT.calc.L} · ${WT.calc.machine}` },
  { from: S.calc.from + B(19) + 4, duration: 32, text: `${WT.saved.titleText.replace('Ponuda ', 'Spremljeno kao ')}` },
  { from: S.pdf.from + 30, duration: 80, text: 'Gotova ponuda za kupca · ispis i PDF' },
];
export const WT_FLASHES = [S.tour.from, S.outro.from];

type Sfx = { from: number; src: string; volume: number; dur?: number; note: string };
const sfx = (frame: number, src: string, volume: number, note: string, dur?: number): Sfx => ({ from: at(frame, src), src, volume, note, dur });
// calculator clicks (local beats 3,5,8,10,11,13,14,15,17,19,21): two real click samples alternate, volume steps down
const CALC_CLICKS = [3, 5, 8, 10, 11, 13, 14, 15, 17, 19, 21];
export const WT_SFX: Sfx[] = [
  sfx(14, 'transition-soft.mp3', 0.4, 'brand logo lands'),
  sfx(S.brand.from + 96, 'whoosh-fast.mp3', 0.35, 'lockup lifts out'),
  sfx(S.login.from + 46, 'switch-click-quick.mp3', 0.25, 'e-mail autofill'),
  sfx(S.login.from + 58, 'keyboard.mp3', 0.32, 'password typing (17 × 2f)', 34),
  sfx(S.login.from + 98, 'click-camera.mp3', 0.55, 'click "Prijavi se"'),
  sfx(S.login.from + 106, 'whoosh-big.mp3', 0.4, 'push through the button'),
  ...[3, 6, 9, 12].map((b, k) => sfx(beatF(b), 'swoosh-quick.mp3', 0.34 - 0.02 * k, `page push ${k + 1} (beat ${b})`)),
  sfx(S.card.from + 6, 'swoosh-quick.mp3', 0.36, 'title card words press in'),
  ...CALC_CLICKS.map((b, k) => sfx(S.calc.from + B(b), k % 2 ? 'switch-click-quick.mp3' : 'click-camera.mp3', (k % 2 ? 0.3 : 0.48) - 0.012 * k, `calculator click ${k + 1} (beat ${b})`)),
  sfx(S.calc.from + B(5) + 3, 'keyboard.mp3', 0.34, 'typing the part name (11 × 3f)', 33),
  sfx(S.calc.from + B(8) + 3, 'keyboard.mp3', 0.3, 'typing the quantity', 6),
  sfx(S.calc.from + B(11) + 3, 'keyboard.mp3', 0.3, 'typing the material query', 9),
  sfx(S.calc.from + B(14) + 3, 'keyboard.mp3', 0.3, 'typing Ø', 6),
  sfx(S.calc.from + B(15) + 3, 'keyboard.mp3', 0.3, 'typing L', 9),
  sfx(S.calc.from + B(19) + 6, 'sparkle-touch.mp3', 0.28, 'saved toast', 36),
  sfx(S.pdf.from + 2, 'transition-soft.mp3', 0.36, 'quote sheet in'),
  sfx(S.pdf.from + 8, 'keyboard.mp3', 0.28, 'document writes itself', 45),
  sfx(STAMP, 'riser-cine.mp3', 0.36, 'riser peaks into the stamp', 30),
  sfx(STAMP, 'impact-deep-whoosh.mp3', 0.4, 'logo stamp (beat 53, film peak)'),
  sfx(S.outro.from + 58, 'sparkle-touch.mp3', 0.34, 'rule + tagline glint', 50),
];

const bgmVolume = (f: number) => {
  const fadeIn = Math.min(1, f / 20);
  const fadeOut = Math.min(1, Math.max(0, (WT_TOTAL - f) / 36));
  const dip = 1 - 0.35 * Math.max(0, 1 - Math.abs(f - STAMP) / 10);
  return 0.34 * fadeIn * fadeOut * dip;
};

const OUTRO_ELS: El[] = [
  { key: 'topbar', file: 'wt/el-topbar.png', w: 1920, h: 99, cx: 960, cy: 66, scale: 0.6, rot: 0, dx: 0, dy: -140, radius: 10, cue: 4 },
  { key: 'price', file: 'wt/price-s7.png', w: 430, h: 244, cx: 255, cy: 250, scale: 0.82, rot: -4, dx: -520, dy: 0, radius: 12, cue: 7 },
  { key: 'al', file: 'wt/el-al.png', w: 175, h: 175, cx: 1640, cy: 300, scale: 1.15, rot: 4, dx: 520, dy: 0, radius: 12, cue: 10 },
  { key: 'struct', file: 'wt/el-structure.png', w: 430, h: 285, cx: 330, cy: 830, scale: 0.74, rot: 3, dx: -420, dy: 300, radius: 12, cue: 13 },
  { key: 'pdf', file: 'wt/el-pdf-small.png', w: 195, h: 276, cx: 1775, cy: 600, scale: 0.85, rot: 5, dx: 520, dy: 40, radius: 4, cue: 16 },
  { key: 'quote', file: 'wt/el-quote.png', w: 705, h: 33, cx: 900, cy: 968, scale: 1, rot: 1.5, dx: 0, dy: 320, radius: 6, cue: 19 },
  { key: 'client', file: 'wt/el-client.png', w: 705, h: 34, cx: 1460, cy: 880, scale: 0.9, rot: -2, dx: 420, dy: 260, radius: 6, cue: 22 },
  { key: 'kpis', file: 'wt/el-kpis.png', w: 642, h: 50.5, cx: 1060, cy: 196, scale: 1, rot: -1.5, dx: 300, dy: -240, radius: 8, cue: 25 },
];

export const Walkthrough: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bar }}>
      {bgm ? <Audio src={staticFile('audio/bgm-tech-house.mp3')} startFrom={BGM_START_FROM} volume={bgmVolume} /> : null}
      {WT_SFX.map((s, i) => (
        <Sequence key={`sfx-${i}`} from={s.from} durationInFrames={s.dur ?? 90}>
          <Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} />
        </Sequence>
      ))}
      <Sequence from={S.brand.from} durationInFrames={S.brand.duration}><BrandOpen /></Sequence>
      <Sequence from={S.login.from} durationInFrames={S.login.duration}><LoginShot /></Sequence>
      <Sequence from={S.tour.from} durationInFrames={S.tour.duration}><PageTour /></Sequence>
      <Sequence from={S.card.from} durationInFrames={S.card.duration}><TitleCard text={CARD_TEXT} duration={S.card.duration} /></Sequence>
      <Sequence from={S.calc.from} durationInFrames={S.calc.duration}><CalcEntry /></Sequence>
      <Sequence from={S.pdf.from} durationInFrames={S.pdf.duration}><PdfReveal src="textures/wt/quote-pdf.png" P={WT.pdf as unknown as PdfLayout} /></Sequence>
      <Sequence from={S.outro.from} durationInFrames={S.outro.duration}><Outro els={OUTRO_ELS} tagline={TAGLINE} backdrop="textures/wt/page-ponude.png" /></Sequence>
      {WT_CAPTIONS.map((c) => (
        <Sequence key={c.from} from={c.from} durationInFrames={c.duration}><Caption text={c.text} duration={c.duration} /></Sequence>
      ))}
      {WT_FLASHES.map((cut) => (
        <Sequence key={cut} from={cut - 5} durationInFrames={10}><FlashCut /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
