# Рецензія · j19 «Практикум: заявки до бухгалтерії»

Рецензент `aia-content-reviewer`, 2026-09-19. Файл: `/Users/ander1.sage/Downloads/AIA/modules/jira-19.html`.
Правлено рівно цей файл; `program.md`, `cross-findings.md`, конфіги, сусідні уроки, `css/`, `js/` — лише читання. Git не виконувався.

---

## 1. Вердикт

**Готово з зауваженнями.** Фактура тримається: **51 латинська цитата — 0 розбіжностей** при посимвольній
регістрочутливій звірці по 53 живих сторінках довідки, кожен англійський напис у чотирьох вікнах має опору
в доксах, чисел плану в прозі немає. Виправлено 11 місць — одне хибне внутрішнє посилання, один висновок,
що суперечив власній таблиці уроку, дві перефрази, що розходились із цитатою поруч, два твердження про
екран, якого ніхто не бачив, і п'ять формулювань. Дві теми картки не прозвучали (нижче §3) — це робота
автора, не моя.

---

## 2. Непідтверджені факти

**Нових непідтверджених фактів не знайдено.** Усе, що я міг перевірити джерелом, перевірене; те, що
виправив із джерелом, — у §4. Нижче — три місця, які лишаються мʼякими висновками (не помилки, але й не
цитати), і два твердження про екран, які я вже прибрав.

### 2.1 Виправлено з джерелом (було твердження про екран без джерела)

1. **Було:** «Розділ `Space settings` → `Notifications` → `Customer notifications` **відкривається**, але
   редагування шаблонів упирається в план» (граблі 4).
   **Чому дефект:** що саме показує сторінка на Free, ніхто не бачив — автор сам поставив це в список
   дозйомки (`reports/j19.md` §5, п. 6). Це той самий клас, що ловили в хвилі 4 («кнопка живе на екрані…»).
   **Стало:** «Шлях до шаблонів нікуди не подівся — …, — але саме редагування впирається в план: довідка на
   цьому місці радить одне, «upgrade your plan to a paid edition»».
   **Джерело:** `support.atlassian.com/jira-service-management-cloud/docs/edit-a-customer-notification-in-next-gen/`
   («To access the feature, upgrade your plan to a paid edition and complete the evaluation period»,
   звірено 2026-09-19).
2. **Те саме в квізі, П5 `explain`:** було «Розділ налаштувань при цьому відкривається, тому здається, що
   справа в правах або в мові» → стало «…і радить одне — підвищити план. Ні мова листа, ні портал, ні назва
   самого порталу тут ні до чого». Правильна відповідь, `q`, `answer` і варіанти не чіпались.

### 2.2 Мʼякі висновки, які лишились (з опорою, але без дослівної цитати) — рішення автора, не правив

- «Усередині команди статуси лишаються англійськими, і JQL від цього не ламається» (крок 3 і ЧаПи).
  Опора — сама назва поля `Status name to show customer` і речення «You can customize the names of these
  workflow statuses to friendlier statuses **for customers**»
  (`customize-the-workflow-statuses-for-a-request-type`). Що саме бачить JQL після зміни, довідка не каже.
- «Доки ти не поставиш `Pause on`, годинник у будь-якому статусі цокатиме далі» (блок 3). Опора —
  «Set the Start, **Pause on (optional)**, and Stop conditions» (`create-and-edit-slas-in-team-managed-service-projects`).
- Крок 8: шлях `Space settings` → `Automation` → `Create flow`. Розділ `Automation` у налаштуваннях спейсу
  названий у `get-to-know-the-project-settings-sidebar`; напис `Create flow` — з живого екрана
  `screens/13-automation-space.md`, але то **діловий software-спейс**, не службовий. Для JSM-спейсу цей
  напис живим екраном не звірений — у списку дозйомки цього пункту немає, варто додати.

### 2.3 Одне число на межі правила §0.1 п. 3

У граблях 4 стоїть дослівна цитата «…if you are on a Free plan or standard plan with **10 agents free for
one year** only limited-time offer of Jira Service Management». Це не ліміт Free (це назва акції), і це
цитата, а не текст уроку, — але формально в уроці зʼявилось число плану, якого немає у двох дозволених
винятках. Знімати не став: обрізати цитату посередині гірше. Рішення — за кореневою сесією.

