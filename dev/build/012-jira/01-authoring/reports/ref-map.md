# Звіт автора — довідник «Карта інтерфейсу, глосарій і ліміти Free» (`jira-ref-map.html`)

**Дата:** 2026-09-30 (вечір, паралельно з рецензентами хвилі 10). **Формат:** контракт §9, адаптовано
завданням `01-authoring/ref-map-author.md`. Правлено рівно два файли: `jira-ref-map.html` і цей звіт.
Git не виконувався.

---

## 1. Файл і будова

| | |
| --- | --- |
| Файл | `/Users/ander1.sage/Downloads/AIA/jira-ref-map.html` (корінь, не `modules/`) |
| Розмір | **229,3 КБ**, 2 813 рядків |
| Секцій `article.ds-prose` | **30** (усі мають пункт у `#refToc`) |
| Таблиць `.ds-tbl` | **36**, разом **330** рядків тіла |
| Блоків `.ds-note` | 22 (з них 13 `--warn`, 1 `--accent`, 1 `--err` — банер конфіга) |
| Вікон `.win` · `term` · Mermaid | **0 · 0 · 0** (за контрактом §10) |
| Слів видимого тексту | ≈ 14 400 |
| Цитат латиницею | **313 входжень, 250 унікальних** — усі звірені посимвольно (див. §9) |

**Секції в порядку сторінки.** `#how` — як користуватись, три позначки джерел («довідка» ·
«екран» · «консоль»), чому в уроках немає чисел, дата перевірки всієї сторінки.
**Карта інтерфейсу (11 екранів):** `#m-top` верхня панель · `#m-side` бічна панель ·
`#m-views` рядок виглядів (діловий спейс і спейс розробки в одній таблиці) · `#m-settings`
налаштування спейсу (дві рейки + сторінка `Details`) · `#m-item` картка роботи (будова + поля
`Details` у двох типах спейсу) · `#m-menus` чотири різні меню `•••` · `#m-personal` особисті
налаштування · `#m-system` налаштування сайту (меню шестірні + розділи `System`) · `#m-admin`
адміністрування Atlassian (двома мовами) · `#templates` галерея шаблонів · `#m-jsm` портал заявок і
Confluence (за документацією).
**Глосарій (92 слова):** `#g-core` (контейнери, поля, вигляди) · `#g-hier` ієрархія й типи ·
`#g-auto` пошук, звіти, автоматизація · `#g-people` люди й доступ · `#g-jsm` служба заявок ·
`#g-traps` вісім слів-пасток.
**Числа безкоштовного плану:** `#l-plan` · `#l-mail` (дві добові межі) · `#l-auto` (дві моделі
обліку + службові межі) · `#l-space` · `#l-data` · `#l-mcp` · `#l-neighbors`.
**Що дає план:** `#no-free` (14 рядків) · `#yes-free` (12 рядків).
**Час і джерела:** `#changed` (11 перейменувань + сезонні релізи) · `#where` (чотири місця, де
звіряти) · `#sources`.

---

## 2. Джерела

### 2.1 Живі сторінки довідки Atlassian — усі прочитані **2026-09-30**

Метод: `curl -sL` → JSON-LD `articleBody` (тіло статті одним рядком) **плюс** `<main>` без
`<nav>`/`<script>`; багатоколонкові таблиці — власний `HTMLParser` по `<tr>/<td>` з розпізнаванням
галочки за `<path d="M9.707 11.293…">`. Усі 40 сторінок збережені в скретчпаді
(`scratchpad/ref-map/pages/`), корпус звірки цитат будувався з **сирого HTML**, а не з тексту.

