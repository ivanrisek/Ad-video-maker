# CNC.Quote walkthrough promo — design spec (autonomous mode)

Second film, made at the user's request: "walk through the UI (login page, then every page, then a randomly
generated calculation, and finally generating the quote) and make a CNC.Quote promo from it". Croatian.

## 1. Brief and decisions

| Requirement | Decision |
|---|---|
| Real UI, every page | The app runs locally from `ivanrisek/cnc-kalkulator-ponude` (same code as production) on an embedded database. Every product frame is a real 2× screenshot of it. |
| No customer data | The local database holds only invented data from `scripts/seed-demo.mjs`: company "Primjer Metal d.o.o." (user Marko Horvat), 7 invented customers, 26 random quotes spread over 12 months, public LME/ECB prices of 26.–27. 10. 2026 with a smoothed 5-month history. Production is never touched. |
| Random calculation | `scripts/capture-walkthrough.cjs` draws the calculation from a seeded random generator (seed 4521): Alatnica Sava d.o.o. · Vratilo Ø45 · VR-530-01 · 20 kom · C45 · Ø50×210 · CNC tokarilica 13 min. Each step is captured as a full 2× page state; the price per piece moves 37,40 → 29,05 → 28,00 → 29,25 → 38,55 → 37,65 €. |
| Quote generation | The quote is really saved (P-2026-0024 in the local DB) and printed with the app's own print view. |
| Look | Same tokens as film 1 (navy `#0F1922`, cobalt `#2F4BD8`, cyan dot, Archivo; motion preset "professional/B2B"). |
| Audio | Same 124 BPM bed; drop on the page-tour cut; with and without music. |

## 2. Feature → shot mapping

| Segment | Shot card | Notes |
|---|---|---|
| Brand | `brand-ink-open` (reused from film 1) | |
| Login page ("naslovnica") | `type-and-filter` grammar | push from the full login page to the form, e-mail autofills, password types, click "Prijavi se", push-in through the button |
| Every page | `bottom-push-stack-wipe` | 5 chapters (Ponude → Statistika → Klijenti → Materijali i cijene → Postavke): first enters on a cut, 4 pushes (card limit 2–4). Each chapter: brand-colour field, eyebrow + 2-line headline + one line, the real page as a window card, one in-chapter event on the hold |
| Random calculation | `cursor-flyover` grammar + live price HUD | camera follows the fields, cursor clicks on beats, the page texture switches to the next captured state at each commit, typed text is revealed char by char, a cutout of the live price readout docks top-right and updates with each state |
| Save + print | click "Spremi ponudu" → title becomes "Ponuda P-2026-0024" + toast → click "Ispiši / PDF" | |
| Customer quote | `document-typewriter-reveal` (reused from film 1, fed the new document) | |
| Sign-off | `outro-group-photo-launch` (reused, new elements) | |

## 3. Storyboard (30 fps)

| # | Frames | Shot | Copy |
|---|---|---|---|
| 1 | 0–100 | Brand open | kicker "KALKULACIJA CNC OBRADE I PONUDE" |
| 2 | 100–225 | Login page | — |
| 3 | 225–300 | Title card | "Ponude, klijenti, / cijene i **statistika**." |
| 4 | 300–518 (beats 0–15) | Page tour, 5 chapters, pushes on beats 3/6/9/12 | headlines per page (see `src/wt/PageTour.tsx`) |
| 5 | 518–591 (beats 15–20) | Title card | "Upišite dio. / Cijena se računa **odmah**." |
| 6 | 591–910 (beats 20–42) | Random calculation, save, print click | step captions |
| 7 | 910–1026 (beats 42–50) | Printed quote writes itself | "Gotova ponuda za kupca · ispis i PDF" |
| 8 | 1026–1176 (beat 50 →) | Outro group photo, stamp on beat 53 | tagline "Kalkulacije i ponude s današnjim cijenama materijala." |

Total ≈ 1176 f ≈ 39 s.
