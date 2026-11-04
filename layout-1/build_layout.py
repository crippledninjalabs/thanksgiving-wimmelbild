"""Layout block-out for "Thanksgiving at SpaceX" -> layout.svg (3840 x 2160 units).

    python3 build_layout.py && bash ../style-sheet-1/src/render.sh layout.svg layout.png 3840 2160

Room grid comes from thanksgiving-wimmelbild/checkpoints/07-pixel-map/MAP.md
(x 36-850 there -> x 140-2500 here). The old elevator lobby column (x 420-448)
becomes the central stair S2; there are no elevator shafts.
"""
import os
from xml.sax.saxutils import escape

W, H = 3840, 2160
GROUND = 2000
FONT = "Arial, Helvetica, sans-serif"
INK = "#1c1a26"
CRAN, TURK, PORTAL = "#c0203a", "#8a5a2b", "#5fd35a"
CAM = "#e8820c"


def X(mx):  # MAP x -> canvas x
    return round(140 + (mx - 36) * 2.9)


FLOORS = {5: (450, 760), 4: (760, 1070), 3: (1070, 1380), 2: (1380, 1690), 1: (1690, 2000)}
FOOD, TECH, WORK, PEOPLE, UTIL = "#f7cf9c", "#cfe2f3", "#e3dbf3", "#f6eaa8", "#dedbd2"

# id, name, floor, MAP x0, MAP x1, note, colour
ROOMS = [
    ("R01", "Uplink Room", 5, 36, 196, "racks, egg trampoline", TECH),
    ("R02", "Programmers' Loft", 5, 196, 420, "2 coders teach bots", PEOPLE),
    ("R03", "Drone Hangar", 5, 448, 640, "3 drones, roof hatch", TECH),
    ("R04", "Mission Control", 5, 640, 850, "big screen, LAUNCH button", PEOPLE),
    ("R05", "Banquet Hall", 4, 36, 420, "5 diners, roast turkey, fountain", FOOD),
    ("R06", "Pie Bakery", 4, 448, 610, "pie conveyor, 2 bakers", FOOD),
    ("R07", "Restroom", 4, 610, 720, "mirror, egg wash", UTIL),
    ("R08", "Charging Closet", 4, 720, 850, "3 sleeping Optimus", WORK),
    ("R09", "Robot Kitchen", 3, 36, 270, "4 arms, turkey on spit", FOOD),
    ("R10", "Gravy & Sauce Lab", 3, 270, 420, "gravy vat, distiller", FOOD),
    ("R11", "Cold Pantry", 3, 448, 620, "frosty shelves, berry slalom", FOOD),
    ("R12", "Feather Lab", 3, 620, 850, "wind tunnel, egg column", TECH),
    ("R13", "Optimus Workshop", 2, 36, 230, "egg bucket brigade", WORK),
    ("R14", "Raptor Machine Shop", 2, 230, 420, "boing press, engine bell", WORK),
    ("R15", "Grok Bot Nursery", 2, 448, 640, "ball pit, 6 Grok minis", TECH),
    ("R16", "Server Room", 2, 640, 850, "Grok core racks", TECH),
    ("R17", "Warehouse", 1, 36, 230, "plinko crates, forklift", UTIL),
    ("R18", "Boiler & Fuel", 1, 230, 420, "tanks, steam whistle", UTIL),
    ("R19", "Launch Control Annex", 1, 448, 620, "1 operator, egg abacus", PEOPLE),
    ("R20", "Rocket Bay", 1, 620, 850, "roll-up door, conveyor", WORK),
]
ROOM = {r[0]: (X(r[3]), FLOORS[r[2]][0], X(r[4]), FLOORS[r[2]][1]) for r in ROOMS}

# Starship geometry: true proportions, 12.74 px per metre (tower 146 m tall)
PXM = (GROUND - 140) / 146
MOUNT_H, BOOST_H, SHIP_H, DIAM = 20 * PXM, 71 * PXM, 50 * PXM, 9 * PXM
RX = 3230  # stack centre line
TX0, TX1 = 3420, 3420 + 20 * PXM  # tower legs


def T(x, y, s, size=24, anchor="start", fill=INK, bold=False, extra=""):
    w = ' font-weight="700"' if bold else ""
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" text-anchor="{anchor}" '
            f'fill="{fill}"{w} {extra}>{escape(s)}</text>')


def tw(s, size, bold=False):
    return len(s) * size * (0.68 if bold else 0.58)


