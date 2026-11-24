import type { H3Event } from 'h3'
import { getRequestHeader } from 'h3'
import { getSupabaseAdminClient } from '~~/server/utils/supabasePrivate'
import { buildTrackingLines } from '~~/shared/utils/leadTracking'
import type { WhatsAppClick, WhatsAppClickListResponse } from '~~/shared/types/whatsappClicks'
import type { WhatsAppClickInput } from '~~/server/validators/whatsappClickSchemas'
import { MAX_CLICK_ALERTS_PER_DAY, sendClickAlert } from '~~/server/services/notifications/leadAlerts'

const CHANNELS: Record<string, 'commercial' | 'emergency'> = {
  '5511912984416': 'commercial',
  '5511940277438': 'emergency',
}

function header(event: H3Event, name: string, max: number): string | null {
  const raw = getRequestHeader(event, name)
  if (!raw) return null
  try {
    return decodeURIComponent(raw).slice(0, max) || null
  }
  catch {
    return raw.slice(0, max) || null
  }
}

/** Registra a ficha do clique. Números que não são da empresa são ignorados. */
export async function recordWhatsAppClick(event: H3Event, input: WhatsAppClickInput): Promise<void> {
  const channel = CHANNELS[input.wa_number]
  if (!channel) return
  const supabase = getSupabaseAdminClient()
  const city = header(event, 'x-vercel-ip-city', 80)
  const { error } = await supabase.from('whatsapp_clicks').insert({
    ...input,
    channel,
    service_slug: input.service_slug || null,
    city,
    region: header(event, 'x-vercel-ip-country-region', 10),
  })
  if (error) {
    console.error('[whatsapp-click] falha ao registrar', error.code)
    return
  }

  // Aviso por e-mail, com teto diário para não estourar o limite do plano grátis do Resend.
  const startOfDaySP = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  startOfDaySP.setHours(0, 0, 0, 0)
  const offsetMs = Date.now() - new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })).getTime()
  const { count } = await supabase.from('whatsapp_clicks').select('id', { count: 'exact', head: true })
    .gte('created_at', new Date(startOfDaySP.getTime() + offsetMs).toISOString())
  if ((count ?? 0) <= MAX_CLICK_ALERTS_PER_DAY) {
    await sendClickAlert({ ...input, channel, city }).catch(() => {})
  }
}

/**
 * Pedidos feitos pelos formulários já levam "wa=PM-XXXXX" no lead.
 * Liga automaticamente essas fichas ao lead correspondente.
 */
async function autoLinkFormLeads(clicks: WhatsAppClick[]): Promise<void> {
  const pending = clicks.filter(c => c.status === 'pending')
  if (!pending.length) return
  const supabase = getSupabaseAdminClient()
  const filter = pending.slice(0, 100).map(c => `message.ilike.%wa=${c.code}%`).join(',')
  const { data: leads } = await supabase.from('leads').select('id, message').or(filter)
  for (const lead of leads || []) {
    const match = pending.find(c => lead.message?.includes(`wa=${c.code}`))
    if (!match) continue
    const identifiedAt = new Date().toISOString()
    const { error } = await supabase.from('whatsapp_clicks')
      .update({ status: 'identified', lead_id: lead.id, identified_at: identifiedAt })
      .eq('id', match.id).eq('status', 'pending')
    if (!error) Object.assign(match, { status: 'identified', lead_id: lead.id, identified_at: identifiedAt })
  }
}

export async function listWhatsAppClicks(params: { period: string, status: string, code?: string }): Promise<WhatsAppClickListResponse> {
  const supabase = getSupabaseAdminClient()
  let query = supabase.from('whatsapp_clicks').select('*')
  if (params.period !== 'all') {
    query = query.gte('created_at', new Date(Date.now() - Number(params.period) * 86400000).toISOString())
  }
  if (params.code) {
    const code = params.code.startsWith('PM-') ? params.code : `PM-${params.code}`
    query = query.ilike('code', `${code}%`)
  }
  const { data, error } = await query.order('created_at', { ascending: false }).limit(2000)
  if (error) throw createError({ statusCode: 500, message: 'Erro ao carregar os cliques no WhatsApp.' })

  const clicks = (data || []) as WhatsAppClick[]
  await autoLinkFormLeads(clicks)

  const summary = {
    total: clicks.length,
    pending: clicks.filter(c => c.status === 'pending').length,
    identified: clicks.filter(c => c.status === 'identified').length,
    ignored: clicks.filter(c => c.status === 'ignored').length,
    fromAds: clicks.filter(c => c.gclid || c.gbraid || c.wbraid).length,
  }
  const items = params.status === 'all' ? clicks : clicks.filter(c => c.status === params.status)
  return { items: items.slice(0, 500), summary }
}

