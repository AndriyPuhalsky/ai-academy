# Рецензія · урок j09 «Team-managed vs company-managed»

**Файл:** `/Users/ander1.sage/Downloads/AIA/modules/jira-09.html` (55,5 KB)
**Рецензовано:** 2026-09-18, `aia-content-reviewer`. Правлено рівно цей один файл.
Вхід: `lesson-contract.md`, `program.md` (розділи 1–5, картка j09, «Наскрізні правила»,
«Межі між сусідами», «Уточнення після хвилі 2» п. 7), `reports/j09.md` §4–§7,
`cross-findings.md` (у т. ч. «Від авторів хвилі 2»), `screens/02`, `10`, `23`,
живі докси Atlassian (`curl -sL` → зняття тегів), сусідні уроки `jira-03/04/07/10.html`.

---

## 1. Вердикт

**Готово з зауваженнями.** Урок фактично охайний: усі 23 англомовні цитати, які я звіряв
із живими доксами, збіглися дослівно; обидва місця, де програма розходиться з доксами
(«business — team-managed за природою» і «company-managed на Free створити можна»), автор
закрив чесно — жодне з цих тверджень в уроці не стоїть. Виправив 9 місць (формулювання,
жаргон розмітки, узгодження з сусідніми уроками, один дистрактор квіза). Лишаються **три
⚠, які закриває лише sandbox**, і **одна правка для довідника/сусідів**.

---

## 2. Непідтверджені факти

### 2.1 Виправлено мною (джерело показане)

**(а) «Company-managed створює адміністратор Jira. На сайті, що завжди був безкоштовним,
адміністратори — усі, тому обмеження нікого не стосується.»** (блок 7, ЧаПи)

