"""R19 Parts Rick's Garage (showcase #1), modelled on Rick's garage from the show:
pegboard tool walls (one panel mid-flip to a weapon rack), cluttered workbench,
hanging bulb, shelves, roll-up garage door. Parts Rick feeds parts into the
yellow / orange / blue entry portals (exits: R13, R09, rocket decks)."""
from common import R, C, E, P, T, use, sprite, shelf, FIG, INK
import cast

PEG, PEG_S = "#b98c5a", "#9c7346"


def pegboard(x, y, w, h):
    o = [R(x, y, w, h, PEG, 2, 3)]
    o += [C(x + 12 + i * 20, y + 12 + j * 20, 2, PEG_S, 0) for i in range(int((w - 10) // 20)) for j in range(int((h - 10) // 20))]
    # tool silhouettes hung on hooks
    tools = [P(f"M {x+30},{y+30} l 0,80 m -12,-80 l 24,0", "none", 7, "#3a3f48"),                                   # screwdriver
             P(f"M {x+80},{y+30} l 0,90 m -18,-90 l 36,0 l 0,20 l -36,0 Z", "#7d848d", 2),                          # hammer
             P(f"M {x+140},{y+30} l 10,100 m -22,-110 a 14,14 0 1 1 26,0", "none", 6, "#9aa0a8"),                    # wrench
             P(f"M {x+190},{y+40} l 70,0 l 0,30 l -70,8 Z", "#c9cdd3", 1.6) + R(x + 170, y + 36, 24, 36, "#c0413a", 1.4, 4)]  # saw
    o += tools
    o.append(P(f"M {x+20},{y+h-60} q 40,-50 80,0 q 40,50 80,0", "none", 4, "#e2a043"))  # hose loop
    return "".join(o)


def weapon_panel(x, y, w, h):
    """Pegboard panel mid-flip: back side is a weapon rack (show gag)."""
    o = [f'<g transform="translate({x},{y}) skewY(-8)">', R(0, 0, w, h, "#2a2d35", 2, 3)]
    for k in range(3):
        yy = 40 + k * 80
        o.append(R(14, yy, w - 40, 18, "#9aa0a8", 1.4, 6) + C(w - 24, yy + 9, 8, "#a8f55a", 1.2) + R(30, yy + 18, 12, 22, "#4c4f57", 1))
    o.append("</g>")
    return "".join(o)


def draw(x0, y0, x1, fy):
    o = [R(x0, y0, x1 - x0, fy - y0, "#b9c2b2", 0), R(x0, fy - 40, x1 - x0, 40, "#8f9488", 0),
         E(x0 + 520, fy - 10, 90, 10, "#6f7468", 0, extra='opacity="0.6"')]
    o.append(pegboard(x0 + 30, y0 + 60, 300, 250))
    o.append(weapon_panel(x0 + 345, y0 + 70, 110, 250))
    # roll-up garage door on the right wall
    o.append(R(x1 - 70, y0 + 60, 62, fy - y0 - 60, "#dcd6c8", 2) + "".join(P(f"M {x1-70},{y0+100+k*44} l 62,0", "none", 1.6) for k in range(11)))
    # workbench with clutter + vise
    bx0, bx1 = x0 + 30, x0 + 470
    o.append(R(bx0, fy - 150, bx1 - bx0, 20, "#8a5a2b", 2) + R(bx0 + 10, fy - 130, 16, 130, "#6b4a2e", 1.6) + R(bx1 - 26, fy - 130, 16, 130, "#6b4a2e", 1.6)
             + R(bx0 + 30, fy - 60, bx1 - bx0 - 60, 12, "#6b4a2e", 1.4))
    o.append(R(bx0 + 30, fy - 186, 50, 36, "#4c4f57", 1.6) + R(bx0 + 100, fy - 200, 30, 50, "#5aa0d8", 1.4, 4) + E(bx0 + 170, fy - 162, 30, 12, "#a8f55a", 1.6)
             + R(bx0 + 230, fy - 214, 70, 64, "#7d848d", 1.6, 6) + C(bx0 + 265, fy - 190, 14, "#e2453c", 1.2) + R(bx0 + 330, fy - 176, 80, 26, "#c9cdd3", 1.4, 8)
             + R(bx0 + 340, fy - 50, 60, 50, "#c09060", 1.4) + R(bx0 + 50, fy - 46, 50, 46, "#4c4f57", 1.4, 6))
    # hanging bulb
    o.append(P(f"M {x0+300},{y0} L {x0+300},{y0+40}", "none", 2) + C(x0 + 300, y0 + 52, 14, "#fff3a0", 1.6) + C(x0 + 300, y0 + 52, 40, "#fff3a0", 0, extra='opacity="0.3"'))
    # parts hopper/dispenser Rick works, chute out to the portals
    hx = x0 + 600
    o.append(P(f"M {hx-70},{y0+80} L {hx+70},{y0+80} L {hx+30},{y0+170} L {hx-30},{y0+170} Z", "#9aa0a8", 2) + R(hx - 30, y0 + 170, 60, 80, "#7d848d", 2))
    o.append(P(f"M {hx+30},{y0+230} L {x1-200},{y0+300}", "none", 12, "#4c4f57"))
    o += [C(hx - 30 + k * 20, y0 + 72, 10, ("#9aa0a8", "#d9a441", "#c9cdd3")[k % 3], 1.2) for k in range(4)]
    # three entry portals (colour = where the part comes out)
    o.append(cast.portal(x1 - 190, y0 + 250, 44, 58, "blue") + T(x1 - 230, y0 + 175, "to rocket", 16, fill="#1556b8"))
    o.append(cast.portal(x1 - 160, fy - 230, 36, 48, "yellow") + cast.portal(x1 - 260, fy - 120, 36, 48, "orange"))
    o.append(C(x1 - 245, y0 + 270, 14, "#d9a441", 1.6) + C(x1 - 245, y0 + 270, 5, "#fbfaf6", 1) + R(x1 - 220, fy - 236, 22, 12, "#9aa0a8", 1.2))
    # Parts Rick at the dispenser lever, a box of parts at his feet
    o.append(sprite(cast.rick(detail=True, arm_up=True), x0 + 560, fy, FIG))
    o.append(R(x0 + 640, fy - 60, 80, 60, "#c09060", 1.6) + "".join(C(x0 + 655 + k * 16, fy - 64, 7, "#9aa0a8", 1) for k in range(4)))
    return o
