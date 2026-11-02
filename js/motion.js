// Motion engine for the Thanksgiving at SpaceX viewer.
//
// This is a direct port of reference/render_loop.py. All choreography lives in
// motion/paths.json. Coordinates in that file are BASE units: pixels of a
// 1280×720 layout. The 8K background is 6× that layout (7680×4320), the same
// scale the offline renderer uses (k = outputWidth / 1280).
//
// Adding motion without writing new math:
//   • Another cab: append to paths.cabs (or copy_of + phase for a time offset).
//   • Another road: append a polyline to paths.roads.
//   • Another character with the same walk/work model: set paths.characters
//     to an array of objects shaped like paths.elon, give each an id, and
//     point motion/assets.json at its sprite folder. Until that array exists,
//     paths.elon is used.
// A genuinely new kind of motion is a sampler next to sampleCab / sampleCharacter,
// called from sample().

export const BASE = { w: 1280, h: 720 };
export const WORLD = { w: 7680, h: 4320 };
export const WORLD_SCALE = WORLD.w / BASE.w;

/** Python 3 round(): half away from zero goes to the even integer. */
export function pyRound(x) {
  if (!Number.isFinite(x)) return NaN;
  const neg = x < 0;
  const ax = neg ? -x : x;
  const fl = Math.floor(ax);
  const frac = ax - fl;
  let rounded;
  if (frac === 0.5) rounded = fl % 2 === 0 ? fl : fl + 1;
  else rounded = Math.round(ax);
  return neg ? -rounded : rounded;
}

function pyMod(a, b) {
  // Match Python's % for the values this loop uses. A second modulo on an
  // already-positive remainder drifts by an ulp and flips frame boundaries.
  const m = a % b;
  return m < 0 ? m + b : m;
}

function round15(n) {
  return Math.round(n * 1e15) / 1e15;
}

/**
 * Pixel size of Pillow's Image.rotate(-qClockwise, expand=True).
 * The offline renderer anchors the expanded bitmap, so placement has to use
 * this size rather than the unrotated sprite size.
 */
export function rotatedSpriteSize(w, h, qClockwise) {
  let angle = pyMod(-qClockwise, 360);
  if (angle === 0 || angle === 180) return { w, h };
  if (angle === 90 || angle === 270) return { w: h, h: w };
  const rad = -angle * Math.PI / 180;
  const cos = round15(Math.cos(rad));
  const sin = round15(Math.sin(rad));
  const matrix = [cos, sin, 0, round15(-Math.sin(rad)), cos, 0];
  const cx = w / 2;
  const cy = h / 2;
  const shift = applyAffine(matrix, -cx, -cy);
  matrix[2] = shift[0] + cx;
  matrix[5] = shift[1] + cy;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of [[0, 0], [w, 0], [w, h], [0, h]]) {
    const p = applyAffine(matrix, x, y);
    if (p[0] < minX) minX = p[0];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
  return {
    w: Math.ceil(maxX) - Math.floor(minX),
    h: Math.ceil(maxY) - Math.floor(minY),
  };
}

function applyAffine(m, x, y) {
  return [m[0] * x + m[1] * y + m[2], m[3] * x + m[4] * y + m[5]];
}

/** Where the center of a (possibly rotated) sprite bitmap should sit. */
export function spriteCenter(cmd) {
  const bb = rotatedSpriteSize(cmd.w, cmd.h, cmd.rotation || 0);
  return {
    cx: cmd.x + (0.5 - cmd.anchorX) * bb.w,
    cy: cmd.y + (0.5 - cmd.anchorY) * bb.h,
    bw: bb.w,
    bh: bb.h,
  };
}

function searchSortedRight(arr, x) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

class Route {
  constructor(pts) {
    this.p = pts.map((p) => [p[0], p[1]]);
    const cum = [0];
    for (let i = 1; i < this.p.length; i++) {
      const dx = this.p[i][0] - this.p[i - 1][0];
      const dy = this.p[i][1] - this.p[i - 1][1];
      cum.push(cum[i - 1] + Math.hypot(dx, dy));
    }
    this.cum = cum;
    this.L = cum[cum.length - 1];
  }

  at(dist) {
    dist = Math.min(this.L, Math.max(0, dist));
    let i = searchSortedRight(this.cum, dist) - 1;
    if (i > this.p.length - 2) i = this.p.length - 2;
    const span = Math.max(this.cum[i + 1] - this.cum[i], 1e-9);
    const u = (dist - this.cum[i]) / span;
    return [
      this.p[i][0] + (this.p[i + 1][0] - this.p[i][0]) * u,
      this.p[i][1] + (this.p[i + 1][1] - this.p[i][1]) * u,
    ];
  }

  angle(dist, win = 25) {
    const a = this.at(dist - win);
    const b = this.at(dist + win);
    return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  }

