"""Rick (fan art), his portal gun, and a green portal spitting out a cranberry."""
import math
from lib import *

R_SKIN, R_SKIN_S = "#d8cfc1", "#c0b6a7"
R_HAIR, R_HAIR_S, R_HAIR_H = "#acd8ec", "#8cc0d8", "#d7eef8"
SWEATER, SWEATER_S = "#93d8d2", "#74bfb8"
COAT, COAT_S, COAT_SS = "#f8f8f3", "#d3dbe1", "#bcc7cf"
PANTS, PANTS_S = "#6f5833", "#584526"
SHOE, SHOE_S = "#2c2b30", "#1d1c20"
GUN, GUN_S = "#e2e6e9", "#aab3bb"
P_GLOW, P_LIGHT, P_MID, P_DEEP, P_DARK = "#e4ffb0", "#a8f55a", "#58d63c", "#1f9a3a", "#0d5e26"
CRAN, CRAN_S, CRAN_H = "#c41e3a", "#8a0f27", "#ff7f8f"


def rick_eye(cx, cy, r, px, py):
    d = ell(cx, cy, r)
    return part(d, "#fff", [f'<circle cx="{px}" cy="{py}" r="3.6" fill="{INK}"/>'], w=3.6, a=0.6)


def portal_gun():
    o = []
    # grip (mostly hidden by hand)
    o.append(part("M -236,-404 L -214,-404 L -206,-366 L -228,-362 Z", "#c2c9cf", w=4))
    # glass tube with portal fluid
    tube = "M -292,-444 L -292,-468 C -292,-480 -228,-480 -228,-468 L -228,-444 Z"
    o.append(part(tube, "#e3f7ff", [
        ("M -300,-466 C -280,-460 -250,-470 -220,-462 L -220,-440 L -300,-440 Z", P_MID),
        ("M -300,-466 C -280,-460 -250,-470 -220,-462 L -220,-458 C -250,-466 -280,-456 -300,-462 Z", P_LIGHT),
        f'<circle cx="-270" cy="-452" r="3" fill="{P_GLOW}"/><circle cx="-252" cy="-449" r="2" fill="{P_GLOW}"/>'
        f'<circle cx="-244" cy="-455" r="1.6" fill="{P_GLOW}"/>',
        ("M -286,-474 L -280,-474 L -282,-448 L -288,-448 Z", "#ffffff"),
    ], w=4))
    for x in (-296, -232):
        o.append(part(f"M {x},-472 L {x+8},-472 L {x+8},-442 L {x},-442 Z", "#8c96a0", w=3))
    # body
    body = ("M -300,-446 L -214,-449 C -204,-449 -199,-441 -199,-431 L -199,-413 C -199,-405 -205,-401 -213,-401 "
            "L -300,-403 C -308,-403 -312,-411 -312,-425 C -312,-439 -308,-446 -300,-446 Z")
    o.append(part(body, GUN, [("M -320,-418 L -190,-418 L -190,-390 L -320,-390 Z", GUN_S),
                              ("M -296,-442 L -220,-444 L -220,-439 L -296,-437 Z", "#ffffff")]))
    # little display + dial
    o.append(part("M -290,-433 L -258,-433 L -258,-419 L -290,-419 Z", "#18301f", w=2.4))
    o.append(f'<text x="-274" y="-422.5" font-family="monospace" font-size="9" text-anchor="middle" fill="{P_LIGHT}">C-137</text>')
    o.append(part(ell(-238, -426, 7), "#d6453a", [("M -250,-426 L -226,-426 L -226,-414 L -250,-414 Z", "#a8322a")], w=2.6))
    o.append(line("M -238,-433 L -238,-428", 2))
    # nozzle + glowing tip
    o.append(part("M -312,-437 L -333,-441 C -341,-441 -345,-431 -345,-424 C -345,-417 -341,-407 -333,-407 L -312,-411 Z",
                  "#97a2ac", [("M -350,-420 L -310,-420 L -310,-400 L -350,-400 Z", "#77828c")]))
    o.append(f'<circle cx="-349" cy="-424" r="17" fill="{P_GLOW}" opacity="0.55"/>')
    o.append(part(ell(-348, -424, 8.5), P_LIGHT, [(ell(-346, -426, 3.5), "#ffffff")], w=3))
    return "".join(o)


