-- =====================================================================
-- 005-2 · Назви шести модулів у `modules` — вирівняти з конфігом
-- =====================================================================
-- Задача:      dev/build/005-ai-terminal/task.md (блок 1, п. 13)
-- Рішення:     dev/design/005-ai-terminal/00-decisions.md,
--              запис «2026-09-03 · шість перейменованих модулів — прийнято»
-- Попередня:   005-1-course-ai-terminal.sql (застосована 2026-09-03)
-- Автор:       aia-build-backend · Дата: 2026-09-05 · Гілка: dev
--
-- ЩО РОБИТЬ
--   Оновлює `title` рівно у 6 рядках `public.modules` курсу `claude-code`
--   (коди c04, c08, c14, c16, c19, c22) — з назв, які поставила 005-1, на назви,
--   які власник затвердив 2026-09-03 і які вже стоять у `claude-code.config.json`
--   та в `<h1>` відповідних сторінок.
--
-- ЧОМУ ЦЕ ПОТРІБНО, ЯКЩО КОРИСТУВАЧ РОЗСИНХРОНУ НЕ БАЧИТЬ
--   Не бачить — і це головна причина зробити акуратно, а не «колись».
--   `js/module.js` бере назви модулів із конфіга (`m.title`), тому на сайті вже
--   стоять нові назви. `modules.title` у базі сьогодні не читає жоден клієнтський
--   шлях. Тобто розсинхрон нічого не ламає ЗАРАЗ — але кожен, хто в майбутньому
--   зробить звіт із бази, адмін-екран чи вибірку для бота, отримає назви,
--   яких на сайті немає, і не матиме способу здогадатись, що база відстала.
--   Ціна виправлення сьогодні — шість update; ціна через півроку — розслідування.
--
-- ЧОМУ САМЕ ЦІ ШІСТЬ, А НЕ «список із SUMMARY»
--   Розходження знято з ЖИВОЇ бази 2026-09-05 і звірено з конфігом побайтово
--   (md5 кожної назви, а не око): збіглися 17 із 23, розійшлися рівно 6.
--   Коди, які SUMMARY (розділ Д5.4) називав «виведеними співставленням і на
--   живих даних не перевіреними», перевірено — усі шість правильні.
--   Апостроф у c12 («пам'ять») окремо перевірено: у базі й конфізі той самий
--   символ, це НЕ розходження і його чіпати не треба.
--
-- ЧОГО ЦЕЙ ФАЙЛ НЕ РОБИТЬ (навмисно)
--   Не чіпає `code`, `number`, `slug`, `passing_score`, `sort_order`, `course_id`.
--   `number` і `code` — несуча конструкція (`module_unlocked` шукає попередній
--   модуль за `number`, `js/auth.js` будує мапу за `code` БЕЗ фільтра за курсом).
--   Не чіпає жодної таблиці з даними учнів: `progress`, `quiz_attempts`,
--   `certificates`, `enrollments` тут не згадуються взагалі.
--
-- ІДЕМПОТЕНТНІСТЬ
--   Повний повторний запуск безпечний: `update ... set title = '<цільове>'`
--   вдруге записує те саме значення. Перевірка нижче теж пройде.
--
-- ОДНА ТРАНЗАКЦІЯ: помилка або спрацьована перевірка відкочують усі шість
-- апдейтів разом. Часткового застосування бути не може.
-- =====================================================================

begin;

update public.modules
   set title = 'Перша сесія: проси, дивись, дозволяй'
 where code = 'c04'
   and course_id = (select id from public.courses where slug = 'claude-code');

update public.modules
   set title = 'Режим плану й пісочниця'
 where code = 'c08'
   and course_id = (select id from public.courses where slug = 'claude-code');

update public.modules
   set title = 'Навички, команди, плагіни'
 where code = 'c14'
   and course_id = (select id from public.courses where slug = 'claude-code');

update public.modules
   set title = 'Перехоплювачі подій (hooks)'
 where code = 'c16'
   and course_id = (select id from public.courses where slug = 'claude-code');

update public.modules
   set title = 'Запуск без діалогу: Claude як утиліта'
 where code = 'c19'
   and course_id = (select id from public.courses where slug = 'claude-code');

update public.modules
   set title = 'Безпека, великі проєкти, куди далі'
 where code = 'c22'
   and course_id = (select id from public.courses where slug = 'claude-code');


-- ---------------------------------------------------------------------
-- Запобіжник: усі шість назв справді стали такими, як у конфізі
-- ---------------------------------------------------------------------
-- Потрібен саме тому, що `update` по неіснуючому коду НЕ помилка: він мовчки
-- оновлює 0 рядків. Без цієї перевірки помилка в коді виглядала б як успішне
-- застосування. Заразом звіряємо, що модулів у курсі так само 23 — тобто ми
-- нічого не створили й не видалили.

do $$
declare
  v_course uuid;
  v_ok     integer;
  v_total  integer;
begin
  select id into v_course from public.courses where slug = 'claude-code';
  if v_course is null then
    raise exception '005-2: курс claude-code не знайдено — застосовувати нічого';
  end if;

  select count(*) into v_ok
    from public.modules m
    join (values
      ('c04'::text, 'Перша сесія: проси, дивись, дозволяй'::text),
      ('c08',       'Режим плану й пісочниця'),
      ('c14',       'Навички, команди, плагіни'),
      ('c16',       'Перехоплювачі подій (hooks)'),
      ('c19',       'Запуск без діалогу: Claude як утиліта'),
      ('c22',       'Безпека, великі проєкти, куди далі')
    ) as v(code, title)
      on v.code = m.code and v.title = m.title
   where m.course_id = v_course;

  if v_ok <> 6 then
    raise exception
      '005-2: очікувалось 6 модулів із новими назвами, знайдено %. Транзакцію відкочено.',
      v_ok;
  end if;

  select count(*) into v_total from public.modules where course_id = v_course;
  if v_total <> 23 then
    raise exception
      '005-2: у курсі має бути 23 модулі, знайдено %. Транзакцію відкочено.',
      v_total;
  end if;
end $$;

commit;


-- =====================================================================
-- ЯК ПЕРЕВІРИТИ, ЩО ЗАСТОСУВАЛОСЬ (виконати після коміту)
-- =====================================================================

-- 1. Шість цільових модулів мають нові назви.
--    Очікувано: рівно 6 рядків, у кожного новій назві відповідає `так`.
select m.code, m.title
  from public.modules m
 where m.course_id = (select id from public.courses where slug = 'claude-code')
   and m.code in ('c04','c08','c14','c16','c19','c22')
 order by m.number;

-- 2. Жодної старої назви не лишилось.
--    Очікувано: 0 рядків.
select code, title
  from public.modules
 where course_id = (select id from public.courses where slug = 'claude-code')
   and title in (
     'Перша сесія: проси → дивись → підтверджуй',
     'Plan Mode й пісочниця',
     'Skills, команди, плагіни',
     'Hooks',
     'Headless і CI: Claude як утиліта',
     'Безпека, великі репо, куди далі'
   );

-- 3. Структура курсу не постраждала: 23 модулі, нумерація суцільна 1…23,
--    коди й номери унікальні, іспит так само 85.
--    Очікувано: modules=23, min_number=1, max_number=23,
--               unique_numbers=23, unique_codes=23, exam_score=85.
select count(*)                                        as modules,
       min(number)                                     as min_number,
       max(number)                                     as max_number,
       count(distinct number)                          as unique_numbers,
       count(distinct code)                            as unique_codes,
       max(passing_score) filter (where code = 'c23')  as exam_score
  from public.modules
 where course_id = (select id from public.courses where slug = 'claude-code');

-- 4. Байт-точна звірка з конфігом (те, чим шукались розходження).
--    Порівняти вивід із `md5` назв у `claude-code.config.json`.
--    Очікувано після міграції: усі 23 md5 збігаються з конфігом.
select code, md5(title) as title_md5, length(title) as len
  from public.modules
 where course_id = (select id from public.courses where slug = 'claude-code')
 order by number;


-- =====================================================================
-- ВІДКАТ
-- =====================================================================
-- Відкат ПОВНИЙ і БЕЗПЕЧНИЙ: змінюється лише текстове поле `title`, жодних
-- посилань на нього немає (FK дивляться на `modules.id`), дані учнів не
-- зачіпаються. Старі назви взяті з ЖИВОЇ бази 2026-09-05 (`select code, title`),
-- а не з транскрипції — це рівно те, що стояло до застосування.
--
-- УВАГА: відкат повертає базу до стану, який розходиться з конфігом і
-- з `<h1>` сторінок. Робити лише свідомо.
--
-- begin;
--
-- update public.modules set title = 'Перша сесія: проси → дивись → підтверджуй'
--  where code = 'c04' and course_id = (select id from public.courses where slug = 'claude-code');
-- update public.modules set title = 'Plan Mode й пісочниця'
--  where code = 'c08' and course_id = (select id from public.courses where slug = 'claude-code');
-- update public.modules set title = 'Skills, команди, плагіни'
--  where code = 'c14' and course_id = (select id from public.courses where slug = 'claude-code');
-- update public.modules set title = 'Hooks'
--  where code = 'c16' and course_id = (select id from public.courses where slug = 'claude-code');
-- update public.modules set title = 'Headless і CI: Claude як утиліта'
--  where code = 'c19' and course_id = (select id from public.courses where slug = 'claude-code');
-- update public.modules set title = 'Безпека, великі репо, куди далі'
--  where code = 'c22' and course_id = (select id from public.courses where slug = 'claude-code');
--
-- commit;
--
-- -- Перевірка відкату: очікувано 6 рядків.
-- -- select code, title from public.modules
-- --  where course_id = (select id from public.courses where slug = 'claude-code')
-- --    and title in ('Перша сесія: проси → дивись → підтверджуй', 'Plan Mode й пісочниця',
-- --                  'Skills, команди, плагіни', 'Hooks',
-- --                  'Headless і CI: Claude як утиліта', 'Безпека, великі репо, куди далі');
