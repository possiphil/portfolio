# sanktjohanser.dev

> **Branch `feature/snellenberg-variant`:** the homepage on this branch is an experimental variant modelled on the layout and interactions of dennissnellenberg.com (greeting preloader, scrolling name marquee, magnetic buttons, hover preview in the work list, side menu, curved footer). It uses only this portfolio's own content, images and fonts. Edit copy, colors, links and project images in [src/content/variant.ts](src/content/variant.ts); styles are in [src/styles/variant.css](src/styles/variant.css) and behaviour in [src/scripts/variant.ts](src/scripts/variant.ts). The Genix case study at `/work/genix` is unchanged.

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
