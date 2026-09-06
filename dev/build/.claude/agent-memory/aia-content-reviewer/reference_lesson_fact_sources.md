---
name: lesson-fact-sources
description: Де перевіряти факти уроків «AI Термінал» і як швидко зняти живі докси (curl у скретчпад замість WebFetch)
metadata:
  type: reference
---

Три дозволені джерела фактів уроку (`lesson-contract.md` §7): живі докси
`code.claude.com/docs/en/*.md`, `dev/build/005-ai-terminal/00-research/screens/*.txt`,
власний читальний запуск команди.

**Швидкий спосіб зняти докси:** `curl -sL "https://code.claude.com/docs/en/<page>.md" -o <скретчпад>/docs/<page>.md`
і далі `grep` по файлах. Це на порядок швидше за WebFetch по одному твердженню:
одна сторінка = один запит, і потім десятки цитат звіряються локально й посимвольно.
Сторінки, які закривають більшість тверджень про встановлення й вхід:
`setup`, `authentication`, `cli-reference`, `troubleshoot-install`, `troubleshooting`,
`commands`, `permission-modes`, `vs-code`.

**Мапа «урок → фактура»** — `dev/build/005-ai-terminal/01-authoring/facts-map.md`
(увага: § у `facts-c01-c08.md` зсунуті на одиницю — рядок `c03` уроку живе в § `c02` фактури).
Знахідки авторів, які часто підтверджують числа в уроці, — `01-authoring/cross-findings.md`.

Перевірено 2026-09-06: цитати з доксів у `c03` збіглися дослівно; `brew info --cask claude-code`
досі віддає `2.1.236`, `claude-code@latest` — `2.1.261`, тобто розрив каналів у курсі не вигаданий.

**WebFetch не годиться для дослівних цитат.** Він проганяє сторінку через маленьку модель і
віддає переказ: блок помилок `errors.md` прийшов як `Context exceeds the ...-token limit by
... tokens`, а той самий рядок через curl — з числами й пунктуацією
(`Context exceeds the 200k-token limit by 94k tokens — run /compact or /clear to continue.`).
Рядок помилки, назву прапорця, ключ налаштувань — тільки curl + grep.

**Покажчик усіх сторінок:** `https://code.claude.com/docs/llms.txt`. Терміни курсу дослівно —
`glossary.md`; «токен ≈ 3,5 англійських символи» — не там, а в
`https://platform.claude.com/docs/en/about-claude/glossary.md`.

**Сторінки, які закривають тему контексту й компакції** (`c06`): рядки помилок контексту —
`errors.md` · thrashing і `Not enough messages to compact.` — `troubleshooting.md` + `costs.md` ·
таблиця «що переживає компакцію» й числа симуляції — `context-window.md` · «правка CLAUDE.md
посеред сесії не діє» і кеш — `prompt-caching.md` · пороги автокомпакції — `model-config.md` ·
перелік категорій `/context` — `debug-your-config.md` · діалог `Resume from a summary` —
`sessions.md` · `Summarize from/up to here` — `checkpointing.md`.

**Безпечна перевірка прапорця на живій збірці:** `claude --<прапорець> <значення> --version`
друкує версію й одразу виходить; докси прямо кажуть, що `--autocompact` перекриває збережене
налаштування лише на цей запуск, не змінюючи його. Так на 2.1.263 дослівно відтворились обидва
екрани `c06`, зняті на 2.1.236 (розійшовся тільки номер версії).