| URL (`support.atlassian.com/…` або інший) | Що звідси взято |
| --- | --- |
| `jira-cloud-administration/docs/explore-jira-cloud-plans/` | обидві таблиці планів (Jira і JSM) — 10 користувачів, один сайт, 2 ГБ, Community support, `Automation` 150 steps, `Roadmaps` Basic, порожні клітинки Free; JSM: 3 агенти, unlimited customers, 1 250 steps, 100 executions, прочерки |
| `jira-cloud-administration/docs/what-is-the-free-jira-cloud-plan/` | 100 листів-сповіщень на день, «up to 30 days for this limit to be lifted», журнал аудиту, адреса сайту, неактивність, дозволи й ролі, застосунки з обмеженою функціональністю |
| `jira-cloud-administration/docs/permissions-limitations-in-free-jira-sites/` | список «Those using free Jira sites can't:» — три пункти |
| `jira-cloud-administration/docs/allow-dashboards-and-filters-in-your-site-to-be-shared-publicly/` | «Free Jira sites can't be opened to the public» |
| `jira-cloud-administration/docs/archive-a-project/` (заголовок «Archive a space») | «Space archiving is only available on Premium and Enterprise plans» |
| `jira-cloud-administration/docs/move-a-project-to-trash/` | шлях до кошика спейсів |
| `jira-cloud-administration/docs/manage-shared-dashboards/` (заголовок «Manage dashboards») | «Dashboards in the trash can be restored within 60 days» |
| `jira-cloud-administration/docs/import-data-from-a-csv-file/` | 1 500 робіт на файл, ≈ 1 година, оновлення за `Work Item Key` |
| `jira-cloud-administration/docs/export-issues/` (заголовок «Export data from Jira Cloud») | шлях `Backup manager`, 48 годин між копіями, **повний перелік того, що не експортується** |
| `jira-software-cloud/docs/create-edit-and-delete-statuses-in-team-managed-projects/` | 100 статусів на спейс / 50 на процес; «By default, new statuses allow work items in any other status to move into them» |
| `jira-software-cloud/docs/create-edit-and-delete-transitions-in-team-managed-projects/` | 200 переходів |
| `jira-software-cloud/docs/set-up-issue-types-in-team-managed-projects/` | «You can add up to 30 work types» (двічі — для готових і для власних) |
| `jira-software-cloud/docs/customize-an-issues-fields-in-team-managed-projects/` | 50 власних полів |
| `jira-software-cloud/docs/available-custom-fields-for-team-managed-projects/` | 55 варіантів у списку й у полі з галочками, 32 767 знаків у абзаці, поля не діляться між спейсами |
| `jira-software-cloud/docs/what-are-boards/` → `what-is-a-board-in-business-projects/` | «up to 10 different board views in a space» |
| `jira-software-cloud/docs/issue-limits-in-team-managed-projects/` | 5 000 робіт на дошці, у беклозі, у спринтах, на таймлайні |
| `jira-software-cloud/docs/edit-multiple-issues/` | 1 000 робіт у масовій зміні |
| `jira-software-cloud/docs/manage-filters/` | 200 результатів у листі підписки |
| `jira-software-cloud/docs/add-an-attachment-to-an-issue/` | 1 ГБ на файл, 2 ГБ сховища на продукт, 150 вкладень → список |
| `jira-software-cloud/docs/archive-an-issue/` | архів окремої роботи — **без жодного обмеження за планом** (доведено через `articleBody`) |
| `jira-software-cloud/docs/create-edit-and-delete-team-managed-projects/` | ключ спейсу: 10 хвилин, `Previous keys`, «Space names are unique in Jira» |
| `jira-software-cloud/docs/edit-a-projects-details/` | вимоги до ключа, «we automatically save your previous space keys» |
| `jira-software-cloud/docs/create-a-new-project/` | «Jira will remember your template choice…», хто створює спейси |
| `jira-software-cloud/docs/create-a-work-item-and-a-subtask/` | «Up to 3 required fields appear as chips…», повний текст про повну форму |
| `jira-software-cloud/docs/custom-project-templates/` | «Custom space templates are an exclusive Enterprise plan feature» |
| `jira-software-cloud/docs/what-is-the-new-navigation-in-jira/` | «in waves from March 2025 onwards» |
| `jira-software-cloud/docs/what-is-advanced-search-in-jira-cloud/` | «Rovo is available and automatically enabled for all apps on Standard, Premium, and Enterprise plans» |
| `jira-software-cloud/docs/manage-your-jira-personal-settings/` | особисті сповіщення «act like a filter on top of…» |
| `jira-software-cloud/docs/manage-epics-in-team-managed-projects/` | «this work type will be called epic in software spaces» |
| `jira-cloud-administration/docs/configure-the-issue-type-hierarchy/` | «the work type called Epic is associated with the hierarchy level… (level 1)» |
| `jira-software-cloud/docs/categorize-work-items-in-the-list-view/` | «Only one category can be added to a work item» |
| `jira-software-cloud/docs/save-your-filters-in-business-projects/` | фільтр вигляду — свій у кожному спейсі, «only apply one at a time» |
| `jira-software-cloud/docs/jql-fields/` | банер «some JQL entries using the new terms may not work yet…» |
| `cloud-automation/docs/automation-service-limits/` | 100 листів за 24 години; 65 кроків; 999 робіт; `Lookup work items` 100; 50 підзадач; одночасні flows 5/10/20/30; `Loop detection` 10; 60 хв на 12 год; гілка 150 |
| `cloud-automation/docs/how-is-my-usage-calculated/` (заголовок «How is your automation usage calculated») | 150 кроків Jira Free, що таке крок, $0,50 за 1 000, 2026-12-03, 80 % і 100 % |
| `cloud-automation/docs/automatically-clone-an-issue-when-done/` | «Executions of these automations count towards edition usage limits» |
| `confluence-cloud/docs/learn-about-confluence-cloud-plans/` | Confluence Free: 10 місць, 2 ГБ, безліміт просторів, дозволи не налаштовуються |
| `jira-service-management-cloud/docs/about-the-portal-and-help-center/` (заголовок «What is a portal?») | що таке портал і центр допомоги, шлях через `Channels` |
| `jira-service-management-cloud/docs/add-confluence-to-set-up-knowledge-base/` | «at a minimum, you'll need to have a Free plan of Confluence on the same site» |
| `subscriptions-and-billing/docs/manage-users-and-user-tiers/` | одинадцятий користувач, що займає місце |
| `organization-administration/docs/update-a-product-url/` | «up to 15 times» |
| `organization-administration/docs/can-i-change-the-url-used-to-access-a-product/` | «not more than 3 times» |
| `organization-administration/docs/what-are-release-tracks/` | «seasonal release cycles», треки — Premium/Enterprise |
| `organization-administration/docs/view-all-changes-to-an-atlassian-app/` | `Apps → Release management → App updates`, «Atlassian Cloud: All plans» |
| `rovo/docs/rovo-usage-limits/` (заголовок «How Rovo credits work») | кредити лише в платних підписках; 25/70/150 на людину; категорії звернень; verified business domain |
| `atlassian.com/platform/remote-mcp-server` → `…/platform/rovo-mcp` | 500 звернень/год на Free |
| `developer.atlassian.com/platform/marketplace/changelog/` | згортання Cloud Fortified, 31.12.2026 |

**Три статті бази знань** (адреса з `/kb/`, усі три з банером «Platform Notice: Cloud Only», позначки
«generated by AI» немає в жодній): `jira/kb/export-over-10-000-work-items-in-jira-cloud/` (10 000
асинхронно, 1 000 на пакет) · `jira/kb/restore-deleted-work-items-in-jira-cloud-using-local-backup-files/`
(видалену роботу не повертає ніщо) · `jira/kb/how-to-create-and-use-labels-in-jira-cloud/` (мітки без
пробілів). **Четверта, `jira/kb/bulk-archive-issues-in-jira-cloud/`, джерелом НЕ взята** — див. §6.

### 2.2 Знімки sandbox

