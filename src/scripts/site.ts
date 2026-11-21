import { dismissDialog, setupDialogs } from './dialogs';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const navigation = (window as Window & {
  navigation?: { activation?: NavigationActivation; currentEntry?: NavigationHistoryEntry };
}).navigation;
const loadType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type;
const main = document.querySelector<HTMLElement>('#main');
const header = document.querySelector<HTMLElement>('[data-header]');
const themeToggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

function applyTheme(light: boolean) {
  root.dataset.theme = light ? 'light' : 'dark';
  if (themeColor) themeColor.content = light ? '#EFEAE2' : '#171717';
  themeToggle?.setAttribute('aria-pressed', String(light));
  if (themeToggle) themeToggle.title = light ? 'Switch to dark theme' : 'Switch to light theme';
}

let circle: ViewTransition | undefined;

function circularReveal(origin: HTMLElement, update: () => void) {
  if (reducedMotion.matches || typeof document.startViewTransition !== 'function') {
    update();
    return;
  }

  const bounds = origin.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const y = Math.max(0, bounds.top + bounds.height / 2);
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.style.setProperty('--reveal-x', `${x}px`);
  root.style.setProperty('--reveal-y', `${y}px`);
  root.style.setProperty('--reveal-radius', `${Math.ceil(radius)}px`);
  root.dataset.circle = '';

  circle?.skipTransition();
  const transition = document.startViewTransition(update);
  circle = transition;
  void Promise.allSettled([transition.ready, transition.finished, transition.updateCallbackDone]).then(() => {
    if (circle === transition) {
      delete root.dataset.circle;
      circle = undefined;
    }
  });
}

if (themeToggle) {
  applyTheme(root.dataset.theme === 'light');
  themeToggle.hidden = false;
  themeToggle.addEventListener('click', () => {
    const light = root.dataset.theme !== 'light';
    circularReveal(themeToggle, () => {
      applyTheme(light);
      try {
        localStorage.setItem('portfolio-theme', light ? 'light' : 'dark');
      } catch {
        // The current page can still change palettes.
      }
    });
  });
}

setupDialogs();

interface PortfolioHistory {
  galleryCard?: string;
  galleryScroll?: number;
  enteredFromGallery?: boolean;
}

interface GalleryIntent {
  path: string;
  entry?: string;
  time: number;
}

const galleryIntentKey = 'portfolio-gallery-intent';
const state = (): PortfolioHistory => history.state ?? {};

if (root.dataset.page === 'project' && loadType === 'navigate') {
  try {
    const intent = JSON.parse(sessionStorage.getItem(galleryIntentKey) ?? 'null') as GalleryIntent | null;
    sessionStorage.removeItem(galleryIntentKey);
    const referrer = document.referrer && new URL(document.referrer);
    const from = navigation?.activation?.from;

    if (intent?.path === location.pathname.replace(/\/$/, '')
        && Date.now() - intent.time < 30_000
        && referrer && referrer.origin === location.origin && referrer.pathname === '/'
        && (!intent.entry || !from || from.key === intent.entry)) {
      history.replaceState({ ...state(), enteredFromGallery: true }, '');
    }
  } catch {
    // The visible back link still points to the work section.
  }
}

function restoreGalleryContext() {
  const { galleryCard, galleryScroll } = state();
  if (root.dataset.page !== 'home' || !galleryCard) return;
  const card = document.querySelector<HTMLAnchorElement>(`[data-project-link="${CSS.escape(galleryCard)}"]`);
  if (typeof galleryScroll === 'number' && Math.abs(scrollY - galleryScroll) > 2) {
    window.scrollTo({ top: galleryScroll, behavior: 'instant' });
  }
  card?.focus({ preventScroll: true });
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted || loadType === 'back_forward') {
    requestAnimationFrame(restoreGalleryContext);
  }

  // Palette changes on another page must also reach documents restored from the cache.
  if (event.persisted) {
    try {
      applyTheme(localStorage.getItem('portfolio-theme') === 'light');
    } catch {
      // Continue with the restored document's palette.
    }
  }
});

