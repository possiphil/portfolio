import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { Stage } from './gl/stage';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

const root = document.documentElement;
const reduced = root.classList.contains('reduced-motion');
const $$ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) => [...scope.querySelectorAll<T>(selector)] as T[];
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/—';

/* ------------------------------------------------------------ smooth scroll */
const lenis = reduced ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: false });
lenis?.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);

$$<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href')!;
    const target = id === '#top' ? 0 : document.querySelector<HTMLElement>(id);
    if (target === null) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else if (target === 0) window.scrollTo(0, 0);
    else target.scrollIntoView();
  });
});

/* ------------------------------------------------------------ fit text */
function fitText() {
  for (const el of $$('[data-fit]')) {
    el.style.fontSize = '';
    const range = document.createRange();
    range.selectNodeContents(el);
    const style = getComputedStyle(el);
    const available = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const width = range.getBoundingClientRect().width;
    if (!width || !available) continue;
    el.style.fontSize = `${parseFloat(style.fontSize) * (available / width)}px`;
  }
}

/* ------------------------------------------------------------ scramble */
function scramble(el: HTMLElement, duration = 0.9) {
  const text = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = text;
  return gsap.to(el, { duration, ease: 'none', scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.6, revealDelay: 0.15 } });
}

function bindScrambleHover() {
  for (const el of $$('[data-scramble-hover]')) {
    const host = el.closest('a') ?? el;
    let tween: gsap.core.Tween | null = null;
    host.addEventListener('pointerenter', () => {
      if (tween?.isActive()) return;
      tween = scramble(el, 0.6);
    });
  }
}

/* ------------------------------------------------------------ WebGL */
let stage: Stage | null = null;
try {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-gl-canvas]');
  if (canvas) stage = new Stage(canvas);
} catch (error) {
  console.warn('WebGL unavailable, showing the DOM version.', error);
}

/** Sets a reveal uniform when WebGL runs; the DOM fallback is always visible. */
function reveal(el: Element, value: number, vars: gsap.TweenVars = {}) {
  const item = stage?.get(el);
  if (!item) return null;
  return gsap.to(item.uniforms.uReveal, { value, duration: 1.6, ease: 'power2.out', ...vars });
}

