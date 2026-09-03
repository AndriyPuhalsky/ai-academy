-- =====================================================================
-- 005-1 · Третій курс «AI Термінал» + два виправлення, що з ним пов'язані
-- =====================================================================
-- Задача:      dev/build/005-ai-terminal/task.md
-- Програма:    dev/build/005-ai-terminal/00-research/program.md (джерело правди назв)
-- Аудит бази:  dev/build/005-ai-terminal/02-backend/audit-gate.md
-- Автор:       aia-build-backend · Дата: 2026-09-03 · Гілка: dev
-- Застосовує:  ВЛАСНИК вручну (Supabase Dashboard → SQL Editor). Агент базу не змінює.
--
-- ЩО РОБИТЬ (п'ять частин, порядок усередині файлу ОБОВ'ЯЗКОВИЙ):
--   1. courses     — один рядок: «AI Термінал», slug `claude-code`, is_paid = false
--   2. modules     — 23 рядки: c01…c23, number 1…23 суцільно, c23 = фінальний іспит
--   3. enrollments — backfill: зараховує ВСІХ наявних користувачів у новий курс
--   4. maybe_issue_certificate — більше НІКОЛИ не друкує email у сертифікат
--   5. admin_user_report       — прибрано захардкоджений slug, звіт бачить усі курси
--
-- ЧОМУ САМЕ ТАКИЙ ПОРЯДОК:
--   2 після 1 — модулі беруть course_id підзапитом за slug (FK).
--   3 після 1 — backfill теж потребує course_id.
--   3 після 2 — не технічна вимога, а здоровий глузд: спершу курс має зміст,
--               потім у нього пускають людей.
--   4 і 5 від 1–3 не залежать і стоять останніми, щоб не змішувати «дані» і «код».
--
-- ЧОМУ 4 САМЕ ЗАРАЗ, А НЕ ПОТІМ:
--   `certificates` = 0 рядків, тобто вікно «виправити до першої видачі» ще відкрите,
--   і закриє його саме запуск 005. `maybe_issue_certificate` вставляє рядок з
--   `on conflict (user_id, course_id) do nothing` — перевидати сертифікат неможливо.
--   Тобто перший випускник із незаповненим `full_name` НАЗАВЖДИ отримав би сертифікат
--   зі своїм email, а `verify_certificate` віддавав би цей email кожному, хто знає
--   публічний код. Після першої видачі це вже незворотно.
--
-- УСЕ ЙДЕ ОДНІЄЮ ТРАНЗАКЦІЄЮ. Будь-яка помилка (включно з вбудованою перевіркою
-- нумерації) відкочує ВЕСЬ файл — часткового застосування бути не може.
--
-- ІДЕМПОТЕНТНІСТЬ: частини 1–3 можна виконати повторно без наслідків
-- (`on conflict do nothing` по наявних унікальних обмеженнях), 4–5 — `create or replace`.
-- =====================================================================


-- ---------------------------------------------------------------------
-- КРОК 0 (ВИКОНАТИ ОКРЕМО, ДО ЗАПУСКУ ФАЙЛУ) — зняти зліпок для відкату
-- ---------------------------------------------------------------------
-- Це НЕ частина транзакції. Виконати окремо, вивід ЗБЕРЕГТИ у файл: саме він
-- є найточнішим відкатом для частин 4 і 5 — точніший за текст у блоці «ВІДКАТ»
-- нижче, бо береться з живої бази, а не з транскрипції.
--
-- Окремо це показує `SET search_path`, який зараз стоїть на функціях (див.
-- застереження перед частиною 4).
--
--   select p.oid::regprocedure as fn,
--          p.proconfig,
--          pg_get_functiondef(p.oid) as definition
--     from pg_proc p
--    where p.oid in ('public.maybe_issue_certificate(uuid,uuid)'::regprocedure,
--                    'public.admin_user_report()'::regprocedure);
--
-- ---------------------------------------------------------------------


begin;

