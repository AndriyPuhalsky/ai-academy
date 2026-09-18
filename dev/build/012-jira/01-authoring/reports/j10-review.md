# Рецензія уроку `j10` «Workflow» — `modules/jira-10.html`

**Рецензент:** `aia-content-reviewer`, 2026-09-18. Правлено рівно один файл — `modules/jira-10.html`.
Джерела перевірки: живі докси Atlassian (`curl -sL` + зняття тегів, 2026-09-18), `00-research/screens/`
(`03`, `04`, `10`, `11`, `12`, `22`), `program.md` (картка `j10`, «Уточнення після хвилі 2» п. 8,
«Траєкторія», «Межі між сусідами»), `lesson-contract.md`, `cross-findings.md`, `reports/j10.md`,
`facts-free-plan.md` (№8, №14b).

---

## 1. Вердикт

**Готово з зауваженнями.** Урок фактично міцний: з 30+ цитат доксів я перевірив кожну по живій
сторінці — **усі дослівні й у своєму контексті**. Знайдено **одну справжню фактичну помилку**
(шаблон спейсу в кроці 1 дає два статуси, а урок далі перейменовує три) — виправлено з показаним
джерелом; одну помилку в лічбі власної діаграми — виправлено; вісім правок формулювань.
**Відкритими лишаються три ⚠ автора, які закриваються лише знімками з sandbox** (розкладка режиму
`Text`, редактор у бізнес-спейсі, дослівні назви правил у діалозі `Add Rule`) — вони чесно позначені
в тексті уроку й у звіті автора, тож поверненню автору урок не підлягає.

---

## 2. Непідтверджені факти

### 2.1 Виправлено мною (джерело знайдено, суперечило тексту)

**Ф-1. Крок 1 «Зроби сам» вів до шаблону з ДВОМА статусами, а крок 3 перейменовував ТРИ.**

Було: «У галереї обери **простий бізнес-шаблон для обліку задач** (шаблон для найму, якщо він є у
твоєму списку, теж підійде…)», далі крок 2: «Відкриється полотно з **трьома** статусами, які дав
шаблон», крок 3: перейменувати `To Do` → `New`, `In Progress` → `Screening`, `Done` → `Hired`.

Живі докси (перевірено 2026-09-18 `curl -sL`):
- `…/jira-software-cloud/docs/use-business-projects-for-task-management/` — «The task management
  template sets you up with the most basic workflow for creating and completing work. **There are two
  steps in the workflow: To Do and Done.**»
- `…/jira-software-cloud/docs/use-business-projects-for-project-management/` — «The project management
  template offers a simple workflow… **The workflow has three steps: To do, In Progress, and Done.**»

Те саме вже стоїть у `cross-findings.md` (рецензент j01 → j03, j09, **j10**) і в `reports/j03.md`
(§ «розбіжності», рядок 2). Учень, який виконав би крок 1 буквально, на кроці 3 не знайшов би
`In Progress` — і «перейменувати три + додати три» (рішення програми, «Уточнення після хвилі 2» п. 8)
не зійшлося б.

Стало: «У галереї ділових спейсів знайди шаблон для керування проєктом — той самий, з якого в уроці 9
народилась «Друга точка»: він дає три кроки роботи (`To Do`, `In Progress`, `Done`), і саме їх ми зараз
перепишемо». Формулювання дослівно узгоджене з `modules/jira-09.html` (крок 2: «знайди шаблон для
керування проєктом — той, що дає три кроки роботи: `To Do`, `In Progress`, `Done`»), назва шаблону не
названа (правило програми). Згадку про «шаблон для найму» прибрано: набір його статусів ніким не
перевірений.

**Ф-2. Лічба стрілок на власній діаграмі уроку.** Було «там стрілок вісім, а руками ти проклав дві».
У `stateDiagram-v2` блоку 3 — **сім** переходів між статусами (New→Screening, Screening→Interview,
Screening→Rejected, Interview→Offer, Interview→Rejected, Offer→Hired, Offer→Rejected) плюс три стрілки
до/від `[*]`, тобто 10 ліній на екрані. «Вісім» не збігається з жодною лічбою. Стало: «там **сім
стрілок між статусами**, а руками ти проклав дві» — і арифметика сходиться: три `Any`-переходи з вікна
W2 плюс два прокладені руками закривають рівно ці сім рухів.

