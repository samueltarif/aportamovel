export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'won'
  | 'lost'
  | 'spam'

export type FormId = 'contact_form' | 'quote_modal'

export interface Lead {
  id: string
  idempotency_key: string
  full_name: string
  email: string | null
  phone: string
  company_or_condominium: string | null
  message: string | null
  service_slug: string | null
  service_name: string | null
  form_id: FormId
  source_path: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  status: LeadStatus
  contacted_at: string | null
  archived_at: string | null
  consent_at: string
  privacy_notice_version: string
  last_updated_by: string | null
  created_at: string
  updated_at: string
}

export interface LeadNote {
  id: string
  lead_id: string
  author_id: string
  author_email?: string
  note: string
  created_at: string
}

export interface LeadStatusHistory {
  id: string
  lead_id: string
  old_status: LeadStatus
  new_status: LeadStatus
  changed_by: string
  changed_by_email?: string
  created_at: string
}

export interface LeadDetail extends Lead {
  notes: LeadNote[]
  history: LeadStatusHistory[]
}

export interface LeadCounters {
  all: number
  new: number
  contacted: number
  qualified: number
  proposal_sent: number
  won: number
  lost: number
  spam: number
  archived: number
}

export interface LeadPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedLeadsResponse {
  items: Lead[]
  pagination: LeadPagination
  counters: LeadCounters
}

export interface RecentLeadItem {
  id: string
  full_name: string
  company_or_condominium: string | null
  service_name: string | null
  form_id: FormId
  status: LeadStatus
  created_at: string
}
