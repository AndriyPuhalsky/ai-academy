# Воротний крок 005 — чи можна додавати третій курс

- **Задача:** ../task.md
- **Дата аудиту:** 2026-09-03 · гілка `dev`
- **Схему звірено з живою базою:** **ТАК.** Код усіх 9 функцій `public`, схема таблиць,
  індекси/унікальні обмеження та RLS-політики прочитані **з продової бази**
  (`hpcyrnxschpxlrxudmqk`) через Supabase Dashboard у браузері (Database → Functions /
  Tables / Indexes / Policies) + читальні запити до PostgREST з `anon`-ключем.
- **Змін у базі не робив.** Жодного `apply_migration`, `execute_sql`, INSERT/UPDATE/DELETE.
  SQL Editor не відкривав, «Run» не тиснув. Панелі `Edit` у Dashboard відкривались лише
  для читання і закривались через **Cancel** — `Save` не натискався ніде.

---

## Вердикт

**ПРОЙДЕНО.** Названий у плані блокер не підтвердився: розблокування модулів **скоуплене
за курсом**. `submit_quiz` делегує перевірку в `module_unlocked`, а та бере `course_id`
самого модуля і шукає попередній модуль запитом
`where course_id = v_course and number = v_number - 1`. Поява третього курсу з номерами
1…22 не може вплинути на два живі курси: їхні запити ніколи не виходять за межі власного
`course_id`. Другий підозрюваний — `maybe_issue_certificate` — теж чистий: кількість
модулів рахується динамічно (`count(*) from modules where course_id = p_course`), жодного
захардкодженого числа. `courses_read` і `modules_read` — `using (true)`, тож третій курс
стає публічно читабельним автоматично.

**Але задача не «просто вставити 23 рядки».** Аудит виявив три речі, яких у плані немає і
без яких курс буде мертвим або напівмертвим:

1. **`module_unlocked` вимагає активного запису в `enrollments`** — і це перша перевірка,
   ще до перевірки попереднього модуля. Немає рядка `enrollments(user_id, course_id,
   status='active')` → **жоден** модуль курсу не відкривається, включно з першим.
2. **Наявні учні автоматично не зарахуються.** `handle_new_user` — тригер на створення
   користувача; він зарахує в новий курс тільки тих, хто зареєструється **після** вставки
   курсу. Тим, хто вже в базі, потрібен окремий backfill у тій самій міграції.
3. **Курс має бути `is_paid = false`**, інакше `handle_new_user` не зарахує навіть нових
   (там стоїть `where c.is_paid = false`).

Плюс одна річ, яку треба знати, але яка нас не блокує: **Telegram-статистика третій курс
не побачить** — `admin_user_report` захардкодив `slug = 'ai-essentials'`.

---

## submit_quiz

Повний код із живої бази (`security definer`, `plpgsql`, повертає `jsonb`,
аргументи `p_module uuid, p_score integer`):

```sql
declare
  v_user   uuid := auth.uid();
  v_pass   integer;
  v_course uuid;
  v_ok     boolean;
begin
  if v_user is null then
    raise exception 'Не авторизовано';
  end if;

  select passing_score, course_id into v_pass, v_course from public.modules where id = p_module;
  if v_course is null then raise exception 'Модуль не знайдено';
  end if;

  if not public.module_unlocked(v_user, p_module) then
    raise exception 'Модуль ще заблоковано';
  end if;

  v_ok := p_score >= v_pass;

  insert into public.quiz_attempts (user_id, module_id, score, passed)
  values (v_user, p_module, p_score, v_ok);

  insert into public.progress (user_id, module_id, status, best_score, completed_at, updated_at)
  values (v_user, p_module,
          case when v_ok then 'completed' else 'in_progress' end::module_status,
          p_score, case when v_ok then now() end, now())
  on conflict (user_id, module_id) do update
    set best_score   = greatest(public.progress.best_score, excluded.best_score),
        status       = case when excluded.status = 'completed'
                       then 'completed' else public.progress.status end,
        completed_at = coalesce(public.progress.completed_at, excluded.completed_at),
        updated_at   = now();

  if v_ok then
    perform public.maybe_issue_certificate(v_user, v_course);
  end if;

  return jsonb_build_object('passed', v_ok, 'score', p_score, 'passing_score', v_pass);
end
```

