# BRIEF v2: Tesla Factory cutaway — dense 3x3 "ant-farm" building

Build in the CURRENT folder (/workspace/tesla-factory/poc-v2/). Static files only (index.html, css/, js/), no build step, no CDNs, everything drawn in code (canvas or SVG). v1 is at /workspace/tesla-factory/poc/ — READ it for reuse (figures: workers, Optimus, cars, Cybertruck, Cybercab, theme system, __setTime/__setTheme, ?theme=, ?t=), but DO NOT modify v1. Copy/adapt what's useful.

## Owner feedback on v1 (verbatim)
"ok thats an interesting concept, but the rooms dont look like rooms, they look like separate buildings. and theres not nearly enough stuff happening in the scene. you're on the right track sorta i think though. redo it, and dont give each room a label. make the scene much busier and compact"

## What v2 must be
1. ONE continuous building interior shown as a cross-section cutaway (dollhouse / ant-farm view). A 3x3 grid of ROOMS that SHARE walls, floors and ceilings: thick grey floor slabs and wall slabs between rooms, outer building shell around everything, NO white gaps between rooms. Optionally a roofline with a TESLA sign/red T on top (the only text allowed; a T logo is not text).
2. Rooms connect THROUGH the shared walls/floors: doorways workers and Optimus walk through, belts that pass through wall openings, pipes running across multiple rooms, chutes dropping through floor holes, a freight elevator shaft or lift moving items between floors, an overhead crane rail spanning rooms.
3. NO room labels, NO text anywhere except the top TESLA sign and theme banner (keep that small, e.g. on the roof). Remove the v1 per-cell titles and machine name signs (use icons/T logos instead).
4. MUCH denser and more compact — the reference is a flat, simple, very busy Rube Goldberg factory GIF: white/light background, grey machines, blue joint dots, tiny people everywhere, almost no empty space. Target roughly 3–5x the moving parts of v1. Every room should contain several of: multiple robot arms (welding with sparks), conveyor lines at 2–3 heights, Optimus robots walking and carrying, overhead cranes/hoists, pipes with visible flowing blobs, spinning gauges/dials/fans, blinking lights/screens, carts/forklifts/AGVs driving, workers pushing buttons/carrying/climbing ladders, steam puffs. Items must CONSTANTLY pass between rooms.
5. Fill the frame: pick dimensions so the building fills a ~16:10 viewport edge to edge with little margin. Rooms can differ slightly in width/height but must tile.

## Tesla content (fixed, never themed) — suggested room assignments
Top row: giga-casting press room (molten metal ladle on crane → press stamps frame) | body-in-white welding room (many arms, sparks) | paint shop (bodies on hangers go through spray, come out red).
Middle row: battery cell line (cells marching, packing into packs, lift to next room) | general assembly (body meets battery "marriage", wheels on, Optimus helping) | Optimus factory (Optimus robots being assembled & walking off to work).
Bottom row: Cybertruck line (angular wedge, stainless) | quality/test (scanner arch, rollers, Cybercab on a dyno or small test loop) | shipping/Supercharger bay (cars charging, Cybertruck/Cybercab rolling out a garage door at the building edge).
Cars flow: frame → body → paint → assembly → test → out, travelling through the walls. Use recognisable silhouettes (Model Y-ish, Cybertruck single-peak wedge, Cybercab 2-door teardrop, Optimus white/black humanoid with black visor) and red T motifs.

## Elon
One tiny figure, same scale/style as workers, identifiable only by swept-back dark hair + black T-shirt + dark trousers. He moves through rooms (via doorways/elevator) and pauses to watch. No label. No Rick and Morty anything.

## Theme layer (keep and extend v1's system)
- js/themes/default.js and js/themes/thanksgiving.js; THEMES registry; toggle button (small, corner, not covering the scene much), ?theme=, window.__setTheme(), no reload.
- Theme controls: payloads on the non-car conveyors/chutes/pipes (default: wheels, cells, boxes, parts; thanksgiving: turkeys, pies, pumpkins, corn), a few decorations (garland, leaves, hay), accents, banner text. Car, Cybertruck and Optimus content stays Tesla.
- Adding christmas/valentines = one file + one script tag (README example).

## Loop (important)
- Single global clock, LOOP = 16 s, everything a pure function of phase so t=0 and t=LOOP are identical. window.__setTime(s), ?t=.
- FIX v1's visible end-of-loop resets: no object should pop/teleport/instantly turn. Use continuous cyclic motion: things enter from offscreen/a wall opening and exit through another; cycles of integer repeats per LOOP; charge bars fill then the car drives off before the next one arrives; workers turn with a short eased turn; bins empty (dumped onto a belt or carted away). Anything appearing must enter from behind something.

## Architecture
- Data-driven: js/layout.js defines the building grid (rooms with x/y/w/h), shared walls with openings, and inter-room routes (belts, pipes, chutes, elevator) with payload flags. js/rooms/*.js each draw one room's contents given (ctx, t, theme, rect). Adding a room = new file + one layout entry.
- Performance: canvas, keep 60fps-ish on a normal laptop; avoid per-frame allocations where easy.
- README.md: run, add a room, add a theme, URL params.

## Verify yourself
Headless check with /usr/bin/google-chrome (a local playwright-core is at /workspace/tesla-factory/review/node_modules if you want it). Take screenshots at several times for both themes, check: no gaps between rooms, no text other than allowed, no overlaps that look broken, nothing drawn outside the building except the roof sign, no console errors, t=0 vs t=16 identical, and scan a few consecutive frames near the loop boundary and within each object's cycle for pops. Save a couple to shots/. Do not touch anything outside this folder, don't push to git.

Finish by printing a short summary: rooms, moving-part count estimate, how themes work, rough spots.
