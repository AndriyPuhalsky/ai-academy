# Глосарій EN → UA (сід для довідника 3 і легенд вікон)

Правило курсу: **англійський UI, українське пояснення**; при першій згадці в курсі — «поточний
термін (колишній)». У JQL, smart values, URL і API живуть колишні слова (`project`, `issue`,
`issuetype`) — це не помилка, а факт, який учень має знати.

| EN (поточне, колишнє) | UA (як говоримо в курсі) | Де живе старе слово |
| --- | --- | --- |
| site | сайт (`<назва>.atlassian.net`) | — |
| space (project) | спейс (проєкт) — контейнер роботи одного відділу чи справи | JQL `project =`, URL `/projects/` |
| work item (issue) | робота, елемент роботи (задача) | JQL `issue`, URL `/browse/`, `/jira/issues/` |
| work type (issue type): Epic, Task, Subtask, Story, Bug | тип роботи: епік, задача, підзадача, історія, дефект | JQL `issuetype =`, URL `/issuetypes/` |
| key | ключ (`REM-2`) | — |
| summary / description | назва / опис | JQL `summary ~` |
| status · status category (To Do / In Progress / Done) | статус · категорія статусу (зробити / у роботі / зроблено) | JQL `status`, `statusCategory` |
| workflow · transition | робочий процес · перехід | — |
| assignee · reporter · watcher | виконавець · автор · спостерігач | JQL `assignee`, `reporter`, `watcher` |
| priority · label · component · due date · start date · parent | пріоритет · мітка · компонент (лише company-managed) · дедлайн · дата початку · батько | JQL `priority`, `labels`, `due`, `parent` |
| comment · attachment · link · @mention | коментар · вкладення · зв'язок · згадка | — |
| board · column · swimlane · backlog · sprint · WIP limit (column limit) | дошка · колонка · доріжка · беклог · спринт · ліміт колонки | JQL `sprint`, `openSprints()` |
| views: List · Calendar · Timeline · Summary · Forms · Goals · Docs (Pages) | вигляди: список · календар · таймлайн · огляд · форми · цілі · документи | URL `/list`, `/pages` |
| filter · saved filter · JQL (Jira Query Language) | фільтр · збережений фільтр · мова запитів Jira | — |
| dashboard · gadget | дашборд · гаджет | — |
| **flow (automation rule)** · trigger · condition · action · branch · smart value · audit log · usage | **flow (правило автоматизації)** · тригер · умова · дія · гілка · розумне значення · журнал виконань · використання | докси: «rule»; smart values `{{issue.key}}` |
| team-managed · company-managed | керований командою · керований компанією | URL `/software/projects/` для обох |
| site admin · organization admin · group · permission · role (Administrator / Member / Viewer) | адміністратор сайту · адміністратор організації · група · дозвіл · роль | — |
| Jira Service Management (JSM): request type · queue · SLA · portal (help center) · agent · customer · knowledge base | тип запиту · черга · угода про рівень сервісу · портал (центр допомоги) · агент · клієнт · база знань | JQL `"Request Type"` |
| Marketplace app | застосунок з Marketplace | — |
| notification · Personal settings · Notification settings | сповіщення · особисті налаштування · налаштування сповіщень | — |
| Confluence: space · page · macro | Confluence: простір · сторінка · макрос («Display Jira work items in a list», `/jira`) | — |
| Rovo · Ask AI · Rovo MCP Server | AI-шар Atlassian (на Free — лише апсел у UI) · MCP-сервер Atlassian (на Free є) | — |
