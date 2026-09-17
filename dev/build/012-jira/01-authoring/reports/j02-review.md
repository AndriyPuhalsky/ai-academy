# Рецензія · `j02` «Безкоштовний план чесно»

**Зроблено 2026-09-17** агентом `aia-content-reviewer`. Файл: `/Users/ander1.sage/Downloads/AIA/modules/jira-02.html`
(49,1 KB тексту сторінки за чекером, 72 660 байтів на диску). Правлено рівно цей файл; `program.md`, контракт,
`cross-findings.md`, `facts-free-plan.md`, конфіг, інші уроки, `css/`, `js/` — лише читання.
Git не виконувався.

---

## 1. Вердикт

**Готово з зауваженнями.** Фактура уроку витримала звірку з живими таблицями планів рядок за
рядком (`curl` + розбір `<td>`, 2026-09-17): усі вісім рядків «є», усі десять «немає», усі дев'ять
«обмежене», обидва числа-винятки (10 користувачів, 3 агенти) і всі сім англійських цитат
підтверджені дослівно. Шість тверджень я виправив сам, показавши джерело (найважливіше — легенда
`+ Create` і адресати листа про неактивність). Лишились чотири речі, які без живого sandbox або
платного сайту не закриваються, і одна пропущена тема з картки.

---

## 2. Непідтверджені факти

**U-1. Напис `Team-managed business` у вікні `w1`.**
Цитата з уроку: `<td>Team-managed business</td>`, заголовок вікна — «Jira Cloud · список спейсів і
верхня панель · **звірено 2026-09-17**».
`screens/02-spaces-list.md` містить лише `Team-managed software` (у sandbox один спейс, і він
software). Живі докси
(`support.atlassian.com/jira-software-cloud/docs/what-are-team-managed-and-company-managed-projects/`,
читано 2026-09-17) дають форми «Team-managed» / «Company-managed» без слова business.
Автор це чесно позначив у своєму звіті (§3), але **читач бачив протилежне**: виноска під вікном
казала «решта написів — як на екрані». Я виноску виправив (див. §4, правка 3) — тепер значення
колонки `Type` подане як дані нашого прикладу. **Сам напис лишається неперевіреним** — потрібен
знімок business-спейсу (див. §6).

**U-2. «На безкоштовному плані доступні обидва [типи спейсу]».**
Цитата: легенда ③ «`Type` — тип спейсу; на Free доступні обидва типи» і абзац під вікном.
Спирається на `facts-free-plan.md` №12 («обидва на Free ✅»), але **цитата в тому рядку цього не
каже** — вона про те, що будь-який користувач може створити team-managed спейс. Я перечитав сьогодні
три живі сторінки (`explore-jira-cloud-plans`, `what-is-the-free-jira-cloud-plan`,
`what-are-team-managed-and-company-managed-projects`) — речення про доступність company-managed на
Free там немає. Що є дослівно (`jira-software-cloud/docs/create-a-new-project/`, 2026-09-17):
«Only Jira admins can create spaces with a shared configuration. **This setting isn't available on
the Free plan.**» — тобто на Free немає **спільної конфігурації**, а не типу спейсу.
**Не виправляв:** тема — дім `j09`; потрібне рішення з джерелом, а не переформулювання.

**U-3. «На платних планах її [`See plans`] в цьому місці немає».**
Єдине джерело — примітка в `screens/01-home-for-you.md`: «кнопка **See plans** (апсел, є лише на
Free)». Це висновок кореневої сесії, а не напис з екрана: платного сайту ніхто не бачив.
Текст уроку хеджує («її поява і є найкоротшою відповіддю…»), тому я лишив як є. Якщо підтвердити не
вдасться — рядок «На платних планах її в цьому місці немає» варто зняти, а ознаку лишити на рівні
«Її показують тим, кому є що продати» (це речення в уроці вже стоїть вище).

