---
name: reference-jira-plan-limits-sources
description: Де лежить правда про плани й ліміти Jira — консоль Change plan → Compare features проти доксів (Rovo: докси Standard+, консоль Standard ✗) і дві РІЗНІ добові межі листів з точними сторінками; межа автоматизації названа за застарілою дією Send email
metadata:
  type: reference
---

Три джерела про «що дає план» розходяться систематично, і кожне треба цитувати окремо.

**1. Таблиця планів у самій консолі Atlassian** — `admin.atlassian.com` → підписка Jira →
`Change plan` → `Compare features` (знімок курсу — `00-research/screens/30-sandbox-plan-2026-09-30.md`
§2). Рядки, які найчастіше потрібні: `Atlassian Intelligence (AI)` Free ✗ · **Standard ✗** ·
Premium ✓ · `Automation` — «100 rule runs per month» на Free · `Project archiving` ✗ ✗ ✓ ·
`User roles and permissions` ✗ ✓ ✓ · `Capacity management` ✗ ✗ ✓.

**1а. Та сама консоль розходиться з доксами ще у двох рядках** (звірено 2026-09-30, довідник-карта):
`User limit` Standard — докси «Up to 100,000 users», консоль «50,000 users»; `Automation` на Free —
докси «150 steps per subscription», консоль «100 rule runs per month». Друге — **не суперечність, а дві
одиниці**: чинна модель на екрані `Global automation → Usage` рахує запуски flows (100), кроки живуть
під перемикачем `Upcoming usage model`. Для Free перше нічого не змінює (там і там «до 10»), але це
готовий приклад для тези курсу «біля числа має стояти джерело».

**2. Докси про Rovo кажуть інше про Standard.** Обидві сторінки звірені наживо 2026-09-30:
`jira-software-cloud/docs/what-is-advanced-search-in-jira-cloud/` — «Rovo is available and
automatically enabled for all apps on Standard, Premium, and Enterprise plans.»;
`…/docs/use-atlassian-intelligence-to-search-for-work-items/` (заголовок «Use Rovo to search for
work items») — «AI is available and automatically activated for all apps on Standard, Premium, and
Enterprise plans.» Тобто **докси віддають AI плану Standard, консоль — ні.** Для Free розбіжність
нічого не змінює (екран Free кнопок не має), тож у курсі вона подана як названа розбіжність двох
джерел, без переможця (`jira-ref-jql.html`, розділ `#fix-error`).

**3. Добових меж листів дві, і це два механізми з двома сторінками** (обидві звірені наживо
2026-09-30, цитати дослівні):
- **сповіщення Jira** — `jira-cloud-administration/docs/what-is-the-free-jira-cloud-plan/`,
  розділ «Email notifications»: «Jira can send a maximum of 100 emails per day on the Free plan.
  After 100 emails, notifications are paused until the following day.»;
- **листи дій автоматизації** — `cloud-automation/docs/automation-service-limits/`: «100 emails in
  a 24-hour period. This limit only applies to the Free plan for Jira Cloud and Trial licenses.»

⚠ **Пастка:** рядок таблиці лімітів зветься **`Send email action`**, а дія `Send email` —
Deprecated, і в переліку дій конструктора на Free її немає (дія зветься `Send customized email`).
Тому «межа дії `Send email`» — напис, якого учень не побачить: у тексті пишуть «у листів, які
надсилає автоматизація, є своя окрема добова межа» або прямо кажуть, що так зветься рядок довідки.

**Why:** курс 012 будується лише на Free, а формула «X входить у платні плани» ≠ «на Free X немає»
уже двічі коштувала хвиль правок; дзеркальна помилка — вважати одну добову межу листів спільною для
сповіщень і автоматизації (жила в j14/j15 пʼять хвиль без джерела).

**How to apply:** межу або рядок плану цитуй разом із джерелом і датою; число ліміту — лише в
довіднику (уроки чисел не називають, крім 10 користувачів і 3 агентів). Коли докси й консоль
розходяться — назви розбіжність, не вибирай переможця. Пов'язане: [[reference-atlassian-docs-contradict]],
[[project-jira-course-authoring]], [[reference-jira-automation-smart-values]].
