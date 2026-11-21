# sanktjohanser.dev — Design Specification

**Status:** Main A/B design workshop complete  
**Revision:** 1.0 — 20 November 2026  
**Scope:** Consolidation of the 76 approved design decisions  
**Purpose:** Build a memorable, credible, engineering-focused personal portfolio that feels cinematic and editorial while remaining fast, understandable, accessible, and easy to navigate.

> **Source of truth:** The design choices confirmed through Tests 1–76. This document consolidates those choices; exact wording, media assets, font families, and implementation details marked *provisional* are not final approvals. Do not substitute invented project screenshots, unverifiable performance results, fake metrics, or fabricated repository links.

## 1. Creative direction and priorities

A premium, mostly monochrome, portrait-led editorial portfolio with charcoal backgrounds, warm copper accents, subtle tonal gradients, elegant serif type, authentic project imagery, and purposeful cinematic transitions. Inspired by the level of craft and motion on Dennis Snellenberg's portfolio, the irregular gallery from the referenced Framer portfolio gallery, and the gentle tonal atmosphere of Anthesis — **not** by copying their code or design wholesale.

Design priorities, in order:

1. **Project credibility.** A software engineer or recruiter can quickly understand what each project is, why it matters, what was engineered, and what was accomplished.
2. **Distinctive identity.** The site should be recognizably personal, not another standard developer résumé template.
3. **Navigation clarity.** Visitors should never be forced through long animations, hijacked scrolling, or arbitrary pauses.
4. **Cinematic restraint.** Motion should reinforce meaning and spatial continuity; not every component needs an animation.
5. **Mobile, accessibility, and performance.** Strong responsive compositions, keyboard-operable controls, reduced-motion support, efficient video delivery, and high text contrast.

## 2. Page architecture

### Homepage order

1. **Hero** — immersive portrait, large name, philosophy-first statement, minimal “Explore work” editorial link.
2. **Selected Work** — tight asymmetric project gallery; Genix featured prominently.
3. **About** — oversized editorial statement with word-by-word entrance and categorized technical tags.
4. **Education** — academic timeline, copper line progressively drawn on scroll.
5. **Contact** — grand centered editorial statement, soft atmospheric copper glow, filled copper “Email me” pill, secondary editorial GitHub and LinkedIn links.

### Global navigation

- Top header with `PS.` home monogram, Work, About, Contact, a discreet `Résumé ↗` link to a real downloadable PDF, and a minimal sun/moon theme switch.
- Header hides when scrolling down and returns when scrolling up.
- Transparent on initial hero; subtly translucent charcoal/ivory surface when it reappears over content to retain legibility.
- Clicking `PS.` to return home invokes a **short, circular-swipe transition inspired by Dennis Snellenberg**, **not** the full curtain entrance. Do not force a long animated scroll to top.
- Mobile main menu: fullscreen editorial panel with oversized navigation links, rising rapidly from bottom (approximately 400–500 ms). This is distinct from the landing curtain and the project chapter selector.

### Project routes

- Each project has a dedicated, shareable, deep-linkable URL, for example `/work/genix` and `/work/orchestrator`.
- From the gallery, opening a project first **expands the actual card image into the fullscreen showcase**. Gallery typography exits separately and the fullscreen title reveals separately; do not stretch card text as part of the morph.
- Direct visits to project URLs render the project view without requiring entry through the homepage or full home curtain.
- Browser Back and the visible `← Back to projects` control restore gallery context and previous scroll position when available; direct entrants get a sensible fallback to the projects overview.
- At the end of a case study, a **compact cinematic next-project image preview** invites navigation, while the Back to projects link remains accessible.

## 3. Hero and arrival experience

- Desktop hero: immersive portrait occupies approximately **60–65%** of the composition, edge-blended into the background, **not** inside a visible rectangular photo frame.
- Provisional image: user's graduation portrait, if supplied and approved for publication.
- Portrait treatment: **subtle muted natural warmth**; skin tones remain natural, with desaturated surroundings. Avoid exaggerated orange/copper grading.
- Name: large two-line editorial serif set with staggered upward masked reveal. Philosophy-first statement beneath; wording is provisional.
- CTA: minimal text `Explore work` plus copper arrow; not an outlined or filled button. Activates a normal, controlled scroll to Projects.
- Mobile hero: immersive portrait image with name over its lower gradient, using **large statement-size serif typography**. Size responsively to fit the full surname on narrow devices.

