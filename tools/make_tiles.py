#!/usr/bin/env python3
"""Losslessly crop assets/background-8k.jpg into a zoom pyramid level, and
write the social preview plus favicon from the 4K background.

Requires jpegtran (package libjpeg-turbo-progs) and Pillow.
Run from the repository root: python3 tools/make_tiles.py
"""
import json
import os
import subprocess
import sys

from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SRC = os.path.join(ROOT, 'assets', 'background-8k.jpg')
PREVIEW = os.path.join(ROOT, 'assets', 'background-4k.jpg')
OUT = os.path.join(ROOT, 'assets', 'tiles')
TILE = 1024


def crop(src, dest, x, y, w, h):
    subprocess.check_call([
        'jpegtran', '-crop', f'{w}x{h}+{x}+{y}',
        '-optimize', '-copy', 'none', '-outfile', dest, src,
    ])


def main():
    im = Image.open(SRC)
    width, height = im.size
    im.close()
    os.makedirs(OUT, exist_ok=True)
    tiles = []
    cols = (width + TILE - 1) // TILE
    rows = (height + TILE - 1) // TILE
    for r in range(rows):
        for c in range(cols):
            x, y = c * TILE, r * TILE
            w, h = min(TILE, width - x), min(TILE, height - y)
            name = f'r{r:02d}c{c:02d}.jpg'
            dest = os.path.join(OUT, name)
            crop(SRC, dest, x, y, w, h)
            got = Image.open(dest)
            if got.size != (w, h):
                sys.exit(f'{name} is {got.size}, expected {(w, h)}')
            got.close()
            tiles.append({'c': c, 'r': r, 'x': x, 'y': y, 'w': w, 'h': h, 'file': name})
            print(name, w, h)
    manifest = {
        'tileSize': TILE,
        'width': width,
        'height': height,
        'cols': cols,
        'rows': rows,
        'source': 'assets/background-8k.jpg',
        'note': 'Lossless jpegtran crops of the 8K background. Drawn over the 4K preview once the view is close enough that the preview would soften.',
        'tiles': tiles,
    }
    with open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=1)
        f.write('\n')

    preview = Image.open(PREVIEW).convert('RGB')
    if preview.size != (3840, 2160):
        preview = preview.resize((3840, 2160), Image.Resampling.LANCZOS)
    share = preview.resize((1200, 675), Image.Resampling.LANCZOS)
    share.save(os.path.join(ROOT, 'share.jpg'), quality=86, optimize=True, progressive=True)
    preview.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(ROOT, 'favicon.png'))
    print('wrote', len(tiles), 'tiles, share.jpg, favicon.png')


if __name__ == '__main__':
    main()
