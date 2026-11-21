// The "42" gag (prime 127, offset 50, 3 cycles) handled by the nearby Optimus. Pure function of t.
// ONE helper TF.fortyTwo(t) -> {k, u}: k = -1 neutral, 0 or 1 = beat, u = seconds into that 24 s cycle (cycle starts at a multiple of 24).
// k=0: the 42 plate wobbles, falls off the ship's west skirt, clangs by the booster QD; the lawn flock startles, one jumper
//      runs through the 1E cafeteria and back; the tile Optimus carries the bent plate to the tile pile and hammers it straight.
// k=1: the tile Optimus puts the plate on the TL car, the crew-up Optimus lifts it off the car and bolts it back on the skirt.
// Props are drawn here; tower.js / outside.js / floor1.js only call the hooks (world, held, flock, jumper).
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, S3 = TF.stage3;
  const G0 = L.G, yF = L.floorY(1), X0 = L.zoneById('SHIP').box.x, T = L.zoneById('TOWER').box, lawn = L.zoneById('LAWN').box;
  const yCG = S3.deckY(S3.DCK.header) - 6;
  const ramp = TF.ramp, lerp = TF.lerp, TAU = Math.PI * 2;
  const P = 127, OFF = 50;
  TF.gagHook({ id: 'fortyTwo', P, offset: OFF, cycles: 3, room: 'SHIP', trigger: 'the 42 plate falls off the ship skirt; the tile Optimus straightens it, the TL car + crew-up Optimus bolt it back; the lawn flock startles and one runs a lap of the 1E table' });

  const SK = [X0 - 9, yCG + 13];              // skirt plate centre (just below the arm walkway, west hull edge)
  const LAND = [4744, G0 - 9];                // resting spot between tower and ship (near the booster QD fixture)
  const PILE = [T.x - 40 + 9, G0 - 26];       // lying on the tile pile
  const MAL = [4512, G0 - 2];                 // mallet on the ground by the pile
  const CAR_X = T.x + T.w - 2;                // plate standing on the TL car floor
  const HX = lawn.x + 320, DOOR = lawn.x - 6;  // flock slot of the jumper, 1E lawn door

  // beat k and seconds u in the 24 s robot grid; c0 = first 24 s cycle that starts inside the active window
  const fortyTwo = (t) => {
    const p = Math.floor((t - OFF) / P), c0 = Math.ceil((p * P + OFF) / 24) * 24, d = t - c0;
    if (d < 0 || d >= 48) return { k: -1, u: 0, c0 };
    const k = d >= 24 ? 1 : 0;
    return { k, u: d - 24 * k, c0 };
  };
  TF.fortyTwo = fortyTwo;

  // ---------- the plate ----------
  // bent in 0..1; flat = lying (squashed)
  const drawPlate = (ctx, x, y, o = {}) => {
    const f = o.bent || 0;
    ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.flat) ctx.scale(1, 0.4);
    if (f > 0.02) {
      D.poly(ctx, [[-8, -7], [8, -7], [8 - 6 * f, -1], [8 - 1 * f, 3], [8, 7], [-8, 7]], '#b91c1c', '#7f1d1d', 1);
      D.line(ctx, [[8, -7], [8 - 6 * f, -1], [8 - 1 * f, 3]], '#7f1d1d', 1);
      ctx.rotate(0.12 * f); D.sign(ctx, '42', -1, 0, 9 * (1 - 0.15 * f), '#fee2e2', 'center', '800');
    } else {
      D.rect(ctx, -8, -7, 16, 14, '#b91c1c', '#7f1d1d', 1);
      D.sign(ctx, '42', 0, 0, 9, '#fee2e2', 'center', '800');
    }
    ctx.restore();
  };
  const bentTaps = (u) => 1 - (ramp(u, 21.2, 21.35) * 0.34 + ramp(u, 21.7, 21.85) * 0.33 + ramp(u, 22.2, 22.35) * 0.33);

  // where is the plate: {m: skirt | free | tileF | tileTop | tileN | car | crew | pile, ...}
  const plate = (t) => {
    const z = fortyTwo(t), u = z.u;
    if (z.k < 0) return { m: 'skirt' };
    if (z.k === 0) {
      if (u < 1) return { m: 'skirt' };
      if (u < 2.6) { const a = (u - 1) / 1.6; return { m: 'skirt', rot: (0.04 + 0.22 * a) * Math.sin((u - 1) * 16), dy: -1.2 * a * Math.abs(Math.sin((u - 1) * 16)) }; }
      if (u < 11.45) {
        if (u < 5.0) { const s = (u - 2.6) / 2.4; return { m: 'free', x: lerp(SK[0], LAND[0], s), y: lerp(SK[1], LAND[1], s * s), rot: lerp(0, TAU - 0.5, s), bent: ramp(s, 0.96, 1) }; }
        const bu = u - 5.0;
        return { m: 'free', x: LAND[0], y: LAND[1] - (bu < 0.45 ? 9 * Math.abs(Math.sin(Math.PI * bu / 0.45)) * (1 - bu / 0.45) : 0), rot: -0.5, bent: 1 };
      }
      if (u < 11.85) return { m: 'tileF' };
      if (u < 19.5) return { m: 'tileTop', b: ramp(u, 18.9, 19.5) };
      return { m: 'pile', bent: bentTaps(u) };
    }
    if (u < 0.5) return { m: 'pile', bent: 0 };
    if (u < 4.26) return { m: 'tileN' };
    if (u < 11.4) return { m: 'car' };
    if (u < 17.3) return { m: 'crew', b: ramp(u, 17.1, 17.3) };
    return { m: 'skirt' };
  };
  const malletInHand = (t) => { const z = fortyTwo(t); return z.k === 0 && z.u >= 20.7 && z.u < 22.95; };

  const mallet = (ctx, x, y, hand) => {
    if (hand) { D.line(ctx, [[x - 9, y - 7], [x + 3, y + 2]], '#8a5a2b', 2); D.rect(ctx, x + 1, y - 1, 8, 6, '#6b737b', '#2b2f34', 0.8); }
    else { D.line(ctx, [[x - 7, y - 1.5], [x + 6, y - 1.5]], '#8a5a2b', 2); D.rect(ctx, x + 5, y - 5, 5, 5, '#6b737b', '#2b2f34', 0.8); }
  };

  // world-fixed parts: skirt (+ bolt studs), falling / lying plate, clang burst, plate on the pile / TL car, mallet. ty = TL car floor y.
  const world = (ctx, t, lod, ty) => {
    const p = plate(t), z = fortyTwo(t);
    D.circle(ctx, SK[0] - 5, SK[1] - 4, 1.3, '#64748b'); D.circle(ctx, SK[0] + 5, SK[1] + 4, 1.3, '#64748b');
    if (p.m === 'skirt') drawPlate(ctx, SK[0], SK[1] + (p.dy || 0), { rot: p.rot || 0 });
    else if (p.m === 'free') drawPlate(ctx, p.x, p.y, { rot: p.rot, bent: p.bent });
    else if (p.m === 'pile') drawPlate(ctx, PILE[0], PILE[1], { flat: true, bent: p.bent });
    else if (p.m === 'car') drawPlate(ctx, CAR_X, ty - 7);
    if (lod === 'far') return;
    if (!malletInHand(t)) mallet(ctx, MAL[0], MAL[1], false);
    if (z.k === 0 && z.u >= 5.0 && z.u < 5.8) {   // CLANG
      const s = (z.u - 5.0) / 0.8;
      ctx.globalAlpha = 1 - s;
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI * (i + 0.5) / 8 - 0.0, r0 = 10 + 12 * s, r1 = 17 + 24 * s;
        D.line(ctx, [[LAND[0] + Math.cos(a) * r0, LAND[1] + Math.sin(a) * r0], [LAND[0] + Math.cos(a) * r1, LAND[1] + Math.sin(a) * r1]], i % 2 ? '#fbbf24' : '#f8fafc', 1.6);
      }
      ctx.globalAlpha = 1;
    }
  };

  // plate / mallet in a hand. who: 'tile' | 'crew'; fig from A.draw
  const held = (ctx, t, who, fig) => {
    const p = plate(t), wN = fig.w(fig.sk.wristN), wF = fig.w(fig.sk.wristF);
    if (who === 'tile') {
      if (p.m === 'tileF') drawPlate(ctx, wF[0], wF[1] - 3, { rot: -0.4, bent: 1 });
      else if (p.m === 'tileTop') drawPlate(ctx, lerp(wN[0], PILE[0], p.b), lerp(wN[1] - 12, PILE[1], p.b), { flat: true, bent: 1 });
      else if (p.m === 'tileN') drawPlate(ctx, wN[0], wN[1] - 6);
      if (malletInHand(t)) mallet(ctx, wF[0], wF[1], true);
    } else if (p.m === 'crew') drawPlate(ctx, lerp(wN[0], SK[0], p.b), lerp(wN[1] - 6, SK[1], p.b));
  };

  // ---------- flock + jumper ----------
  const flockSlot = (theme) => TF.slot(theme, 'flock'), jumpSlot = (theme) => TF.slot(theme, 'tableJumper');
  const tbob = (t) => TF.mod(t, 24) * Math.PI / 6;      // flock bob phase: |sin| periods divide 24
  const TABLE_TOP = yF - 40, TX1 = 3626, TX0 = 3585;
  // jumper legs (u of beat 0): [t0, t1, x0, x1, y0, y1, face, hop]
  const LEGS = [
    [6.0, 8.4, HX, DOOR + 6, G0, G0, -1, 0], [8.4, 8.7, DOOR + 6, DOOR - 8, G0, yF, -1, 8], [8.7, 10.0, DOOR - 8, TX1, yF, yF, -1, 0],
    [10.0, 10.6, TX1, TX1 - 24, yF, TABLE_TOP, -1, 14], [10.6, 11.4, TX1 - 24, TX0, TABLE_TOP, TABLE_TOP, -1, 0],
    [11.4, 12.2, TX0, TX0, TABLE_TOP, TABLE_TOP, -1, 0], [12.2, 13.0, TX0, TX0, TABLE_TOP, TABLE_TOP, 1, 0],
    [13.0, 13.6, TX0, TX1 + 14, TABLE_TOP, yF, 1, 14], [13.6, 14.6, TX1 + 14, DOOR - 8, yF, yF, 1, 0],
    [14.6, 14.9, DOOR - 8, DOOR + 6, yF, G0, 1, 8], [14.9, 17.6, DOOR + 6, HX, G0, G0, 1, 0]
  ];
  const jumperAt = (t) => {
    const z = fortyTwo(t);
    if (z.k !== 0) return null;
    for (const [t0, t1, x0, x1, y0, y1, face, hop] of LEGS) {
      if (z.u < t0 || z.u >= t1) continue;
      const s = (z.u - t0) / (t1 - t0), moving = x0 !== x1;
      const bob = moving && !hop ? 2.5 * Math.abs(Math.sin(z.u * 18)) : 0;
      return { x: lerp(x0, x1, s), y: lerp(y0, y1, s) - (hop ? hop * 4 * s * (1 - s) : 0) - bob, face };
    }
    return null;
  };
  // side: 'lawn' draws the part east of the 1E wall, 'room' the part inside 1E (call from the 1E front layer)
  const jumper = (ctx, theme, t, lod, side) => {
    if (lod === 'far') return;
    const j = jumperAt(t);
    if (!j || (side === 'room') !== (j.x < lawn.x)) return;
    ctx.save(); ctx.translate(j.x, 0); ctx.scale(j.face, 1);
    jumpSlot(theme)(ctx, 0, j.y, { scale: 1, peek: 0, face: 1 });
    ctx.restore();
  };
  const flock = (ctx, theme, t, lod) => {
    if (lod === 'far') return;
    const z = fortyTwo(t), u = z.k === 0 ? z.u : -1, fl = flockSlot(theme);
    for (let i = 0; i < 3; i++) {
      if (i === 1 && u >= 6.0 && u < 17.6) continue;   // the jumper is away
      const x = lawn.x + 280 + i * 40, st = u >= 5.1 ? TF.pulse(u, 5.1, 8.0, 0.3) : 0, hu = u - (5.3 + 0.1 * i);
      const hop = hu >= 0 && hu < 0.5 ? 7 * Math.abs(Math.sin(Math.PI * hu / 0.5)) : 0;
      ctx.save(); ctx.translate(x, G0 - hop); ctx.scale(i === 1 ? -1 : 1, 1 + 0.22 * st);
      fl(ctx, 0, 0, tbob(t) + i * 0.9);
      ctx.restore();
    }
    jumper(ctx, theme, t, lod, 'lawn');
  };

  TF.gag42 = { world, held, flock, jumper, plate, fortyTwo };
})(typeof window !== 'undefined' ? window : globalThis);
