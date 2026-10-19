# Екран: картка роботи (work item view)

- **Шлях:** `/browse/KAN-2` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## Хлібні крихти й шапка
**Spaces** / іконка **Моя команда** / **Add epic** / іконка типу + **KAN-2**
Праворуч: замок (обмежити доступ) · око **1** (watchers) · **Share** · ⋯ **Actions**
Заголовок **Task 2** (редагується на місці). Під ним кнопки **+** («Add or create work related to this Task») · ⋯ («Add apps»)

## Ліва колонка
- **Description** — «Add a description...»
- **Subtasks** — **Add subtask**
- **Linked work items** — **Add linked work item**
- **Activity** — вкладки **All** · **Comments** · **History** · **Work log**; «Newest first»
  Поле «Add a comment…» з підказками-чіпами **Who is working on this...?** · **Can I get more info...?** · **Status update...**;
  «Pro tip: press M to comment»

## Права колонка
- Кнопка статусу **В работе ▾** (перехід у інший статус) · іконки **Open in coding tool** (</>) · **Automation** (⚡) · кнопка **Improve Task** (AI-апсел)
- Панель **Details** (шестірня «Configure»):
  **Assignee** Unassigned · **Assign to me** · **Parent** Add parent · **Priority** None · **Labels** Add labels ·
  **Due date** «Due on Oct 1, 2026» · **Team** Add team · **Start date** Add date · **Reporter** Користувач Jira
- Згорнуті секції **Development** · **Automation** («Rule executions»)
- Внизу: «Created 14 minutes ago» · «Updated 14 minutes ago» · **Configure**
- «Resize work item view side panel»

## Для курсу
Стан `item` компонента: заголовок · статус · поля праворуч (assignee, parent, priority, labels, due date, reporter) ·
опис · підзадачі · звʼязки · коментарі. j04 (словник), j05 (ведення роботи).
