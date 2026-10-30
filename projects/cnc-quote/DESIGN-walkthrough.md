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

## 3. Storyboard (30 fps, final)

Music drop heard at f225 (page-tour cut); `beatF(n) = round(225.1 + 14.516·n)`. Authoritative table: `src/wt/Walkthrough.tsx`.

| # | Frames | Shot | Copy |
|---|---|---|---|
| 1 | 0–100 | Brand open | kicker "KALKULACIJA CNC OBRADE I PONUDE" |
| 2 | 100–225 | Login page (flash on both cuts) | — |
| 3 | 225–588 (beats 0–25) | Page tour: Ponude → Statistika → Klijenti → Materijali i cijene → Postavke, 5 beats each, pushes on beats 5/10/15/20 | headlines in `src/wt/PageTour.tsx` |
| 4 | 588–660 (beats 25–30) | Title card | "Upišite dio. / Cijena se računa **odmah.**" |
| 5 | 660–1052 (beats 30–57) | Random calculation: client, part, drawing, qty, round bar, material search (C45), Ø, L, machine, cycle; save (beat 23 of the shot); print (beat 25) | captions follow each step |
| 6 | 1052–1168 (beats 57–65) | Printed quote writes itself | "Gotova ponuda za kupca · ispis i PDF" |
| 7 | 1168–1318 (beat 65 →) | Outro group photo, stamp on beat 68 | tagline "Od upisa dijela do gotove ponude." |

Total 1318 f ≈ 43.9 s.

## 4. Review fixes (independent review of the first render)

- State switches in the calculation are hard cuts; typed values stay drawn until the next captured state is shown (no revert / double exposure).
- Drawing number and cycle time are typed; caret positions come from measured text extents.
- Page chapters hold ~1.5 s still; in-chapter highlights are single (one row / one card / one section) and finish before the next push.
- Copy matches the screen: C45 caption cites the supplier price list; Postavke chapter shows company details (the machines/rates sections are folded in the real page); three demo customers carry a discount so "rabat" is visible; "Svakom kupcu njegovi uvjeti."
- SFX lead-ins measured for every source and recorded in `Walkthrough.tsx`.
- Deviation from `bottom-push-stack-wipe` (documented): chapters 03 and 04 use the app's light steel and slate instead of a saturated colour, so the five chapters stay inside the CNC.Quote palette; adjacent chapters still alternate dark / light.

## 5. Remotion-skill pass (official `remotion-dev/skills`, remotion-markup)

- Remotion upgraded 4.0.484 → 4.0.539; added `@remotion/transitions`, `@remotion/effects`, `@remotion/rough-notation`, `@remotion/media`.
- Cuts brand→login, login→tour, calc→PDF and PDF→outro carry a cobalt light leak (`lightLeak()` on a `<Solid>`, hueShift 176) instead of white flashes / a hard cut (`src/fx/LightLeak.tsx`).
- The push through "Prijavi se" gets a radial `zoomBlur()` centred on the button.
- The final price per piece gets one hand-drawn `<Circle>` (rough-notation, cyan) as "Spremi ponudu" is clicked.
- Audio uses `<Audio>` from `@remotion/media` with `trimBefore` (replaces the deprecated `startFrom`); re-measured: clicks heard within 0.4 f of the picture, no clipping.
- Not adopted: `<HtmlInCanvasMotionBlur>` (needs the HTML-in-canvas Chrome flag, unavailable in this headless shell); the Studio preview (runs on localhost inside the cloud sandbox).

## 6. Calculated price on the printed quote (user request)

- In the PDF shot the camera, after the full-sheet view (f64), pushes in on the item row and totals (zoom 1.1 → 1.62 by f84).
- The price per piece from the calculation (37,65 €, state s7) gets a hand-drawn cobalt `<Circle>` on the sheet (f74–86) and a cobalt tag "37,65 € / kom · iz kalkulacije" under it. The value comes from `walkthrough.json`; the box was measured on `quote-pdf.png`.
