import { Board } from './board';
import { initGlass } from './glass';
import { HeroGL } from './hero-gl';
import { Terminal, type SiteData } from './terminal';

type Panel = 'portfolio' | 'profile';

const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const $$ = <T extends Element = HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/* ---------- Hero ---------- */
const canvas = $<HTMLCanvasElement>('[data-hero-canvas]');
const hero = HeroGL.create(canvas, canvas.dataset.src!);
hero?.ready.then(() => {
  root.classList.add('has-gl');
  hero.play();
}).catch(() => undefined);

/* ---------- Type-on text ---------- */
interface Typed { el: HTMLElement; text: string; start: number; shown: number }
const typed: Typed[] = $$('[data-type]').map((el, i) => {
  const text = el.textContent ?? '';
  el.textContent = '';
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text;
  const visible = document.createElement('span');
  visible.setAttribute('aria-hidden', 'true');
  el.append(sr, visible);
  return { el: visible, text, start: i * 55, shown: -1 };
});
let typeStart = Infinity;
let scrollP = 0;

function renderTyped(now: number) {
  let busy = false;
  const limit = clamp01(1 - (scrollP - .05) * 2.2);
  for (const item of typed) {
    const elapsed = now - typeStart - item.start;
    const typedCount = reduced ? item.text.length : Math.max(0, Math.floor(elapsed / 24));
    const count = Math.min(item.text.length, typedCount, Math.round(item.text.length * limit));
    if (typedCount < item.text.length) busy = true;
    if (count !== item.shown) {
      item.shown = count;
      item.el.textContent = item.text.slice(0, count);
    }
  }
  if (busy) requestAnimationFrame(renderTyped);
}

/* ---------- Ticker ---------- */
const track = $('[data-ticker-track]');
track.append(...[...track.children].map((node) => {
  const clone = node.cloneNode(true) as HTMLElement;
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
  return clone;
}));
track.style.setProperty('--ticker-time', `${track.children.length * 1.6}s`);

/* ---------- Bottom bar ---------- */
const viewport = $('[data-viewport]');
const updateViewport = () => { viewport.textContent = `${innerWidth} ${innerHeight}`; };
addEventListener('resize', updateViewport);
updateViewport();

const platform = (() => {
  const ua = navigator.userAgent;
  const hint = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform;
  if (/iPhone|iPad|iPod/.test(ua) || (/Mac/.test(ua) && navigator.maxTouchPoints > 1)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (hint) return hint === 'macOS' ? 'macOS' : hint;
  if (/Mac/.test(ua)) return 'macOS';
  if (/Win/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return '';
})();
$('[data-os]').textContent = platform;

const clock = $('[data-clock]');
const clockFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: clock.dataset.zone });
const tick = () => {
  const [h, m] = clockFormat.format(new Date()).split(':');
  clock.innerHTML = `${h}<i>:</i>${m}`;
};
tick();
setInterval(tick, 10_000);

const tagline = $('[data-tagline]');
tagline.setAttribute('aria-hidden', 'true');
const lines: string[] = JSON.parse(tagline.dataset.lines || '[]');
async function cycleTaglines() {
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  if (reduced || lines.length < 2) return;
  for (let i = 0; ; i = (i + 1) % lines.length) {
    const line = lines[i];
    for (let n = 0; n <= line.length; n++) { tagline.textContent = line.slice(0, n); await wait(38); }
    await wait(3400);
    for (let n = line.length; n >= 0; n--) { tagline.textContent = line.slice(0, n); await wait(14); }
    await wait(350);
  }
}

/* ---------- Glass ---------- */
initGlass($<SVGSVGElement>('[data-glass-defs]'), $$('.nav [data-glass]'));

/* ---------- Board ---------- */
const boardEl = $('[data-board]');
const lightbox = $<HTMLDialogElement>('[data-lightbox]');
const lightboxImage = $<HTMLImageElement>('[data-lightbox-image]');
const board = new Board(boardEl, (src, alt) => {
  lightboxImage.src = src;
  lightboxImage.alt = alt;
  lightbox.showModal();
});
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });

let boardOpen = false;
let armed = true;

function openBoard() {
  if (boardOpen) return;
  setPanel(null);
  boardOpen = true;
  armed = false;
  root.classList.add('is-board');
  root.style.overflow = 'hidden';
  board.prepare();
  boardEl.focus({ preventScroll: true });
  window.setTimeout(() => { if (boardOpen) hero?.setVisible(false); }, 1000);
  updateCorner();
}

function closeBoard() {
  if (!boardOpen) return;
  boardOpen = false;
  root.classList.remove('is-board');
  root.style.overflow = '';
  hero?.setVisible(true);
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  updateCorner();
}

$('[data-board-close]').addEventListener('click', closeBoard);
$('[data-open-board]').addEventListener('click', () => {
  history.pushState(null, '', '/');
  openBoard();
});

/* ---------- Scroll tunnel ---------- */
const media = $('[data-hero-media]');
const hint = $('[data-tunnel-hint]');

