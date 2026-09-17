# Знахідки авторів для сусідніх уроків (012)

Коренева сесія дописує сюди пункт 8 зі звітів авторів (`reports/jNN.md`). Автор читає цей файл
**до** написання свого уроку, щоб не шукати вдруге вже знайдене й не переказувати чужу тему.
Формат запису: `- **jNN → jMM:** факт · джерело (URL/дата або screens/NN) · що з ним робити`.

## Від кореневої сесії (2026-09-17, до старту авторів)

- **усі → j03, j07, j10:** статуси спейсу народжуються мовою акаунта на момент створення
  (sandbox: «К выполнению / В работе / Готово»); JQL `status = Done` тоді не знаходить нічого ·
  `screens/03`, `15` · у вікнах показувати англійські To Do / In Progress / Done, у граблях —
  цю пастку.
- **усі → j14, j15, довідник 2:** у UI 2026 правила автоматизації називаються **flows**
  (Create flow, Browse flows, вкладки Flows · Audit log · Templates · Usage); докси кажуть «rule» ·
  `screens/13`, `14` · термін «flow (automation rule)».
- **усі → j02, j22:** кнопки Ask AI, Improve Task, Add agent, See plans видно на Free як апсел ·
  `screens/04`, `06`, `12`; `facts-free-plan.md` №14b · не описувати як функції.
- **j06, j13:** у шаблоні Kanban немає Backlog/Calendar/Timeline за замовчуванням — додаються
  через «+» («Add to navigation»: Archived work items · Backlog · Calendar · Capacity · Code ·
  Deployments · Forms · Goals · List …) · `screens/08`.
- **j21:** сторінка імпорту — «Import data into Jira», плитки Asana · monday · ClickUp · Trello ·
  Azure DevOps · GitHub · GitLab · Smartsheet · YouTrack · Notion · Linear · Wrike · Airtable · Jira ·
  CSV · `screens/19`.

## Від авторів

### Автор j01 (2026-09-17)
- **усі → усі:** індексні `…/docs/` через WebFetch → 404; читати `…/resources/` або сторінку-листок; частина сторінок віддає лише зміст — брати дочірню.
- **j01 → j03, j06, j09, j13:** `screens/03` знято в **software**-спейсі, а сюжетні `MY/MARK/REM/HR` — business: рядок виглядів і шлях в адресі різняться → потрібен знімок business-спейсу (наступна сесія).
- **j01 → j03:** знімка лівої бічної панелі (список пунктів) немає — для j03 це тема уроку, знімок першочерговий.
- **j01 → j18, j19:** портал за доксами: Portal name · Introduction text · Logo; плитки = request types (назви й описи бачить клієнт); групи — portal groups; кнопка **Requests** показує клієнтові його заявки; канали — portal · email · widget · chat; ⚠ напис поля пошуку порталу не підтверджений — зняти очима.
- **j01 → j02:** «audit log is available with all paid Jira Cloud plans» — формулювання «на платних планах» обходиться без чисел.
- **j01 → j04:** пари `work item (issue)` і `space (project)` **уже введені** в j01 (блок 2, `ds-note`) — j04 спирається, не вводить заново.
- **j01 → j07, j10:** «статус», «робочий процес» (набір станів і дозволених переходів), «JQL» (власна мова запитів) названі й пояснені одним рядком з відсиланням до уроків 10 і 7.
- **j01 → j12, j21:** цитата для не-ІТ: work item «can represent an activity, a document, an asset (creative or concrete), a purchase or even a person» (`what-are-jira-business-projects`).
- **для кореневої сесії:** уроки посилаються на `../jira.html` (шапка, футер, «До програми») — файла ще немає до дизайну; до релізу «На головну» дає 404 — рядок у чеклист релізу.

