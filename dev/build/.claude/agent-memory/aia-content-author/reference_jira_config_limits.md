---
name: jira-config-limits-pages
description: Числа налаштувань спейсу Jira (100/50 статусів, 200 переходів, 30 типів, 50 полів, 55 варіантів, 10 дошок, 5000 робіт) лежать у чотирьох різних сторінках team-managed і НЕ залежать від плану; плюс де взяти 200 у листі підписки, 60 днів кошика, 1 ГБ файла
metadata:
  type: reference
---

Питання «скільки статусів / полів / типів дозволяє Jira» приходить з уроків 6, 10, 11, 13, а
відповіді розкидані по окремих сторінках `jira-software-cloud/docs/…`. Усі звірені наживо
**2026-09-30**; **від плану ці межі не залежать** — залежать від типу спейсу (team-managed).

| Число | Дослівно | Слаг сторінки |
| --- | --- | --- |
| 100 статусів на спейс / 50 на процес | «You can add up to 100 statuses across all of your space's workflows, and up to 50 statuses in any one workflow» | `create-edit-and-delete-statuses-in-team-managed-projects` |
| 200 переходів | «You can add up to 200 transitions to your workflow» | `create-edit-and-delete-transitions-in-team-managed-projects` |
| 30 типів роботи | «You can add up to 30 work types» (двічі: для готових і для власних) | `set-up-issue-types-in-team-managed-projects` |
| 50 власних полів | «You can create up to 50 custom fields in a team-managed space» | `customize-an-issues-fields-in-team-managed-projects` і `available-custom-fields-for-team-managed-projects` |
| 55 варіантів списку / галочок | «You can add up to 55 options to a dropdown field» | `available-custom-fields-for-team-managed-projects` |
| 32 767 знаків у абзаці | «You can add up to 32,767 characters into a paragraph field» | там само |
| 10 дошок у спейсі | «you can create up to 10 different board views in a space» | `what-are-boards` → редірект `what-is-a-board-in-business-projects` |
| 5 000 робіт | «your board, backlog, sprint section, and timeline can each only show up to 5,000 work items at a time» | `issue-limits-in-team-managed-projects` |
| 1 000 у масовій зміні | «You can edit fields in up to 1,000 work items at the same time» | `edit-multiple-issues` |
| 200 у листі підписки | «only the first 200 results of a filter are sent» | `manage-filters` |
| 60 днів кошик дашборда | «Dashboards in the trash can be restored within 60 days» | `jira-cloud-administration/docs/manage-shared-dashboards` |
| 1 ГБ на файл, 2 ГБ сховища, 150 вкладень → список | «By default, the maximum size of any one file is 1GB…»; «The Free plans … have a file storage limit of 2 GB per app»; «Once a work item has over 150 attachments, they'll display as a list» | `add-an-attachment-to-an-issue` |
| 3 обов'язкові поля → компактна форма | «Up to 3 required fields appear as chips below the description»; «The full form opens automatically when your space configuration requires it, **for example** if your space has more than three required fields, uses custom tabs, custom create screens, Forge UI app modifications, or a complex field type» | `create-a-work-item-and-a-subtask` |

⚠ **Остання цитата — перелік причин, а не одна умова.** «Більш як три обов'язкові поля» там
лише перший приклад; писати «саме через це» без слова «зокрема» — категоричність без опори.

⚠ **Довідка про новий статус відстала від екрана:** «By default, new statuses allow work items
in any other status to move into them» — а в діалозі `Add status` прапорець «Allow transitions
from any status» стоїть **вимкненим** (екран 28.09.2026).

**Why:** ці числа обіцяні уроками довіднику-карті, а шукати їх щоразу по чотирьох сторінках
дорого; плюс половина з них раніше жила лише в `cross-findings` без цитати.

**How to apply:** беручи будь-яке з них, ставити цитату + слаг + дату й **не** підписувати
словами «на безкоштовному плані»: це межі продукту, а не плану.
Пов'язане: [[reference-jira-plan-limits-sources]], [[atlassian-page-titles-vs-slugs]],
[[reference-jira-space-templates]].
