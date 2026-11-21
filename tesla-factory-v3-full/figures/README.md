# Tesla Factory v3 — figure modules (Stage 0)

Flat v2-style canvas figures with **looks separated from motion**. Plain browser globals under
`window.TF3` (no build step; works from `file://`). `clips.js`, `rig.js` and `style.js` also run in node (see `tools/check.js`).

Load order: `style.js, rig.js, paint.js, props.js, optimus.js, elon.js, vehicles.js, clips.js` (+ `sheets.js`, `anims.js` for the sheets only).

## Files
| File | Role |
|---|---|
| `js/style.js` | **LOOKS**: colours, proportions (metres), line widths for Optimus, Elon, Cybercab and the other vehicles |
| `js/rig.js` | 2D skeleton: 2-bone IK (`ik2`), pose blending (`blend`, `layer`), keyframe clips (`keyClip`, `sampleKeys`), foot roll (heel/toe pivot), `skeleton(pose, dims)` |
| `js/clips.js` | **MOTION**: clips that only return poses. Includes a world-space footstep planner (`locomotion`), so planted feet never slide |
| `js/optimus.js`, `js/elon.js`, `js/vehicles.js` | Draw functions that only render a pose |
| `js/props.js`, `js/paint.js` | Held objects (box, torch + sparks, plate, fork, cart, ladder, rail) and canvas helpers |
| `sheets.html`, `js/sheets.js`, `js/anims.js` | Sheets (`?sheet=optimus/elon/cybercab/vehicles/overview`) and looping animations (`?anim=<name>`, add `&t=2.5` for a still) |
| `tools/render.js` | `node tools/render.js [sheets/anims/all] [names…]` writes `out/*-sheet.png` and `out/*.mp4` (headless Chrome + ffmpeg, 30 fps) |
| `tools/check.js` | `node tools/check.js` checks IK reach for every clip and measures how far planted feet slide |
| `tools/strip.js` | Debug contact strip of an animation (writes `/tmp/strip-<name>.png`) |

## Draw API
```js
TF3.optimus.draw(ctx, x, y, scale, pose, opts)   // returns the solved skeleton (joint positions, metres)
TF3.elon.draw(ctx, x, y, scale, pose, opts)
TF3.elon.drawFront(ctx, x, y, scale)             // static front view
TF3.vehicles.cybercab.draw(ctx, x, y, scale, {wheelAng, bob, pitch, door}, opts)
TF3.vehicles.cybercab.drawPlan(ctx, x, y, scale) // top view
TF3.vehicles.modelY.draw(ctx, x, y, scale, {wheelAng}, {paint: TF3.style.vehicles.paints.red})
TF3.vehicles.cybertruck.draw(...); TF3.vehicles.semi.draw(...)
```
- `(x, y)` = canvas px of the **ground point under the hip** (figures) or under the **vehicle centre**.
- `scale` = px per metre. Optimus is 1.73 m tall, Elon 1.88 m.
- `opts.face` = +1 (faces right) or -1 (faces left). `opts.squash` = 0..1 for a cheap side-view turn.

## Pose format (metres, y up, facing +x, origin = ground under the anchor)
```js
{ hip: [x, y], lean, head,                 // lean/head in rad (+ = forward / look down)
  footN: {heel: [x, y], p}, footF: {...},  // N = near side (drawn in front), F = far; p = foot pitch (+ toe up)
  handN: [x, y], handF: [x, y],            // IK targets; elbows bend back/down, knees forward
  elbowN?, elbowF?,                        // optional explicit elbow (foreshortened arms, e.g. arms crossed)
  gripN, gripF, handAngN?, handAngF?, curlN?, curlF?,   // 0 open .. 1 closed; hand angle; curl side (±1)
  breath?, jaw?,                           // small extras
  props: { box: {c, w, h, layer}, torch: {...}, sparks: {...}, plate: {...}, fork: {...}, cart: {...}, ladder: {...} },
  advance?, advanceY? }                    // metres moved since phase 0 (walk / climb loops)
```

## Clips (`TF3.clips`)
Every clip is `{name, duration, loop, sample(phase 0..1) -> pose}`; looping clips are seamless at phase 1 = 0.
- Optimus: `idle('optimus')`, `walk()`, `carryWalk()`, `pushCart()`, `reachGrabPlace(from, to)`, `weld(seamX, y0, y1)`, `climb(ladderX, rung)`.
- Elon: `elonIdle()`, `walk('elon')`, `armsCrossed()`, `bite(plateAt)`, `rideLift()`.
- Cybercab: `cybercabDrive(speed)` (wheel angle follows distance, no slip), `cybercabDoors()`.
- `locomotion({who, dist, step, h})` returns `{duration, at(t) -> {x, pose}}`. It plans a walk from standing to standing with world-fixed footsteps: the anchor moves by `x`, the pose is local. Use it for any A-to-B walk in the scene.
- Layers: `carryLayer(pose)` and `pushLayer(pose)` put the upper body on top of any walking pose.
  `reachGrabPlace` at phase 0.5 is exactly the carry pose, so pick → carry-walk → place chains together (see `js/anims.js`).

Walk loops: draw at `anchorX + pose.advance * scale`, and add `clip.advance` every loop.

## Tweak looks vs motion
- **Looks** (colours, limb thickness, head shape size, outline width, the blue dots on/off, chest "T", Occupy-Mars stripe):
  edit `js/style.js`. Shapes live in the draw modules but read their sizes and colours from style.
- **Motion** (timing, step length, poses, keyframes): edit `js/clips.js`. Clips never draw.
- Limb lengths (`dims`) are shared: clips use them to keep targets reachable. After changing them, run `node tools/check.js`.

## Checks done (`node tools/check.js`, `tools/strip.js`)
- IK reach: every sample (201 per clip) of all 12 figure clips reaches its targets.
- Planted-foot slide in `locomotion`: 2e-16 m per frame. This is zero by construction, since planted contact points are fixed in world space.
- Loop seams: the frame at t = 0 equals the frame at t = duration (0 differing pixels) for all 3 MP4s.

## Known rough spots
- Side view only. Arms crossed uses a foreshortened elbow override, and the turn is a squash flip, not a real 3/4 turn.
- MP4 lengths are 6.7 s, 7.0 s and 7.7 s, a bit over the "~4-6 s" target. Each needs an off-screen-to-off-screen walk or drive for a clean loop.
- In `elon-walk-bite`, Elon walks past in front of the Optimus.
- The plate's food does not visibly shrink after the bite.
- The Cybercab's real dimensions are not measured: 4.3 m length, 1.42 m height and the wheel size are assumptions from the brief.
- The vehicle shapes are simplified. Model Y, Cybertruck and Semi got a quick pass only.
