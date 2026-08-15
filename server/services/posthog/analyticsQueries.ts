import type { AnalyticsPeriod } from '~~/shared/types/adminAnalytics'

/**
 * Cláusula padrão de filtro de segurança e ambiente:
 * - Apenas domínios de produção da A Portamóvel
 * - Exclusão de localhost, previews e rotas administrativas /gestao
 */
const PRODUCTION_FILTER = `
  (
    properties.$host IN ('www.aportamovel.com.br', 'aportamovel.com.br')
    OR (properties.$host IS NULL AND (properties.$current_url LIKE 'https://www.aportamovel.com.br%' OR properties.$current_url LIKE 'https://aportamovel.com.br%'))
  )
  AND (properties.$current_url NOT LIKE '%/gestao%' OR properties.$current_url IS NULL)
  AND (properties.page_path NOT LIKE '%/gestao%' OR properties.page_path IS NULL)
`

export function buildSummaryQuery(days: AnalyticsPeriod): string {
  return `
    SELECT
      uniqIf(distinct_id, event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY) AS current_visitors,
      countIf(event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY) AS current_pageviews,
      countIf(event = 'whatsapp_click' AND timestamp >= now() - INTERVAL ${days} DAY) AS current_whatsapp,
      countIf(event = 'phone_click' AND timestamp >= now() - INTERVAL ${days} DAY) AS current_phone,
      countIf(event = 'quote_form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY) AS current_quotes,

      uniqIf(distinct_id, event = '$pageview' AND timestamp < now() - INTERVAL ${days} DAY AND timestamp >= now() - INTERVAL ${days * 2} DAY) AS prev_visitors,
      countIf(event = '$pageview' AND timestamp < now() - INTERVAL ${days} DAY AND timestamp >= now() - INTERVAL ${days * 2} DAY) AS prev_pageviews,
      countIf(event = 'whatsapp_click' AND timestamp < now() - INTERVAL ${days} DAY AND timestamp >= now() - INTERVAL ${days * 2} DAY) AS prev_whatsapp,
      countIf(event = 'phone_click' AND timestamp < now() - INTERVAL ${days} DAY AND timestamp >= now() - INTERVAL ${days * 2} DAY) AS prev_phone,
      countIf(event = 'quote_form_submitted' AND timestamp < now() - INTERVAL ${days} DAY AND timestamp >= now() - INTERVAL ${days * 2} DAY) AS prev_quotes
    FROM events
    WHERE ${PRODUCTION_FILTER}
      AND timestamp >= now() - INTERVAL ${days * 2} DAY
  `
}

export function buildTrendQuery(days: AnalyticsPeriod): string {
  return `
    SELECT
      formatDateTime(toStartOfDay(timestamp, 'America/Sao_Paulo'), '%Y-%m-%d') AS day,
      uniqIf(distinct_id, event = '$pageview') AS unique_visitors,
      countIf(event = '$pageview') AS pageviews,
      countIf(event = 'whatsapp_click') AS whatsapp_clicks,
      countIf(event = 'quote_form_submitted') AS quote_submissions
    FROM events
    WHERE ${PRODUCTION_FILTER}
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY day
    ORDER BY day ASC
  `
}

export function buildTopPagesQuery(days: AnalyticsPeriod): string {
  return `
    SELECT
      coalesce(properties.page_path, properties.$pathname, '/') AS path,
      count() AS pageviews,
      uniq(distinct_id) AS unique_visitors
    FROM events
    WHERE event = '$pageview'
      AND ${PRODUCTION_FILTER}
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY path
    ORDER BY pageviews DESC
    LIMIT 10
  `
}

export function buildTopServicesQuery(days: AnalyticsPeriod): string {
  return `
    SELECT
      properties.service_slug AS service_slug,
      any(properties.service_name) AS service_name,
      count() AS views
    FROM events
    WHERE event = 'service_view'
      AND ${PRODUCTION_FILTER}
      AND properties.service_slug IS NOT NULL
      AND properties.service_slug != ''
      AND properties.service_slug != 'null'
      AND properties.service_slug != 'undefined'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY service_slug
    ORDER BY views DESC
    LIMIT 10
  `
}

export function buildTrafficSourcesQuery(days: AnalyticsPeriod): string {
  return `
    SELECT
      coalesce(properties.$session_entry_referring_domain, properties.$referring_domain, '') AS referring_domain,
      coalesce(properties.$utm_source, properties.utm_source, properties.$initial_utm_source, '') AS utm_source,
      coalesce(properties.$utm_medium, properties.utm_medium, properties.$initial_utm_medium, '') AS utm_medium,
      coalesce(properties.$utm_campaign, properties.utm_campaign, properties.$initial_utm_campaign, '') AS utm_campaign,
      uniq(properties.$session_id) AS sessions,
      uniq(distinct_id) AS unique_visitors
    FROM events
    WHERE event = '$pageview'
      AND ${PRODUCTION_FILTER}
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY referring_domain, utm_source, utm_medium, utm_campaign
    ORDER BY sessions DESC
    LIMIT 50
  `
}

export function buildLocationsQuery(days: AnalyticsPeriod): string {
  return `
    SELECT
      coalesce(properties.$geoip_city_name, 'Não identificado') AS city,
      coalesce(properties.$geoip_subdivision_1_code, '') AS state,
      coalesce(properties.$geoip_country_code, 'Não identificado') AS country,
      uniq(distinct_id) AS visitors
    FROM events
    WHERE event = '$pageview'
      AND ${PRODUCTION_FILTER}
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY city, state, country
    ORDER BY visitors DESC
    LIMIT 10
  `
}
