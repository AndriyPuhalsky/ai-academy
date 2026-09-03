# Курс «AI Термінал»: закриття п'яти відкритих хвостів

**Дата звірки: 2026-09-03.** Локальна збірка: `claude` **2.1.236** (homebrew cask `claude-code`,
`/opt/homebrew/Caskroom/claude-code/2.1.236/claude`, канал stable).
Докси тягнулись `curl`-ом як сирий markdown із `https://code.claude.com/docs/en/<page>.md`.
Інтерактивна сесія не запускалась, стан не змінювався.

Нові дослівні вивідки: `00-research/screens/t-bogus-flag-probe.txt`,
`00-research/screens/t-mcp-add-help.txt`, `00-research/screens/t-sandbox-collision-evidence.txt`.

---

## Хвіст 1 — колізія `/sandbox`

**Статус:** закрито

**Відповідь:**
Колізії немає. `/sandbox` у Claude Code **один-єдиний** — це панель налаштування пісочниці Bash,
як її описує `sandboxing.md`. Скіла `/sandbox` не існує: ані серед bundled-скілів, ані локально,
ані в бінарнику, ані в індексі доксів. Цитата «Create an isolated Node.js sandbox where you can run
code without file-system permissions» **не є текстом доксів Claude Code** — це помилка атрибуції
у звіті `facts-c01-c08.md`, і спростовує її артефакт, зібраний іншим агентом того ж дня з тієї
самої сторінки.

**Докази:**

1. `$ curl -sL https://code.claude.com/docs/en/commands.md | sed -n '132p'` (2026-09-03) →
   ``| `/sandbox` | Toggle [sandbox mode](/docs/en/sandboxing). Available on supported platforms only |``
   Мітки `[Skill]` у рядку **немає**.
2. У `commands.md` скіли позначені **явно й одноманітно**: `**[Skill](/docs/en/skills#bundled-skills).**`
   — рівно 16 рядків (37, 60, 66, 68, 75, 76, 78, 80, 83, 89, 106, 130, 131, 138, 157, 161).
   Рядок 132 (`/sandbox`) серед них відсутній. Пояснення мітки в самій сторінці (рядок 37):
   «**[Skill]**: a bundled skill. It works like skills you write yourself: a prompt handed to Claude.»
3. `sandboxing.md`, рядки 23 і 29 (дослівно): «Start a Claude Code session and run the `/sandbox`
   command» … «**This opens the sandbox panel with three tabs, plus a Dependencies tab on Linux when
   the optional seccomp filter is missing**» — вкладки **Mode**, **Overrides**, **Config**.
4. Пошук спірної фрази дав нуль у чотирьох незалежних місцях: `commands.md` — 0; `llms.txt`
   (індекс усіх сторінок доксів) — 0; `strings` по бінарнику 2.1.236 — 0 збігів на «node.js sandbox»;
   веб-пошук точної фрази — жодного результату Anthropic, лише сторонні Node-бібліотеки
   (`jailed`, `v8-sandbox`, `isolated-function`).
5. Локально скіла немає: `$ ls ~/.claude/skills/` → 8 скілів, `sandbox` немає;
   `$ ls AIA/.claude/skills/` → 19 скілів, `sandbox` немає;
   `$ claude plugin list` → `exa`, `frontend-design`, `skill-creator` (вимкнений),
   `superpowers` (вимкнений) — жоден не постачає `/sandbox`.
6. **Вирішальний доказ.** `00-research/screens/b-slash-commands-full.txt` — витяг, зроблений іншим
   агентом **2026-09-03 з тієї ж сторінки `commands.md`, розділ «All commands»**. Рядок 84:
   `/sandbox | Toggle sandbox mode. Available on supported platforms only`.
   Мітки `**Skill.**` немає, хоча в сусідніх рядках 82–83 (`/run`, `/run-skill-generator`) вона є.
   Тобто два незалежні витяги з тієї самої сторінки збігаються між собою і розходяться
   лише зі словесним переказом у `facts-c01-c08.md`.

Повний набір — `00-research/screens/t-sandbox-collision-evidence.txt`.

**Що з цього йде в курс:**

У **`c08` («Plan Mode й пісочниця»)** писати без застережень, одним поняттям:

