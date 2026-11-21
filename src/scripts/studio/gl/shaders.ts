/* GLSL for the WebGL stage. Every effect is a full-quad shader on a plane that follows a DOM rect. */

export const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// 3D simplex noise: Ian McEwan, Ashima Arts (MIT). Ordered dithering via the recursive Bayer trick.
const common = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
#define bayer4(a) (bayer2(0.5 * (a)) * 0.25 + bayer2(a))
#define bayer8(a) (bayer4(0.5 * (a)) * 0.25 + bayer2(a))

vec3 hsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

// Blocky dissolve used by text and media reveals. Returns 1 where the pixel is shown.
float dissolve(vec2 uv, vec2 size, float progress, float cell, float time) {
  vec2 c = floor(uv * size / cell);
  float n = hash(c) * 0.55 + 0.45 * (snoise(vec3(uv * vec2(size.x / size.y, 1.0) * 2.2, 0.0)) * 0.5 + 0.5);
  float edge = 0.14;
  float p = progress * (1.0 + edge);
  float solid = step(n, p - edge);
  float fringe = step(n, p) - solid;
  return solid + fringe * step(0.45, hash(c + floor(time * 24.0)));
}
`;

/* -------------------------------------------------------------- atmosphere
 * uVariant 0: flowing dithered band (hero, fixed full screen)
 * uVariant 1: light cone from the top (skills)
 * uVariant 2: band tinted by uHue (project without cover)
 */
export const atmosphereFragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uIntro;
uniform float uFade;
uniform float uVariant;
uniform float uHue;
uniform float uDpr;
uniform vec2 uSize;
uniform vec2 uMouse;
${common}

void main() {
  float aspect = uSize.x / uSize.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * 0.05;
  float lum;

  if (uVariant < 0.5 || uVariant > 1.5) {
    vec2 q = p;
    q += 0.28 * vec2(snoise(vec3(p * 0.6, t)), snoise(vec3(p * 0.6 + 7.1, t)));
    float curve = 0.38 * sin(q.x * 1.1 + t * 4.0) + 0.2 * q.x * q.x - 0.08;
    float d = q.y - curve;
    float width = 0.16 + 0.07 * snoise(vec3(q.x * 0.8, 3.0, t * 2.0));
    float band = exp(-d * d / (width * width));
    band *= 0.7 + 0.3 * snoise(vec3(q * 1.2, t * 1.6));
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
    float glow = exp(-dot(p - m, p - m) * 6.0) * 0.12;
    lum = pow(band, 1.35) * 0.92 + glow + 0.035;
  } else {
    float y = 1.0 - vUv.y;
    float width = 0.12 + y * 0.55;
    float cone = exp(-pow(p.x / width, 2.0) * 1.6) * smoothstep(1.1, 0.0, y);
    cone *= 0.7 + 0.3 * snoise(vec3(p * 1.6, t * 2.0));
    lum = cone * 1.05;
  }

  // Ordered dither plus animated grain gives the woven, printed texture.
  vec2 px = gl_FragCoord.xy / max(uDpr, 1.0);
  float threshold = mix(bayer4(px), hash(px + fract(uTime * 7.0) * 91.0), 0.6);
  float levels = 5.0;
  float dithered = floor(clamp(lum, 0.0, 1.0) * levels + threshold) / levels;

  float hue = uVariant > 1.5 ? uHue / 360.0 : 0.51;
  vec3 dark = hsv2rgb(vec3(hue, 0.85, uVariant > 1.5 ? 0.12 : 0.1));
  vec3 light = hsv2rgb(vec3(hue, uVariant > 1.5 ? 0.3 : 0.1, 0.8));
  if (uVariant > 0.5 && uVariant < 1.5) { dark = vec3(0.0); light = vec3(0.78, 0.8, 0.8); }

  float vignette = smoothstep(1.3, 0.1, length(p * vec2(0.75, 1.1)));
  vec3 color = mix(dark * (0.35 + 0.65 * vignette), light, dithered);
  color *= uIntro * (1.0 - uFade);
  gl_FragColor = vec4(color, 1.0);
}
`;

/* -------------------------------------------------------------- text */
export const textFragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uReveal;
uniform float uGrain;
uniform float uTime;
uniform float uDpr;
uniform vec2 uSize;
${common}

