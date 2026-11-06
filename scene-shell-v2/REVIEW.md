# Scene shell v2 REVIEW (destirilize)

Start: Thu Nov 5 ~5:17 PM MST (Claude tries 1–2); finish: Thu Nov 5 8:03 PM MST (Projects Thing packaged from saved modules after Claude stalled twice on api-request).

Frame: 7680×4320 viewBox (authored 3840×2160, scale 2).

## Reid's 5 points
1. Wall texture / imperfections / lived-in — DONE in SVG: `walls.py` wired in `build.py`; check.py reports wear groups = 31.
2. Stairs out — DONE in SVG: no `id="S1"` / `id="S2"`; no `stairs_flight(` in room/shell modules; `s2_pier` + `west_wall` present (`id="pier"`, `id="west-wall"`); room-to-room via portals/doors only.
3. Doors varied, most closed — DONE in SVG text: 22 doors, 3 ajar, styles Counter(lift/flush/steel/bulkhead/louver/panel/dutch/wc/freezer/mesh/plank), 18 colours.
4. Rick's Space Cruiser on roof — DONE in SVG: `id="space-cruiser"` present (from SPACE_CRUISER.md via `sky_roof.space_cruiser`).
5. Non-rainbow sky — DONE in SVG: flat evening teal (`#2a6f83`) + darker upper (`#163c55`) + thin warm horizon haze (`#e0b283`); old rainbow hexes `#6c5f93 #a4739a #d98f8f #f0b48a #d7aabd #7e7ab0 #b77088` absent.

## What's in
- Same SPACEX cutaway R01–R23 + tower/rocket/pad props as v1 base, plus the five destirilize changes above
- 226 motion cue groups; every listed region has cues; xml parses; no gradients/filters/text/image
- No characters
- preview.png (~2400 px wide) and crops/ (sky, roof-cruiser, building-top/mid, basement, tower, rocket, pad-pen) written via cairosvg — never Read back as images

## Weak spots
- Soft floor overlaps same family as v1 (gravy pools, yolk, conveyor puddle); R06 ceiling outside room; R04 console-b blocking a door — check.py soft flags; not measured for visual severity
- Wear / lived-in density beyond the 31 wear groups: not measured
- Pad denseness: not measured (inherited from v1)
- Claude never finished the destirilize pass; this packaging is post-stall by Projects Thing

## Open
Live: https://crippledninjalabs.github.io/thanksgiving-wimmelbild/scene-shell-v2/
Local: python3 -m http.server 8765 from tw-repo, then http://127.0.0.1:8765/scene-shell-v2/
