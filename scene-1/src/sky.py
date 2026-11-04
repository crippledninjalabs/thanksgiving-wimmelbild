"""Sky: dusk gradient, stars, moon, clouds, satellites on orbit tracks, far-off
Starship dropping a satellite, birds. Everything above the building / beside the tower."""
import math
import random
from common import W, GROUND, R, C, E, P, T, INK

SAT_SPOTS = [  # x, y, scale, rotation, orbit tilt
    (520, 260, 1.0, -12, 8), (1500, 520, 0.8, 20, -6), (2200, 170, 1.2, 5, 4), (3050, 610, 0.7, -25, 10),
    (3900, 260, 1.0, 14, -8), (4700, 520, 0.9, -8, 5), (5000, 130, 0.6, 30, -4), (7400, 420, 0.9, -18, 6),
    (7350, 1200, 0.7, 10, -5),
]


def satellite(x, y, s=1.0, rot=0):
    o = [P("M -70,0 L 70,0", "none", 2.4)]
    for sx in (-1, 1):
        x0 = 22 if sx > 0 else -68
        o.append(R(x0, -14, 46, 28, "#2f5fa8", 1.6, 2) + P(f"M {x0+15},-14 L {x0+15},14 M {x0+31},-14 L {x0+31},14", "none", 1, "#9cc4ff"))
    o.append(R(-16, -18, 32, 36, "#e0b24a", 1.8, 3) + R(-16, -18, 12, 36, "#c3922c", 0))
    o.append(P("M 0,-18 L 0,-34", "none", 1.6) + E(0, -38, 10, 5, "#e9ecef", 1.4))
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})">{"".join(o)}</g>'


def far_starship(x, y, s=1.0, rot=0):
    """Tiny Starship far out, payload door open, satellite drifting out, plume."""
    o = [P("M -10,60 C -14,90 -6,130 0,150 C 6,130 14,90 10,60 Z", "#ffd27a", 0, extra='opacity="0.9"'),
         P("M -16,60 L -16,-60 C -16,-90 -6,-108 0,-112 C 6,-108 16,-90 16,-60 L 16,60 Z", "#d7dbe0", 1.6),
         P("M -16,-70 L -26,-52 L -16,-46 Z M 16,-70 L 26,-52 L 16,-46 Z M -16,46 L -28,64 L -16,60 Z M 16,46 L 28,64 L 16,60 Z", "#3a3f48", 1.2),
         R(-16, -40, 10, 30, "#20242c", 1.2)]
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})">{"".join(o)}</g>'


def cloud(x, y, s=1.0):
    blobs = ((0, 0, 60), (55, -20, 50), (110, 0, 55), (60, 15, 50), (-50, 10, 40))
    o = "".join(C(x + dx * s, y + dy * s, r * s, "#f7d9c4", 0) for dx, dy, r in blobs)
    return f'<g opacity="0.75">{o}</g>'


def draw():
    o = ['<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">'
         '<stop offset="0" stop-color="#121a3d"/><stop offset="0.35" stop-color="#2c3b7a"/>'
         '<stop offset="0.7" stop-color="#8c76b0"/><stop offset="1" stop-color="#f3b58a"/></linearGradient></defs>',
         R(0, 0, W, GROUND, "url(#sky)", 0)]
    rnd = random.Random(7)
    for _ in range(260):
        x, y = rnd.uniform(0, W), rnd.uniform(0, 1500) ** 1.0
        if y > 900 and x < 5100:
            continue
        o.append(C(x, y, rnd.choice((1.6, 2.2, 3.0)), "#fffbe8", 0, extra=f'opacity="{rnd.uniform(0.4, 1):.2f}"'))
    o.append(C(1080, 300, 90, "#f4f1de", 2, "#d9d4bc") + C(1050, 280, 18, "#e2dec6", 0) + C(1110, 330, 12, "#e2dec6", 0))
    for x, y, s in ((300, 760, 1.2), (4200, 760, 1.0), (4700, 1500, 1.3), (5150, 2300, 1.1), (7450, 2000, 1.0), (2600, 820, 0.8)):
        o.append(cloud(x, y, s))
    # satellites with dashed orbit tracks (they shuttle back and forth along these)
    for x, y, s, rot, tilt in SAT_SPOTS:
        o.append(P(f"M {x-420},{y+tilt*20} Q {x},{y-tilt*6} {x+420},{y-tilt*20}", "none", 2, "#bcd4ff",
                   'stroke-dasharray="10 12" opacity="0.55"'))
        o.append(satellite(x, y, s, rot))
    # far-off Starship dropping a satellite, then zooming away
    fx, fy = 3420, 330
    o.append(P(f"M {fx+40},{fy+40} Q {fx-120},{fy+150} {fx-300},{fy+170}", "none", 2.4, "#ffe9b0", 'stroke-dasharray="4 10"'))
    o.append(far_starship(fx, fy, 0.9, 38))
    o.append(satellite(fx - 20, fy + 120, 0.55, -30))
    o.append(P(f"M {fx-60},{fy+150} l -18,8 M {fx-50},{fy+165} l -18,8", "none", 2, "#ffe9b0"))
    o.append(T(fx + 60, fy + 120, "deploy!", 26, fill="#ffe9b0"))
    # birds
    for bx, by in ((600, 900), (640, 880), (690, 905), (4400, 1100), (4440, 1080)):
        o.append(P(f"M {bx-10},{by} q 5,-8 10,0 q 5,-8 10,0", "none", 2.2, INK))
    return "".join(o)