### Розбір: як визначається «попередній модуль»

**Сама `submit_quiz` попередній модуль не шукає взагалі.** Вона робить три речі, важливі
для нашого питання:

1. Бере `passing_score` **і `course_id`** з рядка самого модуля — тобто курс завжди
   виводиться з `p_module`, ніколи не вгадується й не передається ззовні.
2. Делегує весь gate одному виклику `public.module_unlocked(v_user, p_module)` — фільтр за
   курсом живе там (розбір нижче).
3. Видачу сертифіката кличе строго для `v_course` того самого модуля.

**Фільтр за `course_id` є, глобального порядку немає.** Жодного звернення до
`sort_order`, жодного `where number = ... ` без курсу, жодного `limit 1` по всій таблиці
`modules`.

Три деталі, які варто мати на увазі при написанні контенту курсу:

- `p_score` приходить **з клієнта** і ніде не звіряється з реальними відповідями — сервер
  порівнює його з `passing_score` і вірить на слово. Це наявний стан, не наша задача,
  але «підвищений `passing_score` іспиту» захищає рівно настільки ж, наскільки й решта.
- `status` у `on conflict` рухається лише в один бік: раз `completed` — назавжди
  `completed` (зняти можна тільки через `uncomplete_module`). Перескладання іспиту з
  гіршим результатом статус не зіпсує.
- `maybe_issue_certificate` викликається після **кожного** успішного модуля, тож
  сертифікат видасться автоматично в момент здачі останнього — окремої кнопки не треба.

---

## Решта функцій

### `module_unlocked(p_user uuid, p_module uuid) → boolean` — тут і живе відповідь

```sql
declare
  v_course uuid;
  v_number integer;
  v_prev   uuid;
begin
  select course_id, number into v_course, v_number from public.modules where id = p_module;
  if v_course is null then return false; end if;

  if not exists (
    select 1 from public.enrollments
    where user_id = p_user and course_id = v_course and status = 'active'
  ) then
    return false;
  end if;

  if v_number <= 1 then return true; end if;

  select id into v_prev from public.modules where course_id = v_course and number = v_number - 1;
  return exists (
    select 1 from public.progress
    where user_id = p_user and module_id = v_prev and status = 'completed'
  );
end
```

**Чіпає її поява третього курсу? Ні — але вона диктує зміст міграції.**

- Рядок `where course_id = v_course and number = v_number - 1` — **прямий фільтр за
  курсом**. Це і є відповідь на головне питання: попередній модуль шукається в межах
  курсу, а не глобально.
- Фільтр не косметичний, а необхідний: унікальність номера в базі — `UNIQUE(course_id,
  number)`, тобто `number` **повторюється** між курсами (сьогодні 1…12 і 1…22, після нас
  ще 1…22). Без `course_id` цей `select ... into` уже сьогодні витягав би довільний із
  двох рядків.
- **Перевірка зарахування стоїть першою.** Емпірично підтверджено читальним викликом:
  для щойно згенерованого випадкового UUID (такого користувача в базі немає)
  `module_unlocked` повертає `false` навіть для перших модулів обох курсів — саме через
  цю гілку. Це і є пункт 1 і 2 вердикту.
- `v_number <= 1` — перший модуль відкритий без попереднього. Наш `c01` під це підпадає,
  окремої логіки не треба.

### `maybe_issue_certificate(p_user uuid, p_course uuid) → void`

```sql
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
    select coalesce(full_name, email, 'Студент') into v_name
      from public.profiles where id = p_user;

    -- Короткий код для перевірки: 12 hex-символів з UUID, без pgcrypto
    v_code := replace(gen_random_uuid()::text, '-', '');
    v_code := substr(v_code, 1, 12);

    insert into public.certificates (user_id, course_id, public_code, full_name)
    values (p_user, p_course, v_code, v_name)
    on conflict (user_id, course_id) do nothing;
  end if;
end
```

**Другий блокер із ТЗ знято: захардкодженої кількості модулів немає.** `v_total` рахується
запитом по `course_id`, тож 22 модулі нашого курсу відпрацюють так само, як 12 і 22 у
наявних. Умова `v_total > 0` заодно захищає від видачі сертифіката за курс без модулів —
тобто **вставляти курс і модулі можна однією транзакцією без ризику**, але вставити курс
без модулів і залишити так надовго не можна плутати з «нічого не станеться»: поки модулів
0, `v_total = 0` і сертифікат не видасться, що правильно.

