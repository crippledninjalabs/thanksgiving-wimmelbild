// Shipping + Supercharger bay: cars charge (bar fills, plug in/out) then roll out the garage door.
// Mezzanine: forklift and Optimus stack themed crates; the test-room belt delivers here.
TF.registerRoom({
  id: 'shipping',
  back(ctx, t, th, r) {
    const { C, D, M } = TF;
    const F = 300;
    // mezzanine
    D.rect(ctx, 0, 150, 500, 7, C.m2, C.line, 1.4, 1);
    for (const x of [6, 210, 456, 494]) D.rect(ctx, x - 2, 157, 4, F - 157, C.m3, null, 0, 0);
    D.rect(ctx, 160, 66, 8, 84, C.m3, C.line, 1, 1); // stand under the belt receiver
    // racks of themed crates
    for (let row = 0; row < 2; row++) {
      D.rect(ctx, 214, 104 + row * 24, 200, 3, C.m3, C.line, 1, 1);
      for (let i = 0; i < 7; i++) TF.payload(ctx, th, i + row * 3, 228 + i * 27, 94 + row * 24, 13);
    }
    for (const x of [214, 412]) D.rect(ctx, x - 2, 70, 4, 80, C.m3, null, 0, 0);
    // forklift shuttling a crate (reverses, never flips)
    const fx = 30 + 120 * (1 - Math.cos(TF.saw(t, 0.125) * Math.PI * 2)) / 2;
    M.forklift(ctx, fx, 150, 1, 6 + 4 * TF.osc(t, 0.25), (c, x, y) => TF.payload(c, th, 1, x, y - 5, 14));
    // Optimus stacking
    const k = TF.ease(TF.tri(t, 0.25));
    D.opt(ctx, 196, 150, 0.6, { face: 1, hF: [210 + k * 12, 120 - k * 6], hB: [206 + k * 10, 124 - k * 6] });
    TF.payload(ctx, th, 2, 214 + k * 12, 116 - k * 6, 12);
    // superchargers
    const charger = (px, slot) => {
      const ph = TF.phaseAt(TF.CAR, slot, t), cx = TF.CAR.slots[slot][0] - 1086;
      const fill = ph < 2.4 ? TF.lin(ph, 0.7, 2.0) : 1 - TF.lin(ph, 2.4, 3.6);
      D.rect(ctx, px - 6, F - 52, 14, 52, '#f2f3f5', C.line, 1.4, 4);
      D.rect(ctx, px - 6, F - 52, 14, 8, '#e31937', null, 0, 3);
      D.tLogo(ctx, px + 1, F - 36, 9, C.red);
      D.rect(ctx, px - 3, F - 26, 8, 18, '#263039', null, 0, 1);
      D.rect(ctx, px - 2, F - 9 - 16 * fill, 6, 16 * fill, fill > 0.98 ? '#4caf50' : '#3d8bfd', null, 0, 0);
      const plug = TF.bump(ph, 0.3, 0.7, 2.0, 2.35);
      const hx = TF.lerp(px + 10, cx - 44, plug), hy = TF.lerp(F - 30, F - 20, plug);
      ctx.strokeStyle = '#2b3036'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + 6, F - 46);
      ctx.quadraticCurveTo((px + hx) / 2 + 4, Math.max(F - 6, hy + 10), hx, hy); ctx.stroke();
      D.rect(ctx, hx - 3, hy - 3, 6, 6, '#2b3036', null, 0, 1);
      if (fill > 0.05 && fill < 0.98) M.lights(ctx, px - 1, F - 58, 1, t, 0, 7, 2);
    };
    charger(52, 21); charger(242, 22);
    // garage door: rolled-up shutter + beacon
    D.rect(ctx, 440, 196, 60, 14, '#c3c9cf', '#7d868f', 1.2, 2);
    M.beacon(ctx, 470, 196, t, '#ff9800', 1);
    M.stripes(ctx, 452, F - 4, 48, 4);
    M.cabinet(ctx, 456, 150, 30, 40, t, 8);
    M.fan(ctx, 472, 40, 12, t, 2); M.fan(ctx, 472, 78, 9, t, 3);
    for (const [lx, off] of [[300, 0], [380, 0.5]]) { D.line(ctx, [[lx, 0], [lx, 50]], C.ink, 1); D.poly(ctx, [[lx - 7, 58], [lx - 3, 50], [lx + 3, 50], [lx + 7, 58]], C.m2, C.ink, 1); D.circ(ctx, lx, 59, 3, TF.saw(t, 1, off) < 0.6 ? '#ffd84a' : '#c9b26a', null); }
    M.screen(ctx, 20, 20, 60, 30, t, 4, '#4caf50');
    M.lights(ctx, 24, 60, 8, t, 6);
  },
});

// Elon's glass personnel lift (world coords): row-1 floor (672) <-> shipping mezzanine (836) at x 1500..1534.
(function () {
  const { C, D } = TF;
  TF.addLayer('back', (ctx) => {
    for (const x of [1500, 1534]) D.rect(ctx, x - 2, 600, 4, 236, C.m3, C.line, 1, 1);
    D.rect(ctx, 1496, 596, 42, 6, C.m2, C.line, 1.2, 1);
  });
  // called around Elon's draw: back=true before him (cab back wall), false after (glass, rails)
  TF.elonLift = (ctx, t, s, back) => {
    const tau = TF.mod(t, 16);
    const cy = tau < 3.8 || tau >= 15.4 ? 672 : tau < 5.6 ? TF.lerp(672, 836, TF.seg(tau, 3.8, 5.6)) : tau < 13.9 ? 836 : TF.lerp(836, 672, TF.seg(tau, 13.9, 15.4));
    if (back) {
      D.rect(ctx, 1501, cy - 46, 32, 46, 'rgba(225,235,242,0.9)', C.line, 1.2, 2);
      D.line(ctx, [[1517, 600], [1517, cy - 46]], C.ink, 1);
      return;
    }
    D.rect(ctx, 1501, cy - 46, 32, 46, 'rgba(190,215,235,0.25)', C.ink, 1.6, 2);
    D.rect(ctx, 1499, cy - 2, 36, 4, C.dark, null, 0, 1);
    D.circ(ctx, 1528, cy - 40, 2, TF.saw(t, 1) < 0.5 ? '#4caf50' : '#9aa1a8', null);
    // front catwalk railing on the mezzanine where he walks
    D.line(ctx, [[1330, 822], [1498, 822]], C.m3, 2);
    for (let x = 1336; x < 1498; x += 32) D.line(ctx, [[x, 822], [x, 836]], C.m3, 1.6);
  };
})();
