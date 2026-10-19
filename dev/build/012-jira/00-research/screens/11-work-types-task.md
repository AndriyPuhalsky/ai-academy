# Екран: тип роботи Task — конфігурація полів

- **Шлях:** `/jira/software/projects/KAN/settings/issuetypes/10003` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## Що на екрані
Заголовок **Task** · кнопка **Edit workflow** · опис «Tasks track small, distinct pieces of work.»
- **Description fields**: **Summary** (Required) · **Description**
- **Context fields** (кожне — «More actions», «Open field configuration»): **Status** · **Assignee** · **Parent** · **Priority** · **Labels** ·
  **Due date** · **Team** · **Start date**; секція **Hide when empty**: **Reporter**
- Кнопки **Discard** · **Save changes**
- Права панель **Fields**: «Search fields in this space» · **Other fields**: Agent Sessions · **System fields**: Environment · Original estimate · Time tracking ·
  кнопка **Create a field** · «Need to add a global field? Go to the Fields page»

## Для курсу
j11: поля додаються перетягуванням у Context fields; обовʼязковість — у конфігурації поля. У URL тип роботи досі `issuetypes/10003`.
