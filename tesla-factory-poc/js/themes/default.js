// Default theme: Tesla parts on the themed conveyors.
(function () {
  const { C, D } = TF;

  // Payload drawers (centred at x,y, size s)
  TF.ITEMS.wheel = (ctx, x, y, s) => D.wheel(ctx, x, y, s * 0.5, 0);
  TF.ITEMS.cell = (ctx, x, y, s) => D.battCell(ctx, x, y + s * 0.5, s / 16, '#5a6570');
  TF.ITEMS.box = (ctx, x, y, s) => {
    D.rect(ctx, x - s / 2, y - s * 0.4, s, s * 0.8, '#c89b62', '#8a6a3f', 1.2, 1.5);
    D.line(ctx, [[x, y - s * 0.4], [x, y + s * 0.4]], '#e8d2a8', 1.6);
  };

  // Decorations (global coords)
  TF.DECOR.cone = (ctx, d) => {
    D.poly(ctx, [[d.x - 7, d.y], [d.x - 2, d.y - 18], [d.x + 2, d.y - 18], [d.x + 7, d.y]], '#ff8a1f', '#b85d0e', 1.2);
    D.line(ctx, [[d.x - 4.5, d.y - 8], [d.x + 4.5, d.y - 8]], '#fff', 2.4);
    D.rect(ctx, d.x - 10, d.y - 2, 20, 3, '#b85d0e', null, 0, 1);
  };
  TF.DECOR.plant = (ctx, d, p) => {
    const sway = TF.wave(p, 2, d.x / 300) * 1.5;
    for (const a of [-0.6, -0.2, 0.25, 0.65]) {
      D.line(ctx, [[d.x, d.y - 14], [d.x + Math.sin(a) * 14 + sway, d.y - 14 - Math.cos(a) * 14]], '#4c9a5b', 3);
    }
    D.poly(ctx, [[d.x - 8, d.y - 15], [d.x + 8, d.y - 15], [d.x + 6, d.y], [d.x - 6, d.y]], '#cfd4d9', C.line, 1.2);
  };

  TF.registerTheme({
    id: 'default',
    label: 'Tesla',
    accent: '#e31937',
    accent2: '#3d8bfd',
    sign: 'GIGAFACTORY',
    signBg: '#ffffff', signColor: '#3a4148',
    payloads: ['wheel', 'box', 'cell'],
    decor: [
      { type: 'cone', x: 40, y: 990 }, { type: 'plant', x: 300, y: 990 },
      { type: 'cone', x: 560, y: 990 }, { type: 'cone', x: 1040, y: 990 },
      { type: 'plant', x: 1300, y: 990 }, { type: 'cone', x: 1560, y: 990 },
    ],
  });
})();
