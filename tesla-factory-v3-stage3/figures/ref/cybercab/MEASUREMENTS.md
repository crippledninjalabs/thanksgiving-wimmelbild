# Cybercab measurements (traced from photo 05, side view, car faces right; 3464 x 2309 px original)

Method: gridded crops (`tools/refgrid.py`) read by eye at 0.35-0.9x zoom. Readings are ±10-20 px.
The photo is slightly off-axis: the ground through both tyre contact points slopes 35 px over the wheelbase (≈1.2°). That tilt is removed in the conversion.
Metres assume an overall length of 4.3 m. This is NOT measured; only ratios come from the photo.
The drawing table is `CAB_PX` in `js/vehicles.js`, in these same photo pixels.

| Item | Photo px | ÷ wheelbase (1729 px) | metres (L = 4.3 assumed) |
|---|---|---|---|
| Rear wheel centre / tyre r | (877, 1478), r 257 | — | x -1.353 |
| Front wheel centre / tyre r | (2606, 1520), r 250 | — | x +1.385 |
| Wheelbase | 1729 | 1.000 | 2.74 |
| Tyre radius (mean) | 253.5 | 0.147 | 0.40 (dia 0.80 ≈ 55% of height) |
| Aero disc radius | ≈216 (431 dia rear) | 0.125 (0.85 × tyre) | 0.34 |
| Arch (gap) radius | ≈270 | 1.07 × tyre | |
| Tail (rear extreme) x | 374 | rear overhang 0.290 | |
| Nose (front extreme) x | 3089 | front overhang 0.280 | |
| Overall length | 2715 | 1.570 | 4.30 |
| Roof peak | (1640, 840); ground there 1746 | height 0.524 | 1.44 |
| Roofline to tail (fastback) | (1450,855) (1252,886) (997,952) (752,1019) (497,1102) | nearly straight, slightly convex | |
| Tail top corner (crisp) | (374, 1141) | height 0.355 | 0.56 |
| Tail cut | vertical from 1141 to ≈1450, black lower bumper below 1405, rear bottom corner (410, 1600) | | |
| Windshield / A-pillar | roof (2028, 872) → (2120, 938) → (2250, 1058) → cowl (2417, 1139); A-pillar line (2028, 869)-(2283, 1167) | | |
| Hood → nose | (2600,1162) (2750,1192) (2900,1265) (3010,1330) nose (3089, 1400-1480) | | |
| Door glass | top under the roof (1440..2010, ≈880-900), beltline (1398,1066)-(2262,1162) | | |
| Rear quarter glass | sharp rear point (997, 985), top along roof to (1365, 893), bottom edge to (1385, 1062) | | |
| Door rear seam | (1436, 896) → (1371, 1055) → (1514, 1515) | | |
| Door front cut | cowl (2283, 1167) → arch (2428, 1344), then follows the front arch down to the sill | | |
| Shoulder crease | tail corner (374,1141) → (1600,1158) → (2300,1168) → (2980,1318) | | |
| Sill (black band) | top ≈1530, body bottom ≈1590-1600 | clearance ≈0.08 WB | ≈0.2 m |
| Front lower black trim | nose x > 2955, below ≈1470 | | |
| Front light bar | along the hood edge (2885,1328)-(3062,1362) | | |
| Rear red light | thin strip at the tail top (374,1150)-(470,1160) | | |

## Door (photo 01: car faces left, open door; front wheel centre (905, 1895), tyre r ≈ 303)
- The pivot region is where the open door meets the body, near the cowl at (1090-1170, 1470-1600). That is ≈0.74 r behind and ≈1.19 r above the front wheel centre. Mapped to photo 05, the **hinge is at (2310, 1200)**, on the door front cut line just behind the cowl.
- Open door in photo 01: hinge → top ≈ (2050, 100), so the door stands steep, ≈33° from vertical.
  - In 3D the door also swings outward, and a 2D side view can't show that.
  - The drawing uses a rigid 2D rotation of **80° (1.4 rad)** about the fixed hinge. The rear edge rises, and the door ends steep with its top ≈2.3 m up, just behind/over the front wheel.
- The door piece is the body silhouette clipped by the seam region, so its edges are exactly the body's edges and seams.

## Colours (mean of 24x24 px patches, photo 05, warm low sun)
| Sample | px | hex |
|---|---|---|
| Door mid (sunlit) | (1900,1350) | #daaa64 |
| Door low | (1900,1480) | #ce9d58 |
| Rear haunch (lit) | (700,1200) | #efc686 |
| C-pillar | (800,1060) | #d5af76 |
| Disc outer / inner | (877,1300) / (950,1420) | #f9d08c / #ecb66b |
| Tyre | (877,1250) | #37302b |
| Sill | (1900,1580) | #262625 |
| Glass | (1700,1000) | #040303 |

Flat palette used (`style.js` → `cybercab.col`):
- body #d6a964, highlight band #ecc98f, shadow #c39352, outline #7a5a2a
- trim #262625, glass #15181b, tyre #2c2724
- disc #e4c286 (ring #bf9a5e), cap #b98d4f

## Plan (top) view — estimated, not measured
- Width ≈1.97 m (max half-width 0.985 m over the front wheels / A-pillars), so length:width ≈ 4.3 : 1.97.
  - This is an eye estimate from the overhead 3/4 photos 13 and 12, which are perspective-distorted.
  - No true top view or front view was measured.
- Taper: half-width 0.985 at the front axle (x +1.39), 0.945 at x 0, 0.85 at the rear axle (x -1.35), and 0.45 at the tail-cut corners.
  - The rear tail is a short, slightly rounded flat cut. The rear track is drawn ~0.13 m narrower than the front.
- Photo 13 drives the roof layout:
  - The dark windshield wraps over the front of the roof and ends in a curve near the B-pillar (x ≈ -0.4).
  - The rear roof and fastback deck are body gold with a centre seam. There is no rear window.
- The table is `V.cybercab.plan` in `js/vehicles.js`.
