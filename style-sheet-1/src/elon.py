"""Elon: front, 3/4, and head close-ups. Local coords: feet centre at (0,0), up is -y.

Pass 3: copied from the show's own "Elon Tusk" model (refs/reid-elon-tusk.png,
refs/rm-elon-tusk.jpg, refs/rm-scene-elon-tusk.png), minus the tusks:
long rounded-rectangle face, tall forehead, short swept ash-brown hair with an
M hairline and little tufts on top, heavy-lidded flat eyes sunk in mauve bags,
dot pupils, wrinkle lines under the eyes and down the cheeks, long nose with a
hooked tip, thin wide mouth, broad strong chin. Dark slate blazer, open white
collar, belt, dark trousers.
"""
from lib import *

SKIN, SKIN_S, BLUSH = "#f1d3c3", "#ddb3a3", "#eaa98a"
BAG, LID = "#dcb4b2", "#ebc6bd"
HAIR, HAIR_S, HAIR_H = "#4a3d36", "#352b26", "#6e5d52"
BLZ, BLZ_S, BLZ_H = "#3b4c56", "#2c3a42", "#566a72"
SHIRT, SHIRT_S = "#f4fbfa", "#cfdfe0"
PANTS, PANTS_S = "#2c3d47", "#212e36"
SHOE, SHOE_S = "#2a2320", "#1a1513"
# kept for the approved palette panel (pass-2 costume colours)
TEE, TEE_S, TEE_H = "#34313d", "#25232c", "#4b4857"
DEN, DEN_S, DEN_H, STITCH = "#3a5383", "#2a3c63", "#4d68a0", "#d9a441"
WHITE = "#ffffff"
SOFT = 'opacity="0.5"'  # pass 4: bags + wrinkles at about half strength
I = lambda d: d  # noqa: E731


# ---------------------------------------------------------------- face parts
def show_eye(cx, cy, rx, ry, px, py, lid, lid_r=None, bag=True):
    """Show-style Elon eye: flat white ellipse, heavy lid line (y at left/right
    edge), mauve socket/bag, crease above, bag line + wrinkle under."""
    lr = lid if lid_r is None else lid_r
    o = []
    if bag:
        o.append(fillp(ell(cx, cy + 3, rx + 4, ry + 6), BAG, a=0.3, extra=SOFT))
    lidd = f"M {cx-rx-4},{cy-ry-6} L {cx+rx+4},{cy-ry-6} L {cx+rx+4},{lr} L {cx-rx-4},{lid} Z"
    sh = [f'<circle cx="{px}" cy="{py}" r="3.3" fill="{INK}"/>',
          f'<path d="{lidd}" fill="{LID}"/>',
          f'<path d="M {cx-rx-4},{lid} L {cx+rx+4},{lr}" stroke="{INK}" stroke-width="{sw(4.2)}"/>']
    o.append(part(ell(cx, cy, rx, ry), WHITE, sh, w=3.4, a=0.4))
    o.append(line(f"M {cx-rx+2},{cy-ry-6} C {cx-rx/2},{cy-ry-11} {cx+rx/2},{cy-ry-11} {cx+rx-2},{cy-ry-5}", 2))
    if bag:
        o.append(line(f"M {cx-rx/2},{cy+ry+7} C {cx-rx/6},{cy+ry+11} {cx+rx/6},{cy+ry+11} {cx+rx/2},{cy+ry+6}", 1.8, extra=SOFT))
    return "".join(o)


def brow(d):
    return part(d, HAIR, w=2.6, a=0.4)


def arched_brow(x0, x1, ytop, ybase, thick=7, inner_left=False):
    """Short thick arched brow; inner end (towards nose) slightly lower and heavier."""
    xm = x0 + (x1 - x0) * (0.42 if not inner_left else 0.58)
    return brow(f"M {x0},{ybase} C {x0+(xm-x0)*0.4},{ytop} {xm},{ytop-2} {xm},{ytop-2} "
                f"C {xm+(x1-xm)*0.6},{ytop-1} {x1},{ybase-2} {x1},{ybase+2} "
                f"C {x1-(x1-xm)*0.5},{ytop+thick-2} {xm},{ytop+thick} {xm},{ytop+thick} "
                f"C {x0+(xm-x0)*0.5},{ytop+thick} {x0},{ybase+3} {x0},{ybase} Z")