function tunnelPath(p: number) {
  const e = ease(p);
  const W = innerWidth;
  const H = innerHeight;
  const ty = H * .3 * e;
  const tl = W * .05 * e;
  const tr = W - tl;
  const by = H - H * .37 * e;
  const bl = W * .2 * e;
  const br = W - bl;
  const span = by - ty;
  const f = (n: number) => n.toFixed(1);
  return `path('M${f(tl)} ${f(ty)}L${f(tr)} ${f(ty)}C${f(tr - (tr - br) * .55)} ${f(ty + span * .25)} ${f(br)} ${f(by - span * .35)} ${f(br)} ${f(by)}L${f(bl)} ${f(by)}C${f(bl)} ${f(by - span * .35)} ${f(tl + (bl - tl) * .55)} ${f(ty + span * .25)} ${f(tl)} ${f(ty)}Z')`;
}

let scrollQueued = false;
function onScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollP = max > 0 ? clamp01(scrollY / max) : 0;
    media.style.setProperty('--tunnel', scrollP > .001 ? tunnelPath(scrollP) : 'none');
    hint.style.setProperty('--hint', String(clamp01((scrollP - .35) * 3) * clamp01((1 - scrollP) * 8)));
    hero?.setDim(ease(scrollP));
    renderTyped(performance.now());
    if (scrollP < .85) armed = true;
    if (armed && scrollP > .995 && !boardOpen) openBoard();
  });
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);

/* ---------- Panels & routes ---------- */
const panels = new Map($$('[data-panel]').map((el) => [el.dataset.panel as Panel, el]));
const routeLinks = $$<HTMLAnchorElement>('[data-route]');
const data = JSON.parse($('#vs-data').textContent || '{}') as SiteData;
const titles: Record<string, string> = {
  home: `${data.name} — Software Engineer`,
  portfolio: `Portfolio — ${data.name}`,
  profile: `Profile — ${data.name}`,
};
let current: Panel | null = null;

function setPanel(panel: Panel | null) {
  current = panel;
  panels.forEach((el, name) => el.classList.toggle('is-open', name === panel));
  root.classList.toggle('is-panel', Boolean(panel));
  root.classList.toggle('has-route', Boolean(panel));
  if (panel) root.dataset.panel = panel; else delete root.dataset.panel;
  routeLinks.forEach((link) => {
    if (link.dataset.route === panel) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  hero?.setAscii(panel === 'profile');
  document.title = titles[panel ?? 'home'];
  updateCorner();
}

function pathFor(target: Panel | null) {
  return target ? `/${target}` : '/';
}

function navigate(target: 'home' | Panel | 'work') {
  if (target === 'work') {
    if (location.pathname !== '/') history.pushState(null, '', '/');
    openBoard();
    return;
  }
  if (boardOpen) closeBoard();
  const panel = target === 'home' ? null : target;
  const next = panel === current ? null : panel;
  if (location.pathname !== pathFor(next)) history.pushState(null, '', pathFor(next));
  setPanel(next);
  if (next) window.setTimeout(() => panels.get(next)?.focus({ preventScroll: true }), 50);
}

routeLinks.forEach((link) => link.addEventListener('click', (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(link.dataset.route as 'home' | Panel);
}));

addEventListener('popstate', () => {
  const name = location.pathname.replace(/^\/|\/$/g, '');
  if (boardOpen) closeBoard();
  setPanel(name === 'portfolio' || name === 'profile' ? name : null);
});

/* ---------- Corner button & keyboard ---------- */
const corner = $<HTMLButtonElement>('[data-corner]');
const terminal = new Terminal($('[data-terminal]'), data, navigate, () => updateCorner());

function updateCorner() {
  const closable = Boolean(current) || boardOpen || terminal.isOpen;
  root.classList.toggle('is-closable', closable);
  corner.setAttribute('aria-label', closable ? 'Close' : 'Open terminal');
}

function closeTop() {
  if (terminal.isOpen) terminal.close();
  else if (current) navigate('home');
  else if (boardOpen) closeBoard();
  else return false;
  return true;
}

corner.addEventListener('click', () => {
  if (!closeTop()) terminal.open();
});

addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    terminal.toggle();
    return;
  }
  if (event.key === 'Escape' && !lightbox.open) {
    if (closeTop()) event.preventDefault();
  }
});

/* ---------- Loader ---------- */
const loaderLine = $('[data-loader-line]');
const returning = root.classList.contains('is-returning');
let progress = 0;
const bump = (to: number) => {
  progress = Math.max(progress, to);
  loaderLine.style.setProperty('--progress', String(progress));
};
const minimum = new Promise((resolve) => setTimeout(resolve, returning || reduced ? 0 : 1100));
let fake = 0;
const creep = setInterval(() => { fake = Math.min(.85, fake + .07); bump(fake); }, 120);

Promise.all([
  document.fonts.ready.then(() => bump(.4)),
  (hero?.ready ?? Promise.resolve()).catch(() => undefined).then(() => bump(.7)),
  minimum,
]).then(() => {
  clearInterval(creep);
  bump(1);
  window.setTimeout(start, returning ? 0 : 380);
});

function start() {
  root.classList.add('is-ready');
  try { sessionStorage.setItem('vs-loaded', '1'); } catch { /* optional */ }
  hero?.setIntro(true);
  window.setTimeout(() => {
    typeStart = performance.now();
    requestAnimationFrame(renderTyped);
    void cycleTaglines();
  }, returning ? 150 : 500);
}

/* ---------- Initial state ---------- */
const initial = location.pathname.replace(/^\/|\/$/g, '');
if (initial === 'portfolio' || initial === 'profile') {
  root.classList.add('has-route');
  setPanel(initial);
}
if (location.hash === '#work') openBoard();
onScroll();
