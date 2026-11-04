"""Optimus (standing/waving + carrying a pie), Grok helper bot, delivery drone."""
import math
from lib import *

OW, OW_S, OW_H = "#f3f4f6", "#cdd3db", "#ffffff"
OB, OB_S, OB_H = "#2a2d35", "#1d1f25", "#4a4f5c"
CYAN = "#5ff0ff"


def o_upper(side):
    o = [part("M -19,10 C -22,32 -20,62 -15,90 L 15,90 C 20,62 22,32 19,10 Z", OW,
              [(f"M {-30*side},0 L {-6*side},0 L {-4*side},100 L {-30*side},100 Z", OW_S)], w=4.4)]
    o.append(line("M -16,44 L 16,44", 1.8, "#9aa3ae"))
    return "".join(o)


def o_fore(side, hand="relaxed"):
    o = [part("M -16,10 C -19,34 -17,60 -12,82 L 12,82 C 17,60 19,34 16,10 Z", OW,
              [(f"M {-30*side},0 L {-5*side},0 L {-3*side},90 L {-30*side},90 Z", OW_S)], w=4.4)]
    o.append(part("M -9,80 L 9,80 L 9,94 L -9,94 Z", OB, w=3))
    if hand == "open":
        palm = "M -15,94 L 15,94 L 17,120 C 14,128 -14,128 -17,120 Z"
        o.append(part(palm, OB, [(f"M {-20*side},90 L {-4*side},90 L {-4*side},130 L {-20*side},130 Z", OB_S)], w=3.6))
        for k, (x, ang) in enumerate(((-12, 14), (-4, 4), (4, -4), (12, -14))):
            o.append(f'<g transform="translate({x},124) rotate({ang})">'
                     + part("M -3.6,0 L 3.6,0 L 3.4,26 C 3,30 -3,30 -3.4,26 Z", OB, w=2.6, a=0.2)
                     + line("M -3,12 L 3,12", 1.4, OB_H, a=0) + "</g>")
        o.append(f'<g transform="translate({16*side},104) rotate({-50*side})">'
                 + part("M -3.6,0 L 3.6,0 L 3.4,20 C 3,24 -3,24 -3.4,20 Z", OB, w=2.6, a=0.2) + "</g>")
    else:
        palm = "M -14,94 L 14,94 L 16,124 C 14,134 -14,134 -16,124 Z"
        o.append(part(palm, OB, [(f"M {-20*side},90 L {-4*side},90 L {-4*side},140 L {-20*side},140 Z", OB_S)], w=3.6))
        for x in (-9, -3, 3, 9):
            o.append(line(f"M {x},118 L {x},136", 3.2, OB, a=0.2))
            o.append(line(f"M {x},118 L {x},136", 1.2, OB_H, a=0.2))
        o.append(line("M -14,128 C -10,138 10,138 14,128", 3.6))
    return "".join(o)


def o_arm(sx, sy, side, a_up, a_fore, hand="relaxed", fore_front=True):
    fore = f'<g transform="translate(0,98) rotate({a_fore})">{o_fore(side, hand)}</g>'
    elbow = part(ell(0, 98, 14), OB, [(ell(-4 * side, 102, 12), OB_S)], w=3.6)
    s = [o_upper(side), elbow, fore]
    return f'<g transform="translate({sx},{sy}) rotate({a_up})">{"".join(s)}</g>'


def o_shoulder(sx, sy, side):
    return part(ell(sx, sy, 22), OB, [(ell(sx - 6 * side, sy + 6, 20), OB_S), (ell(sx + 6 * side, sy - 8, 6), OB_H)], w=4)


def o_head(tilt=0):
    """Optimus head per refs: one glossy black ovoid (no white shell), black neck."""
    o = [f'<g transform="rotate({tilt} 0 -548)">']
    o.append(part("M -12,-556 L 12,-556 L 15,-520 L -15,-520 Z", OB, [("M -20,-560 L -4,-560 L -4,-516 L -20,-516 Z", OB_S)], w=3.4))
    for y in (-546, -536, -526):
        o.append(line(f"M -11,{y} L 11,{y}", 1.4, OB_H, a=0.2))
    head = "M -34,-600 C -36,-630 -20,-648 0,-648 C 20,-648 36,-630 34,-600 C 33,-574 22,-552 0,-550 C -22,-552 -33,-574 -34,-600 Z"
    o.append(part(head, "#17181d", [("M -60,-660 L -18,-660 C -26,-620 -24,-580 -12,-540 L -60,-540 Z", "#0e0f13"),
                                    ("M 6,-640 C 20,-638 28,-628 30,-614 C 24,-622 16,-630 4,-633 Z", "#5d6475"),
                                    ("M 14,-604 C 18,-596 18,-586 15,-578 L 12,-579 C 14,-588 14,-596 11,-603 Z", "#3f4554")], w=4))
    o.append(line("M -24,-586 C -10,-580 10,-580 24,-586", 1.4, "#3a3f4b"))
    o.append("</g>")
    return "".join(o)


