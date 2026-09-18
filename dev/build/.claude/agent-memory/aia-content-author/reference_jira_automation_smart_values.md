---
name: reference-jira-automation-smart-values
description: Розумні значення й гілки Jira-автоматизації — де докси суперечать самі собі (duedate/dueDate, облік кроків) і чого в продукті немає, попри картку програми (гілка за JQL, «For each»)
metadata:
  type: reference
---

Зібрано на уроці `j15` «Автоматизація глибше» (2026-09-18), джерело — живі
`support.atlassian.com/cloud-automation/docs/…`. Корисне для довідника «Автоматизація:
тригери, дії, smart values», для `j19` і для будь-якого уроку, що торкається `{{…}}`.

**Чого в продукті НЕМАЄ, хоча картка програми просить:**
- **гілки за JQL не існує.** Гілка ходить лише по спорідненості: `Sub-tasks` · `Parent` ·
  `Stories` · `Epic` · `Created work items` · `Linked work items`. Довільний список за
  запитом дає **дія** `Lookup work items` (або поле JQL у тригері `Scheduled`);
- **назви «For each» у гілці немає.** У доксах є `For all created work items` (приклад) і
  «Loops (for each)» на сторінці обліку — це про облік, не про підпис кроку;
- `format("dd.MM.yyyy")` і `{{now.plusDays(3).format("yyyy-MM-dd")}}` дослівно не
  документовані: є `format("dd/MM/yyyy")`, `format("<pattern>")` і `{{now.plusDays(7)}}`.

**Докси проти доксів (обидві сторінки живі 2026-09-18):**
1. **`{{issue.duedate}}`** (`jira-smart-values-issues`, `…-date-and-time`) проти
   **`{{issue.dueDate.format("dd/MM/yyyy")}}`** (`examples-of-using-smart-values-with-dates`).
   Побічно за `duedate` грає `screens/10`: `Field ID` поля Due date — саме `duedate`.
   В уроці названі обидва написання, висновок для читача — брати значення зі списку біля
   поля й перевіряти в журналі;
2. **облік кроків:** `how-is-my-usage-calculated` рахує крок навіть при
   `NO_ACTIONS_PERFORMED` і `NO_MATCH`, а `best-practices-for-optimizing-automation-rules`
   досі пише «Only flows that perform a successful action will count toward your usage».
   Вірити сторінці обліку (новіша, конкретніша), у довіднику називати сторінку біля
   кожного твердження;
3. **регістр:** `what-are-smart-values` — «multiword properties use camelCase
   capitalization», а `formatting-smart-values-in-jira-automation` — «Field names aren't
   case sensitive». Суперечності немає лише тому, що це різні речі (властивість проти
   назви поля), але читач бачить її як суперечність — розводити явно.

**Головне правило уроку, підтверджене дослівно:** усередині гілки всі посилання на
`{{issue}}` «will point to the related work item, not the trigger work item», а робота,
що запустила flow, доступна як `{{triggerIssue}}`. Гілка в гілці заборонена, `If/else`
всередині гілки не працює, гілки ізольовані й виконуються паралельно.

**Дрібниці, що економлять години:** неіснуюче значення друкується як **порожнє місце**,
без помилки · `{{now}}` віддає час у UTC · `Log action` і `{{#debug}}{{…}}{{/}}` друкують
обчислене значення в журнал запусків · `Lookup work items` бере лише першу сотню робіт ·
`Send email` — **Deprecated**, жива дія `Send customized email` · `Create sub-tasks` уміє
задати лише назву · `Validate query` безсилий, якщо в запиті є `{{…}}`.

Суміжне: [[reference-atlassian-docs-contradict]] (метод «відкрий другу сторінку»),
[[atlassian-docs-fetch]] (як читати й звіряти цитати), [[project-jira-course-authoring]].
