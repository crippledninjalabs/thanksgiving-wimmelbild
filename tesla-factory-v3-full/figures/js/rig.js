// TF3.rig — tiny 2D skeleton / pose system (motion math only, no drawing).
// Units: metres, y UP, figure faces +x. Pose = plain object of numbers / [x,y] arrays (see README).
(function (G) {
  const TF3 = (G.TF3 = G.TF3 || {});
  const R = (TF3.rig = {});

  // ---------- small math ----------
  R.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  R.lerp = (a, b, t) => a + (b - a) * t;
  R.smooth = (t) => { t = R.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  R.smoother = (t) => { t = R.clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
  R.easeInOut = (t) => 0.5 - 0.5 * Math.cos(Math.PI * R.clamp(t, 0, 1));
  R.add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  R.sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  R.mul = (a, k) => [a[0] * k, a[1] * k];
  R.len = (a) => Math.hypot(a[0], a[1]);
  R.rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  R.polar = (a, l) => [Math.cos(a) * l, Math.sin(a) * l];
  R.ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  // cubic Hermite between p0 and p1 with tangents m0, m1 (scalars), t in 0..1
  R.hermite = (p0, p1, m0, m1, t) => {
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * m1;
  };

  // ---------- 2-bone IK ----------
  // root -> mid -> end with lengths l1, l2 reaching target. bend = +1 puts the mid joint
  // counter-clockwise of the root->target line (knees: forward), -1 clockwise (elbows: back/down).
  // Returns {mid, end, reached}. If the target is too far the chain points straight at it.
  R.ik2 = (root, target, l1, l2, bend) => {
    const d = R.sub(target, root);
    let dist = R.len(d);
    const reached = dist <= (l1 + l2) * 0.9999 && dist >= Math.abs(l1 - l2);
    dist = R.clamp(dist, Math.abs(l1 - l2) + 1e-6, (l1 + l2) * 0.9999);
    const base = Math.atan2(d[1], d[0]);
    const a = Math.acos(R.clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1));
    const mid = R.add(root, R.polar(base + bend * a, l1));
    const end = R.add(mid, R.polar(R.ang(mid, R.add(root, R.polar(base, dist))), l2));
    return { mid, end, reached };
  };

  // ---------- pose blending ----------
  // Recursively lerps numbers and arrays; non-numbers take b when t >= 0.5.
  R.blend = (a, b, t) => {
    if (a === undefined) return b;
    if (b === undefined) return a;
    if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
    if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => R.blend(v, b[i], t));
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const o = {};
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = R.blend(a[k], b[k], t);
      return o;
    }
    return t < 0.5 ? a : b;
  };
  // Override chosen keys of base with layer (e.g. upper-body carry over walking legs).
  R.layer = (base, over, keys, w = 1) => {
    const o = Object.assign({}, base);
    for (const k of keys) if (over[k] !== undefined) o[k] = R.blend(base[k], over[k], w);
    return o;
  };

  // ---------- keyframe clips ----------
  // keys: [{t: 0..1, pose: {...}, ease: fn?}] sorted, first t = 0, last t = 1.
  // For a seamless loop give the last key the same pose as the first.
  R.sampleKeys = (keys, ph) => {
    ph = R.clamp(ph, 0, 1);
    let i = 0;
    while (i < keys.length - 2 && ph > keys[i + 1].t) i++;
    const k0 = keys[i], k1 = keys[i + 1];
    const u = (ph - k0.t) / Math.max(1e-9, k1.t - k0.t);
    return R.blend(k0.pose, k1.pose, (k1.ease || R.easeInOut)(u));
  };
  // Clip object: {name, duration (s), loop: bool, sample(phase) -> pose}
  R.keyClip = (name, duration, keys, extra) => Object.assign({
    name, duration, loop: true, keys, sample: (ph) => R.sampleKeys(keys, ((ph % 1) + 1) % 1),
  }, extra || {});

  // ---------- foot geometry ----------
  // Foot pitch p (+ = toe up). Rolls about the heel when p > 0, about the toe when p < 0.
  // dims: {heelToAnkle:[x,y], footLen}. Given heel position + pitch -> ankle, toe.
  R.footFromHeel = (heel, p, fd) => {
    const toe = R.add(heel, R.polar(p, fd.footLen));
    const ankle = R.add(heel, R.rot(fd.heelToAnkle, p));
    return { heel, toe, ankle, p };
  };
  R.footFromToe = (toe, p, fd) => R.footFromHeel(R.sub(toe, R.polar(p, fd.footLen)), p, fd);

  // ---------- skeleton ----------
  // pose fields used: hip [x,y], lean (rad, + = forward), head (rad, + = look down),
  // handN/handF [x,y] targets, elbowN/elbowF optional explicit elbows (skips IK, for foreshortened arms),
  // footN/footF {heel:[x,y], p} (N = near side, F = far side).
  // dims: torso, neck, headR, shoulderFwd, upperArm, foreArm, thigh, shin, hipFwd, foot {heelToAnkle, footLen}
  R.skeleton = (pose, d) => {
    const hip = pose.hip;
    const lean = pose.lean || 0;
    const up = R.polar(Math.PI / 2 - lean, 1); // torso axis
    const fwd = [up[1], -up[0]];
    const shoulder = R.add(R.add(hip, R.mul(up, d.torso)), R.mul(fwd, d.shoulderFwd || 0));
    const neckBase = R.add(hip, R.mul(up, d.neckUp));
    const hl = lean + (pose.head || 0);
    const headUp = R.polar(Math.PI / 2 - hl, 1);
    const headC = R.add(neckBase, R.mul(headUp, d.neck));
    const hipJ = R.add(hip, [d.hipFwd || 0, 0]);
    const out = { hip, hipJ, shoulder, neckBase, headC, headAng: hl, lean, up, fwd, ok: true };
    for (const s of ['N', 'F']) {
      const ft = pose['foot' + s];
      const foot = R.footFromHeel(ft.heel, ft.p || 0, d.foot);
      const leg = R.ik2(hipJ, foot.ankle, d.thigh, d.shin, +1);
      const hand = pose['hand' + s];
      let arm;
      if (pose['elbow' + s]) arm = { mid: pose['elbow' + s], end: hand, reached: true };
      else arm = R.ik2(shoulder, hand, d.upperArm, d.foreArm, -1);
      out['foot' + s] = foot; out['knee' + s] = leg.mid; out['ankle' + s] = leg.end;
      out['elbow' + s] = arm.mid; out['wrist' + s] = arm.end;
      out['grip' + s] = pose['grip' + s] || 0;
      out['handAng' + s] = pose['handAng' + s];
      if (!leg.reached || !arm.reached) out.ok = false;
    }
    return out;
  };

  // Highest hip height (<= h0) at which both legs still reach their ankles (slightly bent).
  R.hipHeight = (hipX, ankles, d, h0, slack = 0.985) => {
    const L = (d.thigh + d.shin) * slack;
    let h = h0;
    for (const a of ankles) {
      const dx = hipX + (d.hipFwd || 0) - a[0];
      if (Math.abs(dx) < L) h = Math.min(h, a[1] + Math.sqrt(L * L - dx * dx));
    }
    return h;
  };
})(typeof window !== 'undefined' ? window : globalThis);
