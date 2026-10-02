---
name: aia-live-db-facts
description: Логіка сертифікатів і створення профілю живе ТІЛЬКИ в базі, не в репозиторії — три факти, звірені 2026-08-24, і як їх перевірити знову
metadata:
  type: project
---

Тіла RPC/тригерів AIA у git не лежать взагалі — їх видно лише через MCP. Три факти,
звірені 2026-08-24 (задача 001, Б0), кожен раніше був «невідомим» у планах:

1. **`maybe_issue_certificate` бере ім'я з `public.profiles`**, не з
   `auth.users.raw_user_meta_data`. Вставка з `on conflict do nothing` → повторний
   виклик не перевидає сертифікат і не оновлює ім'я (тобто ім'я в PDF — знімок).
   ⚠ **Виправлено 2026-09-03 міграцією 005-1, запис оновлено 2026-10-01:** було
   `coalesce(full_name, email, 'Студент')` — тобто при порожньому `full_name` у
   сертифікат ішов **email**, а `verify_certificate` віддавав його публічно за кодом.
   Стало `coalesce(nullif(btrim(full_name, E' \t\r\n'), ''), 'Студент')` —
   порожній рядок і самі пробіли теж не проходять. Звірено з живою базою 2026-10-01.
2. **`handle_new_user` — `SECURITY DEFINER`** (`search_path = public`), тригер
   `on_auth_user_created AFTER INSERT ON auth.users`. Тому міграція 002, яка забирає
   в `anon`/`authenticated` `INSERT` на `profiles`, реєстрацію **не ламає**.
   Функція вставляє ще й `enrollments` для безкоштовних курсів.
3. **На `certificates` тригерів немає.** У всій схемі `public` + `auth.users`
   не-внутрішніх тригерів рівно два: `on_auth_user_created` і `trg_notify_new_profile`.
   ⚠ Задача 013 додає третій (`trg_notify_new_certificate`) — але станом на 2026-10-01
   міграція **не застосована**, лежить файлом.

Дописано 2026-10-01 (задача 013, звірено наживо):

4. **`service_role` має `SELECT` на всі п'ять таблиць і `rolbypassrls = true`.** Тобто
   Edge Function із сервісним ключем читає будь-який звіт **без нової RPC** — а нова
   `SECURITY DEFINER` RPC у `public` отримала б `EXECUTE` для PUBLIC за замовчуванням,
   тобто новий публічний ендпоінт із даними учнів. У `admin_user_report` це колись уже
   закривали руками (її ACL тепер лише `postgres` + `service_role`).
5. **`admin_user_report()` рахує «усього модулів» по ВСІХ курсах** (`count(*) from modules`
   без фільтра). Відколи курсів чотири, колонка «усього» в «⬇️ Експорт» = 80 для кожного —
   число без сенсу. Дефект наявний, окремої задачі немає.
6. **`anon`/`authenticated` мають `INSERT/UPDATE/DELETE/TRUNCATE` на `certificates`,
   `progress`, `courses`, `modules`** і `DELETE/TRUNCATE` на `profiles`. Не експлуатується
   лише тому, що політик на запис не існує взагалі. Та сама конструкція, на якій згоріла
   002: гранти вже є, тож одна необережна дозвільна політика відкриє запис.
7. **Інфраструктура, яка вже є:** `pg_net` 0.20.3 (`net.http_post(url, body, params,
   headers, timeout_milliseconds)`, усі крім url з дефолтами) · `supabase_vault` 0.3.1
   (`vault.create_secret`, вигляд `vault.decrypted_secrets`; `SELECT` має `postgres`,
   `EXECUTE` на create_secret — `postgres`/`service_role`). **Vault порожній** (0 секретів).
   Схеми `supabase_functions` **немає** → Database Webhooks із Dashboard тут ніколи не
   вмикались, сповіщення йдуть тригером + `net.http_post`. PG 17.6.
8. **`profiles.created_at` = дата реєстрації.** Різниця з `auth.users.created_at` по всіх
   профілях ≤ 0,08 с, тож для звітів схему `auth` трогати не треба.

**Why:** плани PM позначають ці пункти як «⚠ не перевірено» і будують навколо них
обхідні контракти (напр. «писати ім'я в обидва сховища»). Знаючи факт, обхід не
потрібен — і навпаки, гадати тут заборонено правилами майстерні.

**How to apply:** перед тим, як планувати щось навколо сертифікатів, прогресу чи
створення профілю — **перечитати тіла функцій, а не покладатись на цей запис**:

```sql
select p.proname, p.prosecdef, pg_get_functiondef(p.oid)
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('maybe_issue_certificate','handle_new_user','submit_quiz');
```
Тригери — `pg_trigger` + `not tgisinternal`. Це читальні запити, вони дозволені.

Дотичне: [[aia-migration-002-pending]].
