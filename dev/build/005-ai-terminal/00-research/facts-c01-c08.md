# Звірена фактура для курсу «AI Термінал» — модулі c01–c08

> ## ⚠️ ПОПРАВКА ВІД 2026-09-03, ПІСЛЯ ПУБЛІКАЦІЇ ЦЬОГО ЗВІТУ
>
> **Розділ `c06` містить помилку атрибуції: колізії `/sandbox` не існує.**
> Цей звіт стверджує, що `commands.md` описує `/sandbox` як `[Skill]` для Node.js-пісочниці,
> а `sandboxing.md` — як панель Bash-пісочниці. Цільова перевірка (`tails-closed.md`, хвіст 1)
> показала: `/sandbox` існує **в одному екземплярі** — це панель пісочниці Bash. Скіла з таким
> іменем немає ніде — нуль збігів у `commands.md`, в індексі `llms.txt`, у бінарнику 2.1.236,
> у локальних скілах і плагінах, у веб-пошуку точної фрази.
>
> Вирішальний доказ — рядок 84 файла `screens/b-slash-commands-full.txt`, витягнутого того ж
> дня з тієї самої сторінки: `/sandbox | Toggle sandbox mode. Available on supported platforms
> only` — **без** мітки `**Skill.**`, яка стоїть у сусідніх рядках.
>
> Решта звіту не переглядалась і лишається чинною. Актуальні відповіді на всі п'ять відкритих
> питань — у `tails-closed.md`.


**Дата звірки: 2026-09-03.** Локальна збірка: `2.1.236 (Claude Code)`, homebrew cask,
`/opt/homebrew/Caskroom/claude-code/2.1.236/claude`, платформа `darwin-arm64`.
Акаунт звірки: **Claude Max** (`claude auth status --text` → `Login method: Claude Max account`).

**Джерела:** реальні запуски `claude … --help` та інших read-only команд (файли в `screens/`),
офіційні докси `code.claude.com/docs/en/*` і `platform.claude.com/docs/en/about-claude/pricing`.

---

## ⚠️ ГОЛОВНЕ ЗАСТЕРЕЖЕННЯ ДЛЯ ВСЬОГО КУРСУ

**Документація випереджає локальну збірку на ~20 версій.** Докси станом на 2026-09-03 описують
фічі з version-gate `v2.1.238`, `v2.1.242`, `v2.1.246`, `v2.1.247`, `v2.1.248`, `v2.1.251`,
`v2.1.255`, `v2.1.257` — усього цього **немає** у встановленій 2.1.236.

Найважливіші приклади (усі — з таблиць «Requires Claude Code vX» на code.claude.com, 2026-09-03):

| Фіча | Потрібна версія | Є в 2.1.236? |
|---|---|---|
| Модель **Fable 5.1** (`claude-fable-5-1`) | v2.1.255 | НІ |
| `chat:queueSubmit` (`Ctrl+X Enter`) | v2.1.247 | НІ |
| «Yes, and switch to auto mode» у Bash-промпті | v2.1.247 | НІ |
| `keybindingFlavor: "readline"` | v2.1.238 | НІ (v2.1.238 > 2.1.236) |
| `promptCacheTtl` / `subagentPromptCacheTtl` | v2.1.242 | НІ |
| `modelPricing` (контрактні ціни) | v2.1.242 | НІ |
| Рядок `Prompt cache (main)` в `/usage` | v2.1.251 | НІ |
| `/claude-api cost-optimize` | v2.1.247 | НІ |
| `--restricted` | v2.1.248 | НІ |
| `/usage-credits` на self-serve Enterprise | v2.1.248 | НІ |

**Наслідок для курсу:** якщо учень встановить Claude Code через `curl … install.sh` (канал
`latest`), він отримає СВІЖІШУ версію, ніж 2.1.236, і побачить більше, ніж є тут. Якщо через
`brew install --cask claude-code` (канал stable, ~тиждень позаду) — приблизно те, що звірено тут.
**Курс мусить називати версію, на якій знято кожен скріншот.** Не звірено: чи всі перелічені
version-gates уже вийшли у канал `latest` на 2026-09-03.

Ще один локальний факт із `claude doctor`: `Last update attempt: failed (install_failed) — 2026-08-12`.
Тобто автооновлення homebrew-збірки не працює (це очікувано: «Homebrew installations do not
auto-update», docs/en/setup.md).

---

## c01 — Що таке Claude Code і навіщо термінал

### Перевірено

| Факт | Джерело | Дата |
|---|---|---|
| Claude Code — «agentic assistant that runs in your terminal»; вміє все, що можна з командного рядка, не лише код | https://code.claude.com/docs/en/how-claude-code-works.md | 2026-09-03 |
| Агентний цикл має рівно **три фази**: **gather context → take action → verify results**, які «blend together» і повторюються | how-claude-code-works.md, розділ «The agentic loop» | 2026-09-03 |
| Термін для самого Claude Code — **«agentic harness»** навколо моделі: «it provides the tools, context management, and execution environment that turn a language model into a capable coding agent» | how-claude-code-works.md | 2026-09-03 |
| Цикл живлять **два компоненти**: models (міркують) + tools (діють). «Without tools, Claude can only respond with text» | how-claude-code-works.md | 2026-09-03 |
| Вбудовані інструменти діляться на **5 категорій**: File operations · Search · Execution · Web · Code intelligence | how-claude-code-works.md, таблиця | 2026-09-03 |
| Відмінність від inline-асистентів названа прямо: «This is different from inline code assistants that only see the current file» | how-claude-code-works.md, «What Claude can access» | 2026-09-03 |
| Claude має доступ до: файлів проєкту · терміналу · git-стану (гілка, незакомічені зміни, історія) · `CLAUDE.md` · auto memory · налаштованих розширень | how-claude-code-works.md | 2026-09-03 |
| **Три середовища виконання**: Local (твоя машина) · Cloud (Anthropic-managed VMs або self-hosted) · Remote Control (твоя машина, керована з браузера) | how-claude-code-works.md, «Execution environments» | 2026-09-03 |
| Поверхні: terminal, desktop app, IDE extensions, claude.ai/code, Remote Control, Slack, CI/CD | how-claude-code-works.md + https://code.claude.com/docs/en/platforms.md | 2026-09-03 |
| «The interface determines how you see and interact with Claude, but the underlying agentic loop is identical» | how-claude-code-works.md | 2026-09-03 |
| Приклад агентного циклу на 6 кроків для «fix the failing tests» (run tests → read errors → search → read → edit → re-run) | how-claude-code-works.md | 2026-09-03 |

### Застаріло в плані

- Немає розходжень, які вдалось зафіксувати: пункт плану c01 сформульований абстрактно.
- **Але:** формулювання «агент проти чату й проти автокомпліту» краще підперти цитатою доксів про
  inline-асистентів (вище) — це єдине місце, де докси прямо роблять це порівняння.

### Додати, чого в плані немає

- **Термін «agentic harness»** · дає учневі точну ментальну модель: модель окремо, обв'язка окремо.
  Це те, що потім пояснює, чому та сама модель у чаті поводиться інакше. · how-claude-code-works.md
- **Три фази циклу як явна структура** · план каже «агентний цикл простими словами», але докси
  дають готову тріаду gather/act/verify — на ній тримається весь курс. · how-claude-code-works.md
- **«You're part of this loop too»** — переривання й скеровування як частина циклу, а не аварійний
  вихід · новачок думає, що Esc — це «зламати»; докси подають це як штатний режим роботи ·
  how-claude-code-works.md, «Interrupt and steer»
- **Два способи скерувати: `Esc` (зупинити зараз) проти «набрати текст і Enter» (не зупиняючи
  інструмент)** · це різні речі, і новачок про другий не здогадається · how-claude-code-works.md
- **«Delegate, don't dictate»** з прикладом промпту · прямий доксовий припис проти мікроменеджменту ·
  how-claude-code-works.md
- **Три середовища виконання** · план згадує «які поверхні існують», але не розрізняє *де
  виконується код* — а це головне питання безпеки для c06 · how-claude-code-works.md

**Про vibe coding — чесно:** прямої статті «vibe coding» у доксах Claude Code **немає** (перевірено
по повному індексу `claude_code_docs_map.md`, 2026-09-03). Найближче, що є як офіційна позиція —
`best-practices.md` і розділ «Work effectively with Claude Code». Тому цей блок курсу треба або
будувати на власному досвіді автора з явною позначкою «це думка, не докси», або спиратись на
`/docs/en/best-practices` — **не звірено детально**, я цю сторінку не читав.

### Екрани для курсу

- `screens/claude--version.txt` — найперший доказ, що воно взагалі стоїть.
- `screens/claude--help.txt` — показати **обсяг**: 243 рядки, ~90 прапорців, 13 підкоманд. Мета
  екрана в c01 не вивчити його, а показати «це не одна кнопка, це інструмент».
- **Схеми агентного циклу існують як SVG у доксах** і їх можна показати/перемалювати:
  `https://mintcdn.com/claude-code/.../images/agentic-loop.svg` (світла) і `agentic-loop-dark.svg`.
  Alt-текст із доксів дослівно: «Your prompt leads to Claude gathering context, taking action,
  verifying results, and repeating until task complete. You can interrupt at any point.»
- Екрана «агент у роботі» в природі як текстового файлу немає — це анімований TUI. Для курсу
  потрібен **скріншот або asciinema**, знятий вручну.

### Пастки новачка

- **«Це просто чат у терміналі»** → людина пише одне речення й чекає відповіді, замість того щоб
  дати задачу. Виправлення: цитата «Think of delegating to a capable colleague».
- **Очікування, що Claude бачить лише відкритий файл** (звичка з Copilot) → людина вручну вставляє
  код у промпт. Насправді Claude сам знайде й прочитає. Докси: «You don't have to manually add context»
  (quickstart.md, Step 4).
- **Страх перервати** → людина сидить і чекає, поки агент іде не туди. Показати, що `Esc` штатний.
- **Плутанина «Claude Code = claude.ai»** → на claude.ai/code це cloud-сесія на чужій машині, у
  терміналі — локальна. Різні середовища виконання, різні наслідки для файлів.

---

## c02 — Встановлення й перший вхід

### Перевірено

| Факт | Джерело | Дата |
|---|---|---|
| **Існує окрема сторінка для тих, хто ніколи не бачив термінал: `https://code.claude.com/docs/en/terminal-guide.md`** — і її НЕМАЄ у офіційному індексі `claude_code_docs_map.md` | terminal-guide.md (знайдена лише через перехресні посилання) | 2026-09-03 |
| macOS: відкрити термінал — `Cmd + Space` → `Terminal` → `Enter`. Linux — `Ctrl + Alt + T` | terminal-guide.md | 2026-09-03 |
| Windows: `Win + X` → **Windows PowerShell** (або **Terminal**) | terminal-guide.md | 2026-09-03 |
| Як відрізнити PowerShell від CMD: PowerShell показує `PS C:\Users\YourName>`, CMD — `C:\Users\YourName>` без `PS` | terminal-guide.md, setup.md | 2026-09-03 |
| Вставка в термінал: macOS `Cmd + V`, Linux `Ctrl + Shift + V`, Windows `Ctrl + V` або правий клік | terminal-guide.md | 2026-09-03 |
| Native install, macOS/Linux/WSL: `curl -fsSL https://claude.ai/install.sh \| bash` | setup.md, quickstart.md, terminal-guide.md | 2026-09-03 |
| Native install, Windows PowerShell: `irm https://claude.ai/install.ps1 \| iex` | setup.md | 2026-09-03 |
| Native install, Windows CMD: `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd` | setup.md | 2026-09-03 |
| Homebrew: `brew install --cask claude-code`. **Два каски:** `claude-code` = канал stable (~тиждень позаду), `claude-code@latest` = канал latest | setup.md | 2026-09-03 |
| WinGet: `winget install Anthropic.ClaudeCode` | setup.md | 2026-09-03 |
| npm: `npm install -g @anthropic-ai/claude-code`. **Потрібен Node.js 22+** (з v2.1.198). Ставить той самий native binary, Node у рантаймі не використовується | setup.md | 2026-09-03 |
| Linux-пакети: підписані **apt, dnf, apk** репозиторії. Відбиток ключа `31DDDE24DDFAB679F42D7BD2BAA929FF1A7ECACE` | setup.md | 2026-09-03 |
| Системні вимоги: macOS **13.0+** · Windows 10 1809+ / Server 2019+ · Ubuntu 20.04+ · Debian 10+ · Alpine 3.19+ · **4 GB+ RAM**, x64 або ARM64 | setup.md | 2026-09-03 |
| **Free-план claude.ai НЕ дає доступу до Claude Code.** Потрібен Pro, Max, Team, Enterprise або Console | setup.md, «Authenticate» | 2026-09-03 |
| Перевірка: `claude --version` → друкує `2.1.236 (Claude Code)` | `$ claude --version` (локально) | 2026-09-03 |
| `claude doctor` — read-only діагностика **без запуску сесії**, «Reads settings files in the current directory without a trust prompt» | `$ claude doctor --help` + вивід | 2026-09-03 |
| `claude doctor` показує: версію, commit, платформу, package manager, шлях, config install method, статус автооновлень, канал, останню спробу оновлення | `$ claude doctor` (локально) | 2026-09-03 |
| Native-збірки оновлюються самі у фоні; **homebrew, winget, apt, dnf, apk — НЕ оновлюються самі** | setup.md | 2026-09-03 |
| Ручне оновлення: `claude update` (алiас `claude upgrade`) | `$ claude update --help` | 2026-09-03 |
| Канал релізів: налаштування `autoUpdatesChannel` = `"latest"` (дефолт) або `"stable"` | setup.md | 2026-09-03 |
| **`claude install [stable\|latest\|<версія>]`** — встановлює/перевстановлює native-збірку, є `--force` | `$ claude install --help` | 2026-09-03 |
| Автентифікація: `claude auth login` з прапорцями `--claudeai` (дефолт), `--console`, `--sso`, `--email <email>` | `$ claude auth login --help` | 2026-09-03 |
| `claude auth status` — дефолтний вивід **JSON**, є `--text` для людського | `$ claude auth status --help` | 2026-09-03 |
| Усередині сесії: `/login`, `/logout` | commands.md | 2026-09-03 |
| Облікові дані: macOS — **зашифрований Keychain**; Linux — `~/.claude/.credentials.json` (режим `0600`); Windows — `%USERPROFILE%\.claude\.credentials.json` | authentication.md, «Credential management» | 2026-09-03 |
| Порядок пріоритету креденшелів — **7 рівнів**: cloud provider → `ANTHROPIC_AUTH_TOKEN` → `ANTHROPIC_API_KEY` → `apiKeyHelper` → `CLAUDE_CODE_OAUTH_TOKEN` → Anthropic profile/federation → OAuth з `/login` | authentication.md, «Authentication precedence» | 2026-09-03 |
| `claude setup-token` — однорічний OAuth-токен для CI, **нікуди не зберігається**, треба скопіювати в `CLAUDE_CODE_OAUTH_TOKEN`. Потребує підписки | `$ claude setup-token --help` + authentication.md | 2026-09-03 |
| Поверхні (таблиця «Where to run Claude Code»): CLI · Desktop · VS Code · JetBrains · Web · Mobile | platforms.md | 2026-09-03 |
| «The CLI is the most complete surface… scripting and the Agent SDK are CLI-only» | platforms.md | 2026-09-03 |
| Windows: **три варіанти** — Native Windows (пісочниця НЕ підтримується) · WSL 2 (підтримується) · WSL 1 (не підтримується) | setup.md, таблиця «Set up on Windows» | 2026-09-03 |
| На native Windows без Git for Windows Claude Code використовує **PowerShell tool** замість Bash | setup.md | 2026-09-03 |