FACE_F = ("M -78,-828 C -82,-790 -83,-740 -81,-702 C -80,-664 -76,-640 -60,-628 C -44,-621 -20,{c} 0,{c} "
          "C 20,{c} 44,-621 60,-628 C 76,-640 80,-664 81,-702 C 83,-740 82,-790 78,-828 C 68,-874 -68,-874 -78,-828 Z")
HAIR_F = ("M -83,-786 C -90,-822 -86,-858 -66,-878 C -50,-893 -24,-897 0,-895 L 10,-908 L 20,-896 L 34,-906 L 40,-892 "
          "L 58,-896 L 54,-884 C 76,-870 90,-830 83,-790 L 79,-800 C 77,-818 72,-832 64,-842 C 54,-852 44,-860 33,-860 "
          "C 21,-858 9,-852 0,-846 C -9,-851 -21,-858 -34,-860 C -46,-860 -57,-845 -65,-837 C -73,-829 -78,-816 -79,-800 Z")


def _hair(o, dx=0):
    f = (lambda d: shift(d, dx)) if dx else I
    o.append(part(f(HAIR_F), HAIR, [
        (f("M -100,-900 L -50,-900 C -70,-860 -74,-820 -72,-780 L -100,-780 Z"), HAIR_S),
        (f("M -72,-844 C -62,-866 -42,-880 -14,-886 C -38,-874 -54,-860 -62,-838 Z"), HAIR_H),
    ]))
    for d in ("M -52,-860 C -30,-876 0,-882 30,-878", "M 10,-862 C 30,-870 50,-866 66,-852",
              "M -34,-866 C -20,-872 -6,-874 6,-872"):
        o.append(line(f(d), 2.2))


def _ears(o, both=True):
    ear = "M -80,-768 C -96,-774 -100,-744 -93,-730 C -88,-722 -81,-724 -79,-730 Z"
    o.append(part(ear, SKIN, [(ear, SKIN_S)]))
    o.append(line("M -88,-760 C -93,-752 -92,-742 -87,-736", 2.2))
    if both:
        o.append(part(mirror(ear), SKIN))
        o.append(line(mirror("M -88,-760 C -93,-752 -92,-742 -87,-736"), 2.2))


def _face(o, j=0):
    o.append(fillp(ell(0, -812, 80, 66), HAIR, a=0))
    face = FACE_F.format(c=-621 + j)
    shade = (f"M -100,-860 L -66,-830 C -70,-790 -72,-740 -70,-704 C -68,-676 -60,-656 -44,{-642+j} "
             f"C -26,{-632+j} 26,{-632+j} 48,{-640+j} L 90,{-640+j} L 90,-580 L -100,-580 Z")
    hairsh = ("M -84,-806 L -70,-806 C -66,-826 -54,-838 -36,-842 L -2,-830 L 32,-842 C 52,-838 64,-828 70,-806 "
              "L 84,-806 L 84,-900 L -84,-900 Z")
    o.append(part(face, SKIN, [(shade, SKIN_S), (hairsh, SKIN_S)]))


def _nose(o, dx=0):
    o.append(line(shift("M -2,-782 C 2,-764 6,-746 8,-732 C 10,-720 6,-713 -2,-714 C -10,-715 -12,-722 -8,-727", dx), 2.8))
    o.append(line(shift("M -18,-720 C -16,-716 -12,-714 -9,-715", dx), 2))
    o.append(line(shift("M 22,-722 C 20,-717 16,-715 12,-716", dx), 2))


