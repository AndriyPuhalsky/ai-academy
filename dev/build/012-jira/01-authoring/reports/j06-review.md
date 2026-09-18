# Рецензія уроку `j06` «Вигляди»

**Рецензент:** `aia-content-reviewer`, 2026-09-18. Файл: `/Users/ander1.sage/Downloads/AIA/modules/jira-06.html`
(61,0 KB після правок). Звіт автора: `01-authoring/reports/j06.md`.
Джерела перевірки: живі докси `support.atlassian.com` (`curl -sL` + зняття тегів, 2026-09-18),
`00-research/screens/03, 04, 05, 08, 09, 22, 23`, `facts-free-plan.md`, `program.md` (картка j06 +
«Уточнення після хвилі 2»), `cross-findings.md` («Від авторів хвилі 2»).

---

## 1. Вердикт

**Готово з зауваженнями.** Урок читається лінійно, жодного забороненого звороту, механіка чиста,
факти в переважній більшості простежуються до живих доксів дослівно. Виправлено 1 спотворену цитату,
3 місця, де business-спейсу приписувалась цитата зі сторінки для software/company-managed, 2 деталі
без джерела та маркер-підказку в квізі. Лишаються 2 теми картки, яких в уроці немає (дописати має
автор — потрібні джерела), і 4 твердження, що тримаються на висновку, а не на цитаті.

---

## 2. Непідтверджені факти

### 2.1 Виправлено мною (джерело знайдено, показано)

| # | Було | Стало | Джерело (перевірено 2026-09-18) |
| - | ---- | ----- | ------------------------------- |
| A | «…included with **Jira Cloud** Premium and Enterprise» | «…included with **Jira** Premium and Enterprise» | `jira-software-cloud/docs/what-is-the-roadmap/`: «Planning across multiple spaces is only possible in your plan, which is included with Jira Premium and Enterprise» — слова `Cloud` у реченні немає, а цитата подана в лапках як дослівна |
| B | Блок 2, «Group і Filter — налаштування твого вигляду»: цитата «view settings are applied per user — any changes you make will apply to your board and backlog, and not anyone else's» | цитата «All users are in control of how they want to view their work so how you group your board is visible to you only» | стара цитата — з `jira-software-cloud/docs/customize-your-view-of-the-board-and-backlog/`, яка прямо каже «view settings **in software spaces**…», тобто software-сторінка; нова — з `jira-software-cloud/docs/organize-your-board/` («Anyone with access to the **business** project can group work items on the board»), тобто саме про дошку business-спейсу, як у сюжеті |
| C | Блок 3, «Рівень людини»: та сама software-цитата | фраза без цитати, з посиланням на блок 2 (дублювати цитату двічі не потрібно) | те саме джерело, що й B |
| D | Блок 6: «If you don't see a timeline in your space, your administrator needs to enable it» | «your admin may have removed the timeline view from your space» | стара цитата — `…/enable-and-disable-the-timeline/` із банером «**This page is for software spaces**»; нова — з business-сторінки `…/what-is-the-timeline-and-how-do-i-use-it/` («This page is for business spaces»), де сказано те саме про спейс учня |
| E | Крок 4: `Group` → `Clear` **(або `Clear selection`)** | `Group` → `Clear` | `organize-your-board`: «Select the Group by drop-down… **Select Clear**». Напису `Clear selection` у доксах немає — прибрано як вигаданий |
| F | Блок 6: картки без значення «поїхали **в останню смугу, у самий низ екрана**» | «поїхали в окрему смугу — її легко пропустити очима» | позиція смуги не звірена; `configure-swimlanes` для неприсвоєних каже «appearing **either above or below** the swimlanes», тобто «в самий низ» — не факт |

Квізу правка D торкнулась в одному місці: `explain` шостого питання «…адміністратор має його ввімкнути»
→ «…вигляд міг прибрати зі спейсу адміністратор» (щоб пояснення не суперечило новій цитаті).
`q`, `answer`, правильний варіант і кількість питань не чіпались.