> `/sandbox` — це панель налаштування пісочниці Bash. Вона відкривається **трьома вкладками**:
> **Mode** (як саме схвалюються команди в пісочниці), **Overrides** (чи можна команді, яка
> впала в пісочниці, перезапуститись поза нею — це налаштування `allowUnsandboxedCommands`)
> і **Config** (переглянути підсумкові налаштування пісочниці). На Linux додається четверта
> вкладка **Dependencies**, коли бракує пакета; якщо видно **тільки** її — потрібний пакет
> не встановлено. На macOS ставити нічого не треба, пісочниця працює на вбудованому Seatbelt.

Окремим врізом — те, що плутають найчастіше (`sandboxing.md`, рядок 574, дослівно):

> «`/sandbox` **is not a permission mode**.» Режим доступу вирішує, **чи виконається** виклик
> інструмента і чи спитають дозволу. Пісочниця вирішує інше — **до чого має доступ** Bash-команда,
> коли вона вже запустилась. Це два різні шари, і в курсі їх не можна змішувати.

**Категорично не писати** в курс, що існує скіл `/sandbox`, який «створює ізольовану пісочницю
Node.js». Такої сутності немає.

**Що лишилось невідомим:**
Візуально мітку в живому `/`-меню я не підтверджував — інтерактивну сесію запускати заборонено.
Це не впливає на висновок (чотири незалежні джерела збігаються), але якщо потрібне підтвердження
власними очима, людина закриває це за хвилину: запустити `claude`, набрати `/sandbox`, побачити
**один** пункт **без** позначки скіла, натиснути Enter → відкриється панель із вкладками
**Mode / Overrides / Config**.

---

## Хвіст 2 — `best-practices.md`

**Статус:** закрито, **але з поправкою до самої постановки задачі**

**Відповідь:**
Сторінку прочитано повністю. Матеріал для `c02` і `c21` там є, і багатий. Але **терміна
«vibe coding» у доксах Claude Code немає взагалі** — нуль збігів на `vibe` у `best-practices.md`,
`overview.md`, `quickstart.md`, `how-claude-code-works.md`, `common-workflows.md`,
`features-overview.md`, `permission-modes.md`, `commands.md`, `cli-reference.md`, `sandboxing.md`,
`costs.md`, `slash-commands.md`, `mcp.md` **і в індексі `llms.txt`**. Тож `best-practices.md` не є
«головним джерелом про vibe coding» — вона взагалі не джерело **про термін**. Вона джерело про
**суть**: де автономна робота без перевірки ламається і чим це лікують. Курс має або писати про
явище своїми словами, не приписуючи термін доксам, або сказати прямо, що термін позадокументний.

Друга поправка: у доксах цикл має **чотири** фази, не п'ять. Дослівно — «**The recommended workflow
has four phases:**» **Explore → Plan → Implement → Commit**. Перевірка не окрема фаза, а наскрізна
вимога з окремого розділу «Give Claude a way to verify its work» + всередині Implement. Формулу
«explore → plan → implement → verify → commit» можна давати як методичну, але тоді чесно позначити
її як перефраз, а не як цитату доксів.

**Докази:** `https://code.claude.com/docs/en/best-practices.md`, стягнуто `curl` 2026-09-03
(587 рядків). `$ grep -c -i vibe best-practices.md` → `0`.

### Що йде в `c02` («Що таке Claude Code»)

Чим це відрізняється від чату — дослівно, перші абзаци сторінки:

> «Claude Code is an agentic coding environment. Unlike a chatbot that answers questions and waits,
> Claude Code can read your files, run commands, make changes, and autonomously work through problems
> while you watch, redirect, or step away entirely.»

> «This changes how you work. Instead of writing code yourself and asking Claude to review it, you
> describe what you want and Claude figures out how to build it. Claude explores, plans, and implements.»

> «But this **autonomy still comes with a learning curve**. Claude works within certain constraints
> you need to understand.»

Головне обмеження, на якому тримається вся сторінка:

> «Most best practices are based on **one constraint: Claude's context window fills up fast, and
> performance degrades as it fills**.»

> «This matters since LLM performance degrades as context fills. When the context window is getting
> full, Claude may start "forgetting" earlier instructions or making more mistakes. **The context
> window is the most important resource to manage.**»

