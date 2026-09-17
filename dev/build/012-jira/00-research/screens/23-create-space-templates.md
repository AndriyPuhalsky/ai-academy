# Екран: галерея шаблонів у діалозі «Create space» («Space templates»)

- **Шлях:** кнопка **Create space** (+) у секції Spaces бічної панелі або кнопки **Create space** / **Templates**
  на сторінці `/jira/projects`; відкривається повноекранний діалог (`role="dialog"`) із заголовком **Space templates**.
  Окремої адреси немає (`/jira/templates` → 404, див. README).
- **Знято:** 2026-09-17 (вечір), Jira Cloud Free, UI English, тема Dark, 1440×653, кореневою сесією через Claude in
  Chrome — **лише перегляд:** перемикались категорії, жоден шаблон не відкривався, спейс не створювався, діалог
  закрито Escape. Написи — дослівно з екрана (EN), пояснення українською в дужках.

## Ліва колонка діалогу (зверху донизу)
- ✕ (закрити) · заголовок **Space templates**
- **Made for you** (активний за замовчуванням) · **Custom templates** [бейдж **Enterprise**] · **Import data** ↗
- **CATEGORIES:** Software development · Service management · Work management · Product management · Marketing ·
  Customer service · Human resources · Finance · Design · Personal · Operations · Legal · Sales · Analytics · IT ·
  Facilities · Nonprofit
- **PRODUCTS:** Jira · Jira Service Management · Customer Service Management · Jira Product Discovery

## «Made for you» — підзаголовок «Templates for you based on how similar teams work.» (6 карток)

| Картка | Бейдж | Опис (дослівно) | Продукт |
|---|---|---|---|
| **Kanban** | Last created | Work efficiently and visualize work on a board with to do, doing, and done. | Jira |
| **Product discovery** | Try | Prioritize ideas then connect them from discovery through to delivery. | Jira Product Discovery |
| **Advanced IT service management** | Try (у категорії — **Premium**) | Quickly respond to requests, resolve incidents, and deploy changes. | Jira Service Management |
| **Scrum** | — | Plan, track, and execute work using sprints and a backlog. | Jira |
| **Task tracking** | — | Organize and track team or personal tasks. | Jira |
| **Cross-team planning** | Premium | Align teams on shared goals and timelines. | Jira |

Анатомія картки: схематична ілюстрація (дошка / таймлайн) · назва (`h3`) · бейдж · опис в 1–2 рядки · іконка
продукту + назва продукту. Сітка 3 картки в ряд на 1440 px.

## Категорія «Work management» — 30 шаблонів (business-спейси), усі без бейджів Premium/Try
Blank space — Start with a blank canvas · **Project management** — Plan and deliver business projects. ·
**Task tracking** — Organize and track team or personal tasks. · Process control — Track and improve recurring
workflows. · Sales pipeline — Track deals from lead to closed sale. · Go-to-Market — Plan and launch new products or
services. · UX design — Track design work from concept to delivery. · Document management — Track documents through
review and sign-off. · Campaign management — Run marketing campaigns from idea to launch. · Recruitment tracking —
Track candidates from application to hire. · Budget planning — Plan and align on budget allocations. · Procurement
management — Track purchase requests to fulfillment. · Content management — Plan, create, and deliver content
assets. · Personal task planner — Organize daily tasks and priorities. · Financial close — Manage financial close
tasks efficiently. · Policy management — Track and update policies and procedures. · Marketing asset creation —
Track requests for marketing assets. · Event planning — Plan and coordinate events of any size. · RFP process —
Manage RFP (Request for Procurement) to select the right vendor. · Email marketing campaign — Plan, create, and
send email campaigns. · Sales lead tracking — Manage sales leads through to conversion. · IP infringement — Protect
your organization and employees from IP infringement. · Employee review — Manage employee reviews and feedback. ·
Grant application tracker — Manage grants from submission to award. · Nonprofit management — Track programs driving
social impact. · Community management — Oversee community-focused initiatives. · Space approvals — Track and manage
space sign-offs. · Budget approval management — Track approvals for budget sign-off. · Manage approvals for
documents — Approve policies, contracts, and key docs. · Manage approvals for your campaign — Get your campaign off
the ground by using this template to help track planning, execution, and approv…

(Доступність на Free кліком не перевірялась — бейджів немає в жодної з 30.)

## Категорія «Service management» — 16 шаблонів (JSM; продукту на sandbox ще немає — вибір запустив би його додавання)
Blank space — Start fresh with a blank space and customize how you manage incoming s… · IT service management ·
**Advanced IT service management [Premium]** · **IT Operations [Premium]** · Customer service management — Level up
your service with AI and launch on-brand customer experiences · **General service management** — Create one place to
collect and manage any type of request. · Development requests — Easily sync new feature requests, bugs, and
incidents with your backlo… · **HR service management [Updated]** — Simplify onboarding, off-boarding, and any other
HR request. · **Finance service management** — Easily manage and track budget, spend, and any other finance request. ·
Facilities service management — Easily manage requests for maintenance, moving, and event planning. · Marketing
service management · Analytics service management · Legal service management · Sales service management · Design
service management · IT service management (Essentials)

## Для курсу
- **j03, j05, j09, j12:** у UI 2026 шаблон для особистих/командних задач називається **Task tracking**
  («Organize and track team or personal tasks»), у доксах — «task management template». Рішення про статуси `MY`
  (програма, розділ 3) звірити з фактичним шаблоном **Task tracking** після створення спейсу власником.
  Business-шаблон для проєктів — **Project management** («Plan and deliver business projects»).
- **j13:** Scrum і Kanban — окремі картки «Made for you»; **Cross-team planning** — Premium, не описувати.
- **j18, j19:** для бухгалтерії сюжету — **Finance service management**; універсальний — **General service
  management**; IT-шаблони з бейджем Premium — не для Free.
- **j21:** пункт **Import data** ↗ живе прямо в діалозі шаблонів (веде на «Import data into Jira», `screens/19`).
- **Довідник 3:** повні списки категорій, продуктів і шаблонів — тут; **Custom templates** — Enterprise.
- Назви шаблонів **в уроках не називати** (рішення 2026-09-17, cross-findings j03) — лише довідник 3 з датою.
