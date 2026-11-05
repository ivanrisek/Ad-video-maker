// RisekLed — 30 s silent loop for the LED panel in Krapina (1920×1080).
// Logo + phone + web sit in a fixed bottom bar for the whole spot; content rotates above it.
// 0–2 s logo slam · 2–8 s four questions · 8–10 s "Mi smo spremni." + logo · 10–20 s six services
// (one by one, then all six as a grid) · 20–24 s "Vjeruju nam:" client logos · 24–30 s contact card.
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp, mix } from './lib/Polish';
import { C, MONO } from './brand';

export const LED_W = 1920;
export const LED_H = 1080;
export const LED_TOTAL = 900;
const BAR_H = 200;
const TICK_H = 62; // site-style services ticker between content and bar
const AREA_H = LED_H - BAR_H - TICK_H; // content area above the ticker
const PHONE = '095 544 2255';
const WEB = 'risek-technology.com';
const BLACK = '"Inter Display", "Helvetica Neue", Inter, Arial, sans-serif';

// Text colours from risek-technology.com: headings --text-primary, copy --text-secondary, labels .section-label
const TXT = '#c2c4c8';
const TXT2 = '#8c9099';
const LABEL = '#8a8a8a';
// .hero-blue from the site: translucent blue with a white band sweeping across (hero-blue-shimmer, 7 s),
// plus its soft blue text glow. Period 225 f (7.5 s) so four sweeps fit the 30 s loop exactly.
// inline-block + top padding so the gradient also covers diacritics (Č, Ć, Š, Ž) above the line box.
const Blue: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  // site uses no-repeat (the word briefly vanishes between sweeps); on the panel the pattern repeats so
  // the text never disappears: one period (3× width) per sweep keeps the motion seamless.
  const pos = 150 - 150 * ((f % 225) / 225);
  return (
    <span
      style={{
        backgroundImage: 'linear-gradient(100deg, rgba(120,175,255,0.5) 35%, #ffffff 50%, rgba(120,175,255,0.5) 65%)',
        backgroundSize: '300% 100%',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: `${pos.toFixed(2)}% 0`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 0.4em rgba(150,200,255,0.3)',
        display: 'inline-block',
        paddingTop: '0.16em',
        marginTop: '-0.16em',
      }}
    >
      {children}
    </span>
  );
};