**U-4. Квіз, питання 3, `explain`: «глядачі з нього не виключаються».**
Тобто роль Viewer займає одне з десяти місць. Правдоподібно й збігається з програмою (`j20`:
«запросити людину: як користувача Jira (**місце з десяти**), як клієнта JSM (**без місця**)»), але
дослівної цитати я не знайшов: таблиця планів каже лише «Up to 10 users».
**Не виправляв** (текст правильної відповіді й `answer` не чіпаю; `explain` без джерела правити теж
не став). Рядок для довідника 3 / `j20`.

**U-5. «на безкоштовному плані їх фіксована кількість на весь сайт за місяць» (кроки автоматизації).**
Частину «за місяць» я підтвердив: `support.atlassian.com/cloud-automation/docs/how-is-my-usage-calculated/`
(2026-09-17) — «Allowances refresh monthly», таблиця «Automation step per month · Free · **150 per
subscription**». Але одиниця в доксах — «per subscription, **pooled at the organization level**», а
не «на сайт». На Free (один сайт, одна організація) це збігається, тому урок не бреше; формулювання
лише не збігається з джерелом слово в слово. **Не виправляв** — зміна зачепила б сенс, а «на весь
сайт» тут зрозуміліше читачеві не з ІТ. Рядок для `j14`/`j15`, де ця модель — тема.

**Перевірено й підтверджено дослівно** (щоб наступний рецензент не робив цього втретє), джерела —
`explore-jira-cloud-plans` і `what-is-the-free-jira-cloud-plan`, `curl` 2026-09-17:

| Твердження уроку | Жива таблиця / сторінка |
| ---------------- | ----------------------- |
| вісім рядків «є»: Scrum and Kanban boards · Backlog · Agile reporting · Customizable workflows · Apps and integrations · Automation · Roadmaps: Basic · Encryption in transit & at rest | усі вісім — галочка (або «Basic») у колонці Free |
| «немає»: Space roles · Advanced permissions · Capacity planning · Space archiving · Admin insights · Sandbox · Release tracks · Anonymous access · IP allowlisting · Data residency | усі — порожня клітинка в колонці Free |
| SSO: «Requires Atlassian Guard Standard subscription» | дослівно, рядок «Single sign-on, SCIM provisioning, and Active Directory Sync» |
| «Up to 10 users», «Site limit — One», «Community support» | дослівно |
| «Limitations in Free … Там п'ять рядків» | рівно п'ять: Permissions, roles, and work-level security · Audit logs · Email notifications · Apps that extend Jira Cloud · Advanced roadmaps |
| три причини Standard «прямо з опису плану» | «Advanced permissions, roles, and permission sharing between company-managed spaces», «Audit logs for keeping track of important changes», «Up to 100,000 users» |
| четверта причина (спільна конфігурація) | `create-a-new-project/`: «Only Jira admins can create spaces with a shared configuration. This setting isn't available on the Free plan.» |
| «Space permissions, roles, and work-level security aren't customizable in Jira Free» + «everyone with access to Jira is an admin for all Jira spaces» | дослівно |
| «you won't have access to audit logs» | дослівно |
| листи: обмежена кількість на день, «notifications are paused until the following day» | дослівно (число в уроці свідомо не названо — правильно) |
| «If all of your Jira Cloud apps are on the Free plan, you can't update your site's URL after your site is created» | дослівно; там же «Paid plans are able to request an updated URL from Atlassian Support» — підпирає `explain` питання 5 |
| «Atlassian reserves the right to deactivate Free Jira Cloud sites due to inactivity» + «opening a dashboard, checking a report, viewing a work item, or going to the admin settings» | дослівно |
| «Some apps might have reduced functionality in Jira Free…» + поіменний список несумісних застосунків | дослівно, список на місці (12 назв + Checklists for Jira) |
| ЧаПи про повернення на Free | «If you change to a Free plan… space permissions are kept in their current state but anonymous access (if you had granted it) is removed. You'll need to upgrade again to change permissions.» — урок переказує точно |
| JSM: «Up to 3 agents», «Customer limit — Unlimited», workflows+SLA ✓, Automation ✓, прочерк навпроти Audit logs / Work-level security settings / Sandboxes | усе збіглось; `Custom reports` на Free теж **галочка**, тому правильно, що фрази картки «кастомних звітів немає» в уроці немає |
| Confluence Free: свій ліміт користувачів, своє сховище, необмежені простори й сторінки, цитата про дозволи, неактивність | дослівно («Seats for up to 10 users», «2 GB of file storage», «Unlimited spaces and pages», «Permissions aren't customizable and anonymous access isn't available…») |
| «Space archiving» немає на Free | `jira-cloud-administration/docs/archive-a-project/`: «Space archiving is only available on Premium and Enterprise plans.» |
| дашборди, фільтри й JQL на Free поза таблицею планів | `screens/16-filters-dashboards.md` (Free-sandbox: сторінки Filters і Dashboards, «Save filter»), `facts` №10 |

