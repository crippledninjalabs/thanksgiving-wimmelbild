# Tesla Factory v3 — Factory Map (plan only, nothing built) — round 3

Sources: `NOTES-v3.md` (Reid, incl. decisions 9:31 PM + timing change), the v3 brief, the v2 audit
(`MOTION-REVIEW.md`), and the round-2 continuity audit (`CONTINUITY-CHECK.md`, issue numbers `#n`).
All sizes are planned world units; times are design numbers, not measurements.

## 0. Ground rules
- **Machines run on one 24 s base loop.** Every machine, belt, lift, truck, drone, fuel and Boring
  period divides 24 s (24, 12, 8, 6, 4, 3, 2). A few heavy jobs (Raptor service, ring, chopsticks,
  ring transporter) use **48 s** because one big part per 24 s does not fit the lifts (#38).
- **Funny bits (gags) each have their own odd timer** (prime periods 53-127 s, own offset). They
  start and end at a base-cycle boundary in the exact base-loop pose ("neutral"), own their own
  actors, and borrow shared machines only in reserved free slots (§6, §8).
- Nothing moves unless it does a job. Every belt/rail/lift has a named source and sink (§4, §5).
- Allowed sinks: (a) leaves the frame on a vehicle (car carrier, parts truck backload, ring
  transporter, Semi driving off, drones), (b) closed loop that returns (tile, Raptor, pallets,
  totes, hangers, crew Optimus), (c) visibly used (fuel boil-off vent).
- All workers are Optimus. The only human is Elon. Walkers use the **front walk lane** of each
  floor and the floor-level door in each wall; they never cross a machine (#44).
- Theme changes only food/gift items, decor and the table-gag actor (§7).
- Plain white rooms. Optional 2% floor tint behind a flag, off.

## 1. Whole-scene layout (west on the left; not to scale)

```
 x: 0         ~900        ~1350                    ~3900      ~4300   ~4650  ~5000  ~5300
          [roof drone pad over 9A]  [solar rows over 9B-9E]  [sign]
              +-----------+----+----+----+----+----+                       ___
 sky          |BL cw  PT  |    |    |    |    |    |                      /42 \ (42 at cargo door)
              |W3 W4 SS   | 9A | 9B | 9C | 9D | 9E |o (Elon window)       |BRDG|  STARSHIP
              | WEST CORE +----+----+----+----+----+                    |CREW|
              | (5 shafts)| 8A | 8B | 8C | 8D | 8E |=====SKY-BRIDGE=====|GALY|<-access arm (CG)
              |           +----+----+----+----+----+   (F8 level)   T  |CARG|
              |           | 7A | 7B | 7C | 7D | 7E |o<- drone window O  |TANK|
              |           +----+----+----+----+----+                W  |ENG6|
              |           | 6A | 6B | 6C | 6D | 6E |                E  +----+
              |           +----+----+----+----+----+                R  |SUPR|
              |           | 5A | 5B | 5C | 5D | 5E |                +  |HEVY|
              |           +----+----+----+----+----+                L  |TNKS|
              |           | 4A | 4B | 4C | 4D | 4E |                I  |ENG |
              |           +----+----+----+----+----+                F  +====+ launch mount
 WEST YARD    |           | 3A | 3B | 3C | 3D | 3E |  EAST LAWN     T  (chopsticks ride tower)
 brick press  |           +----+----+----+----+----+  turkeys/Shiba   |
 [skip hoist] |           | 2A | 2B | 2C | 2D | 2E |  gopher hole     | ring transporter,
  parts truck>[dock]      +----+----+----+----+----+         TANK FARM| fuel truck: service
  car carrier <[exit]     | 1A | 1B | 1C | 1D | 1E |o[door] fill pt  | road (2 lanes) -> east
========================================================================================= ground
 LAUNCH | W-core pits | BA coolant | BB Megapack | soil + gopher burrows | pump vault + buried
 SHAFT  |             |  plant     |  power      |                       | LOX + CH4 tanks ->trench->
   ||   +-------------+------------+-------------+                       |   up launch mount + tower
   ||=== BORING TRAIN (support cars + ring conveyor + muck belt) ======================>[cutter in rock]
=========================================================================================== frame
```
- **Building**: 5 columns A-E x 9 floors = 45 rooms, ~480 x 300 each, 20-unit walls, 16-unit slabs.
- **West core** (outside column A, ground to roof; pits in basement), 5 side-by-side shafts (#4):
  **BL** the ONE big open-cage lift (heavy only: car bodies, coil, ingots, Semi kit) with its
  bobbing counterweight in the slot beside it (**cw**), **PT** clear pneumatic tube riser (small
  parts in capsules, whoosh F1-F9, both directions), **W3** hanging-basket chain (medium parts,
  continuous loop F1-F9, both directions), **SS** spiral slides (medium parts down; plus the
  Optimus slide SL71 7A -> 1A), **W4** stair. Cable + coolant risers run up W4's wall. (Round 3.)
- **Pack paternoster PB** inside the back wall of column B, floors 2-5 (#7).
- **Sky-bridge** at floor 8: 8E east wall -> tower bridge stop (BR). Two walk lanes + a trolley rail.
- **Exterior openings**: yard dock door (core, ground), 1A exit door, 7E drone window, 9E window,
  1E window + door to the lawn, 8E bridge door, roof hatch over 9A. Column A has no outer wall
  of its own (the core is there), so all yard traffic uses the core dock or the 1A exit.
- Planned world ~5300 x 4300 (estimate). Fit-all on 1600 x 1000 ~0.23.

## 2. The 45 rooms (floor 1 = ground, A = west)

"In <- from (connector)" and "Out -> to (connector)" name the opening; connector ids are in §3.
Every room has at least one supplied input and one consumed output (#31-#34).

### Floor 9 — intake, brains, Elon (rail F9R runs 9E -> 9A -> W3)
| Room | Job (visible change) | Moving parts | In <- from | Out -> to |
|---|---|---|---|---|
| 9A Drone sorting | Parcel from roof drone opened, chips put on shelf (cut job #6: Optimus puts parcel on shelf, a carrier takes it) | hatch, sorter Optimus, shelf | chips <- roof drone (H9) | chips -> 9B (carrier walks through D9AB, cut job #11a) |
| 9B Computer lab | Chip placed on board, case closed, light turns green | pick-place arm, test light | chips <- 9A | computers -> F9R west -> W3 down to F7, F5, F4 |
| 9C Solar power room | Inverter takes roof power, dots run down the riser | power dots, inverter fan | sun <- roof cable (H9C) | power -> riser in W4 wall -> BB |
| 9D Seat shop | Foam + fabric -> finished seat | sewing arm, seat grows | foam pallet <- W1 (F9 stop) via F9R | seats -> F9R -> W3 down to F5, F4 |
| 9E Flight control + Elon's office | Optimus controller checks each bridge load on screen and presses "go" (lamp at the 8E door turns green); Elon's bench in the corner (base: sketching; 42 gag starts here); Occupy Mars poster | controller Optimus, go-lamp, Elon | load camera feed from 8E (cable); offcut bin (opaque, never changes look) | "go" -> trolley at 8E; 42 (gag only) -> stair S89 |

### Floor 8 — Starship parts (W -> E), rail F8R, sky-bridge at 8E
| Room | Job | Moving parts | In <- from | Out -> to |
|---|---|---|---|---|
| 8A Tile kiln | Silica blank -> pressed -> fired -> black tile -> tap check tick | press, kiln door, tapper | silica + steel coil pallets <- W1 (F8) | tiles -> F8R east -> 8E; coil -> heavy hooks of F8R -> 8B |
| 8B Ring roller | Flat sheet curls into an open ring (one per 48 s) | rolls, sheet | coil <- F8R | open ring -> D8BC (ring dolly) |
| 8C Ring weld + X-ray | Seam weld tip on seam, bead grows, X-ray arch green | welder, X-ray | open ring <- D8BC | ring -> D8CD -> D8DE (dolly) |
| 8D Raptor service | Old Raptor: nozzle off -> turbopump swap -> new injectors -> nozzle on (arrives B13, ready by next B0; one per 48 s) | engine stand, crane | old Raptor <- trolley (D8DE); injectors <- F8R (from H78) | serviced Raptor -> D8DE -> trolley; old injectors -> scrap tote -> F8R west -> W3 down |
| 8E Bridge gate | Loads trolley (ring with tile crate inside, or Raptor), food crate to crew-up Optimus | trolley, loader arm, door | ring, Raptor, tiles, food crate (F8R), crew-up Optimus (stair S78) | bridge (B8) -> tower BR |

### Floor 7 — Optimus line (W -> E, pitch 12 s), rail F7R
| Room | Job | Moving parts | In <- from | Out -> to |
|---|---|---|---|---|
| 7A Actuators | Magnet + motor + gearbox -> actuator, test spin (cut job #10: Optimus carries magnet box from W1 door to the machine, walks back empty) | test rig, carrier | magnets/motors <- W1 (F7) | actuators -> D7AB |
| 7B Hands + heads | Fingers fitted, visor + cameras on | small arms | actuators <- D7AB; sensors <- F7R (from 7E) | hand/head set -> carrier through D7BC (cut job #11b) |
| 7C Body | Legs -> torso + pack -> arms -> head -> computer (robot gains parts) | build stand, 2 arms (tips on joints) | hand/heads <- D7BC; computer + Optimus pack <- F7R (from W3) | body -> D7CD |
| 7D Wake-up + walk test | Activation pad, head-check arm, treadmill test | pad glow, treadmill | body <- D7CD | odd robots -> D7DE -> crew route; even robots -> west lane -> W1 (F7 stop) -> 1B crating |
| 7E Drone window bay | Window drone lands on pad, Optimus unloads; stair up to 8E | drone, pad light, stair S78 | parcels <- window drone (O7E) | injectors -> tote hatch H78 -> 8E -> F8R -> 8D; sensors -> F7R west -> 7B; crew-up -> S78 |

### Floor 6 — Model Y top half (W -> E, pitch 12 s), rail F6R
| Room | Job | Moving parts | In <- from | Out -> to |
|---|---|---|---|---|
| 6A Giga press + panel press | Ingot melts, ladle pours, press closes, hot frame; mezzanine panel press stamps doors, hood + rear quarter panel (approved change 1-2: quarter = "side panel", blanks by F6R basket). **Round 4 staffing — 2 Optimus, no idle:** *operator* (24 s loop: press cycle button + watch shot -> wipe shot sleeve -> inspect fresh casting flange -> walk to furnace, push ingot in with a bar -> climb ladder, turn coolant valve, gauge back to green = cut job #1 -> walk back); *carrier* (12 s: quarter panel off the hanger winch -> D6AB -> 6B fixture -> back -> deburrs the next casting's front flange while waiting = cut job #11c) | ladle crane, platen, panel press, 2 Optimus | ingot <- BL-6; blanks <- F6R; coolant <- RISER | frame -> D6AB; quarter -> carrier -> 6B fixture; doors + hood -> F6H |
| 6B Body weld | Quarter panel fitted, 4 compact weld robots (2 gantry, 2 pedestal) each on its own seam, beads stay; weld tips by PT capsule (floor tube). **Round 4: 1 Optimus (fitter)** — 12 s loop: panel fixture -> car, wipe fixture pins, walk to the car and check the sill bead, back | 4 robots, fitter Optimus | frame <- D6AB; quarter <- fixture | welded body -> D6BC |
| 6C Doors + hood | **Round 4: ONE Optimus** (was 2 + sweeper): rear door off the hanger -> hang -> bolt, step, front door -> hang -> bolt, step, hood -> hang -> bolt, gap check, walk back with the leaving body, reach for the next hanger. Nut-runner on a balancer trolley on the air header; bolts by PT capsule (floor tube) | hanger rail F6H, 1 Optimus | body <- D6BC; doors + hood <- F6H; bolts <- PT-6 | closed body -> D6CD; empty hanger back on F6H |
| 6D Paint | One booth, two spray heads (approved change 3) + paint kitchen on the booth roof; body grey -> primer -> red. **Round 4: 1 Optimus**, 24 s loop: take cans from basket -> climb ladder, pour (cut job #4) -> down, empties to basket -> viscosity sample at the tank tap -> wipe drip tray -> reach for the next basket | spray heads, kitchen, ladder Optimus | body <- D6CD; paint cans <- F6R; sealer <- PT-6 | red body -> D6DE; empty cans -> F6R -> SS-6 |
| 6E Oven + drop lift | Bake (glow, clear-coat gloss), QC, L65 lowers car through slab at tau 9.4-10.9 (approved change 5). **Round 4: 1 QC Optimus**, 12 s loop: wipe oven window (2 spots) -> polish tailgate -> scan body -> confirm pass on the post button -> watch the drop -> turn | oven, L65, QC Optimus | red body <- D6DE | car -> L65 -> 5E (5E takes it at tau 10.9 + 12k) |

### Floor 5 — Model Y bottom half (E -> W), rail F5R
| Room | Job | Moving parts | In <- from | Out -> to |
|---|---|---|---|---|
| 5E Glass + lights | Windshield set; roof glass set from the scissor lift (cut job #7); lights on | scissor lift Optimus, glass Optimus | car <- L65; glass <- F5R (W3 from 1C) | glazed car -> D5ED |
| 5D Seats | Seats lowered in through door | seat hoist | car <- D5ED; seats <- F5R (W3 from 9D) | -> D5DC |
| 5C Wheels | Arms put 4 wheels on hubs | 2 wheel arms | car <- D5DC; wheel tote <- F5R (W3 from 3A) | -> D5CB; empty tote -> F5R -> W3 |
| 5B Battery marriage | Pack rises from PB into the car, Optimus bolts it | lift table, Optimus | car <- D5CB; pack <- PB (stop 5) | -> D5BA |
| 5A Computer + final | Computer slides in, screen lights | screen | car <- D5BA; computer <- F5R | Model Y -> W2a door (F5) |

### Floor 4 — Cybercab (E -> W, pitch 24 s), GOLD, real shape, rail F4R
| Room | Job | Moving parts | In <- from | Out -> to |
|---|---|---|---|---|
| 4E Cab casting | Front + rear castings pressed | press | ingots <- W1 (F4) via F4R heavy hooks; coolant <- riser | castings -> D4ED |
| 4D Body + gold paint | Castings welded (tips on seam), sprayed gold | weld arm, spray arm | castings <- D4ED | gold body -> D4DC; butterfly door -> carrier (cut job #11d) D4DC |
| 4C Interior + butterfly doors | 2 seats + screen in; doors hung, swing up, swing down | doors | body, door <- D4DC; seats, computer, glass <- F4R | -> D4CB |
| 4B Pack + wheels | Pack from PB; wheels with aero covers | lift table, wheel arm | <- D4CB; pack <- PB (stop 4); wheels <- F4R | -> D4BA |
| 4A Test loop | One lap, doors open/close | cab | <- D4BA | Cybercab -> W2b door (F4) |

### Floor 3 — cells, packs, wheels (cells E -> W), rail F3R
| Room | Job | Moving parts | In <- from | Out -> to |
|---|---|---|---|---|
| 3E Electrode coating | Foil web coated, dried, rolled | web, coater, roll grows | powder + foil <- W1 (F3) via F3R | rolls -> D3ED |
| 3D Cell winding | Jelly roll wound, canned, capped | winder | rolls <- D3ED | cells -> belt slot D3DC |
| 3C Cell charging | Charge lights fill (cut job #3: Optimus carries a box of cells up the ladder to the top rack) | racks, ladder Optimus | cells <- D3DC | charged cells -> cart (cut job #8) through D3CB |
| 3B Pack builder | Cells fill tray, lid on | drum, packer | cells <- D3CB cart | car/Semi packs -> PB; Optimus packs -> F3R west -> W3 |
| 3A Wheel shop | Tire pressed on rim, balanced (cut job #12: Optimus on the ledge hangs balanced wheels on the hook line to W3) | tire press, balancer, ledge Optimus | tires + rims <- W1 (F3) | wheel totes -> W3 (up to F4, F5; down to F2) |

### Floor 2 — Cybertruck (E -> W, pitch 24 s) + Semi, rail F2R
| Room | Job | Moving parts | In <- from | Out -> to |
|---|---|---|---|---|
| 2E Stainless panels | Coil -> sheet -> bent panel | coil, press | coil <- W1 (F2) via F2R heavy hooks; coolant <- riser | panels -> D2ED |
| 2D Exoskeleton weld | Panels welded into body, beads stay | weld arms | panels <- D2ED | body -> D2DC |
| 2C Glass + window test | Glass set; Optimus throws steel ball, pane cracks, swaps pane (machine, every truck) | ball, crack lines, Optimus | body <- D2DC; glass <- F2R (W3 from 1C) | truck -> D2CB; cracked pane -> scrap tote -> F2R -> W3 down |
| 2B Pack + wheels | Pack from PB; wheels on | lift table, wheel arm | <- D2CB; pack <- PB (stop 2); wheels <- F2R | truck -> D2BA; Semi pack -> carrier through D2BA |
| 2A Semi build + drop lift | Semi: frame -> motors -> pack -> cab; Semi and Cybertruck go down L21 | Semi stand, lift L21 | Semi kit <- W1 (F2); truck, pack <- D2BA | Semi + Cybertruck -> L21 -> 1A |

### Floor 1 — ground (finish, glass, food), rail F1R from the dock
| Room | Job | Moving parts | In <- from | Out -> to |
|---|---|---|---|---|
| 1A Final test + exit | Lane 1: dyno, scanner (green tick), Supercharger; lane 2: Semi Megacharger; exit door to yard | dyno rollers, scanner, chargers | Model Y <- W2a; Cab <- W2b; CT + Semi <- L21; crates <- D1BA rollers; power <- BB | vehicles + crates -> exit X1A -> car carrier; Semi drives off west |
| 1B Lobby + Optimus crating | Roadster + Starman case on a turntable (24 s); Optimus steps into a crate, lid closes | turntable, crate line | even Optimus <- W1 (F1) through D1AB | crate -> rollers D1BA -> 1A |
| 1C Glass shop | Glass blank heated, bent, cooled | bending oven | blanks <- F1R from dock | glass -> F1R -> W3 up (F2, F4, F5) |
| 1D Kitchen | Raw -> cooked (steam, colour change), plated or crated | oven, mixer | groceries + empty food crates <- F1R from dock | platter -> carrier through D1DE (cut job #11e); ship food crate -> F1R -> W3 up to F8 |
| 1E Cafeteria | Optimus servers set the table; the table is the turkey/Shiba gag stage; leftovers into the food-bank crate | servers, plates | platters <- D1DE | food-bank crate -> F1R west -> dock (truck backload) |

## 3. CONNECTOR TABLE (every wall / floor opening)

Ids: D = interior wall door at floor level (walk lane + car/dolly where noted), S = belt/rail slot
high in the wall, H = slab or roof hatch, L = slab car lift, X/O = exterior opening.

| Id | Between | Type | What passes |
|---|---|---|---|
| F1R-F9R | each floor, full width + W3 | cartoony ceiling cable with hanging baskets (zip-line look) through slots S(xy) in every wall | medium parts in baskets; empty baskets return on the rear cable. No heavy hooks any more: heavy items roll on floor dollies from BL through the D doors |
| PT-n | PT riser <-> wall/floor tube ports in every room that gets small parts | clear pneumatic tube (capsule whooshes through walls/floors) | chips, sensors, injectors, magnets, fasteners, computers |
| BL-1,2,4,5,6,8 | BL <-> A-room of floors 1, 2, 4, 5, 6, 8 | open-cage gate | heavy only: Model Y (5 -> 1), Cybercab (4 -> 1), coil (-> 8, 2), ingots (-> 4, 6), Semi kit (-> 2) |
| W3-n | W3 <-> cable end of floor n | basket transfer | medium baskets (both directions) |
| SS-n | spiral slide, core, F9 -> F1 with exits on every floor | open chute | medium parts going down: empty cans, scrap tote, seat sets, wheel totes to F2 |
| SL71 | 7A -> 1A | big spiral slide | even (finished) Optimus slide down to crating |
| W4-n | W4 <-> A-room of floor n | stair door | spare walk route (Elon never uses it) |
| DOCK | yard <-> core (ground) | roller door + sort table | forklift unpacks pallets: small -> PT, medium -> W3 baskets, heavy -> BL; backload out |
| X1A | 1A <-> yard | garage door | vehicles, Optimus crates |
| D(n)AB ... D(n)DE | every interior wall, every floor (36) | door, 220 tall | walkers; plus: car rollers on F6, F5, F4, F2; ring dolly on F8; cell cart on D3CB; crate rollers D1BA |
| D3DC | 3D <-> 3C | belt slot | cells |
| D1DE | 1D <-> 1E | serving door | platters |
| F6H | 6A -> 6C over 6B | hanger rail through slots | doors out, empty hangers back |
| PB | 3B <-> 2B, 4B, 5B | pack paternoster through slab holes H32B, H34B, H45B | packs (up to 4B, 5B; down to 2B) |
| L65 | 6E -> 5E | slab car lift | Model Y |
| L21 | 2A -> 1A | slab car lift | Cybertruck, Semi |
| H78 | 7E -> 8E | tote hatch | injectors |
| S78 | 7E <-> 8E | stair through slab | crew-up Optimus |
| S89 | 8E <-> 9E | stair through slab | Elon (42 gag only) |
| H9 | roof pad -> 9A | roof hatch | drone parcels |
| H9C | roof -> 9C | cable gland | solar power |
| O7E | 7E east wall | open window | window drone in/out |
| O9E | 9E east wall | window | Elon's view of the ship (no passage) |
| B8 | 8E <-> tower BR | sky-bridge: trolley rail + 2 walk lanes | ring + tile crate, Raptors (48 s), crew-up, food crate, Elon (gag) |
| O1E-win, O1E-door | 1E <-> lawn | window / door | table-gag actor in (window), out (door) |
| RISER | BB/BA <-> W4 wall <-> floors | cable + coolant pipes | power up/down, coolant to 6A, 4E, 2E |
| SHAFT | yard <-> Boring tunnel | launch shaft with skip hoist | dirt up, tunnel rings down |
| FILL | fill point (tank farm) -> buried tanks | 2 pipes | LOX, CH4 |
| TRENCH | pump vault -> launch mount -> tower | 2 pipes | LOX, CH4 to booster QD + ship QD arm |
| TL | tower lift stops G / BR / CG | lift doors | see §6 |
| CS | chopsticks carriage stops G / BR / ENG | arms | rings down, Raptors in/out |
| AA | tower CG <-> ship cargo door + access arm | arm walkway | crew, food crate, tile Optimus, Elon (gag) |
| CH | ship cargo bay <-> galley/crew/bridge | ship's inner ladder | resident crew |
| EB | chopsticks <-> ship engine bay | engine bay hatch | Raptors |

## 4. PARTS FLOW with IN / OUT per cycle
**Round 3 reading rule** (rows below not rewritten): pallets are unpacked at the DOCK sort table.
`W1-n` now means: small items -> tube **PT-n**, medium -> **W3** baskets, heavy (coil, ingots, Semi
kit) -> **BL-n**. `W2a`/`W2b` -> **BL**. Even Optimus: 7A -> **SL71** slide -> 1A (no lift). Items
going down (empty cans, scrap tote, wheel totes to F2) use the spiral slide **SS**. Exact per-item
split (tube vs basket) is set when building; counts below are unchanged.

Counts are per 24 s unless marked (48). IN = arrives into the scene or is made; OUT = leaves the
scene or is used up. Every row balances, so nothing piles up (#12-#29).

| Item | Source | Route (connectors) | Visible change | Sink | IN / OUT |
|---|---|---|---|---|---|
| Model Y | parts below | 6A -D6AB- 6B -D6BC- 6C -D6CD- 6D -D6DE- 6E -L65- 5E -D5ED- 5D -D5DC- 5C -D5CB- 5B -D5BA- 5A -W2a- 1A -X1A- carrier | hot frame, cool frame, beads, doors, red, glass, seats, wheels, pack, screen lit, dyno, green tick, charge | car carrier (yard, leaves west) | 2 / 2 |
| Cybercab (gold) | parts below | 4E -D4ED- 4D -D4DC- 4C -D4CB- 4B -D4BA- 4A -W2b- 1A -X1A- carrier | castings, joined, gold, seats + screen, butterfly doors, pack, wheels, lap | car carrier | 1 / 1 |
| Cybertruck | parts below | 2E -D2ED- 2D -D2DC- 2C -D2CB- 2B -D2BA- 2A -L21- 1A -X1A- carrier | sheet, bent panel, welded body, glass (+ball test), pack, wheels, light bar | car carrier | 1 / 1 |
| Tesla Semi | Semi kit pallet (frame, motors, 10 wheels) | W1-2 - 2A (pack from 2B via D2BA) -L21- 1A lane 2 -X1A- | frame, motors, pack, cab, charge | drives off west | 1 / 1 |
| Optimus | parts below | 7A -D7AB- 7B -D7BC- 7C -D7CD- 7D; odd: -D7DE- 7E -S78- 8E -B8- BR -TL- CG -AA- cargo rack; even: west lane -W1-7- W1 -W1-1- 1A -D1AB- 1B crate -D1BA- 1A -X1A- carrier | actuators, hands, body gains parts, head light, walk test, crate lid | even: carrier; odd: ship crew, later crated at tower base -> ring transporter | 2 made / 1 carrier + 1 crew-down crated (rack: 1 in, 1 out) |
| Car packs | cells | 3B -PB- 5B (2), 4B (1), 2B (1 CT + 1 Semi via D2BA) | tray fills, lid on | in vehicles | 5 / 5 |
| Optimus packs | cells | 3B -F3R- W3 -F7R- 7C | same | in Optimus | 2 / 2 |
| 4680 cells | powder + foil pallet | W1-3 -F3R- 3E -D3ED- 3D -D3DC- 3C -cart D3CB- 3B | coat, wind, can, charge lights | in packs | (as needed) / same |
| Wheel tote (4 wheels) | tires + rims pallet | W1-3 - 3A - W3 -F5R/F4R/F2R- 5C, 4B, 2B | pressed, balanced | on vehicles; empty tote back up W3 | 3 / 3 (Semi wheels come with its kit) |
| Computer | chips (roof drone) | H9 - 9A -D9AB- 9B -F9R- W3 -F7R/F5R/F4R- 7C (2), 5A (2), 4C (1) | chip on board, case, green light | in products | 5 / 5 |
| Seats | foam + fabric (pallet B) | W1-9 -F9R- 9D -F9R- W3 -F5R/F4R- 5D, 4C | seat grows | in cars | 3 sets / 3 |
| Glass pane | blanks (pallet A top layer) | DOCK -F1R- 1C -F1R- W3 -F5R/F4R/F2R- 5E (2), 4C (1), 2C (2) | heated, bent | in vehicles; 1 cracked pane per CT -> scrap | 5 / 4 fitted + 1 scrap |
| Steel ring | coil (pallet B, every 2nd cycle) | W1-8 -F8R- 8B -D8BC- 8C -D8CD- 8D -D8DE- 8E -B8 trolley- BR -CS- G -> ring transporter | sheet, open ring, welded ring, X-ray green | ring transporter leaves east ("to the next ship") | 1 / 1 (48) |
| Heat tile (kiln) | silica (pallet B) | W1-8 - 8A -F8R- 8E, packed 2 to a crate inside the ring | white, pressed, black, tick | rides inside ring on transporter | 2 / 2 (48) |
| Heat tile (repair loop) | the same single tile | G pile -TL- CG -AA- hull, falls to G pile | pinned, falls | closed loop (Reid's description) | 0 / 0 |
| Raptor | the ship's own 6 engines | ENG -CS- BR -B8 trolley- 8E -D8DE- 8D (service) -D8DE- 8E -B8- BR -CS- ENG | nozzle off, turbopump swapped, new injectors, nozzle on | closed loop, 1 in service at a time | 1 / 1 (48) |
| Injector set | window drone | O7E - 7E -H78- 8E -F8R- 8D | fitted | old set -> scrap tote -F8R- W3 - DOCK -> truck | 1 / 1 (48) |
| Sensors | window drone | O7E - 7E -F7R- 7B | fitted into heads | in Optimus | 2 / 2 |
| Magnets/motors | pallet B | W1-7 - 7A (carrier, cut job #10) | test spin | in actuators | 2 sets / 2 |
| Ingots | pallets A (F4) + B (F6) | W1-4 -F4R- 4E ; W1-6 - 6A | melt, pour, press | in frames | 2 / 2 |
| Steel coil (CT) | pallet A | W1-2 -F2R- 2E | sheet, panel | in Cybertruck | 1 / 1 |
| Paint can | pallet B | W1-6 -F6R- 6D ladder | tank level rises | empty can -> F6R - W1 - DOCK -> truck | 2 / 2 |
| Doors (Model Y) | 6A panel press | F6H hanger rail | hung on body | on car; hangers loop back | 2 sets / 2 |
| Ship food crate | groceries + empty crate (pallet A, F1 layer) | DOCK -F1R- 1D -F1R- W3 -F8R- 8E -B8 (carried by crew-up)- BR -TL- CG -CH- galley | cooked, plated, grilled in galley | oldest galley crate goes down with crew-down -> tower-base apron -> transporter ("food bank") | 1 / 1 (2 per 48 trip) |
| Cafeteria food | groceries | DOCK -F1R- 1D -D1DE- 1E table | plated, served | leftovers -> food-bank crate -F1R- DOCK -> parts truck | 1 meal / 1 crate |
| Optimus crate kit (flat) | pallet A (1B) ; ring transporter return trip (tower base) | DOCK -F1R- 1B ; east road - apron | folded -> box -> lid | leaves with the Optimus inside | 1 + 1 / 1 + 1 |
| Pallets (empty) | parts truck | lift trips down -> DOCK | — | backload on parts truck | 2 / 2 |
| Totes, hangers, buckets, carts, trolley, lift cars, ladle, skip | — | loop on their own rail/shaft | — | closed loops | 0 / 0 |
| Scrap tote (cracked pane, old injectors) | 2C, 8D | -F2R/F8R- W3 - DOCK | — | parts truck backload | 1 / 1 |
| Dirt -> bricks | Boring machine | muck belt -> shaft hopper -> skip hoist SHAFT -> brick press | dirt lump, pressed brick, stacked | brick pallet on parts truck backload | 1 skip / 1 pallet |
| Tunnel ring set | parts truck | forklift -> shaft top -> skip down leg -> ring conveyor -> erector (hidden) | placed ring appears at mask edge | built into tunnel (stays; see §5 trick) | 1 / 1 |
| LOX + CH4 | fuel truck (2 compartments) | FILL -> buried tanks -> vault pumps/valves -> TRENCH -> booster QD + tower riser -> ship QD | levels, valve wheels, frost on LOX pipe | boil-off vent on ship + booster (steady white plume) | 1 truckload / 1 truckload vented |
| Power | roof solar | H9C - 9C - RISER - BB Megapacks - RISER - 1A, 2A chargers | dots, bars | charged vehicles | balanced (dots) |
| Coolant | BA plant | RISER -> 6A, 4E, 2E presses -> back | flow dots, tank level (cut job #2: Optimus climbs, turns valve, tank refills) | closed loop | 0 / 0 |
| Drones | off-frame | roof: top edge -> pad -> top edge; window: east edge -> O7E -> east edge | — | leave the frame | 1+1 / 1+1 |
| Trucks | off-frame west / east | parts truck, car carrier (west); fuel truck, ring transporter (east) | — | leave the frame | 3 / 3; transporter 1/1 (48) |

## 5. Roof, yard, lawn, tower, ship, underground

**Roof**: drone pad over 9A (roof drone 2-10 s, drops chip parcel into H9), solar rows over 9B-9E
(glint 24 s, cable into 9C), TESLA sign, theme banner. Cut job #9: both v2 drones become these
delivery drones.

**West yard** (ground, west of the core): two-lane road to the west edge; DOCK with Optimus-driven
forklift (cut job #5); brick press + launch-shaft head + skip hoist beside the dock; car-carrier
spot outside X1A. Schedules in §6.

**East lawn**: from the building east wall to the tank farm. Cafeteria window + door, Shiba's nap
spot, turkey flock (Thanksgiving), gopher hole, theme decor. Fill point at the tank farm's west
edge; vent stacks steam (24 s puffs).

**Tower** (east of the tank farm): lattice, three separate faces so nothing crosses: north face =
tower lift TL (stops G, BR, CG); south face = chopsticks carriage CS (stops G, BR, ENG); west face =
plain (round 3: the spare 42, inspector and west ladder are cut; there is only ONE 42). Ship QD arm and
booster QD at the launch mount.

**Starship cutaway, top to bottom**: Bridge (resident pilot Optimus) | Crew quarters (bunks; resident
crew B + towel on hook) | Galley (resident chef, not-a-flamethrower grill, fridge) | Cargo bay
(rack of 3 rotating crew Optimus, Mars-soil crate, resident loadmaster; door + access arm AA at CG;
the ONE 42: a small red plate on the ship skirt just below this door, ~1/3 door height) | header tank | CH4 | LOX | Engine bay (6 Raptors,
hatch EB). Inner ladder CH links cargo, galley, crew, bridge. Booster: CH4 | LOX | 33-engine bay
(static; 3 valve lights blink when the fill valve is open). Never launches.

**Underground strip**: launch shaft (yard) | W-core pits | BA coolant plant (cut job #2: Optimus climbs
the tank ladder, turns the valve, tank refills) | BB Megapack room |
soil band with gopher burrows | pump vault + buried LOX/CH4 tanks under the tank farm | trench to
the launch mount. Below everything: the Boring tunnel. Gopher burrows sit between BB's east wall
and the vault wall, above the tunnel crown with a clear soil band, and west of the fill pipes and
trench, so no burrow crosses a pipe, cable or tunnel (#63).

**Boring machine (period 24 s, stated exactly)**: support cars are identical, length L; one tunnel
ring is width L. Train offset x(t) = x0 + L·(n + s(τ)), n = floor(t/24), τ = t mod 24, s eases 0 -> 1
during τ 2-14 (push) and holds at 1 for τ 14-24 (ring build). Because the train is drawn as a pattern
with period L, its picture depends only on L·s(τ) mod L, so τ = 24 looks exactly like τ = 0. The
lining rings never move. The newest ring is placed behind the shield at the east edge, inside the
rock mask, so "one ring added per 24 s" is shown by the ring set entering the mask at τ 19-20. The
cutter head is always inside that mask; the tail is always behind the launch-shaft wall. Ring sets
ride a gantry conveyor east, one set per 24 s (spacing D = conveyor speed x 24). Dirt rides the muck
belt west into the shaft hopper (level rises τ 0-20, drops 20-24 when the skip loads).

**Gophers**: base loop (24 s) asleep, breathing. Own gag (§7).

## 6. Shared resource schedules (base 24 s; 48 s where marked). Gag slots = GS.

**Parts truck / forklift / DOCK** — truck arrives 15-18 (in-lane), forklift unloads next cycle's
pallet A 18-19.5 and B 19.5-21, F1 items + tunnel ring set 21-22, loads backload (empties, scrap tote,
food-bank crate, brick pallet, empty cans) 22-23.4, takes this cycle's empties off W1 23.4-24, loads
pallet A into W1 0-0.8; truck leaves 0-3 (out-lane); forklift loads pallet B into W1 12-12.8.

**BL big open-cage lift** (round 3; replaces W1, W2a, W2b). One floor = 0.5 s; the counterweight
bobs opposite the cage and wobbles ~0.3 s after every stop (cartoon overshoot). Down trips = finished
cars, up trips = heavy raw items.
| τ | Move | Load |
|---|---|---|
| 0.0-0.8 | load F1 (sort table) | Semi kit + CT coil + 2 ingots (+ ring coil on A cycles) |
| 0.8-1.3 / 1.3-2.1 | up to F2 / stop F2 | Semi kit + CT coil off |
| 2.1-3.1 / 3.1-3.7 | up to F4 / stop F4 | ingot off |
| 3.7-5.7 / 5.7-6.4 | up to F8 / stop F8 | ring coil off (A cycles; B: stop empty) |
| 6.4-6.9 / 6.9-7.4 | down to F6 / stop F6 | ingot #2 off |
| 7.4-7.9 / 7.9-8.9 | down to F5 / load Model Y #1 | car body |
| 8.9-10.9 / 10.9-11.9 | down to F1 / unload into 1A lane 1 | |
| 11.9-13.4 / 13.4-14.4 | up to F4 / load Cybercab | car body |
| 14.4-15.9 / 15.9-16.9 | down to F1 / unload 1A | |
| 16.9-18.9 / 18.9-19.9 | up to F5 / wait | |
| 19.9-20.9 | load Model Y #2 (12 s after #1) | car body |
| 20.9-22.9 / 22.9-23.6 | down to F1 / unload 1A | |
| 23.6-24.0 | idle at F1 (counterweight settles) | |
Busy ~22 of 24 s (design numbers, not measured). Model Y #1 and #2 enter 1A at 11.9 and 23.6
(exit +10), Cybercab at 16.9. The F5/F4 line phases are re-timed so a finished car is waiting at
5A/4A at those load times (check in build). The car carrier takes Cab 3, MY 10, CT 13, crate 16,
MY 22 (was MY 5, crate 10, CT 13, MY 17, Cab 22).
**Tubes PT** — capsules, continuous; any count fits (each capsule 0.6 s riser to F9).
**Spiral slides** — SS: items drop whenever ready (no schedule). SL71: even Optimus sits down at
7A at 19.0, whooshes 19-23, stands up in 1A 23-24, walks to crating as before.
**Round-3 note (Reid asked for ONE lift):** the two one-floor slab drops **L65** (6E -> 5E) and
**L21** (2A -> 1A) remain as short in-room drop tables (part of their room's machine). Flagged for
Reid: alternative is a car ramp, which needs more room than a 480 x 300 cell has.
**L21** — CT 0-1 load, 1-2 down, 2-3 out; Semi 10-11 load, 11-12 down, 12-13 out to lane 2.
**L65** — Model Y at 4 and 16 (1 s down, 1 s up).
**1A lane 1** (dyno 4 s, scan 2 s, charge 4 s): CT in 3, MY 7, Cab 12.4, MY 19 -> exits 13, 17, 22, 5.
**1A lane 2**: Semi in 12-13, Megacharger 13-18, exits X1A 18-19, drives off west 19-22.
**X1A + car carrier** — carrier arrives 0-2.5 (in-lane), takes MY 5, crate 10, CT 13, MY 17, Cab 22;
leaves 23-26 (out-lane, behind the Semi). Parts truck arrival (15-18) and departure (0-3) use the
other lane / follow the carrier.
**W3 basket chain / PB paternoster** — continuous (W3 one basket per side per 1 s, PB one per 3 s);
loads per cycle W3 ≤22 (small items moved to PT, so less), PB 5; capacity 24 and 8. No conflicts possible on a paternoster.
**Skip hoist** — 0-8 up with dirt, 8-10 dump to brick press, 10-11 take ring set, 11-19 down,
19-20 ring set off, 20-24 load dirt.

**Tower lift TL** (G 0, BR 2300, CG 2700 units high; 900 units/s):
| τ | Move | Who |
|---|---|---|
| 0.0-3.0 | G -> CG | tile Optimus + tile |
| 3.0-4.0 | stop CG | tile Optimus out to arm AA; crew-down (with old food crate) in |
| 4.0-7.0 | CG -> G | crew-down |
| 7.0-8.0 | stop G | crew-down out -> crate station 8-12, crated 12-14 -> transporter apron |
| 8.0-10.6 | G -> BR | empty |
| 10.6-11.6 | stop BR | crew-up + fresh food crate in |
| 11.6-12.1 | BR -> CG | |
| 12.1-13.1 | stop CG | crew-up + crate out; tile Optimus in (tile pinned 4-11) |
| 13.1-16.1 | CG -> G | tile Optimus; tile falls off hull 13.5, lands on G pile 15.0 |
| 16.1-16.6 | stop G | tile Optimus out; walks 16.6-18, picks tile 18-19, waits by door |
| **16.6-23.7** | **GS (free)** | parked at G, unless the 42 gag uses it (cycles 2 and 3, §7; cycle 2 also carries the waiter + plate) |
| 23.7-24.0 | stop G | tile Optimus boards |

**Sky-bridge B8** — walk lane 1: crew-up east 3.0-10.0 (comes up S78 at 0-2.5, takes food crate at 8E
2.5-3.0). Walk lane 2: free (GS for Elon). Trolley (48): cycle A 0-1 load ring (after "go"), 1-6 east,
6-7 ring to CS, 7-12 back empty, 12-24 parked (free); cycle B 0-1 load Raptor, 1-6 east, 6-7 swap at
BR, 7-12 back with old Raptor, 12-13 unload to 8D, 13-24 parked (free).

**Chopsticks CS (48)** — A: 0-6 wait BR, 6-7 take ring, 7-11 down to G, 11-12 ring onto transporter,
12-16 to ENG, 16-22 pull old Raptor (engine bay shows one empty mount until B 13), 22-24 up to BR;
B: 0-6 wait, 6-7 swap (old onto trolley, serviced into arm), 7-8 down to ENG, 8-13 install,
13-14 up to BR, 14-24 parked.

**Ring transporter (48)** — A 11-12 gets ring (+tile crate); crew crates and food crates added at A14
and B14; leaves east B 16-20 (behind the fuel truck); returns empty with 2 crate kits at A 4-8.

**Fuel truck (24)** — arrives from the east 0-3, hoses 3-4, pumps 4-14 (fill valve open, booster
valve lights blink), unhooks 14-15, leaves east 15-19. Buried tank levels rise 4-14, fall slowly the
rest of the cycle (constant transfer), same level at 0 and 24. Ship and booster tanks: inflow =
vent, levels steady.

**Drones** — roof drone 2-10 (pad 4-6). Window drone 13-22 (enters O7E 15, unload 16-18, leaves 18).
It flies below the bridge (F8) and in front of the tower layer.

**Stairs** — S78: crew-up 0-2.5 only. S89: Elon only (42 gag). W4: spare.
**Truck/forklift wording**: "loads pallet A/B into W1" now = forklift sets pallets on the DOCK sort table
(same times); the sort Optimus feeds PT, W3 and BL.

## 7. Theme hooks and gags (each on its own odd timer)

**Theme swaps** (same slots, same routes, same sinks as default — only the drawing changes, #57, #59):
| Slot | Default | Thanksgiving | Valentine's | Christmas |
|---|---|---|---|---|
| Food items (1D, galley, crates) | burger, fries, coffee, pizza | pie, pumpkin, corn, cranberry (no roast turkey: the platter waits empty) | heart cookie, chocolate, cupcake, rose | cookie, candy cane, cocoa, wrapped present |
| Table-gag actor | Shiba (Doge) | turkey #3 of the flock | cupid | red ornament (+ gardener Optimus) |
| Outdoor decor (base 24 s) | plants (static) | leaves fall on the lawn (whole falls per 24 s), hay bales | hearts drift up from the lawn | snow on yard + lawn, lawn tree |
| Roof banner | GIGAFACTORY | Happy Thanksgiving | Happy Valentine's | Merry Christmas |
Never themed: parts, vehicles, Optimus, Starship, tower, fuel colours.

**Gag engine** (implementation note): n = floor(t/24). Gag g with period P, offset o, length k
cycles is in its cycle j (0..k-1) when some trigger o + m·P falls inside [24(n-j), 24(n-j)+24).
Local time τ = t mod 24. Outside its active cycles the gag draws the neutral base-loop pose, and every
storyboard ends in that pose at τ = 24 of its last cycle. Rule P >= 24(k+1) so a gag never overlaps
itself. Each actor belongs to the base loop or to exactly one gag; a gag may "borrow" one listed
base actor. Pure function of t, so culling and `?t=` still work.

| Gag | P (s) | Offset | Length | Neutral pose | Owns / borrows | Shared slots used |
|---|---|---|---|---|---|---|
| 42 fall (merged round 3: the fall spooks the flock -> table gag; Elon makes + hangs the new one; waiter brings Elon a plate) | 127 | 19 | 4 cycles | the ONE 42 on the ship skirt by the cargo door; Elon sketching at 9E bench; rover in its garage; flock pecking; platter empty; table actor at its spot; waiter Optimus standing by the 1E serving door | Elon, 42, rover, offcut bin, table actor (+ gardener at Christmas), waiter Optimus + plate; borrows cafeteria servers (freeze pose) | TL GS in cycles 2, 3; bridge lane 2; S89; arm AA |
| Robot feast (round 3) | 89 | 11 | 1 cycle | feast Optimus sits on an upturned crate at the back of 3C (behind the racks, off the walk lane), empty pan on a hot-plate, closed snack crate | feast Optimus, pan, hot-plate, snack crate | none |
| Grill flare | 61 | 5 | 1 | chef grills, small flame (6 s) | borrows galley chef | none |
| Towel | 67 | 29 | 1 | towel on hook, crew B on bunk | crew B, towel | none |
| Mars-soil crate | 71 | 43 | 1 | crate closed in cargo, loadmaster standing | loadmaster, crate | none |
| Gophers | 53 | 7 | 1 | family asleep in burrow | gopher family | none |
| Drone mishap -> gaming PC -> Elon plays (Stage 3 hook, BRIEF-STAGE2 rule 7) | 157 | 50 | 4 cycles | sign off, PC parts not assembled, Elon on his route | window drone O7E (borrowed), Rube Goldberg props, PC; borrows nearby Optimus | 9E desk; DIABLO sign (only other allowed text) lit only while Elon sits |
Machines, not gags (24 s): Cybertruck window test (every truck, 2C), Roadster/Starman turntable
(1B, one turn per 24 s), tile repair loop, Shiba tail wag. Static: Occupy Mars poster (9E + crew
quarters sticker).

**42 fall storyboard** (cycle.τ; one gag, 4 cycles):
- 1.0-1.3: the 42 wobbles. 1.3-2.0: falls, bounces off a grid fin, CLANG on the tank-farm grating at
  2.0 (burst lines, dust) — right next to the lawn.
- 1.2-3.0: flock jumps, feathers puff, heads up. 3.0-4.5: turkey #3 runs to the cafeteria window.
  4.5-5.5: flaps in, lands on the empty platter; servers freeze. 5.5-10: sits, looks left, right,
  blinks; a server slowly lifts a fork, puts it down. 10-12: hops off; servers unfreeze. 12-16: walks
  out the door. 16-22: back to the flock, base peck loop by 24.
- 1.4-4: Elon at the 9E window sees it, facepalm. 2.0-12: rover drives out, picks up the bent 42 from
  the grating, drops it in the deck scrap bin, back in its garage by 15. 1.4-20: Elon cuts "4" and "2"
  from an offcut (plasma sparks), 20-24 paints them red.
- 2.0-6: Elon walks to S89, down to 8E (6-11), crosses the bridge on lane 2 (11-17.5), waits at BR.
  Meanwhile the waiter Optimus takes a plate at the 1D/1E serving door (2-4), walks out the lawn door
  and round the flock to the tower base (4-16), boards TL at G (16.3). 2.16.6-19.2: TL (GS) G -> BR.
  2.19.2: Elon steps in; the waiter holds out the plate, Elon takes a forkful and chews while the lift
  rises BR -> CG (19.7-20.2), hands the fork back, steps onto arm AA 20.2-20.7. The waiter rides TL
  down CG -> G 20.7-23.7 (TL must be at G for 23.7 anyway), steps out.
- 3.0-10: waiter walks back across the lawn and in the 1E door, stands by the serving door (neutral).
  The plate leftovers go in the food-bank crate with the base loop's leftovers.
- 3.0-16: Elon bolts the new 42 to the skirt by the cargo door (tile Optimus at the other end of the
  arm 3-13), waves at the camera. 3.19.6: TL (GS) picks him up at CG, drops him at BR 20.6-21.1; he
  walks lane 2 west 21.1-24.
- 4.0-3.6: bridge end; 3.6-8 up S89; 8-10 back to his bench, sketching = neutral by 4.10.
The bent 42 in the deck bin leaves with the next ring transporter trip (bin lid closed; contents unseen).
Theme actor swaps (same beats, same window/door/platter): default Shiba trots; Valentine's cupid
startles off the hedge, lands in the heart cake as a topper; Christmas the lawn tree shakes, the red
ornament bounces in and rolls out, the gardener Optimus hangs it back on the tree by 2.20.

**Robot feast storyboard** (τ, 1 cycle): 0-3 ties a bib; 3-7 opens the snack crate, tips a handful of
bolts into the pan (clatter dots); 7-10 pours grease from an oil can ("gravy", slow black drip);
10-12 tucks two AA batteries in as "corn"; 12-15 stirs, hot-plate glows, a spark puffs; 15-20 eats
bolts one by one (visor blinks happy, little "crunch" lines); 20-23 pats its tummy panel, wipes the
visor; 23-24 sits back = neutral (pan empty, crate closed). Thanksgiving dressing: the bolts are piled
into a turkey shape with two wrench "drumsticks"; other themes: plain bolt pile. Sink: eaten
(visibly used). ACCEPTED (like #66): the snack crate is closed, its stock is not counted.

**Other gags**: Grill (τ 4-10): chef lights the not-a-flamethrower, big whoosh, singed chef hat
smoke, back to small flame by 14. Towel (τ 2-20): crew B takes the towel, drapes it on its shoulder,
walks to the porthole, looks out, hangs it back. Mars-soil (τ 3-18): loadmaster opens the crate, looks
in (empty), shrugs, stamps "FILL ON ARRIVAL", closes. Gophers (τ 0-24): mum climbs to the lawn hole,
pops up, sniffs, ducks; babies peek; all back asleep by 22.

## 8. All periods (none is 16, 20, 36 or 72 any more)
- Base / machines: **24** (all lifts, trucks, drones, fuel, Boring, skip hoist, tile loop, tower lift,
  crew rotation, Cybercab, Cybertruck, Semi, turntable, decor), **12** (Model Y and Optimus pitch),
  **6** (grill small flame), **3, 2, 1** (fans, beacons, rotors — all divide 24).
- **48**: rings, Raptor service, trolley pattern, chopsticks, ring transporter (heavy parts; one big
  part per 24 s would need a second tower crane).
- Gags (own timers, primes, none a multiple of 24 or of each other): **53, 61, 67, 71, 89, 127**
  (round 3: 83 freed by the 42 merge; 89 = robot feast).
- Walkers whose journey is longer than 24 s (even Optimus ~40 s, crew-up ~30 s) use the car-chain
  engine (journey time + pitch 24), so they are still seamless at 24.
- Boot check: every machine period divides 48; every gag P is prime and P >= 24(k+1).
- Popscan: compare t = 0 vs 48 with gags off; then scan gag boundaries (each gag's start and end
  frame must equal the neutral frame).

## 9. Page, zoom and level of detail
- **Camera** (Reid: opens on the whole scene): one canvas, world ~5300 x 4300. Fit-all on load.
  Wheel zoom at the cursor, drag pan, pinch, double-click a room to zoom to it, Home to fit.
  Zoom 0.2x-3x. URL keeps `?theme=`, `?t=`, adds `?view=x,y,zoom`.
- **LOD** (px per world unit): far < 0.35 = big shapes only (vehicles, lifts, ship, fuel flow,
  gag actors); mid 0.35-0.8 = + arms, Optimus, belts; near > 0.8 = everything (sparks, gauges,
  faces). Modules export `draw(ctx, t, theme, lod)`.
- **Culling**: each module has a world box; skipped if off-screen. Everything is a pure function of
  t (gags included), so nothing needs catching up.
- **Pluggable rooms**: grid `{cols: 5, floors: 9}` + layout `{id, col, floor}`. A module declares
  period, ports (named openings: door, slot, hatch, rail end) and draw functions. Connectors (§3)
  link ports by name; the floor rails, core shafts and stairs are generated from the grid, so adding a
  floor or column adds its rail, doors and core stops automatically.
- **Boot checks**: periods (§8); every flow in §4 has a source port, a connector chain and a sink;
  every room has an in and an out; no actor owned twice; console lists anything orphaned.
- **Performance**: not measured. Target 60 fps at fit-all; check with culling/LOD counters first.
- **Backgrounds**: plain white; optional 2% floor tint flag, off.

## 10. Optimus staffing — round 4 (Reid 2:49 PM): fewer, busier robots
Rule for every later stage: **an Optimus never stands idle.** Each one runs a continuous multi-step loop on its own
cycle (12/24/48 s) — walk, reach, carry, fit/bolt, check, reset — and a role that only fills a few seconds of its
cycle is merged into a neighbour's loop. All cut-list jobs (#1-#12) stay; they become *steps* of these loops.
Gag actors (42-gag waiter, feast Optimus, ship crew B, loadmaster, chef, gardener) are untouched; see "proposals".
Idle budget: <= ~1.5 s of "watch/check" per 12 s cycle, and it must look at something that is happening.

| Where | Before (roles) | Round 4 plan (busy loop) |
|---|---|---|
| Floor 6 (built) | 6A climber + carrier, 6B fitter, 6C A + B + sweeper, 6D ladder, 6E QC (7) | 6 Optimus, loops in §2 above (6C now ONE Optimus; sweeper removed) |
| 9A-9B | sorter (#6) + chip carrier (#11a) | ONE intake Optimus: open roof parcel -> shelve chips -> carry chips through D9AB -> load the 9B pick-and-place feeder -> flatten the empty parcel into the F9R return basket -> back to the hatch |
| 9C-9E | flight controller (watch screen, press "go") | ONE controller: presses "go" at each bridge load (trolley 0 s / 48 s), between loads walks D9DE to 9D, checks + tags a finished seat, puts it on F9R, checks the 9C inverter screen, returns before the next "go" (Elon's bench + 42 gag unchanged) |
| 8A-8B | tile tapper | ONE tile Optimus: unloads the press, loads the kiln, tap-checks the fired tile, crates 2 tiles for 8E, feeds the next silica blank |
| 8D-8E | Raptor tech + 8E loader arm | ONE Raptor tech: 48 s service sequence (nozzle off, turbopump, injectors, nozzle on), then helps load the trolley at 8E and swaps the scrap tote; loader arm stays a machine |
| 7A-7C | magnet-box carrier (#10) + hand/head carrier (#11b) | ONE line feeder: magnet box to 7A -> walks to 7B -> carries the hand/head set through D7BC to 7C -> brings the empty tote back to the W3 basket |
| 7D-7E | drone unloader (7E) | ONE bay Optimus: unloads the window drone (13-22 s), sends injectors up H78 and sensors on F7R; outside the drone window it runs the 7D head-check pad (touches each new robot's head panel) |
| 5E | scissor-lift glazier (#7) + windshield Optimus | ONE glazier: windshield from rack -> set -> rides the scissor lift with the roof glass -> sets it -> down -> takes the next panes from the F5R basket |
| 5A-5B | pack bolter | ONE: bolts the pack (5B), walks to 5A, plugs the computer harness, checks the lit screen, returns for the next pack |
| 4C-4D | butterfly-door carrier (#11d) | ONE: carries the gold door 4D -> 4C, hangs + bolts it, checks the door swing, returns |
| 3B-3C | ladder Optimus (#3) + cell cart (#8) | ONE: box of cells up the ladder to the top rack -> down -> pushes the charged-cell cart through D3CB -> unloads at 3B -> returns the empty cart |
| 3A | ledge Optimus (#12) | ONE: hangs balanced wheels on the hook line from the ledge, climbs down for the next balanced wheel, loads the next rim on the tire press, climbs back |
| 2A-2C | ball-test Optimus (2C) + Semi-pack carrier (2B->2A) | 2C stays (throw ball, swap pane, scrap tote, fetch glass = already busy); ONE Semi builder carries the pack through D2BA, installs it, bolts motors + cab, returns |
| 1A | (chargers automatic) | ONE plug-in Optimus alternates lanes: plugs/unplugs the Supercharger (lane 1) and Megacharger (lane 2) for every vehicle, wipes the scanner window between cars |
| 1D-1E | cook + platter carrier (#11e) + several servers | ONE cook (stir, plate, carry platter through D1DE, back) + ONE server (set table, clear plates, leftovers into the food-bank crate, push it on F1R) |
| Yard / DOCK | forklift driver (#5) + sort-table Optimus | ONE: drives the forklift during the truck window (15-24 s) and works the sort table (PT / W3 / BL) for the rest of the cycle |
| Underground BA + BB | coolant climber (#2) | ONE utility Optimus: climbs the tank ladder, turns the valve, walks to BB, checks the Megapack screens, back |
| Tower / ship | tile Optimus (repair loop) waits 18-23.7 s; residents | tile Optimus fills its wait by checking the booster QD clamp at the launch mount and restacking the G tile pile; crew-up/down already continuous; loadmaster base job = carries the incoming food crate up ladder CH to the galley; pilot runs a console check loop |

Proposals for Reid (NOT cut, listed only): see §10.1.

### 10.1 Decisions (were proposals; nothing cut)
- 42 gag: no separate waiter; the gag borrows the 1E server (starts at Elon's bench in 9E, stair S89).
- Robot feast: borrows the 3B-3C base worker (no resting feast Optimus).
- Towel gag: borrows ship crew B (the base loop is the porthole check).
- Christmas gardening: done by the yard utility Optimus (no extra actor).
- 9E: ONE controller Optimus (go at 23-24 / 47-48, D9DE to 9D seat check + tag + lift, 9C inverter screen); 9A-9B: ONE intake Optimus; 9B arm and 9D sewing arm are machines.
- Occupy Mars poster / crew-quarters sticker, Shiba tail wag, floor-6 peeks (Shiba x3, hard hat, drone, waving Optimus): all kept.

## 11. Stage 2 build status (code in /workspace/tesla-factory/v3)
Built (all pure functions of t, periods divide 48, boot checks OK): floors 1-6 (30 rooms), west core risers with stops at
every floor (PT, W3, BL, SS, W4), DOCK/warehouse (truck, AGV forklift, sort table, DOCK Optimus, outboxes, capsule rack,
backload bin), roof drone pad -> tube inlet (16 s), window drones 5E / 4E (48 s, staggered), PB paternoster, car carrier +
X1A exit lane, L21 table, all floor-1..5 basket / capsule routes (js/rooms/routes.js), 16 peeks, the Diablo gag hook stub.
Build decisions (design numbers, change here if Reid disagrees):
- 1A: every vehicle (MY x2, Cab, CT, Semi) tests on one station = the L21 landing; vehicles back out through the core front
  lane onto a two-deck car carrier (arrives 1-3, leaves 23-25); the Semi drives off west. Crates go to the carrier by the
  DOCK AGV forklift (merged role, no extra Optimus). The forklift is an autonomous AGV.
- L21 timing: CT down 2.9-3.9, table up 6.6-7.6, Semi built ON the table 7.6-20.1, down 20.1-21.1, up 22-23.
- SL71: even Optimus slide down the SS shaft 15-19 and walk to 1B crating (stands up at the DOCK, not in 1A).
- Optimus on floors 1-5 (§10): 1A plug-in, 1D cook, 1E server, 2A Semi builder, 2C glass/ball tester, 3C charge+cart,
  3A ledge, 4C door/fit-out, 5E glazier, 5B/5A pack+computer, DOCK sorter = 11. No dedicated gag robots built (the feast
  Optimus / 42 waiter will borrow base actors when their gags are animated).
- Floors 7-9 built (js/rooms/floor7-9.js). Optimus used: 7 line feeder (7A-7C), 7 bay Optimus (7D-7E), 8 tile Optimus
  (8A-8B), 8 Raptor tech (8D, loads the 8E trolley), 9 intake Optimus (9A-9B), 9 controller (9C-9E, presses go) = 6.
  No dedicated gag robots exist: 42 gag -> 1E server, feast -> 3B-3C worker, towel -> ship crew B, Christmas gardening ->
  yard utility Optimus.
- Not yet: Starship/tower, underground, gag animations (stage 3).

