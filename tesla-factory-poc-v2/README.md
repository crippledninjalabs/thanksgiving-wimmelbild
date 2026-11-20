# Tesla Factory v2: 3x3 cutaway "ant farm"

A single building cross-section drawn on one `<canvas>`. Nine rooms share solid 22 px walls and 14 px floor slabs,
and cars, packs, wheels, payloads and people pass through door-, slot- and deck-sized openings between them.
The world is 1600x1000 and drawn slightly scaled (14 px side margins plus a ground strip), so every coordinate
in the code is a world coordinate. No images, no CDNs, no build step.

## Run
Open `index.html` directly, or `python3 -m http.server 8000` and browse to http://localhost:8000/.

## URL params / hooks
| | |
|---|---|
| `?theme=thanksgiving` | theme on load (default `default`) |
| `?t=3.5` | freeze the clock at 3.5 s |
| `window.__setTheme(name)` | switch theme live (returns false if unknown) |
| `window.__setTime(s)` | freeze at `s` seconds; `__setTime(null)` resumes |

The small top-left button cycles themes. One global clock, `TF.LOOP = 16` s. Everything is a pure function
of `t mod 16`, so t=0 and t=16 are pixel-identical.

## How motion stays seamless
- **Car line** (`TF.CAR`, built in `js/layout.js`): one car's journey as slots `[x, y, dwell, move, via]`.
  Cars follow each other every `P = 4` s (16 is a multiple of P). A car's look (frame, shell, paint, wheels,
  battery) depends only on its journey time, so nothing pops. Rooms sync their machines with
  `TF.phaseAt(TF.CAR, slot, t)`, which gives the seconds since the current car arrived at that slot.
- **Payload routes** (`TF.ROUTES`): `k` items enter per loop (a multiple of 12, so 3- or 4-item payload lists tile).
  Items start under a feeder and end in a bin, so they never pop in.
- **Walkers** (`TF.WALKERS`): `[time, x, y?]` keys. Equal-x segments are stops, or eased lift rides when y changes.
  Turns ease at the end of a stop. Legs, arms and hands blend between walking and standing poses (`still` weight),
  so stopping never snaps. Copies are spaced `period/n` apart, which must divide 16. `front: true` draws the
  walker on the front walkway layer (Elon). `kind: 'carrier'` picks a box off the Optimus-room dispenser
  ledge and lowers it into the battery-room bin; both ends are hidden by room fronts.
- **Elon** rides a glass personnel lift (`TF.elonLift` in `js/rooms/shipping.js`) between the row-1 Optimus room and
  the shipping mezzanine catwalk once per loop.
- Frequencies passed to `TF.osc/saw/tri(t, hz)` must be multiples of 1/16.

## Files
- `js/core.js`: namespace, math, primitives. `js/figures.js`: people, Optimus, cars, Cybertruck, Cybercab.
- `js/machines.js`: arms, sparks, fans, gauges, screens, steam, tanks, ladders, forklift, AGV and more.
- `js/flows.js`: chain engine, car looks, lifts, decks, routes, pipes, walkers, walls/slabs.
- `js/layout.js`: grid, wall/slab openings, car slots, routes, pipes, walkers.
- `js/rooms/*.js`: one file per room. `js/themes/*.js`: themes. `js/main.js`: draw order, theme switching.
- `tools/shot.js out.png <theme> <t...>`: screenshots. `tools/popscan.js [theme] [fps] [threshold] [t0] [t1]`
  checks loop identity and flags isolated single-frame spikes (pops). Both use the playwright-core in `../review`.

## Add a room
1. Create `js/rooms/myroom.js`:
   ```js
   TF.registerRoom({
     id: 'myroom',
     back(ctx, t, theme, r) { TF.M.fan(ctx, 40, 40, 12, t, 2); },  // local coords, floor at y = r.h
     mid(ctx, t, theme, r) {},    // optional, drawn after cars
     front(ctx, t, theme, r) {},  // optional, drawn over walkers
   });
   ```
2. Add `{ id: 'myroom', col, row }` to `TF.LAYOUT` in `js/layout.js` (replacing a cell), plus any wall openings.
3. Add a `<script>` tag before `js/layout.js` in `index.html`.
For world-coordinate things that cross rooms, use `TF.addLayer('back' | 'mid' | 'front', (ctx, t, theme) => …)`.

## Add a theme (e.g. Christmas)
Create `js/themes/christmas.js` and add `<script src="js/themes/christmas.js"></script>` after the other themes:
```js
(function () {
  const { D } = TF;
  TF.ITEMS.present = (ctx, x, y, s) => { D.rect(ctx, x - s / 2, y - s * 0.4, s, s * 0.8, '#c0392b', '#7b1e15', 1, 1);
    D.line(ctx, [[x, y - s * 0.4], [x, y + s * 0.4]], '#f4c430', 2); };
  TF.ITEMS.tree = (ctx, x, y, s) => D.poly(ctx, [[x, y - s * 0.6], [x + s * 0.45, y + s * 0.4], [x - s * 0.45, y + s * 0.4]], '#2e8b57', '#1d5e3a', 1);
  TF.ITEMS.candy = (ctx, x, y, s) => D.line(ctx, [[x, y + s * 0.4], [x, y - s * 0.2], [x + s * 0.3, y - s * 0.4]], '#e31937', 3);
  TF.registerTheme({
    id: 'christmas', label: 'Christmas', accent: '#c0392b', accent2: '#2e8b57', blob: '#c0392b',
    sign: 'Merry Christmas', signBg: '#fff', signColor: '#a0281d',
    payloads: ['present', 'tree', 'candy'],            // 3 or 4 entries
    roofDecor: [{ type: 'garland', x0: 0, x1: 1600, y: 52, sw: 100, sag: 10 }],
    decor: [{ type: 'pumpkin', x: 1112, y: 366 }],     // any TF.DECOR type, world coords
  });
})();
```
Themes control payloads on the non-car belts, chutes and racks, pipe blob colour, accents, banner text and
decorations. Cars, Cybertruck, Cybercab and Optimus always stay Tesla.
