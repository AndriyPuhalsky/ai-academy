-- =====================================================================
-- 012-1 · Четвертий курс «Jira з нуля»
-- =====================================================================
-- Задача:      dev/build/012-jira/task.md
-- План:        dev/build/012-jira/01-plan.md, розділ «К2. Міграція»
-- Назви:       jira.config.json (джерело правди; звірено побайтово 2026-10-01)
-- Прецедент:   dev/build/005-ai-terminal/02-backend/db/005-1-course-ai-terminal.sql
-- Автор:       aia-build-backend · Дата: 2026-10-01 · Гілка: dev
-- Застосовує:  ВЛАСНИК вручну (Supabase Dashboard → SQL Editor). Агент базу не змінює.
--
-- ЩО РОБИТЬ (три частини, порядок усередині файлу ОБОВ'ЯЗКОВИЙ):
--   1. courses     — один рядок: «Jira з нуля», slug `jira`, is_paid = false, sort_order 4
--   2. modules     — 23 рядки: j01…j23, number 1…23 суцільно, j23 = фінальний іспит
--   3. enrollments — backfill: зараховує ВСІХ наявних користувачів у новий курс
--
-- ЧОМУ САМЕ ТАКИЙ ПОРЯДОК:
--   2 після 1 — модулі беруть course_id підзапитом за slug (FK).
--   3 після 1 — backfill теж потребує course_id.
--   3 після 2 — не технічна вимога, а здоровий глузд: спершу курс має зміст,
--               потім у нього пускають людей.
--
-- ЧОГО ТУТ СВІДОМО НЕМА (на відміну від 005-1):
--   Частин 4 і 5 файла 005-1 (`maybe_issue_certificate`, `admin_user_report`)
--   у цьому файлі НЕМАЄ і бути не має. Обидві функції вже виправлені міграцією
--   005-1 (звірено з живою базою 2026-10-01: `maybe_issue_certificate` містить
--   `btrim(full_name` і НЕ містить `coalesce(full_name, email`; `admin_user_report`
--   рахує по всіх курсах без захардкодженого slug). `create or replace` поверх
--   них нічого б не поліпшив, зате міг би мовчки змінити `proconfig` або
--   транскрибувати тіло з помилкою. Четвертий курс вони підхоплюють самі:
--   обидві працюють від `course_id`/усіх курсів, а не від списку слагів.
--
-- УСЕ ЙДЕ ОДНІЄЮ ТРАНЗАКЦІЄЮ. Будь-яка помилка (включно з двома вбудованими
-- перевірками) відкочує ВЕСЬ файл — часткового застосування бути не може.
--
-- ІДЕМПОТЕНТНІСТЬ: усі три частини можна виконати повторно без наслідків
-- (`on conflict do nothing` по наявних унікальних обмеженнях:
--  courses_slug_key, modules_course_id_code_key, enrollments_user_id_course_id_key
--  — усі три звірені з живою базою 2026-10-01 через `pg_get_constraintdef`).
--
-- СТАН БАЗИ ПЕРЕД ЗАСТОСУВАННЯМ (точний count(*) через Supabase MCP, 2026-10-01;
-- оцінки pg_class тут брешуть у рази — вони показували courses 1 і modules 23):
--   courses 3 (sort_order 1, 2, 3 — четвертий вільний) · modules 57 ·
--   кодів `j%` у modules 0 · курсу зі slug `jira` немає ·
--   certificates 0 · enrollments 39 · profiles 13.
-- Після застосування очікується: courses 4 · modules 80 · enrollments 52.
-- =====================================================================


begin;

-- =====================================================================
-- ЧАСТИНА 1 — курс
-- =====================================================================
-- `is_paid = false` — НЕ косметика і не «поки безкоштовно». Тригер
-- `handle_new_user` (на створення користувача) зараховує новачка запитом
-- `select new.id, c.id from public.courses c where c.is_paid = false`
-- (тіло звірено з живою базою 2026-10-01 через `pg_get_functiondef`).
-- З `is_paid = true` не зарахувався б НІХТО, навіть нові користувачі, а
-- `module_unlocked` першою ж перевіркою вимагає активного зарахування — курс
-- виглядав би як зламаний, хоча всі 23 модулі на місці.
--
-- `price_uah = null` — свідомо. Курс безкоштовний; наявний `ai-architect` має
-- `price_uah = 499900` при `is_paid = false`, і це його історія, не зразок.
--
-- `sort_order = 4` — наявні курси мають 1 (ai-essentials), 2 (ai-architect),
-- 3 (claude-code); звірено з живою базою. Жодна функція його не читає, але
-- значення явно осмислені, тож продовжуємо ряд, а не лишаємо default 0.
--
-- `title` іде в PDF-сертифікат і на публічну сторінку /verify — це видимий
-- текст, а не технічна назва. «Jira з нуля» = `site.name` з `jira.config.json`
-- і `BRANDS["jira"].brand` з `js/certificate.js`: три місця мусять казати
-- однаково, інакше сертифікат і сайт назвуть курс по-різному.
--
-- `description` — дослівно `site.description` з `jira.config.json`.
-- Апострофів у ньому немає (перевірено), тому екранувати нічого не потрібно.

insert into public.courses (slug, title, is_paid, price_uah, description, sort_order)
values (
  'jira',
  'Jira з нуля',
  false,
  null,
  'Безкоштовний курс про Jira Cloud на безкоштовному плані: від «Jira — це щось для програмістів» до власного сайту, порталу заявок і автоматизації для команди до десяти людей.',
  4
)
on conflict (slug) do nothing;


-- =====================================================================
-- ЧАСТИНА 2 — 23 модулі (22 навчальні + фінальний іспит)
-- =====================================================================
-- `code` і `title` — ПОБАЙТОВО з `jira.config.json` (`modules[*].id` →
-- `code`, `modules[*].title` → `title`, `modules[*].slug` → `slug`),
-- згенеровано з живого конфіга 2026-10-01. Не редагувати тут: якщо назва
-- змінюється, вона змінюється спершу в конфізі. Розбіжність між конфігом і
-- базою коштувала окремої міграції `005-2` — повторювати це не варто.
--
-- `code` звірений також із розміткою: у кожному з 23 файлів
-- `modules/jira-NN.html` стоїть `<body data-module="jNN">` (перевірено всі 23),
-- а `js/module.js:13` читає саме цей атрибут.
--
-- `number` МУСИТЬ бути суцільним 1…23. `module_unlocked` шукає попередній
-- модуль запитом `where course_id = v_course and number = v_number - 1`
-- (тіло звірено з живою базою 2026-10-01). Дірка в нумерації означає, що
-- `v_prev` = null, `exists(...)` = false, і модуль після дірки не відкриється
-- НІКОЛИ — обхідного шляху з клієнта немає. Нижче стоїть перевірка, яка не
-- дасть застосувати міграцію з діркою чи дублем.
--
-- `code` мусить бути унікальним ГЛОБАЛЬНО, а не лише в межах курсу. У базі
-- стоїть лише UNIQUE(course_id, code) і UNIQUE(course_id, number) — звірено
-- 2026-10-01, глобального обмеження на `code` НЕМАЄ. Водночас `js/auth.js:175`
-- будує мапу модулів БЕЗ фільтра за курсом (`select id, code` → `map[code] = id`),
-- тож збіг коду мовчки затер би модуль чужого курсу. Префікс `j` не
-- перетинається з наявними `m01…m12` (AI Академія), `a01…a22` (AI Architect)
-- і `c01…c23` (AI Термінал): `select count(*) from modules where code like 'j%'`
-- дав 0. Нижче стоїть друга перевірка, яка це тримає.
--
-- `passing_score`: 70 для j01…j22 (як у всіх 57 наявних модулів), 85 для
-- іспиту j23 — та сама межа, що в `claude-code-23`. Клієнт надсилає відсоток
-- `Math.round(correct / total * 100)` (`js/quiz.js`), питань в іспиті 26:
-- 22/26 = 85 % (проходить), 21/26 = 81 % (не проходить) — тобто «щонайбільше
-- 4 помилки з 26».
-- ⚠ Фактично межа декоративна: `js/progress.js:68` надсилає `p_score: 100`
-- незалежно від реального балу (рішення власника 2026-09-06, НЕ дефект, не
-- «виправляти по дорозі»). Значення 85 стоїть тут для узгодженості з
-- `claude-code-23` і щоб працювати, якщо `p_score` колись стане справжнім.
--
-- `sort_order = 0` — як у всіх 57 наявних модулів. Колонка мертва (жодна
-- функція її не читає, порядок тримається на `number`). Свідомо НЕ нумеруємо
-- 1…23: тоді в одній колонці співіснували б дві різні угоди, і
-- `order by sort_order` виглядав би осмисленим, лишаючись випадковим.

insert into public.modules (course_id, code, number, slug, title, passing_score, sort_order)
select c.id, v.code, v.number, v.slug, v.title, v.passing_score, 0
  from public.courses c
  cross join (values
    ('j01'::text,  1::int, 'modules/jira-01.html'::text, 'Jira не лише для ІТ'::text,                       70::int),
    ('j02',        2,      'modules/jira-02.html',       'Безкоштовний план чесно',                         70),
    ('j03',        3,      'modules/jira-03.html',       'Реєстрація і перше вікно',                        70),
    ('j04',        4,      'modules/jira-04.html',       'Словник Jira',                                    70),
    ('j05',        5,      'modules/jira-05.html',       'Створити й вести роботу',                         70),
    ('j06',        6,      'modules/jira-06.html',       'Вигляди',                                         70),
    ('j07',        7,      'modules/jira-07.html',       'Пошук і JQL',                                     70),
    ('j08',        8,      'modules/jira-08.html',       'Дашборди і гаджети',                              70),
    ('j09',        9,      'modules/jira-09.html',       'Team-managed vs company-managed',                 70),
    ('j10',       10,      'modules/jira-10.html',       'Workflow',                                        70),
    ('j11',       11,      'modules/jira-11.html',       'Поля, екрани, типи роботи',                       70),
    ('j12',       12,      'modules/jira-12.html',       'Практикум: шаблони під сферу',                    70),
    ('j13',       13,      'modules/jira-13.html',       'Scrum і Kanban — і коли вони не потрібні',        70),
    ('j14',       14,      'modules/jira-14.html',       'Автоматизація: перші flows',                      70),
    ('j15',       15,      'modules/jira-15.html',       'Автоматизація глибше',                            70),
    ('j16',       16,      'modules/jira-16.html',       'Пошта, чати, Confluence — оглядово',              70),
    ('j17',       17,      'modules/jira-17.html',       'Marketplace обережно',                            70),
    ('j18',       18,      'modules/jira-18.html',       'Jira Service Management',                         70),
    ('j19',       19,      'modules/jira-19.html',       'Практикум: заявки до бухгалтерії',                70),
    ('j20',       20,      'modules/jira-20.html',       'Люди і доступ',                                   70),
    ('j21',       21,      'modules/jira-21.html',       'Наскрізний проєкт',                               70),
    ('j22',       22,      'modules/jira-22.html',       'Jira + Claude Code через MCP',                    70),
    ('j23',       23,      'modules/jira-23.html',       'Фінальний іспит',                                 85)
  ) as v(code, number, slug, title, passing_score)
 where c.slug = 'jira'
on conflict (course_id, code) do nothing;


-- ---------------------------------------------------------------------
-- Запобіжник 1: нумерація мусить бути суцільною 1…23
-- ---------------------------------------------------------------------
-- Не декорація. Дірка або дубль у `number` робить частину курсу недосяжною
-- НАЗАВЖДИ (див. розбір `module_unlocked` вище), причому мовчки: сайт
-- виглядатиме справним, а учень упреться в «Модуль ще заблоковано» без
-- причини. Помилка тут відкочує всю транзакцію — краще не застосувати
-- нічого, ніж застосувати курс із пасткою.

do $$
declare
  v_course   uuid;
  v_cnt      integer;
  v_min      integer;
  v_max      integer;
  v_distinct integer;
begin
  select id into v_course from public.courses where slug = 'jira';
  if v_course is null then
    raise exception '012-1: курс jira не знайдено — частина 1 не відпрацювала';
  end if;

  select count(*), min(number), max(number), count(distinct number)
    into v_cnt, v_min, v_max, v_distinct
    from public.modules
   where course_id = v_course;

  if v_cnt <> 23 or v_min <> 1 or v_max <> 23 or v_distinct <> 23 then
    raise exception
      '012-1: нумерація модулів не суцільна 1..23 (рядків=%, min=%, max=%, унікальних=%)',
      v_cnt, v_min, v_max, v_distinct;
  end if;
end $$;


-- ---------------------------------------------------------------------
-- Запобіжник 2: коди модулів унікальні ГЛОБАЛЬНО
-- ---------------------------------------------------------------------
-- Те, на чому тримається `buildModuleMap` у `js/auth.js:174-186`: він читає
-- `select id, code` без фільтра за курсом і складає `map[code] = id`. Збіг
-- коду між курсами означає, що один модуль мовчки затирає інший — і зламається
-- при цьому ЧУЖИЙ, уже живий курс, а не наш. База такого збігу не забороняє
-- (обмеження лише UNIQUE(course_id, code)), тому перевірка тут.
--
-- Дві умови:
--   а) кодів `j%` у всій таблиці рівно 23 — тобто наш префікс не ділиться ні
--      з ким (дає зрозумілу помилку, якщо колись зʼявиться курс із кодами на `j`);
--   б) у таблиці взагалі немає жодного коду, що трапляється двічі — це
--      загальний контракт, він правдивий і для майбутніх курсів.

