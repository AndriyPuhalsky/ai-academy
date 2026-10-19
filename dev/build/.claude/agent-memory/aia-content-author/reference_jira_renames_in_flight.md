---
name: jira-renames-in-flight
description: Перейменування Jira, які тривають прямо зараз (Summary→Title у беті) — докси випереджають екран, тому в уроці називати обидва слова
metadata:
  type: reference
---

Перейменування в Jira Cloud не закінчились на `issue → work item` і `project → space`.
Стан на **2026-09-17** (автор `j04`):

- **`Summary` → `Title`.** `support.atlassian.com/jira-software-cloud/docs/create-a-work-item-and-a-subtask/`:
  «Title — Type a title for the work item. **This field was previously labelled Summary.**
  JQL queries, API calls, and automations that reference `summary` still work as before».
  Сторінка має банер «We're rolling out some changes to the work item as an open beta…
  the new experience might not be enabled on your site». Sandbox того ж дня
  (`screens/07`, `screens/11`) показує **`Summary`** — тобто **докси попереду екрана**.
- Зворотний випадок теж є: `manage-your-jira-personal-settings` не знає полів `Theme` і
  `Jira homepage`, які на екрані є (знахідка автора `j03`) — **екран попереду доксів**.

**Why:** курс живе рівно з цього — «звіряй живою командою й живим екраном, а не статтею».
Написати лише одне зі слів означає, що в половини читачів урок не збігається з екраном.

**How to apply:** у вікні — напис зі `screens/` (з датою в заголовку), у прозі — обидва слова
з поясненням, що зміна їде хвилями. Перед кожним уроком перевіряти, чи не зрушилось:
сторінка з банером «open beta» — сигнал, що за місяць екран зміниться.

Пов'язане: [[jira-course-facts-drift]] · [[reference-atlassian-docs-lookup]] · [[jql-fields-page-rename-bug]]
