// Cross-floor carrier routes for floors 1-5 (and their part-2 endpoints on floors 7-9). One file so the DOCK
// departure plan is visible in one place. Rooms read the stop windows: TF.R.<name>.window(member, stopIndex).
// Basket stops: x = drop point on the floor cable; journeys divide 48; departures from the DOCK are staggered.
(function (G) {
  const TF = G.TF, S = TF.supply;
  const R = (TF.R = {});
  // DOCK -> 1C (blanks in, panes out) -> 5E (4 panes) -> 4C (1) -> 2C (2, scrap tote back) -> DOCK
  R.glass = S.basket({ id: 'glass-shuttle', period: 24, journey: 48, dep: 2.0, base: 'dock', start: ['blank', 'blank'],
    stops: [{ floor: 1, x: 2600, drop: 130, dwell: 2.0, unload: ['blank', 'blank'], load: ['pane', 'pane', 'pane'] },
      { floor: 5, x: 3440, drop: 70, dwell: 1.6, unload: ['pane'] }, { floor: 4, x: 2470, drop: 70, dwell: 1.4, unload: ['pane'] },
      { floor: 2, x: 2745, drop: 140, dwell: 1.6, unload: ['pane'], load: ['scrap'] }] });
  // 9D seat shop (floor 9, part 2) -> 5D (2 sets) -> 4C (1 set) -> back
  R.seats = S.basket({ id: 'seats', period: 24, journey: 48, dep: 7.0, base: { floor: 9, x: 3000, drop: 40 }, start: ['seat', 'seat', 'seat'],
    stops: [{ floor: 5, x: 2980, drop: 70, dwell: 1.6, unload: ['seat', 'seat'] }, { floor: 4, x: 2440, drop: 70, dwell: 1.4, unload: ['seat'] }] });
  // 3A wheel shop -> 5C (2 totes) -> 4B (1) -> 2B (1) -> back to 3A with the empty totes
  R.wheels = S.basket({ id: 'wheel-totes', period: 24, journey: 48, dep: 3.0, base: { floor: 3, x: 1500, drop: 60 }, start: ['wheels', 'wheels', 'wheels', 'wheels'],
    stops: [{ floor: 5, x: 2560, drop: 70, dwell: 1.6, unload: ['wheels', 'wheels'], load: ['tote'] }, { floor: 4, x: 2060, drop: 70, dwell: 1.4, unload: ['wheels'], load: ['tote'] },
      { floor: 2, x: 2060, drop: 70, dwell: 1.4, unload: ['wheels'], load: ['tote'] }] });
  // DOCK -> 3E (powder + foil) ; DOCK -> 3A (tires + rims)
  R.powder = S.basket({ id: 'powder-foil', period: 24, journey: 24, dep: 4.3, base: 'dock', start: ['powder', 'powder'],
    stops: [{ floor: 3, x: 3560, drop: 60, dwell: 1.6, unload: ['powder', 'powder'] }] });
  R.tires = S.basket({ id: 'tires-rims', period: 24, journey: 24, dep: 12.2, base: 'dock', start: ['tire', 'tire', 'tire'],
    stops: [{ floor: 3, x: 1395, drop: 150, dwell: 1.6, unload: ['tire', 'tire', 'tire'] }] });
  // DOCK -> 1D (groceries) -> 1E (food-bank crate back) -> DOCK ; DOCK -> 1B (Optimus crate kit)
  R.groceries = S.basket({ id: 'groceries', period: 24, journey: 24, dep: 10.1, base: 'dock', start: ['groceries', 'groceries'],
    stops: [{ floor: 1, x: 3000, drop: 150, dwell: 1.6, unload: ['groceries', 'groceries'] }, { floor: 1, x: 3560, drop: 150, dwell: 1.6, load: ['foodcrate'] }] });
  R.crates = S.basket({ id: 'crate-kits', period: 24, journey: 24, dep: 22.0, base: 'dock', start: ['kitflat'],
    stops: [{ floor: 1, x: 2020, drop: 70, dwell: 1.6, unload: ['kitflat'] }] });
  // 3B Optimus packs -> 7C (floor 7, part 2) ; 1D ship food crate -> 8E (floor 8, part 2)
  R.optPacks = S.basket({ id: 'optimus-packs', period: 24, journey: 48, dep: 9.0, base: { floor: 3, x: 2150, drop: 60 }, start: ['pack', 'pack'],
    stops: [{ floor: 7, x: 2560, drop: 60, dwell: 1.6, unload: ['pack', 'pack'] }] });
  R.foodCrate = S.basket({ id: 'ship-food', period: 24, journey: 48, dep: 16.0, base: { floor: 1, x: 2950, drop: 150 }, start: ['foodcrate'],
    stops: [{ floor: 8, x: 3660, drop: 138, dwell: 1.6, unload: ['foodcrate'] }] });
  // PT: 9B computers (floor 9, part 2) -> 5A (every 12 s) and -> 4C (every 24 s)
  R.comp5 = S.capsule({ id: 'computer-5A', period: 12, journey: 24, dep: 5.0, col: '#0ea5e9', item: 'computer', from: { floor: 9, x: 1960, h: 1.6 }, to: { floor: 5, x: 1560, h: 1.7 } });
  R.comp4 = S.capsule({ id: 'computer-4C', period: 24, journey: 24, dep: 15.5, col: '#0ea5e9', item: 'computer', from: { floor: 9, x: 1990, h: 1.6 }, to: { floor: 4, x: 2340, h: 1.7 } });
  // window drones (source c): headlamp modules into the 5E east wall, cabin screens into the 4E east wall (48 s, staggered)
  R.lamps = S.windowDrone({ id: 'lamps-5E', owner: '5E', floor: 5, wallX: 3750, h: 3.4, side: 1, period: 48, offset: 7, item: 'lamp', col: '#f59e0b', to: { floor: 5, x: 3540, h: 1.6 } });
  R.screens4 = S.windowDrone({ id: 'screens-4E', owner: '4E', floor: 4, wallX: 3750, h: 3.4, side: 1, period: 48, offset: 31, item: 'cabScreen', col: '#0ea5e9', to: { floor: 4, x: 2380, h: 2.2 } });
  // ---------- floors 7-9 ----------
  // DOCK -> 7A magnets + motors (capsule); 9B -> 7C computers (capsule, 2 per 24)
  R.magnets = S.capsule({ id: 'magnets-7A', period: 24, journey: 24, dep: 19.0, col: '#64748b', item: 'box', from: 'dock', to: { floor: 7, x: 1480, h: 1.7 } });
  R.comp7 = S.capsule({ id: 'computer-7C', period: 12, journey: 24, dep: 9.0, col: '#0ea5e9', item: 'computer', from: { floor: 9, x: 2020, h: 1.6 }, to: { floor: 7, x: 2420, h: 1.9 } });
  // DOCK -> 8A silica blanks -> 8D picks up the scrap tote of old injectors -> DOCK ; DOCK -> 9D foam + fabric
  R.silica = S.basket({ id: 'silica', period: 24, journey: 24, dep: 20.0, base: 'dock', start: ['blank', 'blank'],
    stops: [{ floor: 8, x: 1460, drop: 120, dwell: 1.4, unload: ['blank', 'blank'] }, { floor: 8, x: 2930, drop: 120, dwell: 1.4, load: ['scrap'] }] });
  R.foam = S.basket({ id: 'foam-fabric', period: 24, journey: 24, dep: 0.6, base: 'dock', start: ['box', 'box'],
    stops: [{ floor: 9, x: 2880, drop: 130, dwell: 1.4, unload: ['box', 'box'] }] });
  // 8A tiles -> 8E (two fired tiles per 48 s, packed into the ring's tile crate)
  R.tiles = S.basket({ id: 'tiles', period: 48, journey: 48, dep: 26.0, base: { floor: 8, x: 1700, drop: 120 }, start: ['crate'],
    stops: [{ floor: 8, x: 3365, drop: 138, dwell: 1.4, unload: ['crate'] }] });
  // window drones into the 7E east wall: sensors -> 7B, injector sets -> up through H78 to 8D (48 s each, staggered)
  R.sensors7 = S.windowDrone({ id: 'sensors-7E', owner: '7E', floor: 7, wallX: 3750, h: 3.4, side: 1, period: 48, offset: 13, item: 'sensor', col: '#9333ea', to: { floor: 7, x: 2000, h: 2.0 } });
  R.injectors = S.windowDrone({ id: 'injectors-7E', owner: '7E', floor: 7, wallX: 3750, h: 3.9, side: 1, period: 48, offset: 37, item: 'box', col: '#ef4444', to: { floor: 8, x: 3060, h: 1.6 } });

  // Stage-3 gag hook (BRIEF-STAGE2 rule 7): window-drone mishap -> Rube Goldberg chain -> Optimus assemble a gaming PC
  // in 9E -> Elon sits and plays, fire-red DIABLO sign lit (only other allowed text). Neutral stub until stage 3.
  TF.gagHook({ id: 'diablo', P: 192, offset: 49, cycles: 5, room: '9E', trigger: 'Elon slides down the SS, works his way up; last cycle he plays at the PC' });   // P=192=4*LOOP so the tour is a scene loop; cycles=5 keeps g(t=0)=143 outside the 24k active window
})(typeof window !== 'undefined' ? window : globalThis);
