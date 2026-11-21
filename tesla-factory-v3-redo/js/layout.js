// TF.layout — the whole-scene world layout (FACTORY-MAP §1, §3). Grid-generated: adding a floor or column
// adds its rooms, walls, doors, floor rail (F<n>R) and core stops automatically.
(function (G) {
  const TF = G.TF, M = TF.M;
  const L = (TF.layout = {
    W: 5300, H: 3700, G: 3300,           // world size, ground line y
    cols: 5, floors: 9, cellW: 480, cellH: 300, wall: 20, slab: 16,
    X0: 1350,                             // building west edge (= core east edge)
    colNames: 'ABCDE',
    doorH: 150, rail: { cable: 5.16, hangerLo: 4.38, hangerHi: 4.5, tube: 5.58, tubeR: 5.36 }, // heights in metres above floor
  });
  L.X1 = L.X0 + L.cols * L.cellW;
  // West core shafts, west -> east (x ranges). BL touches column A.
  L.core = { x0: 850, x1: L.X0, shafts: {
    W4: [850, 905], SS: [905, 980], W3: [980, 1040], PT: [1040, 1070], cw: [1070, 1100], BL: [1100, L.X0] } };
  L.core.W3up = 1000; L.core.W3dn = 1022; L.core.PTx = 1055; L.core.SSx = [915, 968];

  // ---------- floors / rooms ----------
  L.floorY = (f) => L.G - (f - 1) * L.cellH - L.slab;       // floor surface of floor f (1..9)
  L.ceilY = (f) => L.G - f * L.cellH;                         // ceiling (underside of the slab above)
  L.hY = (f, hm) => L.floorY(f) - hm * M;                     // height in metres above floor f -> world y
  L.cell = (c, f) => ({ x: L.X0 + c * L.cellW, y: L.G - f * L.cellH, w: L.cellW, h: L.cellH });
  L.interior = (c, f) => ({ x: L.X0 + c * L.cellW + L.wall / 2, y: L.ceilY(f), w: L.cellW - L.wall, h: L.cellH - L.slab });
  L.roomId = (c, f) => f + L.colNames[c];
  L.roomList = [];
  for (let f = 1; f <= L.floors; f++) for (let c = 0; c < L.cols; c++) {
    const id = L.roomId(c, f);
    L.roomList.push({ id, col: c, floor: f, box: L.cell(c, f), inner: L.interior(c, f) });
  }
  L.roomById = (id) => L.roomList.find((r) => r.id === id);

  // ---------- outdoor + underground zones (world boxes, §1, §5) ----------
  const G0 = L.G;
  L.zones = [
    { id: 'ROOF', kind: 'roof', box: { x: L.core.x0, y: L.ceilY(9) - 300, w: L.X1 - L.core.x0, h: 300 } },
    { id: 'CORE', kind: 'core', box: { x: L.core.x0, y: L.ceilY(9), w: L.core.x1 - L.core.x0, h: G0 - L.ceilY(9) } },
    { id: 'YARD', kind: 'yard', box: { x: 0, y: G0 - 420, w: L.core.x0, h: 420 } },
    { id: 'DOCK', kind: 'dock', box: { x: 860, y: G0 - 70, w: 240, h: 70 } },
    { id: 'LAWN', kind: 'lawn', box: { x: L.X1, y: G0 - 300, w: 560, h: 300 } },
    { id: 'TANKFARM', kind: 'tankfarm', box: { x: 4310, y: G0 - 260, w: 230, h: 260 } },
    { id: 'TOWER', kind: 'tower', box: { x: 4560, y: 700, w: 130, h: G0 - 700 } },
    { id: 'SHIP', kind: 'ship', box: { x: 4760, y: 620, w: 250, h: 1460 } },
    { id: 'BOOSTER', kind: 'booster', box: { x: 4760, y: 2080, w: 250, h: 1060 } },
    { id: 'MOUNT', kind: 'mount', box: { x: 4720, y: 3140, w: 330, h: 160 } },
    { id: 'PITS', kind: 'ug', box: { x: L.core.x0, y: G0, w: 500, h: 380 }, label: 'W-core pits' },
    { id: 'BA', kind: 'ug', box: { x: L.X0, y: G0, w: 480, h: 380 }, label: 'BA coolant plant' },
    { id: 'BB', kind: 'ug', box: { x: L.X0 + 480, y: G0, w: 1000, h: 380 }, label: 'BB Megapack' },
    { id: 'VAULT', kind: 'ug', box: { x: 4060, y: G0, w: 640, h: 380 }, label: 'pump vault + LOX/CH4 tanks' },
    { id: 'TRENCH', kind: 'ug', box: { x: 4700, y: G0, w: 360, h: 380 }, label: 'trench' },
  ];
  L.zoneById = (id) => L.zones.find((z) => z.id === id);

  // ---------- connectors (§3) ----------
  // {id, type, a, b, hole?: {x,y,w,h} (cut into walls/slabs), spare?}
  L.connectors = [];
  const con = (c) => (L.connectors.push(c), c);
  for (let f = 1; f <= L.floors; f++) {
    // interior wall doors D(n)XY at floor level
    for (let c = 1; c < L.cols; c++) {
      const bx = L.X0 + c * L.cellW;
      con({ id: `D${f}${L.colNames[c - 1]}${L.colNames[c]}`, type: 'door', a: L.roomId(c - 1, f), b: L.roomId(c, f),
        hole: { x: bx - 11, y: L.floorY(f) - L.doorH, w: 22, h: L.doorH } });
    }
    // floor basket cable F(n)R: W3 -> through slots in every wall to column E
    const cy = L.hY(f, L.rail.cable);
    con({ id: `F${f}R`, type: 'cable', a: `W3-${f}`, b: L.roomId(L.cols - 1, f), y: cy,
      holes: Array.from({ length: L.cols + 1 }, (_, c) => ({ x: L.X0 + c * L.cellW - 11, y: cy - 30, w: 22, h: 64 })).slice(0, L.cols) });
    con({ id: `W3-${f}`, type: 'basket-transfer', a: 'W3', b: L.roomId(0, f) });
    con({ id: `PT-${f}`, type: 'tube-port', a: 'PT', b: L.roomId(0, f) });
    con({ id: `SS-${f}`, type: 'slide-exit', a: 'SS', b: L.roomId(0, f), spare: true });
    con({ id: `W4-${f}`, type: 'stair-door', a: 'W4', b: L.roomId(0, f), spare: true });
  }
  [1, 2, 4, 5, 6, 8].forEach((f) => con({ id: `BL-${f}`, type: 'cage-gate', a: 'BL', b: L.roomId(0, f),
    hole: { x: L.X0 - 11, y: L.floorY(f) - L.doorH, w: 22, h: L.doorH } }));
  // floor-6 specific openings (declared here so the walls are cut by the engine)
  const f6 = 6;
  con({ id: 'F6H', type: 'hanger-rail', a: '6A', b: '6C', holes: [1, 2].map((c) => ({ x: L.X0 + c * L.cellW - 11, y: L.hY(f6, L.rail.hangerHi) - 8, w: 22, h: 83 })) });
  con({ id: 'L65', type: 'slab-lift', a: '6E', b: '5E', hole: { x: 3494, y: L.floorY(6), w: 252, h: L.slab } });
  con({ id: 'L21', type: 'slab-lift', a: '2A', b: '1A', hole: { x: 1430, y: L.floorY(2), w: 360, h: L.slab } });
  con({ id: 'RISER', type: 'pipes', a: 'BA', b: '6A', also: ['4E', '2E', 'BB'] });
  con({ id: 'PB', type: 'paternoster', a: '3B', b: '5B', also: ['4B', '2B'] });
  ['O5E', 'O4E', 'H78', 'S89', 'H9', 'H9C', 'O7E', 'O9E', 'B8', 'O1E', 'X1A', 'DOCK', 'SL71', 'FILL', 'TRENCH', 'TL', 'CS', 'AA', 'CH', 'EB']
    .forEach((id) => con({ id, type: 'pending' }));
  con({ id: 'S78', type: 'stair', a: '7E', b: '8E', hole: { x: 3585, y: L.floorY(8), w: 100, h: L.slab } });
  L.conById = (id) => L.connectors.find((c) => c.id === id);
  L.exists = (id) => !!(L.roomById(id) || L.zoneById(id) || ['BL', 'PT', 'W3', 'SS', 'W4', 'cw'].includes(id));
})(typeof window !== 'undefined' ? window : globalThis);
