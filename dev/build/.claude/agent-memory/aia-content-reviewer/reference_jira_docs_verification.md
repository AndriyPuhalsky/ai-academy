---
name: jira-docs-verification
description: Як перевіряти факти курсу «Jira з нуля» (012) — curl по support.atlassian.com замість WebFetch, сторінки-хаби, таблиця мов, ключ роботи не вічний
metadata:
  type: reference
---

Курс 012 «Jira з нуля» перевіряється **не так**, як «AI Термінал»: команд запускати нема де,
продукт — GUI, тож джерела рівно три (контракт §7): живі докси Atlassian ·
`00-research/screens/*.md` (**.md**, не `.txt`) · живий sandbox через кореневу сесію.

**Метод, який працює (перевірено на 15+ сторінках 2026-09-17):**
`curl -sL -A "Mozilla/5.0" <url>` + зняття тегів python-ом. Віддає тіло статті цілком і дозволяє
шукати **дослівну** цитату; WebFetch переказує й губить рядки, а багатоколонкові таблиці планів
читає неправильно (вигадує рядки). Індексні адреси `…/<product>/docs/` дають 404 — вхід через
`…/<product>/resources/` або WebSearch з `allowed_domains: ["support.atlassian.com"]`.

**Пастка, що коштує хибного «факту немає»:** частина сторінок довідки перетворилась на **хаби**
(лише список дочірніх статей). Приклад: `jira-service-management-cloud/docs/receive-requests-from-an-online-portal/`
— сьогодні хаб «Set up your help centers and portals»; цитати про портал живуть у
`…/docs/how-do-customers-send-requests-to-your-service-project/`. Порожній grep ≠ спростування:
спершу переконайся, що перед тобою стаття.

**Три факти, які вже коштували правок і варті повторного вжитку:**
- **Ключ роботи не вічний:** `jira-software-cloud/docs/edit-a-projects-details/` («Change a space's
  key») — адмін міняє ключ спейсу, і `EXAMPLE-1` стає `DEMO-1`; старі посилання живуть через аліас.
  Формулювання «ключ не змінюється ніколи» — дефект.
- **Статуси приходять із шаблону, і вони різні:** шаблон керування проєктом — «three steps: To do,
  In Progress, and Done»; шаблон обліку задач — «two steps: To Do and Done». Твердження «шаблон дає
  саме ці три» без назви шаблону — непідтверджене.
- **Таблиця мов** `atlassian-account/docs/manage-your-language-preferences/`: Ukrainian ❌ для Jira,
  JSM, JPD, Confluence, Team Calendars; ✅ для Compass, Home, **Help center and Customer Portal**.

- **Докси автоматизації суперечать самі собі — перевіряй усі сторінки розділу, перш ніж
  назвати перелік автора хибним.** У `cloud-automation/docs/` (2026-09-18) живуть три пари:
  `Issue fields condition` (`jira-automation-conditions`) проти `Work item fields condition
  (Jira only)` (`best-practices-…`); **`Flow details` = шість полів** із `Scope` і `Actor`
  (`create-and-edit-jira-automation-rules`) проти поділу details / settings без них
  (`what-are-rule-details-in-atlassian-automation`); результати запуску `Successful` /
  `No action` / `Some errors` (`view-performance-insights-…`) проти `SUCCESS` /
  `NO_ACTIONS_PERFORMED` / `SOME_ERRORS` (`how-is-my-usage-calculated`). Я був за крок від
  того, щоб позначити перелік у j14 як дефект, — його дослівно підтвердила **друга** сторінка.
  Індекс живих слагів: `curl -sL https://support.atlassian.com/cloud-automation/resources/ |
  grep -o 'href="/cloud-automation/docs/[a-z0-9-]*/"'` → 136 адрес; індексні `…/docs/` — 404.
- **`jql-fields`: цитата про лапки** в сирому HTML — `Be sure to use quote-marks (")`, а після
  зняття тегів виглядає як `quote-marks ( " )`. Не «виправляти» правильну цитату за очищеним
  текстом: звіряти по сирому HTML, коли всередині цитати є `<tt>`/`<code>`.

Див. також [[lesson-fact-sources]], [[screens-line-count-offset]], [[quiz-frozen-007]].
