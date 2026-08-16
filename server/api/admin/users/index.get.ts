import { defineEventHandler, getQuery } from 'h3'
import { requireAdminRole } from '../../../utils/requireAdmin'
import { searchAdminUsersSchema } from '../../../validators/adminUserSchemas'
import { listAdminUsers } from '../../../services/users/adminUserService'

export default defineEventHandler(async (event) => {
  await requireAdminRole(event, ['admin'])

  const query = getQuery(event)
  const parsed = searchAdminUsersSchema.safeParse(query)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Parâmetros de consulta inválidos.',
      data: parsed.error.format(),
    })
  }

  return await listAdminUsers(parsed.data)
})