---

## 3. Пропущені теми з картки j19

1. **Поле «Вкладення» у формі заявки** (картка, крок 2: «поля (Сума, Постачальник, Дата, **Вкладення**)»).
   В уроці три поля з чотирьох; слова про вкладення немає взагалі (`grep` по «вклад» дає лише «вкладка»).
   У переліку типів полів службового спейсу (`available-custom-fields-for-team-managed-service-projects`)
   `Attachment` теж немає — тобто це не недогляд, а відсутність опори; але читач, який хоче отримати від
   колеги фото рахунка, лишається без відповіді. Варіант для автора: один рядок про те, що вкладення —
   системне поле картки, і згадка в ЧаПи.
2. **`Reply to customer` vs `Add internal note`** (картка, крок 8; і грабля картки «внутрішня нотатка,
   надіслана як відповідь»). В уроці `Reply to customer` названий двічі, слова «внутрішня нотатка» немає
   жодного разу; пари, заради якої картка робила окремий крок, читач не побачить. Дім поняття — j18 (там
   пара є), тож це не дублювання, а справді пропуск практикуму.
   **Опора, щоб автору не шукати:** `talk-to-the-customer-or-team-members-from-the-new-issue-view`
   (банер Cloud/Data Center, звірено 2026-09-19): «In the Activity section, select **Reply to customer**»,
   «**Add internal note** You can also add internal notes (the customer cannot see these)…», і окремо
   «if the Public comment edited notification is turned off in space settings, customers will not receive
   an email notification when an internal comment is converted to a public comment».

Решта дванадцяти тем картки прозвучала: типи запитів ↔ типи роботи · форма з полями · групи порталу ·
три черги · SLA з календарем і паузою · два flows · статуси запиту · база знань умовним кроком · мова
порталу (рядок із відсиланням до j18) · перевірка очима клієнта · «що через місяць» (розділ `Reports`).
Заміни, зафіксовані в «Уточненнях» п. 17 (Forms → звичайні поля, `Resolved` → `Done`, «SLA горить» →
«Горить SLA», відсутність листа-підтвердження, Legacy-автоматизація), перевірені й **не** рахуються
пропуском.

---

## 4. Що виправив сам — 11 правок

### Логіка уроку (3)

| # | Було | Стало |
| - | ---- | ----- |
| 1 | Блок 5, ознака 3: «У черзі «Нові» вона **не затримується**: flow призначає її Ігорю, і вона перетікає в «Мої»» | «Ще до того, як Ігор її відкрив, вона стоїть у черзі «Мої»… У «Нові» вона лишається доти, доки статус не зміниться: та черга відбирає **за статусом**, а не за виконавцем» |
| 2 | Крок 8: «про самі листи йдеться **в кроці 10**» | «…йдеться **в блоці 5**» |
| 3 | Блок 5: «Перші **чотири** видно очима за хвилину, пʼята — за день роботи» | «Перші **три** видно очима за хвилину, четверта потребує години очікування, пʼята — погляду з боку клієнта» |

Пояснення до №1: черга «Нові» в таблиці кроку 7 — це `status = Open`, а flow міняє виконавця, не статус.
Стара ознака обіцяла читачеві те, чого він не побачить (це хвіст картки: «у черзі «Нові» заявка зникла
після призначення»). Нова спирається рівно на власні запити уроку, нових фактів не додає.
До №2: листи розібрані в блоці 5 під вікном W4; у кроці 10 про них немає нічого.

### Перефрази, що розходились із цитатою поруч (2)

| # | Було | Стало |
| - | ---- | ----- |
| 4 | Крок 1: «назва міняється скрізь, **включно зі старими заявками**» | «назва міняється скрізь, де її видно, зокрема на порталі» (цитата поруч: «updates everywhere, **including in the portal**» — про старі заявки вона не каже) |
| 5 | ЧаПи: «видаляти можна лише тоді, коли **після видалення** лишиться щонайменше два типи» | «видалити щось можна лише тоді, коли типів, крім `Email request`, у спейсі щонайменше два» (цитата: «there must be at least two request types (in addition to the Email request) **before** a request type can be deleted») |

### Формулювання (6)