**Ф-3. Цитата про колонки з кількома статусами була склеєна з двох речень.** Було:
«…unique names, the column and status/es become separate elements». У доксах
(`…/manage-columns-with-multiple-statuses-in-a-team-managed-project/`) це два речення:
«This changes however when you assign multiple statuses to a single column or give a column and its
assigned status unique names. **The column and status/es become separate elements, independent of each
other.**» Умову переказано українською, у лапках лишилось дослівне друге речення.

**Ф-4. `Resolution` у підсумку.** Було «поле `Resolution` **лишається порожнім**». У `screens/04`
(team-managed, 2026-09-17) у колонці `Resolution` стоїть `Unresolved` навіть у рядка зі статусом
категорії Done — тобто поле не порожнє. Підсумок вирівняно з тілом уроку: «не заповнюється — у списку
робіт там стоїть `Unresolved` навіть у завершеної роботи».

### 2.2 Перевірено й підтверджено (правок не потрібно)

Усі цитати нижче звірені посимвольно з живими сторінками 2026-09-18:

| Твердження уроку | Джерело (перевірено 2026-09-18) |
| --- | --- |
| «Two concepts define a workflow in team-managed spaces: Statuses… Transitions…» | `manage-how-work-flows-in-your-team-managed-project` ✓ дослівно |
| «Statuses help people understand the state of a piece of work…» | там само ✓ |
| «Rules automate repetitive actions when people move work between statuses» | там само ✓ |
| «Jira warns you about any work items… asks you to change their status to a valid one» + «prompted changes like these won't execute any rules» | там само ✓ (два сусідні речення) |
| «Changes you make to your workflow aren't applied until you save and exit the workflow editor» | там само ✓ |
| «every status and transition adds more complexity… keep your process lean» | `set-up-a-workflow-in-a-team-managed-software-project` ✓ |
| «New statuses will have a transition that allows work items in Any status to move to it…» | там само ✓ |
| «statuses as boxes and transitions as arrows» (переказ у блоці 3) | там само ✓ |
| «Only space admins (in team-managed spaces) can edit space workflows» | `transition-work-items-through-a-workflow` ✓ **дослівно, з дужками** |
| шлях для бізнес-спейсу «Navigate to Work types. Select Edit workflow at the top-right…» | там само ✓ |
| зміна статусу з картки — випадний список угорі праворуч | там само ✓ |
| «All statuses, even custom statuses… one of three status categories… (this can't be customized)» | `jira-cloud-administration/docs/what-is-a-workflow-status` ✓ |
| «Status categories impact how work items are visualized in lists, reports, and boards» | там само ✓ |
| «Reports are based on status names…» · «make sure to inform your team so they know what to expect» | там само ✓ |
| «A transition is a one-way link…» · «Global transitions allow any status in a workflow…» | `workflows-and-statuses-for-boards-in-business-projects` ✓ |
| «Deleting a status also deletes any transitions – and their rules! –…» · «Statuses can be shared between work types. If you change the name or category… in all your space's workflows» · «This status is shared across multiple workflows» + `Change status for these work items only` · «By default, new statuses aren't assigned to a column…» · `Ctrl + Z` / `Cmd + Z` | `create-edit-and-delete-statuses-in-team-managed-projects` ✓ (усі п'ять) |
| крок 4 «обери категорію → введи назву → `Add`» | там само ✓ дослівно: «select a status category… Give your status a name. Select Add» |
| «Take care when creating transitions that don't start from Any status…» і «If you limit how people can move work items across the board – for example, by **removing** Any status transitions, your team may encounter errors…» | `create-edit-and-delete-transitions-in-team-managed-projects` ✓ — **обидві цитати дослівні, з різних місць сторінки** (варіант «by editing an Any status transition» — це третє, окреме речення; урок узяв те, що відповідає його кроку) |
| `From status` / `To status` / назва / `Create`; `Delete transition` унизу панелі деталей | там само ✓ |
| три типи правил «Restrict transition… before / Validate details… when / Perform actions… after» | `what-are-the-different-workflow-rule-types` ✓ |
| назви п'яти правил (`Assign a work item to someone`, `Update a work item field`, `Restrict who can move a work item`, `Restrict to when a work item has been through a status`, `Validate that people have a specific permission`), поля `For transition`, `Assign to` | `available-workflow-rules-in-team-managed-projects` ✓ |
| крок 6 «`Add Rule` → правило → `For transition` → … → `Add`» | `add-or-remove-workflow-rules-in-team-managed-projects` ✓ (докси: «From the workflow toolbar, select **Rules**… select **Add**») |
| «it's possible to create a workflow that applies to a single work type or a combination of work types», «deselect lozenges» | `create-and-edit-workflows-in-team-managed-projects` ✓ |
| «When using a Team Managed project, you don't have the option to manually set or view the Resolution field…» | `jira/kb/set-resolution-field-for-team-managed-project-jira-issues` ✓ **і це Cloud**: «Platform Notice: Cloud Only – This article only applies to Atlassian apps on the cloud platform» (пастка KB = Data Center тут не спрацювала) |
| «a work item is resolved when statusCategory = Done» | `jql-fields` ✓ (див. ⚠ 2.3 про контекст) |
| «Most often this will involve the JQL referring to a resource … by name…» | `atlassian-cloud/kb/saved-filters-best-practice-…` ✓ |
| «Columns on the board are controlled by your space's workflow…» · `Configure columns` · панель прихованих статусів | `add-rename-or-delete-a-column-in-team-managed-business-projects` ✓ |
| «In text mode, you can see workflow statuses and their related transitions…» | `jira-cloud-administration/docs/what-is-the-new-workflow-editor` ✓ |
| тулбар `Add status` · `Add Transition` · `Add Rule`, `Update workflow` (неактивна без змін), `Close`, перемикач `Diagram`/`Text`, `Show transition labels`, карта схеми й масштаб, бульбашки `Any` | `screens/12` ✓ дослівно |
| W1: рейка Space settings, `Edit workflow`, `Description fields`, `Context fields`, `Hide when empty: Reporter`, `Discard`/`Save changes` | `screens/10` + `screens/11` ✓ |
| `Resolution` = `Unresolved` у завершеної роботи | `screens/04` ✓ |
| «на сайті, який від початку живе на безкоштовному плані, адміністратори — усі» | `facts-free-plan.md` №8 ✓ |
| `Add agent` / `Ask AI` / `Improve` — апсел | `facts-free-plan.md` №14b + `screens/12` ✓ |

### 2.3 Лишаються ⚠ — не виправляв, потрібен sandbox або рішення власника

1. **⚠ Розкладка вікна W2 («режим `Text`»)** — знімка немає, докси описують режим одним реченням.
   Автор чесно позначив заголовок «за документацією, 2026-09-18» і сказав у підписі, що назви колонок
   умовні. Лишається як є; закривається знімком.
2. **⚠ Редактор workflow у бізнес-спейсі очима ніхто не бачив** — `screens/11` і `12` зняті в
   software-спейсі `KAN`. Шлях для бізнес-спейсу підтверджений доксами дослівно, застереження стоїть у
   підписі під W1. Лишається як є.
3. **⚠ Підрейка типів роботи в W1** (`Task · Subtask · Epic` як `win__tabs`) — у `screens/10`/`11`
   другої бічної колонки немає; назви типів узяті з шапки редактора (`screens/12`: «Workflow for
   [Subtask · Task · Epic]»). Вікно при цьому позначене «звірено 2026-09-17». Ризик низький (написи
   справжні), але сама наявність підрейки на цій сторінці — не підтверджена. **У звіт, не в правку.**
4. **⚠ Бульбашка `Any` над статусами з шаблону** (крок 5: «Її мають і статуси з шаблону, і щойно
   створені») — `screens/12` показує це в software-спейсі; докси гарантують `Any` лише для **щойно
   створених** статусів. Крок написаний так, що працює й без бульбашки. Автор це вже позначив (⚠ №4).
5. **Контекст цитати `statusCategory = Done`.** На `jql-fields` це речення стоїть у розділі про
   **service** team-managed спейси («The resolution field doesn't exist in service team-managed
   spaces… Instead, you can use the statusCategory field (a work item is resolved when statusCategory =
   Done)»). Саме твердження загальне, а для бізнес-спейсів його підпирає KB про `Resolution`
   (Cloud Only) — тому в уроці лишаю. Знати про звуження варто довіднику 1.
6. **Обіцянка довідникові.** Урок посилає по повний перелік правил переходу в довідник
   «Автоматизація: тригери, дії, smart values». Довідник ще не написаний — **це зобов'язання**, і в
   ньому треба звести **обидва** списки правил (`available-workflow-rules-…` — 7 назв,
   `add-or-remove-workflow-rules-…` — 5, і в другому є `Remind people to update empty fields`, якого в
   першому немає).

---

## 3. Пропущені теми картки `j10`

**Пропущених тем немає.** Пройшов по полю «Теми» картки рядок за рядком: статус ✓ · три категорії й
колір ✓ · «чому Done — категорія, а не назва» ✓ (блок 6) · перехід `Any` і конкретний ✓ · редактор
team-managed: шлях, `Diagram`/`Text`, `Add status` / `Add Transition` / `Add Rule`, `Update workflow` ✓ ·
`Add agent` як апсел ✓ (ЧаПи) · правила переходу ✓ · «колонка ≠ статус» ✓ (блок 3 таблиця + ЧаПи) ·
`resolution` ✓ (блок 6, з уточненням п. 8 програми) · сюжет `HR` ✓ · «Як перевірити» обидві ознаки
картки ✓ · усі чотири граблі картки прозвучали ✓.

Три дрібні відхилення від картки — **не пропуски, а рішення автора**, фіксую для протоколу:
1. **Мітки W3 інші, ніж у картці.** Картка просила ① дві колонки категорії Done, ② «WIP немає — це
   business». В уроці ① колонка `Offer`, ② картка не змінює назви, ③ `Rejected` — теж Done. Тема Done у
   двох колонках збережена (мітка ③); WIP — дім `j13`, у `j10` його немає взагалі. Прийнятно.
2. **«Workflow підзадач окремий і забутий»** живе не в блоці 6, а в блоці 3 (кінець), кроці 7 і
   квізі (питання 5). Прозвучало ✓.
3. **Квіз «статус vs категорія vs колонка»** — питання 1 покриває статус/категорію; колонка окремим
   питанням не перевіряється (вона розібрана в блоці 3 і ЧаПи). Квіз не заморожений, але переписувати
   питання без потреби не став: розподіл і довжини чисті.

---

## 4. Що виправив сам

**Фактичне (з джерелом, §2.1):** шаблон спейсу в кроці 1 · «стрілок вісім» → «сім стрілок між
статусами» · склеєна цитата про колонки · `Resolution` «порожнє» → `Unresolved` у підсумку.

**Слова, яких читач не з ІТ не знає:**
- «Саме **полотно** має два режими» → «Головна частина екрана — поле, на якому намальовано процес»
  (слово «полотно» в курсі ніде не вводиться); там само «Відкриється **полотно**…» → «Відкриється
  **схема**…» (крок 2).
- «знизу праворуч є **мінімапа** й масштаб» → «невелика карта всієї схеми й повзунок масштабу»
  (`screens/12`: мінімапа «Workflow viewfinder», повзунок «Zoom level»).
- «**прапорець** `Show transition labels`» → «**галочка**» — решта уроків курсу (`j16`, `j05`) кажуть
  «галочки», «прапорець» був лише тут.
- «**довіднику 2**» і «**довіднику 3**» → назви довідників («Автоматизація: тригери, дії, smart
  values», «Карта інтерфейсу, глосарій і ліміти Free»). Номерів довідників читач ніде не бачить —
  конвенція решти дев'яти уроків саме така (`j01`–`j08` посилаються назвою).

**Дірки в інструкції:**
- Крок 5 мовчав про статуси `New` і `Hired` (сказано, де `Any` лишити, і де прибрати, — два з шести
  статусів лишились без вказівки). Додано: «На решті статусів нічого не чіпай: обмеження нам потрібне
  рівно в одному місці — перед пропозицією».
- Блок 5, перша ознака: «Дошка показує статус картки тією колонкою, у якій картка лежить» — кругове
  визначення. Стало: «Картка лежить у колонці того статусу, у якому вона зараз».
- Блок 3: «ліміти… але **команда до десяти людей** у них не впирається» — ліміт статусів не залежить
  від розміру команди. Стало: «але процес на кілька кроків у них не впирається».

**Заборонених зворотів у файлі немає** (пошук по `просто · очевидно · як відомо · елементарно ·
всі знають · звісно · не забудь, що` — 0 збігів; єдине попадання «не лишає **простору** для варіантів»
— інше слово). Англіцизмів без введення (`дефолт`, `докси`, `фіча`, `пікер`, `апсел`, `юзер`) — 0.

Разом: **10 правок**, `git diff` = 29 вставок / 23 видалення, усе в межах `modules/jira-10.html`.

---

## 5. Механіка — з виводом

```
$ python3 dev/build/012-jira/01-authoring/check-lessons.py --pattern 'modules/jira-10.html'
✓ jira-10.html  (57.6 KB)
Готово. З помилками: 0 із 1.

$ python3 dev/build/007-quiz-distractors/check-quiz.py --files modules/jira-10.html
питань 6 · найдовша 0/6 (0.0 %) · +нічиї 0/6 · найкоротша 0/6 (0.0 %) · answer 1/2/2/1 · довж. прав./хибн. 93.5 / 88.2
```

| # | Пункт | Стан |
| - | ----- | ---- |
| 1 | `data-config="../jira.config.json"` на `<html>` | ✓ (плюс `data-course="jira"`) |
| 2 | `data-module="j10"` на `<body>`, глобально унікальний | ✓ — `grep` по всіх `modules/*.html`: дублів `data-module` немає взагалі, `j10` лише тут |
| 3 | `<meta viewport>` без `user-scalable` / `maximum-scale` | ✓ |
| 4 | Вісім блоків + квіз, у кожного `id` і `data-lesson` | ✓ `l1`…`l8` + `quiz`, порядок контрактний, 9 секцій |
| 5 | `.term--enter` / `.term--hero` (і `--long`) | ✓ відсутні; блоків `.term` у файлі немає взагалі (JQL — дім `j07`) |
| 6 | Вікна замість термінала: 3 вікна (`settings`, `list`, `board`) = «Матриця вікон» | ✓ у кожного `id`, датований `win__title`, `win__body[role=group][aria-labelledby]`, мітки з `aria-hidden`, легенда одразу за `</figure>`, 3 мітки = 3 пункти в кожному; `<img>/<svg>/<canvas>` — 0 |
| 7 | Mermaid ≥ 1 | ✓ 2: `stateDiagram-v2` (перша в проєкті) + `flowchart LR`. Синтаксис перечитав очима: у `flowchart` текст вузлів у лапках ✓; у `stateDiagram-v2` лапки на переходах не є синтаксисом — імена станів односкладові ASCII (`New`, `Screening`…), `note right of X : …` і `[*]` записані канонічно, `<br/>` немає. **Рендер наживо не перевірявся** (браузера в агента немає) |
| 8 | Квіз | ✓ 6 питань · JSON валідний (`json.loads`) · `answer` = `[2,0,1,1,2,3]`, максимум 2 з 6 на індекс (33 % ≤ 40 %) · `explain` у всіх шести й без «перший/третій варіант» · питання ситуаційні (Ліна, Тарас, Ігор, Оксана), не «скільки» · найдовша 0/6, найкоротша 0/6, нічиїх 0 |
| 9 | Дата біля кожного екрана | ✓ три заголовки: «звірено 2026-09-17» ×2, «за документацією, 2026-09-18» ×1 |
| 10 | Регістр шляхів — нижній | ✓ усі локальні `href`/`src` малими (`../css/…`, `../js/…`, `../jira.html`); верхній регістр лише в CDN-адресі шрифтів, як у базі |
| + | Апостроф U+0027 | ✓ 36 входжень; U+02BC і U+2019 — 0 |
| + | Баланс тегів | ✓ `html.parser`: незакритих 0, зайвих закриттів 0 |
| + | `#completeTitle` | не чіпав (лишився «Урок позаду?», як у решти дев'яти уроків) |

---

## 6. Чого не вдалося перевірити — і що зняти в sandbox

Не перевірив (немає інструмента): живий рендер обох діаграм у браузері; вигляд сторінки при
відсутньому CSS компонента «вікно» (дизайн ще не малював); поведінку `js/quiz.js` на цьому файлі.

**Заявка на знімки (додає до списку автора, не дублює):**
1. **Режим `Text` редактора workflow** — закриває ⚠ №1 і переводить W2 зі «за документацією» у
   «звірено».
2. **Діалог `Add Rule`** — дослівні написи правил у UI (в уроці стоять назви з доксів).
3. **Панель деталей статусу** (назва, `Category`, `Delete status`) — кроки 3 і 5 спираються на неї.
4. **Сторінка `Space settings → Work types` у бізнес-спейсі** — чи є там друга бічна колонка з типами
   роботи (W1, ⚠ 2.3 п. 3) і чи той самий набір `Description fields` / `Context fields`.
5. **Чи висить бульбашка `Any` над статусами з шаблону в бізнес-спейсі** (⚠ 2.3 п. 4).
6. **Чи з'являється новий статус колонкою на дошці бізнес-спейсу автоматично** — від цього залежить,
   чи потрібне застереження в блоці 5 (зараз воно сформульоване обережно й не шкодить).

---

## 7. Знахідки для сусідів (файл `cross-findings.md` не редагував)

- **j10 → j03, j09, j12:** підтверджено вдруге по живих доксах (2026-09-18): шаблон обліку задач —
  **два** статуси («There are two steps in the workflow: To Do and Done»,
  `use-business-projects-for-task-management`), шаблон керування проєктом — **три** («The workflow has
  three steps: To do, In Progress, and Done», `use-business-projects-for-project-management`). Будь-який
  крок «Зроби сам», який далі перейменовує три статуси, мусить вести до **другого** шаблону. У `j10`
  це вже виправлено; варто перевірити решту уроків, де спейс створюється з шаблону.
- **j10 → довідник «Автоматизація: тригери, дії, smart values»:** урок **обіцяє** там повний перелік
  правил переходу — довідник має звести обидві сторінки доксів (7 назв на
  `available-workflow-rules-in-team-managed-projects`, 5 на `add-or-remove-workflow-rules-…`, причому
  `Remind people to update empty fields` є лише на другій).
- **j10 → довідник «JQL: поля, оператори, функції»:** речення «a work item is resolved when
  statusCategory = Done» у доксах стоїть у розділі про **service** team-managed спейси — подавати його
  з цим контекстом, а для business/software спиратись на KB `set-resolution-field-for-team-managed-…`
  (Cloud Only).
- **j10 → усі автори:** у доксах на одній сторінці трапляються **два різні формулювання того самого
  застереження** (`create-edit-and-delete-transitions-…`: «by editing an Any status transition to a
  more restrictive transition» і нижче «by removing Any status transitions»). Перш ніж вважати цитату
  колеги неточною — шукати по всій сторінці, а не по першому збігу.
- **j10 → усі автори (термінологія курсу):** довідники в уроках називають **назвою**, а не номером;
  «довідник 2/3» читач ніде не бачить. У `j09` рядок 119 лишився з «довіднику 3» — варто вирівняти
  при нагоді (не мій файл).
- **j10 → j11:** підсумок `j10` уже сказав, що `Resolution` у team-managed не заповнюється — в уроці
  про поля його не обіцяти; правило `Update a work item field` і таблиця сумісності типів для
  `Copy the value of one field to another` — готовий матеріал (`available-workflow-rules-…`).
- **j10 → дизайн (повторно, підтверджую знахідку автора):** `js/mermaid-theme.js` задає
  `useMaxWidth: false` лише для `flowchart` і `sequence`; `stateDiagram-v2` з цього уроку
  стискатиметься замість прокрутки. Потрібен `state: { useMaxWidth: false }`. Те саме зачепить `j19`.
- **j10 → дизайн:** стан `list` **без рейки** (редактор workflow на весь екран) і `win__actions` у
  стані `settings` — обидва вжиті в цьому уроці; підрейка типів роботи зроблена через `span.win__tabs`
  усередині `win__page` (кандидат на `win__subrail`). `win__topbar` — знову 0 вживань.
