// Beat grid for bgm-tech-house.mp3 (124 BPM, fitted with librosa; residual p90 16ms).
// Reel beat 0 = track beat 19; the track's drop (kick entry) lands on reel beat 10.
export const FPS = 30;
export const BEAT = (FPS * 60) / 124; // 14.516 frames
export const bF = (n: number) => Math.round(n * BEAT);
export const MUSIC_TRIM = Math.round(10.425 * FPS); // seconds into the track where the reel starts

export const SHOTS = {
  opening: { from: 0, to: bF(10) + 8 }, // logo + DISCOVER tap + tunnel, overlaps the flash
  hero: { from: bF(10), to: bF(22) },
  services: { from: bF(22), to: bF(36) },
  projects: { from: bF(36), to: bF(54) },
  slogan: { from: bF(54), to: bF(58) },
  outro: { from: bF(58), to: 945 },
};
export const TOTAL = 945;
