import { defineEventHandler, getHeader, getRouterParam } from 'h3'
import { requireAdminRole } from '../../../../utils/requireAdmin'
import { requireSameOrigin } from '../../../../utils/requireSameOrigin'
import { idempotencyKeyHeaderSchema, userIdParamSchema } from '../../../../validators/adminUserSchemas'
import { resendAdminInvite } from '../../../../services/users/adminUserService'

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

  const rawKey = getHeader(event, 'idempotency-key')
  const keyParsed = idempotencyKeyHeaderSchema.safeParse(rawKey)
  if (!keyParsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Header Idempotency-Key obrigatório (deve ser um UUID v4 válido).',
    })
  }

  return await resendAdminInvite(admin.userId, paramParsed.data.id, keyParsed.data)
})