-- =====================================================================
-- ЧАСТИНА 1 — курс
-- =====================================================================
-- `is_paid = false` — НЕ косметика і не «поки безкоштовно». `handle_new_user`
-- (тригер на створення користувача) зараховує новачка запитом
-- `select new.id, c.id from public.courses c where c.is_paid = false`.
-- З `is_paid = true` не зарахувався б НІХТО, навіть нові користувачі, а
-- `module_unlocked` першою ж перевіркою вимагає активного зарахування — курс
-- виглядав би як зламаний, хоча всі 23 модулі на місці.
--
-- `sort_order = 3` — наявні курси мають 1 (ai-essentials) і 2 (ai-architect),
-- звірено з живою базою. Жодна функція його не читає, але значення явно осмислені,
-- тож продовжуємо ряд, а не лишаємо default 0.
--
-- `title` іде в PDF-сертифікат і на публічну сторінку /verify — це видимий текст,
-- а не технічна назва.

insert into public.courses (slug, title, is_paid, price_uah, description, sort_order)
values (
  'claude-code',
  'AI Термінал',
  false,
  null,
  'Безкоштовний курс: Claude Code у терміналі з нуля — встановлення, перша сесія, контекст, дозволи, налаштування, MCP, автоматизація та реальна робота.',
  3
)
on conflict (slug) do nothing;


-- =====================================================================
-- ЧАСТИНА 2 — 23 модулі (22 навчальні + фінальний іспит)
-- =====================================================================
-- Назви й слаги — ДОСЛІВНО з `00-research/program.md` (затверджено власником
-- 2026-09-03). Не редагувати тут: якщо назва змінюється, вона змінюється спершу там.
--
-- `number` МУСИТЬ бути суцільним 1…23. `module_unlocked` шукає попередній модуль
-- запитом `where course_id = v_course and number = v_number - 1`. Дірка в нумерації
-- означає, що `v_prev` = null, `exists(...)` = false, і модуль після дірки не
-- відкриється НІКОЛИ — обхідного шляху з клієнта немає. Нижче стоїть перевірка,
-- яка не дасть застосувати міграцію з діркою чи дублем.
--
-- `code` мусить бути унікальним ГЛОБАЛЬНО, а не лише в межах курсу. У базі стоїть
-- лише UNIQUE(course_id, code), але `js/auth.js` будує мапу модулів БЕЗ фільтра за
-- курсом (`select id, code` → `map[code] = id`), тож збіг коду мовчки затер би
-- модуль чужого курсу. Префікс `c` не перетинається з наявними `m01…m12`
-- (AI Академія) і `a01…a22` (AI Architect) — звірено з живою базою.
--
-- `passing_score`: 70 для c01…c22 (як у всіх 34 наявних модулів), 85 для іспиту c23.
-- Чому 85: клієнт надсилає відсоток `Math.round(correct / total * 100)`
-- (`js/quiz.js`). При запланованих ~25 питаннях 21/25 = 84% (не проходить),
-- 22/25 = 88% (проходить). Тобто 85 означає «дозволено щонайбільше 3 помилки з 25»
-- — помітно вище за 70 і при цьому досяжно.
--
-- `sort_order = 0` — як у всіх 34 наявних модулів. Колонка мертва (жодна функція її
-- не читає, порядок тримається на `number`). Свідомо НЕ нумеруємо 1…23: тоді в одній
-- колонці співіснували б дві різні угоди, і `order by sort_order` виглядав би
-- осмисленим, лишаючись випадковим.

