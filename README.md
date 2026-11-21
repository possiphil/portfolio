# sanktjohanser.dev

> **Branch `feature/vshslv-variant`:** the site on this branch is an experimental variant modelled on the layout and interactions of vshslv.com, rebuilt from scratch (the reference has no public source). It includes a loader line, glass navigation pills with SVG refraction (Chromium), a WebGL portrait with drifting light and smoke, type-on columns, a ticker, a bottom bar with viewport size, OS and clock, a scroll "tunnel" into a draggable work board with a minimap, Portfolio and Profile panels (the profile switches the hero to ASCII), and a ⌘K terminal. `/`, `/portfolio` and `/profile` render the same shell with different panels open.
>
> - Content (CV, columns, ticker, taglines, board cards, links): [src/content/cv.ts](src/content/cv.ts)
> - Markup: [src/components/vs/Shell.astro](src/components/vs/Shell.astro) · styles and tokens: [src/styles/vs.css](src/styles/vs.css)
> - Behaviour: [src/scripts/vs/](src/scripts/vs/) (`hero-gl.ts` shader and ASCII, `board.ts`, `glass.ts`, `terminal.ts`, `main.ts`)
>
> The Genix case study at `/work/genix` is unchanged.

A static Astro and TypeScript portfolio prototype for Philipp Sanktjohanser. Phase 1 includes the complete homepage and the Genix case study. The approved [design spec](docs/design-spec.md) and [implementation brief](docs/codex-prompt.md) are in `docs/`.

## Run locally

Use Node.js 22.23.4 or newer. The repository records the minimum tested version in `.node-version`.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Astro. Use `/` for the homepage and `/work/genix` for the case study, including on a fresh page load.

```sh
npm run check
npm run build
npm run preview
```

`preview` serves the production output in `dist/`. The existing Wrangler configuration serves that same directory as Cloudflare Worker static assets. Set `SITE_URL` at build time if a different origin should appear in canonical and social metadata.

## Content and assets

- [Portfolio content](src/content/portfolio.ts) controls the homepage, featured gallery, and case studies. A project with a `study` entry gets a dedicated route. The next-project teaser appears when a subsequent case study exists.
- [Media manifest](src/content/media.ts) holds the portrait, Genix image/video slots, résumé, and contact endpoints. See the [asset checklist](docs/asset-checklist.md) for missing inputs and where to add them.
- Instrument Serif and Instrument Sans are self-hosted with OFL licenses in [the font directory](src/assets/fonts).

The homepage curtain is session-scoped. Same-origin cross-document View Transitions supply the gallery image expansion and its reverse where supported. Regular document navigation, native history, and direct case-study URLs remain available independently. Reduced motion skips the animated effects. Without JavaScript, the homepage links, chapter anchors, and links to original images remain usable.

## Background atmosphere

Tune the glow, grain, and print pattern independently for each theme at the top of [atmosphere.css](src/styles/atmosphere.css). Use `0%` to disable the glow or pattern and `0` to disable the grain. In the browser console, switch the whole treatment off or back on without reloading.

```js
document.documentElement.dataset.atmosphere = 'off';
delete document.documentElement.dataset.atmosphere;
```