**Де «на відчуття» працює** (це і є чесна відповідь курсу про vibe coding — розділ «Provide specific
context in your prompts» і фінальний «Develop your intuition»):

> «**Vague prompts can be useful when you're exploring and can afford to course-correct.** A prompt
> like `"what would you improve in this file?"` can surface things you wouldn't have thought to ask about.»

> «Sometimes **a vague prompt is exactly right** because you want to see how Claude interprets the
> problem before constraining it.»

> «Sometimes you *should* let context accumulate because you're deep in one complex problem and the
> history is valuable. Sometimes you should skip planning and let Claude figure it out because the
> task is exploratory.»

**Де воно ламається** — чотири цитати, і це найцінніше для `c02`:

> «Claude can infer intent, but **it can't read your mind**. Reference specific files, mention
> constraints, and point to example patterns.»

> «Claude **stops when the work looks done**. Without a check it can run, "looks done" is the only
> signal available, and **you become the verification loop**: every mistake waits for you to notice it.»

> «**The trust-then-verify gap.** Claude produces a plausible-looking implementation that doesn't
> handle edge cases. → **Fix**: Always provide verification (tests, scripts, screenshots).
> **If you can't verify it, don't ship it.**»

> «Letting Claude jump straight to coding **can produce code that solves the wrong problem**.»

Формулювання для курсу (не цитата, а висновок з них): робота «на відчуття» законна там, де ціна
помилки — це `Esc` і переписаний промпт: розвідка незнайомого коду, «а що б ти тут покращив»,
чернетка, яку однаково викидати. Вона ламається рівно там, де немає перевірки, яку Claude може
запустити сам, — бо тоді єдиний критерій готовності це «виглядає готовим», і перевіряльником
стаєш ти.

П'ять типових провалів (розділ «Avoid common failure patterns») — готовий чекліст у `c02`,
дослівні назви: **The kitchen sink session** · **Correcting over and over** ·
**The over-specified CLAUDE.md** · **The trust-then-verify gap** · **The infinite exploration**.

### Що йде в `c21` («Наскрізний проєкт і робочі звички»)

**Цикл, дослівно** («Explore first, then plan, then code» → «The recommended workflow has four phases»):

1. **Explore** — «Enter plan mode by pressing `Shift+Tab` until the status bar shows `⏸ plan mode on`,
   or start the session with `claude --permission-mode plan`. Claude reads files and answers questions
   without making changes.»
2. **Plan** — «Ask Claude to create a detailed implementation plan.»
   Плюс клавіша, яку легко проґавити: «**Press `Ctrl+G` to open the plan in your text editor** for
   direct editing before Claude proceeds.»
3. **Implement** — «Switch out of plan mode by approving the plan or pressing `Shift+Tab`, then let
   Claude code, **verifying against its plan**.» Приклад промпта звідти: «implement the OAuth flow
   from your plan. write tests for the callback handler, run the test suite and fix any failures.»
4. **Commit** — «commit with a descriptive message and open a PR».

**Коли план — зайвий оверхед** (важливо, бо новачки планують усе підряд):

> «Plan mode is useful, but also adds overhead. For tasks where the scope is clear and the fix is
> small (like fixing a typo, adding a log line, or renaming a variable) ask Claude to do it directly.»
> «**If you could describe the diff in one sentence, skip the plan.**»

**Перевірка — окремий розділ, чотири рівні жорсткості** («Once the check exists, decide how hard
it gates the stop»): в одному промпті · на всю сесію через умову `/goal` · детермінований бар'єр
через **Stop-хук** («Claude Code overrides the hook and ends the turn **after 8 consecutive blocks**»)
· друга думка через субагента. Дослівна порада, яка й має стати звичкою курсу:

> «**Have Claude show evidence rather than asserting success**: the test output, the command it ran
> and what it returned, or a screenshot of the result. Reviewing evidence is faster than re-running
> the verification yourself, and it works for sessions you weren't watching.»

> «Give Claude a check it can run: tests, a build, a screenshot to compare. It's the difference
> between a session you watch and one you walk away from.»

**Звички керування сесією** (розділ «Manage your session»):

- «**Correct Claude as soon as you notice it going off track.**» Інструменти: `Esc` (спинити,
  контекст збережений), `Esc + Esc` або `/rewind` (меню відкату), «Undo that», `/clear`.