| Файл | Що звідси взято |
| --- | --- |
| `screens/33-sandbox-free-2026-09-30c.md` | §1 сторінка `Details` і зміна ключа · §2 повна форма `Create` й сторінка типу роботи · §3 крихта картки спейсу розробки · §4 ряд виглядів `HR` з `Reports`, картка `HR-2`, рейка `Work types` · §5 галерея (17 категорій, 4 продукти, **26 плиток** `Work management`, `See details`) · §7 вигляд `Reports` і шість звітів · §8 дашборд і **31 гаджет** · §9 картка застосунку · §10 адмінка українською · §11–§12 власний тип роботи |
| `screens/32-sandbox-free-2026-09-30b.md` | §0 шапка й бічна панель на Free · §2 конструктор flow · §3 журнал і `Usage` спейсу · §5 спринт від початку до завершення · §6 сторінка сповіщень · §7 імпорт (15 плиток) · §8 галерея й `Bundles` · §9 повна картка ділового спейсу (без `Parent`) · §10 `Usage` з двома моделями · §11 `Timeline`, `Calendar`, `More`, `Plans` · §12 архів окремої роботи · §13 вікно за кнопкою `Upgrade`, меню шестірні, адмінка українською · §15–§16 меню `•••` на `All work`, `Add people`, `Configure columns`, масові дії без `Archive` |
| `screens/31-sandbox-free-2026-09-30.md` | §1 екран переходу на Free · §2 таблиця «що змінилось на Free» (шапка, рейки, `Approvals`, `Capacity`, `Archive space` `Premium`) · §3 що тримається (обидва типи спейсу, `Add work type` з `Epic`, `Backup manager`, MCP) · §6 `Access`, `Summary`, `List` · §8 майстер, тост, шаблон `Kanban` з типами, беклог і спринти |
| `screens/30-sandbox-plan-2026-09-30.md` | §1–§2 **таблиця планів у консолі** (`Compare features`): `Atlassian Intelligence (AI)` ✗✗✓, `Automation` «100 rule runs per month», `Project archiving`, `Capacity management`, `User roles and permissions`, `Sandbox`, `Release tracks`, `User limit` Standard «50,000 users» |
| `screens/22-sidebar.md` | склад бічної панелі, куди ведуть чотири нижні пункти (**17 вересня, пробний платний план** — позначено в підписі) |
| `screens/17-personal-settings.md`, `screens/18-system-settings.md` | `General settings`, `Jira labs`, перемикачі `Options` зі значеннями, `Maximum space name size` 80 / `key size` 10 (**17 вересня**, позначено) |
| `screens/27`, `screens/28`, `screens/29` | назви типів роботи ділових шаблонів, прапорець `Allow transitions from any status`, склад меню `•••` (**28–29 вересня**, позначено) |

**Правило F14 виконано:** слова «на безкоштовному плані» стоять **лише** біля фактів із дат
2026-09-30; усе раніше знято підписом «коли на сайті ще діяв пробний платний період». Кожна
таблиця карти має `p.ds-small` із датою й типом джерела.

### 2.3 Рядки `facts-free-plan.md`, використані як вхід

№19 (користувачі, сховище, сайти), 19b, 19c, 18 (адреса, неактивність), 15 (листи), 8 (дозволи),
19 (audit log, apps), 5 (архівація), 13 (автоматизація), 3 (JSM), 9 (Confluence), 14 (MCP), 14b, 7
(bulk), 4 (експорт, `Backup manager`), 6 (імпорт), 10 (дашборди), 12 (типи спейсу), 17 (мова) і
розділ «Зміни, які визначають стабільність» повністю. **Кожне число перечитано наживо 30 вересня**;
розбіжності — §4.

---

## 3. Контрольна таблиця обіцянок уроків (46 з 46)

`ref-promises.md` перечитано **двічі**: на старті (22:00) і після коміта `47c1b41` — файл ідентичний,
46 обіцянок. Кожну обіцянку звірено з **чинним HTML уроку** (зняття тегів + нормалізація пробілів);
вісім із них після хвилі 10 змінили формулювання (наприклад j02: «кроки автоматизації» → «лічильник
автоматизації»), але жодна не зникла і жодна не перестала відсилати до карти.

