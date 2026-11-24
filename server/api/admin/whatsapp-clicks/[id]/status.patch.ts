import { z } from 'zod'
import { requireAdmin } from '~~/server/utils/requireAdmin'
import { requireSameOrigin } from '~~/server/utils/requireSameOrigin'
import { whatsappClickStatusSchema } from '~~/server/validators/whatsappClickSchemas'
import { setWhatsAppClickStatus } from '~~/server/services/leads/whatsappClickService'

/** Marca um clique como "sem conversa" (ignorado) ou volta para "aguardando". */
export default defineEventHandler(async (event) => {
  requireSameOrigin(event)
  await requireAdmin(event)
  const id = z.string().uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw createError({ statusCode: 400, message: 'Identificador inválido.' })
  const body = whatsappClickStatusSchema.safeParse(await readBody(event).catch(() => null))
  if (!body.success) throw createError({ statusCode: 400, message: 'Status inválido.' })
  await setWhatsAppClickStatus(id.data, body.data.status)
  return { success: true }
})