### 2.2 Лишається під ⚠ — фікс не мій, потрібне рішення автора/кореневої сесії

1. **«Спейси "Кориці" — business, тож беклогу й спринтів у їхньому рядку виглядів немає»** (блок 2,
   «Причина перша — тип спейсу») — сформульовано як факт, а прямої цитати немає. Доведене:
   «software spaces come with features like a board and backlog» (`how-do-features-differ-based-on-project-type`)
   і «Enable the backlog for your **team-managed software** space» (`enable-the-backlog`). Негативного
   твердження про business-спейси в Cloud-доксах я теж не знайшов (автор фіксує це у своєму §5 п. 2).
   **Закривається одним поглядом** на меню «+» у business-спейсі sandbox.
2. **Склад рядка виглядів business-спейсу** (W1, W2, підписи) — головна відома дірка уроку;
   `screens/03` знято в software-спейсі. Автор захистився: крок 3 написаний як «якщо немає — додай»,
   а я додав у підпис W1, що рядок намальовано **після** кроку 3. Знімок `screens/21` знімає ⚠.
3. **Назва смуги для робіт без значення** — у вікні стоїть `Unassigned` (слово є в `screens/04` як
   значення колонки `Assignee`, але не як назва доріжки). Програма називала цю групу `None`;
   в уроці назви немає ніде, крім самого вікна. Звіряється дошкою з увімкненим `Group`.
4. **«`Development` — зв'язок із кодом…; для маркетингу, бухгалтерії чи ремонту він порожній за
   визначенням»** (ЧаПи) — висновок, не цитата. Не виправляв: сформульовано як міркування, а не як
   цитата довідки.
5. **Розбіжність доксів, яку урок мовчки знімає на користь однієї сторінки:** перелік полів для
   `Group` на дошці. `organize-your-board` (business): Status · Priority · Assignee · Category;
   `monitor-your-work-with-the-board` (business, «Work with boards in business spaces») для доріжок:
   Priority · Category · Assignee · **Agent** (без Status, бо за статусом — колонки). В уроці стоїть
   перший перелік у реченні саме про доріжки. Автор розбіжність задекларував (§6 п. 2) — лишаю як є,
   але це місце, яке при звірці в sandbox може змінитись.
6. **Означення доріжки** «A swimlane is a horizontal categorization of work items» — узяте з
   `configure-swimlanes`, а та сторінка має банер «**This page is for company-managed spaces**».
   Саме означення платформо-незалежне (і business-сторінка `monitor-your-work…` вживає слово
   swimlanes), тому не чіпав, але для протоколу: провенанс цитати — company-managed.
7. **Числа `7, 14, 30, 60` днів у блоці 1.** Вони є в живих доксах (business-сторінка
   `workflows-and-statuses-for-boards-in-business-projects` і `monitor-your-work-with-the-board`),
   тобто не вигадані. Але «Уточнення до карток після хвилі 2», п. 10 записує «Done ховається
   7/14/30/60/never» у **довідник 3** зі словами «**в уроках їх немає**». Формально це не число
   ліміту плану (§0.1 п. 3 стосується лімітів), а значення налаштування, тож рішення за власником:
   лишити чи звести до «через тиждень або місяць», як уже зроблено в блоці 6. **Сам не чіпав.**

### 2.3 Перевірено й підтверджено дослівно (щоб не перевіряли вдруге)

Усі 30+ англійських цитат уроку прогнані по завантажених сторінках. Збіглися **всі**, включно з
ключовою цитатою завдання:

- «Work items will still appear in the list, timeline, and calendar views, even if they've been hidden
  from the board» — `jira-software-cloud/docs/workflows-and-statuses-for-boards-in-business-projects/`,
  банер сторінки: **«This page is for business spaces»** ✅ (питання завдання закрите: цитата
  стоїть саме на business-сторінці);
