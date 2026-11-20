import {
  centerOf, clamp, constrainCamera, contains, overlap, screenToWorld, visibleWorld, viewportCenter,
  type Camera, type CameraLimits, type Point, type Rect, type Size,
} from './camera.ts';
import { sceneSize, sourceRow, type Profile, type SceneSpec } from './model.ts';

export interface Portal {
  scene: Scene;
  local: Rect;
  bounds: Rect;
  caption: string;
  featured: boolean;
}

export interface Scene {
  spec: SceneSpec;
  parent?: Scene;
  frame: Rect;
  unit: number;
  portals: Portal[];
}

export interface SceneLayout {
  root: Scene;
  scenes: ReadonlyMap<string, Scene>;
  profile: Profile;
}

export interface View extends Size {
  profile: Profile;
}

export function profileFor(size: Size): Profile {
  return size.width < 620 || (size.width < 920 && size.height > size.width * 0.86) ? 'compact' : 'wide';
}

export function layoutScenes(spec: SceneSpec, profile: Profile): SceneLayout {
  const scenes = new Map<string, Scene>();

  function build(node: SceneSpec, frame: Rect, unit: number, parent?: Scene): Scene {
    const scene: Scene = { spec: node, parent, frame, unit, portals: [] };
    scenes.set(node.id, scene);
    const add = (child: SceneSpec, local: Rect, caption: string, featured = false) => {
      const bounds = {
        x: frame.x + local.x * unit, y: frame.y + local.y * unit,
        width: local.width * unit, height: local.height * unit,
      };
      const size = sceneSize(child, profile);
      const scale = Math.min(bounds.width / size.width, bounds.height / size.height) * 0.95;
      const center = centerOf(bounds);
      const childFrame = {
        x: center.x - size.width * scale / 2,
        y: center.y - size.height * scale / 2,
        width: size.width * scale,
        height: size.height * scale,
      };
      scene.portals.push({ scene: build(child, childFrame, scale, scene), local, bounds, caption, featured });
    };

    if (node.kind === 'diagram') {
      for (const region of node.regions) add(region.scene, region.bounds[profile], region.caption, region.featured);
    } else if (node.kind === 'source') {
      node.lines.forEach(({ statement }, index) => {
        if (statement) add(statement, sourceRow(index, profile), statement.label);
      });
    }
    return scene;
  }

  const root = build(spec, { x: 0, y: 0, ...sceneSize(spec, profile) }, 1);
  return { root, scenes, profile };
}

export function cameraFor(scene: Scene, view: View): Camera {
  const compact = view.profile === 'compact';
  return {
    center: centerOf(scene.frame),
    zoom: Math.min(
      view.width * (compact ? 0.945 : 0.89) / scene.frame.width,
      view.height * (compact ? 0.85 : 0.79) / scene.frame.height,
    ),
  };
}

export function limitsFor(layout: SceneLayout, view: View): CameraLimits {
  return {
    world: layout.root.frame,
    min: cameraFor(layout.root, view).zoom * 0.73,
    max: Math.max(...Array.from(layout.scenes.values(), (scene) => cameraFor(scene, view).zoom * 1.3)),
  };
}

