"""Floor 5: R01 Uplink Room, R02 Programmers' Loft, R03 Drone Hangar (R04 is control.py)."""
from common import R, C, E, P, T, use, sprite, machine, table, screen, shelf, FIG
import cast


def r01(x0, y0, x1, fy):  # racks + egg trampoline
    o = []
    for k in range(4):
        x = x0 + 40 + k * 110
        o.append(R(x, fy - 300, 90, 300, "#2f343d", 2, 4))
        o += [C(x + 20 + (j % 3) * 25, fy - 270 + (j // 3) * 40, 4, ("#5ff0ff", "#a8f55a", "#e2453c")[j % 3], 0) for j in range(15)]
    tx = x0 + 620
    o.append(P(f"M {tx-90},{fy} L {tx-80},{fy-50} M {tx+90},{fy} L {tx+80},{fy-50}", "none", 4) + E(tx, fy - 50, 95, 14, "#4c4f57", 2))
    o += [E(tx - 30 + k * 30, fy - 140 - k * 60, 12, 16, "#fbf3e0", 1.6) for k in range(3)]
    o += [use("opt", x0 + 830, fy, 1, True), use("grok", tx + 120, fy, 1), use("grok", x0 + 500, fy, 0.9, True)]
    return o


def r02(x0, y0, x1, fy):  # coders teach bots; Hipster Morty
    o = [R(x0 + 60, y0 + 90, 360, 200, "#fbfaf6", 2, 4),
         P(f"M {x0+90},{y0+200} L {x0+160},{y0+140} L {x0+230},{y0+230} L {x0+330},{y0+130}", "none", 3, "#2e8ff0"),
         T(x0 + 90, y0 + 130, "if turkey: gobble()", 22, fill="#2a3a5a")]
    for k in range(3):
        dx = x0 + 500 + k * 260
        o += [table(dx, fy, 200), screen(dx + 40, fy - 140, 120, 80, "#a8f55a" if k == 1 else "#7fe0ff")]
    o += [cast.person(x0 + 560, fy, "#3a3f48", "#2c3d47", hair="#2a2320"),
          cast.person(x0 + 820, fy, "#c0413a", "#3b4250", hair="#d9a441", flip=True, arm_up=True),
          use("grok", x0 + 200, fy, 1), use("grok", x0 + 290, fy, 1, True), use("opt", x0 + 380, fy, 1, True),
          sprite(cast.morty("#7a9a5a", "#4a3a2a", "#6b4a2e", cast.BEANIE, cast.GLASSES), x0 + 1120, fy, FIG, flip=True),
          T(x0 + 1040, fy - 190, "liked rockets before", 18, fill="#5a6070")]
    return o


def r03(x0, y0, x1, fy):  # 3 drones, roof hatch, pads
    o = [R(x0 + 330, y0 - 2, 200, 14, "#a7d3ff", 1.6)]
    for k in range(3):
        px = x0 + 120 + k * 330
        o.append(E(px, fy - 6, 90, 10, "#e2a043", 1.6))
        o.append(use("drone", px, fy - 140 - k * 70, 1.4))
    o += [P(f"M {x0+120},{fy-130} L {x0+120},{fy-60}", "none", 1.4) + R(x0 + 100, fy - 60, 40, 30, "#c09060", 1.4),
          use("opt", x0 + 260, fy, 1), use("grok", x0 + 900, fy, 1, True), shelf(x0 + 760, fy, 160, 200, 2)]
    return o


ROOMS = {"R01": r01, "R02": r02, "R03": r03}
