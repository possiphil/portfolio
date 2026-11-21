/**
 * Liquid-glass refraction for the pills. Chromium can apply an SVG filter as a
 * backdrop-filter; this builds a displacement map for each element's exact size
 * so the backdrop bends at the rounded edges. Other browsers keep the plain blur.
 */

function displacementMap(w: number, h: number, r: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const data = ctx.createImageData(w, h);
  const bezel = Math.min(h / 2, 10);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Signed distance to the rounded rectangle, and its gradient.
      const px = x + .5 - w / 2;
      const py = y + .5 - h / 2;
      const qx = Math.abs(px) - (w / 2 - r);
      const qy = Math.abs(py) - (h / 2 - r);
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const outside = Math.hypot(ox, oy);
      const dist = r - (outside + Math.min(Math.max(qx, qy), 0));
      let nx = 0;
      let ny = 0;
      if (outside > 0) {
        nx = ox / outside;
        ny = oy / outside;
      } else if (qx > qy) nx = 1; else ny = 1;
      nx *= Math.sign(px);
      ny *= Math.sign(py);
      const k = dist < bezel ? (1 - dist / bezel) ** 2 : 0;
      const i = (y * w + x) * 4;
      data.data[i] = 128 - nx * 127 * k;
      data.data[i + 1] = 128 - ny * 127 * k;
      data.data[i + 2] = 128;
      data.data[i + 3] = 255;
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL();
}

export function initGlass(defs: SVGSVGElement, elements: HTMLElement[]) {
  if (!document.documentElement.classList.contains('is-chromium')) return;
  const ns = 'http://www.w3.org/2000/svg';
  const cache = new Map<string, string>();

  const apply = () => {
    for (const el of elements) {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) continue;
      const w = Math.round(width);
      const h = Math.round(height);
      const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      const id = `glass-${w}x${h}r${Math.round(r * 10)}`;
      if (!cache.has(id)) {
        const filter = document.createElementNS(ns, 'filter');
        filter.id = id;
        for (const [k, v] of Object.entries({ x: '0', y: '0', width: String(w), height: String(h), filterUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' })) filter.setAttribute(k, v);
        const image = document.createElementNS(ns, 'feImage');
        for (const [k, v] of Object.entries({ href: displacementMap(w, h, r), x: '0', y: '0', width: String(w), height: String(h), result: 'map', preserveAspectRatio: 'none' })) image.setAttribute(k, v);
        const displace = document.createElementNS(ns, 'feDisplacementMap');
        for (const [k, v] of Object.entries({ in: 'SourceGraphic', in2: 'map', scale: String(Math.min(h, 18)), xChannelSelector: 'R', yChannelSelector: 'G' })) displace.setAttribute(k, v);
        filter.append(image, displace);
        defs.append(filter);
        cache.set(id, id);
      }
      el.style.setProperty('--glass', `blur(6px) url(#${id}) saturate(1.6) brightness(.85)`);
    }
  };

  let timer = 0;
  addEventListener('resize', () => {
    clearTimeout(timer);
    timer = window.setTimeout(apply, 200);
  });
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = window.setTimeout(apply, 120);
  }).observe(document.querySelector('.nav')!);
  apply();
}