def rick():
    """Rick per refs/rm-morty-modelsheet.jpg (line-up page) + refs/reid-rick-morty-lineart.png:
    tall narrow head, spiky hair radiating all round behind it, one wavy unibrow,
    big round eyes with tiny pupils, drool-line mouth, wrinkles; long open lab
    coat to the knee, teal sweater, belt, brown trousers. Arms hang long, big
    hands; portal gun held lowered in his right hand."""
    o = []
    cx, cy = 0, -772
    tips = [(-48, -692), (-98, -712), (-132, -766), (-124, -830), (-98, -892), (-40, -934), (22, -926),
            (86, -900), (128, -846), (136, -784), (110, -728), (58, -694)]
    pts = [tips[0]]
    for (x0, y0), (x1, y1) in zip(tips, tips[1:]):
        t = math.atan2((y0 + y1) / 2 - cy, (x0 + x1) / 2 - cx)
        pts.append((cx + 56 * math.cos(t), cy + 90 * math.sin(t)))
        pts.append((x1, y1))
    d = "M " + " L ".join(f"{x:.0f},{y:.0f}" for x, y in pts) + " Z"
    o.append(part(d, R_HAIR, [(ell(-40, -770, 70, 120), R_HAIR_S),
                              ("M -88,-878 L -56,-846 L -62,-842 Z", R_HAIR_H), ("M 20,-914 L 16,-866 L 8,-868 Z", R_HAIR_H),
                              ("M 120,-842 L 76,-818 L 74,-826 Z", R_HAIR_H)], w=4, a=0.5))
    # legs, shoes
    for f in (lambda d: d, mirror):
        o.append(part(f("M -38,-440 L -4,-440 L -8,-34 L -34,-34 Z"), PANTS, [(f("M -60,-450 L -26,-450 L -26,-30 L -60,-30 Z"), PANTS_S)], w=4))
        o.append(part(f("M -36,-36 L -6,-36 C -2,-14 -4,0 -10,2 L -58,2 C -68,2 -70,-8 -62,-14 C -52,-20 -42,-24 -36,-36 Z"), SHOE,
                      [(f(ell(-36, -10, 10, 4)), "#4a494e")], w=4))
    # sweater + belt
    o.append(part("M -40,-668 C -24,-672 24,-672 40,-668 L 44,-430 L -44,-430 Z", SWEATER, [("M -60,-680 L -18,-680 L -22,-420 L -60,-420 Z", SWEATER_S)], w=4))
    o.append(part("M -44,-440 L 44,-440 L 44,-426 L -44,-426 Z", "#2a2826", w=3))
    o.append(part("M -8,-442 L 8,-442 L 8,-424 L -8,-424 Z", "#c9a24a", [("M -4,-438 L 4,-438 L 4,-428 L -4,-428 Z", "#2a2826")], w=2.4))
    # neck
    o.append(part("M -14,-704 L -15,-664 L 15,-664 L 14,-704 Z", R_SKIN, [("M -20,-708 L 20,-708 L 20,-690 L -20,-690 Z", R_SKIN_S)], w=3.6))
    o.append(line("M -20,-668 C -8,-660 8,-660 20,-668", 2.4))
    # long open lab coat halves + sleeves + big hands
    coat = ("M -16,-680 C -40,-678 -62,-672 -72,-662 C -80,-600 -84,-500 -88,-400 C -92,-330 -98,-270 -104,-212 "
            "L -38,-212 C -40,-300 -40,-380 -36,-450 C -32,-540 -28,-620 -16,-680 Z")
    sleeve = ("M -72,-662 C -86,-644 -92,-590 -96,-520 C -100,-460 -104,-400 -106,-346 L -82,-342 "
              "C -80,-400 -78,-460 -76,-520 C -74,-580 -70,-620 -60,-650 Z")
    hand = ("M -106,-348 C -112,-334 -114,-320 -112,-306 L -114,-276 C -114,-271 -109,-271 -108,-276 L -104,-300 L -104,-270 "
            "C -104,-265 -98,-265 -98,-270 L -96,-298 L -92,-272 C -91,-267 -86,-268 -86,-273 L -88,-302 L -82,-282 "
            "C -81,-278 -76,-279 -77,-284 L -80,-312 C -78,-322 -80,-334 -82,-344 Z")
    for k, f in enumerate((lambda d: d, mirror)):
        o.append(part(f(coat), COAT, [(f("M -38,-212 C -42,-280 -44,-330 -44,-380 L -80,-212 Z"), "#cfe2c9"),
                                     (f("M -130,-690 L -84,-690 C -92,-520 -96,-360 -100,-200 L -130,-200 Z"), COAT_S)], w=4))
        o.append(line(f("M -16,-680 C -34,-672 -42,-660 -40,-640 C -38,-620 -36,-590 -34,-566"), 2.6))
        o.append(line(f("M -40,-640 L -30,-636"), 2.6))
        o.append(line(f("M -84,-360 L -50,-360 L -50,-322"), 2.2))
        o.append(part(f(sleeve), COAT, [(f("M -110,-670 L -88,-670 L -96,-340 L -110,-340 Z"), COAT_S)], w=4))
        o.append(part(f("M -106,-350 L -82,-346 L -82,-336 L -107,-340 Z"), SWEATER, w=3))
        if k == 0:  # gun hangs from his right hand, nozzle down
            o.append(f'<g transform="translate(-94,-312) rotate(-90) translate(225,392) scale(0.9)">{portal_gun()}</g>')
        o.append(part(f(hand), R_SKIN, [(f("M -94,-352 L -76,-352 L -76,-260 L -90,-260 Z"), R_SKIN_S)], w=3.2))
    # pens
    o.append(part("M -66,-602 L -70,-574 L -58,-574 L -55,-600 Z", "#2a6fd6", w=2.2, a=0.3))
    o.append(part("M -58,-606 L -60,-574 L -48,-574 L -47,-604 Z", "#e2453c", w=2.2, a=0.3))
    o.append(line("M -78,-580 L -44,-580 L -45,-548 L -78,-548", 2.2))
    # head: tall narrow, wider at the cranium
    for f in (lambda d: d, mirror):
        o.append(part(f("M -46,-766 C -60,-770 -62,-744 -54,-734 C -50,-728 -45,-730 -44,-736 Z"), R_SKIN, w=3.2))
        o.append(line(f("M -52,-760 C -56,-752 -55,-744 -51,-740"), 2))
    face = ("M -48,-764 C -54,-808 -42,-848 0,-850 C 42,-848 54,-808 48,-764 C 46,-738 42,-716 34,-702 "
            "C 24,-688 12,-684 0,-684 C -12,-684 -24,-688 -34,-702 C -42,-716 -46,-738 -48,-764 Z")
    o.append(part(face, R_SKIN, [("M -80,-860 L -32,-860 C -42,-810 -44,-760 -38,-720 C -32,-700 -18,-690 0,-690 L 0,-670 L -80,-670 Z", R_SKIN_S)], w=4))
    # forehead wrinkles + single wavy unibrow
    o.append(line("M -24,-826 C -10,-830 10,-830 24,-826", 1.8))
    o.append(line("M -16,-818 C -6,-820 6,-820 16,-818", 1.6))
    o.append(part("M -42,-792 C -32,-804 -14,-804 -4,-796 C 6,-806 28,-808 42,-796 L 41,-790 "
                  "C 28,-801 8,-798 -4,-790 C -14,-797 -30,-797 -41,-786 Z", R_HAIR, w=2.8))
    # big round eyes, tiny pupils, slightly uneven
    o.append(part(ell(-19, -764, 19), "#fff", [f'<circle cx="-17" cy="-763" r="2.8" fill="{INK}"/>'], w=3.4, a=0.6))
    o.append(part(ell(19, -762, 17), "#fff", [f'<circle cx="17" cy="-761" r="2.8" fill="{INK}"/>'], w=3.4, a=0.6))
    o.append(line("M -34,-740 C -26,-735 -16,-735 -8,-740", 1.8))
    o.append(line("M 8,-740 C 16,-735 26,-735 32,-740", 1.8))
    # nose with hook, cheek wrinkles
    o.append(line("M 1,-768 C 0,-756 -3,-744 -5,-736 C -7,-728 -2,-725 4,-727", 2.4))
    o.append(line("M -30,-736 C -34,-724 -32,-712 -26,-704", 1.8))
    o.append(line("M 30,-736 C 34,-724 32,-712 26,-704", 1.8))
    # drool-line mouth: flat wavy frown, drool hanging from his right corner
    o.append(line("M -22,-708 C -14,-711 -6,-709 0,-710 C 8,-711 16,-710 22,-705", 2.8))
    o.append(line("M -8,-698 C -2,-696 4,-696 8,-698", 1.6))
    o.append(part("M -21,-707 C -23,-700 -23,-692 -21,-686 C -19,-682 -15,-685 -17,-692 C -18,-698 -17,-704 -17,-707 Z",
                  "#dff3fa", w=1.6, a=0.3))
    return "".join(o)


