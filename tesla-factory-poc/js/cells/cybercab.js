// 7. Cybercab test loop: the 2-door robotaxi laps a small oval while a marshal waves a flag.
TF.registerCell({
  id: 'cybercab', name: 'Cybercab test loop',
  draw(ctx, p) {
    const { C, D } = TF;
    const cx = 220, cy = 140, rx = 172, ry = 60;
    // track
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 32; ctx.stroke();
    ctx.strokeStyle = '#6b737b'; ctx.lineWidth = 29; ctx.stroke();
    ctx.fillStyle = '#e7efe4'; ctx.fill();
    ctx.save(); ctx.setLineDash([8, 8]); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
    // start/finish chequer
    for (let i = 0; i < 4; i++) D.rect(ctx, cx - 3 + (i % 2) * 3, cy + ry - 14 + i * 7, 3, 7, i % 2 ? '#222' : '#fff', null, 0, 0);
    // infield: control booth, cones, marshal
    D.rect(ctx, 150, 118, 46, 30, C.m, C.line, 1.6, 3);
    D.rect(ctx, 156, 124, 34, 12, C.glass, null, 0, 1);
    D.text(ctx, 'LAP ' + (1 + Math.floor(p * 3)), 173, 130, 8, '#7fe08a');
    D.joint(ctx, 173, 118);
    for (const x of [120, 320]) TF.DECOR.cone ? TF.DECOR.cone(ctx, { x, y: 158 }) : 0;
    const wave = TF.wave(p, 12) * 0.5;
    D.person(ctx, 262, 160, { face: -1, shirt: '#f39c12', hair: 'cap', hat: '#ffffff', armF: Math.PI - 0.5 + wave, armB: 0.2 });
    // flag in the raised hand
    const hx = 262 - Math.sin(Math.PI - 0.5 + wave) * 11, hy = 160 - 24 + Math.cos(Math.PI - 0.5 + wave) * 11;
    D.line(ctx, [[hx, hy], [hx, hy - 12]], C.ink, 1.4);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) D.rect(ctx, hx + i * 5, hy - 12 + j * 4, 5, 4, (i + j) % 2 ? '#222' : '#fff', null, 0, 0);

    // car: 3 laps per loop, centred exactly on the track centreline. Smaller on the far (top) side;
    // foreshortened on the bends, switching to a front (coming toward us) / rear view at the ends.
    const a = p * Math.PI * 2 * 3;
    const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    const vx = -rx * Math.sin(a), vy = ry * Math.cos(a);
    const kx = Math.abs(vx) / Math.hypot(vx, vy);
    const depth = 0.72 + 0.2 * (Math.sin(a) + 1) / 2;
    if (kx > 0.42) D.cybercab(ctx, x, y + 9 * depth, depth, { dir: vx >= 0 ? 1 : -1, squash: kx, spin: a * 8 });
    else D.cybercabEnd(ctx, x, y + 9 * depth, depth, vy > 0);
  },
});
