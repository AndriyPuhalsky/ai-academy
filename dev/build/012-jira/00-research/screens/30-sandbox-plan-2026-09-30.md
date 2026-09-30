# 30 · Sandbox: план сайту й шлях додавання JSM — 2026-09-30

Знято кореневою сесією в підключеному Chrome власника (той самий браузер і акаунт, що у `screens/26`–`29`). Лише
перегляд: жодної кнопки, що змінює план, додає продукт чи приймає угоду, не натиснуто. Адреса сайту замінена на `<site>`,
ідентифікатори підписки й організації не записані.

## 🔴 1. Навчальний сайт увесь час був на пробному плані Premium, а не на Free

`admin.atlassian.com` → **Додатки → Додатки Atlassian** (інтерфейс адмінки — українською):

| Додаток | План | Користувачі |
| --- | --- | --- |
| Assets | Free | — |
| Goals | Free | 1 |
| Jira Administration | — | — |
| **Jira** | **Premium** | 1 |
| Projects | Free | 1 |
| Studio | Free | — |

Confluence і Jira Service Management у списку **немає** (шість додатків із шести).

**Виставлення рахунків (попередній перегляд)** → рядок `Jira` → `Керувати` → сторінка підписки (англійською):

- банер **«Payment details needed** — We'll need a payment method before 17 жовт. 2026 р. for an upcoming bill, otherwise
  your subscription will be deactivated. You'll need billing admin permissions to do this.» · `Add payment method`;
- `Plan` — **Premium** `FREE 30-DAY TRIAL` · Monthly;
- `Trial ends` — **17 жовт. 2026 р.** · «You'll be charged on this date»;
- `Next bill estimate` — USD 18.30;
- `Quantity` — 1 user;
- `Usage Contribution` — Indexed Objects 250 objects · Rovo credits 70 credits · Assets objects 1 000 objects · Automation
  steps 750 steps;
- `Payment info` — `Add payment` · No · None (**способу оплати немає**).

Пробний період на 30 днів, що закінчується 17 жовтня, почався **17 вересня 2026 року** — у день створення сайту. Тобто
кожен знімок `screens/01`–`29` і кожен запит через MCP зроблено на сайті з можливостями **Premium**. У шапці Jira при
цьому стоїть кнопка `See plans`, а не позначка пробного плану — тому ніхто цього не помітив.

## 2. Сторінка `Change plan` — таблиця планів у самій консолі (нічого не вибрано)

Шапка: «Jira · `<site>` · Current users: 1 · **Choose the right plan for you**» · `How many people?` [1] · `BILLING CYCLE`:
Monthly / Annual.

| | Free | Standard | Premium |
| --- | --- | --- | --- |
| Підпис | «For individuals or teams learning the Jira basics» | «For small & growing teams needing better control and automation» | `CURRENT TRIAL` · «For alignment & planning across teams and AI-powered productivity» |
| Ціна | $0 | $9.05 per user/month | «18 days left in trial · then $18.30 user/month» |
| Кнопки | `Select Free` | `Select Standard` | `Add payment` · `Skip trial buy now` |

«Looking for Enterprise? Unlock advanced security, compliance, scale, and support for your teams with Enterprise plans.»
`Contact sales for pricing`.

**`Compare features`** (✓ / ✗ — як на екрані):

