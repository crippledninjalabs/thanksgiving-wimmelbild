# Checkpoint 02: test loop (Elon + Cybercabs over the 8K background)

## Outputs
- `test-loop-4k.mp4`: 3840x2160, 30 fps, 900 frames (30.0 s), H.264 yuv420p, CRF 18, about 16 MB
- `test-loop-preview-1280.mp4`: 1280x720 preview for chat (downscaled from the 4K render)
- `still-8k-frame0.png`: 7680x4320, frame 0, rendered at native 8K
- `contact-sheet-4k-0-7.5-15-22.5s.jpg`: 2x2 sheet of frames taken from the 4K MP4
- `check/mp4_{0,225,450,675,899}.png`: frames pulled from the MP4 to check the loop

## How to re-render
```
python3 render_loop.py --res 4k   --out test-loop-4k.mp4                  # about 1 min on the box
python3 render_loop.py --res 1280 --out test-loop-preview-1280.mp4
python3 render_loop.py --res 8k   --still 0 --out still-8k-frame0.png
python3 render_loop.py --res 1280 --frames 0,450,899 --out-dir frames/    # quick checks
```
All motion is in `paths.json`, in BASE units (1280x720 layout px; x6 for 8K, x3 for 4K). The background comes from `../01b-background-8k/`. Sprites come from `../../layers/elon/` and `../../layers/cybercabs/`. They are scaled once per output resolution with premultiplied-alpha Lanczos, so there are no dark fringes, and are drawn crisp at 8K. Depth order is by y (feet or wheel line). Every sprite has a soft contact shadow.

## Choreography (the whole thing is 30 s periodic, so frame 900 equals frame 0)
- **Cab A (drop-off)**, phase 0 s: enters off the left edge in the DROP-OFF side lane and decelerates to a stop at x=95 (0 to 3 s). The butterfly door opens and closes (3.5 to 6.5 s, 0.25 s crossfade to the door-open sprite). It accelerates away at 7 s, merges into the main road at about x 360, and leaves off the right edge by 17 s.
- **Cab B (through traffic)**, phase 3.5 s: drives the main road edge to edge in 11 s at a constant speed and passes the stopped cab at about 5 s. This shows the side lane keeps the main road free.
- **Cab C and Cab D**: copies of A and B shifted by +15 s, so a drop-off happens every 15 s. Cab C is still exiting at 0 s, which is what makes the loop seamless on the cab side.
- Checks (scripted): at most 2 cabs on screen at any frame. The closest pass is 39 base px apart, centre to centre, with the cabs in adjacent lanes and no sprite overlap. All cabs drive nose-first left to right and stay on the road centrelines.
- **Elon**: works at the right-hand back-wall bench, alternating 2 work poses, from 0 to 6 s. He then makes a 23.6 s supervising walk: down past the GROK wall, out onto the plaza by the road, back, along the back benches, and back to the bench. He stands at the bench for 29.6 to 30 s, then returns to the work pose at frame 0. He is 28 base px tall (168 px at 8K), roughly the height of a bench plus a head.

## Loop verification
- Viewed MP4 frames 898, 899, 0 and 1: Elon is standing at the bench, then working at the same spot. Cab C moves forward one frame's distance. Mean absolute pixel difference between frames 899 and 0 is 1.3/255.
- Viewed 4K and 8K crops: the cabs stop correctly in the lane, the door opens, and the passing cab clears the stopped one. No halos on Elon or the cabs at 8K 1:1.

## Known flaws (honest)
- **Elon likeness and pose**: the sprite is a 3/4 side view, not a strict overhead view. The likeness is "dark-haired man in a black tee and jeans", recognisable mainly from context. The 4-frame walk cycle has weak leg variation, partly hidden by a 2% bob. At 1280 preview size he is only about 28 px tall.
- **Cab perspective**: there are two body views (front 3/4 "DR" for the descending part of the road, rear 3/4 "UR" for the climbing right section). They crossfade between road angles of -8° and +2° (near the bottom-centre of the frame), which can read as a brief morph. Rotation is damped 50% and quantised to 0.5°, so expect slight shimmer on curves. The door-open sprite is a slightly different drawing from the closed one, softened by the 0.25 s crossfade.
- **Lighting**: on the UR (climbing) view the contact shadow is light, so the car can look slightly floating.
- Through traffic and the drop-off happen every 15 s, so the cab pattern repeats twice per loop (by design).
