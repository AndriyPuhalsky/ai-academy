# Рецензія · j18 «Jira Service Management»

Рецензент `aia-content-reviewer`, 2026-09-18. Файл: `/Users/ander1.sage/Downloads/AIA/modules/jira-18.html`.
Джерела перевірки: 38 живих сторінок `support.atlassian.com` (власний `curl -sL` 2026-09-18, розбір
`<main>` без `<nav>`, таблиці — розбором `<tr>/<td>`), `screens/23`, `screens/24`, `screens/06`, `screens/12`,
`facts-free-plan.md` (№1, №3 обидва, №17), `glossary.md`, `program.md` (картка j18 + «Уточнення» п. 15),
`cross-findings.md`, `reports/j18.md`, сусідні уроки `jira-01/02/03/09/12/13/16`.
Робочі файли — `…/scratchpad/j18rev/` (власна підпапка, чужий скретчпад не читав як джерело).

---

## 1. Вердикт

**Готово з зауваженнями.** Урок фактурно міцний: 47 цитат із латиницею звірені посимвольно —
**47/47 знайдені в живих доксах** (одна лише після нормалізації апострофа й склейки чотирьох пунктів
списку, доведено нижче). Виправив 6 місць (одне з них — факт із джерелом, одне — факт, спростований
знімком `screens/23`). Блокерів немає; чекери 0 ✗ / 0 !.

---

## 2. Непідтверджені факти

### 2.1 Виправлено мною, бо знайшов джерело, яке суперечить тексту

**(а) «У галереї шаблонів ліворуч з'явиться категорія `Service management` — вона є лише тоді, коли
продукт уже на сайті.»**
Спростовано знімком: `screens/23-create-space-templates.md` (знято 2026-09-17 на навчальному сайті,
де **JSM не доданий**) показує в лівій колонці діалогу і категорію `Service management` з 16 шаблонами,
і продукт `Jira Service Management` у секції `PRODUCTS`. Тобто категорія видна **до** додавання продукту.
Джерело нового формулювання — той самий знімок + `create-edit-and-delete-team-managed-service-projects`
(«Select **Service Management** under Space templates, or **Jira Service Management** under Apps»).
Стало: «У галереї шаблонів ліворуч є категорія `Service management` (у переліку продуктів там само
стоїть `Jira Service Management`) — саме там лежать шаблони служб.»

**(б) «На картці заявки є кнопка «Add agent»…» (ЧаПи)**
Напис `Add agent` у матеріалах проєкту зафіксований **лише на екрані редактора workflow**
(`screens/12-workflow-editor.md`, рядок 12), а не на картці роботи. Жива сторінка
`about-the-issue-view-in-jira-service-management` описує анатомію картки агента й називає це місце
розділом **`10. Agents`** («You can now collaborate directly on work items with Rovo agents or other AI
agents») — кнопки `Add agent` там немає. Переписав заголовок і абзац: розділ `Agents` — на картці,
кнопки `Add agent` / `Ask AI` — «в інших місцях Jira» з відсиланням до уроків 2 і 3 (де вони й показані:
`See plans` — j02, `Ask AI` / `Improve` / `Add agent` — j03). Змістовий урок (агент ≠ Rovo-агент) збережений.

**(в) «…у курсі й у довідці його часто скорочують до JSM.»**
Слова `JSM` немає **в жодній** із 38 прочитаних мною сторінок довідки (`grep -c JSM` = 0 у всіх).
Скорочення справді вводиться в курсі — у j02 («Jira Service Management (JSM)»). Стало: «у курсі його
скорочують до JSM, як уже було в уроці 2».

### 2.2 Лишив у тексті, але з зауваженням (рішення не моє)

