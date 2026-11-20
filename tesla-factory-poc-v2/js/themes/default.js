// Default theme: Tesla parts on the themed conveyors, chutes and pipes.
(function () {
  const { C, D } = TF;
  TF.ITEMS.wheel = (ctx, x, y, s) => D.wheel(ctx, x, y, s * 0.5, 0);
  TF.ITEMS.cell = (ctx, x, y, s) => D.battCell(ctx, x, y + s * 0.5, s / 16, '#5a6570');
  TF.ITEMS.box = (ctx, x, y, s) => {
    D.rect(ctx, x - s / 2, y - s * 0.4, s, s * 0.8, '#c89b62', '#8a6a3f', 1.2, 1.5);
    D.line(ctx, [[x, y - s * 0.4], [x, y + s * 0.4]], '#e8d2a8', 1.6);
  };
  TF.ITEMS.gear = (ctx, x, y, s) => {
    const r = s * 0.42;
    ctx.fillStyle = '#9aa3ab'; ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8, rr = i % 2 ? r : r * 1.28; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
    D.circ(ctx, x, y, r * 0.4, '#f7f8fa', null);
  };
  TF.DECOR.cone = (ctx, d) => {
    D.poly(ctx, [[d.x - 5, d.y], [d.x - 1.5, d.y - 13], [d.x + 1.5, d.y - 13], [d.x + 5, d.y]], '#ff8a1f', '#b85d0e', 1);
    D.line(ctx, [[d.x - 3, d.y - 6], [d.x + 3, d.y - 6]], '#fff', 2);
  };
  TF.DECOR.plant = (ctx, d, t) => {
    const sway = TF.osc(t, 0.25, d.x / 300) * 1.2;
    for (const a of [-0.6, -0.2, 0.25, 0.65]) D.line(ctx, [[d.x, d.y - 10], [d.x + Math.sin(a) * 10 + sway, d.y - 10 - Math.cos(a) * 10]], '#4c9a5b', 2.4);
    D.poly(ctx, [[d.x - 6, d.y - 11], [d.x + 6, d.y - 11], [d.x + 4.5, d.y], [d.x - 4.5, d.y]], '#cfd4d9', C.line, 1);
  };
  TF.registerTheme({
    id: 'default', label: 'Tesla',
    accent: '#e31937', accent2: '#3d8bfd', blob: '#3d8bfd',
    sign: 'GIGAFACTORY', signBg: '#ffffff', signColor: '#3a4148',
    payloads: ['wheel', 'box', 'cell', 'gear'],
    decor: [
      { type: 'cone', x: 1110, y: 366 }, { type: 'plant', x: 1062, y: 672 },
      { type: 'cone', x: 1574, y: 986 }, { type: 'plant', x: 540, y: 986 },
    ],
  });
})();
