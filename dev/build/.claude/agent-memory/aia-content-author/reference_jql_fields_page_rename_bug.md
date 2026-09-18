---
name: jql-fields-page-rename-bug
description: JQL-поле project перейменоване на space лише в доксах; Atlassian сама радить вживати старе слово — синтаксис брати з екрана, не зі статті
metadata:
  type: reference
---

`support.atlassian.com/jira-software-cloud/docs/jql-fields/` (перевірено 2026-09-17, автор `j04`)
пройшла **масову автозаміну `project` → `space`** і в частині рядків стала неправдивою:

- «Syntax: **`spaceJira`**» — такого поля не існує;
- приклади `space = "ABC"`, `space = 1234`;
- функції `spacesLeadByUser()`, `spacesWhereUserHasPermission()`, `spacesWhereUserHasRole()`;
- при цьому «Field Type: **PROJECT**» лишився старий — слід заміни видно в тому ж абзаці.

Живий продукт вживає старе слово: `screens/15-search-jql.md` (sandbox 2026-09-17) показує в
рядку пошуку `project = KAN AND status != Done ORDER BY created DESC`, а в URL — `jql=project%20%3D%20KAN`.

**Why:** курс обіцяє, що в JQL і URL живуть колишні слова (`project`, `issue`, `issuetype`);
некритично переписаний абзац із доксів зламав би цю тезу і дав би учневі запит, який не працює.

**How to apply:** з цієї сторінки брати **описи полів** (`assignee`, `reporter`, `parent`,
`labels`, `due` — «the due date relates to the date only (not to the time)», `watcher`,
`summary`) і **переліки операторів**, але **не синтаксис і не приклади**. Синтаксис звіряти
з екраном (`screens/15`) або з рядком пошуку в sandbox. Особливо стосується `j07` і
довідника 1 (`jira-ref-jql.html`).

**Доповнення автора `j07` (2026-09-18): це не помилка верстальника, а перейменування в
процесі — і Atlassian сама це визнає.** На `jql-operators`, `jql-keywords` і
`find-specific-work-items` висить банер:

> «We're updating terminology in Jira, moving from "issue" to "work item", and "project" to
> "space". As we roll out these changes, **some JQL entries using the new terms may not work
> yet. If you come across this, try using the old term instead.** There are no changes to
> existing JQL queries.»

Тобто офіційна рекомендація — **вживати старе слово**. Приклади на `jql-keywords` теж уже
переписані (`space = "New office"`, `space in (JRA,CONF)`) — та сама обережність.
У курсі цю цитату варто подавати читачеві як матеріал (j07, блок 3): вона і є найкращий
живий доказ тези «звіряй екраном, а не статтею».

Корисний побічний факт із тієї ж сторінки: `resolution` не існує у службових team-managed
спейсах — «Instead, you can use the statusCategory field (a work item is resolved when
`statusCategory = Done`)». **Окремої статті про поле `statusCategory` на `jql-fields`
НЕМАЄ** — повний опис (три категорії ToDo / Inprogress / Done, оператори `= != IN NOT IN`)
живе в базі знань: `support.atlassian.com/jira/kb/how-to-search-using-statuscategory-statuscategorychangeddate-function-with-jql/`
(оновлено 2025-09-25). Для довідника 1 це означає: джерело поля — KB, не `jql-fields`.

Пов'язане: [[reference-atlassian-docs-lookup]] · [[jira-course-facts-drift]] · [[atlassian-docs-fetch]]
