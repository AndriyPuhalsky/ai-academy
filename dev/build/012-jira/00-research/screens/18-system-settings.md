# Екран: System settings → General configuration (адмін сайту)

- **Шлях:** `/jira/settings/system/general-configuration` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## Шапка
Банер: «As we roll out 'work' as the new term for items tracked in Jira, you may still see 'issue' in some areas. Read about this terminology change»
**System settings** · поле «Search Jira admin» · кнопки **Advanced Settings** · **Edit Settings**

## General Settings
**Title** Jira · **Email from** `${fullname} (Jira)` · **Introduction** (порожньо)

## Internationalization
**Indexing language** English - Aggressive Stemming · **Installed languages** — 32 мови, серед них «українська (Україна)» (назви показані українською,
бо мова акаунта українська; сам Jira UI лишається англійським) · **Default language** англійська (Сполучені Штати) ·
**Default user time zone** (GMT+02:00) Kiev · **Maintenance window time zone** (GMT+02:00) Kiev

## Options (дослівні назви перемикачів і значення)
Simple create as default — on · Allow users to vote on work items — on · Hide unused fields — on · Allow users to watch work items — on ·
**Allow users to share dashboards and filters with the public — off** · Maximum space name size — 80 · Maximum space key size — 10 ·
Allow unassigned work items — on · Logout confirmation — Never · User email visibility — Only · Comment visibility — Space roles only ·
Smart replies — on · Suggest teammates to mention in comments — on · Exclude email header: {header} — off · Work item Picker Auto-complete — on ·
JQL Auto-complete — on · Contact Administrators Form — off · Allow Gravatars — on · Auto-update search results — on · Allow people to request space access — on

## Для курсу
j20: що взагалі є в адмінці сайту; «share with the public — off» пояснює, чому фільтр не можна показати стороннім за замовчуванням.