def _lines(o, dx=0, far=1.0):
    """Cheek and under-eye wrinkles from the show model."""
    s = lambda d: shift(d, dx)  # noqa: E731
    o.append(line(s("M -66,-742 C -69,-730 -68,-718 -64,-710"), 1.6, extra=SOFT))  # cheekbone line
    o.append(line(s("M -24,-712 C -34,-700 -38,-690 -38,-680"), 2, extra=SOFT))       # nasolabial (shorter)
    o.append(line(s(f"M 26,-712 C {26+10*far},-700 {26+12*far},-690 {26+12*far},-680"), 2, extra=SOFT))
    o.append(line(s("M -12,-636 C -4,-632 6,-632 14,-636"), 1.8))             # chin


def head_front(expr="smirk", bust=False):
    j = 12 if expr == "laugh" else 0
    o = []
    if bust:
        o.append(_bust())
    _ears(o)
    _face(o, j)
    if expr == "smirk":
        o.append(show_eye(-36, -760, 28, 16, -27, -757, lid=-764, lid_r=-766))
        o.append(show_eye(37, -758, 27, 15, 48, -755, lid=-765, lid_r=-762))
        o.append(arched_brow(-64, -12, -806, -790))
        o.append(arched_brow(12, 64, -812, -796, inner_left=True))
        _nose(o)
        _lines(o)
        o.append(line("M -42,-664 C -20,-660 10,-660 30,-664 C 36,-665 42,-668 45,-674", 3))
        o.append(line("M -42,-664 C -45,-664 -47,-667 -46,-670", 2.2))
        o.append(line("M -18,-652 C -6,-649 8,-649 18,-652", 2))
    elif expr == "laugh":
        o.append(fillp(ell(-36, -752, 26, 13), BAG, a=0.3, extra=SOFT))
        o.append(fillp(ell(36, -752, 26, 13), BAG, a=0.3, extra=SOFT))
        o.append(line("M -58,-754 C -48,-770 -24,-770 -14,-754", 4))
        o.append(line("M 14,-754 C 24,-770 48,-770 58,-754", 4))
        o.append(line("M -50,-741 C -40,-736 -30,-736 -22,-741", 1.6, extra=SOFT))
        o.append(line("M 22,-741 C 30,-736 40,-736 50,-741", 1.6, extra=SOFT))
        o.append(arched_brow(-64, -12, -816, -800))
        o.append(arched_brow(12, 64, -818, -802, inner_left=True))
        _nose(o)
        _lines(o)
        mouth = f"M -46,-676 C -20,-682 20,-682 46,-676 C 42,{-648+j} 20,{-636+j} 0,{-636+j} C -20,{-636+j} -42,{-648+j} -46,-676 Z"
        o.append(part(mouth, "#5b1d2b", [
            ("M -50,-690 L 50,-690 L 50,-668 C 20,-671 -20,-671 -50,-668 Z", WHITE),
            ('<path d="M -50,-668 C -20,-671 20,-671 50,-668" fill="none" stroke="%s" stroke-width="%s"/>' % (INK, sw(2))),
            (f"M -22,{-636+j} C -14,{-654+j} 14,{-654+j} 22,{-636+j} Z", "#d9707a"),
        ], w=3))
    elif expr == "focused":
        o.append(show_eye(-36, -758, 28, 14, -34, -754, lid=-760, lid_r=-756))
        o.append(show_eye(37, -758, 27, 14, 36, -754, lid=-756, lid_r=-760))
        o.append(brow("M -66,-788 C -50,-792 -30,-788 -10,-776 L -12,-769 C -30,-780 -48,-784 -64,-781 Z"))
        o.append(brow("M 66,-788 C 50,-792 30,-788 10,-776 L 12,-769 C 30,-780 48,-784 64,-781 Z"))
        o.append(line("M -3,-790 L -4,-776 M 4,-790 L 4,-777", 2))
        _nose(o)
        _lines(o)
        o.append(line("M -34,-664 C -12,-666 12,-666 34,-664", 3))
        o.append(line("M -12,-652 C -4,-650 4,-650 12,-652", 2))
        o.append(part("M 70,-808 C 65,-798 64,-792 70,-789 C 76,-792 75,-798 70,-808 Z", "#cdeeff", w=2))
    _hair(o)
    return "".join(o)


