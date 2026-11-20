const root = document.documentElement;
const themeToggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

if (themeToggle && themeColor) {
  const applyTheme = (light: boolean) => {
    root.dataset.theme = light ? 'light' : 'dark';
    themeColor.content = light ? '#f5f3ee' : '#17171c';
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

if (root.hasAttribute('data-intro')) {
  // Keep native scrolling and input available during the first-visit sequence.
  const introListeners = new AbortController();
  const { signal } = introListeners;
  const finishIntro = () => {
    delete root.dataset.intro;
    introListeners.abort();
  };

  document.querySelector('.portrait-plane')?.addEventListener('animationend', finishIntro, { signal });
  document.addEventListener('focusin', finishIntro, { signal });
  window.addEventListener('pointerdown', finishIntro, { signal, passive: true });
  window.addEventListener('scroll', finishIntro, { signal, passive: true });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', finishIntro, { signal });
}

const header = document.querySelector<HTMLElement>('.site-header');
const navigation = document.querySelector<HTMLElement>('.site-nav');

if (header && navigation) {
  const links = Array.from(navigation.querySelectorAll<HTMLAnchorElement>('a'), (link) => ({
    link,
    section: document.getElementById(link.hash.slice(1)),
  }));

  let currentLink: HTMLAnchorElement | undefined;
  let pendingFrame: number | undefined;
  let indicatorNeedsLayout = true;

  const positionIndicator = (link: HTMLAnchorElement) => {
    const bounds = link.getBoundingClientRect();
    const track = navigation.getBoundingClientRect();
    navigation.style.setProperty('--nav-x', `${bounds.left - track.left}px`);
    navigation.style.setProperty('--nav-y', `${bounds.bottom - track.top - 1}px`);
    navigation.style.setProperty('--nav-width', `${bounds.width}px`);
  };

  const updateNavigation = () => {
    pendingFrame = undefined;
    const readingLine = header.getBoundingClientRect().bottom + Math.min(92, innerHeight * .13);
    const atBottom = scrollY > 0 && scrollY + innerHeight >= root.scrollHeight - 2;
    const readingSection = links.findLast(({ section }) => section && section.getBoundingClientRect().top <= readingLine);
    // A short final section can share the bottom of the page with a deep link.
    const visibleDestination = links.find(({ link, section }) =>
      link.hash === location.hash && section && section.getBoundingClientRect().top >= header.offsetHeight - 1,
    );
    const active = atBottom ? visibleDestination ?? links.at(-1) : readingSection;

    const nextLink = active?.link;
    if (nextLink !== currentLink) {
      currentLink?.removeAttribute('aria-current');
      currentLink = nextLink;
      currentLink?.setAttribute('aria-current', 'location');
      indicatorNeedsLayout = true;
    }
    if (currentLink && indicatorNeedsLayout) {
      indicatorNeedsLayout = false;
      positionIndicator(currentLink);
      if (!navigation.hasAttribute('data-positioned')) {
        requestAnimationFrame(() => { navigation.dataset.positioned = ''; });
      }
    }
  };

  const scheduleNavigationUpdate = () => {
    pendingFrame ??= requestAnimationFrame(updateNavigation);
  };

  new ResizeObserver(() => {
    root.style.setProperty('--header-height', `${header.offsetHeight}px`);
    scheduleNavigationUpdate();
  }).observe(header);

  const navObserver = new ResizeObserver(() => {
    indicatorNeedsLayout = true;
    scheduleNavigationUpdate();
  });
  navObserver.observe(navigation);
  links.forEach(({ link }) => navObserver.observe(link));
  window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
  window.addEventListener('pageshow', scheduleNavigationUpdate);
  window.addEventListener('hashchange', scheduleNavigationUpdate);
  scheduleNavigationUpdate();
}

const pointerMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');

document.querySelectorAll<HTMLElement>('[data-project-preview]').forEach((preview) => {
  const resetPreview = () => {
    preview.style.removeProperty('--preview-x');
    preview.style.removeProperty('--preview-y');
  };

  preview.addEventListener('pointermove', (event) => {
    if (!pointerMotion.matches || event.pointerType === 'touch') return;
    const bounds = preview.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    preview.style.setProperty('--preview-x', `${x * -24}px`);
    preview.style.setProperty('--preview-y', `${y * -20}px`);
  }, { passive: true });
  preview.addEventListener('pointerleave', resetPreview);
  pointerMotion.addEventListener('change', resetPreview);
});