- Правило двох спроб, дослівно: «**If you've corrected Claude more than twice on the same issue in
  one session, the context is cluttered with failed approaches.** Run `/clear` and start fresh with
  a more specific prompt that incorporates what you learned. **A clean session with a better prompt
  almost always outperforms a long session with accumulated corrections.**»
- «Use `/clear` frequently between tasks»; точковіше — `/compact <instructions>`, напр.
  `/compact Focus on the API changes`; для питань, які не мають лишатись у контексті — `/btw`
  («The answer never enters conversation history»).
- Застереження про чекпойнти, яке обов'язково має бути в курсі поруч із git:
  > «**Checkpoints only track changes made through Claude's file editing tools. Changes made through
  > Bash commands or external processes are not captured. This isn't a replacement for git.**»

**CLAUDE.md як звичка** (розділ «Write an effective CLAUDE.md»):

- «Run `/init` to generate a starter CLAUDE.md file based on your current project structure, then
  refine over time.» · «Run `/context` to confirm Claude loaded the file.»
- Критерій на кожен рядок: «For each line, ask: *"Would removing this cause Claude to make mistakes?"*
  If not, cut it.»
- «**Bloated CLAUDE.md files cause Claude to ignore your actual instructions!**»
- «If Claude keeps doing something you don't want despite having a rule against it, the file is
  probably too long and the rule is getting lost.»
- «If Claude keeps skipping one instruction, add emphasis such as "IMPORTANT" to that line alone.
  **If you emphasize many lines, none of them stands out.**»
- «Treat CLAUDE.md like code: review it when things go wrong, prune it regularly, and test changes
  by observing whether Claude's behavior actually shifts.»

**Змагальна перевірка наприкінці** (розділ «Add an adversarial review step») — і одразу протиотрута,
без якої порада шкідлива:

> «A reviewer prompted to find gaps will usually report some, **even when the work is sound**, because
> that is what it was asked to do. Chasing every finding leads to over-engineering… Tell the reviewer
> to flag only gaps that affect correctness or the stated requirements, and treat the rest as optional.»

**Що лишилось невідомим:** нічого по самій сторінці. Відкритим лишається редакційне рішення власника:
вживати термін «vibe coding» у `c02` як позадокументний (і сказати це вголос) чи не вживати зовсім.

---

## Хвіст 3 — ліміти підписок

**Статус:** закрито частково — **точних чисел не існує у відкритому доступі**

**Відповідь:**
Anthropic **не публікує** ні кількості повідомлень, ні годин для Pro / Max 5x / Max 20x. Перевірено
шість джерел, включно з тими, на які посилаються самі докси, — у жодному немає ні таблиці, ні
діапазону. Публічні лише **відносні** множники (5x і 20x від Pro) і **механіка вікон**. Тому
таблиці чисел у `c11` бути не може — будь-яке число там буде вигадкою.

**Докази (усі — 2026-09-03):**

| Джерело | Що дає |
| --- | --- |
| `https://claude.com/pricing` | лише «5x more usage than Pro», «20x more usage than Pro», зноска «Usage limits apply». Чисел немає |
| support 11049741 «What is the Max plan?» | «five times more usage per session than the Pro plan» / «20 times more usage per session». «Your session-based usage limit will **reset every five hours**» + «a **weekly usage limit that applies across all models**». Чисел немає |
| support 9797557 «Usage limit best practices» | «Session-based usage limits reset every five hours»; тижневе вікно «resetting at a **fixed time each week that is assigned to your account**». Чисел немає |
| support 11647753 «How do usage and length limits work?» | «Different subscription plans have different usage allowances». Чисел немає |
| support 11145838 «Use Claude Code with your Pro or Max plan» | «Both Pro and Max plans offer usage limits that are **shared across Claude and Claude Code**». Чисел немає |
| support 14552983 «Models, usage, and limits in Claude Code» | про метрику за способом входу. Чисел немає |

**Що документовано точно** (це і є фактура для `c11`):

- **Два вікна одночасно:** сесійне, що скидається **кожні 5 годин** (ковзне), і **тижневе**,
  що скидається **у фіксований час, призначений акаунту**.