### Signature first-session entrance

- A dark curtain opens **horizontally**: panels part left and right.
- Closed curtain displays the small `PS.` monogram.
- Entrance lasts approximately **1.5–2 seconds** in the design direction, but should not function as arbitrary waiting; begin once assets/readiness allow and degrade gracefully.
- Portrait enters with a gentle depth settlement, from roughly 5–8% overscale to its final size. Name lines reveal upward in quick stagger.
- **Full curtain only once per browsing session.** Refreshes within the session skip it. Reduced-motion mode skips it. Returning to Home via `PS.` uses the separate **short circular-swipe** transition.

### Homepage scroll transition

- Projects section **slides over the hero** as visitors naturally scroll; the portrait subtly recedes.
- No forced scroll snap, scroll hijacking, or artificial time delay.
- The Projects background transitions **gradually** from charcoal into a slightly warmer charcoal tone, inspired by the Anthesis reference. **Never introduce a hard-edged differently colored Projects panel.**
- Project cards appear with quick stagger after the layered reveal (approximately 70–100 ms apart).

## 4. Gallery and cards

- Desktop: **tight asymmetric masonry/editorial collage** with varied card sizes, approximately **8–12 px** gutters. Not a uniform grid and not 24–32 px spacious gutters.
- Genix is the **dominant featured centerpiece**; other strong projects surround it with smaller but still varied cards.
- Mobile: **single column**, different card heights. Featured Genix card uses **16:10 landscape ratio** so its real Unity editor footage stays legible.
- Images are **authentic captures of the actual software** and genuine artifacts. They can be art directed, cropped where appropriate, and color-matched, but should not be replaced by abstract-only AI artwork posing as the software.
- Titles and a minimal category label sit **over the image** on a gentle legibility gradient, not as captions below.
- Hover: slight cinematic image zoom, restrained copper arrow reveal; **standard native pointer cursor** (not an elaborate following “View” cursor).
- Featured Genix media: short, silent, seamlessly looping real product demonstration, showing meaningful software behavior. **Autoplay when substantially visible**, pause offscreen, mute always. Honor reduced-motion preferences with a still-image poster. Keep other gallery cards still by default.
- Clicking any card opens the dedicated route via image-first expansion; typography reveals separately.

## 5. Project case-study information architecture

Each project contains, where substantiated by real project material:

1. **Fullscreen cinematic showcase** — large genuine image/footage, editorial project title and short summary, plus visible `← Back to projects` navigation.
2. **Compact facts row** — project type, stack, primary focus. Place any genuinely public source/demo/docs links **immediately below** this row, not only after a long read.
3. **Engineering story** — challenge, approach, key architecture/design decisions, implementation where interesting, results and trade-offs.
4. **Selective inline pseudocode or very brief real code** — only if it illustrates an interesting technical idea; avoid long code dumps and unnecessary code blocks. A recruiter should follow the story without reading code.
5. **Two or three concise outcome highlights** — genuine accomplishments or product capabilities, never invented quantification.
6. **Compact image-led next-project teaser** — another shareable project route. Preserve a way back to all work.

The chapter sequence may differ by project if supported by the actual material. Avoid implying that every project must have a fabricated ‘results’ statistic or an always-public repository.

### Desktop story layout

- **Sticky visual storytelling**: a relevant visual stays pinned alongside the chapter explanation while content advances.
- **Alternating left and right** rather than a fixed arrangement for the whole site; shifts at meaningful chapter boundaries, not a rigid mechanical alternation.
- **60% visual / 40% explanation** on sufficiently wide desktop screens, regardless of which side is currently visual.
- Use **elegantly framed, complete technical screenshots**, preserving interface context instead of edge-to-edge crops. Major hero/project-open imagery remains cinematic and immersive.
- **No standalone captions** under technical screenshots; the adjacent chapter copy supplies necessary context.
- Relevant screenshots are clickable/tappable to open an accessible **high-resolution image viewer** with zoom, dismissible via close button, Escape, and appropriate mobile interactions, returning focus and scroll position to the originating screenshot.
- Adjacent engineering explanations use **editorial serif body type**, not default sans-serif technical text. Reserve restrained sans-serif for micro-labels, utility controls and metadata, and monospace for genuine code/pseudocode.
- Visual chapters transition through quick overlapping depth movement, approximately **300–450 ms**; never leave a blank pinned frame or introduce a forced pause. Reverses naturally when scrolling backwards.
- Persistent but discreet clickable chapter index on desktop.