1. **Цитата про пробний план після додавання продукту** — «We start you on a free trial of the app or
   collection, either on a Standard or Premium plan…». Сторінка
   `organization-administration/docs/add-a-new-product-to-your-organization/` у блоці «Who can do this?»
   обмежена: «Role: **Organization admin**; Atlassian Cloud: **Enterprise plan** for Jira, Jira Service
   Management, Confluence…», і описує шлях через Atlassian Administration, а не `Discover Applications`
   на безкоштовному сайті. Автор уже поставив поруч ⚠ «цей крок ми не проходили живцем» — цього достатньо,
   але при першій же живій перевірці цей абзац треба переписати за фактом.
2. **«…бачить усі чужі заявки»** (граблі 1) — прямої цитати немає; найближче доведене: черги показують
   роботи команді («A queue is a filtered set of work items that are displayed to your team»), агенти
   «spend most of their time working in queues». Інференс м'який, лишив.
3. **«…агентів на безкоштовному плані три на всі служби разом»** (ЧаПи) — у таблиці планів рядок
   `User limit` = `Up to 3 agents` стосується підписки на продукт, а не окремого спейсу; «на всі служби
   разом» — коректний, але неявний висновок із таблиці. Лишив.
4. **`Requests`, `Search`, набір колонок черги** у вікнах — усе «за документацією», ⚠ у підписах є
   (див. §6).

### 2.3 Що я перевірив і підтвердив (щоб не переперевіряли)

| Твердження уроку | Джерело (2026-09-18) |
| --- | --- |
| `User limit` = `Up to 3 agents`, `Customer limit` = `Unlimited` | `explore-jira-cloud-plans`, сьома таблиця, розбір `<td>`: рядки збіглися з `screens/24` |
| `Multi-channel support` ✓, `Customizable workflows and SLA's` ✓, `Custom reports` ✓, `Automation` ✓ на JSM Free | там само (галочка = `<path d="M9.707 11.293…">`) |
| Ukrainian: ❌ Jira, JSM, JPD, Confluence, Team Calendars · ✅ Compass, Home, **Help center and Customer Portal** | `manage-your-language-preferences`, розбір рядка таблиці (8 колонок продуктів) |
| `Open` і `Waiting for customer` — зі списку типових статусів служби; `Waiting for customer` — категорія «у роботі» | `manage-how-work-flows-in-your-team-managed-service-space` (банер «This page is for **team-managed** spaces»): «Open Reopened Pending Work in progress Waiting for customer Waiting for support Escalated Done Canceled»; «you might have a “Waiting for customer” **in-progress** status» — це і є опора `explain` питання 4 |
| Шлях до продукту №1 (`Settings → User Management → Discover Applications`, `Free Trial` / `Sign up for free`) | KB `adding-new-products-or-3rd-party-apps-…`, банер **«Platform Notice: Cloud Only»**, оновлено 2025-09-26 |
| Шлях №2 (перемикач застосунків → `Administration` → сайт → `Apps` → `Discover new apps`) | `add-confluence-to-set-up-knowledge-base` |
| «Ключ спейсу Jira згенерує сама» | `create-edit-and-delete-team-managed-service-projects`: «We automatically generate a space key when the service space is created» |
| Розділи спейсу `Customers` · `Channels` · `Invite team` · `Reports` | чотири різні сторінки, усі з формулою «from your service space» |
| Портал: `Channels` → адреса; черги в бічній панелі («Next to **Queues** in your space») | `about-the-portal-and-help-center`, `make-queues-for-your-team` |
| Банери всіх цитованих сторінок | жодна не є company-managed-only; сторінки про дозволи, статуси, портал, мови, чергу — team-managed або спільні. Пастка з прийому не спрацювала |

**Звірка цитат.** 47 цитат із латиницею, збіг 47/47. Єдиний «MISS» машинної звірки — чотирисентенційна
цитата про пошту: у джерелі це **чотири послідовні пункти списку**, кожен збігається дослівно
(`A customer emails a request to your service space's email address.` · `The request is added to your
queues as a work item.` · `An agent comments on the work item.` · `The customer receives an email
notification with your agent's comment.`), а тег розриває `space’s` → `space ’s`. Після нормалізації
апострофа й склейки — повний збіг. Це та сама пастка, що вже описана у `cross-findings` (хвиля 4).

