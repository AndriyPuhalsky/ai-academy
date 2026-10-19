# Екран: вигляд List

- **Шлях:** `/jira/software/projects/KAN/list?jql=project%20%3D%20KAN%20ORDER%20BY%20…` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## Панель
Кнопка **Ask AI** (ліворуч, у Free веде на апсел — не описувати як доступну функцію без перевірки) ·
«Filter by assignee» · **Filter** · **Group** · «More actions»

## Таблиця
Колонки (у кожної «Sort …» і «More actions for …»): **Work** · **Assignee** (Sort A to Z) · **Reporter** ·
**Priority** (Sort lowest to highest) · **Status** · **Resolution** · **Created** (Sort oldest to newest) ·
**Updated** · **Due date** · кнопка **Configure columns**
Рядки:
| Work | Assignee | Reporter | Priority | Status | Resolution | Created | Updated | Due date |
|---|---|---|---|---|---|---|---|---|
| `KAN-1` Task 1 | Unassigned | Користувач Jira | None | В работе | Unresolved | Sep 17, 2026, 5:52 PM | Sep 17, 2026, 5:52 PM | Sep 24, 2026 |
| `KAN-2` Task 2 | Unassigned | Користувач Jira | None | В работе | Unresolved | … | … | Oct 1, 2026 |
| `KAN-3` Subtask 2.1 | Unassigned | Користувач Jira | None | Готово | Unresolved | … | … | None |
Біля ключа — «Copy link». Унизу: **Create** (новий рядок) · «3 of 3» · **Refresh**.

## Для курсу
Стан `list` компонента: таблиця ключ · назва · статус · виконавець · дедлайн (j06). Список = та сама JQL, що й пошук (у URL видно `jql=`).