do $$
declare
  v_j     integer;
  v_dup   integer;
  v_codes text;
begin
  select count(*) into v_j from public.modules where code like 'j%';
  if v_j <> 23 then
    raise exception
      '012-1: кодів `j%%` у modules %, очікувалось 23 — префікс ділиться з іншим курсом',
      v_j;
  end if;

  select count(*), coalesce(string_agg(code, ', ' order by code), '')
    into v_dup, v_codes
    from (
      select code from public.modules group by code having count(*) > 1
    ) d;

  if v_dup > 0 then
    raise exception
      '012-1: коди модулів не унікальні глобально (% шт.: %) — AIA_MODULE_MAP затер би чужий курс',
      v_dup, v_codes;
  end if;
end $$;


-- =====================================================================
-- ЧАСТИНА 3 — backfill зарахувань наявних користувачів
-- =====================================================================
-- Без цього кроку курс мертвий для всіх, хто вже зареєстрований.
-- `handle_new_user` — тригер на СТВОРЕННЯ користувача; наявні акаунти він не
-- накриє ніколи. А `module_unlocked` ПЕРШОЮ ж перевіркою вимагає
-- `enrollments(user_id, course_id, status = 'active')` — ще до перевірки
-- попереднього модуля. Тобто без backfill наявний учень побачив би курс у
-- каталозі, натиснув перший урок і отримав «Модуль ще заблоковано», хоча
-- жодного попереднього модуля не існує. Це виглядало б як дефект коду.
--
-- Спосіб і набір колонок — ДЗЕРКАЛО того, що робить `handle_new_user`:
-- вставляються тільки (user_id, course_id), а `status` ('active') і
-- `granted_at` (now) беруться з default. Свого варіанта тут свідомо немає.
--
-- Ідемпотентно завдяки UNIQUE(user_id, course_id).
-- ЦЕ ЗАПИС У ЖИВІ ДАНІ: додасться рівно по одному рядку на кожен наявний
-- профіль. Станом на 2026-10-01 профілів 13, тобто 13 нових рядків
-- `enrollments` (39 → 52). Жоден наявний рядок не змінюється.

