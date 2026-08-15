import { leadSearchBodySchema } from '~~/server/validators/leadSchemas'
import { searchAdminLeads } from '~~/server/services/leads/leadAdminService'
import { requireAdmin } from '~~/server/utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event).catch(() => null)
  const parseResult = leadSearchBodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Parâmetros de busca inválidos.',
    })
  }

  return await searchAdminLeads(parseResult.data)
})