| Рядок | Free | Standard | Premium |
| --- | --- | --- | --- |
| *Site essentials* | | | |
| User limit | 10 users | 50,000 users | 50,000 users |
| Storage | 2 GB | 250 GB | Unlimited |
| Support | Support from Atlassian Community | 9/5 regional support | 24/7 support for critical issues |
| *Advanced features* | | | |
| **Atlassian Intelligence (AI)** | ✗ | ✗ | ✓ |
| Automation | 100 rule runs per month | 1,700 rule runs per month | Per user automation limits (1000 per user per month) |
| **Advanced planning (Plans)** | ✗ | ✗ | ✓ |
| Dependency management | Single project | Single project | Cross-project |
| **Capacity management** | ✗ | ✗ | ✓ |
| **Customizable approvals processes** | ✗ | ✗ | ✓ |
| **Expandable work hierarchy** | ✗ | ✗ | ✓ |
| **Project archiving** | ✗ | ✗ | ✓ |
| *Admin controls* | | | |
| User roles and permissions | ✗ | ✓ | ✓ |
| Admin insights | ✗ | ✗ | ✓ |
| Sandbox | ✗ | ✗ | ✓ |
| Release tracks | ✗ | ✗ | ✓ |
| Domain verification and account capture | ✓ | ✓ | ✓ |
| Session duration management (desktop) | ✓ | ✓ | ✓ |
| *Security and compliance* (початок розділу не знято) | | | |
| IP allowlisting | ✗ | ✗ | ✓ |
| Guaranteed uptime SLA | ✗ | ✗ | 99.9% |
| Business continuity and disaster recovery | ✓ | ✓ | ✓ |
| Encryption in transit and at rest | ✓ | ✓ | ✓ |
| MDM (Mobile Device Management) | ✓ | ✓ | ✓ |
| Password policies | ✓ | ✓ | ✓ |
| *Core features* | | | |
| Goals, projects, and communication (beta) | ✓ | ✓ | ✓ |
| Employee directory for people and teams | ✓ | ✓ | ✓ |
| Unlimited projects, tasks, and forms | ✓ | ✓ | ✓ |
| Customizable workflows | ✓ | ✓ | ✓ |
| Backlog, list, timeline, calendar, and summary views | ✓ | ✓ | ✓ |
| Scrum and Kanban boards | ✓ | ✓ | ✓ |
| Reports and team insights | ✓ | ✓ | ✓ |
| Dashboards | ✓ | ✓ | ✓ |
| Apps and integrations | ✓ | ✓ | ✓ |
| iOS and Android apps | ✓ | ✓ | ✓ |

(Після `iOS and Android apps` на сторінці є ще розділ — не знято.)

## 3. Що з цього під сумнівом у курсі (кандидати — перевіряти на сайті після переходу на Free)

Усе, що курс назвав «наживо на безкоштовному плані», бачили на Premium. Рядки таблиці вище прямо називають, що з
побаченого на Free **не входить**:

| Ознака, яку бачили на sandbox | Рядок таблиці планів | Де в курсі |
| --- | --- | --- |
| `Ask AI`, `Fix error`, `Improve Task`, `Add agent`, `Create with Rovo`, `Use Rovo` у конструкторі flow — «працюють на Free» (`screens/26`, `screens/29` §1) | Atlassian Intelligence (AI) — Free ✗ | j03, j05, j07, j10, j12, j13, j14, j15, j16, j18, j22, j23, обидва довідники — **теза «AI-кнопки на Free — лише апсел» 2026-09-24 знята на підставі Premium-сайту** |
| Вкладка `Capacity` у `MY` і `MARK` (`screens/29` §2) | Capacity management — Free ✗ | j02, j06, j13, j21 |
| `Approvals` у рейці `Space settings` і в рядку виглядів ділового спейсу (`screens/28` §7.1) | Customizable approvals processes — Free ✗ | j06, j09, j10, j11, j15, j20, довідник JQL; канон «дві рейки» п. 21 |
| `Plans` у бічній панелі; `Create a plan with this space` | Advanced planning (Plans) — Free ✗ | у текстах уроків не згадано |
| `Archive space` у меню `•••`; `Archived work items` під `More` | Project archiving — Free ✗ | j02, j05, j06, j09, j16, j20, j21, j23, довідник JQL |
| Діалог `Add work type` пропонує `Epic` у `MY`; рівні ієрархії | Expandable work hierarchy — Free ✗ (стосується рівнів **над** епіком; сам `Epic` — базовий) | j11, j12, j21 — перевірити на Free, не узагальнювати |
| `Usage` в автоматизації: «Automation step usage», ліміти | Automation — Free: 100 rule runs per month | j14, j15, j23, довідник автоматизації |
| `Company-managed` доступний («Administrators only»), `Backup manager` (`screens/26`) | у таблиці рядка немає | j02, j03, j09, j20 — перевірити на Free |
| MCP: агентний пошук → 403 «на Free», `Reporter` тощо (`screens/28`) | — | j22 — формулювання «на безкоштовному плані» без опори |

