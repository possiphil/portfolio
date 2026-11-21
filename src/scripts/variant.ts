import Lenis from 'lenis';

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const readJson = <T>(selector: string, fallback: T): T => {
  try {
    return JSON.parse(document.querySelector(selector)?.textContent ?? '') as T;
  } catch {
    return fallback;
  }
};

/** Runs `step(progress)` with an eased 0 → 1 progress over `duration` ms. */
function tween(duration: number, step: (progress: number) => void) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const frame = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1);
      step(easeInOut(t));
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

/** Per-frame callbacks share one requestAnimationFrame loop. */
const frameCallbacks: (() => void)[] = [];
const onFrame = (callback: () => void) => frameCallbacks.push(callback);
const loop = () => {
  frameCallbacks.forEach((callback) => callback());
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);

/* ---------------------------------------------------------------- Smooth scroll */

const lenis = reduceMotion ? null : new Lenis({ autoRaf: true, lerp: 0.1 });
lenis?.stop();

const scrollToTarget = (hash: string) => {
  const target = hash === '#top' ? 0 : document.querySelector<HTMLElement>(hash);
  if (target === null) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.4 });
  else if (target === 0) window.scrollTo({ top: 0 });
  else target.scrollIntoView();
};

/* ---------------------------------------------------------------- Loader (arrival) */

async function runLoader() {
  const loader = document.querySelector<HTMLElement>('[data-loader]');
  const wordEl = document.querySelector<HTMLElement>('[data-loader-word]');
  const curve = document.querySelector<SVGPathElement>('[data-loader-curve]');
  const mode = root.dataset.loaderMode;

  if (!loader || !wordEl || !curve || mode === 'none') {
    loader?.remove();
    root.classList.add('is-loaded', 'is-settled');
    return;
  }

  loader.classList.add('is-visible');

  if (mode === 'greet') {
    const words = readJson<string[]>('[data-greetings]', []);
    await wait(1000);
    for (const word of words.slice(1)) {
      wordEl.textContent = word;
      await wait(150);
    }
    await wait(200);
  } else {
    await wait(root.classList.contains('from-transition') ? 250 : 700);
  }

  root.classList.add('is-loaded');
  await tween(900, (p) => {
    loader.style.transform = `translate3d(0, ${-p * 100}%, 0)`;
    curve.setAttribute('d', `M0 0 L1000 0 Q500 ${200 * (1 - p)} 0 0 Z`);
  });
  loader.remove();
  setTimeout(() => root.classList.add('is-settled'), 600);
}

/* ---------------------------------------------------------------- Page transition (departure) */

function setupTransitions() {
  const cover = document.querySelector<HTMLElement>('[data-cover]');
  const coverWord = document.querySelector<HTMLElement>('[data-cover-word]');
  const coverCurve = document.querySelector<SVGPathElement>('[data-cover-curve]');
  const page = document.querySelector<HTMLElement>('.page');
  const labels = readJson<Record<string, string>>('[data-route-labels]', {});
  if (!cover || !coverWord || !coverCurve || reduceMotion) return;

  let leaving = false;

  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a');
    if (!link || leaving || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;

    event.preventDefault();
    leaving = true;
    const path = url.pathname.replace(/\/$/, '') || '/';
    coverWord.textContent = labels[path] ?? link.textContent?.trim() ?? '';
    root.classList.remove('menu-open');
    try {
      sessionStorage.setItem('variant-transition', '1');
    } catch {
      // The next page falls back to its own label animation.
    }

    cover.classList.add('is-active');
    lenis?.stop();
    tween(800, (p) => {
      cover.style.transform = `translate3d(0, ${(1 - p) * 100}%, 0)`;
      coverCurve.setAttribute('d', `M0 100 L1000 100 Q500 ${100 - 200 * (1 - p)} 0 100 Z`);
      if (page) page.style.transform = `translate3d(0, ${-p * 10}vh, 0)`;
    }).then(() => {
      location.href = url.href;
    });
  });

  // Returning through the back/forward cache restores the covered page; reset it.
  addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    leaving = false;
    cover.classList.remove('is-active');
    cover.style.transform = '';
    if (page) page.style.transform = '';
    lenis?.start();
  });
}

