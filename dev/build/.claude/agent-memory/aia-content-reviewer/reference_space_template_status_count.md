---
name: reference-space-template-status-count
description: Шаблон бізнес-спейсу Jira вирішує, скільки статусів побачить учень — 2 чи 3; перевіряти будь-який крок «Зроби сам», що перейменовує статуси
metadata:
  type: reference
---

Живі докси Atlassian (перевірено 2026-09-18, `curl -sL`):

- `…/jira-software-cloud/docs/use-business-projects-for-task-management/` — «The task management
  template sets you up with the most basic workflow… **There are two steps in the workflow: To Do and
  Done.**»
- `…/jira-software-cloud/docs/use-business-projects-for-project-management/` — «**The workflow has
  three steps: To do, In Progress, and Done.**»

**Як застосовувати:** щоразу, коли урок у блоці «Зроби сам» велить створити спейс із шаблону, а далі
перейменовує або рахує статуси, звіряти кількість. У `j10` крок 1 вів до шаблону обліку задач (2
статуси), а крок 3 перейменовував три — учень застряг би на `In Progress`. Формулювання-еталон уже є
в `modules/jira-09.html`: «знайди шаблон для керування проєктом — той, що дає три кроки роботи: To Do,
In Progress, Done». Назви шаблонів в уроках не називають (правило програми), тому шаблон описують
кількістю кроків.

Те саме вже лежало в `cross-findings.md` (рецензент j01 → j03, j09, j10) і в `reports/j03.md` —
розбіжність програми з доксами по шаблону `MY`. Див. [[reference-lesson-fact-sources]].