def tag(x, y, s, size=22, bold=False, fill="#ffffff", stroke=INK, color=INK, anchor="start"):
    """Text on a backing box so it stays readable over lines."""
    w = tw(s, size, bold) + 16
    x0 = x - w / 2 if anchor == "middle" else x
    return (f'<rect x="{x0:.0f}" y="{y-size-4}" width="{w:.0f}" height="{size+12}" rx="6" fill="{fill}" '
            f'fill-opacity="0.92" stroke="{stroke}" stroke-width="2"/>' + T(x0 + 8, y, s, size, "start", color, bold))


def R(x0, y0, x1, y1, fill, stroke=INK, sw=4, extra=""):
    return f'<rect x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'


def L(d, color=INK, w=3, dash=None, extra=""):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}"{da} {extra}/>'


# ---------------------------------------------------------------- silhouettes
def person(x, y, h, body, head="#f1d3c3", hair=None, spiky=False):
    """Placeholder actor, feet at (x, y)."""
    hw, hr = h * 0.17, h * 0.13
    o = [R(x - hw * 0.7, y - h * 0.42, x + hw * 0.7, y, "#2c3d47", sw=2),
         f'<rect x="{x-hw:.0f}" y="{y-h*0.78:.0f}" width="{2*hw:.0f}" height="{h*0.42:.0f}" rx="{hw*0.4:.0f}" fill="{body}" stroke="{INK}" stroke-width="2"/>',
         f'<circle cx="{x}" cy="{y-h*0.78-hr:.0f}" r="{hr:.0f}" fill="{head}" stroke="{INK}" stroke-width="2"/>']
    if spiky:
        cy = y - h * 0.78 - hr
        pts = " ".join(f"{x+dx*hr:.0f},{cy+dy*hr:.0f}" for dx, dy in
                       [(-1, 0), (-1.8, -0.6), (-0.9, -0.8), (-1.2, -1.8), (-0.3, -1.1), (0.2, -2), (0.6, -1.1),
                        (1.5, -1.6), (1.0, -0.6), (1.8, -0.3), (1, 0)])
        o.append(f'<polygon points="{pts}" fill="{hair}" stroke="{INK}" stroke-width="2"/>')
    elif hair:
        cy = y - h * 0.78 - hr
        o.append(f'<path d="M {x-hr},{cy:.0f} A {hr} {hr} 0 0 1 {x+hr},{cy:.0f} Z" fill="{hair}" stroke="{INK}" stroke-width="2"/>')
    return "".join(o)


def elon(x, y):
    return person(x, y, 150, "#3b4c56", hair="#4a3d36")


def rick(x, y):
    return person(x, y, 160, "#f4fbfa", head="#d9dde0", hair="#9fd4f0", spiky=True)


def morty(x, y):
    return person(x, y, 100, "#f2dc4a", hair="#6b4220")


def portal(x, y, letter, color):
    return (f'<ellipse cx="{x}" cy="{y}" rx="34" ry="46" fill="{PORTAL}" stroke="#1d7a2a" stroke-width="5"/>'
            f'<ellipse cx="{x}" cy="{y}" rx="18" ry="28" fill="#c8f7a8"/>' + T(x, y + 11, letter, 32, "middle", color, True))


def pin(x, y, sym, color, label=None, side="right", size=22):
    """Map pin pointing at (x, y) with a symbol and optional label."""
    o = [f'<path d="M {x},{y} L {x-14},{y-34} A 20 20 0 1 1 {x+14},{y-34} Z" fill="{color}" stroke="{INK}" stroke-width="3"/>',
         T(x, y - 38, sym, 20, "middle", "#ffffff", True)]
    if label:
        lx = x + 30 if side == "right" else x - 30 - tw(label, size) - 16
        o.append(tag(lx, y - 30, label, size))
    return "".join(o)


def arc(p, q, color, bow, label):
    (x0, y0), (x1, y1) = p, q
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    dx, dy = x1 - x0, y1 - y0
    n = (dx * dx + dy * dy) ** 0.5
    cx, cy = mx - dy / n * bow, my + dx / n * bow
    d = f"M {x0},{y0} Q {cx:.0f},{cy:.0f} {x1},{y1}"
    lx, ly = (x0 + 2 * cx + x1) / 4, (y0 + 2 * cy + y1) / 4
    return (L(d, "#ffffff", 12, extra='opacity="0.7"') + L(d, color, 6, "22 14") +
            tag(lx, ly + 8, label, 22, True, "#fff6f6", color, color, "middle"))


