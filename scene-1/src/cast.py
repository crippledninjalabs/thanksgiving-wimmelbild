"""Characters for the scene.

rick() / morty(): rebuilt show silhouettes (refs/reid-rick-morty-lineart.png,
rm-morty-modelsheet.jpg). Local units, feet at (0,0), facing +x, Rick ~1000
tall incl. hair, Morty ~620. Place with common.sprite(..., s=FIG).
  Rick: hunched; back curves out, head pushed forward of the shoulders on a
  thin slanted neck; long narrow head; big spike halo behind it; thin legs;
  arms reach to the knee.
  Morty: big round head (~45% of height), short body, short arms and legs.
detail=True adds shading, wrinkles and props (showcase spots only).

defs(): crowd sprites (Optimus, Grok bot, drone, turkey) as <g id> for <use>.
"""
import math
from common import INK, P, E, C, R, T, PORTALS

R_SKIN, R_SKIN_S = "#d8cfc1", "#c0b6a7"
R_HAIR, R_HAIR_S = "#acd8ec", "#8cc0d8"
SWEATER, COAT, COAT_S, PANTS = "#93d8d2", "#f8f8f3", "#d3dbe1", "#6f5833"
M_SKIN, M_SKIN_S, M_HAIR = "#f6d6bd", "#e5b99c", "#6b3f1d"
M_SHIRT, M_PANTS = "#f8e34a", "#3b5fa8"
LW = 6  # local outline width (-> ~1.4 scene units at FIG)


def _arm(pts, sleeve, w=30):
    d = "M " + " L ".join(f"{x},{y}" for x, y in pts)
    return (P(d, "none", w + LW * 2, INK, 'stroke-linecap="round" stroke-linejoin="round"')
            + P(d, "none", w, sleeve, 'stroke-linecap="round" stroke-linejoin="round"'))


def _spikes(cx, cy, r_in, r_out, a0, a1, n, seed=0):
    pts = []
    for i in range(2 * n + 1):
        t = math.radians(a0 + (a1 - a0) * i / (2 * n))
        r = r_out * (1 + 0.12 * math.sin(i * 2.3 + seed)) if i % 2 else r_in
        pts.append(f"{cx + r*math.cos(t):.0f},{cy - r*math.sin(t):.0f}")
    return "M " + " L ".join(pts) + " Z"