Що варто врахувати:

- `on conflict (user_id, course_id) do nothing` + `UNIQUE(user_id, course_id)` →
  **сертифікат є знімком, а не посиланням.** Ім'я фіксується в мить видачі; зміна
  `profiles.full_name` пізніше сертифікат не переписує.
- **Підтверджено дефект із задачі 004:** `coalesce(full_name, email, 'Студент')` — при
  порожньому імені в сертифікат друкується **email**, і `verify_certificate` віддає це
  поле кожному, хто знає публічний код. `certificates` досі 0 рядків, тож вікно
  «виправити до першої видачі» ще відкрите — але наш курс це вікно **закриває**, бо після
  запуску 005 з'являться реальні випускники. Це аргумент зробити 004 **до** релізу 005.

### `uncomplete_module(p_module uuid) → void`

```sql
begin
  if auth.uid() is null then
    raise exception 'Не авторизовано';
  end if;

  update public.progress
     set status = 'in_progress',
         completed_at = null,
         updated_at = now()
   where user_id = auth.uid()
     and module_id = p_module;
end
```

Працює з одним рядком за `module_id`, курсу не знає й не потребує. **Поява третього курсу
її не чіпає взагалі.** Бере `auth.uid()` сама (не параметром) — тобто чужий прогрес зняти
не можна.

### `verify_certificate(p_code text) → TABLE(full_name text, course_title text, issued_at timestamptz)`

```sql
select c.full_name, co.title, c.issued_at
from public.certificates c
join public.courses co on co.id = c.course_id
where c.public_code = p_code;
```

Мова `sql`, `security definer`, відкрита для `anon` — так і задумано, це публічна
перевірка. **Третій курс підхопиться сам**, єдина вимога — заповнений `courses.title`
(саме він друкується як назва курсу на сторінці перевірки). Ніяких списків курсів,
ніяких умов на `course_id`. Перевірено живим викликом із неіснуючим кодом — повертає `[]`.

### `admin_user_report() → TABLE(email, full_name, role, registered, completed, total, certificate)`

```sql
with ess as (select id from public.courses where slug = 'ai-essentials' limit 1)
select
  p.email,
  p.full_name,
  p.role::text,
  p.created_at,
  (select count(*)::int
     from public.progress pr
     join public.modules m on m.id = pr.module_id
    where pr.user_id = p.id
      and pr.status = 'completed'
      and m.course_id = (select id from ess)),
  (select count(*)::int
     from public.modules m
    where m.course_id = (select id from ess)),
  exists(
    select 1 from public.certificates c
     where c.user_id = p.id and c.course_id = (select id from ess)
  )
from public.profiles p
order by p.created_at desc;
```

**Це відповідь на пункт 5 ТЗ про Telegram-статистику — і вона неприємна.** Захардкоджені
двох курсів немає; захардкоджено **один**: `slug = 'ai-essentials'` (AI Академія).

Наслідки:

- **Нічого не зламається.** Третій курс просто не потрапить у `/stats` і `/export`, як не
  потрапляє сьогодні AI Architect. Це існуючий стан, а не регресія від нашої задачі.
- `tg/telegram_index.ts` **своїх захардкоджених курсів не має** — перевірено весь файл
  (253 рядки). Він викликає `admin_user_report()` без параметрів (`actionStats`,
  `actionExport`) і окремо читає `contact_messages`. Уся курсова логіка — у SQL-функції.
  Тобто **правити Edge Function не треба**; якщо власник захоче бачити три курси в боті —
  це заміна тіла `admin_user_report`, окрема задача, окреме рішення.
- Рядок `Завершили курс: ${finished}` у боті рахується як `total > 0 && completed >= total`
  по цьому одному курсу. Поки функцію не змінили, число лишається про AI Академію.

### `handle_new_user() → trigger` — **найважливіше для міграції**

```sql
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;

  insert into public.enrollments (user_id, course_id)
  select new.id, c.id from public.courses c where c.is_paid = false
  on conflict (user_id, course_id) do nothing;

  return new;
end
```

Читати цей код треба разом із перевіркою зарахування в `module_unlocked`:

- **Зарахування динамічне за `is_paid = false`.** Вставили курс із `is_paid = false` — і
  кожен, хто зареєструється **після** цього, автоматично отримає до нього доступ.
  Правити тригер не треба.
- **Але тригер спрацьовує лише на створення користувача.** Наявні акаунти (на момент
  звірки — `count(*) profiles` = 3, `count(*) enrollments` = 6, тобто рівно 3 × 2 курси)
  нових рядків не отримають. Без backfill вони побачать курс у каталозі, натиснуть перший
  модуль — і сервер відповість «Модуль ще заблоковано», хоча жодного попереднього модуля
  не існує. **Це найімовірніший баг релізу 005, і він виглядатиме як дефект коду.**
- Якщо курс завести з `is_paid = true` (наприклад «поки сховаємо»), не зарахуються навіть
  нові користувачі. Курс має бути **безкоштовним із самого початку**.

### `is_admin() → boolean` і `notify_new_profile() → trigger`

Свідомо не читав тіла й **не чіпаю**: до питання третього курсу не дотичні.
`is_admin()` викликається всередині RLS-політик і забирати в неї права не можна
(зафіксовано в кореневому `CLAUDE.md`). `notify_new_profile()` — тригер сповіщення про
реєстрацію; він шле адміну ім'я та email, курсів не знає.

---

## Схема таблиць

Тільки структура. Рядків із живих таблиць у звіті немає; обсяги — лічильниками.

### `courses` — 8 колонок

| Колонка | Тип | NULL | Default / обмеження |
| --- | --- | --- | --- |
| `id` | uuid | NOT NULL | PRIMARY KEY (`courses_pkey`) |
| `slug` | text | NOT NULL | **UNIQUE** (`courses_slug_key`) |
| `title` | text | NOT NULL | друкується в сертифікаті й на сторінці перевірки |
| `is_paid` | bool | NOT NULL | **керує авто-зарахуванням** у `handle_new_user` |
| `price_uah` | int4 | NULL | — |
| `description` | text | NULL | — |
| `sort_order` | int4 | NOT NULL | **default `0`** (звірено в Dashboard) |
| `created_at` | timestamptz | NOT NULL | має default (рядки створюються без нього) |

### `modules` — 8 колонок

| Колонка | Тип | NULL | Default / обмеження |
| --- | --- | --- | --- |
| `id` | uuid | NOT NULL | PRIMARY KEY |
| `course_id` | uuid | NOT NULL | FK → `courses.id`, індекс `idx_modules_course` |
| `code` | text | NOT NULL | **UNIQUE(course_id, code)** — див. пастку нижче |
| `number` | int4 | NOT NULL | **UNIQUE(course_id, number)** — фактичний ключ порядку |
| `slug` | text | NOT NULL | **унікальності НЕМАЄ** — ні глобальної, ні в межах курсу |
| `title` | text | NOT NULL | — |
| `passing_score` | int4 | NOT NULL | у всіх 34 наявних модулях = `70` |
| `sort_order` | int4 | NOT NULL | **у всіх 34 модулях = `0`, тобто не використовується** |

### `enrollments` — 5 колонок

| Колонка | Тип | NULL | Default / обмеження |
| --- | --- | --- | --- |
| `id` | uuid | NOT NULL | PRIMARY KEY |
| `user_id` | uuid | NOT NULL | FK, індекс `idx_enroll_user` |
| `course_id` | uuid | NOT NULL | FK → `courses.id` |
| `status` | `enrollment_status` | NOT NULL | **default `'active'`** (звірено в Dashboard) |
| `granted_at` | timestamptz | NOT NULL | має default |
| | | | **UNIQUE(user_id, course_id)** |

### `progress` — 7 колонок

`id` uuid PK · `user_id` uuid · `module_id` uuid FK → `modules.id` ·
`status` `module_status` · `best_score` · `updated_at` · `completed_at`.
**UNIQUE(user_id, module_id)** (`progress_user_id_module_id_key`), індекс `idx_progress_user`.

**`course_id` у `progress` НЕМАЄ** — курс завжди виводиться join-ом до `modules`.
Це підтверджено і probe-ом схеми, і кодом усіх функцій.

### `quiz_attempts` — 6 колонок

