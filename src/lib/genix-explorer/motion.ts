import { interpolateCamera, zoomCamera, type Camera, type CameraLimits, type Point, type Size } from './camera.ts';

interface ZoomMotion {
  target: number;
  anchor: Point;
  size: Size;
  limits: CameraLimits;
}

interface Flight {
  from: Camera;
  to: Camera;
  started: number;
  duration: number;
}

export class CameraMotion {
  private frame = 0;
  private last = 0;
  private zoom?: ZoomMotion;
  private flight?: Flight;

  constructor(public camera: Camera, private onChange: (camera: Camera) => void) {}

  get targetZoom(): number {
    return this.zoom?.target ?? this.camera.zoom;
  }

  stop(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.last = 0;
    this.zoom = undefined;
    this.flight = undefined;
  }

  set(camera: Camera): void {
    this.stop();
    this.update(camera);
  }

  zoomTo(target: number, anchor: Point, size: Size, limits: CameraLimits, immediate: boolean): void {
    if (immediate) {
      this.set(zoomCamera(this.camera, target, anchor, size, limits));
      return;
    }
    this.flight = undefined;
    this.zoom = { target, anchor, size, limits };
    this.schedule();
  }

  flyTo(to: Camera, immediate: boolean): void {
    this.stop();
    if (immediate) {
      this.update(to);
      return;
    }
    const from = this.camera;
    const span = Math.abs(Math.log2(to.zoom / from.zoom));
    this.flight = { from, to, started: performance.now(), duration: Math.min(1000, 440 + span * 95) };
    this.schedule();
  }

  private update(camera: Camera): void {
    this.camera = camera;
    this.onChange(camera);
  }

  private schedule(): void {
    if (!this.frame) this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.frame = 0;
    if (this.flight) {
      const { from, to, started, duration } = this.flight;
      const t = Math.min(1, (now - started) / duration);
      this.update(interpolateCamera(from, to, t * t * (3 - 2 * t)));
      if (t >= 1) this.flight = undefined;
    } else if (this.zoom) {
      const { target, anchor, size, limits } = this.zoom;
      const elapsed = this.last ? Math.min(50, now - this.last) : 16;
      const logDelta = Math.log(target / this.camera.zoom);
      const settled = Math.abs(logDelta) < 0.0012;
      const step = settled ? target : this.camera.zoom * Math.exp(logDelta * (1 - Math.exp(-elapsed / 63)));
      const next = zoomCamera(this.camera, step, anchor, size, limits);
      if (settled || Math.abs(Math.log(next.zoom / this.camera.zoom)) < 1e-8) this.zoom = undefined;
      this.update(next);
    }
    this.last = now;
    if (this.flight || this.zoom) this.schedule();
    else this.last = 0;
  };
}