// ───────── helpers ─────────
const Slam: React.FC<{ from: number; to: number; children: React.ReactNode; style?: React.CSSProperties; out?: 'up' | 'zoom' | 'none' }> = ({ from, to, children, style, out = 'up' }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const p = ramp(f, from, 8, EASE.snappy);
  const q = out === 'none' ? 0 : ramp(f, to - 7, 7, EASE.exit);
  const y = out === 'up' ? -90 * q : 0;
  const s = mix(1.18, 1, p) * (out === 'zoom' ? 1 + 0.25 * q : 1);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        opacity: p * (1 - q),
        transform: `translateY(${y.toFixed(1)}px) scale(${s.toFixed(4)})`,
        filter: p < 0.999 || q > 0.001 ? `blur(${((1 - p) * 14 + q * 12).toFixed(2)}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Flash: React.FC<{ at: number; strength?: number }> = ({ at, strength = 0.8 }) => {
  const f = useCurrentFrame();
  const k = f - at;
  if (k < 0 || k > 14) return null;
  return <AbsoluteFill style={{ background: '#eef5ff', opacity: strength * Math.exp(-k / 3) }} />;
};

// mask: image path — the sweep is clipped to that image's alpha (logos), otherwise it is clipped to text via overlay
const Sheen: React.FC<{ at: number; dur?: number; mask?: string; children: React.ReactNode }> = ({ at, dur = 18, mask, children }) => {
  const f = useCurrentFrame();
  const t = ramp(f, at, dur, EASE.smooth);
  const active = f >= at && f <= at + dur;
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      {active && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, transparent ${-30 + t * 160 - 12}%, rgba(255,255,255,0.85) ${-30 + t * 160}%, transparent ${-30 + t * 160 + 12}%)`,
            mixBlendMode: mask ? 'screen' : 'overlay',
            pointerEvents: 'none',
            ...(mask
              ? { WebkitMaskImage: `url(${staticFile(mask)})`, maskImage: `url(${staticFile(mask)})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }
              : {}),
          }}
        />
      )}
    </span>
  );
};

const Bg: React.FC<{ src: string; from: number; to: number; trim?: number; opacity: number; rate?: number }> = ({ src, from, to, trim = 0, opacity, rate = 1 }) => {
  const f = useCurrentFrame();
  const fade = ramp(f, from, 10, EASE.out) * (1 - ramp(f, to - 10, 10, EASE.exit));
  return (
    <Sequence from={from} durationInFrames={to - from} layout="none">
      <AbsoluteFill style={{ opacity: opacity * fade }}>
        <OffthreadVideo src={staticFile(src)} muted trimBefore={trim} playbackRate={rate} style={{ width: LED_W, height: LED_H, objectFit: 'cover' }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// cable helix from the site (spine_cables.mp4), at both edges, fading toward the centre
const Cables: React.FC = () => {
  const f = useCurrentFrame();
  const o = ramp(f, 0, 12, EASE.out) * (1 - ramp(f, 176, 12, EASE.exit));
  const col = (left: number, flip: boolean) => (
    <div style={{ position: 'absolute', left, top: 0, width: 496, height: AREA_H, opacity: 0.75 * o, transform: flip ? 'scaleX(-1)' : undefined, WebkitMaskImage: 'linear-gradient(90deg, #000 40%, transparent 100%)', maskImage: 'linear-gradient(90deg, #000 40%, transparent 100%)' }}>
      <OffthreadVideo src={staticFile('video/led/cables.mp4')} muted style={{ width: 496, height: 880, display: 'block', marginTop: (AREA_H - 880) / 2 }} />
    </div>
  );
  return (
    <>
      {col(-40, false)}
      {col(LED_W - 456, true)}
    </>
  );
};

// the RISEK technician at the rack (risek-worker.mp4), framed like the site's media cards
const Worker: React.FC = () => {
  const f = useCurrentFrame();
  const p = ramp(f, 4, 16, EASE.snappy);
  const q = ramp(f, 236, 12, EASE.exit);
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        top: 40,
        width: 500,
        height: AREA_H - 80,
        borderRadius: 28,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 0 90px -20px rgba(120,175,255,0.55), 0 30px 80px -30px rgba(0,0,0,0.9)',
        opacity: p * (1 - q),
        transform: `translateX(${((1 - p) * -80 - q * 60).toFixed(1)}px)`,
      }}
    >
      <OffthreadVideo src={staticFile('video/led/worker.mp4')} muted playbackRate={0.8} style={{ width: 500, height: 880, objectFit: 'cover', display: 'block', marginTop: -40 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,10,20,0) 60%, rgba(7,10,20,0.6) 100%)' }} />
    </div>
  );
};

// ───────── icons (24 grid, stroked) ─────────
const ICONS: Record<string, string[]> = {
  web: ['M8 6 2 12l6 6', 'M16 6l6 6-6 6', 'M14 3 10 21'],
  support: ['M4 13v-1a8 8 0 0 1 16 0v1', 'M4 13h3v6H4z', 'M17 13h3v6h-3z', 'M20 19c0 1.5-1.5 2.5-4 2.5h-2'],
  home: ['M3 11 12 3l9 8', 'M5 10v10h14V10', 'M10 20v-6h4v6'],
  server: ['M3 4h18v6H3z', 'M3 14h18v6H3z', 'M7 7h.01', 'M7 17h.01', 'M11 7h6', 'M11 17h6'],
  auto: ['M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z', 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M4.9 4.9l2.1 2.1', 'M17 17l2.1 2.1', 'M4.9 19.1 7 17', 'M17 7l2.1-2.1'],
  ai: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'],
  consult: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z'],
};
const Icon: React.FC<{ name: string; size: number; glow?: number }> = ({ name, size, glow = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', filter: `drop-shadow(0 0 ${(18 * glow).toFixed(1)}px rgba(120,175,255,${(0.75 * glow).toFixed(2)}))` }}>
    {ICONS[name].map((d, i) => (
      <path key={i} d={d} stroke="#a9ccff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </svg>
);

// Six services with short names for the street; sub-items taken from risek-technology.com (#services)
const SERVICES = [
  { icon: 'web', name: ['APLIKACIJE', 'I WEB STRANICE'], items: ['Izrada web aplikacija', 'Izrada web stranica', 'Frontend razvoj'] },
  { icon: 'support', name: ['IT PODRŠKA', 'ZA TVRTKE'], items: ['Otklanjanje tehničkih problema', 'Održavanje IT infrastrukture', 'Podrška korisnicima'] },
  { icon: 'home', name: ['IT POMOĆ', 'ZA KUĆANSTVA'], items: ['Dijagnostika problema s računalom', 'Rješavanje sporog sustava', 'Problemi s internetom i mrežom'] },
  { icon: 'server', name: ['SERVERI', 'I MREŽE'], items: ['Postavljanje i održavanje servera', 'Mrežna konfiguracija', 'Nadzor sustava'] },
  { icon: 'auto', name: ['AUTOMATIZACIJA', 'POSLOVANJA'], items: ['Automatizacija ponavljajućih zadataka', 'Automatizacija radnih procesa', 'Integracije između alata'] },
  { icon: 'ai', name: ['AI', 'RJEŠENJA'], items: ['Analiza gdje AI stvarno pomaže', 'Uvođenje AI asistenta u procese', 'Automatizacija odgovora'] },
];

// ───────── services ticker (as in the site hero) ─────────
const TICKER = ['Izrada web stranica i aplikacija', 'IT infrastruktura i održavanje', 'IT pomoć za privatne korisnike', 'IT savjetovanje', 'AI rješenja i AI savjetovanje', 'IT podrška za tvrtke', 'Automatizacija poslovnih procesa'];
const Ticker: React.FC = () => {
  const f = useCurrentFrame();
  const unit = TICKER.map((t) => `${t}   //   `).join('');
  // one full unit per 30 s loop → the ticker is seamless when the panel restarts the clip
  const CHAR_W = 30 * 0.6 + 30 * 0.04; // JetBrains Mono advance + letter-spacing
  const unitW = unit.length * CHAR_W;
  const x = -((f / LED_TOTAL) * unitW);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: BAR_H, height: TICK_H, background: 'rgba(7,10,20,0.92)', borderTop: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: x, whiteSpace: 'pre', fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: '0.04em', color: TXT2 }}>
        {unit + unit + unit}
      </div>
    </div>
  );
};

