# CNC.Quote promo — design spec (autonomous mode)

## 1. Product brief

- **Product:** CNC.Quote (`cnc-kalkulator-ponude-production.up.railway.app`), a web tool for CNC machine
  shops to price machining jobs and build customer quotes.
- **Audience:** owners, estimators and sales staff at small and mid-size Croatian CNC / machining shops.
- **Core promise:** "Kalkulacija CNC obrade i ponude s današnjim cijenama materijala." A part's price is
  calculated instantly from its dimensions, material and machining, using today's LME metal prices.
- **Features to show (in order):**
  1. Live material prices: LME index cards with sparklines, a price list for every alloy, and a ticker in the top bar.
  2. Calculator: material + dimensions → raw blank weight → machining time → **price per piece** (big number).
  3. Price breakdown (Struktura cijene): material / setup / machining / tools / packaging / profit.
  4. Quantity price breaks (Cijena prema količini), up to −77 %.
  5. Saved quotes list (Ponude) with search, status and quick open.
- Statistics, Clients and Settings are not shown: the account has only 3 quotes, so the statistics charts are nearly empty.

## 2. Requirement → execution decisions

| Requirement | Decision |
|---|---|
| Language: Croatian | All titles, captions and the sign-off are in Croatian, matching the app's own wording. |
| Mode: autonomous | The agent decides everything below; no stage gates. |
| Length / format | ≈33 s, 1920×1080, 30 fps. |
| Real UI | Every product shot uses real 2× screenshots of the live app (read-only session; non-GET requests blocked). |
| Data safety | The account holds real customer data. Before capture, in the local browser only: company/user → "Primjer Metal d.o.o. · ured@primjer-metal.hr"; clients → "Kovina Rijeka d.o.o.", "Tokarija Vuk d.o.o.", "Alatnica Sava d.o.o."; quote list → fictional rows; author → "M. Horvat". Metal prices are public LME / price-list data and stay as-is. Nothing is saved to the app. |
| Audio | Agent's choice: a driving tech-house bed from `assets/audio/bgm/` mixed low, plus cinematic SFX pinned to beats. Delivered with and without BGM. |

## 3. Visual direction and tokens

