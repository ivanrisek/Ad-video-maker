# RISEK Technology: Instagram Reel

A 67.5 s, 1080×1920 (9:16) promo for risek-technology.com, made with video-shotcraft.

**Deliverables (`out/`)**
- `RISEK-instagram-reel.mp4`: with music (bgm-tech-house, 124 BPM), -14 LUFS
- `RISEK-instagram-reel-bez-glazbe.mp4`: sound effects only, for adding a track in Instagram
- `RISEK-naslovnica.jpg`: cover frame

## Structure
1. **0–4.8 s, intro (Remotion):** the site's intro (logo, tagline, `>_ DISCOVER`), a tap, then the site's own corridor-to-light-tunnel film (`rikica_hero.mp4`). A white flash lands on the music drop.
2. **4.8–63.5 s, real site walkthrough:** risek-technology.com in the mobile layout, captured frame by frame by `scripts/capture-site.cjs` from the plan in `scripts/walk-plan.json`. JS timers run on a virtual clock (Playwright `clock`), and CSS/Web animations and `<video>` are paused and stepped 1/30 s per frame, so the scroll is perfectly smooth and the site's animations play at real speed. It scrolls hero → about → SmileDent story → services → projects, then taps each project (CNC.Quote, Dominus CNC, ATTENTION), scrolls through the project modal, closes it, and continues to clients and contact.
3. **63.9–67.4 s, outro:** logo, risek-technology.com, `>_ POŠALJITE UPIT`.

## Re-capturing the site
```bash
node scripts/capture-site.cjs /tmp/frames 1e9 scripts/walk-plan.json   # needs playwright
ffmpeg -framerate 30 -i /tmp/frames/%05d.jpg -c:v libx264 -crf 16 -pix_fmt yuv420p public/video/walk.mp4
# then put the frame count and tap frames (from log.json) into src/walk.json
```

## Render
```bash
npm ci
npx remotion render src/index.ts RisekReel out/reel.mp4
npx remotion render src/index.ts RisekReel out/reel-no-music.mp4 --props='{"bgm":false}'
```