Від плану, найімовірніше, **не залежать** (механіка інтерфейсу): майстер створення спейсу, ряди базових вкладок (`Summary ·
Board · List · Calendar · Timeline · Forms`), картка роботи, конструктор flow і його панелі, гілки, розумні значення, JQL,
`Backlog` через `+`, спринти. Але це теж «найімовірніше» — після переходу на Free пройти контрольний список.

## 4. Шлях додавання Jira Service Management зсередини Jira (зупинено на екрані згоди)

- Перемикач застосунків (іконка з чотирьох квадратів у шапці; підказка «Switch sites or apps»): `Home` · `Jira` · `Assets` ·
  `Goals` · `Projects` · `Teams` · `Administration` | **`Recommended for your team`**: «1 collection, 4 tools» `New` — «Run
  your whole project seamlessly» (Teamwork Collection) · **«Work requests** — Create one place to manage requests» (Jira
  Service Management) · «Product roadmap — Align everyone with custom roadmaps» (Jira Product Discovery) · `More Atlassian
  apps` · `Manage list`. **Confluence у перемикачі немає.**
- Клік «Work requests» → вікно **Jira Service Management**: «See the whole picture, from request to resolution» · «Gather
  requests from email, chat, or a portal» · «View, triage, and resolve them in one place» · «Easily move work to Software
  teams when it's ready» · блок **`Service Collection`** — «**30-days Premium trial includes:**» три іконки (підказки: «Jira
  Service Management brings teams…», «Customer Service Management deli…», «Rovo agents enhance support,…») · «By selecting
  “Next” you agree to the Atlassian Customer Agreement and Privacy Policy.» · `Cancel` · `Next`.
  **Закрито `Cancel`** — це пробний Premium і згода з угодою; обидва — рішення власника.
- `More Atlassian apps` → оверлей **Atlassian App store**: «Recommended for your team — Get up and running quickly with
  templates that suit the way your team works.» · три картки з кнопкою `Try template`: «Customer service management — Help
  your customers easily raise requests, report problems, and get support.» · «Finance service management — Easily manage
  and track budget, spend, and any other finance request.» · «General service management — Create one place to collect and
  manage any type of request.» (усі — Jira Service Management). Confluence тут теж немає. Закрито `×`.
- Адмінка → Додатки Atlassian: кнопка `Додати додаток` і банер «Зробіть свою роботу помітнішою за допомогою Jira та Jira
  Service Management» · `Спробувати зараз` · `Докладніше` — **не натискали**.

## 5. Дрібніше з адмінки

- Ліва рейка адмінки: Огляд · Каталог · Додатки (Додатки Atlassian · Налаштування доступу до… · Запити користувачів ·
  URL-адреси додатків · Число користувачів · Ізольовані тестові середовища · Платформні функції › Керування випусками ·
  Тіньове ІТ-середовище · Сайти) · Rovo · Конектори · Безпека · Керування даними · Аналітика · Виставлення рахунків ·
  Параметри організації.
- «Огляд»: плитка **«Застосування кредитів на Rovo» — 6 · used in the last 7 days** (стрибок 29 вересня). Тобто кредити Rovo
  на сайті витрачались — автоматизація при цьому показувала «0 credits» (`screens/29` §9).
- Білінг: `Automation steps`, `Rovo credits`, `Assets objects` — «Included Usage», USD 0.00; `Teams`, `Rovo`, `studio`,
  `Assets`, `Projects`, `Goals` — Free.

## 6. Слід у sandbox на цю мить

`TST` «Тест дозйомки» — **у кошику Jira** (рішення власника 2026-09-30; діалог «Move to trash? — The space along with its
work items, Jira components, attachments, and versions will be available in the trash for 60 days after which it will be
permanently deleted. Only Jira admins can restore the space from the trash.» · `Cancel` · `Move`; тост «Space successfully
moved to trash» · `Go to trash` · `Restore`). Меню `•••` біля назви ділового спейсу наживо: `Add to starred` · `Add people` ·
`Save as template` [Enterprise] · `Create a plan with this space` [Try] · `Set space background` › · `Space settings` |
`Archive space` · `Delete space` | «Business space · Team-managed». Решта — `screens/29` §14 і §15.
