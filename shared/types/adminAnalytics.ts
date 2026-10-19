/** Atalhos de período disponíveis no painel. */
export type AnalyticsPreset = 'today' | '7' | '30' | '90'

/** Chave de período: um atalho ou um intervalo personalizado (from/to). */
export type AnalyticsPeriodKey = AnalyticsPreset | 'custom'

/** Seleção de período feita no painel (from/to obrigatórios apenas em 'custom'). */
export interface AnalyticsPeriodSelection {
  key: AnalyticsPeriodKey
  from?: string // YYYY-MM-DD (fuso America/Sao_Paulo)
  to?: string // YYYY-MM-DD (inclusivo)
}

/** Granularidade da série temporal: por hora (período de 1 dia) ou por dia. */
export type AnalyticsGranularity = 'day' | 'hour'

export type SectionStatus = 'ready' | 'loading' | 'unavailable' | 'error'

export interface MetricResult {
  current: number
  previous: number | null
  changePercent: number | null
  status: SectionStatus
}

export interface AnalyticsTrendPoint {
  date: string // YYYY-MM-DD (granularidade 'day') ou 'YYYY-MM-DD HH' (granularidade 'hour')
  uniqueVisitors: number
  pageviews: number
  whatsappClicks: number
  quoteSubmissions: number
}

export interface TopPageItem {
  path: string
  pageviews: number
  uniqueVisitors: number
}

export interface TopServiceItem {
  serviceSlug: string
  serviceName: string
  views: number
}

export interface TrafficSourceItem {
  category: 'direct' | 'organic_search' | 'social' | 'campaign' | 'referral'
  categoryLabel: string
  source: string
  sessions: number
  uniqueVisitors: number
}

export interface LocationItem {
  city: string
  state: string
  country: string
  visitors: number
}

export interface AdminAnalyticsDashboard {
  period: {
    key: AnalyticsPeriodKey
    days: number
    granularity: AnalyticsGranularity
    from: string
    to: string
    previousFrom: string
    previousTo: string
  }
  summary: {
    uniqueVisitors: MetricResult
    pageviews: MetricResult
    whatsappClicks: MetricResult
    phoneClicks: MetricResult
    quoteSubmissions: MetricResult
  }
  trend: {
    status: SectionStatus
    granularity: AnalyticsGranularity
    data: AnalyticsTrendPoint[]
  }
  topPages: {
    status: SectionStatus
    data: TopPageItem[]
  }
  topServices: {
    status: SectionStatus
    data: TopServiceItem[]
  }
  trafficSources: {
    status: SectionStatus
    data: TrafficSourceItem[]
  }
  locations: {
    status: SectionStatus
    data: LocationItem[]
  }
  meta: {
    cached: boolean
    stale: boolean
    generatedAt: string
  }
}
