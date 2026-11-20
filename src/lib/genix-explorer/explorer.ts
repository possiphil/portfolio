import {
  clamp, panCamera, viewportCenter, zoomCamera, type Camera, type Point, type Size,
} from './camera.ts';
import { bindInput } from './input.ts';
import { illustrativeGenix } from './illustrative.ts';
import { levels } from './model.ts';
import { CameraMotion } from './motion.ts';
import {
  cameraFor, layoutScenes, limitsFor, pathTo, profileFor, restoreNavigation, saveNavigation,
  sceneAt, scrollMode, zoomLimitAt, type Scene, type ScrollMode, type View,
} from './navigation.ts';
import { SceneRenderer } from './render.ts';

const storageKey = 'genix-explorer:navigation:v1';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function readSession(): unknown {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
  } catch {
    return null;
  }
}

function startExplorer(root: HTMLElement): void {
  function find<T extends HTMLElement>(selector: string): T {
    const node = root.querySelector<T>(selector);
    if (!node) throw new Error(`Explorer element missing: ${selector}`);
    return node;
  }

  const viewport = find('[data-viewport]');
  const world = find('[data-world]');
  const crumbs = find('[data-breadcrumbs]');
  const heading = find('[data-title]');
  const description = find('[data-description]');
  const depth = find('[data-depth]');
  const segments = find('[data-depth-meter]');
  const legend = find('[data-legend]');
  const stageHint = find('[data-stage-hint]');
  const status = find('[data-status]');
  const exit = find<HTMLAnchorElement>('[data-exit]');
  const mode = find<HTMLSelectElement>('[data-scroll-mode]');
  const zoomIn = find<HTMLButtonElement>('[data-zoom-in]');
  const zoomOut = find<HTMLButtonElement>('[data-zoom-out]');
  const magnification = find('[data-magnification]');
  const zoomHint = find('[data-zoom-hint]');

  function makeView({ width, height }: Size): View {
    return { width: Math.max(1, width), height: Math.max(1, height), profile: profileFor({ width, height }) };
  }

  let view = makeView(viewport.getBoundingClientRect());
  let layout = layoutScenes(illustrativeGenix, view.profile);
  let limits = limitsFor(layout, view);
  let restored = restoreNavigation(readSession(), layout, view);
  let anchor = restored.anchor;
  let scroll: ScrollMode = restored.scroll;
  let active: Scene;
  let persistTimer = 0;
  const renderer = new SceneRenderer(world, viewport);
  const motion = new CameraMotion(restored.camera, render);
  updateScrollHint();
  renderer.reset(view.profile);

  function updateScrollHint(): void {
    mode.value = scroll;
    zoomHint.textContent = scroll === 'pan' ? 'Pinch to zoom' : 'Wheel or pinch to zoom';
  }

  function snapshot() {
    return saveNavigation(active, motion.camera, view, anchor, scroll);
  }

  function persist(): void {
    if (!active) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(snapshot()));
    } catch {
      // The explorer remains usable if storage is unavailable.
    }
  }

  function queueSave(): void {
    window.clearTimeout(persistTimer);
    persistTimer = window.setTimeout(persist, 180);
  }

  function updateBreadcrumbs(scene: Scene): void {
    const path = pathTo(scene);
    const entries = [...crumbs.children] as HTMLElement[];
    const wasFocused = crumbs.contains(document.activeElement);
    let firstNew = 0;
    while (firstNew < path.length && entries[firstNew]?.dataset.crumb === path[firstNew].spec.id) firstNew += 1;
    entries.slice(firstNew).forEach((item) => item.remove());

    path.forEach(({ spec }, index) => {
      let button = entries[index]?.querySelector('button');
      if (index >= firstNew || !button) {
        const item = document.createElement('li');
        item.dataset.crumb = spec.id;
        button = document.createElement('button');
        button.type = 'button';
        button.dataset.go = spec.id;
        button.textContent = index === 0 ? 'Overview' : spec.title;
        item.append(button);
        crumbs.append(item);
      }
      if (index === path.length - 1) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    });
    crumbs.scrollLeft = crumbs.scrollWidth;
    if (wasFocused && !crumbs.contains(document.activeElement)) {
      crumbs.querySelector<HTMLElement>('[aria-current="location"]')?.focus({ preventScroll: true });
    }
  }

  function updateContext(scene: Scene): void {
    const { spec } = scene;
    const level = levels.indexOf(spec.level) + 1;
    heading.textContent = spec.title;
    root.style.setProperty('--gx-title-length', String(Math.max(10, spec.title.length)));
    description.textContent = spec.kind === 'detail' ? '' : spec.description;
    depth.textContent = String(level).padStart(2, '0');
    segments.setAttribute('aria-label', `Depth ${level} of ${levels.length}`);
    Array.from(segments.children).forEach((segment, index) => {
      segment.toggleAttribute('data-reached', index < level);
    });
    legend.textContent = spec.kind === 'diagram' ? spec.legend
      : spec.kind === 'source' ? 'C# source' : spec.sample ? 'Statement detail' : 'Operation detail';
    stageHint.textContent = spec.kind === 'diagram' ? 'Select a region or zoom into it'
      : spec.kind === 'source' ? 'Select a marked line to inspect it' : 'Zoom out to retrace the path';
    root.dataset.activeScene = spec.id;
    status.textContent = `${spec.title}. Depth ${level} of ${levels.length}. ${spec.description}`;
    updateBreadcrumbs(scene);
  }

  function render(camera: Camera): void {
    const scene = sceneAt(layout, camera, view, anchor);
    if (active !== scene) {
      active = scene;
      updateContext(scene);
    }
    renderer.render(layout, camera, view, scene);
    const ratio = camera.zoom / cameraFor(layout.root, view).zoom;
    const formatted = `${ratio.toFixed(ratio >= 100 ? 0 : 1)}×`;
    if (magnification.textContent !== formatted) magnification.textContent = formatted;
    zoomIn.setAttribute('aria-disabled', String(camera.zoom >= zoomLimitAt(layout, camera, view, viewportCenter(view)) * 0.9999));
    zoomOut.setAttribute('aria-disabled', String(camera.zoom <= limits.min * 1.0001));
    queueSave();
  }

  function go(scene: Scene): void {
    anchor = viewportCenter(view);
    motion.flyTo(cameraFor(scene, view), reducedMotion.matches);
  }

  function pan(delta: Point): void {
    anchor = viewportCenter(view);
    motion.set(panCamera(motion.camera, delta, view, limits));
  }

  function usableZoom(factor: number, point: Point, base: number): number {
    const max = Math.max(motion.camera.zoom, zoomLimitAt(layout, motion.camera, view, point));
    return clamp(base * factor, limits.min, max);
  }

  function zoom(factor: number, point: Point): void {
    anchor = point;
    const target = usableZoom(factor, point, motion.targetZoom);
    motion.zoomTo(target, point, view, limits, reducedMotion.matches);
  }

  bindInput(viewport, {
    getScrollMode: () => scroll,
    stop: () => motion.stop(),
    pan,
    zoom,
    pinch(factor, previous, next) {
      const camera = motion.camera;
      const scaled = zoomCamera(camera, usableZoom(factor, previous, camera.zoom), previous, view, limits);
      anchor = next;
      motion.set(panCamera(scaled, { x: next.x - previous.x, y: next.y - previous.y }, view, limits));
    },
    enter() {
      if (active.spec.kind !== 'detail') {
        const next = layout.scenes.get(active.spec.preferred);
        if (next) go(next);
      }
    },
    overview: () => go(layout.root),
    parent: () => go(active.parent ?? layout.root),
    exit: () => exit.click(),
  });

  root.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-open], [data-go], [data-reset]');
    if (!button) return;
    const id = button.dataset.open ?? button.dataset.go ?? layout.root.spec.id;
    const scene = layout.scenes.get(id);
    if (scene) go(scene);
  });
  zoomIn.addEventListener('click', () => {
    if (zoomIn.getAttribute('aria-disabled') !== 'true') zoom(1.46, viewportCenter(view));
  });
  zoomOut.addEventListener('click', () => {
    if (zoomOut.getAttribute('aria-disabled') !== 'true') zoom(1 / 1.46, viewportCenter(view));
  });
  mode.addEventListener('change', () => {
    scroll = scrollMode(mode.value);
    updateScrollHint();
    persist();
  });
  window.addEventListener('pagehide', persist);

  new ResizeObserver(([entry]) => {
    const next = makeView(entry.contentRect);
    if (!entry.contentRect.width || !entry.contentRect.height) return;
    if (Math.abs(view.width - next.width) < 0.5 && Math.abs(view.height - next.height) < 0.5) return;
    const saved = snapshot();
    if (next.profile !== view.profile) {
      layout = layoutScenes(illustrativeGenix, next.profile);
      renderer.reset(next.profile);
    }
    view = next;
    limits = limitsFor(layout, view);
    restored = restoreNavigation(saved, layout, view);
    anchor = restored.anchor;
    motion.set(restored.camera);
  }).observe(viewport);

  render(motion.camera);
  root.dataset.ready = '';
}

const explorer = document.querySelector<HTMLElement>('[data-genix-explorer]');
if (explorer) startExplorer(explorer);
