// Looping animation timelines for the MP4s (white background, 30 fps). Each: {w, h, duration, draw(ctx, t)}.
(function (G) {
  const TF3 = G.TF3, R = TF3.rig, C = TF3.clips, P = TF3.paint;
  const A = (TF3.anims = {});
  const clear = (ctx, w, h) => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); };
  const groundLine = (ctx, w, y) => { ctx.strokeStyle = '#cfd4d9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); };
  // Run a list of segments [{d, f(u, tLocal)}] -> picks the active one.
  const seq = (segs, t) => { let t0 = 0; for (const s of segs) { if (t < t0 + s.d || s === segs[segs.length - 1]) return s.f(R.clamp((t - t0) / s.d, 0, 1), t - t0); t0 += s.d; } };
  const total = (segs) => segs.reduce((a, s) => a + s.d, 0);
  const turnOpts = (u, from) => ({ face: u < 0.5 ? from : -from, squash: 0.85 * (1 - Math.abs(Math.cos(Math.PI * u))) });
  const box = (ctx, X, Y, s, c) => { P.begin(ctx, X, Y, s, 1); TF3.props.D.box(ctx, { c, w: 0.36, h: 0.27 }); P.end(ctx); };
  const belt = (ctx, X, Y, s, x0, x1, top, t) => { // roller belt surface at height `top` from world x0..x1
    ctx.fillStyle = '#e4e7ea'; ctx.strokeStyle = '#9aa1a8'; ctx.lineWidth = 1.5;
    ctx.fillRect(X + x0 * s, Y - top * s, (x1 - x0) * s, 0.06 * s); ctx.strokeRect(X + x0 * s, Y - top * s, (x1 - x0) * s, 0.06 * s);
    for (let x = x0 + 0.06; x < x1; x += 0.12) { ctx.beginPath(); ctx.arc(X + x * s, Y - (top - 0.03) * s, 0.022 * s, 0, 7); ctx.fillStyle = '#b8bec4'; ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(X + (x0 + 0.08) * s, Y - top * s); ctx.lineTo(X + (x0 + 0.08) * s, Y); ctx.moveTo(X + (x1 - 0.08) * s, Y - top * s); ctx.lineTo(X + (x1 - 0.08) * s, Y); ctx.stroke();
  };

  // ---- 1. Optimus: pick box from the low belt, turn, carry, place on the high belt, turn, walk back ----
  (() => {
    const W = 1280, H = 720, s = 190, GY = 650, xL = 1.55, D = 1.75, xR = xL + D;
    const g = C.reachGrabPlace([0.47, 0.66], [0.6, 1.45]);
    const loco = C.locomotion({ who: 'optimus', dist: D, step: 0.6, h: 0.45 });
    const pickD = 1.25, placeD = 1.25, turnD = 0.3;
    const lowTop = 0.66 - 0.135, highTop = 1.45 - 0.135;
    const lowBox = (u) => [xL - 0.47 - 2.6 * (1 - R.smooth(u)), 0.66];   // new box rolls in
    const segs = [
      { d: pickD, f: (u) => ({ who: 'o', x: xL, face: -1, pose: g.sample(0.5 * u) }) },
      { d: turnD, f: (u) => Object.assign({ x: xL, pose: g.sample(0.5) }, turnOpts(u, -1)) },
      { d: loco.duration, f: (u, tl) => { const r = loco.at(tl); return { x: xL + r.x, face: 1, pose: C.carryLayer(r.pose, 'optimus'), held: true }; } },
      { d: placeD, f: (u) => ({ x: xR, face: 1, pose: g.sample(0.5 + 0.5 * u), shelfFrom: u > 0.48 }) },
      { d: turnD, f: (u) => Object.assign({ x: xR, pose: g.sample(1), shelfFrom: true, tShelf: u * turnD }, turnOpts(u, 1)) },
      { d: loco.duration, f: (u, tl) => { const r = loco.at(tl); return { x: xR - r.x, face: -1, pose: r.pose, shelfFrom: true, tShelf: turnD + tl, newBox: u }; } },
    ];
    const dur = total(segs);
    let prev = null;
    A['optimus-walk-carry-place'] = { w: W, h: H, duration: dur, draw(ctx, t) {
      clear(ctx, W, H); groundLine(ctx, W, GY);
      const X = 0, st = seq(segs, t);
      // crossfade poses over 0.2 s after each segment join, and into the loop start pose at the end
      let t0 = 0, k = 0; while (k < segs.length - 1 && t >= t0 + segs[k].d) t0 += segs[k++].d;
      const tl = t - t0, F = 0.2;
      if (k > 0 && tl < F) { const pe = segs[k - 1].f(1, segs[k - 1].d).pose; st.pose = Object.assign(R.blend(pe, st.pose, R.smooth(tl / F)), { props: st.pose.props, boxHeld: st.pose.boxHeld }); }
      if (k === segs.length - 1 && segs[k].d - tl < F) { const p0 = segs[0].f(0, 0).pose; st.pose = Object.assign(R.blend(st.pose, p0, R.smooth(1 - (segs[k].d - tl) / F)), { props: st.pose.props }); }
      belt(ctx, X, GY, s, -0.2, xL - 0.22, lowTop, t);
      belt(ctx, X, GY, s, xR + 0.42, 7.2, highTop, t);
      // boxes not in the hands
      const p = st.pose, held = st.held || (p.boxHeld && !st.shelfFrom);
      if (!held && !st.shelfFrom && !(p.boxHeld)) box(ctx, X, GY, s, [xL - 0.47, 0.66]);
      if (st.newBox !== undefined) box(ctx, X, GY, s, lowBox(st.newBox));
      if (st.shelfFrom && !p.boxHeld) box(ctx, X, GY, s, [xR + 0.6 + 1.8 * Math.max(0, (st.tShelf || 0) - 0.1) ** 1.3, 1.45]);
      const pose = Object.assign({}, p, { props: held ? p.props : {} });
      if (held && st.held) pose.props = p.props;
      if (!held) pose.props = {};
      TF3.optimus.draw(ctx, X + st.x * s, GY, s, pose, { face: st.face, squash: st.squash });
    } };
  })();

  // ---- 2. Optimus brings a fresh plate; Elon walks in, stops in front of it, forks a bite (one chunk leaves
  //         the plate), chews; Optimus turns and leaves right with the plate, Elon follows later. ----
  (() => {
    const W = 1280, H = 720, s = 240, GY = 670, ox = 3.75, ex = ox - 0.84, edge = W / s;
    const walkIn = C.locomotion({ who: 'elon', dist: ex + 0.45, step: 0.75, h: 0.46 });
    const walkOut = C.locomotion({ who: 'elon', dist: edge + 0.45 - ex, step: 0.75, h: 0.46 });
    const oIn = C.locomotion({ who: 'optimus', dist: edge + 0.8 - ox, step: 0.6, h: 0.45 });
    const oOut = C.locomotion({ who: 'optimus', dist: edge + 0.8 - ox, step: 0.6, h: 0.45 });
    const bite = C.bite([0.42, 1.08]), biteD = 2.6, turnD = 0.3, chew = 1.1;
    const tB = walkIn.duration, tC = tB + biteD;
    const dur = tC + Math.max(turnD + oOut.duration, chew + walkOut.duration);
    const op = C.idle('optimus');
    const plateHands = (p, chunk) => Object.assign(p, { handN: [0.46, 1.07], handF: [0.4, 1.065], handAngN: -0.05, handAngF: -0.05,
      gripN: 0.6, gripF: 0.6, props: { plate: { c: [0.42, 1.08], food: 1, chunk, layer: 'front' } } });
    A['elon-walk-bite'] = { w: W, h: H, duration: dur, draw(ctx, t) {
      clear(ctx, W, H); groundLine(ctx, W, GY);
      // Optimus
      let o, ox_ = ox, of = -1, sq = 0;
      if (t < oIn.duration) { const r = oIn.at(t); o = plateHands(r.pose, true); ox_ = edge + 0.8 - r.x; }
      else if (t < tC) { o = plateHands(op.sample((t / 4) % 1), true); if (t >= tB) o.props = {}; }        // bite clip draws the plate
      else if (t < tC + turnD) { const u = (t - tC) / turnD; o = plateHands(op.sample((t / 4) % 1), false); ({ face: of, squash: sq } = turnOpts(u, -1)); }
      else { const r = oOut.at(t - tC - turnD); o = plateHands(r.pose, false); ox_ = ox + r.x; of = 1; }
      TF3.optimus.draw(ctx, ox_ * s, GY, s, o, { face: of, squash: sq });
      // Elon
      let e, exx;
      if (t < tB) { const r = walkIn.at(t); e = r.pose; exx = -0.45 + r.x; }
      else if (t < tC) { e = bite.sample((t - tB) / biteD); exx = ex; }
      else { const tl = t - tC - chew, r = walkOut.at(Math.max(0, tl)); e = r.pose; exx = ex + r.x;
        e.jaw = 0.3 * Math.max(0, Math.sin((t - tC) * 13)) * (1 - R.smooth((t - tC) / 1.8)); }
      TF3.elon.draw(ctx, exx * s, GY, s, e, { face: 1 });
    } };
  })();

  // ---- 3. Cybercab drives in, stops, butterfly doors up and down, drives away ----
  (() => {
    const W = 1280, H = 720, s = 125, GY = 560, x0 = -2.4, xs = W / 2 / s, x1 = W / s + 2.4, r = TF3.style.cybercab.wheelR;
    const inD = 2.1, doorD = 2.8, outD = 2.1, dc = C.cybercabDoors();
    const segs = [
      { d: inD, f: (u) => ({ x: x0 + (xs - x0) * (1 - (1 - u) ** 2), pitch: -0.012 * Math.sin(Math.PI * Math.min(1, u * 1.1)) * (u > 0.15 ? 1 : u / 0.15), door: 0, settle: 0 }) },
      { d: doorD, f: (u, tl) => ({ x: xs, pitch: 0.008 * Math.exp(-tl * 4) * Math.cos(tl * 14), door: dc.sample(u).door, bob: dc.sample(u).bob }) },
      { d: outD, f: (u) => ({ x: xs + (x1 - xs) * u * u, pitch: 0.01 * Math.sin(Math.PI * Math.min(1, u * 1.2)), door: 0 }) },
    ];
    A['cybercab-drive-doors'] = { w: W, h: H, duration: total(segs), draw(ctx, t) {
      clear(ctx, W, H); groundLine(ctx, W, GY);
      const st = seq(segs, t);
      const dist = st.x - x0;
      TF3.vehicles.cybercab.draw(ctx, st.x * s, GY, s, { wheelAng: -dist / r, pitch: st.pitch, bob: (st.bob || 0) + 0.004 * Math.sin(dist * 3), door: st.door }, {});
    } };
  })();
})(window);
