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

## Від кореневої сесії (2026-09-17, вечір — дозняті екрани 22–24)

- **усі → j03, j05, j09, j12:** у UI 2026 шаблон особистих/командних задач називається **Task tracking** («Organize and
  track team or personal tasks»); докси кажуть «task management template» · `screens/23` · рішення про статуси `MY`
  (програма, розділ 3) звірити з фактичним шаблоном після створення спейсу; назви шаблонів — лише довідник 3.
- **усі → j09, довідник 3:** категорія **Work management** — 30 business-шаблонів без бейджів Premium/Try (Project
  management, Task tracking, Recruitment tracking, Budget planning, Event planning …); **Service management** — 16,
  з них Premium: Advanced IT service management, IT Operations; **Custom templates — Enterprise** · `screens/23`.
- **усі → j18, j19, довідник 3:** JSM Free очима і `curl`: multi-channel ✓, workflows + SLA ✓, custom reports ✓,
  automation 1 250 steps per subscription, global and multi-space automation 100 executions per month; прочерк —
  work-level security, audit logs, sandboxes, release tracks, multiple help centers, data pinning, uptime SLA; Assets і
  virtual service agent — Premium+ · `screens/24`, `facts-free-plan.md` №3 → ✅ · числа — лише довідник 3.
- **усі → j03, довідник 3:** бічна панель — 13 пунктів (For you · Recent · Starred · Apps · Plans · Spaces · Filters ·
  Dashboards · Assets ↗ · Teams ↗ · Goals ↗ · Projects ↗ · Customize sidebar), крок 32 px, ширина 320 px; чотири нижні
  ведуть **за межі Jira** (Atlassian Home), і **Projects ≠ spaces** — пастка для новачка · `screens/22`.

## Від рецензентів (2026-09-17, вечір)

### Рецензент j02
- **j02 → j03, j05:** «To create a space: Hover over Spaces in the side navigation, then select Create space» ·
  `jira-software-cloud/docs/create-a-new-project/`, 2026-09-17 · спейс створюють не кнопкою `+ Create` у верхній панелі
  (підтверджено `screens/22`: кнопка **Create space** живе в секції Spaces бічної панелі).
- **j02 → j09:** «Only Jira admins can create spaces with a shared configuration. This setting isn't available on the
  Free plan.» · та сама сторінка · опора для «коли треба Standard»; **прямої цитати про company-managed на Free в доксах
  немає** — знайти або переформулювати (j02 зараз стверджує «обидва типи на Free» з опорою лише на `facts` №12).
- **j02 → j14, j15, довідник 3:** «Allowances refresh monthly»; «Automation step per month»: Free — 150 per subscription,
  JSM Free — 1 250 per subscription; модель — «pooled at the organization level» ·
  `cloud-automation/docs/how-is-my-usage-calculated/`, 2026-09-17 · писати «на підписку / на організацію», не «на сайт».
- **j02 → j20:** «Space archiving is only available on Premium and Enterprise plans. If you archive a space and then
  move to a Standard plan, you can still access the archive and restore archived spaces.» ·
  `jira-cloud-administration/docs/archive-a-project/`, 2026-09-17 · поруч розділ «Trash for Jira Cloud spaces»
  (Move to trash · Restore · Delete) — це і є заміна архівації на Free.
- **j02 → j20, довідник 3:** «If you're a site admin, we'll send you emails to let you know if your site has been
  inactive and is at risk of being deactivated…» · `what-is-the-free-jira-cloud-plan/` · адресат — **адміністратор
  сайту**, не «той, хто створив»; твердження «глядач (Viewer) теж займає місце з десяти» джерела поки не має.
- **j02 → j16:** Confluence Free сьогодні: «Seats for up to 10 users» · «2 GB of file storage» · «Unlimited spaces and
  pages» · «Permissions aren't customizable and anonymous access isn't available…» · «Atlassian reserves the right to
  deactivate Free Confluence Cloud sites due to inactivity.» · `confluence-cloud/docs/learn-about-confluence-cloud-plans/`;
  там же «If you're on the Free plan, you can try the Standard plan for 14 days and the Premium plan for 30 days».
- **j02 → усі (метод):** `curl` + розбір `<td>` відтворено незалежно — збіглось. Дві пастки таблиці Jira: рядок
  **`Anonymous access` стоїть двічі**, а **`Dependency management` має порожні клітинки в усіх колонках** (значення
  сховані в описі рядка) — «порожньо» там не означає «немає на жодному плані».
- **для кореневої сесії / дизайну:** клас `win__topbar` (§4.3, заведений за заявкою автора j02) **не використовує жоден
  із трьох уроків** — усі кладуть верхню панель у `win__bar`; рішення (завести в дизайні й переробити разом чи прибрати
  з §4.3) — при перенесенні макета, sed-пасом.

### Рецензент j01
- **j01 → усі:** `…/docs/receive-requests-from-an-online-portal/` сьогодні **хаб** без тіла статті; цитати про портал — у
  `…/docs/how-do-customers-send-requests-to-your-service-project/`. Порожній grep ≠ «факту немає».
- **j01 → усі (метод):** `curl -sL` + зняття тегів на `support.atlassian.com` віддає тіло статті цілком і надійніше за
  WebFetch для дослівних цитат (перевірено на 15 сторінках).
- **j01 → j03, j09, j10:** набір статусів народжується з шаблону: project management — три кроки (To do · In Progress ·
  Done), task management — два (To Do · Done) · `jira-work-management` докси, 2026-09-17 · в уроках назв шаблонів не
  називати; у UI шаблон задач — **Task tracking** (`screens/23`).
