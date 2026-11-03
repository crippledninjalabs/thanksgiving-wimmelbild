// Page shell: integer zoom, pan, and a 24 Hz tick clock.
// The scene itself is drawn only by renderRGBA (pixel buffer, then nearest upscale).

import { renderRGBA, statusLine, W, H, LOOP, HZ, HERO_TICK } from './scene.js';

const params = new URLSearchParams(location.search);
const view = document.getElementById('view');
const stage = document.getElementById('stage');
const hud = document.getElementById('hud');
const readout = document.getElementById('readout');
const back = document.createElement('canvas');
back.width = W;
back.height = H;
const bctx = back.getContext('2d', { alpha: false });
const img = bctx.createImageData(W, H);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let zoom = params.has('zoom') ? clampZoom(params.get('zoom')) : fitZoom();
let userPan = false;
let panX = 0;
let panY = 0;
let paused = params.has('t') || params.has('still') || reduce;
let tick = params.has('t')
  ? mod(Math.round(parseFloat(params.get('t')) * HZ), LOOP)
  : (reduce ? HERO_TICK : 0);
let acc = 0;
let last = performance.now();
let dragging = false;
let dragX = 0;
let dragY = 0;

if (params.has('clean') || params.has('still')) hud.classList.add('hidden');

applyZoom(zoom);
window.addEventListener('resize', () => {
  if (!userPan) center();
  else layout();
});

window.addEventListener('wheel', (e) => {
  e.preventDefault();
  const dir = e.deltaY > 0 ? -1 : 1;
  applyZoom(zoom + dir);
}, { passive: false });

stage.addEventListener('pointerdown', (e) => {
  dragging = true;
  userPan = true;
  dragX = e.clientX - panX;
  dragY = e.clientY - panY;
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  panX = e.clientX - dragX;
  panY = e.clientY - dragY;
  layout();
});
stage.addEventListener('pointerup', () => { dragging = false; });
stage.addEventListener('dblclick', () => { userPan = false; center(); });

window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    paused = !paused;
    last = performance.now();
  } else if (e.key === 'h' || e.key === 'H') {
    hud.classList.toggle('hidden');
  } else if (e.key === 'f' || e.key === 'F') {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  } else if (e.key === '0') {
    userPan = false;
    applyZoom(fitZoom());
  } else if (e.key === '+' || e.key === '=') applyZoom(zoom + 1);
  else if (e.key === '-' || e.key === '_') applyZoom(zoom - 1);
  else if (e.key === 'ArrowRight') step(e.shiftKey ? 1 : HZ);
  else if (e.key === 'ArrowLeft') step(e.shiftKey ? -1 : -HZ);
  else if (e.key === 's' || e.key === 'S') savePNG();
});

function mod(t, n) { return ((t % n) + n) % n; }

function fitZoom() {
  const z = Math.min(
    Math.floor((window.innerWidth - 24) / W),
    Math.floor((window.innerHeight - 24) / H),
  );
  return clampZoom(z || 1);
}

function clampZoom(z) {
  return Math.max(1, Math.min(8, z | 0));
}

function applyZoom(z) {
  zoom = clampZoom(z);
  const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  view.style.width = `${W * zoom}px`;
  view.style.height = `${H * zoom}px`;
  view.width = W * zoom * dpr;
  view.height = H * zoom * dpr;
  if (!userPan) center();
  else layout();
  paint();
}

function center() {
  panX = Math.floor((window.innerWidth - W * zoom) / 2);
  panY = Math.floor((window.innerHeight - H * zoom) / 2);
  layout();
}

function layout() {
  stage.style.transform = `translate(${panX | 0}px, ${panY | 0}px)`;
}

function step(d) {
  tick = mod(tick + d, LOOP);
  paused = true;
  paint();
}

function paint() {
  img.data.set(renderRGBA(tick));
  bctx.putImageData(img, 0, 0);
  const ctx = view.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(back, 0, 0, view.width, view.height);
  readout.textContent = `${statusLine(tick)}  ·  ${zoom}×`;
}

function savePNG() {
  const big = document.createElement('canvas');
  big.width = W * 3;
  big.height = H * 3;
  const ctx = big.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(back, 0, 0, big.width, big.height);
  const a = document.createElement('a');
  a.href = big.toDataURL('image/png');
  a.download = 'banquet-hall-3x.png';
  a.click();
}

function frame(now) {
  const dt = Math.min(100, now - last);
  last = now;
  if (!paused) {
    acc += dt;
    const stepMs = 1000 / HZ;
    while (acc >= stepMs) {
      acc -= stepMs;
      tick = (tick + 1) % LOOP;
    }
    paint();
  }
  requestAnimationFrame(frame);
}

paint();
requestAnimationFrame(frame);