/* ---------------------------------------------------------------- Brand roll ("© Code by Philipp") */

function setupBrand() {
  const roll = document.querySelector<HTMLElement>('.brand-roll');
  if (!roll) return;
  const [a, b, c] = Array.from(roll.children) as HTMLElement[];
  const measure = () => {
    roll.style.width = 'max-content';
    const wa = a.offsetWidth;
    const wb = b.offsetWidth;
    const wc = c.offsetWidth;
    roll.style.width = '';
    roll.style.setProperty('--roll-start', `${wa + wb}px`);
    roll.style.setProperty('--roll-end', `${wb + wc}px`);
    roll.style.setProperty('--roll-shift', `${wa}px`);
  };
  measure();
  document.fonts?.ready.then(measure);
  addEventListener('resize', measure);
}

/* ---------------------------------------------------------------- Magnetic buttons */

function setupMagnetic() {
  if (!finePointer || reduceMotion) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const inner = el.querySelector<HTMLElement | SVGElement>('.magnetic-inner');
    const strength = Number(el.dataset.magneticStrength ?? 0.4);
    const settle = 'transform 0.9s cubic-bezier(0.19, 1, 0.22, 1)';

    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transition = 'transform 0.25s ease-out';
      el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      if (inner) {
        inner.style.transition = 'transform 0.25s ease-out';
        inner.style.transform = `translate3d(${x * strength * 0.45}px, ${y * strength * 0.45}px, 0)`;
      }
    });

    el.addEventListener('pointerleave', () => {
      el.style.transition = settle;
      el.style.transform = '';
      if (inner) {
        inner.style.transition = settle;
        inner.style.transform = '';
      }
    });
  });
}

/* ---------------------------------------------------------------- Side menu */

