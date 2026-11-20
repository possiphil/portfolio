# Genix architecture explorer

Open `/lab/genix` on the branch preview or the Astro dev server. Select **Evaluation**, **Resolve graph**, and **Evaluate node** to reach the C# excerpt. Either marked line opens a statement detail. **Authoring**, **Planning**, and **Delivery** have shorter illustrative paths.

## Recordings and screenshots

| Capture | What to watch |
| --- | --- |
| [Architecture to module](architecture-to-module.mp4) | The wheel holds the pointer’s world position as Evaluation opens and the other regions pass beyond the frame. |
| [Module to C#](module-to-source.mp4) | Resolve graph opens into its three operations. Evaluate node reveals the excerpt and its inspectable statements. |
| [Back to the overview](reverse-to-overview.mp4) | Breadcrumbs fly back through the same nested regions, from a statement to the project map. |
| [Cursor anchoring](cursor-anchoring.mp4) | The symbols on Authoring and Delivery stay under the marked pointer as the scale changes. |

[Desktop overview](desktop-overview.webp) · [Desktop C#](desktop-source.webp) · [Mobile overview](mobile-overview.webp) · [Mobile C#](mobile-source.webp)

The recordings show the Astro production build running in Chromium. The ring represents the pointer. Desktop captures use a 1440 × 900 viewport. Mobile captures use a 390 × 844 viewport at 2× pixel density.

## Controls

- Scroll the mouse wheel over a region to zoom toward it. Drag empty space, use the middle mouse button, or hold Space and drag to pan.
- With a trackpad, two-finger scroll pans and pinch zooms on browsers with compatible events. The **Scroll** menu can force **Pan** or **Zoom** for wheels that **Auto** classifies incorrectly.
- On touchscreens, drag to pan and pinch to zoom. Tap a region or use the **−** and **+** buttons to change scale.
- With the viewport focused, arrows pan, **+** and **−** zoom, **Enter** follows the featured path, **Backspace** returns to the parent, and **Home** resets the map. Use **Tab** to reach other regions and controls. **Escape** exits to the portfolio.
- Breadcrumbs fly to the corresponding level. **Overview** restores the original camera. Reduced motion makes button and breadcrumb navigation immediate. The tab remembers the camera pose and scroll mode on reload.

## Camera and scene model

- `camera.ts` handles screen and world coordinates, pan bounds, and cursor-anchored zoom. Animated wheel input reprojects the pivot at every scale step. If a zoom would cross a pan bound, scale stops at the last position that preserves the pivot.
- `model.ts` defines a tree of diagrams, code excerpts, and details. `navigation.ts` lays it out in wide and compact profiles. Each child is fitted inside its parent’s region and keeps that world position throughout the visit.
- A child fades in between 42% and 93% of its fitted scale. Its opening region fades at the same time. Breadcrumbs and focus follow the scene that occupies the viewport at the current scale. Zooming back uses the same opacity and scene-selection rules.
- `render.ts` draws HTML tiles and SVG connectors and composites each scene at its projected size so the text stays sharp. It mounts visible scenes on demand, skips offscreen regions, and limits focus and text selection to the active scene.

## Verification

Use Node.js 22.23.4 or later.

```sh
npm ci
node --experimental-strip-types --test tests/genix-explorer/*.test.mjs
npm run check
npm run build
npm run preview
```

The deterministic tests cover camera transforms, anchored zoom at multiple positions, zoom and pan bounds, forward and reverse reveal thresholds, parent landings, and session restoration in both layouts. Browser verification exercised mouse and keyboard in Chromium, plus trackpad-style wheel events and multi-touch emulation. Across two cursor positions, the projected anchor shifted by less than 0.01 CSS pixels during zoom. Axe reported zero violations in the desktop overview and source states. Physical trackpad and phone gestures need device testing.

## Replacing the sample with Genix

The modules, graph and source excerpt in `illustrative.ts` are illustrative. To integrate the thesis implementation, use a verified Genix revision, check each module relationship against that revision, and map curated function excerpts and statement locations into the scene tree. The sample highlighter covers the syntax used here. A larger source set would benefit from tokenizing C# at build time and curating short excerpts for narrow viewports.

Compilation inspection is a future extension. Add it using captured output tied to the source revision, target framework, build configuration, and compiler or runtime version. Changes from optimization and inlining should be explained when presenting that output.
