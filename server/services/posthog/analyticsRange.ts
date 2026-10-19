import type {
  AnalyticsGranularity,
  AnalyticsPeriodKey,
  AnalyticsPeriodSelection,
} from '~~/shared/types/adminAnalytics'

/**
 * Fuso de referência do painel. O Brasil não tem horário de verão desde 2019,
 * então America/Sao_Paulo é sempre UTC-03:00.
 */
export const ANALYTICS_TIMEZONE = 'America/Sao_Paulo'
const SP_UTC_OFFSET = '-03:00'

/** Limite máximo de um intervalo personalizado (em dias). */
export const MAX_CUSTOM_RANGE_DAYS = 366

export interface ResolvedAnalyticsRange {
  key: AnalyticsPeriodKey
  days: number
  granularity: AnalyticsGranularity
  /** Datas do calendário (YYYY-MM-DD, inclusivas) no fuso de São Paulo */
  from: string
  to: string
  previousFrom: string
  previousTo: string
  /** Limites em UTC ('YYYY-MM-DD HH:MM:SS') para as consultas HogQL: [start, end) */
  startUtc: string
  endUtc: string
  prevStartUtc: string
  /** Chave estável para o cache */
  cacheKey: string
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Data de hoje (YYYY-MM-DD) no fuso de São Paulo. */
export function todayInSaoPaulo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ANALYTICS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Hora atual (0-23) no fuso de São Paulo. */
export function currentHourInSaoPaulo(now: Date = new Date()): number {
  const h = new Intl.DateTimeFormat('en-GB', {
    timeZone: ANALYTICS_TIMEZONE,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(now)
  return Number(h) || 0
}

/** Valida se a string é uma data real no formato YYYY-MM-DD. */
export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

export function addDays(date: string, amount: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + amount)
  return d.toISOString().slice(0, 10)
}

/** Quantidade de dias do intervalo inclusivo [from, to]. */
export function daysBetweenInclusive(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`)
  const b = Date.parse(`${to}T00:00:00Z`)
  return Math.round((b - a) / 86400000) + 1
}

/** Converte o início de um dia de São Paulo em timestamp UTC para o HogQL. */
function startOfSaoPauloDayInUtc(date: string): string {
  return new Date(`${date}T00:00:00${SP_UTC_OFFSET}`).toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * Converte a seleção do painel (atalho ou intervalo personalizado) em um intervalo
 * de calendário fechado no fuso de São Paulo, mais o período anterior de mesmo tamanho
 * usado nas comparações percentuais.
 *
 * - 'today': somente hoje (comparado com ontem), série por hora
 * - '7' | '30' | '90': hoje + os N-1 dias anteriores
 * - 'custom': from/to informados (já validados pelo schema)
 */
export function resolveAnalyticsRange(selection: AnalyticsPeriodSelection, now: Date = new Date()): ResolvedAnalyticsRange {
  const today = todayInSaoPaulo(now)
  let from: string
  let to: string

  switch (selection.key) {
    case 'today':
      from = today
      to = today
      break
    case 'custom':
      from = selection.from as string
      to = selection.to as string
      break
    default: {
      const n = Number(selection.key)
      to = today
      from = addDays(today, -(n - 1))
    }
  }

  const days = daysBetweenInclusive(from, to)
  const previousTo = addDays(from, -1)
  const previousFrom = addDays(from, -days)

  return {
    key: selection.key,
    days,
    granularity: days === 1 ? 'hour' : 'day',
    from,
    to,
    previousFrom,
    previousTo,
    startUtc: startOfSaoPauloDayInUtc(from),
    endUtc: startOfSaoPauloDayInUtc(addDays(to, 1)),
    prevStartUtc: startOfSaoPauloDayInUtc(previousFrom),
    // 'today' e os atalhos mudam a cada dia: a data entra na chave do cache
    cacheKey: `${selection.key}:${from}:${to}`,
  }
}
