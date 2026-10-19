---
name: atlassian-marketplace-reading
description: Як перевірити застосунок, бейдж і фільтр Marketplace без браузера — публічний REST і curl сторінки пошуку; плюс мовчазні редіректи developer.atlassian.com і згортання Cloud Fortified
metadata:
  type: reference
---

Marketplace — JS-застосунок, і WebFetch на ньому віддає порожнечу. Але **дані дістаються
без браузера** (перевірено 2026-09-18, урок `j17`):

- **Публічний REST, без ключа:**
  `https://marketplace.atlassian.com/rest/2/addons?text=<запит>&hosting=cloud&product=jira&limit=10`
  → назви й ключі; `…/rest/2/addons/<key>` → вендор (`_embedded.vendor.name`), посилання
  партнера і **статус програм довіри**: `programs.cloudFortified.status` (`approved` /
  `rejected`), `programs.bugBountyParticipant.cloud.status`. Це єдиний спосіб звірити
  **на дату**, що застосунок із знімка досі живий і що бейдж на картці справжній.
  Працює й параметр `cost=free`.
- **Сторінка пошуку читається `curl`-ом:**
  `curl -s 'https://marketplace.atlassian.com/search?hosting=cloud&product=jira'` → у HTML
  лежать усі фасети й значення як `"MarketplaceFilterOption:<id>":{…"label":"<напис>"}`.
  Так закрився ⚠-рядок проєкту «чи існує фільтр «Free up to 10 users»»: існує
  (`freeStarterTier`), поруч `Free for all teams` (`paid`). Фасети: `Works with`,
  `Hosting`, `Pricing`, `Trust signals`, `Show more filters`.
  Сторінка застосунку так само віддає вкладки: `data-testid="app-listing__tab-*"`.

⚠ **`developer.atlassian.com/platform/marketplace/…` мовчки редіректить.** Адреса
`cloud-fortified-apps-program/` віддає **200** — але це вже сторінка
`programs-and-features/`, де Cloud Fortified серед програм немає. Без перевірки
`%{url_effective}` легко вирішити, що програми не існувало. Дата оновлення сторінки
стоїть угорі («Last updated Aug 24, 2026») — її варто фіксувати поруч із цитатою.

**Приклад, який варто памʼятати як шаблон розбіжності (стан 2026-09-18):** бейдж
`CLOUD FORTIFIED` є на екрані Jira, є у фільтрі `Trust signals` і описаний як діючий на
`atlassian.com/licensing/marketplace` — а `developer.atlassian.com/platform/marketplace/changelog/`
2 вересня 2026 пише: заявки закриті з 1 вересня, «The CFA program will be retired on
31st December, 2026», на заміну — `Atlassian Enterprise Certified`. Тобто **екран,
довідка для клієнтів і changelog для партнерів розходяться в три боки одночасно**.

**Why:** ціни, бейджі й програми Marketplace старіють швидше за будь-що інше в Jira;
урок, який назве їх без дати й без живої перевірки, збреше протягом сезону.

**How to apply:** назви застосунків зі старих знімків — перевіряти REST-ом перед тим, як
класти в урок; бейдж із картки — перевіряти REST-ом і changelog-ом (чи існує сама
програма); чисел цін в урок не ставити взагалі («на сторінці застосунку, на дату»);
у тексті писати обидва стани — що видно на екрані й що каже changelog, із датами.

Пов'язане: [[atlassian-docs-fetch]] · [[jira-renames-in-flight]] · [[atlassian-docs-contradict]]
