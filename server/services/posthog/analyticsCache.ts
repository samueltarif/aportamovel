import type { AdminAnalyticsDashboard, AnalyticsPeriod } from '~~/shared/types/adminAnalytics'

interface CacheEntry {
  data: AdminAnalyticsDashboard
  timestamp: number
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos de dados frescos
const STALE_MAX_MS = 15 * 60 * 1000 // Até 15 minutos servindo como dado obsoleto (stale) se a API falhar

const cacheStore = new Map<AnalyticsPeriod, CacheEntry>()

/**
 * Obtém dados agregados em cache para o período especificado.
 */
export function getCachedAnalytics(period: AnalyticsPeriod): { data: AdminAnalyticsDashboard, isStale: boolean } | null {
  const entry = cacheStore.get(period)
  if (!entry) return null

  const age = Date.now() - entry.timestamp

  if (age < CACHE_TTL_MS) {
    return { data: entry.data, isStale: false }
  }

  if (age < STALE_MAX_MS) {
    return { data: entry.data, isStale: true }
  }

  // Mais antigo que 15 minutos: expirado totalmente
  cacheStore.delete(period)
  return null
}

/**
 * Armazena dados agregados higienizados no cache in-memory.
 */
export function setCachedAnalytics(period: AnalyticsPeriod, data: AdminAnalyticsDashboard): void {
  // Limitar estritamente aos 3 períodos válidos
  if (![7, 30, 90].includes(period)) return

  cacheStore.set(period, {
    data,
    timestamp: Date.now(),
  })
}