---

## 3. Пропущені теми з картки j18 (з урахуванням «Уточнень» п. 15)

Покриття тем картки — **повне**. Чотири зауваження, з них жодне не закривається рецензентом:

1. **Блок 5 не має ознаки «клієнт отримав лист-підтвердження»** (є в картці, «Як перевірити»).
   Натомість стоїть «клієнт бачить свою заявку в `Requests`». Ймовірна причина — джерела: докси описують
   листи клієнту **при відповіді агента й при розв'язанні** («They receive email notifications when agents
   respond to their request and when their request is resolved»), окремого листа-підтвердження при
   створенні я теж не знайшов. Рішення правильне, але у звіті автора §5 воно не назване — фіксую тут.
2. **Слово «JQL» в уроці не звучить**, хоча картка пише «черга (queue) — список запитів **за JQL**».
   Зміст переданий («набір заявок, відібраний запитом» + місток «те саме, що збережений фільтр з уроку 7»),
   тож формально тема прозвучала; для j19 (черги за JQL) міст уже є.
3. **Крок «обери `Team-managed`» у майстрі не названий.** Докси дають його дослівно
   (`create-edit-and-delete-team-managed-service-projects`: «Select **Team-managed**»), а
   `create-a-service-project` попереджає: «For some templates, you'll have the option of a team-managed or
   company-managed space type». Увесь курс (і всі шляхи j19) стоїть на team-managed — читач, який
   випадково зробить company-managed службовий спейс, у j19 не знайде жодного зі шляхів. Дописати може
   лише автор.
4. **Обіцянка j09 не закрита:** j09 каже «Спейс `FIN` … з'явиться в уроці 18, і **там же буде видно, як
   його тип підписаний у списку спейсів**». j18 колонки `Type` не показує (і без sandbox не може) —
   рядок для кореневої сесії, закривається знімком (див. §6).

---

## 4. Що виправив сам (6 правок)

**Факт із показаним джерелом — 2:**
1. `Крок 2`: «з'явиться категорія `Service management` — **вона є лише тоді, коли продукт уже на сайті**»
   → «є категорія `Service management` (у переліку продуктів там само стоїть `Jira Service Management`) —
   саме там лежать шаблони служб» *(джерело: `screens/23` + `create-edit-and-delete-team-managed-service-projects`)*.
2. ЧаПи: «**На картці заявки є кнопка «Add agent»** — це про колегу?» → «**У картці заявки є розділ
   «Agents»** — це про колег-агентів?»; у тілі: «розділ `Agents` на картці роботи — і кнопки `Add agent`
   та `Ask AI`, які трапляються в інших місцях Jira» *(джерело: `about-the-issue-view-in-jira-service-management`,
   п. 10; `screens/12`; j03)*.

**Формулювання — 4:**
3. Вступна плашка: «Немає чисел, **крім одного**: скільки листів, скільки сховища…» (двозначно, та й чисел
   в уроці два) → «Немає чисел, **крім двох, на яких стоять самі плани: десять користувачів Jira і три
   агенти JSM**. Скільки листів, скільки сховища…» — формулювання вирівняне з j02.
4. Блок 1: «у курсі **й у довідці** його часто скорочують до JSM» → «у курсі його скорочують до JSM,
   **як уже було в уроці 2**» *(у 38 прочитаних сторінках довідки слова JSM немає)*.
5. Крок 1: «**Стаття бази знань** Atlassian формулює обмеження так» → «**Довідкова стаття** Atlassian…» —
   за два абзаци до того «база знань» уже введена як поняття JSM (статті на порталі); два значення одного
   слова поруч плутають читача.
6. Блок 5: «Портал живе в розділі `Channels` того самого спейсу, **і в довідці це єдиний описаний шлях до
   нього**» → «…— **довідка описує саме цей шлях до нього**» (категоричність зайва: та сама довідка веде
   до налаштувань порталу через `Space settings → Channels & self service → Portal`, а клієнти бачать
   портали з центру допомоги).

