# Звірена фактура для модулів c09–c16 («AI Термінал», Фази 3–5)

**Дата звірки: 2026-09-03.** Локальна версія: `claude` **2.1.236** (`/opt/homebrew/bin/claude`),
підтверджено `claude --version` → `2.1.236 (Claude Code)`.

**Метод.** Кожен факт має джерело одного з трьох типів:
1. `$ команда` — реальний запуск локально, дослівний вивід збережений у
   `00-research/screens/` (мої файли з префіксом `b-`);
2. URL офіційної документації — сторінки завантажені `curl` як сирий Markdown
   (не через рендер), тому цитати дослівні;
3. `не звірено` — там, де перевірити не вдалося.

**Важливе застереження про метод.** `timeout` на macOS відсутній (`command not found`),
тому всі запуски обгорнуті в `perl -e 'alarm N; exec @ARGV'`. Це варто знати авторові
курсу: приклади з `timeout 20 claude …` на маку в учня не запрацюють.

**Що НЕ вдалося перевірити** (чесно, без здогадів):
- усе, що вимагає інтерактивної сесії: `/memory`, `/context`, `/hooks`, `/config`,
  `/usage`, `/plugin`, `/agents`, `/skills`, `/statusline`, режим plan, agent view,
  панель тімейтів. Запуск `claude` без аргументів заблокував би агента, тому такі
  екрани описані словами з посиланням на докси, а не зняті;
- `/skill-doctor` — рання доступність, у цій сесії команда відсутня. Описана нижче,
  але **не можна казати учневі «запусти її»** без перевірки в його збірці;
- `claude plugin eval` — існує, але в цій сесії закритий раннім доступом
  (доказ: `b-plugin-eval-gate.txt`);
- будь-що, що змінює стан (`claude update`, `mcp add/remove`, `plugin install`) —
  свідомо не запускалось.

---

## Загальна знахідка, що стосується всіх модулів: `claude config` більше не існує

Підкоманди `config` у CLI **немає**. `claude config --help` не дає помилки, а друкує
кореневий хелп: парсер трактує слово `config` як позиційний аргумент `prompt`.
У списку `Commands:` кореневого хелпу є рівно 14 підкоманд, і `config` серед них немає:

```
agents · auth · auto-mode · doctor · gateway · import · install · mcp ·
plugin|plugins · project · setup-token · ultrareview · update|upgrade
```

Джерело: `$ claude --help` (`screens/claude--help.txt`), `$ claude config --help`
(`screens/b-config-help.txt`). Наслідок для курсу: **старі туторіали з
`claude config set -g theme dark` не працюють.** Налаштування змінюються або
in-session командою `/config`, або редагуванням `settings.json`.

---

## c09 — CLAUDE.md і памʼять

### Перевірено

| Факт | Джерело | Дата |
| --- | --- | --- |
| Двi системи памʼяті: `CLAUDE.md` (пише людина, інструкції) і auto memory (пише Claude, спостереження). Обидві вантажаться щосесії | https://code.claude.com/docs/en/memory.md | 2026-09-03 |
| Локації CLAUDE.md у порядку завантаження: managed policy (`/Library/Application Support/ClaudeCode/CLAUDE.md` · `/etc/claude-code/CLAUDE.md` · `C:\Program Files\ClaudeCode\CLAUDE.md`) → `~/.claude/CLAUDE.md` → `./CLAUDE.md` або `./.claude/CLAUDE.md` → `./CLAUDE.local.md` | memory.md | 2026-09-03 |
| Файли **конкатенуються**, не перекривають одне одного. Порядок: від кореня ФС вниз до cwd; у межах теки `CLAUDE.local.md` дописується після `CLAUDE.md` | memory.md | 2026-09-03 |
| Вкладені CLAUDE.md у підтеках вантажаться **на вимогу**, коли Claude читає файл у тій підтеці, а не на старті | memory.md | 2026-09-03 |
| Імпорти через `@path/to/file`; відносні шляхи — від файлу з імпортом, не від cwd; максимум **4 стрибки** вглиб; парсер пропускає код-спани й фенси, тому `` `@README` `` у бектіках не імпортується | memory.md | 2026-09-03 |
| Зовнішній імпорт у проєктному файлі памʼяті (шлях поза робочою текою) показує діалог схвалення один раз; відмова вимикає імпорти назавжди без повторного питання | memory.md | 2026-09-03 |
| Ліміт розміру: рекомендація **до 200 рядків**; файл понад **4 MiB** Claude Code пропускає повністю | memory.md | 2026-09-03 |
| Блокові HTML-коментарі `<!-- … -->` вирізаються з CLAUDE.md до потрапляння в контекст (спосіб лишити нотатку людині без витрат токенів). Коментарі всередині код-блоків зберігаються | memory.md | 2026-09-03 |
| `AGENTS.md` Claude Code **не читає**. Міст — `@AGENTS.md` першим рядком CLAUDE.md або симлінк | memory.md | 2026-09-03 |
| `/init` генерує стартовий CLAUDE.md; якщо файл існує — пропонує покращення, не перезаписує. Читає `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`. Змінна `CLAUDE_CODE_NEW_INIT=1` вмикає інтерактивний багатофазний потік | memory.md | 2026-09-03 |
| `.claude/rules/*.md` — модульні правила, рекурсивний пошук `.md`. Без `paths:` вантажаться на старті нарівні з `.claude/CLAUDE.md`; з `paths:` (YAML frontmatter, гліби) — лише коли Claude працює з відповідними файлами | memory.md | 2026-09-03 |
| Auto memory: чотири типи в полі `type` — `user`, `feedback`, `project`, `reference`. Claude свідомо пропускає те, що виводиться з коду | memory.md | 2026-09-03 |
| Auto memory лежить у `~/.claude/projects/<project>/memory/`, `<project>` виводиться з git-репозиторію → **усі worktrees одного репо ділять одну памʼять**. Індекс `MEMORY.md` + топік-файли | memory.md | 2026-09-03 |
| У кожну сесію вантажаться **перші 200 рядків або перші 25KB** `MEMORY.md`, що настане раніше. Топік-файли на старті НЕ вантажаться — Claude читає їх на вимогу | memory.md | 2026-09-03 |
| Auto memory вимикається `autoMemoryEnabled: false` або `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`; переноситься `autoMemoryDirectory` (абсолютний шлях або `~/`) | memory.md | 2026-09-03 |
| Auto memory виключена зі «сміттєзбирання» за `cleanupPeriodDays`; тека видаляється лише якщо була порожня весь період | memory.md, claude-directory.md | 2026-09-03 |
| CLAUDE.md подається як **user-повідомлення після системного промпту**, не як частина системного. Тому гарантії дотримання немає | memory.md | 2026-09-03 |
| Кореневий CLAUDE.md переживає `/compact`: Claude перечитує його з диска й повторно вставляє. Вкладені й path-scoped — перезавантажуються, коли знову збігся файл | memory.md | 2026-09-03 |
| Файлів `settings.json` чотири рівні: `~/.claude/settings.json` (user) · `.claude/settings.json` (project) · `.claude/settings.local.json` (local) · managed policy | https://code.claude.com/docs/en/settings.md, claude-directory.md | 2026-09-03 |
| Повний перелік ключів `settings.json` — **222 ключі** у 14 тематичних групах | https://code.claude.com/docs/en/settings-reference.md → `screens/b-settings-keys-full.txt` | 2026-09-03 |
| Живий приклад user-налаштувань цього проєкту: `statusLine`, `enabledPlugins`, `language`, `alwaysThinkingEnabled`, `effortLevel`, `voice`, `skipWorkflowUsageWarning`, `theme`, `terminalProgressBarEnabled`, `voiceEnabled` | `$ cat ~/.claude/settings.json` | 2026-09-03 |
| Живий приклад project-local: `permissions.allow` + `enabledMcpjsonServers` | `$ cat /Users/ander1.sage/Downloads/AIA/.claude/settings.local.json` | 2026-09-03 |

### Повна структура `.claude/` (звірено з docs + живою текою)

Джерело таблиці: https://code.claude.com/docs/en/claude-directory.md, розділ «File reference».

| Файл | Область | Комітити | Що робить |
| --- | --- | --- | --- |
| `CLAUDE.md` | проєкт і глобально | так | Інструкції, вантажаться щосесії |
| `rules/*.md` | проєкт і глобально | так | Тематичні інструкції, опційно з `paths:` |
| `settings.json` | проєкт і глобально | так | Дозволи, хуки, env, дефолти моделі |
| `settings.local.json` | лише проєкт | ні | Особисті перекриття; Claude Code сам додає в `.gitignore`, коли туди пише |
| `.mcp.json` | лише проєкт (корінь репо) | так | MCP-сервери для команди |
| `.worktreeinclude` | лише проєкт (корінь репо) | так | Які gitignored-файли копіювати в нові worktrees |
| `skills/<name>/SKILL.md` | проєкт і глобально | так | Скіли, `/name` |
| `commands/*.md` | проєкт і глобально | так | Однофайлові промпти; **той самий механізм, що й скіли** |
| `output-styles/*.md` | проєкт і глобально | так | Кастомні секції системного промпту |
| `agents/*.md` | проєкт і глобально | так | Субагенти |
| `workflows/*.js` | проєкт і глобально | так | Динамічні воркфлоу; кожен файл стає `/<name>` |
| `agent-memory/<name>/` | проєкт і глобально | так | Постійна памʼять субагентів |
| `~/.claude.json` | лише глобально | ні | Стан застосунку, OAuth, персональні MCP-сервери |
| `projects/<project>/memory/` | лише глобально | ні | Auto memory |
| `keybindings.json` | лише глобально | ні | Кастомні шорткати |
| `themes/*.json` | лише глобально | ні | Кастомні теми |

Поза цією текою: `managed-settings.json` (системний рівень), `CLAUDE.local.md`
(корінь проєкту), `~/.claude/plugins/` (керується командами `claude plugin`).

**Жива тека проєкту AIA** (`$ find /Users/ander1.sage/Downloads/AIA/.claude`):
`settings.local.json` + `agents/` (4 файли) + `skills/` (19 симлінків). Це рівно той
приклад «як воно виглядає насправді», який варто показати в курсі.

**Дані застосунку в `~/.claude/`** (не конфіг, а те, що Claude Code пише сам):
`history.jsonl` (кожен ваш промпт), `projects/<project>/<session>.jsonl` (повні
транскрипти), `file-history/` (знімки файлів до правок, для rewind),
`plans/`, `debug/`, `paste-cache/`, `image-cache/`, `session-env/`, `tasks/`,
`shell-snapshots/`, `backups/`, `stats-cache.json`, `usage-data/`.
Прибирається автоматично за `cleanupPeriodDays` (дефолт 30, мінімум 1, `0` = помилка
валідації). **Усе це — плейнтекст**, шифрування немає, захист лише правами файлів.

### Повний перелік ключів `settings.json` (222 ключі, за групами)

Дослівний перелік з описами й областю дії — у `screens/b-settings-keys-full.txt`
(витягнутий з таблиці «All settings» сторінки `settings-reference.md`). Групи й
кількість ключів у кожній:

| Група | Приклади ключів |
| --- | --- |
| **Model and responses** (24) | `advisorModel`, `alwaysThinkingEnabled`, `availableModels`, `effortLevel`, `enforceAvailableModels`, `fallbackModel`, `fastMode`, `fastModePerSessionOptIn`, `language`, `model`, `modelOverrides`, `modelPicker`, `modelPricing`, `modelSettings`, `outputStyle`, `promptCacheTtl`, `showThinkingSummaries`, `subagentPromptCacheTtl`, `switchModelsOnFlag`, `ultracode` |
| **Permission settings** (13) | `permissions` (+ `.allow`, `.ask`, `.deny`, `.additionalDirectories`, `.defaultMode`, `.disableBypassPermissionsMode`), `autoMode`, `autoMode.classifyAllShell`, `disableAutoMode`, `useAutoModeDuringPlan`, `allowManagedPermissionRulesOnly`, `skipAutoPermissionPrompt`, `skipDangerousModePermissionPrompt` |
| **Sandbox settings** (~37) | `sandbox` і вся гілка: `.enabled`, `.filesystem.*` (allowWrite/denyWrite/denyRead/allowRead), `.network.*` (allowedDomains, deniedDomains, strictAllowlist, проксі-порти, tlsTerminate), `.credentials.*`, `.excludedCommands`, `.ignoreViolations` |
| **Memory and context** (10) | `autoCompactEnabled`, `autoCompactWindow`, `autoMemoryDirectory`, `autoMemoryEnabled`, `claudeMd`, `claudeMdExcludes`, `env`, `fileCheckpointingEnabled`, `plansDirectory`, `skillListingBudgetFraction`, `skillListingMaxDescChars` |
| **Interface and terminal** (~40) | `theme`, `statusLine`, `subagentStatusLine`, `editorMode`, `keybindingFlavor`, `verbose`, `voice`, `voiceEnabled`, `spinnerTips*`, `spinnerVerbs`, `terminalProgressBarEnabled`, `timeFormat`, `timeZone`, `tui`, `viewMode`, `prefersReducedMotion`, `axScreenReader`, `respectGitignore`, `spellcheck`, `emojiCompletionEnabled`, `fileSuggestion`, `showTurnDuration` |
| **Git and attribution** (7) | `attribution` (+ `.commit`, `.pr`, `.sessionUrl`), `includeCoAuthoredBy`, `includeGitInstructions`, `prUrlTemplate` |
| **Hooks and automation** (9) | `hooks`, `disableAllHooks`, `allowedHttpHookUrls`, `httpHookAllowedEnvVars`, `allowManagedHooksOnly`, `enableWorkflows`, `disableWorkflows`, `workflowKeywordTriggerEnabled`, `workflowSizeGuideline` |
| **Plugins and skills** (~19) | `enabledPlugins`, `extraKnownMarketplaces`, `pluginConfigs`, `disableBundledSkills`, `skillOverrides`, `syncClaudeAiSkills`, `disableSkillShellExecution`, `blockedMarketplaces`, `strictKnownMarketplaces`, `strictPluginOnlyCustomization` (+ `.skills`, `.agents`, `.hooks`, `.mcp`), `channelsEnabled`, `allowedChannelPlugins` |
| **MCP** (8) | `enabledMcpjsonServers`, `disabledMcpjsonServers`, `enableAllProjectMcpServers`, `allowedMcpServers`, `deniedMcpServers`, `allowManagedMcpServersOnly`, `allowAllClaudeAiMcps`, `disableClaudeAiConnectors` |
| **Agents, sessions, worktrees** (11) | `agent`, `teammateMode`, `crossSessionInbound`, `disableAgentView`, `isolatePeerMachines`, `processWrapper`, `worktree` (+ `.baseRef`, `.symlinkDirectories`, `.sparsePaths`, `.bgIsolation`) |
| **Remote, desktop, notifications** (13) | `enableArtifact`, `disableArtifact`, `disableRemoteControl`, `remoteControlAtStartup`, `agentPushNotifEnabled`, `inputNeededNotifEnabled`, `preferredNotifChannel`, `awaySummaryEnabled`, `sshConfigs`, `sshHostAllowlist`, `remote.defaultEnvironmentId` |
| **Authentication and providers** (8) | `apiKeyHelper`, `forceLoginMethod`, `forceLoginOrgUUID`, `forceLoginGatewayUrl`, `awsAuthRefresh`, `awsCredentialExport`, `gcpAuthRefresh`, `otelHeadersHelper` |
| **Updates / Tools / Privacy** (12) | `autoUpdatesChannel`, `minimumVersion`, `requiredMinimumVersion`, `requiredMaximumVersion`, `browserExternalPageTools`, `disableBrowserExternalNavigation`, `disableMobileSimulatorTools`, `cleanupPeriodDays`, `desktopSessionCleanupPeriodDays`, `feedbackDrafts`, `feedbackSurveyRate`, `skipWebFetchPreflight` |
| **Enterprise / Global config** (~14) | `managedSourcesBehavior`, `parentSettingsBehavior`, `policyHelper` (+ `.path`, `.timeoutMs`, `.refreshIntervalMs`), `disableSideloadFlags`, `forceRemoteSettingsRefresh`, `wslInheritsWindowsSettings`; у `~/.claude.json`: `autoConnectIde`, `autoInstallIdeExtension`, `diffTool`, `externalEditorContext`, `permissionExplainerEnabled`, `teammateDefaultModel` |