insert into public.modules (course_id, code, number, slug, title, passing_score, sort_order)
select c.id, v.code, v.number, v.slug, v.title, v.passing_score, 0
  from public.courses c
  cross join (values
    ('c01'::text,  1::int, 'modules/claude-code-01.html'::text, 'Термінал з нуля'::text,                            70::int),
    ('c02',        2,      'modules/claude-code-02.html',       'Що таке Claude Code',                              70),
    ('c03',        3,      'modules/claude-code-03.html',       'Встановлення й перший вхід',                       70),
    ('c04',        4,      'modules/claude-code-04.html',       'Перша сесія: проси → дивись → підтверджуй',        70),
    ('c05',        5,      'modules/claude-code-05.html',       'Інтерфейс і навігація',                            70),
    ('c06',        6,      'modules/claude-code-06.html',       'Контекстне вікно й компакція',                     70),
    ('c07',        7,      'modules/claude-code-07.html',       'Дозволи й межа довіри',                            70),
    ('c08',        8,      'modules/claude-code-08.html',       'Plan Mode й пісочниця',                            70),
    ('c09',        9,      'modules/claude-code-09.html',       'Сесії, історія, відкат',                           70),
    ('c10',       10,      'modules/claude-code-10.html',       'Моделі й мислення',                                70),
    ('c11',       11,      'modules/claude-code-11.html',       'Скільки це коштує',                                70),
    ('c12',       12,      'modules/claude-code-12.html',       'CLAUDE.md і пам''ять',                             70),
    ('c13',       13,      'modules/claude-code-13.html',       'Уся .claude/ і settings.json',                     70),
    ('c14',       14,      'modules/claude-code-14.html',       'Skills, команди, плагіни',                         70),
    ('c15',       15,      'modules/claude-code-15.html',       'Субагенти, worktrees, паралельність',              70),
    ('c16',       16,      'modules/claude-code-16.html',       'Hooks',                                            70),
    ('c17',       17,      'modules/claude-code-17.html',       'Коли все зламалось: діагностика',                  70),
    ('c18',       18,      'modules/claude-code-18.html',       'MCP: зовнішні інструменти',                        70),
    ('c19',       19,      'modules/claude-code-19.html',       'Headless і CI: Claude як утиліта',                 70),
    ('c20',       20,      'modules/claude-code-20.html',       'Коли Claude працює без тебе',                      70),
    ('c21',       21,      'modules/claude-code-21.html',       'Наскрізний проєкт і робочі звички',                70),
    ('c22',       22,      'modules/claude-code-22.html',       'Безпека, великі репо, куди далі',                  70),
    ('c23',       23,      'modules/claude-code-23.html',       'Фінальний іспит',                                  85)
  ) as v(code, number, slug, title, passing_score)
 where c.slug = 'claude-code'
on conflict (course_id, code) do nothing;


-- ---------------------------------------------------------------------
-- Запобіжник: нумерація мусить бути суцільною 1…23
-- ---------------------------------------------------------------------
-- Не декорація. Дірка або дубль у `number` робить частину курсу недосяжною
-- НАЗАВЖДИ (див. розбір `module_unlocked` вище), причому мовчки: сайт
-- виглядатиме справним, а учень упреться в «Модуль ще заблоковано» без причини.
-- Помилка тут відкочує всю транзакцію — краще не застосувати нічого, ніж
-- застосувати курс із пасткою.

do $$
declare
  v_course   uuid;
  v_cnt      integer;
  v_min      integer;
  v_max      integer;
  v_distinct integer;
begin
  select id into v_course from public.courses where slug = 'claude-code';
  if v_course is null then
    raise exception '005: курс claude-code не знайдено — частина 1 не відпрацювала';
  end if;

  select count(*), min(number), max(number), count(distinct number)
    into v_cnt, v_min, v_max, v_distinct
    from public.modules
   where course_id = v_course;

  if v_cnt <> 23 or v_min <> 1 or v_max <> 23 or v_distinct <> 23 then
    raise exception
      '005: нумерація модулів не суцільна 1..23 (рядків=%, min=%, max=%, унікальних=%)',
      v_cnt, v_min, v_max, v_distinct;
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
-- каталозі, натиснув перший модуль і отримав «Модуль ще заблоковано», хоча
-- жодного попереднього модуля не існує. Це виглядало б як дефект коду.
--
-- Спосіб і набір колонок — ДЗЕРКАЛО того, що робить `handle_new_user`:
-- вставляються тільки (user_id, course_id), а `status` ('active') і `granted_at`
-- (now) беруться з default. Свого варіанта тут свідомо немає.
--
-- Ідемпотентно завдяки UNIQUE(user_id, course_id).
-- ЦЕ ЗАПИС У ЖИВІ ДАНІ: додасться рівно по одному рядку на кожен наявний профіль.

