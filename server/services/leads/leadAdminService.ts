import type { Lead, LeadDetail, LeadStatus, LeadCounters, PaginatedLeadsResponse, RecentLeadItem } from '~~/shared/types/leads'
import type { leadListQuerySchema, leadSearchBodySchema } from '~~/server/validators/leadSchemas'
import { getSupabaseAdminClient } from '~~/server/utils/supabasePrivate'
import type { z } from 'zod'

export async function listAdminLeads(query: z.infer<typeof leadListQuerySchema>): Promise<PaginatedLeadsResponse> {
  const supabase = getSupabaseAdminClient()
  let dbQuery = supabase.from('leads').select('*', { count: 'exact' })

  if (query.archived) {
    dbQuery = dbQuery.not('archived_at', 'is', null)
  }
  else {
    dbQuery = dbQuery.is('archived_at', null)
    if (query.status && query.status !== 'all') {
      dbQuery = dbQuery.eq('status', query.status)
    }
  }

  if (query.form_id && query.form_id !== 'all') {
    dbQuery = dbQuery.eq('form_id', query.form_id)
  }

  if (query.period && query.period !== 'all') {
    const days = Number(query.period)
    if (!isNaN(days) && days > 0) {
      const sinceDate = new Date(Date.now() - days * 86400000).toISOString()
      dbQuery = dbQuery.gte('created_at', sinceDate)
    }
  }

  const page = Math.max(1, query.page || 1)
  const limit = Math.max(1, Math.min(50, query.limit || 20))
  const offset = (page - 1) * limit
  const rangeTo = offset + limit - 1

  const [{ data: leads, count, error }, counters] = await Promise.all([
    dbQuery.order('created_at', { ascending: false }).range(offset, rangeTo),
    getLeadCounts(),
  ])

  if (error) {
    throw createError({ statusCode: 500, message: 'Erro ao listar leads.' })
  }

  const total = count ?? (leads?.length || 0)

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[Leads Query]', { page, limit, offset, rangeTo, itemsCount: leads?.length || 0, total })
  }

  return {
    items: (leads || []) as Lead[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    counters,
  }
}

export async function searchAdminLeads(body: z.infer<typeof leadSearchBodySchema>): Promise<PaginatedLeadsResponse> {
  const supabase = getSupabaseAdminClient()
  const q = (body.query || '').trim().replace(/[%_]/g, '\\$&')

  let dbQuery = supabase.from('leads').select('*', { count: 'exact' })

  if (body.archived) {
    dbQuery = dbQuery.not('archived_at', 'is', null)
  }
  else {
    dbQuery = dbQuery.is('archived_at', null)
    if (body.status && body.status !== 'all') {
      dbQuery = dbQuery.eq('status', body.status)
    }
  }

  if (q) {
    dbQuery = dbQuery.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,company_or_condominium.ilike.%${q}%`)
  }

  const page = Math.max(1, body.page || 1)
  const limit = Math.max(1, Math.min(50, body.limit || 20))
  const offset = (page - 1) * limit
  const rangeTo = offset + limit - 1

  const [{ data: leads, count, error }, counters] = await Promise.all([
    dbQuery.order('created_at', { ascending: false }).range(offset, rangeTo),
    getLeadCounts(),
  ])

  if (error) {
    throw createError({ statusCode: 500, message: 'Erro ao buscar leads.' })
  }

  const total = count ?? (leads?.length || 0)

  return {
    items: (leads || []) as Lead[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    counters,
  }
}

export async function getRecentLeads(): Promise<RecentLeadItem[]> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('leads')
    .select('id, full_name, company_or_condominium, service_name, form_id, status, created_at')
    .is('archived_at', null)
    .neq('status', 'spam')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw createError({ statusCode: 500, message: 'Erro ao carregar leads recentes.' })
  return (data || []) as RecentLeadItem[]
}

export async function getLeadDetail(leadId: string): Promise<LeadDetail> {
  const supabase = getSupabaseAdminClient()

  const [leadRes, notesRes, historyRes] = await Promise.all([
    supabase.from('leads').select('*').eq('id', leadId).single(),
    supabase.from('lead_notes').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
    supabase.from('lead_status_history').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
  ])

  if (leadRes.error || !leadRes.data) {
    throw createError({ statusCode: 404, message: 'Lead não encontrado.' })
  }

  return {
    ...(leadRes.data as Lead),
    notes: (notesRes.data || []) as any[],
    history: (historyRes.data || []) as any[],
  }
}

export async function updateLeadStatusAtomic(leadId: string, newStatus: LeadStatus, userId: string) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.rpc('update_lead_status_atomic', {
    p_lead_id: leadId,
    p_new_status: newStatus,
    p_user_id: userId,
  })

  if (error) throw createError({ statusCode: 400, message: error.message || 'Erro ao atualizar status do lead.' })
  return data
}

export async function addLeadNote(leadId: string, note: string, authorId: string) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('lead_notes')
    .insert({ lead_id: leadId, note: note.trim(), author_id: authorId })
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 400, message: 'Erro ao registrar observação.' })
  return data
}

export async function setLeadArchived(leadId: string, archived: boolean) {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('leads')
    .update({ archived_at: archived ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq('id', leadId)
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 400, message: 'Erro ao alterar arquivamento do lead.' })
  return data
}

async function getLeadCounts(): Promise<LeadCounters> {
  const supabase = getSupabaseAdminClient()
  const { data } = await supabase.from('leads').select('status, archived_at')

  const counters: LeadCounters = {
    all: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal_sent: 0,
    won: 0,
    lost: 0,
    spam: 0,
    archived: 0,
  }

  if (!data) return counters

  for (const row of data) {
    if (row.archived_at) {
      counters.archived++
    }
    else {
      counters.all++
      const st = row.status as keyof LeadCounters
      if (counters[st] !== undefined) {
        counters[st]++
      }
    }
  }

  return counters
}