`id` uuid PK · `user_id` · `module_id` FK → `modules.id` · `score` · `passed` bool ·
`created_at`. **`course_id` теж немає.** Унікальних обмежень, крім PK, немає — тобто
спроб може бути скільки завгодно, це журнал.

### `certificates` — 6 колонок

`id` uuid PK · `user_id` · `course_id` FK → `courses.id` · `public_code` ·
`full_name` · `issued_at`.
**UNIQUE(public_code)** (`certificates_public_code_key`) і
**UNIQUE(user_id, course_id)** (`certificates_user_id_course_id_key`).

### Enum-типи (звірено читальними probe-ами)

| Тип | Значення, існування яких підтверджено |
| --- | --- |
| `module_status` | `not_started`, `in_progress`, `completed` |
| `enrollment_status` | `active`, `revoked` |
| `user_role` | `student`, `admin` |
| `payment_status` | `pending`, `paid`, `failed`, `expired` |

Перелік отриманий перебором кандидатів (валідне значення → 200, невалідне → 400), тому
він **повний лише в межах перевірених слів**. Для міграції достатньо: потрібні нам
`'active'` і `'completed'` підтверджені.

### RLS і гранти

| Таблиця | Політики | Умова |
| --- | --- | --- |
| `courses` | `courses_read` SELECT to public | **`using (true)`** |
| `modules` | `modules_read` SELECT to public | **`using (true)`** |
| `certificates` | `cert_select` SELECT | — |
| `enrollments` | `enroll_select` SELECT | — |
| `progress` | `progress_select` SELECT | — |
| `quiz_attempts` | `attempts_select` SELECT | — |
| `payments` | `payments_select` SELECT | — |
| `contact_messages` | `contact_messages: admin read` SELECT | — |
| `profiles` | `profiles_select` SELECT · `profiles_update` UPDATE **to authenticated** | — |

**Політик на INSERT/UPDATE/DELETE немає ніде, крім `profiles_update`** — конструкція
збережена: усі записи йдуть через `SECURITY DEFINER` RPC і Edge Function. RLS увімкнена
на всіх дев'яти таблицях `public`.

**Умов на конкретні `course_id` немає в жодній політиці.** `courses_read` і `modules_read`
прочитані повністю — обидві `to public using (true)`. Отже **публічне читання накриє
третій курс автоматично**; додавати чи правити політики для 005 не потрібно.

Фікс задачі 002 у базі **застосований і тримається**: `profiles` позначена в Dashboard як
`API DISABLED` («custom Data API permissions»), `profiles_update` обмежена роллю
`authenticated`. Нічого переробляти не треба.

---

## Що це означає для міграції 005

### Порядок вставки — строго такий

1. **`courses`** — один рядок. Далі все посилається на його `id`.
2. **`modules`** — 22 рядки, усі з `course_id` нового курсу.
3. **`enrollments` — backfill наявних користувачів.** Без цього кроку курс не працює для
   тих, хто вже зареєстрований.

Кроки 1–3 мають бути **в одній транзакції**. Порядок 1→2 диктує FK; крок 3 має йти після
1, бо потребує `course_id`.

### Курс: обов'язкові колонки

| Колонка | Значення | Чому саме так |
| --- | --- | --- |
| `slug` | напр. `ai-terminal` | UNIQUE — має не збігтися з наявними двома |
| `title` | назва курсу | йде в PDF-сертифікат і на сторінку `/verify` |
| `is_paid` | **`false`** | інакше `handle_new_user` не зарахує навіть нових |
| `sort_order` | `3` явно (default `0`) | у наявних курсів свої значення; краще задати |
| `id`, `created_at` | не задавати | є default |
| `description`, `price_uah` | опційно / `null` | NULLABLE |

Ідемпотентність: `insert ... on conflict (slug) do nothing` — унікальний індекс на `slug`
для цього придатний.

### Модулі: обов'язкові колонки й допустимі значення

| Колонка | Значення |
| --- | --- |
| `course_id` | id нового курсу (брати підзапитом за `slug`, не літералом) |
| `code` | `c01`…`c21` + `c22` (іспит) |
| `number` | `1`…`22`, **без дірок і без повторів** |
| `slug` | шлях сторінки модуля; узгодити з фронтендером |
| `title` | назва |
| `passing_score` | `70` для `c01`…`c21`, підвищений для `c22` (рішення власника) |
| `sort_order` | `0` (як у решти) — поле фактично не використовується |

