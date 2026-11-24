-- Rastreamento dos cliques no WhatsApp com código de atendimento (ex.: PM-7K4QX).
-- Cada clique gera um código que vai na mensagem pronta do WhatsApp. Aqui fica a ficha
-- do clique (de onde veio, qual botão, anúncio). Quando a mensagem chega, a equipe
-- digita o código no painel e completa nome e telefone, criando o lead.
-- Migration aditiva: não altera nenhuma tabela existente.

create table if not exists public.whatsapp_clicks (
  id uuid primary key default gen_random_uuid(),
  code text not null check (code ~ '^PM-[A-Z0-9]{5}$'),
  created_at timestamptz not null default now(),
  wa_number text not null check (wa_number ~ '^[0-9]{10,15}$'),
  channel text not null default 'commercial' check (channel in ('commercial', 'emergency')),
  cta_location text not null default 'link' check (length(cta_location) <= 60),
  page_path text not null check (length(page_path) <= 200),
  service_slug text check (length(service_slug) <= 120),
  utm_source text check (length(utm_source) <= 200),
  utm_medium text check (length(utm_medium) <= 200),
  utm_campaign text check (length(utm_campaign) <= 200),
  utm_term text check (length(utm_term) <= 200),
  utm_content text check (length(utm_content) <= 200),
  gclid text check (length(gclid) <= 200),
  gbraid text check (length(gbraid) <= 200),
  wbraid text check (length(wbraid) <= 200),
  referrer_host text check (length(referrer_host) <= 120),
  landing_path text check (length(landing_path) <= 200),
  device text not null default 'unknown' check (device in ('mobile', 'tablet', 'desktop', 'unknown')),
  city text check (length(city) <= 80),
  region text check (length(region) <= 10),
  status text not null default 'pending' check (status in ('pending', 'identified', 'ignored')),
  lead_id uuid references public.leads(id) on delete set null,
  identified_at timestamptz,
  identified_by uuid references auth.users(id) on delete set null
);

comment on table public.whatsapp_clicks is
  'Cliques nos botões de WhatsApp do site, com código de atendimento e origem (anúncio/UTM). Sem dados pessoais até a identificação.';

create index if not exists whatsapp_clicks_code_idx on public.whatsapp_clicks (code);
create index if not exists whatsapp_clicks_created_idx on public.whatsapp_clicks (created_at desc);
create index if not exists whatsapp_clicks_status_idx on public.whatsapp_clicks (status, created_at desc);
create index if not exists whatsapp_clicks_lead_idx on public.whatsapp_clicks (lead_id);

-- Acesso somente pelo servidor (chave secreta). Nenhuma leitura/escrita direta do navegador.
alter table public.whatsapp_clicks enable row level security;
revoke all on public.whatsapp_clicks from anon, authenticated;

-- Leads criados a partir de um código do WhatsApp usam form_id = 'whatsapp_click'.
-- Se existir uma regra (check) simples limitando form_id aos formulários antigos, ela é ampliada.
do $$
declare
  c record;
  had_check boolean := false;
begin
  for c in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.leads'::regclass
      and con.contype = 'c'
      -- só a regra simples "form_id em (lista)"; regras combinadas com outros campos ficam intactas
      and pg_get_constraintdef(con.oid) ~* '^CHECK \(\(form_id = ANY \(ARRAY\[[^]]*\]\)\)\)$'
  loop
    execute format('alter table public.leads drop constraint %I', c.conname);
    had_check := true;
  end loop;
  if had_check then
    alter table public.leads add constraint leads_form_id_check
      check (form_id in ('contact_form', 'quote_modal', 'whatsapp_click')) not valid;
  end if;
end $$;
