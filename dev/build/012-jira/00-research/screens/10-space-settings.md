# Екран: налаштування спейсу: рейка й чотири сторінки

- **Шлях:** `/jira/software/projects/KAN/settings/… (team-managed)` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## Рейка «Space settings» (ліворуч; звірено через дерево доступності)
**Details** · **Access** · **Notifications** (розкривна група) · **Automation** · **Fields** · **Work types** (розкривна група) ·
**Features** · **Custom filters** · **Apps** (розкривна група)

## Details (`/settings/details`)
«Change icon» · «Required fields are marked with an asterisk *» · поле **Name*** · поле **Space key** («More about space keys») ·
**Category** («Choose a category») · **Space owner** (Користувач Jira; «Make sure your space lead has access to work items in the space.») ·
**Default assignee** (Unassigned) · кнопка **Save**

## Access (`/settings/access`)
Кнопки **Add people** · **Open access** · **Settings**; текст «This space has 1 role»; вкладки **Current users** · **Access requests** (0);
таблиця **Roles**: Name · Email · Role · Action → «Користувач Jira · (email приховано) · **Administrator** · Remove»; «1 user or group matches your search.»

## Features (`/settings/features`)
Група **Planning**: перемикач **Sprints** («Complete work in fixed units of time. Requires a backlog.») ·
**Estimation** («Capture expected efforts to plan, track and analyze work. Impacts reports and insights.»)
Група **More items**: **Standups in Jira** («Run your team's standups in Jira with a time-boxed discussion and quick filters on the board…»)

## Fields (`/settings/fields`)
Кнопка **Add field** («Add a global field to the table below to use it on work items in this space.») · поле **Search fields** · **Field category**
Таблиця Name · Field type · Description · Field ID · Actions:
Agent Sessions (Locked, `customfield_10026`) · Assignee (`assignee`) · Description · Due date (`duedate`) · Environment · Labels ·
Original estimate (`timeoriginalestimate`) · Parent · Priority · Reporter · Start date (Locked, Date Picker, `customfield_10015`) ·
Summary · Team (Locked, `customfield_10001`) · Time tracking (`timetracking`)

## Для курсу
Стан `settings` компонента: рейка розділів + одна активна сторінка (j09, j11, j20). На Free роль у team-managed спейсі — «Administrator»
(перевірити в доксах, чи є Member/Viewer і що вони значать на Free).
