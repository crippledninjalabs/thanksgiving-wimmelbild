"""Floor 2: R13 Optimus Workshop, R14 Raptor Machine Shop, R15 Grok Bot Nursery, R16 Server Room."""
from common import R, C, E, P, T, use, sprite, machine, table, shelf, FIG
import cast


def r13(x0, y0, x1, fy):  # assembly stand, egg bucket brigade, yellow portal exit
    o = [R(x0 + 60, fy - 300, 20, 300, "#4c4f57", 1.6) + R(x0 + 60, fy - 300, 120, 16, "#4c4f57", 1.6), use("opt", x0 + 150, fy - 30, 1)]
    for k in range(3):
        x = x0 + 360 + k * 140
        o.append(use("opt_carry", x, fy, 1))
        o.append(R(x + 40, fy - 140, 26, 26, "#b7bec6", 1.4) + E(x + 53, fy - 142, 9, 11, "#fbf3e0", 1))
    o += [cast.portal(x1 - 120, fy - 140, 50, 66, "yellow"), C(x1 - 180, fy - 120, 14, "#9aa0a8", 1.6),
          T(x1 - 200, fy - 230, "yellow: parts", 18, fill="#8a6a00"), use("grok", x1 - 260, fy, 1, True)]
    return o


def r14(x0, y0, x1, fy):  # boing press, engine bell
    o = [R(x0 + 60, y0 + 40, 260, 60, "#5a6070", 2) + R(x0 + 160, y0 + 100, 60, 200, "#9aa0a8", 1.8)
         + P(f"M {x0+190},{y0+300} " + " ".join("l 30,10 l -60,20 l 30,10" for _ in range(3)), "none", 3) + R(x0 + 60, fy - 80, 260, 80, "#5a6070", 2)]
    o.append(P(f"M {x0+520},{fy-320} L {x0+600},{fy-320} L {x0+680},{fy-60} L {x0+440},{fy-60} Z", "#7d848d", 2) + R(x0 + 450, fy - 60, 220, 60, "#4c4f57", 1.6))
    o += [use("opt", x0 + 380, fy, 1), use("opt", x0 + 760, fy, 1, True), cast.person(x0 + 900, fy, "#e2a043", "#3b4250", hat=R(-20, -194, 40, 14, "#f5c518", 1.4))]
    return o


def r15(x0, y0, x1, fy):  # ball pit, 6 Grok minis
    o = [R(x0 + 100, fy - 90, 600, 90, "#f2c94c", 2, 10)]
    cols = ("#e2453c", "#5aa0d8", "#a8f55a", "#f5c518", "#c07ad8")
    o += [C(x0 + 120 + (k * 37) % 560, fy - 90 - (k % 3) * 12, 12, cols[k % 5], 1) for k in range(30)]
    o += [use("grok", x0 + 160 + k * 110, fy - 80 - (k % 2) * 30, 0.7, k % 2 == 1) for k in range(6)]
    o += [use("opt", x0 + 860, fy, 1, True), C(x0 + 860, y0 + 120, 40, "#fff3a0", 2) + T(x0 + 830, y0 + 128, "^_^", 20)]
    return o


def r16(x0, y0, x1, fy):  # Grok core racks, Evil Morty rerouting
    o = []
    for k in range(5):
        x = x0 + 60 + k * 120
        o.append(R(x, fy - 380, 100, 380, "#23262e", 2, 4))
        o += [R(x + 15, fy - 360 + j * 34, 70, 6, "#5ff0ff", 0, extra='opacity="0.8"') for j in range(10)]
    cx = x0 + 760
    o.append(C(cx, fy - 260, 70, "#5ff0ff", 2.4, extra='fill-opacity="0.85"') + C(cx, fy - 260, 30, "#ffffff", 0) + T(cx, fy - 160, "GROK CORE", 20, "middle", fill="#1d1f25"))
    o += [P(f"M {cx+70},{fy-260} C {cx+140},{fy-260} {cx+160},{fy-100} {cx+240},{fy-100}", "none", 6, "#c0413a"),
          machine(x1 - 200, fy, 140, 120, "#3a3f48", 1, "#c0413a"),
          sprite(cast.morty("#2a2d35", "#1d1f25", "#2a2d35", cast.EVIL, P("M -60,-500 L 0,-500 L 0,-430 L -60,-430 Z", "#1d1f25", 6)), x1 - 270, fy, FIG),
          use("grok", x0 + 700, fy, 1, True)]
    return o


ROOMS = {"R13": r13, "R14": r14, "R15": r15, "R16": r16}
