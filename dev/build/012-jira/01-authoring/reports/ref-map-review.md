# Рецензія довідника «Карта інтерфейсу, глосарій і ліміти Free» (`jira-ref-map.html`)

**Дата:** 2026-10-01. **Рецензент:** `aia-content-reviewer`. **Правлено рівно два файли:**
`/Users/ander1.sage/Downloads/AIA/jira-ref-map.html` і цей звіт. Git не виконувався.
Робочі файли звірки — `…/scratchpad/ref-map-review/` (51 + 1 сторінка довідки в `pages/`,
скрипти `check.py`, `check3.py`, `check4.py`, `attrib.py`, `tbl.py`).

---

## 1. Вердикт

**Готово з зауваженнями.** Сторінка витримала посимвольну звірку: з **272 фрагментів латинських
цитат не підтвердились рівно два**, і обидва — тому, що Atlassian переписала сторінку через день
після зйомки (розділ 4.1). Атрибуція цитат перевірена окремо: **99 зі 102** цитат лежать саме на тій
сторінці, яку називає довідник, решта три — на сусідній сторінці того самого набору, названої в
`#sources`. Усі числа розділів лімітів і **всі 14 рядків «чого на Free немає»** звірені мною
наживо — з таблицею планів у доксах (розібраною `HTMLParser`-ом по `<tr>/<td>`), з таблицею
консолі (`screens/30` §2) і зі знімками Free (`screens/31`–`33`).

Зауважень чотири класи, усі дрібні за обсягом і один із них дорогий за значенням:
**(1)** ⚠ цитата з бази знань про архів **більше не існує в такому вигляді** — виправив;
**(2)** 🔴 число, яке автор списав як «джерела немає», **насправді стоїть на живій сторінці** —
не правив, бо це додавання факту (розділ 2);
**(3)** три категоричні твердження суперечили власним таблицям довідника («єдиний рядок, що
залежить від плану», «однакові на всіх планах», «другий шлях через `Features`») — виправив;
**(4)** `#sources` не називав шість сторінок, які довідник цитує — дописав.

---

## 2. Твердження без джерела (повідомляю, не правив)

### 2.1 🔴 «Кастомізація сповіщень до 50 спейсів» — джерело **є**, автор його не знайшов

Звіт автора §5 п. 3 і його рядок для `open-claims` кажуть: «число … у карту не пішло: … на живій
сторінці `manage-your-jira-personal-settings` я цього числа сьогодні не знайшов. Запит: або знайти
сторінку з цитатою, або **прибрати рядок із фактури**».

Число на місці. Дослівно, `articleBody` тієї самої сторінки, прочитано 2026-10-01:

> Use the **Customize space notifications** section to set specific notifications for different
> spaces. **You can customize notifications for up to 50 spaces.**

`https://support.atlassian.com/jira-software-cloud/docs/manage-your-jira-personal-settings/`
(живий `<title>` — «Manage your Jira personal settings»).

Чому автор не побачив: речення стоїть у тілі статті, і його губить знімач тексту по `<main>` —
рівно та пастка, що описана в `open-claims` §9 і в `cross-findings` («⛔ два знімачі тексту
гублять частину статті й дають хибний MISS»). Через `JSON-LD articleBody` воно знаходиться одразу.

**Не вставив сам:** це не виправлення хибного факту в тексті, а **додавання нового** — зона автора.
Готовий рядок для `#m-personal`, якщо коренева сесія вирішить вставити:

> `Customize space notifications` | Окремі правила для окремого спейсу — кнопка
> `Add space notifications`. Таких спейсів довідка дозволяє **до 50**: «You can customize
> notifications for up to 50 spaces»

**Для реєстру:** рядок `facts-free-plan.md` №15 **не прибирати** — цитата знайдена.

### 2.2 Англійські назви розділів адмінки Atlassian (`#m-admin`) — сторінки в `#sources` немає

Підпис під таблицею каже: «англійські — з документації Atlassian», але жодна сторінка про адмінку
в `#sources` не названа (автор сам виніс це в §5 п. 6). Джерело я знайшов:
`organization-administration/docs/explore-an-atlassian-organization/`, живий `<title>` — **«Navigate
Atlassian Administration»**; `articleBody` дослівно називає `Overview`, `Directory`, `Apps`,
`Security`, `Data management`, `Insights`, а окремий абзац тієї самої сторінки — «Organization
settings is … the eighth item in the primary navigation in Atlassian Administration».
Українські назви всіх восьми рядків таблиці збігаються зі `screens/33` §10 дослівно — це я звірив.

**У `#sources` не дописав:** дата прочитання в мене — 1 жовтня, а вся сторінка датована
30 вересня; вводити другу дату в блок джерел — рішення кореневої сесії, не моє.

### 2.3 Дрібніше, лишив як є

- **`#m-top`, `Ctrl+K`.** Довідка пише «Ctrl + K (for Windows) to open the command palette» —
  Linux у ній не названий, а довідник пише «`Ctrl+K` (Windows, Linux)». Правдоподібно, але
  джерела саме на Linux немає.
- **`#m-menus`, меню картки роботи.** У `screens/31` §6 і `screens/32` §12 перелік закінчується
  трьома точками («`Print` · `Export Excel` · `Export Word` …»), тобто меню довше. Я дописав
  «та інші», щоб перелік не читався як повний; **повний склад — запит на дозйомку**.
- **`#m-top`, геометрія панелі.** «між дзвіночком і шестірнею», «праворуч від `+ Create`» —
  із порядку слів у `screens/32` §0, а не з виміряного екрана (автор назвав це в §5 п. 7).
  Порядок збігається; сама формулювання неімперативні — лишив.
