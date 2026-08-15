import { getLeadDetail } from '~~/server/services/leads/leadAdminService'
import { requireAdmin } from '~~/server/utils/requireAdmin'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  const validId = z.string().uuid().safeParse(id)

  if (!validId.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'ID do lead inválido.',
    })
  }

  return await getLeadDetail(validId.data)
})
