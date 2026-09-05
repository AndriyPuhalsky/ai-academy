-- =====================================================================
-- 005-4 · Прибрати тестовий акаунт QA-прогону «QA Тест 005» повністю
-- =====================================================================
-- Задача:      dev/build/005-ai-terminal/task.md, п. 14, 20, 23, 25
-- Автор:       коренева сесія · Дата: 2026-09-05 · Гілка: dev
-- Застосовує:  ВЛАСНИК вручну (Supabase Dashboard → SQL Editor).
--
-- ⚠️ ЗАПУСКАТИ ЛИШЕ ПІСЛЯ ЗАВЕРШЕННЯ QA КОЛА 3 — воно працює саме цим акаунтом.
--
-- ЩО РОБИТЬ: один `delete` з `auth.users`. Решта йде каскадом (звірено з живою
-- базою 2026-09-05 через pg_constraint):
--   auth.users ─ON DELETE CASCADE→ public.profiles
--   public.profiles ─ON DELETE CASCADE→ enrollments, progress, quiz_attempts,
--                                       certificates, payments
--   auth.identities / auth.sessions / auth.refresh_tokens — каскад самого Supabase.
-- Тригерів на DELETE у цих таблицях немає (є лише on-insert: handle_new_user,
-- notify_new_profile), тож сповіщень у Telegram не буде.
--
-- ⚠️ ВІДКАТ НЕМОЖЛИВИЙ: сертифікат, виданий у колі 3, зникне разом з акаунтом;
-- його public_code генерується випадково. Якщо код потрібен «на памʼять» —
-- зніми крок 0 ДО запуску й збережи поза репозиторієм (git публічний).
--
-- ЗАПОБІЖНИК: транзакція падає, якщо під умову підпадає не рівно ОДИН профіль.
-- =====================================================================

-- ---------- Крок 0 · що зараз є (тільки читання, запусти окремо) ----------
-- with u as (select id from public.profiles where full_name = 'QA Тест 005')
-- select 'profiles' as t, count(*) from u
-- union all select 'enrollments',   count(*) from public.enrollments   where user_id in (select id from u)
-- union all select 'progress',      count(*) from public.progress      where user_id in (select id from u)
-- union all select 'quiz_attempts', count(*) from public.quiz_attempts where user_id in (select id from u)
-- union all select 'certificates',  count(*) from public.certificates  where user_id in (select id from u)
-- union all select 'auth.users',    count(*) from auth.users           where id      in (select id from u);

-- ---------- Крок 1 · видалення ----------
begin;

do $$
declare
  n_profiles int;
  v_id uuid;
begin
  select count(*), min(id) into n_profiles, v_id
    from public.profiles
   where full_name = 'QA Тест 005';

  if n_profiles <> 1 then
    raise exception '005-4: очікувався рівно 1 профіль «QA Тест 005», знайдено % — нічого не видалено', n_profiles;
  end if;

  delete from auth.users where id = v_id;

  if (select count(*) from public.profiles where id = v_id) <> 0 then
    raise exception '005-4: профіль не зник після delete з auth.users — каскад не спрацював';
  end if;
end $$;

commit;

-- ---------- Крок 2 · перевірка після (очікувано всюди 0) ----------
-- select 'profiles' as t, count(*) from public.profiles where full_name = 'QA Тест 005'
-- union all select 'certificates_total', count(*) from public.certificates;
