"""SPACEX building cutaway: shell, floor slabs, stairs (S1 exterior, S2 central),
wall lifts, pipes, roof deck (sign, dishes, hopper, berry gutter, Rick's pop-up
lab with green portal A). Room interiors come from the per-floor modules via
ROOM_FNS; each room is one function so it can be deepened on its own later."""
from common import (ROOMS, FLOORS, WALL, BX0, BX1, S2, SLAB, X, box, R, C, E, P, T, INK, plaque, use, sprite,
                    FIG, BRICK, BRICK_S, TITLE_FONT, txt)
import cast
import f5, f4, f3, f2, f1, control, garage

ROOM_FNS = {**f5.ROOMS, **f4.ROOMS, **f3.ROOMS, **f2.ROOMS, **f1.ROOMS, "R04": control.draw, "R19": garage.draw}
ROOF = FLOORS[5][0]


def stairs_s2():
    o = [R(S2[0], ROOF, S2[1] - S2[0], FLOORS[1][1] - ROOF, "#d8d2c4", 0)]
    for fl, (y0, y1) in FLOORS.items():
        a, b = (S2[0] + 10, S2[1] - 10) if fl % 2 else (S2[1] - 10, S2[0] + 10)
        steps = 12
        d = f"M {a},{y1}"
        for k in range(steps):
            x = a + (b - a) * (k + 1) / steps
            y = y1 - (y1 - y0) * (k + 1) / steps
            d += f" L {a + (b-a)*k/steps:.0f},{y:.0f} L {x:.0f},{y:.0f}"
        o.append(P(d, "none", 3, "#6b6776"))
    o.append(T(S2[0] + 8, FLOORS[1][1] - 30, "S2", 20, fill="#6b6776"))
    return "".join(o)


def stairs_s1():
    o = [R(90, ROOF, 12, FLOORS[1][1] - ROOF, "#6b6776", 1.4)]
    for fl, (y0, y1) in FLOORS.items():
        o.append(P(f"M {100},{y1} L {BX0-24},{y0+40} M {100},{y1-60} L {BX0-24},{y0-20}", "none", 4, "#6b6776"))
        o.append(R(100, y0 + 30, BX0 - 124, 10, "#6b6776", 1.2))
    o.append(T(100, FLOORS[1][1] - 20, "S1", 20, fill="#2a3018"))
    return "".join(o)


def shell():
    top, bot = ROOF, FLOORS[1][1]
    o = [R(BX0 - 24, top - 30, BX1 - BX0 + 48, bot - top + 30, BRICK, 2.4)]
    for rid in ROOMS:
        x0, y0, x1, fy = box(rid)
        o.append(R(x0, y0, x1 - x0, fy - y0, WALL[ROOMS[rid][4]], 0))
        o.append(R(x0, fy - 60, x1 - x0, 60, "#00000010", 0))  # wainscot
    o.append(stairs_s2())
    return "".join(o)


