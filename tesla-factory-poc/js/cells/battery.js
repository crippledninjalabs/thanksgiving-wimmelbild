// 4. Battery-cell line: cells march from the hopper into a pack that fills, closes and ships.
// The themed top belt is a connector route (layout.js); a worker carries boxes underneath.
TF.registerCell({
  id: 'battery', name: 'Battery cells',
  draw(ctx, p, t, theme) {
    const { C, D, FY, seg, lerp } = TF;
    const q = TF.frac(p * 2);
    const beltY = 172;

    // (top belt is the battery -> optimus connector route, drawn by main.js)
    // hopper
    D.poly(ctx, [[30, 112], [92, 112], [74, 150], [48, 150]], C.m, C.line, 1.8);
    for (let i = 0; i < 5; i++) D.battCell(ctx, 42 + i * 9, 126, 0.7);
    D.rect(ctx, 52, 150, 18, 12, C.m2, C.line, 1.4, 1);
    D.joint(ctx, 61, 156);

    // main belt with marching cells
    D.belt(ctx, 40, beltY, 262, p, 56, 1, FY - beltY - 10);
    ctx.save(); ctx.beginPath(); ctx.rect(60, 140, 232, 40); ctx.clip();
    const off = TF.frac(p * 28) * 22;
    for (let x = 60 + off - 22; x < 300; x += 22) D.battCell(ctx, x, beltY, 1);
    ctx.restore();
    D.rect(ctx, 284, 140, 26, 32, C.m2, C.line, 1.6, 2); // loader
    D.joint(ctx, 297, 148);

    // pack: fills (0-0.74), lid closes (0.74-0.8), sinks into the stand (0.8-0.88),
    // an empty pack rises back up (0.92-1)
    const fill = Math.floor(seg(q, 0.02, 0.74) * 8 + 0.001);
    const fresh = q > 0.9;
    const py = fresh ? 44 * (1 - seg(q, 0.92, 1)) : 44 * seg(q, 0.8, 0.88);
    const px = 322, filled = fresh ? 0 : fill;
    D.rect(ctx, px, 140 + py, 100, 42, '#3c4651', C.ink, 1.8, 3);
    for (let i = 0; i < filled; i++) D.battCell(ctx, px + 10 + i * 11.5, 178 + py, 1, '#7fb3ff');
    if (!fresh && q > 0.74) D.rect(ctx, px - 2, 136 + py - 4 * (1 - seg(q, 0.74, 0.8)), 104, 8, '#2c333b', C.ink, 1.2, 2);
    D.rect(ctx, 312, 182, 116, 40, C.m, C.line, 1.6, 2); // stand (drawn over the sinking pack)
    D.circ(ctx, 330, 202, 4, q > 0.8 && q < 0.88 ? '#4caf50' : '#9aa1a8', C.ink, 1);

    // crates the worker shuttles between
    for (const [cx, n] of [[86, 2], [276, 1]]) for (let j = 0; j < n; j++) D.rect(ctx, cx - 9, 226 - j * 12, 18, 12, '#c89b62', '#8a6a3f', 1.2, 1.5);
    // worker carrying boxes under the belt (ping-pong with pauses)
    const w = TF.frac(p * 2);
    const wk = seg(w, 0.05, 0.4) - seg(w, 0.55, 0.9);
    const moving = (w > 0.05 && w < 0.4) || (w > 0.55 && w < 0.9);
    D.person(ctx, lerp(110, 250, wk), 238, {
      face: w < 0.5 ? 1 : -1, shirt: '#27ae60', hair: 'cap', hat: '#f4c430', box: w < 0.5,
      walk: moving ? p * Math.PI * 2 * 18 : undefined,
    });
  },
});
