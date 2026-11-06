# Scene shell REVIEW

Start: Thu Nov 5 ~1:32 PM MST (Claude tries); finish: Thu Nov 5 4:57 PM MST (Projects Thing completed from saved modules after Claude hung).

Frame: 7680×4320 viewBox (authored 3840×2160, scale 2).

## What's in
- Full SPACEX cutaway R01–R23 with doors, mid-use props, gravy/pie/egg chain props
- Tower + crane crate mid-drop, QD/FD hose, chopsticks
- Rocket cutaway D1–D5 + LT/HT + nose feather fan mid-unfold
- Flame trench steam, Cybercab stop (door ajar, clamp mid-snap), turkey pen (nest/tree/pumpkins, no birds)
- Portals as empty coloured rings; sky satellites / far ship / trails
- 224 motion cue groups; every listed region has cues
- No characters

## Weak spots
- Pad/tower/pen were finished by Projects Thing in one pass to unblock after Claude api-request hang — denser prop gags on the far-right pad can still be enriched
- A few intentional floor overlaps (gravy pools, yolk, conveyor puddle) called out by check.py
- R06 ceiling prop flagged outside room bounds
- One empty cue group remains
- Claude never wrote RESULT itself; this packaging is post-hang

## Open
python3 -m http.server 8765   # from tw-repo
then http://127.0.0.1:8765/scene-shell/
