# STAGE 2 brief (Reid approved Nov 20, 3:03 PM)
Build ALL 45 rooms (9 floors x 5) per ../v3-plan/FACTORY-MAP.md in this v3 codebase, reusing the floor-6 kit/engine
(kit.js, biw.js, transports, peeks, actors). Include the ground-floor DOCK/warehouse (truck, forklift, sort table),
the west-core risers (PT, W3, BL, SS) at every floor stop, and the roof drone pad.
Apply the rules from ../NOTES-v3.md (everything from '## Reid 2:36 PM' on) across the WHOLE building:
1. Fewer, busier Optimus: follow FACTORY-MAP §10 (merged loops, never idle, <= ~1.5 s watching per 12 s).
   Reid 3:21 PM: NO dedicated gag robots. 42-gag -> 1E server; feast -> 3B-3C worker; towel -> crew B doing ship chores between gags; Christmas gardening -> yard/lawn utility Optimus. Remove separate gag actors; update FACTORY-MAP §10/§10.1 + CUT-LIST-FOR-REID.md.
2. Sources: every tube capsule, basket and lift item visibly starts at ONE of: (a) DOCK sort table (forklift unloads
   truck pallets), (b) roof drone pad -> tube inlet, (c) a window drone dropping a part into a wall tube opening.
   Empties visibly return. Stagger the three delivery methods on different timers (all periods divide 48 so loops stay seamless).
3. Every vehicle (Model Y bottom half on 5, Cybertruck + Semi on 2, Cybercab GOLD on 4) and every Optimus build (7)
   looks really unfinished early (body-in-white / bare frame, open structure, real openings, no wheels until fitted),
   with parts visibly added at each station. Floor 5 picks up the floor-6 car at L65 tau 10.9.
4. Subtle background life in every room (status LEDs, wisps, cable sway, screens) — subtle, never competing.
5. Upper half of every room filled with overhead flow + staggered peeks (peek system, distinct prime periods, neutral at t=0/48).
6. No scene text except the roof TESLA sign (labels only with ?debug=1).
7. Stage 3 gag HOOK (record in FACTORY-MAP §7 gag table; only animate if cheap): long prime timer; one window drone clips
   the window frame and drops its package -> Rube Goldberg chain -> Optimus assemble a gaming PC -> Elon walks over and
   sits, a fire-red glowing 'DIABLO' sign lights above the PC (only other allowed text, off otherwise), plain screen
   with dark-red glow, no game graphics; he plays a few cycles then returns to his route. Choose an unused prime
   (not 43 47 53 59 61 67 71 73 79 83 89 127) and the room/slot; register a neutral-pose stub if not animated.
NOT in Stage 2: Starship/tower, underground, new themes (their shells stay).
Keep floor 6 exactly as round 4 (only touch it for hand-offs). Everything permanent, pure function of t,
loopcheck/interact/boot must pass for the whole building. Update README.md architecture + FACTORY-MAP to match what is built.
