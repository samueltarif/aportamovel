import type { AdminAnalyticsDashboard } from '~~/shared/types/adminAnalytics'

interface CacheEntry {
  data: AdminAnalyticsDashboard
  timestamp: number
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos de dados frescos
const STALE_MAX_MS = 15 * 60 * 1000 // Até 15 minutos servindo como dado obsoleto (stale) se a API falhar
const MAX_ENTRIES = 30 // Intervalos personalizados geram chaves variadas: limita o uso de memória

const cacheStore = new Map<string, CacheEntry>()

/**
 * Obtém dados agregados em cache para a chave de período especificada.
 */
export function getCachedAnalytics(key: string): { data: AdminAnalyticsDashboard, isStale: boolean } | null {
  const entry = cacheStore.get(key)
  if (!entry) return null

  const age = Date.now() - entry.timestamp

  if (age < CACHE_TTL_MS) {
    return { data: entry.data, isStale: false }
  }

  if (age < STALE_MAX_MS) {
    return { data: entry.data, isStale: true }
  }

  // Mais antigo que 15 minutos: expirado totalmente
  cacheStore.delete(key)
  return null
}

/**
 * Armazena dados agregados higienizados no cache in-memory.
 */
export function setCachedAnalytics(key: string, data: AdminAnalyticsDashboard): void {
  // Reinsere para manter a ordem de inserção como ordem de uso
  cacheStore.delete(key)
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
  })

  // Remove as entradas mais antigas quando o limite é excedido
  while (cacheStore.size > MAX_ENTRIES) {
    const oldestKey = cacheStore.keys().next().value
    if (oldestKey === undefined) break
    cacheStore.delete(oldestKey)
  }
}
