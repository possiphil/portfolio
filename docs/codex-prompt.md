# Codex — sanktjohanser.dev high-fidelity prototype (Phase 1)

You are the implementation engineer and creative frontend developer for **sanktjohanser.dev**, a distinctive, recruiter-friendly software engineering portfolio.

## Non-negotiable source of truth

Read **all** of `docs/design-spec.md` before writing code. It records **76 approved design decisions**. Treat it as authoritative. If an approved detail is difficult to implement, preserve its intent with a documented progressive enhancement or fallback; don't silently substitute a generic design.

Read any existing repository instructions (`AGENTS.md`, README, package scripts, etc.). Inspect the repo and existing assets first. If this is an empty/new project, initialize it. If not, integrate into the existing structure without overwriting unrelated work.

The brief references Dennis Snellenberg's level of interaction craft, an irregular Framer gallery and Anthesis-like gradual tones. Use them as **creative references**, not assets or code to copy. No copying website source, media, or proprietary styling.

## Objective

**Implement a running, visually convincing Phase 1 prototype**, centered on:
1. The complete responsive homepage: Hero → Selected Work → About → Education → Contact.
2. A polished, direct-loadable `/work/genix` case study showing the approved project-page interaction system.
3. Reusable components/data structures that make the remaining project routes easy to finish later.

This is **not** permission to invent content or media to make a fake fully populated portfolio. Prioritize visual quality, real working interactions, and a coherent system over checkbox implementations of all 76 choices. Finish the prototype and verify it locally; don't stop at an architecture plan, wireframes, or static HTML mockup.

## Stack and architecture

- Prefer **Astro + TypeScript**. Favor static-first rendering with narrow interactive islands where motion or state requires client-side JavaScript; choose additional dependencies sparingly.
- Prepare for **Cloudflare Workers** deployment, but **do not deploy, change DNS, publish a live site, or push remotely** without explicit authorization.
- Choose a robust, current, browser-compatible routing/transition approach; verify actual Astro APIs rather than assuming a particular experimental interface exists.
- Build reusable design tokens, responsive layout primitives, project data, animation utilities, accessible modal/sheet components and asset slots.
- Use appropriately licensed and efficiently loaded web fonts: editorial serif for major headings **and case-study body explanations**, restrained sans-serif for metadata, and monospace for any code.

## Design priorities

The finished prototype should feel **premium, cinematic and editorial**, but also credible as an engineering portfolio. Avoid stock "developer portfolio" templates, conventional equal-sized card grids, generic frosted-glass dashboards, excessive copper outlines, noisy particles, decorative fake terminal output, exaggerated parallax and unreadable tiny text.

Honor the detailed spec, especially:

### Homepage
- Mostly charcoal (`#171717` provisional) and warm copper (`#C99D80` provisional); optional warm-ivory light theme. Gently evolving tones, **no abrupt differently colored Projects panel**.
- Immersive portrait hero (~60–65% visual area desktop), large two-line serif name, philosophy-first statement, minimal `Explore work` text/arrow. On mobile, oversized name overlays the lower portrait gradient without clipping the long surname.
- First browser session: split left/right curtain with `PS.` monogram, portrait depth settlement and staggered name reveal. Reload within a session skips the opening. `PS.` navigation home uses a **short, distinct circular swipe**, *not* the first-visit curtain or a long forced scroll.
- Projects layer over the hero through natural scrolling; subtle background warmth shift; brief staggered card entrance. **No scroll snapping or scroll hijack.**
- Tight (8–12px) asymmetric desktop gallery, image-led cards with overlaid titles; **Genix is the dominant card**. Mobile is single-column; Genix featured card **16:10**. Hover zoom and copper arrow; native pointer.
- When actual Genix footage exists: a short, muted, inline looping video autoplays only while substantially visible and pauses offscreen. If missing, use a deliberate still/poster placeholder; never pretend a fabricated animation is real Genix. Respect reduced motion and data usage.
- About: oversized editorial statement revealed word-by-word; short supporting paragraph; **categorized, minimal outlined skill tags** (use only verified or explicitly labeled draft skills).
- Education: two program milestones with a copper line progressing on scroll; use the precise education information present in the spec and don't invent graduation dates.
- Contact: spacious centered editorial finale with a subtle atmospheric copper glow, filled copper `Email me` pill, editorial GitHub/LinkedIn text links.
- Header: `PS.`, Work, About, Contact, discreet Résumé PDF link, small sun/moon theme toggle. Hide when scrolling down; restore when scrolling up over a subtle translucent surface. Theme reveal expands circularly from the toggle where supported, with accessible fallback. Mobile main menu rises from bottom as fullscreen editorial panel.