function setupMenu() {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const wrap = document.querySelector<HTMLElement>('[data-menu-button-wrap]');
  const menu = document.querySelector<HTMLElement>('[data-side-menu]');
  const curve = document.querySelector<SVGPathElement>('[data-menu-curve]');
  if (!button || !wrap || !menu) return;

  let open = false;
  const animateCurve = (opening: boolean) => {
    if (!curve || reduceMotion) return;
    tween(800, (p) => {
      const amount = opening ? p : 1 - p;
      curve.setAttribute('d', `M100 0 L100 1000 Q${lerp(-100, 100, amount)} 500 100 0`);
    });
  };

  const setOpen = (value: boolean) => {
    if (open === value) return;
    open = value;
    root.classList.toggle('menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.add('is-animating');
    setTimeout(() => menu.classList.remove('is-animating'), 850);
    animateCurve(open);
  };

  button.addEventListener('click', () => setOpen(!open));
  document.querySelectorAll('[data-menu-open]').forEach((el) => el.addEventListener('click', () => setOpen(true)));
  document.querySelectorAll('[data-menu-close]').forEach((el) => el.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  const update = () => {
    const threshold = Math.min(innerHeight * 0.25, 220);
    wrap.classList.toggle('is-visible', scrollY > threshold);
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------------------------------------------------------------- Home hero marquee + parallax */

function setupHero() {
  const track = document.querySelector<HTMLElement>('[data-marquee]');
  const photo = document.querySelector<HTMLElement>('[data-hero-photo]');
  const role = document.querySelector<HTMLElement>('[data-hero-parallax]');
  if (!track) return;

  let x = 0;
  let direction = -1;
  let boost = 0;
  let lastScroll = scrollY;

  onFrame(() => {
    const delta = scrollY - lastScroll;
    lastScroll = scrollY;
    if (delta !== 0) direction = delta > 0 ? -1 : 1;
    boost = lerp(boost, Math.min(Math.abs(delta) * 0.02, 0.6), 0.1);
    if (reduceMotion) return;

    x += (0.045 + boost) * direction;
    if (x <= -50) x += 50;
    if (x > 0) x -= 50;
    track.style.transform = `translate3d(${x}%, 0, 0)`;

    if (scrollY < innerHeight * 1.2) {
      if (photo) photo.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
      if (role) role.style.transform = `translate3d(0, ${scrollY * 0.15}px, 0)`;
    }
  });
}

/* ---------------------------------------------------------------- Reveal on scroll */

function setupReveals() {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-words], [data-fade]');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    targets.forEach((target) => target.classList.add('is-in'));
    document.querySelectorAll('.intro').forEach((intro) => intro.classList.add('is-revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      entry.target.closest('.intro')?.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  targets.forEach((target) => observer.observe(target));
}

/* ---------------------------------------------------------------- Hover lists (floating preview + cursor) */

function setupHoverLists() {
  if (!finePointer) return;
  const target = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('pointermove', (event) => {
    target.x = event.clientX;
    target.y = event.clientY;
  }, { passive: true });

  document.querySelectorAll<HTMLElement>('[data-hover-scope]').forEach((scope) => {
    const modal = scope.querySelector<HTMLElement>('[data-hover-modal]');
    const slider = scope.querySelector<HTMLElement>('[data-hover-slider]');
    const cursor = scope.querySelector<HTMLElement>('[data-hover-cursor]');
    const label = scope.querySelector<HTMLElement>('[data-hover-label]');
    if (!cursor || !label) return;

    const modalPos = { ...target };
    const cursorPos = { ...target };
    let active = false;

    scope.querySelectorAll<HTMLElement>('[data-hover-row]').forEach((row) => {
      row.addEventListener('pointerenter', (event) => {
        target.x = event.clientX;
        target.y = event.clientY;
        if (!active) {
          Object.assign(modalPos, target);
          Object.assign(cursorPos, target);
        }
        active = true;
        if (slider) slider.style.transform = `translateY(${Number(row.dataset.hoverRow) * -100}%)`;
        label.textContent = row.dataset.label ?? 'View';
        scope.classList.add('is-hovering');
      });
      row.addEventListener('pointerleave', (event) => {
        const next = (event.relatedTarget as Element | null)?.closest?.('[data-hover-row]');
        if (next && scope.contains(next)) return;
        active = false;
        scope.classList.remove('is-hovering');
      });
    });

    const place = (el: HTMLElement, pos: { x: number; y: number }) => {
      el.style.left = `${pos.x}px`;
      el.style.top = `${pos.y}px`;
    };

    onFrame(() => {
      modalPos.x = lerp(modalPos.x, target.x, 0.12);
      modalPos.y = lerp(modalPos.y, target.y, 0.12);
      cursorPos.x = lerp(cursorPos.x, target.x, 0.3);
      cursorPos.y = lerp(cursorPos.y, target.y, 0.3);
      if (modal) place(modal, modalPos);
      place(cursor, cursorPos);
      place(label, cursorPos);
    });
  });
}

/* ---------------------------------------------------------------- Work filters and list/grid toggle */

function setupWorkFilters() {
  const scope = document.querySelector<HTMLElement>('[data-filter-scope]');
  if (!scope) return;
  const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-filter-button]');
  const viewButtons = document.querySelectorAll<HTMLButtonElement>('[data-view-button]');
  const items = scope.querySelectorAll<HTMLElement>('[data-filter-item]');

  const press = (buttons: NodeListOf<HTMLButtonElement>, active: HTMLButtonElement) => {
    buttons.forEach((button) => {
      const on = button === active;
      button.classList.toggle('is-active', on);
      button.setAttribute('aria-pressed', String(on));
    });
  };

  const swap = (change: () => void) => {
    scope.classList.add('is-switching');
    scope.classList.remove('is-hovering');
    setTimeout(() => {
      change();
      scope.classList.remove('is-switching');
    }, reduceMotion ? 0 : 350);
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('is-active')) return;
      press(filterButtons, button);
      const filter = button.dataset.filterButton;
      swap(() => items.forEach((item) => {
        item.hidden = filter !== 'all' && item.dataset.filterItem !== filter;
      }));
    });
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('is-active')) return;
      press(viewButtons, button);
      swap(() => {
        scope.dataset.view = button.dataset.viewButton ?? 'rows';
      });
    });
  });
}

/* ---------------------------------------------------------------- Scroll-linked parallax, rounded divider, footer */