Ідемпотентність: `on conflict (course_id, code) do nothing`.

**`number` мусить бути суцільним 1…22.** `module_unlocked` шукає рівно `number - 1`
у межах курсу: дірка в нумерації → модуль після дірки не відкриється **ніколи**, бо
`v_prev` буде `null` і `exists(...)` поверне `false`. Це не «поганий UX», це тупик без
обхідного шляху з клієнта. Іспит `c22` має бути `number = 22`, одразу після `c21`.

### Backfill зарахувань — обов'язковий крок, якого немає в плані

```sql
insert into public.enrollments (user_id, course_id)
select p.id, c.id
  from public.profiles p
  cross join public.courses c
 where c.slug = '<slug нового курсу>'
on conflict (user_id, course_id) do nothing;
```

`status` і `granted_at` не задаються — беруться з default (`'active'` / now).
Це дзеркалить те, що робить `handle_new_user` для нових користувачів.
Ідемпотентно завдяки `UNIQUE(user_id, course_id)`.

### Що може зламатись

| Ризик | Наслідок | Чим закривається |
| --- | --- | --- |
| **Забути backfill `enrollments`** | наявні учні бачать курс, але перший модуль дає «Модуль ще заблоковано» | крок 3 міграції |
| **`is_paid = true`** | нові користувачі теж не зараховуються | `is_paid = false` |
| **Дірка або дубль у `number`** | модулі після дірки недосяжні назавжди | суцільні 1…22 + `UNIQUE(course_id, number)` спіймає дубль |
| **`code` збігається з наявним** | див. окремий блок нижче — **тиха поломка чужого курсу** | префікс `c` |
| **Порожній `courses.title`** | сертифікат і `/verify` покажуть порожню назву | NOT NULL, але порожній рядок пройде — заповнити змістовно |
| Вставити курс без модулів | сертифікат не видасться (`v_total > 0`), каталог покаже порожнечу | одна транзакція |

### Окремо: `code` унікальний **у межах курсу**, а клієнт читає його **глобально**

Це найтонше місце всієї задачі, і воно не в базі, а на стику бази з `js/auth.js`.

- У базі стоїть `UNIQUE(course_id, code)` — тобто СУБД **дозволить** модулю третього курсу
  мати той самий `code`, що й модуль AI Академії.
- А `js/auth.js:174-178` будує мапу **без фільтра за курсом**:
  `select("id, code")` по всій таблиці `modules`, далі `map[m.code] = m.id`. При збігу
  кодів один модуль **мовчки затирає інший** у `window.AIA_MODULE_MAP`.
- Наслідок був би такий: учень AI Академії тисне «завершити модуль», `js/progress.js`
  бере UUID із мапи — і надсилає `submit_quiz` для модуля **чужого курсу**. Сервер чесно
  відповість «Модуль ще заблоковано», бо там немає зарахування чи попереднього модуля.
  Виглядало б як зламане розблокування живого курсу — рівно той сценарій, якого боявся
  план, тільки причина інша.
- **Нас це не зачіпає:** `c01`…`c22` не перетинаються з `m01`…`m12` і `a01`…`a22`
  (перевірено читанням усіх 34 наявних кодів — усі унікальні глобально).
- Так само глобально, без фільтра за курсом, працює `hydrateProgress` (`js/auth.js:204-208`,
  читає весь `progress` і кладе коди в один кеш) і `js/certificate.js` (читає всі
  сертифікати користувача). Обидва місця **коректні саме тому**, що префікси кодів різні.

**Висновок:** префікс `c` — не косметика, а несуча конструкція. Це варто зафіксувати в
плані як обмеження, а не як стильову угоду. Розширювати `buildModuleMap` фільтром за
курсом у межах 005 **не пропоную** — це зачепить обидва живі курси й виходить за обсяг
воротного кроку.

### Чого міграція робити НЕ повинна

- **Не чіпати `submit_quiz`, `module_unlocked`, `maybe_issue_certificate`,
  `uncomplete_module`, `verify_certificate`** — усі коректні для N курсів. Виняток із
  `task.md` («лише якщо воротний крок покаже дефект у `submit_quiz`») **не настав**.
