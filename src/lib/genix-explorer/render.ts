import { centerOf, overlap, visibleWorld, worldToScreen, type Camera, type Rect } from './camera.ts';
import { type DetailSpec, type DiagramSpec, type Glyph, type SourceSpec } from './model.ts';
import { cameraFor, pathTo, revealProgress, smoothstep, type Portal, type Scene, type SceneLayout, type View } from './navigation.ts';

const svgNamespace = 'http://www.w3.org/2000/svg';
const glyphs: Record<Glyph, string> = {
  layers: 'M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5',
  input: 'M8 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8l-5-5H8Zm6 0v6h6M8 13h8M8 17h6',
  graph: 'M5 8h4v4H5zM15 3h4v4h-4zM15 17h4v4h-4zM9 10h3m0 0V5h3m-3 5v9h3',
  kernel: 'M12 2 2 7.5l10 5.5 10-5.5L12 2ZM2 12l10 5.5L22 12M2 16.5 12 22l10-5.5M12 6v3m-3-1.5h6',
  output: 'm3 7 9-5 9 5v10l-9 5-9-5V7Zm0 0 9 5 9-5m-9 5v10M7.5 4.5l9 5',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18',
  detail: 'm12 2 10 10-10 10L2 12 12 2Zm0 6v8m-4-4h8',
};

