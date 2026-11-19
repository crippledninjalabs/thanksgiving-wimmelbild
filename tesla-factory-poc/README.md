# Tesla Factory — animated 3x3 POC

Flat vector "Rube Goldberg" Tesla factory drawn on one `<canvas>` (no images, no CDNs, no build).

## Run
Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000   # then http://localhost:8000/
```

## URL params / hooks
| | |
|---|---|
| `?theme=thanksgiving` | pick theme on load (default: `default`) |
| `?t=3.5` | freeze the clock at 3.5 s (screenshots) |
| `window.__setTheme(name)` | switch theme live (returns false for unknown names) |
| `window.__setTime(s)` | freeze at `s` seconds; `__setTime(null)` resumes |

The small button (top-left) cycles themes. Everything is driven by one clock with a 14 s loop (`TF.LOOP`).

## Layout of the code
- `js/core.js`: `TF` namespace, math (`seg`, `wave`, `ik`), primitives (belt, pipe, joint, gauge, T logo…)
- `js/figures.js`: people, Optimus, cars, Cybertruck, Cybercab
- `js/cells/*.js`: one file per cell, `TF.registerCell({ id, name, draw(ctx, p, t, theme) })`.
  Local coords are 440x240 and the floor is at `TF.FY`; `p` is loop phase 0..1. Drawing is clipped to the cell.
- `js/layout.js`: `TF.LAYOUT` (cell id -> col,row) and `TF.CONNECTORS` (belts/pipes between neighbours)
- `js/themes/*.js`: themes, plus the payload/decoration drawers they use
- `js/main.js`: render loop, header signs, connectors, Elon's walk, theme switching
- `tools/shot.sh <t> <theme> <out.png>`: headless Chrome screenshot; `tools/test.html` runs an API smoke test (serve the folder first)

## Add a cell
1. Create `js/cells/mycell.js`:
   ```js
   TF.registerCell({ id: 'mycell', name: 'My cell', draw(ctx, p, t, theme) {
     const q = TF.frac(p * 2);              // use integer cycles per loop so it loops seamlessly
     TF.D.belt(ctx, 20, 196, 400, p, 40);
     TF.D.person(ctx, 200, TF.FY, { shirt: '#4a90d9', armF: 1 + TF.wave(p, 4) * 0.3 });
   }});
   ```
2. Add a `<script>` line in `index.html` and an entry in `TF.LAYOUT` (`{ id: 'mycell', col: 0, row: 3 }`).
   For a 4th row, also enlarge `TF.H`/`TF.GRID`.
3. Optionally add connectors, e.g. `{ from: 'cybercab', to: 'mycell', kind: 'pipe', x: 70 }`.
   Belt routes are drawn over cells, so pick route points in free space (see the comments in `layout.js`).

## Add a theme (e.g. Christmas)
`js/themes/christmas.js`:
```js
(function () {
  const { D } = TF;
  TF.ITEMS.gift = (ctx, x, y, s) => {
    D.rect(ctx, x - s / 2, y - s / 2, s, s, '#c0392b', '#7b1e16', 1.2, 1.5);
    D.line(ctx, [[x, y - s / 2], [x, y + s / 2]], '#f4c430', 2);
  };
  TF.ITEMS.tree = (ctx, x, y, s) => D.poly(ctx, [[x, y - s * 0.6], [x + s / 2, y + s / 2], [x - s / 2, y + s / 2]], '#2e8b57', '#1d5c39', 1);
  TF.DECOR.lights = (ctx, d, p) => {
    for (let x = d.x0; x < d.x1; x += 30) TF.D.circ(ctx, x, d.y, 4, TF.frac(p * 7 + x / 90) < 0.5 ? '#ff4d4d' : '#ffd84a', null);
  };
  TF.registerTheme({
    id: 'christmas', label: 'Christmas',
    accent: '#c0392b', accent2: '#2e8b57',
    sign: 'Merry Christmas', signBg: '#fff', signColor: '#c0392b',
    payloads: ['gift', 'tree', 'wheel'],          // drawers from TF.ITEMS
    decor: [{ type: 'lights', x0: 0, x1: 1600, y: 8 }],
  });
})();
```
Then add `<script src="js/themes/christmas.js"></script>` next to the other theme scripts.
Themes only affect the themed conveyors (the routes in `TF.CONNECTORS`, which include the battery and QC top belts), decorations, accents and the banner. Cars and Optimus always stay Tesla.