| # | Було | Стало | Чому |
| - | ---- | ----- | ---- |
| 6 | Граблі 3: «годинник спить у ті години, коли кавʼярня працює, **і цокає в ті, коли вона зачинена**» | «…спить у ті години, коли кавʼярня вже працює: рання зміна з сьомої й уся субота для нього не існують, тож обіцяні вісім годин розтягуються на кілька календарних днів» | друга половина фрази для сюжету (Пн–Сб, 7:00) неправдива: календар `09:00–17:00` не цокає, коли кавʼярня зачинена |
| 7 | Крок 7: «**Наведи на** `Queues`» | «**Поруч із** `Queues` у бічній панелі спейсу натисни `More actions (•••)`» | довідка: «**Next to Queues** in your space, select More actions» (`create-a-new-queue`) |
| 8 | Блок 3: «`remaining("2h")` — лишилось менше ніж дві години» | «`remaining("2h")` — дві години, що лишились до цілі» | довідка: «remaining("2h") means 2 hours left» (`write-jql-queries-for-slas`); «менше ніж» дає оператор `<`, і це вже сказано в заголовку блока `term` |
| 9 | Блок 4: «останні три — про автоматику й перевірку» | «останні три — про автоматику, базу знань і перевірку» | крок 9 — база знань |
| 10 | Підпис під W4 | + «Статуси тут стоять англійськими: назв для клієнта команда «Марципану» ще не задала — це крок 3» | інакше вікно суперечить власній пораді уроку (крок 3 велить назвати статуси українською, а список клієнта показує `Waiting for customer`) |
| 11 | Квіз, П5 `explain` | див. §2.1 п. 2 | твердження про екран |

**Заборонених зворотів не знайдено взагалі** (`просто`, `очевидн-`, `як відомо`, `елементарн-`,
`всі знають`, `звісно`, `не забудь` — 0 входжень). Форм звертання з чоловічим родом («ти зробив») немає;
узгодження навколо нової назви фірми правильне в усіх пʼяти місцях: «кавʼярні «Марципан»», «у «Марципані»»,
календар «Марципан»/«Марципан: Пн–Сб».

---

## 5. Механіка

Вивід **на фінальному файлі** (після всіх правок), дослівно:

```
$ python3 dev/build/012-jira/01-authoring/check-lessons.py --pattern 'modules/jira-19.html'
Перевіряю 1 сторінок
════════════════════════════════════════════════════════════════

✓ jira-19.html  (64.0 KB)

════════════════════════════════════════════════════════════════
Готово. З помилками: 0 із 1.
Факти цей скрипт НЕ перевіряє — лише структуру, механіку й мову.

$ python3 dev/build/007-quiz-distractors/check-quiz.py --files modules/jira-19.html
курс / файл                        питань           найдовша           +нічиї       найкоротша  answer 0/1/2/3   довж. прав./хибн.
----------------------------------------------------------------------------------------------------------------------------------
? (1 ф.)                                6        0/6 (0.0 %)      0/6 (0.0 %)      0/6 (0.0 %)  2/2/1/1           78.2 /  77.9

$ python3 dev/build/012-jira/01-authoring/check-quiz-markers.py --files modules/jira-19.html
✓ jira-19.html

Маркерів: 0 у 0 із 1 файлів.
```

До правок обидва чекери давали той самий результат (0 ✗ / 0 !; 0/6; Маркерів: 0) — регресії немає.

