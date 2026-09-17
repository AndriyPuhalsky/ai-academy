# `screens/` — текстові знімки sandbox для авторів і дизайну

Аналог `005-ai-terminal/00-research/screens/*.txt`, але для GUI: не вивід команд, а **структура
екрана словами** — рейка, заголовки, кнопки, поля, дослівні підписи EN. Автор уроку бере звідси
назви елементів для вікон і легенд; дизайн — вміст для станів компонента «вікно».

**Знято 2026-09-17** кореневою сесією в Chrome власника (лише читання, нічого не створювалось).
Стан sandbox на цей день: один спейс `KAN` «Моя команда» (team-managed software, шаблон Kanban),
три роботи `KAN-1` Task 1 · `KAN-2` Task 2 · `KAN-3` Subtask 2.1 (створив власник), один користувач.
**JSM і Confluence на сайті ще немає** — екрани портала, черг, SLA, бази знань зняти не було з чого;
доповнити після того, як власник додасть продукти (admin.atlassian.com → Products → Add product).

| # | Файл | Що це | Для уроків |
|---|---|---|---|
| 01 | `01-home-for-you.md` | домашня «For you» | j03 |
| 02 | `02-spaces-list.md` | список спейсів | j03, j09 |
| 03 | `03-board.md` | дошка (Kanban) | j05, j06, j13 |
| 04 | `04-list.md` | вигляд List | j06 |
| 05 | `05-summary.md` | вигляд Summary | j06, j08 |
| 06 | `06-work-item.md` | картка роботи | j04, j05 |
| 07 | `07-create-dialog.md` | діалог Create (компактний) | j05 |
| 08 | `08-add-view-menu.md` | меню «+» — які вигляди можна додати | j06, j13 |
| 09 | `09-docs-pages-upsell.md` | вкладка Docs без Confluence | j16 |
| 10 | `10-space-settings.md` | налаштування спейсу: рейка, Details, Access, Features, Fields | j09, j11, j20 |
| 11 | `11-work-types-task.md` | тип роботи Task і його поля | j11 |
| 12 | `12-workflow-editor.md` | редактор workflow (team-managed) | j10 |
| 13 | `13-automation-space.md` | автоматизація спейсу — **Flows** | j14 |
| 14 | `14-automation-global.md` | глобальна автоматизація: шаблони, банер білінгу, Usage | j15, довідник 2 і 3 |
| 15 | `15-search-jql.md` | пошук «All work», перемикач Basic/JQL, помилка JQL | j07 |
| 16 | `16-filters-dashboards.md` | сторінки Filters і Dashboards | j07, j08 |
| 17 | `17-personal-settings.md` | особисті: General (мова, тема) і Notifications | j03, j05 |
| 18 | `18-system-settings.md` | System settings → General configuration | j20 |
| 19 | `19-import.md` | Import data into Jira (нова версія) | j21 |
| 20 | `20-marketplace.md` | Marketplace apps | j17 |

**Чого НЕ вдалося зняти й чому:** `/jira/templates` → 404 (шаблони живуть у діалозі Create space);
`/jira/settings/apps/discover` → 404 (Marketplace тепер на `/jira/marketplace/discover`);
`…/boards/1/backlog` → 404 (у шаблоні Kanban вигляду Backlog немає, його додають через «+»);
сторінка людей `/jira/people/search` — домен поза дозволами розширення; JSM, портал, Confluence — продуктів немає.

**Термінологія на екранах 2026-09-17:** *work item* (не issue) скрізь у UI, але в URL і в id полів — `issues`,
`browse/KAN-2`, `customfield_…`; *space* (не project) у UI, `projects` в URL; **правила автоматизації
називаються «flows»** («Create flow», «Browse flows», вкладки Flows · Audit log · Templates · Usage).
Банер у System settings: «As we roll out 'work' as the new term for items tracked in Jira, you may
still see 'issue' in some areas».