- **`#l-space`, «Назва спейсу 80 знаків / ключ 10»** — зі знімка 17 вересня, коли сайт був на
  пробному платному плані. У підписі це сказано прямо; на Free не перезнято → дозйомка.

---

## 3. Правки формулювань (рядок · було · стало · чому)

| Рядок | Було | Стало | Чому |
| --- | --- | --- | --- |
| 396 | `Viewed` (що відкривав) | `Viewed` (що відкривав(ла)) | У тому самому рядку вже стоїть парна форма «робив або робила» — читачка не мала випадати з одного рядка на наступний |
| 506 | — | Абзац: «Слово «заглушка» у таблиці нижче означає одне й те саме: вкладка на місці, але всередині не інструмент, а сторінка з пропозицією перейти на платний план» | Перше вживання слова «заглушка» на сторінці — у таблиці `#m-views`, а пояснення лежало аж у `#no-free`. Читач не з ІТ упирався в нього за півсторінки до розгадки |
| 653 | «У спейсі розробки є ще другий шлях — `Space settings` → `Features`» (щоб додати вигляд) | «Розділ `Space settings` → `Features` для цього не потрібен: 30 вересня 2026 року в спейсі розробки в ньому стояли перемикачі `Sprints`, `Estimation` і `Standups in Jira`, а не вигляди» | **Суперечність із власною таблицею** `#m-settings` («перемикачі можливостей спейсу: `Sprints`, `Estimation`») і зі `screens/31` §8 та `screens/29` §12. Вигляд обидва типи спейсу додають кнопкою `+` |
| 839 | «поруч смуга «N% Done»» | «поруч смуга поступу, підписана відсотком зробленого (на роботі без закритих підзадач — «0% Done»)» | `«N% Done»` у лапках читається як дослівна цитата, а `#how` обіцяє: «Дослівна цитата стоїть у лапках». На екранах стоять «0% Done», «50% Done», «100% Done» — напису з літерою N немає |
| 931 | «… `Export Excel` · `Export Word`» | «… `Export Excel` · `Export Word` та інші» | У знімку перелік закінчується трьома точками — подавати його як повний не можна |
| 936 | «У першої колонки пункту `Move column left` не було — тобто перелік залежить від того, де колонка стоїть» | «⚠ Склад цього меню не завжди однаковий: у середній колонці дошки спейсу «Ремонт другої точки» обидва пункти про переміщення були, а в щойно створеному тестовому спейсі — лише `Move column right`» | Жоден знімок не каже, **яку** колонку відкривали в тестовому спейсі (`screens/31` §8 — «Меню `•••` колонки (діловий `TF` і розробки `TFB` — однакове)»). Слово «першої» було висновком, а не спостереженням |
| 775 | «на безкоштовному плані кожен, хто має доступ до Jira, є адміністратором усіх спейсів («If your site **has always been** on a Free plan…»)» | «на сайті, який **завжди** був на безкоштовному плані, кожен … («…» — умова «always» у цьому реченні не випадкова)» | Перефраз казав більше за цитату поруч: умова «has always been» відпадала. Це важливо саме для читача курсу — навчальний сайт курсу пробний платний період проходив |
| 1580 | `space admin`: «На безкоштовному плані ним є кожен, хто має доступ до Jira» | «На сайті, який завжди був на безкоштовному плані, — кожен, хто має доступ до Jira («If your site has always been on a Free plan…»)» | Те саме, у глосарії |
| 1219 | «Перелік станом на 30 вересня 2026 року, **у порядку з екрана**» | «Перелік станом на 30 вересня 2026 року. Спершу — плитки, які трапляються в курсі; далі решта, у порядку з екрана» | Перші шість рядків таблиці **не** в порядку з екрана: на екрані після `Task tracking` іде `Process control`, а `Campaign management` і `Recruitment tracking` стоять дев'ятою й десятою (`screens/33` §5) |
| 1240 | «Екран: … 30 вересня 2026 року, безкоштовний план.» | «… безкоштовний план — назви плиток, описи під ними й склад типів шаблону керування проєктом. Склад типів шаблону `Recruitment tracking` і кількість статусів шаблону обліку задач — зі знімків 17 і 28 вересня 2026 року, коли на сайті ще діяв пробний платний період.» | Правило F14: рядок `Recruitment tracking` («`Role` і `Candidate` без `Task`») знятий 28 вересня (`screens/27` §4), а підпис приписував усю таблицю Free-знімку |
| 1914 | `<h3>`Службові межі, **однакові на всіх планах**`</h3>` | `<h3>`Службові межі самого рушія автоматизації`</h3>` + «майже всі вони однакові на всіх планах. Два рядки з тієї таблиці все-таки залежать від плану — і вона каже про це прямо» | Заголовок суперечив рядку в тій самій таблиці («Free: 5, Standard: 10, Premium: 20, Enterprise: 30») |
| 1931 | «Це **єдиний** рядок тієї таблиці, що залежить від плану» | «Це один із двох рядків тієї таблиці, що залежать від плану; другий — межа на листи автоматизації, розібрана вище» | Хибно: у тій самій таблиці рядок `Send email action` має приписку «This limit only applies to the Free plan for Jira Cloud and Trial licenses» — і сам довідник цитує його в `#l-mail` |
| 2010 | «Дослід зроблено на одному типі роботи одного спейсу, тож чи рахує Jira поля на тип чи на спейс, **курс не розрізнив**» | «Умову довідка формулює через спейс, а не через тип роботи («if your **space** has more than three required fields») — і на це спирається урок 11; сам дослід зроблено на одному типі одного спейсу, тож на екрані різницю між «на тип» і «на спейс» курс не перевіряв» | **Суперечність з уроком 11**, який каже прямо: «довідка рахує обов'язкові поля спейсу, а не кожного типу окремо». Цитата, що це вирішує, вже стояла в тій самій клітинці |
| 2211 | «**рядка** для безкоштовного плану в ній немає» | «**колонки** для безкоштовного плану в ній немає» | У тій таблиці рядки — це продукти (`Jira`, `Confluence`…), а плани — колонки; речення поруч саме каже «має лише три колонки» |
| 2466–2485 | Виноска про архів: дві цитати зі статті бази знань | Живе перше речення статті (1 жовтня) + окремий абзац про те, що 30 вересня обмеження висіло виноскою **над** текстом, а наступного дня Atlassian переписала сторінку | Див. розділ 4.1: обох цитат на сторінці **більше немає** |
| 2738, 2748, 2754 | `#sources`: 33 сторінки довідки, «Дві статті бази знань» | Дописано шість сторінок, які довідник цитує, але не називав: «Manage your Jira personal settings», «Categorize work items in the list view», «Save your filters in business spaces», «JQL fields», «View all changes to an Atlassian app» і третя стаття бази знань «How to create and use labels in JIRA Cloud»; «Дві» → «Три», «Третя стаття» → «Четверта» | Контракт §10 вимагає, щоб `#sources` називав сторінки довідки; шість сторінок цитуються в тексті, але в джерелах їх не було. Усі шість заголовків звірені з живим `<title>` 1 жовтня |

