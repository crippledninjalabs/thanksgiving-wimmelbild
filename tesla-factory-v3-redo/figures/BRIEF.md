# BRIEF: Tesla Factory v3 — Stage 0 FIGURE SHEETS (+ a short plan update)

Work in /workspace/tesla-factory/v3/figures/ (and edit /workspace/tesla-factory/v3-plan/FACTORY-MAP.md for Part A only). Do NOT touch poc/ or poc-v2/ (read-only; v2 js/figures.js is a useful starting point for style), no git.

## Part A — brief plan update (keep it short, ~15 min max)
Read the last lines of /workspace/tesla-factory/NOTES-v3.md (10:05 and 10:08 PM). Update FACTORY-MAP.md briefly (add/replace sections, note changes in CONTINUITY-CHECK.md as a short "Round 3" list):
(a) ONE "42" only, placed somewhere subtle (pick the spot, e.g. small on the tower/ship skirt by the cargo door). Merge the two 42 gags: its fall spooks the turkeys (turkey/Shiba table gag is triggered by that fall); keep one odd gag period and neutral start/end; Elon makes the replacement, it gets hung back.
(b) New gag: an Optimus cooks its own "Thanksgiving" from bolts, grease, batteries (place it, own odd period, neutral state).
(c) Cafeteria food: most goes to the food-bank truck, but one Optimus carries a plate to Elon who takes a bite along his route (fit into Elon's route/gag timing).
(d) Cartoony transport: clear pneumatic tubes (items whoosh through walls/floors) for small parts; zip lines / hanging baskets / spiral slides for medium parts; ONE big open-cage lift with a bobbing counterweight ONLY for heavy items (car bodies, rocket rings, Raptors). Re-balance the lift load table and connector table; update overview.py and regenerate overview.png if quick.

## Part B — figure modules (main job)
Reusable canvas drawing modules in the v2 flat style (flat fills, thin darker outlines, small blue joint dots ok, simple, charming). LOOKS SEPARATE FROM MOTION:
- `js/style.js` — palette/proportion constants per figure (colours, limb lengths, line widths) so visuals can be tweaked without touching motion.
- `js/rig.js` — a small 2D skeleton/pose system: pose = joint angles (or targets with 2-bone IK for arms/legs: shoulder-elbow-wrist, hip-knee-ankle), pose blending/easing, keyframe clips sampled by phase 0..1 (seamless loops).
- `js/optimus.js`, `js/elon.js`, `js/vehicles.js` — draw functions `draw(ctx, x, y, scale, pose, opts)` that only render a given pose; and `js/clips.js` — motion clips (walk, carry, reach-grab-place, etc.) that only produce poses.
- Plain globals or ES modules both fine, no build step; must work in the v3 scene later (document the API in README.md).

### 1. Optimus (most important)
Proportions like real Tesla Optimus Gen 2 (≈1.73 m human proportions: small head, slim neck, broad-ish chest tapering to a narrow waist, long limbs, thicker forearms, slim wrists, compact feet). White/very light grey shell panels, glossy black head/visor face (no facial features, or a faint visor highlight), black joints (shoulders, elbows, hips, knees as small black discs), black hands with simple fingers/thumb hint, a thin Tesla "T" hint on chest optional. Side view mainly (3/4 not needed).
Poses/clips, all natural and human-like (NOT flailing; elbows bend the correct way, shoulders don't rotate wildly, hands reach exact targets via IK; counter-swing arms during walk; slight torso bob; heel-strike/toe-off feet):
idle (subtle breathing/weight shift), walk (cycle), carry box (both hands under box, arms bent, walk), reach-grab-place (reach forward/down to a target, close hand, lift, place on a shelf at another height, release, return), weld (holds torch, tip touches a seam, sparks at contact point), climb ladder (alternating hands/feet on rungs), push cart.

### 2. Elon
Clearly recognizable in simple flat style, same scale family as Optimus (Elon ~1.88 m, Optimus ~1.73 m): short dark-brown hair, combed back and slightly up, hairline slightly receding at the temples (a clean shaped hair silhouette, NOT a blob); defined jaw; light skin; black T-shirt (plain, or tiny "OCCUPY MARS" hint as a white text-like stripe — no real readable text required); dark blue/black jeans; dark shoes; broad shoulders, slightly heavier build, relaxed upright posture, slight forward head. Side view (and a front view for the sheet).
Poses/clips: idle, walk, watch with arms crossed, take a bite (an Optimus hands him a plate; he takes a bite from a fork, chews), ride lift (standing, hand on rail).

### 3. Cybercab — match the REAL production car
Reference (from 2026 reporting: The Driven / Teslarati on "VIN Zero" Apr 2026, MotorTrend first look, Car Design News interview with von Holzhausen, paultan.org Oct 2026): production Cybercab is high-gloss champagne GOLD (colour moulded into plastic panels), compact 2-seat coupe, fastback/teardrop profile (roof runs in one smooth arc down to a short tail; rear track narrower than front — teardrop plan view), NO side mirrors, NO rear window, butterfly doors (hinged at the top/A-pillar, swing up and forward), large aero wheel covers (smooth discs), oversized wheels relative to body, full-width light bar front and rear, black glass canopy band (dark window band running front to back), short overhangs. Side view + driving clip (wheels rotate, slight suspension bob) + doors opening (butterfly door rises up/forward and closes).
Colour suggestion: body #C9A86A–#D4B47A with a lighter highlight stripe, darker gold #9E7F45 for shading/outline; glass #1E2328.

### 4. Quick consistency pass (lower priority)
Side views of Model Y (several paint colours: red, white, black, blue, grey), Cybertruck (stainless, single-peak wedge, light bar), Tesla Semi (cab + aero, with trailer optional) at consistent scale with each other and the figures (Model Y ≈4.75 m long, Cybertruck ≈5.7 m, Cybercab ≈4.3 m?, Semi cab ≈ 7 m; scale relative to 1.73 m Optimus).

## Deliverables (in this folder)
- `sheets.html` (renders sheets, query param selects which) and a tools script that writes PNGs with /usr/bin/google-chrome headless (playwright-core is available at /workspace/tesla-factory/review/node_modules/playwright-core).
- `out/optimus-sheet.png`, `out/elon-sheet.png`, `out/cybercab-sheet.png`, `out/vehicles-sheet.png`, `out/overview-sheet.png` — large scale (figures ~300-500 px tall on the sheet), poses laid out in a grid with small light labels, plus several in-between frames for key motions (e.g. 6 frames of the walk) so motion can be judged from stills.
- Looping MP4 clips (ffmpeg available, 30 fps, ~4-6 s, white background): `out/optimus-walk-carry-place.mp4`, `out/elon-walk-bite.mp4`, `out/cybercab-drive-doors.mp4`. Seamless loops.
- README.md: API, how to tweak looks (style.js) vs motion (clips.js).
LOOK AT YOUR OWN PNGs (open/view them) and iterate until: arms bend naturally, hands reach targets, feet don't slide during walk (planted foot stays fixed relative to ground while the body moves), Elon reads as Elon at a glance, Cybercab silhouette matches the description. Fix obvious ugliness. Print a short summary at the end: files, what's done, honest rough spots.