**Не чіпав:** `#quizData` (жодного символу), вікна й легенди, цитати, дати, структуру, апостроф (U+0027,
46 входжень; U+2019/U+02BC/U+2018 — 0).

---

## 5. Механіка

| # | Пункт | Результат |
| - | ----- | --------- |
| 1 | `data-config="../jira.config.json"` на `<html>` | ✓ (плюс `data-course="jira"`, `data-density="lesson"`, `data-lit`) |
| 2 | `data-module="j18"` на `<body>`, глобально унікальний | ✓ — по всіх `modules/*.html` дублікатів `data-module` **0** |
| 3 | `<meta name="viewport">` без `user-scalable` / `maximum-scale` | ✓ |
| 4 | Вісім блоків + квіз, у кожного `id` і `data-lesson` | ✓ `l1…l8` + `quiz`, порядок і назви за контрактом |
| 5 | `.term--enter` / `.term--hero` | ✓ 0 входжень (`term` узагалі не вжитий — у j18 він і не потрібен) |
| 6 | Вікна застосунку (замість `.term__line`) | ✓ 3 вікна (`portal` · `list` · `item`), `aria-labelledby` на кожному `win__body`, легенди рівно за кількістю цифр (5/3/3), `<img>/<svg>/<canvas>` усередині вікон — **0**, класи лише з §4.3 |
| 7 | Mermaid ≥ 1, текст вузлів у лапках | ✓ один `flowchart LR`, усі сім вузлів у лапках, `<br/>` — 0 |
| 8 | Квіз | ✓ 6 питань · по 4 варіанти · JSON валідний · `explain` у всіх шести · `answer` = `[0,3,2,1,3,0]` (жоден індекс > 33 %) · ситуаційні формулювання, не «скільки» |
| 9 | Версія/дата біля кожного екрана | ✓ усі три заголовки — «…· **за документацією, 2026-09-18**», плюс окрема плашка ⚠ перед першим вікном, яка чесно каже, що JSM на навчальному сайті немає |
| 10 | Регістр шляхів — нижній | ✓ усі 16 локальних шляхів (`../css/…`, `../js/…`, `../jira.html`, `../jira.config.json`, `../assets/favicon.svg`) |

**Фаза 5 звірена з `jira.config.json`:** `tracks[phase5].title` = «Service desk і адміністрування» =
`p.ds-eyebrow` уроку ✓; `modules[j18].number` = 18 = крихта «Урок 18» і `<title>` «Урок 18» ✓;
`modules[j18].title` = «Jira Service Management» = `h1` ✓; довідник названий **назвою**
(«Карта інтерфейсу, глосарій і ліміти Free»), номерів довідників в уроці немає ✓.

**Мова:** заборонених зворотів (`просто`, `очевидно`, `як відомо`, `елементарно`, `всі знають`, `звісно`,
`не забудь`) — **0**. Парні форми звертання на місці: `зробив(ла)`, `створив(ла)`, `впустив(ла)`,
`працюєш сам(а)` — чоловічого роду без пари немає. Кожна англійська цитата має український переказ поруч
(перевірено всі 47). Слово «мітки» для ①②③ не вживається (у прозі його взагалі немає — `Labels` не
конфліктує). Терміни-пастки, що ловились раніше: «віджет» → «віконце, вбудоване в чужу сторінку» ✓,
«приватне вікно браузера» пояснене трьома браузерами ✓, «ліцензований» розшифроване ✓, «обліковий запис»
уже введений у j03 ✓.

**Числа:** у тексті лише два числа планів — десять користувачів Jira і три агенти JSM (обидва дозволені
§0.1 п. 3). Число поведінки продукту одне — календар SLA `09:00–17:00`, і воно стоїть із дослівною
датованою цитатою («By default, when you create a new calendar, the hours are preset from 09:00 to 17:00
(9am-5pm)», `set-up-sla-calendars`) — правило 2в дотримане.

