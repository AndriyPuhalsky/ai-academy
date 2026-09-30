---
name: kb-callout-vs-article-body
description: У статті бази знань Atlassian синя виноска над текстом і сам текст статті можуть суперечити одне одному; будову видно лише в JSON сторінки (ComponentCallout проти articleBody), а не в тексті
metadata:
  type: reference
---

Цитата «на початку статті» — це часто **не перше речення статті**, а синя виноска над нею. У HTML
`support.atlassian.com/jira/kb/…` це видно тільки в JSON сторінки:

- виноска — обʼєкт `"__typename":"ComponentCallout"` з `"appearance":"Information (Blue)"`;
- текст статті — рядок `"articleBody":"…"` у JSON-LD (він же дає `datePublished`; дату «Updated on …»
  шукати в тексті окремо).

Доведено 2026-09-30 на `jira/kb/bulk-archive-issues-in-jira-cloud/`: у виносці «Archiving issues is only
available for Premium and Enterprise customers.», а `articleBody` **починається** протилежним — «In Jira Cloud,
it's possible to archive single work items, but bulk archiving them is not available.» Курс пʼять хвиль писав
«стаття починається словами…» і «у наступному реченні каже інше» — обидві конструкції описували будову
неправильно. Канон 012: «виноска над статтею бази знань розходиться з текстом самої статті, з екраном і з
продуктовою довідкою».

`learningResourceType: "Knowledge base article"` у JSON-LD стоїть **на всіх** сторінках support.atlassian.com,
включно з продуктовими доксами, — межу «KB / документація» визначає адреса (`/kb/`), а не мітка.

Суміжне: [[claims-about-the-docs]], [[quote-truncated-qualifier]], [[jira-docs-verification]].
