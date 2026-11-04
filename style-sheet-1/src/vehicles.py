"""Tesla Cybercab side views (facing right), matched to refs/cybercab-*.jpg.

Real-vehicle notes: one smooth teardrop/wedge silhouette (short rounded nose,
long windshield flowing into the roof, peak just behind the doors' front edge,
then a long falling fastback to a cut-off tail); very short overhangs; huge
wheels (~0.19 x length) with flat full-disc aero covers in body colour;
a black lower band/sill; champagne-gold matte paint; full-width light bars
front (white-blue) and rear (red); butterfly doors hinged at the A-pillar that
swing almost vertical; inside: two seats, centre screen, no wheel or pedals.
Local coords: x 0 (tail) .. 880 (nose), ground y = 0.
"""
import math
from lib import *

STEEL, STEEL_S, STEEL_SS, STEEL_H = "#d3c6a3", "#b7a983", "#9b8e6b", "#efe7d0"  # champagne "steel"
GLASS, GLASS_H, GLASS_S = "#20252e", "#3b4554", "#161a21"
TIRE, TIRE_H = "#232227", "#3a3940"
SILL = "#26262b"

WR = 84            # wheel radius
RW, FW = 168, 720  # wheel centres x

BODY = ("M 52,-34 C 34,-36 22,-50 20,-72 L 18,-160 C 18,-176 24,-186 40,-192 "
        "C 140,-240 280,-296 430,-304 C 520,-306 580,-298 612,-284 "
        "C 660,-262 700,-232 728,-210 C 790,-196 838,-178 862,-152 "
        "C 880,-132 884,-96 876,-66 C 870,-48 858,-36 838,-34 "
        "L 822,-34 C 822,-238 618,-238 618,-34 L 270,-34 C 270,-238 66,-238 66,-34 Z")
GLASS_D = ("M 300,-262 C 360,-286 430,-296 500,-296 C 560,-296 596,-288 616,-278 "
           "C 650,-260 682,-236 700,-220 C 600,-210 480,-208 380,-212 C 340,-224 316,-242 300,-262 Z")
DOOR = ("M 590,-292 C 640,-268 680,-238 702,-218 C 704,-170 696,-120 676,-86 L 640,-60 L 320,-60 "
        "C 300,-110 292,-170 300,-228 C 330,-262 380,-286 440,-296 C 500,-302 560,-300 590,-292 Z")


def wheel(cx, cy=-WR):
    o = [part(ell(cx, cy, WR), TIRE, [(ell(cx - 6, cy - 6, WR - 10), TIRE_H), (ell(cx, cy, WR - 12), TIRE)], w=4)]
    # flat full-disc aero cover in body colour, slightly dished
    o.append(part(ell(cx, cy, WR - 12), STEEL, [(f"M {cx-90},{cy+8} L {cx+90},{cy+8} L {cx+90},{cy+90} L {cx-90},{cy+90} Z", STEEL_S),
                                                (ell(cx + 18, cy - 22, 22, 12), STEEL_H)], w=3.4))
    o.append(line(ell(cx, cy, WR - 30), 1.8, STEEL_SS))
    o.append(part(ell(cx, cy, 9), STEEL_S, w=2.4))
    o.append(line(f"M {cx-60},{cy-40} C {cx-50},{cy-58} {cx-34},{cy-68} {cx-16},{cy-72}", 1.6, "#5d5a66", dash="3 5"))
    return "".join(o)


def wells():
    return "".join(f'<circle cx="{x}" cy="-{WR}" r="100" fill="#141418"/>' for x in (RW, FW))


def body_shell():
    shades = [("M 0,-128 L 900,-128 L 900,0 L 0,0 Z", STEEL_S),
              ("M 0,-74 L 900,-74 L 900,0 L 0,0 Z", SILL),
              ("M 40,-188 C 140,-236 280,-292 430,-300 L 432,-290 C 282,-282 144,-226 46,-178 Z", STEEL_H),
              ("M 730,-204 C 790,-190 836,-172 858,-150 L 850,-146 C 828,-166 784,-184 726,-196 Z", STEEL_H),
              ("M 120,-200 L 150,-200 L 100,-140 L 70,-140 Z", "#e8dec2")]
    return part(BODY, STEEL, shades, w=4.4)