### Виводи чекерів (на фінальному файлі, після моїх правок)

```
$ python3 dev/build/012-jira/01-authoring/check-lessons.py --pattern 'modules/jira-18.html'
Перевіряю 1 сторінок
════════════════════════════════════════════════════════════════

✓ jira-18.html  (57.9 KB)

════════════════════════════════════════════════════════════════
Готово. З помилками: 0 із 1.
Факти цей скрипт НЕ перевіряє — лише структуру, механіку й мову.
```

```
$ python3 dev/build/007-quiz-distractors/check-quiz.py --files modules/jira-18.html
курс / файл                        питань           найдовша           +нічиї       найкоротша  answer 0/1/2/3   довж. прав./хибн.
----------------------------------------------------------------------------------------------------------------------------------
? (1 ф.)                                6        0/6 (0.0 %)      0/6 (0.0 %)      0/6 (0.0 %)  2/1/1/2           84.7 /  85.4
```

```
$ python3 dev/build/012-jira/01-authoring/check-quiz-markers.py --files modules/jira-18.html
✓ jira-18.html

Маркерів: 0 у 0 із 1 файлів.
```

Прохід по маркерах стилю руками (в обидва боки, бо чекер міряє лише довжину): П2 — дві «Так» і дві «Ні»
(правильна серед «Ні») ✓; П4 — усі чотири починаються з «Бо» ✓; П5 — два варіанти починаються з «Лист»,
один із них правильний ✓; П6 — двокрапка і в правильному, і в дистракторі ✓; дзеркального маркера
(«правильна — єдина **без** розділового знака») немає.

---

## 6. Що перевірити не вдалося — і що саме зняти в sandbox

Доступу до Chrome у мене немає, JSM на навчальному сайті не доданий. Нижче — рівно те, що закриє ⚠ уроку
(перші три — найцінніші; це та сама черга, що в §5 звіту автора, я лише уточнив формулювання):

1. **Портал службового спейсу очима клієнта** → `…/servicedesk/customer/portal/N`:
   **точний напис-підказка в полі пошуку** (у вікні W1 стоїть нейтральне `Search`; це відкрита обіцянка ще
   з j01), заголовок (`Portal name`), вступний текст (`Introduction text`), підписи під плитками
   (`portal description`), напис кнопки `Requests` біля аватара.
2. **Сторінка черг** (`Queues` у бічній панелі службового спейсу): назви черг, які приніс шаблон; **набір
   колонок за замовчуванням** (в уроці `Key · Summary · Reporter · Status · Time to first response`);
   **як саме друкується годинник SLA** (в уроці `within 3h 20m` за форматом із доксів `within 8h 30m`).
3. **Картка заявки очима агента** (`/browse/FIN-2`): порядок і підписи полів лівої колонки, панель SLA,
   рядок `Add internal note` / `Reply to customer`, блок `Customer request information`, **чи є на картці
   розділ `Agents` і як він підписаний** (закриє мою правку 4.2).
4. **`Channels`** службового спейсу: **чи є на безкоштовному плані адреса пошти служби** і як вона
   виглядає (в уроці ⚠ у двох місцях); що ще перелічене як канал (чат, віджет).
5. **Портал українською:** перемкнути мову клієнтського акаунта і подивитись, чи справді перекладається
   `Help center and Customer Portal` (таблиця мов це дозволяє, наживо ніхто не бачив).
6. **Галерея `Create space` після додавання JSM:** чи змінюється категорія `Service management` (до
   додавання вона вже видна — `screens/23`), і що станеться з планом сайту після вибору JSM-шаблону
   (пробний платний → Free) — це закриє ⚠ кроку 1.
7. **Колонка `Type` у списку `Spaces` біля службового спейсу** — закриє давню розбіжність j03/j09 **і
   невиконану обіцянку j09 перед j18** (§3, п. 4).

---

