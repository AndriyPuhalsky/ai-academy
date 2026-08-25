---
name: aia-live-db-facts
description: Логіка сертифікатів і створення профілю живе ТІЛЬКИ в базі, не в репозиторії — три факти, звірені 2026-08-24, і як їх перевірити знову
metadata:
  type: project
---

Тіла RPC/тригерів AIA у git не лежать взагалі — їх видно лише через MCP. Три факти,
звірені 2026-08-24 (задача 001, Б0), кожен раніше був «невідомим» у планах:

1. **`maybe_issue_certificate` бере ім'я з `public.profiles`:**
   `coalesce(full_name, email, 'Студент')`. Не з `auth.users.raw_user_meta_data`.
   Наслідок, який легко проґавити: коли `full_name` порожній, у сертифікат іде
   **email**, а не «Студент». Вставка з `on conflict do nothing` → повторний виклик
   не перевидає сертифікат і не оновлює ім'я.
2. **`handle_new_user` — `SECURITY DEFINER`** (`search_path = public`), тригер
   `on_auth_user_created AFTER INSERT ON auth.users`. Тому міграція 002, яка забирає
   в `anon`/`authenticated` `INSERT` на `profiles`, реєстрацію **не ламає**.
   Функція вставляє ще й `enrollments` для безкоштовних курсів.
3. **На `certificates` тригерів немає.** У всій схемі `public` + `auth.users`
   не-внутрішніх тригерів рівно два: `on_auth_user_created` і `trg_notify_new_profile`.

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
