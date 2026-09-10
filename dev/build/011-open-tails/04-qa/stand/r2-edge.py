# КОЛО 2: смуга 150 px від правого краю .ds-tbl__wrap--tall.
# Смуги: A = 0..97 (вміст поза згасанням), B = 98..137 (зона згасання, 40 px),
# C = 138..149 (жолоб 12 px). Для кожної — макс. яскравість і кількість «чорнильних» пікселів.
import sys, glob, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from png import read_png, px
def lum(p): return 0.2126*p[0] + 0.7152*p[1] + 0.0722*p[2]
BANDS = {"A_content": (0, 98), "B_fade": (98, 138), "C_gutter": (138, 150)}
res = {}
for f in sorted(glob.glob(sys.argv[1])):
    w, h, ch, rows = read_png(f)
    r = {}
    for name, (x0, x1) in BANDS.items():
        mx = 0; ink = 0; tot = 0
        for y in range(h):
            for x in range(x0, min(x1, w)):
                L = lum(px(rows, ch, x, y)); tot += 1
                if L > mx: mx = L
                if L >= 90: ink += 1
        r[name] = {"max": round(mx), "ink>=90": ink, "px": tot}
    res[os.path.basename(f)] = r
print(json.dumps(res, ensure_ascii=False, indent=1))
