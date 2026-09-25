// A banded gas giant, rendered live in WebGL. Plain WebGL 1 with no
// dependencies: one full-screen triangle and one fragment shader.
//
// Only the top of the planet shows, arcing across the bottom of the hero. The
// planet is tilted so that arc holds the banded latitudes (0–40°), and the
// bands are sampled from 3D noise on the sphere so they never show a seam.

const VERTEX = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAGMENT = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;      // drawing buffer, px
uniform float uTime;    // seconds
uniform vec3 uPlanet;   // centre (px, from bottom-left) and radius (px)
uniform float uTilt;    // radians: north pole tipped away from the viewer
uniform float uPx;      // buffer px per CSS px

float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), u.x),
        mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
    mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), u.x),
        mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), u.x), u.y),
    u.z);
}

float fbm3(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * noise3(p);
    p = p * 2.07 + vec3(3.1, 1.7, 5.3);
    a *= 0.5;
  }
  return s / 0.875;
}

float fbm5(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    s += a * noise3(p);
    p = p * 2.03 + vec3(1.7, 9.2, 4.4);
    a *= 0.5;
  }
  return s / 0.96875;
}

// Cloud tops: pale zones, tan and rust belts. Kept low in saturation so the
// page's own text stays the brightest thing on screen.
vec3 palette(float zone, float detail, float lat) {
  vec3 cream = vec3(0.90, 0.82, 0.68);
  vec3 tan = vec3(0.72, 0.54, 0.36);
  vec3 rust = vec3(0.50, 0.28, 0.16);
  vec3 umber = vec3(0.25, 0.14, 0.085);
  vec3 c = mix(rust, cream, smoothstep(0.38, 0.62, zone));
  c = mix(c, tan, smoothstep(0.3, 0.7, detail) * 0.5);
  c = mix(c, umber, smoothstep(0.58, 0.86, detail) * (1.0 - zone) * 0.85);
  c = mix(c, cream * 1.04, smoothstep(0.7, 0.95, detail) * zone * 0.5);
  // The higher latitudes grey towards the pole.
  c = mix(c, vec3(0.50, 0.49, 0.47), smoothstep(0.45, 0.75, lat) * 0.55);
  return c;
}

