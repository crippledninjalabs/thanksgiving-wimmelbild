// 9. Quality check: car rolls into a scanner arch, laser sweeps, green check lights up.
// Themed top belt comes from the connector route; inspector with clipboard in the foreground.
TF.registerCell({
  id: 'qc', name: 'Quality check',
  draw(ctx, p, t, theme) {
    const { C, D, seg, lerp } = TF;
    const q = TF.frac(p * 2);
    const beltY = 196;
    const carX = q < 0.3 ? lerp(-140, 166, seg(q, 0, 0.3)) : lerp(166, 470, seg(q, 0.7, 1));
    const scanning = q > 0.32 && q < 0.6;
    const pass = q >= 0.6 && q < 0.95;

    // (top belt is the supercharger -> qc connector route, drawn by main.js)
    // status board (behind car)
    D.line(ctx, [[360, 140], [360, 196]], C.m3, 3);
    D.rect(ctx, 326, 92, 68, 50, '#1f2328', '#111', 1.6, 4);
    if (pass) D.poly(ctx, [[344, 117], [355, 128], [377, 104]], null, '#3fe05a', 6, false);
    else D.text(ctx, scanning ? 'SCAN' : '. . .', 360, 117, 11, scanning ? '#7fc4ff' : '#8a9299');

    // arch back post, car, belt, arch front
    D.belt(ctx, 0, beltY, 440, p, 60, 1, 0);
    D.car(ctx, carX, beltY, 1, '#e31937', { spin: -carX / 11 });
    D.rect(ctx, 150, 92, 12, 104, C.m2, C.line, 1.6, 2);
    D.rect(ctx, 300, 92, 12, 104, C.m2, C.line, 1.6, 2);
    D.rect(ctx, 144, 86, 174, 14, C.m, C.line, 1.8, 3);
    D.joint(ctx, 156, 93); D.joint(ctx, 306, 93);
    if (scanning) {
      const sx = lerp(166, 298, (Math.sin(TF.lin(q, 0.32, 0.6) * Math.PI * 4 - Math.PI / 2) + 1) / 2);
      ctx.fillStyle = 'rgba(80,170,255,0.18)'; ctx.fillRect(sx - 6, 100, 12, 96);
      D.line(ctx, [[sx, 100], [sx, 196]], '#50aaff', 2);
    }
    D.circ(ctx, 231, 93, 4, pass ? '#3fe05a' : scanning ? '#50aaff' : '#9aa1a8', C.ink, 1);

    // inspector in the foreground with a clipboard
    const look = TF.wave(p, 2);
    D.person(ctx, 96, 238, { face: look > 0 ? 1 : -1, shirt: '#ffffff', pants: '#34495e', hair: 'short', hairColor: '#333', armF: 1.3, armB: 0.2 });
    D.rect(ctx, look > 0 ? 104 : 79, 210, 9, 12, '#c89b62', '#8a6a3f', 1, 1);
    D.rect(ctx, look > 0 ? 106 : 81, 212, 5, 7, '#fff', null, 0, 0);
  },
});