M_SKIN, M_SKIN_S = "#f6d3b3", "#e3b996"
M_HAIR, M_HAIR_S = "#8a5a2e", "#6d4522"
M_SHIRT, M_SHIRT_S = "#f4e85a", "#dccf3e"
M_JEANS, M_JEANS_S = "#2d4372", "#22345a"
M_SHOE = "#e6e6e3"


def morty():
    """Morty per refs/rm-morty-modelsheet.jpg: big round head (~0.71 of Rick's
    height overall), short brown hair cap, round eyes with dot pupils, tiny nose
    hook, small frown, yellow tee, navy jeans, white shoes."""
    o = []
    for f in (lambda d: d, mirror):
        o.append(part(f("M -36,-306 L -3,-306 L -6,-26 L -32,-26 Z"), M_JEANS, [(f("M -50,-310 L -26,-310 L -26,-20 L -50,-20 Z"), M_JEANS_S)], w=4))
        o.append(part(f("M -34,-28 L -6,-28 C -2,-12 -4,0 -10,2 L -48,2 C -58,2 -60,-8 -52,-14 C -44,-18 -38,-20 -34,-28 Z"), M_SHOE,
                      [(f(ell(-30, -6, 14, 4)), "#c9c9c5")], w=3.6))
        # arm + hand
        o.append(part(f("M -58,-410 C -62,-380 -62,-340 -60,-300 L -44,-300 C -44,-340 -42,-380 -40,-410 Z"), M_SKIN,
                      [(f("M -70,-420 L -54,-420 L -54,-290 L -70,-290 Z"), M_SKIN_S)], w=3.4))
        o.append(part(f("M -60,-304 C -64,-292 -62,-278 -54,-274 C -46,-272 -42,-280 -43,-292 L -44,-304 Z"), M_SKIN, w=3.2))
    o.append(part("M -12,-492 L -12,-466 L 12,-466 L 12,-492 Z", M_SKIN, [("M -20,-496 L 20,-496 L 20,-480 L -20,-480 Z", M_SKIN_S)], w=3.4))
    tee = ("M -14,-474 C -34,-472 -52,-466 -60,-456 L -70,-404 L -46,-400 L -44,-420 C -44,-380 -44,-340 -42,-300 "
           "L 42,-300 C 44,-340 44,-380 44,-420 L 46,-400 L 70,-404 L 60,-456 C 52,-466 34,-472 14,-474 C 8,-466 -8,-466 -14,-474 Z")
    o.append(part(tee, M_SHIRT, [("M -80,-480 L -28,-480 C -32,-420 -32,-360 -26,-296 L -80,-296 Z", M_SHIRT_S)], w=4))
    o.append(line("M -16,-472 C -8,-462 8,-462 16,-472", 2.2))
    # head
    for f in (lambda d: d, mirror):
        o.append(part(f("M -72,-560 C -86,-564 -88,-540 -80,-530 C -76,-524 -70,-526 -69,-532 Z"), M_SKIN, w=3.2))
    face = ("M -74,-566 C -76,-612 -42,-636 0,-636 C 42,-636 76,-612 74,-566 C 72,-520 44,-490 0,-490 "
            "C -44,-490 -72,-520 -74,-566 Z")
    o.append(part(face, M_SKIN, [("M -90,-620 L -54,-620 C -64,-580 -62,-530 -40,-504 C -24,-494 -10,-494 0,-494 L 0,-480 L -90,-480 Z", M_SKIN_S)], w=4))
    hair = ("M -78,-548 C -86,-606 -50,-648 0,-648 C 50,-648 86,-606 78,-548 C 74,-570 64,-590 46,-598 "
            "C 24,-606 -24,-606 -46,-598 C -64,-590 -74,-570 -78,-548 Z")
    o.append(part(hair, M_HAIR, [("M -100,-660 L -40,-660 C -60,-630 -70,-600 -72,-540 L -100,-540 Z", M_HAIR_S)], w=4))
    o.append(part(ell(-20, -560, 19), "#fff", [f'<circle cx="-18" cy="-560" r="2.8" fill="{INK}"/>'], w=3.4, a=0.5))
    o.append(part(ell(20, -560, 19), "#fff", [f'<circle cx="18" cy="-560" r="2.8" fill="{INK}"/>'], w=3.4, a=0.5))
    o.append(line("M 2,-536 C 7,-534 7,-528 2,-527", 2))
    o.append(line("M -11,-508 C -6,-513 6,-513 11,-508", 2.6))
    return "".join(o)


