# BRIEF: Tesla Factory animated scene — 3x3 proof of concept

Build this in the CURRENT folder (/workspace/tesla-factory/poc/). Plain static files, no build step, no npm installs required to run: index.html + js/ + css/. Everything drawn in code (inline SVG + JS, or canvas). NO raster/generated images, no external CDNs.

## Visual style (very important)
Flat, simple vector "Rube Goldberg factory" illustration:
- White background, mid/light grey machines with slightly darker grey outlines/shading, no gradients or only very subtle ones.
- Pipes and conveyor belts linking machines; little blue circular joint dots where pipes bend/join and on machine pivots.
- A GRID of self-contained machine cells (each cell is its own little machine/station), linked to neighbours by pipes and conveyors so items visibly flow from one cell to the next.
- Tiny simple people (round head, simple body, stick-ish limbs, a few flat colours) doing little jobs: pushing buttons, carrying boxes, watching gauges, turning wheels.
- Clean, charming, uncluttered. Lots of small motion everywhere.

## Content: obviously a TESLA factory
The Tesla layer is FIXED (never themed). Build exactly 9 cells in a 3x3 grid:
1. Giga-casting press — big press stamps down and pops out a car underbody frame.
2. Body assembly line — car body moves along, robot arms swing in and fit wheels.
3. Paint booth — grey body goes in, comes out Tesla red; spray nozzles puff.
4. Battery-cell line — little cylindrical cells march along, get packed into a pack.
5. Optimus station — 2 Optimus humanoid robots (sleek white/black humanoid, black face visor) working a station (lifting, sorting).
6. Cybertruck roll-out — angular wedge-shaped stainless Cybertruck rolls out of a door.
7. Cybercab test loop — small 2-door rounded robotaxi drives a little oval track.
8. Supercharger stalls — red/white stall posts, cars plugged in, charging bars fill.
9. Quality check — inspector worker + scanner arch; green check mark lights up.
Use simple recognisable silhouettes. Put a red Tesla "T" logo on a few signs and one "TESLA" sign over the block (theme can add a second sign).

## Theme layer (swappable)
- A theme is a plain JS object in js/themes/<name>.js (registered into a THEMES map). It controls: conveyor payload items on SOME conveyors (non-car conveyors, e.g. the linking conveyors between cells and the battery/QC side belts), a few decorations, accent colours, and a banner/sign text.
- Implement `default` (Tesla parts as payloads: wheels, battery cells, boxes) and `thanksgiving` (turkeys, pies, pumpkins on those conveyors, autumn leaves/garland decorations, orange/brown accents, "Happy Thanksgiving" sign).
- The car areas and Optimus areas STAY Tesla in every theme.
- Theme toggle button (small, corner) cycles themes; `?theme=thanksgiving` URL param selects on load. Switching must not reload the page or break the animation.
- Must be trivially easy to add christmas/valentines later: one new theme file + one script tag (or registry line). Payload/decoration drawers are small functions keyed by name.

## Elon
One tiny figure, same simple style as the other workers, identifiable ONLY by small tells: swept-back dark hair silhouette, black T-shirt, dark trousers. He walks the floor along a path between cells, pausing to watch a station (e.g. the Cybertruck rollout). No caricature, no text label. No Rick and Morty anything.

## Animation
- Everything loops seamlessly with a single global loop period (12–16 s). Drive all motion from one clock `t` (e.g. phase = (t % LOOP)/LOOP) so the loop is perfect and deterministic. Expose `window.__setTime(seconds)` that freezes the clock at a given time (for screenshot tests) and `window.__setTheme(name)`.
- Presses stamp, arms swing, items travel along conveyors between cells, people bob/work, belts show moving tread marks, charge bars fill.
- Use requestAnimationFrame. Keep it smooth (no heavy DOM churn per frame — prefer updating transforms/attributes, or canvas redraw).
- Scene should fit a 1600x1000-ish viewBox and scale to the window (responsive, keep aspect).

## Architecture (data-driven)
- js/cells/*.js: each cell is a module/object `{ id, name, col, row, draw(ctx|svgGroup, t, theme) }` or similar, registered into a CELLS list. The grid layout and the inter-cell connectors (pipes/conveyors with flow direction and which carry themed payloads) come from a data array, so adding a cell = new file + one entry in the layout list.
- js/themes/*.js as above. js/main.js wires it up. css/style.css.
- README.md: short — how to run (open index.html or `python3 -m http.server`), how to add a cell, how to add a theme (with a christmas example snippet), URL params.

## Quality bar
- No overlapping/clashing elements, nothing drawn outside its cell except the connectors, no console errors.
- Verify yourself headlessly if you can (Chromium is at /usr/bin/google-chrome; you may write a small node or python script, but do not install large global packages; local `npm i playwright-core` in a tools/ subfolder is OK). Fix what you find.
- Do not touch anything outside this folder. Do not create accounts, repos, or push anything.

When done, print a short summary: files created, the 9 cells, how themes work, known rough spots.
