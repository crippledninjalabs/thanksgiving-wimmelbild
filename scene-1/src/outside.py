"""Ground strip across the whole frame, launch pad apron, Cybercab at the
rocket base (dropping off the new Space Morty while the frazzled one stumbles
out), turkey pen, autumn tree, pumpkins + scarecrow."""
import vehicles
from common import W, H, GROUND, RC, R, C, E, P, T, INK, use, sprite, scaled, FIG, CONCRETE, CONCRETE_S
import cast


def ground():
    o = [R(0, GROUND, W, H - GROUND, "#7c9a4a", 0), R(0, GROUND, W, 16, "#5d7a35", 0)]
    o.append(R(5160, GROUND, 2080, H - GROUND, CONCRETE, 0) + R(5160, GROUND, 2080, 12, CONCRETE_S, 0))
    for k in range(40):  # grass tufts
        x = 40 + k * 190 + (k * 37) % 60
        if 5160 < x < 7240:
            continue
        o.append(P(f"M {x},{GROUND+40} l 6,-18 l 4,16 l 6,-20 l 4,22", "none", 2, "#4a6a28"))
    # underground fuel line + conveyor tunnel (rocket bay -> pad), seen in section
    o.append(R(3700, GROUND + 70, 2000, 26, "#4c4f57", 2, 13) + T(3720, GROUND + 130, "fuel line + bay tunnel to pad", 22, fill="#2a3018"))
    return "".join(o)


def outside():
    o = []
    # Cybercab, door up, new Space Morty climbing out; frazzled Morty stumbling over
    with scaled(0.8):
        cab = vehicles.cybercab_open()
    o.append(f'<g transform="translate({5180},{GROUND}) scale(0.5)">{cab}</g>')
    o.append(sprite(cast.space_morty(), 5350, GROUND - 8, FIG))
    o.append(sprite(cast.space_morty(frazzled=True), 5590, GROUND - 4, FIG, flip=True))
    o.append(T(5180, GROUND + 60, "new Space Morty in / frazzled one out", 24, fill="#1d2a10"))
    # turkey pen right of the tower
    px0, px1 = 7240, 7650
    o.append(R(px0 + 40, GROUND - 60, 120, 40, "#e8c35a", 1.6, 6))  # hay bale
    for k, (tx, fl) in enumerate(((7300, False), (7380, True), (7460, False), (7540, True), (7610, False), (7420, False))):
        o.append(use("turkey", tx, GROUND - (6 if k < 5 else 30), 1.0, fl))
    for k in range(9):
        x = px0 + k * (px1 - px0) / 8
        o.append(R(x - 4, GROUND - 70, 8, 70, "#a87a4a", 1.4))
    o.append(R(px0, GROUND - 60, px1 - px0, 8, "#c09060", 1.4) + R(px0, GROUND - 30, px1 - px0, 8, "#c09060", 1.4))
    # autumn tree (between building and Cybercab) + pumpkins + scarecrow
    tx = 5110
    o.append(P(f"M {tx-14},{GROUND} L {tx-10},{GROUND-220} L {tx+10},{GROUND-220} L {tx+14},{GROUND} Z", "#6b4a2e", 1.8))
    for dx, dy, r, col in ((-60, -260, 70, "#d9762b"), (40, -290, 80, "#e8a33a"), (0, -360, 70, "#c4502a"), (70, -220, 50, "#d9762b")):
        o.append(C(tx + dx, GROUND + dy, r, col, 1.8))
    for x in (5040, 5075, 7200):
        o.append(E(x, GROUND - 14, 18, 14, "#f08a24", 1.6) + P(f"M {x},{GROUND-28} l 2,-8", "none", 2.4, "#4a6a28"))
    sx = 7200
    o.append(P(f"M {sx},{GROUND} L {sx},{GROUND-170} M {sx-50},{GROUND-130} L {sx+50},{GROUND-130}", "none", 5, "#8a6a3a"))
    o.append(R(sx - 22, GROUND - 150, 44, 60, "#5a7fb0", 1.6) + C(sx, GROUND - 168, 18, "#e8c35a", 1.6)
             + P(f"M {sx-28},{GROUND-178} L {sx+28},{GROUND-178} L {sx},{GROUND-206} Z", "#6b4a2e", 1.6))
    return "".join(o)