- **Ліміт спільний** для Claude (чат) і Claude Code — витратив у чаті, менше лишилось на термінал.
- **Від чого залежить витрата** (support 11647753, дослівно): «Your usage is affected by several
  factors, including **the length and complexity of your conversations, the features you use, which
  Claude model you're chatting with, and the effort level you've selected**.»
- **Чотири різні повідомлення про ліміт означають різне** (`costs.md`, розділ «When a developer asks
  about a limit») — і це найкорисніше практичне знання:
  - «You've hit your **session limit**» / «your **weekly limit**» — місце в тарифі, **спільне для всіх
    моделей**, тож `/model` не рятує: «shared across all models, so the developer **can't restore
    access by switching models** with `/model`»;
  - «You've hit your **Opus limit**» / «your **Sonnet limit**» — а от тут `/model` **рятує**:
    «switching to a model outside that family with `/model` **does keep the developer working**»;
  - повідомлення про **spend limit** від self-hosted шлюзу — це не ліміт тарифу;
  - попередження про **контекст / auto-compact** — «**not a usage limit**», це зовсім інша річ.
- **Що робити при вичерпанні:** дочекатись скидання · перемкнути модель, якщо ліміт **модельний** ·
  `/usage-credits` (доплата за API-тарифом, вмикається в **Settings → Usage** на claude.ai; доступно
  на Pro, Max 5x і Max 20x) · апгрейд тарифу (`/upgrade`).
- **Автоочікування:** на **Claude Code v2.1.234 або новішій** сесія вміє дочекатись скидання й
  **сама продовжити перервану задачу**; вручну — з меню `/rate-limit-options`; для парку машин
  керується налаштуванням `autoContinueAtUsageLimit`.
- **Де подивитись свою правду:** `/usage` (аліаси `/cost`, `/stats`) — «On a Pro, Max, Team, or
  Enterprise plan, includes a breakdown of what counts against your plan limits».
  Окремо, чесно: коли запит лімітів не проходить, `/usage` показує останні відомі дані
  «within the past 60 minutes» з поміткою `Showing last-known usage` — тобто цифри можуть бути
  несвіжими.

**Що з цього йде в курс:**

`c11` («Скільки це коштує») пишеться **без таблиці чисел**. Пропоноване формулювання:

> Anthropic навмисно не публікує, скільки саме повідомлень або годин дає кожен тариф: витрата
> залежить від довжини й складності розмови, обраної моделі та рівня зусиль, тому однієї чесної
> цифри просто не існує. Публічно відомі тільки пропорції — **Max 5x дає вп'ятеро, Max 20x
> вдвадцятеро більше за Pro** — і механіка вікон: **сесійне вікно скидається кожні 5 годин**,
> а поверх нього діє **тижневе**, яке скидається у фіксований час, закріплений за вашим акаунтом.
> Ліміт спільний із чатом Claude.
>
> Тому єдина правильна відповідь на питання «скільки мені лишилось» — команда **`/usage`** у самій
> сесії. Не вірте таблицям із чисел у статтях (і в цьому курсі їх теж не буде): вони застарівають
> швидше, ніж пишуться.
>
> Коли ліміт вичерпано, спершу прочитайте, **який саме** це ліміт. «Ви вичерпали ліміт Opus» —
> перемкніться на іншу модель через `/model`, і робота триває. «Ви вичерпали сесійний
> (або тижневий) ліміт» — `/model` не допоможе, він спільний для всіх моделей; лишається дочекатись
> скидання (з версії 2.1.234 Claude Code вміє дочекатись і продовжити задачу сам — меню
> `/rate-limit-options`), увімкнути доплату через `/usage-credits` або підняти тариф.
> А попередження про контекст і auto-compact — це **взагалі не ліміт тарифу**, і плутати їх не варто.

**Що лишилось невідомим:** поіменно — кількість повідомлень за 5-годинне вікно для Pro, Max 5x,
Max 20x; кількість годин Claude Code на тиждень для кожного тарифу; чисельний розмір тижневого
вікна. Ці числа Anthropic не публікує в жодному з шести перевірених джерел. Публічно їх дізнатись
неможливо — лише емпірично, зі свого `/usage`.

---

## Хвіст 4 — прапорці з `cli-reference.md`, яких немає в локальному `--help`

**Статус:** закрито

