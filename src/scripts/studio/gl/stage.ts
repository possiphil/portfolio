import { CanvasTexture, type IUniform, LinearFilter, Mesh, NoColorSpace, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Texture, Vector2, WebGLRenderer } from 'three';
import { atmosphereFragment, mediaFragment, textFragment, vertex } from './shaders';

type Kind = 'atmos' | 'text' | 'media';

export interface GlItem {
  el: HTMLElement;
  kind: Kind;
  mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  uniforms: Record<string, IUniform>;
  /** Extra pixels drawn around the element (text overflows its line box). */
  pad: number;
  fixed: boolean;
  hover: number;
  hoverTarget: number;
}

const MEDIA_VARIANTS: Record<string, number> = { cover: 0, crt: 1, thumb: 2, smear: 3 };
const ATMOS_VARIANTS: Record<string, number> = { hero: 0, spot: 1, case: 2 };

export class Stage {
  readonly renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);
  private geometry = new PlaneGeometry(1, 1);
  private items: GlItem[] = [];
  private byEl = new Map<HTMLElement, GlItem>();
  private width = 0;
  private height = 0;
  private dpr = 1;
  mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.sortObjects = true;
    this.resize();

    window.addEventListener('pointermove', (e) => {
      this.mouse.tx = e.clientX / window.innerWidth;
      this.mouse.ty = 1 - e.clientY / window.innerHeight;
    }, { passive: true });
  }

  collect(root: ParentNode = document) {
    const els = root.querySelectorAll<HTMLElement>('[data-gl-atmos], [data-gl-text], [data-gl-media]');
    els.forEach((el, order) => {
      if (this.byEl.has(el)) return;
      if (el.hasAttribute('data-gl-atmos')) this.addAtmos(el, order);
      else if (el.hasAttribute('data-gl-text')) this.addText(el, order);
      else this.addMedia(el, order);
    });
  }

  get(el: Element | null) {
    return el ? this.byEl.get(el as HTMLElement) : undefined;
  }

  private baseUniforms() {
    return {
      uTime: { value: 0 },
      uSize: { value: new Vector2(1, 1) },
      uDpr: { value: this.dpr },
      uReveal: { value: 0 },
      uMouse: { value: new Vector2(0.5, 0.5) },
    };
  }

  private register(el: HTMLElement, kind: Kind, fragmentShader: string, uniforms: Record<string, IUniform>, order: number, fixed = false) {
    const material = new ShaderMaterial({ vertexShader: vertex, fragmentShader, uniforms, transparent: true, depthTest: false, depthWrite: false });
    const mesh = new Mesh(this.geometry, material);
    mesh.renderOrder = fixed ? -1 : order;
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    const item: GlItem = { el, kind, mesh, uniforms, pad: 0, fixed, hover: 0, hoverTarget: 0 };
    this.items.push(item);
    this.byEl.set(el, item);
    el.addEventListener('pointerenter', () => { item.hoverTarget = 1; });
    el.addEventListener('pointerleave', () => { item.hoverTarget = 0; });
    return item;
  }

  private addAtmos(el: HTMLElement, order: number) {
    const variant = ATMOS_VARIANTS[el.dataset.glAtmos ?? 'hero'] ?? 0;
    const uniforms = {
      ...this.baseUniforms(),
      uIntro: { value: variant === 0 ? 0 : 1 },
      uFade: { value: 0 },
      uVariant: { value: variant },
      uHue: { value: Number(el.dataset.hue ?? 186) },
    };
    this.register(el, 'atmos', atmosphereFragment, uniforms, order, variant === 0);
  }

  private addText(el: HTMLElement, order: number) {
    const uniforms = {
      ...this.baseUniforms(),
      uTex: { value: null as Texture | null },
      uGrain: { value: el.hasAttribute('data-grain') ? 1 : 0 },
    };
    const item = this.register(el, 'text', textFragment, uniforms, order + 1000);
    this.drawText(item);
  }

  private addMedia(el: HTMLElement, order: number) {
    const img = el.querySelector('img');
    const uniforms = {
      ...this.baseUniforms(),
      uTex: { value: null as Texture | null },
      uImage: { value: new Vector2(1, 1) },
      uVariant: { value: MEDIA_VARIANTS[el.dataset.variant ?? 'cover'] ?? 0 },
      uVelocity: { value: 0 },
      uParallax: { value: 0 },
      uHover: { value: 0 },
    };
    const item = this.register(el, 'media', mediaFragment, uniforms, order);
    item.mesh.visible = false;
    if (!img) return;
    const ready = async () => {
      // An <img> can report its layout size to WebGL; a bitmap always carries the decoded pixel size.
      const bitmap = await createImageBitmap(img, { imageOrientation: 'flipY' });
      const texture = new Texture(bitmap);
      texture.flipY = false;
      texture.colorSpace = NoColorSpace;
      texture.minFilter = LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      uniforms.uTex.value = texture;
      uniforms.uImage.value.set(bitmap.width, bitmap.height);
    };
    if (img.complete && img.naturalWidth) void ready();
    else img.addEventListener('load', () => void ready(), { once: true });
  }

  /** Paints an element's single line of text into a canvas texture that matches the DOM layout. */
  private drawText(item: GlItem) {
    const el = item.el;
    const style = getComputedStyle(el);
    const raw = el.textContent?.trim() ?? '';
    const text = style.textTransform === 'uppercase' ? raw.toUpperCase() : raw;
    const rect = el.getBoundingClientRect();
    const fontSize = parseFloat(style.fontSize);
    const pad = Math.ceil(fontSize * 0.3);
    item.pad = pad;

    const range = document.createRange();
    range.selectNodeContents(el);
    const textRect = range.getBoundingClientRect();

    const dpr = Math.min(window.devicePixelRatio, 2);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil((rect.width + pad * 2) * dpr));
    canvas.height = Math.max(1, Math.ceil((rect.height + pad * 2) * dpr));
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = style.letterSpacing;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff';
    const metrics = ctx.measureText(text);
    const x = textRect.left - rect.left + pad;
    const baseline = textRect.top - rect.top + metrics.fontBoundingBoxAscent + pad;
    ctx.fillText(text, x, baseline);

    const old = item.uniforms.uTex.value as Texture | null;
    old?.dispose();
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = NoColorSpace;
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    item.uniforms.uTex.value = texture;
  }

  resize() {
    this.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.clientHeight || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.left = -this.width / 2;
    this.camera.right = this.width / 2;
    this.camera.top = this.height / 2;
    this.camera.bottom = -this.height / 2;
    this.camera.updateProjectionMatrix();
    for (const item of this.items) {
      item.uniforms.uDpr.value = this.dpr;
      if (item.kind === 'text') this.drawText(item);
    }
  }

  render(time: number, velocity: number) {
    const m = this.mouse;
    m.x += (m.tx - m.x) * 0.06;
    m.y += (m.ty - m.y) * 0.06;
    const vh = this.height;
    const heroFade = Math.min(1, Math.max(0, window.scrollY / (vh * 1.6)));

    for (const item of this.items) {
      const u = item.uniforms;
      u.uTime.value = time;
      item.hover += (item.hoverTarget - item.hover) * 0.08;

      if (item.fixed) {
        item.mesh.scale.set(this.width, this.height, 1);
        item.mesh.position.set(0, 0, 0);
        u.uSize.value.set(this.width, this.height);
        u.uMouse.value.set(m.x, m.y);
        u.uFade.value = heroFade * 0.72;
        continue;
      }

      const r = item.el.getBoundingClientRect();
      const pad = item.pad;
      const w = r.width + pad * 2;
      const h = r.height + pad * 2;
      const visible = r.bottom + pad > 0 && r.top - pad < vh && r.width > 0;
      const ready = item.kind !== 'media' || Boolean(u.uTex.value);
      item.mesh.visible = visible && ready && (item.kind === 'atmos' || u.uReveal.value > 0.001);
      if (!item.mesh.visible) continue;

      item.mesh.scale.set(w, h, 1);
      item.mesh.position.set(r.left - pad + w / 2 - this.width / 2, vh / 2 - (r.top - pad + h / 2), 0);
      u.uSize.value.set(w, h);
      u.uMouse.value.set((m.tx * this.width - r.left) / r.width, ((1 - m.ty) * vh - r.top) / r.height);

      if (item.kind === 'media') {
        u.uVelocity.value += (velocity - u.uVelocity.value) * 0.1;
        u.uParallax.value = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        u.uHover.value = item.hover;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
