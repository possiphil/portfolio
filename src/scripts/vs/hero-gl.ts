/**
 * WebGL hero: the portrait graded dark, with drifting light-painting arcs and smoke.
 * The same shader can render the scene as ASCII (used while the profile panel is open).
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * .5 + .5;
  gl_Position = vec4(aPos, 0., 1.);
}`;

const FRAG = `
precision highp float;
uniform sampler2D uImg;
uniform sampler2D uGlyphs;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uDim;
uniform float uAscii;
uniform float uIntro;
uniform vec2 uCell;
uniform float uGlyphCount;
uniform vec2 uFocus;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0., a = .5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; }
  return v;
}

vec2 cover(vec2 uv) {
  float a = uRes.x / uRes.y;
  if (a > 1.) {
    float h = 1. / a;
    float c = clamp(uFocus.y, h * .5, 1. - h * .5);
    return vec2(uv.x, c + (uv.y - .5) * h);
  }
  float c = clamp(uFocus.x, a * .5, 1. - a * .5);
  return vec2(c + (uv.x - .5) * a, uv.y);
}

vec3 scene(vec2 uv) {
  float a = uRes.x / uRes.y;
  vec2 p = uv * vec2(a, 1.);
  float t = uTime;
  vec2 q = vec2(fbm(uv * 3. + t * .05), fbm(uv * 3. + 7. - t * .04));
  vec3 c = texture2D(uImg, cover(uv + (q - .5) * .014 + (uMouse - .5) * .012)).rgb;
  float l = dot(c, vec3(.299, .587, .114));

  // Desaturate, deepen, then light warm from the right and cool from the left.
  vec3 base = pow(mix(vec3(l), c, .35), vec3(1.4)) * .8;
  float key = smoothstep(.2, .9, uv.x + (.5 - uv.y) * .25);
  vec3 g = base * mix(vec3(.5, .58, .66), vec3(1.2, .74, .46), key);

  vec2 cc = vec2(a * .5 + (uMouse.x - .5) * .06, .56 + (uMouse.y - .5) * .04);
  vec2 d = p - cc;
  float r = length(d);
  float ang = atan(d.y, d.x);
  float warm = 0.;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float R = .36 + fi * .15 + .04 * sin(ang * 2. + t * .23 + fi * 1.7) + .07 * (fbm(vec2(ang * 1.3 + fi * 3., t * .1)) - .5);
    float w = .014 + .035 * fbm(vec2(ang * 2.5, t * .18 + fi * 4.));
    float band = exp(-pow((r - R) / w, 2.));
    float arc = smoothstep(.15, .85, .5 + .5 * sin(ang + t * (.12 + fi * .05) + fi * 2.1));
    warm += band * arc * (.6 - fi * .12);
  }
  warm += .16 * exp(-pow((r - .55) / .25, 2.)) * (.5 + .5 * sin(ang + t * .09));
  vec3 warmCol = vec3(1., .42, .12);

  float smoke = fbm(p * 2.1 + vec2(t * .035, -t * .025) + q * 1.6);
  smoke = smoothstep(.42, .85, smoke) * smoothstep(.8, .05, uv.x) * .6;

  vec3 col = g + warmCol * warm + c * warmCol * warm * .3 + vec3(.55, .63, .68) * smoke * .4;
  float v = smoothstep(1.3, .3, length((uv - .5) * vec2(a * .75, 1.)));
  return col * mix(.3, 1., v);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec3 col = vec3(0.);
  float mask = 0.;
  if (uAscii > 0.) {
    vec2 cell = floor(fc / uCell);
    mask = step(hash(cell) * .45 + (1. - vUv.x) * .55, uAscii);
  }
  if (mask < 1.) col = scene(vUv);
  if (mask > 0.) {
    vec2 cell = floor(fc / uCell);
    vec2 cuv = fract(fc / uCell);
    vec3 sc = scene((cell + .5) * uCell / uRes);
    float l = smoothstep(.035, .55, dot(sc, vec3(.299, .587, .114)));
    float idx = floor(l * (uGlyphCount - 1.) + .5);
    float gly = texture2D(uGlyphs, vec2((idx + cuv.x) / uGlyphCount, cuv.y)).r;
    float warmth = clamp((sc.r - sc.b) * 3., 0., 1.);
    vec3 tint = mix(vec3(.86, .86, .83), vec3(1., .5, .16), warmth);
    col = gly * tint * (.3 + l * 1.1);
  }
  col *= uIntro * (1. - uDim * .82);
  col += (hash(fc + fract(uTime) * 100.) - .5) * .035;
  gl_FragColor = vec4(col, 1.);
}`;

const GLYPHS = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

export class HeroGL {
  private gl: WebGLRenderingContext;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private raf = 0;
  private start = performance.now();
  private last = 0;
  private mouse = { x: .5, y: .5, tx: .5, ty: .5 };
  private ascii = { value: 0, target: 0 };
  private intro = { value: 0, target: 0 };
  private dim = 0;
  private running = false;
  private visible = true;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private dpr = 1;

  static create(canvas: HTMLCanvasElement, src: string) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return undefined;
    try {
      return new HeroGL(canvas, gl, src);
    } catch (error) {
      console.warn('Hero shader unavailable', error);
      return undefined;
    }
  }

  readonly ready: Promise<void>;

  private constructor(private canvas: HTMLCanvasElement, gl: WebGLRenderingContext, src: string) {
    this.gl = gl;
    this.compile();
    this.glyphTexture();
    this.ready = this.imageTexture(src);
    this.resize();
    addEventListener('resize', () => this.resize());
    addEventListener('pointermove', (event) => {
      this.mouse.tx = event.clientX / innerWidth;
      this.mouse.ty = 1 - event.clientY / innerHeight;
    }, { passive: true });
    document.addEventListener('visibilitychange', () => (document.hidden ? this.stop() : this.play()));
    canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); this.stop(); });
  }

  private compile() {
    const { gl } = this;
    const shader = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'link');
    gl.useProgram(program);


    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    for (const name of ['uImg', 'uGlyphs', 'uRes', 'uTime', 'uMouse', 'uDim', 'uAscii', 'uIntro', 'uCell', 'uGlyphCount', 'uFocus']) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
    gl.uniform1i(this.uniforms.uImg, 0);
    gl.uniform1i(this.uniforms.uGlyphs, 1);
    gl.uniform1f(this.uniforms.uGlyphCount, GLYPHS.length);
    // Where the face sits in the portrait (0–1, y up). Tune for a different photo.
    gl.uniform2f(this.uniforms.uFocus, .5, .66);
  }

  private texture(unit: number, source: TexImageSource) {
    const { gl } = this;
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, unit === 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  private glyphTexture() {
    const w = 24;
    const h = 36;
    const atlas = document.createElement('canvas');
    atlas.width = w * GLYPHS.length;
    atlas.height = h;
    const ctx = atlas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, atlas.width, h);
    ctx.fillStyle = '#fff';
    ctx.font = '30px ui-monospace, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    [...GLYPHS].forEach((char, i) => ctx.fillText(char, i * w + w / 2, h / 2 + 1));
    this.texture(1, atlas);
  }

  private imageTexture(src: string) {
    return new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => { this.texture(0, image); resolve(); };
      image.onerror = reject;
      image.src = src;
    });
  }

  private resize() {
    this.dpr = Math.min(devicePixelRatio || 1, innerWidth < 720 ? 1.5 : 1.25);
    const w = Math.round(innerWidth * this.dpr);
    const h = Math.round(innerHeight * this.dpr);
    this.canvas.width = w;
    this.canvas.height = h;
    this.gl.viewport(0, 0, w, h);
    this.gl.uniform2f(this.uniforms.uRes, w, h);
    const cell = (innerWidth < 720 ? 6 : 8) * this.dpr;
    this.gl.uniform2f(this.uniforms.uCell, cell, cell * 1.5);
    if (!this.running) this.frame(performance.now());
  }

  setIntro(on: boolean) { this.intro.target = on ? 1 : 0; this.wake(); }
  setAscii(on: boolean) { this.ascii.target = on ? 1 : 0; this.wake(); }
  setDim(value: number) { this.dim = value; this.wake(); }
  setVisible(visible: boolean) {
    this.visible = visible;
    if (visible) this.play(); else this.stop();
  }

  play() {
    if (this.running || !this.visible || document.hidden) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame((now) => this.loop(now));
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** In reduced motion, draw just enough frames to settle a change. */
  private wake() {
    if (!this.reduced) return this.play();
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame((now) => this.loop(now));
  }

  private loop(now: number) {
    if (!this.running) return;
    const dt = Math.min((now - this.last) / 1000, .1);
    this.last = now;
    const settle = (s: { value: number; target: number }, speed: number) => {
      s.value += (s.target - s.value) * (1 - Math.exp(-dt * speed));
      if (Math.abs(s.target - s.value) < .002) s.value = s.target;
    };
    settle(this.intro, this.reduced ? 60 : 1.6);
    settle(this.ascii, this.reduced ? 60 : 2.4);
    this.mouse.x += (this.mouse.tx - this.mouse.x) * (1 - Math.exp(-dt * 2.5));
    this.mouse.y += (this.mouse.ty - this.mouse.y) * (1 - Math.exp(-dt * 2.5));
    this.frame(now);
    if (this.reduced && this.intro.value === this.intro.target && this.ascii.value === this.ascii.target) {
      this.running = false;
      return;
    }
    this.raf = requestAnimationFrame((next) => this.loop(next));
  }

  private frame(now: number) {
    const { gl, uniforms: u } = this;
    gl.uniform1f(u.uTime, this.reduced ? 12 : (now - this.start) / 1000);
    gl.uniform2f(u.uMouse, this.mouse.x, this.mouse.y);
    gl.uniform1f(u.uDim, this.dim);
    gl.uniform1f(u.uAscii, this.ascii.value);
    gl.uniform1f(u.uIntro, this.intro.value);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