- «A space groups work items together and provides views like boards, backlogs, and timelines…» ·
  «Software spaces: Designed for development teams… Business spaces: Designed for non-technical teams
  (HR, marketing, finance, etc.)» (еліпсис склеює два пункти списку — обидві половини дослівні) —
  `what-is-a-jira-software-project`;
- «Jira's list sorts all your space's work into a single list…» · «The columns you choose to display
  in your list is only visible to you» · «you'll always see the type, key, and summary fields» ·
  «If you add, remove, or rearrange the columns… aren't saved if you refresh…» · «open the JQL tab
  for the List view» — сторінки списку;
- «Each space has a calendar…» · «scheduled using the Start date and Due date fields» · «Work items
  without due dates aren't visible on the calendar…» · «Schedule a work item by dragging it onto the
  calendar to the date that it's due» — сторінки календаря (business/software банера не мають);
- «The schedule bars on the timeline represent the start date and due date of each work item in your
  space» · роллап «The parent start date… latest due date of its child items» — business-сторінка таймлайна;
- «The summary view helps you monitor the progress of your space…» · «Only items that have been
  completed in the last two weeks will appear in Done» — `what-is-the-summary-view`;
- «Hover over Spaces in the side navigation, then select Create space» · `Use template` · «Jira will
  generate a space key when you create the space» — `create-a-new-project`. **Крок 1 підтверджений
  повністю**, включно з вибором типу: докси дають рівно цю послідовність — «Give your space a name.
  Select either Company-managed or **Team-managed**. … Select Create»;
- «If the board view doesn't appear, your admin may have removed it from the navigation of the business
  space» · «you can create up to 10 different board views in a space» (число в урок не пішло ✅) ·
  «Saving the view settings… will be visible for everyone in the space» · `Save or reset view settings` ·
  «Moving an item up or down will change its rank across all views (not just on the board)» —
  business-сторінки дошки;
- «all work items are moved to your board and placed in the appropriate column based on their current
  status» — `enable-the-backlog`; «Only space admins can enable and disable features in a space» і
  «The list is enabled by default in all spaces» — `how-do-i-view-my-list`;
- «You can create multiple dashboards from different spaces» — `what-is-a-jira-dashboard`;
- **таблиця планів** (`curl` + розбір `<td>`, не WebFetch): рядок `Roadmaps` → **Free `Basic`**,
  Standard `Basic`, Premium/Enterprise `Advanced` ✅; `Dependency management` — значень у колонках
  немає (підтверджує рішення автора не писати «залежності платні»); `Capacity planning` — Premium+.

Перехресні посилання перевірені grep-ом по сусідніх уроках, а не на пам'ять:
«дошку ти вже бачив(ла) в уроці 1» ✅ (`jira-01.html`: вікно `board` + «На дошці статус і колонка —
те саме»); «на безкоштовному плані кожен учасник є адміністратором (урок 2)» ✅ (`jira-02.html`,
рядок 341). Терміни `business` / `software` як типи спейсу введені в `j03` (колонка `Type`) ✅.

---

## 3. Пропущені теми картки `j06`

Картка вимагає в блоці про дошку: «колонки = статуси, **пошук по дошці**, фільтр за виконавцем,
**Group**, **View settings**». Дві з них в уроці не звучать:

1. **Пошук по дошці (`Search board`)** — в уроці немає жодної згадки (grep: 0). Джерело для дописування
   готове: `screens/03`, розділ «Панель дошки» — «Поле **Search board** · аватари виконавців
   ("Filter by assignee") · **Filter** · **Group** · **Board insights** · **View settings**».
2. **`View settings` за іменем** — сама поведінка описана (приховування зробленого, збереження
   розкладки адміном), але назва елемента, через який це роблять, ніде не названа. Джерела:
   `screens/03` (панель дошки) і business-докси `monitor-your-work-with-the-board`: «From your board,
   select **View settings**, then select **Hide done work items after** to pick your preference».