/* ------------------------------------------------------------ scroll scenes */
function buildScenes() {
  // Header details give way once the page moves, like the original.
  gsap.to('[data-hd-fade]', {
    autoAlpha: 0, ease: 'none',
    scrollTrigger: { start: 40, end: () => window.innerHeight * 0.35, scrub: true },
  });

  for (const el of $$('[data-scramble-in]')) {
    el.style.opacity = '0';
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => { el.style.opacity = '1'; scramble(el); },
    });
  }

  for (const el of $$('[data-words]')) {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'word' });
    gsap.fromTo(split.words, { opacity: 0.12 }, {
      opacity: 1, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: true },
    });
  }

  for (const el of $$('[data-lines]')) {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (split) => gsap.from(split.lines, {
        yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }),
    });
  }

  for (const row of $$('[data-row]')) {
    gsap.from(row.children, {
      opacity: 0, y: 8, duration: 0.8, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: row, start: 'top 92%', once: true },
    });
  }

  // Reel caption types itself in while the screen scrolls through.
  for (const el of $$('[data-type]')) {
    const split = SplitText.create(el, { type: 'chars' });
    gsap.set(split.chars, { opacity: 0 });
    gsap.to(split.chars, {
      opacity: 1, stagger: 0.04, duration: 0.01, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top 55%', end: 'center 35%', scrub: true },
    });
  }

  for (const el of $$('[data-gl-text][data-reveal="scroll"]')) {
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => reveal(el, 1, { duration: 1.8 }),
    });
  }

  for (const el of $$('[data-gl-media]')) {
    const isThumb = el.dataset.variant === 'thumb';
    if (isThumb) continue;
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => reveal(el, 1, { duration: el.dataset.variant === 'crt' ? 2.2 : 1.6, ease: 'power3.out' }),
    });
  }

  for (const strip of $$('.case-thumbs')) {
    const thumbs = $$('[data-gl-media]', strip);
    ScrollTrigger.create({
      trigger: strip, start: 'top 75%', once: true,
      onEnter: () => thumbs.forEach((t, i) => reveal(t, 1, { duration: 0.9, delay: i * 0.09, ease: 'steps(9)' })),
    });
  }

  // Project titles drift against the panel, so the cover feels deeper than the type.
  for (const title of $$('.case-title')) {
    gsap.fromTo(title, { yPercent: -10 }, {
      yPercent: 30, ease: 'none',
      scrollTrigger: { trigger: title.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  for (const tag of $$('.profile-tag')) {
    gsap.fromTo(tag, { y: 60 }, {
      y: -60, ease: 'none',
      scrollTrigger: { trigger: tag.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
}

/* ------------------------------------------------------------ intro */
function intro() {
  const loader = document.querySelector<HTMLElement>('[data-loader]');
  const atmos = stage?.get(document.querySelector('[data-gl-atmos="hero"]'));
  const heroWord = document.querySelector('[data-reveal="intro"]');
  const heroItem = stage?.get(heroWord);
  const labels = $$('.hd [data-scramble], .hero [data-scramble]');

  if (reduced) {
    loader?.remove();
    if (atmos) atmos.uniforms.uIntro.value = 1;
    if (heroItem) heroItem.uniforms.uReveal.value = 1;
    $$('[data-gl-media], [data-gl-text]').forEach((el) => { const i = stage?.get(el); if (i) i.uniforms.uReveal.value = 1; });
    return;
  }

  lenis?.stop();
  window.scrollTo(0, 0);
  gsap.set(labels, { opacity: 0 });
  gsap.set('.hd-logo, .hd-cta, .hero-hint, .hero-index', { opacity: 0 });

  const tl = gsap.timeline({ delay: 0.5, onComplete: () => { lenis?.start(); root.classList.remove('is-loading'); } });
  tl.to(loader, { opacity: 0, duration: 0.6, ease: 'power2.inOut', onComplete: () => loader?.remove() });
  if (atmos) tl.to(atmos.uniforms.uIntro, { value: 1, duration: 2.4, ease: 'power2.inOut' }, 0.2);
  tl.to('.hd-logo', { opacity: 1, duration: 0.8 }, 0.9);
  labels.forEach((el, i) => tl.add(() => { el.style.opacity = '1'; scramble(el, 1.1); }, 1.1 + i * 0.08));
  if (heroItem) tl.to(heroItem.uniforms.uReveal, { value: 1, duration: 2.2, ease: 'power2.inOut' }, 1.1);
  tl.to('.hd-cta, .hero-hint, .hero-index', { opacity: 1, duration: 0.8, stagger: 0.1 }, 1.8);
}

/* ------------------------------------------------------------ boot */
async function boot() {
  await document.fonts.ready;
  fitText();

  if (stage) {
    stage.collect();
    root.classList.add('has-gl');
  }

  buildScenes();
  bindScrambleHover();
  intro();

  const start = performance.now();
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
    stage?.render((performance.now() - start) / 1000, lenis?.velocity ?? 0);
  });

  let resizeTimer = 0;
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const widthChanged = window.innerWidth !== lastWidth;
      lastWidth = window.innerWidth;
      if (widthChanged) fitText();
      stage?.resize();
      ScrollTrigger.refresh();
    }, 150);
  });
}

boot();

if (import.meta.env.DEV) {
  // Lets a background tab (no requestAnimationFrame) be stepped from the console while developing.
  const go = async (target: string | number, offset = 0, frames = 30) => {
    const el = typeof target === 'string' ? document.querySelector(target) : null;
    const y = el ? el.getBoundingClientRect().top + window.scrollY + offset : Number(target);
    window.scrollTo(0, y);
    for (let i = 0; i < frames; i++) { gsap.ticker.tick(); await new Promise((r) => setTimeout(r, 80)); }
    return window.scrollY;
  };
  Object.assign(window, { __stage: stage, __gsap: gsap, __go: go });
}
