-- ============================================================
-- TechStack Manager — Schema do Banco de Dados
-- Execute no Supabase: SQL Editor → New Query → Run
-- ============================================================

create table if not exists public.items (
  id            text           primary key,
  name          text           not null,
  brand         text,
  category      text           not null default 'Outros',
  current_price numeric(10,2)  not null default 0,
  desired_price numeric(10,2)  not null default 0,
  status        text           not null default 'want_to_buy'
                               check (status in ('want_to_buy', 'purchased', 'watching')),
  link          text,
  notes         text,
  created_at    timestamptz    not null default now(),
  updated_at    timestamptz    not null default now()
);

-- Habilitar Row Level Security
alter table public.items enable row level security;

-- Policy: acesso público (anon key)
-- Futuramente: restringir por auth.uid() para multi-usuário
create policy "Acesso público leitura"  on public.items for select using (true);
create policy "Acesso público inserção" on public.items for insert with check (true);
create policy "Acesso público edição"   on public.items for update using (true);
create policy "Acesso público exclusão" on public.items for delete using (true);
