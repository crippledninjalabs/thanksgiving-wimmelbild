"""Floor 1: R17 Warehouse, R18 Boiler & Fuel, R20 Rocket Bay (R19 is garage.py)."""
from common import R, C, E, P, T, use, sprite, machine, conveyor, shelf, FIG
import cast


def r17(x0, y0, x1, fy):  # plinko crates, forklift, Cop Morty
    o = [R(x0 + 40, y0 + 80, 380, fy - y0 - 80, "#00000010", 2)]
    o += [C(x0 + 70 + (k % 6) * 60 + (30 if (k // 6) % 2 else 0), y0 + 120 + (k // 6) * 70, 5, "#4c4f57", 0) for k in range(30)]
    o += [R(x0 + 60 + k * 70, fy - 50, 60, 50, "#c09060", 1.6) for k in range(5)]
    o.append(R(x0 + 200, y0 + 200, 40, 40, "#c09060", 1.6, extra=f'transform="rotate(20 {x0+220} {y0+220})"'))
    fx = x0 + 640  # forklift bot
    o.append(R(fx, fy - 110, 160, 80, "#f5c518", 2, 8) + C(fx + 30, fy - 24, 22, "#2a2d35", 1.6) + C(fx + 130, fy - 24, 22, "#2a2d35", 1.6)
             + R(fx + 160, fy - 260, 12, 240, "#4c4f57", 1.4) + R(fx + 172, fy - 60, 70, 10, "#4c4f57", 1.4) + R(fx + 40, fy - 170, 70, 60, "#1f232b", 1.6, 8) + C(fx + 60, fy - 145, 5, "#5ff0ff", 0) + C(fx + 85, fy - 145, 5, "#5ff0ff", 0))
    o += [sprite(cast.morty("#2a3c66", "#1d2a4a", "#1d1f25", cast.COP), x0 + 540, fy, FIG), R(x0 + 556, fy - 70, 24, 30, "#fbfaf6", 1.2),
          use("opt", x0 + 1000, fy, 1, True)]
    return o


def r18(x0, y0, x1, fy):  # tanks, boiler, steam whistle
    o = [R(x0 + 60, fy - 400, 180, 400, "#b0b5bc", 2, 60), R(x0 + 280, fy - 360, 160, 360, "#c9782e", 2, 50),
         machine(x0 + 500, fy, 260, 260, "#7d848d", 3), R(x0 + 610, fy - 330, 20, 70, "#d9a441", 1.6),
         "".join(C(x0 + 620 + k * 14, fy - 360 - k * 30, 14 + k * 4, "#f4f6f8", 1.4, extra='opacity="0.8"') for k in range(3))]
    o += [use("opt", x0 + 840, fy, 1, True), cast.person(x0 + 1000, fy, "#e2a043", "#2c3d47", hat=R(-20, -194, 40, 14, "#f5c518", 1.4))]
    return o


def r20(x0, y0, x1, fy):  # roll-up door, conveyor to pad, gantry
    o = [R(x1 - 60, y0 + 40, 50, fy - y0 - 40, "#9aa0a8", 2) + "".join(P(f"M {x1-60},{y0+60+k*30} l 50,0", "none", 1.4) for k in range(17)),
         conveyor(x0 + 100, x1 - 70, fy), R(x0 + 60, y0 + 40, x1 - x0 - 140, 20, "#4c4f57", 1.6) + P(f"M {x0+500},{y0+60} L {x0+500},{fy-200}", "none", 2) + R(x0 + 470, fy - 200, 60, 30, "#e2a043", 1.6)]
    o += [R(x0 + 200 + k * 260, fy - 104, 80, 60, "#c09060", 1.6) for k in range(4)]
    o += [use("opt", x0 + 360, fy, 1), use("opt_carry", x0 + 920, fy, 1), use("grok", x0 + 650, fy, 1, True)]
    return o


ROOMS = {"R17": r17, "R18": r18, "R20": r20}