export function smoothstep(value: number, start: number, end: number): number {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

export function revealProgress(scene: Scene, zoom: number, view: View): number {
  return scene.parent ? smoothstep(zoom / cameraFor(scene, view).zoom, 0.42, 0.93) : 1;
}

export function pathTo(scene: Scene): Scene[] {
  const path = [scene];
  let parent = scene.parent;
  while (parent) {
    path.unshift(parent);
    parent = parent.parent;
  }
  return path;
}

export function sceneAt(layout: SceneLayout, camera: Camera, view: View, anchor?: Point): Scene {
  const focus = screenToWorld(anchor ?? viewportCenter(view), camera, view);
  const visible = visibleWorld(camera, view);
  let scene = layout.root;

  // Favor the area the visitor is pointing at. Panning and keyboard navigation
  // use the center, with a fallback for a region that fills much of the screen.
  while (scene.portals.length) {
    let best: Scene | undefined;
    let bestScore = 0;
    for (const portal of scene.portals) {
      if (revealProgress(portal.scene, camera.zoom, view) < 0.52) continue;
      const occupied = overlap(visible, portal.scene.frame);
      const visibleFraction = occupied / (visible.width * visible.height);
      const seen = occupied / (portal.scene.frame.width * portal.scene.frame.height);
      const pointsAtRegion = seen > 0.08 && contains(portal.bounds, focus);
      const fillsScreen = visibleFraction > 0.2;
      if (!pointsAtRegion && !fillsScreen) continue;
      const score = Number(pointsAtRegion) + visibleFraction;
      if (score > bestScore) {
        best = portal.scene;
        bestScore = score;
      }
    }
    if (!best) break;
    scene = best;
  }
  return scene;
}

export function zoomLimitAt(layout: SceneLayout, camera: Camera, view: View, anchor: Point): number {
  const point = screenToWorld(anchor, camera, view);
  let scene = layout.root;
  while (true) {
    const portal = scene.portals.find(({ bounds }) => contains(bounds, point));
    if (!portal) return cameraFor(scene, view).zoom * 1.3;
    scene = portal.scene;
  }
}

export type ScrollMode = 'auto' | 'pan' | 'zoom';

export function scrollMode(value: unknown): ScrollMode {
  return value === 'pan' || value === 'zoom' ? value : 'auto';
}

export interface NavigationState {
  version: 1;
  scene: string;
  u: number;
  v: number;
  scale: number;
  anchor: Point;
  scroll: ScrollMode;
}

export function saveNavigation(
  scene: Scene, camera: Camera, view: View, anchor: Point, scroll: ScrollMode,
): NavigationState {
  return {
    version: 1,
    scene: scene.spec.id,
    u: (camera.center.x - scene.frame.x) / scene.frame.width,
    v: (camera.center.y - scene.frame.y) / scene.frame.height,
    scale: camera.zoom / cameraFor(scene, view).zoom,
    anchor: { x: anchor.x / view.width, y: anchor.y / view.height },
    scroll,
  };
}

function isNavigationState(value: unknown): value is NavigationState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<NavigationState>;
  return candidate.version === 1 && typeof candidate.scene === 'string'
    && Number.isFinite(candidate.u) && Number.isFinite(candidate.v)
    && Number.isFinite(candidate.scale) && (candidate.scale ?? 0) > 0
    && Number.isFinite(candidate.anchor?.x) && Number.isFinite(candidate.anchor?.y);
}

export function restoreNavigation(value: unknown, layout: SceneLayout, view: View): {
  camera: Camera;
  anchor: Point;
  scroll: ScrollMode;
} {
  const fallback = { camera: cameraFor(layout.root, view), anchor: viewportCenter(view), scroll: 'auto' as const };
  if (!isNavigationState(value)) return fallback;
  const scene = layout.scenes.get(value.scene);
  if (!scene) return fallback;

  const home = cameraFor(scene, view);
  const camera = constrainCamera({
    center: { x: scene.frame.x + value.u * scene.frame.width, y: scene.frame.y + value.v * scene.frame.height },
    zoom: value.scale * home.zoom,
  }, view, limitsFor(layout, view));
  const anchor = {
    x: clamp(value.anchor.x, 0, 1) * view.width,
    y: clamp(value.anchor.y, 0, 1) * view.height,
  };
  // When a portrait reflow alters what the offset shows, keep the semantic stop.
  if (sceneAt(layout, camera, view, anchor) !== scene) {
    return { camera: home, anchor: viewportCenter(view), scroll: scrollMode(value.scroll) };
  }
  return { camera, anchor, scroll: scrollMode(value.scroll) };
}
