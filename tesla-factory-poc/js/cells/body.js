// 2. Body assembly: body rolls in on a dolly, two gantry arms fit the wheels, car rolls on.
TF.registerCell({
  id: 'body', name: 'Body line',
  draw(ctx, p) {
    const { C, D, FY, seg, lerp } = TF;
    const q = TF.frac(p * 2);
    const carX = q < 0.3 ? lerp(-140, 145, seg(q, 0, 0.3)) : lerp(145, 470, seg(q, 0.7, 1));
    const reach = seg(q, 0.3, 0.48) - seg(q, 0.55, 0.7);
    const fitted = q >= 0.5;
    const beltY = 196;

    // gantry
    D.rect(ctx, 60, 66, 12, FY - 66, C.m2, C.line, 1.6, 2);
    D.rect(ctx, 368, 66, 12, FY - 66, C.m2, C.line, 1.6, 2);
    D.rect(ctx, 50, 60, 340, 14, C.m, C.line, 1.8, 3);
    // wheel racks
    for (const rx of [100, 318]) {
      D.rect(ctx, rx - 16, 128, 32, 6, C.m2, C.line, 1.2, 1);
      D.wheel(ctx, rx, 118, 9); D.wheel(ctx, rx, 100, 9);
    }
    // worker on top of the gantry turning a valve
    D.valve(ctx, 300, 44, 7, p * Math.PI * 8);
    D.line(ctx, [[300, 51], [300, 60]], C.m3, 3);
    D.person(ctx, 284, 60, { face: 1, shirt: '#e67e22', hair: 'cap', hat: '#ffffff', armF: 1.5 + TF.wave(p, 4) * 0.3, armB: 1.2 });

    // car on belt
    D.belt(ctx, 0, beltY, 440, p, 60, 1, 0);
    if (!fitted) D.rect(ctx, carX + 20, beltY - 8, 90, 8, '#59616a', null, 0, 2);
    D.car(ctx, carX, fitted ? beltY : beltY - 6, 1, '#e9ecef', { wheels: fitted, spin: -carX / 11 });

    // arms: bases on the gantry, gripper goes from rack to wheel spot
    const arms = [[150, 74, 100, 104, carX + 27], [270, 74, 318, 104, carX + 103]];
    arms.forEach(([bx, by, rx, ry, wx], i) => {
      const tx = lerp(rx, wx, reach), ty = lerp(ry, beltY - 11, reach);
      const [hx, hy] = D.robotArm(ctx, bx, by, tx, ty, 62, 62, i ? -1 : 1);
      if (q >= 0.7 || q < 0.5) D.wheel(ctx, hx, hy + 8, 10, reach * 4); // wheel in gripper
      D.rect(ctx, hx - 6, hy - 2, 12, 5, C.dark, null, 0, 1);
    });
    D.circ(ctx, 214, 67, 3, q > 0.48 && q < 0.56 ? '#4caf50' : '#9aa1a8', null);
  },
});
