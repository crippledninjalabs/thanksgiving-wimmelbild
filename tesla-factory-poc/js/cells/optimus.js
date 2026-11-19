// 5. Optimus station: robot A lifts parts boxes from the in-feed onto a roller shelf,
// robot B picks them off the shelf and sorts them into the red or blue chute.
TF.registerCell({
  id: 'optimus', name: 'Optimus station',
  draw(ctx, p) {
    const { C, D, FY, seg, lerp, frac } = TF;
    const q = frac(p * 2);
    const box = (x, y, col = '#c89b62') => {
      D.rect(ctx, x - 11, y - 9, 22, 18, col, '#8a6a3f', 1.2, 1.5);
      D.line(ctx, [[x, y - 9], [x, y + 9]], '#e8d2a8', 1.6);
    };

    // in-feed belt + roller shelf + chutes (back layer)
    D.belt(ctx, 0, 186, 100, p, 30, 1, FY - 196);
    D.rect(ctx, 136, 144, 148, 8, C.m2, C.line, 1.6, 2);
    for (let x = 144; x < 284; x += 16) D.circ(ctx, x, 148, 2.4, C.m, C.line, 1);
    for (const lx of [146, 274]) { D.rect(ctx, lx - 2, 152, 4, FY - 152, C.m2, C.line, 1.2, 1); D.joint(ctx, lx, 152); }

    // ---- box A (current cycle) ----
    let bA = null, handsA = null;
    if (q < 0.2) bA = [lerp(-12, 88, seg(q, 0, 0.2)), 177];
    else if (q < 0.3) { bA = [88, 177]; handsA = seg(q, 0.2, 0.3); }
    else if (q < 0.55) {
      const k = seg(q, 0.3, 0.55), P0 = [88, 177], Cc = [118, 110], P1 = [150, 135];
      bA = [0, 1].map((j) => (1 - k) * (1 - k) * P0[j] + 2 * k * (1 - k) * Cc[j] + k * k * P1[j]);
      handsA = 1;
    } else if (q < 0.85) { bA = [lerp(150, 268, seg(q, 0.62, 0.85)), 135]; handsA = 1 - seg(q, 0.55, 0.62); }
    else if (q < 0.91) bA = [268, 135]; // after this robot B holds it

    // ---- box B (picked up at q=0.85, so runs on a shifted phase) ----
    const s = frac(p * 2 - 0.85);
    const kB = Math.floor(p * 2 - 0.85), up = ((kB % 2) + 2) % 2 === 0;
    const bx = lerp(296, 318, seg(s, 0.06, 0.3) - seg(s, 0.4, 0.55));
    const entry = up ? [344, 128] : [344, 188];
    let bB = null, handsB = 0;
    if (s < 0.06) handsB = seg(s, 0, 0.06);
    else if (s < 0.3) { const k = seg(s, 0.06, 0.3); bB = [lerp(268, entry[0], k), lerp(135, entry[1], k) - Math.sin(k * Math.PI) * 18]; handsB = 1; }
    else if (s < 0.45) { bB = [lerp(entry[0], entry[0] + 70, seg(s, 0.3, 0.45)), entry[1]]; handsB = 1 - seg(s, 0.3, 0.4); }

    if (bA) box(bA[0], bA[1]);
    if (bB) box(bB[0], bB[1]);

    // chutes (drawn over boxes so they disappear inside)
    for (const [cy, col] of [[128, C.red], [188, C.blue]]) {
      D.rect(ctx, 344, cy - 16, 96, 32, C.m, C.line, 1.8, 3);
      D.rect(ctx, 344, cy - 12, 8, 24, '#59616a', null, 0, 1);
      D.rect(ctx, 360, cy - 4, 60, 8, col, null, 0, 2);
    }
    D.rect(ctx, 400, 204, 10, 18, C.m2, C.line, 1.2, 1);
    D.circ(ctx, 392, 92, 6, up ? C.red : C.blue, C.ink, 1.2);
    D.line(ctx, [[392, 98], [392, 112]], C.m3, 2.4);

    // robots
    const restA = [[118 - 4, FY - 30], [118 + 4, FY - 30]];
    const tgtA = handsA ? (bA[0] < 118 ? [[bA[0] + 9, bA[1]], [bA[0] + 7, bA[1] - 2]] : [[bA[0] - 9, bA[1]], [bA[0] - 7, bA[1] - 2]]) : null;
    const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    const faceA = bA && bA[0] > 124 && q > 0.3 && q < 0.62 ? 1 : -1;
    D.optimus(ctx, 118, FY, {
      face: faceA, bob: TF.wave(p, 4) * 0.6,
      hF: tgtA ? mix(restA[1], tgtA[0], handsA) : restA[1], hB: tgtA ? mix(restA[0], tgtA[1], handsA) : restA[0],
    });
    const faceB = bB && bB[0] > bx ? 1 : -1;
    const restB = [[bx - 4, FY - 30], [bx + 4, FY - 30]];
    const tB = bB || [268, 135];
    const side = tB[0] < bx ? 1 : -1;
    const tgtB = [[tB[0] + 9 * side, tB[1]], [tB[0] + 7 * side, tB[1] - 2]];
    D.optimus(ctx, bx, FY, {
      face: faceB, bob: TF.wave(p, 4, 0.5) * 0.6,
      hF: mix(restB[1], tgtB[0], handsB), hB: mix(restB[0], tgtB[1], handsB),
    });
  },
});