// ───────── fixed bottom bar ─────────
const PhoneIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"
      stroke="#a9ccff"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </svg>
);
const Bar: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f % 150) / 150; // a light runs along the top edge every 5 s
  const ringPulse = 0.5 + 0.5 * Math.sin(f / 10);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR_H, background: 'linear-gradient(180deg, #0e1530 0%, #070a14 100%)' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 3, background: 'rgba(120,175,255,0.55)', boxShadow: '0 0 24px rgba(120,175,255,0.6)' }} />
      <div style={{ position: 'absolute', top: -2, height: 7, width: 420, left: `${(-420 + t * (LED_W + 840)).toFixed(1)}px`, background: 'linear-gradient(90deg, rgba(255,255,255,0), #ffffff, rgba(255,255,255,0))', filter: 'blur(2px)' }} />
      <div style={{ position: 'absolute', left: 70, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
        <Img src={staticFile('img/led/risek.png')} style={{ height: 112 }} />
      </div>
      <div style={{ position: 'absolute', left: 690, top: 40, bottom: 40, width: 2, background: 'rgba(255,255,255,0.14)' }} />
      <div style={{ position: 'absolute', right: 80, top: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 99,
              border: '2px solid rgba(120,175,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 ${(14 + 18 * ringPulse).toFixed(1)}px rgba(120,175,255,${(0.35 + 0.35 * ringPulse).toFixed(2)})`,
            }}
          >
            <PhoneIcon size={50} />
          </div>
          <div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 104, letterSpacing: '-0.01em', color: TXT, lineHeight: 1 }}>{PHONE}</div>
        </div>
        <div style={{ fontFamily: BLACK, fontWeight: 700, fontSize: 48, color: TXT2, letterSpacing: '0.005em' }}>{WEB}</div>
      </div>
    </div>
  );
};

