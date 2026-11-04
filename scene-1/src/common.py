"""Shared geometry, palette and simple shape helpers for the scene.

Canvas: 7680 x 4320 units (2x the layout-1 block-out). Ground line y=4000.
Figures stand with feet at (x, floor_y); building figures and rocket figures
share one scale so the whole frame reads consistently.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "style-sheet-1", "src"))
from lib import INK, LABEL_FONT, TITLE_FONT, part, line, fillp, ell, g, txt, scaled, nid  # noqa: E402,F401

W, H = 7680, 4320
GROUND = 4000
SLAB = 26          # floor slab thickness
FIG = 0.24         # style-sheet units -> scene units for full-detail sprites
FIG_K = 1.5        # stroke multiplier while drawing full-detail sprites at FIG


def X(mx):
    """layout-1 MAP x -> scene x (layout X() doubled)."""
    return round(2 * (140 + (mx - 36) * 2.9))


FLOORS = {5: (900, 1520), 4: (1520, 2140), 3: (2140, 2760), 2: (2760, 3380), 1: (3380, 4000)}
BX0, BX1 = X(36), X(850)       # building outer wall (inner faces)
S2 = (X(420), X(448))          # central stair column

# room id -> (name, floor, MAP x0, MAP x1, wall colour). R19 is now Parts Rick's garage.
WALL = {"food": "#f6e2c4", "tech": "#dbe7f2", "work": "#e6e0ef", "people": "#f3ecc6", "util": "#e2dfd6"}
ROOMS = {
    "R01": ("Uplink Room", 5, 36, 196, "tech"), "R02": ("Programmers' Loft", 5, 196, 420, "people"),
    "R03": ("Drone Hangar", 5, 448, 640, "tech"), "R04": ("Mission Control", 5, 640, 850, "people"),
    "R05": ("Banquet Hall", 4, 36, 420, "food"), "R06": ("Pie Bakery", 4, 448, 610, "food"),
    "R07": ("Restroom", 4, 610, 720, "util"), "R08": ("Charging Closet", 4, 720, 850, "work"),
    "R09": ("Robot Kitchen", 3, 36, 270, "food"), "R10": ("Gravy & Sauce Lab", 3, 270, 420, "food"),
    "R11": ("Cold Pantry", 3, 448, 620, "food"), "R12": ("Feather Lab", 3, 620, 850, "tech"),
    "R13": ("Optimus Workshop", 2, 36, 230, "work"), "R14": ("Raptor Machine Shop", 2, 230, 420, "work"),
    "R15": ("Grok Bot Nursery", 2, 448, 640, "tech"), "R16": ("Server Room", 2, 640, 850, "tech"),
    "R17": ("Warehouse", 1, 36, 230, "util"), "R18": ("Boiler & Fuel", 1, 230, 420, "util"),
    "R19": ("Parts Rick's Garage", 1, 448, 620, "util"), "R20": ("Rocket Bay", 1, 620, 850, "work"),
}


def box(rid):
    """Inner room box (x0, y0, x1, floor_y): y0 under the ceiling slab, floor_y = top of floor slab."""
    _, fl, a, b, _ = ROOMS[rid]
    y0, y1 = FLOORS[fl]
    return X(a) + 8, y0 + SLAB // 2, X(b) - 8, y1 - SLAB // 2


# Rocket stack (stylised: ~2.5x true diameter so decks can hold figures)
RC = 6020                      # stack centre x
RR = 280                       # hull radius
MOUNT_TOP = 3600
BOOST_TOP = 1800
SHIP_TOP = 240
TOWER = (6700, 7180)

# ---------------------------------------------------------------- palette
STEEL, STEEL_S, STEEL_H, STEEL_D = "#c9cdd3", "#a6acb4", "#e9ecef", "#7d848d"
CONCRETE, CONCRETE_S = "#9a978f", "#7f7c75"
BRICK, BRICK_S = "#d7cbb5", "#bfb197"
PORTALS = {  # glow, light, mid, deep, dark
    "green": ("#e4ffb0", "#a8f55a", "#58d63c", "#1f9a3a", "#0d5e26"),
    "yellow": ("#fff7c2", "#ffe45a", "#f5c518", "#b38a00", "#6e5400"),
    "orange": ("#ffe0b8", "#ffab55", "#f27c1c", "#b3500a", "#6e2f05"),
    "blue": ("#d2f0ff", "#77ccff", "#2e8ff0", "#1556b8", "#0b2f6e"),
}
DAMAGE = "#e2453c"


# ---------------------------------------------------------------- shapes
def R(x, y, w, h, fill, sw=2.0, rx=0, stroke=INK, extra=""):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if sw else ""
    r = f' rx="{rx}"' if rx else ""
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}"{r} fill="{fill}"{st} {extra}/>'


def C(cx, cy, r, fill, sw=2.0, stroke=INK, extra=""):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if sw else ""
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}"{st} {extra}/>'


def E(cx, cy, rx, ry, fill, sw=2.0, stroke=INK, extra=""):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if sw else ""
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}"{st} {extra}/>'


def P(d, fill="none", sw=2.0, stroke=INK, extra=""):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if sw else ""
    return f'<path d="{d}" fill="{fill}"{st} {extra}/>'


def T(x, y, s, size=22, anchor="start", fill=INK, font=LABEL_FONT, extra=""):
    return txt(x, y, s, size, anchor, fill, font, 400, extra)


def use(sym, x, y, s=1.0, flip=False):
    sx = -s if flip else s
    return f'<use href="#{sym}" transform="translate({x:.1f},{y:.1f}) scale({sx:.3f},{s:.3f})"/>'


def plaque(x, y, s, size=20):
    """Small room-name plaque (top-left of a room)."""
    w = len(s) * size * 0.52 + 16
    return R(x, y, w, size + 10, "#fbfaf6", 1.6, 4, extra='fill-opacity="0.9"') + T(x + 8, y + size + 2, s, size)


def sprite(svg, x, y, s=FIG, flip=False):
    """Place a full-detail style-sheet sprite (feet at origin) at scene (x, y)."""
    sx = -s if flip else s
    return f'<g transform="translate({x:.1f},{y:.1f}) scale({sx:.3f},{s:.3f})">{svg}</g>'


# ---------------------------------------------------------------- generic machines
def machine(x, y, w, h, fill, knobs=2, screen=None):
    """Box machine standing on floor y (top-left at x, y-h)."""
    o = [R(x, y - h, w, h, fill, 2, 4), R(x, y - h, w, h * 0.14, "#00000018", 0)]
    if screen:
        o.append(R(x + w * 0.15, y - h * 0.8, w * 0.7, h * 0.3, screen, 1.6, 3))
    for k in range(knobs):
        o.append(C(x + w * (k + 1) / (knobs + 1), y - h * 0.3, min(w, h) * 0.06 + 2, "#e2453c", 1.4))
    return "".join(o)


def table(x, y, w, h=46, top="#a8774a"):
    return (R(x, y - h, w, 10, top, 2, 2) + R(x + 8, y - h + 10, 8, h - 10, "#6b4a2e", 1.6)
            + R(x + w - 16, y - h + 10, 8, h - 10, "#6b4a2e", 1.6))


def shelf(x, y, w, h, rows=3, fill="#b98c5a", items=("#e2453c", "#5aa0d8", "#f2c94c")):
    o = [R(x, y - h, w, h, "#00000010", 2)]
    for r in range(rows):
        yy = y - h + (r + 1) * h / rows
        o.append(R(x, yy - 6, w, 6, fill, 1.6))
        n = max(1, int(w // 26))
        for k in range(n):
            if (k * 7 + r * 3) % 5 == 4:
                continue
            col = items[(k + r) % len(items)]
            o.append(R(x + 6 + k * 26, yy - 6 - 18, 18, 18, col, 1.4, 2))
    return "".join(o)


def conveyor(x0, x1, y, h=18):
    o = [R(x0, y - h - 26, x1 - x0, h, "#4c4f57", 2, h / 2)]
    for k in range(int((x1 - x0) // 30)):
        o.append(C(x0 + 15 + k * 30, y - 26 - h / 2, 5, "#9aa0a8", 1.2))
    o.append(R(x0 + 10, y - 26, 8, 26, "#4c4f57", 1.6) + R(x1 - 18, y - 26, 8, 26, "#4c4f57", 1.6))
    return "".join(o)


def screen(x, y, w, h, glow="#7fe0ff"):
    return R(x, y, w, h, "#23262e", 2, 4) + R(x + 6, y + 6, w - 12, h - 12, glow, 0, 2, extra='opacity="0.85"')


def crack(x, y, s=1.0):
    d = f"M {x},{y} l {8*s},{10*s} l {-6*s},{8*s} l {10*s},{12*s} l {-4*s},{10*s} M {x+8*s},{y+10*s} l {12*s},{-4*s}"
    return P(d, "none", 2.2, DAMAGE)


def spark(x, y, r=12):
    pts = []
    import math
    for i in range(16):
        a = i * math.pi / 8
        rr = r if i % 2 == 0 else r * 0.4
        pts.append(f"{x + rr*math.cos(a):.1f},{y + rr*math.sin(a):.1f}")
    return P("M " + " L ".join(pts) + " Z", "#ffd84a", 1.4)


def smoke(x, y, s=1.0):
    return "".join(C(x + dx * s, y + dy * s, r * s, "#8b8f96", 1.4, extra='opacity="0.75"')
                   for dx, dy, r in ((0, 0, 14), (14, -10, 12), (-10, -16, 10), (6, -26, 9)))


def ball(x, y, r=9, fill="#e2453c"):
    return C(x, y, r, fill, 1.6)