### Застаріло в плані

- **План каже «native install, brew, winget, npm» → насправді способів шість:** native installer,
  Homebrew (два каски!), WinGet, npm, **apt/dnf/apk (підписані репозиторії)**, і `claude install`
  як окрема команда для перевстановлення/пінінгу версії. (setup.md)
- **План каже «`claude migrate-installer`» (згадана в завданні як команда, що змінює стан) →
  такої команди в 2.1.236 НЕМАЄ.** У списку `Commands:` виводу `claude --help` її немає; її роль
  виконує `claude install`. Джерело: `$ claude --help` (локально, 2026-09-03).
- **🔴 `claude config` як підкоманда БІЛЬШЕ НЕ ІСНУЄ.** Завдання просило звірити
  `claude config --help` — звірено, і результат негативний: вивід ідентичний головному
  `claude --help`, тобто `config` розібрано як текст промпту, а не як команду. Контрольний тест
  `claude bogus-nonexistent --help` дає рівно той самий вивід. У списку `Commands:` виводу
  `claude --help` жодного `config` немає. **Налаштування тепер лише через сесійну `/config`,
  через `--settings`, або правкою `settings.json` руками.** Доказ:
  `screens/claude-config--help.txt`. (перевірено локально, 2.1.236, 2026-09-03)
- **План каже «підписка проти API-ключа» як бінарний вибір → насправді типів автентифікації сім**
  (див. таблицю precedence вище), і серед них є новий «Sign in without an API key» через
  Anthropic profile (але він потребує v2.1.242 — **у 2.1.236 недоступний**). (authentication.md)

### Додати, чого в плані немає

- **`terminal-guide.md` як окремий, спеціально написаний вступ для нетехнічних** · це буквально
  той самий цільовий читач, що й у курсу; гріх не використати · code.claude.com/docs/en/terminal-guide.md
- **Два каски Homebrew і що вони означають** · людина ставить `claude-code`, читає докси про фічу
  з новішої версії й не розуміє, чому в неї її нема. Це ГОЛОВНА пастка курсу · setup.md
- **`claude auth status --text`** · швидка відповідь на «а я взагалі під ким зайшов і що в мене за
  план» — критично для c06/c08, де все залежить від плану · `$ claude auth status --help`
- **Розділ «Uninstall Claude Code»** з точними командами для кожного способу + окремо «Remove
  configuration files» (`rm -rf ~/.claude`, `rm ~/.claude.json`) · курс має вміти відкотити все ·
  setup.md
- **Перевірка підпису бінарника** (GPG-відбиток, `manifest.json.sig`) · для параноїдальної/корпоративної
  аудиторії, і це реальна відповідь на «а це безпечно ставити через curl \| bash» · setup.md
- **`CLAUDE_CODE_GIT_BASH_PATH`** для Windows · без цього на Windows не працює Bash tool · setup.md
- **Alpine потребує `apk add bash curl libgcc libstdc++ ripgrep` + `USE_BUILTIN_RIPGREP=0`** ·
  setup.md

### Екрани для курсу

- `screens/claude--version.txt` — `$ claude --version` → `2.1.236 (Claude Code)`. Показати формат
  «число + `(Claude Code)`».
- `screens/claude-doctor.txt` — **найцінніший екран модуля.** Реальний вивід із живої машини:
  `Package manager: homebrew`, `Auto-updates: Managed by package manager`,
  `Last update attempt: failed (install_failed) — 2026-08-12`, `No installation issues found.`
  Показати саме на ньому, як читати діагностику і що рядок про невдале оновлення — не помилка
  установки, а наслідок вибору homebrew.
- `screens/claude-auth-status.txt` — `Login method: Claude Max account` (email заредаговано).
- `screens/claude-install--help.txt`, `screens/claude-update--help.txt`, `screens/claude-auth-login--help.txt`,
  `screens/claude-setup-token--help.txt`.
- **Екран першого входу (браузерний OAuth) не існує як текст** — це інтерактивний TUI. Дослівно,
  що людина побачить (authentication.md): відкриється браузер; якщо не відкрився — «press `c` to
  copy the login URL»; якщо браузер показав код замість редиректу — вставити його на запит
  `Paste code here if prompted`; при успіху термінал друкує `Login successful` і просить `Enter`.
  Це треба зняти скріншотами вручну.

### Пастки новачка

- **Поставив через brew → «у мене немає фічі з доксів».** Побачить: команда каже
  `Unknown command: /…` або прапорець просто відсутній у `--help`. Виплутатись: `claude doctor`
  покаже `Package manager: homebrew`; далі або `brew upgrade claude-code`, або перейти на
  `claude-code@latest`, або на native install.
- **Ввів команду PowerShell у CMD.** Побачить дослівно: `'irm' is not recognized as an internal or
  external command`. І навпаки, CMD-команда в PowerShell: `The token '&&' is not a valid statement
  separator`. Обидва рядки — з setup.md, їх варто дати як діагностичну табличку.
- **`command not found: claude` після успішної установки.** Це PATH. Фікс для zsh:
  `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc`, потім **новий**
  термінал. (terminal-guide.md)
- **Windows PowerShell (x86)** замість звичайного → `Claude Code does not support 32-bit Windows`.
  (terminal-guide.md)
- **macOS < 13.0** → `dyld: cannot load`, `dyld: Symbol not found` або `built for Mac OS X 13.0`.
- **Безкоштовний claude.ai** → людина реєструється, входить, і не розуміє, чому не працює.
  Free-план не дає Claude Code взагалі. (setup.md)
- **`ANTHROPIC_API_KEY` у оточенні при активній підписці** → ключ перебиває підписку, і якщо він
  від мертвої організації, все падає з помилками авторизації. Фікс дослівно з доксів:
  `unset ANTHROPIC_API_KEY`, потім `/status` для перевірки. (authentication.md)
- **`sudo npm install -g`** → докси прямо забороняють («Do NOT use»), веде до проблем із правами.

---

## c03 — Перша сесія: проси → дивись → підтверджуй

### Перевірено

| Факт | Джерело | Дата |
|---|---|---|
| Запуск: `cd /path/to/your/project` → `claude` | quickstart.md, Step 3 | 2026-09-03 |
| Що видно на старті: «the Claude Code prompt with the version, current model, and working directory shown above it» | quickstart.md, Step 3 | 2026-09-03 |
| Перші підказки на екрані: «Type `/help` for available commands or `/resume` to continue a previous conversation» | quickstart.md, Step 3 | 2026-09-03 |
| `claude "task"` — старт інтерактивної сесії з початковим промптом | `$ claude --help` (аргумент `prompt`) + quickstart.md | 2026-09-03 |
| `claude -p "query"` — виконати й вийти (неінтерактивно) | `$ claude --help` | 2026-09-03 |
| Вихід: `/exit` (алiас `/quit`), або `Ctrl+D` двічі, або `exit` | quickstart.md + commands.md + terminal-guide.md | 2026-09-03 |
| `Esc` — перервати Claude негайно; поточний виклик інструмента скасовується | how-claude-code-works.md, «Interrupt and steer» | 2026-09-03 |
| `Esc` `Esc` — при **порожньому** полі вводу відкриває меню rewind; при непорожньому — **очищає текст** (і зберігає його в історію, повернути через `Up`) | checkpointing.md, «Rewind and summarize» + Note | 2026-09-03 |
| Набрати корекцію і `Enter` **не зупиняючи** інструмент: «Claude reads it as soon as the current action completes and adjusts» | how-claude-code-works.md | 2026-09-03 |
| **Trust dialog існує і пропускається в неінтерактивному режимі**: «The workspace trust dialog is skipped when Claude is run in non-interactive mode (via -p, or when stdout is not a TTY…). Only use this in directories you trust» | `$ claude --help`, опис `-p, --print` | 2026-09-03 |
| Дефолтний режим дозволів на Pro/Max/Team в терміналі — **auto mode**, і Claude «edits most files and runs most commands without asking you» | quickstart.md, Step 5 + permission-modes.md | 2026-09-03 |
| **Виняток:** «Your first session after you install Claude Code or upgrade» стартує в `default` (Manual), якщо фіче-флаги не встигли приїхати | permission-modes.md, таблиця «Built-in starting permission mode» | 2026-09-03 |
| Перший раз, коли auto mode вмикається дефолтом, Claude Code показує **одноразове повідомлення** вгорі сесії з лінком на докси | permission-modes.md | 2026-09-03 |
| Перевірити стан: `/status` — «current model, effort level, context usage, and background tasks» | commands.md | 2026-09-03 |
| `/help` — «Show help and available commands» | commands.md | 2026-09-03 |
| Приклади перших промптів дослівно: `what does this project do?`, `what technologies does this project use?`, `where is the main entry point?`, `explain the folder structure` | quickstart.md, Step 4 | 2026-09-03 |
| «Claude Code reads your project files as needed. You don't have to manually add context.» | quickstart.md, Note у Step 4 | 2026-09-03 |
| Діалог дозволу: `Y`/`Enter` = confirm, `N`/`Escape` = decline, `Space` = toggle, стрілки — між опціями, `Tab` = наступне поле / додати коментар до відповіді | keybindings.md, «Confirmation actions» + interactive-mode.md | 2026-09-03 |
| `Shift+Tab` на діалозі дозволу: «selects the option that allows the action for the rest of the session, when the prompt offers that option» | keybindings.md, `confirm:cycleMode` | 2026-09-03 |
| Перегляд дифів: `/diff` — інтерактивний переглядач, стрілки вліво/вправо між git-дифом і окремими ходами Claude, вгору/вниз по файлах, `Enter` — відкрити, `Esc` — назад | commands.md | 2026-09-03 |

### Застаріло в плані

- **План припускає «діалог дозволу» як базовий досвід першої сесії → на Pro/Max/Team його
  здебільшого НЕ БУДЕ.** Сесія стартує в `auto`, де класифікатор схвалює замість людини. Учень
  побачить, як Claude просто робить. Це перевертає драматургію модуля: спершу треба показати
  `Shift+Tab` → Manual, щоб діалог узагалі з'явився. (permission-modes.md + quickstart.md Step 5)
- **Уточнення, яке рятує модуль:** у **найпершій сесії після встановлення** режим таки буде Manual
  («first session after an install or upgrade»), бо фіче-флаги ще не приїхали. Тобто учень на
  першому запуску побачить діалоги, а на другому — вже ні, і не зрозуміє чому. Це треба пояснити
  прямо. (permission-modes.md)
- **План каже «Esc / Esc Esc» одним пунктом → це дві різні речі з умовою.** `Esc Esc` робить
  rewind ЛИШЕ при порожньому полі вводу; інакше просто чистить чернетку. (checkpointing.md)

### Додати, чого в плані немає

- **Trust dialog при першому вході в нову папку** · перше, що побачить людина, і план про нього
  мовчить · `claude --help`, опис `-p`
- **Одноразовий банер про auto mode** · пояснює, чому «воно не питає» · permission-modes.md
- **`/status` як перша діагностична звичка** · «в якому я режимі, на якій моделі, скільки контексту» ·
  commands.md
- **`/diff` окремо від дозволів** · план каже «читання кроків інструментів і дифів», але `/diff` —
  окремий повноцінний переглядач із власною клавіатурою · commands.md
- **Різниця «перервати» vs «доповнити»** (`Esc` проти «текст + Enter») · how-claude-code-works.md
- **Черга повідомлень:** якщо набрати й `Enter`, поки Claude працює, повідомлення стає в чергу і
  показується над полем вводу; `Up` з першого рядка забирає його назад у поле · interactive-mode.md,
  «Queue messages while Claude works»
- **`/powerup`** — вбудовані інтерактивні міні-уроки з анімованими демо · буквально готовий
  onboarding усередині продукту, ідеальне домашнє завдання після c03 · commands.md

### Екрани для курсу

