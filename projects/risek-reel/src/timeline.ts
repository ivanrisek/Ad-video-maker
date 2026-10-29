// Beat grid for bgm-tech-house.mp3 (124 BPM, fitted with librosa; residual p90 16ms).
// Reel beat 0 = track beat 19; the track's drop (kick entry) lands on reel beat 10 = tunnel exit.
import walk from './walk.json';

export const FPS = 30;
export const BEAT = (FPS * 60) / 124; // 14.516 frames
export const bF = (n: number) => Math.round(n * BEAT);
export const MUSIC_TRIM = Math.round(10.425 * FPS); // seconds into the track where the reel starts

// walk.json: frame count of the captured site walkthrough + the capture log segments (see walkFx.ts).
export const WALK = { from: bF(10), frames: walk.frames as number };
const walkEnd = WALK.from + WALK.frames;
const outroFrom = bF(Math.ceil(walkEnd / BEAT)); // first beat after the walkthrough ends

export const SHOTS = {
  opening: { from: 0, to: bF(10) + 8 }, // logo + DISCOVER tap + tunnel, overlaps the flash
  walk: { from: WALK.from, to: outroFrom + 6 },
  outro: { from: outroFrom, to: outroFrom + 105 },
};
export const TOTAL = SHOTS.outro.to;
