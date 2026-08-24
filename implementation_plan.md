# FASE C.1 — PAINEL ADMIN V2: ANALYTICS COMERCIAL, FUNIL E ATRIBUIÇÃO

## Contexto

O painel admin atual (`/admin/dashboard` + `/admin/leads`) foi construído como MVP durante as fases iniciais do projeto. A captura de dados evoluiu significativamente nas Fases A→B→C.0, e agora possui visitor_id, session_id, event_id, channel, UTMs, service_key, cta_location, device_type, bot classification e idempotência. O painel precisa acompanhar essa evolução.

> [!IMPORTANT]
> **Sem deploy nesta rodada.** O objetivo é implementar localmente, testar, documentar e apresentar para revisão antes da publicação.

---

## Current Dashboard Forensic Audit

### Problemas Identificados no Painel V1

| # | Problema | Severidade |
|---|---------|-----------|
| 1 | **"+12%" hardcoded** no card de Leads — nunca calculado, sempre exibido | Alta |
| 2 | **Conversão = leads/pageviews** — fórmula incorreta (deveria ser leads/unique visitors) | Alta |
| 3 | **Unique visitors = DISTINCT(session_id ∥ ip_hash)** — mistura session_id com ip_hash como fallback, inflando o número | Alta |
| 4 | **WhatsApp = lead_clicks.count + 23 sintéticos** — soma os 23 legados artificialmente ao total | Alta |
| 5 | **Sem filtro de período** — todas as métricas são all-time, sem controle temporal | Alta |
| 6 | **Sem filtro de bots** — Googlebot conta como visitante humano | Média |
| 7 | **Service Distribution** usa apenas 3 categorias fixas baseadas em leads (Redes/Telas/Outros) — ignora service_key da Fase C.0 | Média |
| 8 | **Dados de fallback/mock** incluem números fictícios (1250 leads, 890 WhatsApp) usados quando API falha | Média |
| 9 | **Chart fixo em 15 dias** — sem controle de período | Baixa |
| 10 | **Recent Activity** não mostra service_name, channel ou cta_location | Baixa |
| 11 | **Leads page** usa mock leads com dados inventados quando o banco não responde | Média |
| 12 | **Leads page** não separa leads reais de legados/testes | Alta |

### Componentes Atuais do Dashboard V1

| Componente | Endpoint | Campos |
|-----------|----------|--------|
| KPI Cards (5) | `GET /api/admin/dashboard-stats` | totalVisits, uniqueVisitors, totalLeads, whatsappClicks, conversionRate |
| Line Chart | `GET /api/admin/dashboard-stats` | dailyLeads[], dailyVisits[] (15 dias fixo) |
| Donut Chart | `GET /api/admin/dashboard-stats` | serviceDistribution[] (3 categorias fixas) |
| Top Pages | `GET /api/admin/dashboard-stats` | topPages[] (top 5 all-time) |
| Top Locations | `GET /api/admin/dashboard-stats` | topLocations[] (top 4 all-time) |
| Recent Activity | `GET /api/admin/recent-activity` | 8 eventos recentes (visits + clicks + leads) |
| Leads Table | `GET /api/admin/leads` | SELECT * FROM leads |
| Update Lead | `POST /api/admin/update-lead` | PATCH status, valor_orcamento, observacoes |

---

## Proposed Changes

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│               ADMIN LAYOUT V2                    │
│  (sidebar com navegação expandida)               │
├─────────────────────────────────────────────────┤
│  Global Date Filter (Hoje/7d/30d/Custom)         │
├─────────────────────────────────────────────────┤
│                                                  │
│  Dashboard (/admin/dashboard)                    │
│  ├─ KPI Cards Row 1 (6 cards)                   │
│  ├─ KPI Cards Row 2 (4 rates)                   │
│  ├─ Traffic Chart (daily visitors/sessions)      │
│  ├─ Acquisition Channels (bar + table)           │
│  ├─ Landing Page Performance (table)             │
│  ├─ Top Pages (table)                            │
│  ├─ Service Interest (table)                     │
│  ├─ CTA Performance (table)                      │
│  ├─ Commercial Funnel (visual)                   │
│  ├─ Device Breakdown (donut)                     │
│  ├─ New vs Returning (donut)                     │
│  ├─ UTM Campaigns (table)                        │
│  ├─ Data Quality (compact card)                  │
│  └─ Recent Activity (feed com contexto)          │
│                                                  │
│  Leads (/admin/leads)                            │
│  ├─ Tabs: Reais | Histórico Técnico             │
│  ├─ Status filters                               │
│  ├─ Lead table com channel/landing/serviço       │
│  └─ Lead Journey drawer (timeline)               │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

### 1. API Backend

