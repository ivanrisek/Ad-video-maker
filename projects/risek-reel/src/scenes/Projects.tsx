// Projects — chapter 0 is the user's recording of "Projekti koje smo realizirali"; then each project
// pushes up from the bottom edge as a full-screen chapter in its own colour (card: bottom-push-stack-wipe),
// one push per bar, footage straight from the site's project films.
import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp, bezier, mix, SpeedBlur } from '../lib/Polish';
import { C, DISPLAY, MONO, ICE_GRAD } from '../brand';
import { BlurIn, BlurWords, BrowserCard, Eyebrow, display, words } from '../components';
import { bF, SHOTS } from '../timeline';

const L = (n: number) => bF(n) - SHOTS.projects.from;
export const PROJECTS_DUR = SHOTS.projects.to - SHOTS.projects.from;
const H = 1920;
const PUSH = 26;
const pushEase = bezier(0.12, 0.9, 0.2, 1);
const PUSH_AT = [L(40), L(44), L(48)];

type Chapter = {
  tag: string;
  name: React.ReactNode;
  line: string;
  src: string;
  aspect: number;
  url: string;
  base: string; // chapter colour (each project's own palette)
  deep: string;
  accent: string;
  trim: number; // frames into the site film
  rate: number;
};

const CHAPTERS: Chapter[] = [
  {
    tag: 'Vlastiti proizvod · SaaS',
    name: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
        <div style={{ width: 104, height: 104, borderRadius: 26, background: 'linear-gradient(160deg,#6d7dff,#3a48e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px -10px rgba(90,110,255,0.8)' }}>
          <div style={{ width: 50, height: 50, borderRadius: 99, border: '9px solid #fff', borderRightColor: 'transparent', transform: 'rotate(-45deg)' }} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 108, letterSpacing: '-0.035em', color: '#fff', lineHeight: 1 }}>
          CNC<span style={{ color: '#7d8cff' }}>.</span>Quote
        </div>
      </div>
    ),
    line: 'Kalkulacija CNC obrade i ponuda — od dimenzija do ponude, s današnjim cijenama.',
    src: 'video/p_cnc.mp4',
    aspect: 630 / 1120,
    url: 'cncquote.app',
    base: '#141f5c',
    deep: '#070b26',
    accent: '#7d8cff',
    trim: 0,
    rate: 1.1,
  },
  {
    tag: 'Klijent · Web, hosting i IT',
    name: <Img src={staticFile('img/cnc-logo-transparent.png')} style={{ height: 150, display: 'block', marginTop: -14 }} />,
    line: 'Precizna CNC obrada metala iz Krapine — web stranica, hosting i IT infrastruktura.',
    src: 'video/p_dominus.mp4',
    aspect: 700 / 1120,
    url: 'dominus-cnc.hr',
    base: '#4a0d12',
    deep: '#1c0406',
    accent: '#e0a24d',
    trim: 135,
    rate: 0.8,
  },
  {
    tag: 'Klijent · IT podrška i automatizacija',
    name: <Img src={staticFile('img/attention-logo-transparent.png')} style={{ height: 112, display: 'block' }} />,
    line: 'Kreativna digitalna agencija — „Make them notice."',
    src: 'video/p_attention.mp4',
    aspect: 700 / 1120,
    url: 'agency-attention.com',
    base: '#1d3a0d',
    deep: '#0a1704',
    accent: '#a6e04a',
    trim: 45,
    rate: 1,
  },
];