- Реальні екрани першої сесії — **інтерактивні, у природі як .txt не існують**. Потрібне ручне
  зняття. Що саме показати, за доксами:
  1. **Trust dialog** — при першому запуску в незнайомій папці.
  2. **Стартовий екран** — версія, поточна модель, робоча папка над полем вводу (quickstart.md Step 3).
  3. **Банер auto mode** — одноразовий, угорі сесії (permission-modes.md).
  4. **Рядок статусу режиму** — дослівні варіанти з доксів: `⏸ manual mode on` (сірий),
     `⏵⏵ accept edits on`, `⏸ plan mode on`, `⏵⏵ auto mode on`, `⏵⏵ don't ask on`,
     `⏵⏵ bypass permissions on` (permission-modes.md).
  5. **Діалог дозволу** — щоб його отримати, спершу `Shift+Tab` у Manual.
- `screens/claude--help.txt` — розділ `Commands:` унизу, як карта того, що взагалі є.

### Пастки новачка

- **Запустив `claude` не в тій папці.** Claude бачить не той проєкт. Виплутатись: `/status` покаже
  робочу папку; `/cd <path>` перенесе сесію з розмовою; `/add-dir <path>` додасть ще одну папку.
- **Чекає діалогу дозволу, а його немає** (auto mode) → думає, що зламалось, або лякається. Фікс:
  `Shift+Tab` до `⏸ manual mode on`.
- **Тисне `Esc Esc`, маючи текст у полі** → замість rewind текст зникає. Він не втрачений: `Up`
  повертає. (checkpointing.md)
- **Тисне `Ctrl+C` один раз, щоб вийти** → це перерве Claude / очистить ввід, але не вийде. Вихід —
  `Ctrl+D` **двічі** (у межах 800 мс, keybindings.md `app:exit`) або `/exit`.
- **Пише надто коротко** («fix the bug») → докси прямо радять формат: «fix the login bug where users
  see a blank screen after entering wrong credentials» (quickstart.md, «Be specific with your requests»).
- **Не знає, що можна просто спитати про сам Claude Code** — «what can Claude Code do?»,
  «how do I create custom skills in Claude Code?» — це офіційно рекомендований спосіб (quickstart.md Step 4).

---

## c04 — Інтерфейс і клавіатура (повна шпаргалка)

### Перевірено — гарячі клавіші (загальні)

Джерело для всієї секції: https://code.claude.com/docs/en/interactive-mode.md і
https://code.claude.com/docs/en/keybindings.md, обидві звірені 2026-09-03.

| Клавіша | Дія |
|---|---|
| `Ctrl+C` | Interrupt, або очистити ввід. **Не перепризначається** (hardcoded) |
| `Ctrl+D` | Вихід. Двічі протягом **800 мс**. **Не перепризначається** |
| `Ctrl+G` або `Ctrl+X Ctrl+E` | Відкрити ввід у зовнішньому редакторі |
| `Ctrl+L` | Перемалювати екран |
| `Ctrl+O` | Перемкнути transcript viewer (докладний лог) |
| `Ctrl+R` | Зворотний пошук по історії |
| `Ctrl+V` (iTerm2: `Cmd+V`; Windows/WSL: `Alt+V`) | Вставити зображення з буфера |
| `Ctrl+B` | Відправити задачу у фон |
| `Ctrl+T` | Показати/сховати чеклист задач Claude |
| `Ctrl+S` | Stash / повернути промпт |
| `Ctrl+Z` | Призупинити процес (SIGTSTP) |
| `Tab` | Прийняти автодоповнення, або додати коментар до відповіді на дозвіл |
| `Esc` | Перервати Claude, або закрити діалог |
| `Esc` `Esc` | Очистити чернетку, або rewind (якщо поле порожнє) |
| `Shift+Tab` | Цикл режимів дозволів (**на Windows без VT-режиму — `Alt+M`**) |
| `Option+P` / `Alt+P` | Перемкнути модель |
| `Option+T` / `Alt+T` | Перемкнути extended thinking |
| `Option+O` / `Alt+O` | Перемкнути fast mode |
| `Ctrl+X Ctrl+K` | Зупинити всі фонові субагенти сесії |
| `?` на порожньому вводі | Панель підказок по клавішах |

**Редагування тексту:** `Ctrl+A` початок рядка · `Ctrl+E` кінець · `Ctrl+K` видалити до кінця ·
`Ctrl+U` видалити до початку · `Ctrl+W` видалити попереднє слово · `Ctrl+Y` вставити видалене ·
`Alt+Y` (після `Ctrl+Y`) цикл історії вставок · `Alt+B`/`Alt+F` по словах · `Alt+D` видалити
наступне слово · `Ctrl+_` або `Ctrl+Shift+-` скасувати правку вводу.

> **Важливо для macOS:** усі шорткати з `Alt`/`Option` (`Alt+B`, `Alt+F`, `Alt+D`, `Alt+Y`, `Alt+P`)
> **не працюють**, поки в терміналі не увімкнено «Option as Meta». (interactive-mode.md, Note)