### Mobile story layout

- Use a straightforward single column; no complicated side-by-side sticky split.
- Within each chapter: **heading → brief explanatory context → framed screenshot → further detail**.
- A **bottom-floating compact chapter control** sits above the phone safe area. Tapping opens a **roughly half-height bottom sheet**, leaving some of the current page visible. Dismiss via swipe-down, tapping outside, explicit close action or selecting a chapter.
- Keep navigation controls readable, reachable, and clear of page content.

## 6. About, Education, Contact

### About

- Oversized editorial statement expressing personal engineering philosophy. **Word-by-word** brisk reveal when in view; do not create forced waits.
- Supporting short paragraph, not a long autobiographical wall of text.
- Technical toolkit appears as **minimal outlined tags organized into a few meaningful categories**, rather than a single unstructured stream or a typographic index. Exact skill list requires curation against demonstrated experience.
- The hero positioning is philosophy-first rather than generic profession-first. The exact hero and About copy still require final writing and approval.

### Education

- Academic timeline for **Elite Software Engineering M.Sc. (LMU / TUM / University of Augsburg; ongoing)** and **TUM Informatics: Games Engineering B.Sc. (completed 2026)**.
- Thin warm-copper line **progressively draws as visitors scroll**, revealing the milestones as the line reaches them. Honor reduced-motion preferences.
- Verify exact official degree/program names and any publication dates before the final copy goes live.

### Contact

- Grand centered editorial finale, large serif invitation and a prominent **filled copper `Email me` pill**.
- Background: **soft, subtle atmospheric copper glow** dissipating gradually into charcoal (and a warm-ivory equivalent in light mode). No sharply divided background color and no distracting spotlight animation.
- Secondary professional links: **GitHub ↗ · LinkedIn ↗** as understated editorial text links, **not** circular social icon buttons.
- Email CTA needs a legitimate two-way email address and configured outbound email service if using a custom domain. Link may use `mailto:` once the address is confirmed.

## 7. Visual system

### Initial provisional palette

| Token | Dark mode | Light mode | Meaning |
|---|---|---|---|
| Main background | `#171717` | `#EFEAE2` | Charcoal / warm ivory |
| Primary text | Warm off-white, approximately `#F4EEE8` | `#28231F` | High-legibility editorial text |
| Copper accent | `#C99D80` | `#98684E` | Rare meaningful accents, rules and CTAs |
| Tonal transitions | Very subtle warm-charcoal gradients | Very subtle ivory/tan gradients | Continuous atmosphere, never hard stripes |

These are prototype values, not a final visual calibration. Evaluate with the *actual* portrait and screenshots, at normal phone/desktop brightness, including contrast testing.

### Type roles

- **Editorial serif:** hero name, key section headlines, project titles, About statement, **case-study body explanations**.
- **Restrained sans-serif:** small navigation labels, skills tags, metadata/facts, dates, buttons and utility surfaces.
- **Monospace:** real code/pseudocode only.
- Select actual font families for web licensing, loading speed, legibility and long surname rendering. The previous mockups used system fallback fonts, not an approved font family.

### Shapes and spacing

- Gallery cards: tightly arranged, mostly understated shapes and radii, with small copper hover affordances.
- Source code links, résumé and social links: mostly text with outgoing arrows.
- Email CTA: filled copper pill. Theme switch: **minimal sun/moon icon**, with tooltip and accessible text label; **circular theme change radiates from the toggle**.
- Avoid overusing cards, decorative copper borders, and loud gradients.

## 8. Motion specifications and interaction invariants