**Для курсу з 222 ключів реально треба ~15.** Мінімальний робочий набір новачка:
`permissions.allow/deny/ask`, `permissions.defaultMode`, `env`, `hooks`, `model`,
`effortLevel`, `theme`, `statusLine`, `outputStyle`, `enabledPlugins`,
`enabledMcpjsonServers`, `autoMemoryEnabled`, `cleanupPeriodDays`,
`includeCoAuthoredBy`, `autoCompactWindow`. Решту згадати як «є довідник, ось URL».

### Застаріло в плані

- **План каже «`/config`» як спосіб змінювати все.** Насправді: in-session `/config` —
  так, а от CLI-підкоманди `claude config` **не існує взагалі** (див. загальну знахідку
  вище). Якщо в плані десь є `claude config set` — це помилка, яку побачить кожен учень
  на першій хвилині.
- **План не розрізняє `.claude/CLAUDE.md` і `./CLAUDE.md`.** Обидва валідні й
  рівноправні для проєктного рівня — це варто сказати прямо, бо люди шукають «правильний».
- **`/memory` не показує, що реально завантажилось.** План, схоже, вважає `/memory`
  діагностикою. Насправді `/memory` — це список файлів і редактор; **що справді
  потрапило в контекст, показує `/context`** (розділ «Memory files»). Це різні команди
  з різними задачами, і плутанина тут коштує учневі години.

### Додати, чого в плані немає

| Тема | Чому важлива | Джерело |
| --- | --- | --- |
| `.claude/rules/` з `paths:` frontmatter | Головний інструмент проти роздутого CLAUDE.md: правило вантажиться лише коли Claude торкнувся відповідних файлів. Для монорепо — обовʼязково | memory.md |
| HTML-коментарі вирізаються з CLAUDE.md | Дешевий трюк: нотатки для людей не коштують токенів | memory.md |
| `claudeMdExcludes` | У монорепо чужі CLAUDE.md засмічують контекст; це єдиний спосіб їх відрізати | memory.md, settings-reference.md |
| Ліміт `MEMORY.md`: 200 рядків / 25KB | Учень не зрозуміє, чому Claude «забув» — усе, що за лімітом, просто не вантажиться | memory.md |
| `claude project purge` | Єдиний штатний спосіб стерти всі локальні дані проєкту (транскрипти, памʼять, історію) | `$ claude project --help` |
| Плейнтекст-застереження | Якщо Claude прочитав `.env`, секрет уже лежить у `~/.claude/projects/*.jsonl` незашифрованим. Це має бути в курсі як факт, а не як натяк | claude-directory.md |
| `--setting-sources user,project,local` | Дозволяє вимкнути цілий рівень налаштувань — рятує при відлагодженні «чому воно так поводиться» | `$ claude --help` |
| `--safe-mode` | Стартує з вимкненими ВСІМА кастомізаціями. Перший крок діагностики зламаного конфіга | `$ claude --help` |

### Екрани для курсу

- `screens/b-settings-keys-full.txt` — повний перелік 222 ключів. У курсі показати
  **не весь**, а зріз на 15 ключів (список вище) + скрін «а взагалі їх 222, ось довідник».
- `screens/claude--help.txt` — блок `Commands:` як доказ, що `config` немає.
- `screens/b-config-help.txt` — той самий кореневий хелп у відповідь на `claude config --help`.
  Сильний навчальний момент: «команда не впала — вона зробила вигляд, що ви написали промпт».
- **Інтерактивно, зняти неможливо** — `/memory`: відкриває список локацій памʼяті
  (user і project CLAUDE.md, включно з файлами, яких ще немає), перемикач auto memory
  й пункт «відкрити теку auto memory»; вибір файлу відкриває його у вашому редакторі.
  Джерело: memory.md, розділ «View and edit with `/memory`».
- **Інтерактивно** — `/context`: показує реально завантажене; секція **Memory files**.
  Це той екран, яким доводять, що CLAUDE.md підхопився. Джерело: memory.md.
- Жива тека: `/Users/ander1.sage/Downloads/AIA/.claude/` — 4 агенти + 19 симлінків
  на скіли. Готовий приклад «як виглядає справжній проєкт», не вигаданий.

### Пастки новачка

1. **«Написав у CLAUDE.md — значить виконається».** Ні. Це контекст, не конфігурація.
   Docs кажуть прямо: гарантії немає, надто для розмитих формулювань. Що робити:
   формулювати перевірювано («2 пробіли», а не «форматуй гарно»), а якщо треба
   **залізно** — писати hook, не інструкцію.
2. **Роздутий CLAUDE.md.** Понад 200 рядків = більше токенів і **гірше** дотримання.
   Людина думає, що детальніше = краще, і робить собі гірше. Вихід: `.claude/rules/`
   з `paths:` або скіли.
3. **`@import` не економить контекст.** Люди розбивають файл на імпорти й думають, що
   полегшили сесію. Імпорти розгортаються на старті — економії нуль, лише організація.
4. **Інструкція «зникла» після `/compact`.** Якщо її дали в чаті, а не в CLAUDE.md —
   вона й мала зникнути. Кореневий CLAUDE.md компакт переживає.
5. **Правка `settings.json` з помилкою в JSON.** У `-p`/пайп-режимі невалідні файли
   налаштувань **ігноруються мовчки**, без діалогу помилки (прямо написано в описі
   `-p` у `claude --help`). Тобто в CI ваш конфіг може просто не застосуватись, і ви
   про це не дізнаєтесь. Перевірка: `claude doctor`.
6. **Очікування, що auto memory синхронізується між машинами.** Вона машинно-локальна.

---

## c10 — Skills, команди, плагіни

### Перевірено

| Факт | Джерело | Дата |
| --- | --- | --- |
| Скіл — це тека з `SKILL.md`. Локації: enterprise (managed) · `~/.claude/skills/<name>/SKILL.md` · `.claude/skills/<name>/SKILL.md` · `<plugin>/skills/<name>/SKILL.md` | https://code.claude.com/docs/en/skills.md | 2026-09-03 |
| Пріоритет при збігу імен: **enterprise > personal > project**. Скіл будь-якого рівня перекриває bundled-скіл із тим самим імʼям, але **не** його аліаси | skills.md | 2026-09-03 |
| **Злиття команд і скілів ПІДТВЕРДЖЕНО, з нюансом.** Дослівно: «If you have files in `.claude/commands/`, those work the same way, but if a skill and a command share the same name, **the skill takes precedence**» | skills.md | 2026-09-03 |
| Файли в `.claude/commands/` підтримують **той самий frontmatter**, крім `name` і `paths`, які там ігноруються. Викликаються за іменем файлу. Docs прямо рекомендують скіли, бо ті вміють supporting files | skills.md | 2026-09-03 |
| У довіднику `.claude/` рядок `commands/*.md` описаний як «Single-file prompts; **same mechanism as skills**» | claude-directory.md | 2026-09-03 |
| Frontmatter скіла — **21 поле**, усі опційні; рекомендоване лише `description` | skills.md | 2026-09-03 |
| Frontmatter читається, лише якщо `---` — **перший рядок файлу**. Інакше весь файл, разом із `---`, стає тілом скіла | skills.md | 2026-09-03 |
| `description` + `when_to_use` разом обрізаються на **1536 символів** у переліку скілів | skills.md | 2026-09-03 |
| Хто викликає: за замовчуванням обидва. `disable-model-invocation: true` — лише людина. `user-invocable: false` — лише Claude | skills.md | 2026-09-03 |
| **Опис скіла завжди в контексті, тіло — лише після виклику.** Виняток: `disable-model-invocation: true` прибирає опис із контексту теж | skills.md | 2026-09-03 |
| Тіло викликаного скіла лишається в контексті **на наступні ходи**; Claude Code не перечитує файл. Тому кожен рядок — рекурентна вартість | skills.md | 2026-09-03 |
| Після авто-компакту скіли переприкріплюються: перші **5000 токенів** кожного, спільний бюджет **25 000 токенів**, заповнюється від найсвіжішого | skills.md | 2026-09-03 |
| `allowed-tools` діє **лише на той хід**, у якому скіл викликано; очищається з наступним повідомленням користувача. Не обмежує — лише передсхвалює | skills.md | 2026-09-03 |
| **Workspace trust НЕ гейтить `allowed-tools`.** Проєктний скіл із репозиторію застосує свій грант навіть у `-p` у теці, якій ви ніколи не довіряли | skills.md | 2026-09-03 |
| Підстановки: `$ARGUMENTS`, `$ARGUMENTS[N]`, `$N`, `$name`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_EFFORT}`, `${CLAUDE_SKILL_DIR}`, `${CLAUDE_PROJECT_DIR}`, `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}` | skills.md | 2026-09-03 |
| Progressive disclosure: `SKILL.md` до 500 рядків, деталі — в сусідні файли (`reference.md`, `examples.md`, `scripts/`), на які скіл посилається | skills.md | 2026-09-03 |
| Live change detection: правки `SKILL.md` підхоплюються **без рестарту**. Але зміни в `hooks/`, `.mcp.json`, `agents/`, `output-styles/` теки-плагіна потребують `/reload-plugins` | skills.md | 2026-09-03 |
| Скіл-тека з доданим `.claude-plugin/plugin.json` вантажиться як плагін `<name>@skills-dir` і може нести агентів, хуки, MCP | skills.md | 2026-09-03 |
| Плагінні скіли живуть у неймспейсі `plugin-name:skill-name`, тому не конфліктують | skills.md | 2026-09-03 |
| Маніфест плагіна: `.claude-plugin/plugin.json`, поля `name` (обовʼязкове, воно ж неймспейс), `description`, `version`, `author`; далі `homepage`, `repository`, `license` | https://code.claude.com/docs/en/plugins.md | 2026-09-03 |
| Підкоманди `claude plugin`: `details`, `disable`, `enable`, `eval`, `init|new`, `install|i`, `list`, `marketplace`, `prune|autoremove`, `tag`, `uninstall|remove`, `update`, `validate` | `$ claude plugin --help` (`screens/claude-plugin--help.txt`) | 2026-09-03 |
| `claude plugin marketplace`: `add`, `list`, `remove|rm`, `update` | `$ claude plugin marketplace --help` (`screens/b-plugin-marketplace-help.txt`) | 2026-09-03 |
| `claude plugin init <name>` створює каркас у `~/.claude/skills/<name>/`, який автозавантажиться наступної сесії як `<name>@skills-dir`. Прапорець `--with` приймає: `skills, agents, hooks, mcp, lsp, output-style, channel` | `$ claude plugin init --help` (`screens/b-plugin-init-help.txt`) | 2026-09-03 |
| `claude plugin validate <path> [--strict]` перевіряє маніфест плагіна/маркетплейсу **або** скіли/агентів/команди в теці. `--strict` = падати на ворнінгах (для CI) | `$ claude plugin validate --help` (`screens/b-plugin-validate-help.txt`) | 2026-09-03 |
| `claude plugin details <name>` показує інвентар компонентів і **прогнозовану вартість у токенах** | `$ claude plugin details --help` | 2026-09-03 |
| Живий приклад: 4 встановлені плагіни, 2 enabled (`exa` 3.4.1, `frontend-design`) у scope `user`, 2 disabled у scope `local`; маркетплейс один — `claude-plugins-official` (GitHub `anthropics/claude-plugins-official`) | `$ claude plugin list`, `$ claude plugin marketplace list` (`screens/b-plugin-list-live.txt`) | 2026-09-03 |
| Слеш-команд у довіднику — **111** | https://code.claude.com/docs/en/commands.md → `screens/b-slash-commands-full.txt` | 2026-09-03 |

### Повний frontmatter `SKILL.md` (21 поле)

Джерело: skills.md, «Frontmatter reference». Булеві поля приймають також
`yes/no/on/off/1/0` у будь-якому регістрі (з v2.1.218).

| Поле | Що робить |
| --- | --- |
| `name` | Відображуване імʼя. **Для персональних і проєктних скілів команду задає імʼя теки, а не це поле.** Для плагінних — задає останній сегмент команди |
| `description` | Коли застосовувати. Головне поле: за ним Claude вирішує, чи брати скіл |
| `when_to_use` | Додаткові тригер-фрази; дописується до `description`, входить у ліміт 1536 символів |
| `argument-hint` | Підказка автокомпліту, напр. `[issue-number]` |
| `arguments` | Іменовані позиційні аргументи для `$name`-підстановки |
| `disable-model-invocation` | `true` = лише людина може викликати |
| `user-invocable` | `false` = лише Claude може викликати |
| `allowed-tools` | Передсхвалені інструменти **на один хід** |
| `disallowed-tools` | Прибрати інструменти з пулу, поки скіл активний |
| `model` | Модель на час дії скіла; `inherit` — лишити поточну |
| `effort` | `low` / `medium` / `high` / `xhigh` / `max` |
| `context` | `fork` — виконати у форкнутому субагентському контексті |
| `agent` | Тип субагента при `context: fork` |
| `background` | Лише з `context: fork`; `false` = чекати результату в тому ж ході |
| `hooks` | Хуки, що реєструються при виклику скіла й живуть **до кінця сесії** |
| `paths` | Гліби: авто-виклик лише коли Claude працює з такими файлами |
| `shell` | `bash` (дефолт) або `powershell` для `` !`команда` `` |
| `metadata` | Довільна YAML-мапа для власного тулінгу |
| `license` | Частина специфікації Agent Skills; Claude Code приймає, але не діє |
| `compatibility` | Те саме; рядок до 500 символів |

**Поза Claude Code** (завантаження на claude.ai, Skills API, `package_skill.py`)
дозволені **лише 6 полів**: `name`, `description`, `license`, `compatibility`,
`metadata`, `allowed-tools`. Будь-яке інше поле = **жорстка помилка**, не ігнорування:
`Unexpected key(s) in SKILL.md frontmatter: argument-hint.`

### Звідки береться імʼя команди

| Розташування | Джерело імені | Приклад |
| --- | --- | --- |
| `~/.claude/skills/` або `.claude/skills/` | **імʼя теки** (не frontmatter `name`) | `.claude/skills/deploy-staging/SKILL.md` → `/deploy-staging` |
| Вкладена `.claude/skills/` при конфлікті | шлях підтеки + імʼя теки | `apps/web/.claude/skills/deploy/` → `/apps/web:deploy` |
| `.claude/commands/` | **імʼя файлу** без розширення | `.claude/commands/deploy.md` → `/deploy` |
| `<plugin>/skills/<dir>/SKILL.md` | frontmatter `name` або імʼя теки, з префіксом плагіна | → `/my-plugin:review` |
| `<plugin>/SKILL.md` (корінь) | frontmatter `name`, фолбек — імʼя теки плагіна | → `/my-plugin:review` |

### Застаріло в плані

- **«Кастомні команди — окрема сутність».** Ні: `.claude/commands/x.md` і
  `.claude/skills/x/SKILL.md` дають один і той самий `/x`, і при збігу **виграє скіл**.
  Перевірка 2026-08-27 була права. Уточнення, якого в ній не було: команди — це
  **урізані** скіли (немає `name`, `paths`, supporting files), тобто не «те саме
  іншими словами», а підмножина. У курсі це має бути один модуль, а не два.
- **Якщо план каже «frontmatter скіла має 4–5 полів»** — насправді 21.
- **Якщо план каже «`name` у frontmatter задає команду»** — для персональних і
  проєктних скілів це **неправда**: команду задає імʼя теки. Класична пастка.

### Додати, чого в плані немає

| Тема | Чому важлива | Джерело |
| --- | --- | --- |
| Життєвий цикл вмісту скіла | Тіло лишається в контексті назавжди після виклику → «довгий скіл» коштує щоходу. Пояснює, чому скіли треба тримати короткими | skills.md |
| Бюджет після компакту (5k/25k токенів) | Пояснює, чому після компакту скіл «перестав діяти» — його могло витіснити | skills.md |
| `allowed-tools` діє один хід | Люди вважають, що це постійний грант, і не розуміють, чому знову питає | skills.md |
| Безпека: `allowed-tools` не гейтиться trust | Скіл із чужого репо може дати собі широкий доступ. Має бути в c10 **і** в c16 | skills.md |
| `claude plugin validate` і `--strict` | Єдиний спосіб перевірити скіли/агентів до запуску; для CI | `$ claude plugin validate --help` |
| `claude plugin details` — вартість у токенах | Прямо відповідає на «скільки мені коштує цей плагін» | `$ claude plugin details --help` |
| `claude plugin init --with …` | Найшвидший старт для власного плагіна | `$ claude plugin init --help` |
| 6-польове обмеження поза Claude Code | Хто робитиме скіл для claude.ai — впаде на `argument-hint` | skills.md |
| `claude plugin eval` | Гарнес для тестування плагінів/скілів. **Ранній доступ**: у цій сесії `plugin eval` друкує `` `plugin eval` is currently in early access `` і виходить з кодом 1. Команда існує — просто закрита. Згадати чесно, не обіцяти | `$ claude plugin eval` (`screens/b-plugin-eval-gate.txt`), `$ claude plugin eval --help` |

### Екрани для курсу

- `screens/b-plugin-list-live.txt` — **справжній** `claude plugin list` із scope,
  версіями і статусами enabled/disabled. Показати, що `Version: unknown` — нормально.
- `screens/b-plugin-init-help.txt` — список `--with` компонентів: одразу видно, з чого
  взагалі складається плагін.
- `screens/b-plugin-eval-help.txt` — повний хелп eval-гарнеса (працює навіть коли
  сама команда закрита).
- `screens/b-plugin-eval-gate.txt` — як **саме** виглядає закритий ранній доступ.
  Цінний екран: учень має відрізняти «команди немає» від «команда є, але не для мене».
- `screens/b-slash-commands-full.txt` — 111 команд. У курсі дати як довідник-додаток.
- Живий скіл: `/Users/ander1.sage/Downloads/AIA/.claude/skills/gsap-core/SKILL.md` —
  реальний frontmatter (`name`, `description`, `license`) + тіло.
- Живий приклад progressive disclosure:
  `/Users/ander1.sage/Downloads/AIA/.claude/skills/supabase/` — `SKILL.md` + `references/`
  + `assets/` + `CHANGELOG.md`.
- **Інтерактивно** — `/plugin`: менеджер плагінів; вкладка **Stats** показує вартість
  і використання (те саме, що `/plugin stats`). Джерело: skills.md, discover-plugins.md.

### Пастки новачка

1. **Створив `.claude/skills/my-skill.md` замість теки.** Скіл — це **тека** з
   `SKILL.md`. Файл на верхньому рівні просто не побачать.
2. **Поставив `name: deploy` у `.claude/skills/foo/SKILL.md` і чекає `/deploy`.**
   Буде `/foo`. Для не-плагінних скілів `name` — лише ярлик у списку.
3. **`---` не в першому рядку** (порожній рядок, BOM, коментар зверху). Тоді frontmatter
   не читається взагалі, і весь YAML разом із рисками потрапляє в тіло як текст.
   Скіл «є», але поводиться дивно. Діагностика: `claude plugin validate .claude/skills`.
4. **Скіл не спрацьовує сам.** Майже завжди — слабкий `description`. Docs радять
   ставити ключовий випадок вживання **першим**, бо все після 1536 символів обрізається.
5. **Скіл спрацьовує занадто часто.** Зворотна проблема; лікується `paths:` або
   `disable-model-invocation: true`.
6. **Правки в `hooks/` плагіна не діють.** Live-детекція покриває **лише текст
   `SKILL.md`**. Для решти — `/reload-plugins`.
7. **Ставить плагін і не бачить його.** Інсталяція може повідомити
   `Run /reload-plugins to activate.` — цей рядок легко проґавити.

---

## c11 — Субагенти й паралельність

### Перевірено

| Факт | Джерело | Дата |
| --- | --- | --- |
| **`/agents` більше не інтерактивний.** З v2.1.198 команда друкує нагадування попросити Claude створити/змінити агента або відредагувати `.claude/agents/` вручну. Інтерфейс був до v2.1.197 включно | https://code.claude.com/docs/en/commands.md | 2026-09-03 |
| Вбудовані субагенти: **Explore**, **Plan**, **general-purpose**, плюс службові `claude`, `statusline-setup`, `claude-code-guide` | https://code.claude.com/docs/en/sub-agents.md | 2026-09-03 |
| Explore і Plan — read-only (Write і Edit заборонені) і **свідомо пропускають CLAUDE.md і git status** заради швидкості й ціни. Усі інші агенти їх вантажать | sub-agents.md | 2026-09-03 |
| З v2.1.198 Explore успадковує модель головної розмови (на Claude API — з обмеженням зверху до Opus), а не завжди Haiku | sub-agents.md | 2026-09-03 |
| Frontmatter агента — **19 полів**; обовʼязкові лише `name` і `description` | sub-agents.md | 2026-09-03 |
| `name` не може містити `:` (зарезервовано під плагінні ідентифікатори) і не може починатися з `-`; такий файл не завантажиться, помилка піде в debug-лог | sub-agents.md | 2026-09-03 |
| Файл агента **мовчки пропускається**, якщо: немає `name`; `---` не перший рядок; є `name`, але немає `description`; YAML не парситься | sub-agents.md | 2026-09-03 |
| Перевірити теку агентів до сесії: `claude plugin validate .claude/agents` (потребує v2.1.233+). Не ловить випадок «парситься, але без `name`» | sub-agents.md | 2026-09-03 |
| Порядок вибору моделі: per-invocation `model` → frontmatter `model` (`inherit` = модель головної розмови) → `CLAUDE_CODE_SUBAGENT_MODEL` → модель головної розмови | sub-agents.md | 2026-09-03 |
| **Ліміт паралельності — 20** одночасних субагентів; далі `Concurrent subagent limit reached`, і Claude отримує вказівку не повторювати. Змінюється через `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`. Сесії з ultracode звільнені від ліміту. Потребує v2.1.217+ | sub-agents.md | 2026-09-03 |
| Ліміту на **загальну** кількість субагентів за сесію немає. Окремо є ліміт глибини вкладеності | sub-agents.md | 2026-09-03 |
| Субагент стартує з **чистим ізольованим контекстом**: не бачить вашої історії, викликаних скілів, прочитаних файлів | sub-agents.md | 2026-09-03 |
| Що потрапляє в старт субагента: власний системний промпт · делегаційне повідомлення · **уся ієрархія CLAUDE.md** · знімок git status · повний вміст скілів із поля `skills` · «sibling roster» (реєстр інших агентів) | sub-agents.md | 2026-09-03 |
| Що **не** потрапляє: output style, auto memory головної розмови, розмір контекстного вікна батька (у субагента своє, за його моделлю) | sub-agents.md | 2026-09-03 |
| **Передача контексту між агентами** — інструмент `SendMessage`. «Sibling roster» приходить системним нагадуванням і містить `main` та всіх іменованих агентів як валідні значення `to`. Зʼявляється лише якщо в інструментах субагента є `SendMessage` і хоча б один інший агент має імʼя. Це **знімок** на момент старту — пізніше названі агенти в ньому не зʼявляться. Потребує v2.1.206+ | sub-agents.md | 2026-09-03 |
| Форк (`/subtask`) — виняток: успадковує батьківську розмову й системний промпт, тобто й output style теж | sub-agents.md | 2026-09-03 |
| Хуки в frontmatter субагента живуть **лише поки він працює**; `Stop` там автоматично конвертується в `SubagentStop` | https://code.claude.com/docs/en/hooks.md | 2026-09-03 |
| Хуки у frontmatter **проєктного** субагента виконуються лише після прийняття workspace trust; `-p`-сесія за прийняття не рахується (з v2.1.218) | hooks.md | 2026-09-03 |
| `isolation: worktree` — субагент у тимчасовому git worktree, за замовчуванням від **дефолтної гілки**, а не від `HEAD` батька. Worktree прибирається автоматично, якщо змін не було | sub-agents.md | 2026-09-03 |
| Agent teams **вимкнені за замовчуванням**; вмикаються `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (у shell або в `env` у settings.json) | https://code.claude.com/docs/en/agent-teams.md | 2026-09-03 |
| Увімкнення agent teams **змінює звичайне делегування**: субагент, якому Claude дав імʼя, стартує як тімейт. Команди можуть утворюватись, навіть якщо ви їх не просили | agent-teams.md | 2026-09-03 |
| Тімейти потребують **інтерактивної** сесії. У `-p` і в Agent SDK іменований субагент лишається звичайним субагентом | agent-teams.md | 2026-09-03 |
| Фонові агенти: `claude --bg` / `--background`, керування через `claude agents`; `claude agents --json` віддає активні сесії масивом (не потребує TTY) | `$ claude --help`, `$ claude agents --help` | 2026-09-03 |
| Живий приклад агента з 8 полями frontmatter: `name`, `description`, `tools`, `model: claude-opus-5`, `effort: high`, `color: green`, `memory: project`, `skills:` (список із 8) | `$ sed -n '1,20p' /Users/ander1.sage/Downloads/AIA/.claude/agents/aia-build-qa.md` | 2026-09-03 |