Обидві дописуються одним-двома реченнями в блоці 2 (де вже описана панель дошки) — але це **додавання
фактів**, тож зроблено бути мною не могло.

Решта картки покрита: вигляд ≠ дані ✅ · рядок виглядів і «+ Add to navigation» зі списком пунктів ✅ ·
Board: колонки-статуси, `Filter`, `Group`/доріжки ✅ · List: `Configure columns`, сортування,
редагування в рядку, JQL в адресі ✅ · Calendar: due date, перетягування ✅ · Timeline: епіки й дати,
роллап, `Basic` на Free ✅ · Summary: плитки, статуси, активність, типи робіт, навантаження ✅ ·
business vs software ✅ · межі (JQL — j07, дашборд — j08, беклог і спринти — j13, статуси — j10,
поля — j11) ✅. `REM-4` свідомо не вжитий — не дефект (рішення зафіксоване).

---

## 4. Що виправив сам

**Усього 12 правок у `modules/jira-06.html`** (28 вставок / 23 видалення за `git diff --stat`).

**Факти з показаним джерелом — 6** (таблиця §2.1: спотворена цитата про плани; три заміни
software/company-managed-цитат на business-джерела; `Clear selection` без джерела; позиція смуги).

**Формулювання — 5:**

1. «`П'ятий вигляд` не показує окремих робіт» → «**Summary — єдиний із п'яти виглядів**, який не
   показує окремих робіт: він показує картину цілком» — у блоці 2 Summary йде **третім** за порядком
   викладу (календар і таймлайн — після нього), і слово «п'ятий» на цьому місці збиває.
2. Вступний блок: «чим набір виглядів **business-спейсу** відрізняється від **software**» → «чим набір
   виглядів **у спейсі для нетехнічної команди (business)** відрізняється від **спейсу для розробки
   (software)**» — англійські слова стояли у вступі раніше, ніж будь-яке пояснення (воно аж у кінці
   блоку 2); ukr-гліб узятий із цитати, яка вже є в уроці.
3. Підпис під W1: додано «Рядок виглядів намальовано таким, яким він стане **після кроку 3 блоку 4**, —
   з уже доданими `Calendar` і `Timeline`» — інакше читач порівнює вікно зі своїм щойно створеним
   спейсом і не розуміє розбіжності (це не новий факт, а чесність щодо власної ілюстрації).
4. Підпис під W2: додано «Сам запит окремим рядком над таблицею на екрані не стоїть: у вікні його
   винесено нагору, щоб було видно, а в Jira він живе в адресі сторінки та у вкладці JQL» — у вікні
   `win__query` показаний як рядок інтерфейсу, якого на знімку немає (сам автор фіксує це в §7 п. 3
   як розширення призначення класу).
5. Блок 6: «поїхали в окрему смугу — **її легко пропустити очима**» (заміна викинутої позиції смуги
   на нейтральне пояснення, чому картка «зникла»).

**Квіз — 1 клас правки (6 варіантів + 1 `explain`):** маркер стилю. До правки **тире «—» стояло лише
в правильному варіанті в 5 питаннях із 6** (Q1, Q2, Q4, Q5, Q6) — це той самий дефект, що й «правильна
= найдовша», тільки пунктуацією. Переписані **тільки дистрактори** (двокрапка/крапка з комою → тире),
зміст збережений; тепер тире є щонайменше у двох варіантах кожного такого питання. Правильні варіанти,
`q`, `answer` і кількість не чіпались.

**Три «було → стало» для прикладу:**

- «…which is included with Jira **Cloud** Premium and Enterprise» → «…which is included with Jira
  Premium and Enterprise»;
- «Довідка каже про це прямо: "view settings are applied per user — any changes you make will apply to
  your board and backlog, and not anyone else's"» → «Сторінка довідки **про дошку business-спейсу**
  каже це прямо: "All users are in control of how they want to view their work so how you group your
  board is visible to you only"»;
- квіз Q1, дистрактор: «Їх видалено назавжди**:** приховування на дошці стирає роботу…» → «Їх видалено
  назавжди **—** приховування на дошці стирає роботу…».

