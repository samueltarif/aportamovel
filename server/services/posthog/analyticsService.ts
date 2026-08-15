import type { H3Event } from 'h3'
import type {
  AdminAnalyticsDashboard,
  AnalyticsPeriod,
  MetricResult,
} from '~~/shared/types/adminAnalytics'
import { executeHogQLQuery } from './posthogClient'
import { getCachedAnalytics, setCachedAnalytics } from './analyticsCache'
import {
  buildSummaryQuery,
  buildTrendQuery,
  buildTopPagesQuery,
  buildTopServicesQuery,
  buildTrafficSourcesQuery,
  buildLocationsQuery,
} from './analyticsQueries'
import {
  calcPercentChange,
  fillMissingTrendDays,
  categorizeTrafficSources,
  formatServiceName,
} from './analyticsHelpers'

export async function getDashboardAnalytics(days: AnalyticsPeriod, event?: H3Event): Promise<AdminAnalyticsDashboard> {
  const cached = getCachedAnalytics(days)
  if (cached && !cached.isStale) {
    return { ...cached.data, meta: { cached: true, stale: false, generatedAt: cached.data.meta.generatedAt } }
  }

  try {
    const [
      summaryRes,
      trendRes,
      pagesRes,
      servicesRes,
      trafficRes,
      locationsRes,
    ] = await Promise.allSettled([
      executeHogQLQuery(buildSummaryQuery(days), 'admin_summary', event),
      executeHogQLQuery(buildTrendQuery(days), 'admin_trend', event),
      executeHogQLQuery(buildTopPagesQuery(days), 'admin_top_pages', event),
      executeHogQLQuery(buildTopServicesQuery(days), 'admin_top_services', event),
      executeHogQLQuery(buildTrafficSourcesQuery(days), 'admin_traffic_sources', event),
      executeHogQLQuery(buildLocationsQuery(days), 'admin_locations', event),
    ])

    if (summaryRes.status === 'rejected') {
      if (cached && cached.isStale) {
        return { ...cached.data, meta: { cached: true, stale: true, generatedAt: cached.data.meta.generatedAt } }
      }
      throw summaryRes.reason
    }

    const sRow = summaryRes.value.results[0] || []
    const curVis = Number(sRow[0]) || 0
    const curPv = Number(sRow[1]) || 0
    const curWa = Number(sRow[2]) || 0
    const curPhone = Number(sRow[3]) || 0
    const curQuotes = Number(sRow[4]) || 0

    const prevVis = Number(sRow[5]) || null
    const prevPv = Number(sRow[6]) || null
    const prevWa = Number(sRow[7]) || null
    const prevPhone = Number(sRow[8]) || null
    const prevQuotes = Number(sRow[9]) || null

    const makeMetric = (curr: number, prev: number | null): MetricResult => ({
      current: curr,
      previous: prev,
      changePercent: calcPercentChange(curr, prev),
      status: 'ready',
    })

    const now = new Date()
    const fromDate = new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10)
    const toDate = now.toISOString().slice(0, 10)
    const prevFromDate = new Date(now.getTime() - days * 2 * 86400000).toISOString().slice(0, 10)

    const dashboard: AdminAnalyticsDashboard = {
      period: {
        days,
        from: fromDate,
        to: toDate,
        previousFrom: prevFromDate,
        previousTo: fromDate,
      },
      summary: {
        uniqueVisitors: makeMetric(curVis, prevVis),
        pageviews: makeMetric(curPv, prevPv),
        whatsappClicks: makeMetric(curWa, prevWa),
        phoneClicks: makeMetric(curPhone, prevPhone),
        quoteSubmissions: makeMetric(curQuotes, prevQuotes),
      },
      trend: {
        status: trendRes.status === 'fulfilled' ? 'ready' : 'unavailable',
        data: trendRes.status === 'fulfilled' ? fillMissingTrendDays(trendRes.value.results, days) : [],
      },
      topPages: {
        status: pagesRes.status === 'fulfilled' ? 'ready' : 'unavailable',
        data: pagesRes.status === 'fulfilled'
          ? pagesRes.value.results.map((r: any[]) => ({ path: String(r[0]), pageviews: Number(r[1]) || 0, uniqueVisitors: Number(r[2]) || 0 }))
          : [],
      },
      topServices: {
        status: servicesRes.status === 'fulfilled' ? 'ready' : 'unavailable',
        data: servicesRes.status === 'fulfilled'
          ? servicesRes.value.results
              .map((r: any[]) => {
                const slug = String(r[0] || '').trim()
                const rawName = r[1] ? String(r[1]).trim() : null
                const formattedName = formatServiceName(slug, rawName)
                const views = Number(r[2]) || 0
                return { serviceSlug: slug, serviceName: formattedName, views }
              })
              .filter(item => item.serviceSlug && item.serviceSlug !== 'null' && item.serviceSlug !== 'undefined' && item.serviceName)
          : [],
      },
      trafficSources: {
        status: trafficRes.status === 'fulfilled' ? 'ready' : 'unavailable',
        data: trafficRes.status === 'fulfilled' ? categorizeTrafficSources(trafficRes.value.results) : [],
      },
      locations: {
        status: locationsRes.status === 'fulfilled' ? 'ready' : 'unavailable',
        data: locationsRes.status === 'fulfilled'
          ? locationsRes.value.results.map((r: any[]) => ({ city: String(r[0] || 'Não identificado'), state: String(r[1] || ''), country: String(r[2] || 'Não identificado'), visitors: Number(r[3]) || 0 }))
          : [],
      },
      meta: {
        cached: false,
        stale: false,
        generatedAt: new Date().toISOString(),
      },
    }

    setCachedAnalytics(days, dashboard)
    return dashboard
  }
  catch (err: any) {
    if (cached && cached.isStale) {
      return { ...cached.data, meta: { cached: true, stale: true, generatedAt: cached.data.meta.generatedAt } }
    }
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'Os dados analíticos estão temporariamente indisponíveis.',
    })
  }
}
