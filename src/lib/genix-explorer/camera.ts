export type Point = Readonly<{ x: number; y: number }>;
export type Size = Readonly<{ width: number; height: number }>;
export type Rect = Readonly<Point & Size>;
export type Camera = Readonly<{ center: Point; zoom: number }>;
export type CameraLimits = Readonly<{ world: Rect; min: number; max: number }>;

export const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
export const centerOf = (rect: Rect): Point => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
export const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const viewportCenter = ({ width, height }: Size): Point => ({ x: width / 2, y: height / 2 });

export function contains(rect: Rect, point: Point): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width
    && point.y >= rect.y && point.y <= rect.y + rect.height;
}

export function overlap(a: Rect, b: Rect): number {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return Math.max(0, width) * Math.max(0, height);
}

export function screenToWorld(point: Point, camera: Camera, size: Size): Point {
  return {
    x: camera.center.x + (point.x - size.width / 2) / camera.zoom,
    y: camera.center.y + (point.y - size.height / 2) / camera.zoom,
  };
}

export function worldToScreen(point: Point, camera: Camera, size: Size): Point {
  return {
    x: (point.x - camera.center.x) * camera.zoom + size.width / 2,
    y: (point.y - camera.center.y) * camera.zoom + size.height / 2,
  };
}

export function visibleWorld(camera: Camera, size: Size): Rect {
  return {
    ...screenToWorld({ x: 0, y: 0 }, camera, size),
    width: size.width / camera.zoom,
    height: size.height / camera.zoom,
  };
}

function centerBounds(world: Rect, size: Size, zoom: number): Rect {
  // Leave a portion of the map in reach when the user drags beyond an edge.
  const x = size.width * 0.28 / zoom;
  const y = size.height * 0.28 / zoom;
  return { x: world.x - x, y: world.y - y, width: world.width + 2 * x, height: world.height + 2 * y };
}

export function constrainCamera(camera: Camera, size: Size, limits: CameraLimits): Camera {
  const zoom = clamp(camera.zoom, limits.min, limits.max);
  const bounds = centerBounds(limits.world, size, zoom);
  return {
    zoom,
    center: {
      x: clamp(camera.center.x, bounds.x, bounds.x + bounds.width),
      y: clamp(camera.center.y, bounds.y, bounds.y + bounds.height),
    },
  };
}

export function panCamera(camera: Camera, delta: Point, size: Size, limits: CameraLimits): Camera {
  return constrainCamera({
    ...camera,
    center: { x: camera.center.x - delta.x / camera.zoom, y: camera.center.y - delta.y / camera.zoom },
  }, size, limits);
}

export function zoomCamera(
  camera: Camera, target: number, anchor: Point, size: Size, limits: CameraLimits,
): Camera {
  const zoom = clamp(target, limits.min, limits.max);
  const pivot = screenToWorld(anchor, camera, size);
  const candidateAt = (scale: number): Camera => ({
    zoom: scale,
    center: {
      x: pivot.x - (anchor.x - size.width / 2) / scale,
      y: pivot.y - (anchor.y - size.height / 2) / scale,
    },
  });

  const candidate = candidateAt(zoom);
  if (contains(centerBounds(limits.world, size, zoom), candidate.center)) return candidate;

  // At a bound, stop the zoom at the last valid scale to preserve the anchor.
  let accepted = camera;
  let low = 0;
  let high = 1;
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const fraction = (low + high) / 2;
    const step = candidateAt(camera.zoom + (zoom - camera.zoom) * fraction);
    if (contains(centerBounds(limits.world, size, step.zoom), step.center)) {
      accepted = step;
      low = fraction;
    } else {
      high = fraction;
    }
  }
  return accepted;
}

export function interpolateCamera(from: Camera, to: Camera, progress: number): Camera {
  if (progress <= 0) return from;
  if (progress >= 1) return to;
  const zoom = from.zoom * (to.zoom / from.zoom) ** progress;
  // A shared world point follows a straight screen trajectory as scale changes.
  const inverseSpan = 1 / to.zoom - 1 / from.zoom;
  const travel = Math.abs(inverseSpan) < 1e-12 ? progress : (1 / zoom - 1 / from.zoom) / inverseSpan;
  return {
    zoom,
    center: {
      x: from.center.x + (to.center.x - from.center.x) * travel,
      y: from.center.y + (to.center.y - from.center.y) * travel,
    },
  };
}
