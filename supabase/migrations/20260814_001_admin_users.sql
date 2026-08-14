-- ============================================================
-- Migration: 001_admin_users
-- Projeto: A Portamóvel — Painel Administrativo
-- ============================================================

-- Tabela de administradores autorizados
create table if not exists public.admin_users (
  user_id    uuid         primary key
                          references auth.users(id)
                          on delete cascade,
  role       text         not null
                          check (role in ('admin', 'editor')),
  is_active  boolean      not null default true,
  created_at timestamptz  not null default now(),
  updated_at timestamptz  not null default now()
);

-- Função reutilizável: atualiza updated_at automaticamente
create or replace function public.set_updated_at()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger de updated_at na tabela admin_users
create trigger admin_users_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

-- Ativar Row Level Security
alter table public.admin_users enable row level security;

-- Política: usuário autenticado pode ler apenas seu próprio registro
create policy "admin_users_select_own"
  on public.admin_users for select
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Função: has_admin_access()
-- Retorna true se o usuário é admin ou editor ativo.
-- Usa security invoker — sem escalonamento de privilégios.
-- ============================================================
create or replace function public.has_admin_access()
  returns boolean
  language sql
  security invoker
  stable
  set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id  = auth.uid()
      and is_active = true
      and role     in ('admin', 'editor')
  );
$$;

-- Revogar execução pública e conceder apenas ao role authenticated
revoke execute on function public.has_admin_access() from public;
grant  execute on function public.has_admin_access() to authenticated;
