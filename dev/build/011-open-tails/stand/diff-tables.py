#!/usr/bin/env python3
import json, sys
b = json.load(open('base-tables.json')); a = json.load(open('after-tables.json'))
for w in ['1280', '768', '390']:
    changed = []; fixed = []; regress = []; scroll_gone = 0; scroll_new = 0; n = 0
    for k in a:
        if not k.startswith(w + ':') or k not in b: continue
        for x, y in zip(a[k], b[k]):
            n += 1
            same = x['cols'] == y['cols'] and x['c1lines'] == y['c1lines'] and (x['sw'] > x['ww'] + 1) == (y['sw'] > y['ww'] + 1)
            if same: continue
            pg = k.split(':', 1)[1]
            was_scroll = y['sw'] > y['ww'] + 1; now_scroll = x['sw'] > x['ww'] + 1
            if was_scroll and not now_scroll: scroll_gone += 1
            if now_scroll and not was_scroll: scroll_new += 1
            c2b = y['cols'][1] if len(y['cols']) > 1 else None; c2a = x['cols'][1] if len(x['cols']) > 1 else None
            maxl_b = max(y['c1lines'] or [0]); maxl_a = max(x['c1lines'] or [0])
            rec = (pg, x['anchor'], 'cols', y['cols'], '->', x['cols'], 'c1 max lines', maxl_b, '->', maxl_a, 'scroll', was_scroll, '->', now_scroll)
            changed.append(rec)
            if c2b is not None and c2a is not None and c2a > c2b and maxl_a >= maxl_b: fixed.append(rec)
            if maxl_a > maxl_b and (c2b is None or c2a <= c2b): regress.append(rec)
    print(f'== {w}: tables {n}, changed {len(changed)}, col2 wider {len(fixed)}, col1 more lines w/o col2 gain {len(regress)}, scroll gone {scroll_gone}, scroll new {scroll_new}')
    for r in changed: print('  ', r)