| # | Пункт | Стан |
| - | ----- | ---- |
| 1 | `data-config="../jira.config.json"`, `data-course="jira"` на `<html>` | ✓ |
| 2 | `data-module="j19"` на `<body>`, глобально унікальний | ✓ (`grep` по 22 файлах `modules/*.html` — дублів `data-module` нема жодного) |
| 3 | `<meta viewport>` без `user-scalable` / `maximum-scale` | ✓ `width=device-width, initial-scale=1.0` |
| 4 | Вісім блоків + квіз, у кожного `id` і `data-lesson` | ✓ `l1`–`l8`, `quiz` |
| 5 | `.term--enter` / `.term--hero` / `.term--long` | ✓ 0 входжень |
| 6 | Компонент вікна (замість `.term__line`): чотири `figure.win[data-state]`, `figcaption` → `win__body[role=group][aria-labelledby]`, мітки `aria-hidden` + легенда, жодного `<img>`/`<svg>`/`<canvas>` усередині | ✓ стани `form` · `settings` · `list` · `portal`; міток 4/3/3/3 = пунктів легенди 4/3/3/3 |
| 7 | Mermaid ≥ 1, текст вузлів у лапках | ✓ один `stateDiagram-v2`, усі чотири стани в лапках, `<br/>` немає |
| 8 | Квіз: 6 питань · JSON валідний · `answer` з нуля · `explain` у кожного · ситуаційні · довжина не підказує | ✓ `python3 -m json.tool` проходить; найдовша 0/6, найкоротша 0/6, нічиїх 0; розкид `answer` 2/2/1/1 (максимум 33 % ≤ 40 %); маркерів стилю 0 в обидва боки |
| 9 | Дата біля кожного вікна | ✓ у всіх чотирьох — «за документацією, 2026-09-19»; плюс попереджувальна плашка на початку блоку 2 |
| 10 | Регістр шляхів — нижній | ✓ `../css/`, `../js/`, `../assets/favicon.svg`, `../jira.config.json`, `../jira.html` |
| + | `term` для JQL (§4.4) | ✓ один блок, кнопка «Копіювати», `pre.term__body[tabindex][role=group][aria-labelledby]`, один рядок `.term__in` |
| + | Апостроф U+0027 | ✓ U+2019 / U+2018 / U+02BC — по нулю |

Норма «2–4 граблі» **дотримана**: у блоці 6 рівно чотири `h3`. Десять підзаголовків — це блок 4 «Зроби
сам» (кроки практикуму), і для практикуму це нормально; у звіті автора §7 йдеться саме про нього, а не про
граблі. Читається добре: кроки короткі, кожен починається з дії, порядок пояснено на початку блока.

---

## 6. Що перевірити не вдалося

**Звірено мною наживо 2026-09-19:** 53 сторінки довідки (`jira-service-management-cloud` ×49,
`jira-software-cloud` ×2 — `jql-fields`, `manage-your-jira-personal-settings`, `cloud-automation` ×3),
метод — `curl -sL` → `<main>` без `<script>/<style>/<nav>/<svg>`, два варіанти зняття тегів під різними
ключами, нормалізація `\s+([,.'])`, регістрочутливе порівняння. Робочі файли — у власній підпапці
скретчпада `…/scratchpad/j19review/`, чужих не читав. Банери: **жодна цитата не взята зі сторінки
company-managed**; усі сторінки мають продуктові вкладки «Cloud Data Center», частина — окрему плашку
«This page is for team-managed spaces».

**Перевірив окремо (те, що автор позначив як слабке):**

- `within 8h 30m` — **знайшов**: `set-up-sla-format-display`, «Time centric … For example, “time to
  resolution within 8h 30m”». Підпис під W3 правдивий.
- `Reply to customer` / `Add internal note` — **знайшов** (див. §3, п. 2); напис у кроці 8 і кроці 10
  має опору.
- Сім розділів рейки W2 — **усі сім мають опору**: `Details` (`edit-your-service-project-details`:
  «then Space settings. Select Details»), `Access` (`manage-how-people-access-your-team-managed-service-space`:
  «select Service space settings, then Access»), `Request management` (десяток сторінок),
  `Channels & self service` (`customize-your-customer-portal…`, `group-request-types…`), `Notifications`
  (`edit-a-customer-notification-in-next-gen`), `Automation` і `Language support`
  (`get-to-know-the-project-settings-sidebar`).
- Forms на Free — **підтвердив відсутність опори з обох боків**: у `what-are-forms` слів `Free`,
  `Standard`, `Premium`, `plan` немає взагалі (0 входжень), у `screens/24-plans-table-jsm.md` рядка про
  форми немає. ⚠ автора чесний.
- Усі написи W1 (`Save changes`, `Display name`, `Display description`, `Customer request form`,
  `Required`, `Use preset value and hide from portal`, `Hide fields below`, `Create a field` і вісім типів
  полів) — кожен знайдений у довідці.

**Не вдалося перевірити (потрібен живий JSM на sandbox — доступу до Chrome у мене немає).** Список автора
(`reports/j19.md` §5) лишається чинним; додаю до нього два пункти, яких там не було:

1. **`Space settings` → `Automation` у службовому спейсі** — чи стоїть на кнопці `Create flow` (єдиний
   знімок цього напису, `screens/13`, знятий у **software**-спейсі; для JSM-спейсу напису ніхто не бачив).
