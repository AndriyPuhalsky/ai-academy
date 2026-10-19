# Екран: домашня сторінка «For you»

- **Шлях:** `/jira/for-you?tab=recommendedActions (і /jira/your-work → редірект сюди)` (домен sandbox свідомо не вказаний — адреса в `dev/jira-course-plan.local.md`)
- **Знято:** 2026-09-17, Jira Cloud Free, team-managed software space `KAN` («Моя команда»), UI English,
  акаунт з мовою «українська (Україна)», тема Dark. Знято кореневою сесією через Claude in Chrome
  (тільки читання). Написи — дослівно з екрана (EN), пояснення українською в дужках.
- **Пастка знімка:** статуси в цьому спейсі створились **російською** («К выполнению», «В работе»,
  «Готово»), бо мова акаунта на момент створення спейсу була російською; UI при цьому англійський.
  У курсі показувати англійські To Do / In Progress / Done — так їх дає шаблон, коли акаунт English.

## Верхня панель (top bar) — однакова на всіх сторінках
Зліва направо: кнопка згортання бічної панелі · іконка «app switcher» (сітка 3×3) · логотип **Jira** (лінк
«Go to your Jira homepage», `/jira`) · поле **Search** («Search, press enter to navigate to advanced search
with your text query») · синя кнопка **+ Create** · кнопка **See plans** (апсел, є лише на Free) ·
дзвіночок (сповіщення) · знак питання (довідка) · шестірня (налаштування) · аватар профілю.

## Головна область
- Заголовок: **Welcome Дональд. It's Thursday, Sep 17.** / підзаголовок **Let's find your work in Jira**
- Блок **Find a space** + лінк **View all spaces**; поле «Find spaces by searching for teammates, teams, or space names»;
  плитка спейсу: іконка · **Моя команда** · **Software space**
- Блок **For you** із вкладками: **Recommended** · **Assigned to me** (лічильник `0`) · **Starred** · **Worked on** · **Viewed**
- Картка **Get your team set up for success** з чотирма пунктами й кнопками:
  **Create tasks** — «Turn ideas into trackable work and keep things moving» — кнопка **Create**;
  **Import existing work** — «Bring in tasks from CSV or tools like Asana, Monday.com, and more» — **Import**;
  **Invite your team** — «Add teammates so you can plan and collaborate together» — **Invite**;
  **Connect your tools** — «Connect Slack, Microsoft Teams, Google Workspace, and more» — **Connect**
- Апсел-картка **Revitalize your roadmap** (Jira Product Discovery) — **Try it** / **Dismiss**
- Внизу лінк **Give us feedback**

## Для курсу
Це перший екран після входу (j03). «For you» — домашня за замовчуванням (перемикається в Personal settings → Jira homepage).
