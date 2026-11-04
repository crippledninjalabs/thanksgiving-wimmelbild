"""Tiny helpers for hand-building a cartoon model sheet as plain SVG.

Every shape is a path in absolute coordinates (M, L, C, Q, Z only), so we can
mirror it and add a small deterministic "hand-drawn" wobble to the points.
Flat-shaded parts are drawn as: fill, then shade shapes clipped to the fill,
then the ink outline on top, so shadows never spill over the line.
"""
import math
import random
import re

INK = "#1c1a26"

ST = {"k": 1.0, "wob": 1.1}  # k = stroke multiplier (scaled close-ups), wob = hand-drawn jitter
BASE_LW = 0.78  # show-accurate thinner, uniform lines
_seed = [0]
_id = [0]

NUM = re.compile(r"-?\d*\.?\d+")
TOK = re.compile(r"[MLCQZ]|-?\d*\.?\d+")


def nid(p="c"):
    _id[0] += 1
    return f"{p}{_id[0]}"


def wob(d, a=None):
    a = ST["wob"] if a is None else a
    if a <= 0:
        return d
    _seed[0] += 1
    r = random.Random(_seed[0] * 7919)

    def f(m):
        return f"{float(m.group(0)) + r.uniform(-a, a):.1f}"

    return NUM.sub(f, d)


def mirror(d):
    out, i = [], 0
    for t in TOK.findall(d):
        if t in "MLCQZ":
            out.append(t)
        else:
            v = float(t)
            if i % 2 == 0:
                v = -v
            i += 1
            out.append(f"{v:g}")
    # glue numbers in pairs with commas for readability
    s, nums = [], []
    for t in out:
        if t in "MLCQZ":
            if nums:
                s.append(" ".join(f"{nums[j]},{nums[j+1]}" for j in range(0, len(nums), 2)))
                nums = []
            s.append(t)
        else:
            nums.append(t)
    if nums:
        s.append(" ".join(f"{nums[j]},{nums[j+1]}" for j in range(0, len(nums), 2)))
    return " ".join(s)


def shift(d, dx=0, dy=0):
    out, i = [], 0
    for t in TOK.findall(d):
        if t in "MLCQZ":
            out.append(t)
        else:
            v = float(t) + (dx if i % 2 == 0 else dy)
            i += 1
            out.append(f"{v:g}")
    res, nums = [], []
    for t in out:
        if t in "MLCQZ":
            if nums:
                res.append(" ".join(f"{nums[j]},{nums[j+1]}" for j in range(0, len(nums), 2)))
                nums = []
            res.append(t)
        else:
            nums.append(t)
    if nums:
        res.append(" ".join(f"{nums[j]},{nums[j+1]}" for j in range(0, len(nums), 2)))
    return " ".join(res)


def sw(w):
    return f"{w * ST['k'] * BASE_LW:.2f}"


def ell(cx, cy, rx, ry=None):
    """Ellipse as 4 cubic segments (so it can wobble like everything else)."""
    ry = rx if ry is None else ry
    k = 0.5523
    return (
        f"M {cx-rx},{cy} C {cx-rx},{cy-ry*k} {cx-rx*k},{cy-ry} {cx},{cy-ry} "
        f"C {cx+rx*k},{cy-ry} {cx+rx},{cy-ry*k} {cx+rx},{cy} "
        f"C {cx+rx},{cy+ry*k} {cx+rx*k},{cy+ry} {cx},{cy+ry} "
        f"C {cx-rx*k},{cy+ry} {cx-rx},{cy+ry*k} {cx-rx},{cy} Z"
    )


def part(d, fill, shades=(), w=5, a=None, outline=True, extra="", stroke=INK):
    """Filled shape with clipped flat shades and an ink outline.
    shades: list of (path_d, color) or raw svg strings (drawn inside clip)."""
    d = wob(d, a)
    o = []
    if shades:
        cid = nid()
        o.append(f'<clipPath id="{cid}"><path d="{d}"/></clipPath>')
        o.append(f'<path d="{d}" fill="{fill}"/>')
        inner = []
        for s in shades:
            if isinstance(s, str):
                inner.append(s)
            else:
                sd, sc = s
                inner.append(f'<path d="{wob(sd, 0.5)}" fill="{sc}"/>')
        o.append(f'<g clip-path="url(#{cid})">{"".join(inner)}</g>')
        if outline:
            o.append(f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{sw(w)}" {extra}/>')
    else:
        st = f' stroke="{stroke}" stroke-width="{sw(w)}"' if outline else ""
        o.append(f'<path d="{d}" fill="{fill}"{st} {extra}/>')
    return "".join(o)


def line(d, w=3.2, color=INK, dash=None, a=None, extra=""):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{wob(d, a)}" fill="none" stroke="{color}" stroke-width="{sw(w)}"{da} {extra}/>'


def fillp(d, color, a=None, extra=""):
    return f'<path d="{wob(d, a)}" fill="{color}" {extra}/>'


def dot(cx, cy, r, fill=INK, extra=""):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.2f}" fill="{fill}" {extra}/>'


def g(content, transform=None, extra=""):
    t = f' transform="{transform}"' if transform else ""
    return f"<g{t} {extra}>{''.join(content) if isinstance(content, list) else content}</g>"


LABEL_FONT = "'Patrick Hand','Comic Neue','Comic Sans MS','Chalkboard SE',sans-serif"
TITLE_FONT = "'Luckiest Guy','Bangers','Impact','Arial Black',sans-serif"


def txt(x, y, s, size=30, anchor="start", fill=INK, font=LABEL_FONT, weight=400, extra=""):
    s = s.replace("&", "&amp;").replace("<", "&lt;")
    return (f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" '
            f'font-weight="{weight}" text-anchor="{anchor}" fill="{fill}" {extra}>{s}</text>')


class scaled:
    """Context manager: draw at stroke multiplier k (for zoomed close-ups)."""

    def __init__(self, k):
        self.k = k

    def __enter__(self):
        self.old = dict(ST)
        ST["k"] = self.k
        ST["wob"] = self.old["wob"] * self.k

    def __exit__(self, *a):
        ST.update(self.old)
