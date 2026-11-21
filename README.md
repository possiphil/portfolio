# sanktjohanser.dev

A static Astro and TypeScript portfolio prototype for Philipp Sanktjohanser. Phase 1 includes the complete homepage and the Genix case study. The approved [design spec](docs/design-spec.md) and [implementation brief](docs/codex-prompt.md) are in `docs/`.

## Propagande-style homepage (this branch)

The homepage on `feature/propagande-variant` is a one-page CV after [propagande.studio](https://propagande.studio). Its stack is the same as the original's: Three.js, GSAP (ScrollTrigger, SplitText, ScrambleText) and Lenis. Nuxt is replaced by Astro.

- **Content:** [`src/content/site.ts`](src/content/site.ts) holds every text, link and image on the homepage. Entries still waiting for real content are marked `TODO`.
- **WebGL stage:** [`src/scripts/studio/gl/stage.ts`](src/scripts/studio/gl/stage.ts) uses a single fixed canvas whose planes follow DOM elements tagged `data-gl-atmos`, `data-gl-text` or `data-gl-media`. The effects themselves are in [`shaders.ts`](src/scripts/studio/gl/shaders.ts): the dithered atmosphere, the pixel-dissolve type, the CRT screen and the motion-smear portrait.
- **Motion:** [`src/scripts/studio/main.ts`](src/scripts/studio/main.ts) runs the loader, the intro and all scroll scenes. With reduced motion, the loader and smooth scrolling are skipped. Without WebGL, the plain DOM version is shown.
- **Styles:** [`src/styles/studio.css`](src/styles/studio.css) defines the 12-column grid, labels and giant type, set in Inter Tight, a free stand-in for the original's commercial typeface.

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
