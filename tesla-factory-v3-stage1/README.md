# Tesla Factory v3

Static canvas scene (no build step). Open `index.html` from `file://` or serve the folder from any sub-path
(GitHub Pages works; every path is relative). Plan: `../v3-plan/FACTORY-MAP.md`. Figures: `figures/` (approved, used as-is).

Stage 1 = the engine, the whole 5 x 9 layout, and floor 6 (Model Y top half). Every other room, the roof, the
yard, lawn, tower, Starship and the underground strip are drawn by the engine as faint empty shells from the layout
data. Those shells stay as the permanent fallback for any layout slot that has no module.

## Architecture
```
index.html            loads figures/js/* (TF3), then engine, layout, transport, themes, rooms, runtime
js/engine/core.js     TF namespace, registries (rooms, transports, themes, flows), time + math helpers, LOD tiers
js/engine/actors.js   TF.act: Optimus/Elon choreography on the TF3 clips (hold, keyed, walk with planted feet, turn,
                      cross-fade at every segment joint), A.draw() -> skeleton + local->world mapping
js/layout.js          TF.layout: 5 x 9 grid, core shafts, outdoor/underground zones, connector registry (§3)
js/engine/shells.js   building walls/slabs with every connector hole cut, empty-room shells, outside shells
js/engine/render.js   one frame = pure function of (t, view, theme): shells -> back -> main -> front, culled by box
js/engine/camera.js   fit-all, wheel zoom at cursor, drag pan, pinch, double-click a room, Home
js/engine/boot.js     boot checks (console)
js/engine/peeks.js    reusable easter-egg peeks (Shiba, waving Optimus, drone, hard hat) on their own prime timers
js/transport/*.js     generic transports: track (path + schedule + fleets), rollers, basket (zip line), hanger,
                      tube (pneumatic capsule), slide (spiral), cagelift (big open cage + bobbing counterweight),
                      core.js (west core: BL lift with the §6 schedule, PT riser, W3 chain, SS slide, W4, DOCK table)
js/themes/*.js        default, thanksgiving (only decor + themed payloads)
js/rooms/kit.js       shared machine parts (IK industrial arm, sparks, gauge, valve, ladder, pipe) and parts
js/rooms/line6.js     floor-6 line: Model Y car chain (12 s pitch), staged body drawing, F6H hangers, F6R baskets,
                      PT-6 bolt capsule
js/rooms/6A..6E.js    the floor-6 room modules
js/main.js            URL params, animation loop, test hooks
```
Time: `t` in seconds. Machines use the 24 s base loop (floor 6 pitch 12 s); the whole scene repeats every 48 s.
Nothing keeps state between frames, so any `t` can be drawn directly (culling, `?t=` and the tools rely on that).

World units: x right, y down, `TF.M = 50` units per metre. Room cell 480 x 300, walls 20, slabs 16.
`TF.layout.floorY(f)` = floor surface of floor f, `hY(f, metres)` = height above it.

## Adding a room module
Create `js/rooms/<id>.js`, add a `<script>` line in `index.html`, and register it:
```js
TF.room({
  id: '5E', period: 12, box: TF.layout.roomById('5E').box,
  ports: { L65: 'in', D5ED: 'out', F5R: 'pass' },   // connector id -> in | out | both | pass | spare
  actors: ['5E.glassOptimus'],                       // each actor is owned by exactly one module
  flows: [{ item: 'glazed car', from: '5E', via: ['D5ED'], to: '5D', sink: 'continues on the line' }],
  back(ctx, t, theme, lod) {},   // machines behind the product
  draw(ctx, t, theme, lod) {},   // main layer
  front(ctx, t, theme, lod) {},  // workers, front arms, glass
});
```
- Draw in world units. Use `TF.act` for Optimus (targets come from real things: seam points, part grab points).
- Everything must be a pure function of `t`; periods must divide 48.
- The engine stops drawing the empty shell for that slot once the module is registered.
- Hand-offs between modules: share the timeline function (see `line6.js`: the car chain decides where each car
  is; the 6E lift lowers it below the slab, where a floor-5 module takes over at the same times).

## Ports and connectors
`TF.layout.connectors` holds every opening from FACTORY-MAP §3. Doors `D<n>XY`, floor cables `F<n>R`, `W3-n`, `PT-n`,
`SS-n`, `W4-n` are generated from the grid. Floor-6 openings (`F6H`, `L65`, `BL-6`, `RISER`) are declared there too.
Connectors with a `hole` / `holes` cut the shared walls and slabs. A module's `ports` name connectors. Boot checks
report an orphan when a built room touches a connector but declares no port, or declares a port that no flow uses.

## Level of detail (px per world unit)
`far` < 0.35: big shapes (cars, lifts, machines, rails). `mid` 0.35-0.8: adds Optimus, arms, baskets, hangers,
tubes, beads. `near` > 0.8: adds sparks, gauges, bolts, flow dots, roller spokes. Modules get `lod` in every call.

## No text in the scene
Owner rule: the scene shows no words except the roof TESLA sign (and red T logos on machines). Use `TF.draw.text`
for labels: it only draws with `?debug=1`. `TF.draw.sign` is reserved for the roof sign.

## Peeks (easter eggs in the upper space)
A room registers `TF.peek({ id, owner, kind, P, offset, dur, x, y, face })`. Kinds: `shiba` (head pops out of a
hatch or vent lip at x, y), `wave` (Optimus climbs up through a catwalk hatch and waves), `drone` (peeks in at a high
window), `hardhat` (rests on a pipe, wobbles). Every peek has its own prime period, not tied to 24/48 s or to the other
peeks. Outside its window it draws its neutral pose. The boot checks require prime, distinct periods and a neutral
pose at t = 0 and t = 48, so the 48 s loop check still passes. Add a new kind to `TF.peekKinds`.

## Themes
`js/themes/<name>.js` registers `{name, decor: {garland(ctx,x0,x1,y,t,lod), capsuleDecal(ctx)}}`. Themes
never change parts, vehicles, Optimus, Starship or fuel colours. On floor 6: leaf garland on the ceilings, and a
leaf decal on the PT capsule (Thanksgiving).

## URL parameters and hooks
`?theme=thanksgiving`, `?t=12.5` (paused at that time), `?view=x,y,zoom` (world centre + zoom), `?clean=1` (hide HUD), `?debug=1` (labels).
Space = play/pause, Home = fit all. Hooks: `window.__setTime(s)`, `__setTheme(name)`, `__view(x, y, zoom)`,
`__render()`, `__boot` (boot-check result).

## Tools (`node tools/<name>.js`, headless Chrome via playwright-core)
| Tool | What it does |
|---|---|
| `shot.js --t 3 --theme default --view whole/floor6/6A..6E/x,y,zoom --w 1600 --h 1000 --out out/x.png` | screenshot |
| `loopcheck.js [theme]` | t = 0 vs t = 48 pixel compare (whole scene, floor 6, each room close-up) |
| `popscan.js [zoom=1] [fps=30] [theme]` | renders all 1440 frames of floor 6, flags single-frame tile jumps / flickers |
| `interact.js` | wheel zoom at the cursor, drag, double-click, Home, LOD switch, URL |
| `mp4.js [out] [theme] [secs]` | floor 6, 48 s, 30 fps, 1280 x 400 -> `out/stage1-floor6.mp4` (ffmpeg) |
