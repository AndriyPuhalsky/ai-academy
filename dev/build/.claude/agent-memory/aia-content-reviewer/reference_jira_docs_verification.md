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
- **⚠ `docs-text.py` (текст `<main>`) ГУБИТЬ частину статті — і дає хибний «MISS» на живій
  цитаті.** Сторінки Atlassian носять тіло статті ще й у JSON-блобі всередині `<script>`, а
  `<main>` буває неповний: `what-are-smart-values.txt` вийшов 5,4 КБ і **не містив** ні
  `camelCase`, ні цитати «Field names aren't case sensitive», яка на живій сторінці є. Для звірки
  цитат корпус будувати **із сирого HTML, не вирізаючи `<script>`** (`re.sub(r'<[^>]+>', sep, raw)`
  у двох варіантах — теги→нічого й теги→пробіл), і нормалізувати `\\u003c`/`\\/`. Інакше рецензент
  «знаходить» непідтверджену цитату там, де все гаразд.
- **Сторінка `smart-values-in-jira-automation` — окреме джерело, якого немає в переліках слагів
  розділу.** Саме там живуть «Field names aren't case sensitive **and are translated using your
  flow actor's language setting**» (друга половина важлива для українського сайту),
  `More actions → Check for errors` і `Save and enable`. Якщо цитата про розумні значення не
  знайшлась на `what-are-smart-values`, шукати тут.
- **`jql-fields`: цитата про лапки** в сирому HTML — `Be sure to use quote-marks (")`, а після
  зняття тегів виглядає як `quote-marks ( " )`. Не «виправляти» правильну цитату за очищеним
  текстом: звіряти по сирому HTML, коли всередині цитати є `<tt>`/`<code>`.
- **⛔ `re.sub(r'<[^>]+>', sep, raw)` — НЕПРАВИЛЬНИЙ знімач тегів для доксів Atlassian
  (2026-09-27, рецензія довідника JQL).** У тексті сторінок живуть **літерні** `<` і `>`:
  «Supported operators = , != , > , >= , `<` , `<=` , ~ , !~ , IN, NOT IN», приклади `due < now()`,
  `updated <= "-4w 2d"`, `"Time to First Response" < remaining("2h")`. Регулярка бере від першого
  літерного `<` до наступного `>` і **зʼїдає півсписку операторів**. Наслідок — хибні MISS: я вже
  був за крок від того, щоб написати автору, що прикладу `updated <= "-4w 2d"` у довідці немає
  (він є), і що `~` для `workItemKey` вигаданий (документований, з трьома прикладами).
  Правильно: `re.sub(r'</?[a-zA-Z!][^<>]*?>', sep, raw)`, **і `html.unescape` ПІСЛЯ** зняття
  тегів, не до (інакше `&lt;`/`&gt;` самі стають фальшивими тегами й псують той самий текст).
  Той самий баг перевіряй у власних скриптах лічби заголовків і колонок.

- **🟢 Найнадійніший знімач тексту довідки — `articleBody` з JSON-LD, і він закриває всі три
  хибні MISS вище (2026-10-01, рецензія довідника-карти).** `curl -sL` → `<script
  type="application/ld+json">` → `json.loads` → рекурсивно дістати `articleBody`: це тіло статті
  одним рядком, без нав-меню, без CSS і без втрат. Так знайдено число, яке автор довідника списав
  як «джерела немає»: «You can customize notifications for **up to 50 spaces**» на
  `jira-software-cloud/docs/manage-your-jira-personal-settings/` — у тексті `<main>` його немає,
  в `articleBody` є. Це **третій** випадок, коли `<main>` дав хибний «факту немає». Робочий набір
  для звірки цитат: `articleBody` + сирий HTML у двох варіантах зняття тегів; порівняння
  регістрочутливе, з нормалізацією апострофів, лапок і тире.
- **Багатоколонкові таблиці планів розбирай `HTMLParser`-ом по `<tr>/<td>`, і тоді вони точні.**
  На `explore-jira-cloud-plans` так видно: рядок `Audit logs` — клітинка Free **порожня**;
  `Guaranteed Uptime SLA` — Free і Standard порожні, Premium `99.9%`; таблиця JSM пише «немає»
  **прочерком** `-`, таблиця Jira — порожньою клітинкою; а таблиця на `how-is-my-usage-calculated`
  зветься «Automation step per month» і має рядок `Jira` → «150 per subscription». Без розбору по
  клітинках жодне з цих тверджень не перевіряється.

Див. також [[lesson-fact-sources]], [[screens-line-count-offset]], [[quiz-frozen-007]],
[[kb-callout-vs-article-body]].
