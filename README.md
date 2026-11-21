# sanktjohanser.dev — tile variant

A static Astro CV site built around a dashboard of tilting tiles: a portrait, gradient-wave category tiles, link cards and a rotating preview, plus bento category pages and long-form article pages.

## Run locally

Use Node.js 22.23.4 or newer.

```sh
npm ci
npm run dev
```

```sh
npm run check
npm run build
npm run preview
```

Pushing a branch to GitHub triggers a Cloudflare Workers Builds preview of that branch.

## Personalise

Nearly everything lives in [src/content/site.ts](src/content/site.ts):

- `person`: name, the logo suffixes that roll after `sanktjohanser.`, and the letters that appear over the portrait on hover.
- `categories`: the five wave tiles on the homepage. Each one becomes a page at `/<slug>` with a bento grid of cards. A card is `image`, `icon`, `list` or `text` and can be `small` (1×1), `wide` (2×1) or `large` (2×2).
- `palettes`: the gradient and wave colours. Wave shapes are in [WaveArt.astro](src/components/WaveArt.astro).
- `homeLinks`, `reel`: the white link cards and the rotating preview tile.
- `about`, `studies`: long-form pages (`/about`, `/projects/<slug>`).
- `navigation`: the side drawer.

Contact links and images are in [src/content/media.ts](src/content/media.ts). Icon glyphs are in [Glyph.astro](src/components/Glyph.astro).

## Motion

[src/scripts/motion.ts](src/scripts/motion.ts) holds all behaviour: pointer tilt with inner parallax, click ripples, the rolling logo, the preview reel, the drawer, the one-time loading veil and the scale-out page transition. Timings and easing come from `--ease` and `--tilt-ms` in [base.css](src/styles/base.css). Reduced motion turns the effects off; without JavaScript every tile is still a plain link.

Fonts: Outfit and Quicksand (OFL), self-hosted through Fontsource.