# ---------------------------------------------------------------- scene parts
def sky_and_ground():
    o = ['<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6fa8"/>'
         '<stop offset="1" stop-color="#f3b58a"/></linearGradient></defs>',
         R(0, 0, W, GROUND, "url(#sky)", sw=0),
         R(0, GROUND, W, H, "#7c9a4a", sw=0), R(0, GROUND, W, GROUND + 18, "#5d7a35", sw=0),
         R(3020, GROUND, 3760, H, "#a8a39a", sw=0)]  # pad concrete
    o.append(L(f"M 0,{GROUND} L {W},{GROUND}", INK, 4))
    o.append(T(20, H - 30, "GROUND STRIP (whole width)", 24, fill="#ffffff", bold=True))
    o.append(T(3040, H - 30, "LAUNCH PAD (concrete)", 24, fill=INK, bold=True))
    return "".join(o)


def building():
    o = [R(40, 450, 2500, GROUND, "#8a8f99", sw=6)]  # shell
    for rid, name, fl, a, b, note, col in ROOMS:
        x0, y0, x1, y1 = ROOM[rid]
        o.append(R(x0 + 4, y0 + 6, x1 - 4, y1 - 6, col, sw=3))
    for f, (y0, y1) in FLOORS.items():  # slabs + floor tags
        o.append(R(40, y1 - 6, 2500, y1 + 6, "#4a4f5a", sw=0))
        o.append(T(26, (y0 + y1) / 2 + 10, f"F{f}", 20, "middle", "#ffffff", True))
    # roof deck + sign
    o.append(R(140, 330, 2500, 450, "#b9c4cf", sw=4))
    o.append(T(160, 372, "ROOF DECK", 28, bold=True))
    o.append(T(160, 404, "dishes, masts, roof hopper, berry gutter", 22))
    for x in (980, 2280):  # sign posts
        o.append(R(x, 290, x + 18, 330, "#555", sw=2))
    o.append(R(900, 160, 2420, 292, "#1c1a26", sw=0, extra='rx="12"'))
    o.append(T(1660, 266, "S P A C E X", 112, "middle", "#ffffff", True))
    o.append(L("M 160,440 L 2480,440", CRAN, 6))
    o.append(T(1700, 432, "berry gutter", 20, fill=CRAN, bold=True))
    for x in (1240, 1400):  # dishes
        o.append(f'<path d="M {x},420 l 0,-28 m -26,-14 a 30 22 0 0 0 52,18 z" fill="#e8eef3" stroke="{INK}" stroke-width="3"/>')
    return "".join(o)


def stairs(x0, x1, label):
    o = [R(x0, 450, x1, GROUND, "#c9b89a", sw=3)]
    for f, (y0, y1) in FLOORS.items():
        o.append(L(f"M {x0+8},{y1-8} L {x1-8},{(y0+y1)/2} L {x0+8},{y0+12}", "#6b5a3a", 6))
    o.append(T((x0 + x1) / 2, 2000 - 330, label, 22, "middle", INK, True,
               f'transform="rotate(-90 {(x0+x1)/2} {2000-330})"'))
    return "".join(o)