---

## 3. Пропущені теми з картки `j02`

- **Архівація робіт.** Картка: «чого немає (… **архівація спейсів і робіт** …)». В уроці є лише
  `Space archiving` (спейси). Джерело для дописування вже є й перевірене:
  `facts-free-plan.md` №5 — «Archiving issues is only available for Premium and Enterprise
  customers» (`jira/kb/bulk-archive-issues-in-jira-cloud/`). Одне підрядне речення в тому ж пункті
  списку закриває пункт. **Сам не дописував** — це факт, а не формулювання.

Решта картки прозвучала вся: «є» (8 позицій), «немає» (усі названі), «обмежене» (усі дев'ять,
включно з одним сайтом, незмінною адресою й неактивністю), «коли треба Standard» (чотири причини),
JSM Free (3 агенти, клієнти без ліміту, SLA), Confluence Free, «точні числа — довідник 3».
Вікно — одне (`list`, норма картки), Mermaid — одна (`flowchart TD`, «Чи вистачить Free?»),
квіз — шість питань і рівно шість тем картки (адмін · де числа · коли Standard · агент vs клієнт ·
назва сайту · неактивність). Межі з сусідами витримані: створення сайту — лише вказівник на `j03`,
чисел лімітів немає, крім двох дозволених.

---

## 4. Що виправив сам