def o_torso_legs():
    o = []
    # legs
    for side in (-1, 1):
        f = (lambda d: d) if side == -1 else mirror
        o.append(part(f("M -60,-286 C -64,-250 -62,-210 -56,-178 L -18,-178 C -14,-210 -14,-250 -16,-286 Z"), OW,
                      [(f("M -80,-300 L -48,-300 L -44,-170 L -80,-170 Z"), OW_S)], w=4.4))
        o.append(line(f("M -54,-236 L -22,-236"), 1.8, "#9aa3ae"))
        o.append(part(ell(-37 * -side * -1 if False else (-37 if side == -1 else 37), -168, 16), OB, w=3.6))
        o.append(part(f("M -56,-156 C -62,-128 -58,-90 -50,-52 L -24,-52 C -18,-90 -16,-128 -20,-156 Z"), OW,
                      [(f("M -80,-160 L -46,-160 L -42,-40 L -80,-40 Z"), OW_S)], w=4.4))
        o.append(line(f("M -50,-120 C -44,-112 -32,-112 -24,-118"), 1.8, "#9aa3ae"))
        o.append(part(f("M -50,-54 L -24,-54 L -22,-40 L -52,-40 Z"), OB, w=3))
        foot = "M -58,-40 L -16,-40 L -12,-12 C -10,-2 -16,2 -24,2 L -62,2 C -70,2 -72,-6 -68,-14 Z"
        o.append(part(f(foot), OW, [(f("M -80,-12 L 0,-12 L 0,10 L -80,10 Z"), OB), (f("M -80,-44 L -52,-44 L -56,10 L -80,10 Z"), OW_S)], w=4))
        o.append(line(f("M -69,-12 L -11,-12"), 2.6))
        o.append(part(ell(-36 if side == -1 else 36, -292, 18), OB, [(ell(-40 if side == -1 else 40, -286, 16), OB_S)], w=3.6))
    # pelvis
    o.append(part("M -62,-348 L 62,-348 L 58,-302 C 30,-284 -30,-284 -58,-302 Z", OW,
                  [("M -80,-360 L -40,-360 L -30,-280 L -80,-280 Z", OW_S)], w=4.4))
    o.append(line("M 0,-344 L 0,-292", 1.8, "#9aa3ae"))
    # waist (black, ribbed)
    o.append(part("M -44,-404 L 44,-404 L 50,-342 L -50,-342 Z", OB, [("M -60,-410 L -24,-410 L -24,-330 L -60,-330 Z", OB_S)], w=4))
    for y in (-392, -380):
        o.append(line(f"M -42,{y} L 42,{y}", 1.4, OB_H, a=0.2))
    o.append(part(ell(0, -360, 18, 12), "#3b3f49", [(ell(0, -360, 8, 5), "#9aa3ae")], w=2.6))
    # chest
    chest = "M -92,-530 C -50,-540 50,-540 92,-530 L 80,-478 C 66,-440 50,-412 40,-398 L -40,-398 C -50,-412 -66,-440 -80,-478 Z"
    o.append(part(chest, OW, [("M -110,-540 L -52,-540 C -58,-490 -54,-440 -36,-396 L -110,-396 Z", OW_S),
                              ("M 40,-520 C 60,-516 72,-508 78,-496 C 66,-502 54,-506 38,-508 Z", OW_H)]))
    o.append(line("M 0,-532 L 0,-400", 1.8, "#9aa3ae"))
    o.append(line("M -92,-530 C -60,-512 -24,-500 0,-498 C 24,-500 60,-512 92,-530", 1.8, "#9aa3ae"))
    o.append(f'<text x="0" y="-512" font-family="Arial, sans-serif" font-size="9" font-weight="700" letter-spacing="5" text-anchor="middle" fill="#7f8894">TESLA</text>')
    for y in (-500, -492, -484):  # tiny cooling slots
        o.append(line(f"M 46,{y} L 66,{y-2}", 1.8, "#7f8894", a=0.2))
    o.append(part("M -66,-500 L -50,-502 L -50,-490 L -66,-488 Z", "#20232a", w=1.6, a=0.2))  # status light
    o.append(f'<rect x="-63" y="-498" width="6" height="5" fill="{CYAN}"/>')
    return "".join(o)