**Сторінки, які закривають тему сесій, історії й відкату** (`c09`): визначення сесії,
пікер із клавішами, `/branch`, `Resume from a summary`, шлях `~/.claude/projects/<project>/<id>.jsonl`
і таблиця «Permission mode on resume» — `sessions.md` · чекпойнти, шість пунктів меню `/rewind`,
межі (bash, субагенти, symlink) — `checkpointing.md` · **усе про вміст `~/.claude`** —
`claude-directory.md`: `history.jsonl` («Every prompt you've typed…»), `file-history/`
(«Checkpoint restore for past sessions»), розділ `Plaintext storage` («not encrypted at rest»)
і повний приклад виводу `claude project purge --dry-run` · дослівні тексти помилок
(`No conversation found with session ID` з чотирма причинами, `Restored the code, but skipped N
files…` повним реченням) — `errors.md` · псевдоніми слеш-команд (`/rewind` = `/checkpoint`,
`/undo`; `/resume` = `/continue`; `/clear` = `/reset`, `/new`) — `commands.md` ·
`cleanupPeriodDays` (мінімум 1, `0` не проходить валідацію) — `settings-reference.md` ·
історія вводу по папках і `Ctrl+R` — `interactive-mode.md`, розділ «Command history».

**Безпечна перевірка помилки відновлення:** `claude --resume <неіснуючий-uuid> </dev/null` не
запускає сесії — друкує рядок помилки й виходить із кодом 1 (перевірено на 2.1.263).

**Сторінки, які закривають тему перехоплювачів подій** (`c16`, довідник `-ref-hooks`):
`hooks.md` — повний довідник, ~318 КБ, у мапі `llms.txt` **не значиться**, її треба знати;
рівно **33** заголовки `###` між `## Hook events` і `## Prompt-based hooks` (перевірено
2026-09-06, число не змінилось із 2026-09-03). `hooks-guide.md` — гайд; саме там живуть
розділи «Hooks and permission modes» (`PreToolUse` спрацьовує до перевірки будь-якого
режиму; `deny` діє й у `bypassPermissions`) і «Limitations and troubleshooting»
(`/hooks` порожній, `Hook JSON has no effect`, ліміт 8 блокувань `Stop`).
Дотичне: «інструкції — контекст, а не примусова конфігурація» + «блокувати треба
`PreToolUse`-хуком» — `memory.md` (двічі: вступ і розділ про те, що писати у файл);
«хуки виконуються **поза** пісочницею Bash» — `sandboxing.md` (розділ про заборону запису
в конфіги) і `sandbox-environments.md` («run `--dangerously-skip-permissions` sessions
inside a container, a VM, or the sandbox runtime, so that file tools, MCP servers, and
hooks are also inside the boundary»).

**Сторінки, які закривають тему `.claude/` і `settings.json`** (`c13`, довідник
`-ref-settings`): `settings.md` — усе про чотири файли, стос перекриття, «Lists merge instead
of overriding», «Settings Error / Settings Warning», сім винятків «суворіше перемагає
кероване», `auto`/`bypassPermissions` не діють із проєктного (до v2.1.257 `bypassPermissions`
діяв), локальний файл у корені репо з v2.1.211, `--settings` і його межа. **Увага:
`configuration.md` — побайтова копія `settings.md`, це та сама сторінка під двома адресами** ·
`settings-reference.md` (~425 КБ) — таблиця «All settings», кожен ключ окремим `###`; рахувати
`awk '/^#+ All settings/,0' … | grep -cE '^\| \[\`'` · `claude-directory.md` — таблиця «File
reference» (яка з 16 позицій `.claude/` комітиться), `CLAUDE.local.md` і `.mcp.json` **у корені**,
повний приклад `claude project purge --dry-run` · `debug-your-config.md` — `--safe-mode`,
`cd /tmp && CLAUDE_CONFIG_DIR=/tmp/claude-clean claude`, таблиця симптомів (саме там єдиний у
доксах рядок «Permissions, hooks, or env set globally are ignored → додано в `~/.claude.json`») ·
`env-vars.md` — `DISABLE_AUTOUPDATER` / `DISABLE_UPDATES` / `USE_BUILTIN_RIPGREP` /
`CLAUDE_CODE_GIT_BASH_PATH` дослівно · `hooks.md`, розділ «The `/hooks` menu» — доказ, що
меню показує **джерело** кожного хука.

**Сторінки, які закривають тему headless і CI** (`c19`, частково `c22`): `headless.md` — усе про
`-p`: рядок про коди виходу («exits with code 0 on success… so your scripts can branch on the exit
status», помилка аргументів у stderr до старту, збій усередині запуску друкується **як результат
у stdout**), `--bare` (що саме пропускає, «recommended mode for scripted and SDK calls, and will
become the default for `-p` in a future release», ніколи не читає OAuth і keychain), фонова Bash-
задача гине через ~5 с, фонові субагенти чекаються, стеля простою 10 хв, SIGTERM → 143 і порада
SIGINT, ліміт stdin 10 МБ, приклад `cat build-error.txt | claude -p … > output.txt`, npm-скрипт
«typo linter», `mcp_server_errors` (v2.1.219+), `--permission-prompts` (v2.1.259+), Windows-stdin
до v2.1.211, слеш-команди в `-p` (`/model sonnet`, `/effort`, `/fast`, `/color`, `/rename`,
`/mcp`, `/config ключ=значення`; `/login` — ні) · **чотири способи вижити в чужому репо** дослівно —
`permissions.md`, розділ «What runs before you trust a folder» (там же те, що `--bare` **не** рятує:
блок `env` і помічники на кшталт `awsAuthRefresh` діють далі) · `--worktree` у `-p` пропускає
перевірку довіри й лишає `git worktree lock` — `worktrees.md`, рядки 29 і 59 · `terminalSequence`
ігнорується в `-p` і SDK — `hooks.md`; «PermissionRequest у простому `-p` не має кому спрацювати,
бери `PreToolUse`» + «фоновим субагентам відмова, якщо жоден хук не вирішив» — `hooks-guide.md`,
розділ Limitations · `claude setup-token` (рік, Pro/Max/Team/Enterprise, ніде не зберігається,
`CLAUDE_CODE_OAUTH_TOKEN`, лише запити до моделі, **bare його не читає**) — `authentication.md` ·
YAML воркфлоу дослівно, `actions/checkout@v6`, два режими за наявністю `prompt`, перевірки актора
(право запису + не бот), `claude_args` — `github-actions.md` · бета, «підтримує GitLab, не
Anthropic», `~/.local/bin` у `PATH` — `gitlab-ci-cd.md` · research preview / Team+Enterprise / не
для ZDR, 🔴🟡🟣, «neutral conclusion» ніколи не блокує злиття, `REVIEW.md` без `@`-імпортів —
`code-review.md` (**увага:** там же сказано, що `CLAUDE.md` сервіс теж читає й робить із його
порушень 🟡 — формулювання «налаштовується не через CLAUDE.md» хибне) · «щоб вести той самий цикл
з іншої мови — запускай CLI підпроцесом із `-p --output-format json`» і заборона стороннім
пропонувати вхід через claude.ai — `agent-sdk/overview.md` · повний список полів `system/init`
(`agents`, `skills`, `plugins[].path`, `mcp_servers`, `cwd`) — `agent-sdk/typescript.md`,
`SDKSystemMessage`.

Пов'язане: [[content-review-008]]

**Сторінки, які закривають наскрізний проєкт і робочі звички** (`c21`): `best-practices.md` —
цитата «Claude stops when the work looks done…», **чотири** фази (Explore · Plan · Implement ·
Commit) у `<Steps>`, чотири рівні гейта (промпт · `/goal` · Stop-хук із «overrides the hook and
ends the turn after 8 consecutive blocks» · друга думка), «If you could describe the diff in one
sentence, skip the plan», інтерв'ю → `SPEC.md`, п'ять антипатернів у «Avoid common failure
patterns» (там-таки дослівне «After two failed corrections»), «Develop your intuition» ·
`output-styles.md` — п'ять вбудованих стилів, `Concise` «Requires v2.1.237 or later», чотири поля
frontmatter, `keep-coding-instructions` за замовчуванням `false`, `/output-style` deprecated
v2.1.73 / removed v2.1.91, стиль лише на головну розмову (виняток — форк) · `statusline.md` ·
`accessibility.md` (три способи ввімкнення, precedence прапорець > env > налаштування, дев'ять
міток `you:` … `Cost:`) · `voice-dictation.md` · `keybindings.md` · `code-review.md` (фоновий
субагент із власним контекстом, рівні зусиль, `Reusing high effort…`, `--fix` поза чекпойнтами) ·
`ultrareview.md` (3 безкоштовні на Pro і Max; `-p` спиняється до старту) ·
`costs.md` → «Analyze your usage patterns» (`/insights`, 200 сесій) ·
`errors.md` → `#security-review-fails-without-origin-head` (дослівний текст помилки й три фікси).

⚠️ **Пастка `statusline.md`:** у JSON, який отримує скрипт, **немає поля з поточною гілкою git** —
у таблиці «Available data» є лише `worktree.branch` / `worktree.original_branch` (тільки в
worktree-сесіях) і `pr.*`. Приклади в доксах беруть гілку самі (`git branch --show-current`).
Урок `c21` перелічував «гілку git» серед полів JSON — виправлено при рецензії 2026-09-06.

**Що з `c21` дешево відтворюється живцем** (перевірено 2026-09-06 на 2.1.263): помилка
`git diff --name-only origin/HEAD...` у порожньому репозиторії в `/private/tmp` — три рядки
побайтово як у доксах, `echo $?` → **128** · `bash test.sh` із `slugify.sh` — усі чотири рядки
екрана уроку · рядок довідки `--ax-screen-reader` (три рядки з відступом) не змінився з 2.1.236 ·
скрипт статус-лайна з доксів на макетному JSON друкує рівно те, що в уроці ·
`strings "$(which claude)" | grep -c` на 2.1.263: `Concise` → **8** (на 2.1.236 було 0),
`Explanatory` → **7** (було 8) — знімок уроку датований і лишається чинним.

**Сторінки, які закривають тему роботи без людини** (`c20`): три механізми розписання, `/loop`,
`cron`, jitter, семиденне протермінування, `CronCreate/List/Delete`, `CLAUDE_CODE_DISABLE_CRON` —
`scheduled-tasks.md` (та сама порівняльна таблиця дослівно повторена в `desktop-scheduled-tasks.md`,
там же сон машини й «рівно один наздоганяючий запуск за 7 днів») · Routines, тригери
(розписання / API / GitHub), `routine-fire-payload`, «зелений статус ≠ успіх», добова межа
запусків і причини `Unknown command: /schedule` — `routines.md` · `--channels` не видно в
`claude --help` (розділ «Research preview»), Bun, Telegram/Discord/iMessage, `fakechat`,
`channelsEnabled`/`allowedChannelPlugins` — `channels.md`; умова про ревізію протоколу
`2026-07-28` — **лише при `MCP_PROTOCOL_NEGOTIATION=auto`** (`mcp.md`, розділ «MCP client
runtimes») · три вердикти `/goal`, 4 000 символів, `Goal cleared after an unrecoverable error`,
ліміт трьох перевірок у простої — `goal.md` · «тільки вихідні HTTPS, ніколи не відкриває вхідних
портів», запис розмови на серверах Anthropic, ~4 години на `--continue`, `tmux`/`screen` —
`remote-control.md` · `--cloud` / `--teleport` (і те, що `--cloud` **не вимагає GitHub**: є
бандл локального репозиторію) — `claude-code-on-the-web.md` · Dispatch (Pro/Max, не Team) і
`/desktop` — `desktop.md` + `commands.md` · «хмарні сесії не читають `~/.claude/skills/`» —
`skills.md`, розділ «Skills in Cowork and cloud sessions» · рядки Loops у `/usage` (2.1.242) і
чому витрата росте в простої — `costs.md` · рядок таблиці «Run fully unattended inside a
container» — **`permission-modes.md`**, а цитата «constrains only Bash…» — `sandbox-environments.md`.