function svg<K extends keyof SVGElementTagNameMap>(
  name: K, attributes: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(svgNamespace, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

function element<K extends keyof HTMLElementTagNameMap>(
  name: K, className: string, value?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(name);
  node.className = className;
  if (value) node.textContent = value;
  return node;
}

function icon(glyph: Glyph): SVGSVGElement {
  const drawing = svg('svg', {
    'aria-hidden': 'true', class: 'gx-glyph', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': 1.15, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  });
  drawing.append(svg('path', { d: glyphs[glyph] }));
  return drawing;
}

function mountBounds(node: HTMLElement, { x, y, width, height }: Rect): void {
  Object.assign(node.style, { left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px` });
}

function openButton(className: string, portal: Portal, label?: string): HTMLButtonElement {
  const button = element('button', className);
  button.type = 'button';
  button.dataset.open = portal.scene.spec.id;
  if (label) button.setAttribute('aria-label', label);
  return button;
}

function ornament(): SVGSVGElement {
  const art = svg('svg', { 'aria-hidden': 'true', class: 'gx-engraving', viewBox: '0 0 166 166', fill: 'none' });
  art.append(
    svg('circle', { cx: 83, cy: 83, r: 73, class: 'gx-orbit' }),
    svg('circle', { cx: 83, cy: 83, r: 62, class: 'gx-orbit gx-orbit--inner' }),
    svg('path', { d: 'M83 0v34m0 98v34M0 83h25m116 0h25M28 28l12 12m86 86 12 12m0-110-12 12m-86 86-12 12', class: 'gx-orbit' }),
    svg('path', {
      d: 'm83 38 56 29-56 29-56-29 56-29Zm-56 40 56 29 56-29M27 89l56 29 56-29M27 100l56 29 56-29m-56-49 32 16-32 17-32-17 32-16Zm0 9 14 7-14 8-14-8 14-7Z',
      class: 'gx-engraving__stack',
    }),
    svg('circle', { cx: 83, cy: 67, r: 2, class: 'gx-engraving__core' }),
  );
  return art;
}

function renderTile(portal: Portal): HTMLButtonElement {
  const { spec } = portal.scene;
  const button = openButton('gx-tile', portal);
  mountBounds(button, portal.local);
  const shell = element('span', 'gx-tile__shell');
  const copy = element('span', 'gx-tile__copy');
  const title = element('span', 'gx-tile__title', spec.title);
  const caption = element('span', 'gx-tile__caption', portal.caption);
  const cue = element('span', 'gx-tile__cue');
  cue.setAttribute('aria-hidden', 'true');
  copy.append(icon(spec.glyph), title, caption, cue);
  button.append(shell, copy);
  if (portal.featured) {
    button.dataset.featured = '';
    button.insertBefore(ornament(), copy);
  }
  return button;
}

function connectors(scene: Scene, spec: DiagramSpec, view: View): SVGSVGElement {
  const drawing = svg('svg', {
    'aria-hidden': 'true', class: 'gx-links', width: scene.frame.width / scene.unit, height: scene.frame.height / scene.unit,
  });
  const regions = new Map(scene.portals.map((portal) => [portal.scene.spec.id, portal]));
  const compact = view.profile === 'compact';
  for (const [fromId, toId] of spec.links) {
    const from = regions.get(fromId);
    const to = regions.get(toId);
    if (!from || !to) continue;
    const a = centerOf(from.local);
    const b = centerOf(to.local);
    const start = compact ? { x: a.x, y: from.local.y + from.local.height } : { x: from.local.x + from.local.width, y: a.y };
    const end = compact ? { x: b.x, y: to.local.y } : { x: to.local.x, y: b.y };
    const center = compact
      ? { x: start.x, y: (start.y + end.y) / 2 }
      : { x: (start.x + end.x) / 2, y: start.y };
    const curve = compact
      ? `M${start.x} ${start.y} C${start.x} ${center.y} ${end.x} ${center.y} ${end.x} ${end.y}`
      : `M${start.x} ${start.y} C${center.x} ${start.y} ${center.x} ${end.y} ${end.x} ${end.y}`;
    const group = svg('g', { class: from.featured || to.featured ? 'gx-link--featured' : 'gx-link' });
    group.append(
      svg('path', { d: curve }),
      svg('circle', { cx: start.x, cy: start.y, r: 2 }),
      svg('circle', { cx: end.x, cy: end.y, r: 2 }),
      svg('path', { class: 'gx-link__joint', d: `m${center.x} ${center.y - 3} 3 3-3 3-3-3Z` }),
    );
    drawing.append(group);
  }
  return drawing;
}

function highlighted(code: string): HTMLElement {
  const line = element('code', 'gx-code');
  line.dataset.selectable = '';
  const tokens = /\b(?:static|int|var|return)\b|\b[A-Z]\w*\b|[+*=]/g;
  let start = 0;
  for (const match of code.matchAll(tokens)) {
    const token = match[0];
    line.append(code.slice(start, match.index));
    const role = token.length === 1 ? 'operator' : /^[A-Z]/.test(token) ? 'identifier' : 'keyword';
    line.append(element('span', `gx-token--${role}`, token));
    start = match.index + token.length;
  }
  line.append(code.slice(start));
  return line;
}

function renderSource(scene: Scene, spec: SourceSpec): HTMLElement {
  const face = element('div', 'gx-source');
  const header = element('div', 'gx-source__header');
  header.append(icon('code'), element('span', 'gx-source__file', spec.file), element('span', 'gx-source__language', 'C#'));
  const list = element('ol', 'gx-source__lines');
  list.setAttribute('aria-label', 'Illustrative C# source');
  for (const [index, line] of spec.lines.entries()) {
    const row = element('li', 'gx-source__row');
    const number = element('span', 'gx-source__number', String(index + 1).padStart(2, '0'));
    number.setAttribute('aria-hidden', 'true');
    row.append(number, highlighted(line.code));
    const portal = scene.portals.find(({ scene: child }) => child.spec.id === line.statement?.id);
    if (portal) {
      const button = openButton('gx-source__inspect', portal, `Inspect line ${index + 1}. ${portal.scene.spec.title}`);
      button.append(icon('detail'));
      row.dataset.statement = '';
      row.append(button);
    }
    list.append(row);
  }
  face.append(header, list);
  return face;
}

function renderDetail(spec: DetailSpec): HTMLElement {
  const card = element('div', 'gx-detail');
  const header = element('div', 'gx-detail__header');
  header.append(icon(spec.glyph), element('span', 'gx-detail__label', spec.label));
  card.append(header);
  if (spec.sample) card.append(highlighted(spec.sample));
  card.append(element('p', 'gx-detail__text', spec.description));
  if (spec.note) card.append(element('p', 'gx-detail__note', spec.note));
  return card;
}

interface MountedScene {
  node: HTMLElement;
  links?: SVGSVGElement;
  source?: HTMLElement;
  tiles: ReadonlyMap<string, HTMLButtonElement>;
}

export class SceneRenderer {
  private mounted = new Map<string, MountedScene>();
  private shown = new Set<string>();

  constructor(private world: HTMLElement, private viewport: HTMLElement) {}

  reset(profile: View['profile']): void {
    if (this.world.contains(document.activeElement)) this.viewport.focus({ preventScroll: true });
    this.world.replaceChildren();
    this.world.dataset.profile = profile;
    this.mounted.clear();
    this.shown.clear();
  }

  private mount(scene: Scene, view: View): MountedScene {
    const { spec } = scene;
    const node = element('div', `gx-scene gx-scene--${spec.kind}`);
    node.dataset.scene = spec.id;
    node.style.width = `${scene.frame.width / scene.unit}px`;
    node.style.height = `${scene.frame.height / scene.unit}px`;
    const tiles = new Map<string, HTMLButtonElement>();
    const parts: MountedScene = { node, tiles };
    if (spec.kind === 'diagram') {
      parts.links = connectors(scene, spec, view);
      node.append(parts.links);
      for (const portal of scene.portals) {
        const tile = renderTile(portal);
        tiles.set(portal.scene.spec.id, tile);
        node.append(tile);
      }
    } else if (spec.kind === 'source') {
      parts.source = renderSource(scene, spec);
      node.append(parts.source);
    } else {
      node.append(renderDetail(spec));
    }
    this.world.append(node);
    this.mounted.set(spec.id, parts);
    return parts;
  }

  render(layout: SceneLayout, camera: Camera, view: View, active: Scene): void {
    const visible = visibleWorld(camera, view);
    const activePath = new Set(pathTo(active));
    const showing = new Set<string>();

    const paint = (scene: Scene, opacity: number) => {
      if (opacity < 0.002 || !overlap(visible, scene.frame)) return;
      const id = scene.spec.id;
      const mounted = this.mounted.get(id) ?? this.mount(scene, view);
      showing.add(id);
      // Compose the camera and local transforms before paint so browsers rasterize
      // type at the projected size even when the world zoom is several hundredfold.
      const origin = worldToScreen(scene.frame, camera, view);
      mounted.node.style.transform = `translate(${origin.x}px, ${origin.y}px) scale(${camera.zoom * scene.unit})`;
      this.setInteractive(mounted.node, scene === active);
      mounted.node.hidden = false;
      mounted.node.style.opacity = String(opacity);
      let childReveal = 0;
      for (const portal of scene.portals) {
        const seen = overlap(visible, portal.bounds) > 0;
        const progress = seen && overlap(visible, portal.scene.frame)
          ? revealProgress(portal.scene, camera.zoom, view) : 0;
        const tile = mounted.tiles.get(portal.scene.spec.id);
        if (tile) {
          const hideTile = !seen || progress >= 1;
          if (hideTile && tile === document.activeElement) this.viewport.focus({ preventScroll: true });
          tile.hidden = hideTile;
          tile.toggleAttribute('data-current', activePath.has(portal.scene));
          tile.style.setProperty('--gx-chrome', String(1 - smoothstep(progress, 0, 0.64)));
          tile.style.setProperty('--gx-shell', String(1 - smoothstep(progress, 0.4, 1)));
        }
        childReveal = Math.max(childReveal, progress);
        paint(portal.scene, Math.min(opacity, progress));
      }
      if (mounted.links) {
        const relativeZoom = camera.zoom / cameraFor(scene, view).zoom;
        mounted.links.style.opacity = String(1 - smoothstep(relativeZoom, 1.3, 2.4));
      }
      if (mounted.source) {
        mounted.source.style.opacity = String(1 - smoothstep(childReveal, 0.08, 0.94));
        mounted.source.hidden = childReveal >= 1;
      }
    };

    paint(layout.root, 1);
    for (const id of this.shown) {
      if (showing.has(id)) continue;
      const node = this.mounted.get(id)?.node;
      if (node) {
        this.setInteractive(node, false);
        node.hidden = true;
      }
    }
    this.shown = showing;
  }

  private setInteractive(node: HTMLElement, enabled: boolean): void {
    if (!enabled && node.contains(document.activeElement)) this.viewport.focus({ preventScroll: true });
    node.inert = !enabled;
  }
}