insert into public.enrollments (user_id, course_id)
select p.id, c.id
  from public.profiles p
  cross join public.courses c
 where c.slug = 'claude-code'
on conflict (user_id, course_id) do nothing;


-- =====================================================================
-- ЧАСТИНА 4 — maybe_issue_certificate: email більше не потрапляє в сертифікат
-- =====================================================================
-- БУЛО:  coalesce(full_name, email, 'Студент')
-- СТАЛО: coalesce(nullif(btrim(full_name, E' \t\r\n'), ''), 'Студент')
--
-- Три дефекти старого варіанта, усі три закриті:
--   1. NULL full_name → у сертифікат друкувався EMAIL, і `verify_certificate`
--      віддавав його кожному, хто знає публічний код (це публічна функція для anon).
--   2. Порожній рядок '' — не NULL, тож coalesce його пропускав: сертифікат із
--      порожнім іменем.
--   3. Самі пробіли/таби ' ' — те саме, плюс у PDF це виглядало б як зсунутий текст.
-- `btrim` заодно нормалізує імена з випадковими пробілами по краях — у
-- `certificates.full_name` тепер лягає вже підчищене значення.
--
-- Решта тіла збережена ДОСЛІВНО (звірено з живою базою 2026-09-03 через Dashboard,
-- Database → Functions → Edit): підрахунок v_total/v_done, умова v_total > 0,
-- генерація 12-символьного коду, insert з `on conflict do nothing`.
--
-- ЗАСТЕРЕЖЕННЯ ПРО search_path — прочитати до запуску:
-- `create or replace function` замінює визначення ЦІЛКОМ, включно з конфігурацією
-- функції. Прочитати `proconfig` живої функції я не зміг (SQL Editor мені
-- заборонений, а панель Dashboard не докручується до Advanced settings), але
-- Security Advisor НЕ показує для цього проєкту жодного попередження
-- `Function Search Path Mutable` — отже search_path на функціях СТОЇТЬ.
-- Тому він тут заданий явно: `public, pg_temp` (pg_temp останнім — так рекомендує
-- документація Postgres для SECURITY DEFINER, щоб тимчасова схема нічого не
-- перекривала). Це безпечно за будь-якого поточного значення, бо в тілі функції
-- ВСІ об'єкти схемо-кваліфіковані (`public.modules`, `public.progress`,
-- `public.profiles`, `public.certificates`), а `gen_random_uuid()` на Postgres 13+
-- живе в `pg_catalog`, який шукається завжди.
-- ЯКЩО крок 0 показав інше значення — підставити його сюди і в блок ВІДКАТУ.
--
-- GRANT-и `create or replace` НЕ чіпає: хто міг викликати функцію, той і зможе.

