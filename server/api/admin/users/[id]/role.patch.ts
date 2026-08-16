import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { requireAdminRole } from '../../../../utils/requireAdmin'
import { requireSameOrigin } from '../../../../utils/requireSameOrigin'
import { updateRoleSchema, userIdParamSchema } from '../../../../validators/adminUserSchemas'
import { updateAdminRole } from '../../../../services/users/adminUserService'

export default defineEventHandler(async (event) => {
  requireSameOrigin(event)
  const admin = await requireAdminRole(event, ['admin'])

  const rawId = getRouterParam(event, 'id')
  const paramParsed = userIdParamSchema.safeParse({ id: rawId })
  if (!paramParsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'ID de usuário inválido.',
    })
  }

  const body = await readBody(event)
  const bodyParsed = updateRoleSchema.safeParse(body)
  if (!bodyParsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Função inválida.',
      data: bodyParsed.error.format(),
    })
  }

  return await updateAdminRole(admin.userId, paramParsed.data.id, bodyParsed.data.role)
})
