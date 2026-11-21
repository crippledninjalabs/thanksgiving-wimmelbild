// Default theme + slot registry. Themes only swap themed payloads and decor (FACTORY-MAP §7); parts, vehicles, Optimus never change.
// Room code draws themed items ONLY via TF.slot(theme, name)(ctx, ...). A theme lists the slots it overrides in `slots`;
// anything missing falls back to this default theme, then to a no-op. Slot signatures (x,y = bottom-centre of the item):
//   food(ctx,x,y,i)           one small plated food item (i = 0,1,2 picks a variant)
//   feastSpread(ctx,x,y)      cafeteria table spread, centred on x, y = table top, ~110 wide
//   feastMain(ctx,x,y,k)      robot-feast pan contents, k = 1 full .. 0 empty, y = pan rim
//   tableJumper(ctx,x,y,pose) table-gag jumper, pose {scale, peek, face}
//   flock(ctx,x,y,t)          one member of the lawn flock (the 42 gag), t = seconds for bobbing
(function (G) {
  const TF = G.TF, D = TF.draw;
  const NOOP = () => {};
  TF.slot = (theme, name) => {
    const th = typeof theme === 'string' ? TF.themes[theme] : theme;
    return (th && th.slots && th.slots[name]) || (TF.themes.default && TF.themes.default.slots[name]) || NOOP;
  };

  const burger = (ctx, x, y, s = 1) => {
    D.rect(ctx, x - 5 * s, y - 2 * s, 10 * s, 2 * s, '#b45309', '#7c2d12', 0.5);
    D.rect(ctx, x - 5 * s, y - 4 * s, 10 * s, 2 * s, '#5b2c12');
    D.rect(ctx, x - 5 * s, y - 5 * s, 10 * s, 1 * s, '#65a30d');
    D.poly(ctx, [[x - 5 * s, y - 5 * s], [x - 4 * s, y - 8 * s], [x + 4 * s, y - 8 * s], [x + 5 * s, y - 5 * s]], '#d97706', '#7c2d12', 0.5);
  };
  const fries = (ctx, x, y, s = 1) => {
    for (let k = -2; k <= 2; k++) D.rect(ctx, x + k * 1.6 * s - 0.6, y - (8 + (k & 1)) * s, 1.3 * s, 6 * s, '#facc15');
    D.poly(ctx, [[x - 4 * s, y - 4 * s], [x + 4 * s, y - 4 * s], [x + 3 * s, y], [x - 3 * s, y]], '#dc2626', '#7f1d1d', 0.5);
  };
  const pizza = (ctx, x, y, s = 1) => {
    D.poly(ctx, [[x - 6 * s, y - 6 * s], [x + 6 * s, y - 6 * s], [x, y]], '#f97316', '#9a3412', 0.5);
    D.rect(ctx, x - 6 * s, y - 7 * s, 12 * s, 1.5 * s, '#d97706');
    D.circle(ctx, x - 2 * s, y - 4 * s, 1.1 * s, '#b91c1c'); D.circle(ctx, x + 2 * s, y - 4.5 * s, 1.1 * s, '#b91c1c');
  };
  const bolt = (ctx, x, y) => { D.rect(ctx, x - 1.5, y - 4, 3, 4, '#9aa1a8', '#4a5056', 0.4); D.rect(ctx, x - 2.5, y - 5.5, 5, 1.8, '#6b737b'); };
  const battery = (ctx, x, y, a) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    D.rect(ctx, -5, -2, 10, 4, '#facc15', '#92400e', 0.5); D.rect(ctx, 5, -1, 1.5, 2, '#9aa1a8'); D.rect(ctx, -5, -2, 3, 4, '#1f2937');
    ctx.restore();
  };
  const shiba = (ctx, x, y, t) => {
    const b = Math.abs(Math.sin((t || 0) * 3)) * 1.5;
    D.rect(ctx, x - 5, y - 6 - b, 10, 5, '#d98a3d', '#8a5222', 0.5);
    D.circle(ctx, x + 5, y - 8 - b, 3.2, '#d98a3d', '#8a5222', 0.5);
    D.poly(ctx, [[x + 3.5, y - 10 - b], [x + 4, y - 13 - b], [x + 6, y - 10.5 - b]], '#d98a3d');
    D.line(ctx, [[x - 5, y - 5 - b], [x - 8, y - 9 - b]], '#d98a3d', 1.6);
    D.rect(ctx, x - 4, y - 1.5, 1.6, 1.5, '#8a5222'); D.rect(ctx, x + 3, y - 1.5, 1.6, 1.5, '#8a5222');
  };

  TF.theme({
    name: 'default',
    food: ['burger', 'fries', 'pizza'],   // kept for compatibility; room code uses the `food` slot
    decor: {
      garland: null,       // (ctx, x0, x1, yCeil, t, lod) ceiling decor along a floor
      capsuleDecal: null,  // (ctx) drawn on pneumatic-tube capsules, local coords (capsule 16 x 9)
    },
    slots: {
      food: (ctx, x, y, i) => [burger, fries, pizza][((i % 3) + 3) % 3](ctx, x, y, 0.8),
      feastSpread(ctx, x, y) {
        D.rect(ctx, x - 55, y - 3, 110, 3, '#ffffff', '#9aa3ab', 0.6);
        burger(ctx, x - 40, y - 3, 1.5); burger(ctx, x - 24, y - 3, 1.5);
        pizza(ctx, x - 4, y - 3, 2.2); pizza(ctx, x + 14, y - 3, 2.2);
        fries(ctx, x + 36, y - 3, 1.8); fries(ctx, x + 48, y - 3, 1.5);
      },
      feastMain(ctx, x, y, k) {   // bolts + AA batteries + oil-can gravy, shrinking with k
        const n = Math.ceil(5 * k);
        for (let i = 0; i < n; i++) bolt(ctx, x - 12 + i * 6, y - 1 - (i & 1) * 2);
        if (k > 0.45) battery(ctx, x - 4, y - 8, 0.3); if (k > 0.8) battery(ctx, x + 5, y - 9, -0.4);
        if (k > 0.1) D.rect(ctx, x - 14, y - 1.5, 28 * Math.min(1, k + 0.2), 1.5, '#1c1917');
      },
      tableJumper: (ctx, x, y, pose) => shiba(ctx, x, y - ((pose && pose.peek) || 0), 0),
      flock: (ctx, x, y, t) => shiba(ctx, x, y, t),
    },
  });
  TF.themeArt = { bolt, battery, burger, fries, pizza };   // shared small art for theme files
})(typeof window !== 'undefined' ? window : globalThis);
