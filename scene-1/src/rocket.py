"""Starship + Super Heavy on the launch mount, as a cutaway with labelled decks,
plus the tower ("Mechazilla") with chopsticks. Stylised ~2.5x true diameter.

Each deck: wall tint, floor plate, plaque, a placeholder chain-reaction branch
(fed by the trunk tube on the left wall), landing damage marks, and a blue
repair-portal spot (one live where Space Morty is, the rest dashed = blink spots).
Deepen a deck later by editing its entry in DECK_FNS only.
"""
from common import (RC, RR, SHIP_TOP, BOOST_TOP, MOUNT_TOP, GROUND, TOWER, R, C, E, P, T, INK, use, sprite, plaque,
                    machine, table, screen, crack, spark, smoke, ball, STEEL, STEEL_S, STEEL_H, STEEL_D, FIG, DAMAGE)
import cast
from sky import satellite

L0, L1 = RC - RR, RC + RR          # hull outer x
I0, I1 = L0 + 22, L1 - 22          # interior x
LAD = (I1 - 70, I1 - 30)           # climbing ladder through all decks
DECKS = [  # id, name, top, floor
    ("S1", "Cockpit", 300, 700), ("S2", "Payload Bay", 700, 1000), ("S3", "Turkey Deck", 1000, 1300),
    ("S4", "Crew Galley", 1300, 1560), ("S5", "Raptor Room", 1560, 1800),
    ("B1", "Fuel Pumps", 1840, 2160), ("B2", "Cranberry Mixer", 2160, 2520), ("B3", "Workshop", 2520, 2880),
    ("B4", "Pulley Shaft", 2880, 3240), ("B5", "Engine Room", 3240, 3600),
]
TINTS = ["#dfe6ee", "#e9e3d6"]


# ---------------------------------------------------------------- chain-reaction placeholders
def chain(kind, x0, x1, top, fy):
    o = []
    if kind == "ramp":
        y = top + 70
        for k in range(3):
            a, b = (x0, x1) if k % 2 == 0 else (x1, x0)
            o.append(P(f"M {a},{y + k*55} L {b},{y + k*55 + 30}", "none", 6, "#a8774a"))
        o.append(ball(x0 + 12, top + 58) + R(x1 - 30, fy - 40, 34, 40, "#5aa0d8", 1.6, 3))
    elif kind == "domino":
        for k in range(7):
            ang = min(60, k * 9)
            o.append(f'<g transform="translate({x0 + 20 + k*28},{fy}) rotate({ang})">{R(-5, -50, 10, 50, "#f2f2ef", 1.6, 2)}</g>')
        o.append(P(f"M {x1-60},{fy-10} L {x1},{fy-40}", "none", 5, "#6b4a2e") + C(x1 - 30, fy - 8, 7, "#9aa0a8", 1.4))
    elif kind == "pulley":
        cx = (x0 + x1) / 2
        o.append(C(cx, top + 40, 22, "#9aa0a8", 2) + P(f"M {cx-22},{top+40} L {cx-22},{fy-90} M {cx+22},{top+40} L {cx+22},{fy-150}", "none", 2))
        o.append(R(cx - 40, fy - 90, 36, 36, "#4c4f57", 1.6, 2) + P(f"M {cx+8},{fy-150} L {cx+36},{fy-150} L {cx+32},{fy-120} L {cx+12},{fy-120} Z", "#e2a043", 1.6))
    elif kind == "wheel":
        cx, cy, r = (x0 + x1) / 2, fy - 70, 62
        o.append(C(cx, cy, r, "none", 4, "#6b4a2e") + P(" ".join(f"M {cx},{cy} l {r*c:.0f},{r*s:.0f}" for c, s in ((1, 0), (-1, 0), (0, 1), (0, -1), (.7, .7), (-.7, .7), (.7, -.7), (-.7, -.7))), "none", 2))
        o.append(C(x1 - 20, fy - 120, 18, "#d9a441", 1.6) + P(f"M {cx},{cy-r} L {x1-20},{fy-138}", "none", 2) + use("grok", cx, cy + 8, 0.7))
    elif kind == "turkey":  # the existing deploy-and-fold turkey contraption
        bx = x0 + 40
        o.append(R(bx, fy - 40, 90, 40, "#6b4a2e", 1.8, 4))
        o.append(P(f"M {bx+20},{fy-40} L {bx+70},{fy-110} L {bx+20},{fy-180} L {bx+70},{fy-220} M {bx+70},{fy-40} L {bx+20},{fy-110} L {bx+70},{fy-180}", "none", 4, "#9aa0a8"))
        fx, fy2 = bx + 45, fy - 222
        cols = ["#c0662a", "#e3a043", "#7b4626", "#d4823a"]
        for k in range(9):
            ang = -170 + k * 20
            o.append(f'<g transform="translate({fx},{fy2}) rotate({ang})">{E(55, 0, 58, 13, cols[k % 4], 1.4)}</g>')
        o.append(E(fx, fy2, 26, 22, "#7b4626", 1.8) + C(fx + 22, fy2 - 24, 10, "#7b4626", 1.4) + P(f"M {fx+26},{fy2-18} q 4,10 0,16", "none", 3, "#d6453a"))
        o.append(T(bx + 110, fy - 14, "turkey deploy + fold", 18, fill="#6b4a2e"))
    # feed from the trunk tube on the left wall (placeholder link)
    o.append(P(f"M {I0+20},{top+40} C {I0+40},{top+40} {x0-10},{top+50} {x0},{top+60}", "none", 2.2, "#6b4a2e", 'stroke-dasharray="6 6"'))
    return "".join(o)


