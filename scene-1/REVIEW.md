# Scene 1: light pass (about 5% detail)

Files: `scene.svg` (7680 x 4320 vector, ~274 KB), `index.html` (pan/zoom viewer), `preview.png` (2400 x 1350),
`crops/rocket.png`, `crops/garage.png`, `crops/elon.png`.
Rebuild: `bash src/render.sh` (runs `src/build.py`, then headless Chrome via `../style-sheet-1/src/render.sh`).

## Structure (foundation for later passes)
- `src/common.py`: canvas, floor/room geometry (layout-1 x2), palette, simple shape helpers.
- `src/cast.py`: rebuilt Rick + Morty (+ variants), crowd sprites as `<defs>`/`<use>`, portals in 4 colours.
- `src/sky.py`, `src/outside.py` (ground strip, Cybercab, pen, tree), `src/rocket.py` (stack, tower, one function per deck in `DECK_FNS`).
- `src/building.py`: shell, slabs, stairs, lifts, roof. Rooms are one function each in `f5.py` .. `f1.py`, plus `control.py` (R04) and `garage.py` (R19).
- Each room is wrapped in `<g id="R..">` so later passes and animation can target it.
- Reuses the approved style-sheet code as a library: Elon (`elon.elon_34`) and the Cybercab (`vehicles.cybercab_open`).

## What's in
- Building cutaway on the left: 20 rooms with walls, floors, key machines and 2-6 figures each. Also stairs S1/S2, the Gobble Lift, steam riser, berry paternoster, and the roof (SPACEX sign, dishes, mast, drone hatch, hopper, berry gutter, Rick's roof lab).
- Mortys: Hipster (R02), Chef (R06), Evil (R16), Cop (R17), Astronaut (tower walkway), Space Morty x3 (new one at the Cybercab, frazzled one stumbling out, one climbing at deck B3).
- Ricks: Parts Rick (R19, detailed), roof-lab Rick, a diner Rick (R05), a goggles Rick (R10), a fuel-pump Rick (B1).
- Starship + booster + mount + tower fill the right side top to bottom, as a cutaway with 10 labelled decks (S1-S5, B1-B5). Each deck has damage marks, a placeholder chain-reaction branch fed from a trunk tube, and a ladder. S3 has the turkey deploy-and-fold rig. The bottom door is burst open with a gangway down.
- Portal pairs, colour-matched:
  - Green (main): roof lab A to Elon's console B.
  - Yellow: garage to R13 Optimus Workshop.
  - Orange: garage to R09 Kitchen.
  - Blue: garage to the rocket. Live at B3; dashed blink spots on the other 9 decks.
- Sky: stars, moon, clouds, birds, 9 satellites on dashed back-and-forth tracks, and a far-off Starship dropping a satellite. The ground strip runs across the whole bottom.
- Showcases: Parts Rick's garage (pegboard tool wall, one panel flipped to a weapon rack, cluttered bench, bulb, parts hopper feeding 3 portals) and Elon (approved sprite) at the LAUNCH console.

## Placeholder / decisions to confirm
- **R19 is now Parts Rick's Garage**, replacing the Launch Control Annex (operator and egg abacus dropped). The layout didn't name a room for it.
- The routes C2 (pantry to fountain), T1 (pen to feather lab) and T2 (spit to platter) aren't drawn as portals. The owner asked for "only a few" pairs.
- The rocket is about 2.5x its true diameter so the decks can hold figures. Its height is not to scale with the building.
- Chain-reaction branches are generic stand-ins (ramp / dominoes / pulley / wheel). They aren't wired into one machine yet.
- The garage is in the show's spirit (pegboard, bench, bulb, door) but is not built from show screenshots.
- No dashed portal routes. Crowd figures have no faces, except Morty/Rick eyes.

## Honest weak spots
- The rocket + tower span about 60% of the right third. There's still a gap of sky and tree between the building and the stack.
- Parts Rick is the rebuilt silhouette with a little shading, not the full show-level model. His far arm and coat still read a bit stiff. Elon is small next to the console at the R04 crop zoom.
- Crowd sprites (Optimus, people, Grok bots) are very simple. Many rooms repeat the same Optimus pose.
- Exterior stair S1 reads as a scaffold. Room plaques are tiny when zoomed out.
- Viewer: I only checked that it loads and fits the whole frame (headless Chrome at 600x900). Drag, wheel, pinch and double-tap were not tested on a real phone or desktop. Smoothness on phones: not measured.
- The `rm-*` show refs remain local-only (see `style-sheet-1/refs/SOURCES.md`). Nothing from them is embedded.
