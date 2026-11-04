"""Thanksgiving props: live turkey (safe and sassy), cranberry pile, roast on a platter."""
import math
import random
from lib import *
from rick import cranberry

T_BR, T_BR_S, T_BR_H = "#8b5a35", "#6a4126", "#a8744a"
FEATH = ["#c0662a", "#e3a043", "#7b4626", "#d4823a"]
FACE_B, SNOOD = "#a9d0ee", "#e2393f"
LEG = "#e08850"
ROAST, ROAST_S, ROAST_H, ROAST_D = "#cf7d33", "#a65a22", "#f2b46a", "#7d3d17"
PLATE, PLATE_S, RIM = "#f6f4ee", "#dcd8cd", "#5a7fb8"
LEAF, LEAF_S = "#5aa63c", "#3d7d28"


def live_turkey():
    o = [f'<ellipse cx="0" cy="2" rx="140" ry="14" fill="#d8d3c8"/>']
    # tail fan
    n = 11
    for i in range(n):
        ang = -80 + 160 * i / (n - 1)
        c = FEATH[i % 4]
        fe = "M -26,0 C -34,-60 -30,-130 0,-168 C 30,-130 34,-60 26,0 Z"
        sh = [("M -40,-150 L 40,-150 L 40,-176 L -40,-176 Z", "#f6e3b8"),
              ("M -40,-128 L 40,-128 L 40,-142 L -40,-142 Z", "#4a2a17"),
              ("M -40,-10 L -8,-10 L -6,-170 L -40,-170 Z", "#00000022")]
        o.append(f'<g transform="translate(0,-150) rotate({ang:.1f})">{part(fe, c, sh, w=4)}'
                 f'{line("M 0,-10 L 0,-150", 1.8, "#4a2a17")}</g>')
    # legs
    for x in (-30, 30):
        o.append(line(f"M {x},-70 L {x},-14", 7))
        o.append(line(f"M {x},-70 L {x},-14", 3.4, LEG, a=0))
        o.append(line(f"M {x},-14 L {x-22},0 M {x},-14 L {x},2 M {x},-14 L {x+22},0 M {x},-14 L {x+6},-24", 6))
        o.append(line(f"M {x},-14 L {x-22},0 M {x},-14 L {x},2 M {x},-14 L {x+22},0", 2.6, LEG, a=0))
    # body
    body = "M -88,-130 C -92,-190 -50,-214 0,-214 C 50,-214 92,-190 88,-130 C 86,-86 50,-58 0,-58 C -50,-58 -86,-86 -88,-130 Z"
    sh = [("M -110,-220 L -40,-220 C -64,-170 -60,-110 -20,-50 L -110,-50 Z", T_BR_S)]
    o.append(part(body, T_BR, sh))
    for row, y in enumerate((-150, -128, -106)):
        for k in range(5 - row):
            x = -44 + row * 11 + k * 22
            o.append(line(f"M {x-10},{y} C {x-8},{y+10} {x+8},{y+10} {x+10},{y}", 2.4))
    # wing holding a little sign (it's lobbying for pie)
    o.append(line("M 92,-260 L 96,-92", 6))
    o.append(line("M 92,-260 L 96,-92", 2.6, "#c79a64", a=0))
    o.append(part("M 30,-318 L 162,-322 L 160,-250 L 28,-246 Z", "#fdf6e3", [("M 20,-330 L 50,-330 L 46,-240 L 20,-240 Z", "#efe4c6")], w=4))
    o.append(f'<text x="95" y="-292" font-family="{TITLE_FONT}" font-size="26" text-anchor="middle" fill="#c41e3a" transform="rotate(-2 95 -292)">EAT</text>')
    o.append(f'<text x="95" y="-262" font-family="{TITLE_FONT}" font-size="26" text-anchor="middle" fill="#c41e3a" transform="rotate(-2 95 -262)">PIE!</text>')
    wing = "M 40,-170 C 70,-180 102,-160 100,-120 C 98,-100 82,-92 72,-100 C 60,-110 50,-130 40,-170 Z"
    o.append(part(wing, T_BR_H, [("M 60,-190 L 120,-190 L 120,-90 L 86,-90 C 92,-120 84,-150 60,-190 Z", T_BR)], w=4))
    o.append(line("M 64,-140 C 72,-136 80,-128 84,-118 M 56,-152 C 66,-150 76,-144 84,-136", 2.2))
    # neck + head
    o.append(part("M -26,-196 C -30,-226 -28,-250 -24,-268 L 22,-268 C 26,-246 26,-224 22,-196 Z", FACE_B,
                  [("M -40,-280 L -10,-280 L -10,-190 L -40,-190 Z", "#86b6dc")]))
    head = "M -44,-286 C -46,-316 -26,-334 0,-334 C 26,-334 46,-316 44,-286 C 42,-262 24,-250 0,-250 C -24,-250 -42,-262 -44,-286 Z"
    o.append(part(head, FACE_B, [("M -60,-340 L -24,-340 C -34,-310 -30,-280 -14,-246 L -60,-246 Z", "#86b6dc")]))
    o.append(part("M -22,-322 C -24,-344 -4,-350 2,-336 C 6,-350 26,-346 22,-324 Z", T_BR, w=3.4))
    # eyes (big, worried-cute)
    o.append(part(ell(-17, -297, 15, 17), "#fff", [f'<circle cx="-13" cy="-293" r="5" fill="{INK}"/><circle cx="-11" cy="-296" r="1.6" fill="#fff"/>'], w=3.6))
    o.append(part(ell(17, -297, 15, 17), "#fff", [f'<circle cx="21" cy="-293" r="5" fill="{INK}"/><circle cx="23" cy="-296" r="1.6" fill="#fff"/>'], w=3.6))
    o.append(line("M -30,-322 C -24,-326 -14,-324 -8,-318 M 30,-322 C 24,-326 14,-324 8,-318", 3))
    # beak, snood, wattle
    o.append(part("M -10,-276 L 10,-276 L 0,-258 Z", "#f2b33a", [("M -12,-268 L 12,-268 L 12,-250 L -12,-250 Z", "#d9952a")], w=3.4))
    o.append(part("M 6,-282 C 14,-280 18,-266 16,-250 C 15,-240 8,-240 8,-250 C 8,-262 6,-272 2,-278 Z", SNOOD, w=3))
    o.append(part("M -8,-258 C -16,-246 -14,-226 -2,-222 C 8,-224 10,-238 6,-256 Z", SNOOD,
                  [("M -20,-250 L -6,-250 L -6,-220 L -20,-220 Z", "#b52a30")], w=3.4))
    return "".join(o)