**Багаторядковий ввід — 5 способів:** `\` + `Enter` (працює всюди) · `Option+Enter` (після
налаштування Option as Meta) · `Shift+Enter` (нативно в iTerm2, WezTerm, Ghostty, Kitty, Warp,
Apple Terminal, Windows Terminal) · `Ctrl+J` (працює в будь-якому терміналі без налаштування) ·
просто вставити багаторядковий текст.

**Швидкі префікси:** `/` — команда або скіл · `!` — shell-режим · `@` — згадка шляху до файлу ·
`:` — emoji shortcode (потребує v2.1.217, **є** в 2.1.236) · `?` на порожньому — панель підказок.

**Зарезервовані, не перепризначаються:** `Ctrl+C`, `Ctrl+D`, `Ctrl+M` (=Enter), `Ctrl+[` (=Escape),
`Ctrl+I` (=Tab), `Ctrl+H` (ASCII backspace), `Caps Lock`.

**Конфлікти з мультиплексорами:** `Ctrl+B` = префікс tmux (натиснути двічі) · `Ctrl+A` = префікс
GNU screen · `Ctrl+Z` = SIGTSTP.

### Перевірено — прапорці CLI (з живого `--help`, не з доксів)

| Прапорець | Що робить |
|---|---|
| `claude` | Інтерактивна сесія |
| `claude "query"` | Інтерактивна сесія з початковим промптом |
| `-p, --print` | Вивести відповідь і вийти |
| `-c, --continue` | Продовжити останню розмову в цій папці |
| `-r, --resume [value]` | Відновити за ID/іменем, або відкрити пікер |
| `--add-dir <directories...>` | Додаткові папки для доступу |
| `-n, --name <name>` | Ім'я сесії (видно в полі вводу, `/resume`, заголовку термінала) |
| `--model <model>` | Модель на сесію |
| `--effort <level>` | `low, medium, high, xhigh, max` |
| `--permission-mode <mode>` | Див. c06 |
| `-d, --debug [filter]` | Дебаг із фільтром категорій (напр. `"api,hooks"` або `"!1p,!file"`) |
| `--safe-mode` | Вимкнути ВСІ кастомізації для діагностики; ставить `CLAUDE_CODE_SAFE_MODE=1` |
| `--bare` | Мінімальний режим; ставить `CLAUDE_CODE_SIMPLE=1` |
| `-w, --worktree [name]` | Створити git worktree для сесії |
| `--bg, --background` | Стартувати як фоновий агент |
| `--cloud [опис\|id\|url]` | Створити/приєднатись до cloud-сесії |
| `--teleport [session]` | Забрати web-сесію в локальний термінал |
| `--remote-control [name]` | Сесія з увімкненим Remote Control |
| `-v, --version` | Версія |

Повний перелік — `screens/claude--help.txt` (243 рядки).

### Перевірено — слеш-команди

Повний актуальний список слеш-команд є на https://code.claude.com/docs/en/commands.md
(звірено 2026-09-03). Ключові для c04:

`/help` · `/exit` (=`/quit`) · `/clear` (=`/reset`, `/new`) · `/compact [instructions]` ·
`/context [all]` · `/status` · `/usage` (=`/cost`) · `/model [model]` · `/effort [level|auto|status]` ·
`/config [key=value]` (=`/settings`) · `/permissions` (=`/allowed-tools`) · `/diff` · `/copy [N]` ·
`/export [filename]` · `/rewind [N|description]` · `/resume [name]` · `/rename <name>` ·
`/branch [name]` · `/fork [prompt]` · `/add-dir <path>` · `/cd <path>` · `/memory` · `/init` ·
`/hooks` · `/mcp` · `/plugin` · `/skills` · `/agents` · `/doctor` (=`/checkup`) · `/bug` (=`/share`) ·
`/feedback` · `/keybindings` · `/theme` · `/tui` (=`/fullscreen`) · `/vim` · `/loop [interval] [prompt]`
(=`/proactive`) · `/plan [description]` · `/fast [on|off]` · `/autocompact [auto|<tokens>]` ·
`/btw [question]` · `/focus` · `/goal [condition|clear]` · `/insights` · `/powerup` · `/mobile` ·
`/desktop` (=`/app`) · `/remote-control` · `/teleport` · `/background [prompt]` (=`/bg`) ·
`/subtask <instruction>` · `/task-log` · `/color` · `/radio` · `/login` · `/logout` ·
`/privacy-settings` · `/install-github-app` · `/install-slack-app` · `/heapdump` (прихована).

**Команди-скіли** (позначені `[Skill]` у доксах — це промпт, а не код CLI): `/code-review` (=`/review`) ·
`/security-review` · `/simplify` · `/verify` · `/doctor` · `/debug` · `/sandbox` · `/vim` ·
`/web-search` · `/batch` · `/dataviz` · `/design` · `/design-sync` · `/claude-api` ·
`/fewer-permission-prompts` · `/loop`. Команда-workflow: `/deep-research`.

### Застаріло в плані

- **План каже «кастомні команди злиті зі Skills» → підтверджено і уточнено.** Докси
  (commands.md, «Notes on Custom Commands and Skills») кажуть: bundled-скіли позначені `[Skill]` і
  «work like skills you write yourself — a prompt handed to Claude», а «To add your own commands,
  see the skills documentation». Тобто окремої сутності «кастомна команда» більше не документують
  взагалі — є тільки скіли.
- **План згадує `\` серед клавіш → уточнення: це `\` + `Enter`**, і це лише 1 із 5 способів
  багаторядкового вводу. (interactive-mode.md)
- **План згадує `/cost` → це просто алiас до `/usage`.** (commands.md)
- **План не розрізняє `Ctrl+O` і `/diff`** — це різні речі: `Ctrl+O` показує transcript (сирий лог),
  `/diff` показує зміни файлів.
- **`/pr-comments` ВИДАЛЕНА у v2.1.91** — якщо вона є в старому плані, її треба прибрати.
  (commands.md)
- **`/agents` змінила поведінку у v2.1.198**: тепер лише друкує нагадування редагувати
  `.claude/agents/`, а не відкриває інтерфейс. (commands.md)

### Додати, чого в плані немає

- **`--safe-mode`** · рятівна команда, коли учень наламав конфігів: вимикає CLAUDE.md, скіли,
  плагіни, хуки, MCP, команди, агентів, теми, keybindings — усе, лишаючи авторизацію й дозволи ·
  `$ claude --help`
- **`?` на порожньому вводі** — вбудована шпаргалка по клавішах прямо в продукті · interactive-mode.md
- **`/keybindings` і `~/.claude/keybindings.json`** · повна кастомізація: 19 контекстів,
  синтаксис акордів (`ctrl+k ctrl+s`), відв'язування через `null`, валідація з попередженнями ·
  keybindings.md
- **Застереження про macOS «Option as Meta»** · без нього половина шорткатів курсу просто не працює,
  і учень вирішить, що курс бреше · interactive-mode.md
- **Конфлікт `Ctrl+B` з tmux** · дуже поширено серед цільової аудиторії · keybindings.md
- **Некирилична розкладка:** докси окремо описують, що Ctrl-шорткати під кирилицею матчаться за
  **фізичною позицією клавіші US-розкладки**, але лише в терміналах з Kitty keyboard protocol
  (Ghostty, Kitty, WezTerm, iTerm2). В інших — не спрацюють взагалі. **Це прямо стосується
  україномовної аудиторії курсу.** До v2.1.247 не працювало і в Kitty-терміналах — тобто **у
  2.1.236 не працює.** · keybindings.md, «Non-US keyboard layouts»
- **Shell-режим `!` детальніше, ніж «префікс»** · додає команду і вивід у контекст, показує
  прогрес наживо, **Claude автоматично відповідає на вивід** («run `! npm test` and get an
  explanation of the failures without a second prompt»), вихід — `Escape`/`Backspace`/`Ctrl+U` на
  порожньому · interactive-mode.md
- **Черга повідомлень і `Up` щоб забрати назад** · interactive-mode.md
- **`/copy [N]`** з інтерактивним вибором блоків коду і клавішею `w` для запису у файл (корисно по SSH) ·
  commands.md
- **`/tui` — повноекранний режим** з мишею, прокруткою, виділенням тексту, `?` у transcript ·
  commands.md + keybindings.md (контекст `Scroll`)
- **Vim-режим** (`/config` → Editor mode) із власним набором клавіш і `vimInsertModeRemaps` ·
  interactive-mode.md

### Екрани для курсу

- `screens/claude--help.txt` — **головний артефакт модуля.** Дослівний вивід усіх ~90 прапорців.
- `screens/claude-mcp--help.txt`, `claude-plugin--help.txt`, `claude-agents--help.txt`,
  `claude-auth--help.txt`, `claude-auto-mode--help.txt`, `claude-project--help.txt`,
  `claude-import--help.txt`, `claude-ultrareview--help.txt`, `claude-install--help.txt`,
  `claude-doctor--help.txt`, `claude-update--help.txt`, `claude-setup-token--help.txt`,
  `claude-mcp-add--help.txt`, `claude-mcp-serve--help.txt`, `claude-plugin-marketplace--help.txt`,
  `claude-plugin-install--help.txt`, `claude-plugin-eval--help.txt`, `claude-plugin-validate--help.txt`,
  `claude-plugin-list--help.txt`, `claude-auth-login--help.txt`, `claude-auth-status--help.txt`.
- `screens/permission-mode-enum-test.txt` — доказ допустимих значень прямо з бінарника.
- **Меню `/` (список команд) і панель `?` — інтерактивні, треба знімати вручну.**

### Пастки новачка

- **Тисне `Shift+Enter` для нового рядка в терміналі, який його не підтримує** → відправляє
  повідомлення недописаним. Універсальний фікс: `Ctrl+J` (працює скрізь) або `\` + `Enter`.
- **Тисне `Ctrl+C`, щоб скопіювати** → у терміналі це перериває Claude. Копіювання — `/copy`, або
  `Ctrl+Shift+C`/`Cmd+C` у fullscreen-режимі.
- **`Alt+`-шорткати не працюють на macOS** → людина вирішує, що зламано. Фікс: увімкнути «Option as
  Meta» в налаштуваннях термінала.
- **Кирилична розкладка з'їдає Ctrl-шорткати** (див. вище) → перемкнути на латиницю перед шорткатом.
- **`Ctrl+B` під tmux** не фонує задачу, бо його з'їдає tmux → натиснути двічі, або використати
  акорд `Ctrl+X Ctrl+B`.
- **Тисне `/` посеред речення, чекаючи меню** → меню відкривається лише коли `/` **на початку**
  вводу. Так само `!`.
- **Не знає, що `Up` дістає промпти з ПОПЕРЕДНІХ сесій цієї папки** → переписує вручну.
  (interactive-mode.md, «Command history»)

---

## c05 — Контекстне вікно

### Перевірено

| Факт | Джерело | Дата |
|---|---|---|
| Контекст містить: історію розмови, вміст файлів, вивід команд, `CLAUDE.md`, auto memory, завантажені скіли, системні інструкції | how-claude-code-works.md, «The context window» | 2026-09-03 |
| **Що вантажиться ДО того, як ти щось написав** (з інтерактивної симуляції в доксах, репрезентативні числа): System prompt ~4200 ток. · Auto memory (MEMORY.md) ~680 · Environment info ~280 · MCP tools (deferred) ~120 · далі CLAUDE.md, описи скілів тощо | https://code.claude.com/docs/en/context-window.md (масив `EVENTS`) | 2026-09-03 |
| Симуляція в доксах побудована на `MAX = 200000` токенів | context-window.md | 2026-09-03 |
| Auto memory: «The first 200 lines or 25KB of MEMORY.md, whichever comes first, load at the start of each session» | how-claude-code-works.md | 2026-09-03 |
| `/context` — «Visualize current context usage as a colored grid», показує підказки по оптимізації, роздування пам'яті, попередження про ємність. `/context all` розгортає розбивку у fullscreen | commands.md | 2026-09-03 |
| `/compact [instructions]` — замінює історію структурованим самарі, можна дати фокус: `/compact focus on the auth bug fix` | commands.md, context-window.md | 2026-09-03 |
| `/clear [name]` — нова розмова з порожнім контекстом; попередня зберігається, повернути через `/resume` | commands.md, sessions.md | 2026-09-03 |
| **Ключова різниця:** «To free up context while continuing the same conversation, use `/compact` instead» (з опису `/clear`) | commands.md | 2026-09-03 |
| **`/clear` коштує нуль, `/compact` коштує грошей:** «`/compact` reads the conversation it summarizes, so compacting a large context is itself a large request… When you want a fresh start instead of continuity, `/clear` costs nothing» | costs.md, «Why usage climbs in a long session» | 2026-09-03 |
| **Що переживає компакцію** (таблиця): system prompt і output style — незмінні · CLAUDE.md проєкту й unscoped rules — **перечитуються з диска** · auto memory — перечитується · план із plan mode — перечитується · rules з `paths:` — перезавантажуються коли Claude читає відповідний файл · **файли, які Claude читав — перечитуються до п'яти, найсвіжіші за датою зміни** · тіла викликаних скілів — перевставляються з лімітом **5 000 токенів на скіл і 25 000 сумарно**, найстаріші відкидаються першими | context-window.md, «What survives compaction» | 2026-09-03 |
| Файл понад 5 000 токенів повертається після компакції як **посилання на шлях без вмісту**, показаний як `Referenced file` замість `Read` | context-window.md | 2026-09-03 |
| Truncation скіла лишає **початок** файлу → «put the most important instructions near the top of `SKILL.md`» | context-window.md | 2026-09-03 |
| **Авто-компакція за замовчуванням** спрацьовує на межі контекстного вікна моделі, з винятками: Sonnet 4.6 / Opus 4.6 без extended context — на межі **200K**; Sonnet 5 — **~967K токенів**; cloud-сесії — «as the conversation approaches the model's limit» | model-config.md, «Default auto-compact thresholds» + «Sonnet 5 context window» | 2026-09-03 |
| `/autocompact [auto\|<tokens>]` — задати вікно авто-компакції. Приймає **100K–1M**, форми: `200000`, `500k`, `1M`, або голе число 100–1000 (означає тисячі). Зберігається в `autoCompactWindow` | commands.md, model-config.md | 2026-09-03 |
| Прапорець `--autocompact <auto\|tokens>` і змінна `CLAUDE_CODE_AUTO_COMPACT_WINDOW` (приймає лише голе число). Пріоритет: змінна > прапорець > команда > налаштування | model-config.md | 2026-09-03 |
| **Thrashing-захист:** якщо один файл/вивід такий великий, що контекст переповнюється одразу після кожного самарі, Claude Code «stops auto-compacting after a few attempts and shows an error instead of looping» | how-claude-code-works.md | 2026-09-03 |
| Часткова компакція через `/rewind`: **Summarize from here** / **Summarize up to here** | checkpointing.md, context-window.md | 2026-09-03 |
| MCP-схеми **відкладені за замовчуванням** (tool search): у контекст ідуть лише імена інструментів і інструкції сервера, повні схеми — на вимогу. `ENABLE_TOOL_SEARCH=auto` / `=false` міняють це | how-claude-code-works.md, context-window.md | 2026-09-03 |
| Prompt caching: кеш матчиться по **префіксу**, точно; «a change anywhere in the prefix recomputes everything after it»; **немає** пофайлового чи посегментного кешування | prompt-caching.md, «How the cache is organized» | 2026-09-03 |
| **Три шари запиту** (від найстабільнішого): System prompt (інструкції, визначення інструментів, output style) → Project context (CLAUDE.md, auto memory, unscoped rules) → Conversation | prompt-caching.md, таблиця | 2026-09-03 |
| Модель і effort level **входять у ключ кешу**, хоч і не є текстом промпту → зміна кожного з них перерахує весь запит | prompt-caching.md | 2026-09-03 |
| **TTL кешу:** на підписці в межах включеного ліміту — **1 година** для основної розмови; на usage credits, API-ключі, cloud-провайдерах — **5 хвилин**. Субагенти/workflow/компакція — 5 хв завжди | prompt-caching.md, таблиця «Which TTL each request gets» | 2026-09-03 |
| **9 дій, що вбивають кеш:** switching models · changing effort level · turning on fast mode · connecting/disconnecting MCP server · enabling/disabling a plugin · denying an entire tool · compacting · accumulating many images · upgrading Claude Code | prompt-caching.md | 2026-09-03 |
| **Дії, що кеш ЗБЕРІГАЮТЬ:** правка файлів у репо · правка CLAUDE.md посеред сесії · зміна output style · **зміна режиму дозволів** · виклик скілів і команд · `/recap` · `/rewind` · спавн субагента | prompt-caching.md, «Actions that keep the cache» | 2026-09-03 |
| **Правка CLAUDE.md посеред сесії не інвалідує кеш, АЛЕ І НЕ ЗАСТОСОВУЄТЬСЯ.** Новий вміст завантажиться на наступному `/clear`, `/compact` або рестарті | prompt-caching.md | 2026-09-03 |
| Ціна кеш-читання: «billed at roughly 10% of the standard input rate» | prompt-caching.md | 2026-09-03 |
| Кеш скоупиться на **машину + папку**: system prompt містить робочу папку, платформу, шелл, версію ОС → дві сесії в різних папках не бачать кеш одна одної, включно з worktree того самого репо | prompt-caching.md, «Cache scope» | 2026-09-03 |
| Модель 1M-контексту: Fable 5.1, Fable 5, Sonnet 5, Opus 4.6+, Sonnet 4.6. Вибір через `[1m]`: `/model opus[1m]`, `/model sonnet[1m]`. **Sonnet 5 на Anthropic API завжди 1M, без суфікса** | model-config.md | 2026-09-03 |
| Доступність 1M за планами: Max/Team/Enterprise — Opus 1M включений; Pro — за usage credits; Sonnet 4.6 1M — за credits на всіх | model-config.md, таблиця «Plan Availability» | 2026-09-03 |
| `CLAUDE_CODE_DISABLE_1M_CONTEXT=1` — вимкнути 1M, повернутись на 200K | model-config.md | 2026-09-03 |
| Стратегії скорочення: `/clear` між задачами · `/compact` з інструкціями · секція `# Compact instructions` у CLAUDE.md · делегувати великі читання субагентам · вимкнути невживані MCP · тримати CLAUDE.md **під 200 рядків** · перенести інструкції з CLAUDE.md у скіли | costs.md, «Reduce token usage» | 2026-09-03 |

### Застаріло в плані

- **План каже «авто-компакт» як одну поведінку → насправді поріг залежить від моделі й
  конфігурації**, і для Sonnet 5 це ~967K, а не «коли закінчиться». (model-config.md)
- **План не розрізняє «контекст закінчився» і «ліміт підписки закінчився»** — це дві абсолютно
  різні речі з різними повідомленнями. Докси прямо це розводять: «A context or auto-compact
  warning: **not a usage limit**». (costs.md, «When a developer asks about a limit»)
- **План ставить prompt caching у c05 як довідку → насправді це причина №1, чому в довгій сесії
  «горять» ліміти.** Це треба подавати не як оптимізацію, а як механіку витрат. (costs.md)

### Додати, чого в плані немає

- **Таблиця «що переживає компакцію»** · це єдине, що дозволяє свідомо будувати CLAUDE.md і скіли ·
  context-window.md
- **Ліміти 5 000 / 25 000 токенів на скіли після компакції + «важливе — вгору SKILL.md»** ·
  практичне правило авторства скілів · context-window.md
- **«Правка CLAUDE.md посеред сесії не діє»** · величезна пастка: людина править і дивується ·
  prompt-caching.md
- **`/rewind` → Summarize from/up to here** як хірургічна альтернатива `/compact` · checkpointing.md
- **`/autocompact` з точними прийнятними формами** · commands.md, model-config.md
- **Thrashing-помилка** · пояснює, чому іноді «воно просто здалось» · how-claude-code-works.md
- **Кеш скоупиться на папку, і worktree — інша папка** · пояснює, чому паралельна робота дорожча ·
  prompt-caching.md
- **Ціна `/compact` після довгої перерви** — коли кеш охолов, самаризація перечитує всю історію
  як uncached · prompt-caching.md
- **`Resume from a summary`-діалог** на Pro/Max при відновленні сесії > ~1 год простою і > 100 000
  токенів; три опції: Resume from summary / Resume full session as-is / Don't ask me again ·
  sessions.md
- **Не звірено:** точні числа з симуляції context-window.md — це «representative token counts» самих
  доксів, не гарантія для конкретної сесії. Курс має це підписати.

### Екрани для курсу

- **`/context` — інтерактивна кольорова сітка, як текст не існує.** Треба знімати скріншотом.
  За доксами на ній видно: розбивку по категоріях, підказки по оптимізації, які саме CLAUDE.md і
  auto memory файли завантажились, і попередження з «how far over the limit you are».
- **Приклад блоку `Session` з `/usage`** — докси дають дослівний зразок (costs.md), його можна
  показати як текст:
  ```
  Total cost:            $0.55
  Total duration (API):  6m 20s
  Total duration (wall): 6h 33m 10s
  Total code changes:    0 lines added, 0 lines removed
  Usage by model:
     claude-sonnet-4-6:  1.2k input, 5.3k output, 940.0k cache read, 50.0k cache write ($0.55)
  ```
  (Це приклад із доксів, не з машини звірки.)
- **Діаграма префіксного кешу:** `images/prompt-caching-prefix.svg` — чотири ходи, на четвертому
  змінився system prompt і весь запит перераховано. Alt-текст у доксах дуже добрий, можна
  перемалювати.

### Пастки новачка

- **Робить `/clear`, думаючи що це «очистити екран»** → втрачає розмову. Насправді екран чистить
  `Ctrl+L`; розмова після `/clear` не зникає (повернути `/resume` або rewind-меню), але контекст —
  так.
- **Править CLAUDE.md і чекає ефекту в тій самій сесії** → ефекту нема. Потрібен `/clear`,
  `/compact` або рестарт. (prompt-caching.md)
- **Тримає одну сесію відкритою весь день** → «одне питання на рядок» коштує як уся розмова, бо
  повна історія йде в кожен запит. (costs.md, «Long context»)
- **Перемикає модель туди-сюди посеред задачі** → кожне перемикання = повний перерахунок кешу.
  Докси: «Pick your model and effort level at the top of a session». (prompt-caching.md)
- **Читає гігантський лог напряму** → контекст з'їдений одним файлом; далі thrashing. Фікс:
  делегувати субагенту або відфільтрувати хуком.
- **Плутає «Ти вичерпав ліміт сесії» з «контекст переповнено»** — перше про підписку, друге про
  вікно. (costs.md)

---

## c06 — Дозволи, Plan Mode, пісочниця

### 🔴 РОЗХОДЖЕННЯ ДОКСІВ І РЕАЛЬНОГО `--help` (найцінніша знахідка модуля)

**Питання плану «режимів сім чи чотири» має точну відповідь: режимів ШІСТЬ, а рядків, які CLI
приймає, — СІМ.**

Живий бінарник 2.1.236 на невалідне значення відповідає дослівно:

```
$ claude --permission-mode bogus --help
error: option '--permission-mode <mode>' argument 'bogus' is invalid. Allowed choices are acceptEdits, auto, bypassPermissions, manual, dontAsk, plan.
```

Тобто `--help` і повідомлення про помилку рекламують **шість** значень, і `default` серед них
**немає**. Але докси всюди пишуть саме `claude --permission-mode default`. Я перевірив це прямо:

```
$ claude --permission-mode default --help
Usage: claude [options] [command] [prompt]      ← помилки немає, значення прийняте
```

Контрольний тест підтверджує, що валідація спрацьовує ДО `--help` (з `bogus` вона таки лається),
тому це не артефакт порядку розбору аргументів. **Висновок: `default` — робоче, але не задокументоване
у `--help` значення, синонім до `manual`.** Доказ: `screens/permission-mode-enum-test.txt`.

**Другий, незалежний доказ — усередині самого бінарника.** Прихована підкоманда
`claude remote-control` має власний `--permission-mode` і друкує список навпаки:

```
$ claude remote-control --help
  --permission-mode <mode>         Permission mode for spawned sessions
                                   (acceptEdits, auto, bypassPermissions, default, dontAsk, plan)
```

Тобто **головний `claude --help` показує `manual` і ховає `default`, а `claude remote-control --help`
показує `default` і ховає `manual`.** Два довідники всередині однієї збірки суперечать один одному,
і обидва неповні: насправді приймаються обидва рядки. Доказ: `screens/claude-remote-control--help.txt`.

Це саме той тип розходження, який курс мусить показати: докси і `--help` не збігаються, самі `--help`
не збігаються між собою, і правий тут — тільки перевірка на живій системі.

### Перевірено — шість режимів

Джерело: https://code.claude.com/docs/en/permission-modes.md, звірено 2026-09-03.

| Режим (config-значення) | Назва в UI | Що йде без питання |
|---|---|---|
| `default` (алiас `manual`) | **Manual** | Лише читання |
| `acceptEdits` | Edit automatically | Читання, правки файлів і побутові файлові команди |
| `plan` | Plan | Читання + команди, схвалені класифікатором (якщо auto доступний) |
| `auto` | Auto | Усе, з фоновими перевірками безпеки |
| `dontAsk` | — | Лише попередньо схвалені інструменти |
| `bypassPermissions` | Bypass permissions | Усе |

«The mode that reviews every action is named **Manual** in the CLI, in `claude --help`, in the
VS Code and JetBrains extensions, and in the desktop app. Its config value is `default`, which is
what hooks and SDK integrations use.» Мітка Manual і алiас `manual` потребують **v2.1.200+**.

### Перевірено — інше

| Факт | Джерело | Дата |
|---|---|---|
| **На Pro, Max і Team вбудований стартовий режим — `auto`.** Потребує **v2.1.228+** (macOS/Linux/WSL) і **v2.1.233+** (native Windows) | permission-modes.md | 2026-09-03 |
| **Таблиця «який режим на старті»** — перший рядок, що збігся: `disableAutoMode: "disable"` → `default` · вимкнене фіче-флагування → `default` · **перша сесія після встановлення/оновлення** → `default` · `claude -p` або Agent SDK → `default` · Bedrock/Vertex/Foundry/Claude Platform on AWS/gateway → `default` · **Pro/Max/Team у терміналі або VS Code → `auto`** · Enterprise або Console API key → `default` | permission-modes.md | 2026-09-03 |
| **`auto` і `bypassPermissions` НЕ діють із `.claude/settings.json` та `.claude/settings.local.json`** — тільки з `~/.claude/settings.json` чи managed. `auto` там мовчки ігнорується, `bypassPermissions` стартує в Manual | permission-modes.md | 2026-09-03 |
| Цикл `Shift+Tab`: з `auto` перше натискання → `default`, далі `default` → `acceptEdits` → `plan` → назад у `default`. Опційні режими вставляються після `plan`: спершу `bypassPermissions`, останнім `auto` | permission-modes.md, вкладка CLI | 2026-09-03 |
| **`dontAsk` НІКОЛИ не з'являється в циклі** — тільки через `--permission-mode dontAsk` | permission-modes.md | 2026-09-03 |
| Рядки статусу дослівно: `⏸ manual mode on` · `⏵⏵ accept edits on` · `⏸ plan mode on` · `⏵⏵ auto mode on` · `⏵⏵ don't ask on` · `⏵⏵ bypass permissions on` | permission-modes.md | 2026-09-03 |
| `acceptEdits` авто-схвалює також Bash-команди: `mkdir`, `touch`, `rm`, `rmdir`, `mv`, `cp`, `sed` — **лише в межах робочої папки або `additionalDirectories`** | permission-modes.md | 2026-09-03 |
| Plan mode: вхід через `Shift+Tab` або `/plan [description]`. Три опції при схваленні плану: **Yes, and use auto mode** · **Yes, manually approve edits** · **No, keep planning** | permission-modes.md | 2026-09-03 |
| `Ctrl+G` у plan mode — відкрити запропонований план у зовнішньому редакторі й правити | permission-modes.md | 2026-09-03 |
| Схвалення плану дає сесії **згенеровану назву** на основі плану | permission-modes.md, sessions.md | 2026-09-03 |
| Auto mode: окрема модель-класифікатор рецензує дії. За замовчуванням працює на **Claude Sonnet 5**, а не на моделі сесії | permission-modes.md, «Cost and latency» | 2026-09-03 |
| **Порядок рішення класифікатора (перший збіг виграє):** 1) allow/ask/deny правила 2) read-only дії та правки в робочій папці авто-схвалюються 3) усе інше йде до класифікатора 4) якщо блок — Claude отримує причину (зазвичай фіксований текст `Blocked by classifier`) і пробує інше | permission-modes.md | 2026-09-03 |
| **Входячи в auto mode, широкі allow-правила скидаються:** `Bash(*)`, `PowerShell(*)`, wildcard-інтерпретатори (`Bash(python*)`), команди пакетних менеджерів, `Agent`, `Monitor`. Вузькі (`Bash(npm test)`) лишаються; скинуті повертаються при виході з auto | permission-modes.md | 2026-09-03 |
| **Пороги відкату auto mode:** 3 блоки поспіль АБО 20 сумарно → auto ставиться на паузу і повертаються запити. Пороги **не налаштовуються** | permission-modes.md | 2026-09-03 |
| **Межі, названі в розмові, класифікатор поважає:** «don't push» блокує відповідні дії навіть якщо дефолт дозволяв би. **АЛЕ:** «Boundaries are not stored as rules… a boundary can be lost if context compaction removes the message that stated it.» Для гарантії — deny-правило | permission-modes.md | 2026-09-03 |
| Кількість правил класифікатора на живій машині: **allow = 17, soft_deny = 66, hard_deny = 1, environment = 20** | `$ claude auto-mode defaults` (локально) | 2026-09-03 |
| `claude auto-mode` має підкоманди: `config` · `critique` · `defaults` · `reset` | `$ claude auto-mode --help` | 2026-09-03 |
| **Protected paths** — писати туди не авто-схвалюється в жодному режимі, крім `bypassPermissions`. Каталоги: `.git`, `.config/git`, `.vscode`, `.idea`, `.husky`, `.cargo`, `.devcontainer`, `.yarn`, `.mvn`, `.claude` (крім `.claude/worktrees`). Файли: `.gitconfig`, `.gitmodules`, `.bashrc`, `.zshrc`, `.profile`, `.envrc`, `.npmrc`, `.mcp.json`, `.claude.json` та ін. | permission-modes.md, «Protected paths» | 2026-09-03 |
| **`permissions.allow` НЕ пре-схвалює запис у protected paths** — перевірка йде до оцінки allow-правил | permission-modes.md | 2026-09-03 |
| **Critical paths** — `rm`/`rmdir` по них не схвалить ні allow-правило, ні `PreToolUse` хук: корінь ФС · будь-який прямий нащадок кореня (`/usr`, `/etc`) · домашня папка · корені дисків Windows · **робоча папка і її батьки** · глоб під шеллівською змінною (`rm -rf "$DIR"/*`) | permission-modes.md, «Critical paths» | 2026-09-03 |
| Ховання видалення в `$(...)`, backticks чи `<(...)` **не обходить перевірку** | permission-modes.md | 2026-09-03 |
| Правила: **deny → ask → allow**, перший збіг вирішує; специфічність не важить. Deny блокує в усіх режимах, включно з `bypassPermissions`. Allow не діють у `bypassPermissions` | permissions.md, «Manage permissions» | 2026-09-03 |
| Синтаксис: `Tool` або `Tool(specifier)`. `Bash(*)` ≡ `Bash`. Приклади: `Bash(npm run build)`, `Read(./.env)`, `WebFetch(domain:example.com)` | permissions.md | 2026-09-03 |
| **Голе ім'я інструмента як deny прибирає інструмент із контексту Claude взагалі** — він його не бачить | permissions.md | 2026-09-03 |
| **Вбудований набір read-only Bash-команд** іде без запиту в БУДЬ-ЯКОМУ режимі: `ls`, `cat`, `echo`, `pwd`, `head`, `tail`, `grep`, `find`, `wc`, `which`, `diff`, `stat` та ін. | permissions.md, «Read-only commands» | 2026-09-03 |
| Але навіть вони питають при: некерованих глобах для команд із write-flags (`find`, `sort`, `sed`, `git`) · `docker` з `-H`/`--context` · `file` з `-m`/`-f` · UNC-шляхах на Windows · командах довших за **10 000 символів** | permissions.md | 2026-09-03 |
| Редиректи (`>`, `>>`, `2>`) перевіряються **як запис у файл** | permissions.md, «Redirections» | 2026-09-03 |
| **Пісочниця Bash — окрема від режимів дозволів.** `/sandbox`. Працює на macOS (Seatbelt, нічого ставити не треба), Linux, WSL2. **Native Windows не підтримується** | sandboxing.md | 2026-09-03 |
| Два режими пісочниці: **auto-allow** (команда всередині пісочниці схвалюється автоматично) і **regular permissions** (усе йде звичайним шляхом) | sandboxing.md, «Sandbox modes» | 2026-09-03 |
| Навіть в auto-allow діють: явні deny-правила · `rm`/`rmdir` по critical path · content-scoped ask-правила (`Bash(git push *)`) | sandboxing.md | 2026-09-03 |
| «`/sandbox` is not a permission mode. Permission modes decide whether a tool call runs and whether you are prompted first, while the sandbox restricts what a Bash command can access once it runs» | sandboxing.md | 2026-09-03 |
| Пісочниця й auto mode **працюють незалежно і комбінуються**, крім plan mode, де auto-allow не розширює схвалення | sandboxing.md, permission-modes.md | 2026-09-03 |
| `--dangerously-skip-permissions` ≡ `--permission-mode bypassPermissions`. Є ще `--allow-dangerously-skip-permissions`, який лише **додає режим у цикл**, не активуючи його | `$ claude --help` + permission-modes.md | 2026-09-03 |
| На Linux/macOS Claude Code **відмовляється** стартувати в bypass під root/sudo: `--dangerously-skip-permissions cannot be used with root/sudo privileges for security reasons` | permission-modes.md | 2026-09-03 |
| Перший інтерактивний запуск у bypass показує діалог прийняття відповідальності; згода зберігається в user settings; **відмова = вихід** | permission-modes.md | 2026-09-03 |
| `--add-dir <directories...>` / `/add-dir <path>`. **Додаткові папки дають доступ до файлів, а не до конфігурації**: «Most `.claude/` configuration is not discovered from the added directory» | `$ claude --help`, commands.md, permissions.md | 2026-09-03 |
| Дії, які **не схвалює жоден режим**, включно з bypass: явні ask-правила · connector-інструменти, які організація поставила в `ask` · `AskUserQuestion` і MCP-інструменти з `requiresUserInteraction` · `rm`/`rmdir` по critical path · захисти cross-session messaging | permission-modes.md, «Actions no mode auto-approves» | 2026-09-03 |

