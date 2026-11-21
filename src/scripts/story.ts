import { dismissDialog, openDialog } from './dialogs';

const story = document.querySelector<HTMLElement>('[data-story]');
const stage = story?.querySelector<HTMLElement>('.story-stage');
const chapterToggle = story?.querySelector<HTMLButtonElement>('.chapter-toggle');
const sheet = document.querySelector<HTMLDialogElement>('#chapter-sheet');
const chapterLabel = story?.querySelector<HTMLElement>('[data-chapter-label]');
const wideStory = matchMedia('(min-width: 62.001rem) and (min-height: 36.001rem)');

if (story && stage) {
  const chapters = Array.from(story.querySelectorAll<HTMLElement>('.chapter'));
  const visuals = Array.from(stage.querySelectorAll<HTMLElement>('[data-visual]'));
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]'));
  const mobileChapters = typeof sheet?.showModal === 'function' && chapterToggle;

  let current = -1;
  let frame = 0;

  const updateStory = () => {
    frame = 0;
    const line = innerHeight * .55;
    const next = Math.max(0, chapters.findLastIndex((chapter) => chapter.getBoundingClientRect().top <= line));
    const bounds = story.getBoundingClientRect();
    if (mobileChapters) {
      mobileChapters.hidden = wideStory.matches || bounds.top > innerHeight * .82 || bounds.bottom < innerHeight * .48;
    }

    if (current === next || stage.contains(document.activeElement)) return;
    stage.dataset.direction = next < current ? 'up' : 'down';
    visuals.forEach((visual, index) => {
      visual.toggleAttribute('data-leaving', index === current);
      visual.toggleAttribute('data-active', index === next);
      visual.inert = index !== next;
    });

    const activeId = chapters[next]?.id;
    for (const link of links) {
      if (link.dataset.chapterLink === activeId) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }

    const activeLink = links.find((link) => link.dataset.chapterLink === activeId);
    if (chapterLabel && activeLink) chapterLabel.textContent = activeLink.textContent?.trim() ?? '';
    current = next;
  };

  const scheduleUpdate = () => { if (!frame) frame = requestAnimationFrame(updateStory); };
  const setLayout = () => {
    const wide = wideStory.matches;
    story.toggleAttribute('data-story-enhanced', wide);
    story.toggleAttribute('data-chapters-ready', Boolean(mobileChapters) && !wide);
    stage.hidden = !wide;
    if (wide && sheet?.open) dismissDialog(sheet, false);
    updateStory();
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('pageshow', scheduleUpdate);
  wideStory.addEventListener('change', setLayout);
  stage.addEventListener('focusout', scheduleUpdate);
  setLayout();
}

const dragArea = sheet?.querySelector<HTMLElement>('[data-sheet-drag]');
if (sheet && dragArea) {
  let drag: { pointerId: number; x: number; y: number } | undefined;

  dragArea.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch' || (event.target as Element).closest('button')) return;
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    dragArea.setPointerCapture(event.pointerId);
  });
  dragArea.addEventListener('pointerup', (event) => {
    if (drag?.pointerId === event.pointerId && event.clientY - drag.y > 44 && Math.abs(event.clientX - drag.x) < 70) {
      dismissDialog(sheet);
    }
    drag = undefined;
  });
  dragArea.addEventListener('pointercancel', () => { drag = undefined; });
}

const viewer = document.querySelector<HTMLDialogElement>('#image-viewer');
const pan = viewer?.querySelector<HTMLElement>('[data-view-pan]');
const file = viewer?.querySelector<HTMLElement>('[data-view-file]');
const zoomIn = viewer?.querySelector<HTMLButtonElement>('[data-zoom-in]');
const zoomOut = viewer?.querySelector<HTMLButtonElement>('[data-zoom-out]');
const zoomReset = viewer?.querySelector<HTMLButtonElement>('[data-zoom-reset]');
const status = viewer?.querySelector<HTMLElement>('[data-zoom-status]');
const viewerTitle = viewer?.querySelector<HTMLElement>('#viewer-title');

if (viewer && typeof viewer.showModal === 'function' && pan && file && zoomIn && zoomOut && zoomReset && status && viewerTitle) {
  const zoomLevels = [1, 1.5, 2, 3, 4];
  let step = 0;
  let original: HTMLImageElement | undefined;

  const updateZoom = () => {
    const zoom = zoomLevels[step] ?? 1;
    const x = (pan.scrollLeft + pan.clientWidth / 2) / Math.max(1, pan.scrollWidth);
    const y = (pan.scrollTop + pan.clientHeight / 2) / Math.max(1, pan.scrollHeight);

    if (original?.naturalWidth) {
      const fit = Math.min(1, (pan.clientWidth - 16) / original.naturalWidth, (pan.clientHeight - 16) / original.naturalHeight);
      file.style.setProperty('--view-width', `${original.naturalWidth * fit * zoom}px`);
      file.style.setProperty('--view-height', `${original.naturalHeight * fit * zoom}px`);
      pan.scrollTo({
        left: x * pan.scrollWidth - pan.clientWidth / 2,
        top: y * pan.scrollHeight - pan.clientHeight / 2,
        behavior: 'instant',
      });
    }

    const ready = Boolean(original?.naturalWidth);
    zoomOut.disabled = !ready || step === 0;
    zoomIn.disabled = !ready || step >= zoomLevels.length - 1;
    zoomReset.disabled = !ready || step === 0;
    const zoomLabel = `${zoom * 100}%`;
    zoomReset.textContent = step === 0 ? 'Fit' : zoomLabel;
    zoomReset.setAttribute('aria-label', step === 0 ? 'Fit image' : `${zoomLabel}, reset zoom`);
    status.textContent = ready ? (step === 0 ? 'Image fit to viewer' : `Zoom ${zoom * 100} percent`) : 'Loading image';
  };

  document.querySelectorAll<HTMLAnchorElement>('[data-view-image]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      step = 0;
      const thumbnail = link.querySelector('img');
      viewerTitle.textContent = link.classList.contains('frame-illustration') ? 'Concept illustration' : 'Image viewer';
      const image = new Image();
      image.alt = thumbnail?.alt ?? '';
      image.addEventListener('load', () => {
        if (image === original) updateZoom();
      });
      image.addEventListener('error', () => {
        if (image !== original) return;
        const fallback = document.createElement('a');
        fallback.href = link.href;
        fallback.textContent = 'Open original image';
        fallback.className = 'editorial-link';
        file.replaceChildren(fallback);
        status.textContent = 'Image could not be loaded in the viewer';
      });
      original = image;
      file.replaceChildren(image);
      openDialog(viewer, link);
      updateZoom();
      image.src = link.href;
    });
  });

  zoomIn.addEventListener('click', () => {
    step = Math.min(step + 1, zoomLevels.length - 1);
    updateZoom();
    if (zoomIn.disabled) zoomOut.focus({ preventScroll: true });
  });
  zoomOut.addEventListener('click', () => {
    step = Math.max(step - 1, 0);
    updateZoom();
    if (zoomOut.disabled) zoomIn.focus({ preventScroll: true });
  });
  zoomReset.addEventListener('click', () => {
    step = 0;
    updateZoom();
    zoomIn.focus({ preventScroll: true });
  });
  viewer.addEventListener('close', () => {
    if (viewer.open) return;
    file.replaceChildren();
    file.removeAttribute('style');
    original = undefined;
  });

  const refit = () => { if (viewer.open && original?.naturalWidth) updateZoom(); };
  window.addEventListener('resize', refit, { passive: true });
}