create or replace function public.maybe_issue_certificate(p_user uuid, p_course uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_total integer;
  v_done  integer;
  v_name  text;
  v_code  text;
begin
  select count(*) into v_total from public.modules where course_id = p_course;

  select count(*) into v_done
    from public.progress pr
    join public.modules m on m.id = pr.module_id
   where pr.user_id = p_user and m.course_id = p_course and pr.status = 'completed';

  if v_total > 0 and v_done >= v_total then
    -- 005: НІКОЛИ не підставляти email — це персональні дані, а verify_certificate
    -- віддає це поле публічно за кодом сертифіката. Порожній рядок і самі пробіли
    -- теж не проходять.
    select coalesce(nullif(btrim(full_name, E' \t\r\n'), ''), 'Студент') into v_name
      from public.profiles where id = p_user;

    -- Короткий код для перевірки: 12 hex-символів з UUID, без pgcrypto
    v_code := replace(gen_random_uuid()::text, '-', '');
    v_code := substr(v_code, 1, 12);

    insert into public.certificates (user_id, course_id, public_code, full_name)
    values (p_user, p_course, v_code, v_name)
    on conflict (user_id, course_id) do nothing;
  end if;
end
$function$;


-- =====================================================================
-- ЧАСТИНА 5 — admin_user_report: звіт більше не прив'язаний до одного курсу
-- =====================================================================
-- БУЛО: `with ess as (select id from public.courses where slug = 'ai-essentials' limit 1)`
-- і далі всі три показники рахувались лише по цьому одному курсу.
--
-- Масштаб проблеми більший, ніж «новий курс не видно»: бот НІКОЛИ не бачив
-- AI Architect — від самого його запуску. Це закриття наявної дірки, а не
-- підготовка до 005.
--
-- СТАЛО: жодного slug у коді. Показники рахуються по ВСІХ курсах таблиці, тож
-- четвертий курс підхопиться сам, без правки функції.
--
-- ЧОМУ САМЕ ТАКА ФОРМА, А НЕ «рядок на курс»:
-- `tg/telegram_index.ts` жорстко зав'язаний на цей контракт і його НЕ чіпаємо:
--   • `toCsv` (рядок 100) хардкодить рівно сім колонок за іменами
--     email, full_name, role, registered, completed, total, certificate —
--     нова колонка (напр. `course`) у CSV просто зникла б;
--   • `/stats` рахує `Користувачів: rows.length` — при рядку на курс троє
--     користувачів перетворились би на «Користувачів: 9».
-- Тому набір колонок і «один рядок = один користувач» збережені точно.
--
-- ЩО ЗМІНЮЄТЬСЯ У ВИВОДІ БОТА (важливо, це видно власнику одразу):
--   • `total`  — тепер УСІ модулі всіх курсів (сьогодні 34, після 005 → 57),
--                а не 12 модулів AI Академії;
--   • `completed` — усі завершені модулі учня в усіх курсах;
--   • `certificate` — чи є в учня ХОЧ ОДИН сертифікат (раніше: саме за AI Академію);
--   • похідне `Завершили курс` у боті (`total > 0 && completed >= total`) тепер
--     означає «завершили ВСІ курси». Приклад нового /stats — у звіті.
-- Якщо власник захоче іншу семантику саме цього рядка — це правка
-- `tg/telegram_index.ts` і передеплой Edge Function, окремою задачею.
--
-- `join public.modules` у підрахунку `completed` збережений навмисно, хоча FK
-- і так гарантує наявність модуля: якщо `progress.module_id` колись виявиться
-- nullable, join відсіє такі рядки, а голий count — ні.
--
-- Про search_path — те саме застереження, що й у частині 4.
-- Функція лишається `security definer`: її викликає Edge Function
-- service-role ключем. `create or replace` не змінює GRANT-и, а вони тут вужчі,
-- ніж у решти функцій — `admin_user_report` єдина з дев'яти НЕ з'являється у
-- попередженнях Security Advisor «Public/Signed-In Users Can Execute SECURITY
-- DEFINER Function», тобто EXECUTE у anon/authenticated відкликаний. Це правильно
-- і має таким лишитись.
--
-- Сигнатура (ім'я, відсутність аргументів, склад і порядок колонок TABLE)
-- НЕ змінюється — інакше `create or replace` впав би з помилкою про зміну
-- імен вихідних параметрів і довелося б робити drop + create, втративши GRANT-и.

create or replace function public.admin_user_report()
returns table (
  email       text,
  full_name   text,
  role        text,
  registered  timestamp with time zone,
  completed   integer,
  total       integer,
  certificate boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select
    p.email,
    p.full_name,
    p.role::text,
    p.created_at,
    -- завершені модулі учня в усіх курсах
    (select count(*)::int
       from public.progress pr
       join public.modules m on m.id = pr.module_id
      where pr.user_id = p.id
        and pr.status = 'completed'),
    -- усі модулі всіх курсів
    (select count(*)::int
       from public.modules m),
    -- чи є хоч один сертифікат
    exists(
      select 1 from public.certificates c
       where c.user_id = p.id
    )
  from public.profiles p
  order by p.created_at desc;
$function$;

commit;


-- =====================================================================
-- ЯК ПЕРЕВІРИТИ, ЩО ЗАСТОСУВАЛОСЬ (виконати після коміту)
-- =====================================================================

-- 1. Курс є, безкоштовний, з правильним slug і назвою.
--    Очікувано: рівно 1 рядок, is_paid = false, sort_order = 3.
select slug, title, is_paid, price_uah, sort_order
  from public.courses
 where slug = 'claude-code';

-- 2. Модулів рівно 23, нумерація суцільна 1…23, дублів немає,
--    passing_score 70 у 22 модулів і 85 в одного (c23).
--    Очікувано: modules=23, min_number=1, max_number=23, unique_numbers=23,
--               unique_codes=23, exam_score=85, regular_70=22.
select count(*)                                        as modules,
       min(number)                                     as min_number,
       max(number)                                     as max_number,
       count(distinct number)                          as unique_numbers,
       count(distinct code)                            as unique_codes,
       max(passing_score) filter (where code = 'c23')  as exam_score,
       count(*) filter (where passing_score = 70)      as regular_70
  from public.modules
 where course_id = (select id from public.courses where slug = 'claude-code');

-- 3. Коди глобально унікальні (те, на чому тримається `buildModuleMap`).
--    Очікувано: 0 рядків. Будь-який рядок тут = мовчазна поломка чужого курсу.
select code, count(*)
  from public.modules
 group by code
having count(*) > 1;

-- 4. Зараховані ВСІ наявні користувачі, жодного не пропущено.
--    Очікувано: users = enrolled, not_enrolled = 0.
select (select count(*) from public.profiles)                as users,
       (select count(*) from public.enrollments e
          join public.courses c on c.id = e.course_id
         where c.slug = 'claude-code')                       as enrolled,
       (select count(*) from public.profiles p
         where not exists (
           select 1 from public.enrollments e
             join public.courses c on c.id = e.course_id
            where e.user_id = p.id and c.slug = 'claude-code'
         ))                                                  as not_enrolled;

-- 4b. Усі зарахування нового курсу активні (status узятий з default).
--     Очікувано: рівно один рядок зі status = 'active'.
select e.status, count(*)
  from public.enrollments e
  join public.courses c on c.id = e.course_id
 where c.slug = 'claude-code'
 group by e.status;

-- 5. Сертифікат більше не може надрукувати email.
--    Очікувано: has_email_fallback = false, has_safe_fallback = true.
select pg_get_functiondef(oid) like '%coalesce(full_name, email%'  as has_email_fallback,
       pg_get_functiondef(oid) like '%btrim(full_name%'            as has_safe_fallback
  from pg_proc
 where oid = 'public.maybe_issue_certificate(uuid,uuid)'::regprocedure;

-- 6. У звіті бота не лишилось захардкодженого курсу.
--    Очікувано: has_hardcoded_slug = false.
select pg_get_functiondef(oid) like '%ai-essentials%' as has_hardcoded_slug
  from pg_proc
 where oid = 'public.admin_user_report()'::regprocedure;

-- 7. search_path на обох функціях виставлений (не порожній).
--    Очікувано: два рядки, у кожного proconfig містить search_path.
select p.oid::regprocedure as fn, p.proconfig
  from pg_proc p
 where p.oid in ('public.maybe_issue_certificate(uuid,uuid)'::regprocedure,
                 'public.admin_user_report()'::regprocedure);

-- 8. Звіт бота тепер бачить усі три курси: `total` має дорівнювати
--    загальній кількості модулів (57 = 12 + 22 + 23), а не 12.
--    Очікувано: report_total = all_modules.
select (select max(total) from public.admin_user_report()) as report_total,
       (select count(*)::int from public.modules)          as all_modules;


-- =====================================================================
-- ВІДКАТ
-- =====================================================================
-- Частини 4 і 5 відкочуються повністю й безпечно.
-- Частини 1–3 відкочуються ТІЛЬКИ ДОКИ КУРС НЕ ПОЧАЛИ ПРОХОДИТИ.
-- Щойно з'явиться перший `progress` / `quiz_attempts` / `certificates` по цьому
-- курсу — відкат означав би ЗНИЩЕННЯ ПРОГРЕСУ ЖИВИХ УЧНІВ. Запобіжник нижче
-- це не дозволить; знімати його вручну — свідоме рішення власника, не рутина.
--
-- ВАЖЛИВО: якщо крок 0 виконано і його вивід збережений, для частин 4–5
-- ТОЧНІШЕ використати збережений `pg_get_functiondef` — він з живої бази.
--
-- begin;
--
-- -- 5R. Повернути захардкоджений курс у звіт бота.
-- create or replace function public.admin_user_report()
-- returns table (
--   email       text,
--   full_name   text,
--   role        text,
--   registered  timestamp with time zone,
--   completed   integer,
--   total       integer,
--   certificate boolean
-- )
-- language sql
-- security definer
-- set search_path = public, pg_temp
-- as $function$
--   with ess as (select id from public.courses where slug = 'ai-essentials' limit 1)
--   select
--     p.email,
--     p.full_name,
--     p.role::text,
--     p.created_at,
--     (select count(*)::int
--        from public.progress pr
--        join public.modules m on m.id = pr.module_id
--       where pr.user_id = p.id
--         and pr.status = 'completed'
--         and m.course_id = (select id from ess)),
--     (select count(*)::int
--        from public.modules m
--       where m.course_id = (select id from ess)),
--     exists(
--       select 1 from public.certificates c
--        where c.user_id = p.id and c.course_id = (select id from ess)
--     )
--   from public.profiles p
--   order by p.created_at desc;
-- $function$;
--
-- -- 4R. Повернути старий fallback імені (УВАГА: повертає й дефект з email).
-- create or replace function public.maybe_issue_certificate(p_user uuid, p_course uuid)
-- returns void
-- language plpgsql
-- security definer
-- set search_path = public, pg_temp
-- as $function$
-- declare
--   v_total integer;
--   v_done  integer;
--   v_name  text;
--   v_code  text;
-- begin
--   select count(*) into v_total from public.modules where course_id = p_course;
--
--   select count(*) into v_done
--     from public.progress pr
--     join public.modules m on m.id = pr.module_id
--    where pr.user_id = p_user and m.course_id = p_course and pr.status = 'completed';
--
--   if v_total > 0 and v_done >= v_total then
--     select coalesce(full_name, email, 'Студент') into v_name
--       from public.profiles where id = p_user;
--
--     v_code := replace(gen_random_uuid()::text, '-', '');
--     v_code := substr(v_code, 1, 12);
--
--     insert into public.certificates (user_id, course_id, public_code, full_name)
--     values (p_user, p_course, v_code, v_name)
--     on conflict (user_id, course_id) do nothing;
--   end if;
-- end
-- $function$;
--
-- -- 3R/2R/1R. Прибрати курс. Запобіжник: не чіпати, якщо курс уже проходять.
-- do $$
-- declare
--   v_course uuid;
--   v_used   integer;
-- begin
--   select id into v_course from public.courses where slug = 'claude-code';
--   if v_course is null then
--     raise notice 'Курс claude-code уже відсутній — відкочувати нічого';
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
-- -- Перевірка відкату: обидва запити мають повернути 0.
-- -- select count(*) from public.courses where slug = 'claude-code';
-- -- select count(*) from public.modules where code like 'c__';