---

## 5. Механіка (дослівний вивід після правок)

```
$ python3 dev/build/012-jira/01-authoring/check-lessons.py --pattern 'modules/jira-06.html'
Перевіряю 1 сторінок
════════════════════════════════════════════════════════════════

✓ jira-06.html  (61.0 KB)

════════════════════════════════════════════════════════════════
Готово. З помилками: 0 із 1.
Факти цей скрипт НЕ перевіряє — лише структуру, механіку й мову.
```

```
$ python3 dev/build/007-quiz-distractors/check-quiz.py --files modules/jira-06.html
курс / файл                        питань           найдовша           +нічиї       найкоротша  answer 0/1/2/3   довж. прав./хибн.
----------------------------------------------------------------------------------------------------------------------------------
? (1 ф.)                                6       2/6 (33.3 %)     2/6 (33.3 %)      0/6 (0.0 %)  1/2/1/2          103.7 / 102.8
```

**0 ✗ / 0 !** до правок і після. Поіменно:

| # | Пункт | Стан |
| - | ----- | ---- |
| 1 | `data-config="../jira.config.json"` на `<html>`, `data-course="jira"` | ✅ |
| 2 | `data-module="j06"` — глобально унікальний (`grep -l` по `modules/*.html` дає лише цей файл; зайняті `m`, `a`, `c`, решта `j`) | ✅ |
| 3 | `<meta name="viewport" content="width=device-width, initial-scale=1.0">` — без `user-scalable` і `maximum-scale` | ✅ |
| 4 | Вісім блоків у порядку + квіз: `l1`…`l8` з `data-lesson` «1. Навіщо це» … «8. Підсумок і наступний крок», `#quiz` «Квіз: перевір себе» | ✅ |
| 5 | `.term--enter` / `.term--hero` / `.term--long` | відсутні (блоків `term` в уроці немає взагалі) ✅ |
| 6 | (термінальні рядки) | не застосовується — курс про GUI |
| 7 | Mermaid ≥ 1: один `flowchart TB`, текст вузлів і підписи стрілок у лапках, `<br/>` немає, `style` немає | ✅ |
| 8 | Квіз: 6 питань · JSON валідний (`json.loads` OK) · `answer` з нуля · `explain` у всіх шести · питання ситуаційні, не «скільки» · найдовша 33,3 % ≤ 35 %, найкоротша 0 % · розкид `answer` 1/2/1/2 (макс. 33,3 % ≤ 40 %) · маркер-тире розведений правкою §4 | ✅ |
| 9 | Дата біля кожного екрана: W1 «за документацією, 2026-09-17», W2 і W3 «звірено 2026-09-17»; `<img>`/`<svg>`/`<canvas>` у вікнах немає (єдиний `<svg>` у файлі — бургер шапки з базового каркаса) | ✅ |
| 10 | Регістр шляхів — лише нижній (`../css/…`, `../js/…`, `../jira.html`, `../assets/favicon.svg`); великі літери є тільки в зовнішньому URL Google Fonts | ✅ |

Додатково: апострофи — `U+0027` 31, `U+02BC`/`U+2019`/`U+2018` — 0 ✅. Вікна мають
`role="group" + aria-labelledby` і легенду `<ol>` рівно на кількість міток (3/3/3) ✅.
`#completeTitle` не чіпав ✅. Заборонені звороти (`просто` · `очевидно` · `як відомо` ·
`елементарно` · `всі знають` · `звісно` · `не забудь`) — пошуком по файлу **0 входжень** ✅.

---

## 6. Що перевірити не вдалося (і що зняти в sandbox)

Живого доступу до sandbox у мене немає — усе нижче перевіряється лише очима в Chrome:

1. **Business-спейс: рядок виглядів + адреса** (`screens/21`) — знімає ⚠ з W1/W2 і закриває
   твердження «у business-спейсі беклогу й спринтів немає» (§2.2 п. 1).
