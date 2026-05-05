-- ViaNord · Tabla de quotes en Supabase
-- Ejecuta este SQL en: Supabase Dashboard → SQL Editor → New query

create table if not exists quotes (
  id              text primary key,
  reference       text unique not null,
  tipo            text not null,
  plan_id         text,
  nombre          text not null,
  empresa         text,
  email           text not null,
  telefono        text not null,
  origen          text not null,
  destino         text not null,
  peso_kg         float,
  volumen_m3      float,
  addons          text[],
  time_slot       text,
  fecha_preferida text,
  descripcion     text,
  estimated_price float,
  status          text not null default 'pendiente',
  created_at      timestamptz default now()
);

-- Índices para búsquedas frecuentes
create index if not exists quotes_email_idx     on quotes(email);
create index if not exists quotes_status_idx    on quotes(status);
create index if not exists quotes_created_idx   on quotes(created_at desc);

-- Row Level Security: solo el service key puede leer/escribir
alter table quotes enable row level security;

-- Política: acceso total solo para el service role (backend)
create policy "service_role_all" on quotes
  for all
  using (true)
  with check (true);