**Відповідь:**
Із семи спірних прапорців **шість реально існують** у локальній 2.1.236 і **жоден із семи не
показується** в `claude --help`. Єдиний, якого справді немає, — **`--restricted`**, і докси самі
пояснюють чому: він вимагає **v2.1.248 або новішої**, а в нас 2.1.236. Тобто розходження тут не
«докси брешуть», а **дві різні речі одночасно**: `--help` неповний (ховає робочі прапорці),
а `cli-reference.md` випереджає встановлену збірку.

**Докази:**
`$ claude --version` → `2.1.236 (Claude Code)`.
Метод — підставити свідомо неіснуючий `--zzz-bogus` **після** досліджуваного прапорця. Якщо парсер
скаржиться на `--zzz-bogus`, значить попередній прапорець він розпізнав; якщо на сам прапорець —
його немає. Сесія при цьому не стартує: `commander` падає на розборі аргументів.
Повна вивідка — `00-research/screens/t-bogus-flag-probe.txt`.

| Прапорець | Є в `cli-reference.md` | Вимога версії в доксах | Реально в 2.1.236 | Видно в `claude --help` | Дослівна реакція парсера на пробу |
| --- | --- | --- | --- | --- | --- |
| `--advisor <model>` | так (рядок 61) | немає | **Є** | ні | `Error: The model "--zzz-bogus" cannot be used as an advisor.` |
| `--max-turns <turns>` | так (102) | немає | **Є** | ні | `error: option '--max-turns <turns>' argument '--zzz-bogus' is invalid. must be a number` |
| `--restricted` | так (120) | **«Requires Claude Code v2.1.248 or later»** | **НЕМАЄ** | ні | `error: unknown option '--restricted'` |
| `--init` | так (94) | немає | **Є** | ні | `error: unknown option '--zzz-bogus'` |
| `--init-only` | так (95) | немає | **Є** | ні | `error: unknown option '--zzz-bogus'` |
| `--maintenance` | так (100) | немає | **Є** | ні | `error: unknown option '--zzz-bogus'` |
| `--append-system-prompt-file` | так (68, 146) | немає | **Є** | ні* | `Error: Append system prompt file not found: …/--zzz-bogus` |

\* — у списку опцій `claude --help` його немає, але він **згадується всередині опису іншого
прапорця**, `--bare`: «Explicitly provide context via: `--system-prompt[-file]`,
`--append-system-prompt[-file]`, `--add-dir` (CLAUDE.md dirs), `--mcp-config`, `--settings`,
`--agents`, `--plugin-dir`». Тобто прапорець задокументований у власному `--help` лише побічно.

**Що робить кожен** (за `cli-reference.md`, звірено 2026-09-03):

- **`--advisor <model>`** — вмикає серверний advisor-інструмент на сесію: другу модель, яка
  консультує в ключові моменти. Приймає `fable`, `opus`, `sonnet` або повний ID моделі. Має
  пріоритет над налаштуванням `advisorModel`. `fable` потребує окремого доступу до Fable.
  Інтерактивний аналог — команда `/advisor [model|off]`.
- **`--max-turns <turns>`** — обмежує кількість агентних кроків, **тільки в print-режимі** (`-p`).
  Досягнувши межі, завершується з помилкою. За замовчуванням обмеження немає.
  Приклад із доксів: `claude -p --max-turns 3 "query"`.
- **`--restricted`** — обмежений режим для випадків, коли `claude` ганяє оцінювальний харнес на
  спільній машині: прибирає вбудовані інструменти, що запускають команди чи код, і `WebFetch`;
  замикає файлові інструменти в робочих директоріях; читає **тільки** managed-налаштування і
  `--settings`; відмовляє `bypassPermissions` і не створює хмарних сесій. **Потребує v2.1.248+.**
- **`--init`** — виконує Setup-хуки з матчером `init` перед сесією, **тільки в print-режимі**.
- **`--init-only`** — виконує Setup- і `SessionStart`-хуки й **виходить, не починаючи розмови**.
- **`--maintenance`** — виконує Setup-хуки з матчером `maintenance` перед сесією,
  **тільки в print-режимі**.
- **`--append-system-prompt-file <path>`** — дописує вміст файла до стандартного системного
  промпта (файловий брат `--append-system-prompt`).

