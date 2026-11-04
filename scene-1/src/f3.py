"""Floor 3: R09 Robot Kitchen, R10 Gravy & Sauce Lab, R11 Cold Pantry, R12 Feather Lab."""
from common import R, C, E, P, T, use, sprite, machine, table, shelf, FIG
import cast
from f4 import roast


def arm(x, y0, reach, drop):
    return (R(x - 20, y0, 40, 16, "#4c4f57", 1.6) + P(f"M {x},{y0+16} L {x+reach*0.5},{y0+drop*0.6} L {x+reach},{y0+drop}", "none", 12, "#e2a043")
            + C(x + reach * 0.5, y0 + drop * 0.6, 8, "#4c4f57", 1.4) + P(f"M {x+reach-10},{y0+drop+14} L {x+reach},{y0+drop} L {x+reach+10},{y0+drop+14}", "none", 3))


def r09(x0, y0, x1, fy):  # 4 arms, turkey on spit, orange portal exit
    sx = x0 + 600
    o = [R(sx - 120, fy - 60, 240, 60, "#4c4f57", 2, 4) + "".join(P(f"M {sx-90+k*45},{fy-60} q 10,-40 20,0", "#f27c1c", 1.4) for k in range(5)),
         P(f"M {sx-150},{fy-150} L {sx+150},{fy-150}", "none", 4) + R(sx - 160, fy - 160, 10, 100, "#4c4f57", 1.4) + R(sx + 150, fy - 160, 10, 100, "#4c4f57", 1.4),
         roast(sx, fy - 120, 1.1)]
    for k, x in enumerate((x0 + 200, x0 + 420, x0 + 800, x0 + 1000)):
        o.append(arm(x, y0, 80 if k % 2 else -60, 200 + k * 20))
    o += [table(x0 + 1060, fy, 220), use("opt", x0 + 1180, fy, 1, True), use("grok", x0 + 90, fy, 1),
          cast.portal(x0 + 260, fy - 120, 46, 62, "orange"), C(x0 + 310, fy - 110, 14, "#9aa0a8", 1.6), T(x0 + 200, fy - 200, "orange: parts", 18, fill="#b3500a")]
    return o


def r10(x0, y0, x1, fy):  # gravy vat, distiller; a Rick in goggles
    o = [P(f"M {x0+80},{fy} L {x0+60},{fy-220} L {x0+300},{fy-220} L {x0+280},{fy} Z", "#b7bec6", 2) + E(x0 + 180, fy - 220, 120, 18, "#8a5a2b", 2)]
    o.append(P(f"M {x0+420},{fy-60} " + " ".join(f"q 30,-20 0,-40 q -30,-20 0,-40" for _ in range(3)), "none", 4, "#c9782e"))
    o.append(E(x0 + 420, fy - 330, 50, 40, "#cfefff", 2) + R(x0 + 400, fy - 60, 40, 60, "#b7bec6", 1.6))
    o += [shelf(x0 + 560, fy, 200, 260, 3, "#b98c5a", ("#8a5a2b", "#c41e3a", "#e8a65a")),
          sprite(cast.rick(arm_up=True), x0 + 330, fy, FIG), use("opt", x0 + 640, fy, 1, True)]
    return o


def r11(x0, y0, x1, fy):  # frosty shelves, berry slalom
    o = [shelf(x0 + 40, fy, 260, 420, 4, "#cfe6f2", ("#c41e3a", "#f2c94c", "#7a9a5a")),
         P(f"M {x0+360},{y0+80} L {x0+700},{y0+180} L {x0+400},{y0+280} L {x0+700},{y0+380} L {x0+420},{fy-60}", "none", 10, "#a7d3ff")]
    o += [C(x0 + 380 + (k * 70) % 300, y0 + 100 + k * 50, 9, "#c41e3a", 1.2) for k in range(7)]
    o += [use("opt_carry", x0 + 800, fy, 1, True), R(x0 + 820, fy - 150, 50, 30, "#c41e3a", 1.4, 4), use("grok", x0 + 560, fy, 1),
          "".join(P(f"M {x0+60+k*90},{y0+30} l 8,16 l 8,-16", "none", 2, "#ffffff") for k in range(10))]
    return o


def r12(x0, y0, x1, fy):  # wind tunnel w/ floating turkey, egg column
    tx0, tx1 = x0 + 60, x0 + 760
    o = [R(tx0, fy - 340, tx1 - tx0, 260, "#cfefff", 2.4, 30, extra='fill-opacity="0.55"'),
         C(tx0 + 40, fy - 210, 90, "#9aa0a8", 2) + P(f"M {tx0+40},{fy-290} L {tx0+40},{fy-130} M {tx0-40},{fy-210} L {tx0+120},{fy-210}", "none", 6, "#4c4f57"),
         use("turkey", tx0 + 420, fy - 160, 1.3), R(tx0 + 100, fy - 80, 600, 80, "#9aa0a8", 1.6)]
    o += [P(f"M {tx0+200+k*60},{fy-260+k*20} l 30,0", "none", 2, "#5a6070") for k in range(6)]
    o += [R(x1 - 200, y0 + 60, 70, fy - y0 - 60, "#e9ecef", 2, 30)] + [E(x1 - 165, y0 + 120 + k * 80, 18, 24, "#fbf3e0", 1.4) for k in range(5)]
    o += [cast.person(x1 - 320, fy, "#f4f6f8", "#3b4250", hair="#8a5a2b"), use("grok", x1 - 60, fy, 1, True)]
    return o


ROOMS = {"R09": r09, "R10": r10, "R11": r11, "R12": r12}