document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin) return;

  if (link.dataset.projectLink) {
    history.replaceState({ ...state(), galleryCard: link.dataset.projectLink, galleryScroll: scrollY }, '');
    try {
      const intent: GalleryIntent = { path: url.pathname, entry: navigation?.currentEntry?.key, time: Date.now() };
      sessionStorage.setItem(galleryIntentKey, JSON.stringify(intent));
    } catch {
      // The browser's own Back and Forward remain available.
    }
    return;
  }

  if (link.hasAttribute('data-back-projects') && state().enteredFromGallery && history.length > 1) {
    event.preventDefault();
    history.back();
    return;
  }

  const dialog = link.closest('dialog');
  const samePage = url.pathname === location.pathname;
  if (dialog?.open) dismissDialog(dialog, false);

  if (link.hasAttribute('data-home') && samePage) {
    event.preventDefault();
    if (scrollY === 0 && !location.hash) {
      main?.focus({ preventScroll: true });
      return;
    }
    circularReveal(dialog ? document.querySelector<HTMLElement>('.site-header .brand') ?? link : link, () => {
      if (location.hash || scrollY > 0) history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'instant' });
      main?.focus({ preventScroll: true });
    });
    return;
  }

  if (!samePage || !url.hash || !(link.hasAttribute('data-scroll-link') || link.hasAttribute('data-section'))) return;
  const target = document.getElementById(url.hash.slice(1));
  if (!target) return;

  event.preventDefault();
  if (location.hash !== url.hash) {
    if (link.hasAttribute('data-chapter-link')) {
      // Chapter deep links update the current case-study entry, so Back returns to the gallery.
      history.replaceState(state(), '', url.hash);
    } else {
      history.pushState(null, '', url.hash);
    }
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
});

if (root.hasAttribute('data-intro')) {
  const introListeners = new AbortController();
  const { signal } = introListeners;
  const finishIntro = () => {
    delete root.dataset.intro;
    introListeners.abort();
  };
  document.querySelector('.entry-curtain')?.addEventListener('animationend', (event) => {
    if ((event as AnimationEvent).animationName === 'clear-curtain') finishIntro();
  }, { signal });
  document.addEventListener('focusin', finishIntro, { signal });
  window.addEventListener('pointerdown', finishIntro, { signal, passive: true });
  window.addEventListener('scroll', finishIntro, { signal, passive: true });
  window.addEventListener('pagehide', finishIntro, { signal });
  reducedMotion.addEventListener('change', finishIntro, { signal });
}

if (header) {
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-section]'));
  const sections = root.dataset.page === 'home'
    ? ['work', 'about', 'contact'].map((id) => document.getElementById(id)!).filter(Boolean)
    : [];
  let previousY = Math.max(0, scrollY);
  let frame = 0;
  let activeSection: string | undefined;

  const updateHeader = () => {
    frame = 0;
    const y = Math.max(0, scrollY);
    header.toggleAttribute('data-scrolled', y > 18);
    if (y < 55 || y < previousY - 5) header.removeAttribute('data-hidden');
    if (y > 90 && y > previousY + 9) header.setAttribute('data-hidden', '');
    if (Math.abs(y - previousY) > 5 || y < 55) previousY = y;

    if (sections.length) {
      const readingLine = Math.min(205, innerHeight * .35);
      const next = sections.findLast((section) => section.getBoundingClientRect().top <= readingLine)?.id;
      if (activeSection !== next) {
        activeSection = next;
        for (const link of navLinks) {
          if (link.dataset.section === next) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      }
    }
  };

  const scheduleHeader = () => { if (!frame) frame = requestAnimationFrame(updateHeader); };
  window.addEventListener('scroll', scheduleHeader, { passive: true });
  window.addEventListener('resize', scheduleHeader, { passive: true });
  window.addEventListener('pageshow', scheduleHeader);
  updateHeader();
}
