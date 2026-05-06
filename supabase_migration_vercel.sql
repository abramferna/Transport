-- ViaNordTrans · Migración Supabase para Vercel
-- Ejecuta en: Supabase Dashboard → SQL Editor → New query
-- Añade columnas que faltan en la tabla quotes

alter table quotes
  add column if not exists updated_at      timestamptz default now(),
  add column if not exists origin_town     text,
  add column if not exists destination_town text,
  add column if not exists servicio        text,
  add column if not exists hora_preferida  integer,
  add column if not exists weekday         integer,
  add column if not exists paradas         jsonb default '[]';

-- Política de acceso completo para el service role y el anon role
-- (necesario si usas la clave anon desde el backend)
drop policy if exists "service_role_all" on quotes;

create policy "allow_all_operations" on quotes
  for all
  using (true)
  with check (true);
