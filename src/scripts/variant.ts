import Lenis from 'lenis';

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

/* ---------------------------------------------------------------- Preloader */

async function runLoader() {
  const loader = document.querySelector<HTMLElement>('[data-loader]');
  const wordEl = document.querySelector<HTMLElement>('[data-loader-word]');
  const curve = document.querySelector<SVGPathElement>('[data-loader-curve]');
  const wordsJson = document.querySelector('[data-loader-words]')?.textContent ?? '[]';

  if (!loader || !wordEl || !curve || reduceMotion) {
    loader?.remove();
    root.classList.add('is-loaded', 'is-settled');
    return;
  }

  const words: string[] = JSON.parse(wordsJson);
  const returning = root.classList.contains('is-returning');
  loader.classList.add('is-visible');

  if (returning) {
    await wait(650);
  } else {
    await wait(1000);
    for (const word of words.slice(1)) {
      wordEl.textContent = word;
      await wait(150);
    }
    await wait(200);
  }

  root.classList.add('is-loaded');
  await tween(900, (p) => {
    loader.style.transform = `translate3d(0, ${-p * 100}%, 0)`;
    const bulge = 100 * (1 - p);
    curve.setAttribute('d', `M0 0 L1000 0 L1000 0 Q500 ${bulge * 2} 0 0 Z`);
  });
  loader.remove();
  setTimeout(() => root.classList.add('is-settled'), 600);
}

/* ---------------------------------------------------------------- Brand roll ("© Code by Philipp") */