function setupScrollEffects() {
  const rounded = document.querySelector<HTMLElement>('[data-rounded]');
  const footer = document.querySelector<HTMLElement>('[data-footer]');
  const inner = document.querySelector<HTMLElement>('[data-footer-inner]');
  const footerButton = document.querySelector<HTMLElement>('[data-footer-button]');
  const buttons = document.querySelectorAll<HTMLElement>('[data-parallax-button]');
  const images = document.querySelectorAll<HTMLElement>('[data-parallax-image]');
  const ball = document.querySelector<HTMLElement>('[data-parallax-ball]');

  /** 0 when the element's top enters the bottom of the viewport, 1 when its bottom leaves the top. */
  const progressOf = (el: Element) => {
    const rect = el.getBoundingClientRect();
    return clamp((innerHeight - rect.top) / (innerHeight + rect.height), 0, 1);
  };

  const update = () => {
    if (footer && rounded) {
      const rect = footer.getBoundingClientRect();
      const progress = clamp((innerHeight - rect.top) / Math.min(rect.height, innerHeight), 0, 1);
      rounded.style.setProperty('--curve', `${(1 - progress) * 10}vh`);
      if (inner && !reduceMotion) inner.style.transform = `translate3d(0, ${(1 - progress) * -30}%, 0)`;
      if (footerButton && !reduceMotion) footerButton.style.transform = `translate3d(${(1 - progress) * -8}vw, -50%, 0)`;
    }
    if (reduceMotion) return;

    buttons.forEach((button) => {
      const progress = progressOf(button.parentElement ?? button);
      button.style.transform = `translate3d(0, ${(0.5 - progress) * 60}%, 0)`;
    });
    images.forEach((wrap) => {
      const media = wrap.querySelector<HTMLElement>('img, .placeholder-title');
      if (!media) return;
      const progress = progressOf(wrap);
      media.style.transform = `translate3d(0, ${(progress - 0.5) * -16}%, 0) scale(1.18)`;
    });
    if (ball) {
      const progress = progressOf(ball.parentElement ?? ball);
      ball.style.transform = `translate3d(0, calc(-50% + ${(0.5 - progress) * 120}%), 0)`;
    }
  };

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------------------------------------------------------------- Next case hover tile */

function setupNextCase() {
  const link = document.querySelector<HTMLElement>('[data-next-case]');
  const tile = link?.querySelector<HTMLElement>('.next-case-tile');
  if (!link || !tile || !finePointer) return;
  link.addEventListener('pointermove', (event) => {
    const rect = link.getBoundingClientRect();
    tile.style.setProperty('--tile-x', `${(event.clientX - rect.left - rect.width / 2) * 0.15}px`);
  });
}

/* ---------------------------------------------------------------- Contact form */

function setupContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const status = document.querySelector<HTMLElement>('[data-form-status]');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const missing = Array.from(form.elements).find(
      (el): el is HTMLInputElement | HTMLTextAreaElement =>
        (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && !el.checkValidity(),
    );
    if (missing) {
      status.textContent = 'Please fill in the fields marked with *.';
      missing.focus();
      return;
    }

    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? '').trim();
    const to = form.dataset.email;
    if (!to) {
      status.textContent = 'Email is not set up yet. Please reach out on GitHub for now.';
      return;
    }
    const subject = `Project inquiry from ${value('name')}${value('organization') ? ` (${value('organization')})` : ''}`;
    const body = [value('message'), '', `Looking for: ${value('topic') || '–'}`, `Reply to: ${value('email')}`].join('\n');
    location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Your mail app should open with the message ready to send.';
  });
}

/* ---------------------------------------------------------------- Local time */

function setupClock() {
  document.querySelectorAll<HTMLElement>('[data-clock]').forEach((clock) => {
    const format = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: clock.dataset.timeZone || undefined,
      timeZoneName: 'short',
    });
    const tick = () => {
      clock.textContent = format.format(new Date());
    };
    tick();
    setInterval(tick, 10_000);
  });
}

/* ---------------------------------------------------------------- In-page anchors */

function setupAnchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href')!;
      if (hash.length < 2) return;
      event.preventDefault();
      scrollToTarget(hash);
    });
  });
}

setupBrand();
setupMagnetic();
setupMenu();
setupHero();
setupReveals();
setupHoverLists();
setupWorkFilters();
setupScrollEffects();
setupNextCase();
setupContactForm();
setupClock();
setupAnchors();
setupTransitions();

if ('scrollRestoration' in history && !location.hash) {
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
}

runLoader().then(() => lenis?.start());
