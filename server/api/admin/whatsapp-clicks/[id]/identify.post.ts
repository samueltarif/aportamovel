import { z } from 'zod'
import { requireAdmin } from '~~/server/utils/requireAdmin'
import { requireSameOrigin } from '~~/server/utils/requireSameOrigin'
import { whatsappClickIdentifySchema } from '~~/server/validators/whatsappClickSchemas'
import { identifyWhatsAppClick } from '~~/server/services/leads/whatsappClickService'

/** Identifica o contato de um código (nome, telefone) e cria o lead com a origem do clique. */
export default defineEventHandler(async (event) => {
  requireSameOrigin(event)
  const admin = await requireAdmin(event)
  const id = z.string().uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw createError({ statusCode: 400, message: 'Identificador inválido.' })
  const body = whatsappClickIdentifySchema.safeParse(await readBody(event).catch(() => null))
  if (!body.success) {
    throw createError({ statusCode: 400, message: body.error.issues[0]?.message || 'Dados inválidos.' })
  }
  return await identifyWhatsAppClick(id.data, body.data, admin.userId)
})