# ---------------------------------------------------------------- portal
def _blob(cx, cy, rx, ry, wob_amp, seed, n=72):
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        r = 1 + wob_amp * (0.55 * math.sin(7 * t + seed) + 0.35 * math.sin(13 * t + 2 * seed) + 0.2 * math.sin(3 * t - seed))
        pts.append((cx + rx * r * math.cos(t), cy + ry * r * math.sin(t)))
    # Catmull-Rom -> cubic Bezier for a smooth closed outline
    d = f"M {pts[0][0]:.1f},{pts[0][1]:.1f} "
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f"C {c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f} "
    return d + "Z"


def _spiral(cx, cy, r0, r1, turns, phase, sx=1.0, sy=1.0, n=90):
    pts = []
    for i in range(n + 1):
        u = i / n
        t = phase + turns * 2 * math.pi * u
        r = r0 + (r1 - r0) * u
        pts.append((cx + sx * r * math.cos(t), cy + sy * r * math.sin(t)))
    d = f"M {pts[0][0]:.1f},{pts[0][1]:.1f} "
    for i in range(1, len(pts) - 1, 2):
        d += f"Q {pts[i][0]:.1f},{pts[i][1]:.1f} {pts[i+1][0]:.1f},{pts[i+1][1]:.1f} "
    return d


