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

**Докси відстають від продукту.** `manage-your-jira-personal-settings/` не згадує полів `Theme`
і `Jira homepage`, хоча на живому екрані вони є (`00-research/screens/17-personal-settings.md`).
Тому знімки `screens/` не «гірше» за докси — на частину фактів вони єдине джерело.

Пов'язане: [[atlassian-docs-fetch]] · [[jira-course-facts-drift]]