// ───────── sections ─────────
const Q: React.FC<{ from: number; to: number; lines: React.ReactNode[] }> = ({ from, to, lines }) => (
  <Slam from={from} to={to}>
    <div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 150, lineHeight: 1.02, letterSpacing: '-0.035em', color: TXT }}>
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  </Slam>
);

const ServiceOne: React.FC<{ i: number; from: number; to: number }> = ({ i, from, to }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const s = SERVICES[i];
  const p = ramp(f, from, 9, EASE.snappy);
  const q = ramp(f, to - 6, 6, EASE.exit);
  const y = (1 - p) * 140 - q * 140;
  const iconP = ramp(f, from + 2, 10, EASE.overshoot);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: p * (1 - q), transform: `translateY(${y.toFixed(1)}px)`, filter: p < 0.999 || q > 0.001 ? `blur(${((1 - p) * 10 + q * 10).toFixed(2)}px)` : undefined }}>
      <div style={{ position: 'absolute', left: 660, right: 60, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
          <div style={{ transform: `scale(${mix(0.5, 1, iconP).toFixed(4)}) rotate(${mix(-15, 0, iconP).toFixed(2)}deg)` }}>
            <Icon name={s.icon} size={92} />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 40, letterSpacing: '0.2em', color: LABEL }}>
            0{i + 1} / 0{SERVICES.length}
          </div>
        </div>
        <div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 120, lineHeight: 0.98, letterSpacing: '-0.03em', color: TXT, whiteSpace: 'nowrap' }}>
          <Sheen at={from + 10}>
            <div>{s.name[0]}</div>
            <div><Blue>{s.name[1]}</Blue></div>
          </Sheen>
        </div>
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {s.items.map((it, k) => {
            const ip = ramp(f, from + 8 + k * 3, 10, EASE.out);
            return (
              <div key={k} style={{ fontFamily: BLACK, fontWeight: 600, fontSize: 40, color: TXT2, opacity: ip, transform: `translateX(${((1 - ip) * 40).toFixed(1)}px)`, display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#78afff', boxShadow: '0 0 10px #78afff' }} />
                {it}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ServiceGrid: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const q = ramp(f, to - 8, 8, EASE.exit);
  const TW = 540;
  const TH = 300;
  const GAP = 28;
  const topRow = 3;
  const rowLeft = (n: number) => (LED_W - (n * TW + (n - 1) * GAP)) / 2;
  const top0 = (AREA_H - (2 * TH + GAP)) / 2;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - q, filter: q > 0.001 ? `blur(${(q * 10).toFixed(2)}px)` : undefined }}>
      {SERVICES.map((s, i) => {
        const p = ramp(f, from + i * 3, 10, EASE.overshoot);
        const lit = Math.exp(-Math.max(0, f - (from + 18 + i * 4)) / 6) * (f >= from + 18 + i * 4 ? 1 : 0);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i < topRow ? rowLeft(topRow) + i * (TW + GAP) : rowLeft(SERVICES.length - topRow) + (i - topRow) * (TW + GAP),
              top: top0 + (i < topRow ? 0 : TH + GAP),
              width: TW,
              height: TH,
              borderRadius: 32,
              background: 'linear-gradient(160deg, rgba(30,44,90,0.85), rgba(10,14,30,0.92))',
              border: `2px solid rgba(120,175,255,${(0.35 + 0.6 * lit).toFixed(2)})`,
              boxShadow: `0 0 ${(30 + 70 * lit).toFixed(1)}px -8px rgba(120,175,255,${(0.35 + 0.5 * lit).toFixed(2)})`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              textAlign: 'center',
              opacity: Math.min(1, p),
              transform: `scale(${mix(0.7, 1, p).toFixed(4)})`,
            }}
          >
            <Icon name={s.icon} size={104} glow={0.6 + lit} />
            <div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 46, lineHeight: 1.04, letterSpacing: '-0.01em', color: TXT, whiteSpace: 'nowrap' }}>
              <div>{s.name[0]}</div>
              <div><Blue>{s.name[1]}</Blue></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Trust: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const q = ramp(f, to - 8, 8, EASE.exit);
  const title = ramp(f, from, 10, EASE.snappy);
  const LOGOS = [
    { src: 'img/led/dominus.png', h: 150 },
    { src: 'img/led/verona.png', h: 150 },
    { src: 'img/led/smiledent.png', h: 230 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - q }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 60,
          textAlign: 'center',
          fontFamily: BLACK,
          fontWeight: 900,
          fontSize: 116,
          letterSpacing: '-0.03em',
          color: TXT,
          opacity: title,
          transform: `scale(${mix(1.15, 1, title).toFixed(4)})`,
          filter: title < 0.999 ? `blur(${((1 - title) * 12).toFixed(2)}px)` : undefined,
        }}
      >
        Vjeruju <Blue>nam:</Blue>
      </div>
      <div style={{ position: 'absolute', left: 90, right: 90, top: 270, height: 400, display: 'flex', justifyContent: 'space-between' }}>
        {LOGOS.map((l, i) => {
          const p = ramp(f, from + 10 + i * 7, 12, EASE.overshoot);
          return (
            <div
              key={i}
              style={{
                width: 560,
                height: 400,
                borderRadius: 36,
                background: 'linear-gradient(160deg, rgba(26,34,62,0.9), rgba(9,12,24,0.95))',
                border: '2px solid rgba(255,255,255,0.14)',
                boxShadow: '0 30px 80px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: Math.min(1, p),
                transform: `translateY(${((1 - p) * 80).toFixed(1)}px) scale(${mix(0.8, 1, p).toFixed(4)})`,
              }}
            >
              <Sheen at={from + 40 + i * 6} dur={20} mask={l.src}>
                <Img src={staticFile(l.src)} style={{ height: l.h, maxWidth: 470, objectFit: 'contain', display: 'block' }} />
              </Sheen>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ContactCard: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const lp = ramp(f, from, 12, EASE.snappy);
  const e = (s: number) => ramp(f, from + s, 12, EASE.out);
  const endFade = ramp(f, LED_TOTAL - 12, 12, EASE.exit);
  const pulse = 0.5 + 0.5 * Math.sin((f - from) / 8);
  const rise = (p: number): React.CSSProperties => ({ opacity: p, transform: `translateY(${((1 - p) * 40).toFixed(1)}px)`, filter: p < 0.999 ? `blur(${((1 - p) * 8).toFixed(2)}px)` : undefined });
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - endFade }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 45% at 50% 45%, rgba(${C.iceRGB},${(0.14 * lp).toFixed(3)}), rgba(7,10,20,0) 72%)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center', opacity: lp, transform: `scale(${mix(1.25, 1, lp).toFixed(4)})`, filter: lp < 0.999 ? `blur(${((1 - lp) * 14).toFixed(2)}px)` : undefined }}>
        <Sheen at={from + 16} dur={22} mask="img/led/risek.png">
          <Img src={staticFile('img/led/risek.png')} style={{ height: 200, display: 'block' }} />
        </Sheen>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 285, textAlign: 'center', fontFamily: BLACK, fontWeight: 800, fontSize: 62, letterSpacing: '0.005em', color: TXT, ...rise(e(10)) }}>
        Besplatna konzultacija <span style={{ color: TXT2 }}>· bez obveze</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 370,
          textAlign: 'center',
          fontFamily: BLACK,
          fontWeight: 900,
          fontSize: 200,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          filter: `drop-shadow(0 0 ${(20 + 25 * pulse).toFixed(1)}px rgba(120,175,255,${(0.35 + 0.3 * pulse).toFixed(2)}))`,
          ...{ opacity: e(16), transform: `scale(${mix(1.12, 1, e(16)).toFixed(4)})` },
        }}
      >
        <Blue>{PHONE}</Blue>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', fontFamily: BLACK, fontWeight: 700, fontSize: 54, color: TXT, ...rise(e(24)) }}>
        info@risek-technology.com
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: MONO, fontSize: 32, letterSpacing: '0.22em', color: LABEL, ...rise(e(30)) }}>
        KRAPINA · HRVATSKA
      </div>
    </div>
  );
};

