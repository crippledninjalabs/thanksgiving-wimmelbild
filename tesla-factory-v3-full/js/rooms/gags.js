// Stage 4 gags + Stage 5 easter-egg hooks. Every gag borrows a robot already on a loop; nobody waits.
// Themed actors and food come only from TF.slot(theme, name). Gophers removed.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, IT = TF.supply.items;
  const G0 = L.G;
  const gag = (cfg) => TF.gagHook(cfg);
  const G42 = gag({ id: 'fortyTwo', P: 127, offset: 19, cycles: 4, room: 'SHIP', trigger: '42 falls, flock/jumper spooks, a nearby tower tech hangs a new one' });
  const FEAST = gag({ id: 'feast', P: 89, offset: 11, cycles: 1, room: '3C', trigger: '3C worker cooks a bolt feast at the back crate' });
  const GRILL = gag({ id: 'grill', P: 61, offset: 5, cycles: 1, room: 'SHIP', trigger: 'ship-hand lights the not-a-flamethrower' });
  const TOWEL = gag({ id: 'towel', P: 67, offset: 29, cycles: 1, room: 'SHIP', trigger: 'ship-hand takes the towel to a porthole and hangs it back' });
  const SOIL = gag({ id: 'marsSoil', P: 71, offset: 43, cycles: 1, room: 'SHIP', trigger: 'ship-hand opens the mars-soil crate, shrugs, closes it' });
  // diablo / tour hook already registered in routes.js
  TF.gags = { G42, FEAST, GRILL, TOWEL, SOIL };
  TF.gagT = (cfg, t) => TF.mod(t - cfg.offset, cfg.P);

  // expose for rooms that borrow a robot in stride
  TF.feastActive = (t) => TF.gagActive(FEAST, t);
  TF.grillFlare = (t) => { if (!TF.gagActive(GRILL, t)) return 0; const g = TF.gagT(GRILL, t); return (g >= 4 && g < 14) ? TF.pulse(g, 4, 10, 1) : 0; };
  TF.towelActive = (t) => TF.gagActive(TOWEL, t);
  TF.soilActive = (t) => TF.gagActive(SOIL, t);
  TF.fortyTwo = (t) => {
    const on = TF.gagActive(G42, t), g = TF.gagT(G42, t);
    return { on, g, falling: on && g >= 1.3 && g < 8, onGround: on && g >= 2 && g < 24, hangNew: on && g >= 48 && g < 72 };
  };

  // ----- 42 fall + lawn jumper (theme slot) + new 42 at the cargo skirt -----
  const S = L.zoneById('SHIP').box, CX = S.x + S.w / 2;
  const doorY = S.y + S.h * ((0.46 + 0.58) / 2) - 20;
  const plaqueHome = { x: S.x + S.w - 14, y: doorY + 58 };
  const clang = { x: 4310 + 80, y: G0 - 8 };

  TF.transport({ id: 'Gag-42-and-jumper', period: 48, layer: 'front',
    box: { x: L.X1 - 20, y: 1400, w: 1600, h: G0 - 1400 + 40 },
    draw(ctx, t, theme, lod) {
      const ft = TF.fortyTwo(t), jumper = TF.slot(theme, 'tableJumper'), flock = TF.slot(theme, 'flock');
      // 42 plaque (home, falling, on the grating, or gone to the bin)
      if (!ft.on || ft.g < 1.3 || ft.g >= 72) {
        if (!(ft.on && ft.g >= 2 && ft.g < 72)) IT.plaque42(ctx, plaqueHome.x, plaqueHome.y, false);
      } else if (ft.g < 2.0) {
        const u = TF.lin(ft.g, 1.3, 2.0);
        IT.plaque42(ctx, TF.lerp(plaqueHome.x, clang.x, u), TF.lerp(plaqueHome.y, clang.y, u * u), true);
      } else if (ft.g < 15) {
        IT.plaque42(ctx, clang.x, clang.y, true);
        if (ft.g < 3 && lod !== 'far') { ctx.globalAlpha = 0.5 * (1 - TF.lin(ft.g, 2, 3)); D.circle(ctx, clang.x, clang.y, 16, null, '#78716c', 2); ctx.globalAlpha = 1; }
      } else if (ft.g < 48) {
        // in the scrap bin at the tower base (lid implied)
      } else if (ft.g < 64) {
        // new 42 being carried / hung — drawn at the skirt once the tech is hanging it
        const hung = ft.g >= 56;
        if (hung) IT.plaque42(ctx, plaqueHome.x, plaqueHome.y, false);
      } else IT.plaque42(ctx, plaqueHome.x, plaqueHome.y, false);

      // table jumper (same beats, theme-swapped actor)
      if (ft.on && lod !== 'far') {
        const lawn = L.zoneById('LAWN').box, tableX = 3515, tableY = L.floorY(1) - 8, doorX = lawn.x, winX = 3750;
        let jx, jy, pose = { face: 1 };
        if (ft.g >= 3.0 && ft.g < 4.5) { jx = TF.lerp(lawn.x + 360, winX, TF.ramp(ft.g, 3, 4.5)); jy = G0; pose.face = 1; }
        else if (ft.g >= 4.5 && ft.g < 5.5) { jx = TF.lerp(winX, tableX, TF.ramp(ft.g, 4.5, 5.5)); jy = TF.lerp(G0, tableY, TF.ramp(ft.g, 4.5, 5.5)); }
        else if (ft.g >= 5.5 && ft.g < 12) { jx = tableX; jy = tableY; pose.peek = 0.04 * Math.sin(ft.g * 3); }
        else if (ft.g >= 12 && ft.g < 16) { jx = TF.lerp(tableX, doorX + 10, TF.ramp(ft.g, 12, 16)); jy = TF.lerp(tableY, G0, TF.ramp(ft.g, 12, 16)); pose.face = 1; }
        else if (ft.g >= 16 && ft.g < 22) { jx = TF.lerp(doorX + 10, lawn.x + 360, TF.ramp(ft.g, 16, 22)); jy = G0; }
        if (jx != null) jumper(ctx, jx, jy, pose);
      }
    } });

  // ----- feast props at the back of 3C (the 3C worker is borrowed in floor3.js) -----
  const y3 = L.floorY(3);
  TF.transport({ id: 'Gag-feast-props', period: 48, layer: 'back', box: { x: 2280, y: L.ceilY(3), w: 200, h: 300 },
    draw(ctx, t, theme, lod) {
      const x = 2390, on = TF.feastActive(t), g = TF.gagT(FEAST, t);
      D.rect(ctx, x - 16, y3 - 2, 22, 8, '#7d5a2c', '#4a3420', 0.6);          // upturned crate
      D.rect(ctx, x + 10, y3 - 4, 22, 4, '#6b737b', '#334155', 0.6);           // hot-plate
      if (on && g >= 7 && g < 20) { ctx.globalAlpha = 0.5; D.circle(ctx, x + 21, y3 - 10, 6, '#f97316'); ctx.globalAlpha = 1; }
      D.rect(ctx, x + 8, y3 - 8, 16, 4, '#94a3b8', '#334155', 0.5);            // pan
      const slot = TF.slot(theme, 'feastMain');
      if (on && g >= 7 && g < 20) slot(ctx, x + 16, y3 - 8);
      D.rect(ctx, x - 40, y3 - 14, 18, 14, '#b98b52', '#6b4a22', 0.6);         // snack crate
      if (!(on && g >= 3 && g < 7)) D.rect(ctx, x - 40, y3 - 18, 18, 4, '#7d5a2c'); // lid closed in neutral
    } });

  // ----- drone-mishap Rube Goldberg (same 193 s timer as the Elon tour; PC ready before Diablo) -----
  const diablo = () => TF.gagHooks.find((g) => g.id === 'diablo');
  TF.mishap = (t) => {
    const d = diablo(); if (!d) return { on: false, g: 0 };
    const g = TF.mod(t - d.offset, d.P);
    return { on: g >= 24 && g < 120, g, drop: g >= 28 && g < 34, tube: g >= 34 && g < 70, assemble: g >= 70 && g < 110, ready: g >= 110 };
  };
  TF.transport({ id: 'Gag-mishap-pc', period: 48, layer: 'front',
    box: { x: 3280, y: L.ceilY(9), w: 500, h: L.floorY(7) - L.ceilY(9) + 40 },
    draw(ctx, t, theme, lod) {
      const m = TF.mishap(t); if (!m.on && !m.ready) return;
      const y7 = L.floorY(7), y9 = L.floorY(9);
      // dropped parcel at the 7E window, then a bouncing part up a tube to 9E
      if (m.drop) {
        const u = TF.lin(m.g, 28, 34);
        const x = TF.lerp(3750, 3620, u), y = TF.lerp(y7 - 80, y7 - 8, u * u);
        if (lod !== 'far') IT.box(ctx, x, y);
      }
      if (m.tube) {
        const u = TF.lin(m.g, 34, 70);
        const x = 3620, y = TF.lerp(y7 - 8, y9 - 40, u);
        D.rect(ctx, 3612, y9 - 40, 16, y7 - (y9 - 40), null, '#7b848c', 1); // vertical run
        if (lod !== 'far') IT.chip(ctx, x, y);
      }
      // desktop hopper + case at the Diablo desk (3670)
      const DESK = 3670, hy = y9 - 28;
      D.rect(ctx, DESK + 8, hy, 22, 10, '#334155', '#1e293b', 0.8);
      if (m.assemble || m.ready || (m.on && m.g >= 70)) {
        IT.computer(ctx, DESK + 30, y9 - 18);
        if (m.assemble && lod !== 'far') K.arm(ctx, [DESK + 50, y9], [DESK + 30, y9 - 22], { l1: 24, l2: 20, toolAng: Math.PI / 2, bend: 1, tool: 3 });
      }
    } });
})(typeof window !== 'undefined' ? window : globalThis);
