import { distance, midpoint, viewportCenter, type Point } from './camera.ts';
import type { ScrollMode } from './navigation.ts';

interface Controls {
  getScrollMode: () => ScrollMode;
  stop: () => void;
  pan: (delta: Point) => void;
  zoom: (factor: number, anchor: Point) => void;
  pinch: (factor: number, previous: Point, next: Point) => void;
  enter: () => void;
  overview: () => void;
  parent: () => void;
  exit: () => void;
}

interface Drag {
  id: number;
  origin: Point;
  last: Point;
  moved: boolean;
  touch: boolean;
}

interface SafariGesture extends Event {
  scale: number;
  clientX?: number;
  clientY?: number;
}

const interactive = 'a, button, input, select, textarea, [contenteditable]';

function wheelIntent(event: WheelEvent, mode: ScrollMode): 'pan' | 'zoom' {
  if (event.ctrlKey) return 'zoom';
  if (mode !== 'auto') return mode;
  if (event.shiftKey) return 'pan';
  const looksLikeTrackpad = event.deltaMode === 0
    && (event.deltaX !== 0 || Math.abs(event.deltaY) < 34 || !Number.isInteger(event.deltaY));
  return looksLikeTrackpad ? 'pan' : 'zoom';
}

export function bindInput(viewport: HTMLElement, controls: Controls): void {
  const touches = new Map<number, Point>();
  let drag: Drag | undefined;
  let space = false;
  let spaceDragged = false;
  let suppressClick = false;
  let suppressTimer = 0;
  let gestureScale: number | undefined;

  const local = (point: { clientX: number; clientY: number }): Point => {
    const box = viewport.getBoundingClientRect();
    return { x: point.clientX - box.left, y: point.clientY - box.top };
  };

  const center = () => viewportCenter(viewport.getBoundingClientRect());
  const delta = (from: Point, to: Point): Point => ({ x: to.x - from.x, y: to.y - from.y });

  const capture = (id: number) => {
    if (!viewport.hasPointerCapture(id)) viewport.setPointerCapture(id);
  };

  const blockClick = () => {
    suppressClick = true;
    window.clearTimeout(suppressTimer);
    suppressTimer = window.setTimeout(() => { suppressClick = false; }, 450);
  };

  viewport.addEventListener('click', (event) => {
    if (!suppressClick || event.detail === 0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClick = false;
  }, { capture: true });

  viewport.addEventListener('wheel', (event) => {
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    const x = event.deltaX * unit;
    const y = event.deltaY * unit;
    event.preventDefault();
    if (gestureScale !== undefined && event.ctrlKey) return;
    if (wheelIntent(event, controls.getScrollMode()) === 'pan') {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && viewport.contains(selection.anchorNode)) return;
      controls.pan(event.shiftKey && x === 0 ? { x: -y, y: 0 } : { x: -x, y: -y });
    } else {
      controls.zoom(Math.exp(-y * (event.ctrlKey ? 0.013 : 0.0021)), local(event));
    }
  }, { passive: false });

  viewport.addEventListener('pointerdown', (event) => {
    const target = event.target as Element;
    const point = local(event);
    const touch = event.pointerType === 'touch';
    const selectable = target.closest('[data-selectable]');
    suppressClick = false;

    if (touch) {
      if (touches.size >= 2) return;
      touches.set(event.pointerId, point);
      if (touches.size === 2) {
        controls.stop();
        drag = undefined;
        for (const id of touches.keys()) capture(id);
        viewport.dataset.dragging = '';
        return;
      }
      if (selectable) return;
    } else {
      const canDrag = event.button === 1 || (event.button === 0 && (space || !target.closest(`${interactive}, [data-selectable]`)));
      if (!canDrag || drag) return;
      event.preventDefault();
      viewport.focus({ preventScroll: true });
    }

    controls.stop();
    drag = { id: event.pointerId, origin: point, last: point, moved: false, touch };
  });

  viewport.addEventListener('pointermove', (event) => {
    const point = local(event);
    if (touches.has(event.pointerId)) {
      const before = [...touches.values()];
      touches.set(event.pointerId, point);
      if (before.length === 2) {
        const [a, b] = before;
        const [nextA, nextB] = touches.values();
        const separation = Math.max(8, distance(a, b));
        controls.pinch(Math.max(8, distance(nextA, nextB)) / separation, midpoint(a, b), midpoint(nextA, nextB));
        return;
      }
    }
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.moved && distance(drag.origin, point) < 4) return;
    drag.moved = true;
    if (space) spaceDragged = true;
    capture(event.pointerId);
    viewport.dataset.dragging = '';
    controls.pan(delta(drag.last, point));
    drag.last = point;
  });

  const endPointer = (event: PointerEvent) => {
    const wasPinch = touches.size === 2 && touches.has(event.pointerId);
    touches.delete(event.pointerId);
    if (drag?.id === event.pointerId) {
      if (drag.moved) blockClick();
      drag = undefined;
    }
    if (wasPinch) {
      blockClick();
      const [remaining] = touches.entries();
      if (remaining) drag = { id: remaining[0], origin: remaining[1], last: remaining[1], moved: true, touch: true };
    }
    if (!drag && touches.size < 2) delete viewport.dataset.dragging;
  };

  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);
  viewport.addEventListener('lostpointercapture', (event) => {
    // Touch starts with implicit capture on the pressed tile. Ignore the event
    // bubbling from that tile when capture is transferred to the viewport.
    if (event.target === viewport) endPointer(event);
  });
  viewport.addEventListener('pointerleave', () => {
    if (drag && !drag.touch && !drag.moved) drag = undefined;
  });
  viewport.addEventListener('auxclick', (event) => {
    if (event.button === 1) event.preventDefault();
  });

  // Safari may deliver trackpad pinches as GestureEvents instead of Ctrl+wheel.
  viewport.addEventListener('gesturestart', (event) => {
    event.preventDefault();
    if (!touches.size) {
      controls.stop();
      gestureScale = 1;
    }
  });
  viewport.addEventListener('gesturechange', (event) => {
    event.preventDefault();
    const { scale, clientX, clientY } = event as SafariGesture;
    if (gestureScale === undefined || !Number.isFinite(scale) || scale <= 0) return;
    const anchor = clientX !== undefined && clientY !== undefined ? local({ clientX, clientY }) : center();
    controls.zoom(scale / gestureScale, anchor);
    gestureScale = scale;
  });
  viewport.addEventListener('gestureend', (event) => {
    event.preventDefault();
    gestureScale = undefined;
  });

  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      controls.exit();
      return;
    }
    const target = event.target as Element;
    if (event.code === 'Space' && !target.closest('input, select, textarea, [contenteditable]')) {
      space = true;
      if (target === viewport || target === document.body) event.preventDefault();
      viewport.dataset.space = '';
    }
    if (!viewport.contains(target) || event.ctrlKey || event.metaKey || event.altKey) return;
    const step = event.shiftKey ? 120 : 48;
    switch (event.key) {
      case 'ArrowLeft': controls.pan({ x: step, y: 0 }); break;
      case 'ArrowRight': controls.pan({ x: -step, y: 0 }); break;
      case 'ArrowUp': controls.pan({ x: 0, y: step }); break;
      case 'ArrowDown': controls.pan({ x: 0, y: -step }); break;
      case '+':
      case '=': controls.zoom(1.46, center()); break;
      case '-':
      case '_': controls.zoom(1 / 1.46, center()); break;
      case '0':
      case 'Home': controls.overview(); break;
      case 'Backspace': controls.parent(); break;
      case 'Enter':
        if (target !== viewport) return;
        controls.enter();
        break;
      default: return;
    }
    event.preventDefault();
  });

  window.addEventListener('keyup', (event) => {
    if (event.code !== 'Space') return;
    if (spaceDragged) event.preventDefault();
    spaceDragged = false;
    space = false;
    delete viewport.dataset.space;
  });

  window.addEventListener('blur', () => {
    space = false;
    spaceDragged = false;
    gestureScale = undefined;
    drag = undefined;
    touches.clear();
    delete viewport.dataset.space;
    delete viewport.dataset.dragging;
  });
}
