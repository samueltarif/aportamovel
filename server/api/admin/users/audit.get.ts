import { defineEventHandler, getQuery } from 'h3'
import { requireAdminRole } from '../../../utils/requireAdmin'
import { listAuditSchema } from '../../../validators/adminUserSchemas'
import { getAdminAuditLog } from '../../../services/users/adminUserService'

export default defineEventHandler(async (event) => {
  await requireAdminRole(event, ['admin'])

  const query = getQuery(event)
  const parsed = listAuditSchema.safeParse(query)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Parâmetros de auditoria inválidos.',
      data: parsed.error.format(),
    })
  }

  const { page, limit, userId } = parsed.data
  return await getAdminAuditLog(page, limit, userId)
})
