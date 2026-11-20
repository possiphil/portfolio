# Philipp Sanktjohanser’s portfolio

A single-page portfolio built with Astro and TypeScript. The production build is static HTML and CSS with self-hosted fonts, responsive images, and a small script for the persistent theme toggle, section navigation, and pointer response on the Genix preview. The portrait opening plays on the first visit in each browser profile. Returning visitors, visitors with reduced motion enabled, and visitors arriving through a section link see the final composition immediately.

## Local development

Use Node.js `22.23.4` or later. If you use a version manager that reads `.node-version`, it will pick the tested version from the repository.

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro. Before pushing a change, run:

```sh
npm run check
npm run build
npm run preview
```

`preview` serves the static output in `dist/`.

## Customization

- Edit `src/content/portfolio.ts` for the introduction, biography, education, technical areas, GitHub profile, and SEO description. Add another entry to `projects` to create another project card. Use a unique `id` and add an optional `url` when the project has a public page.
- Edit `src/styles/global.css` for typography, layout, colors, and the light and dark palettes. The self-hosted Instrument Sans and Instrument Serif fonts and their OFL licenses are in `src/assets/fonts/`.
- Replace `src/assets/portrait.webp` to update the hero portrait.
- `src/assets/terrain-study.webp` is a conceptual illustration for Genix. Update its caption in `src/components/ProjectCard.astro` if the artwork changes. A project’s optional `url` adds an Explore link beside its project details.
- Update `public/favicon.svg` and the 1200 × 630 `public/social-card.jpg` if the identity or illustration changes.

## Cloudflare Pages

1. In [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages), choose **Create application → Pages → Connect to Git**.
2. Connect GitHub if prompted, select **`possiphil/portfolio`**, and begin setup. Choose any available Pages project name.
3. Use these build settings.

   | Setting | Value |
   | --- | --- |
   | Framework preset | Astro |
   | Production branch | `main` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` (leave blank in the dashboard to use the repository root) |

4. Choose **Save and Deploy**. Open the production `pages.dev` URL after the build succeeds. Pushes to `main` trigger production builds.

Cloudflare supplies `CF_PAGES_URL` during the build. The site uses the stable `pages.dev` origin for canonical and social-sharing URLs. If you attach a custom domain, set the optional Pages build variable `SITE_URL` to its full HTTPS origin and redeploy. For a local metadata check, run `SITE_URL=https://example.com npm run build`.

See the [Cloudflare Pages Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/).