def damage(x, y, k):
    return [crack(x, y), spark(x + 40, y + 60, 12), smoke(x - 20, y + 30, 0.9),
            P(f"M {x},{y} l 50,0 l 6,40 l -46,8 Z", STEEL_S, 1.6, extra=f'transform="rotate(14 {x} {y})"')][k % 4] + crack(x + 90, y + 20, 0.7)


# ---------------------------------------------------------------- deck contents
def d_S1(t, f):
    o = [C(RC - 120, t + 120, 26, "#1f2a44", 3, STEEL_D) + C(RC + 70, t + 70, 22, "#1f2a44", 3, STEEL_D)]
    o.append(R(RC - 70, f - 70, 120, 18, "#3a3f48", 2, 6) + R(RC - 64, f - 190, 22, 130, "#3a3f48", 2, 8))
    o.append(P(f"M {RC-50},{f-180} L {RC+20},{f-70} M {RC-50},{f-70} L {RC+20},{f-180}", "none", 3, "#e2a043"))
    o.append(screen(RC + 70, f - 160, 90, 60) + T(RC - 140, f - 12, "strap in here", 18, fill="#5a6070"))
    return o


def d_S2(t, f):
    o = [f'<g transform="translate({RC-110},{f-60}) rotate(90) scale(0.6)">{satellite(0, 0)}</g>',
         f'<g transform="translate({RC-30},{f-60}) rotate(90) scale(0.6)">{satellite(0, 0)}</g>',
         R(RC + 20, f - 180, 30, 180, "#4c4f57", 2), chain("ramp", RC + 70, I1 - 80, t, f), use("grok", RC + 90, f, 1.0)]
    return o


def d_S3(t, f):
    return [chain("turkey", I0 + 30, I0 + 250, t, f), use("opt", RC + 120, f, 1.0, True), C(RC + 110, t + 120, 6, "#e2453c", 1.4)]


def d_S4(t, f):
    return [table(I0 + 40, f, 140), R(RC + 30, f - 170, 70, 170, "#e9ecef", 2, 6), use("opt_carry", RC - 10, f, 1.0),
            use("grok", I0 + 110, f - 46, 0.6), chain("domino", I0 + 30, RC - 40, t, f)]


def d_S5(t, f):
    o = [chain("pulley", I0 + 20, I0 + 160, t, f)]
    for k in range(3):
        x = RC - 40 + k * 70
        o.append(P(f"M {x-18},{t+50} L {x+18},{t+50} L {x+30},{f-10} L {x-30},{f-10} Z", "#7d848d", 1.8))
    return o


def d_B1(t, f):
    o = [machine(RC - 30, f, 90, 120, "#8fa3b8", 2, "#7fe0ff"), machine(RC + 70, f, 70, 160, "#8fa3b8", 3),
         P(f"M {RC-30},{f-80} C {RC-80},{f-80} {RC-80},{t+30} {RC-120},{t+30}", "none", 8, "#5a6070"),
         chain("wheel", I0 + 20, I0 + 190, t, f)]
    o.append(sprite(cast.rick(arm_up=True), RC + 160, f, FIG, flip=True))
    return o