def optimus_wave():
    o = []
    o.append(o_arm(-96, -512, -1, 7, -4))
    o.append(o_torso_legs())
    o.append(o_arm(96, -512, 1, -128, -48, hand="open"))
    o.append(o_shoulder(-96, -512, -1))
    o.append(o_shoulder(96, -512, 1))
    o.append(o_head(tilt=-6))
    # wave motion marks
    o.append(line("M 248,-760 C 262,-748 268,-734 268,-718", 3.4))
    o.append(line("M 266,-776 C 284,-760 292,-740 290,-718", 3.4))
    return "".join(o)


def pie(cx, cy):
    o = []
    o.append(part(f"M {cx-74},{cy-26} L {cx+74},{cy-26} L {cx+62},{cy} L {cx-62},{cy} Z", "#c98a4a",
                  [(f"M {cx-80},{cy-12} L {cx+80},{cy-12} L {cx+80},{cy+4} L {cx-80},{cy+4} Z", "#a86c35")], w=4))
    o.append(part(ell(cx, cy - 27, 74, 15), "#e0a057", [(ell(cx, cy - 26, 62, 10), "#e2852f"),
                                                        (ell(cx + 10, cy - 28, 40, 5), "#f0a050")], w=4))
    for k in range(13):  # crimped crust
        t = math.pi * (k / 12)
        x = cx - 70 * math.cos(t)
        y = cy - 27 + 13 * math.sin(t)
        o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="6.5" fill="#e6ad66" stroke="{INK}" stroke-width="2"/>')
    o.append(part(f"M {cx-22},{cy-30} C {cx-24},{cy-44} {cx-8},{cy-46} {cx-6},{cy-54} C {cx+2},{cy-46} {cx+16},{cy-50} {cx+18},{cy-38} "
                  f"C {cx+24},{cy-30} {cx+8},{cy-24} {cx-2},{cy-26} C {cx-12},{cy-24} {cx-22},{cy-24} {cx-22},{cy-30} Z", "#fffaf0",
                  [(f"M {cx-30},{cy-34} L {cx+30},{cy-34} L {cx+30},{cy-20} L {cx-30},{cy-20} Z", "#ebe2d0")], w=3.2))
    for dx in (-30, 34):
        o.append(line(f"M {cx+dx},{cy-50} C {cx+dx-8},{cy-62} {cx+dx+8},{cy-72} {cx+dx},{cy-86}", 2.6, "#b4aeb9"))
    return "".join(o)


def optimus_tray():
    o = []
    o.append(o_torso_legs())
    o.append(o_shoulder(-96, -512, -1))
    o.append(o_shoulder(96, -512, 1))
    o.append(o_head(tilt=8))
    o.append(o_arm(-96, -512, -1, 36, -134))
    o.append(o_arm(96, -512, 1, -36, 134))
    # tray + pie
    o.append(part(ell(0, -476, 140, 18), "#d9dde2", [(ell(0, -472, 128, 12), "#b9c0c8")], w=4))
    o.append(pie(0, -478))
    # fingertips curling over the tray rim
    for x in (-48, -40, 40, 48):
        o.append(part(f"M {x-3.5},-470 L {x+3.5},-470 L {x+3},-458 L {x-3},-458 Z", OB, w=2.4, a=0.2))
    return "".join(o)


