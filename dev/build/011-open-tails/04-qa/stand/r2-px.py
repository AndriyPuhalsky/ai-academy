# КОЛО 2: аналіз пікселів знімків правого жолоба (r2-vbar-*.png, 20 px завширшки).
# Для кожної колонки — макс. яскравість, кількість рядків >= 100 і RGB найсвітлішого пікселя.
import sys, glob, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from png import read_png, px

def lum(p): return 0.2126*p[0] + 0.7152*p[1] + 0.0722*p[2]

def analyze(path, thr=100):
    w, h, ch, rows = read_png(path)
    cols = []
    for x in range(w):
        best = (0, None); cnt = 0
        for y in range(h):
            p = px(rows, ch, x, y); L = lum(p)
            if L > best[0]: best = (L, p)
            if L >= thr: cnt += 1
        cols.append({"x": x, "max": round(best[0]), "rgb": best[1], "rows": cnt})
    return w, h, cols

if __name__ == "__main__":
    pat = sys.argv[1] if len(sys.argv) > 1 else "*/shots/r2-vbar-*.png"
    thr = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    res = {}
    for f in sorted(glob.glob(pat)):
        w, h, cols = analyze(f, thr)
        bright = [c for c in cols if c["max"] >= thr]
        res[os.path.basename(f)] = {
            "size": [w, h],
            "bright_cols": [c["x"] for c in bright],
            "detail": [{"x": c["x"], "max": c["max"], "rgb": list(c["rgb"]), "rows": c["rows"]} for c in bright],
            "peak": max(c["max"] for c in cols),
        }
    print(json.dumps(res, ensure_ascii=False, indent=1))