def rick(detail=False, gun=False, arm_up=False):
    o = []
    # far arm (behind body)
    o.append(_arm([(-40, -665), (-78, -500), (-66, -335)], COAT))
    o.append(E(-64, -312, 17, 26, R_SKIN, LW))
    # legs + shoes
    o.append(P("M -50,-440 L -46,-24 L -12,-24 L -8,-440 Z", PANTS, LW))
    o.append(P("M 6,-440 L 26,-24 L 60,-24 L 42,-440 Z", PANTS, LW))
    o.append(E(-30, -14, 32, 13, "#2c2b30", LW) + E(48, -14, 34, 13, "#2c2b30", LW))
    # lab coat: hunched back bulge, flares to the knee
    coat = ("M 46,-704 C -20,-716 -84,-694 -100,-628 C -114,-560 -112,-420 -122,-250 L -36,-258 "
            "L -26,-430 L 44,-430 L 66,-258 L 112,-250 C 104,-400 98,-560 86,-648 C 78,-692 64,-704 46,-704 Z")
    o.append(P(coat, COAT, LW))
    if detail:
        o.append(P("M -100,-628 C -114,-560 -112,-420 -122,-250 L -80,-254 C -84,-420 -80,-560 -70,-640 Z", COAT_S, 0))
        o.append(P("M 66,-258 L 112,-250 C 104,-400 98,-520 92,-560 L 70,-430 Z", "#5fbf6a", 0, extra='opacity="0.35"'))
    # sweater between the open lapels + belt
    o.append(P("M -16,-694 C 14,-704 46,-702 64,-690 L 66,-432 L -22,-432 Z", SWEATER, LW))
    o.append(R(-24, -446, 92, 18, "#4a3a22", LW * 0.7) + R(14, -444, 16, 14, "#d9a441", 2))
    o.append(P("M -16,-694 L -34,-430 M 64,-690 L 74,-430", "none", LW))
    # near arm: long, hangs to the knee (or raised to work a machine)
    pts = [(46, -668), (96, -560), (150, -600)] if arm_up else [(46, -668), (74, -500), (82, -330)]
    o.append(_arm(pts, COAT))
    hx, hy = (164, -612) if arm_up else (84, -306)
    o.append(E(hx, hy, 19, 27, R_SKIN, LW))
    if gun:
        o.append(R(hx - 6, hy - 22, 70, 22, "#e2e6e9", LW * 0.7, 8) + C(hx + 68, hy - 11, 10, "#a8f55a", 3))
    # thin slanted neck
    o.append(P("M 34,-700 L 66,-744 L 100,-734 L 66,-690 Z", R_SKIN, LW))
    # spike halo, then the long head in front of it (head group dropped onto short neck)
    o.append('<g transform="translate(6,34)">')
    o.append(P(_spikes(96, -868, 100, 205, -15, 215, 9, 1.3), R_HAIR, LW))
    if detail:
        o.append(P(_spikes(96, -868, 96, 150, 10, 190, 7, 2.1), R_HAIR_S, 0, extra='opacity="0.6"'))
    head = ("M 30,-928 C 28,-966 60,-984 102,-982 C 144,-980 170,-962 172,-924 L 172,-806 "
            "C 172,-760 150,-726 110,-722 C 68,-718 38,-742 34,-792 Z")
    o.append(P(head, R_SKIN, LW))
    if detail:
        o.append(P("M 30,-928 C 28,-890 32,-830 34,-792 C 38,-760 52,-736 70,-728 C 52,-760 50,-860 56,-940 Z", R_SKIN_S, 0))
        o.append(P("M 60,-940 C 80,-948 110,-948 136,-942", "none", 3) + P("M 66,-954 C 90,-960 120,-960 140,-954", "none", 3))
        o.append(P("M 48,-842 C 58,-830 78,-828 96,-838 M 114,-838 C 126,-828 146,-830 158,-842", "none", 3))
        o.append(P("M 58,-770 C 62,-748 72,-736 84,-732 M 160,-770 C 156,-750 148,-740 138,-736", "none", 3))
    # face: wavy unibrow, big uneven eyes with tiny pupils, nose, flat mouth + drool
    o.append(P("M 46,-904 C 60,-916 76,-900 92,-910 C 108,-920 124,-904 140,-912 C 152,-918 162,-910 166,-904",
               "none", 9, R_HAIR_S, 'stroke-linecap="round"'))
    o.append(C(78, -872, 27, "#fff", LW * 0.8) + C(134, -870, 25, "#fff", LW * 0.8))
    o.append(C(84, -868, 4.5, INK, 0) + C(140, -866, 4.5, INK, 0))
    o.append(P("M 110,-860 C 116,-836 122,-818 110,-812", "none", 4))
    o.append(P("M 66,-776 C 96,-770 130,-774 156,-782", "none", 5))
    o.append(P("M 70,-772 C 72,-756 70,-744 74,-734", "none", 3, "#7fb5d8"))
    o.append("</g>")
    return "".join(o)


def morty(shirt=M_SHIRT, pants=M_PANTS, shoes="#f2f2ef", hat=None, extra="", detail=False, look=1):
    o = []
    o.append(E(-28, -12, 28, 12, shoes, LW) + E(32, -12, 30, 12, shoes, LW))
    o.append(P("M -50,-172 L -50,-20 L -12,-20 L -4,-150 L 8,-150 L 14,-20 L 52,-20 L 50,-172 Z", pants, LW))
    # short arms (behind), hands at hip
    o.append(_arm([(-56, -300), (-74, -196)], M_SKIN, 22) + _arm([(58, -300), (74, -196)], M_SKIN, 22))
    o.append(C(-76, -184, 15, M_SKIN, LW) + C(78, -184, 15, M_SKIN, LW))
    o.append(P("M -64,-322 C -68,-260 -64,-200 -58,-160 L 58,-160 C 64,-200 68,-260 64,-322 "
               "C 30,-338 -30,-338 -64,-322 Z", shirt, LW))
    o.append(P("M -64,-322 L -80,-270 L -54,-262 Z M 64,-322 L 80,-270 L 54,-262 Z", shirt, LW))
    if detail:
        o.append(P("M -58,-300 C -60,-250 -58,-200 -54,-164 L -36,-164 C -40,-220 -40,-270 -36,-318 Z", "#00000022", 0))
    # big round head: hair cap = full ellipse, face = lower part with hairline
    o.append(E(-146, -452, 14, 22, M_SKIN, LW) + E(162, -452, 14, 22, M_SKIN, LW))
    o.append(E(8, -462, 154, 148, M_HAIR, LW))
    o.append(P("M -146,-470 C -120,-524 -60,-538 10,-538 C 80,-538 140,-524 162,-470 "
               "C 162,-380 100,-316 10,-316 C -80,-316 -146,-380 -146,-470 Z", M_SKIN, LW))
    if detail:
        o.append(P("M -146,-470 C -146,-390 -90,-330 -20,-318 C -90,-350 -120,-410 -120,-480 Z", M_SKIN_S, 0))
    ex = 14 * look
    o.append(C(-32, -462, 36, "#fff", LW * 0.8) + C(56, -462, 34, "#fff", LW * 0.8))
    o.append(C(-32 + ex, -458, 5.5, INK, 0) + C(56 + ex, -458, 5.5, INK, 0))
    o.append(P("M 18,-430 C 26,-414 22,-404 12,-404", "none", 4))
    o.append(P("M -10,-366 C 4,-374 26,-374 40,-366", "none", 5))
    if hat:
        o.append(hat)
    o.append(extra)
    return "".join(o)


