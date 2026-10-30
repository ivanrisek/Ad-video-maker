// Film 2: CNC.Quote walkthrough promo (login → every page → random calculation → saved + printed quote).
// Single source of truth for this film's timeline; captions, flashes and SFX derive from it.
// Music: same bgm-tech-house.mp3 (124 BPM, BEAT = 14.516 f); started so its drop is heard on the page-tour
// cut (f225). From the drop on, cuts and key hits sit on beatF(n) (heard frame of beat n).
// SFX offsets measured for film 1 (see src/Main.tsx): output +1.3 f, per-source lead-in to peak.
import React from 'react';
import { AbsoluteFill, Sequence, staticFile } from 'remotion';
import { Audio } from '@remotion/media';
import { LightLeakOverlay } from '../fx/LightLeak';
import { C, useFonts } from '../lib/Brand';
import { Caption } from '../lib/Overlays';
import { BrandOpen } from '../scenes/BrandOpen';
import { TitleCard } from '../scenes/TitleCard';
import { PdfLayout, PdfReveal } from '../scenes/PdfReveal';
import { El, Outro } from '../scenes/Outro';
import { LoginShot, LOGIN_DURATION } from './LoginShot';
import { PageTour } from './PageTour';
import { CalcEntry, CL, CALC_ENTRY_BEATS } from './CalcEntry';
import { PAGE_TOUR_BEATS } from './PageTour';
import WT from '../walkthrough.json';

export const BEAT = 30 * 60 / 124.0;
const DROP = 225.1;
export const BGM_START_FROM = Math.round(145 + (322.1 - DROP)); // film 1: startFrom 145 → drop heard at 322.1
export const beatF = (n: number) => Math.round(DROP + n * BEAT);
const OUT_OFFSET = 1.3;
// lead-in to peak, measured on the source files (rms + sample peak, 2026-10-30): click-camera 5.7, switch-click-quick 0.2,
// swoosh-quick 8.9, transition-soft 13, whoosh-fast 21.5, whoosh-big 21.4, sparkle-touch 15.7, impact-deep-whoosh 16.5, riser-cine 22
const LEAD: Record<string, number> = { 'click-camera.mp3': 5.7, 'switch-click-quick.mp3': 0.2, 'swoosh-quick.mp3': 8.9, 'transition-soft.mp3': 13, 'impact-deep-whoosh.mp3': 16.5, 'riser-cine.mp3': 22, 'whoosh-fast.mp3': 21.5, 'whoosh-big.mp3': 21.4, 'keyboard.mp3': 0, 'sparkle-touch.mp3': 15.7 };
const at = (frame: number, src: string) => Math.round(frame - (LEAD[src] ?? 0) - OUT_OFFSET);

const TOUR_END = PAGE_TOUR_BEATS;
const CARD_END = TOUR_END + 5;
const CALC_END = CARD_END + CALC_ENTRY_BEATS;
const PDF_END = CALC_END + 8;
export const WT_SHOTS = {
  brand: { from: 0, duration: 100 },
  login: { from: 100, duration: LOGIN_DURATION }, // 100–225
  tour: { from: beatF(0), duration: beatF(TOUR_END) - beatF(0) }, // 225–588
  card: { from: beatF(TOUR_END), duration: beatF(CARD_END) - beatF(TOUR_END) }, // 588–660
  calc: { from: beatF(CARD_END), duration: beatF(CALC_END) - beatF(CARD_END) }, // 660–1052
  pdf: { from: beatF(CALC_END), duration: beatF(PDF_END) - beatF(CALC_END) }, // 1052–1168
  outro: { from: beatF(PDF_END), duration: 150 }, // 1168–1318; logo stamp on beatF(PDF_END + 3)
} as const;
export const WT_TOTAL = WT_SHOTS.outro.from + WT_SHOTS.outro.duration;
const S = WT_SHOTS;
const STAMP = beatF(PDF_END + 3);
const CARD_TEXT = 'Upišite dio. / Cijena se računa *odmah.*';
// the price per piece calculated on the previous shot, circled on the printed quote (measured on quote-pdf.png)
const PDF_PRICE = { box: { x: 551, y: 399, w: 48, h: 18 }, label: `${WT.states.find((s) => s.name === 's7')!.priceText.replace('€', ' €')} / kom · iz kalkulacije` };
const TAGLINE = 'Od upisa dijela do gotove ponude.';

