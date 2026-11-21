const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector<HTMLElement>('[data-hero]');
const work = document.querySelector<HTMLElement>('#work');
const timeline = document.querySelector<HTMLElement>('[data-timeline]');
const milestones = Array.from(timeline?.querySelectorAll<HTMLElement>('[data-milestone]') ?? []);
const lastMilestone = milestones.at(-1);
let frame = 0;
hero?.setAttribute('data-layered', '');

function updateScrollMotion() {
  frame = 0;
  if (timeline && lastMilestone) {
    const length = lastMilestone.offsetTop;
    timeline.style.setProperty('--timeline-length', `${length}px`);
    timeline.toggleAttribute('data-tracing', !reducedMotion.matches);

    if (length && !reducedMotion.matches) {
      const readingLine = innerHeight * .81 - timeline.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, (readingLine - 10) / length));
      timeline.style.setProperty('--timeline-progress', String(progress));
      milestones.forEach((milestone) => milestone.toggleAttribute('data-reached', readingLine >= milestone.offsetTop + 10));
    } else {
      timeline.style.removeProperty('--timeline-progress');
    }
  }

  if (hero) {
    if (reducedMotion.matches) hero.style.removeProperty('--hero-progress');
    else if (work && work.getBoundingClientRect().bottom > 0) {
      const progress = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * .92)));
      hero.style.setProperty('--hero-progress', String(progress));
    }
  }
}

const scheduleMotion = () => { if (!frame) frame = requestAnimationFrame(updateScrollMotion); };
window.addEventListener('scroll', scheduleMotion, { passive: true });
window.addEventListener('resize', scheduleMotion, { passive: true });
window.addEventListener('pageshow', scheduleMotion);
reducedMotion.addEventListener('change', scheduleMotion);
scheduleMotion();

hero?.querySelector<HTMLElement>('.explore-link')?.addEventListener('focus', (event) => {
  const link = event.currentTarget as HTMLElement;
  if (link.matches(':focus-visible') && work && work.getBoundingClientRect().top < link.getBoundingClientRect().bottom) {
    // The pinned hero must remain reachable when tabbing back from the gallery.
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
});

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const item = entry.target as HTMLElement;
      delete item.dataset.revealPending;
      item.dataset.revealed = '';
      observer.unobserve(item);
    }
  }, { rootMargin: '0px 0px -8%' });

  for (const group of document.querySelectorAll<HTMLElement>('[data-reveal-group]')) {
    if (group.getBoundingClientRect().top < innerHeight * .91) continue;
    group.querySelectorAll<HTMLElement>('.project-card').forEach((card, index) => {
      card.style.setProperty('--reveal-order', String(index));
    });
    group.dataset.revealPending = '';
    observer.observe(group);
  }

  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    observer.disconnect();
    document.querySelectorAll('[data-reveal-pending]').forEach((item) => item.removeAttribute('data-reveal-pending'));
  });
}

if ('IntersectionObserver' in window) {
  const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;

  for (const video of document.querySelectorAll<HTMLVideoElement>('video[data-loop]')) {
    const source = video.dataset.loop;
    const button = video.closest('.project-card')?.querySelector<HTMLButtonElement>('[data-loop-toggle]');
    if (!source || !button) continue;
    let visible = false;
    let pausedByUser = false;

    const updateVideo = async () => {
      const allowMotion = !reducedMotion.matches && !connection?.saveData;
      button.hidden = !allowMotion || !visible;
      if (!allowMotion || !visible || document.hidden || pausedByUser) {
        video.pause();
        if (!allowMotion) video.removeAttribute('data-playing');
        return;
      }

      if (!video.hasAttribute('src')) video.src = source;
      video.muted = true;
      try {
        await video.play();
      } catch {
        // Loading errors, playback restrictions, and interrupted starts leave the still visible.
        if (video.paused && !pausedByUser) video.removeAttribute('data-playing');
      }
    };

    new IntersectionObserver(([entry]) => {
      visible = Boolean(entry && entry.intersectionRatio >= .55);
      void updateVideo();
    }, { threshold: [.55] }).observe(video);

    video.addEventListener('playing', () => {
      if (!video.paused && !reducedMotion.matches && !connection?.saveData) {
        video.setAttribute('data-playing', '');
      }
    });
    video.addEventListener('error', () => { video.removeAttribute('data-playing'); button.hidden = true; });
    button.addEventListener('click', () => {
      pausedByUser = !pausedByUser;
      button.toggleAttribute('data-paused', pausedByUser);
      button.setAttribute('aria-label', pausedByUser ? 'Play preview' : 'Pause preview');
      void updateVideo();
    });
    window.addEventListener('pagehide', () => video.pause());
    window.addEventListener('pageshow', () => void updateVideo());
    document.addEventListener('visibilitychange', () => void updateVideo());
    reducedMotion.addEventListener('change', () => void updateVideo());
    connection?.addEventListener('change', () => void updateVideo());
  }
}
