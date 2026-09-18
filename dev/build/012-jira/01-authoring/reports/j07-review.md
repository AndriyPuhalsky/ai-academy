# Рецензія: `j07` «Пошук і JQL» — `modules/jira-07.html`

**Рецензент** `aia-content-reviewer`, 2026-09-18. Правлено рівно один файл — `modules/jira-07.html`.
Звіт автора — `reports/j07.md`. Git не виконувався.

---

## 1. Вердикт

**Готово з зауваженнями.** Урок фактично найміцніший з тих, що я бачив у цьому курсі: усі
15 цитат із доксів звірені мною посимвольно через `curl -sL` і збіглися, усі 8 JQL-запитів
синтаксично правильні за живими `jql-fields` / `jql-operators` / `jql-functions`, знахідка
про `project` проти `space` подана як матеріал, а не схована. Один факт я виправив (публічний
доступ на Free), одну тему картки дописав поясненням уже названого в підсумку поняття
(дужки й `NOT`), решта зауважень — у розділах 2 і 6.

---

## 2. Непідтверджені факти

### 2.1 Виправлено мною — знайдено джерело, яке суперечило тексту

**Було (блок 3, «Доступ: кому відкрити фільтр»):**
> «Публічний доступ — для людей без акаунта — окрема історія: адміністратор сайту вимикає
> його за замовчуванням, і для роботи команди він не потрібен.»

Це формулювання з картки програми, але воно неправильне саме для курсу про **Free**. Джерело:
`support.atlassian.com/jira-cloud-administration/docs/allow-dashboards-and-filters-in-your-site-to-be-shared-publicly/`
(прочитано `curl -sL` 2026-09-18):

> «Standard, Premium, and Enterprise Jira sites can share filters and dashboards publicly.
> **Free Jira sites can't be opened to the public.**»

Той самий рядок уже знайшов автор j08 (`cross-findings.md`, «Уточнення після хвилі 2» №6:
«не "вимкнено за замовчуванням", а "Free Jira sites can't be opened to the public"»), тобто
уточнення має пріоритет над карткою. **Стало:** абзац каже, що публічного доступу на
безкоштовному плані немає взагалі, з цитатою, і що `My organization` закриває всі щоденні
випадки.

### 2.2 Лишаю авторові / кореневій сесії (не правив)

1. **`Export` у вікні W1.** Заголовок вікна — «звірено 2026-09-17», а `Export` у ряду дій у
   `screens/15-search-jql.md` **немає**: там перелічено `Search all apps · Apps · Share · ⋯`
   і `Syntax help · Search · Clear filters · Save filter`. Кнопка існує — `manage-search-results`
   каже «Select **Export** at the top-right», а `export-search-results` веде її через
   `••• (More actions) → Export`, — але в датованому вікні стоїть напис, якого на знімку того
   дня не було. Автор це визнав (§5.4 свого звіту). **Рішення за власником/кореневою сесією:**
   або зняти `Export` з W1 до знімка, або дозняти верхній правий кут `All work`.
2. **Кирилична мітка `labels = "дозволи"`** (блок 3, `p3`). Те, що в мітці не буває пробілу,
   доведено (KB `how-to-create-and-use-labels-in-jira-cloud`, Cloud Only, оновлено 2026-04-10).
   Те, що Jira приймає кирилицю в мітці, — **не доведено нічим**: у доксах правил щодо алфавіту
   немає. Автор чесно назвав це єдиним місцем «на здоровому глузді» у своєму звіті, **але в
   самому уроці читачеві про це не сказано** — текст подає запит як робочий. Оскільки значення
   взяте в лапки, ризик малий; закривається одним записом у sandbox.