#### [NEW] `server/api/admin/analytics/overview.get.ts`

Endpoint consolidado para o dashboard principal. Recebe `dateFrom` e `dateTo` como query params.

Retorna:
- KPI totals (visitors, sessions, pageviews, real_leads, whatsapp, phone, contact_intents)
- Conversion rates (lead_rate, contact_intent_rate, whatsapp_rate, form_rate)
- Daily series (visitors, sessions, pageviews por dia)
- New vs Returning visitors
- Device breakdown
- Data quality metrics
- Legacy period flag

**Todas as agregações são server-side.** Seleciona apenas campos necessários do Supabase REST API com filtros de data e `is_bot=neq.true`.

#### [NEW] `server/api/admin/analytics/acquisition.get.ts`

Recebe `dateFrom`, `dateTo`. Retorna:
- Channels breakdown (visitors, sessions, whatsapp, phone, leads por canal)
- UTM campaigns table (source/medium/campaign com métricas)
- First-touch vs session-touch comparison

#### [NEW] `server/api/admin/analytics/pages.get.ts`

Recebe `dateFrom`, `dateTo`. Retorna:
- Top pages (path, pageviews, unique_visitors, pct)
- Landing page performance (landing_path, visitors, sessions, whatsapp, forms, rates)

#### [NEW] `server/api/admin/analytics/services.get.ts`

Recebe `dateFrom`, `dateTo`. Retorna:
- Service interest table (service_key, service_name, whatsapp_clicks, phone_clicks, unique_visitors, total_interactions)
- CTA performance table (cta_location, whatsapp, phone, unique_visitors, pct_of_intents)

#### [NEW] `server/api/admin/analytics/funnel.get.ts`

Recebe `dateFrom`, `dateTo`. Retorna:
- Funnel stages: total_visitors → service_visitors → contact_intent_visitors → form_leads
- Each stage uses DISTINCT visitor_id (no duplication by multiple clicks)

#### [NEW] `server/api/admin/analytics/lead-journey.get.ts`

Recebe `leadId`. Retorna:
- Lead details
- Associated pageviews (via visitor_id + session_id)
- Associated clicks (via visitor_id + session_id)
- First touch attribution
- Session touch attribution
- Timeline ordered by created_at

#### [MODIFY] `server/api/admin/leads.get.ts`

Adicionar query params: `dateFrom`, `dateTo`, `tab` (real | technical_history).
- `tab=real`: Exclui legados (Lead WhatsApp%) e testes (Teste Automatizado%)
- `tab=technical_history`: Apenas legados e testes
- Retorna campos de atribuição: channel, landing_path, utm_campaign, session_channel, service (via servico)

#### [MODIFY] `server/api/admin/recent-activity.get.ts`

Enriquecer com: service_name, service_key, channel, cta_location, device_type nos eventos retornados.

---

### 2. Analytics Metric Catalog

| KPI | Fórmula | Tabela | Filtros | Bot Filter |
|-----|---------|--------|---------|------------|
| **Pageviews** | `COUNT(page_views)` | page_views | dateFrom/dateTo | `is_bot != true` |
| **Unique Visitors** | `COUNT(DISTINCT visitor_id) WHERE visitor_id IS NOT NULL` | page_views | dateFrom/dateTo | `is_bot != true` |
| **Sessions** | `COUNT(DISTINCT session_id) WHERE session_id IS NOT NULL` | page_views | dateFrom/dateTo | `is_bot != true` |
| **Real Leads** | `COUNT(leads) WHERE nome NOT LIKE 'Lead WhatsApp%' AND nome NOT LIKE '%Teste Automatizado%'` | leads | dateFrom/dateTo | N/A |
| **WhatsApp Clicks** | `COUNT(lead_clicks) WHERE tipo='whatsapp'` | lead_clicks | dateFrom/dateTo | `is_bot != true` |
| **Phone Clicks** | `COUNT(lead_clicks) WHERE tipo='telefone'` | lead_clicks | dateFrom/dateTo | `is_bot != true` |
| **Contact Intents** | WhatsApp + Phone | lead_clicks | dateFrom/dateTo | `is_bot != true` |
| **Lead Conversion Rate** | `real_leads / unique_visitors * 100` | computed | — | — |
| **Contact Intent Rate** | `DISTINCT visitor_id com whatsapp/telefone / unique_visitors * 100` | computed | — | — |
| **WhatsApp Rate** | `DISTINCT visitor_id com whatsapp / unique_visitors * 100` | computed | — | — |
| **Form Conversion Rate** | `real_leads / unique_visitors * 100` | computed | — | — |
| **New Visitors** | Visitor IDs que apareceram pela 1ª vez no período | page_views | — | `is_bot != true` |
| **Returning Visitors** | Visitor IDs que já existiam antes do período | page_views | — | `is_bot != true` |
| **Avg Pages/Session** | `pageviews / sessions` | computed | — | — |