**Побічно, але корисно для `c05`** (з тієї ж проби, `t-bogus-flag-probe.txt`):
у 2.1.236 `--permission-mode` віддає точний перелік допустимих значень —
`error: option '--permission-mode <mode>' argument '--zzz-bogus' is invalid. Allowed choices are
acceptEdits, auto, bypassPermissions, manual, dontAsk, plan.` Значення `default` у цьому переліку
**немає** — що збігається зі знахідкою попереднього дослідника, що `default` працює, хоч і не
названий. Ще: прапорець **`--bare`** існує і локально, і в доксах — це той самий «мінімальний
режим», який виставляє `CLAUDE_CODE_SIMPLE=1`.

**Що з цього йде в курс:**

У **`c05`** — не таблиця прапорців, а **метод і попередження**. Формулювання:

> `claude --help` — **не повний перелік**. У версії 2.1.236 він показує 62 опції, і при цьому
> мовчить про робочі `--advisor`, `--max-turns`, `--init`, `--init-only`, `--maintenance`,
> `--append-system-prompt-file` — усі шість справді працюють. Тому «немає в `--help`» ще не означає
> «не існує».
>
> Перевірити існування прапорця, нічого не запускаючи, можна так: підставте після нього свідомо
> неіснуючий `--zzz-bogus`.
> ```
> $ claude --max-turns --zzz-bogus
> error: option '--max-turns <turns>' argument '--zzz-bogus' is invalid. must be a number
> ```
> Скарга пішла на `--zzz-bogus` — отже `--max-turns` розпізнано, він існує. А ось так виглядає
> прапорець, якого у вашій збірці немає:
> ```
> $ claude --restricted --zzz-bogus
> error: unknown option '--restricted'
> ```
> Сесія в обох випадках не запускається — розбір аргументів падає раніше. Той самий прийом
> показує допустимі значення: `claude --permission-mode --zzz-bogus` виведе повний перелік режимів.
>
> І зворотний бік: **докси випереджають вашу збірку**. `--restricted` описаний на сайті з поміткою
> «Requires Claude Code v2.1.248 or later» — на 2.1.236 його просто ще немає. Коли команда з доксів
> не працює, спершу подивіться `claude --version` і пошукайте в описі рядок «Requires Claude Code v…».

**Що лишилось невідомим:** нічого щодо існування. Не перевірялась **поведінка** прапорців у роботі
(що саме роблять `--init` / `--maintenance` з конкретними хуками, як `--advisor` впливає на сесію) —
для цього треба реально запускати сесії, що виходить за межі задачі. Опис поведінки взято з
`cli-reference.md`, не з власного експерименту.

---

## Хвіст 5 — WebSocket-транспорт MCP через CLI

**Статус:** закрито

**Відповідь:**
**Ні.** Через `claude mcp add --transport` WebSocket задати **не можна** — прапорець приймає лише
`stdio`, `sse`, `http`. WebSocket-сервер додається **іншою підкомандою**, `claude mcp add-json`,
або руками в `.mcp.json` через поле `"type": "ws"`.

**Докази:**

1. Локальний `--help`, 2026-09-03 (повна вивідка — `00-research/screens/t-mcp-add-help.txt`):
   ```
   $ claude mcp add --help
   -t, --transport <transport>  Transport type (stdio, sse, http). Defaults to
                                stdio if not specified.
   ```
2. Докси, `https://code.claude.com/docs/en/mcp.md`, розділ «Option 4: Add a remote WebSocket server»,
   дослівно: «**The `claude mcp add --transport` flag doesn't accept `ws`.**» І там же, у порівнянні
   з HTTP: «Use HTTP instead when your server only responds to requests, since **HTTP supports OAuth
   and the `claude mcp add --transport` flag, while WebSocket supports neither**.»
3. Той самий розділ, робочий синтаксис (дослівно з доксів):
   ```bash
   claude mcp add-json events-server \
     '{"type":"ws","url":"wss://mcp.example.com/socket","headers":{"Authorization":"Bearer YOUR_TOKEN"}}'
   ```

**Деталі, які варто знати** (усе з `mcp.md`, 2026-09-03):

- Запис `type: "ws"` приймає **ті самі поля**, що й `http`: `url`, `headers`, `headersHelper`,
  `timeout`, `alwaysLoad`.
