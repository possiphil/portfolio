# sanktjohanser.dev — CV variant (`feature/anerow-variant`)

A personal CV site. Layout, motion and visual language follow [a-nerow.fr](https://www.a-nerow.fr/), rebuilt from scratch on the same kind of stack:

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, static export) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (tokens in `app/globals.css`) |
| Motion | Framer Motion (reveals, 3D portrait tilt, timeline fill, header, floating CTA) · GSAP ScrollTrigger (pinned horizontal project track) · CSS keyframes (hero entrance, marquee) |
| Fonts | Outfit (text), Syne (wordmark), JetBrains Mono (labels/code), served via `next/font` |
| Icons | lucide-react, brand logos from simple-icons (inlined at build time) |
| Hosting | Cloudflare Worker static assets (`wrangler.jsonc` → `./out`) |

## Personalise

Almost everything lives in **[`content/site.ts`](content/site.ts)**:

- `profile`: name, monogram (`PS.`), email, CV path, hero image + layout (`portrait` or `wide`)
- `socials`: only entries with a URL are rendered (LinkedIn is still a `TODO`)
- `marquee`: the tech pills under the hero (slug = [simpleicons.org](https://simpleicons.org) name)
- `stack`: the `stack.ts` code window
- `projects`: cards in the horizontal track (image or video cover, status, tags)
- `dictionaries.en` / `dictionaries.de`: all copy, in English (`/`) and German (`/de`)

Search for `TODO` to find placeholders: email, LinkedIn, location/languages, the three unfinished project descriptions, the "what am I looking for" FAQ, and the CV PDF (`public/Philipp-Sanktjohanser-CV.pdf`).

To change the accent colour, edit `--accent-*` at the top of `app/globals.css`.

## Run

```sh
npm ci
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npm run preview    # serve ./out through wrangler, same as production
```

The contact form is static: it opens the visitor's mail app with the message pre-filled. To receive messages directly, point `components/ContactForm.tsx` at a form service or a Worker route.

## Deploy

Cloudflare Workers Builds is connected to the GitHub repo, so every pushed branch gets a preview URL under the `portfolio` worker. The build has to run `npm run build`, and the deploy step serves `./out` (see `wrangler.jsonc`).
