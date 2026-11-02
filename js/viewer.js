// Zoomable canvas viewer. Motion comes from js/motion.js; this file only
// loads images, draws, and handles the camera.
import { createSimulation, spriteCatalog, spriteCenter, WORLD } from './motion.js';

const canvas = document.getElementById('view');
const ctx = canvas.getContext('2d', { alpha: true });
const hintEl = document.getElementById('hint');
const playBtn = document.getElementById('play');
const resetBtn = document.getElementById('reset');

const TILE_AT = 0.42;
const MAX_OVERSCAN = 1.5;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const cam = { scale: 1, x: 0, y: 0 };
let currentDpr = 1;
let userAdjusted = false;
let fittedOnce = false;
let lastCW = 0;
let lastCH = 0;
let lastDpr = 0;
let playing = true;
let origin = performance.now();
let pausedAt = 0;
let sim = null;
let duration = 30;
let showActors = true;
let showShadows = true;
let zoomToken = 0;
let hintTimer = 0;

const images = new Map();
const sizes = {};
let preview = null;
let tileManifest = null;
const tileImages = new Map();
let pending = 0;
let ready = false;
let readyResolve;
const readyPromise = new Promise((resolve) => { readyResolve = resolve; });

const params = new URLSearchParams(location.search);

function rootUrl(rel) {
  return new URL(`../${String(rel).replace(/^\//, '')}`, import.meta.url).href;
}

function showError(message) {
  const el = document.getElementById('error');
  el.hidden = false;
  el.textContent = message;
  console.error(message);
}

function loopTime(now) {
  if (!playing) return pausedAt;
  const t = ((now - origin) / 1000) % duration;
  return t < 0 ? t + duration : t;
}

function setPlaying(on) {
  if (on === playing) return;
  if (on) {
    origin = performance.now() - pausedAt * 1000;
    playing = true;
    document.body.classList.remove('is-paused');
    playBtn.setAttribute('aria-label', 'Pause');
  } else {
    pausedAt = loopTime(performance.now());
    playing = false;
    document.body.classList.add('is-paused');
    playBtn.setAttribute('aria-label', 'Play');
  }
}

function dismissHint() {
  hintEl.classList.add('is-hidden');
  if (hintTimer) clearTimeout(hintTimer);
}

function fitScale() {
  return Math.min(canvas.clientWidth / WORLD.w, canvas.clientHeight / WORLD.h);
}

function maxScale() {
  const dpr = window.devicePixelRatio || 1;
  return Math.max(fitScale(), (1 / dpr) * MAX_OVERSCAN);
}

function clampScale(scale) {
  return Math.min(maxScale(), Math.max(fitScale(), scale));
}

function clampPan() {
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  const ww = WORLD.w * cam.scale;
  const hh = WORLD.h * cam.scale;
  if (ww <= cw) cam.x = (cw - ww) / 2;
  else cam.x = Math.min(0, Math.max(cw - ww, cam.x));
  if (hh <= ch) cam.y = (ch - hh) / 2;
  else cam.y = Math.min(0, Math.max(ch - hh, cam.y));
}

function frameFit() {
  cam.scale = fitScale();
  cam.x = (canvas.clientWidth - WORLD.w * cam.scale) / 2;
  cam.y = (canvas.clientHeight - WORLD.h * cam.scale) / 2;
}

function onResize() {
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  if (!cw || !ch) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const bw = Math.max(1, Math.round(cw * dpr));
  const bh = Math.max(1, Math.round(ch * dpr));
  const sizeChanged = cw !== lastCW || ch !== lastCH || dpr !== lastDpr;
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  currentDpr = dpr;
  if (!fittedOnce || !userAdjusted) {
    frameFit();
  } else if (sizeChanged) {
    const wx = (lastCW / 2 - cam.x) / cam.scale;
    const wy = (lastCH / 2 - cam.y) / cam.scale;
    cam.scale = clampScale(cam.scale);
    cam.x = cw / 2 - wx * cam.scale;
    cam.y = ch / 2 - wy * cam.scale;
    clampPan();
  }
  lastCW = cw;
  lastCH = ch;
  lastDpr = dpr;
  fittedOnce = true;
}

function zoomAt(clientX, clientY, scale) {
  const rect = canvas.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  const wx = (sx - cam.x) / cam.scale;
  const wy = (sy - cam.y) / cam.scale;
  cam.scale = clampScale(scale);
  cam.x = sx - wx * cam.scale;
  cam.y = sy - wy * cam.scale;
  clampPan();
}

