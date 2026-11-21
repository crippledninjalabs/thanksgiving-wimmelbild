// TF.shells — the permanent framework drawn by the engine from the layout data: building walls and slabs
// (shared, with every connector hole cut), faint empty shells for any layout slot without a module, the roof,
// yard, lawn, tank farm, tower, Starship, booster and the underground strip.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw;
  const S = (TF.shells = {});
  const WALL = '#c3c9d0', SLAB = '#c3c9d0', FAINT = '#b9c0c8', LABEL = '#b9c0c8';

  // subtract hole intervals [a,b] from [y0,y1]
  const cut = (y0, y1, holes) => {
    let segs = [[y0, y1]];
    for (const [a, b] of holes) segs = segs.flatMap(([s, e]) => (b <= s || a >= e ? [[s, e]] : [[s, a], [b, e]].filter(([p, q]) => q - p > 0.5)));
    return segs;
  };
  // floor cable slots are only cut where that floor has a built room (empty floors keep solid shared walls)
  const floorBuilt = (f) => L.roomList.some((r) => r.floor === f && TF.rooms[r.id]);
  const allHoles = () => L.connectors.filter((c) => c.type !== 'cable' || floorBuilt(+c.id.slice(1, -1)))
    .flatMap((c) => [c.hole, ...(c.holes || [])].filter(Boolean));

  S.building = (ctx, view) => {
    const holes = allHoles();
    // slabs (floor f's slab under its floor surface; f = 10 is the roof slab)
    for (let f = 1; f <= L.floors + 1; f++) {
      const y = f <= L.floors ? L.floorY(f) : L.ceilY(L.floors) - L.slab;
      const x0 = L.X0 - L.wall / 2, x1 = L.X1 + L.wall / 2;
      const hs = holes.filter((h) => h.h <= L.slab + 0.5 && Math.abs(h.y - y) < 1).map((h) => [h.x, h.x + h.w]);
      for (const [a, b] of cut(x0, x1, hs)) D.rect(ctx, a, y, b - a, L.slab, SLAB);
    }
    // walls (c = 0 west wall shared with the core, c = cols east outer wall)
    for (let c = 0; c <= L.cols; c++) {
      const bx = L.X0 + c * L.cellW, x = bx - L.wall / 2;
      for (let f = 1; f <= L.floors; f++) {
        const y0 = L.ceilY(f), y1 = L.floorY(f);
        const hs = holes.filter((h) => h.h > L.slab + 0.5 && h.x < x + L.wall && h.x + h.w > x && h.y < y1 && h.y + h.h > y0).map((h) => [h.y, h.y + h.h]);
        for (const [a, b] of cut(y0, y1, hs)) D.rect(ctx, x, a, L.wall, b - a, WALL);
      }
    }
    // faint shells for rooms without a module
    for (const r of L.roomList) {
      if (TF.rooms[r.id]) continue;
      const b = r.inner;
      if (!TF.boxHit(b, view)) continue;
      D.text(ctx, r.id, b.x + b.w / 2, b.y + b.h / 2, 34, '#d7dbe0');
    }
  };

  // outdoor + underground shells
  S.outside = (ctx, view, t, theme) => {
    const G0 = L.G;
    D.rect(ctx, 0, G0, L.W, L.H - G0, '#f7f5f1');                      // soil
    D.line(ctx, [[0, G0], [L.W, G0]], '#b9bfc6', 3);                    // ground
    for (const z of L.zones) {
      if (!TF.boxHit(TF.pad(z.box, 40), view)) continue;
      const b = z.box, cx = b.x + b.w / 2;
      if (TF.claimedZones && TF.claimedZones[z.id]) continue;
      switch (z.kind) {
        case 'roof': {
          const y = b.y + b.h;
          D.circle(ctx, L.X0 + 240, y - 40, 34, null, FAINT, 2); D.circle(ctx, L.X0 + 240, y - 40, 22, null, FAINT, 2);  // drone pad over 9A
          for (let c = 1; c < L.cols; c++) for (let k = 0; k < 4; k++) {
            const x = L.X0 + c * L.cellW + 30 + k * 110;
            D.poly(ctx, [[x, y - 16], [x + 90, y - 16], [x + 70, y - 60], [x - 4, y - 60]], '#f1f4f8', FAINT, 1.5);
          }
          // sign + theme banner
          const sx = L.X0 + 1200, sy = y - 170;
          D.rect(ctx, sx - 260, sy - 40, 520, 80, '#1d2125', '#5d656d', 2);
          D.tLogo(ctx, sx - 170, sy, 52); D.sign(ctx, 'T E S L A', sx + 40, sy + 2, 44, '#ffffff', 'center', '700');
          if (theme && theme.decor.garland) theme.decor.garland(ctx, sx - 260, sx + 260, sy + 40, t, 'mid');
          D.line(ctx, [[sx - 200, sy + 40], [sx - 200, y]], FAINT, 3); D.line(ctx, [[sx + 200, sy + 40], [sx + 200, y]], FAINT, 3);
          break;
        }
        case 'yard':
          D.line(ctx, [[0, G0 - 4], [b.w, G0 - 4]], '#d9dde2', 8);
          D.line(ctx, [[20, G0 - 4], [b.w - 20, G0 - 4]], '#ffffff', 1.5, [30, 30]);
          D.text(ctx, 'WEST YARD', 260, G0 - 200, 32, LABEL);
          break;
        case 'dock': break; // drawn in front by the core transport (it hides arriving / leaving carriers)
        case 'lawn':
          D.text(ctx, 'EAST LAWN', cx, G0 - 150, 30, LABEL);
          break;
        case 'tankfarm':
          D.rect(ctx, b.x + 20, b.y + 60, 80, 200, null, FAINT, 2); D.rect(ctx, b.x + 120, b.y + 90, 80, 170, null, FAINT, 2);
          D.text(ctx, 'tank farm', cx, b.y + 30, 22, LABEL);
          break;
        case 'tower': {
          D.rect(ctx, b.x, b.y, b.w, b.h, null, FAINT, 2);
          for (let y = b.y; y < b.y + b.h - 60; y += 60) D.line(ctx, [[b.x, y], [b.x + b.w, y + 60], [b.x, y + 60]], '#e1e5e9', 1.5);
          D.text(ctx, 'TOWER', cx, b.y - 30, 26, LABEL);
          break;
        }
        case 'ship': {
          ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h); ctx.lineTo(b.x, b.y + 240);
          ctx.quadraticCurveTo(b.x, b.y, cx, b.y); ctx.quadraticCurveTo(b.x + b.w, b.y, b.x + b.w, b.y + 240);
          ctx.lineTo(b.x + b.w, b.y + b.h); ctx.closePath(); ctx.strokeStyle = FAINT; ctx.lineWidth = 2.5; ctx.stroke();
          const decks = [['BRIDGE', 0.2], ['CREW', 0.3], ['GALLEY', 0.4], ['CARGO', 0.5], ['HEADER', 0.6], ['CH4', 0.7], ['LOX', 0.8], ['ENGINES', 0.92]];
          decks.forEach(([n, f]) => { const y = b.y + b.h * f; D.line(ctx, [[b.x, y], [b.x + b.w, y]], '#e3e6ea', 1.5); D.text(ctx, n, cx, y - b.h * 0.045, 20, LABEL); });
          D.rect(ctx, b.x + b.w - 12, b.y + b.h * 0.5 - 42, 12, 40, null, FAINT, 1.5);   // cargo door
          D.text(ctx, 'STARSHIP', cx, b.y - 30, 28, LABEL);
          break;
        }
        case 'booster':
          D.rect(ctx, b.x, b.y, b.w, b.h, null, FAINT, 2.5);
          [0.35, 0.7].forEach((f) => D.line(ctx, [[b.x, b.y + b.h * f], [b.x + b.w, b.y + b.h * f]], '#e3e6ea', 1.5));
          D.text(ctx, 'SUPER HEAVY', cx, b.y + 60, 22, LABEL);
          break;
        case 'mount':
          D.poly(ctx, [[b.x, b.y + b.h], [b.x + 40, b.y], [b.x + b.w - 40, b.y], [b.x + b.w, b.y + b.h]], null, FAINT, 2);
          break;
        case 'ug':
          D.rect(ctx, b.x + 4, b.y + 4, b.w - 8, b.h - 8, null, '#e4ded5', 2);
          D.text(ctx, z.label, cx, b.y + b.h / 2, 24, '#cfc6b9');
          break;
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