Direction: **"Workshop precision"**. The film borrows the app's own look: deep navy topbar `#0f1922`, light
grey workspace, white cards, cobalt `#2F4BD8` for actions and highlights, cyan `#46C6E0` (the dot in the logo)
as a rare second accent, Archivo font (the app's own). It feels like an engineering tool: crisp, calm, exact.
No warm paper or serif type from the template.

| Token | Value |
|---|---|
| Ink / navy | `#0F1922` (stage, title cards), `#122130` (text) |
| Workspace | `#EEF1F5` page, `#FFFFFF` cards, `#66737F` muted |
| Accent | `#2F4BD8` cobalt (one accent word per title card, seams, focus rings, ripples) |
| Accent 2 | `#46C6E0` cyan (logo dot, crosshair glint only) |
| Type | Archivo 600–800 for titles (tight tracking), Archivo 500 caps + 0.12em for captions |
| Motion preset | "Professional / B2B": ~21 f main moves, `bezier(0,0,0.2,1)` entrances, no bounce except on landings (y1 > 1) |
| Light | Dark navy stage with a soft cobalt key light for the brand moments only; product shots stay flat and clean |

Styleframe skipped on purpose: the app's design system is strict and fully captured in the screenshots
(fonts, colors, radii), so the frames inherit it directly.

## 4. Feature → shot mapping

| Feature | Shot card (style) | Why |
|---|---|---|
| Brand | `brand-ink-open` re-skinned: cobalt crosshair (CNC tool centre) → "CNC.Quote" letterpress → caps kicker, 1 s hold, on navy | Quiet brand-first opening, low energy |
| Live metal prices | `crane-rise-reveal` on the real *Materijali i cijene* page: start tight on the EN AW-6082 T6 row (6,19 €/kg), crane back to the full page with index cards | "This one price is one row of a live price list" |
| Calculator | `cursor-flyover` on the real *Kalkulacija* page: 4 stops (dimensions → machining → price card → price structure), pull back to the whole page | One continuous tour of the calculation chain |
| Quantity breaks | `row-embed` on the quantity table rows | Rows land into the table, ending on −77 % |
| Saved quotes | `type-and-filter` on the real *Ponude* page: type "prirub", rows filter down to one, click | Shows search + the quote list |
| Sign-off | `outro-group-photo-launch`: price card, ticker, index card, structure card, quantity table and quote row gather around the wordmark | Peak energy, everything shown, wordmark hold ≥1 s |
| Breathers | `paper-title-card` re-skinned (navy field, Archivo, cobalt accent word) ×2 | Chapter signposts |

## 5. Storyboard (30 fps, final timeline)

Music: `bgm-tech-house.mp3`, measured at 125 BPM (T = 0.480 s = 14.4 f). The track starts 145 f in, so its
drop (15.49 s) lands on the calculator cut at f320. After the drop every cut and key hit is on `beatF(n) = 319.7 + 14.4·n`.
Before the drop (brand, card 1, crane) the track is its sparse intro, so those shots are paced by the picture.

| # | Frames | Shot | Key motion | Caption / copy | SFX |
|---|---|---|---|---|---|
| 1 | 0–100 | Brand open | crosshair draws, logo + "CNC.Quote" letterpress, kicker types, 44 f hold, lift out | kicker "KALKULACIJA CNC OBRADE I PONUDE" | transition-soft f12, whoosh-fast f92 |
| 2 | 100–155 | Title card 1 | word-by-word press, underline | "Cijene metala s **burze,** / svaki dan." | swoosh-quick |
| 3 | 155–320 | Materials crane | 24 f hold at 3× on EN AW-6082 T6 → 102 f crane to 1.25× → wash-in rows → price pulse f289 | "LME + premija · osvježeno svaki radni dan" | transition-soft, whoosh-big on lift, sparkle-touch on pulse |
| 4 | 320–550 (beats 0–16) | Calculator flyover | 4 stops, clicks on beats 3/6/9/12 (f363/406/449/493), pull back f512 | 4 captions, one per stop | 4× click-camera on the beats, swoosh on pull-back |
| 5 | 550–608 (beats 16–20) | Title card 2 | press | "Svaka količina, / **svoja** cijena." | swoosh-quick |
| 6 | 608–708 (beats 20–27) | Quantity rows embed | 10 rows land (accelerating cues), seams, ring on −77 % | "1 → 1000 kom · do −77 % po komadu" | transition-soft |
| 7 | 708–824 (beats 27–35) | Quotes search | typing on beat 28, filter on beat 30, click "Otvori" on beat 32 | "Sve ponude na jednom mjestu" | keyboard (18 f), whoosh-fast, click-camera |
| 8 | 824–974 (beat 35 →) | Outro group photo | 7 elements fly in, logo + wordmark stamp on beat 38 (f866), rule + tagline, ≥30 f hold, fade | tagline "Od nacrta do ponude, s današnjim cijenama." | riser → impact-deep-whoosh (peak on beat 38) → sparkle-touch |

Total 974 f ≈ 32.5 s. Hold budgets: brand 44 f, crane settle 39 f, flyover end 14 f, qty rows 20 f, outro sign-off ≥60 f.

## 6. Deliverables

- `out/cnc-quote-promo.mp4`: music + SFX.
- `out/cnc-quote-promo-nobgm.mp4`: same timeline, SFX only (`--props='{"bgm":false}'`).
- The motion workbench (`workbench/`) runs as a local web app on port 5198, so it is not wired up for this cloud
  build. It can be added later by writing `src/workbench.ts` (see `references/workbench.md`).