function animateScale(clientX, clientY, target) {
  const token = ++zoomToken;
  const from = cam.scale;
  const to = clampScale(target);
  if (reduceMotion) {
    zoomAt(clientX, clientY, to);
    return;
  }
  const t0 = performance.now();
  const dur = 240;
  const step = (now) => {
    if (token !== zoomToken) return;
    const u = Math.min(1, (now - t0) / dur);
    const e = u * u * (3 - 2 * u);
    zoomAt(clientX, clientY, from + (to - from) * e);
    if (u < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function doubleZoom(clientX, clientY) {
  userAdjusted = true;
  dismissHint();
  zoomToken++;
  const fit = fitScale();
  const max = maxScale();
  const next = cam.scale >= max * 0.98 ? fit : Math.min(max, cam.scale * 2);
  animateScale(clientX, clientY, next);
}

function frameWorld(wx, wy, scale) {
  userAdjusted = true;
  zoomToken++;
  cam.scale = clampScale(scale);
  cam.x = canvas.clientWidth / 2 - wx * cam.scale;
  cam.y = canvas.clientHeight / 2 - wy * cam.scale;
  clampPan();
}

function loadImage(url, priority) {
  pending += 1;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    if (priority) img.fetchPriority = priority;
    img.onload = () => {
      pending -= 1;
      resolve(img);
    };
    img.onerror = () => {
      pending -= 1;
      console.error(`Failed to load ${url}`);
      reject(new Error(url));
    };
    img.src = url;
  });
}

function spriteUrl(id, assets) {
  const split = id.indexOf(':');
  const group = id.slice(0, split);
  const name = id.slice(split + 1);
  if (group === 'cab') {
    const rel = assets.cabSprites[name];
    if (!rel) throw new Error(`No asset for ${id}`);
    return rootUrl(rel);
  }
  const dir = assets.characters[group];
  if (!dir) throw new Error(`No sprite folder for ${group}`);
  return rootUrl(`${dir}/${name}.png`);
}

function deviceScale() {
  return currentDpr * cam.scale;
}

function visibleWorld() {
  return {
    x: -cam.x / cam.scale,
    y: -cam.y / cam.scale,
    w: canvas.clientWidth / cam.scale,
    h: canvas.clientHeight / cam.scale,
  };
}

function ensureTiles() {
  if (!tileManifest || deviceScale() < TILE_AT) return;
  const view = visibleWorld();
  const margin = tileManifest.tileSize;
  const x0 = view.x - margin;
  const y0 = view.y - margin;
  const x1 = view.x + view.w + margin;
  const y1 = view.y + view.h + margin;
  for (const tile of tileManifest.tiles) {
    if (tile.x + tile.w < x0 || tile.y + tile.h < y0 || tile.x > x1 || tile.y > y1) continue;
    if (tileImages.has(tile.file)) continue;
    const img = new Image();
    tileImages.set(tile.file, img);
    pending += 1;
    img.decoding = 'async';
    img.onload = () => { pending -= 1; };
    img.onerror = () => {
      pending -= 1;
      console.error(`Failed to load tile ${tile.file}`);
    };
    img.src = rootUrl(`assets/tiles/${tile.file}`);
  }
}

const shadowCache = new Map();

function shadowImage(w, h, alpha) {
  const key = `${w.toFixed(3)}|${h.toFixed(3)}|${alpha}`;
  const cached = shadowCache.get(key);
  if (cached) return cached;
  const sw = Math.max(1, Math.trunc(w * 1.4) + 8);
  const sh = Math.max(1, Math.trunc(h * 1.4) + 8);
  const c = document.createElement('canvas');
  c.width = sw;
  c.height = sh;
  const g = c.getContext('2d');
  g.filter = `blur(${Math.max(1, h * 0.18)}px)`;
  g.fillStyle = `rgba(20,15,10,${alpha / 255})`;
  g.beginPath();
  g.ellipse(sw / 2, sh / 2, Math.max(0.5, w / 2), Math.max(0.5, h / 2), 0, 0, Math.PI * 2);
  g.fill();
  g.filter = 'none';
  shadowCache.set(key, c);
  return c;
}

function paint(cmds) {
  const dpr = currentDpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!fittedOnce || !preview) return;
  ctx.setTransform(dpr * cam.scale, 0, 0, dpr * cam.scale, dpr * cam.x, dpr * cam.y);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(preview, 0, 0, WORLD.w, WORLD.h);
  if (tileManifest && deviceScale() >= TILE_AT) {
    const view = visibleWorld();
    for (const tile of tileManifest.tiles) {
      if (tile.x + tile.w < view.x || tile.y + tile.h < view.y || tile.x > view.x + view.w || tile.y > view.y + view.h) continue;
      const img = tileImages.get(tile.file);
      if (img && img.complete && img.naturalWidth) ctx.drawImage(img, tile.x, tile.y, tile.w, tile.h);
    }
  }
  if (!showActors || !cmds) return;
  for (const cmd of cmds) {
    if (cmd.type === 'shadow') {
      if (!showShadows) continue;
      const img = shadowImage(cmd.w, cmd.h, cmd.alpha);
      ctx.drawImage(img, cmd.x - img.width / 2, cmd.y - img.height / 2);
      continue;
    }
    const img = images.get(cmd.image);
    if (!img || cmd.alpha <= 0.001) continue;
    const place = spriteCenter(cmd);
    ctx.save();
    ctx.globalAlpha = cmd.alpha;
    ctx.translate(place.cx, place.cy);
    if (cmd.rotation) ctx.rotate(cmd.rotation * Math.PI / 180);
    ctx.drawImage(img, -cmd.w / 2, -cmd.h / 2, cmd.w, cmd.h);
    ctx.restore();
  }
}

