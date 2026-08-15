import { leadNoteCreateSchema } from '~~/server/validators/leadSchemas'
import { addLeadNote } from '~~/server/services/leads/leadAdminService'
import { requireAdmin } from '~~/server/utils/requireAdmin'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  const validId = z.string().uuid().safeParse(id)

  if (!validId.success) {
    throw createError({ statusCode: 400, message: 'ID do lead inválido.' })
  }

  const body = await readBody(event).catch(() => null)
  const parseResult = leadNoteCreateSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: 'Observação inválida ou vazia.' })
  }

  return await addLeadNote(validId.data, parseResult.data.note, admin.userId)
})
