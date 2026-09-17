# Екран: особисті налаштування

- **Шлях:** `/jira/settings/personal/general і /jira/settings/personal/notifications` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## General
- **Your timezone** Europe/Kiev — «Configure your timezone settings in your profile settings page»
- **Language** **українська (Україна)** — «Configure your language settings in your profile settings page».
  **Факт для курсу:** мова акаунта — українська, а весь Jira UI при цьому англійський → української локалізації Jira немає.
- **Watch work items automatically** — Use global settings («Choose to automatically watch work items you interact with.»)
- **Jira homepage** — For you
- **Theme** — **Light** · **Dark** · **Match browser**
- **Jira labs**: «New work transition experience» · «Quick search smart queries» · «Store data on your own device» (перенесено в App settings) · «Smart replies in work item comments»
- **Connected apps** — Manage apps

## Emails and notifications
«Control when you receive email or in-app notifications from Jira.» · **More about managing notifications**
- **Email preferences** — «Send me emails for work item activity»; **Receive emails when:** You're the assignee · You're the reporter · You make changes to work items;
  **Group notification emails together** — Every 3 minutes; **Email format** HTML / Text
- **Customize space notifications** — **Add space notifications** («Choose a space to get started»)
- **Default notifications** (колонки **In product** / **Email**):
  **Notifications for all work items**: You're assigned to a work item · You're mentioned on a work item;
  **Notifications for relevant work items**: Changes to work items · Changes to comments on work items · A work log is created, edited, or deleted ·
  Other work item events (including a change to a work item's status);
  **All space notifications**: Space access requests

## Для курсу
j03 (тема, домашня, мова), j05 (сповіщення: assignee / mention / watch; групування листів). Стан `settings` компонента у «особистому» варіанті.