| Event | Approved behavior |
|---|---|
| Fresh homepage session | Horizontal split curtain, `PS.` monogram, portrait depth settle, staggered serif name reveal |
| Homepage reload in same session | No repeated curtain intro |
| Click `PS.` from another position/view | Short circular-swipe home transition inspired by the Dennis Snellenberg reference; no long forced scroll |
| Scroll from hero to Projects | Projects content layers over hero; gradual warmer-charcoal tone; portrait recedes |
| Gallery enters | Quick sequential card reveals |
| Hover card | Gentle image zoom and copper arrow; normal pointer |
| Featured Genix card in viewport | Autoplay real muted loop; pause when offscreen; still poster for reduced motion |
| Click project card | Image expands into full-screen project view; typography transitions separately; dedicated URL |
| Close/back project | Editorial `← Back to projects` and browser Back; reverse transition where context exists; retain gallery scroll |
| Case-study chapter changes | Overlapping short depth transitions, no blank state; reversible on reverse scroll |
| Education enters/scrolls | Copper timeline draws progressively |
| About enters | Short word-by-word serif statement reveal |
| Mobile main menu | Fullscreen editorial sheet rises from bottom |
| Mobile project chapters | Bottom-floating control opens compact half-height bottom sheet |
| Theme toggle | Dark/ivory circular reveal originating at sun/moon button |
| Click technical screenshot | Accessible enlarged viewer with zoom, close/escape and return focus |
| Footer next project | Compact cinematic image preview to another dedicated route |

**Absolute behavior constraints:** no scroll hijacking, no mandatory pauses, no inaccessible motion, no hidden project content behind hover-only affordances, no page-break flicker between routes, no fake or ungrounded screenshots, no invented quantitative impact claims.

## 9. Implementation and quality guidance (not additional design decisions)

**Preferred stack from prior planning:** Astro + TypeScript, deployment via Cloudflare Workers; static-first or selectively hydrated implementation where sensible. Confirm compatibility with the chosen routing and animation approach during the prototype phase rather than assuming every API works universally.

Implementation should account for:

- **Route-aware transitions** that work with browser Back/Forward and direct deep links. Preserve focus, scroll and history semantics.
- **View transition fallback** for unsupported browsers and reduced-motion users; never block route navigation on animation completion.
- **Video discipline:** genuine short loop, muted, inline, compressed, poster fallback, visibility-based playback and pause. Avoid unnecessary preload/data usage.
- **Image discipline:** responsive high-quality media, originals accessible for screenshot viewer, correct `alt` text, appropriate lazy loading.
- **Readable long-form text:** sufficient line height/contrast, measured line length and no overflow of long project names or surname on mobile.
- **Mobile navigation:** body scroll lock for modal/sheet when appropriate, safe-area insets, large touch targets, focus management.
- **Animation accessibility:** `prefers-reduced-motion` skips or simplifies curtain, image morphs, scroll effects, circular home wipe, timeline draw and theme reveal.
- **SEO:** stable canonical `/work/...` routes, meaningful title/description, Open Graph images, project-specific content on direct load.
- **Privacy:** do not leak private repository links or unreleased technical data; publish only material cleared for public portfolio use.
- **Accessibility checks:** keyboard traversal, visible focus states, color contrast, screen reader labels, dismissible overlays, semantic headings.

## 10. Remaining inputs before implementation can be final

These are **content and asset dependencies**, not new A/B design tests:

1. **Actual portrait** to validate edge blending, natural warmth, crops and headline readability.
2. **Real Genix footage**, ideally a concise UI demonstration with an impressive but accurate before/after change; choose encoding and poster frame.
3. **Verified project captures and content** for Genix, Orchestrator, Application Optimizer, Crawler and any final shortlist additions. Establish which screenshots/repositories/results may be published.
4. **Final copy** for philosophy-first hero statement, About statement, project summaries, genuine outcome highlights and Contact invitation.
5. **Skills inventory** with authentic categories, not an exhaustive keyword cloud.
6. **Public links and identity endpoints:** résumé PDF, GitHub, LinkedIn, accessible email address and any demo/docs pages.
7. **Final fonts and responsive layout calibration** with actual assets, rather than provisional SVG sketches.

## 11. Approved test-by-test decision register (1–76)