function render(now) {
  if (!canvas.clientWidth) return;
  if (!fittedOnce) onResize();
  ensureTiles();
  const t = loopTime(now);
  const cmds = sim ? sim.sample(t) : null;
  paint(cmds);
}

function whenIdle() {
  ensureTiles();
  return new Promise((resolve) => {
    const check = () => {
      if (pending === 0) requestAnimationFrame(() => requestAnimationFrame(resolve));
      else setTimeout(check, 30);
    };
    check();
  });
}

const pointers = new Map();
let pinch = null;
let gestureMoved = 0;
let lastTap = null;
let lastDouble = 0;

function pinchInfo() {
  const pts = [...pointers.values()];
  const dx = pts[0].x - pts[1].x;
  const dy = pts[0].y - pts[1].y;
  return {
    dist: Math.hypot(dx, dy) || 1,
    midX: (pts[0].x + pts[1].x) / 2,
    midY: (pts[0].y + pts[1].y) / 2,
  };
}

function beginPinch() {
  const info = pinchInfo();
  const rect = canvas.getBoundingClientRect();
  const sx = info.midX - rect.left;
  const sy = info.midY - rect.top;
  pinch = {
    dist: info.dist,
    scale: cam.scale,
    wx: (sx - cam.x) / cam.scale,
    wy: (sy - cam.y) / cam.scale,
  };
}

function movePinch() {
  const info = pinchInfo();
  const rect = canvas.getBoundingClientRect();
  const scale = clampScale(pinch.scale * (info.dist / pinch.dist));
  const sx = info.midX - rect.left;
  const sy = info.midY - rect.top;
  cam.scale = scale;
  cam.x = sx - pinch.wx * scale;
  cam.y = sy - pinch.wy * scale;
  clampPan();
}

canvas.addEventListener('pointerdown', (e) => {
  if (e.button != null && e.button !== 0) return;
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  gestureMoved = 0;
  userAdjusted = true;
  zoomToken++;
  dismissHint();
  canvas.classList.add('is-dragging');
  if (pointers.size === 2) beginPinch();
});

canvas.addEventListener('pointermove', (e) => {
  const prev = pointers.get(e.pointerId);
  if (!prev) return;
  const dx = e.clientX - prev.x;
  const dy = e.clientY - prev.y;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  gestureMoved += Math.hypot(dx, dy);
  if (pointers.size >= 2 && pinch) movePinch();
  else if (pointers.size === 1) {
    cam.x += dx;
    cam.y += dy;
    clampPan();
  }
});

function endPointer(e) {
  const had = pointers.has(e.pointerId);
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (pointers.size === 0) canvas.classList.remove('is-dragging');
  if (!had || pointers.size > 0) return;
  // Pointer capture suppresses the browser's dblclick on some engines, so both
  // mouse and touch use this tap timer. The dblclick listener below is the fallback.
  if (gestureMoved < 8) {
    const now = performance.now();
    if (lastTap && now - lastTap.t < 300 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
      if (now - lastDouble > 350) {
        lastDouble = now;
        doubleZoom(e.clientX, e.clientY);
      }
      lastTap = null;
    } else {
      lastTap = { t: now, x: e.clientX, y: e.clientY };
    }
  }
}

canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('dblclick', (e) => {
  e.preventDefault();
  if (performance.now() - lastDouble < 350) return;
  lastDouble = performance.now();
  doubleZoom(e.clientX, e.clientY);
});

window.addEventListener('wheel', (e) => {
  if (e.target && e.target.closest && e.target.closest('button')) return;
  e.preventDefault();
  dismissHint();
  userAdjusted = true;
  zoomToken++;
  let dy = e.deltaY;
  if (e.deltaMode === 1) dy *= 16;
  else if (e.deltaMode === 2) dy *= 800;
  zoomAt(e.clientX, e.clientY, cam.scale * Math.exp(-dy * 0.0022));
}, { passive: false });

