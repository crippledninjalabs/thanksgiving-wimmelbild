// TF3.clips — MOTION ONLY. Clips return poses (see README for the pose format); they never draw.
// Every clip: {name, duration (s), loop, sample(phase 0..1) -> pose, advance? (m per loop)}.
// Locomotion is planned in world space with explicit footsteps, so a planted foot never slides.
(function (G) {
  const TF3 = (G.TF3 = G.TF3 || {});
  const R = TF3.rig;
  const C = (TF3.clips = {});
  const dimsOf = (who) => TF3.style[who].dims;

  // ---------- basics ----------
  C.stand = (who, o = {}) => {
    const d = dimsOf(who), hx = -d.foot.heelToAnkle[0];
    const hip = [o.hipX || 0, o.hipY || d.standHip];
    const sh = R.add(hip, [d.shoulderFwd, d.torso]);
    const drop = (d.upperArm + d.foreArm) * 0.95;
    return {
      hip, lean: 0.015, head: who === 'elon' ? 0.06 : 0,
      footN: { heel: [hx + 0.015, 0], p: 0 }, footF: { heel: [hx - 0.015, 0], p: 0 },
      handN: R.add(sh, [0.05, -drop]), handF: R.add(sh, [0.03, -drop]),
      gripN: 0.35, gripF: 0.35, props: {},
    };
  };
  // Arm by forward-kinematics angles (a = upper arm from straight down, + forward; bend = elbow, + = forearm forward)
  C.armFK = (pose, who, a, bend) => {
    const d = dimsOf(who);
    const lean = pose.lean || 0;
    const sh = R.add(R.add(pose.hip, R.polar(Math.PI / 2 - lean, d.torso)), [d.shoulderFwd, 0]);
    const el = R.add(sh, R.polar(-Math.PI / 2 + a, d.upperArm));
    return R.add(el, R.polar(-Math.PI / 2 + a + bend, d.foreArm * 0.995));
  };

  // ---------- footstep locomotion ----------
  // o: {who, dist (m, >0), step (m), h (s per step), lead: 'N'|'F', t0}. Returns a planner with
  // duration and at(t) -> {x (anchor world metres), pose (local)}. Starts and ends standing, feet together.
  C.locomotion = (o) => {
    const d = dimsOf(o.who), fd = d.foot, L = fd.footLen;
    const n = Math.max(2, Math.ceil(o.dist / o.step) + 1);
    const s = o.dist / (n - 1), h = o.h, sw = 0.8 * h;
    const hOff = -fd.heelToAnkle[0];
    const lead = o.lead || 'N', other = lead === 'N' ? 'F' : 'N';
    const ev = { N: [], F: [] }, pos = { N: 0, F: 0 };
    for (let i = 1; i <= n; i++) {
      const f = i % 2 ? lead : other;
      const to = Math.min(i * s, o.dist);
      ev[f].push({ lift: (i - 1) * h, land: (i - 1) * h + sw, from: pos[f], to, r: R.clamp((to - pos[f]) / (2 * s), 0, 1) });
      pos[f] = to;
    }
    const duration = (n - 1) * h + sw + 0.25 * h;
    const smax = (a, b, k) => { const q = Math.max(k - Math.abs(a - b), 0) / k; return Math.max(a, b) + q * q * k * 0.25; };
    const smin = (a, b, k) => -smax(-a, -b, k);
    const anchor = (t) => smin(smax(s * (t - 0.3 * h) / h, 0, 0.35 * s), o.dist, 0.35 * s);

    const footAt = (f, t) => {
      const E = ev[f];
      let k = E.findIndex((e) => t < e.land);
      if (k >= 0 && t >= E[k].lift) { // swing
        const e = E[k], w = (t - e.lift) / (e.land - e.lift);
        const pOff = 0.55 * e.r, pStr = 0.32 * e.r;
        const start = R.footFromToe([e.from + hOff + L, 0], -pOff, fd);
        const hx = R.hermite(start.heel[0], e.to + hOff, 0, 0, R.smooth(w));
        let hy = R.lerp(start.heel[1], 0, R.smooth(w)) + (0.02 + 0.07 * e.r) * Math.sin(Math.PI * w);
        const p = R.lerp(-pOff, pStr, R.smooth(w));
        const toeY = hy + L * Math.sin(p);
        if (toeY < 0.012 && w > 0.05 && w < 0.95) hy += 0.012 - toeY;
        return { heel: [hx, hy], p };
      }
      // planted (before first lift, between land and next lift, or after last land)
      const prev = k < 0 ? E[E.length - 1] : E[k - 1];
      const next = k < 0 ? null : E[k];
      const at = prev ? prev.to : 0;
      let p = 0;
      if (prev && t - prev.land < 0.15 * h) p = 0.32 * prev.r * (1 - R.smooth((t - prev.land) / (0.15 * h)));
      if (next && next.lift - t < 0.4 * h) {
        const pOff = 0.55 * next.r * R.smooth(1 - (next.lift - t) / (0.4 * h));
        return R.footFromToe([at + hOff + L, 0], -pOff, fd);
      }
      return { heel: [at + hOff, 0], p };
    };

    const at = (t) => {
      t = R.clamp(t, 0, duration);
      const x = anchor(t);
      const fN = footAt('N', t), fF = footAt('F', t);
      const loc = (ft) => ({ heel: [ft.heel[0] - x, ft.heel[1]], p: ft.p });
      const footN = loc(fN), footF = loc(fF);
      const v = (anchor(t + 0.02) - anchor(t - 0.02)) / 0.04, vr = R.clamp(v / (s / h), 0, 1);
      const ank = [R.footFromHeel(footN.heel, footN.p, fd).ankle, R.footFromHeel(footF.heel, footF.p, fd).ankle];
      // soft-min of standing height and each leg's reach -> natural bob, lowest in double support
      const hs = [d.standHip, ...ank.map((a) => R.hipHeight(0, [a], d, 9))];
      const k = 0.012, hipY = -k * Math.log(hs.reduce((acc, q) => acc + Math.exp(-q / k), 0)) ;
      const pose = { hip: [0, Math.min(hipY, d.standHip)], lean: 0.015 + 0.05 * vr, head: (o.who === 'elon' ? 0.06 : 0) - 0.02 * vr,
        footN, footF, gripN: 0.35, gripF: 0.35, props: {} };
      // counter-swinging arms: near arm opposite the near leg
      const sep = R.clamp((fN.heel[0] - fF.heel[0]) / s, -1, 1);
      const amp = 0.34 * vr + 0.05;
      const aN = -amp * sep, aF = amp * sep;
      pose.handN = C.armFK(pose, o.who, aN, 0.18 + 0.35 * Math.max(0, aN));
      pose.handF = C.armFK(pose, o.who, aF, 0.18 + 0.35 * Math.max(0, aF));
      return { x, pose, v };
    };
    return { duration, at, steps: n, s, h, ev };
  };

  // Seamless walk cycle (two steps) for sheets / scenes: sample(ph) -> pose, advance = 2 * step.
  C.walkCycle = (who, step, h, name = 'walk') => {
    const plan = C.locomotion({ who, dist: step * 20, step, h });
    const tA = 8 * h + 0.8 * h, xA = plan.at(tA).x;
    return { name, duration: 2 * h, loop: true, advance: 2 * plan.s,
      sample: (ph) => { const r = plan.at(tA + (((ph % 1) + 1) % 1) * 2 * h); const p = r.pose; p.advance = r.x - xA; return p; } };
  };

  // ---------- upper-body layers ----------
  const BOX = { w: 0.36, h: 0.27 };
  C.carryLayer = (pose, who) => {
    const d = dimsOf(who), bob = pose.hip[1] - d.standHip;
    const c = [0.33, 1.2 + bob];
    return R.layer(pose, {
      handN: [c[0] + 0.03, c[1] - BOX.h / 2 + 0.005], handF: [c[0] - 0.07, c[1] - BOX.h / 2 + 0.01],
      handAngN: 0.1, handAngF: 0.15, curlN: 1, curlF: 1, gripN: 0.75, gripF: 0.75, lean: pose.lean + 0.03,
      props: Object.assign({}, pose.props, { box: { c, w: BOX.w, h: BOX.h, layer: 'held' } }),
    }, ['handN', 'handF', 'handAngN', 'handAngF', 'curlN', 'curlF', 'gripN', 'gripF', 'lean', 'props']);
  };
  C.pushLayer = (pose, who) => R.layer(pose, {
    handN: [0.45, 1.03], handF: [0.42, 1.03], handAngN: -0.1, handAngF: -0.1, gripN: 0.9, gripF: 0.9, lean: pose.lean + 0.1,
    props: { cart: { x: 0.47, layer: 'behind' } },
  }, ['handN', 'handF', 'handAngN', 'handAngF', 'gripN', 'gripF', 'lean', 'props']);

  // ---------- Optimus clips ----------
  C.idle = (who) => {
    const a = C.stand(who), keys = [];
    for (let i = 0; i <= 4; i++) {
      const t = i / 4, sway = Math.sin(t * Math.PI * 2) * 0.012, br = (Math.sin(t * Math.PI * 4) * 0.5 + 0.5) * 0.007;
      const p = JSON.parse(JSON.stringify(a));
      p.hip = [sway, a.hip[1] - Math.abs(sway) * 0.4]; p.breath = br; p.head = a.head + sway * 1.5;
      p.handN = R.add(a.handN, [sway * 0.6, br]); p.handF = R.add(a.handF, [sway * 0.6, br]);
      p.footN.heel = [a.footN.heel[0], 0]; // feet planted
      keys.push({ t, pose: p });
    }
    return R.keyClip(who + '-idle', 4, keys);
  };
  C.walk = (who = 'optimus') => who === 'elon' ? C.walkCycle('elon', 0.72, 0.56, 'elon-walk') : C.walkCycle('optimus', 0.58, 0.52, 'walk');
  C.carryWalk = () => { const w = C.walk('optimus'); return Object.assign({}, w, { name: 'carry', sample: (ph) => Object.assign(C.carryLayer(w.sample(ph), 'optimus'), { advance: w.sample(ph).advance }) }); };
  C.pushCart = () => {
    const w = C.walkCycle('optimus', 0.55, 0.56, 'push');
    return Object.assign({}, w, { sample: (ph) => { const p = w.sample(ph); return Object.assign(C.pushLayer(p, 'optimus'), { advance: p.advance }); } });
  };

  // Reach-grab-place: box from `from` (centre, local metres) to `to`; seamless (starts/ends idle).
  // Phase 0.5 is exactly the carry pose (C.carryLayer), so pick -> carry-walk -> place chains cleanly.
  // The box is attached to the near hand by a keyed offset (boxOff): side grip -> under (carry) -> back corner (place).
  C.CARRY_OFF = [0.03, -BOX.h / 2 + 0.005];
  C.reachGrabPlace = (from = [0.47, 0.66], to = [0.6, 1.45]) => {
    const st = C.stand('optimus'), bw = BOX.w, bh = BOX.h;
    const side = [-0.02, -0.01], under = C.CARRY_OFF, corner = [-bw / 2 + 0.03, -bh / 2 + 0.03];
    const P = (o) => Object.assign(JSON.parse(JSON.stringify(st)), o);
    const grab = (o) => P(Object.assign({ handN: R.add(from, side), handF: R.add(from, [-0.09, -0.02]), handAngN: -0.25, handAngF: -0.2,
      gripN: 1, gripF: 1, hip: [-0.07, 0.7], lean: 0.55, head: 0.25, boxOff: side }, o));
    const carry = (c, o = {}) => P(Object.assign({ handN: R.add(c, under), handF: R.add(c, [-0.07, -bh / 2 + 0.01]), handAngN: 0.1, handAngF: 0.15,
      curlN: 1, curlF: 1, gripN: 0.75, gripF: 0.75, hip: [0, st.hip[1]], lean: 0.045, head: 0, boxOff: under }, o));
    const place = (o) => carry(to, Object.assign({ handN: R.add(to, corner), handF: R.add(to, [-bw / 2 + 0.01, -bh / 2 + 0.06]),
      handAngN: 0.5, handAngF: 0.5, head: -0.2, lean: 0.02, boxOff: corner }, o));
    const keys = [
      { t: 0, pose: P({ boxOff: side }) },
      { t: 0.16, pose: grab({ gripN: 0, gripF: 0, handN: R.add(from, [-0.02, 0.04]) }) },
      { t: 0.22, pose: grab({ gripN: 0.1, gripF: 0.1 }) },
      { t: 0.3, pose: grab({}) },
      { t: 0.5, pose: carry([0.33, 1.2]) },
      { t: 0.66, pose: place({}) },
      { t: 0.74, pose: place({ gripN: 0, gripF: 0 }) },
      { t: 0.84, pose: P({ handN: R.add(to, [-0.3, -0.15]), handF: R.add(to, [-0.33, -0.18]), head: -0.08, gripN: 0, gripF: 0, boxOff: corner }) },
      { t: 1, pose: P({ boxOff: side }) },
    ];
    const clip = R.keyClip('reach-grab-place', 4.2, keys);
    const base = clip.sample;
    clip.sample = (ph) => {
      const p = base(ph);
      let c = from;
      if (ph > 0.22 && ph <= 0.74) c = R.sub(p.handN, p.boxOff);
      else if (ph > 0.74) c = to;
      p.props = { box: { c, w: bw, h: bh, layer: 'held' } };
      p.boxHeld = ph > 0.22 && ph <= 0.74;
      return p;
    };
    clip.from = from; clip.to = to;
    return clip;
  };

  // Weld: torch tip runs along a vertical seam on a panel at x = seamX, sparks at the tip.
  C.weld = (seamX = 0.58, y0 = 0.98, y1 = 1.28) => {
    const st = C.stand('optimus');
    const tDir = -0.45, tLen = 0.26; // torch angle (down-forward) and hand->tip length
    const clip = { name: 'weld', duration: 3, loop: true };
    clip.sample = (ph) => {
      const u = 0.5 - 0.5 * Math.cos(ph * Math.PI * 2);  // down and back up the seam, seamless
      const wob = Math.sin(ph * Math.PI * 24) * 0.006;
      const tip = [seamX + wob * 0.3, R.lerp(y1, y0, u) + wob];
      const p = JSON.parse(JSON.stringify(st));
      p.hip = [0.02, 0.86 + 0.015 * u]; p.lean = 0.14; p.head = 0.18 + 0.08 * u;
      p.footN.heel = [0.12, 0]; p.footF.heel = [-0.2, 0]; p.footF.p = 0;
      p.handN = R.sub(tip, R.polar(tDir, tLen)); p.handAngN = tDir; p.gripN = 1;
      p.handF = [seamX - 0.04, 1.38]; p.handAngF = 1.35; p.gripF = 0.1;
      p.props = { torch: { tip, ang: tDir, len: tLen, layer: 'front' }, sparks: { at: tip, ph, layer: 'front' } };
      return p;
    };
    return clip;
  };

  // Climb ladder: rungs every 0.28 m at x = ladderX; body rises 2 rungs per loop (advanceY).
  C.climb = (ladderX = 0.3, rung = 0.3) => {
    // Alternating climb, hips close to the rails (~17 cm), torso upright. Each half-cycle: one foot steps up two
    // rungs (past the other) while the opposite hand moves up two rungs; the body rises one rung by straightening
    // the leg on the higher rung, so the support leg ends nearly straight. Body rises 2 rungs per loop (advanceY).
    const st = C.stand('optimus'), fd = dimsOf('optimus').foot, L = fd.footLen;
    const limbs = { // [start rung, move window]; opposite hand + foot move together
      footN: [0, 0.06, 0.46], handF: [5, 0.04, 0.4], footF: [1, 0.56, 0.96], handN: [6, 0.54, 0.9] };
    const clip = { name: 'climb', duration: 2.4, loop: true, advanceY: 2 * rung };
    clip.sample = (ph) => {
      ph = ((ph % 1) + 1) % 1;
      const k = Math.floor(ph * 2), ay = rung * (k + R.smooth(Math.min(1, (ph * 2 - k) / 0.9)));
      const p = JSON.parse(JSON.stringify(st));
      const lim = (key) => { const [r0, a, b] = limbs[key]; const u = R.clamp((ph - a) / (b - a), 0, 1);
        return { r: r0 + 2 * (key[0] === 'f' ? 1 - (1 - u) ** 2 : R.smooth(u)), w: Math.sin(Math.PI * u), u, a }; };
      for (const s of ['N', 'F']) {
        const f = lim('foot' + s), y = f.r * rung + 0.02 - ay;
        // ball of the foot on the rung; before lifting the foot rolls onto the ball (heel up)
        const roll = f.u === 0 ? R.smooth((ph - (f.a - 0.12)) / 0.12) * 0.5 : 0.5 * (1 - R.smooth(f.u / 0.35));
        const ball = [ladderX - 0.01 - 0.12 * f.w, y + 0.06 * f.w];
        const heel = R.sub(ball, R.polar(-roll, L * 0.62));
        p['foot' + s] = { heel, p: -roll };
        const hd = lim('hand' + s), hy = hd.r * rung - ay;
        p['hand' + s] = [ladderX - 0.035 - 0.07 * hd.w, hy + 0.035 + 0.04 * hd.w];
        p['grip' + s] = 1 - hd.w; p['handAng' + s] = 0.9; p['curl' + s] = -1;
      }
      p.hip = [ladderX - 0.17, 0.93];
      p.lean = 0.03; p.head = -0.08;
      p.props = { ladder: { x: ladderX, rung, offY: -ay, layer: 'behind' } };
      p.advanceY = ay;
      return p;
    };
    return clip;
  };

  // ---------- Elon clips ----------
  C.armsCrossed = () => {
    const st = C.stand('elon');
    const keys = [0, 0.5, 1].map((t) => {
      const p = JSON.parse(JSON.stringify(st)), b = t === 0.5 ? 0.006 : 0;
      Object.assign(p, { elbowN: [0.13, 1.23 + b], handN: [0.06, 1.33 + b], elbowF: [0.15, 1.27 + b], handF: [0.1, 1.33 + b],
        handAngN: 2.9, handAngF: 2.8, gripN: 0.9, gripF: 0.9, breath: b, head: 0.02, hip: [-0.015, st.hip[1]] });
      return { t, pose: p };
    });
    return R.keyClip('elon-arms-crossed', 4, keys);
  };
  C.mouthOf = (pose) => {
    const sk = R.skeleton(pose, dimsOf('elon'));
    return R.add(R.add(sk.headC, R.rot([0, 0.04], -sk.headAng)), R.rot([0.105, -0.06], -sk.headAng));
  };
  // Bite: Optimus holds a plate at plateAt; Elon forks a bite, eats, chews.
  C.bite = (plateAt = [0.42, 1.08]) => {
    const st = C.stand('elon');
    const P = (o) => Object.assign(JSON.parse(JSON.stringify(st)), o);
    const headDn = { head: 0.22 };
    const mouth = C.mouthOf(P({ head: 0.12, lean: 0.04 }));
    const onPlate = R.add(plateAt, [-0.09, 0.05]);
    const keys = [
      { t: 0, pose: P({}) },
      { t: 0.14, pose: P(Object.assign({ handN: onPlate, handAngN: -0.5, gripN: 0.9, lean: 0.06 }, headDn)) },
      { t: 0.24, pose: P(Object.assign({ handN: R.add(onPlate, [0.03, -0.015]), handAngN: -0.35, gripN: 0.9, lean: 0.06 }, headDn)) },
      { t: 0.4, pose: P({ handN: R.sub(mouth, R.polar(2.6, 0.225)), handAngN: 2.6, gripN: 0.9, head: 0.12, lean: 0.04, jaw: 1 }) },
      { t: 0.46, pose: P({ handN: R.sub(mouth, R.polar(2.6, 0.2)), handAngN: 2.6, gripN: 0.9, head: 0.12, lean: 0.04, jaw: 0 }) },
      { t: 0.56, pose: P({ handN: R.add(mouth, [0.16, -0.3]), handAngN: 1.2, gripN: 0.9, head: 0.04, lean: 0.03 }) },
      { t: 0.7, pose: P({ handN: onPlate, handAngN: -0.4, gripN: 0.2, lean: 0.05, head: 0.1 }) },
      { t: 0.84, pose: P({ head: 0.02 }) },
      { t: 1, pose: P({}) },
    ];
    const clip = R.keyClip('elon-bite', 4.5, keys);
    const base = clip.sample;
    clip.sample = (ph) => {
      const p = base(ph);
      if (ph > 0.46 && ph < 0.96) p.jaw = 0.35 * Math.max(0, Math.sin((ph - 0.46) / 0.5 * Math.PI * 7)) * (1 - R.smooth((ph - 0.85) / 0.11));
      const holding = ph > 0.12 && ph < 0.72;
      p.props = { plate: { c: plateAt, food: 1, chunk: ph < 0.24, layer: 'front' } }; // chunk leaves the plate on the fork
      p.props.fork = holding ? { hand: 'N', bite: ph > 0.24 && ph < 0.42, layer: 'front' } : { onPlate: plateAt, layer: 'front' };
      return p;
    };
    clip.plateAt = plateAt;
    return clip;
  };
  C.rideLift = () => {
    const st = C.stand('elon');
    const keys = [0, 0.5, 1].map((t) => {
      const p = JSON.parse(JSON.stringify(st)), b = t === 0.5 ? 1 : 0;
      Object.assign(p, { handN: [0.33, 1.06], handAngN: -0.05, gripN: 1, hip: [-0.01 + 0.008 * b, st.hip[1] - 0.012 * b],
        head: 0.02 - 0.04 * b, breath: 0.005 * b, footN: { heel: [0.02, 0], p: 0 }, footF: { heel: [-0.13, 0], p: 0 },
        props: { rail: { x: 0.33, y: 1.04, layer: 'behind' } } });
      return { t, pose: p };
    });
    return R.keyClip('elon-ride-lift', 3, keys);
  };
  C.elonIdle = () => C.idle('elon');

  // ---------- Cybercab ----------
  // pose: {wheelAng, bob (m), pitch (rad), door (0 closed .. 1 open)}
  C.cybercabDrive = (speed = 4) => {
    const r = TF3.style.cybercab.wheelR, circ = 2 * Math.PI * r;
    return { name: 'cab-drive', duration: circ * 2 / speed, loop: true, advance: circ * 2,
      sample: (ph) => ({ wheelAng: -ph * 4 * Math.PI, bob: 0.008 * Math.sin(ph * Math.PI * 6), pitch: 0.003 * Math.sin(ph * Math.PI * 4 + 1), door: 0, advance: ph * circ * 2 }) };
  };
  C.cybercabDoors = () => R.keyClip('cab-doors', 4, [
    { t: 0, pose: { door: 0, bob: 0 } }, { t: 0.35, pose: { door: 1, bob: -0.01 } },
    { t: 0.65, pose: { door: 1, bob: -0.01 } }, { t: 1, pose: { door: 0, bob: 0 } }]);
})(typeof window !== 'undefined' ? window : globalThis);