**Заборонених зворотів у фіналі — 0.** (Проміжна версія моєї ж правки внесла одне «просто» —
чекер це зловив, слово прибране.)

---

## 4. Числа й цитати: що звірено наживо

**Метод.** 51 сторінка довідки завантажена `curl -sL` у власну підпапку скретчпада (жодного
спільного файла — пастка «сусід перезаписав корпус» не діяла). Корпус звірки — **сирий HTML** у
трьох варіантах (`теги → нічого`, `теги → пробіл`, без зняття тегів) плюс `screens/*.md` з
нормалізацією markdown-розмітки; апострофи, лапки й тире нормалізовані, порівняння
**регістрочутливе**. Багатоколонкові таблиці планів розібрані власним `HTMLParser`-ом по
`<tr>/<td>` з розпізнаванням галочки.

**Загальний підсумок:**

```
фрагментів латинських цитат у «…»: 272 · не підтверджено: 2 (обидва — розділ 4.1)
перевірок атрибуції «цитата ↔ сторінка»: 102 · збіглось: 99 · розбіжностей по суті: 0
унікальних написів у <code> латиницею: 399 · не знайдено в корпусі: 11 (усі — не написи Jira:
   клавіші, шлях /browse/, обрізані адреси розділів, ім'я власного конфіга)
```

### 4.1 ⚠ Єдина реальна розбіжність: стаття бази знань про архів переписана

| Що | Стан |
| --- | --- |
| «Archiving issues is only available for Premium and Enterprise customers» (виноска над статтею) | **ЗНИКЛО.** У сирому HTML `jira/kb/bulk-archive-issues-in-jira-cloud/` 1 жовтня 2026 року немає ні цього речення, ні компонента виноски (`ComponentCallout` — 0 входжень; для порівняння, у сусідніх KB-статтях `export-over-10-000` і `restore-deleted-work-items` він на місці) |
| «In Jira Cloud, it's possible to archive single work items, but bulk archiving them is not available» (перше речення тіла) | **ПЕРЕПИСАНО.** Тепер `articleBody` починається так: «Archiving work items is available on Premium and Enterprise plans. On Jira Cloud you can archive individual work items natively, but bulk archiving is not currently available in the UI, see the feature request JRACLOUD-85101.» |
| `datePublished` у JSON-LD | **`2026-09-30`** (було `2025-04-02` у першому блоці графа) — тобто сторінку правили рівно на межі 30.09 / 01.10 |

**Суть не змінилась і висновок курсу лишається чинним:** обмеження за планом стоїть тільки в
статті бази знань; продуктові докси (`archive-an-issue`) слів `Premium`/`Enterprise`/`Free` у тілі
не мають взагалі (перевірив), а живий екран Free архівує окрему роботу. Змінилось лише те, що
**обмеження переїхало з виноски в саме речення**, і стаття тепер суперечить сама собі в межах
одного абзацу («available on Premium and Enterprise plans» + «you can archive individual work
items natively»). Текст виноски в довіднику переписаний під це, зі збереженням історії й обох дат.

**Це підтверджує рішення власника тримати всі числа на одній сторінці з датою:** сторінка
прожила один день.

### 4.2 Числа плану — рядок за рядком