2. **Дошка з увімкненим `Group`** (доріжки) — переводить заголовок W1 із «за документацією» у
   «звірено» без зміни розмітки; заразом видно **справжню назву смуги** для робіт без значення
   (`Unassigned` / `None` / без назви) і її позицію.
3. **Панель дошки цілком** — щоб закрити дві пропущені теми картки (`Search board`, `View settings`)
   живим екраном, а не лише `screens/03`.
4. **Меню `Configure columns`** у списку — зараз описане словами.
5. **Календар із шухлядою `Unscheduled work`** і **таймлайн з епіком** — єдині два вигляди уроку
   без вікон (описані прозою з ⚠, як і домовлено).
6. **Меню «+» у business-спейсі** — чи є там `Backlog` (прямої цитати в Cloud-доксах немає; єдиний
   категоричний текст — KB з позначкою «Data Center Only», тому автор його правильно не цитував).

---

## 7. Знахідки для сусідів (файл `cross-findings.md` не редагував)

- **j06 → усім авторам:** банер сторінки довідки треба читати **до** цитати — у самому j06 три цитати
  прийшли зі сторінок «for software spaces» / «for company-managed spaces» й описували дошку
  business-спейсу. Business-відповідники є майже завжди: `organize-your-board`,
  `what-can-i-do-on-a-board`, `monitor-your-work-with-the-board`,
  `workflows-and-statuses-for-boards-in-business-projects`, `what-is-the-timeline-and-how-do-i-use-it` —
  усі з банером «This page is for business spaces» (перевірено 2026-09-18).
- **j06 → усім авторам:** цитати в лапках звіряти **посимвольно**, а не «по суті»: у j06 у цитату
  було вставлене слово `Cloud` («Jira Cloud Premium and Enterprise»), якого в доксах немає. Дешева
  перевірка — вигребти всі `«…»` з англійськими літерами й прогнати `in` по збережених текстах сторінок.
- **j06 → j09:** `create-a-new-project` дає **дослівну послідовність майстра**: «Hover over Spaces …
  Create space → Select a category or app from the template library → Use template → Give your space a
  name → **Select either Company-managed or Team-managed** → Select Create», плюс «Jira admins can
  create spaces from any template… Any user can create their own team-managed space unless a Jira admin
  changes this in global permissions» і «Only Jira admins can create spaces with a shared configuration.
  **This setting isn't available on the Free plan**». Це найближче до відповіді на відкрите питання
  j09 про company-managed на Free.
- **j06 → j10, j13:** `monitor-your-work-with-the-board` (business) містить готовий матеріал про
  колонки: `Configure columns` (create/rename, **map multiple statuses to a single column**, `Unmapped
  statuses` — сховати статус із дошки), «The column order applies to every user of the board» і
  примітку, що збереження адміном **скидає особисті налаштування колонок** в інших користувачів.
- **j06 → j08:** контраст Summary / дашборд уже озвучений в j06 одним реченням і цитатою «You can
  create multiple dashboards from different spaces» — j08 може на нього спиратись, не вводячи заново;
  плюс законна різниця чисел: у Summary категорія `Done` показує лише закрите за останні два тижні.
- **j06 → довідник 3:** числа, які в урок не пішли (крім 7/14/30/60 — див. §2.2 п. 7): до 10 дошок
  у спейсі · до 500 полів колонками · роллап таймлайну вимикається у спейсах > 10 000 робіт ·
  таблиця планів: `Roadmaps` Free `Basic`, Premium `Advanced`; `Capacity planning` Premium+;
  `Dependency management` — порожній рядок в усіх колонках.
- **j06 → дизайну (через звіт автора, підтверджую):** у W1 бар вийшов найважчим кадром уроку
  (крихти + шість вкладок + дві кнопки), а `board` із доріжками — це 3 × 3 колонок;
  `win__query` ужитий у стані `list`; `win__topbar` знову не знадобився.