def head_34():
    """Turned ~25 deg to viewer's right, like the reference frame: near cheek
    wider, far eye narrower, nose tip breaks toward the far side."""
    o = []
    _ears(o, both=False)
    o.append(fillp(ell(4, -812, 82, 66), HAIR, a=0))
    face = ("M -78,-828 C -82,-790 -83,-740 -81,-702 C -79,-670 -70,-648 -52,-634 C -36,-624 -10,-621 12,-621 "
            "C 32,-622 50,-630 60,-644 C 70,-660 74,-680 74,-704 C 76,-744 76,-790 70,-830 C 58,-874 -66,-874 -78,-828 Z")
    shade = ("M -100,-860 L -66,-830 C -70,-790 -72,-740 -70,-704 C -68,-676 -60,-656 -40,-642 "
             "C -20,-632 30,-632 56,-642 L 90,-642 L 90,-580 L -100,-580 Z")
    hairsh = ("M -84,-806 L -70,-806 C -66,-826 -54,-838 -30,-842 L 6,-830 L 36,-842 C 52,-838 60,-828 64,-806 "
              "L 84,-806 L 84,-900 L -84,-900 Z")
    o.append(part(face, SKIN, [(shade, SKIN_S), (hairsh, SKIN_S)]))
    o.append(show_eye(-20, -760, 27, 16, -8, -757, lid=-764, lid_r=-766))
    o.append(show_eye(50, -758, 16, 15, 58, -755, lid=-765, lid_r=-762))
    o.append(arched_brow(-48, 4, -806, -790))
    o.append(arched_brow(32, 66, -812, -796, inner_left=True))
    _nose(o, 20)
    o.append(line("M 22,-746 C 26,-736 28,-728 26,-722", 1.6))
    _lines(o, 10, far=0.8)
    o.append(line("M -26,-664 C -2,-660 24,-660 40,-664 C 46,-665 50,-668 52,-674", 3))
    o.append(line("M -26,-664 C -29,-664 -31,-667 -30,-670", 2.2))
    o.append(line("M -4,-652 C 6,-649 18,-649 28,-652", 2))
    _hair(o, 4)
    return "".join(o)


# ---------------------------------------------------------------- body
def _bust():
    """Neck + open collar + blazer shoulders for the expression close-ups."""
    o = [part("M -42,-650 L -44,-596 L 44,-596 L 42,-650 Z", SKIN,
              [("M -50,-680 L 50,-680 L 50,-636 C 10,-626 -10,-626 -50,-636 Z", SKIN_S)])]
    o.append(part("M -48,-616 C -92,-610 -132,-602 -150,-590 L -156,-576 L 156,-576 L 150,-590 "
                  "C 132,-602 92,-610 48,-616 L 30,-576 L -30,-576 Z", BLZ,
                  [("M -170,-620 L -80,-620 L -70,-560 L -170,-560 Z", BLZ_S)]))
    o.append(part("M -46,-620 L 46,-620 L 30,-576 L -30,-576 Z", SHIRT))
    o.append(part("M -26,-626 L 26,-626 L 0,-586 Z", SKIN, [("M -30,-630 L 30,-630 L 30,-616 L -30,-616 Z", SKIN_S)], w=0, outline=False))
    o.append(line("M -26,-622 L 0,-588 L 26,-622", 2.4))
    for f in (I, mirror):
        o.append(part(f("M -42,-632 L -26,-622 L -6,-590 L -46,-600 Z"), SHIRT, [(f("M -50,-604 L -40,-604 L -40,-596 L -50,-596 Z"), SHIRT_S)], w=3))
        o.append(part(f("M -50,-614 L -32,-578 L -62,-578 L -70,-600 Z"), BLZ_H, w=3))
    return "".join(o)