# ---------------------------------------------------------------- Grok bot
def grok_bot():
    o = []
    o.append(f'<ellipse cx="0" cy="0" rx="70" ry="12" fill="#d8d3c8"/>')
    for k, (ry, op) in enumerate(((10, 0.5), (16, 0.3), (22, 0.18))):
        o.append(f'<ellipse cx="0" cy="-34" rx="{30+k*16}" ry="{ry*0.6}" fill="none" stroke="{CYAN}" stroke-width="3" opacity="{op}"/>')
    # noodle arms
    o.append(line("M -64,-150 C -96,-140 -110,-120 -118,-100", 7))
    o.append(line("M -64,-150 C -96,-140 -110,-120 -118,-100", 3.6, "#e6e9ee", a=0))
    o.append(part(ell(-120, -96, 13), "#e6e9ee", w=3.6))
    o.append(line("M 64,-156 C 96,-170 110,-196 112,-222", 7))
    o.append(line("M 64,-156 C 96,-170 110,-196 112,-222", 3.6, "#e6e9ee", a=0))
    o.append(part(ell(112, -228, 13), "#e6e9ee", w=3.6))
    o.append(line("M 132,-248 C 140,-240 142,-230 140,-220 M 146,-258 C 158,-246 160,-230 156,-214", 3))
    # egg body
    body = "M -70,-150 C -70,-210 70,-210 70,-150 C 70,-90 40,-50 0,-50 C -40,-50 -70,-90 -70,-150 Z"
    o.append(part(body, "#eef0f3", [("M -90,-220 L -30,-220 C -46,-160 -40,-100 -10,-40 L -90,-40 Z", "#cbd1d9"),
                                    ("M 30,-190 C 46,-186 58,-176 62,-160 C 52,-170 42,-176 28,-180 Z", "#ffffff")]))
    o.append(line("M -62,-122 C -30,-110 30,-110 62,-122", 1.8, "#9aa3ae"))
    # chest emblem
    o.append(part(ell(0, -150, 20), "#1a1c22", [(ell(0, -150, 15), "#22262f")], w=3.4))
    o.append(line("M -9,-141 L 9,-159", 3.6, CYAN, a=0))
    o.append(f'<text x="0" y="-92" font-family="{TITLE_FONT}" font-size="15" text-anchor="middle" fill="#3a3f4b" letter-spacing="2">GROK</text>')
    # neck + head
    o.append(part("M -16,-206 L 16,-206 L 14,-188 L -14,-188 Z", "#2a2d35", w=3.2))
    o.append(line("M 0,-336 L 0,-362", 4))
    o.append(part(ell(0, -368, 9), CYAN, [(ell(-3, -371, 3.5), "#ffffff")], w=3.4))
    head = "M -90,-300 C -90,-326 -76,-336 -50,-336 L 50,-336 C 76,-336 90,-326 90,-300 L 90,-238 C 90,-214 76,-204 50,-204 L -50,-204 C -76,-204 -90,-214 -90,-238 Z"
    o.append(part(head, "#eef0f3", [("M -110,-340 L -70,-340 L -70,-200 L -110,-200 Z", "#cbd1d9")]))
    scr = "M -74,-296 C -74,-312 -66,-320 -52,-320 L 52,-320 C 66,-320 74,-312 74,-296 L 74,-244 C 74,-228 66,-220 52,-220 L -52,-220 C -66,-220 -74,-228 -74,-244 Z"
    sh = [("M 30,-322 L 54,-322 L 4,-218 L -20,-218 Z", "#1a2230")]
    o.append(part(scr, "#0f141c", sh, w=4))
    # screen face: happy eyes + smile, status bar icons
    o.append(line("M -40,-262 C -36,-282 -18,-282 -14,-262", 6, CYAN, a=0.3))
    o.append(line("M 14,-262 C 18,-282 36,-282 40,-262", 6, CYAN, a=0.3))
    o.append(line("M -14,-246 C -6,-236 6,-236 14,-246", 4.4, CYAN, a=0.3))
    o.append(f'<ellipse cx="-48" cy="-248" rx="8" ry="4" fill="#ff7aa8" opacity="0.7"/><ellipse cx="48" cy="-248" rx="8" ry="4" fill="#ff7aa8" opacity="0.7"/>')
    o.append(f'<rect x="38" y="-314" width="18" height="8" rx="1.5" fill="none" stroke="{CYAN}" stroke-width="1.4"/>'
             f'<rect x="40" y="-312" width="11" height="4" fill="{CYAN}"/><rect x="56.5" y="-312" width="2" height="4" fill="{CYAN}"/>')
    for k in range(4):
        o.append(f'<rect x="{20+k*4}" y="{-306-k*2.4:.1f}" width="2.6" height="{2+k*2.4:.1f}" fill="{CYAN}"/>')
    o.append(f'<text x="-58" y="-306.5" font-family="monospace" font-size="8" fill="{CYAN}">grok · 98%</text>')
    return "".join(o)