insert into public.enrollments (user_id, course_id)
select p.id, c.id
  from public.profiles p
  cross join public.courses c
 where c.slug = 'jira'
on conflict (user_id, course_id) do nothing;

commit;


-- =====================================================================
-- ЯК ПЕРЕВІРИТИ, ЩО ЗАСТОСУВАЛОСЬ (виконати ПІСЛЯ коміту)
-- =====================================================================
-- Вісім запитів. Поруч із кожним — очікуване значення.

-- 1. Курс є, безкоштовний, з правильним slug, назвою й порядком.
--    Очікувано: рівно 1 рядок — is_paid = false, price_uah = null, sort_order = 4,
--    title = 'Jira з нуля'.
select slug, title, is_paid, price_uah, sort_order
  from public.courses
 where slug = 'jira';

-- 2. Курсів тепер чотири, модулів 80.
--    Очікувано: courses = 4, modules = 80.
select (select count(*) from public.courses) as courses,
       (select count(*) from public.modules) as modules;

-- 3. Модулів курсу рівно 23, нумерація суцільна 1…23, дублів немає,
--    passing_score 70 у 22 модулів і 85 в іспиту j23.
--    Очікувано: modules = 23, min_number = 1, max_number = 23,
--               unique_numbers = 23, unique_codes = 23,
--               exam_score = 85, regular_70 = 22.
select count(*)                                        as modules,
       min(number)                                     as min_number,
       max(number)                                     as max_number,
       count(distinct number)                          as unique_numbers,
       count(distinct code)                            as unique_codes,
       max(passing_score) filter (where code = 'j23')  as exam_score,
       count(*) filter (where passing_score = 70)      as regular_70
  from public.modules
 where course_id = (select id from public.courses where slug = 'jira');