def _leg(f):
    leg = "M -104,-404 L -4,-404 L -4,-320 C -10,-250 -14,-150 -16,-36 L -94,-36 C -100,-160 -106,-300 -104,-404 Z"
    o = [part(f(leg), PANTS, [(f("M -130,-410 L -74,-410 C -78,-260 -76,-160 -72,-30 L -130,-30 Z"), PANTS_S)])]
    o.append(line(f("M -56,-330 C -56,-240 -56,-140 -55,-44"), 1.8, "#4a5c66"))
    o.append(line(f("M -94,-60 C -70,-54 -40,-54 -18,-60"), 2))
    shoe = "M -96,-38 L -16,-38 C -12,-24 -10,-12 -12,-2 C -12,3 -30,5 -56,5 C -86,5 -104,2 -104,-6 C -104,-18 -100,-30 -96,-38 Z"
    o.append(part(f(shoe), SHOE, [(f("M -110,-10 L -6,-10 L -6,10 L -110,10 Z"), SHOE_S),
                                  (f(ell(-52, -24, 16, 5)), "#4a3f3a")]))
    return "".join(o)


def _torso():
    o = [part("M -50,-622 L 50,-622 L 52,-396 L -52,-396 Z", SHIRT,
              [("M -60,-630 L -24,-630 L -20,-390 L -60,-390 Z", SHIRT_S)])]
    o.append(part("M -26,-626 L 26,-626 L 0,-588 Z", SKIN, outline=False))
    o.append(line("M -26,-622 L 0,-588 L 26,-622", 2.4))
    for y in (-560, -510, -460):
        o.append(dot(0, y, 2.4, "#c7d3d4", f'stroke="{INK}" stroke-width="0.8"'))
    o.append(part("M -52,-410 L 52,-410 L 52,-392 L -52,-392 Z", "#1f1c1b", w=3))
    o.append(part("M -12,-412 L 12,-412 L 12,-390 L -12,-390 Z", "#c9ced2", [("M -14,-402 L 14,-402 L 14,-388 L -14,-388 Z", "#9aa1a6")], w=2.4))
    return "".join(o)


def _blazer_half(f):
    o = []
    half = ("M -46,-624 C -90,-618 -124,-610 -142,-594 C -150,-560 -140,-500 -128,-456 C -124,-420 -128,-380 -132,-340 "
            "C -100,-332 -52,-334 -20,-346 L -18,-470 C -28,-520 -38,-570 -46,-624 Z")
    o.append(part(f(half), BLZ, [(f("M -170,-630 L -104,-630 C -114,-540 -114,-440 -100,-320 L -170,-320 Z"), BLZ_S)]))
    lapel = "M -46,-624 L -18,-470 C -30,-500 -46,-530 -60,-552 L -74,-566 L -62,-578 L -70,-600 Z"
    o.append(part(f(lapel), BLZ_H, w=3))
    o.append(line(f("M -112,-470 L -70,-470"), 2))   # pocket flap
    o.append(line(f("M -120,-380 L -66,-380"), 2))
    o.append(part(f("M -46,-632 L -28,-622 L -14,-594 L -48,-604 Z"), SHIRT, w=3))
    return "".join(o)


def _sleeve(f):
    o = [part(f("M -142,-594 C -166,-580 -172,-540 -176,-490 C -180,-440 -180,-400 -178,-366 L -140,-362 "
                "C -140,-410 -138,-470 -132,-540 Z"), BLZ, [(f("M -200,-600 L -158,-600 L -160,-360 L -200,-360 Z"), BLZ_S)])]
    o.append(line(f("M -158,-450 C -154,-442 -148,-438 -142,-438"), 2))
    o.append(part(f("M -178,-368 L -140,-364 L -141,-354 L -178,-358 Z"), SHIRT, w=3))
    hand = shift("M -182,-396 C -188,-378 -186,-354 -173,-345 C -163,-339 -150,-343 -146,-353 "
            "C -143,-364 -143,-380 -147,-394 Z", 4, 40)
    o.append(part(f(hand), SKIN, [(f("M -200,-360 L -166,-360 C -168,-340 -166,-320 -158,-298 L -200,-298 Z"), SKIN_S)]))
    for x in (-172, -164, -156):
        o.append(line(f(f"M {x+4},-328 C {x+3},-320 {x+4},-314 {x+6},-310"), 2.2))
    return "".join(o)


