/**
 * The "Work in progress" board: a pannable canvas of cards with inertia,
 * a dot grid that moves with it, a minimap and a cursor hint.
 */

const GRID = 26;
const FRICTION = .92;

export class Board {
  private world: HTMLElement;
  private grid: HTMLElement;
  private hint: HTMLElement;
  private mapWorld: HTMLElement;
  private mapView: HTMLElement;
  private minimap: HTMLElement;
  private cards: HTMLElement[];
  private pos = { x: 0, y: 0 };
  private vel = { x: 0, y: 0 };
  private bounds = { x0: 0, y0: 0, x1: 0, y1: 0 };
  private map = { scale: 1, ox: 0, oy: 0 };
  private drag?: { id: number; x: number; y: number; t: number; moved: number };
  private raf = 0;
  private glide?: { x: number; y: number };
  private suppressClick = false;
  private placed = false;

  constructor(private root: HTMLElement, private onLightbox: (src: string, alt: string) => void) {
    this.world = root.querySelector('[data-board-world]')!;
    this.grid = root.querySelector('[data-board-grid]')!;
    this.hint = root.querySelector('[data-cursor-hint]')!;
    this.minimap = root.querySelector('[data-minimap]')!;
    this.mapWorld = root.querySelector('[data-minimap-world]')!;
    this.mapView = root.querySelector('[data-minimap-view]')!;
    this.cards = [...root.querySelectorAll<HTMLElement>('[data-card]')];
    this.cards.forEach((card, i) => card.style.setProperty('--i', String(i)));
    this.bind();
  }

  /** Measure cards and centre the view on them the first time the board opens. */
  prepare() {
    // Shrink the layout on smaller screens so a few cards fit at once.
    this.root.style.setProperty('--k', String(Math.min(1, Math.max(.6, innerWidth / 1500))));
    const rects = this.cards.map((card) => ({ x: card.offsetLeft, y: card.offsetTop, w: card.offsetWidth, h: card.offsetHeight }));
    const x0 = Math.min(...rects.map((r) => r.x));
    const y0 = Math.min(...rects.map((r) => r.y));
    const x1 = Math.max(...rects.map((r) => r.x + r.w));
    const y1 = Math.max(...rects.map((r) => r.y + r.h));
    this.bounds = { x0, y0, x1, y1 };
    if (!this.placed) {
      this.pos = { x: -(x0 + x1) / 2, y: -(y0 + y1) / 2 };
      this.placed = true;
    }

    const pad = 8;
    const mw = this.minimap.clientWidth - pad * 2;
    const mh = this.minimap.clientHeight - pad * 2;
    const scale = Math.min(mw / (x1 - x0), mh / (y1 - y0));
    const ox = pad + (mw - (x1 - x0) * scale) / 2;
    const oy = pad + (mh - (y1 - y0) * scale) / 2;
    this.map = { scale, ox, oy };
    this.mapWorld.replaceChildren(...rects.map((r) => {
      const span = document.createElement('span');
      Object.assign(span.style, {
        left: `${ox + (r.x - x0) * scale}px`, top: `${oy + (r.y - y0) * scale}px`,
        width: `${r.w * scale}px`, height: `${r.h * scale}px`,
      });
      return span;
    }));
    this.render();
  }

  private clamp() {
    const { x0, y0, x1, y1 } = this.bounds;
    const mx = innerWidth * .35;
    const my = innerHeight * .35;
    this.pos.x = Math.min(Math.max(this.pos.x, -x1 - innerWidth / 2 + mx), -x0 + innerWidth / 2 - mx);
    this.pos.y = Math.min(Math.max(this.pos.y, -y1 - innerHeight / 2 + my), -y0 + innerHeight / 2 - my);
  }

  private render() {
    this.clamp();
    const { x, y } = this.pos;
    this.world.style.setProperty('--px', `${x}px`);
    this.world.style.setProperty('--py', `${y}px`);
    const gx = ((innerWidth / 2 + x) % GRID + GRID) % GRID;
    const gy = ((innerHeight / 2 + y) % GRID + GRID) % GRID;
    this.grid.style.setProperty('--gx', `${gx}px`);
    this.grid.style.setProperty('--gy', `${gy}px`);

    const { scale, ox, oy } = this.map;
    const { x0, y0 } = this.bounds;
    const left = -x - innerWidth / 2;
    const top = -y - innerHeight / 2;
    Object.assign(this.mapView.style, {
      left: `${ox + (left - x0) * scale}px`, top: `${oy + (top - y0) * scale}px`,
      width: `${innerWidth * scale}px`, height: `${innerHeight * scale}px`,
    });
  }

