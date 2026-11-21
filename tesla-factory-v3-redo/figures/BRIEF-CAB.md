# Cybercab REDO from real photos (owner verdict on current drawing: "it looks like a broken piece of crap")

Redraw ONLY the Cybercab (js/vehicles.js Cybercab parts, its clip in js/clips.js / anims, its sheet + mp4). Keep the module API and the look/motion split. Don't touch other figures. No git.

## Reference photos (open and STUDY them; they are real Cybercabs from Wikimedia Commons, list in ref/cybercab/SOURCES.md)
- PRIMARY side profile, doors closed, production car driving: ref/cybercab/05-Tesla_Cybercab_-_San_Francisco_-_June_2026.jpg (car faces RIGHT)
- Side profile, door OPEN: ref/cybercab/01-Tesla_Cybercab_at_Santana_Row_side_view_dllu.jpg (car faces LEFT; shows hinge + open-door angle)
- 3/4 views: 02 (oblique, door open), 09 (driving on I-280), 10/12/13 (doors up), 11 (rear 3/4 with rear light bar), 15 (front with light bar).

## Method — trace, don't guess
1. Measure from photo 05 with python3/PIL (load it, sample pixels, find wheel centres/radii, ground line, roof outline, etc.). Express every key point as a fraction of wheelbase: front/rear overhang, wheel diameter (tyre incl.) and aero-disc diameter, roof peak position + height, windshield base point, A-pillar line, roofline arc down to the tail, tail height and tail cut angle, beltline/side-window shape (the small side glass with a sharp rear point), door cut lines (front edge just behind front wheel arch, rear edge curve), black lower sill band and black lower front/rear bumper trim, rear haunch over the rear wheel, front light bar position, rear red light bar (thin strip across the tail).
   Write these measurements into ref/cybercab/MEASUREMENTS.md (with the pixel values you used) and drive the drawing from them (a points table in style.js or vehicles.js).
2. Door: from photo 01 (and 02/10/13), work out the real hinge: where the door pivots (near the A-pillar/cowl – top-front of the door) and its fully open angle (door swings UP and FORWARD, ending steep, top over the front wheel). In side view model it as ONE rigid polygon (gold outer skin + glass window + dark inner frame edge) rotating about a FIXED hinge point by angle θ(t) eased 0→θmax→0; the door opening in the body (dark cabin aperture with a hint of seat) is revealed behind it. No warping, no gaps between door and body when closed (door polygon shares the body's cut lines exactly).
3. Colour: sample the real champagne gold from photos 05/09 (sunlit and shade) and set a 3-tone flat palette (base, light highlight band, shadow) + black trim + dark glass + tyre black + aero disc gold (slightly lighter/flatter than body, with a small centre cap). Record hex values in MEASUREMENTS.md.
4. Style: flat v2-friendly (solid fills, one thin darker outline, a single soft highlight band), CLEAN and SOLID: no broken-looking gaps, no overlapping panels poking through, no wobbly paths. Use smooth bezier curves fitted to the measured points.
5. Driving: wheels (aero discs) rotate with distance — since discs are plain, show rotation with a subtle off-centre mark or the centre cap detail; slight suspension bob ok.

## Deliverables
- Updated out/cybercab-sheet.png: big side view (closed), door half-open and fully open (3 states), driving strip, plus a front-ish light-bar detail is optional.
- Updated out/cybercab-drive-doors.mp4 (seamless loop: drives in, stops, door opens, Optimus or nobody gets in — optional, door closes, drives off).
- NO comparison PNG deliverable (owner said skip it). You may make a private overlay in /tmp to check your fit, but don't save it in out/.
- Re-render out/vehicles-sheet.png and out/overview-sheet.png (they include the Cybercab).
Open your own PNGs and iterate until (checking with a private /tmp overlay) the outline hugs the photo silhouette (wheels, roof, nose, tail within a few % of wheelbase) and the door looks like a real rigid door. Print a short summary with remaining differences.

## OVERRIDING STYLE RULE (owner, latest): ONE CONTINUOUS SILHOUETTE
The owner's main complaint: the old cab "looked like a bunch of pieces that were cut out and pasted together." So:
- Draw the BODY as ONE single closed path: one continuous smooth outline (bezier curves fitted to the measured points; no corners except where the real car has a crisp edge, e.g. the tail cut) going nose -> hood -> windshield -> roof -> fastback -> tail -> rear bumper -> under-body -> front bumper -> nose. Fill it gold, stroke it once.
- Everything else (side glass, windshield/canopy dark band, door seams, black sill band, black lower trim, highlight band, light bars, wheel arches) is layered INSIDE that silhouette as subtle details — clip them to the body path (ctx.clip) so nothing pokes outside or leaves gaps; seams are thin lines, not gaps between shapes. Wheels sit in arches cut cleanly into the silhouette (arch = part of the same outline or drawn as a clean dark arch inside the clip, tyres in front), no visible joins or mismatched edges.
- The open door is the SAME smooth shape cut from the body along its seam: build the door polygon by intersecting/clipping the body silhouette with the door seam path, so its edges exactly match; when rotated about the fixed hinge it's one rigid piece; the aperture left behind is filled with dark cabin + seat hint, edges matching the seam exactly.
- Photo references are for PROPORTIONS only; the look is flat, clean and simple.