### Повний frontmatter файлу агента (19 полів)

Джерело: sub-agents.md, «Supported frontmatter fields».

| Поле | Обовʼязкове | Що робить |
| --- | --- | --- |
| `name` | **так** | Ідентифікатор (нижній регістр + дефіси). Хуки отримують його як `agent_type`. Імʼя файлу збігатися не мусить |
| `description` | **так** | Коли Claude має делегувати цьому агентові |
| `tools` | ні | Інструменти агента. Без поля успадковує всі. Якщо жоден запис не резолвиться — агент **не стартує** з помилкою |
| `disallowedTools` | ні | Що прибрати зі списку |
| `model` | ні | `sonnet`/`opus`/`haiku`/`fable`, повний ID, або `inherit` |
| `permissionMode` | ні | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`, `manual`. Ігнорується для плагінних агентів |
| `maxTurns` | ні | Ліміт агентських ходів; при досягненні результат позначається частковим і його можна відновити |
| `skills` | ні | Скіли, чий **повний вміст** інʼєктується на старті (не лише опис) |
| `mcpServers` | ні | MCP-сервери для цього агента: імена вже налаштованих або inline-визначення |
| `hooks` | ні | Хуки на час життя агента |
| `memory` | ні | `user` / `project` / `local` — постійна памʼять між сесіями |
| `background` | ні | `true` — тримати у фоні навіть коли Claude просить передній план |
| `effort` | ні | `low`…`max` |
| `isolation` | ні | `worktree` |
| `color` | ні | `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan` |
| `initialPrompt` | ні | Автоподається першим ходом, коли агент — головний агент сесії (`--agent`) |
| `experimental` | ні | Мапа; ключ `cacheTtl` (`5m`/`1h`) керує часом життя кешу промпту. Потребує v2.1.248+ |

### Коли субагент виправданий, а коли шкодить

Дослівні рекомендації з `sub-agents.md` («Common patterns», «Choose between subagents
and main conversation») і `agent-teams.md` («Best practices»):

**Виправданий:** ізоляція високооб'ємних операцій (щоб «сміття» не осіло в головному
контексті) · паралельне дослідження · ланцюжок агентів · друга думка при верифікації.

**Шкодить:** коли задача мала й контекст головної розмови вже потрібен — субагент
починає **з нуля** й не знає нічого з того, що ви щойно обговорили. Docs прямо кажуть:
якщо правило має дійти до субагента, його треба **повторити в делегаційному промпті**,
бо CLAUDE.md субагент бачить, а вашу розмову — ні.

**Практична знахідка цього проєкту (не з доксів, з памʼяті власника):** бекендер +
фронтендер паралельно працюють, а **троє одночасно рвуться посеред запису**. Докси
дають ліміт 20, але реальний робочий ліміт цього конвеєра — 2. Це варто показати в
курсі як приклад «офіційний ліміт ≠ ваш ліміт».

### Застаріло в плані

- **«`/agents` — інтерактивний інтерфейс створення агентів».** Уже ні: з v2.1.198 це
  просто нагадування редагувати файли. Якщо в курсі буде скрін меню — учень його не
  побачить.
- **Якщо план каже, що агент успадковує контекст розмови** — це неправда для всіх,
  крім форка.
- **Якщо план подає agent teams як доступні з коробки** — вони вимкнені за
  замовчуванням і потребують `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

### Додати, чого в плані немає

| Тема | Чому важлива | Джерело |
| --- | --- | --- |
| `SendMessage` + sibling roster | Це і є відповідь на «як передавати контекст між агентами». Із застереженням: roster — знімок на старті | sub-agents.md |
| Мовчазне пропускання файлів агентів | Найгірший клас багів: агента «немає», і ніхто не сказав чому. Разом із `claude plugin validate` і `--debug` | sub-agents.md |
| `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` і ліміт 20 | Прямо відповідає на питання модуля про паралельність | sub-agents.md |
| `isolation: worktree` гілкується від **дефолтної** гілки | Контрінтуїтивно: люди чекають гілку від `HEAD` | sub-agents.md |
| Explore/Plan не бачать CLAUDE.md | Пояснює, чому вони «ігнорують ваші правила». Це не баг | sub-agents.md |
| `--agent` як головний агент сесії + `initialPrompt` | Ціла модель роботи, якої немає в плані | `$ claude --help`, sub-agents.md |
| `claude agents --json` | Скриптовий доступ до фонових сесій | `$ claude agents --help` |
| Dynamic workflows (`.claude/workflows/*.js`) | Окремий механізм оркестрації; кожен файл стає `/<name>`. Джерело правди — `workflows.md` | claude-directory.md, workflows.md |
| Worktrees: `.worktreeinclude` | Без нього gitignored-файли (напр. `.env`) не потраплять у worktree, і агент зламається на порожньому конфізі | claude-directory.md, worktrees.md |

### Екрани для курсу

- `/Users/ander1.sage/Downloads/AIA/.claude/agents/aia-build-qa.md` — реальний
  frontmatter із 8 полями, включно з рідкісними `effort`, `memory`, `skills`.
  Найкращий приклад курсу, бо не вигаданий і робочий.
- `screens/claude-agents--help.txt` — усі прапорці керування фоновими агентами.
- **Інтерактивно, зняти неможливо** — agent view / панель тімейтів: список агентів під
  полем вводу; стрілки — вибір, `Enter` — відкрити транскрипт і написати агентові,
  `Escape` — зняти вибір (а під час перегляду транскрипту — перервати хід того агента).
  Понад три простійні тімейти згортаються в рядок `N idle agents`. Джерело: agent-teams.md.
- **Інтерактивно** — `/agents` у 2.1.236: покаже текстове нагадування, не меню.
  Це варто зняти учневі самому як вправу «перевір, чи туторіал не застарів».

### Пастки новачка

1. **Агент «не існує», хоча файл на місці.** Причина майже завжди у frontmatter:
   немає `description`, `---` не в першому рядку, або `:` в `name`. Claude Code
   **мовчить**. Ліки: `claude --debug`, потім `claude plugin validate .claude/agents`.
2. **Очікування, що субагент «памʼятає розмову».** Не памʼятає. Контекст треба класти
   в делегаційний промпт.
3. **`tools:` із помилкою в назві.** Якщо жоден запис не резолвиться в інструмент,
   агент не стартує зовсім — і помилка називає саме ці записи.
4. **Симлінки агентів.** У цьому проєкті агенти лежать у `dev/build/.claude/`, а гарнес
   шукає їх у кореневій `.claude/` — тому там симлінки. Видалиш симлінк — агента не
   видно, хоча файл цілий. Гарний реальний приклад для курсу.
5. **Увімкнув agent teams і не розуміє, чому Claude плодить тімейтів.** Це задокументована
   побічна дія: іменований субагент стає тімейтом.
6. **Чекає тімейтів у `-p`.** Їх там не буде за конструкцією.

---

## c12 — Hooks

**Головний висновок модуля: подій не 8 і не «близько тридцяти», а рівно 33.**
Перерахунок за заголовками розділу «Hook events» у
https://code.claude.com/docs/en/hooks.md (сирий Markdown, 317 KB).

Важливо для курсу: **сторінок про хуки дві**, і план, схоже, знає лише одну.
- https://code.claude.com/docs/en/hooks-guide.md — «Automate actions with hooks», гайд;
- https://code.claude.com/docs/en/hooks.md — «Hooks reference», повний довідник
  (схеми входу, decision control, async, MCP-хуки). У мапі доксів `hooks.md` **не
  вказана**, її треба знати. Саме там уся фактура нижче.

### Перевірено (архітектура)