### `/work/genix`
- Deep-linkable route, accessible on refresh without a homepage animation. Gallery-to-route transition **expands the project image first** into the fullscreen showcase; reveal full-page typography separately. On unsupported browsers or direct visits, navigate correctly without relying on animation.
- Discreet `← Back to projects` link; support browser Back/Forward and restore gallery scroll/context when available.
- Fullscreen showcase followed by a compact facts row; show source/demo/docs links beneath the facts **only if verified public and real**.
- Engineering story with sticky framed software visuals, substantial desktop **60% visual / 40% text**, intentionally alternating visual placement across meaningful chapters. Editorial serif for explanations. Short overlapping depth changes as visuals switch, no empty pinned frame.
- On mobile: chapter heading → brief context → framed screenshot → details. Bottom-floating chapter selector opens an accessible approximately half-height bottom sheet.
- Clickable genuine technical screenshots open a high-resolution zoom viewer; Escape/close/focus restoration must work. No standalone screenshot captions; explanations are in adjacent prose.
- Short illustrative **pseudocode only when it serves a real technical explanation**. Never create fake implementation snippets, results, impact metrics, or claims.
- Two to three concise **verified** outcome highlights; compact next-project visual teaser only if the destination is a valid route. Don't make broken links.

## Authentic content and missing assets

Before implementation, inventory `public/`, `src/assets/`, and other provided materials. Use **actual user-supplied assets** where available and safe for public use.

If absent, create clearly labeled, aesthetically restrained **asset placeholders** that demonstrate the final layout without impersonating real photos, Genix screenshots or generated metrics. Do **not** download random stock portraits or synthesize a fake picture of the owner. Placeholders must be trivial to replace through a centralized asset manifest. Record required assets in `docs/asset-checklist.md` (portrait; Genix poster/video/screenshots; verified descriptions and outcomes; resume; email; public profiles; project links). Avoid publishing fake email or social links: use clearly disabled or draft-labeled affordances when data is unknown.

You may use accurately sourced information from the design spec for placeholder copy, but flag unapproved slogans or claims as provisional. Prioritize trustworthy content over impressive-sounding invention.

## Build and verification sequence

1. Audit repository instructions, installed tooling and assets; read the entire spec. Make a short implementation plan internally, then proceed to coding.
2. Establish foundations (Astro, TS, design tokens, fonts, themes, responsive shell) and build the full homepage.
3. Add responsive project gallery, reusable project route, `/work/genix`, image-first route animation, gallery-return behavior, and core technical story components.
4. Implement the highest-value interactions: first-session curtain, circular `PS.` return transition, gallery-to-project image morph, chapter navigation and image viewer; add reduced-motion and no-JS/unsupported-browser fallbacks.
5. **Actually run the application**. Perform typecheck, build and any available lint/tests. If you have browser automation, inspect desktop ~1440px and mobile ~390px screens, visit deep links, scroll through sections, click cards/back links, toggle theme, test modal/sheet and use keyboard. Fix visible layout and functional issues; don't declare success on the first build if UI inspection is available.
6. Check accessible focus states, contrast, sensible semantics, no overflow, no dead anchors, no serious console errors, and no layout shift from media placeholders.

## Acceptance criteria

- I can run the project locally using documented commands and explore a **visually finished** homepage plus `/work/genix` prototype.
- The design unmistakably reflects the approved editorial/cinematic aesthetic, not a generic landing page.
- The site is usable with a keyboard, on narrow phones and with reduced motion.
- Direct links, Back/Forward, scroll restoration, menu, theme and screenshot viewer function.
- Missing assets are obvious, isolated, and enumerated, not replaced with fabricated evidence.
- The implementation is organized, typechecked, buildable and ready for later authentic-content and animation refinements.

## Delivery

Modify the repository and leave it in a working local state. Do not deploy or push. At the end, report: files/components added, implemented interactions, commands executed and results, URLs to test locally, screenshots/visual checks if available, any approved decisions simplified or deferred (with reasons), and the **exact assets/content you need from me** next. Distinguish verified working features from untested behavior.

**Do the implementation now; do not stop after proposing a plan.**