### Автор j02 (2026-09-17)
- **усі → усі:** таблиці планів читати `curl`-ом і розбором `<td>` (галочка = `<path d="M9.707 11.293…">`, прочерк = `-`), не WebFetch — той вигадує рядки й плутає колонки.
- **j02 → j18, j19, довідник 3:** живі значення колонки Free для JSM (curl): multi-channel ✓, custom reports ✓, SLA ✓, automation ✓, global automation — з лічильником; прочерк — work-level security, audit logs, sandboxes, multiple help centers, data pinning, uptime SLA; Assets і virtual agent — Premium+. **Розходиться з `facts-free-plan.md` №3 — звірити очима.**
- **j02 → j16, j19:** фрази про Confluence як базу знань JSM на сторінці планів немає, JSM-слаги про KB → 404 — джерело шукати заново.
- **j02 → j20:** що вважається активністю сайту («opening a dashboard, checking a report, viewing a work item, or going to the admin settings»); попередження про деактивацію йде на пошту того, хто створив сайт.
- **j02 → j17:** на сторінці про Free — **поіменний список застосунків**, несумісних з Free (`Email This Issue`, `JEMH`, `Automated Release Notes`, `Deep Clone for Jira`, `Tempo Base plugin`…) і «з обмеженою функціональністю» (`Checklists for Jira`).
- **j02 → j03, j09:** `Type` у Spaces показує `Team-managed software`; форми `Team-managed business` ніхто не бачив — ⚠ у вікнах.
- **j02 → j07, j08:** рядка `Dashboards` у таблиці планів **немає** — не посилатись на неї (доступність дашбордів — `manage-shared-dashboards`, факт №10).
- **j02 → j14, j15:** на Free кроки автоматизації рахуються **на підписку**, на платних — на користувача на місяць — різні моделі.
- **j02 → j03:** «пробний період» у доксах — платний план на пробу з безкоштовного, а не Free з датою закінчення.
- **механіка (закрито 2026-09-17):** ліміт легенди 400 символів у чекері — піднято до 8 000; легенда — підписи, не речення (контракт §4.1).

### Автор j03 (2026-09-17)
- **j03 → усі:** клавіші `c`, `/`, `.`, `?` і палітра `command`/`Ctrl` + `K` підтверджені живими доксами (`navigate-to-your-work`, `use-keyboard-shortcuts`, `what-is-the-command-palette`).
- **j03 → j05, j12, j09:** шаблон для `MY` у доксах — «task management template» (**2 статуси**: To Do / Done), «project management template» — 3. **Рішення кореневої сесії — у програмі, розділ 3.** Назви шаблонів в уроках не називати.
- **j03 → j09:** тип спейсу підписується двома рядками: «Software space» на плитці For you, «Team-managed software» у списку Spaces.
- **j03 → j07, j10, j14:** пастка мови (мова акаунта → назви статусів → `status = Done` порожньо) розкрита в j03, блок 6, з діаграмою — далі лише «як в уроці 3».
- **j03 → j20:** на платних планах адресу міняють не більше 3 разів (Atlassian Administration → Apps → App URLs → Update URL, organization admin).
- **j03 → j20, j21:** **ключ спейсу змінюється** (Space settings → Details): ≥ 2 символи, великі літери й цифри, з літери; «up to 10 minutes for the updated key to appear on your board».
- **j03 → j18:** українська є для Compass, Atlassian Home, Help Center / Customer Portal; немає для Jira, JSM, JPD, Confluence — портал українською імовірний, звірити очима.
- **j03 → усі:** вхід через сторонній акаунт (Google, Apple, Microsoft, Slack) на `id.atlassian.com/login`; листи-запрошення шукати від `noreply@mailer.atlassian.com`, `noreply@mail.notifications.atlassian.com`.
- **j03 → усі:** три слаги доксів дали 404 за день (`keyboard-shortcuts`, `get-started-with-jira`, індекс `jira-software-cloud/docs/`) — шукати через WebSearch з `allowed_domains: support.atlassian.com`.
- **докси проти доксів:** `manage-your-jira-personal-settings` не згадує Theme і Jira homepage, хоча на екрані вони є — показано з вікна, датовано.
- **для кореневої сесії (дознімати):** business-спейс (рядок виглядів, шлях в адресі, «Business space» на плитці), ліва бічна панель, галерея шаблонів у діалозі Create space, таблиця планів очима (рядок JSM Free).
