---
name: jira-space-templates
description: Шаблони спейсів Jira Cloud — що вони насправді приносять (конфігурацію, не роботи), де докси мовчать (sample data) і які переліки в ділових спейсах закриті (Group by без епіка); перевірено 2026-09-18 на j12
metadata:
  type: reference
---

**Шаблон спейсу приносить КОНФІГУРАЦІЮ, а не роботу.** Найпряміший доказ — сторінка
`jira-software-cloud/docs/custom-project-templates/`: серед того, що **не** копіюється,
прямо названі «Work items from the source space». Тому теза «шаблон створює приклади
карток, їх треба прибрати» **джерела в доксах Jira не має**. Приклади з даними
документовані лише для сусідніх продуктів: JSM — «The sample space is an IT service
management template project that is filled with realistic example data»
(`jira-service-management-cloud/docs/test-explore-and-learn-with-your-sample-space/`);
JPD — «templates come with sample ideas».

**Why:** картка `j12` у `program.md` просила тему «sample data»; автор, який повірить
картці, напише в урок факт, якого немає.
**How to apply:** писати «шаблон приносить типи роботи, процес і вигляди»; про приклади —
або мовчати, або віддавати JSM (урок 18) із цитатою. Закривається одним кліком у sandbox.

**Три факти майстра, які варто знати наперед** (`create-a-new-project/`,
`create-a-business-project/`, 2026-09-18):
- «**Jira will remember your template choice and use it as the default the next time you
  create a space**» — другий спейс мовчки народжується з попереднього шаблону;
- ключ **генерує Jira** («Jira will generate a space key when you create the space»),
  правиться потім у `Space settings → Details`; чи є поле ключа в самому майстрі — докси
  не кажуть;
- «Space names are unique in Jira… Avoid using confidential or sensitive terms in your
  space's name» (радять codename).
Зміна **шаблону** після створення = той самий переїзд, що й зміна типу:
«Bulk move your current space's work items into your new space, **effectively changing its
template**» (`jira-cloud-administration/docs/convert-a-project-to-a-different-template-or-type/`).

**Ділові (business) спейси мають свої переліки, і вони закриті:**
- групування дошки — «Priority, Category, Assignee, Agent» (`work-with-boards-in-business-projects/`),
  **епіка/батька в переліку немає** — картка j12 просила «Group by Epic», факту не існує;
- окреме вбудоване поле **`Category`** зі своїми значеннями
  (`categorize-work-items-in-the-list-view/`), «Only one category can be added to a work
  item» — плутається з категорією статусу, розводити явно;
- **другий вид фільтра** — фільтр вигляду (`Filter → Save filter`): «Your saved filters are
  specific to the space you create them in», «you can only apply one at a time»
  (`save-your-filters-in-business-projects/`), це не збережений JQL-фільтр із j07;
- новий статус створюється **колонкою на дошці**: «Creating a new column on the Board will
  create an associated status… in the status category you select», за двох умов — групування
  за статусом і один процес у спейсі
  (`add-rename-or-delete-a-column-in-team-managed-business-projects/`).

**Пастка порад для «своєї сфери»:** сторінки `use-business-projects-for-<сфера>/` (marketing,
hr, finance, task-management, project-management, sales, operations, legal, process-management)
— найкраще джерело «що робити в цій сфері», але **частина порад там про company-managed**:
фінансова радить «Use components to track by department», хоча «Jira components are only
available in company-managed spaces» (`what-are-jira-components/`). Перед перенесенням поради
звіряти тип спейсу.

Пов'язане: [[reference-atlassian-docs-contradict]] · [[atlassian-docs-fetch]] ·
[[jira-course-facts-drift]]
