// TF.act — choreography helpers for figures (Optimus / Elon) built on the approved TF3 clips.
// A timeline is a list of segments {d, f(u, tl) -> state}; state = {x, face, pose, squash?, ...extras}.
// TF.act.run(segs, tau) picks the active segment and cross-fades the pose for 0.25 s after every joint
// (cyclic: segment 0 fades in from the last segment's end), so poses never pop. Positions are continuous by design.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, R = TF3.rig, C = TF3.clips;
  const A = (TF.act = {});
  const M = TF.M;

  A.total = (segs) => segs.reduce((a, s) => a + s.d, 0);
  const at = (segs, i, tl) => segs[i].f(TF.clamp(tl / segs[i].d, 0, 1), tl);
  A.run = (segs, tau, fade = 0.25) => {
    let t0 = 0, i = 0;
    for (; i < segs.length - 1 && tau >= t0 + segs[i].d; i++) t0 += segs[i].d;
    const tl = tau - t0, st = at(segs, i, tl);
    if (tl < fade) {
      const j = (i - 1 + segs.length) % segs.length, prev = at(segs, j, segs[j].d);
      st.pose = R.blend(prev.pose, st.pose, R.smooth(tl / fade));
    }
    return st;
  };

  // ---------- poses ----------
  A.stand = (who = 'optimus') => C.stand(who);
  const IDLE = { optimus: C.idle('optimus'), elon: C.idle('elon') };
  A.idle = (tl, who = 'optimus') => IDLE[who].sample(tl / IDLE[who].duration);
  // Stand with hand targets (local metres, facing +x). o: lean, hip, head, grip, etc.
  A.reach = (handN, handF, o = {}) => {
    const p = C.stand('optimus');
    if (handN) { p.handN = handN; p.gripN = o.gripN ?? 1; p.handAngN = o.angN; }
    if (handF) { p.handF = handF; p.gripF = o.gripF ?? 1; p.handAngF = o.angF; }
    if (o.lean !== undefined) p.lean = o.lean;
    if (o.head !== undefined) p.head = o.head;
    if (o.hipY !== undefined) p.hip = [o.hipX || 0, o.hipY];
    if (o.curl) { p.curlN = o.curl; p.curlF = o.curl; }
    return p;
  };
  // Upper-body carry (hands under a held item at local c) over any pose.
  A.carry = (pose, c = [0.36, 1.12], w = 0.4) => R.layer(pose, {
    handN: [c[0] + w * 0.35, c[1] - 0.02], handF: [c[0] - w * 0.25, c[1] - 0.01], gripN: 0.8, gripF: 0.8,
    handAngN: 0.2, handAngF: 0.2, curlN: 1, curlF: 1, lean: (pose.lean || 0) + 0.03 }, ['handN', 'handF', 'gripN', 'gripF', 'handAngN', 'handAngF', 'curlN', 'curlF', 'lean']);

  // ---------- segments ----------
  // hold: stand still (idle breathing) or any pose function of tl
  A.hold = (d, x, face, poseFn) => ({ d, f: (u, tl) => ({ x, face, pose: poseFn ? poseFn(tl, u) : A.idle(tl) }) });
  // keyed pose segment: keys [[u, pose], ...] eased
  A.keyed = (d, x, face, keys, extra) => ({ d, f: (u, tl) => {
    let k = 1; while (k < keys.length - 1 && u > keys[k][0]) k++;
    const [u0, p0] = keys[k - 1], [u1, p1] = keys[k];
    const st = { x, face, pose: R.blend(p0, p1, R.easeInOut(TF.clamp((u - u0) / (u1 - u0), 0, 1))) };
    return extra ? Object.assign(st, extra(u, tl)) : st;
  } });
  // walk from x0 to x1 (world units) in exactly d seconds with planted feet (TF3 locomotion planner)
  A.walk = (d, x0, x1, o = {}) => {
    const dist = Math.abs(x1 - x0) / M, face = x1 >= x0 ? 1 : -1, step = o.step || 0.6;
    const n = Math.max(2, Math.ceil(dist / step) + 1);
    const plan = C.locomotion({ who: o.who || 'optimus', dist: Math.max(dist, 0.01), step, h: d / (n + 0.05) });
    const k = plan.duration / d;
    return { d, plan, f: (u, tl) => {
      const r = plan.at(tl * k);
      let pose = r.pose;
      if (o.carry) pose = A.carry(pose, o.carry, o.carryW);
      return { x: x0 + face * r.x * M, face, pose, walking: true };
    } };
  };
  // turn on the spot (squash flip, like the approved anims)
  A.turn = (d, x, from, poseFn) => ({ d, f: (u, tl) => ({ x, face: u < 0.5 ? from : -from,
    squash: 0.85 * (1 - Math.abs(Math.cos(Math.PI * u))), pose: poseFn ? poseFn(tl, u) : A.idle(tl) }) });

  // ---------- drawing ----------
  // Draw an Optimus whose ground point under the hip is world (x, yFloor). Returns {sk, w(p)} where w maps
  // figure-local metres to world units.
  A.draw = (ctx, st, yFloor, who = 'optimus') => {
    const fig = who === 'elon' ? TF3.elon : TF3.optimus;
    const sk = fig.draw(ctx, st.x, yFloor, M, st.pose, { face: st.face, squash: st.squash || 0 });
    const sx = st.face * (1 - (st.squash || 0));
    return { sk, w: (p) => [st.x + sx * p[0] * M, yFloor - p[1] * M] };
  };
  // Convert a world point to a figure-local target (for hand targets on real things)
  A.local = (x0, yFloor, face, wx, wy) => [face * (wx - x0) / M, (yFloor - wy) / M];
})(typeof window !== 'undefined' ? window : globalThis);
