---
name: plans-page-many-product-tables
description: Сторінка порівняння планів Atlassian містить таблиці кількох продуктів — рядок із потрібним словом може належати чужому продукту; шапку й значення читати з сирого HTML
metadata:
  type: reference
---

`support.atlassian.com/jira-cloud-administration/docs/explore-jira-cloud-plans/` (≈ 800 КБ) — це **не одна
таблиця**: там дві копії таблиці Jira (шапка `Free | Standard | Premium | Enterprise`, розділ «Plans comparison
for Jira»), таблиця Jira Service Management (`Free | Standard | Premium`) і таблиця Jira Product Discovery
(розділ «Prioritization and roadmapping», теж три колонки).

Пастка перевірки 2026-09-30: рядка `Timeline` у таблиці Jira немає — таймлайн стоїть у рядку **`Roadmaps`**
(`Basic | Basic | Advanced | Advanced`). Але на тій самій сторінці є рядок **`Timeline views` з трьома
галочками** — він із таблиці Jira Product Discovery. Твердження уроку «на сторінці порівняння планів рядок
зветься так-то» треба звужувати до таблиці продукту («у таблиці для Jira…»), інакше читач знайде чужий рядок
і вирішить, що урок помиляється.

Метод: читати **сире HTML** (`curl -sL`), а не текст зі знятими тегами — значення колонок склеюються в один
рядок без розділювача; шапку шукати окремо, вона може лежати за десятки тисяч байт до потрібного рядка.
Слова `space`/`project` в таблиці загорнуті в окремі теги — голий `grep` по фразі дає хибний нуль.

Суміжне: [[jira-docs-verification]], [[claims-about-the-docs]].