const c = (k: keyof typeof CL) => S.calc.from + CL[k];
// captions follow the action they describe (each starts once that step is on screen)
export const WT_CAPTIONS = [
  { from: c('client') + 4, duration: 34, text: 'Kupac iz popisa klijenata' },
  { from: c('qty') + 12, duration: 30, text: `${WT.calc.part} · ${WT.calc.drawing} · ${WT.calc.qty} kom` },
  { from: c('option') + 5, duration: 40, text: `Materijal ${WT.calc.mat} · 2,70 €/kg iz cjenika` },
  { from: c('cycle') + 12, duration: 36, text: `Sirovac Ø${WT.calc.D}×${WT.calc.L} · ${WT.calc.machine} ${WT.calc.cycle} min` },
  { from: S.pdf.from + 30, duration: 80, text: 'Gotova ponuda za kupca · ispis i PDF' },
];
// light leaks (cobalt) straddle the big cuts: brand→login, login→tour (drop), calc→PDF, PDF→outro
export const WT_LEAKS = [S.login.from, S.tour.from, S.pdf.from, S.outro.from];
const LEAK = 24;

type Sfx = { from: number; src: string; volume: number; dur?: number; note: string };
const sfx = (frame: number, src: string, volume: number, note: string, dur?: number): Sfx => ({ from: at(frame, src), src, volume, note, dur });
const CALC_CLICKS = Object.keys(CL) as (keyof typeof CL)[];
const TYPING: [keyof typeof CL, number, string][] = [['part', WT.calc.part.length, 'part name'], ['drawing', WT.calc.drawing.length, 'drawing no.'], ['qty', WT.calc.qty.length, 'quantity'],
  ['mat', WT.calc.query.length, 'material query'], ['dimD', WT.calc.D.length, 'Ø'], ['dimL', WT.calc.L.length, 'L'], ['cycle', WT.calc.cycle.length, 'cycle time']];
export const WT_SFX: Sfx[] = [
  sfx(14, 'transition-soft.mp3', 0.4, 'brand logo lands'),
  sfx(S.brand.from + 96, 'whoosh-fast.mp3', 0.35, 'lockup lifts out'),
  sfx(S.login.from + 46, 'switch-click-quick.mp3', 0.25, 'e-mail autofill'),
  sfx(S.login.from + 58, 'keyboard.mp3', 0.32, 'password typing (17 × 2f)', 34),
  sfx(S.login.from + 98, 'click-camera.mp3', 0.55, 'click "Prijavi se"'),
  sfx(S.login.from + 118, 'whoosh-big.mp3', 0.4, 'push through the button'),
  ...[5, 10, 15, 20].map((b, k) => sfx(beatF(b), 'swoosh-quick.mp3', 0.34 - 0.02 * k, `page push ${k + 1} (beat ${b})`)),
  sfx(S.card.from + 6, 'swoosh-quick.mp3', 0.36, 'title card words press in'),
  ...CALC_CLICKS.map((k, i) => sfx(c(k), i % 2 ? 'switch-click-quick.mp3' : 'click-camera.mp3', (i % 2 ? 0.3 : 0.48) - 0.01 * i, `calculator click: ${k} (on beat)`)),
  ...TYPING.map(([k, n, what]) => sfx(c(k) + 3, 'keyboard.mp3', 0.32, `typing ${what}`, n * 3)),
  sfx(c('save') + 6, 'sparkle-touch.mp3', 0.4, 'saved toast', 40),
  sfx(S.pdf.from + 2, 'transition-soft.mp3', 0.36, 'quote sheet in'),
  sfx(S.pdf.from + 8, 'keyboard.mp3', 0.28, 'document writes itself', 45),
  sfx(STAMP, 'riser-cine.mp3', 0.36, 'riser peaks into the stamp', 30),
  sfx(STAMP, 'impact-deep-whoosh.mp3', 0.4, 'logo stamp (film peak)'),
  sfx(S.outro.from + 58, 'sparkle-touch.mp3', 0.38, 'rule + tagline glint', 50),
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

export const Walkthrough: React.FC<{ bgm?: boolean; captions?: boolean }> = ({ bgm = true, captions = true }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bar }}>
      {bgm ? <Audio src={staticFile('audio/bgm-tech-house.mp3')} trimBefore={BGM_START_FROM} volume={bgmVolume} /> : null}
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
      <Sequence from={S.pdf.from} durationInFrames={S.pdf.duration}><PdfReveal src="textures/wt/quote-pdf.png" P={WT.pdf as unknown as PdfLayout} price={PDF_PRICE} /></Sequence>
      <Sequence from={S.outro.from} durationInFrames={S.outro.duration}><Outro els={OUTRO_ELS} tagline={TAGLINE} backdrop="textures/wt/page-ponude.png" /></Sequence>
      {captions && WT_CAPTIONS.map((c) => (
        <Sequence key={c.from} from={c.from} durationInFrames={c.duration}><Caption text={c.text} duration={c.duration} /></Sequence>
      ))}
      {WT_LEAKS.map((cut, i) => (
        <Sequence key={cut} name={`Light leak ${i + 1}`} from={cut - LEAK / 2} durationInFrames={LEAK}><LightLeakOverlay seed={i + 2} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
