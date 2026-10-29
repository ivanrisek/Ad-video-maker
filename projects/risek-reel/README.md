# RISEK Technology: Instagram Reel

A 31.5 s, 1080×1920 (9:16) promo for risek-technology.com, made with video-shotcraft (autonomous mode).

**Deliverables (`out/`)**
- `RISEK-instagram-reel.mp4`: with music (bgm-tech-house, 124 BPM), -14 LUFS
- `RISEK-instagram-reel-bez-glazbe.mp4`: sound effects only, for adding a track in Instagram
- `RISEK-naslovnica.jpg`: cover frame

## Sources
- Website (risek-technology.com): intro film `rikica_hero.mp4` (server corridor into a light tunnel, the same as clicking DISCOVER), hero `risek-laptop.mp4`, `risek-about-bg.mp4`, project films (CNC.Quote, Dominus CNC, ATTENTION), logos, and design tokens (`#070a14`, `#c2c4c8`, ice blue 120/175/255, Helvetica Neue).
- The user's screen recording `promo2_1.mp4`: services section and the "Projekti koje smo realizirali" section.

## Storyboard (beat = 14.516 f @ 30 fps; the drop lands on beat 10)
| # | Frames | Shot | Key motion (card) |
|---|---|---|---|
| 1 | 0–145 | Site intro: logo, tagline, `>_ DISCOVER`, tap, tunnel | blur-slide, light-play sheen; the site's own tunnel film, white flash on the drop |
| 2 | 145–319 | Hero "IT podrška, razvoj i infrastruktura na jednom mjestu." | blur-slide per word; gradient-word-sweep in ice blue |
| 3 | 319–523 | "Inženjerstvo na svakom sloju sustava": recording + 6 services | picker-carousel-feature-cycle, one snap every 2 beats |
| 4 | 523–784 | Projects: recording, then CNC.Quote / Dominus CNC / ATTENTION | bottom-push-stack-wipe, one push per bar |
| 5 | 784–842 | "Don't take a risk. Take RISEK." | element slams on beats |
| 6 | 842–945 | Logo lockup, risek-technology.com, `>_ POŠALJITE UPIT` | sheen, hold ≥ 2 s |

## Render
```bash
npm ci
npx remotion render src/index.ts RisekReel out/reel.mp4
npx remotion render src/index.ts RisekReel out/reel-no-music.mp4 --props='{"bgm":false}'
```