| Число | Цитата (коротко) | Джерело | Вердикт |
| --- | --- | --- | --- |
| 10 користувачів | «Up to 10 users» | `explore-jira-cloud-plans`, рядок `User limit` | HIT (таблиця розібрана) |
| 11-й користувач | «Adding more users will automatically move you from a Free plan to a Standard plan trial» | `manage-users-and-user-tiers` | HIT |
| те саме з екрана | «If you add more than 10 users, you'll be automatically upgraded» | `screens/32` §13 | HIT |
| місце займає доступ | «Additional users are automatically counted towards billing even if they don't accept your invite or log in» | `manage-users-and-user-tiers` | HIT |
| один сайт | «One» + «The number of instances that can be licensed under a plan» | `explore-jira-cloud-plans`, `Site limit` | HIT |
| 2 ГБ | «2 GB file storage» · «…a file storage limit of 2 GB per app» | `explore-jira-cloud-plans` · `add-an-attachment-to-an-issue` | HIT |
| підтримка | «Community support» | `explore-jira-cloud-plans`, `Support` | HIT |
| адреса не змінюється | «…you can't update your site's URL after your site is created» | `what-is-the-free-jira-cloud-plan` | HIT |
| неактивність | «Atlassian reserves the right to deactivate Free Jira Cloud sites due to inactivity» | там само | HIT |
| журнал аудиту | «…you won't have access to audit logs…» | там само | HIT |
| дозволи й ролі | «Space permissions, roles, and work-level security aren't customizable in Jira Free» | там само | HIT |
| «Those using free Jira sites can't:» × 3 | «assign space roles…», «configure work item security schemes», «restrict permissions using schemes» | `permissions-limitations-in-free-jira-sites` | HIT |
| публічний доступ | «Free Jira sites can't be opened to the public» | `allow-dashboards-and-filters…` | HIT |
| застосунки | «Some apps might have reduced functionality in Jira Free» | `what-is-the-free-jira-cloud-plan` | HIT |
| Standard 100 000 проти 50 000 | «Up to 100,000 users» проти «50,000 users» | докси проти `screens/30` §2 | HIT обидва — розбіжність названа |
| 100 листів-сповіщень | «Jira can send a maximum of 100 emails per day on the Free plan…» + «…up to 30 days for this limit to be lifted» | `what-is-the-free-jira-cloud-plan` | HIT |
| 100 листів автоматизації | «100 emails in a 24-hour period. This limit only applies to the Free plan…» | `automation-service-limits`, рядок `Send email action` | HIT (рядок видно в розібраній таблиці) |
| 100 запусків flow | «This month's usage — Shows the number of flow runs available» · `Total limit` 100 · `Plan: Free` | `screens/31`, `screens/32` §10 | HIT |
| те саме в консолі | «100 rule runs per month» | `screens/30` §2, рядок `Automation` | HIT |
| 150 кроків | таблиця **«Automation step per month»**, рядок `Jira` → «150 per subscription» | `how-is-my-usage-calculated` | HIT — таблицю розібрав, назва таблиці й значення точні |
| $0,50 / 1 000 · 2026-12-03 · 80 % і 100 % · «Allowances refresh monthly» | усі чотири | там само | HIT |
| 65 · 999 · 100 · 50 · 10 · 60 хв / 12 год · 150 | службові межі | `automation-service-limits` (таблиця розібрана: `Steps per flow` 65, `Work items searched` 999, `Lookup work items action` 100, `New subtasks per action` 50, `Loop detection` 10, `*Daily processing time` 60 min per 12 hrs, гілки 150) | HIT усі |
| одночасні flows 5/10/20/30 | «Free: 5 … only the highest limit will count» | там само | HIT |
| `THROTTLED` | статус у журналі | там само | HIT |
| 100 / 50 статусів | «up to 100 statuses across all of your space's workflows, and up to 50 statuses in any one workflow» | `create-edit-and-delete-statuses…` | HIT |
| 200 переходів | «You can add up to 200 transitions to your workflow» | `create-edit-and-delete-transitions…` (живий `<title>` — «Manage work item transitions in team-managed spaces») | HIT |
| 30 типів роботи | «You can add up to 30 work types» | `set-up-issue-types…` | HIT |
| 50 власних полів | «You can create up to 50 custom fields in a team-managed space» | `customize-an-issues-fields…` | HIT |
| 55 варіантів (двічі) | «…up to 55 options to a dropdown field» · «…to a checkbox field» | `available-custom-fields…` | HIT обидві |
| 32 767 знаків | «You can add up to 32,767 characters into a paragraph field» | там само | HIT |
| 10 дошок | «you can create up to 10 different board views in a space» | `what-is-a-board-in-business-projects` | HIT |
| 5 000 робіт | «…can each only show up to 5,000 work items at a time» | `issue-limits-in-team-managed-projects` | HIT |
| 3 обов'язкові поля | «Up to 3 required fields appear as chips below the description» + «The full form opens automatically…more than three required fields» | `create-a-work-item-and-a-subtask` | HIT |
| 80 / 10 знаків | `Maximum space name size` · `Maximum space key size` | `screens/18` (17.09, пробний платний) | HIT, дата в підписі |
| 1 ГБ на файл | «By default, the maximum size of any one file is 1GB…» | `add-an-attachment-to-an-issue` | HIT; згадки «10 MB» на сторінці справді немає (перевірив) |
| 150 вкладень | «Once a work item has over 150 attachments, they'll display as a list» | там само | HIT |
| 1 000 масової зміни | «You can edit fields in up to 1,000 work items at the same time» | `edit-multiple-issues` | HIT |
| 10 000 / 1 000 експорту | «exporting up to 10,000 work items using the asynchronous Export CSV feature» · «Each batch export has a maximum limit of 1,000 work items» | KB `export-over-10-000…` | HIT обидві |
| 1 500 імпорту + ≈1 год | «Recommended number of work items per file» / «1500 work items» / «Approximately 1 hour» | `import-data-from-a-csv-file` | HIT |
| оновлення за ключем | «…a column that maps to Work Item Key» | там само | HIT |
| 200 у листі підписки | «only the first 200 results of a filter are sent» | `manage-filters` | HIT |
| 60 днів кошик спейсу | «…available in the trash for 60 days…» | діалог, `screens/33` §13 | HIT |
| 60 днів кошик дашборда | «Dashboards in the trash can be restored within 60 days…» + діалог «…permanently deleted…after 60 days» | `manage-shared-dashboards` + `screens/33` §8 | HIT обидві |
| робота без кошика | «…removed from the database and can no longer be accessed or viewed…» | KB `restore-deleted-work-items…` | HIT |
| 48 годин | «…you'll need to allow 48 hours between backups» | `export-issues` (живий `<title>` — «Export data from Jira Cloud») | HIT |
| «Data that can't be exported» × 6 | усі шість пунктів + «Although automation flows aren't automatically exported…» | там само | HIT |
| ключ спейсу: 10 хв, вимоги, `Previous keys` | чотири цитати | `create-edit-and-delete-team-managed-projects` + `edit-a-projects-details` | HIT (дві з чотирьох — на першій із двох сторінок; обидві названі в `#sources`) |
| 3 проти 15 змін адреси | «up to 15 times» проти «not more than 3 times» | `update-a-product-url` проти `can-i-change-the-url…` | HIT обидві — числа в довіднику свідомо немає |
| 500 звернень MCP | «Free: 500 calls per hour» (+ Standard 1000, Premium/Enterprise 1000 + 20/користувача до 10 000) | `atlassian.com/platform/rovo-mcp` | HIT |
| доступ до MCP на всіх планах | «All Atlassian Cloud customers have access to the Atlassian Rovo MCP server…» | там само | HIT |
| Rovo 25 / 70 / 150 | таблиця дозволів: рядок `Jira` → Standard 25 · Premium 70 · Enterprise 150 | `rovo-usage-limits` (живий `<title>` — «How Rovo credits work») | HIT; колонки Free в таблиці справді немає |
| 10 кредитів · «Variable» · «Free» | категорії `Basic` / `Premium` / `Intelligence` / `Teamwork Graph Context` | там само | HIT; **`Create with Rovo` справді названий у категорії `Premium`** — перевірив дослівно |
| verified business domain | «…can't enable Rovo on sites where the organization is registered with a generic email domain…» | там само | HIT |
| Confluence 10 / 2 ГБ / дозволи | «Seats for up to 10 users» · «2 GB of file storage» · «Permissions aren't customizable…» | `learn-about-confluence-cloud-plans` (живий `<title>` — «Learn about the features of Confluence Cloud plans») | HIT усі |
| JSM 3 агенти · unlimited · 2 ГБ · 1 250 кроків · 100 запусків | п'ять рядків таблиці JSM | `explore-jira-cloud-plans`, друга таблиця (розібрана) | HIT усі |
| JSM «що є» / «чого немає» | галочки навпроти `Multi-channel support`, `Customizable workflows and SLA's`, `Custom reports`; прочерк навпроти семи рядків | там само | HIT — перевірив усі десять клітинок |
| база знань потребує Confluence | «…at a minimum, you'll need to have a Free plan of Confluence on the same site» | `add-confluence-to-set-up-knowledge-base` | HIT |
| 26 плиток · 17 категорій · 4 продукти | екран галереї | `screens/33` §5, `screens/32` §13 | HIT; **перелічені 6 + 20 = рівно 26 назв, збіг із екраном повний** |
| 31 гаджет + `All 31 · Jira 30 · Charts 12 · Wallboard 5` | екран | `screens/33` §8 | HIT |
| 6 звітів + `Burnup report` відкривається | екран | `screens/33` §7 | HIT |
| 15 плиток імпорту | екран | `screens/32` §7 | HIT |