| Факт | Джерело | Дата |
| --- | --- | --- |
| Три рівні вкладеності конфігурації: **подія** → **matcher group** (фільтр) → **hook handler** (що виконати) | hooks.md | 2026-09-03 |
| **Пʼять типів обробників**: `command` (shell), `http` (POST на URL), `mcp_tool` (виклик інструмента підключеного MCP-сервера), `prompt` (одноходова оцінка моделлю), `agent` (субагент з інструментами; експериментальний) | hooks.md | 2026-09-03 |
| Усі збіжні хуки виконуються **паралельно**. Той самий обробник, визначений у кількох файлах налаштувань, виконується **один раз**; копія з плагіна чи скіла лишається окремою | hooks.md | 2026-09-03 |
| Локації хуків: `~/.claude/settings.json` · `.claude/settings.json` · `.claude/settings.local.json` · managed policy · плагінний `hooks/hooks.json` · frontmatter **скіла** · frontmatter **субагента** | hooks.md | 2026-09-03 |
| Хук зі frontmatter **скіла** реєструється при виклику й живе **до кінця сесії** (навіть на наступних ходах). `once: true` знімає його після першого успішного запуску — і **honored лише у скілах**, у settings і агентах ігнорується | hooks.md | 2026-09-03 |
| Хук зі frontmatter **субагента** живе лише поки той працює; `Stop` там конвертується в `SubagentStop` | hooks.md | 2026-09-03 |
| Плейсхолдери шляхів: `${CLAUDE_PROJECT_DIR}`, `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`. У worktree `${CLAUDE_PROJECT_DIR}` **лишається на місці**, а поточну теку Claude віддає полем `cwd` вхідного JSON | hooks.md | 2026-09-03 |
| Дві форми команди: **exec form** (є `args` — прямий spawn, без shell, спецсимволи проходять дослівно) і **shell form** (немає `args` — рядок іде в `sh -c` / Git Bash / PowerShell) | hooks.md | 2026-09-03 |
| Вивід хука (`additionalContext`, `systemMessage`, plain stdout) обрізається на **10 000 символів**; надлишок пишеться у файл, а Claude отримує превʼю + шлях | hooks.md | 2026-09-03 |
| `/hooks` — **лише перегляд**. Показує всі 5 типів із префіксом `[type]` і джерелом (`User Settings`, `Project Settings`, `Local Settings`, `Plugin Hooks`, `Session Hooks`). Додавати/міняти — тільки редагуванням JSON | hooks.md | 2026-09-03 |
| Вимкнути всі хуки: `"disableAllHooks": true`. Для одного запуску: `--settings '{"disableAllHooks": true}'`. **Вимкнути один хук, лишивши його в конфізі, неможливо** | hooks.md | 2026-09-03 |
| Відлагодження: `claude --debug-file <path>` або `claude --debug` (лог у `~/.claude/debug/<session-id>.txt`). `--debug` **не друкує в термінал** | hooks.md | 2026-09-03 |

### Matcher: як він обчислюється

| Значення matcher | Як трактується | Приклад |
| --- | --- | --- |
| `"*"`, `""` або відсутній | збіг з усім | спрацьовує щоразу |
| Лише літери, цифри, `_`, `-`, пробіли, `,`, `\|` | **точний рядок** або список точних рядків через `\|` чи `,` | `Bash`; `Edit\|Write`; `Edit, Write` |
| Містить будь-який інший символ | **JavaScript-регулярка, неякорена** | `^Notebook`; `mcp__memory__.*` |

- Регулярка перевіряється через `RegExp.prototype.test` → збіг **будь-де** в рядку.
  `Edit.*` збігається і з `Edit`, і з `NotebookEdit`. Треба точно — пишіть `^Edit$`.
- Коми як роздільник і толерантність до пробілів — з **v2.1.191**.
- Дефіси в наборі точного збігу — з **v2.1.195**. На старіших версіях `code-reviewer`
  трактується як регулярка й ловить ще й `senior-code-reviewer`.
- `FileChanged` і `StopFailure` мають **вужчий** набір точного збігу: лише літери,
  цифри, `_` і `|`. Дефіс, пробіл або кома там залишають вираз регуляркою.
- **MCP-інструменти**: `mcp__<server>__<tool>`. Щоб зловити всі інструменти сервера,
  `.*` **обовʼязковий**: `mcp__memory__.*`. Голе `mcp__memory` — це точний рядок, який
  не збігається ні з чим. Інструменти сервера з плагіна:
  `mcp__plugin_<plugin>_<server>__<tool>`.
