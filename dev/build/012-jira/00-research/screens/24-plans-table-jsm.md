# Екран: таблиця планів — Jira Service Management, колонка Free (звірено очима)

- **Шлях:** `https://support.atlassian.com/jira-cloud-administration/docs/explore-jira-cloud-plans/`, розділ
  **Plans comparison for Jira Service Management** — **сьома** таблиця сторінки (перша — Jira; друга–шоста —
  Jira Product Discovery: «Creator limit per site — Three creators», «200 flows runs per month» — **не JSM**, не плутати).
- **Знято:** 2026-09-17 (вечір) кореневою сесією **двома способами:** (1) `curl -sL` + розбір `<tr>/<td>`
  (галочка = `<path d="M9.707 11.293…">`, прочерк = `-`, порожня клітинка = порожньо), (2) **очима** в Chrome —
  скріншоти шапки й тіла таблиці. Обидва збіглися між собою і з `curl`-прочитанням автора j02.
  **Прочитання WebFetch від 2026-09-17 (ранок) було хибним:** воно поставило ✓ на work-level security і прочерки на
  custom reports та multi-channel support — усе навпаки. Таблиці планів через WebFetch **не читати**.

## Таблиця дослівно (жирним — колонка Free)

| Рядок | Free | Standard | Premium | Enterprise |
|---|---|---|---|---|
| User limit | **Up to 3 agents** | Up to 100,000 agents | Up to 100,000 agents | Up to 100,000 agents |
| Customer limit | **Unlimited** | Unlimited | Unlimited | Unlimited |
| Storage | **2 GB** | 250 GB | Unlimited | Unlimited |
| Support | **Community support** | 9–5 Standard Support | 24/7 Premium Support | 24/7 Enterprise Support |
| Multi-channel support | **✓** | ✓ | ✓ | ✓ |
| Multiple help centers on a single site | **–** | – | ✓ | ✓ |
| Customizable workflows and SLA's | **✓** | ✓ | ✓ | ✓ |
| Custom reports | **✓** | ✓ | ✓ | ✓ |
| Automation | **✓ 1,250 steps per subscription** | ✓ 3,000 steps per user per month | ✓ 6,500 steps per user per month | ✓ 9,500 steps per user per month |
| Global and multi-space automation | **100 executions per month** | 5,000 executions per month | 1,000 executions per user per month (combined) | 1,000 executions per user per month (combined) |
| Work-level security settings (лінк) | **–** | ✓ | ✓ | ✓ |
| Audit logs | **–** | ✓ | ✓ | ✓ |
| Sandboxes | **–** | – | ✓ | ✓ |
| Release tracks | **–** | – | ✓ | ✓ |
| Data pinning to a realm | **–** | ✓ | ✓ | ✓ |
| Uptime SLA | **–** | – | 99.9% | 99.95% |
| Assets | **(порожньо)** | (порожньо) | Up to 50,000 objects (more available via add-ons) | Up to 500,000 objects (more available via add-ons) |
| Virtual service agent | **(порожньо)** | (порожньо) | Up to 1,000 assisted conversations per month (more available via add-ons) | Up to 1,000 assisted conversations per month (more available via add-ons) |

## Побічно з тієї ж сторінки — таблиця Jira (перша), колонка Free
Up to 10 users · Site limit **One** · Scrum and Kanban boards ✓ · Backlog ✓ · Agile reporting ✓ · Customizable
workflows ✓ · Apps and integrations ✓ · Automation **150 steps per subscription** · Roadmaps **Basic** (Advanced —
Premium/Enterprise) · Space roles **–** · Advanced permissions **–** · Capacity planning **–** · Space archiving **–**
(Premium/Enterprise) · Domain verification and account capture ✓ · Session duration management (desktop) ✓ ·
Admin insights **–** · Sandbox **–** · Release tracks **–** · Password policies ✓ · Encryption in transit & at rest ✓ ·
Business continuity & disaster recovery ✓ · Anonymous access **–** · Audit logs **–** · IP allowlisting **–** ·
Data residency **–** · Storage **2 GB file storage** · Support **Community support** · Guaranteed Uptime SLA **–**.

## Для курсу
- **j18, j19** (JSM), **довідник 3** «Ліміти Free» — рядок №3 `facts-free-plan.md` виправлено за цим знімком і
  переведено з ⚠ у ✅.
- В уроках із чисел — лише «3 агенти» (§0.1 п. 3 контракту); «1 250 steps», «100 executions per month» —
  тільки довідник 3 з датою.
- Атлассіан у цій таблиці ще пише «SLA's» з апострофом і «Work-level security settings» (не issue-level) —
  термін для довідника.