# Morty variants (hats/extras in Morty local units)
BEANIE = P("M -120,-560 C -110,-640 120,-640 130,-560 Z", "#c0413a", LW) + C(5, -632, 18, "#f2f2ef", LW)
GLASSES = P("M -70,-462 L 92,-462", "none", 8) + C(-32, -462, 40, "none", 8) + C(56, -462, 38, "none", 8)
CHEF = P("M -90,-560 L -80,-610 C -130,-640 -100,-720 -40,-690 C -20,-740 60,-740 70,-690 "
         "C 130,-720 150,-640 100,-610 L 110,-560 Z", "#ffffff", LW)
COP = (P("M -150,-540 L 166,-540 L 150,-500 L -136,-500 Z", "#1d2a4a", LW)
       + P("M -110,-540 C -110,-640 130,-640 130,-540 Z", "#2a3c66", LW) + C(10, -580, 14, "#d9a441", 3))
EVIL = P("M -100,-560 C -60,-620 40,-640 120,-600 C 60,-590 20,-580 -30,-500 Z", "#4a2a14", LW)
HELMET = E(8, -470, 190, 186, "#cfefff", LW, extra='fill-opacity="0.35"') + P("M -110,-560 C -60,-620 40,-630 100,-600", "none", 8, "#ffffff")


def space_morty(frazzled=False):
    ex = (P("M -90,-600 L -120,-660 M 0,-610 L 10,-680 M 90,-600 L 130,-650", "none", 6) + C(140, -540, 16, "#8b8f96", 3)
          if frazzled else "")
    return morty("#eef1f4", "#eef1f4", "#9aa0a8", HELMET, ex, look=-1 if frazzled else 1)


# ---------------------------------------------------------------- portals
def portal(cx, cy, rx=46, ry=62, color="green", ghost=False):
    gl, li, mi, de, da = PORTALS[color]
    if ghost:  # blink spot (closed right now): dashed outline only
        return E(cx, cy, rx, ry, "none", 2.4, de, 'stroke-dasharray="8 7" opacity="0.8"')
    o = [E(cx, cy, rx * 1.25, ry * 1.2, gl, 0, extra='opacity="0.55"'), E(cx, cy, rx, ry, li, 2.4)]
    o.append(E(cx + 3, cy + 3, rx * 0.7, ry * 0.72, mi, 0) + E(cx + 4, cy + 4, rx * 0.4, ry * 0.42, de, 0)
             + E(cx + 5, cy + 5, rx * 0.16, ry * 0.18, da, 0))
    for k in range(3):
        a = k * 2.1
        pts = []
        for i in range(24):
            t = a + i * 0.28
            r = 1 - i / 26
            pts.append(f"{cx + 4 + rx * 0.9 * r * math.cos(t):.1f},{cy + 4 + ry * 0.9 * r * math.sin(t):.1f}")
        o.append(P("M " + " L ".join(pts), "none", 3, gl if k else li))
    o.append(P(f"M {cx-12},{cy+ry-2} q 2,14 6,14 q 4,0 6,-12", li, 1.6))
    return "".join(o)


# ---------------------------------------------------------------- crowd sprites (scene units)
def person(x, y, shirt="#5aa0d8", pants="#3b4250", skin="#f1d3c3", hair="#4a3d36", h=200, hat="", flip=False, arm_up=False):
    s = h / 200
    f = -1 if flip else 1
    arm = "M 18,-140 L 40,-178" if arm_up else "M 18,-140 L 26,-92"
    o = [P("M -15,-100 L -13,-6 L -2,-6 L 0,-80 L 2,-6 L 13,-6 L 15,-100 Z", pants, 1.6),
         P("M -22,-148 C -24,-130 -20,-110 -17,-96 L 17,-96 C 20,-110 24,-130 22,-148 C 10,-154 -10,-154 -22,-148 Z", shirt, 1.6),
         P(f"M -18,-140 L -26,-92 {arm}", "none", 7, shirt, 'stroke-linecap="round"'),
         C(0, -168, 17, skin, 1.6), P("M -17,-172 C -18,-192 16,-194 17,-174 C 8,-182 -8,-182 -17,-172 Z", hair, 1.4),
         C(6, -168, 2, INK, 0), hat]
    return f'<g transform="translate({x:.1f},{y:.1f}) scale({s*f:.3f},{s:.3f})">{"".join(o)}</g>'


