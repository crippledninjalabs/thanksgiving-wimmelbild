// Grid geometry, which cell sits where, and the connectors between neighbouring cells.
// Add a cell: create js/cells/<id>.js (TF.registerCell) + one entry in TF.LAYOUT (+ connectors if wanted).
(function () {
  TF.GRID = { x0: 60, y0: 100, cw: 440, ch: 240, gx: 80, gy: 55 };

  TF.LAYOUT = [
    { id: 'casting', col: 0, row: 0 },
    { id: 'body', col: 1, row: 0 },
    { id: 'paint', col: 2, row: 0 },
    { id: 'battery', col: 0, row: 1 },
    { id: 'optimus', col: 1, row: 1 },
    { id: 'cybertruck', col: 2, row: 1 },
    { id: 'cybercab', col: 0, row: 2 },
    { id: 'supercharger', col: 1, row: 2 },
    { id: 'qc', col: 2, row: 2 },
  ];

  // kind 'belt' = conveyor route. route: points ['a'|'b', x, y] in cell-local coords of the
  //   from-cell (a) or to-cell (b). Horizontal legs are belts (y = belt top), vertical legs drop chutes.
  //   src: 'hopper' adds a feeder hopper above the first point; drop: N adds a fall of N px into a bin.
  //   themed: true => theme payloads, else Tesla parts boxes. speed (optional) = integer cycles per loop.
  // kind 'pipe' = pipe across a row gutter; x / x2 = cell-local x where it leaves `from` / enters `to`.
  TF.CONNECTORS = [
    { from: 'casting', to: 'body', kind: 'belt', themed: true, src: 'hopper', drop: 40,
      route: [['a', 404, 48], ['b', 30, 48]] },
    { from: 'body', to: 'paint', kind: 'belt', themed: true, src: 'hopper', drop: 40,
      route: [['a', 412, 48], ['b', 60, 48]] },
    // feeds the battery cell's top belt and ends in a bin at the Optimus station
    { from: 'battery', to: 'optimus', kind: 'belt', themed: true, src: 'hopper', drop: 40,
      route: [['a', 112, 96], ['b', 40, 96]] },
    // ends in a bin on the Cybertruck building roof
    { from: 'optimus', to: 'cybertruck', kind: 'belt', themed: true, src: 'hopper', drop: 30,
      route: [['a', 412, 44], ['b', 50, 44]] },
    // ends in a bin on the Supercharger canopy
    { from: 'cybercab', to: 'supercharger', kind: 'belt', themed: true, src: 'hopper', drop: 30,
      route: [['a', 420, 44], ['b', 80, 44]] },
    // drops in the gutter onto the QC cell's top belt, which runs into a bin at the far end
    { from: 'supercharger', to: 'qc', kind: 'belt', themed: true, src: 'hopper', drop: 30,
      route: [['a', 404, 44], ['b', -60, 44], ['b', -60, 66], ['b', 420, 66]] },
    { from: 'casting', to: 'battery', kind: 'pipe', x: 30, x2: 70 },
    { from: 'body', to: 'optimus', kind: 'pipe', x: 400, x2: 360 },
    { from: 'paint', to: 'cybertruck', kind: 'pipe', x: 400 },
    { from: 'battery', to: 'cybercab', kind: 'pipe', x: 70, x2: 30 },
    { from: 'optimus', to: 'supercharger', kind: 'pipe', x: 110, x2: 60 },
    { from: 'cybertruck', to: 'qc', kind: 'pipe', x: 420, x2: 400 },
  ];

  TF.cellRect = (entry) => {
    const g = TF.GRID;
    return { x: g.x0 + entry.col * (g.cw + g.gx), y: g.y0 + entry.row * (g.ch + g.gy), w: g.cw, h: g.ch };
  };
})();
