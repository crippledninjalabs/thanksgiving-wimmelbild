"""R04 Mission Control (showcase #2): approved style-sheet Elon at the console,
big screen, LAUNCH button, green portal B delivering the cranberry."""
import elon
from common import R, C, E, P, T, use, screen, table, scaled, sprite, FIG, FIG_K, TITLE_FONT, txt
import cast


def draw(x0, y0, x1, fy):
    o = []
    # big wall screen: live feed of the stack + countdown
    sx0, sx1 = x0 + 260, x1 - 160
    o.append(R(sx0, y0 + 50, sx1 - sx0, 250, "#1d1f25", 2.4, 8) + R(sx0 + 12, y0 + 62, sx1 - sx0 - 24, 226, "#16324a", 0, 4))
    cx = sx0 + 140
    o.append(R(cx - 14, y0 + 90, 28, 180, "#c9cdd3", 1.4, 10) + P(f"M {cx-14},{y0+100} Q {cx},{y0+70} {cx+14},{y0+100} Z", "#c9cdd3", 1.4))
    o.append(txt((sx0 + sx1) / 2 + 80, y0 + 190, "T-00:00:10", 64, "middle", "#7fe0ff", TITLE_FONT))
    o.append(P(f"M {sx0+300},{y0+250} " + " ".join(f"l 30,{(-1)**k * 20}" for k in range(16)), "none", 2.4, "#a8f55a"))
    # console row with monitors
    o.append(R(x0 + 40, fy - 120, x1 - x0 - 80, 120, "#5a6070", 2, 6) + R(x0 + 40, fy - 120, x1 - x0 - 80, 16, "#8a909a", 0))
    for k in range(5):
        o.append(screen(x0 + 80 + k * 210, fy - 230, 140, 90, ("#7fe0ff", "#a8f55a", "#fff3a0", "#7fe0ff", "#ffab55")[k]))
    # LAUNCH button on Elon's console
    bx = x0 + 760
    o.append(R(bx - 50, fy - 150, 100, 30, "#2a2d35", 1.8, 4) + E(bx, fy - 156, 34, 14, "#e2453c", 2) + T(bx, fy - 126, "LAUNCH", 18, "middle", fill="#fbfaf6"))
    # operators, Grok bot, Elon (approved style-sheet sprite)
    o += [cast.person(x0 + 300, fy, "#3a3f48", "#2c3d47", hair="#2a2320"), cast.person(x0 + 1080, fy, "#5a7fb0", "#3b4250", hair="#8a5a2b", flip=True),
          use("grok", x0 + 520, fy, 1, True)]
    with scaled(FIG_K):
        o.append(sprite(elon.elon_34(), x0 + 640, fy, FIG))
    # green portal B: the cranberry pops out onto the console
    o.append(cast.portal(bx + 150, fy - 270, 50, 66, "green"))
    o.append(C(bx + 90, fy - 220, 12, "#c41e3a", 1.6) + P(f"M {bx+110},{fy-240} l 14,-6 M {bx+112},{fy-226} l 16,0", "none", 2))
    o.append(T(bx + 120, fy - 350, "green B", 18, fill="#1f9a3a"))
    return o
