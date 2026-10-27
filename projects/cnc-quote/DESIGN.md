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
  6. The finished customer quote (Ispiši / PDF): the document the customer receives. Added at the user's request.
- Statistics, Clients and Settings are not shown: the account has only 3 quotes, so the statistics charts are nearly empty.

## 2. Requirement → execution decisions

| Requirement | Decision |
|---|---|
| Language: Croatian | All titles, captions and the sign-off are in Croatian, matching the app's own wording. |
| Mode: autonomous | The agent decides everything below; no stage gates. |
| Length / format | ≈33 s, 1920×1080, 30 fps. |
| Real UI | Every product shot uses real 2× screenshots of the live app (read-only session; non-GET requests blocked). |
| Data safety | The account holds real customer data. Before capture, in the local browser only (the printed quote uses an invented company block: "Primjer Metal d.o.o., Industrijska ulica 12, 10000 Zagreb, OIB 12345678901", and customer "Kovina Rijeka d.o.o., Riječka cesta 5, 51000 Rijeka, OIB 98765432109"; its save request is answered locally and never reaches the server): company/user → "Primjer Metal d.o.o. · ured@primjer-metal.hr"; clients → "Kovina Rijeka d.o.o.", "Tokarija Vuk d.o.o."; the quote list is replaced by 8 invented rows using the invented customers "Kovina Rijeka d.o.o.", "Tokarija Vuk d.o.o.", "Alatnica Sava d.o.o." and "Hidroteh Zagreb d.o.o."; author → "M. Horvat". The real→fictional pairs are kept outside the repo (`CNC_SWAP_FILE`). Metal prices are public LME / price-list data and stay as-is. Nothing is saved to the app. |
| Audio | Agent's choice (measured 124 BPM): a driving tech-house bed from `assets/audio/bgm/` mixed low, plus cinematic SFX pinned to beats. Delivered with and without BGM. |

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
| Brand | `brand-ink-open` re-skinned: cyan crosshair (CNC tool centre) → "CNC.Quote" letterpress → caps kicker, 1 s hold, on navy | Quiet brand-first opening, low energy |
| Live metal prices | `crane-rise-reveal` on the real *Materijali i cijene* page: start tight on the EN AW-6082 T6 row (6,19 €/kg), crane back to the full page with index cards | "This one price is one row of a live price list" |
| Calculator | `cursor-flyover` on the real *Kalkulacija* page: 4 stops (dimensions → machining → price card → price structure), pull back to the whole page | One continuous tour of the calculation chain |
| Quantity breaks | `row-embed` on the quantity table rows | Rows land into the table, ending on −77 % |
| Saved quotes | `type-and-filter` on the real *Ponude* page: type "prirub", rows filter down to one, click | Shows search + the quote list |
| Customer quote (PDF) | `document-typewriter-reveal`: the app's own printed quote floats on navy and writes itself block by block; total gets a cobalt wash | The product's end result: what the customer receives |
| Sign-off | `outro-group-photo-launch`: price card, ticker, index card, structure card, quantity table and quote row gather around the wordmark | Peak energy, everything shown, wordmark hold ≥1 s |
| Breathers | `paper-title-card` re-skinned (navy field, Archivo, cobalt accent word) ×2 | Chapter signposts |

## 5. Storyboard (30 fps, final timeline)

Music: `bgm-tech-house.mp3`, measured at **124.0 BPM** (BEAT = 14.516 f). The track starts 125 f in, so its drop
is heard at f342, exactly on the calculator cut. After the drop every cut and key hit is on
`beatF(n) = round(342.1 + 14.516·n)`, the frame where beat n is *heard*. Before the drop (brand, card 1,
crane) the track plays its sparse intro, so those shots are paced by the picture.

Audio sync record (Remotion 4.0.484, h264 + AAC, measured with ffmpeg + numpy cross-correlation, 2026-10-27):
output audio offset +1.28 f (AAC priming, uniform); source lead-in to peak: click-camera 5.7 f,
swoosh-quick 8.9 f, transition-soft 13 f, impact-deep-whoosh 16.5 f, riser-cine 22 f. Each SFX starts at
`target − lead-in − 1.3 f` (see `at()` in `src/Main.tsx`).

| # | Frames | Shot | Key motion | Caption / copy | SFX |
|---|---|---|---|---|---|
| 1 | 0–100 | Brand open | cyan crosshair draws, logo + "CNC.Quote" letterpress, kicker types, 44 f hold, lift out | kicker "KALKULACIJA CNC OBRADE I PONUDE" | transition-soft, whoosh-fast |
| 2 | 100–175 | Title card 1 | word-by-word press, underline, 30 f hold | "**Današnje** cijene metala, / svaki radni dan." | swoosh-quick |
| 3 | 175–342 | Materials crane | 24 f hold at 3× on EN AW-6082 T6 → 102 f crane to 1.25× → rows wash in → pulse on 6,19 | "LME + premija · cjenici dobavljača" | transition-soft, whoosh-big, sparkle-touch |
| 4 | 342–603 (beats 0–18) | Calculator flyover | 4 stops, clicks on beats 3/6/9/12, stop 4 settles ~30 f, pull-back, overview holds ~33 f | one caption per stop | 4× click-camera on the beats |
| 5 | 603–676 (beats 18–23) | Title card 2 | press, ~36 f hold | "Svakoj količini – / **svoja** cijena." | swoosh-quick |
| 6 | 676–778 (beats 23–30) | Quantity rows embed | 10 rows land on a 4× texture, seams, ring on −77 % | "1 → 1000 kom · do −77 % po komadu" | transition-soft |
| 7 | 778–894 (beats 30–38) | Quotes search | typing beat 31, filter beat 33, table collapses to one row, click "Otvori" beat 35 | "Sve ponude na jednom mjestu" | keyboard (18 f), whoosh-fast, click-camera |
| 8 | 894–1010 (beats 38–46) | Customer quote (PDF) | tilted close-up on the header → pull back; 14 blocks written in pairs (one cobalt caret); total washed at local 64; ~45 f readable hold | "Gotova ponuda za kupca · ispis i PDF" | transition-soft, keyboard (45 f) |
| 9 | 1010–1160 (beat 46 →) | Outro group photo | 8 elements (incl. the PDF) fly in over the blurred quotes page, logo stamps on beat 49 (f1053), rule + tagline, ≥60 f hold, fade | "Od dimenzija do ponude, s današnjim cijenama." | riser → impact (peak on beat 49) → sparkle-touch |

Total 1160 f ≈ 38.7 s. Flash cuts only on the two big cuts (f342 drop, f1010 finale). Captions are 56 px caps.

## 6. Deliverables

- `out/cnc-quote-promo.mp4`: music + SFX.
- `out/cnc-quote-promo-nobgm.mp4`: same timeline, SFX only (`--props='{"bgm":false}'`).
- The motion workbench (`workbench/`) runs as a local web app on port 5198, so it is not wired up for this cloud
  build. It can be added later by writing `src/workbench.ts` (see `references/workbench.md`).