void main() {
  float a = texture2D(uTex, vUv).a;
  if (a < 0.01) discard;
  a *= dissolve(vUv, uSize, uReveal, 5.0, uTime);

  vec3 color = vec3(0.95, 0.97, 0.96);
  if (uGrain > 0.0) {
    // Lit from the top centre like a stage spot, then dithered.
    vec2 px = gl_FragCoord.xy / max(uDpr, 1.0);
    float light = 0.35 + 0.65 * smoothstep(1.2, 0.0, abs(vUv.x - 0.5) * 1.6);
    light *= 0.75 + 0.25 * snoise(vec3(vUv * vec2(uSize.x / uSize.y, 1.0) * 1.5, uTime * 0.12));
    float threshold = mix(bayer8(px), hash(px + fract(uTime * 5.0) * 17.0), 0.5);
    float level = floor(light * 3.0 + threshold) / 3.0;
    color *= mix(1.0, 0.25 + 0.75 * level, uGrain);
  }
  gl_FragColor = vec4(color, a);
}
`;

/* -------------------------------------------------------------- media
 * uVariant 0: cover with parallax and scroll-velocity wave (project panels)
 * uVariant 1: curved CRT screen (reel)
 * uVariant 2: thumbnail with glitch reveal
 * uVariant 3: monochrome motion smear (portrait)
 */
export const mediaFragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uSize;
uniform vec2 uImage;
uniform float uReveal;
uniform float uVariant;
uniform float uTime;
uniform float uVelocity;
uniform float uParallax;
uniform float uHover;
uniform float uDpr;
uniform vec2 uMouse;
${common}

vec2 cover(vec2 uv, float zoom) {
  float rp = uSize.x / uSize.y;
  float ri = uImage.x / uImage.y;
  vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
  return (uv - 0.5) * s / zoom + 0.5;
}

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec3 sampleTex(vec2 uv) { return texture2D(uTex, clamp(uv, 0.001, 0.999)).rgb; }

void main() {
  vec2 uv = vUv;
  float alpha = 1.0;
  vec3 color;

  if (uVariant > 0.5 && uVariant < 1.5) {
    // CRT: barrel distortion, rounded glass, scanlines, chroma split.
    vec2 cc = uv - 0.5;
    float r2 = dot(cc, cc);
    vec2 bent = 0.5 + cc * (1.0 + 0.22 * r2) * (0.97 - 0.03 * uHover);
    float pix = mix(70.0, 1.0, smoothstep(0.0, 1.0, uReveal));
    vec2 grid = uSize / pix;
    vec2 suv = pix > 1.5 ? (floor(bent * grid) + 0.5) / grid : bent;
    vec2 base = cover(suv, 1.08);
    base.y += uParallax * 0.03;
    float split = 0.0025 + 0.004 * uHover;
    vec3 c = vec3(sampleTex(base + vec2(split, 0.0)).r, sampleTex(base).g, sampleTex(base - vec2(split, 0.0)).b);
    float g = dot(c, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(g) * vec3(0.72, 0.9, 0.9), c, 0.25);
    color = (color - 0.5) * 1.15 + 0.45;
    float scan = 0.9 + 0.1 * sin(gl_FragCoord.y / max(uDpr, 1.0) * 3.1 + uTime * 6.0);
    color *= scan;
    color += (hash(gl_FragCoord.xy + fract(uTime) * 50.0) - 0.5) * 0.09;
    color *= smoothstep(0.85, 0.25, length(cc * vec2(1.1, 1.3)));
    color *= 0.97 + 0.03 * sin(uTime * 40.0);
    float radius = 0.07;
    float aspect = uSize.x / uSize.y;
    float d = roundedBox((bent - 0.5) * vec2(aspect, 1.0), vec2(0.5 * aspect, 0.5) - 0.012, radius);
    alpha = 1.0 - smoothstep(-0.002, 0.002, d);
    alpha *= smoothstep(0.0, 0.25, uReveal);
  } else if (uVariant > 2.5) {
    // Motion smear: directional blur that drifts with noise and the pointer.
    vec2 base = cover(uv, 1.04);
    base.y += uParallax * 0.04;
    float drift = snoise(vec3(uv.y * 3.0, uv.x * 0.6, uTime * 0.18));
    float amount = (0.012 + 0.05 * smoothstep(-0.2, 1.0, drift) + abs(uVelocity) * 0.0008) * (1.0 - 0.6 * uHover);
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 14; i++) {
      float k = float(i) / 13.0 - 0.5;
      acc += sampleTex(base + vec2(k * amount, 0.0));
    }
    float g = dot(acc / 14.0, vec3(0.299, 0.587, 0.114));
    g = smoothstep(0.04, 0.92, g);
    g += (hash(gl_FragCoord.xy + fract(uTime) * 33.0) - 0.5) * 0.08;
    color = vec3(g) * 0.9;
    color *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
    alpha = dissolve(uv, uSize, uReveal, 6.0, uTime);
  } else {
    // Cover and thumbnails.
    float isThumb = step(1.5, uVariant);
    float wave = sin(uv.y * 8.0 + uTime * 2.0) * uVelocity * 0.00025 * (1.0 - isThumb);
    float pix = mix(isThumb > 0.5 ? 18.0 : 40.0, 1.0, smoothstep(0.0, 1.0, uReveal));
    vec2 grid = uSize / pix;
    vec2 suv = pix > 1.5 ? (floor(uv * grid) + 0.5) / grid : uv;
    vec2 base = cover(suv + vec2(wave, 0.0), isThumb > 0.5 ? 1.0 : 1.14);
    base.y += uParallax * 0.06 * (1.0 - isThumb);
    color = sampleTex(base);
    color *= mix(0.5, 1.0, smoothstep(0.0, 1.0, uReveal));
    if (isThumb > 0.5) alpha = dissolve(uv, uSize, uReveal, 4.0, uTime);
    else {
      color *= 0.55 + 0.45 * smoothstep(1.0, 0.6, vUv.y);
      color *= smoothstep(-0.2, 0.35, vUv.y);
    }
  }

  gl_FragColor = vec4(color, alpha);
}
`;
