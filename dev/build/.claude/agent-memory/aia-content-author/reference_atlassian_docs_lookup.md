---
name: reference-atlassian-docs-lookup
description: Як шукати живі докси Atlassian для курсу «Jira з нуля» — слаги масово 404-ять, робочий шлях через WebSearch з allowed_domains; перелік адрес, що працювали 2026-09-17
metadata:
  type: reference
---

Докси Atlassian для курсу 012 живуть на `support.atlassian.com/<product>/docs/<slug>/`, але
**слаги нестабільні**: за один сеанс авторингу `j03` (2026-09-17) три адреси віддали 404 —
`jira-software-cloud/docs/keyboard-shortcuts/`, `jira-software-cloud/docs/get-started-with-jira/`
і сам індекс `jira-software-cloud/docs/`.

**Робочий шлях, коли WebFetch дає 404:** `WebSearch` з
`allowed_domains: ["support.atlassian.com"]` і словами з теми — жива адреса знаходиться
першим-другим результатом. Не здаватись і не писати з памʼяті.

**Ще одна пастка адрес:** слаги досі тримають **старі** терміни, хоча сторінки вже про нові:
`…/docs/create-a-new-project/` описує **space**, `…/docs/create-edit-and-delete-team-managed-projects/`
теж про spaces, `…/docs/what-are-the-project-templates/` — про space templates. Шукати по
`project`, писати про `space`.

**Адреси, що працювали 2026-09-17** (перевіряти заново перед кожним уроком):
`jira-cloud-administration/docs/what-is-the-free-jira-cloud-plan/` ·
`jira-cloud-administration/docs/explore-jira-cloud-plans/` (робоча «сторінка планів»; маркетингові
`atlassian.com/software/*/pricing` віддають лише JS-оболонку) ·
`organization-administration/docs/get-started-with-an-atlassian-organization/` ·
`organization-administration/docs/can-i-change-the-url-used-to-access-a-product/` ·
`atlassian-account/docs/create-an-atlassian-account/` ·
`atlassian-account/docs/log-in-with-a-third-party-account/` ·
`atlassian-account/docs/manage-your-language-preferences/` ·
`jira-software-cloud/docs/` + `manage-your-jira-personal-settings/` · `navigate-to-your-work/` ·
`use-keyboard-shortcuts/` · `what-is-the-command-palette/` · `create-a-new-project/` ·
`create-edit-and-delete-team-managed-projects/` · `what-are-the-project-templates/` ·
`use-business-projects-for-task-management/` · `use-business-projects-for-project-management/` ·
`use-jira-cloud-on-apple-and-android-devices/`.

**Слаги, що працювали 2026-09-17/18 для теми «типи спейсів» (j09):**
`jira-software-cloud/docs/` → `what-are-team-managed-and-company-managed-projects/`
(канонічний `…-spaces/` теж 200) · `learn-the-basics-of-team-managed-projects/` ·
`migrate-between-team-managed-and-company-managed-projects/` · `next-gen-permissions/`
(заголовок — «Team-managed space permissions») · `manage-how-people-access-your-team-managed-project/` ·
`what-are-next-gen-project-settings/` (заголовок — «How do settings differ based on space type?») ·
`how-do-features-differ-based-on-project-type/` ·
`issue-types-how-do-team-managed-and-company-managed-projects-differ/` · `jql-fields/` ·
`create-a-new-project/` · `create-a-business-project/`;
`jira-cloud-administration/docs/` → `configure-a-space/` · `create-and-edit-a-project/` ·
`convert-a-project-to-a-different-template-or-type/` · `permissions-limitations-in-free-jira-sites/`.
**404 того ж дня:** `jira-software-cloud/docs/how-do-settings-differ-based-on-project-type/`
(жива адреса — `what-are-next-gen-project-settings/`).

**Заголовок сторінки і її слаг — різні епохи.** `next-gen-permissions` показує «Team-managed
space permissions»; `…-projects` показує «…spaces». Шукати по старому слову, цитувати новий
заголовок.

