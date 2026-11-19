// 3. Paint booth: grey body goes in, nozzles puff, Tesla-red car comes out.
TF.registerCell({
  id: 'paint', name: 'Paint booth',
  draw(ctx, p) {
    const { C, D, FY, seg, lerp } = TF;
    const q = TF.frac(p * 2);
    // Two staggered bodies: one waits outside / exits while the next enters, so a body is always near.
    // u in [0,2): enter (0-0.3), paint (0.3-0.6), roll out to x=306 (0.6-1), leave the cell (1-1.3).
    const posX = (u) => u < 0.3 ? lerp(-140, 155, seg(u, 0, 0.3)) : u < 1 ? lerp(155, 306, seg(u, 0.6, 1)) : lerp(306, 470, seg(u, 1, 1.3));
    const colOf = (u) => { const k = seg(u, 0.32, 0.58), m = (a, b) => Math.round(lerp(a, b, k));
      return `rgb(${m(200, 227)},${m(205, 25)},${m(210, 55)})`; };
    const spraying = q > 0.3 && q < 0.6;
    const beltY = 200;

    // booth back wall
    D.rect(ctx, 140, 70, 160, 130, '#e4e8ec', C.line, 1.6, 2);
    D.belt(ctx, 0, beltY, 440, p, 60, 1, 0);
    // side pillars sit behind the cars so bodies roll in/out cleanly
    D.rect(ctx, 134, 66, 12, 132, C.m2, C.line, 1.6, 2);
    D.rect(ctx, 294, 66, 12, 132, C.m2, C.line, 1.6, 2);
    for (const u of [q + 1, q]) { const cx = posX(u); if (cx < 450) D.car(ctx, cx, beltY, 1, colOf(u), { spin: -cx / 11 }); }
    // glass + frame (front)
    ctx.fillStyle = 'rgba(160,200,230,0.18)'; ctx.fillRect(150, 90, 140, 108);
    D.rect(ctx, 134, 66, 172, 24, C.m, C.line, 1.8, 3);
    D.sign(ctx, 186, 70, 68, 16, 'PAINT', { logo: true, size: 9 });
    // nozzles
    [180, 220, 260].forEach((nx, i) => {
      D.rect(ctx, nx - 3, 90, 6, 16, C.m3, C.line, 1.2, 1);
      D.poly(ctx, [[nx - 5, 106], [nx + 5, 106], [nx + 3, 112], [nx - 3, 112]], C.dark, null);
      D.joint(ctx, nx, 92, 2.6);
      if (spraying) {
        for (let j = 0; j < 3; j++) {
          const f = TF.frac(p * 16 + j / 3 + i * 0.21);
          D.circ(ctx, nx + (j - 1) * 6 * f, 116 + 26 * f, 3 + 7 * f, `rgba(227,25,55,${0.55 * (1 - f)})`, null);
        }
      }
    });
    // paint tank on a platform with a worker
    D.rect(ctx, 322, 84, 40, 64, '#f1d5d9', C.line, 1.8, 6);
    D.rect(ctx, 322, 120 - 30 * TF.wave(p, 2) * 0.3, 40, 4, C.red, null, 0, 0);
    D.gauge(ctx, 342, 100, 8, 0.5 + 0.4 * (spraying ? 1 : 0) * Math.abs(TF.wave(p, 8)));
    D.pipe(ctx, [[342, 84], [342, 58], [220, 58], [220, 66]], 6);
    D.rect(ctx, 316, 148, 112, 6, C.m2, C.line, 1.4, 1);
    D.line(ctx, [[414, 154], [440, 166]], C.m3, 4); // wall bracket (keeps the car lane clear)
    D.joint(ctx, 414, 154);
    D.person(ctx, 392, 148, { face: -1, shirt: '#8e44ad', armF: 0.6 + TF.wave(p, 3) * 0.15, bob: TF.wave(p, 5) * 0.5 });
  },
});
