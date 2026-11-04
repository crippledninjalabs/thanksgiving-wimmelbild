# Thanksgiving at SpaceX: layout block-out (layout-1)

Files: `layout.svg` (vector), `layout.png` (3840 x 2160), `build_layout.py` (generator).
Rebuild: `python3 build_layout.py && bash ../style-sheet-1/src/render.sh layout.svg layout.png 3840 2160`

## Frame
- Left 2/3 (x 40-2560): SPACEX building, side-view cutaway, 5 floors + roof deck, sign on the roof.
- Right 1/3 (x 2560-3840): Starship on the launch tower ("Mechazilla"), launch mount, pad, pen, tree, pumpkins.
- Ground strip runs the whole width (y 2000-2160).
- Starship, booster, mount and tower are drawn in true proportion to each other (12.7 px/m: ship ~50 m, booster ~71 m, tower ~146 m). The building is stylized so the rocket is about its height; it is **not** at the same real scale as the building.

## Connections (no elevator shafts)
- S1 exterior stair (left wall), S2 central stair (the old lobby column).
- Small wall lifts: DW1 kitchen -> banquet, DW2 warehouse -> kitchen, DW3 bakery -> drone hangar, FL1 "Gobble Lift" on the outer right wall.
- Pipes/tubes: FP1 steam riser (boiler -> machine shop), PT1 pneumatic tube (annex -> pantry/bakery), berry paternoster (pantry -> bakery), berry gutter along the roof.
- Chutes/conveyors: egg chute + turkey corkscrew slide (restroom -> feather lab), bay conveyor tunnel (rocket bay -> pad), underground fuel line (boiler -> pad).

## Rooms (from MAP.md checkpoint 07)
- Roof deck: dishes, masts, roof hopper, berry gutter; Rick's pop-up lab.
- F5 R01 Uplink Room: racks, egg trampoline.
- F5 R02 Programmers' Loft: 2 coders teach bots.
- F5 R03 Drone Hangar: 3 drones, roof hatch.
- F5 R04 Mission Control: big screen, LAUNCH button; Elon.
- F4 R05 Banquet Hall: 5 diners, roast turkey, fountain.
- F4 R06 Pie Bakery: pie conveyor, 2 bakers.
- F4 R07 Restroom: mirror, egg wash.
- F4 R08 Charging Closet: 3 sleeping Optimus.
- F3 R09 Robot Kitchen: 4 arms, turkey on spit.
- F3 R10 Gravy & Sauce Lab: gravy vat, distiller.
- F3 R11 Cold Pantry: frosty shelves, berry slalom.
- F3 R12 Feather Lab: wind tunnel, egg column.
- F2 R13 Optimus Workshop: egg bucket brigade.
- F2 R14 Raptor Machine Shop: boing press, engine bell.
- F2 R15 Grok Bot Nursery: ball pit, 6 Grok minis.
- F2 R16 Server Room: Grok core racks.
- F1 R17 Warehouse: plinko crates, forklift.
- F1 R18 Boiler & Fuel: tanks, steam whistle.
- F1 R19 Launch Control Annex: 1 operator, egg abacus.
- F1 R20 Rocket Bay: roll-up door, conveyor.
- Outside: turkey pen (Tom, Gobbles, Pip + 6), hay + nest, autumn tree, pumpkins + scarecrow, satellite, tower, Starship.

## Key actors (pins)
- Elon: R04 Mission Control, at the console.
- Rick: pop-up lab on the roof deck, above R02.

## Mortys
- Hipster Morty (R02 Programmers' Loft): liked rockets before they were cool.
- Chef Morty (R06 Pie Bakery): robots won't let him near the pies.
- Evil Morty (R16 Server Room): calm, quietly rerouting the Grok core.
- Cop Morty (R17 Warehouse): writing tickets for the forklift bot.
- Astronaut Morty (tower, mid-height): wants a seat on Starship, too scared.

## Portal routes
- C1 cranberry: A (Rick's roof lab, catches a berry off the gutter) -> B (Elon's console, R04).
- C2 cranberry: C (Cold Pantry slalom) -> D (Banquet cranberry fountain).
- T1 live turkey: E (turkey pen) -> F (Feather Lab wind tunnel).
- T2 roast turkey: G (Kitchen spit oven) -> H (Banquet table platter).

## X-clip camera path
1. Whole factory: full frame, building + rocket.
2. Elon close-up: R04 console.
3. Busy room: R05 Banquet Hall.
4. Rick's portal A catches the cranberry: roof lab.
5. The cranberry exits portal B at Elon's console (R04), closing the loop on stop 2.

## Reid's additions (Nov 3, 2026, 4:31 PM MST)
- Portals: only a few, color-matched pairs so viewers can tell which leads where. Show-green is the main pair; other pairs in distinct colors (yellow, orange, etc.). Each pair's entry and exit share the same color.
- Zoomed out: characters don't need faces, just need to read as separate sprites. The whole scene must look very busy, like a real factory. Once you know what to look for, you can spot Musk, Rick and the Mortys.
- Sky must be busy: satellites moving back and forth. Launch loop: Starship lifts off and leaves the top of the frame, then a small Starship appears far out in space, drops a satellite and zooms away, and another Starship comes back down to land on the tower.
- Rick & Morty (4:33 PM): line work and outline are fine, but body shape and proportions still don't match the show. Rebuild their silhouettes from show screenshots the way Elon Tusk was (Rick: tall, hunched, thin, long arms, oversized head with spikes; Morty: short, big round head, short limbs). Bar: as recognizable as the Elon Tusk sprite.
- Rocket (4:36 PM): Starship + tower fill MOST of the outside space right of the building, top to bottom (taller than the building if needed). Big enough to zoom in and see interior cabin rooms as a cutaway, with a few branches of the chain-reaction machine inside (including the existing one that deploys and folds up the turkey thing). When it launches off-screen, the right side becomes a big clear sky view: a Starship drops off a satellite and zooms away, then another sets back down on the tower for reloading.
- Space Morty loop (4:38 PM): the rocket interior is busy too. A Cybercab drops off Space Morty, who walks into the bottom of the rocket and works his way up through the chain-reaction machine, setting things off and using items that come out of Rick's portals. At the top he straps in, the boosters fire and he takes off. When the rocket lands, the bottom door opens and a disheveled Space Morty hops out and gets into the Cybercab that's dropping off the next Space Morty.
- Space Morty loop refined (4:41 PM): when the rocket lands, the bottom door bursts open and the frazzled Morty stumbles straight out. He isn't shown climbing back down. The landing leaves damage on each deck, and the NEW Morty repairs it on his way up. All his repair parts come through one portal colour. A "Parts Rick" sits in one of the building's rooms and only feeds parts into portals for different parts of the scene. One of his portal pairs keeps blinking on and off at different spots inside the ship as Morty climbs, and each new opening hands over the part that fixes that room's damage.
- Parts Rick (4:43 PM): constantly busy for the whole scene, supplying parts through portals to other Ricks, Mortys, Elon, the bots and the Optimus robots all over the factory, not just Space Morty.
- Parts Rick room (4:45 PM): modeled on Rick's garage from the show, built from a few show screenshots. Rick walks around pressing buttons and working machines. The room changes like it does in the show, for example the pegboard tool walls flip over to show weapon racks.
