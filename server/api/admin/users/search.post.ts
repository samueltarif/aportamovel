import { defineEventHandler, readBody } from 'h3'
import { requireAdminRole } from '../../../utils/requireAdmin'
import { requireSameOrigin } from '../../../utils/requireSameOrigin'
import { searchAdminUsersSchema } from '../../../validators/adminUserSchemas'
import { listAdminUsers } from '../../../services/users/adminUserService'

export default defineEventHandler(async (event) => {
  requireSameOrigin(event)
  await requireAdminRole(event, ['admin'])

  const body = await readBody(event)
  const parsed = searchAdminUsersSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Parâmetros de busca inválidos.',
      data: parsed.error.format(),
    })
  }

  return await listAdminUsers(parsed.data)
})