// ───────── composition ─────────
export const RisekLed: React.FC = () => {
  const f = useCurrentFrame();
  // intro logo
  const lp = ramp(f, 4, 12, EASE.snappy);
  const lq = ramp(f, 52, 8, EASE.exit);
  const logo2 = ramp(f, 270, 12, EASE.snappy);
  const logo2q = ramp(f, 292, 8, EASE.exit);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      {/* content area */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: LED_W, height: AREA_H, overflow: 'hidden' }}>
        <Bg src="video/led/corridor.mp4" from={0} to={62} trim={232} opacity={0.75} />
        <Bg src="video/led/corridor.mp4" from={56} to={244} trim={30} opacity={0.3} />
        <Sequence from={56} durationInFrames={188} layout="none">
          <Cables />
        </Sequence>
        <Bg src="video/led/team.mp4" from={236} to={304} trim={0} opacity={0.62} />
        <Bg src="video/led/risek-laptop.mp4" from={296} to={604} trim={0} opacity={0.14} rate={0.9} />
        <Sequence from={296} durationInFrames={248} layout="none">
          <Worker />
        </Sequence>
        <Bg src="video/led/risek-about-bg.mp4" from={596} to={724} trim={60} opacity={0.3} />
        <Bg src="video/led/team.mp4" from={716} to={900} trim={40} opacity={0.3} rate={0.55} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 45%, rgba(7,10,20,0.15), rgba(7,10,20,0.85) 100%)' }} />

        {/* 0–2 s: logo slam */}
        {f < 62 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: lp * (1 - lq),
              transform: `scale(${(mix(1.5, 1, lp) * (1 + 0.3 * lq)).toFixed(4)})`,
              filter: lp < 0.999 || lq > 0 ? `blur(${((1 - lp) * 18 + lq * 14).toFixed(2)}px)` : undefined,
            }}
          >
            <Sheen at={20} dur={22} mask="img/led/risek.png">
              <Img src={staticFile('img/led/risek.png')} style={{ height: 300, display: 'block' }} />
            </Sheen>
          </div>
        )}

        {/* 2–8 s: questions */}
        <Q from={60} to={105} lines={[<>Računalo</>, <Blue>ne radi?</Blue>]} />
        <Q from={105} to={150} lines={[<>Posao u firmi</>, <>još <Blue>na papiru?</Blue></>]} />
        <Q from={150} to={195} lines={[<>Nemate</>, <Blue>web stranicu?</Blue>]} />
        <Q from={195} to={240} lines={[<>Spremni za</>, <Blue>budućnost?</Blue>]} />

        {/* 8–10 s: answer + logo */}
        <Slam from={240} to={270} out="zoom" style={{ alignItems: 'flex-start', paddingTop: 40 }}>
          <div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 190, letterSpacing: '-0.04em', filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.8))' }}><Blue>Mi smo spremni.</Blue></div>
        </Slam>
        {f >= 270 && f < 300 && (
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(7,10,20,0.55), rgba(7,10,20,0.9) 100%)', opacity: logo2 * (1 - logo2q) }} />
        )}
        {f >= 270 && f < 300 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: logo2 * (1 - logo2q),
              transform: `scale(${mix(1.4, 1, logo2).toFixed(4)})`,
              filter: logo2 < 0.999 || logo2q > 0 ? `blur(${((1 - logo2) * 16 + logo2q * 12).toFixed(2)}px)` : undefined,
            }}
          >
            <Sheen at={276} dur={18} mask="img/led/risek.png">
              <Img src={staticFile('img/led/risek.png')} style={{ height: 520, display: 'block', filter: 'drop-shadow(0 0 40px rgba(120,175,255,0.45)) drop-shadow(0 10px 40px rgba(0,0,0,0.9))' }} />
            </Sheen>
          </div>
        )}

        {/* 10–20 s: services one by one, then all six */}
        {SERVICES.map((_, i) => (
          <ServiceOne key={i} i={i} from={300 + i * 40} to={300 + (i + 1) * 40} />
        ))}
        <ServiceGrid from={540} to={602} />

        {/* 20–24 s: trust */}
        <Trust from={600} to={720} />

        {/* 24–30 s: contact */}
        <ContactCard from={720} />
      </div>

      <Ticker />
      <Bar />

      {/* flashes on the three big moments (kept rare: no strobing on a street panel) */}
      <Flash at={0} strength={0.9} />
      <Flash at={240} strength={0.55} />
      <Flash at={270} strength={0.7} />
    </AbsoluteFill>
  );
};
