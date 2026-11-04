# Review log: style sheet 1

## Pass 1 (first build, no references)
- Built the full sheet as a Python-generated SVG (`src/`): line-up, expressions, portal, bots, Cybercab, Optimus, props and palette.
- What was wrong:
  - Elon read as a generic cartoon guy: hairline too low, no forehead.
  - Rick was off-model: hair sat on top of the head, he was too stocky and his coat was short.
  - Lines were too heavy for the show style.
  - The Cybercab was a silver 80s-style coupe.
  - Optimus had a white helmet with a face visor.
  - Rick's portal gun overlapped Elon. The expression labels were hidden.
- Owner feedback: "closer, sorta". Ground it in real references.

## Pass 2 (references in `refs/`, see `refs/SOURCES.md`)
- **Line weight:** all strokes are now ×0.78, closer to the show's thin, even line. Path wobble is up slightly (1.1u).
- **Elon:** rebuilt the head from photos and the show's Elon Tusk:
  - Raised the forehead and gave it a deep M hairline with a centre forelock. Hair is swept back, with low messy tufts.
  - Broader lower face and jaw, thick neck.
  - Big round eyes with heavy lids and dot pupils, sized slightly unevenly.
  - Long one-line nose with a bulb tip, wide thin smirk, deep smile folds.
  - All three expressions and the 3/4 view were redone. Also removed the odd crotch shade on the jeans and the chest print the mug was hiding.
- **Rick:** redrawn to the model sheet:
  - Grey dome with the spike halo behind it, a thin wavy blue unibrow and big uneven eyes.
  - Skinny body, knee-length open coat with green lining, teal sweater, belt with gold buckle.
  - Olive trousers, white socks, black shoes, big grey hand. Portal gun kept and moved clear of Elon.
- **Cybercab:** new silhouette traced by eye from the side-view photo:
  - Teardrop wedge with short overhangs.
  - Big champagne disc wheels, filled wheel wells, black sill.
  - Light bars front and rear.
  - The open version shows the door swung up almost vertical, two dark seats, a centre screen and no wheel. Dropped the dashed arrow callout.
- **Optimus:** all-black glossy egg head, V-taper chest with TESLA wordmark, black waist hub. Arms and legs kept.
- **Layout:** expressions panel made taller with labels clear of the busts. Portal and bots panels shifted. Guides and head ruler updated (Elon = 3.4 heads).

### Still weak after pass 2
- Elon's likeness is "Elon-ish" rather than instant. The face is still a bit round and friendly; the real asymmetric grin and narrower eyes aren't fully there.
- Elon's body is still stiff (straight hanging arms, mitten hands). It doesn't have the show's loose, gangly posing.
- The 3/4 Elon is a cheat: the front face is shifted, not a true turnaround.
- On the pie-carrying Optimus, the head is partly hidden behind the pie and steam.
- On the open Cybercab, the door's inner face still shows the outer skin and glass, and there's no door thickness.
- The portal drips run slightly past the bottom of panel 3.
- Fonts (Patrick Hand / Luckiest Guy) aren't embedded. Machines without them fall back to system fonts.

## Pass 3 (owner feedback: redo Elon, Rick + add Morty, roast turkey only)
- **Elon** was rebuilt from the show's Elon Tusk model (`refs/reid-elon-tusk.png` and the two `rm-*elon-tusk*` refs), without the tusks:
  - Long, rounded-rectangle face with a broad square chin and a tall forehead.
  - Short ash-brown hair: M hairline, small spiky tufts on top, swept highlight.
  - Flat, heavy-lidded eyes sunk in mauve bags, with dot pupils, lines under the eyes and down the cheeks.
  - Long nose with a hooked tip, thin wide mouth.
  - New costume: dark slate blazer with lapels, open white collar, belt with silver buckle, dark trousers, dress shoes.
  - All three expressions and the 3/4 view use the new head.
  - Skin and hair colours changed to the show values, which also updates those two palette swatches.
- **Rick** was redrawn to the Starburns line-up sheet:
  - Tall, narrow head (wider at the top).
  - 12 broad spikes radiating all around, behind the head.
  - Single wavy unibrow and forehead wrinkles, big uneven round eyes with tiny pupils.
  - Drool-line frown, cheek and under-eye wrinkles.
  - Knee-length open lab coat, long hanging arms with big hands. The portal gun is lowered in his right hand.
- **Morty** was added next to Rick at about 0.71 of Rick's height (taken from the model sheet): round head, brown hair cap, round eyes, small frown, yellow tee, navy jeans, white shoes.
- **Roast turkey:** breast up, with both drumsticks side by side at the cavity end (the far one higher, both with frills) and the wing tucked low at the neck end.
- **Layout:** line-up re-spaced (Elon 265 / 625, Rick 1020, Morty 1325). Eye-line guide moved to Elon's new eye height. The `rick-portal` crop was widened to include Rick and Morty.

### Still weak after pass 3
- Elon reads as "the show's Elon" at sheet size. In close-up he looks older and more haggard than real Elon: the bags and wrinkles are copied from Tusk and may be too strong. I have not checked this with anyone.
- Elon's front pose is still stiff and symmetric (arms straight down). The 3/4 body is a cheat: the front body with each half squashed/stretched horizontally, so stroke widths vary slightly on the far side.
- Rick's hair spikes are a regular star rather than the show's slightly swept clumps. His head is a bit small for the long coat.
- Rick's lowered portal gun is small and partly hidden by his hand.
- Morty is a simple front view only, with no expression variants.
- The palette panel still shows the pass-2 "Tee black", "Denim" and "Stitch gold" swatches. These are no longer used by Elon. I left them because the palette was approved; blazer, shirt and trouser colours should be swapped in if the owner agrees.
- Guide labels on the left of panel 1 ("shoulders", "hem / hip") are partly covered by Elon's front figure.
- Fonts are still not embedded.
