/**
 * Motion system. Everything here is progressive: without JS the site is a set of
 * plain links, and with reduced motion only the drawer and reel stay (without animation).
 *
 * - Tilt cards: pointer-driven 3D tilt with inner parallax ("kinesis" feel)
 * - Ripple: material-style ink on press
 * - Logo: slot-machine reel through the domain suffixes
 * - Reel: cross-fading preview tile on the homepage
 * - Drawer: side navigation with blurred curtain
 * - Veil + page transitions: cards scale in on load and out before navigation
 */

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const EASE_MS = 531;

/* ---------------------------------------------------------------- veil + entry */

function reveal() {
  root.classList.add('is-ready');
  if ('veil' in root.dataset) {
    window.setTimeout(() => {
      delete root.dataset.veil;
    }, 900);
  }
}

if (document.readyState === 'complete') reveal();
else window.addEventListener('load', reveal, { once: true });
// Never keep the page hidden on slow image loads.
window.setTimeout(reveal, 2200);

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    root.classList.remove('is-leaving');
    root.classList.add('is-ready');
  }
});

/* ---------------------------------------------------------------- tilt cards */

function bindTilt(card: HTMLElement) {
  const tilt = card.querySelector<HTMLElement>('.card-tilt');
  if (!tilt) return;
  const strength = Number(card.dataset.tilt || 8);
  const layers = [...card.querySelectorAll<HTMLElement>('[data-parallax]')];
  let frame = 0;

  const apply = (x: number, y: number, active: boolean) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      // x,y in -0.5..0.5 relative to the card centre.
      tilt.style.transform = active
        ? `rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength).toFixed(2)}deg)`
        : '';
      for (const layer of layers) {
        const depth = Number(layer.dataset.parallax || 10);
        layer.style.transform = active
          ? `translate3d(${(-x * depth).toFixed(2)}px, ${(-y * depth).toFixed(2)}px, 0) scale(var(--hover-scale, 1.12))`
          : '';
      }
      card.classList.toggle('is-tilting', active);
    });
  };

  card.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || reduceMotion.matches) return;
    const rect = card.getBoundingClientRect();
    apply((event.clientX - rect.left) / rect.width - 0.5, (event.clientY - rect.top) / rect.height - 0.5, true);
  });
  card.addEventListener('pointerleave', () => apply(0, 0, false));
}

/* ---------------------------------------------------------------- ripple */

function bindRipple(card: HTMLElement) {
  const host = card.querySelector<HTMLElement>('.ripple-host');
  if (!host) return;
  card.addEventListener('pointerdown', (event) => {
    if (reduceMotion.matches || event.button !== 0) return;
    const rect = host.getBoundingClientRect();
    const size = Math.hypot(rect.width, rect.height) * 2;
    const ink = document.createElement('span');
    ink.className = 'ripple';
    ink.style.width = ink.style.height = `${size}px`;
    ink.style.left = `${event.clientX - rect.left - size / 2}px`;
    ink.style.top = `${event.clientY - rect.top - size / 2}px`;
    host.append(ink);
    const release = () => {
      ink.classList.add('is-released');
      window.setTimeout(() => ink.remove(), 700);
    };
    window.addEventListener('pointerup', release, { once: true });
    window.addEventListener('pointercancel', release, { once: true });
  });
}

for (const card of document.querySelectorAll<HTMLElement>('[data-tilt]')) {
  bindTilt(card);
  bindRipple(card);
}

/* ---------------------------------------------------------------- logo reel */

