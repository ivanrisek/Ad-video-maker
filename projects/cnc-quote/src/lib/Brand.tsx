import React from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// CNC.Quote design tokens, taken from the app's own CSS (css/app.css :root).
export const C = {
  paper: '#edf1f4', // workspace
  sheet: '#ffffff', // cards
  ink: '#122130',
  ink2: '#3b4a58',
  steel: '#66737f',
  rule: '#dce3e9',
  dykem: '#2f4bd8', // accent (machinist's layout blue)
  dykemWash: '#e9edfd',
  bar: '#0f1922', // topbar / readout navy
  bar2: '#142130',
  barInk: '#e6edf2',
  dim: '#8fa1b0',
  cyan: '#46c6e0',
  live: '#1d7a4c',
};
export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const FONT = '"Archivo", system-ui, -apple-system, "Segoe UI", sans-serif';
// Archivo variable width axis: headings in the app use wdth 72, the wordmark wdth 80.
export const wdth = (w: number): React.CSSProperties => ({ fontVariationSettings: `"wdth" ${w}` });

// Load the app's own Archivo (variable weight + width) before any frame renders.
let fontsLoaded = false;
export const useFonts = () => {
  const [handle] = React.useState(() => (fontsLoaded ? null : delayRender('archivo')));
  React.useEffect(() => {
    if (!handle) return;
    const faces = [
      new FontFace('Archivo', `url(${staticFile('fonts/archivo-latin-wdth-normal.woff2')}) format("woff2-variations")`, {
        weight: '100 900', stretch: '62% 125%', unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212',
      }),
      new FontFace('Archivo', `url(${staticFile('fonts/archivo-latin-ext-wdth-normal.woff2')}) format("woff2-variations")`, {
        weight: '100 900', stretch: '62% 125%', unicodeRange: 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F',
      }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((fs) => { fs.forEach((f) => document.fonts.add(f)); fontsLoaded = true; continueRender(handle); })
      .catch((e) => { console.error(e); continueRender(handle); });
  }, [handle]);
};

// The app's logo: cobalt rounded square, white magnifier "Q", cyan dot.
export const Logo: React.FC<{ size: number; style?: React.CSSProperties; draw?: number }> = ({ size, style, draw = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={style}>
    <rect width={32} height={32} rx={8} fill={C.dykem} />
    <path d="M21.1 21.1A8.6 8.6 0 1 1 23.6 15" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round"
      pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <path d="M18.2 18.2l5 5" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={draw > 0.85 ? 1 : 0} />
    <circle cx={25.4} cy={25.4} r={2.5} fill={C.cyan} opacity={draw > 0.95 ? 1 : 0} />
  </svg>
);

// Wordmark letters: "CNC" + cyan "." + "Quote" (index 3 is the cyan dot)
export const WORDMARK = ['C', 'N', 'C', '.', 'Q', 'u', 'o', 't', 'e'];
