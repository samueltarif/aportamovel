/**
 * Guarda, por 90 dias, de onde o visitante veio: identificador do clique no anúncio
 * (gclid/gbraid/wbraid), palavra-chave e grupo (utm_term/utm_content) e as UTMs.
 * Assim cada lead pode ser ligado ao clique e, depois, importado no Google Ads
 * como conversão offline (lead qualificado / serviço fechado).
 */
import { buildTrackingLines } from '~~/shared/utils/leadTracking'

const KEY = 'pm_ad_click'
const TTL_MS = 90 * 24 * 60 * 60 * 1000

export interface AdContext {
  gclid?: string
  gbraid?: string
  wbraid?: string
  kw?: string
  grupo?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  ts: number
}

function clean(v: string | null, max = 200): string | undefined {
  if (!v) return undefined
  const t = v.trim().slice(0, max)
  return t || undefined
}

export function captureAdClickId(): void {
  if (typeof window === 'undefined') return
  try {
    const p = new URLSearchParams(window.location.search)
    const id = (k: string) => {
      const v = p.get(k)
      return v && /^[\w-]{10,200}$/.test(v) ? v : undefined
    }
    const ctx: AdContext = {
      gclid: id('gclid'),
      gbraid: id('gbraid'),
      wbraid: id('wbraid'),
      kw: clean(p.get('utm_term')),
      grupo: clean(p.get('utm_content')),
      utm_source: clean(p.get('utm_source')),
      utm_medium: clean(p.get('utm_medium')),
      utm_campaign: clean(p.get('utm_campaign')),
      ts: Date.now(),
    }
    // Só sobrescreve quando a visita atual traz origem nova (anúncio ou UTM)
    if (ctx.gclid || ctx.gbraid || ctx.wbraid || ctx.utm_source) {
      window.localStorage.setItem(KEY, JSON.stringify(ctx))
    }
  }
  catch {
    // armazenamento indisponível (modo privado etc.): segue sem o contexto
  }
}

export function getAdContext(): AdContext | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const ctx = JSON.parse(raw) as AdContext
    if (!ctx?.ts || Date.now() - ctx.ts > TTL_MS) return null
    return ctx
  }
  catch {
    return null
  }
}

/** Linhas "chave=valor" para anexar à mensagem do lead. */
export function getAdClickLines(): string[] {
  const ctx = getAdContext()
  if (!ctx) return []
  return buildTrackingLines({ gclid: ctx.gclid, gbraid: ctx.gbraid, wbraid: ctx.wbraid, kw: ctx.kw, grupo: ctx.grupo })
}

/** Compatibilidade: primeira linha de identificador de clique, se houver. */
export function getAdClickId(): string | null {
  const lines = getAdClickLines().filter(l => /^(gclid|gbraid|wbraid)=/.test(l))
  return lines.length ? lines.join('\n') : null
}