## 7. Знахідки для сусідніх уроків (формат `cross-findings.md`; сам файл не редагував)

- **j18 → j01:** легенда порталу в j01 підписує плитку «**тип заявки**», а канон курсу (глосарій, j18) —
  «**тип запиту** (request type)» · `modules/jira-01.html`, `00-research/glossary.md` рядок JSM · вирівняти
  формулювання j01 при зведенні (кореневою сесією, не автором j18).
- **j18 → j09 (борг):** j09 обіцяє, що «в уроці 18 буде видно, як тип спейсу `FIN` підписаний у списку
  спейсів» — j18 колонки `Type` не показує (JSM на sandbox немає) · `modules/jira-09.html`, блок про `Type` ·
  закривається знімком §6 п. 7; доти або зняти обіцянку в j09, або дописати вікно в j18.
- **j18 → j19:** у майстрі створення службового спейсу є **явний крок «Select Team-managed»**, і для
  частини шаблонів пропонується вибір типу («For some templates, you'll have the option of a team-managed or
  company-managed space type») · `create-edit-and-delete-team-managed-service-projects`,
  `create-a-service-project`, 2026-09-18 · j19 стоїть на team-managed шляхах — назвати цей крок у j18 або
  на початку j19.
- **j18 → j19, j20 (докси суперечать самі собі):** «By default, **anyone** can create team-managed spaces»
  (`create-edit-and-delete-team-managed-service-projects`) проти «**Only Jira admins** can create spaces»
  (`create-a-service-project`) · обидві живі 2026-09-18 · на Free різниці немає (усі — адміни), але
  формулювання обрати один раз.
- **j18 → j19 (готове до вживання, перевірив сам):** шлях створення черги — «Next to **Queues** in your
  space, select More actions (…), then **Queue settings** → **Create new queue**», приклад JQL черги в
  доксах — `resolution = Unresolved AND "Request Type"="Get guest wi-fi access (MFSD)"`, і там же
  пояснення, що зелена галочка = валідний запит · `make-queues-for-your-team`, 2026-09-18.
- **j18 → j19 (статуси, підтверджено):** перелік типових статусів служби й **категорії** — «you might have
  a “Open” **to-do** status and a “Reopened” to-do status. Or, you might have a “Waiting for customer”
  **in-progress** status and a “Waiting for support” in-progress status» ·
  `manage-how-work-flows-in-your-team-managed-service-space` (банер team-managed), 2026-09-18 · це готова
  опора для `stateDiagram-v2` у j19 і для §3 програми.
- **j18 → j16, j20:** щоб база знань була безкоштовною, з Confluence доводиться **прибирати групи**:
  «To use the knowledge base for free, you are required to remove site admins and other groups from
  Confluence to reduce the count of billable users to zero» · `add-confluence-to-set-up-knowledge-base`,
  2026-09-18 · дім — j20 (люди й місця), в j18 свідомо не згадано.
- **j18 → j22, довідники:** картка агента JSM має розділ **`Agents`** (Rovo/AI-агенти), а кнопка
  **`Add agent`** у матеріалах проєкту зафіксована на **редакторі workflow** (`screens/12`), не на картці ·
  `about-the-issue-view-in-jira-service-management` п. 10 · у довіднику розвести «агент служби» й
  «Rovo-агент» явно.
- **j18 → кореневій сесії (метод):** `add-a-new-product-to-your-organization` має блок «Who can do this?
  Role: Organization admin; Atlassian Cloud: **Enterprise plan**…» — цитата про пробний платний план узята
  звідти й формально описує шлях через Atlassian Administration · перевірити при живому додаванні JSM.
- **j18 → дизайну (підтверджую заявки автора):** `win__subrail` (бічний список черг усередині спейсу —
  просив ще j10), `win__actions` поза `win__dialog` (четверта заявка: j13, j14, j18), скролер для
  `win__table` на 5 колонок (рядок 13a реєстру, 390 px), `win__topbar` — **0 вживань у 18 уроках**.
