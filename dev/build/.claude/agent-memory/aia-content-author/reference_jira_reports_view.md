---
name: reference-jira-reports-view
description: Вигляд Reports у Jira Cloud — це оглядова панель, а не список звітів; звіти за кнопкою More reports, і склад різний у спейсі розробки (6) та в діловому (старе слово «issue»); докси називають чотири; перевірено наживо на Free 2026-09-30
metadata:
  type: reference
---

**`Reports` — не список звітів, а оглядова панель.** Живий екран на справжньому Free
(2026-09-30, `00-research/screens/33-sandbox-free-2026-09-30c.md` §7): сторінка відкривається
чотирма плитками («N work items — completed / updated / created in the last 7 days», «due in the
next 7 days»), кільцевими діаграмами `Work items by status` / `by type` / `by assignee`,
графіками `Work item creation trend` / `cycle time` / `lead time` / `completion trend` і таблицею
`Work item details`. Самі звіти — за кнопкою **`More reports`**.

**Склад `More reports` залежить від типу спейсу:**
- **спейс розробки — шість** (не чотири, як у доксах): `Burnup report` · `Sprint burndown chart` ·
  `Velocity report` · `Cumulative flow diagram` · **`Cycle Time Report`** ·
  **`Deployment Frequency Report`** (два останніх — про розгортання коду). Назви в діалозі
  довші, ніж у доксах («Burnup» → `Burnup report`);
- **діловий спейс — інший перелік і старе слово «issue»**: `Average Age Report`,
  `Created vs Resolved Issues Report`, `Pie Chart Report`, `Recently Created Issues Report`,
  `Resolution Time Report`, `Single Level Group By Report`, `Time Since Issues Report`,
  `Time Tracking Report`, `Workload Pie Chart Report` — у трьох групах.

**Де вкладка живе:** у спейсі **розробки** її треба додати (`+` → панель `Views` →
`Add to navigation`; без цього пряма адреса `…/reports` віддає «We can't find the page you're
looking for»), у **діловому** вона стоїть у рядку виглядів одразу (у вузькому вікні ховається
під `More`, як і решта вкладок, що не вмістились).

⚠ Два числа, яким не можна вірити: **лічильники плиток відставали** від реальної кількості робіт
(пʼять робіт — панель показала три), і **«три з чотирьох звітів вимагають спринтів»** — це висновок
курсу, а докси називають прямо лише два приклади («Burnup and Velocity reports won't be available
if you don't have the Sprints feature enabled»). `Burnup report` на Free відкривається.

**Why:** у j13 перелік звітів пʼять хвиль стояв на доксах, і пункт «Agents dashboard у розділі
звітів» малював платну вітрину частиною екрана Free, якого там немає.

**How to apply:** описуючи звіти, розділяй три речі — що каже довідка, що показує панель і що
лежить за `More reports`; переліки — з датою й назвою спейсу, бо вони різні. Пов'язане:
[[reference-jira-space-templates]] · [[reference-atlassian-docs-contradict]] ·
[[project-jira-course-authoring]]
