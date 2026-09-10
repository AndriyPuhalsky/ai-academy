# Профіль «чорнила» по колонках смуги 150 px від правого краю (крок 10 px).
import sys, glob, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from png import read_png, px
def lum(p): return 0.2126*p[0]+0.7152*p[1]+0.0722*p[2]
for f in sorted(glob.glob(sys.argv[1])):
    w, h, ch, rows = read_png(f)
    prof = []
    for x0 in range(0, w, 10):
        cnt = sum(1 for x in range(x0, min(x0+10, w)) for y in range(h) if lum(px(rows, ch, x, y)) >= 90)
        prof.append(cnt)
    print(f"{os.path.basename(f):34} " + " ".join(f"{v:>4}" for v in prof))