def cranberry_pile():
    o = [f'<ellipse cx="0" cy="4" rx="190" ry="14" fill="#d8d3c8"/>']
    rng = random.Random(4)
    rows = [(7, 0), (6, -38), (5, -74), (3, -108), (2, -138)]
    berries = []
    for n, y in rows:
        for k in range(n):
            x = (k - (n - 1) / 2) * 46 + rng.uniform(-6, 6)
            berries.append((x, y - 22 + rng.uniform(-4, 4), 23 + rng.uniform(-2, 2), rng.uniform(-40, 40)))
    for x, y, r, rot in reversed(berries):
        o.append(cranberry(x, y, r, rot))
    # leaves
    for x, y, rot in ((-150, -20, -30), (138, -14, 40)):
        o.append(f'<g transform="translate({x},{y}) rotate({rot})">'
                 + part("M 0,0 C 10,-20 30,-26 46,-24 C 40,-8 22,4 0,0 Z", LEAF, [("M 0,0 L 46,-24 L 46,10 L 0,10 Z", LEAF_S)], w=3.4)
                 + line("M 2,-1 L 40,-21", 1.6) + "</g>")
    o.append(cranberry(182, -14, 22, 10))
    return "".join(o)


def roast_platter():
    o = [f'<ellipse cx="0" cy="12" rx="280" ry="28" fill="#d8d3c8"/>']
    o.append(part(ell(0, -30, 270, 62), PLATE, [(ell(0, -24, 270, 62), PLATE_S), (ell(0, -34, 236, 48), PLATE)]))
    o.append(line(f"{ell(0, -32, 252, 54)}", 3, RIM))
    o.append(line(f"{ell(0, -33, 238, 49)}", 1.6, RIM, dash="6 6"))
    # garnish behind
    for x, y in ((-200, -44), (-150, -64), (180, -60), (130, -76), (-60, -86), (60, -88)):
        o.append(part(f"M {x-18},{y} C {x-22},{y-18} {x-6},{y-24} {x},{y-14} C {x+6},{y-26} {x+24},{y-18} {x+18},{y} "
                      f"C {x+22},{y+12} {x-20},{y+12} {x-18},{y} Z", LEAF, [(f"M {x-30},{y} L {x+30},{y} L {x+30},{y+14} L {x-30},{y+14} Z", LEAF_S)], w=3))
    # Side view, breast up, neck end on the left, BOTH drumsticks side by side
    # at the right (cavity) end, wings tucked under the body.
    def drum(d, sh, hl):
        return part(d, ROAST, [(sh, ROAST_S), (hl, ROAST_H)], w=4.4)
    # far drumstick (behind body, a little higher)
    o.append(drum("M 70,-150 C 100,-190 140,-206 172,-214 C 186,-216 194,-206 186,-196 C 160,-180 132,-158 112,-130 Z",
                  "M 100,-140 L 190,-200 L 200,-180 L 120,-120 Z", "M 120,-180 C 140,-196 160,-204 176,-208 L 176,-204 C 160,-198 140,-190 124,-176 Z"))
    # body: breast dome on top, flat bottom on the platter
    body = "M -176,-84 C -190,-140 -130,-200 -20,-206 C 90,-210 170,-170 170,-104 C 168,-56 96,-40 0,-40 C -96,-40 -166,-50 -176,-84 Z"
    o.append(part(body, ROAST, [("M -200,-90 C -120,-62 80,-58 200,-100 L 200,0 L -200,0 Z", ROAST_S),
                                ("M -110,-176 C -60,-198 20,-200 70,-188 C 30,-184 -50,-178 -100,-162 Z", ROAST_H)]))
    o.append(line("M -150,-150 C -90,-196 30,-204 120,-170", 2.2, ROAST_D))  # keel / breast ridge
    for x, y in ((-110, -150), (-60, -126), (40, -150), (-130, -104), (10, -100), (80, -128)):
        o.append(f'<ellipse cx="{x}" cy="{y}" rx="5" ry="2.4" fill="{ROAST_D}" opacity="0.6"/>')
    # neck-end flap
    o.append(line("M -170,-120 C -184,-108 -184,-92 -172,-84", 2.4, ROAST_D))
    # tucked wing (near side, low by the neck end)
    o.append(part("M -150,-96 C -136,-128 -96,-136 -56,-118 C -70,-100 -110,-86 -150,-96 Z", ROAST,
                  [("M -160,-100 L -40,-100 L -40,-80 L -160,-80 Z", ROAST_S)], w=3.8))
    o.append(line("M -130,-104 C -110,-112 -90,-114 -72,-112", 2, ROAST_D))
    # near thigh + drumstick, lower, parallel to the far one
    o.append(drum("M 40,-90 C 30,-140 90,-160 124,-140 C 150,-150 176,-162 196,-170 C 210,-172 216,-160 206,-152 "
                  "C 186,-136 160,-118 136,-106 C 110,-74 50,-66 40,-90 Z",
                  "M 30,-100 C 70,-80 140,-100 220,-160 L 220,-60 L 30,-60 Z",
                  "M 70,-140 C 90,-152 112,-152 126,-142 C 108,-144 90,-140 74,-132 Z"))
    for (bx, by, rot) in ((190, -210, 62), (212, -166, 62)):
        o.append(f'<g transform="translate({bx},{by}) rotate({rot})">'
                 + part("M -9,0 L 9,0 L 8,-26 C 14,-30 12,-40 4,-38 C 0,-44 -8,-42 -8,-34 C -14,-32 -14,-24 -8,-24 Z", "#f3ead8", w=3.4)
                 + part("M -13,4 L -10,-8 L -6,2 L -2,-10 L 2,2 L 6,-10 L 10,2 L 13,-8 L 15,8 L -15,8 Z", "#ffffff", w=3, a=0.2)
                 + "</g>")
    # cranberries + orange slices on the platter
    for x, y in ((-150, -40), (-120, -30), (150, -40), (124, -30), (-12, -28)):
        o.append(cranberry(x, y, 13, 20))
    for x, y in ((-220, -32), (220, -32)):
        o.append(part(ell(x, y, 24, 12), "#f5a623", [(ell(x, y, 18, 8), "#ffd27a")], w=3.4))
        o.append(line(f"M {x-16},{y} L {x+16},{y} M {x},{y-8} L {x},{y+8} M {x-11},{y-6} L {x+11},{y+6} M {x-11},{y+6} L {x+11},{y-6}", 1.4, "#e08a10", a=0))
    for x in (-60, 0, 60):
        o.append(line(f"M {x},-220 C {x-12},-236 {x+12},-252 {x},-270 C {x-8},-282 {x+6},-290 {x+2},-300", 3, "#b4aeb9"))
    return "".join(o)