### Застаріло в плані

- **«режимів сім» → шість режимів, сім прийнятих рядків.** Див. розділ про розходження вище.
  Це не причіпка: якщо курс скаже «сім режимів», учень піде шукати сьомий і не знайде.
- **План припускає, що на підписці треба вручну вмикати auto → навпаки, його треба вручну
  ВИМИКАТИ**, якщо хочеш бачити діалоги.
- **План ставить `--dangerously-skip-permissions` як «крайній варіант для сміливих» → докси дають
  сильнішу й конкретнішу заміну:** «For background safety checks with far fewer permission prompts,
  use auto mode instead». І прямо: bypass «offers no protection against prompt injection».
- **План не згадує, що deny-правила діють навіть у bypass** — а це єдиний надійний запобіжник.

### Додати, чого в плані немає

- **Protected paths і critical paths як окрема тема** · це «запобіжники, які не вимикаються», і
  саме вони роблять bypass менш смертельним, ніж здається · permission-modes.md
- **Скидання широких allow-правил при вході в auto mode** · людина додала `Bash(*)`, увійшла в
  auto і не розуміє, чому все одно блокує · permission-modes.md
- **Пороги 3/20 і як auto відкочується** · permission-modes.md
- **Межі, названі словами в чаті, працюють — але гинуть при компакції** · це найтонший і
  найважливіший нюанс безпеки в усьому курсі · permission-modes.md
