# Порівняння t3b: база (39a70a3) проти робочого дерева — рядки ПЕРШОЇ клітинки, ширина другої колонки, скрол.
import json, sys
base = json.load(open(sys.argv[1])); after = json.load(open(sys.argv[2]))
wrap = json.load(open("wrap-set.json")) if len(sys.argv) < 4 else json.load(open(sys.argv[3]))
wrapset = set(w[0] + "#" + str(w[2]) for w in wrap)
tot = 0; changed = []; fixed = []; regress = []; scroll_after = []
for k, tabs in after.items():
    if k not in base: continue
    for i, t in enumerate(tabs):
        if i >= len(base[k]): continue
        b = base[k][i]; tot += 1
        key = k + "#" + (t["anchor"] or str(i))
        if b["c1"] != t["c1"]:
            more = sum(1 for x, y in zip(b["c1"], t["c1"]) if y > x)
            changed.append((key, sum(b["c1"]), sum(t["c1"]), more, b["cols"][:2], t["cols"][:2], b["sw"] > b["ww"] + 1, t["sw"] > t["ww"] + 1))
        if b["sw"] > b["ww"] + 1 and not (t["sw"] > t["ww"] + 1): fixed.append(key)
        if not (b["sw"] > b["ww"] + 1) and t["sw"] > t["ww"] + 1: regress.append(key)
        if t["sw"] > t["ww"] + 1: scroll_after.append((key, t["cols"][:2], t["ww"], t["sw"]))
print("таблиць порівняно:", tot)
print("клітинки першої колонки змінили кількість рядків:", len(changed))
for c in changed: print("  ", c)
print("скрол зник:", len(fixed), fixed)
print("скрол зʼявився (регресія):", len(regress), regress)
print("скрол лишився після:", len(scroll_after))
for s in scroll_after: print("  ", s)
