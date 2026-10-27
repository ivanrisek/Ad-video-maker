# CNC.Quote promo video

A ~39 s Croatian product promo for CNC.Quote, made with the video-shotcraft skill (autonomous mode).
Plan, storyboard and decisions: [DESIGN.md](DESIGN.md).

## Files

- `out/cnc-quote-promo.mp4`: final video with music and sound effects.
- `out/cnc-quote-promo-nobgm.mp4`: the same video with sound effects only, for adding your own music.
- `src/`: the Remotion project (timeline in `src/Main.tsx`, one file per shot in `src/scenes/`).
- `public/textures/`: real screenshots of the app. Customer names were replaced with made-up ones before capture.

## Re-render

```bash
npm install
npx remotion render src/index.ts CncPromo out/cnc-quote-promo.mp4
npx remotion render src/index.ts CncPromo out/cnc-quote-promo-nobgm.mp4 --props='{"bgm":false}'
```

## Re-capture screenshots

The capture scripts log in, block every request that could change data, and swap real names for
fictional ones in the local browser only. Credentials and the real→fictional name list are passed in at
runtime and are never stored in the repo:

```bash
CNC_USER=... CNC_PASS=... CNC_SWAP_FILE=/private/swap.json node scripts/capture.cjs
CNC_USER=... CNC_PASS=... CNC_SWAP_FILE=/private/swap.json node scripts/capture-hires.cjs
CNC_USER=... CNC_PASS=... CNC_SWAP_FILE=/private/swap.json node scripts/capture-calc4x.cjs
CNC_USER=... CNC_PASS=... CNC_SWAP_FILE=/private/swap.json node scripts/capture-pdf.cjs
```

`swap.json` is a JSON array of `["real text", "fictional text"]` pairs.