# ---------------------------------------------------------------- drone
def drone():
    o = []
    o.append(f'<ellipse cx="0" cy="250" rx="90" ry="12" fill="#d8d3c8"/>')
    # string + gravy boat
    o.append(line("M 0,40 L 0,128", 2.4))
    o.append(part("M -50,150 C -40,182 40,186 58,150 L 82,132 L 66,146 Z", "#f4f1ea",
                  [("M -60,160 L 90,160 L 90,200 L -60,200 Z", "#d8d3c8")], w=4))
    o.append(part("M -50,150 C -30,140 40,138 58,150 C 30,158 -30,158 -50,150 Z", "#7a4a26", w=3))
    o.append(part("M -6,168 C -10,184 10,184 6,168 Z", "#f4f1ea", w=3))
    o.append(line("M -8,132 L 8,132 L 0,150 Z M -46,150 C -20,124 30,124 54,150", 2.4))
    o.append(line("M -40,110 C -46,96 -34,90 -40,76 M 34,110 C 28,96 40,90 34,76", 2.4, "#b4aeb9"))
    # arms (back pair first)
    for (x, y) in ((-112, -56), (112, -56)):
        o.append(line(f"M 0,-10 L {x},{y}", 12))
        o.append(line(f"M 0,-10 L {x},{y}", 6, "#5b616d", a=0))
    for (x, y) in ((-112, -56), (112, -56)):
        o.append(part(f"M {x-12},{y} L {x+12},{y} L {x+10},{y-16} L {x-10},{y-16} Z", "#3b3f49", w=3.4))
        o.append(f'<ellipse cx="{x}" cy="{y-18}" rx="72" ry="12" fill="#b9c3cf" opacity="0.45" stroke="{INK}" stroke-width="2" stroke-dasharray="10 8"/>')
        o.append(line(f"M {x-52},{y-22} L {x+52},{y-14}", 3, "#3b3f49"))
    # body shell
    body = "M -70,-8 C -70,-40 -36,-52 0,-52 C 36,-52 70,-40 70,-8 C 70,18 40,34 0,34 C -40,34 -70,18 -70,-8 Z"
    o.append(part(body, "#5b616d", [("M -90,0 L 90,0 L 90,40 L -90,40 Z", "#40444e"),
                                    ("M -60,-34 C -30,-48 30,-48 60,-34 L 60,-26 C 30,-40 -30,-40 -60,-26 Z", "#ff8a2a"),
                                    ("M -24,-44 C -8,-48 10,-48 24,-44 L 20,-38 C 8,-41 -8,-41 -20,-38 Z", "#8b919c")]))
    for (x, y) in ((-150, 0), (150, 0)):
        o.append(line(f"M 0,6 L {x},{y+18}", 12))
        o.append(line(f"M 0,6 L {x},{y+18}", 6, "#5b616d", a=0))
    for (x, y), led in (((-150, 0), "#ff4a4a"), ((150, 0), "#3dff7a")):
        o.append(part(f"M {x-14},{y+18} L {x+14},{y+18} L {x+12},{y} L {x-12},{y} Z", "#3b3f49", w=3.4))
        o.append(f'<circle cx="{x}" cy="{y+22}" r="4" fill="{led}" stroke="{INK}" stroke-width="1.4"/>')
        o.append(f'<ellipse cx="{x}" cy="{y-4}" rx="84" ry="15" fill="#b9c3cf" opacity="0.45" stroke="{INK}" stroke-width="2" stroke-dasharray="10 8"/>')
        o.append(line(f"M {x-60},{y-10} L {x+60},{y+2}", 3.2, "#3b3f49"))
        o.append(line(f"M {x-30},{y-18} C {x},{y-24} {x+30},{y-20} {x+46},{y-14}", 1.6, "#ffffff"))
        o.append(part(ell(x, y - 4, 6, 3), "#2a2d35", w=2))
    # gimbal camera
    o.append(part("M -12,30 L 12,30 L 10,44 L -10,44 Z", "#3b3f49", w=3))
    o.append(part(ell(0, 56, 18), "#2a2d35", [(ell(-4, 52, 14), "#40444e")], w=3.6))
    o.append(part(ell(4, 58, 8), "#101318", [(ell(6, 56, 3), "#7fb2ff")], w=2.4))
    o.append(f'<text x="0" y="22" font-family="monospace" font-size="9" text-anchor="middle" fill="#d6d9de">SX-D1</text>')
    return "".join(o)
