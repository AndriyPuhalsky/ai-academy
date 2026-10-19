---
name: jira-integrations-docs
description: Де в доксах Atlassian лежать інтеграції Jira (пошта, Slack, Teams, Google, Confluence/Docs, база знань JSM) і три пастки звірки цитат
metadata:
  type: reference
---

Карта живих слагів, знята 2026-09-18 під час авторингу j16 (усі віддали 200 через
`curl -sL` + `<main>`). Дивись сюди, перш ніж шукати заново.

**Пошта.** `jira-software-cloud/docs/manage-your-jira-personal-settings/` — особисті
сповіщення + розділ **«Filter emails in your inbox»** (поле `From` змінне: імʼя діяча або
слово Jira; «The sender's email will always be `jira@<yourinstance>.atlassian.net`») +
перелік листів, які галочками **не** керуються (про сайт, підписка на фільтр, акаунт
Atlassian) · `jira-cloud-administration/docs/configure-email-notifications/` (право
`Administer Jira`, адреса відправника спейсу) · `…/create-issues-and-comments-from-email/`
(mail handler; докси самі радять JSM замість нього).

**Чати.** `jira-software-cloud/docs/use-jira-cloud-for-slack/` ·
`…/get-jira-notifications-in-slack/` (розділ «Turn off email notifications» — довідка сама
радить вимкнути пошту після підключення чату) · `…/integrate-jira-cloud-and-microsoft-teams/`
· `…/get-jira-notifications-in-microsoft-teams/`. Застосунки ставлять із магазину **самого
чату**, а з боку Jira інтеграцію вмикає адміністратор сайту.

**Google.** `jira-cloud-administration/docs/integrate-your-google-account-with-atlassian/`
(вхід, Smart Links на Google Drive). **Підписки календаря спейсу на Google Calendar у доксах
немає** — є лише календар змін JSM; не обіцяти.

**Confluence.** `jira-software-cloud/docs/enable-and-disable-pages/` = **«Set up Docs in
Jira»** (вкладка `Docs`, один простір на спейс, `Manage connection`, перейменування
`Pages → Docs` при адресі `/pages`) · `confluence-cloud/docs/insert-the-jira-issues-macro/`
= **«Display Jira work items in a list»** (`/jira` у редакторі) ·
`jira-software-cloud/docs/share-jira-dashboards-in-confluence/` (**не** `confluence-cloud/…`
— той слаг 404) · `jira-service-management-cloud/docs/add-confluence-to-set-up-knowledge-base/`
(«at a minimum, you'll need to have a Free plan of Confluence on the same site»).

**Why:** ці сторінки розкидані по чотирьох продуктах, а частина слагів не збігається з
очікуваним продуктом — пошук наосліп коштує десятки хвилин.

**How to apply:** беручи інтеграційну тему (j16, j17, j18–j19, довідники), спершу бери
адресу звідси й перевіряй її `curl`-ом; заголовок статті звіряй у `<main>`, бо він часто
не збігається зі слагом.

**Три пастки звірки цитат** (доповнення до [[atlassian-docs-fetch]]):
1. **`&#x27;` не декодується** сама — перед `in`-порівнянням заміняй її і `’` на `'`,
   інакше кожна цитата з апострофом дає хибний MISS.
2. Зняття тегів робить `in- app` з `in-app` і `Jira , if` з `Jira, if` — нормалізуй пробіли
   перед комою й крапкою.
3. Подвійні лапки в доксах — типографські (`“Docs”`); у наш HTML їх можна класти дослівно
   (чекер забороняє лише апострофи U+02BC/U+2019/U+2018).
