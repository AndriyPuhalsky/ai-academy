# Екран: глобальна автоматизація: шаблони, банер білінгу, Usage

- **Шлях:** `/jira/settings/automation#/tab/rule-library (Templates) і #/tab/usage (Usage)` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## Банер (на всіх вкладках)
**Start planning for changes to Automation usage and billing** — «Starting at your next renewal on or after December 3, 2026, Automation flow runs
will count toward allocations for Rovo credits and Automation steps. You'll be able to monitor usage by flow and identify which ones use AI-powered steps.
By default, flows will continue to run if the monthly allocation is exceeded, and overage charges will apply.» **View usage** · **About usage limits** · **Dismiss**

## Вкладка Templates («Automate any task or process with a few clicks»)
Категорії: **Rovo AI Agents** · **Loom** · **Strategy** · **Service Management** · **Manage completed tasks** · **Organize tasks** · **Issue transitioning** ·
**Productivity** · **Release management** · **Developer tools** · **Design**
Приклади шаблонів, корисних курсу (дослівно): «When all sub-tasks are done → move parent to done» · «When parent is done → move all sub-tasks to done» ·
«When a task is near due → send email reminder» · «Schedule a recurring ticket» · «When a bug is created → add someone as a watcher» ·
«When an issue remains for 5 days without an update → send a notification to the Assignee» · «When issue summary is updated → Add labels based on hashtags» ·
«Clone issue to another project» · «Create issue in another project» · «Close duplicate issues» · «Remove a label from all issues».
(Зверни увагу: у назвах шаблонів досі «issue», «project», «ticket» — термінологія не вирівняна.)
Лінк «See example templates in the Jira automation library».

## Вкладка Usage
Перемикач **Current usage model** / **Upcoming usage model** · «Last updated: Sep 17, 2026 at 6:11:38 PM» · **Upgrade subscriptions** ·
**Date range**: Current month (September) · текст «Changes to Automation usage and billing will apply to your next renewal after December 3, 2026.
Any Automation step or Rovo credit usage shown are estimates provided for planning purposes only.» · **When and how will I be billed?**
Плитки: **Automation step usage** — 0 steps (Estimate; Jira 0 · Other apps 0) · **Rovo credit usage in Automation** — 0 credits
Таблиця **High usage flows**: Flow · Flow runs · Automation steps · Rovo credits · Scope · Owner · Enabled — «Flows have not run in Jira during the selected time frame…»

## Для курсу
Довідник 3 (ліміти): шлях **Automation → Usage** існує і на рівні спейсу, і глобально; модель — **steps** (+ Rovo credits), білінг за перевитрату з **2026-12-03**. В уроках чисел не називати.
