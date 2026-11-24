import { whatsappClickSchema } from '~~/server/validators/whatsappClickSchemas'
import { recordWhatsAppClick } from '~~/server/services/leads/whatsappClickService'

/**
 * Ficha de um clique no WhatsApp (enviada por sendBeacon, sem travar o visitante).
 * Nunca devolve erro ao navegador: dados inválidos ou de robôs são apenas descartados.
 */
export default defineEventHandler(async (event) => {
  setResponseStatus(event, 204)
  const ua = getRequestHeader(event, 'user-agent') || ''
  if (!ua || /bot|crawler|spider|headless|lighthouse/i.test(ua)) return null

  const body = await readBody(event).catch(() => null)
  const parsed = whatsappClickSchema.safeParse(typeof body === 'string' ? safeJson(body) : body)
  if (!parsed.success) return null

  try {
    await recordWhatsAppClick(event, parsed.data)
  }
  catch {
    // o registro é auxiliar: falhas não afetam o visitante
  }
  return null
})

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  }
  catch {
    return null
  }
}