2. **Сторінка налаштувань службового спейсу цілком** — щоб закрити розбіжність доксів: сторінка
   `get-to-know-the-project-settings-sidebar` (жива 2026-09-19) описує бічну панель **іншим набором
   розділів**, ніж той, що в W2: `Details · Features · People and access · Request types · Forms · SLAs ·
   Customer satisfaction · Channels · Knowledge base · Automation · Customer notifications · Language
   support`. Тобто в довідці співіснують дві мови опису — «плоска» (`Request types`, `SLAs`, `Forms`
   окремими розділами) і «згорнута» (`Request management` → `Request types` / `SLAs`, `Channels & self
   service` → `Portal` / `Knowledge Base`, `Notifications` → `Customer notifications`). Урок стоїть на
   другій — так само, як кроки з живих сторінок («select Space settings, then Request management, then
   Request types»). ⚠ у підписі до W2 попереджає лише про порядок; після знімка це місце треба
   переписати одним реченням.
3. Те, що вже було у списку автора: секції/вкладки полів типу запиту, `+New Metric` і діалог
   `Add calendar`, діалог `Create new queue` з набором колонок, бічний список черг, портал очима клієнта,
   сторінка `Customer notifications` на Free, меню `Raise a request` → `Portal groups`.

---

## 7. Знахідки для сусідніх уроків (формат `cross-findings.md`; сам файл не чіпав)

- **j19 → j20:** «In the Activity section, select **Add internal note**… You can also add internal notes
  (the customer cannot see these)» і «if the Public comment edited notification is turned off in space
  settings, customers will not receive an email notification when an internal comment is converted to a
  public comment» (`jira-service-management-cloud/docs/talk-to-the-customer-or-team-members-from-the-new-issue-view/`,
  звірено 2026-09-19) · там само «Viewers … can add internal notes, but they can't communicate with
  customers» і «When a service space is **open**, anyone who logs into your Jira site (not the customer
  portal) can view and add internal notes» (`manage-how-people-access-your-team-managed-service-space`) —
  готова опора для розділу про ролі службового спейсу й `Open access`.
- **j19 → j21, j22 і довідник «JQL…»:** дослівні визначення SLA-функцій живуть **не** на `jql-fields`, а на
  `jira-service-management-cloud/docs/write-jql-queries-for-slas/`: `breached()` — «the last SLA cycle has
  failed to meet its target goal», `everBreached()` — «have failed to meet their target goal», `paused()` —
  «the current SLA cycle is paused due to a particular condition», `remaining()` — «Positive values indicate
  time remaining before breach (e.g. remaining("2h") means 2 hours left). Negative values indicate time
  elapsed since breach (e.g. remaining("-30m") means breached 30 minutes ago)». Для довідника це краще
  джерело, ніж перелік без пояснень на `jql-fields`.
- **j19 → довідник «Карта інтерфейсу, глосарій і ліміти Free», розділ «Що змінилось»:** довідка описує бічну
  панель налаштувань службового спейсу **двома різними наборами розділів** (див. §6, п. 2) — обидві сторінки
  живі 2026-09-19. Разом із уже відомими парами (`Channels and self service` / `Channels & self service`,
  `Time to First Response` / `Time to first response`) це третя розбіжність назв в одному продукті.
- **j19 → j20, j21 (обережність із перевірками):** «You can share the portal URL by selecting **Channels**
  from your service space and copying the portal URL» (`how-do-customers-send-requests-to-your-service-project`)
  — єдине документоване місце, де береться адреса порталу; знадобиться в наскрізному чеклисті j21.
- **j19 → кореневій сесії (дизайн, реєстр заявок):** підтверджую три заявки автора — `win__status` у стані
  `portal`, `win__chips` поза `form`, `win__count` у `win__rail-item`; плюс четверта, яку видно з боку
  читача: у стані `portal` немає рядка списку («ключ + назва + стан»), і `win__tile` у цій ролі читається
  як плитка типу запиту, хоча це рядок заявки.
- **j19 → кореневій сесії (сюжет §3):** назва календаря SLA в уроці записана двома формами — у вікні W2
  «Марципан: Пн–Сб», у кроках 5 і 6 «Марципан». Обидві прийнятні, але якщо §3 фіксуватиме назву, варто
  обрати одну.
