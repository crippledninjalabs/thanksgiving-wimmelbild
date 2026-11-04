"""Builds ../scene.svg (7680 x 4320). Run: python3 src/build.py && bash src/render.sh"""
import os
from common import W, H, HERE
import cast, sky, outside, building, rocket

OUT = os.path.join(HERE, "..", "scene.svg")


def build():
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
         "<title>Thanksgiving at SpaceX: scene 1 (light pass)</title>",
         "<style>path{stroke-linejoin:round;stroke-linecap:round}</style>", cast.defs(),
         sky.draw(), building.draw(), rocket.draw(), outside.ground(), outside.outside(), "</svg>"]
    return "".join(o)


if __name__ == "__main__":
    s = build()
    open(OUT, "w").write(s)
    print(f"wrote scene.svg ({len(s)//1024} KB)")