function bindLogo(logo: HTMLElement) {
  const reel = logo.querySelector<HTMLElement>('.logo-reel');
  const windowEl = logo.querySelector<HTMLElement>('.logo-window');
  const suffixes = [...logo.querySelectorAll<HTMLElement>('.logo-suffix')];
  if (!reel || !windowEl || suffixes.length < 2) return;

  let index = 0;
  let timer = 0;
  let running = false;

  const show = (i: number, instant = false) => {
    index = i;
    const target = suffixes[i];
    reel.style.transition = instant ? 'none' : '';
    windowEl.style.transition = instant ? 'none' : '';
    reel.style.transform = `translateY(${-target.offsetTop}px)`;
    windowEl.style.width = `${target.offsetWidth}px`;
  };

  const step = () => {
    if (index >= suffixes.length - 1) {
      // The last suffix duplicates the first. Snap back without motion and stop.
      show(0, true);
      running = false;
      return;
    }
    show(index + 1);
    timer = window.setTimeout(step, index === suffixes.length - 1 ? 650 : 900);
  };

  const run = () => {
    if (running || reduceMotion.matches) return;
    running = true;
    timer = window.setTimeout(step, 250);
  };

  show(0, true);
  document.fonts?.ready.then(() => show(index, true));
  logo.addEventListener('pointerenter', run);
  logo.addEventListener('focus', run);
  // Play once shortly after the page settles.
  window.setTimeout(run, 1400);
  window.addEventListener('pagehide', () => window.clearTimeout(timer));
}

document.querySelectorAll<HTMLElement>('[data-logo]').forEach(bindLogo);

/* ---------------------------------------------------------------- preview reel */

function bindReel(reelEl: HTMLElement) {
  const slides = [...reelEl.querySelectorAll<HTMLElement>('.reel-slide')];
  const dots = [...reelEl.querySelectorAll<HTMLElement>('.reel-dots > span')];
  if (slides.length < 2) return;
  let current = 0;
  let timer = 0;
  let paused = false;

  const go = (next: number) => {
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    slides[current].tabIndex = -1;
    dots[current]?.classList.remove('is-active');
    current = (next + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    slides[current].removeAttribute('aria-hidden');
    slides[current].tabIndex = 0;
    dots[current]?.classList.add('is-active');
  };

  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (!paused && !document.hidden) go(current + 1);
      schedule();
    }, 5200);
  };

  const card = reelEl.closest<HTMLElement>('.card') ?? reelEl;
  card.addEventListener('pointerenter', () => (paused = true));
  card.addEventListener('pointerleave', () => (paused = false));
  card.addEventListener('focusin', () => (paused = true));
  card.addEventListener('focusout', () => (paused = false));
  schedule();
}

document.querySelectorAll<HTMLElement>('[data-reel]').forEach(bindReel);

/* ---------------------------------------------------------------- drawer */

const drawer = document.querySelector<HTMLElement>('[data-drawer]');
const openers = [...document.querySelectorAll<HTMLElement>('[data-drawer-open]')];
let lastFocus: HTMLElement | null = null;

function setDrawer(open: boolean) {
  if (!drawer) return;
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  drawer.inert = !open;
  root.classList.toggle('drawer-open', open);
  openers.forEach((btn) => btn.setAttribute('aria-expanded', String(open)));
  if (open) {
    lastFocus = document.activeElement as HTMLElement | null;
    window.setTimeout(() => drawer.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }), 60);
  } else {
    lastFocus?.focus({ preventScroll: true });
  }
}

if (drawer) {
  drawer.inert = true;
  openers.forEach((btn) => btn.addEventListener('click', () => setDrawer(true)));
  drawer.querySelectorAll('[data-drawer-close]').forEach((el) => el.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) setDrawer(false);
  });
  // Opening the drawer from the left screen edge, like a sensor strip.
  document.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || event.clientX > 6 || drawer.classList.contains('is-open')) return;
    root.classList.add('handle-hot');
    window.setTimeout(() => root.classList.remove('handle-hot'), 900);
  });
}

/* ---------------------------------------------------------------- share */

document.querySelectorAll<HTMLButtonElement>('[data-share]').forEach((button) => {
  const label = button.textContent;
  button.addEventListener('click', async () => {
    try {
      if (navigator.share && !finePointer.matches) {
        await navigator.share({ title: document.title, url: location.href });
        return;
      }
      await navigator.clipboard.writeText(location.href);
      button.textContent = 'link copied ✓';
    } catch {
      button.textContent = location.href;
    }
    window.setTimeout(() => (button.textContent = label), 2200);
  });
});

/* ---------------------------------------------------------------- leave transition */

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.hash) return;
  if (reduceMotion.matches) return;

  event.preventDefault();
  if (drawer?.classList.contains('is-open')) setDrawer(false);
  root.classList.add('is-leaving');
  window.setTimeout(() => {
    location.href = url.href;
  }, EASE_MS * 0.62);
});