> [!NOTE]
> **PHASE_B_START_DATE:** Será determinado pelo primeiro registro em `page_views` com `visitor_id IS NOT NULL`. Dados anteriores são classificados como LEGACY_PERIOD e exibidos com aviso visual.

---

### 3. Legacy vs Phase B Data Separation

- **LEGACY_PERIOD**: Registros anteriores ao primeiro `visitor_id` não-nulo
- **PHASE_B_ANALYTICS**: Registros com visitor_id/session_id/event_id preenchidos
- O painel exibirá um banner informativo: *"Identificação avançada de visitantes disponível a partir de DD/MM/AAAA"*
- KPIs de unique visitors, sessions, returning visitors só são confiáveis no período Phase B+
- Os 23 leads sintéticos + 4 testes automatizados ficam na aba "Histórico Técnico" na tela de leads

---

### 4. Frontend Components

#### [MODIFY] `app/layouts/admin.vue`

Expandir sidebar com novos links de navegação (Dashboard, Leads).
Adicionar global date filter no header que persiste em `useState`.

#### [MODIFY] `app/pages/admin/dashboard.vue`

Reescrita completa. Substituir o dashboard V1 monolítico (532 linhas) por uma estrutura modular:

**Seções do dashboard V2:**
1. **KPI Cards Row 1**: Visitantes Únicos, Sessões, Pageviews, Leads Reais, WhatsApp, Telefone
2. **KPI Cards Row 2**: Taxa de Lead, Taxa de Intenção de Contato, Taxa WhatsApp, Avg Pages/Session
3. **Traffic Chart**: Gráfico de linha com visitantes/sessões por dia (SVG inline, sem lib externa)
4. **Acquisition Channels**: Bar chart + tabela (canal → visitors, sessions, whatsapp, leads, intent rate)
5. **Landing Pages**: Tabela com landing_path, visitors, sessions, whatsapp, forms, rates
6. **Top Pages**: Tabela com path, pageviews, unique_visitors, % total
7. **Service Interest**: Tabela com service_name, whatsapp, phone, unique_visitors, total_interactions
8. **CTA Performance**: Tabela com cta_location, whatsapp, phone, unique_visitors, % intents
9. **Commercial Funnel**: Visual de funil (Visitors → Service → Intent → Lead)
10. **New vs Returning**: Donut chart
11. **Device Breakdown**: Donut chart (Mobile/Desktop/Tablet)
12. **UTM Campaigns**: Tabela colapsável (source, medium, campaign, visitors, intents, leads)
13. **Data Quality**: Card compacto (eventos sem visitor_id, sem session_id, sem cta_location, service cards sem service_key, bots detectados)
14. **Recent Activity**: Feed enriquecido com service_name, channel, cta_location

**Não haverá:**
- Números fake ou fallback inventados
- "+12%" hardcoded
- Dados mock
- Gráficos sem informação real

#### [MODIFY] `app/pages/admin/leads.vue`

- Tabs: "Leads Reais" | "Histórico Técnico"
- Tabela com colunas: Nome, Serviço, Canal, Landing, Status, Data
- Drawer de detalhes com Lead Journey (timeline: pages → clicks → form)
- UUIDs ficam somente no drawer de debug
- Botão WhatsApp preservado
- Filtros: status, busca textual, período

#### [NEW] `app/composables/useAdminDateFilter.ts`

Composable global para gerenciar o período selecionado (useState).
Presets: Hoje, Ontem, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado, Personalizado.
Timezone: America/Sao_Paulo.

#### [NEW] `app/composables/useAdminAnalytics.ts`

Composable para fetch dos endpoints de analytics com loading/error/empty states.

---

### 5. Charts

**Sem biblioteca externa.** O dashboard V1 já usa SVG inline com boa qualidade visual. A V2 continuará com SVG para:
- Line chart (traffic over time)
- Bar chart (acquisition channels)
- Donut chart (services, devices, new/returning)
- Funnel visualization

Razão: o projeto não tem nenhuma lib de charts instalada, e o SVG inline atual funciona bem. Adicionar Chart.js ou similar seria peso desnecessário para ~4 gráficos simples.

---

### 6. shadcn/ui Components

O projeto usa Nuxt 4 + TailwindCSS mas **não tem shadcn-vue instalado**. Instalar shadcn-vue adicionaria uma camada de complexidade (Radix Vue, class-variance-authority, clsx) ao projeto que atualmente é simples e usa Tailwind direto com @nuxt/icon.