| Test | Locked decision |
|---|---|
| 01 | Choreographed cinematic site entrance, roughly 1.5–2 s, nonblocking |
| 02 | Portrait-dominant desktop hero |
| 03 | Mostly monochrome visual system |
| 04 | Restrained warm copper accent on charcoal |
| 05 | Elegant editorial serif hero typography |
| 06 | Portrait edge-blended into background, not framed |
| 07 | Cinematic curtain site opening |
| 08 | Minimal `PS.` monogram on closed curtain |
| 09 | Curtain panels part horizontally left/right |
| 10 | Portrait subtle cinematic depth settlement (5–8% overscale) |
| 11 | Two-line staggered upward name reveal |
| 12 | Portrait ~60–65% of desktop hero |
| 13 | Natural scroll to projects; click opens cinematic fullscreen case study |
| 14 | Varied-size asymmetric masonry/collage gallery |
| 15 | Minimal image-led project cards |
| 16 | Authentic software screenshots/footage, not abstract-only invented art |
| 17 | Cinematic fullscreen opening for individual projects |
| 18 | Sticky visual storytelling in case studies |
| 19 | Quick overlapping depth visual-chapter transitions, reversible |
| 20 | Discreet persistent clickable chapter index |
| 21 | Education presented as academic timeline |
| 22 | About uses oversized editorial statement plus brief support text |
| 23 | Main navigation at top |
| 24 | Top navigation auto-hides on down-scroll, returns on up-scroll |
| 25 | Grand centered editorial Contact finale |
| 26 | Copper pill `Email me` CTA |
| 27 | Gentle card-hover image zoom and copper arrow reveal |
| 28 | Optional warm-ivory light theme, dark default |
| 29 | Theme changes with a circle reveal from the theme toggle |
| 30 | Mobile immersive portrait hero with name overlaid near bottom |
| 31 | Single-column mobile gallery with varied heights |
| 32 | Fullscreen editorial mobile main menu |
| 33 | Mobile menu rises from bottom, distinct from intro curtain |
| 34 | Standard pointer cursor, no following `View` cursor |
| 35 | Projects layer over hero on natural scroll, portrait recedes |
| 36 | Quick staggered gallery card entrance (~70–100 ms) |
| 37 | Tight 8–12 px gallery gutters |
| 38 | Gallery titles over images with legibility gradient |
| 39 | Gradual warmer-charcoal transition in Projects, no hard color cut |
| 40 | Project image expands first; fullscreen title typography reveals separately |
| 41 | Editorial `← Back to projects` exit link |
| 42 | Academic timeline line progressively draws on scroll |
| 43 | About statement appears word by word |
| 44 | Minimal outlined technology tags |
| 45 | Technology tags grouped by category |
| 46 | Dominant featured Genix card |
| 47 | Short silent looping real Genix software demonstration |
| 48 | Genix loop autoplays when card is visible, pauses offscreen |
| 49 | Selective inline code/pseudocode; avoid excessive code |
| 50 | Compact facts row at start of project case study |
| 51 | Compact cinematic next-project image preview |
| 52 | Philosophy-first hero positioning |
| 53 | Minimal editorial `Explore work` text-and-copper-arrow link |
| 54 | Subtle translucent navigation background after scrolling |
| 55 | Intentionally alternating left/right sticky case-study layouts |
| 56 | Elegant framed software interface screenshots in chapters |
| 57 | No screenshot captions; contextual explanation belongs in prose |
| 58 | Large statement-size serif name on mobile hero |
| 59 | Bottom-floating mobile chapter control |
| 60 | Subtle atmospheric copper glow behind Contact finale |
| 61 | Editorial GitHub and LinkedIn text links |
| 62 | Homepage order: Projects → About → Education → Contact (after hero) |
| 63 | Discreet résumé PDF link in top navigation |
| 64 | Two or three genuine highlighted project outcomes |
| 65 | Public source/demo links below compact project facts row |
| 66 | Mobile chapters: heading → brief context → framed screenshot → details |
| 67 | Mobile chapter menu: compact ~half-height bottom sheet |
| 68 | Full curtain once per session; shorter elegant home-return animation |
| 69 | `PS.` home-return motion: circular swipe inspired by Dennis Snellenberg |
| 70 | Hero portrait graded with subtle muted natural warmth |
| 71 | Editorial serif body typography for technical explanations |
| 72 | Desktop chapters: ~60% visual / 40% text |
| 73 | Dedicated deep-linkable project URLs with cinematic route transitions |
| 74 | Featured Genix mobile card: landscape 16:10 |
| 75 | Technical screenshots open accessible enlarged high-resolution viewer |
| 76 | Minimal sun/moon icon theme toggle (circular reveal retained) |

---

**Ready for next phase:** Replace placeholders with authentic media and content, prototype the homepage and Genix project route, and test navigation, cinematic transitions, mobile adaptation, accessibility and performance in a real browser. Do not start a new round of subjective micro-decisions until the working prototype reveals a concrete issue.
