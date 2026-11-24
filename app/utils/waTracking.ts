/**
 * Código de atendimento nos cliques de WhatsApp (ex.: "PM-7K4QX").
 *
 * Cada clique nos números da empresa ganha um código curto que vai no fim da mensagem pronta.
 * Ao mesmo tempo, o navegador avisa o servidor (sem travar a abertura do WhatsApp) com a
 * origem do clique: página, botão, anúncio (gclid/UTM), dispositivo. Quando a mensagem chega,
 * a equipe digita o código no painel (/gestao/whatsapp) e completa nome e telefone.
 */
import { getAdContext } from '~/utils/adClickId'

/** Números de WhatsApp da empresa (comercial e plantão). Links para outros números não são marcados. */
export const COMPANY_WHATSAPP_NUMBERS: Record<string, 'commercial' | 'emergency'> = {
  '5511912984416': 'commercial',
  '5511940277438': 'emergency',
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // sem 0/O, 1/I/L para não confundir ao digitar
const CODE_IN_TEXT = /\s*\(cód\. PM-[A-Z0-9]{5}\)\s*$/
const FIRST_VISIT_KEY = 'pm_first_visit'
const FIRST_VISIT_TTL_MS = 90 * 24 * 60 * 60 * 1000

export interface WaTagOptions {
  /** Onde fica o botão (ex.: "floating_button", "quote_modal"). */
  cta: string
  service_slug?: string
  /** Código já gerado (quando o mesmo código também vai no lead do formulário). */
  code?: string
}

export function newWaCode(): string {
  const bytes = new Uint8Array(5)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes)
  else for (let i = 0; i < 5; i++) bytes[i] = Math.floor(Math.random() * 256)
  return `PM-${Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('')}`
}

/** Devolve o número da empresa se a URL for um link de WhatsApp para ele; senão, null. */
export function companyWhatsAppNumber(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl, 'https://x.invalid')
    let number = ''
    if (url.hostname === 'wa.me') number = url.pathname.replace(/\D/g, '')
    else if (/(^|\.)whatsapp\.com$/.test(url.hostname)) number = (url.searchParams.get('phone') || '').replace(/\D/g, '')
    return number && COMPANY_WHATSAPP_NUMBERS[number] ? number : null
  }
  catch {
    return null
  }
}

function deviceType(): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown'
  const w = window.innerWidth
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  if (w < 768) return 'mobile'
  if (coarse && w < 1280) return 'tablet'
  return 'desktop'
}

/** Guarda de onde veio a primeira visita (site de origem e página de entrada) por 90 dias. */
export function captureFirstVisit(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(FIRST_VISIT_KEY)
    if (raw && Date.now() - (JSON.parse(raw).ts || 0) < FIRST_VISIT_TTL_MS) return
    let referrerHost = ''
    try {
      const ref = document.referrer ? new URL(document.referrer).hostname : ''
      referrerHost = ref && ref !== window.location.hostname ? ref.replace(/^www\./, '') : ''
    }
    catch { /* referrer inválido */ }
    window.localStorage.setItem(FIRST_VISIT_KEY, JSON.stringify({
      referrer_host: referrerHost.slice(0, 120),
      landing_path: window.location.pathname.slice(0, 200),
      ts: Date.now(),
    }))
  }
  catch { /* armazenamento indisponível */ }
}

function firstVisit(): { referrer_host?: string, landing_path?: string } {
  try {
    const raw = window.localStorage.getItem(FIRST_VISIT_KEY)
    return raw ? JSON.parse(raw) : {}
  }
  catch {
    return {}
  }
}

function report(code: string, number: string, opts: WaTagOptions): void {
  const ad = getAdContext()
  const visit = firstVisit()
  const params = new URLSearchParams(window.location.search)
  const pick = (k: string, fallback?: string) => (params.get(k) || fallback || '').slice(0, 200) || undefined
  const payload = {
    code,
    wa_number: number,
    cta_location: opts.cta.slice(0, 60),
    page_path: window.location.pathname.slice(0, 200),
    service_slug: opts.service_slug?.slice(0, 120) || undefined,
    utm_source: pick('utm_source', ad?.utm_source),
    utm_medium: pick('utm_medium', ad?.utm_medium),
    utm_campaign: pick('utm_campaign', ad?.utm_campaign),
    utm_term: pick('utm_term', ad?.kw),
    utm_content: pick('utm_content', ad?.grupo),
    gclid: pick('gclid', ad?.gclid),
    gbraid: pick('gbraid', ad?.gbraid),
    wbraid: pick('wbraid', ad?.wbraid),
    referrer_host: visit.referrer_host || undefined,
    landing_path: visit.landing_path || undefined,
    device: deviceType(),
  }
  const body = JSON.stringify(payload)
  try {
    const sent = navigator.sendBeacon?.('/api/public/whatsapp-click', new Blob([body], { type: 'application/json' }))
    if (sent) return
  }
  catch { /* segue para o fetch */ }
  fetch('/api/public/whatsapp-click', {
    method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

/**
 * Coloca o código de atendimento na mensagem de um link de WhatsApp da empresa e registra o clique.
 * Links para outros números (ex.: no painel, para responder um cliente) voltam sem alteração.
 */
export function tagWhatsAppUrl(rawUrl: string, opts: WaTagOptions): string {
  if (typeof window === 'undefined' || window.location.pathname.startsWith('/gestao')) return rawUrl
  const number = companyWhatsAppNumber(rawUrl)
  if (!number) return rawUrl
  try {
    const url = new URL(rawUrl)
    const code = opts.code || newWaCode()
    const text = (url.searchParams.get('text') || '').replace(CODE_IN_TEXT, '')
    const tagged = `${text ? `${text}\n\n` : ''}(cód. ${code})`
    const others = [...url.searchParams.entries()].filter(([k]) => k !== 'text')
    const query = [...others, ['text', tagged]].map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join('&')
    report(code, number, opts)
    return `${url.origin}${url.pathname}?${query}`
  }
  catch {
    return rawUrl
  }
}