- **`claude auto-mode defaults` як спосіб УВІМКНУТИ прозорість** — учень може сам подивитись усі
  84 правила (17+66+1), за якими його судять · `$ claude auto-mode defaults`
- **Класифікатор коштує грошей і часу** на Enterprise/API/cloud: «classifier calls count toward
  your token usage… adding a round-trip before execution» · permission-modes.md
- **Класифікатор НЕ бачить результатів інструментів** («Tool results are stripped, so hostile
  content in a file or web page can't manipulate it directly») · пояснює модель загроз ·
  permission-modes.md
- **Пісочниця ≠ режим дозволів** — два ортогональні шари; таблиця з sandboxing.md ідеальна для слайда
- **Пісочниця не працює на native Windows** → для Windows-аудиторії курсу це означає WSL2 · sandboxing.md
- **`/permissions` має вкладку Auto mode** і вкладку **Recently denied**, де `r` повторює дію з
  ручним схваленням · permission-modes.md, permissions.md
- **`/fewer-permission-prompts`** — вбудований скіл, що сканує транскрипти й формує allowlist ·
  commands.md
- **10 000 символів як межа парсингу команди** · пояснює раптові запити на «безпечну» команду ·
  permissions.md

### Екрани для курсу

- **`screens/permission-mode-enum-test.txt` — головний артефакт модуля.** Показує дослівно і
  повідомлення про помилку зі списком шести значень, і те, що `default` тихо приймається.
- `screens/claude-auto-mode--help.txt` — підкоманди `config`/`critique`/`defaults`/`reset`.
- `screens/claude-auto-mode-defaults.json.txt` — **повний JSON правил класифікатора з живої
  машини** (32.6 КБ). Для курсу брати фрагменти: одне правило з `allow`, одне з `soft_deny`,
  єдине `hard_deny`. Це рідкісна можливість показати «за чим саме тебе судять» дослівно.
- `screens/claude--help.txt` — рядки `--permission-mode`, `--dangerously-skip-permissions`,
  `--allow-dangerously-skip-permissions`, `--add-dir`.
- **Інтерактивні, знімати вручну:** діалог дозволу з опцією «Yes, and switch to auto mode»
  (потребує v2.1.247 — **у 2.1.236 її не буде**, це теж варто показати як приклад розходження) ·
  діалог `/permissions` з вкладками · панель `/sandbox` з трьома вкладками (Mode, і ще двома) ·
  діалог прийняття відповідальності за bypass · екран схвалення плану з трьома опціями.

### Пастки новачка

- **Пише `"defaultMode": "auto"` в `.claude/settings.json` проєкту → мовчки не діє.** Сесія
  стартує в Manual без жодної помилки. Фікс: перенести в `~/.claude/settings.json`.
  (permission-modes.md — там це названо прямо як типова проблема)
- **Додає `Bash(*)` в allow, входить в auto → все одно блокує.** Бо широкі правила скидаються.
- **Каже «не пуш» на початку довгої сесії, після компакції межа зникає** → Claude пушить.
  Фікс: deny-правило замість слів.
- **Ставить `--dangerously-skip-permissions` під sudo** → відмова запуску з дослівним текстом
  (наведений вище).
- **Думає, що `bypassPermissions` = «взагалі все»** → а `rm -rf ~` все одно спитає (critical path),
  і запис у `.git` пройде (protected path не захищений у bypass!). Це асиметрія, яку легко
  зрозуміти навпаки.
- **Шукає `dontAsk` у циклі `Shift+Tab`** → його там немає ніколи.
- **Очікує пісочницю на Windows** → лише WSL2.
- **Не знає про вкладку Recently denied** → після блоку просто здається, замість `r`.

---

## c07 — Сесії, історія, відкат

### Перевірено

| Факт | Джерело | Дата |
|---|---|---|
| **Транскрипти лежать у `~/.claude/projects/<project>/<session-id>.jsonl`**, де `<project>` — шлях робочої папки з неалфанумерними символами, заміненими на `-` | sessions.md, «Where transcripts are stored» | 2026-09-03 |
| **Перевірено локально:** папка `/Users/ander1.sage/.claude/projects/-Users-ander1-sage-Downloads-AIA/` містить файли на кшталт `00b36a45-c229-45e0-b694-2f96294eddcd.jsonl` | `$ ls ~/.claude/projects/…` | 2026-09-03 |
| Якщо перетворене ім'я довше **200 символів**, воно обрізається до 200 і додається хеш повного шляху | sessions.md | 2026-09-03 |
| Кожен рядок — JSON-об'єкт. **«The entry format is internal to Claude Code and changes between versions, so scripts that parse these files directly can break on any release»** | sessions.md | 2026-09-03 |
| Інший вміст `~/.claude/` на живій машині: `agents`, `agent-memory`, `backups`, `cache`, `chrome`, `downloads`, `file-history`, `history.jsonl`, `image-cache`, `paste-cache`, `plans`, `plugins`, `projects`, `session-env`, `sessions`, `settings.json`, `shell-snapshots`, `skills`, `statusline.js`, `tasks` | `$ ls ~/.claude` | 2026-09-03 |
| Ретенція за замовчуванням — **30 днів**, керується `cleanupPeriodDays` | sessions.md, checkpointing.md | 2026-09-03 |
| `claude --continue` (`-c`) — остання інтерактивна сесія в поточній папці | sessions.md | 2026-09-03 |
| `claude --resume` (`-r`) — пікер; `claude --resume <name>` — прямо за іменем | sessions.md | 2026-09-03 |
| **`-p`/SDK-сесії НЕ показуються в пікері і НЕ підхоплюються `--continue`**; їх можна відновити лише за session ID. `--continue` також пропускає фонові сесії і сесії, чий перший промпт був `/loop` | sessions.md | 2026-09-03 |
| `claude --resume <session-id>` працює **з будь-якої папки** (з v2.1.223): шукає в поточному проєкті й worktree, потім у всіх інших проєктах машини | sessions.md | 2026-09-03 |
| Помилка при відсутності: `No conversation found with session ID: <session-id>` | sessions.md | 2026-09-03 |
| Що відновлюється: історія · модель · агент · **режим дозволів** · активний goal · нестерплі scheduled tasks | sessions.md, «What a resumed session restores» | 2026-09-03 |
| Що **НЕ** відновлюється: `--mcp-config`, `--settings`, `--plugin-dir`, `--fallback-model`, папки з `--add-dir` — їх треба передавати знову. Файли `settings.json` перечитуються самі | sessions.md | 2026-09-03 |
| **Режим дозволів при відновленні:** `bypassPermissions` → як у новій сесії · `plan` → як у новій · `auto` → `auto` (якщо акаунт ще підходить) · Manual → Manual. **Через пікер стан режиму НЕ відновлюється взагалі** | sessions.md, таблиця «Permission mode on resume» | 2026-09-03 |
| Клавіші пікера: `↑`/`↓` навігація · `→`/`←` розгорнути групу · `Enter` відновити · `Space` (або `Ctrl+V`) прев'ю · **`Ctrl+R` перейменувати** · `/` пошук · **`Ctrl+A` усі проєкти машини** · **`Ctrl+W` усі worktree репо** · **`Ctrl+B` фільтр за поточною гілкою** · `Esc` вихід | sessions.md, «Use the session picker» | 2026-09-03 |
| У пошук пікера можна **вставити URL пул-реквесту** (GitHub, GitHub Enterprise, GitLab, Bitbucket), щоб знайти сесію, яка його створила | sessions.md | 2026-09-03 |
| Іменування: `claude -n auth-refactor` при старті · `/rename auth-refactor` у сесії · `Ctrl+R` у пікері · автоматично при схваленні плану | sessions.md, «Name your sessions» | 2026-09-03 |
| Неназвані сесії отримують **два ярлики**: default display name (`my-app-3f` — папка + 2 символи, **не** resume-handle) і generated title (самарі першого промпту від Haiku-класу моделі, **є** resume-handle) | sessions.md | 2026-09-03 |
| Конфлікт імен: Claude Code перейменовує **твою** сесію на варіант із двослівним суфіксом (`auth-refactor-graceful-unicorn`) і каже про це | sessions.md | 2026-09-03 |
| `/branch [name]` — копія розмови, ти переходиш у неї, оригінал лишається. `claude --continue --fork-session` — те саме з CLI | sessions.md, «Branch a session» | 2026-09-03 |
| `/branch` друкує **два session ID**: нову гілку і оригінал | sessions.md | 2026-09-03 |
| При `/branch` **зберігаються** «Allow for this session» дозволи (той самий процес), фонові субагенти й Bash-команди переїжджають у гілку, Remote Control лишається підключеним. При `--fork-session` у окремому процесі дозволи треба давати заново | sessions.md, таблиця | 2026-09-03 |
| `/fork [prompt]` — копія у **фонову** сесію, ти лишаєшся тут. Потребує v2.1.212 (**є**) | commands.md | 2026-09-03 |
| **Checkpointing:** знімок стану коду перед **кожним промптом користувача**. Зберігається **100 останніх** чекпойнтів на сесію. Живе разом із розмовою, доступне після `--resume`. Видаляється разом із сесією через 30 днів | checkpointing.md | 2026-09-03 |
| `/rewind [N\|description]`, або `Esc` `Esc` при порожньому вводі | checkpointing.md, commands.md | 2026-09-03 |
| **Шість опцій меню rewind:** Restore code and conversation · Restore conversation · Restore code · Summarize from here · Summarize up to here · Never mind | checkpointing.md | 2026-09-03 |
| Дві опції відкату коду з'являються **лише якщо в чекпойнті є відстежені зміни файлів** | checkpointing.md | 2026-09-03 |
| **Чого checkpointing НЕ ловить:** зміни файлів bash-командами (`rm`, `mv`, `cp`) · правки субагентів (крім foreground forked skill) · зовнішні зміни · **symlink і hard-link шляхи** (показує `Restored the code, but skipped N files`) | checkpointing.md, «Limitations» | 2026-09-03 |
| «Not a replacement for version control» — прямим текстом | checkpointing.md | 2026-09-03 |
| Після `/clear` у тому ж процесі меню rewind має додатковий пункт угорі: `/resume <session-id> (previous session)`. Потребує v2.1.191 (**є**) | checkpointing.md | 2026-09-03 |
| `/export [filename]` — експорт розмови як **звичайний текст**; без імені — діалог (буфер або файл) | commands.md, sessions.md | 2026-09-03 |
| Для скриптів замість `/export`: `claude -p --output-format json`, `claude -p --resume <id> --output-format json`, поле `transcript_path` у хуках і statusline, Agent SDK | sessions.md, «Access conversations from scripts» | 2026-09-03 |
| Приклад із доксів: `claude -p --resume <session-id> --output-format json "summarize what we changed" \| jq -r '.result'` | sessions.md | 2026-09-03 |
| `--cloud [description\|session_id\|url]` — створити cloud-сесію або приєднатись до наявної за ID чи claude.ai/code URL | `$ claude --help` | 2026-09-03 |
| `--teleport [session]` / `/teleport` — забрати web-сесію в локальний термінал; web-сесія продовжується на claude.ai/code | `$ claude --help`, commands.md | 2026-09-03 |
| `/desktop` (алiас `/app`) — продовжити сесію в десктопному застосунку. **Потребує macOS або x64 Windows і підписку Claude** | commands.md | 2026-09-03 |
| **Remote Control** доступний на всіх планах; на Team/Enterprise вимкнений, поки Owner не увімкне тумблер в admin settings | remote-control.md | 2026-09-03 |
| Remote Control: Claude лишається працювати **локально**, «your code execution and filesystem access stay on your machine»; `@` автодоповнює локальні шляхи | remote-control.md | 2026-09-03 |
| Remote Control вимагає входу під claude.ai; **API-ключі не підтримуються** | permission-modes.md, remote-control.md | 2026-09-03 |
| З мобільного/браузера в Remote Control доступні лише режими **Manual, Accept edits, Plan** — Auto і Bypass вибрати не можна | permission-modes.md, вкладка «Web and mobile» | 2026-09-03 |
| Запуск: `claude --remote-control [name]`, `claude remote-control`, або `/remote-control` у сесії. Є `--remote-control-session-name-prefix <prefix>` | `$ claude --help`, cli-reference.md | 2026-09-03 |
| **Dispatch** — надіслати задачу з мобільного застосунку, Claude виконує **на твоїй машині через Desktop**. Потребує парування мобільного з Desktop, Pro/Max | platforms.md, таблиця «Work when you are away» | 2026-09-03 |
| `claude project purge [path]` — видалити ВЕСЬ локальний стан проєкту: транскрипти, задачі, історію файлів, запис у конфізі. Є `--dry-run` | `$ claude project --help`, cli-reference.md | 2026-09-03 |
| Фонові сесії: `claude --bg`, керування через `claude agents`; у cli-reference згадані `claude attach <id>`, `claude logs <id>`, `claude stop <id>`, `claude respawn <id>`, `claude rm <id>` | `$ claude --help`, `$ claude agents --help`, cli-reference.md | 2026-09-03 |

### 🔴 Розходження доксів і реального `--help` (c07)

**`cli-reference.md` перелічує команди, яких у `claude --help` збірки 2.1.236 НЕМАЄ** у списку
`Commands:`: `claude attach <id>`, `claude logs <id>`, `claude stop <id>`, `claude respawn <id>`,
`claude rm <id>`, `claude daemon status`, `claude daemon stop --any`, `claude remote-control`,
`claude self-hosted-runner`. Вивід `claude --help` показує рівно 13 підкоманд: `agents`, `auth`,
`auto-mode`, `doctor`, `gateway`, `import`, `install`, `mcp`, `plugin`, `project`, `setup-token`,
`ultrareview`, `update`.

**ЗВІРЕНО — усі вони існують як приховані команди.** Я перевірив кожну через `--help` (це
read-only, стан не змінюється), з контролем на неіснуючій команді:

```
claude attach --help              -> Usage: claude attach <id>
claude logs --help                -> Usage: claude logs <id>
claude stop --help                -> Usage: claude stop <id>
claude respawn --help             -> Usage: claude respawn <id>|--all
claude rm --help                  -> Usage: claude rm <id>
claude daemon --help              -> Usage: claude daemon [subcommand] [options]
claude remote-control --help      -> Remote Control - Control local sessions from claude.ai/code…
claude self-hosted-runner --help  -> Usage: claude self-hosted-runner [options]
claude bogus-nonexistent --help   -> Usage: claude [options] [command] [prompt]   ← контроль: провалюється в головний help
```

Отже це **приховані від `Commands:` команди, а не відсутні**. Їхні дослівні описи (варті курсу):
`attach` — «Open the background session in this terminal. ← returns to agent view, Ctrl+Z drops
back to your shell. The session keeps running either way.» · `logs` — «Print the background
session's recent terminal output.» · `stop` — «Stop a background session. Its conversation is kept;
resume it later with `claude attach <id>`.» · `respawn` — «Restart a background session (or all of
them) so it picks up the current Claude binary» (**зверни увагу: є `--all`, чого немає в
cli-reference.md**) · `rm` — «Delete a background session **and its worktree**. Unlike `stop`, works
on already-exited sessions.»

`claude daemon` має підкоманди `run`, `status`, `logs`, `uninstall`, `stop` (з `--any` і
`--keep-workers`), конфіг `~/.claude/daemon.json`, лог `~/.claude/daemon.log`, і окремо попереджає:
«Service install is disabled in this version — the daemon runs on demand and exits when the last
client disconnects.»

Доказ: `screens/claude-hidden-subcommands.txt`, `screens/claude-remote-control--help.txt`.

**Досі не звірено:** прапорці головної команди. Так само `cli-reference.md` наводить прапорці, яких немає в локальному `--help`: `--advisor`,
`--append-subagent-system-prompt`, `--append-system-prompt-file`, `--system-prompt-file`,
`--channels`, `--exec`, `--init`, `--init-only`, `--maintenance`, `--max-turns`,
`--permission-prompt-tool`, `--ref`, `--remote`, `--restricted`, `--teammate-mode`.

### Застаріло в плані

- **План каже «`/export`» як спосіб дістати історію → для скриптів це неправильний інструмент.**
  Докси прямо розводять: `/export` дає «rendered transcript for a person to read», а для скриптів
  є чотири інші інтерфейси. (sessions.md)
- **План згадує `--cloud` / `--teleport` / `/desktop` / Remote Control / Dispatch одним рядком →
  це п'ять різних механізмів із різними «де виконується код»**, і плутати їх небезпечно:
  Remote Control і Dispatch виконують на твоїй машині, `--cloud` — на чужій.
- **План не згадує, що `-p`-сесії невидимі для `-c` і пікера** — а це найчастіша причина «куди
  поділась моя сесія».

### Додати, чого в плані немає

- **`Ctrl+A` / `Ctrl+W` / `Ctrl+B` у пікері** · без них людина не знайде сесію з іншої папки ·
  sessions.md
- **Вставка URL пул-реквесту в пошук пікера** · sessions.md
- **Різниця resume / branch / fork / subtask** — чотири схожі на вигляд речі:
  `--resume` продовжує ту саму сесію · `/branch` копіює і переводить тебе · `/fork` копіює у фон і
  лишає тебе тут · `/subtask` віддає підзадачу субагенту з поверненням результату · sessions.md, commands.md
- **Що саме checkpointing НЕ ловить** · це рятує від хибної впевненості; особливо «bash-команди не
  відстежуються» · checkpointing.md
- **Symlink/hardlink не відновлюються** з дослівним попередженням `Restored the code, but skipped
  N files` · для проєктів із dotfile-менеджерами й pnpm це реальність · checkpointing.md
- **`/rewind` дешевший за `/compact`** — «Rewinding truncates back to a prefix that is already
  cached, rather than building a new one» · перетин із c05 · prompt-caching.md
- **`claude project purge`** · єдиний штатний спосіб прибрати за собою · `$ claude project --help`
- **Ліміт 100 чекпойнтів** · checkpointing.md
- **`Resume from a summary` діалог** (Pro/Max, > 1 год простою, > 100 000 токенів) · sessions.md

### Екрани для курсу

- **Реальний лістинг файлової системи** — знятий на машині звірки, ідеальний екран для «де воно
  фізично лежить»:
  ```
  $ ls ~/.claude/projects/-Users-ander1-sage-Downloads-AIA/*.jsonl | head -3
  /Users/…/.claude/projects/-Users-ander1-sage-Downloads-AIA/00b36a45-c229-45e0-b694-2f96294eddcd.jsonl
  ```
  Показати перетворення шляху `/Users/ander1.sage/Downloads/AIA` → `-Users-ander1-sage-Downloads-AIA`.
- `screens/claude-project--help.txt` — `purge` з `--dry-run`.
- `screens/claude-agents--help.txt` — керування фоновими сесіями.
- `screens/claude-hidden-subcommands.txt` — **приховані команди керування фоновими сесіями**
  (`attach`/`logs`/`stop`/`respawn`/`rm`/`daemon`) з дослівними описами. Хороший екран для тези
  «`--help` не показує всього».
- `screens/claude-remote-control--help.txt` — повний набір опцій Remote Control, включно з
  `--spawn <same-dir|worktree|session>` і `--capacity <N>`.
- `screens/claude--help.txt` — рядки `-c`, `-r`, `--fork-session`, `--cloud`, `--teleport`,
  `--remote-control`, `--bg`, `--from-pr`, `--session-id`, `--no-session-persistence`.
- **Інтерактивні, знімати вручну:** пікер `/resume` (рядки з іменем, часом, гілкою, розміром) ·
  меню `/rewind` із шістьма опціями · діалог `/export`.

### Пастки новачка

- **`claude -c` після роботи в `-p`** → «сесії немає». Бо `-p`-сесії не підхоплюються. Фікс:
  `claude --resume <session-id>`.
- **Запустив `claude -c` не в тій папці** → інша сесія або жодної: сесії прив'язані до папки.
- **Розраховує на `/rewind` після того, як Claude зробив `rm` через bash** → не відкотиться.
  Це найнебезпечніша пастка модуля.
- **Думає, що `/rewind` = git** → чекпойнти живуть 30 днів і 100 штук, і це не заміна коміту.
- **Відновив сесію через пікер і дивується, що режим дозволів інший** → через пікер режим не
  відновлюється, лише через `--continue`/`--resume <id>`.
- **Відновив сесію, яка залежала від `--mcp-config`, і MCP-сервери зникли** → прапорці не
  відновлюються, треба передати знову.
- **Парсить `.jsonl` своїм скриптом** → зламається на наступному релізі; докси прямо попереджають.
- **Дві сесії з тим самим ID у двох терміналах** → повідомлення переплітаються в один транскрипт.

---

## c08 — Моделі й мислення

### Перевірено — моделі й id

| Сімейство | Модель | Точний id | Джерело |
|---|---|---|---|
| Opus | Opus 5 | `claude-opus-5` | model-config.md |
| Opus | Opus 4.8 | `claude-opus-4-8` | model-config.md |
| Opus | Opus 4.7 | `claude-opus-4-7` | model-config.md |
| Opus | Opus 4.6 | `claude-opus-4-6` | model-config.md |
| Sonnet | Sonnet 5 | `claude-sonnet-5` (нативно 1M) | model-config.md |
| Sonnet | Sonnet 4.6 | `claude-sonnet-4-6` | model-config.md |
| Sonnet | Sonnet 4.5 | `claude-sonnet-4-5` | model-config.md |
| Haiku | Haiku 4.5 | (у model-config без повного id; у pricing — «Claude Haiku 4.5») | model-config.md, pricing |
| Fable | Fable 5.1 | `claude-fable-5-1` — **потребує v2.1.255, у 2.1.236 НЕДОСТУПНА** | model-config.md |
| Fable | Fable 5 | `claude-fable-5` — потребує v2.1.170 (**є**) | model-config.md |

**Аліаси** (model-config.md, звірено 2026-09-03): `default` (скинути override) · `best` (найновіший
Fable, інакше `opus`) · `fable` · `sonnet` · `opus` · `haiku` · `sonnet[1m]` · `opus[1m]` ·
**`opusplan`** (Opus у plan mode, Sonnet на виконанні).

Локальне підтвердження формату: опис `--model` у `$ claude --help` дослівно каже
«Provide an alias for the latest model (e.g. 'fable', 'opus', or 'sonnet') or a model's full name
(e.g. 'claude-fable-5')».

### Перевірено — ціни (platform.claude.com/docs/en/about-claude/pricing, 2026-09-03)

| Модель | Input /MTok | 5m cache write | 1h cache write | Cache hit | Output /MTok |
|---|---|---|---|---|---|
| Claude Fable 5.1 | $10 | $12.50 | $20 | **$0.25** | $50 |
| Claude Fable 5 | $10 | $12.50 | $20 | $1 | $50 |
| Claude Opus 5 | $5 | $6.25 | $10 | $0.50 | $25 |
| Claude Opus 4.8 | $5 | $6.25 | $10 | $0.50 | $25 |
| **Claude Sonnet 5** | **$2** | $2.50 | $4 | $0.20 | **$10** |
| Claude Sonnet 4.6 | $3 | $3.75 | $6 | $0.30 | $15 |
| Claude Haiku 4.5 | $1 | $1.25 | $2 | $0.10 | $5 |

Три факти з тієї ж сторінки, які курс мусить назвати:

1. **Ціна Sonnet 5 $2/$10 стала постійною.** Дослівно: «announced at launch as introductory pricing
   through August 31, 2026, is now the standard price. The previously scheduled increase to $3/$15
   … on September 1, 2026 will not occur.» Це рішення **позавчора відносно дати звірки** —
   найсвіжіший факт у всьому звіті.
2. **Fable 5.1 має кеш-читання за 0.025× базової ціни**, а не 0.1× як усі інші.
3. **Моделі 4.7 і новіші використовують новий токенізатор, який дає ~30% БІЛЬШЕ токенів на той
   самий текст.** Тобто пряме порівняння цін за MTok між Sonnet 4.6 і Opus 5 некоректне — треба
   закладати поправку. Це неочевидно і сильно впливає на реальний рахунок.

Fast mode: **$10 input / $50 output за MTok** на Opus 5 і Opus 4.8, «flat across the full 1M token
context window». (pricing + fast-mode.md)

### Перевірено — дефолтна модель за акаунтом

| Тип акаунта | Дефолт |
|---|---|
| Max, Team Premium, Enterprise, Anthropic API | **Opus 5** |
| **Pro, Team Standard** | **Sonnet 5** |
| Claude Platform on AWS, Bedrock, Google Cloud | Opus 5 |
| Microsoft Foundry | Sonnet 4.5 |

(model-config.md, «Default Model Behavior»). `ANTHROPIC_DEFAULT_MODEL` має пріоритет — але
**потребує v2.1.236**, тобто рівно наша збірка, найновіша доступна фіча.

### Перевірено — effort і thinking

| Факт | Джерело | Дата |
|---|---|---|
| `--effort <level>` приймає **`low, medium, high, xhigh, max`** — підтверджено живим бінарником: `Warning: Unknown --effort value 'bogus' — ignoring it and using the default effort. Valid values: low, medium, high, xhigh, max.` | `$ claude --effort bogus …` (локально) | 2026-09-03 |
| Рівні за моделями: Fable 5.1/5, Opus 5, Sonnet 5, Opus 4.8, Opus 4.7 → `low, medium, high, xhigh, max`. Opus 4.6, Sonnet 4.6 → `low, medium, high, max` (**без `xhigh`**) | model-config.md | 2026-09-03 |
| **Дефолт effort — `high`** для всіх, крім Opus 4.7, у якого `xhigh` | model-config.md | 2026-09-03 |
| `/effort [level\|auto\|status]`. `max` і `ultracode` — **лише на сесію**; ключ `ultracode` зберігається | commands.md | 2026-09-03 |
| `/effort ultracode` = xhigh + dynamic workflows, потребує v2.1.203 (**є**) | model-config.md | 2026-09-03 |
| Змінна `CLAUDE_CODE_EFFORT_LEVEL`; налаштування `effortLevel`, `modelSettings.<model>.effortLevel`, `ultracode` | model-config.md | 2026-09-03 |
| Extended thinking **увімкнене за замовчуванням**. Перемикач: `Option+T` / `Alt+T`, або `/config` → зберігається як `alwaysThinkingEnabled` | model-config.md | 2026-09-03 |
| **Thinking НЕ МОЖНА вимкнути на Fable 5.1 і Fable 5** | model-config.md, costs.md | 2026-09-03 |
| `MAX_THINKING_TOKENS=0` вимикає thinking (крім Fable). Adaptive-reasoning моделі **ігнорують ненульові бюджети** — там треба effort | model-config.md, costs.md | 2026-09-03 |
| Thinking згорнутий за замовчуванням; `Ctrl+O` розгортає; `showThinkingSummaries: true` для повних самарі | model-config.md | 2026-09-03 |
| **Thinking-токени тарифікуються як output**, і дефолтний бюджет може бути «tens of thousands of tokens per request» | costs.md, «Adjust extended thinking» | 2026-09-03 |
| `/model` без аргументу — пікер; `Enter` = перемкнути і зберегти як дефолт; **`s` = лише на цю сесію**; стрілки вліво/вправо міняють effort прямо в пікері | commands.md, model-config.md, keybindings.md | 2026-09-03 |
| `--fallback-model <model>` приймає **список через кому**, пробує по черзі, перевіряє основну на початку кожного ходу користувача. **Працює лише з `--print`** | `$ claude --help` | 2026-09-03 |
| **Автоматичний fallback за вмістом:** Fable 5.1/5 → biology-flagged іде на Opus 5, cybersecurity-flagged → Opus 4.8. Opus 5 → cybersecurity-flagged → Opus 4.8, biology-flagged → **відмова**. Вимикається `switchModelsOnFlag: false` | model-config.md | 2026-09-03 |
| **Fast mode** — не інша модель: «It uses Claude Opus with a different API configuration», до **2.5× швидше**, та сама якість. Лише Opus 5 і Opus 4.8 | fast-mode.md | 2026-09-03 |
| Fast mode **у research preview**; на підписках — **тільки за usage credits**, не входить у ліміти плану | fast-mode.md | 2026-09-03 |
| `/fast` для перемикання; `Option+O`/`Alt+O`; налаштування `"fastMode": true`; іконка **`↯`** біля промпту | fast-mode.md, interactive-mode.md | 2026-09-03 |
| Fast mode недоступний на Bedrock, Google Cloud Agent Platform, Microsoft Foundry, Claude Platform on AWS | fast-mode.md | 2026-09-03 |
| Перший вхід у fast mode в розмові коштує **повну fast-ціну за весь контекст** → вмикати на початку сесії, не посеред | fast-mode.md, prompt-caching.md | 2026-09-03 |
| Ліміти підписок: Team/Enterprise — «rolling five-hour window and a weekly window», спільні з Claude chat і Cowork, розмір залежить від seat tier (Standard/Premium) | costs.md | 2026-09-03 |
| Повідомлення про ліміти: «You've hit your session limit» / «You've hit your weekly limit» — **спільні для всіх моделей**, `/model` не допоможе. А «You've hit your Opus limit» / «your Sonnet limit» — модельні, і перемикання **допоможе** | costs.md, «When a developer asks about a limit» | 2026-09-03 |
| Середні витрати в enterprise: **~$13 на розробника на активний день, $150–250 на місяць**; у 90% користувачів — під $30/день | costs.md | 2026-09-03 |
| Фонові витрати навіть у простої: «typically under $0.04 per session» | costs.md | 2026-09-03 |

### Застаріло в плані

- **План каже «Opus / Sonnet / Haiku / Fable» як чотири рівні → у 2.1.236 Fable доступний лише як
  Fable 5**; Fable 5.1 потребує v2.1.255. Курс не має обіцяти те, чого учень не побачить.
- **План припускає, що Opus — дефолт → на Pro і Team Standard дефолт Sonnet 5.** Оскільки курс
  безкоштовний і масовий, більшість аудиторії буде на Pro → у них інша дефолтна модель, ніж на
  скріншотах автора (він на Max → Opus 5).
- **План каже «thinking modes і рівні effort» як дві осі → насправді це одна вісь плюс тумблер:**
  effort (5 рівнів) керує глибиною, thinking — вмикається/вимикається, і на Fable не вимикається
  взагалі.
- **План каже «fast mode» серед способів обирати модель → fast mode не модель**, і на підписці він
  іде **не з ліміту плану, а з usage credits**, тобто це реальні гроші понад підписку. Це треба
  сказати прямо, інакше учень увімкне «щоб швидше» і отримає рахунок.

### Додати, чого в плані немає

- **Новий токенізатор у 4.7+ дає ~30% більше токенів** · без цього будь-яке порівняння цін у курсі
  буде хибним · pricing
- **Sonnet 5 подешевшав назавжди ($2/$10), підвищення 1 вересня 2026 скасоване** · найсвіжіший
  факт, датувати обов'язково · pricing
- **`opusplan`** — Opus планує, Sonnet виконує · ідеальна відповідь на «як обирати під задачу й
  бюджет», і саме те, чого в плані немає · model-config.md
- **`s` у пікері `/model`** — перемкнути лише на сесію, не міняючи дефолт · commands.md
- **Автоматичний fallback за вмістом** (біологія/кібербезпека) · пояснює «чому модель раптом інша» ·
  model-config.md
- **Effort і модель входять у ключ кешу** → перемикання посеред задачі коштує повний перерахунок ·
  перетин із c05 · prompt-caching.md
- **Різниця fast mode vs нижчий effort** — таблиця з fast-mode.md: fast = та сама якість, менша
  затримка, вища ціна; нижчий effort = менше міркування, швидше, потенційно гірше на складному
- **`availableModels` + `enforceAvailableModels`** — як організація обмежує моделі · model-config.md
- **`/usage` показує розбивку по скілах, субагентах, плагінах і MCP-серверах** з відсотками, плюс
  behavior flags при ≥10% · costs.md
- **`/insights`** — HTML-звіт про власні патерни роботи, пише в `~/.claude/usage-data/report.html` ·
  costs.md, commands.md
- **Не звірено:** точні ліміти Pro / Max 5x / Max 20x у числах. Докси Claude Code на них **не дають
  чисел** і відсилають на claude.com/pricing. Я цю сторінку не відкривав. Курс має або взяти числа
  звідти з окремою датою, або чесно сказати «дивись актуальне на claude.com/pricing».

### Екрани для курсу

- `screens/claude--help.txt` — рядки `--model` (з прикладом `claude-fable-5`), `--effort`,
  `--fallback-model`.
- `screens/permission-mode-enum-test.txt` — містить дослівне повідомлення про валідні значення
  `--effort`: `Valid values: low, medium, high, xhigh, max.`
- **Таблиця цін** — відтворити з pricing (не екран, а таблиця; обов'язково з датою 2026-09-03 і
  лінком, бо ціни змінюються).
- **Інтерактивні, знімати вручну:** пікер `/model` (з цінами за MTok у рядках — але лише на
  Anthropic API!) · `/usage` з планними барами й розбивкою · іконка `↯` при fast mode ·
  згорнутий/розгорнутий thinking через `Ctrl+O`.

### Пастки новачка

- **Вмикає fast mode «щоб швидше»** → на Pro/Max це списується з usage credits понад підписку. І
  якщо credits не увімкнені, побачить дослівно: `Fast mode requires usage credits · /usage-credits
  to turn them on`.
- **Вмикає fast mode посеред довгої розмови** → платить повну fast-ціну за весь накопичений
  контекст одразу.
- **Ставить `max` effort «бо найкраще»** → thinking-токени тарифікуються як output, рахунок росте
  непропорційно.
- **Перемикає модель посеред задачі** → повний перерахунок кешу + попередження, яке легко
  проклацати.
- **Бачить «You've hit your Opus limit» і думає, що все** → перемикання на Sonnet через `/model`
  рятує. А от при «session limit» / «weekly limit» — не рятує. Це різні повідомлення.
- **Порівнює ціни Sonnet 4.6 і Opus 5 «за MTok»** без поправки на новий токенізатор (~+30% токенів).
- **Чекає Fable 5.1 на 2.1.236** → її там немає.
- **Думає, що `/model` міняє модель лише на сесію** → за замовчуванням `Enter` зберігає як дефолт
  для НОВИХ сесій. Для «лише зараз» треба `s`.

---

## Загальні висновки по c01–c08

### Чи вистачає восьми модулів

**Ні, на цей матеріал не вистачає — але не всюди однаково.**

- **c01, c03 — вистачає з запасом.** Матеріалу навіть менше, ніж на повний модуль; c01 можна
  ущільнити й віддати час іншим.
- **c02 — вистачає, якщо винести термінал-лікнеп.** Зараз у ньому і «що таке термінал», і чотири
  ОС, і шість способів установки, і автентифікація, і огляд шести поверхонь. Це два модулі,
  склеєні в один.
- **c04 — не вистачає категорично.** Повний перелік слеш-команд — це ~90 позицій; гарячих клавіш
  із keybindings.md — понад 100 у 19 контекстах. Плюс прапорці CLI (~90). Один модуль це не
  вміщає навіть як довідник.
- **c05 — вистачає, якщо prompt caching піде в c08.** Інакше не вистачає.
- **c06 — не вистачає.** Шість режимів + правила + protected/critical paths + класифікатор +
  пісочниця — це найщільніший модуль курсу і водночас найважливіший для безпеки.
- **c07 — на межі.** Сесії й checkpointing вміщаються; віддалені поверхні (cloud/teleport/
  Remote Control/Dispatch/desktop) — вже ні.
- **c08 — вистачає, якщо ціни подати як довідкову таблицю, а не розбирати.**

### Що варто винести окремо

1. **«Термінал з нуля» — окремий модуль c00 або додаток.** Обґрунтування: Anthropic сама так
   зробила, написавши окрему сторінку `terminal-guide.md` для цієї аудиторії. Курс, чий заявлений
   читач «не знає нічого», не може ховати це в модуль про встановлення.
2. **Шпаргалка як окремий друкований/PDF-артефакт, а не модуль.** Клавіші й команди не вивчають
   лінійно — до них повертаються. c04 тоді стає «як влаштований інтерфейс і як шукати потрібне»
   (`/help`, `?`, `/` меню, `--help`), а повний перелік іде додатком.
3. **«Скільки це коштує» — окремий модуль між c05 і c08.** Зараз ціна розмазана: prompt caching у
   c05, ціни моделей у c08, `/usage` у c04, ліміти в c08. А це одна історія, і для безкоштовного
   курсу з масовою аудиторією — критична.
4. **Віддалені поверхні (cloud, teleport, Remote Control, Dispatch, desktop, mobile) — окремий
   модуль.** У c07 вони чужорідні: c07 про «повернутись до вчорашньої роботи», а це про «працювати
   не з-за свого стола».

### Чого бракує в зоні c01–c08

- **Модуля про `CLAUDE.md` і пам'ять.** У зоні c01–c08 його немає, але `CLAUDE.md` згадується в
  c01 (що бачить Claude), c05 (що переживає компакцію, чому правка не діє), c06 (класифікатор його
  читає). Якщо він у c09–c16 — добре; якщо ніде — це діра. **Не звірено:** я не бачив плану c09–c16.
- **Модуля про `/status` і діагностику стану сесії.** Розмазано по c02 (`claude doctor`), c03,
  c05 (`/context`), c08 (`/usage`).
- **Теми «як питати правильно» (best practices).** Сторінка `best-practices.md` існує в індексі
  доксів, я її **не читав**. Це прогалина цього звіту.
- **Теми відновлення після поломки:** `--safe-mode`, `/doctor`, `claude project purge`,
  `--debug`/`--debug-file`, `/heapdump`. Зараз розкидано.

### Перетини з зоною c09–c16 (звіряє інший агент)

Місця, де моя зона неминуче заходить на чужу — треба узгодити межу:

1. **Skills.** c04 мусить сказати, що `/`-меню показує скіли нарівні з командами і що кастомні
   команди тепер = скіли. Повний розбір авторства скілів — не мій.
2. **MCP.** c05 (відкладені схеми, вартість контексту), c04 (`/mcp`), c02 (`claude mcp --help`).
   Налаштування серверів — не моє.
3. **Субагенти.** c05 (окреме контекстне вікно як спосіб економії), c07 (`/fork`, `/subtask`,
   правки субагентів не відкочуються). Написання субагентів — не моє.
4. **Хуки.** c05 (`PostToolUse`, `SessionStart` при компакції, фільтрація виводу), c06
   (`PreToolUse` як шлях схвалення), c07 (`transcript_path`). Написання хуків — не моє.
5. **Плагіни.** c05 (вмикання/вимикання б'є по кешу), c02 (`claude plugin --help`).
6. **Sandbox/`/sandbox` проти Skills-скіла `/sandbox`.** ⚠️ **Колізія імен, яку треба узгодити:**
   `/sandbox` у commands.md описаний як **`[Skill]` — «Create an isolated Node.js sandbox where you
   can run code without file-system permissions»**, а `sandboxing.md` описує `/sandbox` як **панель
   налаштування пісочниці Bash із трьома вкладками**. Це або два різні `/sandbox`, або розбіжність
   у самих доксах. **Не звірено — я не запускав команду.** Хто б не писав про пісочницю, це треба
   з'ясувати, бо інакше курс навчить неправильного.
7. **`/loop`, `/schedule`, scheduled tasks.** c04 (клавіші/команди), c07 (сесії з `/loop` не
   показуються в пікері), c08 (рядки Loops у `/usage`). Автоматизація — не моя.
8. **Agent SDK / headless.** c04 (`-p`, `--output-format`), c07 (`-p`-сесії невидимі). Побудова
   агентів — не моя.

### Найважливіше, що я знайшов

Якщо з усього звіту курс візьме три речі, хай це буде:

1. **Докси випереджають будь-яку встановлену збірку.** Курс мусить фіксувати версію на кожному
   екрані, інакше застаріє за тиждень — рівно так, як застарів план від 2026-08-24.
2. **`--help` і докси розходяться, і обидва бувають неповні — а два `--help` в одній збірці
   суперечать один одному.** Доведено тричі: (а) `--permission-mode default` працює, але його немає
   в списку choices головного `--help`; (б) `claude remote-control --help` показує `default` і
   ховає `manual`, тобто рівно навпаки до головного; (в) вісім підкоманд (`attach`, `logs`, `stop`,
   `respawn`, `rm`, `daemon`, `remote-control`, `self-hosted-runner`) існують, але відсутні у списку
   `Commands:`. Водночас `claude config`, навпаки, зник зовсім. Правильна методика для учня —
   перевіряти на живій системі, а не вірити одному джерелу.
3. **На Pro/Max/Team дефолт — auto mode, і це змінює весь досвід першої сесії.** Курс, написаний
   із припущенням «Claude завжди питає», навчить неправильної моделі довіри.
