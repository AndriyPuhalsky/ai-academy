-- =====================================================================
-- 012-2 · Прибрати хибну ціну курсу AI Architect
-- =====================================================================
-- Що: у `public.courses` курс `ai-architect` має `price_uah = 499900`
-- (4 999,00 грн у копійках) при `is_paid = false`. Слово власника
-- 2026-10-01: «всі курси безкоштовні, чому там стоїть 4999 грн — це баг,
-- ніколи про таке не казав». Два інші курси мають `price_uah = null`,
-- `jira` з міграції 012-1 — теж `null`.
--
-- Чому безпечно: колонку `price_uah` не читає ніхто — ні код сайту
-- (`js/`, HTML, конфіги), ні Edge Function (`tg/`), ні жодна функція
-- схеми `public` (звірено 2026-10-01: `pg_proc.prosrc ilike '%price_uah%'`
-- → 0 рядків). `payments` порожня (0 рядків). Видима поведінка сайту не
-- змінюється.
--
-- Запобіжник: оновлюється рівно один рядок і лише якщо там досі 499900.
-- =====================================================================

begin;

update public.courses
   set price_uah = null
 where slug = 'ai-architect'
   and price_uah = 499900;

do $$
begin
  if exists (select 1 from public.courses where price_uah is not null) then
    raise exception '012-2: після правки лишився курс із ціною — відкат';
  end if;
end $$;

commit;

-- ЯК ПЕРЕВІРИТИ (після commit): усі курси — `is_paid = false`, `price_uah = null`.
-- select slug, is_paid, price_uah from public.courses order by sort_order;

-- ВІДКАТ (розкоментувати й виконати лише за рішенням власника):
-- update public.courses set price_uah = 499900 where slug = 'ai-architect' and price_uah is null;