### 4.3 «Чого на Free немає» — усі 14 рядків

| Рядок | Опора в довіднику | Що знайшов я |
| --- | --- | --- |
| AI у Jira | консоль `Atlassian Intelligence (AI)` ✗✗✓ + екран переходу + екран Free | ✔ `screens/30` §2 рядок 61 — саме ✗ ✗ ✓; цитата екрана переходу HIT |
| Погодження | консоль `Customizable approvals processes` ✗✗✓ + екран | ✔ `screens/30` §2; заглушка «Add approvals to your workflow… Try with Premium» — `screens/31` §2 |
| `Capacity` | консоль `Capacity management` ✗✗✓ + докси `Capacity planning` | ✔ обидва; у таблиці доксів `Capacity planning` справді порожня для Free і Standard |
| Ролі й доступ | докси + консоль `User roles and permissions` ✗ / Standard ✓ + екран | ✔ усі три; обидві цитати екрана HIT |
| Архів спейсу | докси «Space archiving is only available on Premium and Enterprise plans» + консоль `Project archiving` ✗✗✓ | ✔ обидва |
| Архів робіт гуртом | екран Free | ✔ `screens/32` §15: «Пункту `Archive` серед масових дій немає» |
| Зведене планування | консоль `Advanced planning (Plans)` ✗✗✓ + екран | ✔ обидва |
| Власні шаблони | «Custom space templates are an exclusive Enterprise plan feature» | ✔ `custom-project-templates` |
| Журнал аудиту | докси + таблиця планів, `Audit logs` — Free порожня | ✔ у розібраній таблиці клітинка Free справді **порожня**, Standard ✓ |
| Публічні посилання | «Free Jira sites can't be opened to the public» | ✔ |
| Зміна адреси | «…you can't update your site's URL…» | ✔ |
| Пісочниця й треки | консоль `Sandbox`, `Release tracks` ✗✗✓ | ✔ |
| Гарантія доступності | таблиця планів `Guaranteed Uptime SLA`: Free і Standard порожні, Premium 99.9% | ✔ дослівно так у розібраній таблиці |
| Підтримка | таблиця планів `Support`: «Community support» | ✔ |

