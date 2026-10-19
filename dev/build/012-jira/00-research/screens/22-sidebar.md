# Екран: ліва бічна панель (sidebar) повністю

- **Шлях:** є на кожній сторінці Jira; знято на `/jira/for-you?tab=workedon` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17 (вечір), Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark, вʼюпорт 1440×653. Знято кореневою сесією через Claude in Chrome
  (тільки читання: панель розгорнуто першою кнопкою верхньої панелі, пункти прочитано з DOM
  `#jira-page-layout-side-nav`). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Стан панелі:** відкривалась **згорнутою** (у шапці лише іконки); розгортає перша кнопка верхньої панелі
  (ліворуч від app switcher). Розгорнута — **320 px**, знизу повзунок **Resize panel** (у DOM — `range` зі
  значенням 320). Для клавіатури є три skip-лінки: **Top Bar** · **Sidebar** · **Main Content**.
- **Геометрія (для дизайну вікна `list`/`board`):** крок пунктів **32 px** (y = 60, 92, 124 …), відступ тексту
  12 px; вкладені пункти секції Spaces — відступ 24 px; перед **Assets** роздільник (крок 44 px); підзаголовки
  секції (**Recent**, **Recommended**) — `<h2>` дрібним капсом.

## Пункти зверху донизу (у порядку на екрані)

| # | Пункт | Тип | Куди веде / що робить | Кнопки праворуч (на ховері) |
|---|---|---|---|---|
| 1 | **For you** | лінк, підсвічений (`aria-current="page"`) | `/jira/for-you` — домашня | — |
| 2 | **Recent** | розгортка › (`aria-expanded="false"`) | недавно відкрите | — |
| 3 | **Starred** | розгортка › | обране (зірочка) | — |
| 4 | **Apps** | розгортка › | застосунки (Marketplace) | **More actions for Apps** ⋯ |
| 5 | **Plans** | розгортка › | плани (кліком не перевірялось; за таблицею планів Roadmaps на Free — Basic, Advanced — Premium+) | **Create plan** + · **More actions for Plans** ⋯ |
| 6 | **Spaces** | розгортка, відкрита (`aria-expanded="true"`) | секція спейсів | **Create space** + · **More actions for spaces** ⋯ |
| 6а | ↳ підзаголовок **Recent** → **Моя команда** | лінк з іконкою спейсу | `/jira/software/projects/KAN/boards/1` (одразу дошка) | **More actions for Моя команда** ⋯ |
| 6б | ↳ **More spaces** | розгортка › | повний список (`/jira/projects`) | — |
| 6в | ↳ підзаголовок **Recommended** → **Create a roadmap** | кнопка з бейджем **Try** | апсел Jira Product Discovery | **More actions** ⋯ → **Hide from sidebar** |
| 7 | **Filters** | розгортка › | збережені фільтри | — |
| 8 | **Dashboards** | розгортка › | дашборди | **Create dashboard** + |
| 9 | **Assets** ↗ | лінк «(opens new window)» | `/jira/assets` (за таблицею планів Assets — Premium/Enterprise; на Free пункт **видно**, кліком не перевірявся) | — |
| 10 | **Teams** ↗ | лінк «(opens new window)» | `home.atlassian.com/o/<org-id>/people/?cloudId=…` — Atlassian Home, не Jira | ⋯ **Teams** |
| 11 | **Goals** ↗ | лінк «(opens new window)» | `home.atlassian.com/o/<org-id>/goals?cloudId=…` | — |
| 12 | **Projects** ↗ | лінк «(opens new window)» | `home.atlassian.com/o/<org-id>/projects?cloudId=…` — «Atlassian Projects» (не Jira-спейси!) | — |
| 13 | **Customize sidebar** | кнопка внизу | сховати / показати пункти | — |

## Для курсу
- **j03** — екскурсія по панелі: чотири пункти внизу (Assets · Teams · Goals · Projects) ведуть **за межі Jira**
  (стрілка ↗, «opens new window»); **Projects** тут — не спейси, а Atlassian Home Projects — пастка для новачка,
  бо слово «project» щойно означало спейс.
- **j07** Filters · **j08** Dashboards (+ Create dashboard) · **j09** Spaces (+ Create space, More spaces) ·
  **j17** Apps · **довідник 3** — карта інтерфейсу: цей список і є «ліва рейка» повністю.
- **Апсели на Free, видимі в панелі:** Create a roadmap (**Try**), Plans, Assets — не описувати як функції Free.
- Business-спейсу в панелі поки немає (на sandbox один software-спейс) — знімок `21-business-space.md` після
  створення спейсу власником.
