# КОЛО 2: кільце фокуса (box-shadow 2 px тло + 4 px акцент rgb(139,166,235) ≈ 165 яскравості).
# Шукаємо рядок/колонку з найбільшим покриттям «кільцевих» пікселів і рахуємо частку по довжині.
import sys, glob, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from png import read_png, px
def lum(p): return 0.2126*p[0]+0.7152*p[1]+0.0722*p[2]
RING = lambda p: abs(p[0]-139) <= 12 and abs(p[1]-166) <= 12 and abs(p[2]-235) <= 12
for f in sorted(glob.glob(sys.argv[1])):
    w, h, ch, rows = read_png(f)
    best_row = max(range(0, 12), key=lambda y: sum(RING(px(rows, ch, x, y)) for x in range(w)))
    cov_row = sum(RING(px(rows, ch, x, best_row)) for x in range(w))
    best_colL = max(range(0, 12), key=lambda x: sum(RING(px(rows, ch, x, y)) for y in range(h)))
    cov_colL = sum(RING(px(rows, ch, best_colL, y)) for y in range(h))
    best_colR = max(range(w-12, w), key=lambda x: sum(RING(px(rows, ch, x, y)) for y in range(h)))
    cov_colR = sum(RING(px(rows, ch, best_colR, y)) for y in range(h))
    print(f"{os.path.basename(f):32} {w}x{h} | верх y={best_row}: {cov_row}/{w} px ({100*cov_row//w}%) | ліво x={best_colL}: {cov_colL}/{h} | право x={best_colR}: {cov_colR}/{h}")