function setupBrand() {
  const roll = document.querySelector<HTMLElement>('.brand-roll');
  if (!roll) return;
  const [a, b, c] = Array.from(roll.children) as HTMLElement[];
  const measure = () => {
    roll.style.removeProperty('--roll-start');
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
    const inner = el.querySelector<HTMLElement>('.magnetic-inner');
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
      const controlX = lerp(-100, 100, amount);
      curve.setAttribute('d', `M100 0 L100 1000 Q${controlX} 500 100 0`);
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
  document.querySelectorAll('[data-menu-close]').forEach((el) => el.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
  menu.querySelectorAll<HTMLAnchorElement>('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href') ?? '';
      if (!hash.startsWith('#')) return;
      event.preventDefault();
      setOpen(false);
      setTimeout(() => scrollToTarget(hash), 300);
    });
  });

  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const update = () => {
    const threshold = (hero?.offsetHeight ?? innerHeight) * 0.25;
    wrap.classList.toggle('is-visible', scrollY > threshold);
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------------------------------------------------------------- Hero marquee + parallax */

function setupHero() {
  const track = document.querySelector<HTMLElement>('[data-marquee]');
  const photo = document.querySelector<HTMLElement>('.hero-photo');
  const role = document.querySelector<HTMLElement>('[data-hero-parallax]');
  if (!track) return;

  let x = 0;
  let direction = -1;
  let boost = 0;
  let lastScroll = scrollY;

  const frame = () => {
    const delta = scrollY - lastScroll;
    lastScroll = scrollY;
    if (delta !== 0) direction = delta > 0 ? -1 : 1;
    boost = lerp(boost, Math.min(Math.abs(delta) * 0.02, 0.6), 0.1);

    if (!reduceMotion) {
      x += (0.045 + boost) * direction;
      if (x <= -50) x += 50;
      if (x > 0) x -= 50;
      track.style.transform = `translate3d(${x}%, 0, 0)`;
    }

    if (scrollY < innerHeight * 1.2 && !reduceMotion) {
      if (photo) photo.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
      if (role) role.style.transform = `translate3d(0, ${scrollY * 0.15}px, 0)`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------------- Reveal on scroll */

function setupReveals() {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal-words]');
  const intro = document.querySelector<HTMLElement>('.intro');
  if (!('IntersectionObserver' in window)) {
    intro?.classList.add('is-revealed');
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.closest('.intro')?.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });
  targets.forEach((target) => observer.observe(target));
}

/* ---------------------------------------------------------------- Work list hover preview */

function setupWork() {
  const section = document.querySelector<HTMLElement>('[data-work]');
  const modal = document.querySelector<HTMLElement>('[data-work-modal]');
  const slider = document.querySelector<HTMLElement>('[data-work-slider]');
  const cursor = document.querySelector<HTMLElement>('[data-work-cursor]');
  const label = document.querySelector<HTMLElement>('[data-work-label]');
  if (!section || !modal || !slider || !cursor || !label || !finePointer) return;

  const target = { x: innerWidth / 2, y: innerHeight / 2 };
  const modalPos = { ...target };
  const cursorPos = { ...target };
  let active = false;

  section.querySelectorAll<HTMLElement>('[data-work-row]').forEach((row) => {
    row.addEventListener('pointerenter', (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!active) {
        Object.assign(modalPos, target);
        Object.assign(cursorPos, target);
      }
      active = true;
      const index = Number(row.dataset.workRow);
      slider.style.transform = `translateY(${index * -100}%)`;
      label.textContent = row.dataset.label ?? 'View';
      section.classList.add('is-hovering');
    });
    row.addEventListener('pointerleave', (event) => {
      const next = (event.relatedTarget as Element | null)?.closest?.('[data-work-row]');
      if (next) return;
      active = false;
      section.classList.remove('is-hovering');
    });
  });

  addEventListener('pointermove', (event) => {
    target.x = event.clientX;
    target.y = event.clientY;
  }, { passive: true });

  const place = (el: HTMLElement, pos: { x: number; y: number }) => {
    el.style.left = `${pos.x}px`;
    el.style.top = `${pos.y}px`;
  };

  const frame = () => {
    modalPos.x = lerp(modalPos.x, target.x, 0.12);
    modalPos.y = lerp(modalPos.y, target.y, 0.12);
    cursorPos.x = lerp(cursorPos.x, target.x, 0.3);
    cursorPos.y = lerp(cursorPos.y, target.y, 0.3);
    place(modal, modalPos);
    place(cursor, cursorPos);
    place(label, cursorPos);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------------- Rounded divider + footer parallax */

function setupFooter() {
  const rounded = document.querySelector<HTMLElement>('[data-rounded]');
  const footer = document.querySelector<HTMLElement>('[data-footer]');
  const inner = document.querySelector<HTMLElement>('[data-footer-inner]');
  const button = document.querySelector<HTMLElement>('[data-footer-button]');
  const introButton = document.querySelector<HTMLElement>('[data-intro-button]');
  if (!rounded || !footer || !inner) return;

  const update = () => {
    const rect = footer.getBoundingClientRect();
    const progress = clamp((innerHeight - rect.top) / Math.min(rect.height, innerHeight), 0, 1);
    rounded.style.setProperty('--curve', `${(1 - progress) * 10}vh`);
    if (!reduceMotion) {
      inner.style.transform = `translate3d(0, ${(1 - progress) * -30}%, 0)`;
      if (button) button.style.transform = `translate3d(${(1 - progress) * -8}vw, -50%, 0)`;
    }

    if (introButton && !reduceMotion) {
      const introRect = introButton.parentElement!.getBoundingClientRect();
      const introProgress = clamp(1 - introRect.top / innerHeight, 0, 1.5);
      introButton.style.transform = `translate3d(0, ${introProgress * -20}%, 0)`;
    }
  };

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------------------------------------------------------------- Local time */

function setupClock() {
  const clock = document.querySelector<HTMLElement>('[data-clock]');
  if (!clock) return;
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
}

/* ---------------------------------------------------------------- Plain anchor links (nav, brand) */

function setupAnchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]:not([data-menu-link])').forEach((link) => {
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
setupWork();
setupFooter();
setupClock();
setupAnchors();

if ('scrollRestoration' in history && !location.hash) {
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
}

runLoader().then(() => lenis?.start());