window.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
window.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });

window.addEventListener('keydown', (e) => {
  if (e.target && e.target.closest && e.target.closest('button')) return;
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    setPlaying(!playing);
  } else if (e.key === '0' || e.key === 'Home') {
    userAdjusted = false;
    frameFit();
  }
});

playBtn.addEventListener('click', () => setPlaying(!playing));
resetBtn.addEventListener('click', () => {
  userAdjusted = false;
  zoomToken++;
  frameFit();
  dismissHint();
});

new ResizeObserver(() => onResize()).observe(canvas);

function markReady() {
  if (ready) return;
  ready = true;
  document.body.classList.add('is-ready');
  hintTimer = window.setTimeout(dismissHint, 5200);
  readyResolve();
}

async function boot() {
  const [paths, assets] = await Promise.all([
    fetch(new URL('../motion/paths.json', import.meta.url)).then((r) => {
      if (!r.ok) throw new Error('paths.json');
      return r.json();
    }),
    fetch(new URL('../motion/assets.json', import.meta.url)).then((r) => {
      if (!r.ok) throw new Error('assets.json');
      return r.json();
    }),
  ]);
  duration = paths.duration;
  const ids = spriteCatalog(paths);
  const previewPromise = loadImage(rootUrl(assets.preview), 'high').then((img) => {
    preview = img;
  });
  const spritePromise = Promise.all(ids.map(async (id) => {
    const img = await loadImage(spriteUrl(id, assets));
    images.set(id, img);
    sizes[id] = { w: img.naturalWidth, h: img.naturalHeight };
  }));
  const tilesPromise = fetch(rootUrl(assets.tiles)).then((r) => {
    if (!r.ok) throw new Error('tile manifest');
    return r.json();
  }).then((manifest) => {
    if (manifest.width !== WORLD.w || manifest.height !== WORLD.h) {
      throw new Error('Tile manifest does not match the 8K world size');
    }
    tileManifest = manifest;
  });
  await Promise.all([previewPromise, spritePromise, tilesPromise]);
  sim = createSimulation(paths, sizes);
  if (params.has('t')) {
    pausedAt = ((Number(params.get('t')) % duration) + duration) % duration;
    origin = performance.now() - pausedAt * 1000;
    if (params.get('pause') === '1') setPlaying(false);
  }
  onResize();
  markReady();
}

function debugState() {
  const view = fittedOnce ? visibleWorld() : null;
  let tilesVisible = 0;
  let tilesLoaded = 0;
  if (tileManifest && view && deviceScale() >= TILE_AT) {
    for (const tile of tileManifest.tiles) {
      if (tile.x + tile.w < view.x || tile.y + tile.h < view.y || tile.x > view.x + view.w || tile.y > view.y + view.h) continue;
      tilesVisible += 1;
      const img = tileImages.get(tile.file);
      if (img && img.complete && img.naturalWidth) tilesLoaded += 1;
    }
  }
  return {
    time: loopTime(performance.now()),
    playing,
    scale: cam.scale,
    x: cam.x,
    y: cam.y,
    fit: fittedOnce ? fitScale() : 0,
    max: fittedOnce ? maxScale() : 0,
    dpr: currentDpr,
    pending,
    tilesVisible,
    tilesLoaded,
    ready,
  };
}

window.Wimmel = {
  ready: readyPromise,
  getTime: () => loopTime(performance.now()),
  setTime(t) {
    const tt = ((t % duration) + duration) % duration;
    if (playing) origin = performance.now() - tt * 1000;
    else pausedAt = tt;
  },
  pause: () => setPlaying(false),
  play: () => setPlaying(true),
  isPlaying: () => playing,
  resetView() {
    userAdjusted = false;
    zoomToken++;
    frameFit();
  },
  getCamera: () => ({ ...debugState() }),
  zoomAt(clientX, clientY, scale) {
    userAdjusted = true;
    zoomToken++;
    zoomAt(clientX, clientY, scale);
  },
  panBy(dx, dy) {
    userAdjusted = true;
    zoomToken++;
    cam.x += dx;
    cam.y += dy;
    clampPan();
  },
  frameWorld,
  pose: (t) => sim.pose(t),
  sample: (t) => sim.sample(t),
  whenIdle,
  setChrome(on) {
    document.querySelector('.hud').style.display = on ? '' : 'none';
  },
  setActors(on) { showActors = on; },
  setShadows(on) { showShadows = on; },
  capture() {
    render(performance.now());
    return canvas.toDataURL('image/png');
  },
  debug: debugState,
  WORLD,
};

requestAnimationFrame(function loop(now) {
  render(now);
  requestAnimationFrame(loop);
});

boot().catch((err) => {
  console.error(err);
  showError('Could not load the scene.');
});
