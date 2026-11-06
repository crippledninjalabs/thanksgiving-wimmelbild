# Scene shell v3 REVIEW

Start: Thu Nov 5 ~8:22 PM MST (Reid feedback on live v2); finish: Thu Nov 5 8:29 PM MST (Projects Thing packaged; no Claude).

Frame: 7680×4320 viewBox (authored 3840×2160, scale 2).

## Reid's 4 notes (from FEEDBACK-nov5-pm.md)
1. Tape X variety — DONE in SVG/Python: `walls.py` tape-repair loop no longer stamps the same crossed pair (`d` + `d-62`). Per-room styles: none / single / slash / T / L / rect patch / hook / uneven pair with unique angles/lengths/offsets. Rest of wall wear kept.
2. Space Cruiser looks like the SHOW car — DONE in SVG: `SPACE_CRUISER.md` rewritten (convertible flying car; saucer/disc language dropped). `sky_roof.space_cruiser()` redrawn as side-view car with hood/beltline/door seams/wheel wells/rear deck, bubble canopy, twin trash-can thrusters + flex hose, chrome bumper, round headlights, wheels down. `id="space-cruiser"` present.
3. Trees and bushes look real — DONE in SVG: `pad.py` `_tree()` branched/tapered trunk + lobed leafy canopy; `_bush()` irregular low shrubs. Pen tree + second ground-edge tree + four unique bushes. Old `rect` trunk + `circ` canopy removed. Pumpkins stay as simple round gourds.
4. Non-banded sky — DONE in SVG: `shell.sky()` is ONE dusk teal fill (`#2a7088`) plus irregular upper night blobs, lobed cloud shapes, and a flat sun disc. Old stacked bands (`#163c55` / `#3c8795` / `#e0b283`) gone from `sky()`. Rainbow hexes still absent. Satellites / far ship / tracks kept in `sky_roof`.

## Not changed (on purpose)
- Frozen R04 timer `T-00:36` left as-is (loop/sync filed for later animation).
- 2s render not started.
- v2 folder untouched (still live).

## What's in
- Same SPACEX cutaway R01–R23 + tower/rocket/pad props as v2, plus the four still fixes above
- 226 motion cue groups; xml parses; no gradients/filters/text/image; no S1/S2 stairs
- No characters
- preview.png (~2400 px wide) and crops/ (sky, roof-cruiser, pad-pen, building-top/mid, basement, tower, rocket) via cairosvg — never Read back as images
- Packaging by Projects Thing; no Claude this pass

## Weak spots
- Soft floor overlaps same family as v1/v2 (gravy pools, yolk, conveyor puddle); R06 ceiling outside room; R04 console-b blocking a door — check.py soft flags; not measured for visual severity
- Cruiser likeness vs the show: not measured (redrawn from silhouette notes; wiki CDN refs not used)
- Tape variety density / visual uniqueness across rooms: not measured
- Pad denseness: not measured

## Open
Live: https://crippledninjalabs.github.io/thanksgiving-wimmelbild/scene-shell-v3/
Local: python3 -m http.server 8765 from tw-repo, then http://127.0.0.1:8765/scene-shell-v3/
