---
name: atlassian-kb-platform-notice
description: Статті support.atlassian.com/jira/kb/ здебільшого Data-Center-only — перевіряти банер платформи перед тим, як цитувати їх у курсі про Cloud
metadata:
  type: reference
---

Розділ **`support.atlassian.com/jira/kb/…`** (Knowledge Base) — не те саме, що `…/docs/…`.
Кожна KB-стаття починається банером платформи, і **більшість статей про дашборди, гаджети
й поля позначені «Platform Notice: Data Center Only»**. Для курсу «Jira з нуля» (лише Cloud)
такі статті джерелом не є, хоч виглядають як офіційна довідка й добре ранжуються в пошуку.

**Як перевіряти (один grep по знятому тексту):**
- придатна: «This article only applies to Atlassian apps on the **cloud** platform»
- непридатна: «This article only applies to Atlassian apps on the **Data Center** platform»

**Перевірено 2026-09-18 (автор j08):** DC-only виявились усі KB про налаштування гаджетів —
«Filter results are empty in dashboard gadget», «Two Dimensional Filter gadget shows Irrelevant
column», «Fix Missing Fields in Jira Dashboard Gadget Dropdowns», «Unexplained changes … None
and Irrelevant». Cloud-only (придатна) — «Filter Count gadget shows error message in Jira Cloud»,
звідки взято дослівний текст помилки «We can't display the gadget. You may not have permission
to see the data or the gadget is no longer supported».

**Наслідок для авторингу:** назв полів у панелях налаштування гаджетів у Cloud-доксах **немає
взагалі** — є лише в DC-KB і в мануалі Jira 6.1 на `confluence.atlassian.com`. Тому такі імена
в урок не пишуть: або знімок sandbox, або опис словами.

Пов'язане: [[atlassian-docs-fetch]], [[atlassian-docs-lookup]], [[jira-course-authoring]]
