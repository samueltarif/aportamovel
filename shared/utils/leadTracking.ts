/**
 * Metadados de rastreio gravados no campo `message` do lead, uma linha "chave=valor" por item.
 * Ex.: "canal=whatsapp_popup\nturno=plantao\ngclid=Cj0K...\nkw=conserto de portão eletrônico"
 * Usado pela landing page (gravação) e pelo painel da campanha (leitura).
 */
export type LeadChannel = 'whatsapp_popup' | 'formulario'

export interface LeadTracking {
  canal?: LeadChannel
  turno?: 'day' | 'plantao'
  gclid?: string
  gbraid?: string
  wbraid?: string
  kw?: string
  grupo?: string
  [key: string]: string | undefined
}

const KNOWN = ['canal', 'turno', 'gclid', 'gbraid', 'wbraid', 'kw', 'grupo']

export function buildTrackingLines(data: LeadTracking): string[] {
  return Object.entries(data)
    .filter(([, v]) => typeof v === 'string' && v.trim() !== '')
    .map(([k, v]) => `${k}=${String(v).replace(/[\r\n]+/g, ' ').trim().slice(0, 200)}`)
}

export function parseLeadTracking(message: string | null | undefined): { tracking: LeadTracking, text: string } {
  const tracking: LeadTracking = {}
  const textLines: string[] = []
  for (const line of (message || '').split(/\r?\n/)) {
    const m = line.match(/^([a-z_]+)=(.*)$/)
    if (m && KNOWN.includes(m[1]!)) {
      tracking[m[1]!] = m[2]!.trim()
    }
    else if (line.trim()) {
      textLines.push(line)
    }
  }
  return { tracking, text: textLines.join('\n') }
}

/** Normaliza telefone BR digitado ("(11) 9 1234-5678") para só dígitos com DDD. */
export function normalizeBrPhone(raw: string): string {
  let d = (raw || '').replace(/\D/g, '')
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2)
  if (d.startsWith('0')) d = d.slice(1)
  return d
}

export function isValidBrPhone(raw: string): boolean {
  const d = normalizeBrPhone(raw)
  return /^[1-9]{2}9?\d{8}$/.test(d)
}

export function formatBrPhone(raw: string): string {
  const d = normalizeBrPhone(raw)
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return raw
}