def cranberry(cx, cy, r, rot=0, face=False):
    o = [f'<g transform="translate({cx},{cy}) rotate({rot})">']
    body = ell(0, 0, r, r * 0.9)
    o.append(part(body, CRAN, [(ell(-r * 0.25, r * 0.3, r * 1.0, r * 0.95), CRAN_S),
                               (ell(r * 0.05, -r * 0.1, r * 0.82, r * 0.72), CRAN),
                               (f"M {-r*0.55},{-r*0.35} C {-r*0.45},{-r*0.7} {-r*0.1},{-r*0.78} {r*0.15},{-r*0.7} "
                                f"C {-r*0.1},{-r*0.6} {-r*0.4},{-r*0.5} {-r*0.55},{-r*0.35} Z", CRAN_H)],
                  w=max(2.4, min(5, r * 0.11))))
    # blossom-end star (real cranberries have it)
    s = r * 0.16
    o.append(line(f"M {-s},{r*0.62} L {s},{r*0.62} M 0,{r*0.62-s} L 0,{r*0.62+s} "
                  f"M {-s*0.7},{r*0.62-s*0.7} L {s*0.7},{r*0.62+s*0.7}", max(1.4, r * 0.05), "#5a0a18", a=0))
    if face:
        o.append(f'<circle cx="{-r*0.28}" cy="{-r*0.05}" r="{r*0.2}" fill="#fff" stroke="{INK}" stroke-width="2.6"/>')
        o.append(f'<circle cx="{r*0.22}" cy="{-r*0.05}" r="{r*0.2}" fill="#fff" stroke="{INK}" stroke-width="2.6"/>')
        o.append(f'<circle cx="{-r*0.22}" cy="{-r*0.02}" r="{r*0.07}" fill="{INK}"/>')
        o.append(f'<circle cx="{r*0.28}" cy="{-r*0.02}" r="{r*0.07}" fill="{INK}"/>')
        o.append(part(f"M {-r*0.18},{r*0.25} C {-r*0.12},{r*0.5} {r*0.12},{r*0.5} {r*0.18},{r*0.25} Z", "#5b1d2b", w=2.4, a=0.3))
    o.append("</g>")
    return "".join(o)