def defs():
    ow, ob = "#f3f4f6", "#2a2d35"
    opt = [P("M -10,-6 L -16,-6 L -16,-92 L -3,-92 L -3,-6 Z M 3,-6 L 3,-92 L 16,-92 L 16,-6 L 10,-6 Z", ow, 1.6),
           R(-17, -58, 14, 7, ob, 1) + R(3, -58, 14, 7, ob, 1), R(-18, -8, 15, 8, ob, 1.2, 2) + R(3, -8, 15, 8, ob, 1.2, 2),
           P("M -17,-104 L 17,-104 L 15,-90 L -15,-90 Z", ow, 1.6), R(-14, -116, 28, 13, ob, 1.4, 3),
           P("M -25,-168 L 25,-168 L 18,-114 L -18,-114 Z", ow, 1.6), P("M -25,-168 L -14,-168 L -10,-114 L -18,-114 Z", "#cdd3db", 0)]
    arms_down = P("M -30,-162 L -34,-98 M 30,-162 L 34,-98", "none", 10, INK, 'stroke-linecap="round"') + \
        P("M -30,-162 L -34,-98 M 30,-162 L 34,-98", "none", 7, ow, 'stroke-linecap="round"') + \
        C(-34, -94, 5, ob, 1) + C(34, -94, 5, ob, 1)
    arms_fwd = P("M -28,-160 L -6,-126 L 34,-130 M 28,-160 L 40,-126 L 60,-130", "none", 10, INK, 'stroke-linecap="round"') + \
        P("M -28,-160 L -6,-126 L 34,-130 M 28,-160 L 40,-126 L 60,-130", "none", 7, ow, 'stroke-linecap="round"')
    head = R(-4, -176, 8, 9, ob, 1) + E(0, -188, 13, 16, ob, 1.6) + E(4, -194, 4, 5, "#4a4f5c", 0)
    grok = (E(-12, -4, 9, 5, ob, 1.2) + E(12, -4, 9, 5, ob, 1.2) + R(-20, -62, 40, 54, "#f4f6f8", 1.6, 12)
            + R(-15, -56, 30, 22, "#1f232b", 1.2, 6) + C(-6, -45, 3.5, "#5ff0ff", 0) + C(6, -45, 3.5, "#5ff0ff", 0)
            + P("M 0,-62 L 0,-74", "none", 1.6) + C(0, -76, 3.5, "#5ff0ff", 1))
    drone = (P("M -34,-6 L 34,-6", "none", 3) + E(-34, -10, 16, 3, "#b9c2cc", 1.2) + E(34, -10, 16, 3, "#b9c2cc", 1.2)
             + R(-16, -8, 32, 14, "#f4f6f8", 1.6, 5) + C(0, 1, 3, "#5ff0ff", 0))
    tk = (P("M -30,-40 C -50,-80 -10,-96 0,-60 C 10,-96 40,-84 26,-44 Z", "#c0662a", 1.4)
          + P("M -22,-44 C -30,-68 -6,-80 0,-56 C 6,-80 28,-70 20,-44 Z", "#e3a043", 0)
          + E(0, -28, 24, 20, "#7b4626", 1.6) + P("M -6,-8 L -8,0 M 6,-8 L 8,0", "none", 2, "#e08850")
          + P("M 16,-38 C 22,-56 32,-58 34,-48", "none", 6, "#7b4626", 'stroke-linecap="round"')
          + C(34, -50, 7, "#7b4626", 1.2) + P("M 38,-48 L 46,-46 L 38,-44 Z", "#e3a043", 0.8)
          + P("M 36,-44 C 38,-36 36,-32 34,-30", "none", 3, "#d6453a") + C(36, -52, 1.6, INK, 0))
    return ("<defs>"
            f'<g id="opt">{"".join(opt)}{arms_down}{head}</g>'
            f'<g id="opt_carry">{"".join(opt)}{arms_fwd}{head}</g>'
            f'<g id="grok">{grok}</g><g id="drone">{drone}</g><g id="turkey">{tk}</g>'
            "</defs>")


def zz(x, y):
    return T(x, y, "z", 20, fill="#5a6070") + T(x + 12, y - 14, "Z", 26, fill="#5a6070")
