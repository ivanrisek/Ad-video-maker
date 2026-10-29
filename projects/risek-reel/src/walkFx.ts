// Edit events derived from the capture log (src/walk.json → segments), in walkthrough-local frames.
import walk from './walk.json';

export type Seg = {
  start: number;
  dur: number;
  kind: 'fast' | 'glide' | 'modal' | 'open' | 'close' | 'hold';
  strength: number; // motion blur / RGB split amount for fast scrolls (0–1)
  tear?: boolean; // band tear at peak speed
  slam?: boolean; // crash stop on landing
  target?: string;
};

type LogSeg = { frame: number; hold?: number; scroll?: string | number; modalScroll?: string | number; tap?: string; dur?: number; pre?: number; post?: number; ease?: string };

export const WALK_FX: Seg[] = (walk.segments as LogSeg[]).map((s) => {
  if (s.hold) return { start: s.frame, dur: s.hold, kind: 'hold', strength: 0 };
  if (s.modalScroll !== undefined) return { start: s.frame, dur: s.dur!, kind: 'modal', strength: 0 };
  if (s.tap) {
    const pre = s.pre ?? 9;
    return { start: s.frame + pre, dur: s.post ?? 14, kind: s.tap === '.project-more' ? 'open' : 'close', strength: 0 };
  }
  const target = String(s.scroll);
  if (s.ease === 'glide') return { start: s.frame, dur: s.dur!, kind: 'glide', strength: 0, slam: true, target };
  if (target.startsWith('#services')) return { start: s.frame, dur: s.dur!, kind: 'fast', strength: 1, tear: true, slam: true, target };
  if (target.includes('.project-card')) return { start: s.frame, dur: s.dur!, kind: 'fast', strength: 0.45, target };
  return { start: s.frame, dur: s.dur!, kind: 'fast', strength: 0.6, target };
});