async function loadClick(id: string): Promise<WhatsAppClick> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.from('whatsapp_clicks').select('*').eq('id', id).maybeSingle()
  if (error) throw createError({ statusCode: 500, message: 'Erro ao carregar o clique.' })
  if (!data) throw createError({ statusCode: 404, message: 'Clique não encontrado.' })
  return data as WhatsAppClick
}

/** Cria o lead a partir do clique, levando junto a origem (anúncio, palavra-chave, página). */
export async function identifyWhatsAppClick(
  id: string,
  input: { name: string, phone: string, company_or_condominium?: string, note?: string },
  adminUserId: string,
): Promise<{ leadId: string }> {
  const click = await loadClick(id)
  if (click.status === 'identified' && click.lead_id) {
    throw createError({ statusCode: 409, message: 'Este código já foi identificado.' })
  }
  const config = useRuntimeConfig()
  const privacyVersion = config.leadPrivacyNoticeVersion || process.env.LEAD_PRIVACY_NOTICE_VERSION || ''
  if (!privacyVersion) throw createError({ statusCode: 503, message: 'Versão do aviso de privacidade não configurada.' })

  const tracking = buildTrackingLines({
    canal: 'whatsapp_direto',
    turno: click.channel === 'emergency' ? 'plantao' : 'day',
    gclid: click.gclid || undefined,
    gbraid: click.gbraid || undefined,
    wbraid: click.wbraid || undefined,
    kw: click.utm_term || undefined,
    grupo: click.utm_content || undefined,
    wa: click.code,
  })
  const now = new Date().toISOString()
  // leads.source_path aceita só letras, números, / _ - (até 120)
  const sourcePath = /^\/[A-Za-z0-9/_-]{0,119}$/.test(click.page_path) ? click.page_path : '/'
  const supabase = getSupabaseAdminClient()
  const { data: lead, error } = await supabase.from('leads').insert({
    idempotency_key: crypto.randomUUID(),
    full_name: input.name,
    phone: input.phone,
    company_or_condominium: input.company_or_condominium || null,
    message: [input.note, ...tracking].filter(Boolean).join('\n').slice(0, 3000),
    service_slug: click.service_slug,
    service_name: null,
    form_id: 'whatsapp_click',
    source_path: sourcePath,
    utm_source: click.utm_source || (click.gclid || click.gbraid || click.wbraid ? 'google' : null),
    utm_medium: click.utm_medium,
    utm_campaign: click.utm_campaign,
    status: 'contacted',
    contacted_at: now,
    consent_at: now,
    privacy_notice_version: privacyVersion,
    last_updated_by: adminUserId,
    created_at: click.created_at,
  }).select('id').single()
  if (error || !lead) throw createError({ statusCode: 500, message: 'Não foi possível criar o lead.' })

  await supabase.from('whatsapp_clicks').update({
    status: 'identified', lead_id: lead.id, identified_at: now, identified_by: adminUserId,
  }).eq('id', id)
  return { leadId: lead.id }
}

export async function setWhatsAppClickStatus(id: string, status: 'pending' | 'ignored'): Promise<void> {
  const click = await loadClick(id)
  if (click.status === 'identified') {
    throw createError({ statusCode: 409, message: 'Cliques já identificados não podem ser alterados.' })
  }
  const supabase = getSupabaseAdminClient()
  const { error } = await supabase.from('whatsapp_clicks').update({ status }).eq('id', id)
  if (error) throw createError({ statusCode: 500, message: 'Não foi possível atualizar o clique.' })
}
