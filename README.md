# sanktjohanser.dev

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