def connectors():
    """Lifts, pipes, chutes, conveyors between rooms (no elevator shafts)."""
    o = [stairs(40, 140, "S1 STAIRS (exterior)"), stairs(X(420), X(448), "S2 STAIRS")]
    # small wall lifts / dumbwaiters
    for x, y0, y1, lab in ((790, 760, 1380, "DW1"), (660, 1070, 2000, "DW2"), (1500, 450, 1070, "DW3")):
        o.append(R(x - 12, y0 + 120, x + 12, y1 - 20, "#ffffff", sw=3, extra='fill-opacity="0.6"'))
        o.append(T(x, y1 - 30, lab, 18, "middle", INK, True))
    # exterior freight wall lift (FL1 / Gobble Lift) on the right wall
    o.append(R(2504, 450, 2556, GROUND, "#e6d27a", sw=3))
    o.append(T(2530, 1500, "FL1 GOBBLE LIFT (wall lift)", 22, "middle", INK, True, 'transform="rotate(-90 2530 1500)"'))
    # pipes, tubes, chutes
    o.append(L(f"M 1100,1980 L 1100,1400", "#b06a2a", 10))
    o.append(tag(1110, 1966, "FP1 steam riser", 18))
    o.append(L(f"M 1700,1980 L 1700,1080", "#6aaed6", 10, "4 0"))
    o.append(tag(1710, 1966, "PT1 pneumatic tube", 18))
    o.append(L(f"M 1440,1376 L 1440,1064", CRAN, 8, "10 6"))
    o.append(tag(1450, 1250, "berry paternoster", 18))
    o.append(L("M 2060,1060 C 2100,1080 2020,1100 2060,1120", "#999", 12))
    o.append(tag(2080, 1060, "egg chute + corkscrew slide", 18))
    # conveyor rocket bay -> pad, fuel line
    o.append(L(f"M 2300,1990 L 2300,2040 L 3120,2040 L 3120,1990", "#333", 10, "18 8"))
    o.append(tag(2600, 2120, "bay conveyor tunnel -> pad", 18))
    o.append(L(f"M 1000,2000 L 1000,2080 L 3160,2080 L 3160,2000", "#d0b020", 6, "12 8"))
    o.append(tag(1500, 2072, "underground fuel line to pad", 18))
    return "".join(o)


def launch_site():
    o = []
    # tower (Mechazilla) lattice
    o.append(R(TX0, 140, TX1, GROUND, "#5a5f68", sw=4))
    y = 140
    while y < GROUND:
        o.append(L(f"M {TX0},{y} L {TX1:.0f},{y+120} M {TX1:.0f},{y} L {TX0},{y+120} M {TX0},{y} L {TX1:.0f},{y}", "#8c929c", 3))
        y += 120
    o.append(R(TX0 + 20, 120, TX1 - 20, 140, "#5a5f68", sw=3))
    # chopsticks at booster-top height
    cy = GROUND - MOUNT_H - BOOST_H + 90
    for dy in (0, 40):
        o.append(R(RX - DIAM / 2 - 30, cy + dy, TX0, cy + dy + 22, "#3c4048", sw=3))
    o.append(R(TX0 - 40, cy - 30, TX0, cy + 92, "#3c4048", sw=3))  # carriage
    # quick-disconnect arm to ship
    qy = GROUND - MOUNT_H - BOOST_H - 140
    o.append(R(RX + DIAM / 2, qy, TX0, qy + 26, "#3c4048", sw=3))
    # launch mount
    my = GROUND - MOUNT_H
    o.append(R(RX - 160, my, RX + 160, my + 40, "#6d7079", sw=4))
    for lx in (RX - 150, RX - 60, RX + 40, RX + 130):
        o.append(R(lx, my + 40, lx + 22, GROUND, "#6d7079", sw=3))
    # booster
    bx0, bx1 = RX - DIAM / 2, RX + DIAM / 2
    by0 = my - BOOST_H
    o.append(R(round(bx0), round(by0), round(bx1), round(my), "#c9ccd2", sw=4))
    for k in range(1, 7):
        yy = by0 + k * BOOST_H / 7
        o.append(L(f"M {bx0:.0f},{yy:.0f} L {bx1:.0f},{yy:.0f}", "#a7abb3", 2))
    for gx in (bx0 - 22, bx1):
        o.append(R(round(gx), round(by0 + 20), round(gx + 22), round(by0 + 60), "#7d828b", sw=2))
    # ship
    sy0 = by0 - SHIP_H
    nose = 0.36 * SHIP_H
    o.append(f'<path d="M {bx0:.0f},{by0:.0f} L {bx0:.0f},{sy0+nose:.0f} C {bx0:.0f},{sy0+40:.0f} {RX-20},{sy0:.0f} {RX},{sy0:.0f} '
             f'C {RX+20},{sy0:.0f} {bx1:.0f},{sy0+40:.0f} {bx1:.0f},{sy0+nose:.0f} L {bx1:.0f},{by0:.0f} Z" '
             f'fill="#d8dbe0" stroke="{INK}" stroke-width="4"/>')
    for fx, fy, s in ((bx0, sy0 + nose + 20, -1), (bx1, sy0 + nose + 20, 1), (bx0, by0 - 150, -1), (bx1, by0 - 150, 1)):
        o.append(f'<path d="M {fx:.0f},{fy:.0f} l {s*30},20 l 0,90 l {-s*30},10 Z" fill="#7d828b" stroke="{INK}" stroke-width="3"/>')
    o.append(L(f"M {bx0:.0f},{by0:.0f} L {bx1:.0f},{by0:.0f}", INK, 5))  # hot-stage ring
    # dimension labels (true proportions)
    o.append(tag(RX - 250, sy0 + 610, "SHIP ~50 m", 22, True, anchor="middle"))
    o.append(tag(RX - 250, by0 + 420, "SUPER HEAVY ~71 m", 22, True, anchor="middle"))
    o.append(tag(TX1 + 14, 200, "TOWER", 22, True))
    o.append(tag(TX1 + 14, 236, "'Mechazilla'", 20))
    o.append(tag(TX1 + 14, 270, "~146 m", 20))
    o.append(tag(TX0 - 300, cy - 40, "chopsticks", 20))
    # scale bar 20 m
    sb = 20 * PXM
    o.append(L(f"M 3680,1800 L {3680+sb:.0f},1800", "#ffffff", 8))
    o.append(T(3680 + sb / 2, 1785, "20 m", 22, "middle", "#ffffff", True))
    return "".join(o)


