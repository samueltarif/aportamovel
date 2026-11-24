export type WhatsAppClickStatus = 'pending' | 'identified' | 'ignored'

export interface WhatsAppClick {
  id: string
  code: string
  created_at: string
  wa_number: string
  channel: 'commercial' | 'emergency'
  cta_location: string
  page_path: string
  service_slug: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  gclid: string | null
  gbraid: string | null
  wbraid: string | null
  referrer_host: string | null
  landing_path: string | null
  device: 'mobile' | 'tablet' | 'desktop' | 'unknown'
  city: string | null
  region: string | null
  status: WhatsAppClickStatus
  lead_id: string | null
  identified_at: string | null
  identified_by: string | null
}

export interface WhatsAppClickListResponse {
  items: WhatsAppClick[]
  summary: { total: number, pending: number, identified: number, ignored: number, fromAds: number }
}