- Поле `if` на рівні обробника фільтрує **точніше**, синтаксисом правил дозволів:
  `"Bash(git *)"`, `"Edit(*.ts)"`. Працює **лише** на подіях інструментів
  (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`,
  `PermissionDenied`); на інших подіях хук із `if` **не виконається ніколи**.
  Один `if` = рівно одне правило: `&&` і `||` немає.
- `if` — **best effort**. Коли Claude Code не може визначити, що саме виконає Bash
  (`$TOOL git push`), він запускає хук про всяк випадок. Для жорсткого заборонення
  треба система дозволів, а не хук.

### ПОВНА ТАБЛИЦЯ ВСІХ 33 ПОДІЙ

Колонки: **коли спрацьовує** · **matcher (за чим фільтрує)** · **ключові поля входу**
(понад спільні) · **що можна на виході / чи блокує exit 2**.
Спільні поля входу є в усіх: `session_id`, `transcript_path`, `cwd`, `hook_event_name`;
у більшості також `permission_mode`, а де доречно — `prompt_id`, `effort`, `agent_id`,
`agent_type`.

| # | Подія | Коли спрацьовує | Matcher | Ключові поля входу | Вихід / exit 2 |
| --- | --- | --- | --- | --- | --- |
| 1 | `SessionStart` | Сесія починається або відновлюється | `startup`, `resume`, `clear`, `compact`, `fork` | `source`, `model`, `seconds_since_last_response`, `context_tokens`, `prompt_cache_likely_expired`, `estimated_cache_write_usd` | `additionalContext`, `initialUserMessage`, `sessionTitle`, `watchPaths`, `reloadSkills`. Plain stdout теж іде в контекст. **Не блокує** (exit 2 → stderr лише користувачу) |
| 2 | `Setup` | Старт із `--init-only`, або з `--init`/`--maintenance` у `-p`. Для разової підготовки в CI | `init`, `maintenance` | `trigger` | Немає decision control. **Не блокує** (код і stderr ігноруються) |
| 3 | `InstructionsLoaded` | CLAUDE.md або `.claude/rules/*.md` завантажено в контекст (на старті й при лінивому дозавантаженні) | `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact` | `file_path`, `memory_type`, `load_reason` | Немає. **Не блокує** (exit code ігнорується) |
| 4 | `UserPromptSubmit` | Ви надіслали промпт, до обробки | немає | `prompt` | `decision: "block"` + `reason`; `additionalContext`. **Блокує**: відхиляє промпт і **стирає** його. Дефолтний timeout знижено до 30 с |
| 5 | `UserPromptExpansion` | Введена команда розгортається в промпт, до Claude | імʼя команди/скіла | `expansion_type`, `command_name`, `command_args`, `command_source`, `prompt` | `decision: "block"`; `additionalContext`. **Блокує** розгортання |
| 6 | `MessageDisplay` | Поки текст відповіді асистента виводиться на екран | немає | `turn_id`, `message_id`, `index`, `final`, `delta` | `displayContent` — підміняє показаний текст. **Лише відображення**: транскрипт і те, що бачить Claude, лишаються оригінальними. Не блокує. Timeout 10 с |
| 7 | `PreToolUse` | Перед виконанням виклику інструмента | імʼя інструмента | `tool_name`, `tool_input`, `tool_use_id` | `permissionDecision`: `allow` / `deny` / `ask` / `defer` + `permissionDecisionReason`; `updatedInput` (переписати аргументи); `additionalContext`. **Блокує** виклик |
| 8 | `PermissionRequest` | Виклик інструмента потребує рішення про дозвіл | імʼя інструмента | `tool_name`, `tool_input`, `permission_suggestions` | `decision.behavior`: `allow`/`deny`; `decision.updatedInput`; правила дозволів, щоб не питати надалі. **Exit 2 НЕ honored** — забороняти треба обʼєктом `decision` |
| 9 | `PostToolUse` | Після успішного виклику інструмента | імʼя інструмента | `tool_name`, `tool_input`, `tool_response`, `tool_use_id`, `duration_ms` | `decision: "block"` + `reason`; `updatedToolOutput` (підмінити результат); `additionalContext`. **Не блокує** (інструмент уже відпрацював), але exit 2 **показує stderr Claude** |
| 10 | `PostToolUseFailure` | Після невдалого виклику інструмента | імʼя інструмента | `tool_name`, `tool_input`, `tool_use_id`, `error`, `is_interrupt`, `duration_ms` | `decision: "block"`; `additionalContext`. Не блокує; exit 2 показує stderr Claude |
| 11 | `PostToolBatch` | Після того як **уся пачка** паралельних викликів завершилась, перед наступним викликом моделі | немає | `tool_calls` | `decision: "block"`. **Блокує**: зупиняє агентський цикл до наступного виклику моделі |
| 12 | `PermissionDenied` | Auto mode відхилив виклик (у т.ч. без вердикту класифікатора) | імʼя інструмента | `tool_name`, `tool_input`, `tool_use_id`, `reason` | `hookSpecificOutput.retry: true` — сказати моделі, що можна спробувати ще раз. Для відмов без вердикту `retry` ігнорується. Exit code і stderr ігноруються |
| 13 | `Notification` | Claude Code надсилає сповіщення | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog`, `elicitation_url_dialog`, `elicitation_complete`, `elicitation_response`, `agent_needs_input`, `agent_completed`, `quota_auto_resume_fired`, `quota_auto_resume_stale`, `quota_auto_resume_disabled` | `message`, `title`, `notification_type` | Немає decision control. `terminalSequence` працює. Exit code і stderr ігноруються |
| 14 | `SubagentStart` | Субагента породжено | тип агента (`general-purpose`, `Explore`, `Plan`, власні імена, `^my-plugin:reviewer$`) | `agent_id`, `agent_type` | `additionalContext` (на початок розмови субагента). **Не блокує**; exit 2 → stderr лише користувачу, у транскрипт **субагента** |
| 15 | `SubagentStop` | Субагент завершився | тип агента | `stop_hook_active`, `agent_id`, `agent_type`, `agent_transcript_path`, `last_assistant_message`, `background_tasks`, `session_crons` | `decision: "block"`; `additionalContext`. **Блокує** зупинку субагента |
| 16 | `TaskCreated` | Задача створюється через `TaskCreate` | немає | `task_id`, `task_subject`, `task_description`, `teammate_name`, `team_name` | Exit 2 або `decision: "block"` — **скасовує** створення задачі. `continue: false` ігнорується |
| 17 | `TaskCompleted` | Задача позначається виконаною | немає | `task_id`, `task_subject`, `task_description`, `teammate_name`, `team_name` | Exit 2 або `continue: false`. **Блокує** позначення виконаною (`continue:false` ігнорується, якщо подію викликав `TaskUpdate`) |
| 18 | `Stop` | Claude закінчив відповідати | немає | `stop_hook_active`, `last_assistant_message`, `background_tasks`, `session_crons` | `decision: "block"` + `reason`; `additionalContext` (без помилки, розмова триває). **Блокує** зупинку. Після **8 поспіль** блокувань Claude Code перекриває хук і завершує хід |
| 19 | `StopFailure` | Хід завершився через помилку API | `rate_limit`, `overloaded`, `authentication_failed`, `oauth_org_not_allowed`, `account_on_hold`, `billing_error`, `invalid_request`, `model_not_found`, `server_error`, `max_output_tokens`, `unknown` | `error`, `error_details`, `last_assistant_message` | Немає. Вивід і exit code **повністю ігноруються**, крім `terminalSequence` |
| 20 | `TeammateIdle` | Тімейт agent team ось-ось перейде в простій | немає | `teammate_name`, `team_name` | Exit 2 або `continue: false`. **Блокує** перехід у простій — тімейт працює далі |
| 21 | `ConfigChange` | Конфігураційний файл змінився під час сесії | `user_settings`, `project_settings`, `local_settings`, `policy_settings`, `skills` | `source`, `file_path` | `decision: "block"`. **Блокує** застосування зміни — **крім** `policy_settings` |
| 22 | `CwdChanged` | Змінилася робоча тека (напр. Claude виконав `cd`) | **немає підтримки matcher** | `old_cwd`, `new_cwd` | Немає decision control. Не блокує |
| 23 | `DirectoryAdded` | Робочу теку додано в процесі сесії | `slash_command`, `register_repo_root` | `directory`, `source` | Немає. Не блокує (тека вже додана) |
| 24 | `FileChanged` | Змінився відстежуваний файл на диску | **літеральні імена файлів**, напр. `.envrc\|.env` | `file_path`, `event` | Немає decision control. Не блокує |
| 25 | `WorktreeCreate` | Створюється worktree (`--worktree`, `isolation: "worktree"`, фонова сесія). **Замінює стандартну git-поведінку** | немає | `name` | Command-хук друкує **шлях** у stdout; HTTP-хук віддає `hookSpecificOutput.worktreePath`. **Будь-який ненульовий код завалює створення** |
| 26 | `WorktreeRemove` | Worktree видаляється (вихід із сесії, завершення субагента, видалення фонової сесії) | немає | `worktree_path` | Немає. Помилки лише в debug-лог |
| 27 | `PreCompact` | Перед компакцією контексту | `manual`, `auto` | `trigger`, `custom_instructions` | `decision: "block"`. **Блокує** компакцію |
| 28 | `PostCompact` | Після завершення компакції | `manual`, `auto` | `trigger`, `compact_summary` | Немає. Не блокує |
| 29 | `PreModelSwitch` | Перед застосуванням запитаної зміни моделі | канонічне імʼя цільової моделі (`claude-opus-5`, `.*opus.*`) | `from_model`, `to_model`, `requested_model`, `source`, `context_tokens`, `prompt_cache_warm`, `cache_ttl`, `estimated_cache_write_usd`, `pricing` | `permissionDecision` (`allow`/`deny`/`ask`) або `decision: "block"`. **Блокує** зміну моделі. **Хук, знятий по timeout, теж блокує.** Timeout 30 с |
| 30 | `PostModelSwitch` | Після зміни моделі сесії, включно зі змінами, які зробив сам Claude Code (fallback, `opusplan`, відновлення при resume). Потребує **v2.1.251+** | канонічне імʼя моделі | ті самі, що в `PreModelSwitch`, плюс `source` = `auto` / `resume` | `additionalContext` (доставляється з наступним запитом). Не блокує. Якщо не вклався в 5 с після вашого промпту — вивід поїде з наступним запитом |
| 31 | `SessionEnd` | Сесія завершується | `clear`, `resume`, `logout`, `prompt_input_exit`, `other` | `reason` | Немає. Не блокує. **Спільний бюджет 1,5 с** на всі SessionEnd-хуки (піднімається до 60 с, якщо явно задати більший `timeout`) |
| 32 | `Elicitation` | MCP-сервер просить ввід користувача під час виклику інструмента | імʼя MCP-сервера | `mcp_server_name`, `message`, `mode`, `requested_schema` | `action`: `accept`/`decline`/`cancel`, `content` (значення полів форми). **Блокує** (відхиляє elicitation). При exit 2 `hookSpecificOutput` ігнорується |
| 33 | `ElicitationResult` | Після відповіді користувача, перед відправкою назад серверу | імʼя MCP-сервера | `mcp_server_name`, `action`, `content`, `mode`, `elicitation_id` | `action`, `content` (перекрити значення). **Блокує** (дія стає decline) |

**Події без підтримки matcher (спрацьовують завжди):** `UserPromptSubmit`,
`PostToolBatch`, `Stop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`,
`WorktreeCreate`, `WorktreeRemove`, `MessageDisplay`, `CwdChanged`.
Якщо додати їм `matcher`, він **мовчки ігнорується**.

**Три «каденції» подій** (для пояснення життєвого циклу в курсі):
- раз на сесію: `SessionStart`, `SessionEnd`;
- раз на хід: `UserPromptSubmit`, `Stop`, `StopFailure`;
- на кожен виклик інструмента в агентському циклі: `PreToolUse`, `PostToolUse`
  (виняток — виклики `EndConversation`, які пропускають обидві).

### Exit-коди: точна семантика

| Код | Що означає |
| --- | --- |
| **0** | Успіх. Штатний код, коли ви друкуєте JSON. stdout здебільшого йде в debug-лог і **не показується** в транскрипті. **Винятки, де plain stdout стає контекстом для Claude**: `UserPromptSubmit`, `UserPromptExpansion`, `SessionStart`, `PostModelSwitch`. stderr при exit 0 — лише в debug-лог, Claude його не бачить ніколи |
| **2** | Блокуюча помилка. На подіях, що вміють блокувати, блокує **незалежно від JSON** — навіть `permissionDecision: "allow"` не перекриє. Повідомлення блокування = `reason` з JSON, якщо він є, інакше ваш stderr |
| **будь-який інший** | **Сам по собі НЕ блокує.** Якщо на stdout валідний JSON — код ігнорується, вирішує JSON. Якщо ні — «неблокуюча помилка»: дія проходить, у транскрипті `<hook name> hook error` і перший рядок stderr із префіксом `Failed with non-blocking status code:` |

**Головне попередження доксів, дослівно за змістом:** exit code **1** — конвенційний
Unix-код помилки — тут **не блокує нічого**. Хук-політика, написаний з `exit 1`,
мовчки пропускає все. Треба `exit 2`. Єдиний виняток — `WorktreeCreate`, де будь-який
ненульовий код завалює створення.

**Як Claude Code вирішує, JSON перед ним чи текст** (пробіли по краях ігноруються):
починається з `{` **і** закінчується `}` → парситься як JSON; починається з `{`, але не
закінчується `}` → простий текст; починається з будь-чого іншого → простий текст
(включно з JSON-масивом і JSON-рядком у лапках).

### JSON-вихід: універсальні поля

| Поле | Дефолт | Що робить |
| --- | --- | --- |
| `continue` | `true` | `false` — Claude повністю припиняє обробку. Має пріоритет над будь-якими decision-полями події |
| `stopReason` | — | Повідомлення користувачеві при `continue: false`. Claude його не бачить |
| `suppressOutput` | `false` | **Не робить нічого.** Поле приймається, але не діє |
| `systemMessage` | — | Попередження користувачеві |
| `terminalSequence` | — | Escape-послідовність, яку Claude Code виведе за вас: OSC `0`/`1`/`2`/`9`/`99`/`777` і BEL. Усе поза списком → поле ігнорується. **Це єдиний легальний спосіб** зробити десктопне сповіщення, бо хуки працюють без керуючого термінала і `/dev/tty` їм недоступний |

`hookSpecificOutput.additionalContext` — рядок у контекст Claude; обгортається в
system reminder. Docs радять писати **фактами** («The deployment target is production»),
а не наказами: текст у вигляді позасмугових системних команд тригерить захист від
prompt injection, і Claude покаже його вам замість того, щоб врахувати.

### Три робочі приклади

**1. Автоформат після кожної правки** (`PostToolUse`, exec form, плейсхолдер шляху):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/check-style.sh",
            "args": []
          }
        ]
      }
    ]
  }
}
```

**2. Заборона деструктивної команди** (`PreToolUse` + `if` для економії spawn):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh",
            "args": []
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# .claude/hooks/block-rm.sh
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked by hook"
    }
  }'
else
  exit 0  # рішення немає; діє звичайний потік дозволів
fi
```

Ключове для курсу: `exit 0` тут означає «я не маю думки», а **не** «дозволяю».
Хук може заборонити, але мовчання дозволом не є.

**3. Лог усіх операцій MCP-сервера** (`PreToolUse`, shell form, регулярка):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [
          { "type": "command", "command": "echo 'Memory operation initiated' >> ~/mcp-operations.log" }
        ]
      }
    ]
  }
}
```

Обидва Bash-приклади потребують `jq` у `PATH` — це варто сказати учневі заздалегідь.

### Безпека hooks

- **Дисклеймер доксів:** command-хуки виконують shell-команди **з вашими повними
  правами**. Вони можуть змінити, видалити або прочитати будь-що, доступне вашому
  користувачу.
- **Workspace trust працює по-різному залежно від типу сесії.** В інтерактивній
  Claude Code **притримує хуки з усіх файлів налаштувань, включно з вашим власним
  `~/.claude/settings.json`**, поки ви не приймете діалог довіри до теки. А у **`-p`
  або SDK-сесії діалогу немає, тека вважається довіреною**, і хуки, закомічені в
  `.claude/settings.json` чужого репозиторію, **виконаються**.
- Перед `claude -p` над чужим репо докси радять три варіанти: переглянути його
  `.claude/`, стартувати з `--bare`, або вимкнути хуки на цей запуск
  `--settings '{"disableAllHooks": true}'`.
- Хуки у frontmatter **проєктного субагента** — суворіше: виконуються лише після
  прийняття workspace trust, і `-p` за прийняття не рахується (з v2.1.218).
  Хуки у frontmatter **проєктного скіла** — навпаки, за тим самим правилом, що й
  settings-хуки: реєструються при виклику, включно з `-p` у недовіреній теці.
- Практики з доксів: валідувати вхід · **завжди** брати змінні в лапки (`"$VAR"`) ·
  блокувати `..` у шляхах · абсолютні шляхи · не чіпати `.env`, `.git/`, ключі.
- `disableAllHooks` поважає ієрархію: якщо адміністратор налаштував хуки через managed
  policy, вимкнути їх можна **лише** `disableAllHooks` на managed-рівні.

### Застаріло в плані

- **«Подій приблизно вісім».** Їх **33**. Це не уточнення, а зміна масштабу теми:
  восьми подіями не описати ні agent teams (`TeammateIdle`, `TaskCreated`,
  `TaskCompleted`), ні worktrees (`WorktreeCreate`/`Remove`), ні MCP-елісітацію.
- **Якщо план каже «exit 1 = заборонити»** — це найнебезпечніша помилка модуля:
  політика мовчки не спрацює.
- **Якщо план знає лише `type: "command"`** — типів пʼять, і `prompt`/`agent` дають
  рішення на судженні, а не на детермінованому правилі.
- **Якщо план каже, що `/hooks` дозволяє редагувати хуки** — ні, меню тільки читає.

### Додати, чого в плані немає

| Тема | Чому важлива | Джерело |
| --- | --- | --- |
| Існування `hooks.md` окремо від `hooks-guide.md` | Без цієї сторінки повного переліку подій не існує ніде | hooks.md |
| `if` працює лише на подіях інструментів | На інших подіях хук із `if` **не виконається взагалі** — тихий і збиваючий з пантелику баг | hooks.md |
| exec form vs shell form | Пояснює, чому шлях із пробілом ламає хук і навіщо `args: []` | hooks.md |
| `terminalSequence` | Єдиний робочий спосіб сповіщень; наївний `echo -e '\a' > /dev/tty` **не працює** | hooks.md |
| `async` / `asyncRewake` | Довгі перевірки без блокування ходу; `asyncRewake` будить Claude на exit 2 | hooks.md |
| Ліміт 8 поспіль блокувань `Stop` | Інакше учень зробить нескінченний цикл і не зрозуміє, чому він урвався | best-practices.md |
| Prompt- і agent-хуки | Рішення на судженні там, де правило не формалізується | hooks.md |
| `allowedHttpHookUrls`, `httpHookAllowedEnvVars` | Керування HTTP-хуками; без `allowedEnvVars` інтерполяція змінних у заголовки не працює взагалі | hooks.md, settings-reference.md |

### Екрани для курсу

- **Інтерактивно, зняти неможливо** — `/hooks`: перелік усіх подій із кількістю
  налаштованих хуків; провалюєшся в matcher; кожен хук із префіксом `[type]` і
  джерелом (`User Settings` / `Project Settings` / `Local Settings` / `Plugin Hooks` /
  `Session Hooks`); детальний вигляд показує подію, matcher, тип, файл-джерело й
  повну команду/промпт/URL. Джерело: hooks.md, «The `/hooks` menu».
- Текстовий екран, який **можна** зробити: `claude --debug-file ./hooks.log`, потім
  показати рядки про те, які хуки збіглися, їхні коди виходу й повний stdout/stderr.
  Це найкращий діагностичний екран модуля.
- Транскриптне повідомлення `<hook name> hook error` + `Failed with non-blocking status
  code: /bin/sh: /path/to/hook.sh: No such file or directory` — приклад типової помилки
  «шлях у settings.json з одруківкою, і гейт мовчки вимкнено».
- Діаграма життєвого циклу з доксів: `images/hooks-lifecycle.svg` (є світла й темна
  версії) — готовий візуальний матеріал для слайда.

### Пастки новачка

1. **`exit 1` замість `exit 2`.** Хук «працює», нічого не блокує. Найдорожча помилка.
2. **Шлях до скрипта з одруківкою.** Помилка неблокуюча → політика тихо вимкнена.
   Докси прямо радять: після налаштування гейта **перевірте перший запуск** на
   наявність цього повідомлення.
3. **Забув `chmod +x`.** Той самий симптом.
4. **`matcher: "mcp__supabase"` замість `"mcp__supabase__.*"`.** Не збігається ні з чим,
   бо трактується як точний рядок.
5. **`matcher: "Edit"` ловить і `NotebookEdit`** — ні, `Edit` без спецсимволів це
   точний збіг. А от `Edit.*` вже зловить обидва. Логіка неочевидна в обидва боки.
6. **Профіль шелу друкує текст на старті** → він домішується в stdout, і JSON не
   парситься. Окремий пункт у гайді з траблшутингу («Hook JSON has no effect»).
7. **Чекає stdout хука в транскрипті.** На більшості подій його там не буде ніколи —
   лише в debug-лозі.
8. **Ставить `if` на `Stop` чи `SessionStart`.** Хук не виконається жодного разу.
9. **Робить хук у чужому репо через `claude -p` і не читає `.claude/`.** Хуки чужого
   репо виконаються без питань.

---

## c13 — MCP: зовнішні інструменти

### Перевірено

| Факт | Джерело | Дата |
| --- | --- | --- |
| Підкоманди `claude mcp`: `add`, `add-from-claude-desktop`, `add-json`, `get`, `list`, `login`, `logout`, `remove`, `reset-project-choices`, `serve` | `$ claude mcp --help` (`screens/claude-mcp--help.txt`) | 2026-09-03 |
| `claude mcp add [options] <name> <commandOrUrl> [args...]`. Прапорці: `-t/--transport` (`stdio`, `sse`, `http`; дефолт `stdio`), `-s/--scope` (`local`, `user`, `project`; дефолт `local`), `-e/--env`, `-H/--header`, `--client-id`, `--client-secret`, `--callback-port` | `$ claude mcp add --help` (`screens/b-mcp-add-help.txt`) | 2026-09-03 |
| **Транспортів у CLI три**: `stdio`, `sse`, `http`. Але докси описують ще й **WebSocket** як «Option 4» — у `--transport` його немає | `$ claude mcp add --help` vs mcp.md | 2026-09-03 |
| Три scope: **local** (дефолт, лише цей проєкт, приватно, у `~/.claude.json`) · **project** (`.mcp.json` у корені репо, комітиться) · **user** (усі проєкти, приватно, у `~/.claude.json`) | https://code.claude.com/docs/en/mcp.md | 2026-09-03 |
| **«Local scope» ≠ `settings.local.json`.** MCP local лежить у `~/.claude.json`, а не в проєкті. Докси виносять це окремою нотаткою | mcp.md | 2026-09-03 |
| Пріоритет при збігу імен: local → project → user → плагінні сервери → claude.ai конектори. Береться **весь запис** з найпріоритетнішого джерела, поля між scope **не змішуються** | mcp.md | 2026-09-03 |
| Три scope зіставляють дублікати **за іменем**; плагіни й конектори — **за ендпоінтом** | mcp.md | 2026-09-03 |
| Проєктні сервери з `.mcp.json` в інтерактиві потребують схвалення. Скинути схвалення: `claude mcp reset-project-choices` | mcp.md, `$ claude mcp --help` | 2026-09-03 |
| **У `claude -p`, Agent SDK і хмарних сесіях діалогу схвалення немає — проєктні сервери підключаються без питань.** Тримати сервер поза сесією: `disabledMcpjsonServers`, або `--setting-sources` без `project`, або `--strict-mcp-config` | mcp.md | 2026-09-03 |
| Розгортання змінних у `.mcp.json`: `${VAR}` і `${VAR:-default}`. Місця: `command`, `args`, `env`, `url`, `headers` | mcp.md | 2026-09-03 |
| Незадана змінна без дефолту **не ламає конфіг**: сервер лишається з нерозгорнутим `${VAR}`, а `claude mcp list` показує ворнінг про відсутню змінну | mcp.md | 2026-09-03 |
| `claude mcp login <name>` — OAuth; `--no-browser` друкує URL авторизації замість відкриття браузера (для SSH/headless, редірект-URL вставляєте назад) | `$ claude mcp login --help` (`screens/b-mcp-login-help.txt`) | 2026-09-03 |
| `claude mcp logout <name>` чистить збережені OAuth-креденшели | `$ claude mcp --help` | 2026-09-03 |
| `claude mcp list` і `claude mcp get` показують несхвалені `.mcp.json`-сервери як `⏸ Pending approval` і **не підключаються** до них; схвалені — health-check | `$ claude mcp list --help` | 2026-09-03 |
| З v2.1.196 `claude mcp list`/`get` читають схвалення `.mcp.json` лише з файлів налаштувань, **не закомічених** у репо, поки ви не довірили теку. Клонований репозиторій **не може схвалити сам себе** | mcp.md | 2026-09-03 |
| Імена інструментів: `mcp__<server>__<tool>`. Для сервера з плагіна: `mcp__plugin_<plugin>_<server>__<tool>` | mcp.md, hooks.md | 2026-09-03 |
| **Tool search увімкнений за замовчуванням**: на старті вантажаться лише імена інструментів і інструкції сервера, визначення — на вимогу. Керується `ENABLE_TOOL_SEARCH`: (не задано) · `true` · `auto` (поріг 10% контекстного вікна) · `auto:N` · `false` | mcp.md | 2026-09-03 |
| Claude Code **вимикає** tool search, коли `ANTHROPIC_BASE_URL` вказує на не-first-party хост (проксі зазвичай не пропускають `tool_reference`) | mcp.md | 2026-09-03 |
| Вивести сервер з-під відкладення: `"alwaysLoad": true` у його конфізі. Це змушує старт **чекати** на його інструменти (до 5 с) | mcp.md | 2026-09-03 |
| Вимкнути сам інструмент пошуку: `permissions.deny: ["ToolSearch"]` | mcp.md | 2026-09-03 |
| Описи інструментів і інструкції сервера обрізаються на **2KB** кожне | mcp.md | 2026-09-03 |
| `claude mcp serve` запускає **сам Claude Code як MCP-сервер** (stdio) | `$ claude mcp serve --help` (`screens/b-mcp-serve-help.txt`), mcp.md | 2026-09-03 |
| MCP-промпти доступні як слеш-команди виду `/mcp__<server>__<prompt>` | mcp.md | 2026-09-03 |
| Живий приклад `.mcp.json` цього проєкту: один HTTP-сервер `supabase` із `?project_ref=…&features=…` | `$ cat /Users/ander1.sage/Downloads/AIA/.mcp.json` | 2026-09-03 |
| Живий вивід `claude mcp list`: два HTTP-сервери (`plugin:exa:exa` і `supabase`), обидва зі статусом `! Needs authentication` | `$ claude mcp list` (`screens/b-mcp-list-live.txt`) | 2026-09-03 |

### Prompt injection через MCP

- Головне попередження на самій сторінці MCP: «Verify you trust each server before
  connecting it. **Servers that fetch external content can expose you to prompt
  injection risk.**» (mcp.md).
- `security.md`, розділ «MCP security»: Anthropic перевіряє конектори за
  listing criteria перед додаванням у Directory, але **не проводить безпекового аудиту
  й не керує жодним MCP-сервером**. Рекомендація — писати власні або брати від
  постачальників, яким довіряєте.
- Захисні механізми, дотичні до MCP: ізольоване контекстне вікно для web fetch (щоб
  не інʼєктувати шкідливий промпт у головну розмову); trust verification для нових
  MCP-серверів — **вимкнена при `-p`**; `requiresUserInteraction` на рівні інструмента
  (mcp.md, «Require approval for a specific tool»); організаційне налаштування
  конекторних інструментів у `ask`.
- Практичне: `permissions.deny` приймає імена MCP-інструментів, тому конкретний
  небезпечний інструмент можна заборонити точково, не вимикаючи сервер.

### Застаріло в плані

- **Якщо план каже, що scope MCP і scope налаштувань — те саме** — ні. MCP «local»
  живе в `~/.claude.json`, а не в `.claude/settings.local.json`. Докси виносять це
  окремим попередженням саме тому, що плутають усі.
- **Якщо план каже «транспортів два (stdio/SSE)»** — у CLI їх три (`stdio`, `sse`,
  `http`), а докси описують ще й WebSocket.
- **Якщо план обіцяє діалог схвалення `.mcp.json` завжди** — у `-p` його немає.

### Додати, чого в плані немає

| Тема | Чому важлива | Джерело |
| --- | --- | --- |
| Tool search і відкладені інструменти | Прямо в темі модуля; пояснює, чому 10 MCP-серверів не зʼїдають контекст, і що робити, коли інструмент «не видно» | mcp.md |
| `alwaysLoad` і його ціна (старт чекає до 5 с) | Компроміс, який учень має розуміти свідомо | mcp.md |
| `claude mcp login --no-browser` | Єдиний спосіб пройти OAuth по SSH | `$ claude mcp login --help` |
| `claude mcp reset-project-choices` | Вихід із «я випадково відхилив сервер і більше не питає» | `$ claude mcp --help` |
| `claude mcp serve` | Зворотний напрямок: Claude Code **як** MCP-сервер | `$ claude mcp serve --help` |
| Розгортання `${VAR:-default}` у `.mcp.json` | Дозволяє комітити `.mcp.json` без секретів | mcp.md |
| `⏸ Pending approval` і правило «репо не схвалює себе» | Пояснює, чому закомічений `enabledMcpjsonServers` не спрацював у клоні | mcp.md |
| MCP-промпти як команди | Мало хто знає, що сервер може дати вам слеш-команди | mcp.md |
| Ліміти виводу MCP і `--strict-mcp-config` | Перше — про «відповідь обрізало», друге — про відтворюваність у CI | mcp.md, `$ claude --help` |

### Екрани для курсу

- `screens/b-mcp-list-live.txt` — **справжній** `claude mcp list` із health-check і
  статусом `! Needs authentication`. Дуже цінно: учень побачить, що «сервер доданий»
  і «сервер працює» — різні речі.
- `screens/b-mcp-add-help.txt` — усі форми `add` разом із чотирма прикладами прямо в
  хелпі (HTTP, HTTP із заголовком, stdio з env, stdio з прапорцями підпроцесу).
- `screens/b-mcp-login-help.txt` — `--no-browser` для headless.
- `/Users/ander1.sage/Downloads/AIA/.mcp.json` — живий проєктний конфіг на 8 рядків.
- **Інтерактивно, зняти неможливо** — `/mcp`: статус серверів у сесії, вхід/вихід,
  перегляд інструментів і ресурсів. Джерело: mcp.md, «Managing your servers».
- **Інтерактивно** — OAuth-потік: `claude mcp login <name>` відкриває браузер; із
  `--no-browser` друкує URL, ви його відкриваєте і вставляєте редірект-URL назад.

### Пастки новачка

1. **Додав сервер, а інструментів немає.** Найчастіше — `! Needs authentication`
   (як у живому виводі вище): треба `claude mcp login <name>`.
2. **Додав у неправильний scope.** `claude mcp add` за замовчуванням **local**, тобто
   тільки цей проєкт і не в git. Хотів поділитися з командою — треба `-s project`.
3. **Закомітив `.mcp.json` і чекає, що в колег запрацює.** У них зʼявиться
   `⏸ Pending approval`, поки вони не схвалять. А закомічений `enabledMcpjsonServers`
   в недовіреній теці ігнорується.
4. **Поклав ключ прямо в `.mcp.json`** і закомітив. Правильно — `${API_KEY}`.
5. **Забув `.*` у matcher хука для MCP** (перетин із c12).
6. **Не розуміє, чому інструмент «зникає й зʼявляється».** Це tool search: визначення
   вантажаться на вимогу. Не баг.
7. **Ставить 10 серверів і дивується вартості.** `claude plugin details` і `/usage`
   показують атрибуцію по серверах.

---

## c14 — Автоматизація: headless, CI, розписання

### Перевірено

| Факт | Джерело | Дата |
| --- | --- | --- |
| `-p` / `--print` — неінтерактивний режим. Не все поєднується: `--bg` відхиляється; `--cloud` з описом задачі відхиляється; `--cloud` з session ID + `-p` **ставить повідомлення в чергу** тієї хмарної сесії й виходить | https://code.claude.com/docs/en/headless.md | 2026-09-03 |
| `--output-format`: `text` (дефолт) · `json` (один результат + метадані) · `stream-json` (NDJSON у реальному часі) | `$ claude --help`, headless.md | 2026-09-03 |
| `--json-schema '<JSON Schema>'` разом із `--output-format json` дає структурований вивід у полі `structured_output`. Невалідна схема → `Error: --json-schema is not a valid JSON Schema`. `format` приймається, але **не примусово перевіряється** | headless.md | 2026-09-03 |
| Стрімінг: `--output-format stream-json --verbose --include-partial-messages`. Останній рядок потоку — повідомлення `result` із текстом, вартістю й метаданими | headless.md | 2026-09-03 |
| **Exit-коди:** 0 — успіх; ненульовий — помилка. **143** — зупинка через SIGTERM (хід лишається незавершеним, результат не записується). Щоб завершити хід — SIGINT або `interrupt()` в SDK | headless.md | 2026-09-03 |
| Помилки невалідних прапорців ідуть у **stderr до старту**; помилки всередині запуску (напр. відсутня автентифікація) друкуються **як результат у stdout** | headless.md | 2026-09-03 |
| Пайп: `-p` читає stdin. Ліміт stdin — **10MB**, далі чітка помилка й ненульовий код | headless.md | 2026-09-03 |
| `--output-format json` містить `total_cost_usd` і розбивку по моделях — **клієнтські оцінки**, можуть відрізнятись від рахунку | headless.md | 2026-09-03 |
| **`--bare`** пропускає хуки, LSP, синхронізацію плагінів, атрибуцію, auto memory, фонові префетчі, читання keychain і автопошук CLAUDE.md. Ставить `CLAUDE_CODE_SIMPLE=1`. Автентифікація **строго** `ANTHROPIC_API_KEY` або `apiKeyHelper` через `--settings` (OAuth і keychain не читаються ніколи) | `$ claude --help`, headless.md | 2026-09-03 |
| Докси прямо кажуть: «`--bare` is the recommended mode for scripted and SDK calls, and **will become the default for `-p` in a future release**» | headless.md | 2026-09-03 |
| Без `--bare` сесія `-p` виконує хуки з `.claude/settings.json` проєкту й підключає сервери з `.mcp.json` **навіть у теці, якій ви ніколи не довіряли** | headless.md | 2026-09-03 |
| Фонові Bash-задачі в `-p` убиваються приблизно через **5 секунд** після фінального результату. Фонові субагенти й воркфлоу звільнені, але їхнє очікування обмежене **10 хвилинами** безперервного простою (`CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`, `0` = без ліміту) | headless.md | 2026-09-03 |
| `--max-budget-usd <amount>` — стеля витрат, працює лише з `--print` | `$ claude --help` | 2026-09-03 |
| `--fallback-model <model>` приймає **список через кому**, пробує по черзі, повторює основну на початку кожного ходу користувача; лише з `--print` | `$ claude --help` | 2026-09-03 |
| `--no-session-persistence` — сесія не пишеться на диск і не відновлюється; лише з `--print` | `$ claude --help` | 2026-09-03 |
| Продовження розмов у headless: `--continue` (остання в цій теці), `--resume <id>`, `--fork-session` (новий ID замість перевикористання) | `$ claude --help`, headless.md | 2026-09-03 |
| Три способи розписання: **cloud routines** (не потребує ввімкненої машини, мінімальний інтервал **1 година**, свіжий клон без локальних файлів, працює автономно без промптів дозволу) · **Desktop scheduled tasks** (на вашій машині, є доступ до локальних файлів, мінімум **1 хвилина**) · **`/loop`** (потрібна відкрита сесія, мінімум 1 хвилина, успадковує дозволи й MCP сесії) | https://code.claude.com/docs/en/scheduled-tasks.md | 2026-09-03 |
| `/loop` має три режими: інтервал+промпт (`/loop 5m check the deploy`) · лише промпт (інтервал обирає Claude) · нічого або лише інтервал (вбудований maintenance-промпт або ваш `loop.md`) | scheduled-tasks.md | 2026-09-03 |
| У `/loop` можна передати скіл: `/loop 20m /review-pr 1234`. Але за розписанням спрацьовують **лише ті скіли, які Claude має право викликати сам**. Вбудовані команди (`/model`, `/clear`), скіли з `disable-model-invocation: true` (включно з `/verify`) і MCP-промпти доходять до Claude **як звичайний текст** | scheduled-tasks.md | 2026-09-03 |
| `/schedule` керує cloud routines (створення, редагування, список, запуск) | `screens/b-slash-commands-full.txt`, routines.md | 2026-09-03 |
| Тригери routines: **schedule**, **API**, **GitHub** | https://code.claude.com/docs/en/routines.md | 2026-09-03 |
| Channels — плагіни, що **штовхають** події в уже запущену локальну сесію. Кожен потребує **Bun**. Підтримувані: Telegram, Discord, iMessage, вебхуки; є демо-плагін `fakechat`. Telegram: `/plugin install telegram@claude-plugins-official`, потім `/telegram:configure <token>`, токен лягає в `~/.claude/channels/telegram/.env` (або `TELEGRAM_BOT_TOKEN` у середовищі) | https://code.claude.com/docs/en/channels.md | 2026-09-03 |
| Channels — **research preview**; вмикаються організацією через `channelsEnabled`, обмежуються `allowedChannelPlugins` | channels.md, settings-reference.md | 2026-09-03 |
| GitHub Actions: швидкий сетап + ручний; режими interactive і automation; тригер `@claude` у коментарях; можна запускати скіл; можна за розписанням | https://code.claude.com/docs/en/github-actions.md | 2026-09-03 |
| GitLab CI/CD має власну сторінку | https://code.claude.com/docs/en/gitlab-ci-cd.md | 2026-09-03 |
| Code Review на PR: рівні серйозності, оцінка й відповідь на знахідки, вивід у check run, кастомізація через `CLAUDE.md` і **`REVIEW.md`** | https://code.claude.com/docs/en/code-review.md | 2026-09-03 |
| Локальний рев'ю: `/code-review [low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [pr#\|branch\|path]`, аліас `/review` | `screens/b-slash-commands-full.txt` | 2026-09-03 |
| `claude ultrareview [target]` — хмарний мультиагентний рев'ю з CLI. Прапорці: `--json`, `--post`, `--no-post` (дефолт), `--timeout <minutes>` (дефолт **30**) | `$ claude ultrareview --help` (`screens/claude-ultrareview--help.txt`) | 2026-09-03 |
| Agent SDK: пакети `claude-agent-sdk` (Python) і `@anthropic-ai/claude-agent-sdk` (TypeScript). Це **повний гарнес Claude Code як бібліотека** зі вбудованими інструментами (Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch), який ви хостите самі. Документація — у мапі code.claude.com, **не** на platform.claude.com | системний контекст guide-агента; сторінки `/docs/en/agent-sdk/*` згадані з hooks.md і headless.md | 2026-09-03 |

### Застаріло в плані

- **Якщо план подає `-p` як «просто неінтерактивний режим»** — головна новина в тому,
  що **без `--bare` він виконує чужі хуки й MCP без жодного питання**, і що `--bare`
  скоро стане дефолтом. Це і безпека, і відтворюваність.
- **Якщо план каже «exit-код 1 = помилка, і все»** — треба назвати **143** (SIGTERM),
  бо саме його побачать у CI при таймауті джоби.
- **Якщо план каже, що `/loop` виконає будь-яку команду** — ні: вбудовані команди й
  скіли з `disable-model-invocation: true` дійдуть як текст.
- **Якщо в плані `/schedule` і scheduled tasks — одне й те саме** — це три різні
  механізми з різними обмеженнями (таблиця вище).

### Додати, чого в плані немає

| Тема | Чому важлива | Джерело |
| --- | --- | --- |
| `--bare` цілком | Рекомендований режим для скриптів і майбутній дефолт `-p` | headless.md |
| `--json-schema` | Перетворює Claude на надійний парсер: гарантована форма виводу | headless.md |
| `--max-budget-usd` | Єдиний вбудований запобіжник витрат у headless | `$ claude --help` |
| Exit 143 і поведінка при SIGTERM | CI-специфіка, якої немає ніде більше | headless.md |
| 5-секундне вбивство фонових задач і 10-хвилинна стеля очікування | Пояснює «чому мій dev-сервер помер» і «чому джоба висіла» | headless.md |
| `--fallback-model` зі списком | Практичний захист від перевантаження моделі в CI | `$ claude --help` |
| `--include-hook-events` | Хуки в потоці `stream-json` — для власного UI | `$ claude --help` |
| `--forward-subagent-text` | Без нього тексту субагентів у потоці не буде | `$ claude --help`, headless.md |
| `REVIEW.md` | Окремий файл кастомізації Code Review, не CLAUDE.md | code-review.md |
| `claude ultrareview` з терміналу | Хмарний рев'ю без GitHub UI | `$ claude ultrareview --help` |
| Channels потребують **Bun** | Без цього рядка розділ не запрацює в жодного учня | channels.md |

### Екрани для курсу

- `screens/claude--help.txt` — блоки `-p`, `--output-format`, `--bare`,
  `--max-budget-usd`, `--json-schema`. Дослівний текст про `-p` містить попередження
  про пропуск діалогу довіри — це готова цитата для слайда з безпеки.
- `screens/claude-ultrareview--help.txt` — компактний, увесь поміщається на слайд.
- Реальний виконуваний приклад (безпечний, можна дати учневі):
  `claude -p "Summarize README.md" --bare --allowedTools "Read"` — але потребує
  `ANTHROPIC_API_KEY`, бо `--bare` не читає підписку. **Це найчастіша причина, чому
  приклад із доксів не працює в учня** — сказати прямо.
- Приклад із доксів для `package.json`, який варто показати:
  `"lint:claude": "git diff main | claude -p \"you are a typo linter…\""`.
- Приклад jq-конвеєра для стріму:
  `jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'`.

### Пастки новачка

1. **`--bare` + підписка Pro/Max = не працює.** Bare ніколи не читає OAuth і keychain.
   Потрібен `ANTHROPIC_API_KEY`.
2. **Очікує, що `-p` у CI ізольований.** Без `--bare` він підтягне `.claude/` репозиторію.
3. **`exit 1` у скрипті-обгортці замість перевірки коду Claude.**
4. **Фоновий сервер, запущений усередині `claude -p`, помирає через 5 секунд.**
5. **`--output-format json` без `jq`** — людина дивиться на сирий JSON і губиться.
6. **Ставить `/loop 30s`** — мінімум одна хвилина.
7. **Чекає від cloud routine доступу до локальних файлів** — там свіжий клон, локальних
   файлів немає, і особистий скіл із `~/.claude/skills/` там **не знайдеться**
   (skills.md прямо описує цю помилку).
8. **Ставить channels без Bun.**

---

## c15 — Наскрізний проєкт і робочі звички

### Перевірено

| Факт | Джерело | Дата |
| --- | --- | --- |
| Рекомендований цикл із чотирьох фаз: **Explore → Plan → Implement → Commit** | https://code.claude.com/docs/en/best-practices.md | 2026-09-03 |
| Вхід у plan mode: `Shift+Tab` доти, доки в статус-барі не зʼявиться `⏸ plan mode on`, або старт із `claude --permission-mode plan` | best-practices.md | 2026-09-03 |
| `Ctrl+G` відкриває план у вашому текстовому редакторі для прямого редагування, перш ніж Claude продовжить | best-practices.md | 2026-09-03 |
| Докси **самі застерігають** від надмірного планування: «If you could describe the diff in one sentence, skip the plan». План виправданий при невизначеному підході, багатофайловій зміні або незнайомому коді | best-practices.md | 2026-09-03 |
| Найголовніша порада всієї сторінки — **дати Claude перевірку, яку він може запустити сам**: тести, код виходу білда, лінтер, скрипт, що порівнює вивід із фікстурою, або скриншот браузера проти макета | best-practices.md | 2026-09-03 |
| Чотири рівні «жорсткості» перевірки: в одному промпті · `/goal` (окремий оцінювач перевіряє після кожного ходу) · **Stop-хук** (детермінований гейт) · друга думка від верифікаційного субагента чи воркфлоу | best-practices.md | 2026-09-03 |
| Stop-хук як гейт має стелю: Claude Code **перекриває хук і завершує хід після 8 блокувань поспіль** | best-practices.md | 2026-09-03 |
| Докси радять вимагати **докази**, а не тверджень: вивід тестів, виконану команду з її результатом, скриншот | best-practices.md | 2026-09-03 |
| Output styles змінюють **системний промпт**. Вбудованих пʼять: **Default**, **Proactive**, **Concise** (потребує v2.1.237+), **Explanatory**, **Learning** | https://code.claude.com/docs/en/output-styles.md | 2026-09-03 |
| **Команду `/output-style` видалено** у v2.1.91 (депрекували у v2.1.73). Тепер — `/config` або поле `outputStyle` | output-styles.md | 2026-09-03 |
| Кастомний output style — markdown у `~/.claude/output-styles`, `.claude/output-styles` або managed. Frontmatter: `name`, `description`, `keep-coding-instructions` (дефолт `false`), `force-for-plugin` | output-styles.md | 2026-09-03 |
| **`keep-coding-instructions: false` (дефолт) прибирає вбудовані інженерні інструкції Claude Code.** Це не «додати тон», а «замінити роль» | output-styles.md | 2026-09-03 |
| Output style читається **один раз на старті сесії**; зміна діє після `/clear` або нової сесії | output-styles.md | 2026-09-03 |
| Output style **не діє на субагентів** (у них свій системний промпт). Виняток — форк | output-styles.md, sub-agents.md | 2026-09-03 |
| Статус-лайн: `/statusline` (агент `statusline-setup`, модель Sonnet) або ручний `statusLine` у settings. Живий приклад тут: `{"type":"command","command":"node /Users/ander1.sage/.claude/statusline.js","padding":0}` | https://code.claude.com/docs/en/statusline.md, `$ cat ~/.claude/settings.json` | 2026-09-03 |
| Скрипту статус-лайна доступні поля контекстного вікна, `prompt_cache`, `effort`, вартість і тривалість; є окремий `subagentStatusLine` | statusline.md, settings-reference.md | 2026-09-03 |
| Артефакти вимагають **усіх** умов одночасно: план Pro/Max/Team/Enterprise · автентифікація через акаунт claude.ai (`/login`) · провайдер **Anthropic API** (не Bedrock/Vertex/Foundry) · відсутність CMEK/HIPAA/ZDR в організації · CLI **2.1.183+**. Вимикаються `enableArtifact: false`, `CLAUDE_CODE_DISABLE_ARTIFACT=1` або `permissions.deny: ["Artifact"]` | https://code.claude.com/docs/en/artifacts.md | 2026-09-03 |
| Доступність: `--ax-screen-reader` (плоский текст, без декоративних рамок і анімацій) і налаштування `axScreenReader` | `$ claude --help`, https://code.claude.com/docs/en/accessibility.md | 2026-09-03 |
| Голосове введення — окрема сторінка з вимогами, режимами «hold to record» і «tap to record and send», зміною мови диктування й перепризначенням клавіші. Живий приклад тут: `"voice": {"enabled": true, "mode": "hold"}` | https://code.claude.com/docs/en/voice-dictation.md, `$ cat ~/.claude/settings.json` | 2026-09-03 |
| Клавіші: `~/.claude/keybindings.json`, контексти, **26 груп дій** (app, history, chat, autocomplete, confirmation, permission, transcript, history search, task, theme, help, tabs, attachments, footer, message selector, diff, model picker, select, plugin, settings, voice, scroll…), синтаксис модифікаторів, окремі розділи про великі літери й не-US розкладки | https://code.claude.com/docs/en/keybindings.md | 2026-09-03 |
| Робота з git і PR: атрибуція керується `attribution` (+ `.commit`, `.pr`, `.sessionUrl`), `includeCoAuthoredBy`, `prUrlTemplate`; git-інструкції в системному промпті — `includeGitInstructions` | settings-reference.md | 2026-09-03 |
| `/security-review` — безпековий прохід по змінах поточної гілки; є ще плагін security-guidance | security.md, `screens/b-slash-commands-full.txt` | 2026-09-03 |
| `/insights` пише HTML-звіт у `~/.claude/usage-data/report.html` + копію з таймстемпом; один запуск аналізує до **200** нових сесій; працює на будь-якому плані, токени рахуються вам | https://code.claude.com/docs/en/costs.md | 2026-09-03 |
| Rewind/чекпоінти: знімки файлів до правок у `~/.claude/file-history/<session>/`, зберігаються для **100 останніх** чекпоінтів | claude-directory.md | 2026-09-03 |

### Застаріло в плані

- **`/output-style` більше не існує** (видалена у v2.1.91). Якщо план її згадує —
  учень отримає «команду не знайдено».
- **`/agents` більше не меню** (див. c11) — теж стосується «робочих звичок».
- **Якщо план каже «завжди починай із plan mode»** — докси кажуть протилежне для
  дрібних задач і прямо називають overhead.
- **Якщо план ставить `/code-review` і `/security-review` в один ряд** — у 2.1.236
  `/code-review` має рівні `low…ultra` і прапорці `--fix`/`--comment`, тобто це вже
  окремий інструмент із власною поведінкою, а не «ще одна перевірка».

### Додати, чого в плані немає

| Тема | Чому важлива | Джерело |
| --- | --- | --- |
| «Дай Claude перевірку» як **центральна** ідея | Це головна теза сторінки best practices; вона перетворює курс із «як натискати» на «як працювати» | best-practices.md |
| Чотири рівні жорсткості перевірки (промпт → `/goal` → Stop-хук → друга думка) | Готовий каркас модуля c15, який ще й звʼязує його з c12 | best-practices.md |
| `Ctrl+G` — редагувати план у своєму редакторі | Дрібниця, що радикально змінює якість плану | best-practices.md |
| Ліміт 8 блокувань Stop-хука | Без нього «детермінований гейт» виглядає всемогутнім | best-practices.md |
| `keep-coding-instructions` | Найнебезпечніше поле output style: за замовчуванням **знімає** інженерні інструкції | output-styles.md |
| Output style не діє на субагентів | Пояснює «чому агент відповідає не в моєму стилі» | output-styles.md |
| Умови доступності артефактів | Половина учнів не матиме артефактів; краще сказати одразу, ніж лишити відчуття зламаного продукту | artifacts.md |
| `/insights` | Не про токени, а про **те, як людина працює**; природне завершення курсу | costs.md |
| `--ax-screen-reader`, `axScreenReader`, `prefersReducedMotion` | Доступність як окремий пункт, а не примітка | `$ claude --help`, settings-reference.md |
| `attribution` / `includeCoAuthoredBy` | Перше, що команда захоче змінити, побачивши трейлер у коміті | settings-reference.md |

### Екрани для курсу

- Живий `statusLine` із `~/.claude/settings.json` + сам `~/.claude/statusline.js`
  (4.3 KB, справжній робочий скрипт) — приклад «як це виглядає в реальної людини».
- `screens/b-slash-commands-full.txt` — рядки `/code-review`, `/security-review`,
  `/verify`, `/insights`, `/batch`, `/simplify`: усі з дослівними описами.
- **Інтерактивно, зняти неможливо** — plan mode: `Shift+Tab` перемикає режими, у
  статус-барі зʼявляється `⏸ plan mode on`; `Ctrl+G` відкриває план у редакторі.
  Джерело: best-practices.md.
- **Інтерактивно** — `/config`: меню налаштувань, у ньому рядок **Output style**;
  вибір пишеться в `.claude/settings.local.json`. Джерело: output-styles.md.
- **Інтерактивно** — rewind-меню (чекпоінти) і `/usage`.

### Пастки новачка

1. **Кастомний output style без `keep-coding-instructions: true`** — Claude раптом
   «розучився» нормально писати код. Причина не в моделі, а в тому, що ви зняли
   інженерні інструкції.
2. **Змінив output style і не бачить ефекту.** Він читається на старті сесії:
   потрібен `/clear` або новий запуск.
3. **Просить «зроби красиво» без критерію перевірки** і потім здивований результатом.
4. **Живе в plan mode постійно** і платить overhead на кожній дрібниці.
5. **Чекає артефакт на Bedrock/Vertex/Foundry або з API-ключем** — не буде за
   конструкцією; Claude напише локальний HTML.
6. **Не знає, що є rewind**, і просить Claude «поверни як було» замість чекпоінта.

---

## c16 — Безпека, витрати, великі репо, куди далі

### Перевірено

| Факт | Джерело | Дата |
| --- | --- | --- |
| У Manual-режимі Claude Code стартує з **правами лише на читання**; вбудований набір read-only команд (`ls`, `cat`, `git status`) виконується без питань | https://code.claude.com/docs/en/security.md | 2026-09-03 |
| Межа робочої теки: у Manual Claude Code пише лише в теку запуску та її підтеки й **питає перед читанням** шляхів поза межею через Read/Grep/Glob. **В auto mode читає їх без питань** | security.md | 2026-09-03 |
| Мережеві команди (`curl`, `wget`) **не автосхвалюються** за замовчуванням | security.md | 2026-09-03 |
| Web fetch використовує **окреме контекстне вікно**, щоб не інʼєктувати шкідливий промпт у розмову | security.md | 2026-09-03 |
| **Trust verification вимкнена при `-p`** — прямо зазначено в доксах | security.md | 2026-09-03 |
| Старт Claude Code **прямо в домашній теці**: згода на довіру тримається лише на поточну сесію й **не пишеться на диск**; налаштування, щоб її зберегти, **немає**. Рішення — стартувати з підтеки проєкту | security.md | 2026-09-03 |
| Креденшели: macOS Keychain, де доступний; на Windows і Linux — права файлів | security.md | 2026-09-03 |
| Практики роботи з недовіреним вмістом: переглядати команди перед схваленням · **не пайпити недовірене прямо в Claude** · перевіряти зміни критичних файлів · використовувати VM · повідомляти через `/feedback` | security.md | 2026-09-03 |
| Транскрипти й історія **не шифруються**. Якщо інструмент прочитав `.env` або команда надрукувала креденшел — значення лежить у `~/.claude/projects/<project>/<session>.jsonl` | claude-directory.md | 2026-09-03 |
| Зменшити ризик: знизити `cleanupPeriodDays` · `desktopSessionCleanupPeriodDays` · `CLAUDE_CODE_SKIP_PROMPT_HISTORY` · `--no-session-persistence` при `-p` · deny-правила на читання файлів із секретами | claude-directory.md | 2026-09-03 |
| **Режимів дозволів шість**, а не сім: `default` (у CLI зветься **Manual**), `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`. `manual` — **аліас** до `default` (з v2.1.200) | https://code.claude.com/docs/en/permission-modes.md | 2026-09-03 |
| `--permission-mode` приймає рівно **6** значень і серед них **немає `default`** — замість нього `manual`: `acceptEdits`, `auto`, `bypassPermissions`, `manual`, `dontAsk`, `plan` | `$ claude --help` | 2026-09-03 |
| Deny-правила блокують у **кожному** режимі, включно з `bypassPermissions`. Allow-правила в `bypassPermissions` не діють | permission-modes.md | 2026-09-03 |
| Жоден режим, включно з `bypassPermissions`, не автосхвалює: правила `ask` · конекторні інструменти, яким організація поставила `ask` · `AskUserQuestion` і MCP-інструменти з `requiresUserInteraction` · `rm`/`rmdir` по **критичних шляхах** · запобіжники cross-session messaging | permission-modes.md | 2026-09-03 |
| `/usage`: блок Session (токени, вартість, тривалість, зміни рядків, розбивка по моделях) + для Pro/Max/Team/Enterprise **розбивка витрат по скілах, субагентах, плагінах і окремих MCP-серверах**, поведінкові прапорці й найважчі `/loop`-задачі. `d`/`w` перемикає 24 години / 7 днів | costs.md | 2026-09-03 |
| Цифра вартості — **локальна оцінка** за прайс-листом (або за `modelPricing` організації). Авторитетне джерело — Usage у Claude Console | costs.md | 2026-09-03 |
| Лічильники `/usage` **скидаються на `/clear`** (з v2.1.211; раніше накопичувались за час життя процесу) | costs.md | 2026-09-03 |
| Цифри `/usage` рахуються з локальної історії **цієї машини** — інші пристрої й claude.ai не входять | costs.md | 2026-09-03 |
| Способи зменшити витрати з доксів: керувати контекстом · обрати модель · **зменшити накладні витрати MCP** · code-intelligence плагіни для типізованих мов · винести обробку в хуки й скіли · **перенести інструкції з CLAUDE.md у скіли** · налаштувати extended thinking · делегувати «балакучі» операції субагентам · конкретні промпти | costs.md | 2026-09-03 |
| Монорепо: пошарові CLAUDE.md по теках · вибір між per-directory CLAUDE.md і path-scoped rules · `claudeMdExcludes` · блокування читання згенерованого й вендорного коду · code intelligence · sparse checkout (`worktree.sparsePaths`) · доступ між пакетами · **скіли на рівні тек** · плагін-рекомендація на старті сесії | https://code.claude.com/docs/en/large-codebases.md | 2026-09-03 |
| Телеметрія: OpenTelemetry, метрики й події, `OTEL_*`. Claude Code **прибирає `OTEL_*` з кожного підпроцесу**, який породжує | https://code.claude.com/docs/en/monitoring-usage.md, hooks.md | 2026-09-03 |
| Аудит змін конфігурації в сесії — хуки `ConfigChange` | security.md, hooks.md | 2026-09-03 |
| Повідомлення про вразливості — програма HackerOne, не публічне розкриття | security.md | 2026-09-03 |

### Що свідомо поза курсом — назвати чесно з посиланнями

Це не «ми не встигли», а «це інша аудиторія: адміністратор, а не інженер».
Формулювання для курсу: *«існує, робиться так, ось документація; у цьому курсі не
розбираємо, бо потрібні права організації, а не ваша машина»*.

| Тема | Чому поза курсом | Посилання |
| --- | --- | --- |
| LLM-gateway | Корпоративний проксі; потрібна інфраструктура організації | https://code.claude.com/docs/en/llm-gateway.md · `llm-gateway-connect.md` · `llm-gateway-rollout.md` · `llm-gateway-protocol.md` |
| Claude Apps Gateway | Те саме, окреме сімейство сторінок | `claude-apps-gateway.md`, `-config`, `-spend-limits`, `-deploy`, `-on-aws`, `-on-gcp` |
| `claude gateway` у CLI | Підкоманда існує (`--config <path>` до YAML), але це enterprise auth/telemetry gateway | `$ claude gateway --help` (`screens/b-gateway-help.txt`) |
| Amazon Bedrock | Інший провайдер, інші креденшели; ламає артефакти й частину фіч | https://code.claude.com/docs/en/amazon-bedrock.md |
| Google Vertex AI / Agent Platform | Те саме | https://code.claude.com/docs/en/google-vertex-ai.md |
| Microsoft Foundry | Те саме; окремо ламає tool search на Azure-хостингу | https://code.claude.com/docs/en/microsoft-foundry.md |
| Claude Platform on AWS | Окрема сторінка | https://code.claude.com/docs/en/claude-platform-on-aws.md |
| Self-hosted environments | 8 сторінок; розгортання власного пулу раннерів | `self-hosted-environments*.md` |
| Managed / server-managed settings | Політики організації; звичайний користувач їх лише **відчуває**, не пише | https://code.claude.com/docs/en/managed-settings.md · `server-managed-settings.md` · `managed-mcp.md` |
| Zero Data Retention, data usage | Юридично-комплаєнсна зона | `zero-data-retention.md`, `data-usage.md` |
| Devcontainer, corporate launcher, network config | Інфраструктура робочого місця | `devcontainer.md`, `corporate-launcher.md`, `network-config.md` |
| Analytics, admin setup, champion/communications kit | Для адміністратора й «чемпіона» впровадження | `analytics.md`, `admin-setup.md`, `champion-kit.md`, `communications-kit.md` |
| Sandboxing (глибоко) | ~37 ключів `sandbox.*`. У курсі — базове `/sandbox`, повний конфіг поза межами | https://code.claude.com/docs/en/sandboxing.md · `sandbox-environments.md` |
| Agent SDK (глибоко) | Окремий продукт для розробки агентів. У c14 — оглядово, повний розбір — окремий курс | сторінки `/docs/en/agent-sdk/*` у мапі code.claude.com |

### Застаріло в плані

- **«Режимів дозволів сім».** Перевірка 2026-08-27 дала сім — насправді **шість**
  режимів і **сім прийнятих імен** (`default` + аліас `manual`). Причому `claude --help`
  показує `manual` і **не показує** `default`, а хуки й SDK бачать `"default"` і
  **ніколи** `"manual"`. Для курсу це три різні написання однієї речі — треба сказати
  прямо, інакше учень вирішить, що щось зламано. *(Тема належить зоні c01–c08, але
  цифра з брифа неточна, тому фіксую тут.)*
- **Якщо план каже «`bypassPermissions` вимикає все»** — deny-правила діють і там,
  плюс є список дій, які не автосхвалює жоден режим.
- **Якщо план каже, що `/usage` показує рахунок** — це локальна оцінка; рахунок у Console.

### Додати, чого в плані немає

| Тема | Чому важлива | Джерело |
| --- | --- | --- |
| Плейнтекст-транскрипти | Найконкретніша безпекова річ у всьому курсі: секрет, який Claude прочитав, лежить у файлі незашифрованим | claude-directory.md |
| Пастка домашньої теки | Люди запускають `claude` у `~` і потім скаржаться на повторний діалог довіри | security.md |
| «Не пайпити недовірене в Claude» | Пряма рекомендація доксів, яку легко порушити (`curl … \| claude -p`) | security.md |
| Розбивка `/usage` по скілах/плагінах/MCP | Відповідає на «що саме зʼїдає ліміт» — найчастіше питання після першого тижня | costs.md |
| `/usage` скидається на `/clear` | Інакше цифри виглядають незрозуміло | costs.md |
| Атрибуція MCP і баг до v2.1.222 | Стара версія перебільшувала частку сервера — пояснює суперечливі скриншоти в мережі | costs.md |
| `modelPricing` | Чому в корпоративного користувача цифри інші | costs.md, settings-reference.md |
| `claudeMdExcludes` + sparse checkout | Два головні важелі для монорепо | large-codebases.md |
| `ConfigChange` як аудит | Звʼязує c12 і c16: спосіб помітити зміну конфігурації в сесії | security.md, hooks.md |
| `claude project purge` | Штатне «стерти все по цьому проєкту» | `$ claude project --help` |
| Deny-правила на читання секретів | Практичний захист, а не теорія | security.md, claude-directory.md |

### Екрани для курсу

- **Інтерактивно, зняти неможливо** — `/usage`: блок Session із рядками
  `Total cost`, `Total duration (API)`, `Total duration (wall)`, `Total code changes`,
  `Usage by model`, плюс рядок `Prompt cache (main)` (з v2.1.251) і для підписок —
  смуги плану, атрибуція й поведінкові прапорці; `d`/`w` перемикає період.
  Дослівний зразок виводу є в costs.md і його можна взяти в курс як цитату.
- **Інтерактивно** — `/permissions`: аудит правил (докси радять робити регулярно).
- `screens/b-settings-keys-full.txt`, рядки з групи Sandbox — показати **масштаб**
  (~37 ключів) як аргумент, чому це поза курсом.
- `screens/b-gateway-help.txt` — маленький екран, який доводить, що enterprise-шар
  існує, і закриває тему одним слайдом.
- Файл `~/.claude/history.jsonl` (тут 299 KB) — вражаючий і чесний доказ тези про
  плейнтекст. **Вміст не показувати**, лише розмір і призначення.

### Пастки новачка

1. **`--dangerously-skip-permissions` «щоб не заважало».** Докси рекомендують його
   **лише для пісочниць без інтернету**. Окремо є `--allow-dangerously-skip-permissions`,
   який робить режим *доступним*, не вмикаючи його — різницю легко проґавити.
2. **Запуск у `~`.** Довіра не зберігається, діалог щоразу; налаштування немає.
3. **`cat .env | claude -p "поясни"`.** Секрет у транскрипті назавжди (до
   `cleanupPeriodDays`).
4. **Думає, що `/clear` стирає дані.** Він скидає контекст і лічильники `/usage`,
   але транскрипт лишається на диску.
5. **Дивиться на `Total cost` на підписці Pro/Max.** Докси прямо кажуть: цей блок для
   API-користувачів, для підписки він **не релевантний для білінгу**.
6. **Порівнює `/usage` між ноутбуком і десктопом** — цифри локальні для машини.
7. **У монорепо дивується, що Claude «тягне чужі правила»** — це чужі CLAUDE.md;
   лікується `claudeMdExcludes`.

---

## Розходження документації й реального `--help` (версія 2.1.236)

Це окремий розділ на вимогу ТЗ. Усе перевірено емпірично сьогодні.

### 1. Приховані прапорці: задокументовані, але відсутні у `claude --help`

`cli-reference.md` описує прапорці, яких **немає** у виводі `claude --help` версії
2.1.236. Я перевірив, чи вони взагалі існують, методом «додай свідомо неіснуючий
прапорець і подивись, на який саме парсер поскаржиться»
(артефакт: `screens/b-hidden-flags-probe.txt`):

| Прапорець | Є в `--help`? | Розпізнається? | Доказ |
| --- | --- | --- | --- |
| `--zzz-bogus` (контроль) | ні | **ні** | `error: unknown option '--zzz-bogus'` |
| `--init-only` | **ні** | **так** | помилка вказує на `--zzz-bogus`, не на нього |
| `--maintenance` | **ні** | **так** | те саме |
| `--init` | **ні** | **так** | те саме |
| `--append-system-prompt-file` | **ні** | **так** | `Error: Append system prompt file not found: …/--zzz-bogus` — прапорець зʼїв наступний аргумент як значення, отже приймає шлях |

**Чому це важливо для курсу.** Хук `Setup` (подія №2 у таблиці c12) спрацьовує **лише**
на `--init-only`, `--init` або `--maintenance`. Учень, який шукатиме ці прапорці в
`claude --help`, не знайде їх і вирішить, що подія `Setup` недосяжна. Правильна порада:
`claude --help` — не повний перелік; повний перелік у
https://code.claude.com/docs/en/cli-reference.md.

### 2. `claude config` — команда, якої немає, але яка не падає

`claude config --help` не дає помилки: слово `config` стає позиційним аргументом
`prompt`, і друкується кореневий хелп. Учень легко вирішить, що команда є.
Артефакт: `screens/b-config-help.txt`.

### 3. Транспорт WebSocket

`claude mcp add --help` перелічує три транспорти: `stdio`, `sse`, `http`.
`mcp.md` описує ще й «Option 4: Add a remote WebSocket server». Як його задати через
`--transport`, з хелпу **не випливає**. Ймовірно, лише через `add-json` або
`.mcp.json`. **Не звірено** — прямої перевірки я не робив, бо вона потребує змінити стан.

### 4. Назва режиму дозволів

`claude --help` для `--permission-mode` перелічує `acceptEdits`, `auto`,
`bypassPermissions`, `manual`, `dontAsk`, `plan` — тобто **`manual` є, а `default` немає**.
Документація ж описує режим під іменем `default` і зазначає, що `manual` — аліас, а
хуки та SDK отримують **завжди `"default"`, ніколи `"manual"`**. Три різні написання
одного режиму залежно від того, куди дивишся.

### 5. `plugin eval`: хелп працює, команда — ні

`claude plugin eval --help` друкує повний, детальний хелп із десятками прапорців.
Сама ж `claude plugin eval` у порожній теці друкує
`` `plugin eval` is currently in early access `` і виходить із кодом 1.
Артефакти: `screens/b-plugin-eval-help.txt`, `screens/b-plugin-eval-gate.txt`.
Для курсу: наявність хелпу **не означає** доступність команди.

### 6. `timeout` на macOS

ТЗ пропонувало `timeout 20 claude …`. На macOS `timeout` немає в базовій системі:
`(eval):1: command not found: timeout`. Робочі варіанти: `gtimeout` з coreutils
(теж не встановлений тут) або `perl -e 'alarm N; exec @ARGV' claude …`.
Якщо в курсі будуть приклади з `timeout`, для маку потрібна виноска.

---

## Загальні висновки по c09–c16

### Чи вистачає восьми модулів

**Ні. За чесного покриття виходить 10–11 модулів.** Обсяг звіреного матеріалу
розподілений дуже нерівномірно, і два модулі зараз явно перевантажені.

| Модуль | Оцінка обсягу | Коментар |
| --- | --- | --- |
| c09 | **переповнений** | Памʼять + `.claude/` + 222 ключі settings — це три різні теми |
| c10 | нормальний | Скіли/команди/плагіни справді одна тема, бо злиті механізмом |
| c11 | нормальний | Але agent teams — experimental, їх варто явно позначити |
| c12 | **сильно переповнений** | 33 події, 5 типів обробників, семантика exit-кодів, безпека |
| c13 | нормальний | Із tool search — щільний, але цілісний |
| c14 | **переповнений** | headless + CI + 3 механізми розписання + channels + Agent SDK |
| c15 | нормальний | Добре тримається навколо однієї тези («дай перевірку») |
| c16 | нормальний | Якщо «поза курсом» подати списком, а не розбором |

### Що варто винести окремо

1. **`settings.json` — окремий модуль або довідник-додаток.** 222 ключі не вміщаються
   в модуль про памʼять. Пропозиція: у c09 лишити памʼять + структуру `.claude/` +
   ~15 робочих ключів, а повний перелік дати додатком (`screens/b-settings-keys-full.txt`
   уже готовий як його основа).

2. **Hooks розбити надвоє.** `c12a` — механіка (три рівні конфігу, matcher, exit-коди,
   3 приклади, безпека) на 6–8 подіях, які реально потрібні: `SessionStart`,
   `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`, `SessionEnd`, `Notification`,
   `PreCompact`. `c12b` — довідник решти 25 подій із таблицею з цього звіту, як
   матеріал для повернення, а не для заучування. **Спроба дати 33 події лінійно вбʼє
   модуль.**

3. **Розписання окремо від headless.** У c14 зараз два різні світи: «Claude як утиліта
   в пайпі» (детермінізм, exit-коди, `--bare`, JSON) і «Claude, що прокидається сам»
   (loop / desktop tasks / cloud routines / channels). Друга половина тягне на власний
   модуль, тим паче що вона майже вся про **вибір із трьох механізмів**, і порівняльна
   таблиця з `scheduled-tasks.md` — готовий центр такого модуля.

### Чого бракує в переліку модулів узагалі

| Тема | Де мала б жити | Чому |
| --- | --- | --- |
| **Діагностика зламаного конфіга** | між c09 і c12 | `claude doctor`, `--safe-mode`, `--debug-file`, `--setting-sources`, сторінка `debug-your-config.md`. Зараз цих інструментів немає ніде, а без них учень безпорадний у 90% реальних проблем |
| **Sandboxing** | c16, коротко | `/sandbox` згадується в security.md як спосіб працювати автономно **без** втрати безпеки. Це прямий конкурент `--dangerously-skip-permissions`, і про нього треба сказати раніше, ніж учень знайде «прапорець, що вимикає питання» |
| **Worktrees як робоча звичка** | c11 або c15 | Зараз згадані в c11 одним словом. Але `.worktreeinclude`, `worktree.sparsePaths` і `isolation: worktree` — це те, чим реально користуються для паралельної роботи |
| **Dynamic workflows** | c11 | `.claude/workflows/*.js`, `/workflows`, `/workflow-authoring`, бандловані воркфлоу. Окремий механізм оркестрації, не згаданий у плані взагалі |
| **Cross-session messaging** | c11 | `cross-session-messaging.md` + `crossSessionInbound` + `SendMessage`. Прямо в темі «як передавати контекст між агентами» |
| **Компакція й контекстне вікно** | ймовірно c01–c08 | Але c09 (памʼять після компакту), c10 (бюджет скілів 5k/25k) і c16 (`autoCompactWindow`) на неї спираються. Треба звірити з іншим агентом, щоб не лишити діру |

### Теми, що перетинаються із зоною c01–c08

Передаю іншому агентові, щоб не дублювати й не суперечити:

| Тема | Мій бік | Що має бути в c01–c08 |
| --- | --- | --- |
| **Режими дозволів** | c16 (безпека, `bypassPermissions`, deny-правила) | Базовий розбір **шести** режимів. **Увага: цифра «сім» із перевірки 2026-08-27 неточна** — шість режимів, сім імен (`default` = `manual`), і `--help` показує `manual` без `default` |
| **Auto mode** | c16 (класифікатор як заміна ручному схваленню) + c12 (`PermissionDenied`) | Що це і як стартує сесія. Факт «на Pro/Max/Team стартує в `auto`» — його зона |
| **`/context`** | c09 (доказ завантаження CLAUDE.md) | Сама команда й читання її виводу |
| **`/compact` і контекстне вікно** | c09, c10, c16 (наслідки) | Механіка компакції |
| **Slash-команди загалом** | c10 (як їх створювати) | Базовий набір із 111; `screens/b-slash-commands-full.txt` придатний обом |
| **Plan mode** | c15 (як фаза циклу) | Механіка режиму, `Shift+Tab`, статус-бар |
| **Моделі й effort** | c11 (`model`/`effort` в агентах), c16 (вартість) | `/model`, аліаси, рівні effort |
| **`claude doctor`** | згадка в c09 | Логічніше в базовій частині, як інструмент установки |
| **Checkpointing / rewind** | c15 (робоча звичка) | Механіка чекпоінтів |

### Три речі, які я б назвав найціннішими знахідками для курсу

1. **Хуків 33, і в них є цілі підсистеми, яких план не бачить** (agent teams,
   worktrees, MCP-елісітація, зміна моделі). Плюс семантика exit-кодів, де `exit 1`
   мовчки нічого не блокує — це найдорожча помилка, яку може зробити учень.

2. **`claude -p` без `--bare` виконує хуки й MCP з чужого репозиторію без питань**,
   бо діалог довіри в неінтерактивному режимі не показується. Це має прозвучати і в
   c14, і в c16, бо це найреальніший вектор атаки в усьому курсі.

3. **`claude config` не існує, а `claude config --help` не падає.** Ідеальний приклад
   для самої першої лекції про те, чому в цьому курсі кожен факт звіряється з живою
   командою, а не з памʼяттю чи статтею з мережі.

---

## Перелік створених артефактів

Усі — у `dev/build/005-ai-terminal/00-research/screens/`, префікс `b-` (мої):

| Файл | Що містить |
| --- | --- |
| `b-config-help.txt` | Доказ, що підкоманди `config` немає |
| `b-doctor-help.txt` | `claude doctor --help` |
| `b-auth-help.txt` | `claude auth --help` |
| `b-install-help.txt`, `b-update-help.txt` | Установка й оновлення |
| `b-gateway-help.txt` | Enterprise gateway (для розділу «поза курсом») |
| `b-mcp-add-help.txt` | Усі форми `mcp add` + 4 приклади |
| `b-mcp-add-json-help.txt`, `b-mcp-list-help.txt`, `b-mcp-login-help.txt`, `b-mcp-remove-help.txt`, `b-mcp-serve-help.txt` | Решта підкоманд MCP |
| `b-mcp-list-live.txt` | **Живий** вивід із health-check і `! Needs authentication` |
| `b-plugin-marketplace-help.txt`, `b-plugin-validate-help.txt`, `b-plugin-install-help.txt`, `b-plugin-list-help.txt`, `b-plugin-init-help.txt`, `b-plugin-details-help.txt` | Підкоманди плагінів |
| `b-plugin-eval-help.txt` | Повний хелп eval-гарнеса |
| `b-plugin-eval-gate.txt` | **Живий** доказ раннього доступу (exit 1) |
| `b-plugin-list-live.txt` | **Живий** список плагінів і маркетплейсів |
| `b-hidden-flags-probe.txt` | Емпіричний доказ існування прихованих прапорців |
| `b-settings-keys-full.txt` | **222 ключі** `settings.json` з описами й областю дії |
| `b-slash-commands-full.txt` | **111 слеш-команд** з описами |

Файли без префікса (`claude--help.txt`, `claude-mcp--help.txt`, `claude-plugin--help.txt`,
`claude-agents--help.txt`, `claude-ultrareview--help.txt`, `claude-project--help.txt`,
`claude-auto-mode--help.txt`, `claude-import--help.txt`, `claude--version.txt` та інші)
зняв другий агент; я на них посилаюсь, але не змінював їх.
