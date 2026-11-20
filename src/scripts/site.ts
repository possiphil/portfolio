const root = document.documentElement;
const themeToggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

if (themeToggle && themeColor) {
  const applyTheme = (light: boolean) => {
    root.dataset.theme = light ? 'light' : 'dark';
    themeColor.content = light ? '#f3f0eb' : '#161513';
    themeToggle.setAttribute('aria-pressed', String(light));
    themeToggle.title = light ? 'Switch to dark mode' : 'Switch to light mode';
  };

  applyTheme(root.dataset.theme === 'light');
  themeToggle.hidden = false;

  themeToggle.addEventListener('click', () => {
    const light = root.dataset.theme !== 'light';
    applyTheme(light);
    try {
      localStorage.setItem('portfolio-theme', light ? 'light' : 'dark');
    } catch {
      // The toggle remains usable without persistent storage.
    }
  });
}

const header = document.querySelector<HTMLElement>('.site-header');
const nav = Array.from(document.querySelectorAll<HTMLAnchorElement>('.site-nav a'), (link) => ({
  link,
  section: document.getElementById(link.hash.slice(1)),
}));

let currentLink: HTMLAnchorElement | undefined;
let pendingFrame: number | undefined;

function updateNavigation() {
  pendingFrame = undefined;
  const readingLine = (header?.getBoundingClientRect().bottom ?? 0) + Math.min(120, innerHeight * 0.16);
  const atBottom = scrollY > 0 && scrollY + innerHeight >= root.scrollHeight - 2;
  const active = atBottom ? nav.at(-1) : nav.findLast(({ section }) =>
    section && section.getBoundingClientRect().top <= readingLine,
  );

  if (active?.link === currentLink) return;
  currentLink?.removeAttribute('aria-current');
  currentLink = active?.link;
  currentLink?.setAttribute('aria-current', 'location');
}

function scheduleNavigationUpdate() {
  pendingFrame ??= requestAnimationFrame(updateNavigation);
}

if (header) {
  new ResizeObserver(() => {
    root.style.setProperty('--header-height', `${header.offsetHeight}px`);
    scheduleNavigationUpdate();
  }).observe(header);
}

window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
window.addEventListener('pageshow', scheduleNavigationUpdate);
scheduleNavigationUpdate();
