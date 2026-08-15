import { leadListQuerySchema } from '~~/server/validators/leadSchemas'
import { listAdminLeads } from '~~/server/services/leads/leadAdminService'
import { requireAdmin } from '~~/server/utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const parseResult = leadListQuerySchema.safeParse(query)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Parâmetros de consulta inválidos.',
    })
  }

  return await listAdminLeads(parseResult.data)
})