**Decisão proposta:** Construir os componentes do painel V2 no mesmo estilo visual do V1 (glassmorphism dark, Tailwind direto), mantendo consistência e sem adicionar dependências. Os padrões visuais de Card, Tabs, Select, Table, Badge, Tooltip, Skeleton e Sheet serão implementados como componentes inline no dashboard, como já é feito no V1.

> [!IMPORTANT]
> **Revisão necessária:** Se o usuário preferir instalar shadcn-vue formalmente, isso é possível mas adiciona ~5 dependências novas e requer reestruturação do sistema de componentes. Pode ser feito numa fase posterior dedicada a design system.

---

### 7. Timezone

- Banco: `timestamptz` (UTC)
- Filtros de data: Calculados em `America/Sao_Paulo` antes de enviar ao Supabase
- "Hoje" = `00:00 BRT` até `23:59 BRT` (convertido para UTC no server)

---

### 8. Performance

- Agregações server-side (não carrega rows individuais no browser)
- Supabase REST API com `select=field1,field2` (sem `SELECT *`)
- Filtros de data na query string do Supabase REST (`created_at=gte.{dateFrom}&created_at=lte.{dateTo}`)
- Limite de registros por tabela com `limit` e `order`

> [!WARNING]
> O Supabase REST API não suporta `GROUP BY` ou `COUNT(DISTINCT)` nativamente. As agregações de contagem precisam ser feitas server-side (Nitro) após fetch dos registros filtrados. Para volumes atuais (~1000 pageviews, ~50 clicks, ~30 leads), isso é adequado. Para escala maior, seria necessário criar views SQL no banco — mas isso ficaria para uma fase futura.

---

## Open Questions

1. **shadcn-vue:** Prefere instalar shadcn-vue e usar os componentes oficiais, ou manter o estilo visual inline do V1 (mais leve, sem novas dependências)?

2. **Tabs no Dashboard:** Prefere que as seções do dashboard fiquem todas visíveis em scroll, ou agrupadas em tabs (Visão Geral | Aquisição | Serviços | Funil | Leads)?

3. **Funil — Statuses "Proposta" e "Fechado":** Os leads têm statuses `Novo`, `Em Atendimento`, `Orçado`, `Fechado`, `Perdido`. Devo mapear `Orçado` → PROPOSAL e `Fechado` → WON no funil?

---

## Verification Plan

### Automated Tests
- `npx nuxi build` — compilação sem erros
- `seo-validate-03c.mjs` — regressão SEO (248/248 PASS)
- `test-phase-a.mjs` — regressão de captura (24/24 PASS)
- Novo script `test-admin-v2.mjs` — validação dos endpoints de analytics (responses, schemas, filtros de data)

### Manual Verification
- Verificação visual do painel V2 em localhost
- Teste de filtro de data global (hoje/7d/30d/custom)
- Verificação de zero state em todos os componentes
- Teste de responsividade (desktop + mobile)
- Verificação de que nenhum dado fake é exibido

---

## Files Summary

| Action | File | Description |
|--------|------|-------------|
| NEW | `server/api/admin/analytics/overview.get.ts` | KPIs, daily series, devices, new/returning, data quality |
| NEW | `server/api/admin/analytics/acquisition.get.ts` | Channels, UTM campaigns, first-touch |
| NEW | `server/api/admin/analytics/pages.get.ts` | Top pages, landing page performance |
| NEW | `server/api/admin/analytics/services.get.ts` | Service interest, CTA performance |
| NEW | `server/api/admin/analytics/funnel.get.ts` | Commercial funnel (DISTINCT visitor_id) |
| NEW | `server/api/admin/analytics/lead-journey.get.ts` | Lead timeline (pages + clicks + attribution) |
| NEW | `app/composables/useAdminDateFilter.ts` | Global date filter composable |
| NEW | `app/composables/useAdminAnalytics.ts` | Analytics fetch composable |
| MODIFY | `app/layouts/admin.vue` | Global date filter in header |
| MODIFY | `app/pages/admin/dashboard.vue` | Complete V2 rewrite |
| MODIFY | `app/pages/admin/leads.vue` | V2 with tabs, journey, attribution |
| MODIFY | `server/api/admin/leads.get.ts` | Date filter + tab filter |
| MODIFY | `server/api/admin/recent-activity.get.ts` | Enriched with service/channel/cta |
| NEW | `docs/ADMIN_PANEL_V2_ANALYTICS.md` | Full documentation |

### Constraints

- `SUPABASE_MCP_WRITES = 0`
- `ADMIN_AUTH_IMPLEMENTATION = DEFERRED_BY_USER`
- `PRODUCTION_CHANGED = NO`
- `DATABASE_CHANGED = NO`
- `MANUAL_SUPABASE_ACTION_REQUIRED = NO` (o schema atual suporta todas as queries)
