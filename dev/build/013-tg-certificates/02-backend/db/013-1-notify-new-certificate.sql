-- ============================================================================
-- 013-1 · Сповіщення адміну в Telegram про новий сертифікат
-- Задача: dev/build/013-tg-certificates/ (ТЗ і рішення власника — task.md)
-- Дата:   2026-10-01
-- Бекап стану «до»: 013-0-backup-before.sql (функції не було, тригерів на
--                   certificates не було, Vault був порожній)
--
-- ЩО РОБИТЬ
--   1. Створює функцію public.notify_new_certificate(): на кожну вставку рядка
--      в public.certificates шле POST у Edge Function "telegram" тим самим
--      форматом, який бот уже розуміє для реєстрацій:
--        { "type": "INSERT", "table": "certificates", "record": <новий рядок> }
--      із заголовком x-webhook-secret.
--   2. Створює тригер trg_notify_new_certificate AFTER INSERT ON certificates.
--
--   Текст повідомлення складає БОТ (tg/telegram_index.ts → notifyNewCertificate),
--   а не база: формулювання тоді правиться деплоєм функції, без міграції.
--
-- ЧОМУ САМЕ ТАК
--   • Тригер + pg_net, а не Database Webhook із Dashboard: так уже працює
--     сповіщення про реєстрацію (trg_notify_new_profile + net.http_post).
--     Схеми supabase_functions у проєкті немає зовсім — вебхуки з Dashboard тут
--     ніколи не вмикались, і заводити нову інфраструктуру заради однієї
--     вставки на місяць немає сенсу.
--   • Секрет НЕ літералом у файлі: читається з Supabase Vault
--     (vault.decrypted_secrets, ім'я 'telegram_webhook_secret'). Репозиторій
--     публічний, тож значення секрету тут бути не може. Як секрет туди
--     потрапляє — КРОК 0 нижче.
--   • AFTER INSERT + обробник винятків на все тіло: сертифікат вставляє
--     maybe_issue_certificate(), яку викликає submit_quiz() при здачі останнього
--     іспиту. Якби тригер кинув помилку, транзакція відкотилась би і УЧЕНЬ НЕ
--     ЗМІГ БИ ЗАВЕРШИТИ КУРС. Сповіщення має право не дійти (тоді причина
--     лишається warning'ом у логах Postgres); видача сертифіката — ні.
--   • SECURITY DEFINER потрібен, щоб прочитати vault.decrypted_secrets (SELECT
--     на цей вигляд має postgres, не anon/authenticated). search_path = '' і
--     повні імена схем — обов'язкові: SECURITY DEFINER із рухомим search_path
--     це класична дірка (підміна функції своєю).
--   • EXECUTE на функцію свідомо НЕ відкликається: тіло тригерної функції
--     повертає trigger, тож прямий виклик (у т.ч. через PostgREST) одразу падає
--     на «can only be called as a trigger» і нічого не робить. Натомість
--     відкликання EXECUTE — це ненульовий ризик для вставки сертифіката,
--     а вона тут головніша.
--
-- ⚠ ВІДКАТ — В КІНЦІ ФАЙЛА, ЗАКОМЕНТОВАНИЙ. НЕ ЗАПУСКАТИ РАЗОМ З ЦИМ ФАЙЛОМ.
--   (У задачі 012 файл одного разу виконали цілком разом із розкоментованим
--    відкатом: курс додався й одразу зник, а редактор показав «Success».)
-- ============================================================================


-- ============================================================================
-- КРОК 0 (одноразовий, ВИКОНУЄТЬСЯ ОКРЕМО, НЕ ЧАСТИНА ЦІЄЇ МІГРАЦІЇ)
-- ============================================================================
-- Секрет вебхука має лежати у Vault під іменем 'telegram_webhook_secret'.
-- Це те саме значення, що в секреті WEBHOOK_SECRET Edge Functions.
--
-- Значення в цей файл не вписується НІКОЛИ. Варіанти, як його туди покласти:
--
--   (а) вручну, підставивши своє значення замість <СЕКРЕТ> і запустивши рядок
--       в SQL Editor (у репозиторій цей рядок із підставленим значенням
--       НЕ КОМІТИТИ):
--
--       select vault.create_secret('<СЕКРЕТ>', 'telegram_webhook_secret',
--              'Секрет Database Webhook → Edge Function telegram (013)');
--
--   (б) перенести значення з наявного місця, НЕ показуючи його на екрані
--       (саме так це зробила сесія 013: значення вже лежало літералом у тілі
--        public.notify_new_profile(), запит переносить його в Vault, нічого не
--        друкуючи). Такий запит у репозиторії не зберігається, бо залежить від
--        точного виду того тіла.
--
-- Перевірка (значення не показує):
--   select name, length(decrypted_secret) > 0 as not_empty
--     from vault.decrypted_secrets where name = 'telegram_webhook_secret';
--
-- Якщо секрету у Vault немає, міграція нижче однаково застосується, тригер
-- спрацює, але сповіщення не піде, а в логах Postgres буде WARNING
-- «013: секрет telegram_webhook_secret не знайдено у Vault». Видача
-- сертифіката при цьому не ламається — так і задумано.


-- ============================================================================
-- 1. Функція
-- ============================================================================
create or replace function public.notify_new_certificate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_secret text;
  -- URL Edge Function. Не секрет: project ref публічний (він у config.json
  -- сайту), а доступ закриває заголовок x-webhook-secret + verify_jwt=false.
  v_url text := 'https://hpcyrnxschpxlrxudmqk.supabase.co/functions/v1/telegram';
begin
  -- Усе тіло в обробнику винятків: жодна проблема зі сповіщенням не має права
  -- скасувати вставку сертифіката (див. шапку файла).
  begin
    select s.decrypted_secret into v_secret
      from vault.decrypted_secrets s
     where s.name = 'telegram_webhook_secret'
     limit 1;

    if v_secret is null or v_secret = '' then
      raise warning '013: секрет telegram_webhook_secret не знайдено у Vault — сповіщення про сертифікат не надіслано';
      return new;
    end if;

    -- net.http_post асинхронний: кладе запит у чергу pg_net, яку воркер читає
    -- ПІСЛЯ коміту. Тобто при відкаті транзакції сповіщення не піде — і це
    -- правильно: сертифіката ж не існує.
    perform net.http_post(
      url     := v_url,
      body    := jsonb_build_object(
                   'type',   'INSERT',
                   'table',  'certificates',
                   'record', to_jsonb(new)
                 ),
      headers := jsonb_build_object(
                   'Content-Type',     'application/json',
                   'x-webhook-secret', v_secret
                 ),
      timeout_milliseconds := 5000
    );
  exception when others then
    -- Не глитаємо: причина лишається у логах Postgres (Logs → Postgres).
    raise warning '013: сповіщення про сертифікат не надіслано (%): %', sqlstate, sqlerrm;
  end;

  return new;
end
$function$;

comment on function public.notify_new_certificate() is
  '013 (2026-10-01): AFTER INSERT на certificates → POST у Edge Function telegram. Секрет — з Vault (telegram_webhook_secret). Помилки не скасовують видачу сертифіката, лише warning у логах.';


-- ============================================================================
-- 2. Тригер (ідемпотентно: спершу drop if exists, потім create)
-- ============================================================================
drop trigger if exists trg_notify_new_certificate on public.certificates;

create trigger trg_notify_new_certificate
after insert on public.certificates
for each row
execute function public.notify_new_certificate();


-- ============================================================================
-- 3. ЯК ПЕРЕВІРИТИ, ЩО ЗАСТОСУВАЛОСЬ
--    Запускати ОКРЕМО після міграції. Усе читальне, персональних даних не
--    віддає (тільки числа й назви обʼєктів).
-- ============================================================================
-- -- 3.1 Функція є, вона security definer, search_path закріплений:
-- select p.proname, p.prosecdef, p.proconfig
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--  where n.nspname = 'public' and p.proname = 'notify_new_certificate';
-- -- Очікувано: 1 рядок · prosecdef = true · proconfig = {search_path=""}
--
-- -- 3.2 Тригер є і ввімкнений:
-- select t.tgname, t.tgenabled, pg_get_triggerdef(t.oid) as def
--   from pg_trigger t
--   join pg_class c on c.oid = t.tgrelid
--   join pg_namespace n on n.oid = c.relnamespace
--  where not t.tgisinternal and n.nspname = 'public' and c.relname = 'certificates';
-- -- Очікувано: 1 рядок · tgname = trg_notify_new_certificate · tgenabled = 'O'
--
-- -- 3.3 Секрет у Vault є (значення не показуємо):
-- select name, length(decrypted_secret) > 0 as not_empty
--   from vault.decrypted_secrets where name = 'telegram_webhook_secret';
-- -- Очікувано: 1 рядок · not_empty = true
--
-- -- 3.4 Наскрізна перевірка шляху «база → бот» БЕЗ запису в certificates і без
-- --     повідомлення в Telegram: шлемо той самий POST, але з таблицею, якої бот
-- --     не обробляє. Правильний секрет → бот відповідає 200 "ok"; хибний → 403.
-- select net.http_post(
--          url     := 'https://hpcyrnxschpxlrxudmqk.supabase.co/functions/v1/telegram',
--          body    := jsonb_build_object('type','INSERT','table','__013_selftest','record', jsonb_build_object()),
--          headers := jsonb_build_object('Content-Type','application/json',
--                       'x-webhook-secret', (select decrypted_secret from vault.decrypted_secrets
--                                             where name = 'telegram_webhook_secret'))
--        ) as request_id;
-- -- через пару секунд:
-- select status_code, content from net._http_response order by created desc limit 1;
-- -- Очікувано: 200 · ok


-- ============================================================================
-- ⛔ ВІДКАТ — НЕ ЗАПУСКАТИ РАЗОМ З ЦИМ ФАЙЛОМ. ⛔
--    Розкоментовувати й виконувати ТІЛЬКИ окремо й тільки щоб прибрати 013.
--    Якщо запустити разом із частинами 1–2, обʼєкти створяться й одразу зникнуть,
--    а редактор покаже «Success» (саме так уже вийшло в задачі 012).
--    Відкат повертає рівно стан із 013-0-backup-before.sql.
-- ============================================================================
-- drop trigger if exists trg_notify_new_certificate on public.certificates;
-- drop function if exists public.notify_new_certificate();
-- -- секрет із Vault (прибирати лише якщо більше ніде не потрібен):
-- delete from vault.secrets where name = 'telegram_webhook_secret';
--
-- -- перевірка відкату (має дати 0 · 0 · 0):
-- select
--   (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
--      where n.nspname='public' and p.proname='notify_new_certificate') as func_exists,
--   (select count(*) from pg_trigger t join pg_class c on c.oid=t.tgrelid
--      join pg_namespace n on n.oid=c.relnamespace
--     where not t.tgisinternal and n.nspname='public' and c.relname='certificates') as trg_on_certs,
--   (select count(*) from vault.secrets where name='telegram_webhook_secret') as vault_secret;
--
-- Відкат бота (Edge Function) — окремо від SQL:
--   задеплоїти вміст dev/build/013-tg-certificates/02-backend/deployed-before-013.ts
--   у функцію "telegram" з verify_jwt = false.