const ChapterView: React.FC<{ ch: Chapter; i: number; local: number }> = ({ ch, i, local }) => {
  const enter = (s: number, d = 18) => ramp(local, s, d, EASE.out);
  const e1 = enter(12);
  const e2 = enter(16, 22);
  const e3 = enter(24);
  const blurStyle = (p: number, dy = 40): React.CSSProperties => ({
    opacity: p,
    transform: `translateY(${((1 - p) * dy).toFixed(2)}px)`,
    filter: p >= 0.999 ? undefined : `blur(${((1 - p) * 10).toFixed(2)}px)`,
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 60% at 25% 18%, ${ch.base} 0%, ${ch.deep} 75%)`,
        overflow: 'hidden',
      }}
    >
      {/* counter */}
      <div style={{ position: 'absolute', right: 72, top: 236, fontFamily: MONO, fontSize: 28, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', ...blurStyle(e1, 20) }}>
        0{i + 1} / 03
      </div>
      <div style={{ position: 'absolute', left: 72, top: 236, ...blurStyle(e1, 20) }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 20px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid ${ch.accent}66`,
            fontFamily: MONO,
            fontSize: 24,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#fff',
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: 9, background: ch.accent, boxShadow: `0 0 12px ${ch.accent}` }} />
          {ch.tag}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 72, top: 330, ...blurStyle(e1, 36) }}>{ch.name}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', perspective: 1800 }}>
        <div style={{ ...blurStyle(e2, 90), transform: `${blurStyle(e2, 90).transform} rotateX(${mix(14, 0, e2).toFixed(2)}deg)` }}>
          <BrowserCard src={ch.src} width={960} aspect={ch.aspect} url={ch.url} trimBefore={ch.trim} playbackRate={ch.rate} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 72, right: 72, top: 1250, ...blurStyle(e3, 30) }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 46, lineHeight: 1.22, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.88)' }}>{ch.line}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Projects: React.FC = () => {
  const f = useCurrentFrame();
  const inP = ramp(f, 0, 12, EASE.out);
  const out = ramp(f, PROJECTS_DUR - 8, 8, EASE.exit);
  const prog = PUSH_AT.map((s) => pushEase(Math.min(1, Math.max(0, (f - s) / PUSH))));
  const progAt = (ff: number) => PUSH_AT.map((s) => pushEase(Math.min(1, Math.max(0, (ff - s) / PUSH))));
  // layer k (0 = intro chapter): y = (1 - own push) * H - next push * H
  const yOf = (p: number[], k: number) => (k === 0 ? 0 : (1 - p[k - 1]) * H) - (k < p.length ? p[k] : 0) * H;
  const vy = (k: number) => yOf(progAt(f + 0.5), k) - yOf(progAt(f - 0.5), k);
  const card = ramp(f, 10, 26, EASE.out);

  const layers = [0, 1, 2, 3].map((k) => {
    const y = yOf(prog, k);
    if (y >= H || y <= -H) return null;
    const seam = k > 0 ? 1 - prog[k - 1] : 0;
    return (
      <AbsoluteFill key={k} style={{ transform: `translateY(${y.toFixed(2)}px)` }}>
        <SpeedBlur vx={0} vy={vy(k)} amount={0.06} max={18}>
          {k === 0 ? (
            <AbsoluteFill style={{ background: C.bg }}>
              <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(40,60,120,0.35), rgba(7,10,20,0) 70%)' }} />
              <BlurIn start={2} style={{ position: 'absolute', left: 72, top: 236 }}>
                <Eyebrow>Naš rad</Eyebrow>
              </BlurIn>
              <div style={{ position: 'absolute', left: 68, right: 60, top: 292 }}>
                <BlurWords words={words('Projekti koje smo', 4, 4, 22)} style={display(92, { color: '#dfe2e7' })} />
                <BlurWords
                  words={words('realizirali.', 16, 4, 26, { backgroundImage: ICE_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' })}
                  style={display(92)}
                />
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center', perspective: 1800 }}>
                <div style={{ opacity: card, transform: `translateY(${((1 - card) * 110).toFixed(1)}px) rotateX(${mix(16, 4, card).toFixed(2)}deg)`, filter: card >= 0.999 ? undefined : `blur(${((1 - card) * 10).toFixed(2)}px)` }}>
                  <BrowserCard src="video/rec_projects.mp4" width={960} aspect={722 / 1400} trimBefore={15} playbackRate={1.2} />
                </div>
              </div>
            </AbsoluteFill>
          ) : (
            <Sequence from={PUSH_AT[k - 1]} layout="none">
              <ChapterView ch={CHAPTERS[k - 1]} i={k - 1} local={f - PUSH_AT[k - 1]} />
            </Sequence>
          )}
        </SpeedBlur>
        {/* contact seam: shadow on the old chapter + lit top edge, gone once landed */}
        {k > 0 && seam > 0.01 && (
          <>
            <div style={{ position: 'absolute', left: 0, right: 0, top: -56, height: 56, background: `linear-gradient(0deg, rgba(0,0,0,${(0.42 * seam).toFixed(3)}), rgba(0,0,0,0))` }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, background: `rgba(255,255,255,${(0.35 * seam).toFixed(3)})` }} />
          </>
        )}
      </AbsoluteFill>
    );
  });

  return <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity: inP * (1 - out) }}>{layers}</AbsoluteFill>;
};
