import { requireAdmin } from '~~/server/utils/requireAdmin'
import { whatsappClickListQuerySchema } from '~~/server/validators/whatsappClickSchemas'
import { listWhatsAppClicks } from '~~/server/services/leads/whatsappClickService'

/** Cliques no WhatsApp com código de atendimento, para a tela /gestao/whatsapp. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = whatsappClickListQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Parâmetros de consulta inválidos.' })
  return await listWhatsAppClicks(parsed.data)
})