- **Не чіпати `handle_new_user`** — він уже динамічний за `is_paid`.
- **Не додавати політик RLS і грантів** — `using (true)` уже покриває.
- **Не чіпати `admin_user_report`** без окремого рішення власника (див. нижче).
- **Не чіпати `payments`** — 0 рядків, заготовка під платні курси.

---

## Знайдене поза обсягом (не виправляв, виношу на рішення)

1. **`admin_user_report` бачить лише один курс** (`slug = 'ai-essentials'`). Після 005 бот
   рапортуватиме про 1 курс із 3. Не блокер релізу, але власнику варто вирішити, чи
   переписувати функцію на «по всіх курсах» — це окрема міграція.
2. **Email у сертифікаті (задача 004)** підтверджений у живому коді:
   `coalesce(full_name, email, 'Студент')`. `certificates` = 0 рядків, тож правити ще
   можна «до першої видачі» — **але 005 і є та подія, що це вікно закриє.** Рекомендую
   застосувати 004 до релізу 005.
3. **`maybe_issue_certificate(p_user, …)` і `module_unlocked(p_user, …)` беруть користувача
   параметром і не звіряють його з `auth.uid()`**, EXECUTE відкритий. Підтверджено:
   я викликав `module_unlocked` з довільним UUID і отримав відповідь. Підробити сертифікат
   не дає (перевірка «всі модулі пройдені» всередині), але шаблон поганий — зафіксовано
   ще у findings 002, стан не змінився.
4. **`modules.sort_order` = 0 у всіх 34 рядках** — колонка NOT NULL, існує, але жодна
   функція її не читає; порядок тримається на `number`. Мертве поле; чистити не пропоную,
   але й покладатись на нього не можна.
5. **`modules.slug` без унікального обмеження** — два модулі (навіть у межах курсу) можуть
   мати однаковий slug. `js/module.js:384-385` шукає модуль за slug у конфігу, тож дубль
   дав би неправильну навігацію. Для 005 достатньо дисципліни при складанні `modules`.

---

## Чого звірити не вдалося

- **Supabase MCP** для мене так і лишився недоступним: у моєму тулсеті присутні лише
  `mcp__supabase__authenticate` / `complete_authentication`, робочих інструментів
  (`execute_sql`, `list_tables`, `get_advisors`) немає. Тулсет підагента фіксується в
  момент запуску, тому автентифікація власника вже після старту сесії мене не дістає.
  **Це не вплинуло на результат:** усе, що потрібно, прочитано через Dashboard у браузері.
  Наступному підагенту MCP, найімовірніше, буде видно одразу.
- **Тіла `is_admin()` і `notify_new_profile()`** не читав — свідомо, поза обсягом (див. вище).
- **Точні `count(*)` на момент цього аудиту** я не переміряв: `profiles`, `enrollments`
  та інші закриті RLS для `anon`, а SQL Editor мені заборонений. Цифри 3 профілі /
  6 зарахувань узяті зі звірки 2026-08-23 (`002-.../findings.md`) — Dashboard сьогодні
  показав `enrollments` = 6 рядків, що з нею збігається, але `profiles` не підтверджував.
  **Для міграції це не критично:** backfill написаний як `select ... from profiles`, тож
  він накриє скільки б їх не було.
- **Default для `courses.created_at`, `modules.passing_score`, `modules.sort_order`,
  `enrollments.granted_at`** окремо не відкривав. Наявність default виведена з того, що
  колонки NOT NULL, а `handle_new_user` вставляє рядки без них. Для міграції обходимо
  питання, задаючи `passing_score` і `sort_order` явно.
- **Повний перелік значень enum-типів** отриманий перебором кандидатів, а не читанням
  `pg_enum`. Потрібні нам `'active'` і `'completed'` підтверджені точно; що в
  `enrollment_status` немає третього, невгаданого значення — не гарантую.
- **Тригери** (окрім факту, що `handle_new_user` і `notify_new_profile` існують як
  trigger-функції) сторінку Database → Triggers не відкривав: на якій саме таблиці й події
  висить `handle_new_user`, з коду функції не видно. Логіка вказує на `auth.users` AFTER
  INSERT, і це узгоджується з даними (3 профілі × 2 курси = 6 зарахувань), але **як факт
  не подаю**. Якщо це важливо для міграції — варто перевірити перед застосуванням.