def portal(cx, cy):
    o = []
    o.append(f'<path d="{_blob(cx, cy, 250, 262, 0.035, 1.2)}" fill="{P_GLOW}" opacity="0.5"/>')
    outer = _blob(cx, cy, 214, 226, 0.03, 0.4)
    sp = []
    sp.append(f'<path d="{_blob(cx+6, cy+4, 170, 182, 0.04, 2.0)}" fill="{P_MID}"/>')
    sp.append(f'<path d="{_blob(cx+10, cy+8, 112, 122, 0.05, 3.0)}" fill="{P_DEEP}"/>')
    sp.append(f'<path d="{_blob(cx+12, cy+10, 52, 58, 0.08, 1.0)}" fill="{P_DARK}"/>')
    for ph, col, wdt in ((0, P_LIGHT, 16), (2.1, P_GLOW, 9), (4.2, P_LIGHT, 12), (1.0, P_DEEP, 10), (3.2, P_MID, 14), (5.2, P_DEEP, 8)):
        sp.append(f'<path d="{_spiral(cx+12, cy+10, 18, 225, 1.35, ph, 1, 1.05)}" fill="none" stroke="{col}" stroke-width="{wdt}" stroke-linecap="round"/>')
    o.append(part(outer, P_LIGHT, sp, w=6))
    # goo drips at the bottom rim
    for dx, ln in ((-60, 34), (-10, 52), (52, 26)):
        x0 = cx + dx
        y0 = cy + 214 - abs(dx) * 0.1
        o.append(part(f"M {x0-10},{y0-6} C {x0-9},{y0+ln*0.6} {x0-8},{y0+ln} {x0},{y0+ln} "
                      f"C {x0+8},{y0+ln} {x0+9},{y0+ln*0.6} {x0+10},{y0-6} Z", P_LIGHT, w=4))
    # flecks
    for fx, fy, fr in ((cx + 236, cy - 120, 7), (cx + 262, cy - 70, 5), (cx + 228, cy + 168, 6), (cx - 236, cy - 150, 5)):
        o.append(part(ell(fx, fy, fr), P_LIGHT, w=3))
    # cranberry bursting out toward the viewer
    bx, by = cx + 150, cy + 40
    for k, (dx, dy) in enumerate(((-120, -70), (-138, -40), (-126, -10))):
        o.append(line(f"M {bx+dx},{by+dy} C {bx+dx+30},{by+dy+8} {bx+dx+50},{by+dy+12} {bx+dx+70},{by+dy+14}", 5, INK))
    o.append(cranberry(bx + 20, by, 78, rot=-14, face=True))
    o.append(cranberry(cx - 110, cy - 120, 26, rot=30))
    o.append(line(f"M {cx-150},{cy-150} C {cx-140},{cy-140} {cx-138},{cy-132} {cx-136},{cy-124}", 3.4))
    return "".join(o)
