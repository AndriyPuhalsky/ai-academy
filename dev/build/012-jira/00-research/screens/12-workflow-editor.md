# Екран: редактор workflow (team-managed) — canvas

- **Шлях:** `/jira/software/projects/KAN/settings/issuetypes/10003/workflow` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## Шапка редактора
«**Workflow for** [іконки типів: Subtask · Task · Epic] / **Моя команда**» · кнопки **Add status** · **Add Transition** · **Add Rule** · **Add agent** ·
праворуч **Update workflow** (неактивна, поки нема змін) · **Close**

## Полотно
Перемикач **Diagram** / **Text** · чекбокс **Show transition labels** · знак питання · панель «Side panel»
Схема: **START** → **К ВЫПОЛНЕНИЮ** (сірий) → **В РАБОТЕ** (синій) → **ГОТОВО** (зелений); над кожним статусом бульбашка **Any** (перехід «з будь-якого статусу»)
Внизу праворуч — мінімапа («Workflow viewfinder»), **Zoom out** · повзунок «Zoom level» · **Zoom in**

## Права панель
**Power up your team with the right workflow** — «Before you map your workflow with your team, spend some time on what's effective, what's not…»
Лінки: **Follow our guide to mapping a workflow with your team** (`support.atlassian.com/jira-software-cloud/docs/map-a-workflow-with-your-team/`) ·
**See how a Jira Hero mapped their team's workflow** (community) · **Learn how to manage workflows here in Jira**

## Для курсу
j10: три категорії статусів кодуються кольором (сірий / синій / зелений) **і** позицією; переходи «Any» = з будь-якого статусу.
«Add Rule» — правила переходу (j10), «Add agent» — Rovo (на Free не описувати як доступне без перевірки).