vec3 surface(vec3 n) {
  float ct = cos(uTilt);
  float st = sin(uTilt);
  vec3 m = vec3(n.x, n.y * ct - n.z * st, n.y * st + n.z * ct);
  float lat = asin(clamp(m.y, -1.0, 1.0));

  // Differential rotation: each latitude runs at its own speed, like the jets.
  float jet = sin(lat * 11.0) * 0.35 + sin(lat * 23.0 + 1.3) * 0.15;
  float ang = uTime * (0.010 + 0.006 * jet) + 0.6;
  float ca = cos(ang);
  float sa = sin(ang);
  vec3 p = vec3(m.x * ca - m.z * sa, m.y, m.x * sa + m.z * ca);

  // Thin along latitude, long along longitude.
  vec3 q = p * vec3(2.3, 14.0, 2.3);
  float warp = fbm3(q * 0.55 + vec3(0.0, 0.0, uTime * 0.004));

  // The storm: an oval that turns, carried along by its own band.
  float lat0 = 0.30;
  float lon = atan(p.x, p.z);
  float dlon = lon - 0.35;
  dlon = dlon - 6.2831853 * floor((dlon + 3.1415927) / 6.2831853);
  vec2 local = vec2(dlon * cos(lat0), lat - lat0);
  float e = length(local / vec2(0.17, 0.068));
  float inStorm = 1.0 - smoothstep(0.55, 1.25, e);
  float swirl = inStorm * (2.6 + uTime * 0.05);
  float cs = cos(swirl);
  float sn = sin(swirl);
  vec2 rl = vec2(local.x * cs - local.y * sn, local.x * sn + local.y * cs);
  vec3 sq = vec3(rl * vec2(18.0, 30.0), 7.0);

  float zone = sin(lat * 27.0 + warp * 3.8) * 0.5 + 0.5;
  float detail = fbm5(q + vec3(warp * 2.6, warp * 0.6, warp * 2.6));
  detail = mix(detail, fbm3(sq), inStorm);
  detail = smoothstep(0.18, 0.82, detail);
  // Fine streaks drawn out along longitude, the texture of the cloud tops.
  float streak = fbm3(p * vec3(7.0, 90.0, 7.0) + vec3(warp * 3.0));

  vec3 c = palette(zone, detail, lat);
  c *= 0.86 + 0.28 * streak;
  vec3 storm = mix(vec3(0.62, 0.26, 0.14), vec3(0.80, 0.46, 0.30), fbm3(sq * 1.3));
  c = mix(c, storm, inStorm * 0.85);
  // A pale collar around the storm, where the band flows past it.
  c = mix(c, vec3(0.88, 0.80, 0.67), (smoothstep(0.9, 1.15, e) - smoothstep(1.15, 1.6, e)) * 0.35);
  return c;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 d = frag - uPlanet.xy;
  float R = uPlanet.z;
  float r = length(d);
  vec3 sun = normalize(vec3(0.82, 0.36, 0.30));

  // Space: the page's own canvas colour, a few faint stars.
  vec3 space = vec3(0.043, 0.039, 0.031);
  vec3 col = space;
  vec2 css = frag / uPx;
  vec2 cell = floor(css / 3.0);
  float h = hash31(vec3(cell, 11.0));
  if (h > 0.9982) {
    vec2 f = fract(css / 3.0) - 0.5;
    float s = smoothstep(0.42, 0.0, length(f)) * (h - 0.9982) / 0.0018;
    col += s * vec3(0.55, 0.52, 0.48);
  }

  // Atmosphere: a thin warm rim on the sunlit edge, a wider faint haze.
  float height = max(r - R, 0.0);
  vec2 dir = d / max(r, 1.0);
  float edgeLight = smoothstep(-0.35, 0.85, dot(vec3(dir, 0.0), sun));
  float glow = exp(-height / (R * 0.0055)) * 0.62 + exp(-height / (R * 0.035)) * 0.1;
  col += vec3(0.96, 0.66, 0.42) * glow * edgeLight;

  // The disc, antialiased across about a pixel and a half.
  float cover = smoothstep(R + 1.25 * uPx, R - 1.25 * uPx, r);
  if (cover > 0.0) {
    float z = sqrt(max(R * R - r * r, 0.0));
    vec3 n = normalize(vec3(d, z));
    vec3 base = surface(n);
    float ndl = dot(n, sun);
    float lit = smoothstep(-0.14, 0.62, ndl);
    float limb = pow(max(n.z, 0.0), 0.3);
    vec3 surf = base * (0.022 + 0.978 * lit) * limb;
    float fres = pow(1.0 - max(n.z, 0.0), 3.0);
    surf += vec3(0.82, 0.58, 0.40) * fres * lit * 0.4;
    col = mix(col, surf, cover);
  }

  // Filmic shoulder, a gentle vignette, and grain to stop banding in the darks.
  col = 1.0 - exp(-col * 1.6);
  vec2 uv = frag / uRes;
  col *= mix(0.78, 1.0, smoothstep(1.15, 0.35, length((uv - vec2(0.55, 0.45)) * vec2(1.1, 1.25))));
  col += (hash31(vec3(frag, fract(uTime) * 13.0)) - 0.5) / 255.0 * 1.5;
  gl_FragColor = vec4(col, 1.0);
}
`

export interface Atmosphere {
  /** Draw continuously (capped at 30 fps) until stopped. */
  start: () => void
  stop: () => void
  /** Draw a single frame at a given time. */
  draw: (seconds?: number) => void
  resize: () => void
  destroy: () => void
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) console.warn(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/** Pixel budget for the drawing buffer: the atmosphere is soft, so it never needs full DPR. */
const PIXEL_BUDGET = 900_000
const FRAME_MS = 1000 / 30

export function createAtmosphere(canvas: HTMLCanvasElement, options: { preserve?: boolean } = {}): Atmosphere | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
    preserveDrawingBuffer: Boolean(options.preserve),
  })
  if (!gl) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(program, 'uRes')
  const uTime = gl.getUniformLocation(program, 'uTime')
  const uPlanet = gl.getUniformLocation(program, 'uPlanet')
  const uTilt = gl.getUniformLocation(program, 'uTilt')
  const uPx = gl.getUniformLocation(program, 'uPx')

  let frame = 0
  let running = false
  let last = 0
  let elapsed = 0

  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const scale = Math.min(dpr, Math.sqrt(PIXEL_BUDGET / (width * height)))
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    gl.viewport(0, 0, canvas.width, canvas.height)

    // Composition in CSS px, then into buffer px. Wide screens get a flatter
    // horizon with its peak right of centre; phones a rounder one.
    const wide = width >= 768
    const radius = wide ? Math.max(width * 1.05, height * 1.4) : Math.max(width * 1.7, height * 0.9)
    const peak = height * (wide ? 0.4 : 0.44)
    const cx = width * (wide ? 0.66 : 0.62)
    const cy = peak - radius
    // Tilt so the equator sits just below the bottom edge at the peak's column.
    const ny = 1 - peak / radius
    const tilt = Math.atan2(ny, Math.sqrt(Math.max(1 - ny * ny, 0))) + 0.06

    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform3f(uPlanet, cx * scale, cy * scale, radius * scale)
    gl.uniform1f(uTilt, tilt)
    gl.uniform1f(uPx, scale)
  }

  const draw = (seconds = elapsed) => {
    gl.uniform1f(uTime, seconds)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const tick = (now: number) => {
    if (!running) return
    frame = requestAnimationFrame(tick)
    const delta = now - last
    if (delta < FRAME_MS) return
    // Clamp long gaps (a hidden tab) so the planet doesn't jump when it resumes.
    elapsed += Math.min(delta, 100) / 1000
    last = now
    draw()
  }

  resize()
  draw()

  return {
    start() {
      if (running) return
      running = true
      last = performance.now()
      frame = requestAnimationFrame(tick)
    },
    stop() {
      running = false
      cancelAnimationFrame(frame)
    },
    draw,
    resize() {
      resize()
      draw()
    },
    destroy() {
      running = false
      cancelAnimationFrame(frame)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
