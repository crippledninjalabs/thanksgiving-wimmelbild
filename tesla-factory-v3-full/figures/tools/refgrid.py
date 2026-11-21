# Debug: crop a reference photo region (in original px) with a labelled grid every `step` original px.
import sys
from PIL import Image, ImageDraw
src, x0, y0, x1, y1, step, scale, out = sys.argv[1], *map(int, sys.argv[2:7]), float(sys.argv[7]), sys.argv[8]
im = Image.open(src).convert('RGB').crop((x0, y0, x1, y1))
im = im.resize((int((x1 - x0) * scale), int((y1 - y0) * scale)))
d = ImageDraw.Draw(im)
for x in range((x0 // step + 1) * step, x1, step):
    X = (x - x0) * scale; d.line([(X, 0), (X, im.size[1])], fill=(255, 0, 255) if x % (step * 5) == 0 else (0, 200, 255), width=1)
    if x % (step * 5) == 0: d.text((X + 2, 2), str(x), fill=(255, 0, 255))
for y in range((y0 // step + 1) * step, y1, step):
    Y = (y - y0) * scale; d.line([(0, Y), (im.size[0], Y)], fill=(255, 0, 255) if y % (step * 5) == 0 else (0, 200, 255), width=1)
    if y % (step * 5) == 0: d.text((2, Y + 2), str(y), fill=(255, 0, 255))
im.save(out)