- **Автентифікація тільки заголовками**: «Authentication is header-only, so pass a static token in
  `headers` or generate one at connect time with `headersHelper`». **OAuth для `ws` не підтримується.**
- Коли брати WebSocket: «WebSocket servers hold a persistent bidirectional connection, which suits
  remote MCP servers that **push events to Claude unprompted**.» Якщо сервер лише відповідає на
  запити — брати HTTP.
- **Пастка, на якій легко згаяти годину:** «**WebSocket servers don't appear in `claude mcp list`
  output.** Use `claude mcp get <name>` or the `/mcp` panel to check them.»
- Якщо інструкція до сервера дає адресу `wss://` — це відразу Option 4, а не `--transport`.

**Розходження `--help` з реальністю, яке варто зафіксувати:** у локальній 2.1.236 опис прапорця
`-H, --header` звучить як «**Set WebSocket headers** (e.g. -H "X-Api-Key: abc123")», хоча
насправді цей прапорець обслуговує HTTP- і SSE-сервери, а WebSocket через `claude mcp add`
взагалі не додається. Це застаріла підказка в самому `--help`, і саме вона могла збити з пантелику.

**Що з цього йде в курс:**

У **`c18` («MCP»)** — окремим коротким врізом після трьох звичних транспортів:

> Транспортів у MCP чотири — `stdio`, `SSE`, `HTTP` і `WebSocket`, — але команда `claude mcp add`
> знає лише три перші: `-t, --transport` приймає `stdio`, `sse`, `http`, і **не приймає `ws`**.
> WebSocket-сервер додають іншою підкомандою:
> ```bash
> claude mcp add-json events-server \
>   '{"type":"ws","url":"wss://mcp.example.com/socket","headers":{"Authorization":"Bearer YOUR_TOKEN"}}'
> ```
> WebSocket потрібен тоді, коли сервер сам **надсилає події**, не чекаючи запиту. Якщо він лише
> відповідає — беріть HTTP: у нього є OAuth, а у `ws` автентифікація тільки заголовками.
> І запам'ятайте одну пастку: **WebSocket-сервери не показуються у виводі `claude mcp list`**.
> Перевіряйте їх через `claude mcp get <ім'я>` або панель `/mcp` — інакше вирішите, що сервер
> не додався, хоча він працює.

**Що лишилось невідомим:** нічого в межах поставленого питання. Живий WebSocket-сервер я не додавав
і не піднімав — це заборонено умовами задачі, тож **фактична поведінка `add-json` з `type: "ws"`
не перевірена на практиці**, лише за доксами й локальним `--help`.

---

## Зведення для планувальника курсу

| Хвіст | Модуль | Підсумок одним рядком |
| --- | --- | --- |
| 1 | `c08` | Колізії немає: `/sandbox` — це **панель** із вкладками Mode / Overrides / Config. Скіла `/sandbox` не існує; цитата в `facts-c01-c08.md` помилкова |
| 2 | `c02`, `c21` | Фактура є й багата, але **терміна «vibe coding» у доксах немає**, а цикл у доксах **чотирифазний** (Explore → Plan → Implement → Commit), не п'ятифазний |
| 3 | `c11` | **Чисел не існує публічно.** Писати механіку (5-годинне + тижневе вікно, 5x/20x) і відсилати до `/usage`, а не до таблиці |
| 4 | `c05` | 6 із 7 прапорців існують, але **жодного немає в `--help`**. `--restricted` немає взагалі — потребує v2.1.248, у нас 2.1.236 |
| 5 | `c18` | WebSocket через `claude mcp add` **не додається**. Тільки `claude mcp add-json` з `"type":"ws"`; і такі сервери **не видно в `claude mcp list`** |

**Наскрізний висновок, який варто винести в саму методику курсу:** три з п'яти хвостів закрились
тим, що **джерела розходяться між собою** — `--help` неповний проти доксів, докси випереджають
встановлену збірку, локальний опис прапорця застарілий, а звіт дослідника суперечить власному
артефакту. Курс мусить учити **перевіряти, а не запам'ятовувати**: фіксувати версію на кожному
екрані, показувати прийом із `--zzz-bogus`, і скрізь, де число нестабільне (ліміти), вести
до команди (`/usage`), а не до таблиці.