  private tick = () => {
    if (this.glide) {
      this.pos.x += (this.glide.x - this.pos.x) * .14;
      this.pos.y += (this.glide.y - this.pos.y) * .14;
      if (Math.hypot(this.glide.x - this.pos.x, this.glide.y - this.pos.y) < .5) this.glide = undefined;
    } else {
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
      this.vel.x *= FRICTION;
      this.vel.y *= FRICTION;
    }
    this.render();
    if (this.glide || Math.hypot(this.vel.x, this.vel.y) > .1) this.raf = requestAnimationFrame(this.tick);
    else this.raf = 0;
  };

  private kick() {
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
  }

  private bind() {
    const root = this.root;

    root.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || (event.target as Element).closest('a, button, [data-minimap]')) return;
      this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, t: performance.now(), moved: 0 };
      this.vel = { x: 0, y: 0 };
      this.glide = undefined;
      root.setPointerCapture(event.pointerId);
      root.classList.add('is-dragging');
    });

    root.addEventListener('pointermove', (event) => {
      this.hint.style.setProperty('--cx', `${event.clientX}px`);
      this.hint.style.setProperty('--cy', `${event.clientY}px`);
      const overUi = (event.target as Element).closest('a, button, [data-minimap]');
      root.classList.toggle('show-hint', !overUi && event.pointerType === 'mouse');
      if (!this.drag || event.pointerId !== this.drag.id) return;
      const now = performance.now();
      const dx = event.clientX - this.drag.x;
      const dy = event.clientY - this.drag.y;
      const dt = Math.max(now - this.drag.t, 1);
      this.pos.x += dx;
      this.pos.y += dy;
      this.vel = { x: dx / dt * 16, y: dy / dt * 16 };
      this.drag = { ...this.drag, x: event.clientX, y: event.clientY, t: now, moved: this.drag.moved + Math.abs(dx) + Math.abs(dy) };
      this.render();
    });

    const end = (event: PointerEvent) => {
      if (!this.drag || event.pointerId !== this.drag.id) return;
      this.suppressClick = this.drag.moved > 6;
      if (performance.now() - this.drag.t > 80) this.vel = { x: 0, y: 0 };
      this.drag = undefined;
      root.classList.remove('is-dragging');
      this.kick();
    };
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', end);
    root.addEventListener('pointerleave', () => root.classList.remove('show-hint'));

    root.addEventListener('click', (event) => {
      if (this.suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        this.suppressClick = false;
        return;
      }
      const expand = (event.target as Element).closest<HTMLElement>('[data-expand]');
      if (expand) this.onLightbox(expand.dataset.expand!, expand.dataset.alt || '');
    }, true);

    root.addEventListener('wheel', (event) => {
      event.preventDefault();
      if (event.ctrlKey) return;
      this.glide = undefined;
      this.vel = { x: 0, y: 0 };
      this.pos.x -= event.deltaX;
      this.pos.y -= event.deltaY;
      this.render();
    }, { passive: false });

    root.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 240 : 90;
      const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      this.glide = { x: (this.glide?.x ?? this.pos.x) + move[0], y: (this.glide?.y ?? this.pos.y) + move[1] };
      this.kick();
    });

    const jump = (event: PointerEvent) => {
      const rect = this.minimap.getBoundingClientRect();
      const { scale, ox, oy } = this.map;
      const wx = (event.clientX - rect.left - ox) / scale + this.bounds.x0;
      const wy = (event.clientY - rect.top - oy) / scale + this.bounds.y0;
      this.glide = { x: -wx, y: -wy };
      this.vel = { x: 0, y: 0 };
      this.kick();
    };
    this.minimap.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      this.minimap.setPointerCapture(event.pointerId);
      jump(event);
    });
    this.minimap.addEventListener('pointermove', (event) => {
      if (this.minimap.hasPointerCapture(event.pointerId)) jump(event);
    });

    addEventListener('resize', () => {
      if (this.placed) this.prepare();
    });
  }
}