def outside():
    o = []
    # turkey pen, hay, tree, pumpkin patch: flat blocks on the ground
    o.append(R(2590, 1900, 2860, GROUND, "#d9b77a", sw=3))
    o.append(T(2725, 1935, "TURKEY PEN", 22, "middle", INK, True))
    o.append(T(2725, 1962, "Tom, Gobbles, Pip +6", 18, "middle"))
    o.append(R(2880, 1950, 2990, GROUND, "#e8cf6a", sw=3))
    o.append(T(2935, 1982, "hay+nest", 16, "middle"))
    o.append(R(2940, 1700, 2960, 1950, "#6b4a2a", sw=2))
    o.append('<circle cx="2950" cy="1660" r="80" fill="#d9772a" stroke="#1c1a26" stroke-width="3"/>')
    o.append(T(2950, 1668, "autumn tree", 18, "middle", "#fff", True))
    o.append(R(3680, 1920, 3810, GROUND, "#e58a2a", sw=3))
    o.append(T(3745, 1952, "pumpkins", 18, "middle", INK, True))
    o.append(T(3745, 1976, "+scarecrow", 16, "middle"))
    o.append('<circle cx="2800" cy="230" r="22" fill="#e8eef3" stroke="#1c1a26" stroke-width="3"/>')
    o.append(L("M 2750,230 L 2850,230", INK, 8))
    o.append(T(2800, 290, "satellite", 18, "middle", "#fff", True))
    return "".join(o)


def room_labels():
    o = []
    for rid, name, fl, a, b, note, col in ROOMS:
        x0, y0, x1, y1 = ROOM[rid]
        w = x1 - x0 - 30
        s = min(28, w / (0.7 * len(f"{rid} {name}")))
        o.append(tag(x0 + 12, y0 + 16 + s, f"{rid} {name}", round(s), True))
        n = min(21, w / (0.58 * len(note)))
        o.append(T(x0 + 18, y0 + 34 + s + n, note, round(n), fill="#3a3640"))
    return "".join(o)


# ---------------------------------------------------------------- story layer
ELON = (2120, 735)
PORTALS = {  # letter: (x, y)
    "A": (900, 395), "B": (2400, 665),          # cranberry: Rick's roof lab -> Elon's console
    "C": (1790, 1290), "D": (900, 960),         # cranberry: Cold Pantry -> banquet fountain
    "E": (2660, 1820), "F": (2380, 1290),       # live turkey: pen -> Feather Lab wind tunnel
    "G": (560, 1300), "H": (640, 990),          # roast turkey: kitchen oven -> banquet table
}
ROUTES = [("A", "B", CRAN, -170, "C1 cranberry: A->B"), ("C", "D", CRAN, 160, "C2 cranberry: C->D"),
          ("E", "F", TURK, 120, "T1 live turkey: E->F"), ("G", "H", TURK, 170, "T2 roast turkey: G->H")]
