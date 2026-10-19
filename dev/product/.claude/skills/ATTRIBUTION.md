# Атрибуція вендорених скілів продуктового відділу

Скіли в цій папці — **не наш код**. Це копії сторонніх відкритих скілів, встановлені
`npx skills add … -a claude-code` з `dev/product/`. Походження й хеші файлів веде
`../../skills-lock.json`. Репозиторій `github.com/AndriyPuhalsky/ai-academy` публічний,
тож копії тут розповсюджуються далі. Тексти ліцензій лежать у `_licenses/`, а цей файл
виконує умову атрибуції.

Ліцензії перевірено 2026-10-01 через GitHub API
(`api.github.com/repos/<owner>/<repo>/license`). Кожен `SKILL.md` перед вибором прочитали
агенти-розвідники. Після встановлення всі 180 файлів пройшли скан: лише `.md` і `.json`,
жодного скрипта чи мережевого виклику.

**Змін з нашого боку немає**: файли лежать побайтово, як в апстрімі, тому
`skills-lock.json` тримає `computedHash`. Потрібна правка під себе — робимо **свій окремий
скіл**. Копію не правимо: інакше хеш розійдеться, а для скілів під CC BY-SA правка вимагає
ще й поширення змін під тією ж ліцензією.

## Джерела

| Скіли | Апстрім | Ліцензія | Правовласник |
| ----- | ------- | -------- | ------------ |
| `continuous-discovery`, `mom-test`, `jobs-to-be-done`, `good-strategy-bad-strategy`, `lean-analytics`, `obviously-awesome`, `improve-retention` | [wondelai/skills](https://github.com/wondelai/skills) | MIT | Wondel.ai sp. z o.o. |
| `customer-research`, `product-marketing`, `launch`, `copywriting`, `ai-seo`, `onboarding`, `referrals`, `community-marketing` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | MIT | Corey Haines |
| `synthesize-research`, `competitive-brief`, `metrics-review`, `roadmap-update`, `stakeholder-update` | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | Apache-2.0 | Anthropic |
| `survey-design` | [owl-listener/designer-skills](https://github.com/owl-listener/designer-skills) | MIT | MC Dean |
| `strategy-red-team`, `pre-mortem`, `north-star-metric` | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | MIT | Pawel Huryn |
| `the-fool` | [jeffallan/claude-skills](https://github.com/jeffallan/claude-skills) | MIT | jeffallan |
| `foundation-build-risk-review`, `define-prioritization-framework`, `foundation-okr-writer`, `deliver-prd`, `deliver-acceptance-criteria`, `deliver-edge-cases`, `deliver-user-stories`, `deliver-release-notes` | [product-on-purpose/pm-skills](https://github.com/product-on-purpose/pm-skills) | Apache-2.0 | product-on-purpose |
| `product-experiments` | [refoundai/lenny-skills](https://github.com/refoundai/lenny-skills) | MIT | Refound AI |
| `oss-sponsors-fundraising`, `developer-tutorial`, `developer-education-strategy` | [samber/developer-relations-skills](https://github.com/samber/developer-relations-skills) | MIT | Samuel Berthe |
| `hinge-question-designer`, `cognitive-load-analyser`, `assessment-validity-checker`, `retrieval-practice-generator`, `spaced-practice-scheduler`, `motivation-diagnostic-task-redesign` | [garethmanning/education-agent-skills](https://github.com/garethmanning/education-agent-skills) | **CC BY-SA 4.0** (GitHub показує `NOASSERTION`) | Gareth Manning |
| `alterlab-teaching-design` | [alterlab-ieu/alterlab-academic-skills](https://github.com/alterlab-ieu/alterlab-academic-skills) | MIT | AlterLab Creative Technologies Laboratory |

## Відомі особливості

- **CC BY-SA 4.0** (`garethmanning`): копіювати й комітити можна з атрибуцією. **Змінена
  копія мусить лишитись під CC BY-SA**, тому ці файли не правимо взагалі.
- `alterlab-teaching-design` у frontmatter має `allowed-tools: Read Write Edit Bash WebFetch
  WebSearch`, тобто поки скіл активний, ці інструменти не питають дозволу. Зміст скіла
  безпечний (методика курсу). Факт записано, щоб він не був сюрпризом.
- `ai-seo` радить сторонню утиліту `npx is-agentic`. Агенти відділу **не запускають
  сторонніх CLI**, які радять скіли (правило в кожному `pm-*.md`).
- Скіли `coreyhaines31` читають спільний контекст продукту з
  `dev/product/.agents/product-marketing.md` (його створює й веде `pm-growth`).
  Посилання на `../../tools/REGISTRY.md` у них мертві й нешкідливі.
- Скіли `anthropics` посилаються на `../../CONNECTORS.md`: після встановлення поодинці
  посилання мертве й нешкідливе. Ставити їх **плагіном** не можна: плагін додає
  MCP-сервери Slack, Linear, Asana та інших SaaS.
- `samber/developer-relations-skills` — молодий репозиторій (2026-09). Версію фіксує хеш у
  `skills-lock.json`. Оновлення `npx skills update` — лише свідомо, з перечитуванням.