Обидві пастки правила «X входить у платні ≠ на Free X немає» витримані: кожен рядок має або
рядок консолі (де стоїть саме ✗ проти Free), або знімок Free від 30 вересня. Дзеркальна пастка теж
закрита — довідник сам пояснює її в блоці «Два висновки, які виглядають надійними й помиляються».

### 4.4 «Що на Free все-таки є» — 12 рядків

Усі дванадцять мають опору в `screens/31`–`33` (перевірив кожен): обидва типи спейсу з позначкою
`Administrators only`, архів окремої роботи з банером «This is an archived work item…», `Backup
manager` → `Create backup for cloud`, беклог і `<ключ> Sprint 1` від `Start sprint` до `Complete
sprint`, конструктор і `Usage`, 31 гаджет, `Reports` + `More reports`, `Import data into Jira` з
15 плитками, редактор процесу, `Add work type` з `Epic` у `MY`, MCP (403 на агентний пошук),
`Create with Rovo` / `Add agent` з помилкою на запит. **Рядок про Rovo сформульований точно:**
діалоги відкриваються, результату немає — це чинна редакція `program.md` п. 22.

---

## 5. Механіка

```
$ cd /Users/ander1.sage/Downloads/AIA
$ python3 dev/build/012-jira/01-authoring/check-refs.py
Перевіряю 3 довідник(и)
════════════════════════════════════════════════════════════════

✓ jira-ref-automation.html  (239.4 KB · секцій 23 · таблиць 68 · Mermaid 2 · term 13)

✓ jira-ref-jql.html  (149.1 KB · секцій 29 · таблиць 56 · Mermaid 0 · term 26)

✓ jira-ref-map.html  (177.9 KB · секцій 30 · таблиць 72 · Mermaid 0 · term 0)

════════════════════════════════════════════════════════════════
Готово. З помилками: 0 із 3.
Факти цей скрипт НЕ перевіряє — лише каркас, механіку й мову.
```

Власна перевірка (скрипт у скретчпаді), на фінальному файлі:

| # | Пункт | Стан |
| - | ----- | ---- |
| 1 | `data-config="jira.config.json"` (свій курс, без `../` — файл у корені) | ✔ |
| 2 | `data-module` — **немає** (довідник поза прогресом), `data-course="jira"` на `<html>` | ✔ |
| 3 | `<meta name="viewport">` без `user-scalable` і `maximum-scale` | ✔ `width=device-width, initial-scale=1.0` |
| 4 | Каркас §10: `ds-skip` · `#configError` · `#refToc` (30 пунктів = 30 секцій, різниця множин порожня) · `ds-ref__head` з `ds-eyebrow`/`ds-h1`/`ds-ref__stat` · `article.ds-prose` · `#how` · `#sources` | ✔ |
| 5 | `.term--enter` / `.term--hero` | ✔ 0 |
| 6 | `term` і `.win` | ✔ 0 і 0 (за контрактом §10) |
| 7 | Mermaid | ✔ свідомо 0 (звіт автора §7 п. 6) |
| 8 | Квіз | ✔ немає (довідник) |
| 9 | Дата або джерело біля кожної таблиці | ✔ 36 таблиць, у кожної підпис `p.ds-small` або дата в тексті секції; дата всієї сторінки — окремим `ds-note--warn` у `#how` |
| 10 | Регістр шляхів — лише нижній | ✔ (`css/`, `js/`, `modules/`, `assets/`) |
| — | `id` унікальні | ✔ 36 із 36 |
| — | Кожне `href="#…"` → існуючий `id` | ✔ 0 битих (перевірив і після своїх правок — я додав одне посилання `#l-mail`) |
| — | Кожен `ds-*` клас є в `css/tokens.css` + `css/components.css` | ✔ 0 відсутніх |
| — | Альфа-модифікатори Tailwind · `style=` · `<img>/<svg>/<canvas>` | ✔ 0 · 0 · 0 |
| — | Апостроф лише U+0027 | ✔ U+2019/U+2018/U+02BC — 0 входжень |
| — | Заборонені звороти | ✔ 0 |
| — | Зовнішні посилання на файли | ✔ 28 із 29 існують; `jira.html` віддає 404 до появи лендінга — як і в двох інших довідників |
| — | Якорі в сусідній довідник | ✔ `jira-ref-automation.html#limits-email` існує |
| — | Числа в `ds-ref__stat` | ✔ перерахував машиною: 11 секцій карти, **92** рядки глосарію, **36** таблиць |

---

## 6. Обіцянки уроків: 46 з 46

Перерахував сам, не за таблицею автора: у видимому тексті 22 уроків і іспиту назва
«Карта інтерфейсу, глосарій і ліміти Free» трапляється **47 разів** (у HTML частина згадок
розірвана переносом рядка, тому голий `grep` дає 41 — рахувати треба після зняття тегів).
`ref-promises.md` називає **46** обіцянок; 47-та згадка — навігаційне посилання в блоці 8 іспиту
`j23`, яке додала коренева сесія 27 вересня, а не речення-обіцянка. Розподіл по уроках збігається з
таблицею §3 звіту автора рядок у рядок (j02 — 6, j07 — 3, j12 — 5, j16 — 3, j21 — 3, j22 — 3, j23 — 3).

**Виконані всі 46.** Вибірково перевірив ті, де обіцяно щось точне й перевірюване:

| Обіцянка | Де виконано | Перевірка |
| --- | --- | --- |
| j02 #l6, j14 #l3, j15 #l4, j16 вступ, j23 квіз П2 — «числа обох меж листів, **окремими рядками**» | `#l-mail` | ✔ у таблиці рівно два рядки тіла |
| j02 #l3 — «функції з вбудованим лічильником», точні числа | `#no-free` + `#l-auto` + `#l-data` | ✔ усі вісім рядків таблиці j02 #l3 (`User limit`, `Storage`, `Site limit`, `Automation`, `Email notifications`, `Site URL`, `Support`, `Inactivity`) мають число або цитату в довіднику |
| j06 #l7 — кількість дошок | `#l-space` | ✔ 10 |
| j07 #l3 — результати в листі підписки / робіт у масовій зміні | `#l-data` | ✔ 200 і 1 000 |
| j07 #l7 — «скільки рядків влазить в один вивантажений файл» | `#l-data` | ✔ 10 000 (+ 1 000 за пакет для обхідного шляху) |
| j08 #l7 — строк зберігання дашборда в кошику | `#l-data` | ✔ 60 днів, довідка + діалог |
| j10 #l3 — статуси й переходи | `#l-space` | ✔ 100 / 50 / 200 |
| j11 #l7 — «власні поля, варіанти в списку, типи роботи» | `#l-space` | ✔ 50 / 55 / 30 — усі три |
| j12 ×3 + j13 #l4 — «точний перелік назв шаблонів» | `#templates` | ✔ 26 назв, збіг з екраном повний; `Kanban` з його типами — окремим рядком |
| j12 #l2 — кредити Rovo | `#l-mcp` | ✔ 25/70/150, 10 за звернення, відсутність колонки Free названа |
| j12 #l7 — строк спейсу в кошику | `#l-data` | ✔ 60 днів (цитата діалогу) |
| j14/j15 вступ — «скільки запусків flow на місяць» | `#l-auto` | ✔ 100 |
| j16 #l6/#l7, j20 #l3 — ліміт місць, сховище й доступи Confluence | `#l-neighbors` | ✔ три рядки |
| j21 #l4 — облік повторюваних робіт | `#l-auto` | ✔ цитата «Executions of these automations count towards edition usage limits» на місці |
| j21 #l7, j23 #l7 — розділ «що змінилось» | `#changed` | ✔ 11 перейменувань + сезонні релізи |
| j22 #l1/#l8/квіз П2 — звернення на годину | `#l-mcp` | ✔ 500 |
| j03 #l6 — «решта меж (один сайт, незмінна адреса)» | `#l-plan` | ✔ обидва рядки |
| j05 #l3/#l7 — листи за добу, місце на диску | `#l-mail`, `#l-plan` + `#l-data` | ✔ |
| j01, j09, j17, j18, j19, j21 вступ, j23 #l1 — «числа з датою перевірки» | усі `#l-*` + `#how` | ✔ |

**Зворотна перевірка:** в уроках немає жодного числа ліміту, крім дозволених 10 і 3 —
прогнав 19 шаблонів (`60 дн`, `100 лист`, `1 000`, `10 000`, `1 500`, `200 `, `32 767`, `5 000`,
`48 год`, `500 звернень`, `2 ГБ`, `25 кред`, `55 `, `50 власн`, `65 `, `999`, `1 250` …) по
видимому тексту 23 сторінок. Єдине попадання — «через 7, 14, 30 або 60 днів» у j06, і це
налаштування колонки дошки, а не межа плану. Отже речення `#how` «В уроках названо рівно два
числа» — правда.

---

## 7. Знахідки для уроків і `→ open-claims`

### Для уроків (не правив — не моя зона)

- **ref-map → j11:** урок каже «довідка рахує обов'язкові поля **спейсу**, а не кожного типу
  окремо, тож три поля в задачах і ще три в підзадачах можуть уже перемкнути команду на повну
  форму», а карта в тому самому місці писала «чи рахує Jira поля на тип чи на спейс, курс не
  розрізнив». Джерело — «if your **space** has more than three required fields»
  (`create-a-work-item-and-a-subtask`): формулювання довідки справді про спейс, а живий дослід
  30 вересня його не розрізняв. **Карту я звів з уроком** (розділ 3, рядок 2010); урок правити не
  треба, але варто знати, що емпіричної опори саме на «на спейс» у курсу немає — лише текст доксів.
- **ref-map → j13:** урок пише, що в консолі «рядок `Capacity management` стоїть із **прочерком** і
  в колонці `Free`, і в колонці `Standard`». У `screens/30` §2 таблиця знята з приміткою «✓ / ✗ —
  як на екрані», і там **✗**, не прочерк. Різниця не косметична: карта окремим блоком учить
  розрізняти **порожню клітинку** (таблиця планів Jira у доксах) і **прочерк `-`** (таблиця JSM),
  тож третій знак у тому самому значенні плутає. Пропозиція: у j13 замінити «прочерк» на «хрестик»
  або на «позначку «недоступно»».
- **ref-map → j06:** урок каже «У спейсах для розробки в налаштуваннях спейсу є розділ `Features`:
  там вигляди вмикають і вимикають перемикачами» (двічі, і ще раз у підсумку). Знімки цього не
  підтверджують: `Features` у `WEB` 30 вересня мав `Planning` — `Sprints`, `Estimation` і
  `More items` — `Standups in Jira` (`screens/31` §8, `screens/29` §12), а вигляди — і `Backlog`, і
  `Reports` — додаються кнопкою `+` → `Views` → `Add to navigation`. Сам j13 це й каже: «на
  сторінці `Features` перемикача `Backlog` немає взагалі». **У карті я цю фразу зняв** (рядок 653);
  у j06 вона лишилась і суперечить j13.