| # | Урок і місце | Що обіцяно (кінець речення) | Де виконано |
| - | ------------ | --------------------------- | ----------- |
| 1 | j01 #l7 | …точні числа з датою перевірки — у довіднику | `#l-plan` |
| 2 | j02 вступ | …сховище, листи, лічильник автоматизації — усі числа з датою в одному місці | `#l-plan` + `#l-mail` + `#l-auto` |
| 3 | j02 #l3 | …точні числа й дата їх перевірки (функції з вбудованим лічильником) | `#no-free` + `#l-auto` + `#l-data` |
| 4 | j02 #l3 | …усі числа з датою перевірки й посиланням на джерело; або сторінка планів | `#l-plan` + `#where` |
| 5 | j02 #l6 | …числа обох меж листів, **окремими рядками** | `#l-mail` (рівно два рядки таблиці) |
| 6 | j02 #l8 | …точні числа + сторінка планів Atlassian | `#l-plan` + `#where` |
| 7 | j02 квіз П2 | …числа з датою перевірки й посиланням на джерело | `#how` (чому так) + `#l-plan` |
| 8 | j03 #l6 | …решта меж (один сайт, незмінна адреса) | `#l-plan`, рядки «Сайтів» і «Адреса сайту» |
| 9 | j05 #l3 | …кількість листів на добу | `#l-mail` |
| 10 | j05 #l7 | …місце на диску, точне число з датою | `#l-plan` (2 ГБ) + `#l-data` (1 ГБ на файл) |
| 11 | j06 #l7 | …кількість дошок у спейсі | `#l-space` — «up to 10 different board views» |
| 12 | j07 #l3 | …скільки результатів іде в лист підписки | `#l-data` — 200 |
| 13 | j07 #l3 | …кількість робіт в одній масовій зміні | `#l-data` — 1 000 |
| 14 | j07 #l7 | …скільки рядків влазить в один вивантажений файл | `#l-data` — 10 000 асинхронно, 1 000 на пакет |
| 15 | j08 вступ | …точні числа безкоштовного плану | усі сім секцій `#l-*` |
| 16 | j08 #l7 | …строк зберігання дашборда в кошику | `#l-data` — 60 днів (довідка + діалог) |
| 17 | j09 вступ | …числа безкоштовного плану разом із датою перевірки | усі `#l-*` |
| 18 | j10 #l3 | …ліміти на кількість статусів і переходів | `#l-space` — 100 / 50 / 200 |
| 19 | j11 #l7 | …власні поля, варіанти в списку, типи роботи | `#l-space` — 50 / 55 / 30 |
| 20 | j12 вступ | …точний перелік назв шаблонів на дату перевірки | **`#templates`** — 26 плиток `Work management` |
| 21 | j12 #l2 | …кредити Rovo, які довідка рахує окремо від плану Jira | `#l-mcp` — 25/70/150, 10 і «змінні» за звернення |
| 22 | j12 #l7 | …точний строк, скільки спейс лежить у кошику | `#l-data` — 60 днів (цитата діалогу) |
| 23 | j12 #l8 | …точний перелік назв плиток на дату | `#templates` |
| 24 | j12 квіз П3 | …точний перелік назв на дату перевірки | `#templates` |
| 25 | j13 #l4 | …повний перелік назв шаблонів із датою перевірки | `#templates` (+ `Kanban` з його типами) |
| 26 | j14 вступ | …скільки запусків flow на місяць і скільки листів за добу | `#l-auto` + `#l-mail` |
| 27 | j14 #l3 | …числа обох добових меж листів | `#l-mail` |
| 28 | j15 вступ | …ті самі два числа | `#l-auto` + `#l-mail` |
| 29 | j15 #l4 | …число добової межі листів автоматизації | `#l-mail` |
| 30 | j16 вступ | …скільки листів-сповіщень на день і скільки людей вміщує безкоштовний Confluence | `#l-mail` + `#l-neighbors` |
| 31 | j16 #l6 | …ліміт користувачів Confluence | `#l-neighbors` |
| 32 | j16 #l7 | …ліміт користувачів, сховище й логіка доступу Confluence Free | `#l-neighbors` (три рядки) |
| 33 | j17 вступ | …числа безкоштовного плану з датою перевірки | усі `#l-*` |
| 34 | j17 #l7 | …те саме | усі `#l-*` |
| 35 | j18 вступ | …скільки листів, сховища, кроків автоматизації | `#l-mail` + `#l-plan` + `#l-neighbors` |
| 36 | j19 вступ | …числа лімітів безкоштовного плану | усі `#l-*` |
| 37 | j20 #l3 | …ліміт місць Confluence | `#l-neighbors` |
| 38 | j21 вступ | …точні числа про межі безкоштовного плану | усі `#l-*` |
| 39 | j21 #l4 | …скільки автоматизації дає безкоштовний план (повторювані роботи) | `#l-auto` — 100 запусків + окремий абзац про повторювані |
| 40 | j21 #l7 | …розділ «Що змінилось» довідника | **`#changed`** |
| 41 | j22 #l1 | …скільки звернень на годину дозволяє безкоштовний план | `#l-mcp` — 500 |
| 42 | j22 #l8 | …частота звернень обмежена планом — числа в довіднику | `#l-mcp` |
| 43 | j22 квіз П2 | …точні числа лімітів MCP | `#l-mcp` |
| 44 | j23 #l1 | …«скільки листів на день», «скільки запусків автоматизації на місяць» | `#l-mail` + `#l-auto` |
| 45 | j23 #l7 | …розділ «що змінилось» довідника | `#changed` |
| 46 | j23 квіз П2 | …обидва числа листів живуть у довіднику | `#l-mail` |

**Невиконаних обіцянок — 0.** Жодну не довелося «чесно пояснити» замість виконання.

**Що знайшлося при звірці:** обіцянок про **перелік назв шаблонів** чотири (j12 тричі + j13), і в
першій чернетці вони були б порушені — розділу з назвами плиток не було. Через це додано окрему
секцію `#templates`; вона ж закриває обіцянку j13 про шаблон із дошкою потоку.

---

## 4. Числа: що було у фактурі й що стало після живої перевірки