-- 4. Кодів `j%` рівно 23 (префікс ні з ким не ділиться).
--    Очікувано: 23.
select count(*) as codes_j
  from public.modules
 where code like 'j%';

-- 5. Коди глобально унікальні — те, на чому тримається AIA_MODULE_MAP.
--    Очікувано: 0 рядків. Будь-який рядок тут = мовчазна поломка чужого курсу.
select code, count(*)
  from public.modules
 group by code
having count(*) > 1;

-- 6. Назви модулів у базі збігаються з jira.config.json — вибірково, три
--    найризикованіші (тире, латиниця, двокрапка).
--    Очікувано: три рядки точно такі:
--      j09 | Team-managed vs company-managed
--      j13 | Scrum і Kanban — і коли вони не потрібні
--      j19 | Практикум: заявки до бухгалтерії
select code, title
  from public.modules
 where code in ('j09', 'j13', 'j19')
 order by code;

-- 7. Зараховані ВСІ наявні користувачі, жодного не пропущено, усі активні.
--    Очікувано: users = enrolled, not_enrolled = 0, revoked = 0.
select (select count(*) from public.profiles)                        as users,
       (select count(*) from public.enrollments e
          join public.courses c on c.id = e.course_id
         where c.slug = 'jira')                                      as enrolled,
       (select count(*) from public.profiles p
         where not exists (
           select 1 from public.enrollments e
             join public.courses c on c.id = e.course_id
            where e.user_id = p.id and c.slug = 'jira'
         ))                                                          as not_enrolled,
       (select count(*) from public.enrollments e
          join public.courses c on c.id = e.course_id
         where c.slug = 'jira' and e.status <> 'active')             as revoked;

