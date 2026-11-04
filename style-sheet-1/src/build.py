"""Builds ../sheet.svg (and crop SVG viewBoxes used by render.sh).

    python3 src/build.py && bash src/render_all.sh
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib import *  # noqa
import elon
import rick
import vehicles
import robots
import props

W, H = 3840, 2600
OUT = os.path.join(os.path.dirname(__file__), "..", "sheet.svg")
BG, GRID, GRID2 = "#eeebe3", "#e1ddd2", "#d6d1c4"
GUIDE = "#7fb0dd"

PALETTE = [
    ("Ink", INK), ("Paper", BG),
    ("Elon skin", elon.SKIN), ("Skin shade", elon.SKIN_S), ("Elon hair", elon.HAIR), ("Tee black", elon.TEE),
    ("Denim", elon.DEN), ("Stitch gold", elon.STITCH),
    ("Rick hair", rick.R_HAIR), ("Sweater blue", rick.SWEATER), ("Lab coat", rick.COAT), ("Rick pants", rick.PANTS),
    ("Portal glow", rick.P_GLOW), ("Portal green", rick.P_LIGHT), ("Portal deep", rick.P_DEEP), ("Cranberry", rick.CRAN),
    ("Cyber champagne", vehicles.STEEL), ("Steel shade", vehicles.STEEL_S), ("Glass tint", vehicles.GLASS),
    ("Optimus white", robots.OW), ("Optimus black", robots.OB), ("Grok cyan", robots.CYAN),
    ("Turkey brown", props.T_BR), ("Snood red", props.SNOOD), ("Roast gold", props.ROAST), ("Platter blue", props.RIM),
]

CROPS = {
    "elon": "40 170 1540 1130",
    "rick-portal": "860 230 1800 1080",
    "cybercab": "40 1330 2140 740",
    "robots": "2200 810 1600 1250",
    "heads": "1580 150 2220 660",
    "props": "40 2080 3760 500",
}


def panel(x, y, w, h, num, title, sub=""):
    o = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="22" fill="#fbfaf6" fill-opacity="0.82" stroke="{INK}" stroke-width="4"/>']
    tw = 34 + len(title) * 19 + 70
    o.append(f'<path d="M {x+18},{y-16} L {x+18+tw},{y-16} L {x+18+tw+14},{y+20} L {x+18},{y+20} Z" fill="{INK}"/>')
    o.append(f'<circle cx="{x+44}" cy="{y+2}" r="15" fill="#a8f55a" stroke="#fbfaf6" stroke-width="2"/>')
    o.append(txt(x + 44, y + 9, num, 20, "middle", INK, TITLE_FONT))
    o.append(txt(x + 70, y + 13, title, 30, "start", "#fbfaf6", TITLE_FONT, extra='letter-spacing="1"'))
    if sub:
        o.append(txt(x + w - 22, y + 44, sub, 24, "end", "#6b6776"))
    return "".join(o)


def label(x, y, s, size=30, anchor="middle"):
    return txt(x, y, s, size, anchor, INK)


def note(x, y, s, size=22, anchor="middle", color="#6b6776"):
    return txt(x, y, s, size, anchor, color)


def arrow(x1, y1, x2, y2, color="#e2453c"):
    return (f'<path d="M {x1},{y1} Q {(x1+x2)/2+20},{(y1+y2)/2-30} {x2},{y2}" fill="none" stroke="{color}" stroke-width="2.6" stroke-dasharray="6 5"/>'
            f'<circle cx="{x2}" cy="{y2}" r="4" fill="{color}"/>')


def build():
    o = []
    o.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">')
    o.append("<title>Thanksgiving at SpaceX: style sheet 1 (2D cartoon)</title>")
    o.append(f"<defs><pattern id=\"grid\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\">"
             f"<path d=\"M 40,0 L 0,0 L 0,40\" fill=\"none\" stroke=\"{GRID}\" stroke-width=\"1.4\"/></pattern>"
             f"<pattern id=\"grid2\" width=\"200\" height=\"200\" patternUnits=\"userSpaceOnUse\">"
             f"<path d=\"M 200,0 L 0,0 L 0,200\" fill=\"none\" stroke=\"{GRID2}\" stroke-width=\"2\"/></pattern></defs>")
    o.append("<style>path{stroke-linejoin:round;stroke-linecap:round}</style>")
    o.append(f'<rect width="{W}" height="{H}" fill="{BG}"/><rect width="{W}" height="{H}" fill="url(#grid)"/><rect width="{W}" height="{H}" fill="url(#grid2)"/>')

    # header
    o.append(txt(48, 112, "THANKSGIVING AT SPACEX", 84, "start", INK, TITLE_FONT, extra='letter-spacing="2"'))
    o.append(txt(1290, 112, "model sheet · style 1 · 2D cartoon (rev. 3: show-model Elon, Rick + Morty)", 46, "start", "#2f9a3a", LABEL_FONT))
    o.append(note(3800, 82, "vector only · flat colour + one shade · thin even ink (~4u outline, ~2u inner) · dot pupils", 26, "end"))
    o.append(note(3800, 118, "light from upper right · shade side always faces left", 26, "end"))

    # ---------------- 1. line-up
    x0, y0, w0, h0 = 40, 170, 1520, 1130
    o.append(panel(x0, y0, w0, h0, "1", "CAST LINE-UP", "same scale"))
    gy = 1230
    guides = [(-884, "top of hair"), (-759, "eye line (Elon)"), (-621, "chin"), (-596, "shoulders"), (-380, "hem / hip"), (-220, "knee"), (0, "ground")]
    for dy, name in guides:
        o.append(f'<path d="M {x0+30},{gy+dy} L {x0+w0-30},{gy+dy}" stroke="{GUIDE}" stroke-width="2" stroke-dasharray="14 10" opacity="0.8"/>')
        o.append(txt(x0 + 34, gy + dy - 8, name, 20, "start", GUIDE))
    # head-count ruler
    for k in range(4):
        yy = gy - 884 + k * 260
        o.append(f'<path d="M {x0+w0-60},{yy} L {x0+w0-36},{yy}" stroke="{GUIDE}" stroke-width="3"/>')
        o.append(txt(x0 + w0 - 66, yy + 7, f"{k}", 20, "end", GUIDE))
    o.append(f'<path d="M {x0+w0-48},{gy-884} L {x0+w0-48},{gy}" stroke="{GUIDE}" stroke-width="3"/>')
    o.append(txt(x0 + w0 - 48, gy + 34, "3.4 heads", 20, "middle", GUIDE))
    o.append(g(elon.elon_front(), f"translate(305,{gy})"))
    o.append(g(elon.elon_34(), f"translate(625,{gy})"))
    o.append(g(rick.rick(), f"translate(1020,{gy})"))
    o.append(g(rick.morty(), f"translate(1325,{gy})"))
    o.append(label(305, gy + 50, "ELON · front"))
    o.append(label(625, gy + 50, "ELON · 3/4"))
    o.append(label(1020, gy + 50, "RICK (fan art)"))
    o.append(label(1325, gy + 50, "MORTY (fan art)"))

    # ---------------- 2. heads
    x1, y1, w1, h1 = 1580, 170, 2220, 630
    o.append(panel(x1, y1, w1, h1, "2", "ELON · EXPRESSIONS", "head close-ups, 1.6x"))
    for k, (ex, name) in enumerate((("smirk", "SMIRK (default)"), ("laugh", "LAUGHING"), ("focused", "FOCUSED"))):
        cx = x1 + 370 + k * 740
        with scaled(1 / 1.6 * 1.2):
            o.append(g(elon.head_front(ex, bust=True), f"translate({cx},{y1+1480}) scale(1.6)"))
        o.append(label(cx, y1 + h1 - 16, name, 32))

    # ---------------- 3. portal
    x2, y2, w2, h2 = 1580, 820, 1060, 480
    o.append(panel(x2, y2, w2, h2, "3", "PORTAL + FLYING CRANBERRY"))
    with scaled(1.0):
        o.append(g(rick.portal(0, 0), f"translate({x2+430},{y2+250}) scale(0.84)"))
    o.append(note(x2 + 880, y2 + 456, "goo drips + flecks; spiral = 6 strokes", 22))

    # ---------------- 4. grok bot + drone
    x3, y3, w3, h3 = 2660, 820, 1140, 480
    o.append(panel(x3, y3, w3, h3, "4", "HELPER BOTS"))
    o.append(g(robots.grok_bot(), f"translate({x3+280},{y3+430}) scale(0.98)"))
    o.append(g(robots.drone(), f"translate({x3+820},{y3+180}) scale(0.98)"))
    o.append(label(x3 + 280, y3 + 466, "GROK BOT"))
    o.append(label(x3 + 820, y3 + 466, "DELIVERY DRONE"))

    # ---------------- 5. cybercab
    x4, y4, w4, h4 = 40, 1330, 2140, 720
    o.append(panel(x4, y4, w4, h4, "5", "TESLA CYBERCAB", "champagne steel · disc wheels · butterfly doors"))
    o.append(g(vehicles.cybercab_closed(), f"translate({x4+90},{y4+630}) scale(0.9)"))
    o.append(g(vehicles.cybercab_open(), f"translate({x4+1110},{y4+630}) scale(0.9)"))
    o.append(label(x4 + 490, y4 + 680, "side · closed"))
    o.append(label(x4 + 1510, y4 + 680, "side · door up"))
    o.append(note(x4 + 1510, y4 + 708, "inside: 2 seats, centre screen, no steering wheel or pedals", 22, "middle", "#e2453c"))

    # ---------------- 6. optimus
    x5, y5, w5, h5 = 2200, 1330, 1600, 720
    o.append(panel(x5, y5, w5, h5, "6", "OPTIMUS", "Gen 2/3 look, 0.8x"))
    o.append(g(robots.optimus_wave(), f"translate({x5+420},{y5+660}) scale(0.8)"))
    o.append(g(robots.optimus_tray(), f"translate({x5+1150},{y5+660}) scale(0.8)"))
    o.append(label(x5 + 420, y5 + 700, "standing · wave"))
    o.append(label(x5 + 1150, y5 + 700, "carrying pie"))

    # ---------------- 7. props
    x6, y6, w6, h6 = 40, 2080, 2540, 480
    o.append(panel(x6, y6, w6, h6, "7", "THANKSGIVING PROPS"))
    o.append(g(props.live_turkey(), f"translate({x6+330},{y6+410})"))
    o.append(g(props.cranberry_pile(), f"translate({x6+1060},{y6+410})"))
    o.append(g(props.roast_platter(), f"translate({x6+1900},{y6+400})"))
    o.append(label(x6 + 330, y6 + 456, "LIVE TURKEY (unharmed, unionised)"))
    o.append(label(x6 + 1060, y6 + 456, "CRANBERRY PILE"))
    o.append(label(x6 + 1900, y6 + 456, "ROAST ON PLATTER (store-bought)"))

    # ---------------- 8. palette
    x7, y7, w7, h7 = 2600, 2080, 1200, 480
    o.append(panel(x7, y7, w7, h7, "8", "PALETTE"))
    cols = 7
    sw_w, sw_h = 150, 72
    for i, (name, col) in enumerate(PALETTE):
        cx = x7 + 40 + (i % cols) * 162
        cy = y7 + 50 + (i // cols) * 106
        o.append(f'<rect x="{cx}" y="{cy}" width="{sw_w}" height="{sw_h}" rx="10" fill="{col}" stroke="{INK}" stroke-width="3"/>')
        o.append(txt(cx + 4, cy + sw_h + 22, name, 20, "start", INK))
        o.append(txt(cx + sw_w - 6, cy + sw_h - 8, col.upper(), 14, "end", "#ffffff" if name in ("Ink", "Tee black", "Glass tint", "Optimus black", "Portal deep", "Elon hair", "Denim", "Turkey brown") else INK, "monospace"))
    o.append("</svg>")
    return "".join(o)


if __name__ == "__main__":
    svg = build()
    with open(OUT, "w") as f:
        f.write(svg)
    with open(os.path.join(os.path.dirname(__file__), "crops.json"), "w") as f:
        json.dump(CROPS, f, indent=1)
    print(f"wrote {OUT} ({len(svg)//1024} KB)")
