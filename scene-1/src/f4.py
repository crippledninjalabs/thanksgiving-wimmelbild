"""Floor 4: R05 Banquet Hall, R06 Pie Bakery, R07 Restroom, R08 Charging Closet."""
from common import R, C, E, P, T, use, sprite, machine, table, conveyor, shelf, FIG
import cast


def roast(x, y, s=1.0):
    return (E(x, y, 70 * s, 14 * s, "#e9ecef", 1.6) + E(x, y - 26 * s, 52 * s, 34 * s, "#c9782e", 1.8)
            + E(x - 14 * s, y - 36 * s, 20 * s, 10 * s, "#e8a65a", 0))


def r05(x0, y0, x1, fy):  # 5 diners, roast, cranberry fountain, waiter
    cx = (x0 + x1) / 2
    o = [P(f"M {cx},{y0} L {cx},{y0+70}", "none", 2) + E(cx, y0 + 90, 90, 24, "#e2c35a", 1.8)
         + "".join(C(cx - 70 + k * 35, y0 + 116, 6, "#fff3a0", 1) for k in range(5))]
    o.append(R(x0 + 200, fy - 120, 1500, 16, "#f4f1e6", 2, 3) + R(x0 + 220, fy - 104, 14, 104, "#6b4a2e", 1.4) + R(x0 + 1670, fy - 104, 14, 104, "#6b4a2e", 1.4))
    o.append(roast(cx, fy - 122))
    o += [E(x0 + 600 + k * 260, fy - 124, 30, 7, "#fbfaf6", 1.2) for k in range(4)]
    diners = [("#5a7fb0", False), ("#c0413a", False), ("#7a9a5a", True), ("#d9a441", True)]
    for k, (shirt, fl) in enumerate(diners):
        o.append(cast.person(x0 + 450 + k * 300 + (60 if fl else 0), fy, shirt, "#3b4250", hair=("#4a3d36", "#d9a441", "#2a2320", "#8a5a2b")[k], flip=fl))
    o.append(sprite(cast.rick(), x0 + 1600, fy, FIG, flip=True))  # a visiting Rick diner
    # cranberry fountain (C2 exit)
    fx = x0 + 2000
    o.append(R(fx - 14, fy - 220, 28, 220, "#b7bec6", 1.8) + E(fx, fy - 40, 100, 26, "#c41e3a", 2) + E(fx, fy - 150, 60, 16, "#c41e3a", 2) + E(fx, fy - 222, 30, 10, "#c41e3a", 2))
    o += [use("opt_carry", x0 + 1850, fy, 1, True), use("grok", x0 + 130, fy, 1)]
    return o


def r06(x0, y0, x1, fy):  # pie conveyor, 2 bakers, Chef Morty kept away
    o = [conveyor(x0 + 60, x1 - 260, fy)]
    for k in range(6):
        px = x0 + 100 + k * 100
        o.append(E(px, fy - 54, 34, 10, "#e8a65a", 1.6) + E(px, fy - 60, 28, 7, "#c9782e", 0))
    o.append(machine(x1 - 240, fy, 220, 260, "#b7bec6", 2) + R(x1 - 210, fy - 200, 160, 90, "#f27c1c", 1.6, 6))
    o += [use("opt", x0 + 260, fy, 1), use("opt", x0 + 560, fy, 1, True),
          P(f"M {x0+240},{fy-200} C {x0+230},{fy-244} {x0+290},{fy-244} {x0+280},{fy-200} Z", "#fff", 1.6),
          P(f"M {x0+540},{fy-200} C {x0+530},{fy-244} {x0+590},{fy-244} {x0+580},{fy-200} Z", "#fff", 1.6),
          sprite(cast.morty(hat=cast.CHEF), x0 + 790, fy, FIG, flip=True), T(x0 + 700, y0 + 120, "NO MORTYS", 22, fill="#c0413a")]
    return o


def r07(x0, y0, x1, fy):  # mirror, egg wash
    o = [R(x0 + 40, y0 + 120, 200, 140, "#cfefff", 2, 4) + P(f"M {x0+70},{y0+150} L {x0+120},{y0+130}", "none", 3, "#fff"),
         R(x0 + 40, fy - 120, 220, 24, "#f4f6f8", 1.8, 4), R(x1 - 200, y0 + 140, 180, fy - y0 - 140, "#9fb4c8", 2, 4)]
    o.append(E(x0 + 360, fy - 70, 80, 30, "#e9ecef", 2) + "".join(E(x0 + 320 + k * 30, fy - 92, 11, 14, "#fbf3e0", 1.4) for k in range(3)))
    o += [use("grok", x0 + 470, fy, 1, True), cast.person(x0 + 160, fy, "#7a9a5a", "#3b4250", hair="#2a2320")]
    return o


def r08(x0, y0, x1, fy):  # 3 sleeping Optimus on chargers
    o = []
    for k in range(3):
        x = x0 + 120 + k * 230
        o.append(R(x - 50, fy - 260, 100, 260, "#3a3f48", 2, 6) + C(x + 30, fy - 240, 6, "#a8f55a", 0))
        o.append(use("opt", x, fy, 1.0))
        o.append(cast.zz(x + 20, fy - 220))
    return o


ROOMS = {"R05": r05, "R06": r06, "R07": r07, "R08": r08}
