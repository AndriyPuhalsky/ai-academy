# Екран: пошук «All work» з JQL і помилкою

- **Шлях:** `/jira/issues/?jql=project%20%3D%20KAN%20AND%20status%20!%3D%20Done%20ORDER%20BY%20created%20DESC` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## Що на екрані
Заголовок **All work** · праворуч **Search all apps** (перемикач із іконками Jira/Confluence) · **Apps** · **Share** · ⋯
Рядок пошуку: **Ask AI** · перемикач **Basic** / **JQL** (активний JQL) · поле з запитом `project = KAN AND status != Done ORDER BY created DESC` ·
іконки **Editor** · **Syntax help** («Open JQL syntax help in a new tab») · кнопка **Search**
Праворуч: **Clear filters** · **Save filter**
Спливашка-онбординг «**Switch to search beyond Jira** — Looking for more? Switch to find results and answers from all your Atlassian and connected apps.» **Got it**

## Помилка JQL (червона рамка)
**JQL error** «The value 'Done' does not exist for the field 'status'.» · кнопка **Fix error**
Причина: статуси в цьому спейсі названі російською («Готово»), тож `status != Done` не знаходить значення.

## Результати (таблиця як у List): KAN-3 Subtask 2.1 · KAN-2 Task 2 · KAN-1 Task 1 — «3 of 3», **Refresh**

## Для курсу
j07: (1) один і той самий запит живе в URL — його можна скопіювати; (2) **граблі**: назва статусу — рядок, залежний від мови й спейсу;
надійніше `statusCategory != Done`; (3) Basic ↔ JQL перемикач для новачка; (4) Save filter — вхід у збережені фільтри.