  // 50 bisections, matching render_loop.py. Roads increase in x.
  distOfX(x) {
    let lo = 0;
    let hi = this.L;
    for (let n = 0; n < 50; n++) {
      const m = (lo + hi) / 2;
      if (this.at(m)[0] < x) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  }
}

function ease(kind, u) {
  u = Math.min(1, Math.max(0, u));
  if (kind === 'linear' || kind == null) return u;
  if (kind === 'out') {
    // Decelerate to a stop: speed falls linearly to 0 over the last 45%.
    const a = 0.55;
    const vmax = 1 / (a + (1 - a) / 2);
    if (u < a) return vmax * u;
    return vmax * a + vmax * ((u - a) - (u - a) ** 2 / (2 * (1 - a)));
  }
  if (kind === 'in') {
    // Accelerate from a stop over the first 35%.
    const a = 0.35;
    const vmax = 1 / (a / 2 + (1 - a));
    if (u < a) return vmax * u * u / (2 * a);
    return vmax * a / 2 + vmax * (u - a);
  }
  return u;
}

function smoothstep(u) {
  return u * u * (3 - 2 * u);
}

function charactersOf(paths) {
  if (Array.isArray(paths.characters) && paths.characters.length) {
    return paths.characters.map((c, i) => ({ id: c.id || `character${i + 1}`, ...c }));
  }
  if (paths.elon) return [{ id: 'elon', ...paths.elon }];
  return [];
}

function spritePrefix(ch) {
  return ch.sprite_prefix || ch.id;
}

function spriteFile(ch, kind, index1, face) {
  return `${spritePrefix(ch)}_${kind}_${index1}_${face}`;
}

/** Every sprite id the current paths can ask to draw. */
export function spriteCatalog(paths) {
  const ids = [];
  for (const key of Object.keys(paths.cab.sprites)) ids.push(`cab:${key}`);
  for (const ch of charactersOf(paths)) {
    const walkN = ch.walk_frames || 4;
    const workN = ch.work_frames || 2;
    for (const face of ['L', 'R']) {
      for (let i = 1; i <= walkN; i++) ids.push(`${ch.id}:${spriteFile(ch, 'walk', i, face)}`);
      for (let i = 1; i <= workN; i++) ids.push(`${ch.id}:${spriteFile(ch, 'work', i, face)}`);
    }
  }
  return ids;
}

function quantizeHalf(deg) {
  return pyRound(deg * 2) / 2;
}

/**
 * @param {object} paths parsed paths.json
 * @param {Record<string, {w: number, h: number}> | null} sizes natural pixel size of each sprite id
 */
export function createSimulation(paths, sizes = null) {
  const duration = paths.duration;
  const scale = WORLD_SCALE;
  const routes = {};
  for (const [name, pts] of Object.entries(paths.roads)) routes[name] = new Route(pts);

  const cabByName = new Map(paths.cabs.map((c) => [c.name, c]));
  const distCache = new Map();

  function resolveCab(c) {
    if (c.copy_of) {
      const base = cabByName.get(c.copy_of);
      return { ...base, name: c.name, phase: c.phase };
    }
    return c;
  }

  function sval(route, routeName, v) {
    if (v === 'start') return 0;
    if (v === 'end') return route.L;
    const key = `${routeName}:${v.x}`;
    const hit = distCache.get(key);
    if (hit != null) return hit;
    const d = route.distOfX(v.x);
    distCache.set(key, d);
    return d;
  }

  function cabState(raw, t) {
    const c = resolveCab(raw);
    const route = routes[c.route];
    const tr = pyMod(t - c.phase, duration);
    const segs = c.segments;
    if (tr > segs[segs.length - 1].t1) return null;
    for (let i = 0; i < segs.length; i++) {
      const sg = segs[i];
      if (sg.t0 <= tr && tr <= sg.t1) {
        let d;
        let door = 0;
        if (sg.hold) {
          d = sval(route, c.route, segs[i - 1].s1);
          if (sg.door_open) {
            const [o0, o1] = sg.door_open;
            const f = 0.25;
            door = Math.min(1, Math.max(0, (tr - o0) / f)) * Math.min(1, Math.max(0, (o1 - tr) / f));
          }
        } else {
          const span = sg.t1 - sg.t0;
          const u = span === 0 ? 1 : (tr - sg.t0) / span;
          const s0 = sval(route, c.route, sg.s0);
          const s1 = sval(route, c.route, sg.s1);
          d = s0 + (s1 - s0) * ease(sg.ease || 'linear', u);
        }
        const [x, y] = route.at(d);
        const angle = route.angle(d);
        return { name: c.name, x, y, angle, door, dist: d };
      }
    }
    return null;
  }

  const characters = charactersOf(paths);
  const walkRoutes = characters.map((ch) => ch.timeline.map((seg) => (
    seg.waypoints ? new Route(seg.waypoints) : null
  )));

  function characterState(ch, index, t) {
    const tr = pyMod(t, duration);
    const timeline = ch.timeline;
    const walkN = ch.walk_frames || 4;
    const workN = ch.work_frames || 2;
    const standFrame = ch.stand_frame || 2;
    for (let i = 0; i < timeline.length; i++) {
      const seg = timeline[i];
      const last = i === timeline.length - 1;
      if ((seg.t0 <= tr && tr < seg.t1) || (last && tr >= seg.t0)) {
        if (seg.mode === 'work') {
          const frame = Math.floor(tr * ch.work_fps) % workN;
          return {
            id: ch.id,
            x: seg.at[0],
            y: seg.at[1],
            sprite: spriteFile(ch, 'work', frame + 1, seg.facing),
            bob: 0,
          };
        }
        if (seg.mode === 'stand') {
          return {
            id: ch.id,
            x: seg.at[0],
            y: seg.at[1],
            sprite: spriteFile(ch, 'walk', standFrame, seg.facing),
            bob: 0,
          };
        }
        const route = walkRoutes[index][i];
        const span = seg.t1 - seg.t0;
        const u = span === 0 ? 1 : (tr - seg.t0) / span;
        // The offline renderer comments on an ease here, but the shipped math is linear.
        const d = route.L * u;
        const [x, y] = route.at(d);
        const behind = route.at(d - 3);
        const ahead = route.at(d + 3);
        const facing = ahead[0] >= behind[0] ? 'R' : 'L';
        const ph = (tr - seg.t0) * ch.walk_fps;
        const frame = Math.floor(ph) % walkN;
        const bob = Math.abs(Math.sin(Math.PI * ph / 2)) * ch.bob_frac;
        return { id: ch.id, x, y, sprite: spriteFile(ch, 'walk', frame + 1, facing), bob };
      }
    }
    const first = timeline[0];
    return {
      id: ch.id,
      x: first.at[0],
      y: first.at[1],
      sprite: spriteFile(ch, 'work', 1, 'R'),
      bob: 0,
    };
  }

  function pose(t) {
    const cabDef = paths.cab;
    const damp = cabDef.rotation_damping;
    const heading = cabDef.heading_deg;
    return {
      t: pyMod(t, duration),
      cabs: paths.cabs.map((raw) => {
        const st = cabState(raw, t);
        if (!st) return null;
        const u = Math.min(1, Math.max(0, (2 - st.angle) / 10));
        const wUR = smoothstep(u);
        return {
          ...st,
          wUR,
          qDR: quantizeHalf((st.angle - heading.DR) * damp),
          qUR: quantizeHalf((st.angle - heading.UR) * damp),
        };
      }),
      characters: characters.map((ch, i) => characterState(ch, i, t)),
    };
  }

  function needSize(id) {
    const s = sizes && sizes[id];
    if (!s) throw new Error(`Missing sprite size for ${id}`);
    return s;
  }

  function pushSprite(cmds, spec) {
    if (spec.alpha <= 0.001) return;
    cmds.push(spec);
  }

  function sample(t) {
    const cmds = [];
    let seq = 0;
    const cabDef = paths.cab;
    const length = cabDef.length_base * scale;
    const posed = pose(t);

    for (const st of posed.cabs) {
      if (!st) continue;
      const X = st.x * scale;
      const Y = st.y * scale;
      const depth = st.y;
      cmds.push({
        type: 'shadow',
        x: X,
        y: Y + length * 0.05,
        w: length * 0.95,
        h: length * 0.32,
        alpha: 90,
        depth,
        seq: seq++,
      });
      const anchorY = cabDef.anchor_y;
      const addCab = (key, rotation, alpha) => {
        const id = `cab:${key}`;
        const natural = needSize(id);
        const refW = key === 'UR' ? natural.w : needSize('cab:DR').w;
        const sc = length / refW;
        pushSprite(cmds, {
          type: 'sprite',
          image: id,
          x: X,
          y: Y,
          w: Math.max(1, pyRound(natural.w * sc)),
          h: Math.max(1, pyRound(natural.h * sc)),
          anchorX: 0.5,
          anchorY,
          rotation,
          alpha,
          depth,
          seq: seq++,
        });
      };
      if (st.wUR < 1) {
        addCab('DR', st.qDR, 1 - st.wUR);
        if (st.door > 0) addCab('DR_open', st.qDR, (1 - st.wUR) * st.door);
      }
      if (st.wUR > 0) addCab('UR', st.qUR, st.wUR);
    }

    for (const ch of posed.characters) {
      const actor = characters.find((c) => c.id === ch.id);
      const id = `${ch.id}:${ch.sprite}`;
      const natural = needSize(id);
      const H = actor.height_base * scale;
      const sc = H / natural.h;
      const destW = Math.max(1, pyRound(natural.w * sc));
      const destH = Math.max(1, pyRound(H));
      const X = ch.x * scale;
      const Y = ch.y * scale;
      cmds.push({
        type: 'shadow',
        x: X,
        y: Y,
        w: destW * 0.9,
        h: destW * 0.28,
        alpha: 80,
        depth: ch.y,
        seq: seq++,
      });
      pushSprite(cmds, {
        type: 'sprite',
        image: id,
        x: X,
        y: Y - ch.bob * destH,
        w: destW,
        h: destH,
        anchorX: 0.5,
        anchorY: 0.97,
        rotation: 0,
        alpha: 1,
        depth: ch.y,
        seq: seq++,
      });
    }

    cmds.sort((a, b) => a.depth - b.depth || a.seq - b.seq);
    return cmds;
  }

  return { duration, pose, sample, characters };
}
