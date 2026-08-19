-- ============================================================
-- AI Академія — таблиця для форми «Написати нам»
-- Виконати ОДИН РАЗ у Supabase Dashboard → SQL Editor, перед деплоєм
-- Edge Function "contact" (tg/contact_index.ts).
--
-- Записи вставляє лише сама Edge Function через service_role-ключ
-- (він обходить RLS), тому INSERT-політики для анонімів/юзерів немає —
-- і не повинно бути: інакше форму можна заповнити напряму з фронту,
-- в обхід Turnstile, honeypot і rate-limit перевірок функції.
--
-- Передбачає, що функція is_admin() уже існує в базі (нею користуються
-- RLS-політики profiles/certificates/progress/payments/enrollments).
-- ============================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  telegram text,
  message text not null,
  ip inet
);

alter table public.contact_messages enable row level security;

create policy "contact_messages: admin read"
  on public.contact_messages
  for select
  using (is_admin());