-- 8. Сертифікатів нового курсу ще немає — тобто відкат усе ще безпечний.
--    Очікувано: 0.
select count(*) as certs_jira
  from public.certificates c
  join public.courses co on co.id = c.course_id
 where co.slug = 'jira';


-- =====================================================================
-- ВІДКАТ
-- =====================================================================
-- Відкат можливий — ДОКИ КУРС НЕ ПОЧАЛИ ПРОХОДИТИ.
-- Щойно зʼявиться перший `progress` / `quiz_attempts` / `certificates` по
-- цьому курсу — відкат означав би ЗНИЩЕННЯ ПРОГРЕСУ ЖИВИХ УЧНІВ і, можливо,
-- уже виданого сертифіката з публічним кодом верифікації, який людина комусь
-- показала. Запобіжник нижче цього не дозволить; знімати його вручну —
-- свідоме рішення власника, не рутина.
--
-- Жодної DDL у цій міграції немає — тільки три `insert`. Тому відкат повний
-- і точний: видаляються рівно ті рядки, які вона додала.
--
-- ⚠ Чого відкат НЕ робить і не має робити: він не чіпає ні
-- `maybe_issue_certificate`, ні `admin_user_report`, ні тригер
-- `handle_new_user` — міграція їх не змінювала.
--
-- Розкомментувати й виконати цілком:
--
-- begin;
--
-- do $$
-- declare
--   v_course uuid;
--   v_used   integer;
-- begin
--   select id into v_course from public.courses where slug = 'jira';
--   if v_course is null then
--     raise notice 'Курс jira уже відсутній — відкочувати нічого';
--     return;
--   end if;
--
--   select (select count(*) from public.progress pr
--             join public.modules m on m.id = pr.module_id
--            where m.course_id = v_course)
--        + (select count(*) from public.quiz_attempts qa
--             join public.modules m on m.id = qa.module_id
--            where m.course_id = v_course)
--        + (select count(*) from public.certificates c
--            where c.course_id = v_course)
--     into v_used;
--
--   if v_used > 0 then
--     raise exception
--       'ВІДКАТ ЗУПИНЕНО: курс уже проходять (% рядків прогресу/спроб/сертифікатів). Видалення знищило б дані живих учнів.',
--       v_used;
--   end if;
--
--   delete from public.enrollments where course_id = v_course;
--   delete from public.modules     where course_id = v_course;
--   delete from public.courses     where id = v_course;
-- end $$;
--
-- commit;
--
-- -- Перевірка відкату: усі три запити мають повернути 0.
-- -- select count(*) from public.courses     where slug = 'jira';
-- -- select count(*) from public.modules     where code like 'j%';
-- -- select count(*) from public.enrollments e
-- --   join public.courses c on c.id = e.course_id where c.slug = 'jira';
