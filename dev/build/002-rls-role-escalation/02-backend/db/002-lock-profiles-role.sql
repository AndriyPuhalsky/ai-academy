-- =============================================================================
-- 002 · Закрити ескалацію привілеїв через public.profiles.role
--
-- Автор:       коренева сесія, 2026-08-23 (звірка живої бази через Supabase MCP)
-- Застосовує:  ВЛАСНИК вручну — Supabase Dashboard → SQL Editor
-- Впливає на:  public.profiles (гранти на колонки + політика UPDATE)
-- Простій:     нульовий. Клієнт у profiles не пише взагалі (перевірено grep по js/).
-- =============================================================================
--
-- ЩО САМЕ ЛАГОДИМО
--
--   Ролі `anon` і `authenticated` мають UPDATE на ВСІ колонки public.profiles,
--   включно з `role`. Політика RLS `profiles_update` має лише
--   USING (id = auth.uid()) і НЕ має WITH CHECK — а коли WITH CHECK не заданий,
--   Postgres підставляє туди USING. Умова `id = auth.uid()` лишається істинною
--   і після зміни `role`, тому рядок проходить перевірку.
--
--   Наслідок: будь-який залогінений учень робить один запит
--       PATCH /rest/v1/profiles?id=eq.<свій-uuid>   {"role":"admin"}
--   і стає адміном. Далі is_admin() повертає true, і політики виду
--   `USING ((user_id = auth.uid()) OR is_admin())` віддають йому ВСЕ:
--   profiles (email + ПІБ усіх), progress, quiz_attempts, certificates,
--   payments, contact_messages (ПІБ, email, telegram, IP, текст звернення).
--
-- ЧОМУ ДВА ШАРИ ЗАХИСТУ
--   Гранти на колонки — головний замок: RLS узагалі не вміє обмежувати колонки.
--   Явний WITH CHECK — другий замок на випадок, якщо гранти колись відновлять
--   широким `grant all on all tables in schema public` (типовий Supabase-шаблон,
--   саме він, схоже, і створив цю ситуацію).
--
-- =============================================================================


-- ---------------------------------------------------------------------------
-- МІГРАЦІЯ — виконати блок цілком
-- ---------------------------------------------------------------------------
begin;

-- 1. Забрати право писати в profiles повністю…
revoke insert, update on public.profiles from anon, authenticated;

-- 2. …і повернути рівно те, що колись знадобиться легальній фічі «зміни своє ім'я».
--    `role`, `id`, `email`, `created_at` лишаються недосяжними з клієнта назавжди.
grant update (full_name) on public.profiles to authenticated;

-- 3. Явний WITH CHECK замість неявного успадкування з USING.
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update
  to authenticated
  using      (id = auth.uid())
  with check (id = auth.uid());

commit;


-- ---------------------------------------------------------------------------
-- ПЕРЕВІРКА — після застосування має бути порожньо (жодної UPDATE-привілеї
-- на колонках, крім full_name)
-- ---------------------------------------------------------------------------
-- select grantee, column_name, privilege_type
--   from information_schema.column_privileges
--  where table_schema = 'public' and table_name = 'profiles'
--    and grantee in ('anon','authenticated')
--    and privilege_type in ('INSERT','UPDATE')
--  order by grantee, column_name;
--
-- Очікуваний результат: рівно один рядок — authenticated / full_name / UPDATE.


-- ---------------------------------------------------------------------------
-- ВІДКАТ — повертає базу рівно в той стан, що був до міграції
-- (тобто ЗНОВУ ВІДКРИВАЄ дірку — застосовувати тільки якщо щось зламалось)
-- ---------------------------------------------------------------------------
-- begin;
--
-- drop policy if exists profiles_update on public.profiles;
-- create policy profiles_update on public.profiles
--   for update
--   using (id = auth.uid());
--
-- revoke update (full_name) on public.profiles from authenticated;
-- grant insert, update on public.profiles to anon, authenticated;
--
-- commit;