def _neck():
    return part("M -42,-656 L -44,-610 C -26,-600 26,-600 44,-610 L 42,-656 Z", SKIN,
                [("M -50,-666 L 50,-666 L 50,-640 C 10,-630 -10,-630 -50,-640 Z", SKIN_S)])


def _arm(pts, hand=True, gesture=False):
    """Bent blazer arm as a fat stroked polyline (shoulder, elbow, wrist):
    ink outline, blazer fill, white cuff, then hand (open palm) or nothing
    (hand tucked in a pocket)."""
    d = "M " + " L ".join(f"{x},{y}" for x, y in pts)
    cap = 'stroke-linecap="round" stroke-linejoin="round" fill="none"'
    o = [f'<path d="{d}" stroke="{INK}" stroke-width="{sw(52)}" {cap}/>',
         f'<path d="{d}" stroke="{BLZ}" stroke-width="{sw(44)}" {cap}/>',
         f'<path d="{d}" stroke="{BLZ_S}" stroke-width="{sw(14)}" {cap} transform="translate(-7,2)" opacity="0.6"/>']
    (ex, ey), (wx, wy) = pts[-2], pts[-1]
    import math
    a = math.degrees(math.atan2(wy - ey, wx - ex))
    cuff = g(part("M -8,-17 L 8,-17 L 8,17 L -8,17 Z", SHIRT, w=3), f"translate({wx},{wy}) rotate({a:.1f})")
    if hand and gesture:
        palm = ("M 0,-16 C 14,-22 34,-22 46,-14 C 52,-10 50,-2 42,0 L 54,4 C 60,8 56,16 48,16 "
                "C 30,18 10,18 0,14 Z")
        hd = part(palm, SKIN, [("M -4,6 L 60,6 L 60,24 L -4,24 Z", SKIN_S)], w=4)
        hd += line("M 22,-14 L 44,-8 M 20,-4 L 42,2", 1.8)
        o += [g(hd, f"translate({wx},{wy}) rotate({a:.1f})"), cuff]
    else:
        o.append(cuff)
    return "".join(o)


def elon_front():
    """Relaxed contrapposto: weight on his right leg (viewer's left), left leg
    eased out, right hand gesturing palm-up, left hand in trouser pocket,
    upper body leaning 2 deg, head tilted 6 deg."""
    relaxed = g(_leg(mirror), "rotate(-5,52,-404)")
    upper = [_neck(), _torso(), _blazer_half(I), _blazer_half(mirror),
             _arm([(140, -584), (170, -470), (112, -398)], hand=False),          # hand in pocket
             line("M 92,-406 C 104,-396 118,-390 132,-392", 3),                  # pocket slit
             _arm([(-140, -584), (-176, -466), (-214, -540)], gesture=True),     # gesturing
             g(head_front("smirk"), "rotate(-6,0,-640)")]
    return "".join([relaxed, _leg(I), g("".join(upper), "rotate(-2,0,-400)")])