- **ref-map → j05, j11:** обидва уроки описують поріг повної форми так само, як карта тепер
  (три обов'язкові, крім `Summary`; четверте перемикає команду) — розбіжності немає, лишаю як
  підтвердження.

### Для реєстру `open-claims.md`

- **ref-map → open-claims:** 🔴 **`facts-free-plan.md` №15 — «кастомізація сповіщень до 50 спейсів»
  НЕ прибирати.** Цитата жива: «You can customize notifications for up to 50 spaces»
  (`jira-software-cloud/docs/manage-your-jira-personal-settings/`, `articleBody`, прочитано
  2026-10-01). Запит автора «або знайти сторінку з цитатою, або прибрати рядок» закривається
  першим варіантом. Число в довідник **не внесене** — готовий рядок для `#m-personal` є в розділі
  2.1 цього звіту.
- **ref-map → open-claims:** 🔴 **стаття бази знань `jira/kb/bulk-archive-issues-in-jira-cloud/`
  переписана 30.09 / 01.10** — обох цитат, на яких стояла атрибуція архіву (і в `program.md`
  «Уточнення» п. 22, і в `cross-findings` «Рецензія хвиль 8 / 8б / 9»), на сторінці більше немає.
  Нове перше речення: «Archiving work items is available on Premium and Enterprise plans. On Jira
  Cloud you can archive individual work items natively, but bulk archiving is not currently
  available in the UI». Виноски (`ComponentCallout`) на сторінці немає взагалі. Формула курсу
  («стаття бази знань розходиться з екраном і продуктовою довідкою») лишається чинною, але
  **формулювання «виноска над статтею» у каноні треба оновити** — інакше наступний рецензент
  шукатиме виноску, якої вже нема. У самій карті я це вже переписав.
- **ref-map → open-claims:** назва сторінки MCP. `#sources` називає її адресою
  (`atlassian.com/platform/rovo-mcp`); живий `<title>` — **«Extend Atlassian into any AI assistant
  using MCP»**. Це не докси `support.atlassian.com`, тому правило «назва сторінки» до неї
  формально не застосовне, але для проходу «назви зі слагів» перед релізом варто мати цю назву
  записаною.
- **ref-map → open-claims:** джерело англійських назв розділів `admin.atlassian.com` знайдене —
  «Navigate Atlassian Administration»
  (`organization-administration/docs/explore-an-atlassian-organization/`, прочитано 2026-10-01):
  `articleBody` дослівно називає `Overview`, `Directory`, `Apps`, `Security`, `Data management`,
  `Insights`, а `Organization settings` — «the eighth item in the primary navigation». У `#sources`
  не дописав через другу дату (розділ 2.2) — рішення кореневої сесії.
- **ref-map → open-claims:** метод, який варто забрати далі. **Знімач тексту по `<main>` дає
  хибний MISS утретє** (цього разу — число 50 спейсів). Робочий метод для
  `support.atlassian.com`: `curl -sL` → `<script type="application/ld+json">` → `articleBody`
  (тіло статті одним рядком, без нав-меню й без втрат), плюс сирий HTML як другий корпус.
  Наявність або відсутність синьої виноски визначає `grep ComponentCallout` по сирому HTML —
  на цьому й спіймано, що виноска зникла.
- **ref-map → open-claims:** запити на дозйомку, які лишились відкритими після цієї рецензії:
  (а) повний склад меню `•••` картки роботи — у знімках перелік обірваний трьома точками;
  (б) меню `•••` **першої** й **останньої** колонки дошки в одному спейсі (щоб закрити, від чого
  залежить `Move column left`); (в) `Maximum space name size` / `key size` на Free (зараз — знімок
  17 вересня з пробного платного плану); (г) склад підменю `Export` на `All work` і два вкладені
  пункти `Notifications ›` у рейці ділового спейсу на Free (запити автора §5 п. 4–5 — лишаються);
  (д) адмінка Atlassian з мовою акаунта `English`.

### Для дизайну

- Нічого нового до заявок автора не додаю: сторінка й далі без `.win`, `term` і Mermaid; таблиць
  36, із них 31 з `.ds-tbl--wrap`; дві п'ятиколонкові (`#m-views` — 16 рядків тіла, `#m-settings` —
  10) і `#refToc` на 30 пунктів у шести групах. Мої правки додали тексту в чотири клітинки
  (`#m-menus` колонка дошки, `#m-item` `Subtasks`, `#l-space` обов'язкові поля, `#g-people`
  `space admin`) — це найдовші клітинки в своїх таблицях, їх і заміряти на 390 px першими.

---

## 8. Що перевірити не вдалося

1. **Портал заявок і Confluence** — живого екрана немає й не буде до рішення власника; уся секція
   `#m-jsm` і глосарій `#g-jsm` зібрані з документації. Цитати обох сторінок JSM я звірив
   (HIT), самі екрани — ні. Позначка в тексті на місці й сформульована чесно.
2. **Межі, яких ніхто не перевищував** — 101-й статус, 51-ше поле, 56-й варіант, 31-й тип, 5 000
   робіт на дошці, 500 звернень MCP за годину. Є цитата довідки, немає екрана. `#sources` каже це
   прямо.
3. **Геометрія верхньої панелі** — перевірив лише порядок елементів (`screens/32` §0), не
   розташування в точках.
4. **Що саме ховається під `More` при різних ширинах вікна** — знімків два (широке й вузьке), обидва
   названі; проміжних ширин не перевіряв.
5. **Візуальна перевірка на 390 px і 1280 px** — не робив: у мене немає браузера, і це зона QA
   після дизайну.