MORTYS = [  # room or spot, (x, y feet), name, attitude
    ((1000, 735), "Hipster Morty", "liked rockets before they were cool"),
    ((1580, 1045), "Chef Morty", "robots won't let him near the pies"),
    ((2060, 1665), "Evil Morty", "calm, quietly rerouting the Grok core"),
    ((360, 1975), "Cop Morty", "writing tickets for the forklift bot"),
    ((3360, 1640), "Astronaut Morty", "wants a seat on Starship, too scared"),
]
CAMERA = [  # stop, frame rect, badge position, caption
    (1, (12, 12, W - 12, H - 12), (90, 70), "1 WHOLE FACTORY"),
    (2, (2020, 575, 2240, 755), (2020, 575), "2 ELON CLOSE-UP"),
    (3, (148, 768, 1245, 1062), (700, 790), "3 BUSY ROOM"),
    (4, (630, 300, 970, 450), (800, 300), "4 RICK'S PORTAL CATCHES BERRY"),
    (5, (2300, 575, 2492, 755), (2492, 575), "5 BERRY EXITS AT ELON"),
]


def story():
    o = []
    # Rick's pop-up lab on the roof deck
    o.append(R(640, 334, 960, 446, "#b7e3a0", sw=4))
    o.append(T(740, 362, "RICK'S POP-UP LAB", 18, bold=True))
    o.append(rick(690, 446))
    for k, (a, b, col, bow, lab) in enumerate(ROUTES):
        o.append(arc(PORTALS[a], PORTALS[b], col, bow, lab))
    for k, (x, y) in PORTALS.items():
        o.append(portal(x, y, k, CRAN if k in "ABCD" else TURK))
    o.append(elon(*ELON))
    for (x, y), name, att in MORTYS:
        o.append(morty(x, y))
    return "".join(o)


def pins():
    o = [pin(ELON[0] - 50, ELON[1] - 40, "E", "#3b4c56", "ELON (Mission Control)", "left")]
    o.append(pin(690, 280, "R", "#2a9d4a", "RICK'S LAB (roof)", "left"))
    for (x, y), name, att in MORTYS:
        side = "left" if x > 1900 else "right"
        o.append(pin(x, y - 110, "M", "#e0b400", f"{name}: {att}", side, 19))
    return "".join(o)


def camera():
    o = []
    pts = [c[2] for c in CAMERA]
    o.append(L("M " + " L ".join(f"{x},{y}" for x, y in pts), CAM, 5, "6 10"))
    for n, (x0, y0, x1, y1), (bx, by), cap in CAMERA:
        o.append(R(x0, y0, x1, y1, "none", CAM, 6 if n > 1 else 8, 'stroke-dasharray="30 12"'))
        o.append(f'<circle cx="{bx}" cy="{by}" r="26" fill="{CAM}" stroke="{INK}" stroke-width="3"/>')
        o.append(T(bx, by + 11, str(n), 32, "middle", "#ffffff", True))
    caps = [c[3] for c in CAMERA]
    o.append(tag(140, 70, "X-CLIP CAMERA PATH:  " + "  >  ".join(caps), 26, True, "#fff3e0", CAM))
    return "".join(o)


def legend():
    x, y = 2600, 360
    rows = [(FOOD, "food rooms (cranberry loop)"), (TECH, "tech / Grok rooms"), (WORK, "robot work rooms"),
            (PEOPLE, "rooms with humans"), (UTIL, "utility")]
    o = [R(x, y, x + 400, y + 40 + 40 * len(rows) + 120, "#ffffff", sw=3, extra='fill-opacity="0.9" rx="10"'),
         T(x + 16, y + 32, "LEGEND (block-out)", 22, bold=True)]
    for k, (c, s) in enumerate(rows):
        yy = y + 50 + 40 * k
        o.append(R(x + 16, yy, x + 50, yy + 28, c, sw=2))
        o.append(T(x + 62, yy + 22, s, 20))
    yy = y + 60 + 40 * len(rows)
    o.append(L(f"M {x+16},{yy} L {x+60},{yy}", CRAN, 6, "14 8"))
    o.append(T(x + 70, yy + 7, "cranberry portal route", 20))
    o.append(L(f"M {x+16},{yy+36} L {x+60},{yy+36}", TURK, 6, "14 8"))
    o.append(T(x + 70, yy + 43, "turkey portal route", 20))
    o.append(L(f"M {x+16},{yy+72} L {x+60},{yy+72}", CAM, 5, "6 10"))
    o.append(T(x + 70, yy + 79, "camera path (1-5)", 20))
    return "".join(o)


def main():
    body = [sky_and_ground(), launch_site(), outside(), building(), connectors(), story(), room_labels(),
            legend(), camera(), pins()]
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
           + "".join(body) + "</svg>")
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "layout.svg")
    open(out, "w").write(svg)
    print("wrote", out)


if __name__ == "__main__":
    main()