- **j01 → j03, j18:** таблиця мов доксів: Ukrainian ❌ Jira/JSM/JPD/Confluence, ✅ **Help center and Customer Portal** ·
  `atlassian-account/docs/manage-your-language-preferences/` · знімає ⚠ з `facts` №17 на рівні доксів; наживо — після JSM.
- **j01 → j04:** пари work item (issue) і space (project) вже введені в j01 разом зі «статус», «робочий процес», «JQL»
  одним рядком кожне — розкривати, не вводити заново.
- **j01 → j04, j09:** **ключ роботи не вічний**: адмін може змінити ключ спейсу (`EXAMPLE-1` → `DEMO-1`, старі
  посилання працюють через аліас) · `jira-software-cloud/docs/edit-a-projects-details/` («Change a space's key») ·
  повний нюанс — дім j04/j09; j01 тепер каже «не міняється при перейменуванні чи пересуванні картки».
- **j01 → j06, j09, j13:** `screens/03` знято в software-спейсі; для business потрібен свій знімок (рядок виглядів і
  адреса `…/jira/…/MARK/board`) — `21-business-space.md`, після створення спейсу.
- **j01 → j18, j19:** склад порталу за живими доксами: портал створюється автоматично для кожного службового спейсу,
  плитки = request types, канали = help center · email · chat, кнопка **Requests** «near their avatar» показує статуси
  заявок; ⚠ пошук докси описують для **help center**, не для порталу спейсу — напис поля пошуку звірити очима після JSM.
- **j01 → дизайн:** формат дати на картці дошки — у вікні `Sep 25`, у `screens/03` `Sep 24, 2026`; гліф типу Task
  (у знімку лише «галочка») — вирішити разом зі станом `board`.
- **закрито знімком 22:** склад і порядок пунктів бічної панелі у W1 j01 (`For you · Spaces · Filters · Dashboards`) —
  підмножина реальної панелі в правильному порядку (`screens/22-sidebar.md`).

### Рецензент j03
- **j03 → усі (навігація):** докси `navigate-to-your-work` мають банер «This page is for the old navigation»; жива
  сторінка — `what-is-the-new-navigation-in-jira` (GA хвилями з 2025-03). **Коренева сесія, `screens/22` (2026-09-17,
  вечір): sandbox стоїть на НОВІЙ навігації** — у бічній панелі є Recent · Starred · Apps · Customize sidebar, а
  **Search і + Create лишаються у верхній панелі**. Формулювання j03 («верхня панель однакова на кожній сторінці»,
  рейка `For you · Spaces · Filters · Dashboards` як підмножина) — чинні; джерелом для панелі цитувати сторінку про
  нову навігацію, не стару.
- **j03 → j02, довідник 3:** `Site limit` = One / One / One / 150 (Free / Standard / Premium / Enterprise) · curl
  `explore-jira-cloud-plans` · «один сайт» **не є ознакою Free**. Рішення кореневої сесії 2026-09-17: два входження
  «один сайт» у j03 лишаються (структурний факт, стабільний; на ньому тримається аргумент «другий сайт не врятує») —
  власник може скасувати.
- **j03 → j07:** «Press `/` to open the quick search field. Press `/` then enter/return to start an advanced search»;
  тултип «…advanced search with your text query» · брати ці формулювання, не «у порожньому полі».
- **j03 → j05, j09, j12:** «two steps: To Do and Done» (task management) / «three steps: To do, In Progress, and Done»
  (project management) · curl 2026-09-17 · підтверджує рішення програми про два статуси в `MY`; у UI шаблон —
  **Task tracking** (`screens/23`).
- **j03 → j10, j11, j20:** ключ спейсу «at least two characters long, start with an uppercase letter… only uppercase
  letters or numbers» + «up to 10 minutes…».
- **j03 → j20:** «you also create a site and organization for that app» · слово **«організація»** вперше зринає в j03 —
  коренева сесія додала гloss на місці (2026-09-17); **дім поняття — j20** (Atlassian Administration).
- **j03 → j05:** `manage-your-jira-personal-settings` перелічує лише Language / Your timezone / Watch your work items —
  `Theme` і `Jira homepage` у доксах відсутні (підтверджено вдруге); розділ у доксах «Notification settings», на екрані
  «Emails and notifications».
- **j03 → j18, довідник 3:** Ukrainian ❌ Jira, JSM, JPD, Confluence, Team Calendars; ✅ Compass, Home, Help center and
  Customer Portal (те саме знайшов рецензент j01).
- **j03 → дизайн (реєстр §7.0):** `win__topbar` не вжитий у жодному уроці (усі — `win__bar`); для поля **Search поза
  порталом класу немає** (j03 вживає `win__crumb`; кнопки `Templates` / `Search spaces` лежать у `win__tabs`);
  `See plans` — `win__btn` (j02, j03). Звести до одного рішення **до** sed-пасу.
- **j03 → редакторам наступних хвиль:** «легенда ≤ ~80 знаків» після підняття вікна чекера 400 → 8 000 механічно не
  перевірялась (у j03 пункти були 94–157) — коренева сесія додала попередження `!` у `check-lessons.py` (2026-09-17).
- **j03 → j07, j08:** «дашборд» і «фільтр» вживаються в j02 і j03 без пояснення (у цитаті про неактивність) — дім
  понять j07/j08; при авторингу j07/j08 ввести явно, у j02/j03 не чіпати.
- **j03 → власник (перевіряється лише живою реєстрацією):** чи питають платіжну картку на Free · які символи приймає
  поле назви сайту (кирилиця?) · чи містить лист після реєстрації адресу сайту · клік по `Ask AI` на Free — що показує ·
  A/B пастки мови (спейс з English → змінити мову акаунта → назви статусів).