def elon_34():
    """True 3/4 (about 40 deg) turned to the viewer's right, drawn with its own
    shapes: centre line at x=28, near (his right) half wide, far half narrow,
    far arm mostly behind the body, feet pointing toward the turn, far foot
    set higher for depth."""
    o = []
    # far leg + shoe (behind, darker, higher)
    o.append(part("M 22,-404 L 96,-404 C 98,-300 96,-160 94,-50 L 32,-50 C 30,-160 26,-300 22,-404 Z", PANTS_S))
    o.append(part("M 32,-52 L 94,-52 C 108,-40 124,-30 130,-20 C 132,-12 112,-10 80,-10 C 50,-10 26,-12 26,-20 "
                  "C 26,-32 28,-44 32,-52 Z", SHOE, [("M 20,-22 L 140,-22 L 140,0 L 20,0 Z", SHOE_S)]))
    # near leg + shoe
    o.append(part("M -86,-404 L 26,-404 L 22,-320 C 16,-240 10,-150 6,-38 L -72,-38 C -80,-160 -88,-300 -86,-404 Z",
                  PANTS, [("M -120,-410 L -58,-410 C -62,-260 -60,-160 -56,-30 L -120,-30 Z", PANTS_S)]))
    o.append(line("M -30,-330 C -30,-240 -32,-140 -32,-46", 1.8, "#4a5c66"))
    o.append(part("M -74,-40 L 6,-40 C 16,-28 32,-18 40,-8 C 42,2 20,5 -20,5 C -60,5 -80,2 -80,-6 "
                  "C -80,-18 -78,-30 -74,-40 Z", SHOE, [("M -90,-8 L 50,-8 L 50,10 L -90,10 Z", SHOE_S),
                                                       (ell(-20, -24, 16, 5), "#4a3f3a")]))
    # far arm, mostly hidden
    o.append(part("M 92,-596 C 112,-580 118,-540 120,-490 C 122,-440 122,-400 120,-368 L 94,-366 "
                  "C 96,-420 98,-480 96,-540 Z", BLZ_S))
    o.append(part("M 96,-370 L 120,-370 L 121,-358 L 96,-358 Z", SHIRT, w=3))
    o.append(part("M 96,-360 C 92,-344 96,-326 106,-320 C 116,-318 122,-330 121,-358 Z", SKIN_S, w=4))
    # neck, shirt, belt
    o.append(g(_neck(), "translate(26,0)"))
    o.append(part("M 0,-622 L 62,-622 L 64,-396 L 4,-396 Z", SHIRT, [("M 40,-630 L 70,-630 L 70,-390 L 40,-390 Z", SHIRT_S)]))
    o.append(part("M 18,-626 L 58,-626 L 40,-590 Z", SKIN, outline=False))
    o.append(line("M 18,-622 L 40,-590 L 58,-622", 2.4))
    o.append(part("M -60,-410 L 100,-410 L 100,-392 L -60,-392 Z", "#1f1c1b", w=3))
    # far blazer half + lapel
    o.append(part("M 54,-624 C 74,-620 92,-612 102,-596 C 108,-560 104,-500 98,-456 C 96,-420 98,-380 100,-342 "
                  "C 80,-336 50,-340 28,-346 L 36,-470 C 42,-520 48,-570 54,-624 Z", BLZ,
                  [("M 76,-630 L 120,-630 L 120,-330 L 80,-330 Z", BLZ_S)]))
    o.append(part("M 54,-624 L 36,-470 C 42,-500 52,-530 58,-552 L 64,-566 L 58,-578 L 62,-600 Z", BLZ_H, w=3))
    o.append(part("M 52,-632 L 62,-622 L 68,-596 L 50,-604 Z", SHIRT, w=3))
    # near blazer half + lapel (overlaps at the button line)
    o.append(part("M 12,-624 C -40,-620 -100,-612 -128,-594 C -138,-560 -130,-500 -118,-456 C -114,-420 -118,-380 "
                  "-122,-340 C -80,-332 -10,-334 34,-346 L 34,-470 C 24,-520 18,-570 12,-624 Z", BLZ,
                  [("M -160,-630 L -94,-630 C -104,-540 -104,-440 -90,-320 L -160,-320 Z", BLZ_S)]))
    o.append(part("M 12,-624 L 34,-470 C 20,-500 4,-530 -8,-552 L -22,-566 L -10,-578 L -18,-600 Z", BLZ_H, w=3))
    o.append(part("M 12,-632 L 30,-622 L 40,-596 L 8,-604 Z", SHIRT, w=3))
    o.append(dot(28, -440, 5, BLZ_S, f'stroke="{INK}" stroke-width="2"'))
    o.append(line("M -96,-470 L -54,-470", 2))
    o.append(line("M -104,-380 L -50,-380", 2))
    # near arm hangs at the side
    o.append(g(_sleeve(I), "translate(16,0)"))
    o.append(g(head_34(), "translate(22,0)"))
    return "".join(o)