| Число | Коротко цитата | Джерело | Було в `facts-free-plan.md` / стало |
| --- | --- | --- | --- |
| 10 користувачів | «Up to 10 users» | `explore-jira-cloud-plans` | №19 ✅ — **без змін** |
| 11-й користувач | «Adding more users will automatically move you from a Free plan to a Standard plan trial» | `manage-users-and-user-tiers` | №19b ✅ — без змін; додано другу опору з екрана («If you add more than 10 users, you'll be automatically upgraded») |
| 2 ГБ сховища | «2 GB file storage» | `explore-jira-cloud-plans` | №19 ✅; **додано** розгорнуту цитату зі сторінки вкладень («…2 GB per app») |
| один сайт | «One» (рядок `Site limit`) | там само | №19 ✅ — без змін |
| 100 листів-сповіщень/день | «Jira can send a maximum of 100 emails per day on the Free plan» | `what-is-the-free-jira-cloud-plan` | №15 ✅; **додано** «up to 30 days for this limit to be lifted» |
| 100 листів автоматизації/24 год | «100 emails in a 24-hour period. This limit only applies to the Free plan…» | `automation-service-limits` | у фактурі **не було окремим рядком** — додано (те саме число, що в довіднику автоматизації) |
| **100 запусків flow/місяць** | «This month's usage — Shows the number of flow runs available»; `Total limit` 100, `Plan: Free` | екран `Global automation → Usage`, 30.09 + консоль «100 rule runs per month» | 🔴 №13 казав «модель — **кроки**, не runs; Jira Free — 150 steps per subscription». **Стало:** чинна модель рахує **запуски** (100), кроки — модель майбутня. Два числа — дві одиниці, а не суперечність |
| 150 кроків на підписку | «Jira — 150 per subscription» (таблиця «Automation step per month») | `how-is-my-usage-calculated` + сторінка підписки | №13 ✅ як число, але **переатрибутовано** на майбутню модель |
| $0,50 за 1 000 кроків, з 2026-12-03 | «On December 3, 2026, extra usage billing takes effect»; «$0.50 per 1,000 additional steps» | там само | №13 ✅ — без змін |
| 65 · 999 · 100 · 50 · 5/10/20/30 · 10 · 60 хв | службові межі автоматизації | `automation-service-limits` | у фактурі **не було** — додано (ті самі, що в довіднику автоматизації) |
| 100 / 50 статусів | «up to 100 statuses across all of your space's workflows, and up to 50 statuses in any one workflow» | `create-edit-and-delete-statuses…` | **нове число** — закриває обіцянку j10 |
| 200 переходів | «You can add up to 200 transitions to your workflow» | `create-edit-and-delete-transitions…` | **нове** — закриває j10 |
| 30 типів роботи | «You can add up to 30 work types» | `set-up-issue-types…` | згадувалось у `cross-findings` як «число → довідник» — **внесено** |
| 50 власних полів | «You can create up to 50 custom fields in a team-managed space» | `customize-an-issues-fields…` | **нове** — закриває j11 |
| 55 варіантів | «You can add up to 55 options to a dropdown field» | `available-custom-fields…` | **нове** — закриває j11 |
| 32 767 знаків | «You can add up to 32,767 characters into a paragraph field» | там само | **нове** |
| 10 дошок у спейсі | «you can create up to 10 different board views in a space» | `what-is-a-board-in-business-projects` | у `cross-findings` було, у фактурі — ні; **внесено**, закриває j06 |
| 5 000 робіт | «your board, backlog, sprint section, and timeline can each only show up to 5,000 work items» | `issue-limits-in-team-managed-projects` | **нове** |
| 1 000 масової зміни | «You can edit fields in up to 1,000 work items at the same time» | `edit-multiple-issues` | №7 ✅ — без змін |
| 10 000 / 1 000 експорту | «exporting up to 10,000 work items using the asynchronous Export CSV feature»; «Each batch export has a maximum limit of 1,000 work items» | KB `export-over-10-000…` | №4 казав лише «1 000 за пакет» — **уточнено:** 1 000 стосується обхідного шляху, основна межа 10 000 |
| 1 500 на файл імпорту | «Recommended number of work items per file» — «1500 work items» | `import-data-from-a-csv-file` | у фактурі в розділі «Дописано 2026-09-20» — **внесено** |
| 200 у листі підписки | «only the first 200 results of a filter are sent» | `manage-filters` | у `cross-findings` було — **внесено**, закриває j07 |
| 60 днів кошик дашборда | «Dashboards in the trash can be restored within 60 days» | `manage-dashboards` + діалог на екрані | у `cross-findings` було — **внесено**, закриває j08 |
| 60 днів кошик спейсу | «…available in the trash for 60 days after which it will be permanently deleted» | діалог на екрані, 30.09 | **нове** — закриває j12 |
| 1 ГБ на файл | «By default, the maximum size of any one file is 1GB, but your Jira admin can change this limit» | `add-an-attachment-to-an-issue` | ⚠ фактура (хвиля 2) фіксувала суперечність «1 GB проти 10 MB». **Стало:** на цій сторінці сьогодні стоїть 1 ГБ і поруч пояснення про 2 ГБ сховища; згадки 10 MB на ній немає |
| 150 вкладень | «Once a work item has over 150 attachments, they'll display as a list» | там само | **нове** |
| 48 годин між копіями | «you'll need to allow 48 hours between backups» | `export-issues` | **нове** |
| 500 звернень MCP/год | «Free: 500 calls per hour» | `atlassian.com/platform/rovo-mcp` | №14 ✅ — **без змін**; адреса сторінки змінилась (`remote-mcp-server` → `rovo-mcp`) |
| Rovo 25/70/150 | таблиця «per-user, per-month Rovo credit allowance» | `rovo-usage-limits` | №14b мав лише «кредити лише в платних» — **додано числа**; рядка для Free в таблиці немає |
| 10 кредитів за звернення | «10 Rovo credits per billable event» (категорія `Basic`) | там само | **нове** — закриває j12 |
| Confluence 10 / 2 ГБ | «Seats for up to 10 users», «2 GB of file storage» | `learn-about-confluence-cloud-plans` | №9 ✅ — без змін |
| JSM 3 агенти · 1 250 кроків · 100 запусків | «Up to 3 agents»; «1,250 steps per subscription»; «100 executions per month» | `explore-jira-cloud-plans` | №3 ✅ — без змін |
| 26 плиток · 17 категорій · 4 продукти | екран галереї | `screens/33` §5 | **нове** — закриває чотири обіцянки про назви шаблонів |
| 31 гаджет · 6 звітів | екран | `screens/33` §7–§8 | **нове** |
| 80 / 10 знаків назви й ключа спейсу | `Maximum space name size` · `Maximum space key size` | екран `General configuration`, 17.09 | **нове**, з датою й позначкою «пробний платний план» |
| 3 проти 15 разів зміни адреси | «up to 15 times» проти «not more than 3 times» | дві сторінки `organization-administration` | суперечність із `open-claims` §8 — **числа немає**, є опис розбіжності |

---

## 5. Що лишилось без підтвердження (⚠ у тексті) і запити на дозйомку

1. **Портал заявок і Confluence** — живого екрана немає взагалі (рішення власника «поки без JSM і
   Confluence»). Секція `#m-jsm` і всі рядки про Confluence зібрані з документації й **позначені**
   блоком `ds-note--warn` на початку секції. Запит на дозйомку: коли власник дозволить — портал
   очима клієнта (напис у полі пошуку, плитки, `Requests`), сторінка черг, картка заявки очима
   агента, `Channels` (чи є адреса пошти на Free), вкладка `Docs` зі списком сторінок Confluence.
2. **Межі, які ніхто не пробував перевищити:** 101-й статус, 51-ше поле, 56-й варіант, 31-й тип
   роботи, 500 звернень MCP за годину, 5 000 робіт на дошці. Наведені з цитатою довідки; у секції
   `#sources` про це сказано прямо («Частина меж не перевірялась на практиці»).
3. **Число «кастомізація сповіщень до 50 спейсів»** (`facts-free-plan.md` №15) **у карту не
   пішло**: у фактурі в колонці цитати стоїть прочерк, а на живій сторінці
   `manage-your-jira-personal-settings` я цього числа сьогодні не знайшов. Запит: або знайти
   сторінку з цитатою, або прибрати рядок із фактури.
4. **Склад підменю `Export`** на сторінці `All work` — у карті не перелічений (у `#m-menus` стоїть
   `Export` ›, без списку форматів): підменю на Free не відкривали, а назви пунктів розходяться між
   довідкою й екраном 24 вересня. Запит на дозйомку: розкрити `Export` › на Free.
5. **`Notifications` у рейці налаштувань спейсу** — два вкладені пункти (`Settings`,
   `Space email audit`) знято 29 вересня, на пробному платному плані; у таблиці це позначено датою.
   Запит: розгорнути цей пункт на Free.
6. **Англійські назви розділів адмінки Atlassian** (`#m-admin`) — узяті з документації, бо на
   sandbox адмінка була українською. Розбіжності назв тут не виключені. Запит: зняти адмінку з
   мовою акаунта `English` (або попросити власника перемкнути мову на один знімок).
7. **Порядок елементів верхньої панелі** описаний словами («праворуч від `+ Create`», «між
   дзвіночком і шестірнею») — точної геометрії з екрана немає, у знімках зафіксовано лише
   послідовність. Свідомо без категоричних формулювань.
8. **Поле `Time tracking` на картці спейсу розробки** — у жодному знімку картки спейсу розробки
   його не було; у таблиці так і написано («у знімках карток спейсу розробки не було»), а не «немає».
9. **Чи рахує Jira обов'язкові поля на тип чи на спейс** — дослід 30 вересня зроблено на одному типі
   одного спейсу; у таблиці це сказано прямо.

---

## 6. Розбіжності

### 6.1 Довідка ↔ консоль Atlassian (обидві прочитані 30.09)

| Що | Довідка | Консоль `Compare features` |
| --- | --- | --- |
| `User limit` Standard | «Up to 100,000 users» | «50,000 users» |
| Автоматизація на Free | «150 steps per subscription» | «100 rule runs per month» |
| AI на плані Standard | «Rovo is available and automatically enabled for all apps on **Standard**, Premium, and Enterprise plans» | `Atlassian Intelligence (AI)` — Standard **✗** |

Перші дві названі в тексті карти прямо (`#l-plan`, `#l-auto`), третя — у `#no-free` окремим блоком
`ds-note--warn`, **без вибору переможця**. Для безкоштовного плану жодна з трьох нічого не змінює.

### 6.2 Довідка ↔ довідка

- **Адреса сайту: 3 проти 15 разів** (`can-i-change-the-url-used-to-access-a-product` проти
  `update-a-product-url`) — обидві живі. Число в карту **не пішло**, є опис розбіжності.
- **Стаття бази знань суперечить сама собі.** У `jira/kb/bulk-archive-issues-in-jira-cloud/` у
  виносці над текстом стоїть «Archiving issues is only available for Premium and Enterprise
  customers», а **перше речення тіла статті** (`articleBody`) — «In Jira Cloud, it's possible to
  archive single work items, but bulk archiving them is not available». Продуктові сторінки
  (`archive-an-issue`, `what-is-the-free-jira-cloud-plan`) обмеження за планом не мають узагалі
  (доведено через `articleBody`: слів `Premium`/`Enterprise`/`Free` у тілі `archive-an-issue`
  немає), а екран Free з ними збігається. У карті ця виноска подана як **розбіжність**, не як опора.
- **Дві таблиці планів записують «немає» по-різному:** у таблиці Jira клітинка порожня, у таблиці
  JSM — прочерк `-`. Названо в `#l-neighbors`.

### 6.3 Довідка ↔ жива Jira

- **Новий статус і бульбашка `Any`.** Довідка: «By default, new statuses allow work items in any
  other status to move into them». Екран 28.09: прапорець «Allow transitions from any status» стоїть
  **вимкненим**. Названо в `#l-space` блоком `ds-note`.
- **`Summary` / `Title`** — довідка попереду екрана; названо в глосарії й у `#changed`.
- **`space` у запиті** — жива Jira не приймає, хоч докси вже пишуть «space»; названо в `#changed`.
- **Рядок межі названий дією, якої немає** — `Send email action` проти `Send customized email` у
  конструкторі; названо в `#l-mail`.
- **`Pages` / `Docs`** — вкладка зветься `Docs`, адреса закінчується на `/pages`.

### 6.4 🔴 Метод: назви сторінок довідки в курсі взяті зі слагів, а не з живих заголовків

Найдорожча знахідка цієї сторінки, і вона стосується **не лише карти**. Я спершу виписав назви
сторінок так, як вони звучать у слагах і в звітах попередніх хвиль («…in team-managed **projects**»),
а потім звірив із `<title>` кожної живої сторінки — **розійшлось 20 назв із 45**:

| У звітах / чернетці | Живий `<title>` 30.09 |
| --- | --- |
| Create, edit, and delete statuses in team-managed **projects** | Create, edit and delete statuses in team-managed **spaces** (ще й без коми перед «and») |
| Create, edit, and delete transitions in team-managed projects | **Manage work item transitions** in team-managed spaces |
| Set up work types in team-managed projects | Set up work types in team-managed **spaces** |
| Customize **a work item's** fields in team-managed projects | Customize **work item** fields in team-managed spaces |
| Available custom fields for team-managed projects | …for team-managed **spaces** |
| Create, edit, and delete team-managed spaces | **Create and edit** team-managed spaces |
| What is a board in business **projects**? | What is a board in business **spaces**? |
| Work item limits in team-managed projects | …in team-managed **spaces** |
| Manage epics in team-managed projects | …in team-managed **spaces** |
| Manage **shared** dashboards | **Manage dashboards** |
| **Export your Jira Cloud site's data** | **Export data from Jira Cloud** |
| Learn about Confluence Cloud plans | Learn about **the features of** Confluence Cloud plans |
| **Rovo usage limits** | **How Rovo credits work** |
| Update a **product** URL | Update an **app** URL **subdomain** |
| Can I change the URL used to access a **product**? | Can I **update** the URL used to access an **app**? |
| About the portal and help center | **What is a portal?** |
| Add Confluence to set up **a** knowledge base | Add Confluence to set up knowledge base |
| **Automatically clone a work item when it's done** | **Schedule work items to recur using automations** |
| Permissions limitations in **free** Jira sites | Permissions limitations in **Free** Jira sites |
| How is **my** usage calculated? | How is **your automation** usage calculated |

Усі 20 у карті виправлені на живі заголовки. **Наслідок для курсу:** у `#sources` довідників JQL і
автоматизації, у `facts-free-plan.md` і в звітах усіх хвиль назви сторінок писались зі слагів — їх
варто перевірити тим самим способом перед релізом (`<title>` кожної цитованої сторінки). Дешевий
прогін: список цитованих слагів → `curl` → `<title>`.

### 6.5 Дрібне про самі джерела

`learningResourceType` у JSON-LD дорівнює `"Knowledge base article"` **на всіх** сторінках
`support.atlassian.com`, включно з продуктовими доксами. Тому «стаття бази знань» проти
«документація» визначається **за адресою** (`/kb/` у шляху), а не за цією міткою. У карті
використано саме адресу.

---

## 7. Що в контракті §10 виявилось незручним

1. **§10 не має поля «дата всієї сторінки».** Для карти це головна властивість (єдина сторінка, що
   старіє першою), і місця для неї в каркасі немає: `ds-ref__stat` тримає числа, а не дату. Я
   поставив дату окремим блоком `ds-note--warn` у `#how`; варто внести це в §10 як обов'язковий
   елемент довідника, що старіє.
2. **«Перша колонка — ідентифікатор» погано лягає на таблиці карти.** У карті природна перша колонка
   — англійський напис (це й є ідентифікатор), але в таблицях «чого немає» і «межі» перша колонка —
   назва можливості українською, тобто коротка фраза. Я поставив `.ds-tbl--wrap` на **31 із 36**
   таблиць; дизайну варто знати, що ця сторінка — найбільший споживач `--wrap` у курсі.
3. **П'ятиколонкових таблиць §10 не передбачає.** У `#m-views` і `#m-settings` природний формат —
   «напис · що це · діловий · розробки · урок» (5 колонок). Заміряти на 390 px обов'язково: це
   найширші таблиці курсу після JQL.
4. **Немає конвенції для «цитата з екрана» проти «цитата з довідки».** Обидві виглядають як «…» у
   лапках, а вага в них різна. Я ввів три слова-позначки в `#how` («довідка» · «екран» · «консоль»)
   і тримаю їх у підписах `p.ds-small`; якщо це годиться, варто зафіксувати в §10 як конвенцію
   курсу.
5. **Заборона `.win` у довіднику правильна, але для карти болюча.** Карта описує екрани словами, і в
   двох місцях (рядок виглядів, рейка налаштувань) таблиця «діловий / розробки» замінює вікно
   нормально, а в третьому (картка роботи) читачеві довелось би тримати в голові дві колонки полів.
   Виходу в межах §10 немає — лишив таблицю й посилання на урок-дім.
6. **Mermaid не використано свідомо.** Діаграма «сайт → спейс → робота» виглядала доречною, але
   медіана ширини діаграм курсу 862 px при 348 px контейнера на телефоні (задача 011), а карту
   читатимуть саме з телефона поруч із відкритою Jira. Таблиці тут працюють краще.

---

## 8. Знахідки для сусідів

### Для уроків (не правив — не моя зона)

- **ref-map → j11:** урок каже «обмеження є на всі три речі — кількість власних полів у спейсі,
  кількість варіантів у списку й кількість типів роботи», і всі три числа тепер у карті (50 / 55 /
  30). Варто звірити, що урок ніде не називає їх сам.
- **ref-map → j05:** сторінка `add-an-attachment-to-an-issue` сьогодні містить і 1 ГБ на файл, і
  2 ГБ сховища **в одному абзаці**; старої суперечності «1 GB проти 10 MB» на ній більше немає.
  Якщо в j05 стоїть застереження про дві різні цифри — його можна знімати.
- **ref-map → j08:** сторінка про дашборди тепер зветься **«Manage dashboards»** (не «Manage shared
  dashboards»), і в ній є пряма цитата про 60 днів.
- **ref-map → j12, j13:** назви сторінок шаблонів і сама галерея — у карті з датою; уроки можуть
  посилатись на `jira-ref-map.html#templates` замість опису «точний перелік у довіднику».
- **ref-map → j21:** сторінка `App updates` доступна **на всіх планах** («Atlassian Cloud: All
  plans»), платні лише **треки випусків**. Якщо урок каже, що керувати оновленнями на Free не можна,
  формулювання варто уточнити: не можна **вибирати трек**, а дивитись перелік змін — можна.
- **ref-map → j16:** пункт меню шестірні зветься `Notification settings`, сторінка —
  `Emails and notifications`, розділ довідки — третім способом. У карті це названо; в уроці варто
  звірити, що не обіцяно однієї назви.

### Для реєстру `open-claims.md`

- **ref-map → open-claims:** 🔴 **назви сторінок довідки в курсі писались зі слагів** — 20 із 45
  розійшлись із живими `<title>` (§6.4). Це клас «твердження про самі докси»; окремий прохід перед
  релізом по `#sources` трьох довідників і по `facts-free-plan.md`.
- **ref-map → open-claims:** `facts-free-plan.md` №13 (автоматизація) досі описує **лише** модель у
  кроках; чинна модель на Free — запуски flows (100/міс). Рядок варто переписати, бо на нього
  спираються уроки 14, 15 і іспит.
- **ref-map → open-claims:** `facts-free-plan.md` №15 містить число «кастомізація до 50 спейсів» без
  цитати; на живій сторінці сьогодні його немає. Або джерело, або зняти.
- **ref-map → open-claims:** `facts-free-plan.md` №4 «експорт до 1 000 робіт за пакет» — це межа
  **обхідного шляху** з KB, а основна цифра 10 000 (асинхронний `Export CSV`). Рядок уточнити.
- **ref-map → open-claims:** `learningResourceType: "Knowledge base article"` стоїть на всіх
  сторінках `support.atlassian.com` — ознакою «KB чи докси» може бути **лише адреса** (`/kb/`).
- **ref-map → open-claims:** запити на дозйомку з §5 (підменю `Export`, `Notifications ›` на Free,
  адмінка англійською, `Time tracking` на картці спейсу розробки).

### Для дизайну

- Сторінка **не має жодного `.win`, `term` і Mermaid** — лише 36 таблиць `.ds-tbl`, з яких **31**
  мають `.ds-tbl--wrap`. Це найбільша частка `--wrap` у курсі.
- **Дві п'ятиколонкові таблиці** (`#m-views` — 16 рядків, `#m-settings` — 10 рядків) і сім
  чотириколонкових; решта — три колонки з довгим третім стовпчиком (цитати англійською). Заміряти на
  390 px і 1280 px.
- `#refToc` має **30 пунктів у шести групах** — найдовший зміст серед трьох довідників; на вузькому
  екрані це смуга-акордеон на цілий екран.
- Посилання `jira.html`, `jira.html#refs`, `jira.html#map` віддають **404** до появи лендінга — як і
  в двох інших довідниках.

### Для білду

- Новий `<url>` у `sitemap.xml`: `/jira-ref-map` (разом із `/jira-ref-jql` і
  `/jira-ref-automation`).
- У `jira.config.json` `references.items[]` рядок `ref-map` уже є — файл тепер існує.
- Уроки посилаються на карту **назвою**, не посиланням (рішення «називати назвою»); поставити
  `href` на `jira-ref-map.html` у 46 місцях — робота білду.

---

## 9. Вивід перевірок, дослівно

```
$ cd /Users/ander1.sage/Downloads/AIA
$ python3 dev/build/012-jira/01-authoring/check-refs.py --pattern 'jira-ref-map.html'
Перевіряю 1 довідник(и)
════════════════════════════════════════════════════════════════

✓ jira-ref-map.html  (174.6 KB · секцій 30 · таблиць 72 · Mermaid 0 · term 0)

════════════════════════════════════════════════════════════════
Готово. З помилками: 0 із 1.
Факти цей скрипт НЕ перевіряє — лише каркас, механіку й мову.
```

```
$ python3 dev/build/012-jira/01-authoring/check-refs.py
Перевіряю 3 довідник(и)
════════════════════════════════════════════════════════════════

✓ jira-ref-automation.html  (239.4 KB · секцій 23 · таблиць 68 · Mermaid 2 · term 13)

✓ jira-ref-jql.html  (149.1 KB · секцій 29 · таблиць 56 · Mermaid 0 · term 26)

✓ jira-ref-map.html  (174.6 KB · секцій 30 · таблиць 72 · Mermaid 0 · term 0)

════════════════════════════════════════════════════════════════
Готово. З помилками: 0 із 3.
Факти цей скрипт НЕ перевіряє — лише каркас, механіку й мову.
```

(«таблиць 72» у скрипті — це входження `class="ds-tbl`, тобто 36 обгорток плюс 36 таблиць.
Розмір у КБ скрипт міряє довжиною рядка, `ls` показує 229 КБ через багатобайтові символи.)

**Власна звірка цитат** (метод хвиль 4–5, регістрочутливо, з нормалізацією апострофів і лапок;
корпус — сирий HTML 45 збережених сторінок плюс `screens/*.md`):

```
усього латинських цитат: 250 · не підтверджено: 0
```

**Звірка обіцянок** (кожне речення `ref-promises.md` — проти чинного HTML уроку):

```
обіцянок: 46 · усі 46 живі в текстах уроків · невиконаних у довіднику: 0
```

**Механіка додатково:** `U+02BC / U+2019 / U+2018` — **0 входжень**, апостроф лише `'` (U+0027);
заборонених зворотів — 0; `style=` — 0; `<img>/<svg>/<canvas>` — 0; усі 31 внутрішній якір
цілий; усі 29 посилань на файли існують, крім `jira.html` (лендінга ще немає — очікувано).
