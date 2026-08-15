import type {
  AnalyticsPeriod,
  AnalyticsTrendPoint,
  TrafficSourceItem,
} from '~~/shared/types/adminAnalytics'

const KNOWN_SERVICES: Record<string, string> = {
  'manutencao-de-portoes': 'Manutenção de Portões',
  'reforma-de-portoes': 'Reforma de Portões',
  'recuperacao-de-gradis': 'Recuperação de Gradis',
  'tela-mosquiteira': 'Tela Mosquiteira',
  'portoes-automaticos': 'Portões Automáticos',
  'automatizacao-de-portoes': 'Automatização de Portões',
  'serralheria-geral': 'Serralheria Geral',
  'pintura-e-restauracao': 'Pintura e Restauração',
}

export function formatServiceName(slug: string, rawName?: string | null): string {
  if (rawName && rawName !== 'null' && rawName !== 'undefined' && rawName.trim() !== '') {
    return rawName.trim()
  }
  const cleanSlug = (slug || '').trim().toLowerCase()
  if (KNOWN_SERVICES[cleanSlug]) {
    return KNOWN_SERVICES[cleanSlug]
  }
  if (!cleanSlug || cleanSlug === 'null' || cleanSlug === 'undefined') {
    return ''
  }
  return cleanSlug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

export function calcPercentChange(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null
  const change = ((current - previous) / previous) * 100
  return Math.round(change * 10) / 10
}

export function fillMissingTrendDays(results: any[][], days: AnalyticsPeriod): AnalyticsTrendPoint[] {
  const map = new Map<string, AnalyticsTrendPoint>()
  for (const row of results) {
    if (!row || !row[0]) continue
    const dateKey = String(row[0])
    map.set(dateKey, {
      date: dateKey,
      uniqueVisitors: Number(row[1]) || 0,
      pageviews: Number(row[2]) || 0,
      whatsappClicks: Number(row[3]) || 0,
      quoteSubmissions: Number(row[4]) || 0,
    })
  }

  const points: AnalyticsTrendPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    points.push(map.get(dateStr) || {
      date: dateStr,
      uniqueVisitors: 0,
      pageviews: 0,
      whatsappClicks: 0,
      quoteSubmissions: 0,
    })
  }

  return points
}

const INTERNAL_DOMAINS = [
  'aportamovel.com.br',
  'www.aportamovel.com.br',
  'localhost',
  '127.0.0.1',
  'vercel.app',
]

const DIRECT_KEYWORDS = [
  '',
  'null',
  'undefined',
  '$direct',
  '(direct)',
  'direct',
]

export function categorizeTrafficSources(results: any[][]): TrafficSourceItem[] {
  // Mapa de agrupamento para consolidar itens duplicados (ex: múltiplos acessos diretos)
  const aggregatedMap = new Map<string, TrafficSourceItem>()

  for (const row of results) {
    const rawRef = String(row[0] || '').trim().toLowerCase()
    const utmSource = String(row[1] || '').trim()
    const utmCampaign = String(row[3] || '').trim()
    const sessions = Number(row[4]) || 0
    const uniqueVisitors = Number(row[5]) || 0

    let category: TrafficSourceItem['category'] = 'referral'
    let categoryLabel = 'Outros sites'
    let source = rawRef || 'Outro'

    // Regra 7: UTMs válidas têm prioridade sobre o referrer
    const isValidUtm = utmSource && !DIRECT_KEYWORDS.includes(utmSource.toLowerCase())
    if (isValidUtm) {
      category = 'campaign'
      categoryLabel = 'Campanhas/UTM'
      source = utmCampaign ? `${utmSource} (${utmCampaign})` : utmSource
    }
    // Regra 1 e 2: Classificar $direct, vazio ou domínio próprio como Direto/Sem referência
    else if (DIRECT_KEYWORDS.includes(rawRef) || INTERNAL_DOMAINS.some(d => rawRef.includes(d))) {
      category = 'direct'
      categoryLabel = 'Direto/Sem referência'
      source = 'Acesso Direto'
    }
    else if (['google', 'bing', 'yahoo', 'duckduckgo', 'ecosia'].some(s => rawRef.includes(s))) {
      category = 'organic_search'
      categoryLabel = 'Busca orgânica'
      source = rawRef
    }
    else if (['instagram', 'facebook', 'linkedin', 't.co', 'twitter', 'x.com', 'whatsapp', 'tiktok', 'youtube'].some(s => rawRef.includes(s))) {
      category = 'social'
      categoryLabel = 'Redes sociais'
      source = rawRef
    }

    const key = `${category}_${source}`
    if (aggregatedMap.has(key)) {
      const existing = aggregatedMap.get(key)!
      existing.sessions += sessions
      existing.uniqueVisitors += uniqueVisitors
    }
    else {
      aggregatedMap.set(key, { category, categoryLabel, source, sessions, uniqueVisitors })
    }
  }

  // Ordenar pelo volume de sessões
  return Array.from(aggregatedMap.values()).sort((a, b) => b.sessions - a.sessions)
}