3. **«новий фільтр приватний»** (блок 3, після W3). Цитата поруч — «If the filter is private,
   only the owner and Jira admin can view and modify it» — пояснює, **що таке** приватний
   фільтр, а не те, що новий фільтр саме такий. Прямої цитати «нові фільтри приватні» у
   Cloud-доксах немає; непрямо це видно з `allow-dashboards-…-publicly`: «You can go one step
   further and **make all new filters and dashboards in your site public** by changing the
   default access level». Плюс знахідка автора j08: `Default access` (`Settings → System →
   Default user preferences`, значення `Public` / `Private`) вирішує доступ **нових** фільтрів,
   тобто константою це не є, а на Free адміном є кожен. Тексту не чіпав (твердження практично
   вірне й на ньому тримається квіз Q4), але **довіднику 3 варто взяти `Default access`**.
4. **Що робить `Fix error` на Free** — автор лишив як «не перевірялось», і це чесно: докси
   описують AI-підказку, а Rovo «available… on Standard, Premium, and Enterprise plans».
   Потрібен клік у sandbox.
5. **`WAS` у таблиці операторів** описаний як «колись мало таке значення». Докси точніші:
   «to find work items that **currently have or previously had** the specified value»; плюс
   (знахідка j10) `WAS` працює лише з кількома полями (Assignee, Fix Version, Priority,
   Reporter, Resolution, Status). Для уроку це дрібниця (приклад узятий саме зі `status`),
   для довідника 1 — обовʼязкова примітка.

### 2.3 Що я перевірив сам і що зійшлося (дослівно)

`curl -sL` по `support.atlassian.com`, 2026-09-18, теги зняті, читав `<main>`:

| Цитата в уроці | Сторінка | Стан |
| -- | -- | -- |
| «A simple query in JQL (also known as a 'clause') consists of a field, followed by an operator…» | `what-is-advanced-search-in-jira-cloud` | ✓ (див. §4 — я виправив лапки навколо `clause`) |
| «if the query cannot be created in the basic search form…» + перелік `OR` / `NOT` / `EMPTY` / `!=`, `IS`, `>`, `<` | те саме + `find-specific-work-items` | ✓ |
| «by identifying and correcting issues like missing fields, incorrect operators, or typos» / «Rovo is available and automatically enabled for all apps on Standard, Premium, and Enterprise plans» | `what-is-advanced-search-in-jira-cloud` | ✓ |
| банер «We're updating terminology in Jira… try using the old term instead. There are no changes to existing JQL queries.» | `jql-operators` (і `jql-keywords`, `find-specific-work-items`) | ✓ **дослівно, слово в слово** |
| «cannot be used with text fields; see the CONTAINS operator instead» | `jql-operators` | ✓ |
| «This requirement needs to be placed at the end of the JQL query, otherwise the JQL will be invalid» | `jql-keywords` | ✓ (звучить дивно, але це справді текст доксів) |
| «searches based on the currently logged-in user» + «can only be used by logged-in users» | `jql-functions` | ✓ |
| «by default, the first day is Sunday» / «this function considers Saturday to be the last day of the week» / `startOfWeek("+1d")` | `jql-functions` | ✓ |
| «Be sure to use quote-marks (")» + `w` / `d` / `h` | `jql-fields` | ✓ (там же: без лапок число читається як мілісекунди від 1970) |
| «you can use the statusCategory field (a work item is resolved when statusCategory = Done)» | `jql-fields`, примітка до `Resolution` | ✓ |
| три категорії + `StatusCategory in ("To Do","In Progress")` | KB `how-to-search-using-statuscategory…` | ✓ **Platform Notice: Cloud Only** |
| «Since labels cannot contain spaces, use hyphens or underscores…» | KB `how-to-create-and-use-labels-in-jira-cloud` | ✓ **Cloud Only** |
| «Define and run your search. Select Save as… select Submit» / «If the filter is private…» / «By default, when you create a filter, it'll be starred» | `what-is-a-saved-search` | ✓ |
| «Subscribing to a filter provides you with a periodic notification…» / «if the filter uses the currentUser() function, the search results will be evaluated with the recipient as the current user» / таблиця `Private` — `Users/Group/Space/Roles` — `My organization` | `manage-filters` | ✓ |
| «More actions (•••) … Bulk Change all <n> work items», пʼять дій, «This avoids notification overload for everyone working on the work items being edited» | `edit-multiple-issues-at-the-same-time` | ✓ (там же «You can only edit 1000 work items at once» — число в уроці свідомо не назване ✓) |
| «Any user can search for work items, although they will only see results from projects where they can view issues» | `search-and-find-your-issues` | ✓ |
| «Quick search scours for keywords… Summary, Description or any text field» + smart queries + «By default, smart queries will be turned off» + `Jira labs` | `find-recent-work-items` | ✓ |
| «Owner / Viewers / Editors» як колонки сторінки `Filters` (блок 5: «у колонці власника — твоє ім'я») | `manage-filters` | ✓ |
| `reporter = "Марта Лисенко"` (блок 6, приклад про лапки) | `jql-fields`: «reporter = "Jill Jones"», пошук за повним імʼям | ✓ синтаксично законно |

**Усі вісім `term`-запитів** звірені окремо (поле — оператор — значення — функція): `assignee`,
`statusCategory`, `summary ~`, `labels`, `due`, `now()`, `endOfWeek()`, `startOfMonth()`,
`reporter`, `project IN (…)`, `updated >= "-7d"`, `ORDER BY … ASC|DESC` — усе є в доксах із
потрібними операторами. **`project`, а не `space`** — правильно, не «виправляв» (живий екран
`screens/15` + банер Atlassian).

---

## 3. Теми картки `j07` — покриття

Пропущених тем **немає**; нижче — два місця, де покриття було тонким, і що з ними сталось.

- **«AND / OR / NOT, дужки»** — до правки `NOT` зʼявлявся в уроці **рівно один раз** (у блоці 6,
  у списку того, що не переводиться назад у Basic), а дужки як спосіб задати порядок — **тільки
  в підсумку** («дужки задають порядок»), тобто підсумок обіцяв те, чого в тілі не було.
  Дописав один абзац у блоці 3 з двома цитатами (`jql-keywords`: «used to negate individual
  clauses or a complex JQL query… using parentheses»; `what-is-advanced-search-in-jira-cloud`:
  «if you do not use parentheses, the statement will be evaluated left-to-right») і прикладом
  з доксів `not (reporter = jsmith or reporter = jbrown)`. Це не нова тема, а пояснення того,
  що урок уже стверджує.
- **Функції часу:** картка називає `endOfMonth()`, урок дає `now()`, `startOfDay()`,
  `startOfWeek()`, `endOfWeek()`, `startOfMonth()`. Тема «функції замість календаря» прозвучала,
  конкретна функція підмінена сусідньою — **не вважаю дефектом** (вичерпний перелік належить
  довіднику 1), але фіксую.
- **Вісім запитів картки** — усі вісім на місці; «мої на цьому тижні» зібраний із двох
  (`assignee` + `due`), як і пояснив автор.
- **`MARK-4`** у W1 справедливо замінений на `MARK-1` / `MARK-6` / `MARK-7` — картка програми
  тут неточна (j01 поставив `MARK-4` у `Done`), це вже зафіксовано в «Уточненнях після хвилі 2».
- Матриця вікон: `list` 2 + `form` 1 = **3** — збігається з програмою.

---

## 4. Що виправив сам

Дифф — 9 місць, `git diff modules/jira-07.html` (32 вставки / 9 видалень).

**Факти (з показаним джерелом):**
1. Публічний доступ на Free — див. §2.1.

**Формулювання й межі між уроками:**
2. «Одне правило про мітки варто знати заздалегідь, бо воно економить годину» → «Правило з
   уроку 4, від якого залежить цей запит». Причина: j04 уже вчить це правило тими самими
   словами й тим самим прикладом `друга-точка` («Мітка завжди одне слово: довідка каже, що
   пробілів у мітках не буває…»), а контракт §8 забороняє переказувати сусідній урок.
3. Цитата `(also known as a "clause")` → `'clause'` — у доксах одинарні лапки; цитата має бути
   дослівною.
4. «черги» → «черги заявок (вони будуть в уроці 18)». Для читача не з ІТ слово «черга» тут
   без референта: черги — це JSM, дім поняття — j18.
5. Місток у блоці 3 перед «Від запиту до фільтра»: один абзац про те, що граматика скінчилась
   і далі — що робити зі знайденим. Фактів не додає, лише орієнтує (див. §6 про довжину блоку).
6. Абзац про `AND` / `OR` / `NOT` / дужки — див. §3.

**Механіка квіза (дистрактори; правильну, `q`, `answer`, кількість не чіпав):**
7. Q2: два дистрактори отримали тире — до правки **єдиним варіантом із тире був правильний**
   (маркер стилю видавав відповідь без читання).
8. Q3: дистрактор «Незавершені роботи Оксани, бо…» → «…: фільтр завжди рахується для того,
   хто його створив» — до правки двокрапка стояла тільки в правильному варіанті, а три
   дистрактори ділили спільну конструкцію «…, бо …».
9. Q5: дистрактор про перенесення робіт отримав тире — та сама причина, що й у Q2.
   Твердження всіх трьох переписаних дистракторів лишились хибними.

**Чого не чіпав:** вікна (склад, мітки, легенди), жоден JQL-запит, `#completeTitle`
(«Модуль позаду?» за §2 п. 10), структуру блоків, Mermaid.

---

## 5. Механіка — десять пунктів

| # | Пункт | Стан |
| - | ----- | ---- |
| 1 | `data-config="../jira.config.json"` на `<html>` (+ `data-course="jira"`) | ✓ |
| 2 | `data-module="j07"` унікальний у базі кодів | ✓ (`grep` по всіх `modules/*.html`: єдиний файл; `m*`, `a*`, `c*`, `j01`–`j10` не перетинаються) |
| 3 | `<meta name="viewport">` без `user-scalable` / `maximum-scale` | ✓ |
| 4 | Вісім блоків у порядку + квіз, у кожного `id` і `data-lesson` | ✓ `l1…l8` + `quiz`, назви точно за контрактом |
| 5 | `.term--enter` / `.term--hero` / `.term--long` | ✓ нуль входжень |
| 6 | Рядки `term` — кожен у своєму `.term__line`, копіюється лише `.term__in`; вікна без `<img>/<svg>/<canvas>` | ✓ 8 блоків `term`, 8 `term__line`, 8 `term__in`, 8 кнопок «Копіювати»; у трьох вікнах 0 картинок |
| 7 | Mermaid ≥ 1, текст вузлів у лапках, без `<br/>` | ✓ 2 діаграми, усі вузли в лапках, `<br` — 0 |
| 8 | Квіз | ✓ 6 питань · JSON валідний (`json.tool`) · `answer` з нуля · `explain` у кожного · ситуаційні · **після правки** маркерів стилю немає в жодному питанні |
| 9 | Дата біля кожного вікна | ✓ W1 і W2 «звірено 2026-09-17», W3 «за документацією, 2026-09-18»; легенди 4/3/2 = міткам 4/3/2 |
| 10 | Регістр шляхів — нижній | ✓ |

**Вивід чекерів на фінальному файлі:**

```
$ python3 dev/build/012-jira/01-authoring/check-lessons.py --pattern 'modules/jira-07.html'
✓ jira-07.html  (65.2 KB)
Готово. З помилками: 0 із 1.          ← ✗ немає, ! немає

$ python3 dev/build/007-quiz-distractors/check-quiz.py --files modules/jira-07.html
питань 6 · найдовша 0/6 (0.0 %) · +нічиї 0/6 · найкоротша 0/6 (0.0 %)
answer 0/1/2/3 = 1/2/2/1 · довж. прав./хибн. 78.7 / 78.1
```

Додатково: апострофів, відмінних від U+0027, — 0; заборонених зворотів (`просто`, `очевидно`,
`як відомо`, `елементарно`, `всі знають`, `звісно`, `не забудь`) — 0 (два збіги на «робочі
**просто**ри» — підрядок, не зворот).

---

## 6. Чого не вдалося перевірити + що зняти в sandbox

**Не вдалося:** живого доступу до Jira в мене немає, тому все, що стосується поведінки кнопок,
перевірялось лише доксами й `screens/`.

Дозняти (перші три — критичні для цього уроку):
1. **Верхній правий кут `All work`** — чи стоїть `Export` поруч із `Share` (див. §2.2.1).
2. **Клік по `Fix error`** на помилковому запиті на Free — що показує.
3. **Робота з міткою кирилицею** + запит `labels = "дозволи"`.
4. Сторінка `Filters` з кількома фільтрами (колонки `Name · Owner · Viewers · Editors ·
   Popularity` — назви вже підтверджені `manage-filters`, потрібен кадр).
5. Діалог `Save filter` і панель `Details` — W3 зібране за доксами.
6. `Personal settings → Jira labs → Quick search smart queries` — розділу немає в `screens/17`.

**Читацьке зауваження, яке не закривається правкою (для власника):** блок 3 — **1 954 слова
й 11 підзаголовків**, тобто 42 % уроку (для порівняння: блок 6 — 594 слова, блок 2 — 497).
У бічній навігації це один пункт «3. Як це працює», під яким сховані і граматика, і фільтр,
і доступ, і підписка, і масова зміна: читач, який повернеться по «як поділитись фільтром»,
не має куди клацнути. Загальний обсяг уроку при цьому нормальний (4 627 слів проти 4 628 у
j06 — заявлені «≈ 24 хв» чесні). Місток я додав, але справжнє лікування — або девʼятий блок
«Фільтри» в контракті, або перенесення «доступ + підписка + масова зміна» у блок 4/6. Це
рішення власника, не рецензента.

---

## 7. Знахідки для сусідів (у `cross-findings.md` не писав)

- **j07 → j08, j20, довідник 3:** «**Free Jira sites can't be opened to the public**»
  (`jira-cloud-administration/docs/allow-dashboards-and-filters-in-your-site-to-be-shared-publicly/`,
  2026-09-18) — підтверджую знахідку автора j08 **другим читанням**; формулювання картки
  «вимкнено за замовчуванням» більше не вживати в жодному уроці. Там же дослівно: вимикач —
  `Settings → System → General configuration → Public sharing`, і «Turning Public sharing off…
  does not restrict any filters or dashboards that have already been shared».
- **j07 → j03 (розбіжність між уроками):** j03 пише, що в спейсі з неанглійськими статусами
  «запит `status = Done` не знаходить нічого», а j07 показує зі знімка, що Jira повертає
  **помилку** — «The value 'Done' does not exist for the field 'status'» — і кнопку `Fix error`.
  Це різні речі для читача («порожньо» він пробачить, «червона рамка» злякає). Один із двох
  уроків треба вирівняти; правий — j07 (екран).
- **j07 → j04, j05 (дубль):** правило «у мітці не буває пробілу» з прикладом `друга-точка`
  тепер стоїть у двох уроках. У j07 я перевів його в режим нагадування; якщо колись
  скорочуватимете j07 — це перший кандидат.
- **j07 → довідник 1:** `Default access` (`Settings → System → Default user preferences`,
  `Public` / `Private`) керує доступом **нових** фільтрів — «новий фільтр приватний» не
  константа · `WAS` = «currently have **or** previously had», і лише для кількох полів ·
  зарезервовані слова JQL (довгий список на `what-is-advanced-search-in-jira-cloud`) ·
  без лапок відносна дата читається як **мілісекунди від 1970** (`jql-fields`) ·
  `statusCategory` описаний лише в KB (Cloud Only), на `jql-fields` — ні.
- **j07 → кореневій сесії:** у вікні W1 стоїть `Export`, якого немає в `screens/15` (§2.2.1) —
  це єдине місце уроку, де датоване вікно розходиться зі знімком.