def details():
    o = []
    o.append(line("M 22,-128 C 200,-134 500,-134 870,-126", 2))          # shoulder crease
    o.append(line("M 66,-74 L 822,-74", 2.2))                            # top of black sill
    # light bars: front wraps the nose, rear is full width under the tail lip
    o.append(part("M 846,-170 C 862,-158 874,-142 878,-124 L 872,-122 C 868,-138 858,-152 842,-164 Z", "#eaf8ff", w=2.2, a=0.2))
    o.append(f'<path d="M 840,-170 C 860,-156 874,-140 880,-120" fill="none" stroke="#9fe3ff" stroke-width="9" opacity="0.45" stroke-linecap="round"/>')
    o.append(part("M 18,-168 L 26,-186 L 34,-184 L 26,-164 Z", "#ff3434", w=2.2, a=0.2))
    o.append(f'<path d="M 18,-164 L 30,-190" fill="none" stroke="#ff8080" stroke-width="9" opacity="0.4" stroke-linecap="round"/>')
    # charge port flap, side camera, front sensor
    o.append(line("M 90,-176 L 130,-182 L 132,-156 L 92,-150 Z", 1.8))
    o.append(part(ell(724, -150, 6, 4), "#1b1f27", w=1.8))
    o.append(f'<circle cx="726" cy="-151" r="1.6" fill="#7fb2ff"/>')
    return "".join(o)


def glass():
    sh = [("M 360,-300 L 400,-300 L 340,-200 L 300,-200 Z", GLASS_H),
          ("M 520,-310 L 534,-310 L 474,-200 L 460,-200 Z", GLASS_H),
          ("M 420,-262 C 420,-276 446,-276 446,-260 L 442,-212 L 418,-212 Z", "#2c3442"),
          ("M 600,-300 L 720,-300 L 720,-200 L 640,-200 Z", GLASS_S)]
    return part(GLASS_D, GLASS, sh, w=3.6)


def shadow():
    return f'<ellipse cx="445" cy="4" rx="440" ry="16" fill="#d8d3c8"/>'


def cybercab_closed():
    o = [shadow(), wells(), body_shell(), glass(), line(DOOR, 2.4)]
    o.append(line("M 470,-160 L 520,-160", 3))   # flush handle slot
    o.append(details())
    o.append(wheel(RW))
    o.append(wheel(FW))
    return "".join(o)


def cybercab_open():
    o = [shadow(), wells(), body_shell()]
    cav = DOOR
    inner = [("M 280,-320 L 720,-320 L 720,-30 L 280,-30 Z", "#262b37"),
             ("M 280,-90 L 720,-90 L 720,-30 L 280,-30 Z", "#1c2029"),
             ("M 560,-226 L 700,-214 L 700,-170 L 590,-176 Z", "#3a4152")]
    o.append(part(cav, "#262b37", inner, w=3.6))
    # far seat + near seat (dark leather, as in refs/cybercab-5.jpg)
    o.append(part("M 380,-246 C 372,-266 396,-278 410,-266 L 426,-150 L 392,-142 Z", "#3d3a3f", w=3))
    o.append(part("M 352,-236 C 342,-262 372,-278 390,-260 L 410,-160 L 368,-146 Z", "#55505a",
                  [("M 336,-280 L 364,-280 L 384,-140 L 344,-140 Z", "#47434c")], w=3.2))
    o.append(part("M 358,-156 C 390,-170 460,-170 498,-160 C 506,-146 502,-128 490,-122 L 368,-120 C 354,-128 352,-144 358,-156 Z",
                  "#55505a", [("M 340,-138 L 510,-138 L 510,-110 L 340,-110 Z", "#47434c")], w=3.2))
    o.append(line("M 368,-220 L 392,-216 M 372,-198 L 398,-194", 1.4, "#7b7682", dash="3 3"))
    o.append(part("M 410,-120 L 480,-120 L 486,-70 L 414,-70 Z", "#3a3e48", w=2.6))
    # centre screen with a tiny route map; no wheel, no pedals
    o.append(part("M 590,-246 L 650,-252 L 654,-206 L 592,-202 Z", "#0f1622",
                  [("M 596,-242 L 646,-246 L 648,-212 L 598,-208 Z", "#123049")], w=2.8))
    o.append(line("M 602,-216 C 614,-232 626,-222 634,-238 L 642,-242", 1.8, "#59d0ff", a=0.2))
    o.append(f'<circle cx="642" cy="-242" r="3" fill="#ff5f7a"/><circle cx="602" cy="-216" r="2.4" fill="#ffffff"/>')
    o.append(line("M 622,-202 L 626,-180", 2.6))
    o.append(details())
    o.append(wheel(RW))
    o.append(wheel(FW))
    # butterfly door swung up almost vertical around the A-pillar hinge
    door = [part(DOOR, STEEL, [("M 280,-128 L 720,-128 L 720,0 L 280,0 Z", STEEL_S),
                               ("M 280,-74 L 720,-74 L 720,0 L 280,0 Z", SILL)], w=4),
            part(GLASS_D, GLASS, [("M 360,-300 L 400,-300 L 340,-200 L 300,-200 Z", GLASS_H)], w=3.4),
            line("M 470,-160 L 520,-160", 3)]
    o.append(f'<g transform="rotate(74 640 -262)">{"".join(door)}</g>')
    o.append(part(ell(640, -262, 6), "#7d8590", w=2.2))
    return "".join(o)