**13 змістових правок + 2 перенесення рядків** (щоб не з'явилось рядка на 130 знаків). Розмітку
вікна, Mermaid, порядок блоків, тексти правильних відповідей, `q`, `answer` і кількість питань не
чіпав.

### Факт із показаним джерелом (7)

| # | Було → Стало | Джерело |
| - | ------------ | ------- |
| 1 | легенда: «`+ Create` — створити роботу **або спейс**» → «`+ Create` — **створити нову роботу**» | `jira-software-cloud/docs/create-a-new-project/` (2026-09-17): «To create a space: **Hover over Spaces in the side navigation, then select Create space**». Кнопка верхньої панелі спейсів не створює; `j03` (рядок 233) уже каже «створити нову роботу» — тепер уроки не розходяться |
| 2 | виноска: «Назва спейсу й ім'я в колонці `Lead` — з нашого прикладу…, **решта написів — як на екрані**» → «Назва спейсу, ім'я в колонці `Lead` **і тип спейсу в колонці `Type`** — дані нашого прикладу…» | `screens/02` має лише `Team-managed software`; стара виноска приписувала екрану напис, якого там не було (U-1) |
| 3 | блок 6: «лист із попередженням приходить **на пошту того, хто сайт створив**, — і якщо ця людина пішла з фірми, його не побачить ніхто» → «…попереджають листом: «If you're a site admin, we'll send you emails…» … лист іде **адміністраторам сайту**, а не всій команді, — тож якщо єдиний адміністратор пішов з фірми, попередження не побачить ніхто» | `what-is-the-free-jira-cloud-plan/`: «**If you're a site admin**, we'll send you emails to let you know if your site has been inactive and is at risk of being deactivated. You'll need to log in and do something to prevent deactivation.» Докси адресують листи адміністраторам сайту, не «творцеві» |
| 4 | те саме у квізі, `explain` питання 6: «лист іде на пошту людини, яка сайт створила» → «решта команди цього листа не бачить» | те саме джерело |
| 5 | ЧаПи 1: «взяти Standard або Premium на кілька тижнів, **після чого сайт повертається на попередній план або переходить на оплату**» → «…на пробу на кілька тижнів. Тобто «пробний період» — це про **платні плани**, а не про Free» | `explore-jira-cloud-plans`: «If you have a Free plan and want to try another plan for free, you can try the Standard plan for 14 days and the Premium plan for 30 days.» Що буде **після** проби саме для Free-сайту, сторінка не каже — фразу знято |
| 6 | ЧаПи 5: «**усе, що лежить у Jira**, можна вивантажити у файл» → «**роботу, яка лежить у Jira**, можна вивантажити у файл» | `facts` №4 (перевірено 2026-09-17): експорт CSV — «Each batch export has a maximum limit of 1,000 work items»; про «усе» жодне джерело не говорить, а Backup manager на Free у фактах стоїть під ⚠ |
| 7 | блок 1: «**В Atlassian** їх чотири» → «**У Jira Cloud** їх чотири: Free, Standard, Premium, Enterprise» | у таблиці планів чотири колонки саме для Jira і JSM; у сусідній таблиці тієї ж сторінки (Jira Product Discovery) колонки три — узагальнення «в Atlassian» неточне |

### Формулювання (3)

| # | Було → Стало | Чому |
| - | ------------ | ---- |
| 8 | «Дошки — той самий вигляд «колонки й картки»…» → + «**Що означають самі слова Scrum і Kanban — урок 13.**» | «Scrum» і «Kanban» — перші непояснені слова уроку для читача не з ІТ; дім теми — `j13`, тому вказівник, а не пояснення |
| 9 | «Колонка `Type` показує тип спейсу: на безкоштовному плані доступні обидва» → «…тип спейсу: **керований командою (team-managed) чи керований компанією (company-managed)**. На безкоштовному плані доступні обидва…» | «обидва» без названих двох — порожнє слово; назви є на самому екрані у вікні й у заголовку живої сторінки доксів `what-are-team-managed-and-company-managed-projects/` |
| 10 | дві виноски перенесено по рядках (тексту не змінював) | після правки 2 і 6 з'явились рядки > 120 знаків |

### Заборонені звороти (2)

| # | Було → Стало |
| - | ------------ |
| 11 | блок 5: «і вона **проста**: закрий сторінку планів…» → «і вона **коротка**…» |
| 12 | блок 6: «Висновок **простий**: перед тим, як будувати роботу…» → «Висновок **один**…» |

Точних слів зі списку (`просто` · `очевидно` · `як відомо` · `елементарно` · `всі знають` ·
`звісно` · `не забудь, що`) у файлі не було жодного — перевірено пошуком до і після правок;
знайшлись лише ці дві форми того самого регістру. «Переносити легко, повертатись назад — ні»
(вступ) лишив: це про перенесення роботи, а не про здібності читача.

### Механіка квіза (2)

`check-quiz.py` і до правок давав нулі за довжиною, але в питанні 2 **правильний варіант був єдиним
з тире й єдиним з «лапками»**, а три дистрактори йшли через двокрапку — маркер стилю, що видає
відповідь без читання. Правлено лише дистрактори:

- «У будь-якій статті про Jira з пошуку**:** ліміти…» → «У будь-якій статті про Jira з пошуку **—** ліміти…»
- «В уроках курсу**:** кожен урок…» → «В уроках курсу **«Jira з нуля»:** кожен урок…»

Правильний варіант, `q`, `answer`, `explain` (крім правки 4), кількість питань і варіантів —
недоторкані. Після правок довжина правильного в питанні 2 (151) лишилась між найдовшим (154) і
найкоротшим (124).

---

## 5. Механіка

| # | Пункт | Стан |
| - | ----- | ---- |
| 1 | `data-config="../jira.config.json"` + `data-course="jira"` на `<html>` | ✅ |
| 2 | `data-module="j02"` на `<body>`, глобально унікальний | ✅ (`grep -l 'data-module="j02"' modules/*.html` → лише `jira-02.html`; зайняті `m01–m12`, `a01–a22`, `c01–c23` не зачеплені) |
| 3 | `<meta name="viewport">` без `user-scalable` і `maximum-scale` | ✅ `width=device-width, initial-scale=1.0` |
| 4 | вісім блоків у порядку, у кожного `id` і `data-lesson` | ✅ `l1…l8` + `#quiz` дев'ятим |
| 5 | `.term--enter` / `.term--hero` / `.term--long` | ✅ нуль (`.term` у цьому уроці не вживається взагалі — ні JQL, ні CLI) |
| 6 | розмітка вікна §4 | ✅ один `figure.win[data-state="list"]#w1`, `figcaption.win__chrome` з датованим заголовком, `win__body[role=group][aria-labelledby=w1t]`, три мітки `win__mark[aria-hidden]` + `ol.win__legend` на три пункти в тому ж порядку; жодного `<img>`/`<svg>`/`<canvas>` усередині |
| 7 | Mermaid ≥ 1, текст вузлів у лапках, без `<br/>` | ✅ одна `flowchart TD`, усі вузли й підписи ребер у лапках, `<br` нуль |
| 8 | квіз | ✅ 6 питань · JSON валідний (`json.loads`) · `answer` з нуля й указує на правильний варіант у всіх шести · `explain` у кожного, без «перший/третій варіант» · ситуаційні, не «скільки» · довжина не підказує · розкид `answer` 2/1/2/1 = 33 % максимум · маркер стилю вирівняно (див. §4) |
| 9 | дата біля екрана | ✅ «Jira Cloud · список спейсів і верхня панель · звірено 2026-09-17» (з застереженням U-1) |
| 10 | регістр шляхів — нижній | ✅ `../jira.config.json`, `../css/…`, `../js/…`, `../jira.html`, `../assets/favicon.svg`; великі літери лише в зовнішньому URL шрифтів, як у базі |
| + | апостроф | ✅ 28 входжень, усі U+0027 (англійські цитати `you're` / `we'll` теж набрані U+0027 — так вимагає контракт) |
| + | каркас §2 | ✅ дев'ять замін на місці, `#configError` називає `jira.config.json`, крихта «Урок 02», `<title>` «Урок 2 · …», порядок скриптів як у базі |

**Вивід чекера (фінальний файл), дослівно:**

```
Перевіряю 1 сторінок
════════════════════════════════════════════════════════════════

✓ jira-02.html  (49.1 KB)

════════════════════════════════════════════════════════════════
Готово. З помилками: 0 із 1.
Факти цей скрипт НЕ перевіряє — лише структуру, механіку й мову.
```

**Вивід `check-quiz.py` (фінальний файл), дослівно:**

```
курс / файл                        питань           найдовша           +нічиї       найкоротша  answer 0/1/2/3   довж. прав./хибн.
----------------------------------------------------------------------------------------------------------------------------------
? (1 ф.)                                6        0/6 (0.0 %)      0/6 (0.0 %)      0/6 (0.0 %)  2/1/2/1          140.2 / 132.2
```

**Окремо для кореневої сесії, не дефект уроку:** контракт §4.3 завів клас **`win__topbar`** саме за
заявкою автора `j02`, але **жоден із трьох написаних уроків його не використовує** — `j01`, `j02`,
`j03` кладуть глобальну верхню панель у `win__bar`. Я свідомо не переробляв розмітку в одному файлі:
три уроки однорідні, і саме однорідність робить майбутній `sed`-пас дешевим. Рішення (завести
`win__topbar` у дизайні й переробити всі три разом чи прибрати клас із §4.3) — за кореневою сесією.

---

## 6. Що перевірити не вдалося

- **Chrome/sandbox у мене немає** — усе, що видно лише на живому екрані, лишилось за межами.
- **Платного сайту Jira не існує ні в кого з нас** — твердження «на платних планах `See plans` у
  цьому місці немає» (U-3) не закривається жодним доступним джерелом.
- **Marketplace, `admin.atlassian.com`** — в уроці не описані, перевіряти не було чого.

**Що зняти в sandbox (для кореневої сесії):**

| Що | Де саме | Навіщо |
| -- | ------- | ------ |
| Напис у колонці `Type` для **business**-спейсу | `/jira/projects` → таблиця `Spaces`, колонка `Type`, рядок business-спейсу (створити з шаблону для задач, мова акаунта **English**) | закриває U-1 у `j02` і той самий рядок у `j03`, `j09` |
| Меню кнопки **`+ Create`** у верхній панелі (розкрити й переписати пункти) | будь-яка сторінка, верхня панель, кнопка `+ Create` | остаточно закриває правку 1: що саме створює кнопка, крім роботи |
| Сторінка створення спейсу: **`Create space` у бічній панелі** (де кнопка живе) | бічна панель → наведення на `Spaces` → `Create space` | те саме; плюс потрібне `j03` (галерея шаблонів) |
| Рядок JSM у таблиці планів **очима** | `support.atlassian.com/jira-cloud-administration/docs/explore-jira-cloud-plans/`, розділ JSM | вже у списку `j03`; мій `curl` збігся з `curl` автора j02 один в один, тож розбіжність із `facts` №3 — у фактурі, не в методі |

---

## 7. Знахідки для сусідніх уроків

- **j02 → j03, j05:** `«To create a space: Hover over Spaces in the side navigation, then select Create space»` · `support.atlassian.com/jira-software-cloud/docs/create-a-new-project/`, 2026-09-17 · спейс створюють **не** кнопкою `+ Create` у верхній панелі; у `j03` це вже написано правильно, у `j02` виправлено.
- **j02 → j09:** `«Only Jira admins can create spaces with a shared configuration. This setting isn't available on the Free plan.»` · та сама сторінка · готова опора для «коли треба Standard» і для межі j09; **прямої цитати про доступність company-managed на Free в доксах немає** — знайти або переформулювати (зараз `j02` це стверджує з опорою лише на `facts` №12).
- **j02 → j14, j15, довідник 3:** `«Allowances refresh monthly»`; таблиця «Automation step per month»: Free — `150 per subscription`, JSM Free — `1,250 per subscription`; модель — «usage-based automation steps **pooled at the organization level**» · `support.atlassian.com/cloud-automation/docs/how-is-my-usage-calculated/`, 2026-09-17 · в уроках писати «на підписку / на всю організацію», не «на користувача»; «за місяць» тепер підтверджено цитатою.
- **j02 → j20:** `«Space archiving is only available on Premium and Enterprise plans. If you archive a space and then move to a Standard plan, you can still access the archive and restore archived spaces.»` · `support.atlassian.com/jira-cloud-administration/docs/archive-a-project/`, 2026-09-17 · поруч у тому ж розділі доксів є **«Trash for Jira Cloud spaces»** (Move a space to trash · Restore a space from trash · Delete a space) — це і є те, що лишається замість архівації на Free.
- **j02 → j20, довідник 3:** дослівно про листи: `«If you're a site admin, we'll send you emails to let you know if your site has been inactive and is at risk of being deactivated. You'll need to log in and do something to prevent deactivation.»` · `…/what-is-the-free-jira-cloud-plan/` · адресат — **адміністратор сайту**, не «той, хто створив сайт»; формулювання «місце з десяти займає й глядач» джерела поки не має (U-4).
- **j02 → j16:** Confluence Free сьогодні: `«Seats for up to 10 users»` · `«2 GB of file storage»` · `«Unlimited spaces and pages»` · `«Permissions aren't customizable and anonymous access isn't available…»` · `«Atlassian reserves the right to deactivate Free Confluence Cloud sites due to inactivity.»` · `support.atlassian.com/confluence-cloud/docs/learn-about-confluence-cloud-plans/`, 2026-09-17 · там же — `«If you're on the Free plan, you can try the Standard plan for 14 days and the Premium plan for 30 days»` (пробний період = платний план на пробу, підтверджує рядок автора j02 для `j03`).
- **j02 → усі (метод):** `curl` + розбір `<td>` відтворено незалежно й дав ті самі числа, що в автора — метод надійний. Дві пастки самої таблиці, на яких легко помилитись: рядок **`Anonymous access` у таблиці Jira стоїть двічі** (позиції 28 і 30 — не шукати різницю між ними), а рядок **`Dependency management` має порожні клітинки в усіх чотирьох колонках** (значення сховані в тексті-описі рядка, тому «порожньо» тут не означає «немає на жодному плані»).