**Докси відстають від продукту.** `manage-your-jira-personal-settings/` не згадує полів `Theme`
і `Jira homepage`, хоча на живому екрані вони є (`00-research/screens/17-personal-settings.md`).
Тому знімки `screens/` не «гірше» за докси — на частину фактів вони єдине джерело.

**Найшвидший спосіб знайти живий слаг (j05, 2026-09-17/18): витягти індекс із хаба розділу.**
```
curl -sL https://support.atlassian.com/jira-software-cloud/docs/create-and-configure-your-work-items/ \
 | grep -o 'href="/jira-software-cloud/docs/[a-z0-9-]*/"' | sort -u
```
Один запит дає **645** живих адрес розділу — це надійніше за WebSearch і одразу показує,
що слаги тримають старі слова (`link-issues`, `clone-an-issue`, `transition-an-issue`,
`move-multiple-issues`), тоді як заголовки вже нові. Робочі хаби:
`…/docs/create-and-configure-your-work-items/` · `…/docs/work-on-and-progress-your-issues/`.
Прямі здогадки типу `create-work-items/` дають 404 — жива адреса
`create-a-work-item-and-a-subtask/`.

**Окремий продукт для ділових спейсів: `support.atlassian.com/jira-core-cloud/docs/…`**
(наприклад `boards-in-the-new-jira-experience/` — «Work with boards in business spaces»).
Для тем, де важливий business-, а не software-спейс, цей розділ точніший за
`jira-software-cloud`.

**Слаги, що працювали 2026-09-17/18 для теми «вести роботу» (j05):**
`jira-software-cloud/docs/` → `create-a-work-item-and-a-subtask/` ·
`watch-share-and-comment-on-a-work-item/` · `markdown-and-keyboard-shortcuts/` ·
`add-files-images-and-other-content-to-describe-an-issue/` · `link-issues/` ·
`clone-an-issue/` · `transition-an-issue/` · `move-multiple-issues/` ·
`delete-multiple-issues/` · `add-an-attachment-to-an-issue/` ·
`customize-notifications-in-team-managed-projects/` · `manage-subtasks-in-team-managed-projects/` ·
`who-does-the-automatic-assignee-option-assign-an-issue-to/` · `what-is-the-for-you-page/` ·
`what-are-the-different-types-of-activity-on-an-issue/` ·
`edit-the-assignee-of-an-issue-with-your-keyboard/`;
`jira/kb/restore-deleted-work-items-in-jira-cloud-using-local-backup-files/` ·
`automation/kb/how-to-store-the-old-issue-key-when-an-issue-is-moved-from-one-project-to/`.

⚠ **Частина KB-сторінок згенерована моделлю:** внизу
`migration/kb/migration-of-jiras-historical-keys-for-issues-and-projects/` стоїть
«The content of this article has been generated by AI». Такі сторінки цитувати можна,
але позначати у звіті й шукати друге джерело.



**Окремий продукт для автоматизації: `support.atlassian.com/cloud-automation/docs/…`** (j14, 2026-09-18).
Хаб `…/cloud-automation/resources/` віддає **136 живих слагів** одним `grep -o 'href="/cloud-automation/docs/[a-z0-9-]*/"'`.
⚠ Тут слаг і заголовок розходяться **системно й у зворотний бік**: адреси тримають старе слово
(`what-are-automation-rules`, `what-is-a-rule-actor`, `create-and-edit-jira-automation-rules`,
`components-in-jira-automation`), а тіла сторінок уже всюди кажуть **flow**
(«Use automation steps in a flow», «What is a flow actor?», «Steps in Jira automation»).
Шукати по `rule`, цитувати `flow`. Хвиля не дійшла до `jira-automation-conditions` і
`limitations-in-team-managed-projects-for-automation-rules` — там досі «issue»/«project».

Пов'язане: [[atlassian-docs-fetch]] · [[jira-course-facts-drift]]
