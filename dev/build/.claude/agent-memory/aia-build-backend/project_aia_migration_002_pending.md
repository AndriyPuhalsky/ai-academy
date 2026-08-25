---
name: aia-migration-002-pending
description: Дірка ескалації привілеїв через profiles.role станом на 2026-08-24 ще ВІДКРИТА — перевіряти стан перед будь-якою роботою з правами
metadata:
  type: project
---

Міграція `dev/build/002-rls-role-escalation/02-backend/db/002-lock-profiles-role.sql`
станом на **2026-08-24 не застосована**: `anon`/`authenticated` досі мають `UPDATE`
на всі п'ять колонок `public.profiles`, включно з `role`, а політика `profiles_update`
має `USING (id = auth.uid())` і `WITH CHECK = null`.

**Why:** застосовує її тільки власник вручну, і це вже кілька днів у черзі. Будь-який
код, що торкається `profiles`, має працювати **в обох станах бази** — інакше він
зламається саме в момент, коли власник нарешті натисне «Run» у проді.

**How to apply:**
- перед плануванням прав — перевірити стан, не вірити запису:
  ```sql
  select grantee, column_name, privilege_type from information_schema.column_privileges
  where table_schema='public' and table_name='profiles'
    and grantee in ('anon','authenticated') and privilege_type in ('INSERT','UPDATE');
  ```
  Один рядок (`authenticated / full_name / UPDATE`) = 002 застосовано;
- 002 свідомо зберігає `grant update (full_name) to authenticated` — саме під фічу
  «зміни своє ім'я» із задачі 001, тож прямий
  `sb.from("profiles").update({full_name}).eq("id", user.id)` коректний і до, і після;
- 002 не чіпає `enrollments` і не заважає `handle_new_user` — див. [[aia-live-db-facts]];
- після застосування власником — запис у `tg/CHANGELOG.md` (вимога кореневого CLAUDE.md).