Інференс ширший за цитату. Довідка каже: «everyone with access to Jira is an admin **for
all Jira spaces**» (`jira-cloud-administration/docs/what-is-the-free-jira-cloud-plan/`,
звірено 2026-09-18) — це **адмін спейсів**, а не власник глобального дозволу
`Administer Jira`. З неї не випливає, що на Free кожен є **адміністратором Jira** й може
створити company-managed. Замінив на доведене: тип обирається в майстрі
(«Select either Company-managed or Team-managed» · `create-a-new-project`, 2026-09-18),
а на Free немає **спільної конфігурації** («Only Jira admins can create spaces with a
shared configuration. This setting isn't available on the Free plan» · там само).

**(б) HR: «п'ять колонок» / «процес із п'яти кроків»** (блоки 1 і 8) проти шести статусів.
Джерело: `program.md` розділ 3 («New → Screening → Interview → Offer → Hired | Rejected»),
траєкторія («j10 — HR з власним workflow (6 статусів)») і вже написаний
`modules/jira-10.html` (таблиця статусів і дошка — шість, `Rejected` = категорія Done).
Виправив на шість у обох місцях.

**(в) Обіцянка про урок 10** (блок 5): «перейменуєш один з них [To Do у MARK або REM] і
побачиш, що другий не змінився». У `modules/jira-10.html` перейменування відбувається в
**новому спейсі найму**, а не в MARK/REM. Переписав так, щоб обіцянка збіглася з тим, що
урок 10 справді робить.

**(г) Цитата, обірвана на півслові** (блок 1): «…there are key differences you should
know» — в оригіналі речення триває «…in order to decide what's right for your team».
Додав знак пропуску всередині лапок.

### 2.2 Лишається ⚠ — виправити не можу, потрібен екран

**(а) `service management` як друге слово в колонці `Type`** (блок 2 і підсумок блоку 8).
Живим екраном бачили лише `Team-managed software` (`screens/02`); `Team-managed business`
— погоджена екстраполяція (j02 → j09). Форма для JSM-спейсу не підтверджена нічим: у JQL
відповідне значення — `service_desk` (`jira-software-cloud/docs/jql-fields/`, 2026-09-18),
у галереї шаблонів категорія зветься `Service management` (`screens/23`).
**Не чіпав свідомо:** рівно та сама трійка вже стоїть у легенді `jira-03.html`
(«`Type` — тип спейсу: business, software або service management»), і правка в одному
файлі з двох зробила б курс неузгодженим. Знімати — разом, після sandbox.

**(б) «Рівнів доступу три» для **ділового** спейсу.** Джерело говорить вужче:
«Team-managed **software** spaces have three, simple access levels»
(`jira-software-cloud/docs/next-gen-permissions/`, 2026-09-18) — при тому, що банер
сторінки каже «This page is for team-managed spaces». Сюжетні спейси (`REM`, `MY`, `MARK`)
— ділові. Часткова опора є: сусідня сторінка вже пише про **обидві** родини —
«You can't edit space permissions or roles on the Free plan for **software and business
spaces**» (`manage-how-people-access-your-team-managed-project/`, 2026-09-18), тобто
режим Free однаковий; про кількість рівнів у діловому спейсі прямого речення немає.
Ризик низький, але це рядок для дозйомки.

**(в) «Viewer справді бачить лише те, що йому дозволено» на платному плані** (ЧаПи 4).
Опора — поява рядків `Space roles` і `Advanced permissions` у таблиці планів (перевірив
розбором `<td>` сам: колонка Free порожня, Standard/Premium/Enterprise — ✓). Прямої цитати
про поведінку `Viewer` після апгрейду немає. Формулювання автора обережне, лишив як є.

### 2.3 Що я звірив і що збіглося (дослівно, 2026-09-18)

| Твердження в уроці | Джерело |
| ------------------ | ------- |
| «Spaces in Jira can be created as either team-managed or company-managed…» | `what-are-team-managed-and-company-managed-projects/` |
| «set up and maintained by anyone on the team» / «…by Jira admins» | там само |
| «When a Jira admin changes a scheme or screen, every company-managed space…» | там само |
| спосіб дізнатись тип через `More actions (•••)` у заголовку або бічній панелі | там само (дослівно, включно з «at the bottom of that menu») |
| «company-managed and team-managed (formerly known as classic and next-gen)» | `learn-the-basics-of-team-managed-projects/` |
| сторінка «Team-managed space permissions» живе за слагом `next-gen-permissions` | перевірив запитом: 200, заголовок саме такий |
| «Two main settings determine a person's permissions…» + Open / Limited / Private + «у відкритому — Member, в обмеженому — Viewer» | `next-gen-permissions/` |
| описи ролей Administrator / Member / Viewer | `manage-how-people-access-your-team-managed-project/` (рядок у рядок) |
| «You can't edit space permissions or roles on the Free plan for Jira» | `next-gen-permissions/` |
| «If your site has always been on a Free plan, everyone with access to Jira is an admin for all Jira spaces» | `what-is-the-free-jira-cloud-plan/` |
| «Jira bounds any custom fields you add to the space. You can't share them…» | `issue-types-how-do-team-managed-and-company-managed-projects-differ/` |
| «There isn't a native Jira feature for directly converting…» | `migrate-between-team-managed-and-company-managed-projects/` |
| «these must be recreated…», «any existing links to old work item keys will be automatically redirected», втрата story points і історії звітів | там само |
| екран «Map Status for Target Space»; назва сторінки «Convert a space to a different template or type» без перемикача | `jira-cloud-administration/docs/convert-a-project-to-a-different-template-or-type/` |
| «Only Jira admins can create spaces with a shared configuration…» + шість спільних речей (work types, workflows, screens, fields, permissions, notifications) | `create-a-new-project/` |
| «Any user can create their own team-managed space unless a Jira admin changes this in global permissions» | там само |
| порядок кроків майстра (шаблон → `Use template` → назва → тип → `Create`), «ключ Jira згенерує сама», зміна в `Space settings → Details` | там само |
| «you can use the statusCategory field (a work item is resolved when statusCategory = Done)» | `jql-fields/` |
| поле `spaceType` = `business` / `software` / `service_desk`, і що воно про родину, а не про спосіб керування | там само |
| рядки `Space roles` / `Advanced permissions`: Free порожньо, далі ✓; рядків про типи спейсів у таблиці немає взагалі | `explore-jira-cloud-plans/`, розбір `<td>` |
| склад розділів company-managed і «Workflow Scheme — the space's workflow scheme determines which workflows… apply to work types in this space» | `jira-cloud-administration/docs/configure-a-space/` |
| W1: колонки `Name · Key · Type · Lead`, кнопки `Create space` / `Templates`, поле `Search spaces`, формат «N spaces found» | `screens/02` |
| W2: рейка Details · Access · Notifications · Automation · Fields · Work types · Features · Custom filters · Apps; поля Details + `Save` | `screens/10` (порядок збігається пункт у пункт) |
| крок «категорія `Work management`» | `screens/23` |
| «три категорії статусу» | вже введено в курсі: `jira-04.html` цитує «All statuses… must belong to one of three status categories»; додатково `workflows-and-statuses-for-boards-in-business-projects/` |
| ЧаПи «JSM має обидва типи» (автор джерела не наводив — знайшов я) | `jira-service-management-cloud/docs/how-can-i-tell-if-im-in-a-classic-and-next-gen-project/` і `…/learn-the-differences-between-classic-and-next-gen-projects/`, 2026-09-18 |

---

## 3. Пропущені теми картки j09

**Пропусків немає.** Пройшов поле «Теми» рядок за рядком: де живе конфігурація · як
відрізнити (колонка `Type` + `•••`) · склад Space settings обох типів · що обрати команді
до десяти · наслідки (свої статуси й поля, `statusCategory` між спейсами) · тип не
змінюється, лише переїзд · ролі Administrator / Member / Viewer + рівень доступу · на Free
усі — адміни · спільна конфігурація не на Free. Вікна — 1 `list` + 2 `settings`, як у
матриці. Граблі — чотири. «Зроби сам» і «Як перевірити» збігаються з карткою й із
траєкторією (після j09 з'являється `REM`).

Пункт картки «business-спейси — team-managed за природою» **свідомо не прозвучав** — це
рішення «Уточнення після хвилі 2» №7, урок замість нього пише правильне: «ці дві частини
майже незалежні».

Дві дрібниці, не дефекти, на розсуд кореневої сесії:
- у квізі немає окремого питання «як дізнатись тип спейсу» (картка перелічує його серед
  шести тем); питання 1 підходить до нього збоку — починається саме з колонки `Type`;
- напис `Open access` зі `screens/10` в уроці не названий (сказано нейтрально: «поруч із
  кнопкою `Add people` буде видно поточний рівень доступу»). Джерело для напису є —
  додати може автор, я не додавав.

---

## 4. Що виправив сам

**Формулювання й точність (7):**
1. блок 1 — цитата з `what-are-team-managed…` обірвана на півслові → знак пропуску;
2. блок 1 — при першій появі пояснено, хто такий «адміністратор Jira» («людина з правами
   на весь сайт, а не на окремий спейс»); до правки читач мав два різні «адміністратори»
   в сусідніх абзацах — цей і роль `Administrator` у спейсі;
3. блок 1 — HR: п'ять колонок → шість (додано `Rejected`);
4. блок 8 — «процес із п'яти кроків» → «з шести кроків… і дві кінцеві точки, `Hired` та
   `Rejected`» (формулювання взяте під `jira-10.html`, де так і сказано);
5. блок 5 — обіцянка про урок 10 переписана під те, що урок 10 справді робить;
6. блок 7 — ЧаПи «хто має право створювати спейси» (див. §2.1а);
7. перенос рядка в блоці 1 після правки (ширина рядків файла).

**Жаргон розмітки (2):** слово **«рейка»** (з класу `win__rail`) вживалось у блоках 4 і 8 —
і більше **ніде в курсі** (перевірив по всіх `modules/jira-*.html`). Для читача не з ІТ це
слово нізвідки. Замінено на вже вжите в цьому ж уроці «список розділів».

**Квіз (1):** питання 6 — двокрапка стояла **лише у правильному варіанті** (маркер стилю,
критерій 007). Переписано **дистрактор** (індекс 0), правильна відповідь, `q`, `answer`,
`explain` і кількість питань не чіпались. Зміст дистрактора той самий, нового числа в
курс не внесено.

**Не чіпав:** `#completeTitle` («Урок позаду?» — конвенція хвилі 2), клас `win__tabs` для
`Templates` / `Search spaces` у W1 (так само зроблено в `jira-03.html` — це рішення для
дизайну, не для уроку), формулювання про `Open access`, трійку родин `business / software /
service management` (див. §2.2а).

---

## 5. Механіка (вивід)

```
$ python3 dev/build/012-jira/01-authoring/check-lessons.py --pattern 'modules/jira-09.html'
Перевіряю 1 сторінок
✓ jira-09.html  (55.5 KB)
Готово. З помилками: 0 із 1.

$ python3 dev/build/007-quiz-distractors/check-quiz.py --files modules/jira-09.html
курс / файл        питань        найдовша       +нічиї     найкоротша  answer 0/1/2/3  довж. прав./хибн.
? (1 ф.)                6    1/6 (16.7 %)  1/6 (16.7 %)  1/6 (16.7 %)  1/2/2/1          100.5 /  98.7
```

| # | Пункт | Стан |
| - | ----- | ---- |
| 1 | `data-config="../jira.config.json"` на `<html>`, `data-course="jira"` | ✓ |
| 2 | `data-module="j09"` — унікальний по всіх `modules/*.html` (перевірив `uniq -c`, дублів 0) | ✓ |
| 3 | `<meta name="viewport">` без `user-scalable` і `maximum-scale` | ✓ |
| 4 | вісім блоків `l1`…`l8` + `quiz`, у кожного `id` і `data-lesson`, порядок контрактний | ✓ |
| 5 | `.term--enter` / `.term--hero` / `.term--long` — 0 входжень | ✓ |
| 6 | єдиний `term` (JQL, §4.4): рядок у `span.term__line`, `term__body` з `tabindex/role/aria-labelledby`, кнопка «Копіювати» | ✓ |
| 7 | Mermaid — 2 діаграми (`flowchart TB`, `flowchart LR`), текст вузлів у лапках, `<br/>` немає, `style` немає | ✓ |
| 8 | квіз: 6 питань · JSON валідний (`json.loads`) · `answer` з нуля · `explain` у всіх шести, без посилань на позицію · найдовша 1/6, найкоротша 1/6 · індекси 1/2/2/1 (макс 33 % < 40 %) · маркер стилю прибрано | ✓ |
| 9 | дата біля кожного вікна: W1 «звірено 2026-09-17», W2 «звірено 2026-09-17», W3 «за документацією, 2026-09-18»; під `term` — дата доксів | ✓ |
| 10 | регістр шляхів — усі посилання в нижньому регістрі (`../css/`, `../js/`, `../jira.html`, `../assets/`) | ✓ |
| + | вікна: `figure.win[data-state]`, `win__body` з `role="group"` і `aria-labelledby`, легенда `<ol>` одразу за `</figure>`, кількість `<li>` = кількості міток (3/3/2), `<img>`/`<svg>`/`<canvas>` — 0 | ✓ |
| + | апостроф лише U+0027 (U+2019/U+02BC/U+2018 — 0); заборонені звороти (`просто`, `очевидно`, `як відомо`, `елементарно`, `всі знають`, `звісно`, `не забудь`) — 0 | ✓ |
| + | чисел лімітів немає; єдине число — «до десяти людей» (дозволений виняток §0.1 п. 3) | ✓ |

---

## 6. Чого не вдалося перевірити — і що зняти в sandbox

Доступу до sandbox у мене немає; нижче — по спаданню важливості (перші два збігаються зі
списком автора, третій і четвертий додаю я).

1. **Майстер `Create space` на Free** — чи є вибір `Company-managed` і що станеться при
   його виборі. Закриває рядок №12 `facts-free-plan.md`, зауваження рецензента j02 і
   формулювання блоків 5, 6 та ЧаПи цього уроку.
2. **Business-спейс** (`screens/21`): значення в колонці `Type`, склад рейки
   `Space settings`, адреса. Закриває ⚠ до W1 і W2 одразу в j03, j06, j09, j13.
3. **JSM-спейс у списку `Spaces`** — як саме підписаний його `Type`. Це закриє §2.2а
   одночасно для `jira-03.html` (легенда W2) і `jira-09.html` (блоки 2 і 8).
4. **Сторінка `Access` ділового спейсу** — скільки рівнів доступу пропонує Jira і як
   підписаний поточний (кнопка `Open access` зі `screens/10` проти доксового
   `Change space access`). Закриває §2.2б.
5. **Меню `•••` біля назви спейсу** — склад пунктів і рядок з типом у самому низу
   (в уроці описано словами; елемента для випадного меню в §4.3 немає — заявка автора
   на `win__menu` лишається в силі).

---

## 7. Знахідки для сусідів (`cross-findings.md` не редагував)

- **j09 → j03:** легенда вікна `Spaces` у `jira-03.html` каже «`Type` — тип спейсу:
  business, software або service management». Третє слово живим екраном не бачене
  (`screens/02` дає лише `software`); у JQL відповідник — `service_desk`
  (`jira-software-cloud/docs/jql-fields/`, 2026-09-18). Правити **парою** j03 + j09 після
  знімка JSM-спейсу, не поодинці.
- **j09 → j10:** j09 тепер каже про HR «шість колонок… і дві кінцеві точки `Hired` та
  `Rejected`» — узгоджено з таблицею статусів і дошкою в `jira-10.html`. Якщо j10
  переграє склад статусів, рядок у блоці 1 і в блоці 8 j09 треба рухати разом.
- **j09 → j20, довідник 3:** «everyone with access to Jira is an admin **for all Jira
  spaces**» (`what-is-the-free-jira-cloud-plan/`) — це про адмінів **спейсів**; глобальний
  дозвіл `Administer Jira` цією цитатою не покривається. Уроку 20 («Люди і доступ») варто
  розвести два слова «адміністратор» явно, бо j09 робить це одним підрядним реченням.
- **j09 → j11, j21:** `migrate-between-team-managed-and-company-managed-projects/`
  (2026-09-18) підтверджує, що при переїзді **components і versions** губляться незворотно
  («not recoverable, even if you bulk move these work items back»), а глобальні кастомні
  поля зберігаються «against your work items», але в team-managed виглядають порожніми.
- **j09 → j12:** `create-a-new-project/` описує **два** способи вибору типу — у майстрі
  («Select either Company-managed or Team-managed») і окремим чекбоксом `Share settings
  with an existing space` для спільної конфігурації. Тобто «company-managed» і «спільна
  конфігурація» — **різні кроки**, і саме тому речення про Free стосується другого, а не
  першого. Для j12 це важливо при описі майстра.
- **j09 → довідник 3:** у таблиці планів (`explore-jira-cloud-plans/`, розбір `<td>`,
  2026-09-18) **рядків про типи спейсів немає взагалі** — є лише `Space roles` і
  `Advanced permissions` (Free порожньо). Посилатись на таблицю в питанні «чи є
  company-managed на Free» не можна.
- **j09 → усі (метод):** заголовок статті й слаг розходяться систематично
  (`next-gen-permissions` → «Team-managed space permissions»; `…-projects/` → «…spaces?»).
  Перевіряючи цитату, звіряти **заголовок у `<main>`**, а не адресу.
