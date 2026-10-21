"""Vetoriza public/brand/original/mandala.png (a mandala oficial) → scripts/brand/mandala-path.txt (viewBox 0 0 100 100).
Precisa de pillow, numpy e potracer (pip install potracer)."""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
import potrace

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
img = Image.open(os.path.join(ROOT, "public/brand/original/mandala.png")).convert("L")
dark = np.array(img) < 128
ys, xs = np.nonzero(dark)
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
# Recorta no círculo e normaliza pra um quadrado (a foto vem levemente achatada).
SIZE = 1000
crop = img.crop((x0, y0, x1, y1)).resize((SIZE, SIZE), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
# potracer preenche onde o bitmap é False → passa o claro como True pra preencher as linhas escuras.
bm = potrace.Bitmap(np.array(crop) >= 128)
plist = bm.trace(turdsize=20, alphamax=1.0, opticurve=True, opttolerance=0.3)

PAD = 0.6
k = (100 - 2 * PAD) / SIZE
fmt = lambda p: f"{PAD + p.x * k:.2f} {PAD + p.y * k:.2f}"
parts = []
for curve in plist:
    d = [f"M{fmt(curve.start_point)}"]
    for seg in curve.segments:
        if seg.is_corner:
            d.append(f"L{fmt(seg.c)} L{fmt(seg.end_point)}")
        else:
            d.append(f"C{fmt(seg.c1)} {fmt(seg.c2)} {fmt(seg.end_point)}")
    parts.append(" ".join(d) + "Z")
path = " ".join(parts)
with open(os.path.join(ROOT, "scripts/brand/mandala-path.txt"), "w") as fh:
    fh.write(path)
print(len(plist), "contornos,", len(path), "chars")
