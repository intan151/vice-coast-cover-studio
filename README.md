[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01/)
[![Rank](https://make.fun/badge/gta6-cover-art-01/intan151/vice-coast-cover-studio/rank.svg)](https://make.fun/c/gta6-cover-art-01/)
[![Reward](https://make.fun/badge/gta6-cover-art-01/intan151/vice-coast-cover-studio/reward.svg)](https://make.fun/c/gta6-cover-art-01/)

# Vice Coast Cover Studio

An offline browser app that turns any photo and caption into GTA-style
multi-panel cover art — the Vice City neon-sunset poster look — and exports
it as a PNG to share. Built for the
[Make GTA 6 Cover Art](https://make.fun/c/gta6-cover-art-01/) bounty on
[make.fun](https://make.fun/).

## What it does

- **Any photo:** drop in your own photos from your machine (they never leave
  it), or use the two built-in sample scenes, which the app draws itself on a
  canvas — no photo files ship with the app.
- **Multi-panel covers:** four layouts — Vice Grid (2×2), Hero Strip (big
  hero + three stacked), Sunset Bands (three wide bands) and Tilted Snaps
  (overlapping polaroids). Click a panel to select it, click a photo to put
  it there, drag a panel to reposition its photo, zoom to crop tighter, or
  fill every panel with one photo.
- **Caption:** a bold condensed title (your system fonts only), a script
  subtitle, and a badge ribbon, plus a four-star heat meter.
- **Sunset grades:** Neon Sunset, Vice Nights, Golden Hour and Pastel Dusk —
  warm gradient washes, film grain, vignette and a white poster frame.
- **Fast export:** one click writes a PNG at 1080×1080, 1080×1350 or
  1920×1080.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>. No build step, no network requests, no
libraries — plain static files under `app/` (ES modules).

## Layout

- `app/index.html` — the editor page
- `app/style.css` — dark neon editor chrome
- `app/src/main.js` — state, photo loading, panel picking, export
- `app/src/cover.js` — the cover renderer: layouts, grades, lettering
- `app/src/sample.js` — the two procedural sample scenes (canvas-drawn)
- `main.ts` — hands `app/` and `screenshots/` in and writes `dossier.json`
- `screenshots/` — the app at work and covers it exported

## Originality

Everything here is original: no Rockstar Games logo, wordmark, official
artwork, character or font. Titles use the system condensed font stack only
(`Arial Narrow`, `Impact`, `Franklin Gothic Medium`, …) — no font files ship
in this repository at all.

## License

MIT — see [LICENSE](LICENSE).