def slabs_and_walls():
    o = []
    for fl, (y0, y1) in FLOORS.items():
        o.append(R(BX0 - 24, y1 - SLAB // 2, BX1 - BX0 + 48, SLAB, BRICK_S, 2))
    o.append(R(BX0 - 30, ROOF - 40, BX1 - BX0 + 60, SLAB + 28, BRICK_S, 2.4))
    for rid in ROOMS:  # partition walls between rooms
        _, fl, a, b, _ = ROOMS[rid]
        y0, y1 = FLOORS[fl]
        for mx in (a, b):
            o.append(R(X(mx) - 8, y0, 16, y1 - y0, BRICK_S, 1.6))
    o.append(R(BX0 - 24, ROOF - 30, 24, FLOORS[1][1] - ROOF + 30, BRICK_S, 2.4) + R(BX1, ROOF - 30, 24, FLOORS[1][1] - ROOF + 30, BRICK_S, 2.4))
    return "".join(o)


def connectors():
    o = []
    # Gobble Lift on the outer right wall
    o.append(R(BX1 + 24, FLOORS[4][0], 50, FLOORS[1][1] - FLOORS[4][0], "#e6e0ef", 2) + R(BX1 + 28, FLOORS[3][0] + 200, 42, 60, "#c0662a", 1.6))
    o.append(use("turkey", BX1 + 49, FLOORS[3][0] + 256, 0.55) + T(BX1 + 30, FLOORS[4][0] - 8, "Gobble Lift", 18))
    # steam riser (boiler -> machine shop), pneumatic tube (garage -> pantry), berry paternoster
    o.append(R(X(400), FLOORS[2][0] + 30, 18, FLOORS[1][1] - FLOORS[2][0] - 60, "#b0b5bc", 1.6, 9))
    o.append(R(X(600), FLOORS[3][0] + 60, 16, FLOORS[1][0] - FLOORS[3][0], "#cfefff", 1.6, 8, extra='fill-opacity="0.6"'))
    for k in range(6):
        o.append(C(X(600) + 8, FLOORS[3][0] + 120 + k * 210, 6, "#c41e3a", 1))
    return "".join(o)


def roof():
    y = ROOF - 40
    o = []
    # SPACEX sign on a frame
    sx0, sx1 = 2700, 4300
    o.append(P(f"M {sx0+80},{y} L {sx0+80},{y-150} M {sx1-80},{y} L {sx1-80},{y-150} M {sx0+80},{y} L {sx1-80},{y-150}", "none", 5, "#4c4f57"))
    o.append(R(sx0, y - 330, sx1 - sx0, 190, "#1d1f25", 2.4, 8))
    o.append(txt((sx0 + sx1) / 2, y - 180, "SPACEX", 150, "middle", "#f4f6f8", TITLE_FONT, 400, 'letter-spacing="18"'))
    # dishes + masts over the Uplink Room
    for k, x in enumerate((420, 700, 980)):
        o.append(P(f"M {x},{y} L {x},{y-70}", "none", 6, "#4c4f57"))
        o.append(f'<g transform="rotate({-30 + k*20} {x} {y-80})">{E(x, y - 80, 70, 26, "#e9ecef", 2)}{P(f"M {x},{y-80} L {x},{y-130}", "none", 2)}</g>')
    o.append(P(f"M 1150,{y} L 1150,{y-320} M 1120,{y-260} L 1180,{y-260} M 1130,{y-200} L 1170,{y-200}", "none", 4, "#4c4f57") + C(1150, y - 324, 8, "#e2453c", 1.4))
    # drone hatch over R03 (open) + drone leaving
    o.append(R(3000, y - 6, 200, 14, "#4c4f57", 1.6) + P(f"M 3200,{y} L 3300,{y-80}", "none", 8, "#6b6776"))
    o.append(use("drone", 3120, y - 160, 1.2))
    # roof hopper + berry gutter along the roof edge
    o.append(P(f"M 4500,{y} L 4440,{y-120} L 4700,{y-120} L 4640,{y} Z", "#b0b5bc", 2) + "".join(C(4480 + k * 26, y - 128, 10, "#c41e3a", 1) for k in range(9)))
    o.append(R(1300, y - 26, 3300, 14, "#a8b0b8", 1.6, 7) + "".join(C(1500 + k * 260, y - 26, 8, "#c41e3a", 1) for k in range(12)))
    # Rick's pop-up lab (above R02) with green portal A catching a berry off the gutter
    lx0, lx1 = 1560, 2150
    o.append(P(f"M {lx0},{y} L {lx0},{y-260} L {(lx0+lx1)/2},{y-330} L {lx1},{y-260} L {lx1},{y} Z", "#e9e3d6", 2.2, extra='fill-opacity="0.92"'))
    o.append(P(f"M {lx0},{y-260} L {(lx0+lx1)/2},{y-330} L {lx1},{y-260}", "none", 8, "#c0413a"))
    o.append(R(lx0 + 30, y - 70, 200, 12, "#a8774a", 1.6) + R(lx0 + 40, y - 58, 10, 58, "#6b4a2e", 1) + R(lx0 + 210, y - 58, 10, 58, "#6b4a2e", 1))
    o.append(C(lx0 + 80, y - 88, 16, "#cfefff", 1.6) + C(lx0 + 140, y - 92, 20, "#a8f55a", 1.6))
    o.append(sprite(cast.rick(gun=True, arm_up=True), lx0 + 300, y, FIG))
    o.append(cast.portal(lx1 + 120, y - 150, 60, 80, "green"))
    o.append(C(lx1 + 60, y - 120, 9, "#c41e3a", 1.4) + T(lx1 + 40, y - 250, "green A", 20, fill="#e4ffb0"))
    o.append(plaque(lx0 + 20, y - 250, "Rick's roof lab", 18))
    return "".join(o)


def labels():
    o = []
    for rid, (name, fl, a, b, _) in ROOMS.items():
        x0, y0, x1, fy = box(rid)
        o.append(plaque(x0 + 14, y0 + 12, f"{rid} {name}", 20))
    for fl, (y0, y1) in FLOORS.items():
        o.append(T(BX1 + 90, y0 + 50, f"F{fl}", 30, fill="#fbfaf6"))
    return "".join(o)


def draw():
    o = [shell()]
    for rid, fn in ROOM_FNS.items():
        o.append(f'<g id="{rid}">{"".join(fn(*box(rid)))}</g>')
    o += [slabs_and_walls(), stairs_s1(), connectors(), roof(), labels()]
    return "".join(o)