def d_B2(t, f):
    o = [P(f"M {RC-40},{f} L {RC-60},{f-150} L {RC+90},{f-150} L {RC+70},{f} Z", "#b7bec6", 2)]
    for k in range(9):
        o.append(C(RC - 40 + (k % 5) * 26, f - 158 - (k // 5) * 14, 11, "#c41e3a", 1.2))
    o += [chain("ramp", I0 + 20, RC - 80, t, f), use("grok", RC + 140, f, 1.0, True)]
    return o


def d_B3(t, f):
    # Space Morty (new) mid-climb, live blue portal handing him the gear that fixes this deck
    o = [chain("domino", RC + 30, I1 - 90, t, f), cast.portal(I0 + 150, f - 130, 46, 62, "blue")]
    o.append(C(I0 + 205, f - 128, 16, "#d9a441", 2) + C(I0 + 205, f - 128, 6, "#fbfaf6", 1.4))
    o.append(sprite(cast.space_morty(), I0 + 250, f, FIG, flip=True))
    o.append(T(I0 + 160, t + 64, "repair part via blue portal", 18, "middle", fill="#1556b8"))
    return o


def d_B4(t, f):
    return [chain("pulley", RC - 60, RC + 60, t, f), use("opt", I0 + 70, f), use("opt_carry", RC + 110, f, 1.0, True),
            R(RC + 130, f - 150, 50, 36, "#c09060", 1.6)]


def d_B5(t, f):
    o = [machine(RC - 60, f, 110, 150, "#7d848d", 2), machine(RC + 70, f, 90, 110, "#7d848d", 2),
         R(RC - 120, f - 260, 16, 260, "#4c4f57", 1.6), chain("ramp", RC - 40, I1 - 90, t, f - 160), use("opt", RC + 190, f, 1.0, True)]
    return o


DECK_FNS = {"S1": d_S1, "S2": d_S2, "S3": d_S3, "S4": d_S4, "S5": d_S5,
            "B1": d_B1, "B2": d_B2, "B3": d_B3, "B4": d_B4, "B5": d_B5}


# ---------------------------------------------------------------- structure
def tower():
    x0, x1 = TOWER
    top = 150
    o = []
    for xa, xb in ((x0, x0 + 44), (x1 - 44, x1)):
        o.append(R(xa, top, xb - xa, GROUND - top, STEEL_D, 2))
    y = top
    while y < GROUND - 10:
        o.append(R(x0 + 44, y, x1 - x0 - 88, 10, "#5a6070", 1.4))
        o.append(P(f"M {x0+44},{y+10} L {x1-44},{y+130} M {x1-44},{y+10} L {x0+44},{y+130}", "none", 3, "#6c727c"))
        y += 130
    # crane on top, chopsticks (catch arms), quick-disconnect arm, walkway
    o.append(R(x0 - 20, top - 30, x1 - x0 + 40, 30, "#4c4f57", 2) + P(f"M {x0+60},{top-30} L {x1+120},{top-140} L {x1+130},{top-120} L {x0+90},{top-30}", STEEL_D, 2))
    o.append(P(f"M {x1+125},{top-130} L {x1+125},{top+120}", "none", 2) + R(x1 + 110, top + 120, 30, 26, "#e2a043", 1.6))
    for y in (1600, 1690):
        o.append(R(L1 + 20, y, x0 - L1 - 20, 34, "#3a3f48", 2, 4) + R(L1 + 20, y - 6, 26, 46, "#e2a043", 1.6, 3))
    o.append(R(x0 - 120, 1600 - 30, 140, 160, "#4c4f57", 2, 6))  # carriage
    o.append(R(L1 + 10, 1880, x0 - L1 - 10, 22, "#5a6070", 1.8))
    wy = 2600
    o.append(R(x0 - 200, wy, 200, 14, "#5a6070", 1.8) + P(f"M {x0-200},{wy} L {x0-200},{wy-60} L {x0},{wy-60}", "none", 3, "#5a6070"))
    o.append(sprite(cast.morty("#f08a24", "#f08a24", "#eef1f4", cast.HELMET, look=-1), x0 - 110, wy, FIG))
    o.append(T(x0 - 220, wy + 44, "Astronaut Morty (too scared)", 20, fill="#fbfaf6"))
    return "".join(o)


def mount():
    o = []
    for k in range(6):
        x = RC - 340 + k * 136
        o.append(R(x - 20, MOUNT_TOP + 80, 40, GROUND - MOUNT_TOP - 80, CONCRETE_LEG, 2))
    o.append(R(RC - 380, MOUNT_TOP + 20, 760, 60, STEEL_D, 2.4, 6) + R(RC - 380, MOUNT_TOP + 20, 760, 14, STEEL_H, 0))
    for k in range(5):  # engine bells under the booster
        x = RC - 200 + k * 100
        o.append(P(f"M {x-20},{MOUNT_TOP} L {x+20},{MOUNT_TOP} L {x+34},{MOUNT_TOP+20} L {x-34},{MOUNT_TOP+20} Z", "#5a6070", 1.6))
    return "".join(o)


CONCRETE_LEG = "#8a877f"


def hull():
    nose = (f"M {L0},{BOOST_TOP} L {L0},700 C {L0},480 {RC-140},300 {RC},{SHIP_TOP} "
            f"C {RC+140},300 {L1},480 {L1},700 L {L1},{BOOST_TOP} Z")
    inner = (f"M {I0},{BOOST_TOP-10} L {I0},700 C {I0},490 {RC-130},322 {RC},{SHIP_TOP+26} "
             f"C {RC+130},322 {I1},490 {I1},700 L {I1},{BOOST_TOP-10} Z")
    o = ['<defs><clipPath id="shipin"><path d="' + inner + '"/></clipPath></defs>']
    # outside fins/flaps first (behind hull edges)
    for sx in (-1, 1):
        xe = L0 if sx < 0 else L1
        o.append(P(f"M {xe},560 L {xe+sx*80},620 L {xe+sx*80},760 L {xe},740 Z", "#3a3f48", 2))
        o.append(P(f"M {xe},1540 L {xe+sx*110},1600 L {xe+sx*110},1780 L {xe},1780 Z", "#3a3f48", 2))
        o.append(R(min(xe, xe + sx * 90), 1880, 90, 60, "#5a6070", 2) + P(f"M {xe},1890 l {sx*90},40 M {xe},1930 l {sx*90},-40", "none", 1.4))
    o.append(P(nose, STEEL, 2.6))
    o.append(R(L0, BOOST_TOP, 2 * RR, MOUNT_TOP - BOOST_TOP, STEEL, 2.6))
    o.append(R(L0, BOOST_TOP, 2 * RR, 40, "#4c4f57", 2) + "".join(R(L0 + 20 + k * 50, BOOST_TOP + 8, 30, 24, "#1d1f25", 0, 4) for k in range(11)))
    return "".join(o), inner


def draw():
    hull_svg, inner = hull()
    o = [mount(), tower(), hull_svg]
    ship_in, boost_in = [], []
    for k, (did, name, top, fl) in enumerate(DECKS):
        tgt = ship_in if did[0] == "S" else boost_in
        tgt.append(R(I0, top, I1 - I0, fl - top, TINTS[k % 2], 0))
        tgt.append(R(I0, fl - 2, I1 - I0, 16, STEEL_S, 1.8))
        tgt.append(R(LAD[0] - 6, fl - 2, LAD[1] - LAD[0] + 12, 16, "#3a3f48", 0))  # hatch
        tgt += DECK_FNS[did](top, fl)
        if did != "B3":
            tgt.append(cast.portal(I1 - 130, top + 110, 40, 54, "blue", ghost=True))
        tgt.append(damage(I0 + 60 + (k * 53) % 140, top + 70, k))
    # ladder + trunk tube through all decks
    rails = f"M {LAD[0]},{500} L {LAD[0]},{MOUNT_TOP} M {LAD[1]},{500} L {LAD[1]},{MOUNT_TOP}"
    rungs = " ".join(f"M {LAD[0]},{y} L {LAD[1]},{y}" for y in range(520, MOUNT_TOP, 34))
    lad = P(rails, "none", 3.4, "#4c4f57") + P(rungs, "none", 2.4, "#4c4f57")
    trunk = R(I0 + 6, 700, 18, MOUNT_TOP - 700, "#c9a37a", 1.8, 9)
    o.append(f'<g clip-path="url(#shipin)">{"".join(ship_in)}{lad}{trunk}</g>')
    o.append(f'<g>{"".join(boost_in)}</g>')
    o.append(P(f"M {LAD[0]},{BOOST_TOP} L {LAD[0]},{MOUNT_TOP} M {LAD[1]},{BOOST_TOP} L {LAD[1]},{MOUNT_TOP}", "none", 3.4, "#4c4f57"))
    o.append(P(" ".join(f"M {LAD[0]},{y} L {LAD[1]},{y}" for y in range(BOOST_TOP + 20, MOUNT_TOP, 34)), "none", 2.4, "#4c4f57"))
    o.append(R(I0 + 6, BOOST_TOP + 40, 18, MOUNT_TOP - BOOST_TOP - 40, "#c9a37a", 1.8, 9))
    # cutaway hull rims (inner edge) + plaques on top
    o.append(P(inner, "none", 2.4, STEEL_D))
    o.append(R(I0, BOOST_TOP + 40, I1 - I0, MOUNT_TOP - BOOST_TOP - 40, "none", 2.4, stroke=STEEL_D))
    for did, name, top, fl in DECKS:
        px = RC - 120 if did == "S1" else I0 + 30
        o.append(plaque(px, top + 8 if did != "S1" else top + 150, f"{did} {name}", 18))
    # bottom door burst open (B5, left wall) + gangway to the ground
    o.append(R(L0 - 4, 3440, 30, 158, "#2a2d35", 0))
    o.append(f'<g transform="rotate(-50 {L0} 3440)">{R(L0 - 150, 3440, 150, 26, STEEL_S, 2)}</g>')
    o.append(P(f"M {L0},{MOUNT_TOP} L {L0-260},{GROUND-6}", "none", 10, "#5a6070") + P(f"M {L0},{MOUNT_TOP-30} L {L0-260},{GROUND-36}", "none", 3, "#5a6070"))
    return "".join(o)
