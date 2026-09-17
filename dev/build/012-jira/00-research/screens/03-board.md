# Екран: дошка спейсу (шаблон Kanban)

- **Шлях:** `/jira/software/projects/KAN/boards/1` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## Шапка спейсу (над виглядами)
Хлібні крихти **Spaces** → назва **Моя команда** з іконкою · кнопка «Link contributing teams» · ⋯ («More actions»)
Праворуч: іконки **Share** · **Automation** (⚡) · **Give feedback** · **Enter full screen**

## Рядок виглядів спейсу (space navigation)
**Summary** · **List** · **Board** (активний) · **Docs** · **Development** · **+** («Add to navigation», див. `08-add-view-menu.md`)
У кожного вигляду є «More actions».

## Панель дошки
Поле **Search board** · аватари виконавців («Filter by assignee») · **Filter** · **Group** ·
праворуч **Board insights** · **View settings** · «More board view actions»

## Колонки (статуси; тут російські назви — див. пастку в шапці)
| Колонка | Лічильник | Що всередині |
|---|---|---|
| **К выполнению** (= To Do) | 0 | кнопка **+ Create** |
| **В работе** (= In Progress) | 2 | картки `KAN-1`, `KAN-2`, під ними **+ Create** |
| **Готово** (= Done) | 0 | **+ Create** |
Праворуч від колонок — кнопка **+** (додати колонку). У кожної колонки: «Edit … status column», «Collapse …», «More actions for column …».

## Картка на дошці
**Task 1** (заголовок) · **Due date** `Sep 24, 2026` · іконка типу (галочка = Task) + ключ **KAN-1** · праворуч кружечок **Assignee: None**.
Дії: «Edit summary for KAN-1 Task 1», «Card actions on Task KAN-1 of the В работе column», «Create work item after work item KAN-1».

## Для курсу
Стан `board` компонента «вікно»: 3 колонки, картка = назва · дедлайн · тип+ключ · аватар. Мітки для j05: Create, Filter, Group, колонка, картка, ⚡.
