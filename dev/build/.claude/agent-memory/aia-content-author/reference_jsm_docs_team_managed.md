---
name: jsm-docs-team-managed
description: Докси Jira Service Management — де брати факти про портал, черги, SLA, агентів і клієнтів для team-managed службового спейсу на Free
metadata:
  type: reference
---

Хаб живих слагів — `support.atlassian.com/jira-service-management-cloud/resources/`
(grep по `href="/jira-service-management-cloud/docs/…"` дає ~1 200 адрес). Прийоми читання —
[[atlassian-docs-fetch]] і [[atlassian-docs-lookup]].

**Дерево JSM-доксів роздвоєне за типом спейсу.** Для курсу про Free брати сторінки з
`…-in-team-managed-…` у слагу: `set-up-request-types-in-team-managed-projects`,
`create-and-edit-slas-in-team-managed-service-projects`,
`create-a-new-sla-calendar-in-team-managed-service-projects`,
`customize-your-customer-portal-in-team-managed-projects`,
`set-up-a-knowledge-base-in-team-managed-service-desks`,
`manage-how-people-access-your-team-managed-service-space`,
`receive-requests-from-an-email-in-next-gen-service-projects` (слаг ще з «next-gen»!).
На них стоїть банер «This page is for team-managed spaces». Загальні сторінки
(`what-are-slas`, `set-up-sla-conditions`, `about-the-issue-view-in-jira-service-management`)
придатні, але описують і company-managed — читати банер до цитування.

**Що чим підтверджується (перевірено 2026-09-18):**
- агент = місце: «Service space agents are licensed users who work on customer requests»;
  клієнт не займає: «have no access to Atlassian apps (no app licenses consumed)» +
  «There is no limit on the number of customers you can add to your service space»;
- портал створюється сам для кожного службового спейсу (`about-the-portal-and-help-center`);
  портал ≠ центр допомоги: портал — сторінка однієї служби, help center — спільний вхід;
- черга — «a filtered set of work items that are displayed to your team»; агенти черг не
  налаштовують; поле JQL у чергах — `"Request Type"`;
- SLA — `Start` / `Pause on` / `Stop` + ціль з JQL + календар; пауза «when you are waiting
  for a customer to respond»; **новий календар за замовчуванням 09:00–17:00** (а не «рахує
  календарний час, поки календар не заданий» — такого в доксах немає);
- дві кнопки відповіді: «select Add internal note … or Reply to customer»;
- база знань — Confluence: «at a minimum, you'll need to have a Free plan of Confluence on
  the same site» (`add-confluence-to-set-up-knowledge-base`). Фрази «No purchase of
  Confluence is required» в живих доксах немає — не цитувати.

**Два шляхи до одного й того самого** в живих доксах: `Space settings → Request management →
Request types` (типи запитів, SLA) проти `Service space settings → Request types` (статуси,
workflow). Обидва живі — це [[atlassian-docs-contradict]] у чистому вигляді.

**Слово «агент» має двійника в самому UI:** панель `Agents` і кнопка `Add agent` на картці —
це Rovo-помічники (апсел на Free), а не роль агента служби.

**Додавання продукту на сайт:** KB `adding-new-products-or-3rd-party-apps-to-existing-atlassian-cloud-site`
(банер «Platform Notice: Cloud Only») — `Settings → User Management → Discover Applications`,
«Only members of the Site-Admin Group…»; другий вхід описаний на сторінці про Confluence
(Atlassian Administration → `Apps` → `Discover new apps`).
