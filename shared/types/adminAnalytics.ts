export type AnalyticsPeriod = 7 | 30 | 90

export type SectionStatus = 'ready' | 'loading' | 'unavailable' | 'error'

export interface MetricResult {
  current: number
  previous: number | null
  changePercent: number | null
  status: SectionStatus
}

export interface AnalyticsTrendPoint {
  date: string // YYYY-MM-DD
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
    days: AnalyticsPeriod
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
